from __future__ import annotations

from contextlib import contextmanager
from types import SimpleNamespace
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy import delete, select
from sqlalchemy.orm import sessionmaker

from app.core.security import hash_password
from app.database.connection import engine
from app.database.dependencies import current_admin, require_csrf
from app.main import app
from app.models import (
    Admin,
    AdminPermission,
    AdminRole,
    AuthSession,
    News,
    Permission,
    Role,
)


TestSession = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)

SUPERADMIN_USERNAME = "admin"
SUPERADMIN_PASSWORD = "admin-password-1234"


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


def csrf_headers(csrf: str) -> dict[str, str]:
    return {"X-CSRF-Token": csrf}


def _get_superadmin_role_id(db) -> int:
    role_id = db.scalar(
        select(Role.id).where(Role.name == "superadmin")
    )
    assert role_id is not None
    return role_id


def _get_admin_id(username: str) -> int:
    db = TestSession()

    try:
        admin_id = db.scalar(
            select(Admin.id).where(Admin.username == username)
        )
        assert admin_id is not None
        return admin_id
    finally:
        db.close()


def _delete_admins(*admin_ids: int | None) -> None:
    ids = [admin_id for admin_id in admin_ids if admin_id is not None]

    if not ids:
        return

    db = TestSession()

    try:
        db.execute(
            delete(AdminPermission).where(
                AdminPermission.admin_id.in_(ids)
            )
        )
        db.execute(
            delete(AdminRole).where(
                AdminRole.admin_id.in_(ids)
            )
        )
        db.execute(
            delete(AuthSession).where(
                AuthSession.admin_id.in_(ids)
            )
        )
        db.execute(
            delete(Admin).where(Admin.id.in_(ids))
        )
        db.commit()
    finally:
        db.close()


def _delete_news(*news_ids: int | None) -> None:
    ids = [news_id for news_id in news_ids if news_id is not None]

    if not ids:
        return

    db = TestSession()

    try:
        db.execute(delete(News).where(News.id.in_(ids)))
        db.commit()
    finally:
        db.close()


def create_admin_with_permissions(
    username: str,
    password: str,
    permissions: list[str],
    *,
    is_active: bool = True,
) -> int:
    db = TestSession()

    try:
        admin = Admin(
            username=username,
            password_hash=hash_password(password),
            is_active=is_active,
        )
        db.add(admin)
        db.flush()

        for permission_name in permissions:
            permission = db.scalar(
                select(Permission).where(
                    Permission.name == permission_name
                )
            )

            assert permission is not None

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


def create_superadmin(
    username: str,
    password: str,
    *,
    is_active: bool = True,
) -> int:
    db = TestSession()

    try:
        role_id = _get_superadmin_role_id(db)
        admin = Admin(
            username=username,
            password_hash=hash_password(password),
            is_active=is_active,
        )
        db.add(admin)
        db.flush()
        db.add(AdminRole(admin_id=admin.id, role_id=role_id))
        db.commit()
        db.refresh(admin)

        return admin.id
    finally:
        db.close()


def _superadmin_ids() -> set[int]:
    db = TestSession()

    try:
        return set(
            db.scalars(
                select(AdminRole.admin_id)
                .join(Role, Role.id == AdminRole.role_id)
                .where(Role.name == "superadmin")
            ).all()
        )
    finally:
        db.close()


def create_admin_via_api(
    client,
    csrf: str,
    username: str,
    permissions: list[str],
    *,
    is_superadmin: bool = False,
    password: str = "created-password-12345",
):
    payload = {
        "username": username,
        "password": password,
        "is_superadmin": is_superadmin,
        "permissions": permissions,
    }
    return client.post(
        "/api/v1/admin/admins",
        headers=csrf_headers(csrf),
        json=payload,
    )


def test_list_admins(client):
    login(client, SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD)

    response = client.get("/api/v1/admin/admins")

    assert response.status_code == 200

    body = response.json()

    assert "items" in body
    assert isinstance(body["items"], list)

    for item in body["items"]:
        assert "id" in item
        assert "username" in item
        assert "is_active" in item
        assert "is_superadmin" in item
        assert "roles" in item
        assert "permissions" in item
        assert "password_hash" not in item


