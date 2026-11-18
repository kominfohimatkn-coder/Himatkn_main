from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.utils.ip import get_client_ip
from app.database.connection import get_db
from app.database.dependencies import (
    require_any_permission,
    require_csrf,
    require_permission,
)
from app.models import Admin, Division, Member, Period, Position, Program
from app.schemas.organization import (
    DivisionCopyIn,
    DivisionIn,
    DivisionUpdateIn,
    MemberIn,
    PeriodIn,
    PeriodUpdateIn,
)
from app.services.audit import log_activity


router = APIRouter(
    prefix="/admin/organization",
    tags=["admin"],
)

PERMISSION_VIEW = "organization.view"
PERMISSION_MANAGE = "organization.manage"
PERMISSION_PROGRAMS_VIEW = "programs.view"


def _period_item(period: Period) -> dict:
    return {
        "id": period.id,
        "name": period.name,
        "start_date": period.start_date,
        "end_date": period.end_date,
        "is_active": period.is_active,
    }


def _division_item(division: Division) -> dict:
    return {
        "id": division.id,
        "period_id": division.period_id,
        "name": division.name,
        "description": division.description,
        "sort_order": division.sort_order,
    }


def _position_item(position: Position) -> dict:
    return {
        "id": position.id,
        "name": position.name,
        "description": position.description,
        "sort_order": position.sort_order,
    }


def _member_item(member: Member) -> dict:
    return {
        "id": member.id,
        "period_id": member.period_id,
        "division_id": member.division_id,
        "position_id": member.position_id,
        "name": member.name,
        "photo_url": member.photo_url,
        "sort_order": member.sort_order,
    }


def _validate_period_reference(db: Session, period_id: int) -> Period:
    period = db.get(Period, period_id)
    if period is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Periode tidak ditemukan",
        )
    return period


def _validate_member_references(
    db: Session,
    *,
    period_id: int,
    division_id: int | None,
    position_id: int,
) -> None:
    _validate_period_reference(db, period_id)

    position = db.get(Position, position_id)
    if position is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Posisi tidak ditemukan",
        )

    if division_id is not None:
        division = db.get(Division, division_id)
        if division is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Divisi tidak ditemukan",
            )
        if division.period_id != period_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Divisi tidak sesuai dengan periode yang dipilih",
            )


def _commit_or_conflict(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Data organisasi bertabrakan dengan constraint database",
        ) from exc


@router.get("/periods")
def periods(
    db: Session = Depends(get_db),
    _: Admin = Depends(
        require_any_permission(PERMISSION_VIEW, PERMISSION_PROGRAMS_VIEW)
    ),
):
    rows = db.scalars(
        select(Period).order_by(
            Period.start_date.desc(),
            Period.id.desc(),
        )
    ).all()

    return {"items": [_period_item(row) for row in rows]}


@router.post(
    "/periods",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_csrf)],
)
def create_period(
    payload: PeriodIn,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission(PERMISSION_MANAGE)),
):
    duplicate = db.scalar(
        select(Period).where(
            func.lower(Period.name) == payload.name.strip().lower(),
        )
    )
    if duplicate is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Periode sudah ada",
        )
    if payload.is_active:
        db.execute(
            update(Period)
            .where(Period.is_active.is_(True))
            .values(is_active=False)
        )

    row = Period(**payload.model_dump(exclude={"name"}), name=payload.name.strip())
    db.add(row)
    db.flush()

    log_activity(
    db=db,
    admin_id=admin.id,
    action="period.create",
    entity_type="period",
    entity_id=row.id,
    description=f"Membuat periode {row.name}",
    ip_address=get_client_ip(request),
    user_agent=request.headers.get("user-agent", "")[:500],    )
    
    _commit_or_conflict(db)
    db.refresh(row)

    return _period_item(row)


