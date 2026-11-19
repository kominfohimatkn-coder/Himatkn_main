from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.database.connection import get_db
from app.database.dependencies import require_csrf, require_permission
from app.models import Admin, AdminPermission, AdminRole, Permission, Role
from app.schemas.admin import AdminCreate, AdminUpdate
from app.services.auth import (
    admin_payload,
    is_superadmin,
    revoke_admin_sessions,
)
from app.services.audit import log_activity
from app.services.permissions import (
    ALWAYS_GRANTED,
    PERMISSION_CATALOG,
    SUPERADMIN_ONLY,
    SUPERADMIN_ROLE,
    PermissionValidationError,
    normalize_permissions,
)
from app.utils.ip import get_client_ip

router = APIRouter(prefix="/admin/admins", tags=["admin"])

P_ADMINS_VIEW = "admins.view"
P_ADMINS_MANAGE = "admins.manage"

MAX_SUPERADMINS = 2


def _normalize_username(value: str) -> str:
    username = value.strip()
    if not 3 <= len(username) <= 50:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Username administrator tidak valid",
        )
    return username


def _get_role(db: Session, role_name: str) -> Role:
    role = db.scalar(select(Role).where(Role.name == role_name))
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role administrator tidak valid",
        )
    return role


def _normalize_payload_permissions(permissions: list[str]) -> set[str]:
    try:
        return normalize_permissions(permissions)
    except PermissionValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc


def _direct_permission_names(db: Session, admin_id: int) -> set[str]:
    statement = (
        select(Permission.name)
        .join(
            AdminPermission,
            AdminPermission.permission_id == Permission.id,
        )
        .where(AdminPermission.admin_id == admin_id)
    )
    return set(db.scalars(statement).all())


def _replace_direct_permissions(
    db: Session,
    admin_id: int,
    permission_names: set[str],
) -> None:
    db.query(AdminPermission).filter(
        AdminPermission.admin_id == admin_id
    ).delete(synchronize_session=False)

    if not permission_names:
        return

    permission_ids = db.scalars(
        select(Permission.id).where(
            Permission.name.in_(permission_names)
        )
    ).all()

    for permission_id in permission_ids:
        db.add(
            AdminPermission(
                admin_id=admin_id,
                permission_id=permission_id,
            )
        )


def _superadmin_ids(db: Session) -> set[int]:
    statement = (
        select(AdminRole.admin_id)
        .join(Role, Role.id == AdminRole.role_id)
        .where(Role.name == SUPERADMIN_ROLE)
    )
    return set(db.scalars(statement).all())


def _active_superadmin_ids(db: Session) -> set[int]:
    statement = (
        select(AdminRole.admin_id)
        .join(Role, Role.id == AdminRole.role_id)
        .join(Admin, Admin.id == AdminRole.admin_id)
        .where(
            Role.name == SUPERADMIN_ROLE,
            Admin.is_active.is_(True),
        )
    )
    return set(db.scalars(statement).all())


def _assert_superadmin_limit(db: Session) -> None:
    if len(_superadmin_ids(db)) >= MAX_SUPERADMINS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Jumlah superadmin maksimal 2 akun",
        )


def _assert_active_superadmin_remains(db: Session, target_id: int) -> None:
    if not (_active_superadmin_ids(db) - {target_id}):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Operasi ditolak: harus tersisa minimal satu "
                "superadmin aktif"
            ),
        )


def _permission_change_description(
    username: str,
    before: set[str],
    after: set[str],
) -> str | None:
    added = sorted(after - before)
    removed = sorted(before - after)

    if not added and not removed:
        return None

    parts: list[str] = []

    if added:
        parts.append("menambah izin " + ", ".join(added))

    if removed:
        parts.append("menghapus izin " + ", ".join(removed))

    return (
        f"Memperbarui izin administrator {username}: "
        + "; ".join(parts)
    )


@router.get("")
def list_admins(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_permission(P_ADMINS_VIEW)),
):
    admins = db.scalars(
        select(Admin).order_by(Admin.username.asc(), Admin.id.asc())
    ).all()
    return {"items": [admin_payload(db, admin) for admin in admins]}


