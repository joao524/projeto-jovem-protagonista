from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.identity.models import User
from app.modules.identity.schemas import (
    TokenResponse,
    UserLoginRequest,
    UserProfileResponse,
    UserRegisterRequest,
)
from app.modules.identity.service import IdentityService

router = APIRouter(prefix="/auth", tags=["Autenticação e Identidade"])


@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
async def register_passenger(
    data: UserRegisterRequest, db: AsyncSession = Depends(get_db)
):
    service = IdentityService(db)
    return await service.register_passenger(data)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    service = IdentityService(db)
    return await service.authenticate(data)


@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        document_number=current_user.document_number,
        phone_number=current_user.phone_number,
        is_active=current_user.is_active,
        roles=[r.id for r in current_user.roles],
        created_at=current_user.created_at,
    )