@router.get("/divisions")
def divisions(
    period_id: int | None = None,
    db: Session = Depends(get_db),
    _: Admin = Depends(
        require_any_permission(PERMISSION_VIEW, PERMISSION_PROGRAMS_VIEW)
    ),
):
    statement = select(Division).order_by(
        Division.period_id,
        Division.sort_order,
        Division.id,
    )

    if period_id is not None:
        statement = statement.where(Division.period_id == period_id)

    rows = db.scalars(statement).all()
    return {"items": [_division_item(row) for row in rows]}


@router.post(
    "/divisions",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_csrf)],
)
def create_division(
    payload: DivisionIn,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission(PERMISSION_MANAGE)),
):
    _validate_period_reference(db, payload.period_id)

    name = payload.name.strip()
    duplicate = db.scalar(
        select(Division).where(
            Division.period_id == payload.period_id,
            func.lower(Division.name) == name.lower(),
        )
    )
    if duplicate is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Divisi dengan nama ini sudah ada di periode tersebut",
        )

    row = Division(
        period_id=payload.period_id,
        name=name,
        description=payload.description,
        sort_order=payload.sort_order,
    )
    db.add(row)
    db.flush()

    log_activity(
        db=db,
        admin_id=admin.id,
        action="division.create",
        entity_type="division",
        entity_id=row.id,
        description=f"Membuat divisi {row.name}",
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent", "")[:500],
    )
    _commit_or_conflict(db)
    db.refresh(row)

    return _division_item(row)


@router.put(
    "/divisions/{division_id}",
    dependencies=[Depends(require_csrf)],
)
def update_division(
    division_id: int,
    payload: DivisionUpdateIn,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission(PERMISSION_MANAGE)),
):
    row = db.get(Division, division_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Divisi tidak ditemukan",
        )

    name = payload.name.strip()
    duplicate = db.scalar(
        select(Division).where(
            Division.period_id == row.period_id,
            func.lower(Division.name) == name.lower(),
            Division.id != row.id,
        )
    )
    if duplicate is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Divisi dengan nama ini sudah ada di periode tersebut",
        )

    previous_name = row.name

    row.name = name
    row.description = payload.description
    row.sort_order = payload.sort_order

    log_activity(
        db=db,
        admin_id=admin.id,
        action="division.update",
        entity_type="division",
        entity_id=row.id,
        description=(
            f"Memperbarui divisi {previous_name} menjadi {row.name}"
        ),
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent", "")[:500],
    )
    _commit_or_conflict(db)
    db.refresh(row)

    return _division_item(row)


@router.delete(
    "/divisions/{division_id}",
    dependencies=[Depends(require_csrf)],
)
def delete_division(
    division_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission(PERMISSION_MANAGE)),
):
    row = db.get(Division, division_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Divisi tidak ditemukan",
        )

    member_count = db.scalar(
        select(func.count())
        .select_from(Member)
        .where(Member.division_id == row.id)
    ) or 0
    program_count = db.scalar(
        select(func.count())
        .select_from(Program)
        .where(Program.division_id == row.id)
    ) or 0

    blockers: list[str] = []
    if member_count > 0:
        blockers.append(f"masih ada {member_count} anggota")
    if program_count > 0:
        blockers.append(f"masih dipakai {program_count} program kerja")

    if blockers:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Divisi tidak bisa dihapus: " + " dan ".join(blockers),
        )

    name = row.name
    deleted_id = row.id
    db.delete(row)

    log_activity(
        db=db,
        admin_id=admin.id,
        action="division.delete",
        entity_type="division",
        entity_id=deleted_id,
        description=f"Menghapus divisi {name}",
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent", "")[:500],
    )
    _commit_or_conflict(db)

    return {"deleted": deleted_id}


