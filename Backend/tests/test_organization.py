from __future__ import annotations

from sqlalchemy import func, select

from app.database.connection import SessionLocal
from app.models import (
    ActivityLog,
    Division,
    Member,
    Period,
    Position,
    Program,
)


def login(client):
    client.get("/api/v1/auth/csrf")
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "admin",
            "password": "admin-password-1234",
        },
        headers={"Origin": "http://localhost:3000"},
    )
    assert response.status_code == 200
    return client.cookies.get("himatkn_csrf")


def test_member_update_rejects_invalid_references(client):
    csrf = login(client)
    headers = {
        "X-CSRF-Token": csrf,
        "Origin": "http://localhost:3000",
    }

    with SessionLocal() as db:
        period = Period(name="TEST-ORG-INVALID-2026", is_active=True)
        position = Position(name="Ketua")
        db.add_all([period, position])
        db.flush()

        division = Division(
            period_id=period.id,
            name="BPH",
            sort_order=0,
        )
        db.add(division)
        db.flush()

        member = Member(
            period_id=period.id,
            division_id=division.id,
            position_id=position.id,
            name="Anggota Test",
            sort_order=0,
        )
        db.add(member)
        db.commit()
        member_id = member.id
        period_id = period.id
        position_id = position.id

    response = client.put(
        f"/api/v1/admin/organization/members/{member_id}",
        json={
            "period_id": period_id + 9999,
            "division_id": None,
            "position_id": position_id,
            "name": "Invalid",
            "photo_url": None,
            "sort_order": 0,
        },
        headers=headers,
    )

    assert response.status_code == 400


def test_member_update_rejects_division_from_other_period(client):
    csrf = login(client)
    headers = {
        "X-CSRF-Token": csrf,
        "Origin": "http://localhost:3000",
    }

    with SessionLocal() as db:
        period_a = Period(name="TEST-ORG-A-2026", is_active=True)
        period_b = Period(name="TEST-ORG-B-2027", is_active=False)
        position = Position(name="Sekretaris")
        db.add_all([period_a, period_b, position])
        db.flush()

        division_a = Division(period_id=period_a.id, name="BPH A", sort_order=0)
        division_b = Division(period_id=period_b.id, name="BPH B", sort_order=0)
        db.add_all([division_a, division_b])
        db.flush()

        member = Member(
            period_id=period_a.id,
            division_id=division_a.id,
            position_id=position.id,
            name="Anggota Test 2",
            sort_order=0,
        )
        db.add(member)
        db.commit()

        member_id = member.id
        period_id = period_a.id
        foreign_division_id = division_b.id
        position_id = position.id

    response = client.put(
        f"/api/v1/admin/organization/members/{member_id}",
        json={
            "period_id": period_id,
            "division_id": foreign_division_id,
            "position_id": position_id,
            "name": "Invalid Division",
            "photo_url": None,
            "sort_order": 0,
        },
        headers=headers,
    )

    assert response.status_code == 400


def test_organization_crud_writes_audit_log(client):
    csrf = login(client)
    headers = {
        "X-CSRF-Token": csrf,
        "Origin": "http://localhost:3000",
    }

    response = client.post(
        "/api/v1/admin/organization/periods",
        json={
            "name": "2028/2029",
            "start_date": "2028-01-01",
            "end_date": "2029-12-31",
            "is_active": False,
        },
        headers=headers,
    )

    assert response.status_code == 201
    period_id = response.json()["id"]

    with SessionLocal() as db:
        log = db.scalar(
            select(ActivityLog).where(
                ActivityLog.action == "period.create",
                ActivityLog.entity_type == "period",
                ActivityLog.entity_id == period_id,
            )
        )
        assert log is not None
def _headers(client):
    return {"X-CSRF-Token": login(client), "Origin": "http://localhost:3000"}


def _active_period_ids():
    with SessionLocal() as db:
        return set(db.scalars(select(Period.id).where(Period.is_active.is_(True))).all())


def test_create_active_period_deactivates_others(client):
    headers = _headers(client)

    first = client.post(
        "/api/v1/admin/organization/periods",
        json={"name": "TEST-ACTIVE-A-2030", "start_date": "2030-01-01",
              "end_date": "2030-12-31", "is_active": True},
        headers=headers,
    )
    assert first.status_code == 201

    second = client.post(
        "/api/v1/admin/organization/periods",
        json={"name": "TEST-ACTIVE-B-2031", "start_date": "2031-01-01",
              "end_date": "2031-12-31", "is_active": True},
        headers=headers,
    )
    assert second.status_code == 201

    assert _active_period_ids() == {second.json()["id"]}


