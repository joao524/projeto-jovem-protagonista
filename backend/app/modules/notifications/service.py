import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
import httpx

from app.core.config import settings

logger = logging.getLogger("notifications")

# Histórico em memória de e-mails/comprovantes enviados (para auditoria e inspeção)
NOTIFICATION_DISPATCH_LOGS: List[Dict[str, Any]] = []


def generate_ticket_email_html(booking: dict, tickets: list) -> str:
    """Gera template HTML profissional e responsivo para o bilhete de embarque TTNB."""
    tickets_html = ""
    for t in tickets:
        is_vehicle = t.get("ticket_type") == "VEHICLE"
        tickets_html += f"""
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 8px;">
                <span style="font-weight: 800; color: #07395c; font-size: 14px;">
                    {'🚗 VEÍCULO EMBARQUE' if is_vehicle else '🎫 PASSAGEIRO'}
                </span>
                <span style="font-family: monospace; font-weight: bold; color: #ed7837; font-size: 13px;">
                    {t.get('ticket_code')}
                </span>
            </div>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;">
                <strong>Nome / Identificador:</strong> {t.get('passenger_name')}
            </p>
            <p style="margin: 4px 0; font-size: 13px; color: #334155;">
                <strong>Documento / Placa:</strong> {t.get('document_number')}
            </p>
            <p style="margin: 4px 0; font-size: 12px; color: #64748b;">
                <strong>Código QR de Catraca:</strong> <code style="background: #f1f5f9; padding: 2px 4px; border-radius: 4px;">{t.get('ticket_code')}</code>
            </p>
        </div>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Seu Bilhete de Embarque - Terminal Náutico da Bahia</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fffefa; margin: 0; padding: 20px; color: #1e293b;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <!-- Topo TTNB -->
            <div style="background-color: #07395c; color: #ffffff; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 20px; letter-spacing: 0.5px;">⚓ TERMINAL NÁUTICO DA BAHIA</h1>
                <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.9;">Travessias Marítimas Salvador ↔ Ilhas</p>
            </div>

            <!-- Corpo -->
            <div style="padding: 24px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <span style="background-color: #ecfdf5; color: #047857; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px; border: 1px solid #a7f3d0; text-transform: uppercase;">
                        ✓ Pagamento Confirmado
                    </span>
                    <h2 style="color: #07395c; margin: 12px 0 4px; font-size: 22px;">Seu bilhete está pronto!</h2>
                    <p style="color: #64748b; font-size: 13px; margin: 0;">Apresente este comprovante ou QR code no momento do embarque no cais.</p>
                </div>

                <!-- Detalhes da Viagem -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                    <div style="font-size: 16px; font-weight: bold; color: #07395c; margin-bottom: 8px;">
                        {booking.get('origin')} ➔ {booking.get('destination')}
                    </div>
                    <div style="font-size: 13px; color: #475569; line-height: 1.6;">
                        <div><strong>Data da Viagem:</strong> {booking.get('travel_date')}</div>
                        <div><strong>Horário de Saída:</strong> {booking.get('departure_time')}</div>
                        <div><strong>Operadora:</strong> {booking.get('operator')}</div>
                        <div><strong>Código da Reserva:</strong> {booking.get('booking_code')}</div>
                    </div>
                </div>

                <!-- Lista de Bilhetes Emitidos -->
                <h3 style="font-size: 14px; color: #07395c; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;">
                    Bilhetes de Acesso ({len(tickets)})
                </h3>
                {tickets_html}

                <!-- Informações Importantes -->
                <div style="margin-top: 20px; padding: 12px; background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; font-size: 11px; color: #92400e; line-height: 1.5;">
                    <strong>Orientações para o Embarque:</strong>
                    <ul style="margin: 4px 0 0; padding-left: 18px;">
                        <li>Chegue ao terminal com no mínimo 20 minutos de antecedência.</li>
                        <li>Apresente documento oficial com foto para conferência junto ao bilhete.</li>
                        <li>Embarque de veículos encerra 10 minutos antes da partida da embarcação.</li>
                    </ul>
                </div>
            </div>

            <!-- Rodapé -->
            <div style="background-color: #f1f5f9; padding: 14px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
                Terminal Náutico da Bahia · Av. da França, s/n - Comércio, Salvador - BA<br>
                Suporte ao Passageiro: (71) 3326-1000 · Este é um e-mail automático.
            </div>
        </div>
    </body>
    </html>
    """
    return html


async def dispatch_ticket_notification(booking: dict, tickets: list) -> dict:
    """
    Despacha a notificação por e-mail para o cliente.
    Suporta Resend API quando configurado ou modo de inspeção/simulação auditável.
    """
    recipient_email = booking.get("customer_email") or "passageiro@email.com"
    subject = f"Seu Bilhete TTNB: {booking.get('origin')} ➔ {booking.get('destination')} ({booking.get('departure_time')})"
    html_content = generate_ticket_email_html(booking, tickets)
    now_str = datetime.now(timezone.utc).isoformat()

    resend_api_key = getattr(settings, "RESEND_API_KEY", None)

    delivery_status = "DELIVERED_PREVIEW"
    provider_response = None

    if resend_api_key and resend_api_key.startswith("re_"):
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {resend_api_key}"},
                    json={
                        "from": "Terminal Náutico <bilhetes@ttnb.ba.gov.br>",
                        "to": [recipient_email],
                        "subject": subject,
                        "html": html_content,
                    },
                )
                if res.status_code in [200, 201]:
                    delivery_status = "SENT_RESEND"
                    provider_response = res.json()
                else:
                    delivery_status = "PROVIDER_ERROR"
                    provider_response = res.text
        except Exception as e:
            logger.error(f"Erro ao disparar via Resend: {e}")
            delivery_status = "FAILED"
            provider_response = str(e)
    else:
        delivery_status = "SIMULATED_LOCAL"
        provider_response = {"preview_ready": True, "mode": "development_or_demo"}

    log_entry = {
        "id": f"notif_{len(NOTIFICATION_DISPATCH_LOGS) + 1:04d}",
        "booking_id": booking.get("id"),
        "booking_code": booking.get("booking_code"),
        "recipient_email": recipient_email,
        "recipient_name": booking.get("customer_name"),
        "subject": subject,
        "status": delivery_status,
        "dispatched_at": now_str,
        "tickets_count": len(tickets),
        "provider_details": provider_response,
    }
    NOTIFICATION_DISPATCH_LOGS.insert(0, log_entry)

    logger.info(f"Notificação de bilhete despachada para {recipient_email} com status: {delivery_status}")
    return log_entry
