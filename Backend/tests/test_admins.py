from __future__ import annotations

from contextlib import contextmanager
from types import SimpleNamespace
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import sessionmaker

from app.database.connection import engine
from app.database.dependencies import current_admin, require_csrf
from app.core.security import hash_password
from app.main import app
from app.models import (
    Admin,
    AdminPermission,
    AdminRole,
    Permission,
    Role,
    RolePermission,
)
from app.routers.admins import _active_admins_with_permission


TestSession = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)


def login(client, username: str, password: str) -> str:
    response = client.get("/api/v1/auth/csrf")
    assert response.status_code == 200

    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": username,
            "password": password,
        },
    )
    assert response.status_code == 200

    csrf = client.cookies.get("himatkn_csrf")
    assert csrf

    return csrf


def create_role(
    name: str,
    permissions: list[str],
) -> int:
    db = TestSession()

    try:
        role = db.scalar(
            select(Role).where(Role.name == name)
        )

        if role is None:
            role = Role(
                name=name,
                description=f"Test role: {name}",
            )
            db.add(role)
            db.flush()

        for permission_name in permissions:
            permission = db.scalar(
                select(Permission).where(
                    Permission.name == permission_name
                )
            )

            if permission is None:
                permission = Permission(
                    name=permission_name,
                    description=permission_name,
                )
                db.add(permission)
                db.flush()

            existing = db.scalar(
                select(RolePermission).where(
                    RolePermission.role_id == role.id,
                    RolePermission.permission_id == permission.id,
                )
            )

            if existing is None:
                db.add(
                    RolePermission(
                        role_id=role.id,
                        permission_id=permission.id,
                    )
                )

        db.commit()
        db.refresh(role)

        return role.id

    finally:
        db.close()


def create_test_admin(
    username: str,
    password: str,
    role_id: int,
) -> int:
    db = TestSession()

    try:
        admin = Admin(
            username=username,
            password_hash=hash_password(password),
            is_active=True,
        )
        db.add(admin)
        db.flush()

        db.add(
            AdminRole(
                admin_id=admin.id,
                role_id=role_id,
            )
        )

        db.commit()
        db.refresh(admin)

        return admin.id

    finally:
        db.close()


def create_admin_with_permissions(
    username: str,
    password: str,
    permissions: list[str],
) -> int:
    db = TestSession()

    try:
        admin = Admin(
            username=username,
            password_hash=hash_password(password),
            is_active=True,
        )
        db.add(admin)
        db.flush()

        for permission_name in permissions:
            permission = db.scalar(
                select(Permission).where(
                    Permission.name == permission_name
                )
            )

            if permission is None:
                permission = Permission(
                    name=permission_name,
                    description=permission_name,
                )
                db.add(permission)
                db.flush()

            db.add(
                AdminPermission(
                    admin_id=admin.id,
                    permission_id=permission.id,
                )
            )

        db.commit()
        db.refresh(admin)

        return admin.id

    finally:
        db.close()


def test_list_admins(client):
    login(
        client,
        "admin",
        "admin-password-1234",
    )

    response = client.get(
        "/api/v1/admin/admins"
    )

    assert response.status_code == 200

    body = response.json()

    assert "items" in body
    assert isinstance(body["items"], list)

    for item in body["items"]:
        assert "id" in item
        assert "username" in item
        assert "is_active" in item
        assert "roles" in item
        assert "permissions" in item

        assert "password_hash" not in item


def test_create_admin(client):
    role_name = f"content-test-role-{uuid4().hex[:8]}"
    create_role(role_name, ["news.view"])

    csrf = login(
        client,
        "admin",
        "admin-password-1234",
    )

    response = client.post(
        "/api/v1/admin/admins",
        headers={
            "X-CSRF-Token": csrf,
        },
        json={
            "username": "test-create-admin",
            "password": "test-password-12345",
            "role": role_name,
        },
    )

    assert response.status_code == 201

    body = response.json()

    assert body["username"] == "test-create-admin"
    assert body["is_active"] is True
    assert body["roles"] == [role_name]
    assert "password_hash" not in body


def test_update_admin_revokes_sessions(client):
    csrf = login(
        client,
        "admin",
        "admin-password-1234",
    )

    target_id = create_admin_with_permissions(
        "target-update-admin",
        "target-password-12345",
        ["news.view"],
    )

    response = client.put(
        f"/api/v1/admin/admins/{target_id}",
        headers={
            "X-CSRF-Token": csrf,
        },
        json={
            "password": "new-target-password-12345",
        },
    )

    assert response.status_code == 200

    db = TestSession()

    try:
        refreshed = db.get(
            Admin,
            target_id,
        )

        assert refreshed is not None
        assert refreshed.username == "target-update-admin"

        # Password update must not leave the old password
        # hash unchanged.
        assert refreshed.password_hash != hash_password(
            "target-password-12345"
        )

    finally:
        db.close()