@router.post(
    "/periods/{period_id}/divisions/copy",
    dependencies=[Depends(require_csrf)],
)
def copy_divisions(
    period_id: int,
    payload: DivisionCopyIn,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission(PERMISSION_MANAGE)),
):
    target = db.get(Period, period_id)
    if target is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Periode tujuan tidak ditemukan",
        )

    source = db.get(Period, payload.source_period_id)
    if source is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Periode sumber tidak ditemukan",
        )

    if source.id == target.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Periode sumber dan tujuan tidak boleh sama",
        )

    source_rows = db.scalars(
        select(Division)
        .where(Division.period_id == source.id)
        .order_by(Division.sort_order, Division.id)
    ).all()

    existing_names = {
        name.lower()
        for name in db.scalars(
            select(Division.name).where(Division.period_id == target.id)
        ).all()
    }

    created: list[Division] = []
    skipped: list[str] = []

    for source_row in source_rows:
        if source_row.name.lower() in existing_names:
            skipped.append(source_row.name)
            continue

        row = Division(
            period_id=target.id,
            name=source_row.name,
            description=source_row.description,
            sort_order=source_row.sort_order,
        )
        db.add(row)
        created.append(row)
        existing_names.add(source_row.name.lower())

    db.flush()

    log_activity(
        db=db,
        admin_id=admin.id,
        action="division.copy",
        entity_type="period",
        entity_id=target.id,
        description=(
            f"Menyalin {len(created)} divisi dari periode {source.name} "
            f"ke {target.name} ({len(skipped)} dilewati)"
        ),
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent", "")[:500],
    )
    _commit_or_conflict(db)

    for row in created:
        db.refresh(row)

    return {
        "created": [_division_item(row) for row in created],
        "skipped": skipped,
    }


@router.get("/positions")
def positions(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_permission(PERMISSION_VIEW)),
):
    rows = db.scalars(
        select(Position).order_by(
            Position.sort_order,
            Position.name,
            Position.id,
        )
    ).all()

    return {"items": [_position_item(row) for row in rows]}


@router.get("/members")
def members(
    period_id: int | None = None,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_permission(PERMISSION_VIEW)),
):
    statement = select(Member).order_by(
        Member.sort_order,
        Member.name,
        Member.id,
    )

    if period_id is not None:
        statement = statement.where(Member.period_id == period_id)

    rows = db.scalars(statement).all()
    return {"items": [_member_item(row) for row in rows]}


@router.post(
    "/members",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_csrf)],
)
def create_member(
    payload: MemberIn,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission(PERMISSION_MANAGE)),
):
    _validate_member_references(
        db,
        period_id=payload.period_id,
        division_id=payload.division_id,
        position_id=payload.position_id,
    )

    row = Member(**payload.model_dump())
    db.add(row)
    db.flush()

    log_activity(
        db=db,
        admin_id=admin.id,
        action="member.create",
        entity_type="member",
        entity_id=row.id,
        description=f"Membuat anggota {row.name}",
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent", "")[:500],
    )
    _commit_or_conflict(db)
    db.refresh(row)

    return _member_item(row)


@router.put(
    "/members/{member_id}",
    dependencies=[Depends(require_csrf)],
)
def update_member(
    member_id: int,
    payload: MemberIn,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission(PERMISSION_MANAGE)),
):
    row = db.get(Member, member_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anggota tidak ditemukan",
        )

    _validate_member_references(
        db,
        period_id=payload.period_id,
        division_id=payload.division_id,
        position_id=payload.position_id,
    )

    previous_name = row.name

    row.period_id = payload.period_id
    row.division_id = payload.division_id
    row.position_id = payload.position_id
    row.name = payload.name.strip()
    row.photo_url = payload.photo_url
    row.sort_order = payload.sort_order

    log_activity(
        db=db,
        admin_id=admin.id,
        action="member.update",
        entity_type="member",
        entity_id=row.id,
        description=f"Memperbarui anggota {previous_name} menjadi {row.name}",
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent", "")[:500],
    )
    _commit_or_conflict(db)
    db.refresh(row)

    return _member_item(row)


@router.delete(
    "/members/{member_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_csrf)],
)
def delete_member(
    member_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission(PERMISSION_MANAGE)),
):
    row = db.get(Member, member_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anggota tidak ditemukan",
        )

    name = row.name
    db.delete(row)

    log_activity(
        db=db,
        admin_id=admin.id,
        action="member.delete",
        entity_type="member",
        entity_id=member_id,
        description=f"Menghapus anggota {name}",
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent", "")[:500],
    )
    _commit_or_conflict(db)
    return None

