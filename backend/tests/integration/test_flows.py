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


def test_payment_gateway_webhook_lifecycle_and_idempotency():
    # 1. Cria nova reserva aguardando pagamento
    res = client.post(
        "/api/v1/bookings",
        json={
            "route_id": "11111111-1111-1111-1111-111111111111",
            "trip_id": "33333333-3333-3333-3333-333333333303",
            "travel_date": "25 nov. 2026",
            "departure_time": "10:00",
            "origin": "Salvador",
            "destination": "Mar Grande",
            "operator": "Marina Socicam",
            "passengers": [
                {
                    "full_name": "Lucas Bahia",
                    "document_number": "111.222.333-44",
                    "passenger_type": "ADULT",
                }
            ],
            "vehicle": {
                "category_code": "MOTORCYCLE",
                "plate": "MOT-1A23",
                "driver_name": "Lucas Bahia",
            },
            "customer_email": "lucas@email.com",
            "customer_name": "Lucas Bahia",
        },
    )
    assert res.status_code == 201
    booking = res.json()
    booking_id = booking["id"]
    event_id = f"evt_test_{booking_id}"

    # 2. Webhook com Token Invalido -> DEVE RECUSAR com 401
    res_unauth = client.post(
        "/api/v1/payments/webhook",
        headers={"X-Webhook-Token": "token_invalido_hacker"},
        json={
            "event_id": event_id,
            "event_type": "payment.approved",
            "booking_id": booking_id,
        },
    )
    assert res_unauth.status_code == 401

    # 3. Webhook com Token Valido e Evento payment.approved -> DEVE CONFIRMAR E EMITIR BILHETES
    res_valid = client.post(
        "/api/v1/payments/webhook",
        headers={"X-Webhook-Token": "dev_webhook_secret_key_2026"},
        json={
            "event_id": event_id,
            "event_type": "payment.approved",
            "external_reference": booking_id,
            "amount_paid": booking["total_amount"],
            "payment_method": "PIX",
            "gateway_transaction_id": "tx_mp_9988776655",
        },
    )
    assert res_valid.status_code == 200
    valid_data = res_valid.json()
    assert valid_data["status"] == "success"
    # 1 bilhete de passageiro + 1 bilhete de veículo = 2 bilhetes
    assert valid_data["tickets_issued"] == 2

    # Verifica status da reserva no sistema
    res_check = client.get(f"/api/v1/bookings/{booking_id}")
    assert res_check.status_code == 200
    b_data = res_check.json()
    assert b_data["status"] == "CONFIRMED"
    assert len(b_data["tickets"]) == 2

    # 4. Envio do MESMO evento de webhook -> DEVE RETORNAR 'ignored' (IDEMPOTÊNCIA)
    res_idempotent = client.post(
        "/api/v1/payments/webhook",
        headers={"X-Webhook-Token": "dev_webhook_secret_key_2026"},
        json={
            "event_id": event_id,
            "event_type": "payment.approved",
            "booking_id": booking_id,
        },
    )
    assert res_idempotent.status_code == 200
    assert res_idempotent.json()["status"] == "ignored"

    # 5. Webhook para reserva inexistente -> DEVE RETORNAR 404
    res_not_found = client.post(
        "/api/v1/payments/webhook",
        headers={"X-Webhook-Token": "dev_webhook_secret_key_2026"},
        json={
            "event_id": "evt_inexistente_999",
            "event_type": "payment.approved",
            "booking_id": "00000000-0000-0000-0000-000000000000",
        },
    )
    assert res_not_found.status_code == 404


def test_notification_service_and_email_preview():
    # 1. Cria reserva e confirma pagamento para disparar e-mail
    res = client.post(
        "/api/v1/bookings",
        json={
            "route_id": "11111111-1111-1111-1111-111111111111",
            "trip_id": "33333333-3333-3333-3333-333333333303",
            "travel_date": "26 nov. 2026",
            "departure_time": "11:00",
            "origin": "Salvador",
            "destination": "Mar Grande",
            "operator": "Marina Socicam",
            "passengers": [
                {
                    "full_name": "Juliana Ribeiro",
                    "document_number": "555.666.777-88",
                    "passenger_type": "ADULT",
                }
            ],
            "customer_email": "juliana@email.com",
            "customer_name": "Juliana Ribeiro",
        },
    )
    assert res.status_code == 201
    booking_id = res.json()["id"]

    # 2. Confirma pagamento
    client.post(f"/api/v1/payments/confirm-pix/{booking_id}")

    # 3. Reenvio explícito de notificação
    res_resend = client.post(f"/api/v1/notifications/resend/{booking_id}")
    assert res_resend.status_code == 200
    assert "reenviado com sucesso" in res_resend.json()["message"]

    # 4. Consulta logs de notificação
    res_logs = client.get("/api/v1/notifications/logs")
    assert res_logs.status_code == 200
    logs = res_logs.json()
    assert len(logs) >= 1
    assert any(l["recipient_email"] == "juliana@email.com" for l in logs)

    # 5. Pré-visualização HTML do e-mail
    res_preview = client.get(f"/api/v1/notifications/preview/{booking_id}")
    assert res_preview.status_code == 200
    assert "TERMINAL NÁUTICO DA BAHIA" in res_preview.text
    assert "Juliana Ribeiro" in res_preview.text


def test_cash_register_and_csv_report_export():
    # 1. Consulta resumo de fechamento de caixa do turno
    res_summary = client.get("/api/v1/operations/cash-register-summary")
    assert res_summary.status_code == 200
    summary = res_summary.json()["summary"]
    assert "total_revenue" in summary
    assert "cash_on_hand" in summary
    assert summary["confirmed_bookings"] >= 1

    # 2. Download do Relatório Operacional em CSV
    res_csv = client.get("/api/v1/operations/reports/export-csv")
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]
    assert "Código Reserva" in res_csv.text
    assert "Juliana Ribeiro" in res_csv.text


def test_weather_suspension_lifecycle():
    # 1. Consulta alertas ativos
    res_alerts = client.get("/api/v1/operations/active-alerts")
    assert res_alerts.status_code == 200
    initial_alerts = res_alerts.json()
    assert len(initial_alerts) >= 1

    # 2. Supervisor suspende viagem por ressaca marítima
    res_suspend = client.post(
        "/api/v1/operations/suspend-trip",
        json={
            "route": "Salvador ➔ Mar Grande",
            "affected_time": "17:30",
            "reason": "Ventos fortes no canal de Itaparica com ondas de 2.5m.",
            "severity": "CRITICAL",
            "suspended_by": "Capitania dos Portos / Supervisor",
        },
    )
    assert res_suspend.status_code == 200
    susp_data = res_suspend.json()["suspension"]
    susp_id = susp_data["id"]
    assert susp_data["status"] == "ACTIVE"

    # 3. Verifica que alerta passou a constar na lista pública
    res_check = client.get("/api/v1/operations/active-alerts")
    active_ids = [a["id"] for a in res_check.json()]
    assert susp_id in active_ids

    # 4. Reativa a viagem após normalização do mar
    res_resume = client.post(
        "/api/v1/operations/resume-trip",
        json={
            "suspension_id": susp_id,
            "resumed_by": "Supervisor de Plantão",
        },
    )
    assert res_resume.status_code == 200
    assert res_resume.json()["suspension"]["status"] == "RESOLVED"



