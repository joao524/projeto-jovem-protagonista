import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const CardPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const [booking, setBooking] = useState<any>(null);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) return;
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data);
      } catch (err) {
        console.error('Erro ao buscar reserva', err);
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
    setErrorMsg('');

    if (!cardName.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      setErrorMsg('Preencha todos os campos do cartão para prosseguir.');
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
      if (tickets && tickets.length > 0) {
        navigate(`/bilhete/${tickets[0].id}`);
      } else {
        navigate('/minha-conta');
      }
    } catch (err) {
      console.error('Erro ao processar cartão', err);
      setErrorMsg('Não foi possível processar o cartão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = booking?.total_amount || 8.0;

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 py-6 flex flex-col justify-between">
      <div>
        {/* Título da Tela */}
        <div className="mt-1">
          <h1 className="text-[28px] font-bold text-ttnb-blue">
            Cartão de crédito.
          </h1>
        </div>

        {/* Card Valor Total (Figma: Rectangle 20) */}
        <div className="mt-3.5 bg-white border border-ttnb-border rounded-md p-3.5 flex items-center justify-between shadow-2xs">
          <span className="text-[12px] font-bold text-ttnb-blue">Valor total</span>
          <span className="text-[20px] font-extrabold text-ttnb-blue">
            R$ {totalAmount.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Formulário do Cartão */}
        <form onSubmit={handleProcessPayment} className="mt-4 space-y-3.5">
          <div>
            <label className="text-[11px] font-bold text-ttnb-blue block mb-1">
              Nome impresso no cartão
            </label>
            <input
              type="text"
              placeholder="Informe o nome como consta no cartão"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full p-3 bg-white border border-ttnb-border rounded-md text-[13px] uppercase focus:outline-none focus:border-ttnb-blue"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-ttnb-blue block mb-1">
              Número do cartão
            </label>
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
              className="w-full p-3 bg-white border border-ttnb-border rounded-md text-[13px] font-mono tracking-wider focus:outline-none focus:border-ttnb-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-ttnb-blue block mb-1">
                Validade
              </label>
              <input
                type="text"
                placeholder="MM / AA"
                value={expiry}
                onChange={handleExpiryChange}
                maxLength={7}
                className="w-full p-3 bg-white border border-ttnb-border rounded-md text-[13px] text-center font-mono focus:outline-none focus:border-ttnb-blue"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-ttnb-blue block mb-1">
                CVV
              </label>
              <input
                type="password"
                placeholder="•••"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                maxLength={4}
                className="w-full p-3 bg-white border border-ttnb-border rounded-md text-[13px] text-center font-mono tracking-widest focus:outline-none focus:border-ttnb-blue"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-ttnb-blue block mb-1">
              Parcelas
            </label>
            <div className="w-full p-3 bg-white border border-ttnb-border rounded-md text-[13px] font-medium text-ttnb-dark flex items-center justify-between">
              <span>1x de R$ {totalAmount.toFixed(2).replace('.', ',')} sem juros</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
              {errorMsg}
            </div>
          )}

          {/* Banner LGPD (Figma: Rectangle 20 + Lock_Slash) */}
          <div className="mt-4 bg-[#f9f9f9] border border-[#e5e5e5] rounded-md p-3 flex items-center space-x-2 text-[11px] text-[#615f5e]">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="leading-snug">
              Política de privacidade e LGPD, dados não retidos pelo sistema.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-ttnb-orange hover:bg-[#d96728] text-white font-bold py-3.5 px-4 rounded-ttnb-btn flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
          >
            <span>{loading ? 'Validando transação...' : 'Ir para passagem'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="mt-6 pt-4 text-center">
        <p className="text-[10px] text-[#887878]">
          Ambiente de teste e homologação sem cobrança real.
        </p>
      </div>
    </div>
  );
};
