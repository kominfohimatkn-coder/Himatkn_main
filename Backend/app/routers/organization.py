from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.dependencies import require_csrf, require_permission
from app.models import Admin, Division, Member, Period, Position
from app.schemas.organization import PeriodIn, MemberIn
from app.services.audit import log_activity


router = APIRouter(
    prefix="/admin/organization",
    tags=["admin"],
)

PERMISSION_VIEW = "organization.view"
PERMISSION_MANAGE = "organization.manage"


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
    _: Admin = Depends(require_permission(PERMISSION_VIEW)),
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
    )
    
    _commit_or_conflict(db)
    db.refresh(row)

    return _period_item(row)


@router.get("/divisions")
def divisions(
    period_id: int | None = None,
    db: Session = Depends(get_db),
    _: Admin = Depends(require_permission(PERMISSION_VIEW)),
):
    statement = select(Division).order_by(
        Division.period_id,
        Division.sort_order,
        Division.name,
        Division.id,
    )

    if period_id is not None:
        statement = statement.where(Division.period_id == period_id)

    rows = db.scalars(statement).all()
    return {"items": [_division_item(row) for row in rows]}


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
        request=request,
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
        request=request,
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
        request=request,
    )
    _commit_or_conflict(db)
    return None
