from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.dependencies import require_permission
from app.models import ActivityLog, Admin, VisitorLog
router=APIRouter(prefix='/admin',tags=['admin'])
@router.get('/activity-logs')
def activity(offset:int=0,limit:int=50,db:Session=Depends(get_db),_:Admin=Depends(require_permission('activity_logs.view'))):
 limit=min(max(limit,1),200); rows=db.scalars(select(ActivityLog).order_by(ActivityLog.created_at.desc()).offset(max(offset,0)).limit(limit)).all(); return {'items':[{'id':x.id,'admin_id':x.admin_id,'action':x.action,'entity_type':x.entity_type,'entity_id':x.entity_id,'description':x.description,'ip_address':x.ip_address,'user_agent':x.user_agent,'created_at':x.created_at} for x in rows], 'offset':max(offset,0),'limit':limit}
@router.get('/visitor-logs')
def visitors(offset:int=0,limit:int=100,db:Session=Depends(get_db),_:Admin=Depends(require_permission('visitor_logs.view'))):
 limit=min(max(limit,1),500); rows=db.scalars(select(VisitorLog).order_by(VisitorLog.visited_at.desc()).offset(max(offset,0)).limit(limit)).all(); return {'items':[{'id':x.id,'page':x.page,'visitor_hash':x.visitor_hash,'user_agent':x.user_agent,'visited_at':x.visited_at} for x in rows], 'offset':max(offset,0),'limit':limit}
