from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.core.security import generate_ticket_signature
from app.modules.bookings.router import BOOKINGS_STORE, TICKETS_STORE

router = APIRouter(prefix="/payments", tags=["Pagamentos"])


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


def issue_tickets_for_booking(booking: dict):
    tickets_created = []
    trip_id = booking["trip_id"]
    booking_id = booking["id"]

    for i, p in enumerate(booking["passengers"]):
        ticket_id = str(uuid.uuid4())
        ticket_code = f"{booking['booking_code']}-{i+1:02d}"
        signature = generate_ticket_signature(ticket_id, trip_id, booking_id)

        ticket_obj = {
            "id": ticket_id,
            "booking_id": booking_id,
            "trip_id": trip_id,
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
        TICKETS_STORE[ticket_code] = ticket_obj  # Index by code too
        tickets_created.append(ticket_obj)

    booking["tickets"] = tickets_created
    booking["status"] = "CONFIRMED"
    booking["confirmed_at"] = datetime.now(timezone.utc).isoformat()
    return tickets_created


@router.post("/pix-session")
async def create_pix_session(data: PixCheckoutRequest):
    booking = BOOKINGS_STORE.get(data.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    # Gera payload PIX padronizado (EMV / BRCode)
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

    # Simulação sem cobrança real conforme Figma Tela 10
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
