from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.security import decode_access_token
from app.database.connection import get_db
from app.database.dependencies import current_admin, require_permission, require_csrf
from app.models import Admin, Notification, NotificationRecipient
from app.schemas.content import NotificationIn
router=APIRouter(prefix='/admin/notifications',tags=['admin'])
@router.get('')
def list_notifications(db:Session=Depends(get_db),admin:Admin=Depends(require_permission('notifications.view'))):
 rows=db.execute(select(Notification,NotificationRecipient.read_at).join(NotificationRecipient,NotificationRecipient.notification_id==Notification.id).where(NotificationRecipient.admin_id==admin.id).order_by(Notification.created_at.desc()).limit(50)).all()
 return {'items':[{'id':n.id,'title':n.title,'message':n.message,'type':n.type,'created_at':n.created_at,'read_at':read_at} for n,read_at in rows]}
@router.post('',status_code=201,dependencies=[Depends(require_csrf)])
def create_notification(p:NotificationIn,db:Session=Depends(get_db),admin:Admin=Depends(require_permission('notifications.manage'))):
 x=Notification(created_by=admin.id,title=p.title.strip(),message=p.message,type=p.type); db.add(x); db.flush()
 recipients=p.recipient_admin_ids or [a.id for a in db.scalars(select(Admin.id).where(Admin.is_active.is_(True))).all()]
 for aid in recipients:
  if db.get(Admin,aid): db.add(NotificationRecipient(notification_id=x.id,admin_id=aid))
 db.commit(); db.refresh(x); return {'id':x.id,'title':x.title}
@router.post('/{notification_id}/read',dependencies=[Depends(require_csrf)])
def mark_read(notification_id:int,db:Session=Depends(get_db),admin:Admin=Depends(require_permission('notifications.view'))):
 row=db.get(NotificationRecipient,{'notification_id':notification_id,'admin_id':admin.id})
 if not row: raise HTTPException(404,'Notifikasi tidak ditemukan')
 row.read_at=datetime.utcnow(); db.commit(); return {'status':'ok'}
