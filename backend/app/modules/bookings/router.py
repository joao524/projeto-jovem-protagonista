import random
import re
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

def validate_and_normalize_plate(plate: str) -> str:
    cleaned = re.sub(r'[^A-Za-z0-9]', '', plate).upper()
    # Mercosul format: ABC1D23 or Legacy: ABC1234
    mercosul_pattern = r'^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$'
    legacy_pattern = r'^[A-Z]{3}[0-9]{4}$'
    if not (re.match(mercosul_pattern, cleaned) or re.match(legacy_pattern, cleaned)):
        raise HTTPException(
            status_code=400,
            detail=f"Placa inválida: '{plate}'. Formato esperado Mercosul (ex: BRA2E19) ou Padrão (ex: ABC1234)."
        )
    return cleaned

class PassengerInput(BaseModel):
    full_name: str
    document_number: str
    passenger_type: str = "ADULT"

class VehicleInput(BaseModel):
    category_code: str
    plate: str
    driver_name: Optional[str] = None

class UpdateVehiclePlateRequest(BaseModel):
    new_plate: str
    reason: Optional[str] = "Correção informada pelo passageiro"
    changed_by: Optional[str] = "Passageiro"

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
    vehicle: Optional[dict] = None
    vehicle_plate_history: List[dict] = []

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
    
    vehicle_dict = None
    if data.vehicle:
        total += 45.00  # Valor base de carro padrão
        cleaned_plate = validate_and_normalize_plate(data.vehicle.plate)
        vehicle_dict = {
            "category_code": data.vehicle.category_code,
            "license_plate": cleaned_plate,
            "plate": cleaned_plate,
            "driver_name": data.vehicle.driver_name,
        }
        
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
        "passengers": [p.model_dump() for p in data.passengers],
        "vehicle": vehicle_dict,
        "vehicle_plate_history": [
            {
                "previous_plate": None,
                "new_plate": vehicle_dict["license_plate"],
                "changed_by": "Passageiro (Cadastro Inicial)",
                "reason": "Cadastro inicial da reserva",
                "changed_at": now.isoformat()
            }
        ] if vehicle_dict else [],
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
        tickets=[],
        vehicle=vehicle_dict,
        vehicle_plate_history=booking_data["vehicle_plate_history"]
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
        tickets=booking.get("tickets", []),
        vehicle=booking.get("vehicle"),
        vehicle_plate_history=booking.get("vehicle_plate_history", [])
    )

@router.patch("/{booking_id}/vehicle-plate", response_model=BookingResponse)
async def update_vehicle_plate(booking_id: str, payload: UpdateVehiclePlateRequest):
    """
    Regra de negócio confirmada: O passageiro pode corrigir a placa do veículo
    até o momento do embarque, mediante registro de auditoria da alteração.
    """
    booking = BOOKINGS_STORE.get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")
    
    if not booking.get("vehicle"):
        raise HTTPException(status_code=400, detail="Esta reserva não possui veículo cadastrado.")
    
    # Bloquear se já embarcou ou cancelou
    if booking.get("status") in ["BOARDED", "CANCELLED", "REFUNDED"]:
        raise HTTPException(
            status_code=400,
            detail=f"Não é permitido alterar a placa de uma reserva com status '{booking.get('status')}'."
        )
    
    # Verificar se algum bilhete dessa reserva já foi utilizado para embarque
    for ticket in booking.get("tickets", []):
        if ticket.get("status") in ["BOARDED", "USED"]:
            raise HTTPException(
                status_code=400,
                detail="Não é possível alterar a placa pois o bilhete de embarque já foi validado no cais."
            )
            
    new_cleaned_plate = validate_and_normalize_plate(payload.new_plate)
    old_plate = booking["vehicle"].get("license_plate") or booking["vehicle"].get("plate")
    
    if old_plate == new_cleaned_plate:
        raise HTTPException(status_code=400, detail="A nova placa informada é idêntica à atual.")
        
    now = datetime.now(timezone.utc)
    
    # Registro de auditoria obrigatório
    history_entry = {
        "previous_plate": old_plate,
        "new_plate": new_cleaned_plate,
        "changed_by": payload.changed_by or "Passageiro",
        "reason": payload.reason or "Correção cadastral",
        "changed_at": now.isoformat()
    }
    
    if "vehicle_plate_history" not in booking:
        booking["vehicle_plate_history"] = []
    booking["vehicle_plate_history"].append(history_entry)
    
    # Atualiza placa no veículo
    booking["vehicle"]["license_plate"] = new_cleaned_plate
    booking["vehicle"]["plate"] = new_cleaned_plate
    
    # Atualiza em qualquer bilhete de veículo emitido
    for t in booking.get("tickets", []):
        if t.get("ticket_type") == "VEHICLE" or "license_plate" in t:
            t["license_plate"] = new_cleaned_plate
            
    return await get_booking(booking_id)