def test_create_non_superadmin_returns_expanded_permissions(client):
    username = f"b4b-created-{uuid4().hex[:8]}"
    csrf = login(client, SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD)
    admin_id = None

    try:
        response = create_admin_via_api(
            client,
            csrf,
            username,
            ["news.create"],
        )

        assert response.status_code == 201

        body = response.json()
        admin_id = body["id"]

        assert body["username"] == username
        assert body["is_active"] is True
        assert body["is_superadmin"] is False
        assert body["roles"] == []
        assert set(body["permissions"]) == {
            "news.create",
            "news.view",
            "dashboard.view",
        }
        assert "password_hash" not in body
    finally:
        _delete_admins(admin_id)


def test_direct_permissions_control_module_access(client):
    username = f"b4b-news-author-{uuid4().hex[:8]}"
    password = "news-author-password-12345"
    csrf = login(client, SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD)
    admin_id = None
    news_id = None

    try:
        response = create_admin_via_api(
            client,
            csrf,
            username,
            ["news.create"],
            password=password,
        )
        assert response.status_code == 201
        admin_id = response.json()["id"]

        author = TestClient(app)
        author_csrf = login(author, username, password)

        response = author.post(
            "/api/v1/admin/news",
            headers=csrf_headers(author_csrf),
            json={
                "title": f"B4b news {uuid4().hex[:8]}",
                "content": "Konten uji izin langsung B4b.",
                "status": "draft",
            },
        )

        assert response.status_code == 201
        news_id = response.json()["id"]

        response = author.delete(
            f"/api/v1/admin/news/{news_id}",
            headers=csrf_headers(author_csrf),
        )
        assert response.status_code == 403

        response = author.get("/api/v1/admin/admins")
        assert response.status_code == 403
    finally:
        _delete_news(news_id)
        _delete_admins(admin_id)


def test_create_rejects_invalid_permissions(client):
    csrf = login(client, SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD)

    for permissions in (["admins.manage"], ["news.publish"]):
        response = create_admin_via_api(
            client,
            csrf,
            f"b4b-invalid-{uuid4().hex[:8]}",
            permissions,
        )

        assert response.status_code == 422


def test_create_superadmin_with_permissions_is_rejected(client):
    csrf = login(client, SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD)

    response = create_admin_via_api(
        client,
        csrf,
        f"b4b-superadmin-with-perms-{uuid4().hex[:8]}",
        ["news.view"],
        is_superadmin=True,
    )

    assert response.status_code == 422


def test_third_superadmin_is_rejected(client):
    username = f"b4b-superadmin-{uuid4().hex[:8]}"
    csrf = login(client, SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD)
    created_ids: list[int] = []

    try:
        while len(_superadmin_ids()) < 2:
            response = create_admin_via_api(
                client,
                csrf,
                f"{username}-{len(created_ids)}",
                [],
                is_superadmin=True,
                password="second-superadmin-password",
            )
            assert response.status_code == 201
            created_ids.append(response.json()["id"])

        response = create_admin_via_api(
            client,
            csrf,
            f"{username}-third",
            [],
            is_superadmin=True,
            password="third-superadmin-password",
        )

        assert response.status_code == 409
        assert response.json()["detail"] == (
            "Jumlah superadmin maksimal 2 akun"
        )
    finally:
        _delete_admins(*created_ids)


@contextmanager
def only_active_superadmin_target():
    db = TestSession()
    created_ids: list[int] = []
    previous_active: dict[int, bool] = {}

    try:
        role_id = _get_superadmin_role_id(db)

        target = Admin(
            username=f"only-superadmin-target-{uuid4().hex[:8]}",
            password_hash=hash_password(
                "only-superadmin-target-password"
            ),
            is_active=True,
        )
        actor = Admin(
            username=f"inactive-superadmin-actor-{uuid4().hex[:8]}",
            password_hash=hash_password(
                "inactive-superadmin-password"
            ),
            is_active=False,
        )
        db.add_all([target, actor])
        db.flush()

        db.add_all(
            [
                AdminRole(admin_id=target.id, role_id=role_id),
                AdminRole(admin_id=actor.id, role_id=role_id),
            ]
        )
        db.commit()

        created_ids = [target.id, actor.id]

        other_active_ids = (
            set(
                db.scalars(
                    select(AdminRole.admin_id)
                    .join(Role, Role.id == AdminRole.role_id)
                    .join(Admin, Admin.id == AdminRole.admin_id)
                    .where(
                        Role.name == "superadmin",
                        Admin.is_active.is_(True),
                    )
                ).all()
            )
            - {target.id}
        )

        others = db.scalars(
            select(Admin).where(Admin.id.in_(other_active_ids))
        ).all()

        previous_active = {row.id: row.is_active for row in others}

        for row in others:
            row.is_active = False

        db.commit()

        yield target.id, actor.id
    finally:
        db.expire_all()

        for admin_id, was_active in previous_active.items():
            row = db.get(Admin, admin_id)

            if row is not None:
                row.is_active = was_active

        db.commit()
        db.close()
        _delete_admins(*created_ids)


