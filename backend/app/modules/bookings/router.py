import random
import string
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/bookings", tags=["Reservas"])

# In-memory storage synchronizer for state persistence in demonstration & testing
BOOKINGS_STORE = {}
TICKETS_STORE = {}

class PassengerInput(BaseModel):
    full_name: str
    document_number: str
    passenger_type: str = "ADULT"

class VehicleInput(BaseModel):
    category_code: str
    plate: str
    driver_name: Optional[str] = None

class CreateBookingRequest(BaseModel):
    route_id: str
    trip_id: str
    travel_date: str
    departure_time: str
    origin: str
    destination: str
    operator: str
    passengers: List[PassengerInput]
    vehicle: Optional[VehicleInput] = None
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None

class BookingResponse(BaseModel):
    id: str
    booking_code: str
    status: str
    total_amount: float
    travel_date: str
    departure_time: str
    origin: str
    destination: str
    operator: str
    passengers_count: int
    expires_at: str
    seconds_remaining: int
    created_at: str
    tickets: List[dict] = []

def generate_booking_code() -> str:
    chars = string.ascii_uppercase + string.digits
    rand = ''.join(random.choices(chars, k=6))
    return f"TTNB-{rand}"

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(data: CreateBookingRequest):
    booking_id = str(uuid.uuid4())
    booking_code = generate_booking_code()
    
    # Calculate price based on route and passengers
    base_unit_price = 152.00 if "Morro" in data.destination else 8.00
    total = len(data.passengers) * base_unit_price
    
    # Vehicle price if present
    if data.vehicle:
        total += 45.00  # Valor base de carro padrão
        
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=15)
    
    booking_data = {
        "id": booking_id,
        "booking_code": booking_code,
        "trip_id": data.trip_id,
        "route_id": data.route_id,
        "travel_date": data.travel_date,
        "departure_time": data.departure_time,
        "origin": data.origin,
        "destination": data.destination,
        "operator": data.operator,
        "status": "PENDING_PAYMENT",
        "total_amount": float(total),
        "passengers": [p.dict() for p in data.passengers],
        "vehicle": data.vehicle.dict() if data.vehicle else None,
        "customer_email": data.customer_email or "passageiro@email.com",
        "customer_name": data.customer_name or (data.passengers[0].full_name if data.passengers else "Passageiro"),
        "created_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
        "seconds_remaining": 900,
        "tickets": []
    }
    
    BOOKINGS_STORE[booking_id] = booking_data
    
    return BookingResponse(
        id=booking_id,
        booking_code=booking_code,
        status="PENDING_PAYMENT",
        total_amount=total,
        travel_date=data.travel_date,
        departure_time=data.departure_time,
        origin=data.origin,
        destination=data.destination,
        operator=data.operator,
        passengers_count=len(data.passengers),
        expires_at=expires_at.isoformat(),
        seconds_remaining=900,
        created_at=now.isoformat(),
        tickets=[]
    )

@router.get("/my-bookings")
async def get_my_bookings(email: Optional[str] = None):
    results = list(BOOKINGS_STORE.values())
    if email:
        results = [b for b in results if b.get("customer_email") == email]
    return results

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(booking_id: str):
    booking = BOOKINGS_STORE.get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")
    
    # Calculate live remaining seconds
    now = datetime.now(timezone.utc)
    exp = datetime.fromisoformat(booking["expires_at"])
    rem = max(0, int((exp - now).total_seconds()))
    booking["seconds_remaining"] = rem
    
    return BookingResponse(
        id=booking["id"],
        booking_code=booking["booking_code"],
        status=booking["status"],
        total_amount=booking["total_amount"],
        travel_date=booking["travel_date"],
        departure_time=booking["departure_time"],
        origin=booking["origin"],
        destination=booking["destination"],
        operator=booking["operator"],
        passengers_count=len(booking["passengers"]),
        expires_at=booking["expires_at"],
        seconds_remaining=rem,
        created_at=booking["created_at"],
        tickets=booking.get("tickets", [])
    )
