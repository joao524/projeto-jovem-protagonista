from datetime import datetime, timezone
from fastapi import APIRouter

router = APIRouter(prefix="/public", tags=["Consulta Pública e Monitoramento"])

# Rotas fixas do sistema conforme protótipo Figma
MOCK_ROUTES = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "origin_terminal": "Salvador (TTNB)",
        "destination_terminal": "Mar Grande",
        "destination_code": "MG",
        "origin_code": "SSA",
        "vessel_type": "Lancha",
        "estimated_duration": "Cerca de 40 minutos",
        "is_active": True,
        "base_price": 8.00,
        "frequency": "Saídas a cada 30 min até as 18:00"
    },
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "origin_terminal": "Salvador (TTNB)",
        "destination_terminal": "Morro de São Paulo",
        "destination_code": "MSP",
        "origin_code": "SSA",
        "vessel_type": "Catamarã",
        "estimated_duration": "Cerca de 2h30",
        "is_active": True,
        "base_price": 152.00,
        "frequency": "Os horários variam por operador e condição do Mar"
    }
]

MOCK_TRIPS = [
    # Salvador -> Mar Grande
    {
        "id": "33333333-3333-3333-3333-333333333301",
        "route_id": "11111111-1111-1111-1111-111111111111",
        "time": "05:00",
        "operator": "Marina Socicam",
        "status": "NORMAL",
        "tag": "Primeira Saída",
        "price": 8.00,
        "available_seats": 42
    },
    {
        "id": "33333333-3333-3333-3333-333333333302",
        "route_id": "11111111-1111-1111-1111-111111111111",
        "time": "05:30",
        "operator": "Marina Socicam",
        "status": "DELAYED",
        "tag": "Atraso / 15 min",
        "price": 8.00,
        "available_seats": 28
    },
    {
        "id": "33333333-3333-3333-3333-333333333303",
        "route_id": "11111111-1111-1111-1111-111111111111",
        "time": "06:00",
        "operator": "Marina Socicam",
        "status": "NORMAL",
        "tag": "Normal",
        "price": 8.00,
        "available_seats": 35
    },
    # Salvador -> Morro de São Paulo
    {
        "id": "44444444-4444-4444-4444-444444444401",
        "route_id": "22222222-2222-2222-2222-222222222222",
        "time": "09:00",
        "operator": "Biotur",
        "status": "NORMAL",
        "tag": "Normal",
        "price": 152.00,
        "available_seats": 60
    },
    {
        "id": "44444444-4444-4444-4444-444444444402",
        "route_id": "22222222-2222-2222-2222-222222222222",
        "time": "10:30",
        "operator": "Ilha Bela",
        "status": "DELAYED",
        "tag": "Atraso / 15 min",
        "price": 152.00,
        "available_seats": 40
    },
    {
        "id": "44444444-4444-4444-4444-444444444403",
        "route_id": "22222222-2222-2222-2222-222222222222",
        "time": "14:30",
        "operator": "Biotur",
        "status": "NORMAL",
        "tag": "Normal",
        "price": 152.00,
        "available_seats": 75
    }
]


@router.get("/routes")
async def get_routes():
    return MOCK_ROUTES


@router.get("/trips")
async def get_trips(route_id: str | None = None):
    if route_id:
        return [t for t in MOCK_TRIPS if t["route_id"] == route_id]
    return MOCK_TRIPS


@router.get("/terminal-status")
async def get_terminal_status():
    """Retorna dados do Filômetro (Figma Tela 12)."""
    return {
        "occupancy_rate": 32,
        "occupancy_status": "MOVIMENTO TRANQUILO",
        "recommendation": "Um bom momento para embarcar.",
        "description": "O fluxo está leve. Chegue com antecedência para organizar seu embarque.",
        "estimated_wait_minutes": 15,
        "last_updated": "Atualizada há 8 min",
        "peak_hour": "Geralmente por volta das 16:00.",
        "source": "Dados obtidos pelo sistema de bilhetagem e monitoramento CFTV"
    }


@router.get("/weather")
async def get_weather():
    """Retorna dados da Previsão do Tempo Marítima (Figma Tela 13)."""
    return {
        "location": "SALVADOR, BA",
        "date_time": "HOJE 14:00",
        "temperature_celsius": 28,
        "condition": "Parcialmente nublado",
        "wind_speed_kmh": 18,
        "rain_probability_percent": 20,
        "thermal_sensation_celsius": 31,
        "hourly_forecast": [
            {"hour": "15h", "temperature": 28},
            {"hour": "16h", "temperature": 30},
            {"hour": "17h", "temperature": 30},
            {"hour": "18h", "temperature": 26}
        ],
        "maritime_alert": "Chuvas fortes e condições do mar podem alterar as travessias.",
        "source": "Dados disponibilizados pelo Instituto Nacional de Meteorologia (INMET)"
    }


@router.get("/operational-status")
async def get_operational_status():
    """Retorna atualização operacional de suspensões (Figma Tela 15)."""
    return {
        "is_normal_operation": False,
        "title": "Travessias suspensas temporariamente.",
        "description": "Devido às fortes chuvas e às condições do mar, as saídas entre Salvador e Morro de São Paulo estão suspensas até nova avaliação.",
        "last_update": "Hoje, 14:20",
        "instructions": [
            "Não se dirija ao embarque até nova atualização;",
            "Entre em contato com a empresa onde comprou sua passagem;",
            "Bilhetes e remarcações devem ser tratados com o operador."
        ],
        "terminal_phone": "(71) 3241 - 9783"
    }


@router.get("/announcements")
async def get_announcements():
    """Retorna Notícias & Avisos (Figma Tela 14)."""
    return [
        {
            "id": "ann-01",
            "category": "INFORMAÇÃO AO PASSAGEIRO",
            "title": "Consulte as condições da travessia antes de sair.",
            "link_text": "Ver comunicado",
            "date": "08 nov. 2026"
        },
        {
            "id": "ann-02",
            "category": "DICA DE VIAGEM",
            "title": "Viaje preparado para o mar.",
            "link_text": "Planejar travessia",
            "date": "07 nov. 2026"
        }
    ]
