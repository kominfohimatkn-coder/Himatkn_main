from datetime import date
from pydantic import BaseModel, Field
class PeriodIn(BaseModel): name:str=Field(min_length=2,max_length=50); start_date:date|None=None; end_date:date|None=None; is_active:bool=False
class DivisionIn(BaseModel): period_id:int; name:str=Field(min_length=2,max_length=100); description:str|None=None; sort_order:int=0
class PositionIn(BaseModel): name:str=Field(min_length=2,max_length=100); description:str|None=None; sort_order:int=0
class MemberIn(BaseModel): period_id:int; division_id:int|None=None; position_id:int; name:str=Field(min_length=2,max_length=150); photo_url:str|None=None; sort_order:int=0
