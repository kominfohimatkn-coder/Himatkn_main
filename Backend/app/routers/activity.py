from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, func, or_, select
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.dependencies import require_permission
from app.models import ActivityLog, Admin, VisitorLog
router=APIRouter(prefix='/admin',tags=['admin'])

ACTIVITY_KINDS = ("create", "update", "delete", "auth")

# Jenis aksi untuk filter dan badge di halaman Log Aktivitas, diturunkan dari
# nama aksi (`news.create`, `division.copy`, `auth.login.failure`, ...).
# Semua yang bukan login/tambah/hapus dihitung sebagai "ubah".
KIND = case(
    (ActivityLog.action.like("auth.%"), "auth"),
    (
        or_(
            ActivityLog.action.like("%.create"),
            ActivityLog.action.like("%.copy"),
        ),
        "create",
    ),
    (ActivityLog.action.like("%.delete"), "delete"),
    else_="update",
)


def activity_kind(action: str) -> str:
    """Versi Python dari `KIND` (harus selalu sama)."""

    if action.startswith("auth."):
        return "auth"
    if action.endswith((".create", ".copy")):
        return "create"
    if action.endswith(".delete"):
        return "delete"
    return "update"


def _escape_like(term: str) -> str:
    return (
        term.replace("\\", "\\\\")
        .replace("%", "\\%")
        .replace("_", "\\_")
    )


def _activity_filters(q: str | None, admin_id: int | None) -> list:
    filters = []
    term = (q or "").strip()

    if term:
        filters.append(
            ActivityLog.description.ilike(
                f"%{_escape_like(term)}%",
                escape="\\",
            )
        )

    if admin_id is not None:
        filters.append(ActivityLog.admin_id == admin_id)

    return filters


@router.get('/activity-logs')
def activity(
    offset: int = 0,
    limit: int = 50,
    q: str | None = Query(default=None, max_length=100),
    kind: str | None = Query(default=None, pattern="^(create|update|delete|auth)$"),
    admin_id: int | None = Query(default=None, ge=1),
    db: Session = Depends(get_db),
    _: Admin = Depends(require_permission('activity_logs.view')),
):
    limit = min(max(limit, 1), 200)
    offset = max(offset, 0)
    filters = _activity_filters(q, admin_id)
    listed = [*filters, KIND == kind] if kind else filters

    rows = db.execute(
        select(ActivityLog, Admin.username)
        .outerjoin(Admin, Admin.id == ActivityLog.admin_id)
        .where(*listed)
        .order_by(ActivityLog.created_at.desc(), ActivityLog.id.desc())
        .offset(offset)
        .limit(limit)
    ).all()

    total = db.scalar(
        select(func.count()).select_from(ActivityLog).where(*listed)
    ) or 0

    # Jumlah per jenis dengan filter cari/admin yang sama (tanpa filter jenis),
    # untuk angka di tombol Semua/Tambah/Ubah/Hapus/Login. Dikelompokkan per
    # nama aksi (jumlahnya sedikit) lalu dipetakan di Python.
    counts = {name: 0 for name in ACTIVITY_KINDS}
    for action, count in db.execute(
        select(ActivityLog.action, func.count())
        .where(*filters)
        .group_by(ActivityLog.action)
    ).all():
        counts[activity_kind(action)] += count

    return {
        'items': [
            {
                'id': x.id,
                'admin_id': x.admin_id,
                'admin_username': username,
                'action': x.action,
                'kind': activity_kind(x.action),
                'entity_type': x.entity_type,
                'entity_id': x.entity_id,
                'description': x.description,
                'ip_address': x.ip_address,
                'user_agent': x.user_agent,
                'created_at': x.created_at,
            }
            for x, username in rows
        ],
        'offset': offset,
        'limit': limit,
        'total': total,
        'counts': {'all': sum(counts.values()), **counts},
    }


@router.get('/activity-logs/admins')
def activity_admins(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_permission('activity_logs.view')),
):
    """Administrator yang punya catatan, untuk pilihan filter "Semua admin"."""

    rows = db.execute(
        select(Admin.id, Admin.username)
        .where(
            select(ActivityLog.id)
            .where(ActivityLog.admin_id == Admin.id)
            .exists()
        )
        .order_by(Admin.username)
    ).all()

    return {'items': [{'id': id_, 'username': username} for id_, username in rows]}


@router.get('/visitor-logs')
def visitors(offset:int=0,limit:int=100,db:Session=Depends(get_db),_:Admin=Depends(require_permission('visitor_logs.view'))):
 limit=min(max(limit,1),500); rows=db.scalars(select(VisitorLog).order_by(VisitorLog.visited_at.desc()).offset(max(offset,0)).limit(limit)).all(); return {'items':[{'id':x.id,'page':x.page,'visitor_hash':x.visitor_hash,'user_agent':x.user_agent,'visited_at':x.visited_at} for x in rows], 'offset':max(offset,0),'limit':limit}