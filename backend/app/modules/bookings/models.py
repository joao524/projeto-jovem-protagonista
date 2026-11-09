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
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_code = Column(String(16), unique=True, nullable=False)
    trip_id = Column(
        UUID(as_uuid=True),
        ForeignKey("trips.id", ondelete="RESTRICT"),
        nullable=False,
    )
    customer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=True,
    )
    status = Column(String(32), default="PENDING_PAYMENT", nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    channel = Column(String(32), default="ONLINE", nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    trip = relationship("Trip")
    customer = relationship("User")
    passengers = relationship("BookingPassenger", back_populates="booking")
    vehicles = relationship("BookingVehicle", back_populates="booking")
    payments = relationship("Payment", back_populates="booking")
    tickets = relationship("Ticket", back_populates="booking")

    __table_args__ = (
        CheckConstraint(
            "status IN ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'EXPIRED',"
            " 'REFUNDED')",
            name="chk_booking_status",
        ),
        CheckConstraint(
            "channel IN ('ONLINE', 'POS_IN_PERSON')", name="chk_booking_channel"
        ),
        CheckConstraint("total_amount >= 0", name="chk_booking_amount"),
    )


class BookingPassenger(Base):
    __tablename__ = "booking_passengers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(
        UUID(as_uuid=True),
        ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False,
    )
    full_name = Column(String(255), nullable=False)
    document_number = Column(String(32), nullable=False)
    document_type = Column(String(16), default="CPF", nullable=False)
    passenger_type = Column(String(32), default="STANDARD", nullable=False)

    booking = relationship("Booking", back_populates="passengers")
    ticket = relationship("Ticket", back_populates="passenger", uselist=False)


class BookingVehicle(Base):
    __tablename__ = "booking_vehicles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(
        UUID(as_uuid=True),
        ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False,
    )
    category_code = Column(
        String(32),
        ForeignKey("vehicle_categories.code", ondelete="RESTRICT"),
        nullable=False,
    )
    plate = Column(String(16), nullable=False)  # Obrigatória na compra
    driver_name = Column(String(255), nullable=True)
    spaces_consumed = Column(Numeric(4, 2), default=1.00, nullable=False)
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

    booking = relationship("Booking", back_populates="vehicles")
    category = relationship("VehicleCategory")
    plate_history = relationship(
        "VehiclePlateHistory", back_populates="booking_vehicle"
    )

    __table_args__ = (
        CheckConstraint("spaces_consumed > 0", name="chk_booking_vehicle_spaces"),
    )


class VehiclePlateHistory(Base):
    __tablename__ = "vehicle_plate_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_vehicle_id = Column(
        UUID(as_uuid=True),
        ForeignKey("booking_vehicles.id", ondelete="CASCADE"),
        nullable=False,
    )
    old_plate = Column(String(16), nullable=False)
    new_plate = Column(String(16), nullable=False)
    changed_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )
    reason = Column(Text, nullable=True)
    changed_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    booking_vehicle = relationship("BookingVehicle", back_populates="plate_history")
    user = relationship("User")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(
        UUID(as_uuid=True),
        ForeignKey("bookings.id", ondelete="RESTRICT"),
        nullable=False,
    )
    method = Column(String(32), nullable=False)
    status = Column(String(32), default="PENDING", nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    refunded_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    provider_name = Column(String(64), nullable=True)
    provider_transaction_id = Column(String(128), unique=True, nullable=True)
    idempotency_key = Column(String(128), unique=True, nullable=True)
    registered_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=True,
    )
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
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

    booking = relationship("Booking", back_populates="payments")
    events = relationship("PaymentEvent", back_populates="payment")

    __table_args__ = (
        CheckConstraint(
            "method IN ('CREDIT_CARD', 'PIX', 'CASH', 'DEBIT_CARD')",
            name="chk_payment_method",
        ),
        CheckConstraint(
            "status IN ('PENDING', 'AUTHORIZED', 'CONFIRMED', 'FAILED',"
            " 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED')",
            name="chk_payment_status",
        ),
        CheckConstraint("amount > 0", name="chk_payment_amount"),
        CheckConstraint(
            "refunded_amount >= 0 AND refunded_amount <= amount",
            name="chk_refund_limit",
        ),
    )


class PaymentEvent(Base):
    __tablename__ = "payment_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    payment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("payments.id", ondelete="CASCADE"),
        nullable=False,
    )
    event_type = Column(String(64), nullable=False)
    external_event_id = Column(String(128), unique=True, nullable=False)
    payload = Column(JSONB, nullable=False)
    processed_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    payment = relationship("Payment", back_populates="events")
