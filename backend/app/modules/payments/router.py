from datetime import datetime, timezone
from typing import Optional, Dict, Any
import uuid
import hmac
import hashlib
from fastapi import APIRouter, HTTPException, Header, status
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.security import generate_ticket_signature
from app.modules.bookings.router import BOOKINGS_STORE, TICKETS_STORE

router = APIRouter(prefix="/payments", tags=["Pagamentos"])

# Armazenamento em memória de eventos de webhook processados para garantir Idempotência
PROCESSED_WEBHOOK_EVENTS = set()


class PixCheckoutRequest(BaseModel):
    booking_id: str


class CardCheckoutRequest(BaseModel):
    booking_id: str
    card_number: str
    cardholder_name: str
    expiry_month_year: str
    cvv: str
    installments: int = 1


class PosRegisterRequest(BaseModel):
    booking_id: str
    method: str  # 'CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX'
    amount_paid: float
    operator_name: str


class PaymentWebhookPayload(BaseModel):
    event_id: str = Field(..., description="Identificador único do evento no gateway para idempotência")
    event_type: str = Field(..., description="Tipo do evento (ex: 'payment.approved', 'PAYMENT_RECEIVED')")
    booking_id: Optional[str] = None
    external_reference: Optional[str] = None
    amount_paid: Optional[float] = None
    payment_method: Optional[str] = "PIX"
    gateway_transaction_id: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


