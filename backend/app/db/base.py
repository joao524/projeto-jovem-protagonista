from app.core.database import Base
from app.modules.announcements.models import Announcement
from app.modules.audit.models import AuditLog
from app.modules.bookings.models import (
    Booking,
    BookingPassenger,
    BookingVehicle,
    Payment,
    PaymentEvent,
    VehiclePlateHistory,
)
from app.modules.identity.models import OperatorProfile, Role, User, user_roles
from app.modules.refunds.models import Refund
from app.modules.routes.models import Route
from app.modules.tickets.models import BoardingRecord, Ticket
from app.modules.trips.models import (
    Trip,
    TripCapacity,
    TripSuspension,
    VehicleCategory,
)
from app.modules.vessels.models import Vessel

__all__ = [
    "Base",
    "User",
    "Role",
    "user_roles",
    "OperatorProfile",
    "Vessel",
    "Route",
    "VehicleCategory",
    "Trip",
    "TripCapacity",
    "TripSuspension",
    "Booking",
    "BookingPassenger",
    "BookingVehicle",
    "VehiclePlateHistory",
    "Payment",
    "PaymentEvent",
    "Ticket",
    "BoardingRecord",
    "Refund",
    "Announcement",
    "AuditLog",
]
