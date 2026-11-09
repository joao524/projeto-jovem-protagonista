import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  QrCode,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Anchor,
  Clock,
  Car,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const toast = useToast();

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
        toast.error('Erro ao buscar dados da reserva.');
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
      <div className="max-w-2xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-slate-500 space-y-3">
        <div className="w-8 h-8 border-3 border-ttnb-teal border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Carregando detalhes do pagamento...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Reserva não encontrada</h2>
        <p className="text-xs text-slate-500 mt-1">
          A sessão pode ter expirado ou o código informado é inválido.
        </p>
        <button
          onClick={() => navigate('/horarios')}
          className="mt-5 bg-ttnb-blue text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
        >
          Voltar para Horários
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Big Tech */}
      <div className="pb-6 border-b border-slate-200/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2 border border-slate-200">
          <Anchor className="w-3.5 h-3.5 text-ttnb-teal" />
          <span>CHECKOUT SEGURO TTNB</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Revise e pague
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Confira o resumo da sua travessia e selecione o método de liquidação preferido.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {/* Resumo da Viagem */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              DETALHES DO ITINERÁRIO
            </span>
            <span className="text-xs font-bold text-ttnb-teal bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-full">
              Código: {booking.booking_code || booking.id.slice(0, 8)}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-lg sm:text-xl font-black text-slate-900">
            <span>{booking.origin}</span>
            <span className="text-ttnb-teal font-normal">➔</span>
            <span>{booking.destination}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                <strong>{booking.travel_date}</strong> às <strong>{booking.departure_time}</strong>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span>{booking.passengers_count} passageiro(s) • {booking.operator}</span>
            </div>
            {booking.vehicle && (
              <div className="flex items-center space-x-2 sm:col-span-2 text-slate-700">
                <Car className="w-4 h-4 text-ttnb-teal" />
                <span>
                  Veículo associado: <strong>{booking.vehicle.plate}</strong> ({booking.vehicle.category_code})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card do Total */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
              VALOR TOTAL DA OPERAÇÃO
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Sem cobrança de tarifas ocultas</p>
          </div>
          <span className="text-3xl font-black text-slate-900 tracking-tight">
            R$ {Number(booking.total_amount).toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Escolha do Método de Pagamento */}
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">
            FORMA DE PAGAMENTO
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Opção Pix */}
            <div
              onClick={() => setSelectedMethod('PIX')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                selectedMethod === 'PIX'
                  ? 'border-ttnb-teal bg-teal-50/50 shadow-sm'
                  : 'border-slate-200/90 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Pix Instantâneo</p>
                  <p className="text-xs text-emerald-700 font-semibold">Confirmação em segundos</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedMethod === 'PIX'
                    ? 'border-ttnb-teal bg-ttnb-teal'
                    : 'border-slate-300'
                }`}
              >
                {selectedMethod === 'PIX' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </div>

            {/* Opção Cartão de Crédito */}
            <div
              onClick={() => setSelectedMethod('CREDIT_CARD')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                selectedMethod === 'CREDIT_CARD'
                  ? 'border-ttnb-teal bg-teal-50/50 shadow-sm'
                  : 'border-slate-200/90 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Cartão de Crédito</p>
                  <p className="text-xs text-slate-500 font-medium">Simulação homologada</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedMethod === 'CREDIT_CARD'
                    ? 'border-ttnb-teal bg-ttnb-teal'
                    : 'border-slate-300'
                }`}
              >
                {selectedMethod === 'CREDIT_CARD' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Garantia LGPD */}
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Em conformidade com a LGPD • Criptografia TLS 1.3 de ponta a ponta</span>
        </div>

        {/* Botão de Prosseguir */}
        <div className="pt-4 border-t border-slate-200/80">
          <button
            onClick={handleProceedPayment}
            className="w-full bg-ttnb-orange hover:bg-[#d96728] active:scale-98 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer text-base"
          >
            <span>Pagar com {selectedMethod === 'PIX' ? 'Pix Instantâneo' : 'Cartão de Crédito'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
