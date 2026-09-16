from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.database.connection import get_db
from app.database.dependencies import require_csrf, require_permission
from app.models import Admin, AdminRole, Permission, Role, RolePermission
from app.schemas.admin import AdminCreate, AdminUpdate
from app.services.auth import admin_payload, permissions_for_admin, revoke_admin_sessions
from app.services.audit import log_activity

router = APIRouter(prefix="/admin/admins", tags=["admin"])

P_ADMINS_VIEW = "admins.view"
P_ADMINS_MANAGE = "admins.manage"


def _normalize_username(value: str) -> str:
    username = value.strip()
    if not 3 <= len(username) <= 50:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Username administrator tidak valid",
        )
    return username


def _normalize_role_name(value: str) -> str:
    role_name = value.strip().lower()
    if not role_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Role administrator tidak valid",
        )
    return role_name


def _get_role(db: Session, role_name: str) -> Role:
    role = db.scalar(select(Role).where(Role.name == _normalize_role_name(role_name)))
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role administrator tidak valid",
        )
    return role


def _permissions_for_role(db: Session, role_id: int) -> set[str]:
    statement = (
        select(Permission.name)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .where(RolePermission.role_id == role_id)
    )
    return set(db.scalars(statement).all())


def _can_manage_target(
    db: Session,
    actor: Admin,
    target: Admin,
    *,
    replacement_role: Role | None = None,
) -> None:
    actor_permissions = permissions_for_admin(db, actor.id)
    target_permissions = permissions_for_admin(db, target.id)

    if not target_permissions.issubset(actor_permissions):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki kewenangan untuk mengelola administrator tersebut",
        )

    if replacement_role is not None:
        replacement_permissions = _permissions_for_role(db, replacement_role.id)
        if not replacement_permissions.issubset(actor_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Anda tidak dapat memberikan role dengan izin melebihi kewenangan Anda",
            )


def _assert_not_self_deactivate(actor: Admin, target: Admin, is_active: bool | None) -> None:
    if actor.id == target.id and is_active is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Anda tidak dapat menonaktifkan akun sendiri",
        )


@router.get("")
def list_admins(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_permission(P_ADMINS_VIEW)),
):
    admins = db.scalars(select(Admin).order_by(Admin.username.asc(), Admin.id.asc())).all()
    return {"items": [admin_payload(db, admin) for admin in admins]}


@router.get("/roles")
def roles(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_permission("roles.manage")),
):
    rows = db.scalars(select(Role).order_by(Role.name.asc(), Role.id.asc())).all()
    return {
        "items": [
            {
                "id": role.id,
                "name": role.name,
                "description": role.description,
            }
            for role in rows
        ]
    }


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_csrf)],
)
def create_admin(
    request: Request,
    payload: AdminCreate,
    db: Session = Depends(get_db),
    actor: Admin = Depends(require_permission(P_ADMINS_MANAGE)),
):
    username = _normalize_username(payload.username)
    role = _get_role(db, payload.role)

    actor_permissions = permissions_for_admin(db, actor.id)
    role_permissions = _permissions_for_role(db, role.id)
    if not role_permissions.issubset(actor_permissions):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak dapat memberikan role dengan izin melebihi kewenangan Anda",
        )

    if db.scalar(
        select(Admin).where(func.lower(Admin.username) == username.casefold())
    ) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username administrator sudah digunakan",
        )

    item = Admin(
        username=username,
        password_hash=hash_password(payload.password),
        is_active=True,
    )
    db.add(item)

    try:
        db.flush()
        db.add(AdminRole(admin_id=item.id, role_id=role.id))
        log_activity(
            db,
            actor.id,
            "admin.create",
            "admin",
            item.id,
            f"Membuat administrator {item.username}",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent", "")[:500],
        )
        db.commit()
        db.refresh(item)
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Administrator gagal dibuat karena data bertabrakan",
        ) from exc

    return admin_payload(db, item)


@router.put(
    "/{admin_id}",
    dependencies=[Depends(require_csrf)],
)
def update_admin(
    admin_id: int,
    request: Request,
    payload: AdminUpdate,
    db: Session = Depends(get_db),
    actor: Admin = Depends(require_permission(P_ADMINS_MANAGE)),
):
    item = db.get(Admin, admin_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrator tidak ditemukan",
        )

    replacement_role: Role | None = None
    if payload.role is not None:
        replacement_role = _get_role(db, payload.role)

    _can_manage_target(
        db,
        actor,
        item,
        replacement_role=replacement_role,
    )
    _assert_not_self_deactivate(actor, item, payload.is_active)

    password_changed = payload.password is not None
    active_changed = payload.is_active is not None
    role_changed = payload.role is not None

    if payload.username is not None:
        username = _normalize_username(payload.username)
        duplicate = db.scalar(
            select(Admin).where(
                func.lower(Admin.username) == username.casefold(),
                Admin.id != item.id,
            )
        )
        if duplicate is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username administrator sudah digunakan",
            )
        item.username = username

    if payload.password is not None:
        item.password_hash = hash_password(payload.password)

    if payload.is_active is not None:
        item.is_active = payload.is_active

    if replacement_role is not None:
        db.query(AdminRole).filter(AdminRole.admin_id == item.id).delete(
            synchronize_session=False
        )
        db.add(AdminRole(admin_id=item.id, role_id=replacement_role.id))

    session_must_be_revoked = (
    password_changed
    or role_changed
    or (active_changed and payload.is_active is False)
    )

    if session_must_be_revoked:
        revoke_admin_sessions(db, item.id)

    try:
        log_activity(
            db,
            actor.id,
            "admin.update",
            "admin",
            item.id,
            f"Memperbarui administrator {item.username}",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent", "")[:500],
        )
        db.commit()
        db.refresh(item)
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Administrator gagal diperbarui karena data bertabrakan",
        ) from exc

    return admin_payload(db, item)


@router.delete(
    "/{admin_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_csrf)],
)
def delete_admin(
    admin_id: int,
    request: Request,
    db: Session = Depends(get_db),
    actor: Admin = Depends(require_permission(P_ADMINS_MANAGE)),
):
    if admin_id == actor.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Anda tidak dapat menghapus akun sendiri",
        )

    item = db.get(Admin, admin_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrator tidak ditemukan",
        )

    _can_manage_target(db, actor, item)

    try:
        log_activity(
            db,
            actor.id,
            "admin.delete",
            "admin",
            item.id,
            f"Menghapus administrator {item.username}",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent", "")[:500],
        )
        db.delete(item)
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Administrator tidak dapat dihapus karena masih digunakan",
        ) from exc

    return None
