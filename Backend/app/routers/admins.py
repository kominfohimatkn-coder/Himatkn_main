from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.database.connection import get_db
from app.database.dependencies import current_admin, require_permission, require_csrf
from app.models import Admin, AdminRole, Role
from app.schemas.admin import AdminCreate, AdminUpdate
from app.services.auth import admin_payload, revoke_admin_sessions
router=APIRouter(prefix='/admin/admins',tags=['admin'])
@router.get('',dependencies=[Depends(current_admin)])
def list_admins(db:Session=Depends(get_db),_:Admin=Depends(require_permission('admins.view'))): return {'items':[admin_payload(db,x) for x in db.scalars(select(Admin).order_by(Admin.username)).all()]}
@router.get('/roles',dependencies=[Depends(current_admin)])
def roles(db:Session=Depends(get_db),_:Admin=Depends(require_permission('roles.manage'))): return {'items':[{'id':r.id,'name':r.name,'description':r.description} for r in db.scalars(select(Role).order_by(Role.name)).all()]}
@router.post('',status_code=201,dependencies=[Depends(require_csrf)])
def create_admin(payload:AdminCreate,db:Session=Depends(get_db),actor:Admin=Depends(require_permission('admins.manage'))):
 if db.scalar(select(Admin).where(func.lower(Admin.username)==payload.username.strip().lower())): raise HTTPException(409,'Username administrator sudah digunakan')
 role=db.scalar(select(Role).where(Role.name==payload.role.strip().lower()))
 if not role: raise HTTPException(400,'Role administrator tidak valid')
 item=Admin(username=payload.username.strip(),password_hash=hash_password(payload.password)); db.add(item); db.flush(); db.add(AdminRole(admin_id=item.id,role_id=role.id)); db.commit(); db.refresh(item); return admin_payload(db,item)
@router.put('/{admin_id}',dependencies=[Depends(require_csrf)])
def update_admin(admin_id:int,payload:AdminUpdate,db:Session=Depends(get_db),actor:Admin=Depends(require_permission('admins.manage'))):
 item=db.get(Admin,admin_id)
 if not item: raise HTTPException(404,'Administrator tidak ditemukan')
 if payload.username is not None:
  if db.scalar(select(Admin).where(func.lower(Admin.username)==payload.username.strip().lower(),Admin.id!=admin_id)): raise HTTPException(409,'Username administrator sudah digunakan')
  item.username=payload.username.strip()
 if payload.password: item.password_hash=hash_password(payload.password)
 if payload.is_active is not None: item.is_active=payload.is_active
 if payload.role is not None:
  role=db.scalar(select(Role).where(Role.name==payload.role.strip().lower()))
  if not role: raise HTTPException(400,'Role administrator tidak valid')
  db.query(AdminRole).filter(AdminRole.admin_id==admin_id).delete(); db.add(AdminRole(admin_id=admin_id,role_id=role.id))
 if payload.password is not None or payload.role is not None or payload.is_active is False: revoke_admin_sessions(db,admin_id)
 db.commit(); db.refresh(item); return admin_payload(db,item)
@router.delete('/{admin_id}',status_code=204,dependencies=[Depends(require_csrf)])
def delete_admin(admin_id:int,db:Session=Depends(get_db),actor:Admin=Depends(require_permission('admins.manage'))):
 if admin_id==actor.id: raise HTTPException(400,'Anda tidak dapat menghapus akun sendiri')
 item=db.get(Admin,admin_id)
 if not item: raise HTTPException(404,'Administrator tidak ditemukan')
 db.delete(item); db.commit()
