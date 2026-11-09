from fastapi import APIRouter, HTTPException
from app.modules.bookings.router import TICKETS_STORE

router = APIRouter(prefix="/tickets", tags=["Bilhetes"])

@router.get("/{ticket_id}")
async def get_ticket(ticket_id: str):
    ticket = TICKETS_STORE.get(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Bilhete não encontrado.")
    return ticket
