from datetime import datetime
from pydantic import BaseModel, Field
class LoginRequest(BaseModel): username:str=Field(min_length=1,max_length=50); password:str=Field(min_length=1,max_length=255)
class AdminOut(BaseModel): id:int; username:str; is_active:bool; roles:list[str]; permissions:list[str]; last_login_at:datetime|None
class AuthResponse(BaseModel): admin:AdminOut
