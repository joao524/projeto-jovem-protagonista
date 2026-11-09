from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_public_endpoints():
    # 1. Verifica rotas
    res_routes = client.get("/api/v1/public/routes")
    assert res_routes.status_code == 200
    assert len(res_routes.json()) >= 2

    # 2. Verifica viagens
    res_trips = client.get("/api/v1/public/trips")
    assert res_trips.status_code == 200
    assert len(res_trips.json()) >= 4

    # 3. Verifica filômetro
    res_status = client.get("/api/v1/public/terminal-status")
    assert res_status.status_code == 200
    assert res_status.json()["occupancy_rate"] == 32

    # 4. Verifica previsão do tempo
    res_weather = client.get("/api/v1/public/weather")
    assert res_weather.status_code == 200
    assert res_weather.json()["temperature_celsius"] == 28


def test_complete_booking_payment_and_boarding_cycle():
    # 1. Cria intenção de reserva (1 adulto para Mar Grande)
    booking_payload = {
        "route_id": "11111111-1111-1111-1111-111111111111",
        "trip_id": "33333333-3333-3333-3333-333333333303",
        "travel_date": "23 nov. 2026",
        "departure_time": "06:00",
        "origin": "Salvador",
        "destination": "Mar Grande",
        "operator": "Marina Socicam",
        "passengers": [
            {
                "full_name": "Carlos Bahia",
                "document_number": "123.456.789-00",
                "passenger_type": "ADULT",
            }
        ],
        "customer_email": "carlos@email.com",
        "customer_name": "Carlos Bahia",
    }
    res_booking = client.post("/api/v1/bookings", json=booking_payload)
    assert res_booking.status_code == 201
    booking_data = res_booking.json()
    assert booking_data["status"] == "PENDING_PAYMENT"
    assert booking_data["total_amount"] == 8.00
    booking_id = booking_data["id"]

    # 2. Inicia sessão Pix
    res_pix = client.post(
        "/api/v1/payments/pix-session", json={"booking_id": booking_id}
    )
    assert res_pix.status_code == 200
    pix_data = res_pix.json()
    assert "0002012658" in pix_data["pix_code"]

    # 3. Confirma pagamento Pix simulado
    res_confirm = client.post(f"/api/v1/payments/confirm-pix/{booking_id}")
    assert res_confirm.status_code == 200
    confirm_data = res_confirm.json()
    assert confirm_data["status"] == "CONFIRMED"
    tickets = confirm_data["tickets"]
    assert len(tickets) == 1
    ticket = tickets[0]
    ticket_id = ticket["id"]
    ticket_code = ticket["ticket_code"]
    qr_payload = ticket["qr_payload"]

    # 4. Consulta bilhete individual
    res_ticket = client.get(f"/api/v1/tickets/{ticket_id}")
    assert res_ticket.status_code == 200
    assert res_ticket.json()["status"] == "VALID"

    # 5. Validação de Embarque pelo Fiscal na Catraca (1ª Utilização - DEVE PERMITIR)
    res_board1 = client.post(
        "/api/v1/boarding/validate",
        json={
            "identifier": qr_payload,
            "validator_name": "Fiscal 01",
            "method": "QR_SCAN",
        },
    )
    assert res_board1.status_code == 200
    board1_data = res_board1.json()
    assert board1_data["result"] == "ALLOWED"
    assert board1_data["passenger_name"] == "Carlos Bahia"

    # 6. Tentativa de 2ª Utilização do mesmo bilhete (DEVE RECUSAR / ANTI-DUPLICIDADE)
    res_board2 = client.post(
        "/api/v1/boarding/validate",
        json={
            "identifier": ticket_code,
            "validator_name": "Fiscal 02",
            "method": "MANUAL_CODE",
        },
    )
    assert res_board2.status_code == 200
    board2_data = res_board2.json()
    assert board2_data["result"] == "DENIED"
    assert "BILHETE_JA_UTILIZADO" in board2_data["reason"]


def test_vehicle_plate_editing_and_audit_rules():
    # 1. Cria reserva com veículo (placa Mercosul inicial)
    res = client.post(
        "/api/v1/bookings",
        json={
            "route_id": "11111111-1111-1111-1111-111111111111",
            "trip_id": "33333333-3333-3333-3333-333333333303",
            "travel_date": "24 nov. 2026",
            "departure_time": "08:00",
            "origin": "Salvador",
            "destination": "Mar Grande",
            "operator": "Marina Socicam",
            "passengers": [
                {
                    "full_name": "Mariana Souza",
                    "document_number": "987.654.321-00",
                    "passenger_type": "ADULT",
                }
            ],
            "vehicle": {
                "category_code": "CAR_STD",
                "plate": "bra-2e19",
                "driver_name": "Mariana Souza",
            },
            "customer_email": "mariana@email.com",
            "customer_name": "Mariana Souza",
        },
    )
    assert res.status_code == 201
    booking_data = res.json()
    booking_id = booking_data["id"]
    assert booking_data["vehicle"]["license_plate"] == "BRA2E19"
    assert len(booking_data["vehicle_plate_history"]) == 1

    # 2. Atualiza placa para nova placa válida (Mercosul)
    res_update = client.patch(
        f"/api/v1/bookings/{booking_id}/vehicle-plate",
        json={
            "new_plate": "BAH-8A22",
            "reason": "Troquei de carro para a viagem",
            "changed_by": "Mariana Souza",
        },
    )
    assert res_update.status_code == 200
    updated_data = res_update.json()
    assert updated_data["vehicle"]["license_plate"] == "BAH8A22"
    assert len(updated_data["vehicle_plate_history"]) == 2
    last_audit = updated_data["vehicle_plate_history"][-1]
    assert last_audit["previous_plate"] == "BRA2E19"
    assert last_audit["new_plate"] == "BAH8A22"
    assert last_audit["reason"] == "Troquei de carro para a viagem"

    # 3. Tentativa com placa inválida (deve falhar com 400)
    res_invalid = client.patch(
        f"/api/v1/bookings/{booking_id}/vehicle-plate",
        json={"new_plate": "INVALID123"},
    )
    assert res_invalid.status_code == 400
    assert "Placa inválida" in res_invalid.json()["detail"]

    # 4. Tentativa com placa idêntica à atual (deve falhar com 400)
    res_same = client.patch(
        f"/api/v1/bookings/{booking_id}/vehicle-plate",
        json={"new_plate": "BAH8A22"},
    )
    assert res_same.status_code == 400
    assert "idêntica" in res_same.json()["detail"]

    # 5. Confirma pagamento e realiza embarque
    client.post(f"/api/v1/payments/confirm-pix/{booking_id}")
    res_b = client.get(f"/api/v1/bookings/{booking_id}")
    t = res_b.json()["tickets"][0]
    client.post(
        "/api/v1/boarding/validate",
        json={"identifier": t["qr_payload"], "validator_name": "Fiscal", "method": "QR_SCAN"},
    )

    # 6. Tentativa de alterar placa APÓS embarque (DEVE BLOQUEAR com 400)
    res_after_boarding = client.patch(
        f"/api/v1/bookings/{booking_id}/vehicle-plate",
        json={"new_plate": "ABC1234"},
    )
    assert res_after_boarding.status_code == 400
    detail_msg = res_after_boarding.json()["detail"]
    assert "BOARDED" in detail_msg or "validado" in detail_msg

