import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Check, ArrowRight, Share2, Printer, Anchor } from 'lucide-react';
import { api } from '../services/api';

export const TicketSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTicket() {
      if (!ticketId) return;
      try {
        setLoading(true);
        const res = await api.get(`/tickets/${ticketId}`);
        setTicket(res.data);
      } catch (err) {
        console.error('Erro ao buscar bilhete', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTicket();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#fffefa] flex items-center justify-center text-[#615f5e]">
        Carregando seu bilhete de embarque...
      </div>
    );
  }

  // Fallback para visualização perfeita
  const originCode = 'SSA';
  const destCode = ticket?.destination?.includes('Morro') ? 'MSP' : 'MG';
  const displayCode = ticket?.ticket_code || 'TTNB-A7F29C';
  const qrPayload = ticket?.qr_payload || `${ticketId || 'tck-1'}:${displayCode}:sample_signature`;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#fffefa] px-5 py-4 flex flex-col justify-between">
      <div>
        {/* Ícone de Sucesso Circular (Figma: Ellipse 1 + Interface / Check) */}
        <div className="text-center mt-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>

          <p className="text-[11px] font-bold text-[#615f5e] uppercase tracking-wider mt-2.5">
            PAGAMENTO AUTORIZADO
          </p>
          <h1 className="text-[26px] font-bold text-ttnb-blue mt-0.5">
            Seu bilhete está pronto.
          </h1>
          <p className="text-[12px] text-[#615f5e] mt-1 max-w-xs mx-auto">
            Apresente o QR code da passagem no momento do embarque.
          </p>
        </div>

        {/* Card do Bilhete de Embarque (Figma: Rectangle 19) */}
        <div className="mt-5 bg-white border border-[#cfcfcf] rounded-ttnb-btn p-5 shadow-xs relative">
          {/* Cabeçalho do Cartão */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-ttnb-blue">
            <span className="flex items-center gap-1.5 font-bold">
              <Anchor className="w-3.5 h-3.5 text-ttnb-teal" />
              TERMINAL NÁUTICO
            </span>
            <span className="tracking-wider text-ttnb-dark">TTNB</span>
          </div>

          {/* Linha tracejada divisória estilizada */}
          <div className="my-3 border-t border-dashed border-[#d3caca]"></div>

          {/* Origem e Destino com Códigos (SSA -> MG / MSP) */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[24px] font-extrabold text-ttnb-blue block tracking-tight">
                {originCode}
              </span>
              <span className="text-[12px] font-bold text-ttnb-blue">
                {ticket?.origin || 'Salvador'}
              </span>
            </div>

            <div className="flex flex-col items-center px-4">
              <span className="text-xs text-ttnb-orange font-bold">---------➔</span>
              <span className="text-[9px] text-[#887878] mt-0.5 uppercase tracking-wider">
                Travessia
              </span>
            </div>

            <div className="text-right">
              <span className="text-[24px] font-extrabold text-ttnb-blue block tracking-tight">
                {destCode}
              </span>
              <span className="text-[12px] font-bold text-ttnb-blue">
                {ticket?.destination || 'Mar Grande'}
              </span>
            </div>
          </div>

          {/* Tabela de Dados da Viagem em 2 Colunas */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-5 text-[11px] border-t border-[#f0ece9] pt-4">
            <div>
              <span className="text-[10px] text-[#615f5e] uppercase tracking-wider block font-medium">
                DATA
              </span>
              <span className="text-[12px] font-bold text-ttnb-blue">
                {ticket?.travel_date || '23 NOV 2026'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#615f5e] uppercase tracking-wider block font-medium">
                EMBARQUE
              </span>
              <span className="text-[12px] font-bold text-ttnb-blue">
                {ticket?.departure_time || '06 : 00'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#615f5e] uppercase tracking-wider block font-medium">
                PASSAGEIROS
              </span>
              <span className="text-[12px] font-bold text-ttnb-blue truncate block">
                {ticket?.passenger_name || '1 ADULTO'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#615f5e] uppercase tracking-wider block font-medium">
                OPERADOR
              </span>
              <span className="text-[12px] font-bold text-ttnb-blue truncate block">
                {ticket?.operator || 'MARINA SOCICAM'}
              </span>
            </div>
          </div>

          {/* QR Code Container Centralizado */}
          <div className="mt-5 pt-4 border-t border-[#f0ece9] text-center">
            <div className="p-3 bg-white border border-[#cfcfcf] rounded-md inline-block shadow-2xs">
              <QRCodeSVG value={qrPayload} size={140} level="M" />
            </div>
            <p className="text-[11px] font-mono font-bold text-[#615f5e] mt-2">
              {displayCode} · QR PASSAGEM
            </p>
          </div>
        </div>
      </div>

      {/* Botões de Ação no Rodapé */}
      <div className="mt-6 pt-4 border-t border-[#f0ece9] space-y-2">
        <button
          onClick={() => navigate('/')}
          className="w-full bg-ttnb-orange hover:bg-[#d96728] text-white font-bold py-3.5 px-4 rounded-ttnb-btn flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <span>Voltar ao início</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => window.print()}
          className="w-full bg-white border border-ttnb-border hover:border-ttnb-blue text-ttnb-blue font-bold py-2.5 px-4 rounded-ttnb-btn flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Salvar ou Imprimir Bilhete</span>
        </button>
      </div>
    </div>
  );
};
