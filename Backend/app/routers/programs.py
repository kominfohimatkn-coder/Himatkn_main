from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.dependencies import require_permission, require_csrf
from app.models import Admin, Program, Period
from app.schemas.content import ProgramIn
from app.services.audit import log_activity
from app.utils.ip import get_client_ip
router=APIRouter(prefix='/admin/programs',tags=['admin'])
def audit(db:Session,request:Request,admin:Admin,action:str,program_id:int|None,description:str):
 log_activity(db,admin.id,action,'program',program_id,description,ip_address=get_client_ip(request),user_agent=request.headers.get('user-agent','')[:500])
def item(x): return {'id':x.id,'period_id':x.period_id,'division_id':x.division_id,'created_by':x.created_by,'name':x.name,'slug':x.slug,'description':x.description,'status':x.status,'start_date':x.start_date,'end_date':x.end_date,'created_at':x.created_at,'updated_at':x.updated_at}
@router.get('')
def list_programs(offset:int=0,limit:int=20,db:Session=Depends(get_db),_:Admin=Depends(require_permission('programs.view'))):
 limit=min(max(limit,1),100); rows=db.scalars(select(Program).order_by(Program.created_at.desc()).offset(max(offset,0)).limit(limit)).all(); return {'items':[item(x) for x in rows],'offset':max(offset,0),'limit':limit}
@router.post('',status_code=201,dependencies=[Depends(require_csrf)])
def create_program(p:ProgramIn,request:Request,db:Session=Depends(get_db),admin:Admin=Depends(require_permission('programs.manage'))):
 if not db.get(Period,p.period_id): raise HTTPException(400,'Periode tidak ditemukan')
 if db.scalar(select(Program).where(Program.slug==p.slug)): raise HTTPException(409,'Slug sudah digunakan')
 x=Program(**p.model_dump(),created_by=admin.id); db.add(x); db.flush()
 audit(db,request,admin,'program.create',x.id,f'Membuat program kerja {x.name}')
 db.commit(); db.refresh(x); return item(x)
@router.put('/{program_id}',dependencies=[Depends(require_csrf)])
def update_program(program_id:int,p:ProgramIn,request:Request,db:Session=Depends(get_db),admin:Admin=Depends(require_permission('programs.manage'))):
 x=db.get(Program,program_id)
 if not x: raise HTTPException(404,'Program kerja tidak ditemukan')
 for k,v in p.model_dump().items(): setattr(x,k,v)
 audit(db,request,admin,'program.update',x.id,f'Memperbarui program kerja {x.name}')
 db.commit(); db.refresh(x); return item(x)
@router.delete('/{program_id}',status_code=204,dependencies=[Depends(require_csrf)])
def delete_program(program_id:int,request:Request,db:Session=Depends(get_db),admin:Admin=Depends(require_permission('programs.manage'))):
 x=db.get(Program,program_id)
 if not x: raise HTTPException(404,'Program kerja tidak ditemukan')
 audit(db,request,admin,'program.delete',x.id,f'Menghapus program kerja {x.name}')
 db.delete(x); db.commit()