def test_self_delete_is_rejected(client):
    csrf = login(
        client,
        "admin",
        "admin-password-1234",
    )

    db = TestSession()

    try:
        admin = db.scalar(
            select(Admin).where(
                Admin.username == "admin"
            )
        )

        assert admin is not None
        admin_id = admin.id

    finally:
        db.close()

    response = client.delete(
        f"/api/v1/admin/admins/{admin_id}",
        headers={
            "X-CSRF-Token": csrf,
        },
    )

    assert response.status_code == 400

    assert (
        response.json()["detail"]
        == "Anda tidak dapat menghapus akun sendiri"
    )


def test_self_deactivation_is_rejected(client):
    csrf = login(
        client,
        "admin",
        "admin-password-1234",
    )

    db = TestSession()

    try:
        admin = db.scalar(
            select(Admin).where(
                Admin.username == "admin"
            )
        )

        assert admin is not None
        admin_id = admin.id

    finally:
        db.close()

    response = client.put(
        f"/api/v1/admin/admins/{admin_id}",
        headers={
            "X-CSRF-Token": csrf,
        },
        json={
            "is_active": False,
        },
    )

    assert response.status_code == 400


def test_admin_without_manage_permission_cannot_manage_admins(client):
    db = TestSession()

    try:
        role_id = create_role(
            "admin-view-only-test",
            [
                "dashboard.view",
                "admins.view",
            ],
        )

        create_test_admin(
            "limited-admin-test",
            "limited-admin-password-12345",
            role_id,
        )

    finally:
        db.close()

    login(
        client,
        "limited-admin-test",
        "limited-admin-password-12345",
    )

    response = client.get(
        "/api/v1/admin/admins"
    )

    assert response.status_code == 200

    csrf = client.cookies.get("himatkn_csrf")
    assert csrf

    response = client.post(
        "/api/v1/admin/admins",
        headers={
            "X-CSRF-Token": csrf,
        },
        json={
            "username": "should-not-exist",
            "password": "should-not-exist-12345",
            "role": "editor",
        },
    )

    assert response.status_code == 403


def test_low_privilege_admin_cannot_assign_higher_privilege_role(
    client,
):
    manager_role_id = create_role(
        "admin-manager-test",
        [
            "dashboard.view",
            "admins.view",
            "admins.manage",
        ],
    )

    target_role_id = create_role(
        "target-low-role-test",
        [
            "dashboard.view",
        ],
    )

    high_role_id = create_role(
        "high-privilege-test",
        [
            "dashboard.view",
            "admins.view",
            "admins.manage",
            "roles.manage",
            "settings.manage",
        ],
    )

    create_test_admin(
        "manager-test",
        "manager-password-12345",
        manager_role_id,
    )

    target_id = create_test_admin(
        "target-privilege-test",
        "target-password-12345",
        target_role_id,
    )

    login(
        client,
        "manager-test",
        "manager-password-12345",
    )

    csrf = client.cookies.get("himatkn_csrf")
    assert csrf

    response = client.put(
        f"/api/v1/admin/admins/{target_id}",
        headers={
            "X-CSRF-Token": csrf,
        },
        json={
            "role": "high-privilege-test",
        },
    )

    assert response.status_code == 403

    db = TestSession()

    try:
        assigned_roles = db.scalars(
            select(Role.name)
            .join(
                AdminRole,
                AdminRole.role_id == Role.id,
            )
            .where(
                AdminRole.admin_id == target_id
            )
        ).all()

        assert assigned_roles == ["target-low-role-test"]

    finally:
        db.close()

def test_missing_csrf_blocks_admin_mutation(client):
    login(
        client,
        "admin",
        "admin-password-1234",
    )

    response = client.post(
        "/api/v1/admin/admins",
        json={
            "username": "csrf-blocked-admin",
            "password": "csrf-blocked-password-12345",
            "role": "editor",
        },
    )

    assert response.status_code == 403


def test_delete_other_admin(client):
    csrf = login(
        client,
        "admin",
        "admin-password-1234",
    )

    target_id = create_admin_with_permissions(
        "delete-target-admin",
        "delete-target-password-12345",
        ["news.view"],
    )

    response = client.delete(
        f"/api/v1/admin/admins/{target_id}",
        headers={
            "X-CSRF-Token": csrf,
        },
    )

    assert response.status_code == 204

    db = TestSession()

    try:
        deleted = db.get(
            Admin,
            target_id,
        )

        assert deleted is None

    finally:
        db.close()


