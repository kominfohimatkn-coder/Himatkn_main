from __future__ import annotations

from pathlib import Path
from uuid import uuid4

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, select, text

from app.core.config import settings
from app.core.security import hash_password
from app.database.connection import SessionLocal
from app.models import (
    Admin,
    AdminPermission,
    Permission,
)
from app.seed import PERMS
from app.services.auth import (
    is_superadmin,
    permissions_for_admin,
)
from app.services.permissions import (
    ALWAYS_GRANTED,
    PermissionValidationError,
    normalize_permissions,
)

BACKEND_DIR = Path(__file__).resolve().parents[1]


def test_normalize_permissions_applies_implications():
    news = normalize_permissions(["news.create"])

    assert {"news.create", "news.view", "dashboard.view"} <= news

    organization = normalize_permissions(["organization.manage"])

    assert {
        "organization.manage",
        "organization.view",
        "media.manage",
        "dashboard.view",
    } <= organization

    settings_permissions = normalize_permissions(["settings.manage"])

    assert {
        "settings.manage",
        "settings.view",
        "media.manage",
    } <= settings_permissions

    assert normalize_permissions([]) == set(ALWAYS_GRANTED)


def test_normalize_permissions_rejects_unknown_name():
    with pytest.raises(PermissionValidationError, match="tidak dikenal"):
        normalize_permissions(["news.publish"])


def test_normalize_permissions_rejects_superadmin_only():
    with pytest.raises(PermissionValidationError, match="superadmin"):
        normalize_permissions(["admins.manage"])

    with pytest.raises(PermissionValidationError, match="superadmin"):
        normalize_permissions(["roles.manage"])


def test_permissions_for_superadmin_includes_everything():
    with SessionLocal() as db:
        admin = db.scalar(select(Admin).where(Admin.username == "admin"))
        assert admin is not None

        assert permissions_for_admin(db, admin.id) == {
            name for name, _ in PERMS
        }
        assert is_superadmin(db, admin.id) is True


def test_permissions_for_admin_with_direct_permissions():
    username = f"b4a-direct-{uuid4().hex[:8]}"

    with SessionLocal() as db:
        admin = Admin(
            username=username,
            password_hash=hash_password("b4a-direct-password"),
            is_active=True,
        )
        db.add(admin)
        db.flush()

        news_create = db.scalar(
            select(Permission).where(Permission.name == "news.create")
        )
        db.add(
            AdminPermission(
                admin_id=admin.id,
                permission_id=news_create.id,
            )
        )
        db.commit()

        assert permissions_for_admin(db, admin.id) == {
            "news.create",
            "news.view",
            "dashboard.view",
        }
        assert is_superadmin(db, admin.id) is False


def _insert_role(connection, name: str) -> int:
    connection.execute(
        text(
            "INSERT INTO roles (name, description) "
            "VALUES (:name, :description)"
        ),
        {"name": name, "description": f"legacy {name}"},
    )

    return connection.execute(
        text("SELECT id FROM roles WHERE name = :name"),
        {"name": name},
    ).scalar_one()


def _insert_permission(connection, name: str) -> int:
    connection.execute(
        text(
            "INSERT INTO permissions (name, description) "
            "VALUES (:name, :description)"
        ),
        {"name": name, "description": name},
    )

    return connection.execute(
        text("SELECT id FROM permissions WHERE name = :name"),
        {"name": name},
    ).scalar_one()


def test_migration_moves_legacy_role_permissions_to_direct(
    tmp_path,
    monkeypatch,
):
    database_path = tmp_path / "b4a-migration.sqlite3"
    database_url = f"sqlite:///{database_path.as_posix()}"

    monkeypatch.setattr(settings, "database_url", database_url)

    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.set_main_option(
        "script_location",
        str(BACKEND_DIR / "alembic"),
    )

    command.upgrade(config, "3af2a5dfdd21")

    engine = create_engine(database_url)

    try:
        with engine.begin() as connection:
            _insert_role(connection, "superadmin")
            editor_role_id = _insert_role(connection, "editor")
            admin_role_id = _insert_role(connection, "admin")

            permission_names = [
                "dashboard.view",
                "news.view",
                "news.create",
                "organization.manage",
                "media.manage",
                "admins.view",
            ]
            permission_ids = {
                name: _insert_permission(connection, name)
                for name in permission_names
            }

            connection.execute(
                text(
                    "INSERT INTO admins "
                    "(username, password_hash, is_active) "
                    "VALUES (:username, :password_hash, 1)"
                ),
                {
                    "username": "legacy-editor",
                    "password_hash": hash_password("legacy-password"),
                },
            )
            admin_id = connection.execute(
                text(
                    "SELECT id FROM admins WHERE username = 'legacy-editor'"
                )
            ).scalar_one()

            connection.execute(
                text(
                    "INSERT INTO admin_roles (admin_id, role_id) "
                    "VALUES (:admin_id, :role_id)"
                ),
                {"admin_id": admin_id, "role_id": editor_role_id},
            )

            for permission_name in [
                "news.view",
                "news.create",
                "organization.manage",
                "media.manage",
                "admins.view",
            ]:
                connection.execute(
                    text(
                        "INSERT INTO role_permissions "
                        "(role_id, permission_id) "
                        "VALUES (:role_id, :permission_id)"
                    ),
                    {
                        "role_id": editor_role_id,
                        "permission_id": permission_ids[permission_name],
                    },
                )

            connection.execute(
                text(
                    "INSERT INTO role_permissions "
                    "(role_id, permission_id) "
                    "VALUES (:role_id, :permission_id)"
                ),
                {
                    "role_id": admin_role_id,
                    "permission_id": permission_ids["dashboard.view"],
                },
            )

        command.upgrade(config, "head")

        with engine.connect() as connection:
            direct_permissions = set(
                connection.execute(
                    text(
                        "SELECT permissions.name "
                        "FROM admin_permissions "
                        "JOIN permissions ON "
                        "permissions.id = admin_permissions.permission_id "
                        "WHERE admin_permissions.admin_id = :admin_id"
                    ),
                    {"admin_id": admin_id},
                ).scalars()
            )

            assert direct_permissions == {
                "news.view",
                "news.create",
                "organization.manage",
                "media.manage",
            }
            assert "admins.view" not in direct_permissions

            remaining_roles = set(
                connection.execute(
                    text(
                        "SELECT role_id FROM admin_roles "
                        "WHERE admin_id = :admin_id"
                    ),
                    {"admin_id": admin_id},
                ).scalars()
            )
            assert remaining_roles == set()

            role_names = set(
                connection.execute(text("SELECT name FROM roles")).scalars()
            )
            assert role_names == {"superadmin"}

            legacy_role_rows = connection.execute(
                text(
                    "SELECT COUNT(*) FROM roles "
                    "WHERE name IN ('admin', 'editor')"
                )
            ).scalar_one()
            assert legacy_role_rows == 0

    finally:
        engine.dispose()