@router.post(
    "/periods/{period_id}/activate",
    dependencies=[Depends(require_csrf)],
)
def activate_period(
    period_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission(PERMISSION_MANAGE)),
):
    period = db.get(Period, period_id)
    if period is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Periode tidak ditemukan",
        )

    division_count = db.scalar(
        select(func.count())
        .select_from(Division)
        .where(Division.period_id == period.id)
    ) or 0
    member_count = db.scalar(
        select(func.count())
        .select_from(Member)
        .where(Member.period_id == period.id)
    ) or 0

    warnings: list[str] = []
    if division_count == 0:
        warnings.append("Periode ini belum memiliki divisi")
    if member_count == 0:
        warnings.append("Periode ini belum memiliki anggota")

    if not period.is_active:
        db.execute(
            update(Period)
            .where(Period.id != period.id, Period.is_active.is_(True))
            .values(is_active=False)
        )
        period.is_active = True

        log_activity(
            db=db,
            admin_id=admin.id,
            action="period.activate",
            entity_type="period",
            entity_id=period.id,
            description=f"Mengaktifkan periode {period.name}",
            ip_address=get_client_ip(request),
            user_agent=request.headers.get("user-agent", "")[:500],
        )
        _commit_or_conflict(db)
        db.refresh(period)

    return {"period": _period_item(period), "warnings": warnings}


@router.put(
    "/periods/{period_id}",
    dependencies=[Depends(require_csrf)],
)
def update_period(
    period_id: int,
    payload: PeriodUpdateIn,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission(PERMISSION_MANAGE)),
):
    period = db.get(Period, period_id)
    if period is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Periode tidak ditemukan",
        )

    name = payload.name.strip()
    duplicate = db.scalar(
        select(Period).where(
            func.lower(Period.name) == name.lower(),
            Period.id != period.id,
        )
    )
    if duplicate is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Periode sudah ada",
        )

    previous_name = period.name

    period.name = name
    period.start_date = payload.start_date
    period.end_date = payload.end_date

    log_activity(
        db=db,
        admin_id=admin.id,
        action="period.update",
        entity_type="period",
        entity_id=period.id,
        description=(
            f"Memperbarui periode {previous_name} menjadi {period.name}"
        ),
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent", "")[:500],
    )
    _commit_or_conflict(db)
    db.refresh(period)

    return _period_item(period)


@router.delete(
    "/periods/{period_id}",
    dependencies=[Depends(require_csrf)],
)
def delete_period(
    period_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(require_permission(PERMISSION_MANAGE)),
):
    period = db.get(Period, period_id)
    if period is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Periode tidak ditemukan",
        )

    if period.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Periode aktif tidak bisa dihapus",
        )

    division_count = db.scalar(
        select(func.count())
        .select_from(Division)
        .where(Division.period_id == period.id)
    ) or 0
    member_count = db.scalar(
        select(func.count())
        .select_from(Member)
        .where(Member.period_id == period.id)
    ) or 0
    program_count = db.scalar(
        select(func.count())
        .select_from(Program)
        .where(Program.period_id == period.id)
    ) or 0

    blockers: list[str] = []
    if division_count > 0:
        blockers.append(f"{division_count} divisi")
    if member_count > 0:
        blockers.append(f"{member_count} anggota")
    if program_count > 0:
        blockers.append(f"{program_count} program kerja")

    if blockers:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Periode tidak bisa dihapus: masih ada "
                + ", ".join(blockers)
            ),
        )

    name = period.name
    deleted_id = period.id
    db.delete(period)

    log_activity(
        db=db,
        admin_id=admin.id,
        action="period.delete",
        entity_type="period",
        entity_id=deleted_id,
        description=f"Menghapus periode {name}",
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent", "")[:500],
    )
    _commit_or_conflict(db)

    return {"deleted": deleted_id}