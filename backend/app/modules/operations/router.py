import csv
import io
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, Field

from app.core.dependencies import require_staff, require_supervisor
from app.modules.bookings.router import BOOKINGS_STORE, TICKETS_STORE
from app.modules.identity.models import User

router = APIRouter(prefix="/operations", tags=["Operações & Gestão"])

# Lista de suspensões operacionais ativas (Mau tempo / Maré / Manutenção)
ACTIVE_SUSPENSIONS: List[dict] = [
    {
        "id": "susp-initial-01",
        "route": "Salvador ➔ Morro de São Paulo",
        "reason": "Ventos fortes no trecho oceânico acima de 28 nós.",
        "severity": "WARNING",
        "affected_time": "14:30",
        "status": "ACTIVE",
        "suspended_by": "Capitania dos Portos / Supervisão TTNB",
        "suspended_at": datetime.now(timezone.utc).isoformat(),
        "free_refund_enabled": True,
    }
]


def _csv_safe(value) -> str:
    """Neutraliza injeção de fórmulas no Excel (=, +, -, @, tab, CR)."""
    text = "" if value is None else str(value)
    if text and text[0] in ("=", "+", "-", "@", "\t", "\r"):
        return "'" + text
    return text


class SuspendTripRequest(BaseModel):
    route: str = Field(min_length=3, max_length=120)
    affected_time: str = Field(min_length=1, max_length=20)
    reason: str = Field(min_length=3, max_length=500)
    severity: str = Field(default="CRITICAL", pattern="^(INFO|WARNING|CRITICAL)$")
    # Mantido por compatibilidade; o responsável real é o usuário autenticado.
    suspended_by: Optional[str] = None


class ResumeTripRequest(BaseModel):
    suspension_id: str
    resumed_by: Optional[str] = None


@router.get("/cash-register-summary")
async def get_cash_register_summary(_: User = Depends(require_staff)):
    """
    Fechamento e resumo financeiro de caixa do turno:
    Calcula arrecadação em Dinheiro (espécie no guichê), PIX e Cartões.
    """
    bookings = list(BOOKINGS_STORE.values())

    total_revenue = 0.0
    cash_revenue = 0.0
    pix_revenue = 0.0
    card_revenue = 0.0
    total_passengers = 0
    total_vehicles = 0
    confirmed_count = 0

    recent_transactions = []

    for b in bookings:
        amount = float(b.get("total_amount", 0.0))
        b_status = b.get("status")

        if b_status in ["CONFIRMED", "BOARDED"]:
            total_revenue += amount
            confirmed_count += 1
            total_passengers += len(b.get("passengers", []))
            if b.get("vehicle"):
                total_vehicles += 1

            # Detecta método de pagamento
            payment_info = b.get("payment_info") or {}
            method = payment_info.get("method") or "PIX"

            if method == "CASH":
                cash_revenue += amount
            elif method in ["CREDIT_CARD", "DEBIT_CARD", "CARD"]:
                card_revenue += amount
            else:
                pix_revenue += amount

            recent_transactions.append({
                "booking_code": b.get("booking_code"),
                "customer_name": b.get("customer_name"),
                "route": f"{b.get('origin')} ➔ {b.get('destination')}",
                "departure_time": b.get("departure_time"),
                "amount": amount,
                "method": method,
                "status": b_status,
                "confirmed_at": b.get("confirmed_at") or b.get("created_at"),
            })

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "total_revenue": round(total_revenue, 2),
            "cash_on_hand": round(cash_revenue, 2),
            "pix_revenue": round(pix_revenue, 2),
            "card_revenue": round(card_revenue, 2),
            "confirmed_bookings": confirmed_count,
            "total_passengers_boarded_or_ready": total_passengers,
            "total_vehicles_registered": total_vehicles,
        },
        "recent_transactions": recent_transactions[:20],
    }