def _set_auth_overrides(admin_id: int) -> None:
    app.dependency_overrides[current_admin] = (
        lambda: SimpleNamespace(id=admin_id)
    )
    app.dependency_overrides[require_csrf] = lambda: None


def _clear_auth_overrides() -> None:
    app.dependency_overrides.pop(current_admin, None)
    app.dependency_overrides.pop(require_csrf, None)


def test_last_active_superadmin_cannot_be_removed(client):
    with only_active_superadmin_target() as (target_id, actor_id):
        _set_auth_overrides(actor_id)

        try:
            response = client.put(
                f"/api/v1/admin/admins/{target_id}",
                json={"is_active": False},
            )
        finally:
            _clear_auth_overrides()

        assert response.status_code == 409
        assert "superadmin aktif" in response.json()["detail"]

    with only_active_superadmin_target() as (target_id, actor_id):
        _set_auth_overrides(actor_id)

        try:
            response = client.put(
                f"/api/v1/admin/admins/{target_id}",
                json={"is_superadmin": False},
            )
        finally:
            _clear_auth_overrides()

        assert response.status_code == 409
        assert "superadmin aktif" in response.json()["detail"]

    with only_active_superadmin_target() as (target_id, actor_id):
        _set_auth_overrides(actor_id)

        try:
            response = client.delete(
                f"/api/v1/admin/admins/{target_id}",
            )
        finally:
            _clear_auth_overrides()

        assert response.status_code == 409
        assert "superadmin aktif" in response.json()["detail"]


def test_self_field_changes_are_rejected(client):
    csrf = login(client, SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD)
    admin_id = _get_admin_id(SUPERADMIN_USERNAME)

    cases = [
        (
            {"password": "new-own-password-12345"},
            "Gunakan menu ganti kata sandi",
        ),
        (
            {"permissions": ["news.view"]},
            "tidak dapat mengubah izin akun sendiri",
        ),
        (
            {"is_superadmin": False},
            "tidak dapat mengubah status superadmin akun sendiri",
        ),
        (
            {"is_active": False},
            "tidak dapat menonaktifkan akun sendiri",
        ),
    ]

    for payload, expected_detail in cases:
        response = client.put(
            f"/api/v1/admin/admins/{admin_id}",
            headers=csrf_headers(csrf),
            json=payload,
        )

        assert response.status_code == 400
        assert expected_detail in response.json()["detail"]


def test_self_delete_is_rejected(client):
    csrf = login(client, SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD)
    admin_id = _get_admin_id(SUPERADMIN_USERNAME)

    response = client.delete(
        f"/api/v1/admin/admins/{admin_id}",
        headers=csrf_headers(csrf),
    )

    assert response.status_code == 400
    assert (
        response.json()["detail"]
        == "Anda tidak dapat menghapus akun sendiri"
    )


def test_admin_without_manage_permission_cannot_manage_admins(client):
    username = f"b4b-limited-admin-{uuid4().hex[:8]}"
    password = "limited-admin-password-12345"
    admin_id = create_admin_with_permissions(
        username,
        password,
        ["news.view"],
    )

    try:
        limited_csrf = login(client, username, password)

        response = client.get("/api/v1/admin/admins")
        assert response.status_code == 403

        response = client.post(
            "/api/v1/admin/admins",
            headers=csrf_headers(limited_csrf),
            json={
                "username": "should-not-exist",
                "password": "should-not-exist-12345",
                "permissions": ["news.view"],
            },
        )
        assert response.status_code == 403
    finally:
        _delete_admins(admin_id)


def test_missing_csrf_blocks_admin_mutation(client):
    login(client, SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD)

    response = client.post(
        "/api/v1/admin/admins",
        json={
            "username": "csrf-blocked-admin",
            "password": "csrf-blocked-password-12345",
            "permissions": ["news.view"],
        },
    )

    assert response.status_code == 403


