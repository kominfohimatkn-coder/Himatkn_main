from datetime import datetime
from pydantic import BaseModel, Field, model_validator
class LoginRequest(BaseModel): username:str=Field(min_length=1,max_length=50); password:str=Field(min_length=1,max_length=255)
class AdminOut(BaseModel): id:int; username:str; is_active:bool; is_superadmin:bool; roles:list[str]; permissions:list[str]; last_login_at:datetime|None
class AuthResponse(BaseModel): admin:AdminOut


class ChangePasswordIn(BaseModel):
    current_password: str = Field(min_length=1, max_length=255)
    new_password: str = Field(min_length=12, max_length=128)

    @model_validator(mode="after")
    def validate_new_password(self):
        if self.new_password == self.current_password:
            raise ValueError(
                "Kata sandi baru tidak boleh sama dengan kata sandi lama"
            )
        return self
