from pydantic import BaseModel, Field, model_validator


class AdminCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=12, max_length=128)
    is_superadmin: bool = False
    permissions: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def _validate_superadmin_permissions(self):
        if self.is_superadmin and self.permissions:
            raise ValueError(
                "Akun superadmin tidak boleh memiliki izin langsung; "
                "superadmin otomatis memiliki semua izin."
            )
        return self


class AdminUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=3, max_length=50)
    password: str | None = Field(default=None, min_length=12, max_length=128)
    is_active: bool | None = None
    is_superadmin: bool | None = None
    permissions: list[str] | None = None

    @model_validator(mode="after")
    def _validate_superadmin_permissions(self):
        if self.is_superadmin is True and self.permissions:
            raise ValueError(
                "Akun superadmin tidak boleh memiliki izin langsung; "
                "superadmin otomatis memiliki semua izin."
            )
        return self
