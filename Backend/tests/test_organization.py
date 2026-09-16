from __future__ import annotations

from sqlalchemy import select

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
