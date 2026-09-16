from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.dependencies import require_permission, require_csrf
from app.models import Admin, Division, Member, Period, Position
from app.schemas.organization import PeriodIn, DivisionIn, PositionIn, MemberIn
router=APIRouter(prefix='/admin/organization',tags=['admin'])
@router.get('/periods')
def periods(db:Session=Depends(get_db),_:Admin=Depends(require_permission('organization.view'))): return {'items':[x.__dict__ | {} for x in db.scalars(select(Period).order_by(Period.start_date.desc())).all()]}
@router.post('/periods',status_code=201,dependencies=[Depends(require_csrf)])
def create_period(p:PeriodIn,db:Session=Depends(get_db),_:Admin=Depends(require_permission('organization.manage'))):
 if db.scalar(select(Period).where(func.lower(Period.name)==p.name.lower())): raise HTTPException(409,'Periode sudah ada')
 if p.start_date and p.end_date and p.end_date<p.start_date: raise HTTPException(400,'end_date tidak boleh sebelum start_date')
 x=Period(**p.model_dump()); db.add(x); db.commit(); db.refresh(x); return {'id':x.id,'name':x.name,'start_date':x.start_date,'end_date':x.end_date,'is_active':x.is_active}
@router.get('/divisions')
def divisions(period_id:int|None=None,db:Session=Depends(get_db),_:Admin=Depends(require_permission('organization.view'))):
 q=select(Division).order_by(Division.period_id,Division.sort_order,Division.name)
 if period_id: q=q.where(Division.period_id==period_id)
 return {'items':[{'id':x.id,'period_id':x.period_id,'name':x.name,'description':x.description,'sort_order':x.sort_order} for x in db.scalars(q).all()]}
@router.get('/positions')
def positions(db:Session=Depends(get_db),_:Admin=Depends(require_permission('organization.view'))): return {'items':[{'id':x.id,'name':x.name,'description':x.description,'sort_order':x.sort_order} for x in db.scalars(select(Position).order_by(Position.sort_order,Position.name)).all()]}
@router.get('/members')
def members(period_id:int|None=None,db:Session=Depends(get_db),_:Admin=Depends(require_permission('organization.view'))):
 q=select(Member).order_by(Member.sort_order,Member.name)
 if period_id: q=q.where(Member.period_id==period_id)
 return {'items':[{'id':x.id,'period_id':x.period_id,'division_id':x.division_id,'position_id':x.position_id,'name':x.name,'photo_url':x.photo_url,'sort_order':x.sort_order} for x in db.scalars(q).all()]}
@router.post('/members',status_code=201,dependencies=[Depends(require_csrf)])
def create_member(p:MemberIn,db:Session=Depends(get_db),_:Admin=Depends(require_permission('organization.manage'))):
 if not db.get(Period,p.period_id): raise HTTPException(400,'Periode tidak ditemukan')
 if not db.get(Position,p.position_id): raise HTTPException(400,'Posisi tidak ditemukan')
 if p.division_id and not db.get(Division,p.division_id): raise HTTPException(400,'Divisi tidak ditemukan')
 x=Member(**p.model_dump()); db.add(x); db.commit(); db.refresh(x); return {'id':x.id,**p.model_dump()}
@router.put('/members/{member_id}',dependencies=[Depends(require_csrf)])
def update_member(member_id:int,p:MemberIn,db:Session=Depends(get_db),_:Admin=Depends(require_permission('organization.manage'))):
 x=db.get(Member,member_id)
 if not x: raise HTTPException(404,'Anggota tidak ditemukan')
 for k,v in p.model_dump().items(): setattr(x,k,v)
 db.commit(); db.refresh(x); return {'id':x.id,**p.model_dump()}
@router.delete('/members/{member_id}',status_code=204,dependencies=[Depends(require_csrf)])
def delete_member(member_id:int,db:Session=Depends(get_db),_:Admin=Depends(require_permission('organization.manage'))):
 x=db.get(Member,member_id)
 if not x: raise HTTPException(404,'Anggota tidak ditemukan')
 db.delete(x); db.commit()
