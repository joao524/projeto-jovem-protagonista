from datetime import datetime, timezone
import uuid
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class VehicleCategory(Base):
    __tablename__ = "vehicle_categories"

    code = Column(String(32), primary_key=True)
    name = Column(String(64), nullable=False)
    space_factor = Column(Numeric(4, 2), default=1.00, nullable=False)
    base_price = Column(Numeric(12, 2), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    __table_args__ = (
        CheckConstraint("space_factor > 0", name="chk_vehicle_space_factor"),
        CheckConstraint("base_price >= 0", name="chk_vehicle_base_price"),
    )


class Trip(Base):
    __tablename__ = "trips"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_id = Column(
        UUID(as_uuid=True),
        ForeignKey("routes.id", ondelete="RESTRICT"),
        nullable=False,
    )
    vessel_id = Column(
        UUID(as_uuid=True),
        ForeignKey("vessels.id", ondelete="RESTRICT"),
        nullable=False,
    )
    departure_time = Column(DateTime(timezone=True), nullable=False)
    estimated_arrival_time = Column(DateTime(timezone=True), nullable=False)
    passenger_base_price = Column(Numeric(12, 2), nullable=False)
    status = Column(String(32), default="SCHEDULED", nullable=False)
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

    route = relationship("Route")
    vessel = relationship("Vessel")
    capacity = relationship(
        "TripCapacity", back_populates="trip", uselist=False
    )
    suspensions = relationship("TripSuspension", back_populates="trip")

    __table_args__ = (
        CheckConstraint(
            "estimated_arrival_time > departure_time", name="chk_trip_times"
        ),
        CheckConstraint(
            "status IN ('SCHEDULED', 'BOARDING', 'IN_PROGRESS', 'COMPLETED',"
            " 'SUSPENDED', 'CANCELLED')",
            name="chk_trip_status",
        ),
        CheckConstraint(
            "passenger_base_price >= 0", name="chk_trip_passenger_price"
        ),
    )


class TripCapacity(Base):
    __tablename__ = "trip_capacities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(
        UUID(as_uuid=True),
        ForeignKey("trips.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    max_passenger_capacity = Column(Integer, nullable=False)
    max_vehicle_capacity = Column(Integer, nullable=False)
    occupied_passengers = Column(Integer, default=0, nullable=False)
    occupied_vehicles = Column(Integer, default=0, nullable=False)
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

    trip = relationship("Trip", back_populates="capacity")

    __table_args__ = (
        CheckConstraint(
            "max_passenger_capacity >= 0", name="chk_cap_max_passengers"
        ),
        CheckConstraint(
            "max_vehicle_capacity >= 0", name="chk_cap_max_vehicles"
        ),
        CheckConstraint(
            "occupied_passengers >= 0", name="chk_cap_occ_passengers"
        ),
        CheckConstraint("occupied_vehicles >= 0", name="chk_cap_occ_vehicles"),
        CheckConstraint(
            "occupied_passengers <= max_passenger_capacity AND"
            " occupied_vehicles <= max_vehicle_capacity",
            name="chk_capacity_limits",
        ),
    )


class TripSuspension(Base):
    __tablename__ = "trip_suspensions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(
        UUID(as_uuid=True),
        ForeignKey("trips.id", ondelete="RESTRICT"),
        nullable=False,
    )
    suspended_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )
    reason = Column(Text, nullable=False)
    action_type = Column(String(32), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    trip = relationship("Trip", back_populates="suspensions")
    user = relationship("User")

    __table_args__ = (
        CheckConstraint(
            "action_type IN ('SUSPENDED', 'CANCELLED', 'REACTIVATED')",
            name="chk_suspension_action",
        ),
    )
