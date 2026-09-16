from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.dependencies import require_permission, require_csrf
from app.models import Admin, SiteSetting
from app.schemas.content import SettingIn
router=APIRouter(prefix='/admin/settings',tags=['admin'])
@router.get('')
def list_settings(db:Session=Depends(get_db),_:Admin=Depends(require_permission('settings.view'))): return {'items':[{'id':x.id,'setting_key':x.setting_key,'setting_value':x.setting_value,'value_type':x.value_type,'updated_by':x.updated_by} for x in db.scalars(select(SiteSetting).order_by(SiteSetting.setting_key)).all()]}
@router.put('/{key}',dependencies=[Depends(require_csrf)])
def update_setting(key:str,p:SettingIn,db:Session=Depends(get_db),admin:Admin=Depends(require_permission('settings.manage'))):
 if len(key)>150 or not key.strip(): raise HTTPException(422,'Setting key tidak valid')
 x=db.scalar(select(SiteSetting).where(SiteSetting.setting_key==key))
 if not x: x=SiteSetting(setting_key=key,setting_value=p.setting_value,value_type=p.value_type,updated_by=admin.id); db.add(x)
 else: x.setting_value=p.setting_value; x.value_type=p.value_type; x.updated_by=admin.id
 db.commit(); db.refresh(x); return {'id':x.id,'setting_key':x.setting_key,'setting_value':x.setting_value,'value_type':x.value_type}
