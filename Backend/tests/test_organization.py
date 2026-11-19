from __future__ import annotations

from uuid import uuid4

from sqlalchemy import func, select

from app.core.security import hash_password
from app.database.connection import SessionLocal
from app.models import (
    ActivityLog,
    Admin,
    AdminPermission,
    Division,
    Member,
    Period,
    Permission,
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


def _login_limited(client):
    client.get("/api/v1/auth/csrf")
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "limited",
            "password": "limited-password-1234",
        },
        headers={"Origin": "http://localhost:3000"},
    )
    assert response.status_code == 200
    return {
        "X-CSRF-Token": client.cookies.get("himatkn_csrf"),
        "Origin": "http://localhost:3000",
    }


def _create_division(
    client,
    headers,
    period_id,
    name,
    *,
    sort_order=0,
    description=None,
):
    return client.post(
        "/api/v1/admin/organization/divisions",
        json={
            "period_id": period_id,
            "name": name,
            "description": description,
            "sort_order": sort_order,
        },
        headers=headers,
    )


def _update_division(client, headers, division_id, payload):
    return client.put(
        f"/api/v1/admin/organization/divisions/{division_id}",
        json=payload,
        headers=headers,
    )


def _delete_division(client, headers, division_id):
    return client.delete(
        f"/api/v1/admin/organization/divisions/{division_id}",
        headers=headers,
    )


def _copy_divisions(client, headers, target_period_id, source_period_id):
    return client.post(
        f"/api/v1/admin/organization/periods/{target_period_id}"
        "/divisions/copy",
        json={"source_period_id": source_period_id},
        headers=headers,
    )


def _create_position(name):
    with SessionLocal() as db:
        row = Position(name=name)
        db.add(row)
        db.commit()
        return row.id


def _seed_member(period_id, division_id, position_id, name):
    with SessionLocal() as db:
        row = Member(
            period_id=period_id,
            division_id=division_id,
            position_id=position_id,
            name=name,
            sort_order=0,
        )
        db.add(row)
        db.commit()
        return row.id


def _seed_program(period_id, division_id, name, slug):
    with SessionLocal() as db:
        row = Program(
            period_id=period_id,
            division_id=division_id,
            name=name,
            slug=slug,
            status="planned",
        )
        db.add(row)
        db.commit()
        return row.id


