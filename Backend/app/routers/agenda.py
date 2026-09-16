from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.dependencies import require_permission, require_csrf
from app.models import Admin, Agenda
from app.schemas.content import AgendaIn
router=APIRouter(prefix='/admin/agendas',tags=['admin'])
def item(x): return {'id':x.id,'created_by':x.created_by,'title':x.title,'description':x.description,'start_at':x.start_at,'end_at':x.end_at,'location':x.location,'created_at':x.created_at,'updated_at':x.updated_at}
@router.get('')
def list_agendas(db:Session=Depends(get_db),_:Admin=Depends(require_permission('agendas.view'))): return {'items':[item(x) for x in db.scalars(select(Agenda).order_by(Agenda.start_at)).all()]}
@router.post('',status_code=201,dependencies=[Depends(require_csrf)])
def create_agenda(p:AgendaIn,db:Session=Depends(get_db),admin:Admin=Depends(require_permission('agendas.manage'))):
 if p.end_at and p.end_at<p.start_at: raise HTTPException(400,'end_at tidak boleh sebelum start_at')
 x=Agenda(**p.model_dump(),created_by=admin.id); db.add(x); db.commit(); db.refresh(x); return item(x)
@router.put('/{agenda_id}',dependencies=[Depends(require_csrf)])
def update_agenda(agenda_id:int,p:AgendaIn,db:Session=Depends(get_db),_:Admin=Depends(require_permission('agendas.manage'))):
 x=db.get(Agenda,agenda_id)
 if not x: raise HTTPException(404,'Agenda tidak ditemukan')
 for k,v in p.model_dump().items(): setattr(x,k,v)
 db.commit(); db.refresh(x); return item(x)
@router.delete('/{agenda_id}',status_code=204,dependencies=[Depends(require_csrf)])
def delete_agenda(agenda_id:int,db:Session=Depends(get_db),_:Admin=Depends(require_permission('agendas.manage'))):
 x=db.get(Agenda,agenda_id)
 if not x: raise HTTPException(404,'Agenda tidak ditemukan')
 db.delete(x); db.commit()