def test_create_inactive_period_keeps_current_active(client):
    headers = _headers(client)
    before = _active_period_ids()

    response = client.post(
        "/api/v1/admin/organization/periods",
        json={"name": "TEST-INACTIVE-2032", "start_date": "2032-01-01",
              "end_date": "2032-12-31", "is_active": False},
        headers=headers,
    )
    assert response.status_code == 201
    assert _active_period_ids() == before

def _create_period(client, headers, name, is_active=False):
    response = client.post(
        "/api/v1/admin/organization/periods",
        json={"name": name, "start_date": "2040-01-01",
              "end_date": "2040-12-31", "is_active": is_active},
        headers=headers,
    )
    assert response.status_code == 201
    return response.json()["id"]


def _activate(client, headers, period_id):
    return client.post(
        f"/api/v1/admin/organization/periods/{period_id}/activate",
        headers=headers,
    )


def test_activate_period_deactivates_others(client):
    headers = _headers(client)
    a_id = _create_period(client, headers, "TEST-ACT-A", is_active=True)
    b_id = _create_period(client, headers, "TEST-ACT-B")

    response = _activate(client, headers, b_id)
    assert response.status_code == 200
    assert response.json()["period"]["id"] == b_id
    assert response.json()["period"]["is_active"] is True
    assert _active_period_ids() == {b_id}
    assert a_id not in _active_period_ids()