def _set_auth_overrides(admin_id: int) -> None:
    app.dependency_overrides[current_admin] = (
        lambda: SimpleNamespace(id=admin_id)
    )
    app.dependency_overrides[require_csrf] = lambda: None


def _clear_auth_overrides() -> None:
    app.dependency_overrides.pop(current_admin, None)
    app.dependency_overrides.pop(require_csrf, None)


@contextmanager
def only_active_manager(permissions: list[str]):
    db = TestSession()
    previous_active: dict[int, bool] = {}

    try:
        role = Role(
            name=f"only-manager-role-{uuid4().hex[:8]}",
            description="test",
        )
        db.add(role)
        db.flush()

        for permission_name in permissions:
            permission = db.scalar(
                select(Permission).where(
                    Permission.name == permission_name
                )
            )

            if permission is None:
                permission = Permission(
                    name=permission_name,
                    description=permission_name,
                )
                db.add(permission)
                db.flush()

            db.add(
                RolePermission(
                    role_id=role.id,
                    permission_id=permission.id,
                )
            )

        target = Admin(
            username=f"only-manager-target-{uuid4().hex[:8]}",
            password_hash=hash_password("only-manager-target-password"),
            is_active=True,
        )
        actor = Admin(
            username=f"inactive-manager-actor-{uuid4().hex[:8]}",
            password_hash=hash_password("inactive-manager-password"),
            is_active=False,
        )
        db.add_all([target, actor])
        db.flush()

        db.add_all(
            [
                AdminRole(admin_id=target.id, role_id=role.id),
                AdminRole(admin_id=actor.id, role_id=role.id),
            ]
        )
        db.commit()

        manager_ids = _active_admins_with_permission(db, "admins.manage")
        others = db.scalars(
            select(Admin).where(
                Admin.id.in_(manager_ids - {target.id})
            )
        ).all()

        previous_active = {row.id: row.is_active for row in others}

        for row in others:
            row.is_active = False

        db.commit()

        yield target.id, actor.id

    finally:
        if previous_active:
            db.expire_all()
            for admin_id, was_active in previous_active.items():
                row = db.get(Admin, admin_id)
                if row is not None:
                    row.is_active = was_active
            db.commit()

        db.close()


def test_self_role_change_is_rejected(client):
    csrf = login(
        client,
        "admin",
        "admin-password-1234",
    )

    db = TestSession()

    try:
        admin_id = db.scalar(
            select(Admin.id).where(
                Admin.username == "admin"
            )
        )

        assert admin_id is not None

    finally:
        db.close()

    response = client.put(
        f"/api/v1/admin/admins/{admin_id}",
        headers={
            "X-CSRF-Token": csrf,
        },
        json={
            "role": "superadmin",
        },
    )

    assert response.status_code == 400

    assert (
        response.json()["detail"]
        == "Anda tidak dapat mengganti role akun sendiri"
    )


def test_deactivating_only_active_manage_admin_is_rejected(client):
    with only_active_manager(["admins.manage"]) as (target_id, actor_id):
        _set_auth_overrides(actor_id)

        try:
            response = client.put(
                f"/api/v1/admin/admins/{target_id}",
                json={
                    "is_active": False,
                },
            )
        finally:
            _clear_auth_overrides()

    assert response.status_code == 409
    assert "admins.manage" in response.json()["detail"]


def test_demoting_only_active_manage_admin_is_rejected(client):
    role_name = f"no-permissions-{uuid4().hex[:8]}"
    create_role(role_name, [])

    with only_active_manager(["admins.manage"]) as (target_id, actor_id):
        _set_auth_overrides(actor_id)

        try:
            response = client.put(
                f"/api/v1/admin/admins/{target_id}",
                json={
                    "role": role_name,
                },
            )
        finally:
            _clear_auth_overrides()

    assert response.status_code == 409
    assert "admins.manage" in response.json()["detail"]


def test_deleting_only_active_manage_admin_is_rejected(client):
    with only_active_manager(["admins.manage"]) as (target_id, actor_id):
        _set_auth_overrides(actor_id)

        try:
            response = client.delete(
                f"/api/v1/admin/admins/{target_id}",
            )
        finally:
            _clear_auth_overrides()

    assert response.status_code == 409
    assert "admins.manage" in response.json()["detail"]
