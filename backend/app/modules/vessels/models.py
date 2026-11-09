from datetime import datetime, timezone
import uuid
from sqlalchemy import Boolean, CheckConstraint, Column, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Vessel(Base):
    __tablename__ = "vessels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(128), nullable=False)
    code = Column(String(32), unique=True, nullable=False)
    max_passenger_capacity = Column(Integer, nullable=False)
    max_vehicle_capacity = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
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

    __table_args__ = (
        CheckConstraint("max_passenger_capacity > 0", name="chk_vessel_passenger_cap"),
        CheckConstraint("max_vehicle_capacity >= 0", name="chk_vessel_vehicle_cap"),
    )
