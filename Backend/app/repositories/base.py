from __future__ import annotations
from typing import Generic, TypeVar, Type
from sqlalchemy import select
from sqlalchemy.orm import Session
T=TypeVar("T")
class Repository(Generic[T]):
    def __init__(self, model:Type[T]): self.model=model
    def get(self, db:Session, item_id:int): return db.get(self.model,item_id)
    def list(self, db:Session, offset:int=0, limit:int=50): return db.scalars(select(self.model).offset(offset).limit(limit)).all()
    def add(self, db:Session, item:T)->T: db.add(item); db.flush(); return item
