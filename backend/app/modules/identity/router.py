import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import create_access_token
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
    "/demo-token", response_model=TokenResponse, status_code=status.HTTP_200_OK
)
async def generate_demo_token(role: str = Query("OPERATOR")):
    """Gera token oficial JWT assinado para demonstração em 1 clique (somente dev/test)."""
    if settings.is_production:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tokens de demonstração desabilitados em produção.",
        )

    role_upper = role.upper()
    role_map = {
        "ADMIN": ("ADMINISTRATOR", "admin@ttnb.ba.gov.br", "Administrador TTNB"),
        "ADMINISTRATOR": ("ADMINISTRATOR", "admin@ttnb.ba.gov.br", "Administrador TTNB"),
        "SUPERVISOR": ("SUPERVISOR", "supervisor@ttnb.ba.gov.br", "Supervisor Operacional"),
        "OPERATOR": ("OPERATOR", "operador@ttnb.ba.gov.br", "Marcos Fiscal de Cais"),
        "PASSENGER": ("PASSENGER", "ana.costa@email.com", "Ana Costa"),
    }
    role_id, email, name = role_map.get(
        role_upper, ("OPERATOR", "operador@ttnb.ba.gov.br", "Operador TTNB")
    )
    uid = uuid.uuid5(uuid.NAMESPACE_DNS, email)
    roles_list = [role_id]
    access_token = create_access_token(
        subject=uid, roles=roles_list, email=email, name=name
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=uid,
        email=email,
        roles=roles_list,
    )


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


from pydantic import BaseModel, Field

USER_CONFIGS_STORE = {}


class UserConfigUpdateRequest(BaseModel):
    settings: dict


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


@router.get("/me/config")
async def get_user_config(current_user: User = Depends(get_current_user)):
    """Retorna as configurações personalizadas de acordo com o papel do usuário."""
    user_id_str = str(current_user.id)
    roles = [r.id for r in current_user.roles]
    primary_role = roles[0] if roles else "PASSENGER"

    # Configurações padrão específicas para cada definição de usuário
    default_settings_by_role = {
        "PASSENGER": {
            "default_plate": "BRA2E19",
            "notify_weather_email": True,
            "notify_weather_whatsapp": True,
            "receipt_format": "DIGITAL_QR",
            "favorite_route": "Salvador ➔ Mar Grande",
            "auto_checkin": True,
        },
        "OPERATOR": {
            "workstation_id": "Guichê 02 - Terminal Náutico Comércio",
            "badge_number": "OP-7701",
            "scanner_mode": "CONTINUOUS_CAMERA",
            "audio_feedback": True,
            "auto_print_voucher": True,
            "cashier_max_limit": 5000.00,
        },
        "SUPERVISOR": {
            "auto_suspend_wind_threshold_knots": 28,
            "auto_refund_on_cancellation": True,
            "audit_logging_level": "EXTENDED",
            "financial_closing_alert": "18:30",
            "emergency_broadcast_active": False,
        },
        "ADMINISTRATOR": {
            "auto_suspend_wind_threshold_knots": 28,
            "auto_refund_on_cancellation": True,
            "audit_logging_level": "EXTENDED",
            "financial_closing_alert": "18:30",
            "emergency_broadcast_active": False,
            "allow_operator_manual_override": True,
        },
    }

    base_defaults = default_settings_by_role.get(
        primary_role, default_settings_by_role["PASSENGER"]
    )
    saved = USER_CONFIGS_STORE.get(user_id_str, {})
    merged = {**base_defaults, **saved}

    return {
        "user_id": user_id_str,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "primary_role": primary_role,
        "roles": roles,
        "settings": merged,
    }


@router.patch("/me/config")
async def update_user_config(
    payload: UserConfigUpdateRequest,
    current_user: User = Depends(get_current_user),
):
    """Atualiza preferências e parâmetros operacionais do usuário ativo."""
    user_id_str = str(current_user.id)
    current = USER_CONFIGS_STORE.get(user_id_str, {})
    current.update(payload.settings)
    USER_CONFIGS_STORE[user_id_str] = current
    return await get_user_config(current_user)