def test_create_division_success_writes_audit_log(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3B-DIV-CREATE")

    response = _create_division(
        client,
        headers,
        period_id,
        "TEST-B3B-DIV-CREATE-BPH",
        sort_order=3,
        description="Badan Pengurus Harian",
    )

    assert response.status_code == 201
    body = response.json()
    assert body["period_id"] == period_id
    assert body["name"] == "TEST-B3B-DIV-CREATE-BPH"
    assert body["description"] == "Badan Pengurus Harian"
    assert body["sort_order"] == 3

    with SessionLocal() as db:
        row = db.get(Division, body["id"])
        assert row is not None
        assert row.name == "TEST-B3B-DIV-CREATE-BPH"

        log = db.scalar(
            select(ActivityLog).where(
                ActivityLog.action == "division.create",
                ActivityLog.entity_id == body["id"],
            )
        )
        assert log is not None


def test_create_division_duplicate_case_insensitive_returns_409(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3B-DIV-DUP")
    assert (
        _create_division(
            client,
            headers,
            period_id,
            "TEST-B3B-DIV-DUP-MEDIA",
        ).status_code
        == 201
    )

    response = _create_division(
        client,
        headers,
        period_id,
        "test-b3b-div-dup-media",
    )

    assert response.status_code == 409
    assert (
        response.json()["detail"]
        == "Divisi dengan nama ini sudah ada di periode tersebut"
    )


def test_create_division_same_name_other_period_succeeds(client):
    headers = _headers(client)
    first_period = _create_period(client, headers, "TEST-B3B-DIV-OTHER-A")
    second_period = _create_period(client, headers, "TEST-B3B-DIV-OTHER-B")

    assert (
        _create_division(
            client,
            headers,
            first_period,
            "TEST-B3B-DIV-OTHER-SAMA",
        ).status_code
        == 201
    )
    response = _create_division(
        client,
        headers,
        second_period,
        "TEST-B3B-DIV-OTHER-SAMA",
    )

    assert response.status_code == 201
    assert response.json()["period_id"] == second_period


def test_create_division_unknown_period_returns_400(client):
    headers = _headers(client)

    response = _create_division(
        client,
        headers,
        999999,
        "TEST-B3B-DIV-NO-PERIOD",
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Periode tidak ditemukan"


def test_update_division_success_writes_audit_log(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3B-DIV-UPD")
    other_period = _create_period(client, headers, "TEST-B3B-DIV-UPD-OTHER")
    division_id = _create_division(
        client,
        headers,
        period_id,
        "TEST-B3B-DIV-UPD-OLD",
    ).json()["id"]

    response = _update_division(
        client,
        headers,
        division_id,
        {
            "name": "TEST-B3B-DIV-UPD-NEW",
            "description": "Deskripsi baru",
            "sort_order": 7,
            "period_id": other_period,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "TEST-B3B-DIV-UPD-NEW"
    assert body["description"] == "Deskripsi baru"
    assert body["sort_order"] == 7
    assert body["period_id"] == period_id

    with SessionLocal() as db:
        row = db.get(Division, division_id)
        assert row.name == "TEST-B3B-DIV-UPD-NEW"
        assert row.description == "Deskripsi baru"
        assert row.sort_order == 7
        assert row.period_id == period_id

        log = db.scalar(
            select(ActivityLog).where(
                ActivityLog.action == "division.update",
                ActivityLog.entity_id == division_id,
            )
        )
        assert log is not None


def test_update_division_duplicate_name_returns_409(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3B-DIV-UPD-DUP")
    _create_division(
        client,
        headers,
        period_id,
        "TEST-B3B-DIV-UPD-DUP-A",
    )
    second_id = _create_division(
        client,
        headers,
        period_id,
        "TEST-B3B-DIV-UPD-DUP-B",
    ).json()["id"]

    response = _update_division(
        client,
        headers,
        second_id,
        {"name": "test-b3b-div-upd-dup-a"},
    )

    assert response.status_code == 409
    assert (
        response.json()["detail"]
        == "Divisi dengan nama ini sudah ada di periode tersebut"
    )


def test_update_division_unknown_returns_404(client):
    headers = _headers(client)

    response = _update_division(
        client,
        headers,
        999999,
        {"name": "TEST-B3B-DIV-UPD-MISSING"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Divisi tidak ditemukan"


def test_delete_division_with_members_returns_409(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3B-DIV-DEL-MEMBER")
    division_id = _create_division(
        client,
        headers,
        period_id,
        "TEST-B3B-DIV-DEL-MEMBER-DIV",
    ).json()["id"]
    position_id = _create_position("TEST-B3B-DIV-DEL-MEMBER-POS")
    _seed_member(
        period_id,
        division_id,
        position_id,
        "Anggota B3B Divisi",
    )

    response = _delete_division(client, headers, division_id)

    assert response.status_code == 409
    assert "masih ada 1 anggota" in response.json()["detail"]

    with SessionLocal() as db:
        assert db.get(Division, division_id) is not None


def test_delete_division_with_programs_returns_409(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3B-DIV-DEL-PROGRAM")
    division_id = _create_division(
        client,
        headers,
        period_id,
        "TEST-B3B-DIV-DEL-PROGRAM-DIV",
    ).json()["id"]
    _seed_program(
        period_id,
        division_id,
        "Program B3B Divisi",
        "test-b3b-div-del-program",
    )

    response = _delete_division(client, headers, division_id)

    assert response.status_code == 409
    assert "masih dipakai 1 program kerja" in response.json()["detail"]


def test_delete_division_with_members_and_programs_returns_409(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3B-DIV-DEL-BOTH")
    division_id = _create_division(
        client,
        headers,
        period_id,
        "TEST-B3B-DIV-DEL-BOTH-DIV",
    ).json()["id"]
    position_id = _create_position("TEST-B3B-DIV-DEL-BOTH-POS")
    _seed_member(
        period_id,
        division_id,
        position_id,
        "Anggota B3B Keduanya",
    )
    _seed_program(
        period_id,
        division_id,
        "Program B3B Keduanya",
        "test-b3b-div-del-both",
    )

    response = _delete_division(client, headers, division_id)

    assert response.status_code == 409
    detail = response.json()["detail"]
    assert "masih ada 1 anggota" in detail
    assert "masih dipakai 1 program kerja" in detail


def test_delete_empty_division_succeeds(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3B-DIV-DEL-EMPTY")
    division_id = _create_division(
        client,
        headers,
        period_id,
        "TEST-B3B-DIV-DEL-EMPTY-DIV",
    ).json()["id"]

    response = _delete_division(client, headers, division_id)

    assert response.status_code == 200
    assert response.json() == {"deleted": division_id}

    with SessionLocal() as db:
        assert db.get(Division, division_id) is None
        log = db.scalar(
            select(ActivityLog).where(
                ActivityLog.action == "division.delete",
                ActivityLog.entity_id == division_id,
            )
        )
        assert log is not None


def test_delete_division_unknown_returns_404(client):
    headers = _headers(client)

    response = _delete_division(client, headers, 999999)

    assert response.status_code == 404


def test_limited_account_cannot_manage_divisions(client):
    admin_headers = _headers(client)
    period_id = _create_period(
        client,
        admin_headers,
        "TEST-B3B-DIV-LIMITED",
    )
    division_id = _create_division(
        client,
        admin_headers,
        period_id,
        "TEST-B3B-DIV-LIMITED-DIV",
    ).json()["id"]

    limited_headers = _login_limited(client)

    assert (
        _create_division(
            client,
            limited_headers,
            period_id,
            "TEST-B3B-DIV-LIMITED-NEW",
        ).status_code
        == 403
    )
    assert (
        _update_division(
            client,
            limited_headers,
            division_id,
            {"name": "TEST-B3B-DIV-LIMITED-EDIT"},
        ).status_code
        == 403
    )
    assert (
        _delete_division(client, limited_headers, division_id).status_code
        == 403
    )


def test_copy_divisions_success_orders_skips_and_audits(client):
    headers = _headers(client)
    source_id = _create_period(client, headers, "TEST-B3B-COPY-SRC")
    target_id = _create_period(client, headers, "TEST-B3B-COPY-DST")

    alpha_id = _create_division(
        client,
        headers,
        source_id,
        "TEST-B3B-COPY-ALPHA",
        sort_order=20,
        description="Alpha",
    ).json()["id"]
    _create_division(
        client,
        headers,
        source_id,
        "TEST-B3B-COPY-BETA",
        sort_order=10,
    )
    _create_division(
        client,
        headers,
        source_id,
        "TEST-B3B-COPY-GAMMA",
        sort_order=30,
    )
    _create_division(
        client,
        headers,
        target_id,
        "test-b3b-copy-beta",
        sort_order=99,
    )

    position_id = _create_position("TEST-B3B-COPY-POS")
    _seed_member(
        source_id,
        alpha_id,
        position_id,
        "Anggota B3B Copy",
    )

    response = _copy_divisions(client, headers, target_id, source_id)

    assert response.status_code == 200
    body = response.json()
    assert [item["name"] for item in body["created"]] == [
        "TEST-B3B-COPY-ALPHA",
        "TEST-B3B-COPY-GAMMA",
    ]
    assert body["skipped"] == ["TEST-B3B-COPY-BETA"]
    assert all(item["period_id"] == target_id for item in body["created"])
    assert body["created"][0]["sort_order"] == 20
    assert body["created"][0]["description"] == "Alpha"
    assert body["created"][1]["sort_order"] == 30

    with SessionLocal() as db:
        target_member_count = db.scalar(
            select(func.count())
            .select_from(Member)
            .where(Member.period_id == target_id)
        )
        assert target_member_count == 0

        logs = db.scalars(
            select(ActivityLog).where(
                ActivityLog.action == "division.copy",
                ActivityLog.entity_id == target_id,
            )
        ).all()
        assert len(logs) == 1
        assert "TEST-B3B-COPY-SRC" in logs[0].description
        assert "2 divisi" in logs[0].description
        assert "1 dilewati" in logs[0].description


def test_copy_divisions_same_period_returns_400(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3B-COPY-SAME")

    response = _copy_divisions(client, headers, period_id, period_id)

    assert response.status_code == 400
    assert (
        response.json()["detail"]
        == "Periode sumber dan tujuan tidak boleh sama"
    )


def test_copy_divisions_unknown_period_returns_404(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3B-COPY-MISSING")

    target_missing = _copy_divisions(client, headers, 999999, period_id)
    assert target_missing.status_code == 404
    assert (
        target_missing.json()["detail"]
        == "Periode tujuan tidak ditemukan"
    )

    source_missing = _copy_divisions(client, headers, period_id, 999999)
    assert source_missing.status_code == 404
    assert (
        source_missing.json()["detail"]
        == "Periode sumber tidak ditemukan"
    )


def test_get_divisions_ordered_by_sort_order_then_id(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3B-DIV-ORDER")

    last_id = _create_division(
        client,
        headers,
        period_id,
        "TEST-B3B-DIV-ORDER-LAST",
        sort_order=5,
    ).json()["id"]
    first_id = _create_division(
        client,
        headers,
        period_id,
        "TEST-B3B-DIV-ORDER-FIRST",
        sort_order=1,
    ).json()["id"]
    second_id = _create_division(
        client,
        headers,
        period_id,
        "TEST-B3B-DIV-ORDER-SECOND",
        sort_order=1,
    ).json()["id"]

    response = client.get(
        f"/api/v1/admin/organization/divisions?period_id={period_id}",
        headers=headers,
    )

    assert response.status_code == 200
    items = response.json()["items"]
    assert [item["id"] for item in items] == [
        first_id,
        second_id,
        last_id,
    ]
    assert all("sort_order" in item for item in items)


def _member_payload(period_id, position_id, name, division_id=None):
    return {
        "period_id": period_id,
        "division_id": division_id,
        "position_id": position_id,
        "name": name,
        "photo_url": None,
        "sort_order": 0,
    }


def test_create_member_success_writes_audit_log(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3B-MEM-CREATE")
    division_id = _create_division(
        client,
        headers,
        period_id,
        "TEST-B3B-MEM-CREATE-DIV",
    ).json()["id"]
    position_id = _create_position("TEST-B3B-MEM-CREATE-POS")

    response = client.post(
        "/api/v1/admin/organization/members",
        json=_member_payload(
            period_id,
            position_id,
            "TEST-B3B-MEM-CREATE-NAME",
            division_id,
        ),
        headers=headers,
    )

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "TEST-B3B-MEM-CREATE-NAME"

    with SessionLocal() as db:
        row = db.get(Member, body["id"])
        assert row is not None
        assert row.name == "TEST-B3B-MEM-CREATE-NAME"
        assert row.division_id == division_id

        log = db.scalar(
            select(ActivityLog).where(
                ActivityLog.action == "member.create",
                ActivityLog.entity_id == body["id"],
            )
        )
        assert log is not None


def test_update_member_success_writes_audit_log(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3B-MEM-UPDATE")
    division_id = _create_division(
        client,
        headers,
        period_id,
        "TEST-B3B-MEM-UPDATE-DIV",
    ).json()["id"]
    position_id = _create_position("TEST-B3B-MEM-UPDATE-POS")
    member_id = _seed_member(
        period_id,
        division_id,
        position_id,
        "TEST-B3B-MEM-UPDATE-OLD",
    )

    payload = _member_payload(
        period_id,
        position_id,
        "TEST-B3B-MEM-UPDATE-NEW",
        division_id,
    )
    payload["sort_order"] = 4

    response = client.put(
        f"/api/v1/admin/organization/members/{member_id}",
        json=payload,
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["name"] == "TEST-B3B-MEM-UPDATE-NEW"

    with SessionLocal() as db:
        row = db.get(Member, member_id)
        assert row.name == "TEST-B3B-MEM-UPDATE-NEW"
        assert row.sort_order == 4

        log = db.scalar(
            select(ActivityLog).where(
                ActivityLog.action == "member.update",
                ActivityLog.entity_id == member_id,
            )
        )
        assert log is not None


def test_delete_member_success_writes_audit_log(client):
    headers = _headers(client)
    period_id = _create_period(client, headers, "TEST-B3B-MEM-DELETE")
    division_id = _create_division(
        client,
        headers,
        period_id,
        "TEST-B3B-MEM-DELETE-DIV",
    ).json()["id"]
    position_id = _create_position("TEST-B3B-MEM-DELETE-POS")
    member_id = _seed_member(
        period_id,
        division_id,
        position_id,
        "TEST-B3B-MEM-DELETE-NAME",
    )

    response = client.delete(
        f"/api/v1/admin/organization/members/{member_id}",
        headers=headers,
    )

    assert response.status_code == 204

    with SessionLocal() as db:
        assert db.get(Member, member_id) is None

        log = db.scalar(
            select(ActivityLog).where(
                ActivityLog.action == "member.delete",
                ActivityLog.entity_id == member_id,
            )
        )
        assert log is not None


def _login_programs_view(client):
    username = f"test-programs-view-{uuid4().hex[:8]}"
    password = "programs-view-password-1234"

    with SessionLocal() as db:
        admin = Admin(
            username=username,
            password_hash=hash_password(password),
            is_active=True,
        )
        db.add(admin)
        db.flush()

        permission = db.scalar(
            select(Permission).where(Permission.name == "programs.view")
        )
        db.add(
            AdminPermission(
                admin_id=admin.id,
                permission_id=permission.id,
            )
        )
        db.commit()

    client.get("/api/v1/auth/csrf")
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": username,
            "password": password,
        },
        headers={"Origin": "http://localhost:3000"},
    )
    assert response.status_code == 200

    return {
        "X-CSRF-Token": client.cookies.get("himatkn_csrf"),
        "Origin": "http://localhost:3000",
    }


def test_programs_view_can_read_periods_and_divisions_only(client):
    headers = _login_programs_view(client)

    assert (
        client.get(
            "/api/v1/admin/organization/periods",
            headers=headers,
        ).status_code
        == 200
    )
    assert (
        client.get(
            "/api/v1/admin/organization/divisions",
            headers=headers,
        ).status_code
        == 200
    )
    assert (
        client.get(
            "/api/v1/admin/organization/members",
            headers=headers,
        ).status_code
        == 403
    )
    assert (
        client.get(
            "/api/v1/admin/organization/positions",
            headers=headers,
        ).status_code
        == 403
    )

    response = client.post(
        "/api/v1/admin/organization/periods",
        json={
            "name": "TEST-PROGRAMS-VIEW-FORBIDDEN",
            "start_date": "2050-01-01",
            "end_date": "2050-12-31",
            "is_active": False,
        },
        headers=headers,
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Anda tidak memiliki izin untuk modul ini"