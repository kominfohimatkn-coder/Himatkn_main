from pydantic import BaseModel, Field
class AdminCreate(BaseModel): username:str=Field(min_length=3,max_length=50); password:str=Field(min_length=12,max_length=128); role:str=Field(min_length=1,max_length=50)
class AdminUpdate(BaseModel): username:str|None=Field(default=None,min_length=3,max_length=50); password:str|None=Field(default=None,min_length=12,max_length=128); is_active:bool|None=None; role:str|None=Field(default=None,max_length=50)
