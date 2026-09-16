from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import sessionmaker

from app.database.connection import engine
from app.core.security import hash_password
from app.models import (
    Admin,
    AdminRole,
    Permission,
    Role,
    RolePermission,
)


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
            "role": "editor",
        },
    )

    assert response.status_code == 201

    body = response.json()

    assert body["username"] == "test-create-admin"
    assert body["is_active"] is True
    assert body["roles"] == ["editor"]
    assert "password_hash" not in body


def test_update_admin_revokes_sessions(client):
    csrf = login(
        client,
        "admin",
        "admin-password-1234",
    )

    db = TestSession()

    try:
        role = db.scalar(
            select(Role).where(Role.name == "editor")
        )
        assert role is not None

        target = Admin(
            username="target-update-admin",
            password_hash=hash_password(
                "target-password-12345"
            ),
            is_active=True,
        )
        db.add(target)
        db.flush()

        db.add(
            AdminRole(
                admin_id=target.id,
                role_id=role.id,
            )
        )

        db.commit()
        target_id = target.id

    finally:
        db.close()

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

    role_id = create_role(
        "delete-target-test",
        [
            "dashboard.view",
        ],
    )

    target_id = create_test_admin(
        "delete-target-admin",
        "delete-target-password-12345",
        role_id,
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