@router.get("/reports/export-csv")
async def export_operational_report_csv(_: User = Depends(require_staff)):
    """
    Gera e exporta relatório operacional e financeiro completo em formato CSV,
    formatado com UTF-8 BOM para abertura perfeita no Microsoft Excel.
    """
    output = io.StringIO()
    # Adiciona UTF-8 Byte Order Mark para acentuação correta no Excel
    output.write("\ufeff")

    writer = csv.writer(output, delimiter=";", quoting=csv.QUOTE_MINIMAL)
    writer.writerow([
        "Código Reserva",
        "Data Viagem",
        "Horário",
        "Origem",
        "Destino",
        "Operadora",
        "Passageiro Principal",
        "E-mail",
        "Qtd Passageiros",
        "Possui Veículo",
        "Placa Veículo",
        "Método Pagamento",
        "Valor Total (R$)",
        "Status Reserva",
        "Data/Hora Confirmação",
    ])

    bookings = list(BOOKINGS_STORE.values())

    for b in bookings:
        veh = b.get("vehicle")
        veh_plate = veh.get("license_plate") or veh.get("plate") if veh else "N/A"
        payment_info = b.get("payment_info") or {}
        method = payment_info.get("method") or "PIX"

        writer.writerow([_csv_safe(v) for v in [
            b.get("booking_code", ""),
            b.get("travel_date", ""),
            b.get("departure_time", ""),
            b.get("origin", ""),
            b.get("destination", ""),
            b.get("operator", ""),
            b.get("customer_name", ""),
            b.get("customer_email", ""),
            len(b.get("passengers", [])),
            "SIM" if veh else "NÃO",
            veh_plate,
            method,
            f"{float(b.get('total_amount', 0.0)):.2f}".replace(".", ","),
            b.get("status", ""),
            b.get("confirmed_at", b.get("created_at", "")),
        ]])

    csv_data = output.getvalue()
    today_str = datetime.now().strftime("%Y-%m-%d")
    filename = f"ttnb_relatorio_fechamento_{today_str}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


# -------------------------------------------------------------
# FEATURE 4: GESTÃO DE SUSPENSÃO POR MAU TEMPO E ALERTAS
# -------------------------------------------------------------

@router.get("/active-alerts")
async def get_active_operational_alerts():
    """Retorna a lista de viagens suspensas e alertas meteorológicos ativos."""
    return [s for s in ACTIVE_SUSPENSIONS if s["status"] == "ACTIVE"]


@router.post("/suspend-trip")
async def suspend_trip_for_weather(
    payload: SuspendTripRequest,
    current_user: User = Depends(require_supervisor),
):
    """
    Suspende uma viagem específica por condições meteorológicas desfavoráveis
    ou aviso de ressaca marítima emitido pela Capitania dos Portos.
    Restrito a Supervisor/Administrador; o responsável é registrado a partir do token.
    """
    suspension_id = f"susp_{len(ACTIVE_SUSPENSIONS) + 1:03d}"
    now_str = datetime.now(timezone.utc).isoformat()

    entry = {
        "id": suspension_id,
        "route": payload.route,
        "affected_time": payload.affected_time,
        "reason": payload.reason,
        "severity": payload.severity,
        "status": "ACTIVE",
        "suspended_by": current_user.full_name,
        "suspended_by_user_id": str(current_user.id),
        "suspended_at": now_str,
        "free_refund_enabled": True,
    }
    ACTIVE_SUSPENSIONS.insert(0, entry)

    return {
        "status": "success",
        "message": f"Viagem '{payload.route}' das {payload.affected_time} suspensa com sucesso. Alerta publicado aos passageiros.",
        "suspension": entry,
    }


@router.post("/resume-trip")
async def resume_suspended_trip(
    payload: ResumeTripRequest,
    current_user: User = Depends(require_supervisor),
):
    """Reativa viagem suspensa após melhoria das condições meteorológicas."""
    for s in ACTIVE_SUSPENSIONS:
        if s["id"] == payload.suspension_id:
            s["status"] = "RESOLVED"
            s["resumed_at"] = datetime.now(timezone.utc).isoformat()
            s["resumed_by"] = current_user.full_name
            s["resumed_by_user_id"] = str(current_user.id)
            return {
                "status": "success",
                "message": f"Viagem '{s['route']}' reativada com sucesso.",
                "suspension": s,
            }

    raise HTTPException(status_code=404, detail="Registro de suspensão não encontrado.")
