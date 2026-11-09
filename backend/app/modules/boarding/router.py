from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.core.security import verify_ticket_signature
from app.modules.bookings.router import TICKETS_STORE

router = APIRouter(prefix="/boarding", tags=["Embarque"])

BOARDING_LOGS = []


class ValidateBoardingRequest(BaseModel):
    identifier: str  # Pode ser o QR Code (payload com assinatura) ou o código digitado manual (TTNB-XXXXXX)
    validator_name: str = "Operador Terminal"
    method: str = "QR_SCAN"  # 'QR_SCAN' ou 'MANUAL_CODE'


@router.post("/validate")
async def validate_ticket_boarding(data: ValidateBoardingRequest):
    identifier = data.identifier.strip()
    ticket = None

    # Tenta resolver por payload do QR Code (formato ticket_id:code:signature)
    if ":" in identifier:
        parts = identifier.split(":")
        if len(parts) >= 3:
            t_id, t_code, sig = parts[0], parts[1], parts[2]
            ticket = TICKETS_STORE.get(t_id)
            if ticket:
                # Verifica integridade da assinatura
                is_valid = verify_ticket_signature(
                    ticket["id"], ticket["trip_id"], ticket["booking_id"], sig
                )
                if not is_valid:
                    return {
                        "result": "DENIED",
                        "reason": (
                            "ASSINATURA_INVALIDA: Bilhete adulterado ou não"
                            " autêntico."
                        ),
                    }
    else:
        # Busca direta por ticket_id ou ticket_code
        ticket = TICKETS_STORE.get(identifier)

    if not ticket:
        return {
            "result": "DENIED",
            "reason": (
                "BILHETE_NAO_ENCONTRADO: O código informado não existe no"
                " sistema."
            ),
        }

    # Verifica se já foi utilizado (anti-duplicidade)
    if ticket["status"] == "USED":
        return {
            "result": "DENIED",
            "reason": "BILHETE_JA_UTILIZADO: Este bilhete já realizou embarque!",
            "passenger_name": ticket["passenger_name"],
            "ticket_code": ticket["ticket_code"],
            "first_boarded_at": ticket.get("boarded_at"),
        }

    if ticket["status"] != "VALID":
        return {
            "result": "DENIED",
            "reason": (
                f"BILHETE_INVALIDO: Status atual do bilhete é {ticket['status']}"
            ),
        }

    # Marca como utilizado atomicamente
    now_str = datetime.now(timezone.utc).isoformat()
    ticket["status"] = "USED"
    ticket["boarded_at"] = now_str
    ticket["boarded_by"] = data.validator_name

    log_entry = {
        "ticket_code": ticket["ticket_code"],
        "passenger_name": ticket["passenger_name"],
        "boarded_at": now_str,
        "validator": data.validator_name,
        "method": data.method,
    }
    BOARDING_LOGS.append(log_entry)

    return {
        "result": "ALLOWED",
        "message": "Embarque autorizado com sucesso!",
        "passenger_name": ticket["passenger_name"],
        "document_number": ticket["document_number"],
        "ticket_code": ticket["ticket_code"],
        "origin": ticket["origin"],
        "destination": ticket["destination"],
        "departure_time": ticket["departure_time"],
        "operator": ticket["operator"],
        "boarded_at": now_str,
    }


@router.get("/recent-logs")
async def get_recent_boarding_logs():
    return list(reversed(BOARDING_LOGS[-50:]))
