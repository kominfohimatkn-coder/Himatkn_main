from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.dependencies import require_permission, require_csrf
from app.models import Admin, Document
from app.services.storage import save_document
router=APIRouter(prefix='/admin/documents',tags=['admin'])
@router.get('')
def list_documents(offset:int=0,limit:int=20,db:Session=Depends(get_db),_:Admin=Depends(require_permission('documents.view'))):
 limit=min(max(limit,1),100); rows=db.scalars(select(Document).order_by(Document.created_at.desc()).offset(max(offset,0)).limit(limit)).all(); return {'items':[{'id':x.id,'title':x.title,'category':x.category,'original_filename':x.original_filename,'mime_type':x.mime_type,'size_bytes':x.size_bytes,'created_at':x.created_at} for x in rows], 'offset':max(offset,0),'limit':limit}
@router.post('',status_code=201,dependencies=[Depends(require_csrf)])
async def create_document(title:str=Form(...),category:str|None=Form(None),file:UploadFile=File(...),db:Session=Depends(get_db),admin:Admin=Depends(require_permission('documents.manage'))):
 if len(title.strip())<2 or len(title)>255: raise HTTPException(422,'Judul dokumen tidak valid')
 key,size=await save_document(file); x=Document(uploaded_by=admin.id,title=title.strip(),category=category.strip() if category else None,storage_key=key,original_filename=file.filename or 'document.pdf',mime_type=file.content_type or 'application/pdf',size_bytes=size); db.add(x); db.commit(); db.refresh(x); return {'id':x.id,'title':x.title,'storage_key':x.storage_key,'size_bytes':x.size_bytes}
