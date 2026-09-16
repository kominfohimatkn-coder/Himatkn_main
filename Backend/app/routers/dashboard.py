from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.dependencies import require_permission
from app.models import Admin, Agenda, Member, News, Program, VisitorLog
router=APIRouter(prefix='/admin/dashboard',tags=['admin'])
@router.get('')
def dashboard(db:Session=Depends(get_db),_:Admin=Depends(require_permission('dashboard.view'))):
 return {'news_total':db.scalar(select(func.count()).select_from(News)) or 0,'programs_total':db.scalar(select(func.count()).select_from(Program)) or 0,'members_total':db.scalar(select(func.count()).select_from(Member)) or 0,'agendas_total':db.scalar(select(func.count()).select_from(Agenda)) or 0,'visitors_total':db.scalar(select(func.count()).select_from(VisitorLog)) or 0}
