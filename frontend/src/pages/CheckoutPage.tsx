import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QrCode, CreditCard, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const [booking, setBooking] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) return;
      try {
        setLoading(true);
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data);
      } catch (err) {
        console.error('Erro ao carregar checkout', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  const handleProceedPayment = () => {
    if (selectedMethod === 'PIX') {
      navigate(`/pagamento/pix/${bookingId}`);
    } else {
      navigate(`/pagamento/cartao/${bookingId}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto min-h-screen bg-[#fffefa] flex items-center justify-center text-[#615f5e]">
        Carregando detalhes do pagamento...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto min-h-screen bg-[#fffefa] p-5 text-center">
        <p className="text-red-600 font-bold">Reserva não encontrada.</p>
        <button
          onClick={() => navigate('/horarios')}
          className="mt-4 text-ttnb-blue font-bold underline"
        >
          Voltar para Horários
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 py-6 flex flex-col justify-between">
      <div>
        {/* Título da Tela */}
        <div className="mt-1">
          <p className="text-[11px] font-bold text-ttnb-teal uppercase tracking-wider">
            RESERVA ONLINE
          </p>
          <h1 className="text-[28px] font-bold text-ttnb-blue mt-0.5">
            Revise e pague.
          </h1>
        </div>

        {/* Card Resumo do Trajeto (Figma: Rectangle 9) */}
        <div className="mt-4 bg-white border border-ttnb-border rounded-md p-4 shadow-2xs">
          <p className="text-[10px] font-bold text-[#887878] uppercase tracking-wider">
            TRAJETO
          </p>
          <div className="flex items-center space-x-2 text-[15px] font-bold text-ttnb-blue mt-1">
            <span>{booking.origin}</span>
            <span className="text-ttnb-teal font-normal">➔</span>
            <span>{booking.destination}</span>
          </div>

          <p className="text-[12px] text-[#615f5e] mt-1.5 font-medium">
            {booking.travel_date} / {booking.departure_time}
          </p>
          <p className="text-[11px] text-[#887878] mt-0.5">
            {booking.passengers_count} adulto(s) · {booking.operator}
          </p>
        </div>

        {/* Card do Total da Viagem (Figma: Rectangle 17) */}
        <div className="mt-3.5 bg-white border border-ttnb-border rounded-md p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[12px] font-bold text-ttnb-blue">Total da viagem</p>
            <p className="text-[10px] text-[#887878]">Sem taxas adicionais</p>
          </div>
          <span className="text-[22px] font-extrabold text-ttnb-blue">
            R$ {booking.total_amount.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Seleção de Métodos de Pagamento */}
        <div className="mt-5">
          <p className="text-[11px] font-bold text-[#887878] uppercase tracking-wider mb-2">
            Forma de pagamento
          </p>

          <div className="space-y-2.5">
            {/* Opção PIX (Figma: Rectangle 17) */}
            <div
              onClick={() => setSelectedMethod('PIX')}
              className={`p-3.5 rounded-md border flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === 'PIX'
                  ? 'border-ttnb-teal bg-[#f0faf7] shadow-xs'
                  : 'border-ttnb-border bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-ttnb-blue">Pix</p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Confirmação imediata
                  </p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedMethod === 'PIX'
                    ? 'border-ttnb-teal bg-ttnb-teal'
                    : 'border-slate-300'
                }`}
              >
                {selectedMethod === 'PIX' && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
              </div>
            </div>

            {/* Opção Cartão de Crédito (Figma: Rectangle 18) */}
            <div
              onClick={() => setSelectedMethod('CREDIT_CARD')}
              className={`p-3.5 rounded-md border flex items-center justify-between cursor-pointer transition-all ${
                selectedMethod === 'CREDIT_CARD'
                  ? 'border-ttnb-teal bg-[#f0faf7] shadow-xs'
                  : 'border-ttnb-border bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-ttnb-blue">Cartão de crédito</p>
                  <p className="text-[11px] text-[#615f5e]">
                    Simulação sem cobrança
                  </p>
                </div>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedMethod === 'CREDIT_CARD'
                    ? 'border-ttnb-teal bg-ttnb-teal'
                    : 'border-slate-300'
                }`}
              >
                {selectedMethod === 'CREDIT_CARD' && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alerta Informativo e LGPD (Figma: Rectangle 19) */}
        <div className="mt-5 bg-[#f9f9f9] border border-[#e5e5e5] rounded-md p-3 text-center">
          <p className="text-[11px] text-[#615f5e]">
            Escolha uma forma de pagamento para prosseguir
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center space-x-1.5 text-[11px] text-[#887878]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Dados protegidos pela LGPD · Sem retenção de dados sensíveis</span>
        </div>
      </div>

      {/* Botão de Prosseguir */}
      <div className="mt-6 pt-4 border-t border-[#f0ece9]">
        <button
          onClick={handleProceedPayment}
          className="w-full bg-ttnb-orange hover:bg-[#d96728] text-white font-bold py-3.5 px-4 rounded-ttnb-btn flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <span>Pagar com {selectedMethod === 'PIX' ? 'Pix' : 'Cartão de crédito'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