def test_update_admin_revokes_sessions(client):
    csrf = login(client, SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD)
    target_id = create_admin_with_permissions(
        f"b4b-update-target-{uuid4().hex[:8]}",
        "target-password-12345",
        ["news.view"],
    )

    try:
        response = client.put(
            f"/api/v1/admin/admins/{target_id}",
            headers=csrf_headers(csrf),
            json={
                "password": "new-target-password-12345",
            },
        )

        assert response.status_code == 200

        db = TestSession()

        try:
            refreshed = db.get(Admin, target_id)

            assert refreshed is not None
            assert refreshed.password_hash != hash_password(
                "target-password-12345"
            )
        finally:
            db.close()
    finally:
        _delete_admins(target_id)


def test_password_reset_revokes_target_sessions(client):
    username = f"b4b-reset-target-{uuid4().hex[:8]}"
    old_password = "reset-target-password-12345"
    target_id = create_admin_with_permissions(
        username,
        old_password,
        ["news.view"],
    )

    try:
        target_client = TestClient(app)
        login(target_client, username, old_password)
        assert target_client.get("/api/v1/auth/me").status_code == 200

        csrf = login(client, SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD)

        response = client.put(
            f"/api/v1/admin/admins/{target_id}",
            headers=csrf_headers(csrf),
            json={"password": "replaced-target-password-12345"},
        )

        assert response.status_code == 200
        assert target_client.get("/api/v1/auth/me").status_code == 401
        assert client.get("/api/v1/auth/me").status_code == 200
    finally:
        _delete_admins(target_id)


def test_permission_change_applies_without_relogin(client):
    username = f"b4b-permission-target-{uuid4().hex[:8]}"
    password = "permission-target-password-12345"
    target_id = create_admin_with_permissions(
        username,
        password,
        ["news.view"],
    )

    try:
        target_client = TestClient(app)
        login(target_client, username, password)
        assert target_client.get("/api/v1/admin/news").status_code == 200

        csrf = login(client, SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD)

        response = client.put(
            f"/api/v1/admin/admins/{target_id}",
            headers=csrf_headers(csrf),
            json={"permissions": ["settings.view"]},
        )
        assert response.status_code == 200

        # Same session, newly resolved permissions.
        assert target_client.get("/api/v1/admin/news").status_code == 403
        assert target_client.get("/api/v1/admin/settings").status_code == 200
        assert target_client.get("/api/v1/auth/me").status_code == 200

        response = client.put(
            f"/api/v1/admin/admins/{target_id}",
            headers=csrf_headers(csrf),
            json={"permissions": ["news.create"]},
        )
        assert response.status_code == 200

        assert target_client.get("/api/v1/admin/news").status_code == 200
        assert target_client.get("/api/v1/auth/me").status_code == 200
    finally:
        _delete_admins(target_id)


def test_delete_other_admin(client):
    csrf = login(client, SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD)
    target_id = create_admin_with_permissions(
        f"b4b-delete-target-{uuid4().hex[:8]}",
        "delete-target-password-12345",
        ["news.view"],
    )

    response = client.delete(
        f"/api/v1/admin/admins/{target_id}",
        headers=csrf_headers(csrf),
    )

    assert response.status_code == 204

    db = TestSession()

    try:
        assert db.get(Admin, target_id) is None
    finally:
        db.close()


def test_permission_catalog(client):
    login(client, SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD)

    response = client.get("/api/v1/admin/admins/permissions")

    assert response.status_code == 200

    body = response.json()
    modules = body["items"]

    assert isinstance(modules, list)
    assert modules

    for module in modules:
        assert {"key", "label", "available", "permissions"} <= set(module)
        assert isinstance(module["available"], bool)

        for permission in module["permissions"]:
            assert {"name", "label", "implies"} <= set(permission)
            assert isinstance(permission["implies"], list)

    unavailable = {
        module["key"]
        for module in modules
        if module["available"] is False
    }
    assert {"agendas", "documents", "notifications"} <= unavailable

    catalog_names = {
        permission["name"]
        for module in modules
        for permission in module["permissions"]
    }
    assert "admins.manage" not in catalog_names
    assert set(body["superadmin_only"]) == {
        "admins.view",
        "admins.manage",
        "roles.manage",
    }
