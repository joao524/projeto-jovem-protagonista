from datetime import datetime, timezone
import uuid
from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    String,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(
        UUID(as_uuid=True),
        ForeignKey("bookings.id", ondelete="RESTRICT"),
        nullable=False,
    )
    booking_passenger_id = Column(
        UUID(as_uuid=True),
        ForeignKey("booking_passengers.id", ondelete="RESTRICT"),
        unique=True,
        nullable=False,
    )
    trip_id = Column(
        UUID(as_uuid=True),
        ForeignKey("trips.id", ondelete="RESTRICT"),
        nullable=False,
    )
    ticket_code = Column(String(24), unique=True, nullable=False, index=True)
    qr_signature = Column(String(255), nullable=False)
    status = Column(String(32), default="VALID", nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    booking = relationship("Booking", back_populates="tickets")
    passenger = relationship("BookingPassenger", back_populates="ticket")
    trip = relationship("Trip")
    boarding_record = relationship(
        "BoardingRecord", back_populates="ticket", uselist=False
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('VALID', 'USED', 'CANCELLED', 'REFUNDED')",
            name="chk_ticket_status",
        ),
    )


class BoardingRecord(Base):
    __tablename__ = "boarding_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tickets.id", ondelete="RESTRICT"),
        unique=True,  # Garante uso único físico
        nullable=False,
    )
    trip_id = Column(
        UUID(as_uuid=True),
        ForeignKey("trips.id", ondelete="RESTRICT"),
        nullable=False,
    )
    validated_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )
    validation_method = Column(String(16), nullable=False)
    device_identifier = Column(String(128), nullable=True)
    boarded_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    ticket = relationship("Ticket", back_populates="boarding_record")
    trip = relationship("Trip")
    validator = relationship("User")

    __table_args__ = (
        CheckConstraint(
            "validation_method IN ('QR_SCAN', 'MANUAL_CODE')",
            name="chk_boarding_method",
        ),
    )