def test_activate_period_is_idempotent(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-ACT-IDEMPOTENT")

    assert _activate(client, headers, period_id).status_code == 200
    assert _activate(client, headers, period_id).status_code == 200

    with SessionLocal() as db:
        count = db.scalar(
            select(func.count()).select_from(ActivityLog).where(
                ActivityLog.action == "period.activate",
                ActivityLog.entity_id == period_id,
            )
        )
    assert count == 1


def test_activate_empty_period_returns_warnings(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-ACT-EMPTY")

    warnings = _activate(client, headers, period_id).json()["warnings"]
    assert "Periode ini belum memiliki divisi" in warnings
    assert "Periode ini belum memiliki anggota" in warnings


def test_activate_filled_period_has_no_warnings(client):
    headers = _headers(client)
    with SessionLocal() as db:
        period = Period(name="TEST-ACT-FILLED", is_active=False)
        position = Position(name="TEST-ACT-POS")
        db.add_all([period, position])
        db.flush()
        division = Division(period_id=period.id, name="Div Uji", sort_order=0)
        db.add(division)
        db.flush()
        db.add(Member(period_id=period.id, division_id=division.id,
                      position_id=position.id, name="Anggota Uji", sort_order=0))
        db.commit()
        period_id = period.id

    response = _activate(client, headers, period_id)
    assert response.status_code == 200
    assert response.json()["warnings"] == []


def test_activate_unknown_period_returns_404(client):
    headers = _headers(client)
    assert _activate(client, headers, 999999).status_code == 404


def test_activate_requires_csrf(client):
    login(client)
    period_id = 1
    response = client.post(
        f"/api/v1/admin/organization/periods/{period_id}/activate",
        headers={"Origin": "http://localhost:3000"},
    )
    assert response.status_code == 403


def test_public_organization_follows_activated_period(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-ACT-PUBLIC")
    _activate(client, headers, period_id)

    public = client.get("/api/v1/public/organization").json()
    assert public["period"]["id"] == period_id


def _update_period(client, headers, period_id, payload):
    return client.put(
        f"/api/v1/admin/organization/periods/{period_id}",
        json=payload,
        headers=headers,
    )


def _delete_period(client, headers, period_id):
    return client.delete(
        f"/api/v1/admin/organization/periods/{period_id}",
        headers=headers,
    )


def test_update_period_success_writes_audit_log(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3A-UPD-OK")

    response = _update_period(
        client,
        headers,
        period_id,
        {
            "name": "TEST-B3A-UPD-OK-EDIT",
            "start_date": "2041-02-01",
            "end_date": "2041-12-31",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "TEST-B3A-UPD-OK-EDIT"
    assert body["start_date"] == "2041-02-01"
    assert body["end_date"] == "2041-12-31"
    assert body["is_active"] is False

    with SessionLocal() as db:
        log = db.scalar(
            select(ActivityLog).where(
                ActivityLog.action == "period.update",
                ActivityLog.entity_id == period_id,
            )
        )
        assert log is not None


def test_update_period_duplicate_name_returns_409(client):
    headers = _headers(client)
    _create_period(client, headers, "TEST-B3A-UPD-DUP-A")
    second_id = _create_period(client, headers, "TEST-B3A-UPD-DUP-B")

    response = _update_period(
        client,
        headers,
        second_id,
        {"name": "test-b3a-upd-dup-a"},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Periode sudah ada"


def test_update_period_same_name_case_insensitive_succeeds(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3A-UPD-SELF")

    response = _update_period(
        client,
        headers,
        period_id,
        {"name": "test-b3a-upd-self"},
    )

    assert response.status_code == 200
    assert response.json()["name"] == "test-b3a-upd-self"


def test_update_period_reversed_dates_returns_422(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3A-UPD-DATES")

    response = _update_period(
        client,
        headers,
        period_id,
        {
            "name": "TEST-B3A-UPD-DATES",
            "start_date": "2042-12-31",
            "end_date": "2042-01-01",
        },
    )

    assert response.status_code == 422


def test_update_period_ignores_is_active(client):
    headers = _headers(client)
    active_id = _create_period(
        client,
        headers,
        "TEST-B3A-UPD-ACT-A",
        is_active=True,
    )
    other_id = _create_period(client, headers, "TEST-B3A-UPD-ACT-B")

    response = _update_period(
        client,
        headers,
        other_id,
        {"name": "TEST-B3A-UPD-ACT-B", "is_active": True},
    )

    assert response.status_code == 200
    assert response.json()["is_active"] is False

    with SessionLocal() as db:
        assert db.get(Period, other_id).is_active is False
        assert db.get(Period, active_id).is_active is True


def test_update_period_unknown_returns_404(client):
    headers = _headers(client)

    response = _update_period(
        client,
        headers,
        999999,
        {"name": "TEST-B3A-UPD-MISSING"},
    )

    assert response.status_code == 404


def test_update_period_requires_csrf(client):
    login(client)

    response = client.put(
        "/api/v1/admin/organization/periods/1",
        json={"name": "TEST-B3A-UPD-NO-CSRF"},
        headers={"Origin": "http://localhost:3000"},
    )

    assert response.status_code == 403


def test_create_period_reversed_dates_returns_422(client):
    headers = _headers(client)

    response = client.post(
        "/api/v1/admin/organization/periods",
        json={
            "name": "TEST-B3A-CREATE-DATES",
            "start_date": "2043-12-31",
            "end_date": "2043-01-01",
            "is_active": False,
        },
        headers=headers,
    )

    assert response.status_code == 422


def test_delete_active_period_returns_409(client):
    headers = _headers(client)
    period_id = _create_period(
        client,
        headers,
        "TEST-B3A-DEL-ACTIVE",
        is_active=True,
    )

    response = _delete_period(client, headers, period_id)

    assert response.status_code == 409
    assert response.json()["detail"] == "Periode aktif tidak bisa dihapus"

    with SessionLocal() as db:
        assert db.get(Period, period_id) is not None


def test_delete_period_with_contents_returns_409(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3A-DEL-FILLED")

    with SessionLocal() as db:
        position = Position(name="TEST-B3A-DEL-POS")
        division = Division(
            period_id=period_id,
            name="TEST-B3A-DEL-DIV",
            sort_order=0,
        )
        db.add_all([position, division])
        db.flush()

        db.add(
            Member(
                period_id=period_id,
                division_id=division.id,
                position_id=position.id,
                name="Anggota B3A",
                sort_order=0,
            )
        )
        db.add(
            Program(
                period_id=period_id,
                division_id=division.id,
                name="Program B3A",
                slug="test-b3a-del-filled-program",
                status="planned",
            )
        )
        db.commit()

    response = _delete_period(client, headers, period_id)

    assert response.status_code == 409
    detail = response.json()["detail"]
    assert "1 divisi" in detail
    assert "1 anggota" in detail
    assert "1 program kerja" in detail

    with SessionLocal() as db:
        assert db.get(Period, period_id) is not None


def test_delete_empty_period_succeeds(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3A-DEL-EMPTY")

    response = _delete_period(client, headers, period_id)

    assert response.status_code == 200
    assert response.json() == {"deleted": period_id}

    with SessionLocal() as db:
        assert db.get(Period, period_id) is None
        log = db.scalar(
            select(ActivityLog).where(
                ActivityLog.action == "period.delete",
                ActivityLog.entity_id == period_id,
            )
        )
        assert log is not None


def test_delete_period_unknown_returns_404(client):
    headers = _headers(client)

    response = _delete_period(client, headers, 999999)

    assert response.status_code == 404