import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowRight, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export const CardPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const toast = useToast();

  const [booking, setBooking] = useState<any>(null);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) return;
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data);
      } catch (err) {
        console.error('Erro ao buscar reserva', err);
        toast.error('Erro ao recuperar reserva.');
      }
    }
    fetchBooking();
  }, [bookingId]);

  // Formatação do cartão
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    val = val.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      val = `${val.substring(0, 2)} / ${val.substring(2, 4)}`;
    }
    setExpiry(val);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardName.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      toast.warning('Preencha todos os campos do cartão para prosseguir.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/payments/process-card', {
        booking_id: bookingId,
        card_number: cardNumber.replace(/\s/g, ''),
        cardholder_name: cardName,
        expiry_month_year: expiry,
        cvv: cvv,
        installments: installments,
      });

      const tickets = res.data.tickets;
      toast.success('Pagamento com cartão aprovado com sucesso!');
      if (tickets && tickets.length > 0) {
        navigate(`/bilhete/${tickets[0].id}`);
      } else {
        navigate('/minha-conta');
      }
    } catch (err: any) {
      console.error('Erro ao processar cartão', err);
      toast.error(err.response?.data?.detail || 'Não foi possível processar o cartão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = booking?.total_amount || 8.0;

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-between">
      <div>
        {/* Header Big Tech */}
        <div className="pb-6 border-b border-slate-200/80">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2 border border-slate-200">
            <CreditCard className="w-3.5 h-3.5 text-ttnb-teal" />
            <span>PAGAMENTO COM CARTÃO</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Cartão de Crédito
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Simulação de pagamento aprovada sem cobrança real.
          </p>
        </div>

        {/* Card Valor Total */}
        <div className="mt-6 p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
              VALOR DA TRANSAÇÃO
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">Emissão imediata de bilhete</span>
          </div>
          <span className="text-2xl font-black text-slate-900">
            R$ {totalAmount.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Formulário do Cartão */}
        <form onSubmit={handleProcessPayment} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
              Nome impresso no cartão
            </label>
            <input
              type="text"
              placeholder="Ex: ANA COSTA"
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
              className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold uppercase focus:border-ttnb-blue focus:outline-none shadow-2xs"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
              Número do cartão
            </label>
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              value={cardNumber}
              onChange={handleCardNumberChange}
              className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-semibold focus:border-ttnb-blue focus:outline-none shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                Validade (MM / AA)
              </label>
              <input
                type="text"
                placeholder="12 / 28"
                maxLength={7}
                value={expiry}
                onChange={handleExpiryChange}
                className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-semibold focus:border-ttnb-blue focus:outline-none shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                Código CVV
              </label>
              <input
                type="password"
                placeholder="123"
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-semibold focus:border-ttnb-blue focus:outline-none shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
              Parcelamento
            </label>
            <select
              value={installments}
              onChange={(e) => setInstallments(Number(e.target.value))}
              className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-ttnb-blue focus:outline-none shadow-2xs"
            >
              <option value={1}>
                1x de R$ {totalAmount.toFixed(2).replace('.', ',')} (sem juros)
              </option>
              <option value={2}>
                2x de R$ {(totalAmount / 2).toFixed(2).replace('.', ',')} (sem juros)
              </option>
            </select>
          </div>

          {/* Garantia de Segurança */}
          <div className="pt-2 flex items-center justify-center space-x-2 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Transação segura • Tokenização simulada sem cobrança bancária</span>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ttnb-orange hover:bg-[#d96728] active:scale-98 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60 text-base"
            >
              <span>{loading ? 'Processando transação...' : `Confirmar R$ ${totalAmount.toFixed(2).replace('.', ',')}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
