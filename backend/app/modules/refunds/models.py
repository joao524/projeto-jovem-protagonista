from datetime import datetime, timezone
import uuid
from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Refund(Base):
    __tablename__ = "refunds"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    payment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("payments.id", ondelete="RESTRICT"),
        nullable=False,
    )
    booking_id = Column(
        UUID(as_uuid=True),
        ForeignKey("bookings.id", ondelete="RESTRICT"),
        nullable=False,
    )
    requested_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )
    approved_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=True,
    )
    amount = Column(Numeric(12, 2), nullable=False)
    reason = Column(Text, nullable=False)
    rejection_reason = Column(Text, nullable=True)
    status = Column(String(32), default="PENDING_APPROVAL", nullable=False)
    payout_method = Column(String(32), nullable=True)
    disbursed_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=True,
    )
    receipt_reference = Column(String(128), nullable=True)
    requested_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    payment = relationship("Payment")
    booking = relationship("Booking")
    requester = relationship("User", foreign_keys=[requested_by])
    approver = relationship("User", foreign_keys=[approved_by])
    disburser = relationship("User", foreign_keys=[disbursed_by])

    __table_args__ = (
        CheckConstraint("amount > 0", name="chk_refund_amount"),
        CheckConstraint(
            "status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PROCESSING',"
            " 'COMPLETED', 'FAILED', 'CANCELLED')",
            name="chk_refund_status",
        ),
        CheckConstraint(
            "payout_method IS NULL OR payout_method IN ('ORIGINAL_GATEWAY',"
            " 'CASH_REGISTER', 'PIX')",
            name="chk_refund_payout_method",
        ),
        CheckConstraint(
            "approved_by IS NULL OR approved_by <> requested_by",
            name="chk_no_self_approval",
        ),
    )