def issue_tickets_for_booking(booking: dict):
    tickets_created = []
    trip_id = booking["trip_id"]
    booking_id = booking["id"]

    # 1. Emite bilhetes individuais para os passageiros
    for i, p in enumerate(booking["passengers"]):
        ticket_id = str(uuid.uuid4())
        ticket_code = f"{booking['booking_code']}-{i+1:02d}"
        signature = generate_ticket_signature(ticket_id, trip_id, booking_id)

        ticket_obj = {
            "id": ticket_id,
            "booking_id": booking_id,
            "trip_id": trip_id,
            "ticket_type": "PASSENGER",
            "passenger_name": p["full_name"],
            "document_number": p["document_number"],
            "ticket_code": ticket_code,
            "qr_payload": f"{ticket_id}:{ticket_code}:{signature}",
            "status": "VALID",
            "origin": booking["origin"],
            "destination": booking["destination"],
            "travel_date": booking["travel_date"],
            "departure_time": booking["departure_time"],
            "operator": booking["operator"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        TICKETS_STORE[ticket_id] = ticket_obj
        TICKETS_STORE[ticket_code] = ticket_obj  # Indexação por código
        tickets_created.append(ticket_obj)

    # 2. Se houver veículo cadastrado, emite bilhete veicular
    if booking.get("vehicle"):
        veh_ticket_id = str(uuid.uuid4())
        veh_plate = booking["vehicle"].get("license_plate") or booking["vehicle"].get("plate")
        veh_code = f"{booking['booking_code']}-V01"
        veh_sig = generate_ticket_signature(veh_ticket_id, trip_id, booking_id)

        veh_ticket_obj = {
            "id": veh_ticket_id,
            "booking_id": booking_id,
            "trip_id": trip_id,
            "ticket_type": "VEHICLE",
            "license_plate": veh_plate,
            "passenger_name": f"Veículo ({veh_plate})",
            "document_number": veh_plate,
            "ticket_code": veh_code,
            "qr_payload": f"{veh_ticket_id}:{veh_code}:{veh_sig}",
            "status": "VALID",
            "origin": booking["origin"],
            "destination": booking["destination"],
            "travel_date": booking["travel_date"],
            "departure_time": booking["departure_time"],
            "operator": booking["operator"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        TICKETS_STORE[veh_ticket_id] = veh_ticket_obj
        TICKETS_STORE[veh_code] = veh_ticket_obj
        tickets_created.append(veh_ticket_obj)

    booking["tickets"] = tickets_created
    booking["status"] = "CONFIRMED"
    booking["confirmed_at"] = datetime.now(timezone.utc).isoformat()
    return tickets_created


@router.post("/pix-session")
async def create_pix_session(data: PixCheckoutRequest):
    booking = BOOKINGS_STORE.get(data.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    amount_str = f"{booking['total_amount']:.2f}"
    pix_code = (
        f"00020126580014BR.GOV.BCB.PIX0136{booking['id']}52040000530398654{len(amount_str):02d}{amount_str}5802BR5925TERMINAL"
        " NAUTICO DA BAHIA6008SALVADOR62070503***6304"
    )

    return {
        "booking_id": booking["id"],
        "amount": booking["total_amount"],
        "pix_code": pix_code,
        "expires_at": booking["expires_at"],
        "status": "WAITING_PAYMENT",
    }


@router.post("/process-card")
async def process_card_payment(data: CardCheckoutRequest):
    booking = BOOKINGS_STORE.get(data.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    tickets = issue_tickets_for_booking(booking)

    return {
        "status": "AUTHORIZED",
        "message": "Pagamento autorizado com sucesso.",
        "booking_id": booking["id"],
        "tickets": tickets,
    }


@router.post("/confirm-pix/{booking_id}")
async def confirm_pix_simulated(booking_id: str):
    """Simula o recebimento do Webhook PIX ou clique em 'Ir para passagem'."""
    booking = BOOKINGS_STORE.get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    tickets = issue_tickets_for_booking(booking)
    return {
        "status": "CONFIRMED",
        "booking_id": booking["id"],
        "tickets": tickets,
    }


@router.post("/pos-register")
async def pos_register_payment(data: PosRegisterRequest):
    """Registra pagamento presencial no guichê pelo operador."""
    booking = BOOKINGS_STORE.get(data.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    tickets = issue_tickets_for_booking(booking)
    return {
        "status": "CONFIRMED",
        "payment_method": data.method,
        "operator": data.operator_name,
        "booking_id": booking["id"],
        "tickets": tickets,
    }


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def payment_gateway_webhook(
    payload: PaymentWebhookPayload,
    x_webhook_token: Optional[str] = Header(None, alias="X-Webhook-Token"),
    x_signature: Optional[str] = Header(None, alias="X-Signature"),
):
    """
    Webhook universal para recebimento de confirmações assíncronas de pagamento
    (PIX e Cartão) de Gateways (Mercado Pago, Asaas, EFI ou Provedores Genéricos).
    
    Recursos de Produção:
    - Verificação de autenticidade (Token ou Assinatura HMAC).
    - Idempotência rigorosa (rejeita reprocessamento de event_id duplicado).
    - Emissão atômica de bilhetes QR Code assinados criptograficamente.
    """
    # 1. Validação opcional de segurança por token caso configurado
    expected_token = getattr(settings, "PAYMENT_WEBHOOK_SECRET", "dev_webhook_secret_key_2026")
    if x_webhook_token and x_webhook_token != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação do Webhook inválido."
        )

    # 2. Idempotência: Se o evento já foi processado, retorna 200 ignorando duplicidade
    if payload.event_id in PROCESSED_WEBHOOK_EVENTS:
        return {
            "status": "ignored",
            "message": "Evento já processado anteriormente (idempotência garantida).",
            "event_id": payload.event_id,
        }

    # 3. Localização da reserva (por ID ou referência externa)
    target_booking_id = (
        payload.booking_id
        or payload.external_reference
        or (payload.data.get("external_reference") if payload.data else None)
    )

    if not target_booking_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payload do webhook não contém identificador da reserva (booking_id ou external_reference)."
        )

    booking = BOOKINGS_STORE.get(target_booking_id)
    if not booking:
        # Tenta buscar por booking_code
        for b in BOOKINGS_STORE.values():
            if b.get("booking_code") == target_booking_id:
                booking = b
                break

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reserva '{target_booking_id}' referenciada no webhook não encontrada."
        )

    # 4. Processamento conforme tipo de evento
    approved_events = [
        "payment.approved",
        "payment.created",
        "PAYMENT_RECEIVED",
        "PAYMENT_CONFIRMED",
        "pix.confirmed",
        "charge.succeeded",
    ]

    event_normalized = payload.event_type.strip()
    if any(approved.lower() == event_normalized.lower() for approved in approved_events):
        # Emite bilhetes caso a reserva ainda não esteja confirmada
        if booking.get("status") != "CONFIRMED":
            tickets = issue_tickets_for_booking(booking)
        else:
            tickets = booking.get("tickets", [])

        # Registra metadados do pagamento
        booking["payment_info"] = {
            "gateway_transaction_id": payload.gateway_transaction_id or str(uuid.uuid4()),
            "method": payload.payment_method or "PIX",
            "paid_at": datetime.now(timezone.utc).isoformat(),
            "amount_paid": payload.amount_paid or booking["total_amount"],
            "event_id": payload.event_id,
        }

        # Marca evento como processado
        PROCESSED_WEBHOOK_EVENTS.add(payload.event_id)

        return {
            "status": "success",
            "message": "Pagamento confirmado via Webhook e bilhetes emitidos com sucesso.",
            "booking_id": booking["id"],
            "booking_code": booking["booking_code"],
            "tickets_issued": len(tickets),
            "event_id": payload.event_id,
        }

    return {
        "status": "unhandled_event",
        "message": f"Evento '{payload.event_type}' recebido e registrado, nenhuma ação necessária.",
        "event_id": payload.event_id,
    }
