from __future__ import annotations

from sqlalchemy import func, select

from app.database.connection import SessionLocal
from app.models import ActivityLog, Division, Member, Period, Position


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