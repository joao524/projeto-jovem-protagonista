from datetime import datetime, timezone
import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.modules.bookings.router import BOOKINGS_STORE, TICKETS_STORE

router = APIRouter(prefix="/refunds", tags=["Reembolsos"])

REFUNDS_STORE = {}

class RefundRequestInput(BaseModel):
    booking_id: str
    amount: float
    reason: str
    operator_name: str

class RefundReviewInput(BaseModel):
    admin_name: str
    decision: str  # 'APPROVE' ou 'REJECT'
    rejection_reason: Optional[str] = None

class RefundDisbursementInput(BaseModel):
    payout_method: str  # 'CASH_REGISTER' ou 'PIX'
    disbursed_by: str
    receipt_reference: Optional[str] = None

@router.post("/request", status_code=status.HTTP_201_CREATED)
async def request_refund(data: RefundRequestInput):
    booking = BOOKINGS_STORE.get(data.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")
        
    refund_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    refund_obj = {
        "id": refund_id,
        "booking_id": data.booking_id,
        "booking_code": booking["booking_code"],
        "customer_name": booking.get("customer_name", "Passageiro"),
        "amount": data.amount,
        "reason": data.reason,
        "requested_by": data.operator_name,
        "status": "PENDING_APPROVAL",
        "requested_at": now,
        "approved_by": None,
        "reviewed_at": None,
        "payout_method": None,
        "disbursed_by": None,
        "receipt_reference": None
    }
    REFUNDS_STORE[refund_id] = refund_obj
    return refund_obj

@router.get("/pending")
async def list_pending_refunds():
    return [r for r in REFUNDS_STORE.values() if r["status"] == "PENDING_APPROVAL"]

@router.get("/all")
async def list_all_refunds():
    return list(REFUNDS_STORE.values())

@router.post("/{refund_id}/review")
async def review_refund(refund_id: str, data: RefundReviewInput):
    refund = REFUNDS_STORE.get(refund_id)
    if not refund:
        raise HTTPException(status_code=404, detail="Solicitação de reembolso não encontrada.")
        
    now = datetime.now(timezone.utc).isoformat()
    refund["reviewed_at"] = now
    refund["approved_by"] = data.admin_name
    
    if data.decision == "APPROVE":
        refund["status"] = "APPROVED"
        # Invalida os bilhetes da reserva
        booking = BOOKINGS_STORE.get(refund["booking_id"])
        if booking:
            booking["status"] = "REFUNDED"
            for t in booking.get("tickets", []):
                t_id = t.get("id")
                if t_id in TICKETS_STORE:
                    TICKETS_STORE[t_id]["status"] = "REFUNDED"
    else:
        refund["status"] = "REJECTED"
        refund["rejection_reason"] = data.rejection_reason or "Rejeitado pela administração."
        
    return refund

@router.post("/{refund_id}/disburse")
async def disburse_refund(refund_id: str, data: RefundDisbursementInput):
    refund = REFUNDS_STORE.get(refund_id)
    if not refund:
        raise HTTPException(status_code=404, detail="Solicitação de reembolso não encontrada.")
    if refund["status"] != "APPROVED":
        raise HTTPException(status_code=400, detail="Reembolso precisa estar APROVADO antes da efetivação.")
        
    now = datetime.now(timezone.utc).isoformat()
    refund["status"] = "COMPLETED"
    refund["payout_method"] = data.payout_method
    refund["disbursed_by"] = data.disbursed_by
    refund["receipt_reference"] = data.receipt_reference
    refund["completed_at"] = now
    return refund