@router.get("/permissions")
def permission_catalog(
    _: Admin = Depends(require_permission(P_ADMINS_VIEW)),
):
    return {
        "items": PERMISSION_CATALOG,
        "superadmin_only": sorted(SUPERADMIN_ONLY),
        "always_granted": sorted(ALWAYS_GRANTED),
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

    if db.scalar(
        select(Admin).where(func.lower(Admin.username) == username.casefold())
    ) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username administrator sudah digunakan",
        )

    direct_permissions: set[str] = set()

    if payload.is_superadmin:
        _assert_superadmin_limit(db)
        role = _get_role(db, SUPERADMIN_ROLE)
    else:
        direct_permissions = _normalize_payload_permissions(
            payload.permissions
        )
        role = None

    item = Admin(
        username=username,
        password_hash=hash_password(payload.password),
        is_active=True,
    )
    db.add(item)

    try:
        db.flush()

        if role is not None:
            db.add(AdminRole(admin_id=item.id, role_id=role.id))
        else:
            _replace_direct_permissions(
                db,
                item.id,
                direct_permissions,
            )

        role_label = " superadmin" if role is not None else ""
        log_activity(
            db,
            actor.id,
            "admin.create",
            "admin",
            item.id,
            f"Membuat administrator{role_label} {item.username}",
            ip_address=get_client_ip(request),
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

    if actor.id == item.id:
        if payload.password is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Gunakan menu ganti kata sandi",
            )

        if payload.permissions is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Anda tidak dapat mengubah izin akun sendiri",
            )

        if payload.is_superadmin is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Anda tidak dapat mengubah status superadmin "
                    "akun sendiri"
                ),
            )

        if payload.is_active is not None:
            detail = (
                "Anda tidak dapat menonaktifkan akun sendiri"
                if payload.is_active is False
                else "Anda tidak dapat mengubah status aktif akun sendiri"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=detail,
            )

    current_superadmin = is_superadmin(db, item.id)
    next_superadmin = (
        payload.is_superadmin
        if payload.is_superadmin is not None
        else current_superadmin
    )
    superadmin_changed = next_superadmin != current_superadmin
    next_active = (
        payload.is_active
        if payload.is_active is not None
        else item.is_active
    )

    if superadmin_changed and next_superadmin:
        _assert_superadmin_limit(db)

    if next_superadmin and payload.permissions:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Akun superadmin tidak boleh memiliki izin langsung; "
                "superadmin otomatis memiliki semua izin."
            ),
        )

    if current_superadmin and item.is_active:
        removes_active_superadmin = (
            not next_superadmin or not next_active
        )

        if removes_active_superadmin:
            _assert_active_superadmin_remains(db, item.id)

    direct_permissions: set[str] | None = None

    if payload.permissions is not None:
        direct_permissions = _normalize_payload_permissions(
            payload.permissions
        )
    elif current_superadmin and not next_superadmin:
        # Demotion without an explicit list leaves only the always-granted
        # dashboard permission.
        direct_permissions = normalize_permissions([])

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
    else:
        username = item.username

    username_changed = username != item.username
    password_changed = payload.password is not None
    active_changed = payload.is_active is not None
    direct_permissions_before = _direct_permission_names(db, item.id)
    permissions_after: set[str] | None = None

    if username_changed:
        item.username = username

    if password_changed:
        item.password_hash = hash_password(payload.password)

    if active_changed:
        item.is_active = payload.is_active

    if superadmin_changed:
        role = _get_role(db, SUPERADMIN_ROLE)

        if next_superadmin:
            existing = db.get(
                AdminRole,
                {"admin_id": item.id, "role_id": role.id},
            )

            if existing is None:
                db.add(
                    AdminRole(admin_id=item.id, role_id=role.id)
                )

            # Superadmin permissions come from the role, so stale direct
            # grants are cleared.
            _replace_direct_permissions(db, item.id, set())
            permissions_after = set()
        else:
            db.query(AdminRole).filter(
                AdminRole.admin_id == item.id,
                AdminRole.role_id == role.id,
            ).delete(synchronize_session=False)

            _replace_direct_permissions(
                db,
                item.id,
                direct_permissions or set(),
            )
            permissions_after = direct_permissions or set()
    elif direct_permissions is not None and not next_superadmin:
        _replace_direct_permissions(
            db,
            item.id,
            direct_permissions,
        )
        permissions_after = direct_permissions

    # A permissions-only change is intentionally not revoked: permissions
    # are re-read from the database on every request.
    session_must_be_revoked = (
        password_changed
        or superadmin_changed
        or (active_changed and payload.is_active is False)
    )

    if session_must_be_revoked:
        revoke_admin_sessions(db, item.id)

    if username_changed or active_changed:
        log_activity(
            db,
            actor.id,
            "admin.update",
            "admin",
            item.id,
            f"Memperbarui administrator {item.username}",
            ip_address=get_client_ip(request),
            user_agent=request.headers.get("user-agent", "")[:500],
        )

    if password_changed:
        log_activity(
            db,
            actor.id,
            "admin.password_reset",
            "admin",
            item.id,
            f"Mereset kata sandi administrator {item.username}",
            ip_address=get_client_ip(request),
            user_agent=request.headers.get("user-agent", "")[:500],
        )

    if superadmin_changed:
        log_activity(
            db,
            actor.id,
            (
                "admin.superadmin_grant"
                if next_superadmin
                else "admin.superadmin_revoke"
            ),
            "admin",
            item.id,
            (
                f"Menjadikan {item.username} superadmin"
                if next_superadmin
                else f"Mencabut status superadmin {item.username}"
            ),
            ip_address=get_client_ip(request),
            user_agent=request.headers.get("user-agent", "")[:500],
        )

    if permissions_after is not None:
        description = _permission_change_description(
            item.username,
            direct_permissions_before,
            permissions_after,
        )

        if description is not None:
            log_activity(
                db,
                actor.id,
                "admin.permissions_update",
                "admin",
                item.id,
                description,
                ip_address=get_client_ip(request),
                user_agent=request.headers.get("user-agent", "")[:500],
            )

    try:
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

    if is_superadmin(db, item.id) and item.is_active:
        _assert_active_superadmin_remains(db, item.id)

    try:
        log_activity(
            db,
            actor.id,
            "admin.delete",
            "admin",
            item.id,
            f"Menghapus administrator {item.username}",
            ip_address=get_client_ip(request),
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
