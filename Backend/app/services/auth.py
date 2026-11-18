from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from app.core.security import token_fingerprint
from app.models import (
    Admin,
    AdminPermission,
    AdminRole,
    AuthSession,
    Permission,
    Role,
    RolePermission,
)
from app.services.permissions import (
    ALWAYS_GRANTED,
    SUPERADMIN_ROLE,
    expand_permissions,
)


def create_session(db: Session, admin_id: int, jti: str, token: str, expires_at: datetime):
    row = AuthSession(admin_id=admin_id,jti=jti,token_hash=token_fingerprint(token),expires_at=expires_at.replace(tzinfo=None))
    db.add(row); return row


def get_session_admin(db: Session, token: str, admin_id: int, jti: str):
    now=datetime.now(timezone.utc).replace(tzinfo=None)
    session=db.scalar(select(AuthSession).where(AuthSession.admin_id==admin_id,AuthSession.jti==jti,AuthSession.token_hash==token_fingerprint(token),AuthSession.revoked_at.is_(None),AuthSession.expires_at>now))
    if not session: return None
    admin=db.get(Admin,admin_id)
    return admin if admin and admin.is_active else None


def revoke_token(db: Session, token: str, jti: str):
    row=db.scalar(select(AuthSession).where(AuthSession.jti==jti,AuthSession.token_hash==token_fingerprint(token)))
    if row and row.revoked_at is None: row.revoked_at=datetime.now(timezone.utc).replace(tzinfo=None)


def revoke_admin_sessions(db: Session, admin_id:int):
    db.execute(update(AuthSession).where(AuthSession.admin_id==admin_id,AuthSession.revoked_at.is_(None)).values(revoked_at=datetime.now(timezone.utc).replace(tzinfo=None)))


def purge_expired(db: Session):
    now=datetime.now(timezone.utc).replace(tzinfo=None)
    db.execute(delete(AuthSession).where(AuthSession.expires_at<=now))


def permissions_for_admin(db: Session, admin_id:int)->set[str]:
    role_statement=select(Permission.name).join(RolePermission,RolePermission.permission_id==Permission.id).join(AdminRole,AdminRole.role_id==RolePermission.role_id).where(AdminRole.admin_id==admin_id)
    direct_statement=select(Permission.name).join(AdminPermission,AdminPermission.permission_id==Permission.id).where(AdminPermission.admin_id==admin_id)
    names=set(db.scalars(role_statement).all())|set(db.scalars(direct_statement).all())
    return expand_permissions(names)|set(ALWAYS_GRANTED)


def is_superadmin(db: Session, admin_id:int)->bool:
    statement=select(Role.id).join(AdminRole,AdminRole.role_id==Role.id).where(AdminRole.admin_id==admin_id,Role.name==SUPERADMIN_ROLE)
    return db.scalar(statement) is not None


def roles_for_admin(db: Session, admin_id:int)->list[str]:
    stmt=select(Role.name).join(AdminRole,AdminRole.role_id==Role.id).where(AdminRole.admin_id==admin_id).order_by(Role.name)
    return list(db.scalars(stmt).all())


def admin_payload(db:Session, admin:Admin)->dict:
    return {"id":admin.id,"username":admin.username,"is_active":admin.is_active,"is_superadmin":is_superadmin(db,admin.id),"roles":roles_for_admin(db,admin.id),"permissions":sorted(permissions_for_admin(db,admin.id)),"last_login_at":admin.last_login_at.isoformat() if admin.last_login_at else None}
