from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel, Field
PROGRAM_STATUSES: tuple[str, ...] = ("planned", "ongoing", "completed", "cancelled")
ProgramStatus = Literal["planned", "ongoing", "completed", "cancelled"]
class ProgramIn(BaseModel): period_id:int; division_id:int|None=None; name:str=Field(min_length=2,max_length=255); slug:str=Field(min_length=2,max_length=255); description:str|None=None; status:ProgramStatus=Field(default="planned"); start_date:date|None=None; end_date:date|None=None
class AgendaIn(BaseModel): title:str=Field(min_length=2,max_length=255); description:str|None=None; start_at:datetime; end_at:datetime|None=None; location:str|None=None
class SettingIn(BaseModel): setting_value:str|None=None; value_type:str=Field(default="string",max_length=30)
class SettingsPatchIn(BaseModel): values:dict[str,str]
class NotificationIn(BaseModel): title:str=Field(min_length=2,max_length=255); message:str=Field(min_length=1); type:str=Field(default="info",max_length=50); recipient_admin_ids:list[int]=[]
