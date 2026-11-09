from fastapi import APIRouter, HTTPException, Response, status
from typing import List

from app.modules.bookings.router import BOOKINGS_STORE
from app.modules.notifications.service import (
    NOTIFICATION_DISPATCH_LOGS,
    dispatch_ticket_notification,
    generate_ticket_email_html,
)

router = APIRouter(prefix="/notifications", tags=["Notificações"])


@router.get("/logs")
async def get_notification_logs():
    """Retorna o histórico de comprovantes e e-mails despachados aos passageiros."""
    return NOTIFICATION_DISPATCH_LOGS


@router.post("/resend/{booking_id}")
async def resend_booking_ticket_notification(booking_id: str):
    """Reenvia o e-mail de bilhete de embarque para o passageiro."""
    booking = BOOKINGS_STORE.get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    tickets = booking.get("tickets", [])
    if not tickets:
        raise HTTPException(
            status_code=400,
            detail="Não há bilhetes emitidos para esta reserva ainda. O pagamento precisa ser confirmado primeiro."
        )

    log_entry = await dispatch_ticket_notification(booking, tickets)
    return {
        "status": "success",
        "message": f"Comprovante reenviado com sucesso para {booking.get('customer_email')}.",
        "notification_log": log_entry,
    }


@router.get("/preview/{booking_id}")
async def preview_ticket_email_html(booking_id: str):
    """Renderiza a pré-visualização HTML do e-mail do bilhete no navegador."""
    booking = BOOKINGS_STORE.get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    tickets = booking.get("tickets", [])
    html = generate_ticket_email_html(booking, tickets)
    return Response(content=html, media_type="text/html")
