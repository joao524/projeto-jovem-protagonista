from collections.abc import Callable
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.database import get_db
from app.modules.identity.models import User
from app.shared.enums import RoleType

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")
# Variante que não falha quando o token está ausente (rotas abertas a visitantes)
oauth2_scheme_optional = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/login", auto_error=False
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível autenticar o token fornecido.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = UUID(user_id_str)
    except (jwt.PyJWTError, ValueError):
        raise credentials_exception

    user = None
    try:
        stmt = select(User).options(selectinload(User.roles)).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
    except Exception:
        user = None

    if user is None:
        if not settings.is_production:
            from app.modules.identity.models import Role
            roles = payload.get("roles", [])
            user = User(
                id=user_id,
                email=payload.get("email", "usuario@ttnb.ba.gov.br"),
                full_name=payload.get("name", "Usuário do Sistema"),
                document_number=payload.get("doc", "000.000.000-00"),
                is_active=True,
                roles=[Role(id=r, description=r) for r in roles],
            )
        else:
            raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário desativado.",
        )
    return user


async def get_optional_user(
    token: str | None = Depends(oauth2_scheme_optional),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Retorna o usuário autenticado ou None (visitante).

    Um token presente porém inválido/expirado gera 401, para não mascarar
    sessões vencidas como se fossem visitantes.
    """
    if not token:
        return None
    return await get_current_user(token=token, db=db)


def require_roles(*allowed_roles: RoleType) -> Callable:
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role_ids = {r.id for r in current_user.roles}
        required_role_ids = {r.value for r in allowed_roles}
        
        # Administrador sempre tem bypass de permissão hierárquica
        if RoleType.ADMINISTRATOR.value in user_role_ids:
            return current_user

        if not user_role_ids.intersection(required_role_ids):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acesso negado. Requer um dos seguintes papéis: {[r.value for r in allowed_roles]}",
            )
        return current_user

    return role_checker


# ---------------------------------------------------------------------------
# Atalhos de autorização reutilizados pelos routers
# ---------------------------------------------------------------------------
STAFF_ROLES = (RoleType.OPERATOR, RoleType.SUPERVISOR)

# Operador de guichê/catraca, supervisor ou administrador
require_staff = require_roles(*STAFF_ROLES)
# Supervisor ou administrador (decisões sensíveis: suspensões, aprovação de reembolso)
require_supervisor = require_roles(RoleType.SUPERVISOR)


def user_is_staff(user: User) -> bool:
    role_ids = {r.id for r in user.roles}
    staff_ids = {r.value for r in STAFF_ROLES} | {RoleType.ADMINISTRATOR.value}
    return bool(role_ids & staff_ids)


def ensure_owner_or_staff(user: User, owner_email: str | None) -> None:
    """Garante que o usuário é o dono do recurso (pelo e-mail) ou da equipe."""
    if user_is_staff(user):
        return
    if not owner_email or owner_email.lower() != (user.email or "").lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado: este recurso pertence a outro passageiro.",
        )
