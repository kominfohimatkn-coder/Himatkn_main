from sqlalchemy import select

from app.database.connection import SessionLocal
from app.models import ActivityLog, Admin
from app.routers.activity import activity_kind

ORIGIN = "http://localhost:3000"
LOGS = "/api/v1/admin/activity-logs"


def login(client, username="admin", password="admin-password-1234"):
    client.get("/api/v1/auth/csrf")
    response = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
        headers={"Origin": ORIGIN},
    )
    assert response.status_code == 200
    return {"X-CSRF-Token": client.cookies.get("himatkn_csrf"), "Origin": ORIGIN}


def admin_id(username="admin") -> int:
    with SessionLocal() as db:
        return db.scalar(select(Admin.id).where(Admin.username == username))


def period_id(client, headers) -> int:
    periods = client.get("/api/v1/admin/organization/periods").json()["items"]
    if periods:
        return periods[0]["id"]

    response = client.post(
        "/api/v1/admin/organization/periods",
        json={"name": "Periode Log", "start_date": "2026-01-01", "end_date": "2027-01-01"},
        headers=headers,
    )
    assert response.status_code == 201
    return response.json()["id"]


def test_activity_kind_mapping():
    assert activity_kind("news.create") == "create"
    assert activity_kind("news.image.create") == "create"
    assert activity_kind("division.copy") == "create"
    assert activity_kind("member.delete") == "delete"
    assert activity_kind("period.activate") == "update"
    assert activity_kind("admin.password_change") == "update"
    assert activity_kind("admin.superadmin_grant") == "update"
    assert activity_kind("auth.login.failure") == "auth"
    assert activity_kind("auth.logout") == "auth"


def test_program_changes_are_logged(client):
    headers = login(client)
    payload = {
        "period_id": period_id(client, headers),
        "name": "Program Audit Log",
        "slug": "program-audit-log",
        "description": "uji",
        "status": "planned",
    }

    created = client.post("/api/v1/admin/programs", json=payload, headers=headers)
    assert created.status_code == 201
    program = created.json()

    updated = client.put(
        f"/api/v1/admin/programs/{program['id']}",
        json={**payload, "name": "Program Audit Log Baru"},
        headers=headers,
    )
    assert updated.status_code == 200

    deleted = client.delete(f"/api/v1/admin/programs/{program['id']}", headers=headers)
    assert deleted.status_code == 204

    with SessionLocal() as db:
        rows = db.scalars(
            select(ActivityLog)
            .where(ActivityLog.entity_type == "program", ActivityLog.entity_id == program["id"])
            .order_by(ActivityLog.id)
        ).all()

    assert [(row.action, row.description) for row in rows] == [
        ("program.create", "Membuat program kerja Program Audit Log"),
        ("program.update", "Memperbarui program kerja Program Audit Log Baru"),
        ("program.delete", "Menghapus program kerja Program Audit Log Baru"),
    ]
    assert all(row.admin_id == admin_id() for row in rows)


def test_rejected_program_change_is_not_logged(client):
    headers = login(client)

    with SessionLocal() as db:
        before = db.scalar(
            select(ActivityLog.id).order_by(ActivityLog.id.desc()).limit(1)
        )

    response = client.put(
        "/api/v1/admin/programs/999999",
        json={"period_id": 1, "name": "Tidak ada", "slug": "tidak-ada", "status": "planned"},
        headers=headers,
    )
    assert response.status_code == 404

    with SessionLocal() as db:
        after = db.scalars(
            select(ActivityLog.action).where(ActivityLog.id > (before or 0))
        ).all()

    assert "program.update" not in after


def test_list_includes_username_kind_total_and_counts(client):
    login(client)

    body = client.get(LOGS, params={"limit": 5}).json()

    assert body["total"] >= len(body["items"]) > 0
    assert set(body["counts"]) == {"all", "create", "update", "delete", "auth"}
    assert body["counts"]["all"] == sum(
        body["counts"][kind] for kind in ("create", "update", "delete", "auth")
    )
    assert body["counts"]["all"] == body["total"]

    item = body["items"][0]
    assert {"admin_username", "kind", "action", "description", "created_at"} <= set(item)
    assert item["kind"] == activity_kind(item["action"])

    login_row = next(
        row for row in client.get(LOGS, params={"kind": "auth", "limit": 50}).json()["items"]
        if row["action"] == "auth.login.success"
    )
    assert login_row["admin_username"] == "admin"


def test_filters_by_kind_search_and_admin(client):
    headers = login(client)
    payload = {
        "period_id": period_id(client, headers),
        "name": "Program Saring 50%_unik",
        "slug": "program-saring-unik",
        "status": "planned",
    }
    created = client.post("/api/v1/admin/programs", json=payload, headers=headers)
    assert created.status_code == 201

    deletes = client.get(LOGS, params={"kind": "delete", "limit": 200}).json()
    assert deletes["items"] and all(row["kind"] == "delete" for row in deletes["items"])
    assert deletes["total"] == deletes["counts"]["delete"]

    # `%` dan `_` dicari sebagai karakter biasa, bukan wildcard.
    found = client.get(LOGS, params={"q": "saring 50%_UNIK"}).json()
    assert [row["description"] for row in found["items"]] == [
        "Membuat program kerja Program Saring 50%_unik"
    ]
    assert found["counts"]["all"] == 1 and found["counts"]["create"] == 1
    assert client.get(LOGS, params={"q": "saring 50%xunik"}).json()["total"] == 0

    mine = client.get(LOGS, params={"admin_id": admin_id(), "limit": 200}).json()
    assert mine["items"] and all(row["admin_username"] == "admin" for row in mine["items"])

    nobody = client.get(LOGS, params={"admin_id": admin_id("limited"), "kind": "create"}).json()
    assert nobody["total"] == 0

    assert client.get(LOGS, params={"kind": "hapus"}).status_code == 422
    assert client.get(LOGS, params={"q": "x" * 101}).status_code == 422


def test_admin_options_only_lists_admins_with_logs(client):
    login(client)

    usernames = [row["username"] for row in client.get(f"{LOGS}/admins").json()["items"]]

    assert "admin" in usernames
    assert usernames == sorted(usernames)


def test_activity_logs_require_permission(client):
    login(client, "limited", "limited-password-1234")

    assert client.get(LOGS).status_code == 403
    assert client.get(f"{LOGS}/admins").status_code == 403