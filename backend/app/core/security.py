import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
import jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    # Truncate at 72 bytes per bcrypt spec if needed
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


# Alias mantido por compatibilidade (usado pelo seed)
get_password_hash = hash_password


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


def create_access_token(
    subject: str | Any,
    roles: list[str],
    expires_delta: timedelta | None = None,
    email: str | None = None,
    name: str | None = None,
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {
        "sub": str(subject),
        "roles": roles,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    if email:
        to_encode["email"] = email
    if name:
        to_encode["name"] = name

    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def generate_ticket_signature(
    ticket_id: str, trip_id: str, booking_id: str
) -> str:
    """Gera assinatura HMAC-SHA256 para o QR Code do bilhete garantindo integridade contra falsificação."""
    payload = f"{ticket_id}:{trip_id}:{booking_id}".encode("utf-8")
    signature = hmac.new(
        settings.SECRET_BOARDING_KEY.encode("utf-8"),
        payload,
        hashlib.sha256,
    ).hexdigest()
    return signature


def verify_ticket_signature(
    ticket_id: str, trip_id: str, booking_id: str, signature: str
) -> bool:
    expected_signature = generate_ticket_signature(
        ticket_id, trip_id, booking_id
    )
    return hmac.compare_digest(expected_signature, signature)
