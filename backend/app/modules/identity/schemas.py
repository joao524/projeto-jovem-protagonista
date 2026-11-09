from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class RoleResponse(BaseModel):
    id: str
    description: str

    model_config = {"from_attributes": True}


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=3, max_length=255)
    document_number: str | None = Field(default=None, max_length=32)
    phone_number: str | None = Field(default=None, max_length=32)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: UUID
    email: str
    roles: list[str]


class UserProfileResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    document_number: str | None = None
    phone_number: str | None = None
    is_active: bool
    roles: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}
