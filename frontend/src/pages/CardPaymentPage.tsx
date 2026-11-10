import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowRight, CreditCard, ShieldCheck, Check, Sparkles, AlertCircle, Compass } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

// Utilitário de detecção de bandeira por prefixo (BIN)
function detectCardBrand(digits: string): { name: string; color: string; badge: string } {
  const clean = digits.replace(/\D/g, '');
  if (/^4/.test(clean)) {
    return { name: 'VISA', color: 'from-blue-900 via-indigo-900 to-slate-900', badge: 'VISA' };
  }
  if (/^(5[1-5]|2[2-7])/.test(clean)) {
    return { name: 'MASTERCARD', color: 'from-slate-900 via-rose-950 to-orange-950', badge: 'MC' };
  }
  if (/^3[47]/.test(clean)) {
    return { name: 'AMEX', color: 'from-cyan-950 via-teal-900 to-slate-900', badge: 'AMEX' };
  }
  if (/^(4011|4389|5041|5067|5090|6362|6363)/.test(clean)) {
    return { name: 'ELO', color: 'from-amber-950 via-slate-900 to-slate-950', badge: 'ELO' };
  }
  if (/^(606282|3841)/.test(clean)) {
    return { name: 'HIPERCARD', color: 'from-red-950 via-rose-900 to-slate-900', badge: 'HIPER' };
  }
  return { name: 'TTNB CARD', color: 'from-ttnb-blue via-ttnb-dark to-[#0f2c42]', badge: 'TTNB' };
}

// Algoritmo de Luhn simples para feedback visual de validade
function isValidLuhn(digits: string): boolean {
  const clean = digits.replace(/\D/g, '');
  if (clean.length < 13) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

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
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchBooking() {
      if (!bookingId) return;
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        if (isMounted) setBooking(res.data);
      } catch (err) {
        console.error('Erro ao buscar reserva', err);
        if (isMounted) toast.error('Erro ao recuperar dados da reserva.');
      }
    }
    fetchBooking();
    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const rawDigits = cardNumber.replace(/\D/g, '');
  const brand = useMemo(() => detectCardBrand(rawDigits), [rawDigits]);
  const isCardComplete = rawDigits.length === 16;
  const isLuhnValid = useMemo(() => isValidLuhn(rawDigits), [rawDigits]);

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

  const handleFillDemoCard = () => {
    setCardName('ANA COSTA');
    setCardNumber('4532 8765 2345 9012');
    setExpiry('12 / 29');
    setCvv('789');
    toast.info('Dados de teste preenchidos com sucesso!');
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
      toast.success('Pagamento com cartão aprovado instantaneamente!');
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
    <div className="max-w-2xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-between">
      <div>
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2 border border-slate-200">
              <CreditCard className="w-3.5 h-3.5 text-ttnb-teal" />
              <span>CHECKOUT ELETRÔNICO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Cartão de Crédito
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Liquidação instantânea com emissão de bilhete digital e QR Code fiscal.
            </p>
          </div>

          <button
            type="button"
            onClick={handleFillDemoCard}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Preencher Cartão Demo</span>
          </button>
        </div>

        {/* CARTÃO VIRTUAL INTERATIVO 3D (FLIP CARD) */}
        <div className="my-6 perspective-[1000px] max-w-sm sm:max-w-md mx-auto">
          <div
            className={`relative w-full aspect-[1.586] rounded-2xl shadow-xl transition-transform duration-700 preserve-3d text-white select-none ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* FRENTE DO CARTÃO */}
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-tr ${brand.color} p-6 flex flex-col justify-between backface-hidden border border-white/10 shadow-2xl overflow-hidden`}
            >
              {/* Efeito de Reflexo Metálico */}
              <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />

              {/* Topo: Chip + Terminal Náutico + Bandeira */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-8 rounded-md bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 border border-amber-500/50 flex flex-col justify-around p-1 shadow-xs">
                    <div className="h-0.5 bg-amber-700/40 rounded-full" />
                    <div className="h-0.5 bg-amber-700/40 rounded-full" />
                    <div className="h-0.5 bg-amber-700/40 rounded-full" />
                  </div>
                  <Compass className="w-5 h-5 text-white/40" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black tracking-widest px-2.5 py-0.5 rounded-md bg-white/15 backdrop-blur-xs">
                    {brand.name}
                  </span>
                </div>
              </div>

              {/* Meio: Número do Cartão */}
              <div>
                <p className="text-lg sm:text-xl font-mono tracking-widest font-black drop-shadow-sm">
                  {cardNumber || '•••• •••• •••• ••••'}
                </p>
                {isCardComplete && (
                  <div className="flex items-center gap-1 text-[11px] mt-1 text-emerald-300 font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>{isLuhnValid ? 'Número verificado' : 'Dígito simulado'}</span>
                  </div>
                )}
              </div>

              {/* Base: Titular e Validade */}
              <div className="flex items-end justify-between text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/60 block">
                    TITULAR DO CARTÃO
                  </span>
                  <span className="font-bold tracking-wider uppercase font-mono truncate block max-w-[200px]">
                    {cardName || 'NOME COMPLETO'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-white/60 block">
                    VALIDADE
                  </span>
                  <span className="font-bold font-mono">
                    {expiry || 'MM/AA'}
                  </span>
                </div>
              </div>
            </div>

            {/* VERSO DO CARTÃO (GIRADO 180 GRAUS) */}
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-tr ${brand.color} flex flex-col justify-between py-6 backface-hidden rotate-y-180 border border-white/10 shadow-2xl overflow-hidden`}
            >
              {/* Tarja Magnética */}
              <div className="w-full h-11 bg-slate-950 mt-1 shadow-inner" />

              {/* Área da Assinatura e CVV */}
              <div className="px-6">
                <div className="flex items-center justify-between text-[10px] text-white/60 mb-1">
                  <span>ASSINATURA AUTORIZADA</span>
                  <span>CÓDIGO DE SEGURANÇA</span>
                </div>
                <div className="bg-white/90 h-9 rounded-md flex items-center justify-end px-3 shadow-inner">
                  <span className="text-slate-900 font-mono font-black tracking-widest text-sm">
                    {cvv || '•••'}
                  </span>
                </div>
              </div>

              {/* Informações Institucionais do Verso */}
              <div className="px-6 text-[9px] text-white/50 text-center leading-tight">
                Terminal Náutico da Bahia • Transação protegida por criptografia de ponta a ponta.
              </div>
            </div>
          </div>
        </div>

        {/* Card Resumo do Pagamento */}
        <div className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
              VALOR A DEBITAR
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">
              {booking?.destination ? `Travessia Salvador ➔ ${booking.destination}` : 'Emissão de passagem'}
            </span>
          </div>
          <span className="text-2xl font-black text-slate-900">
            R$ {totalAmount.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Formulário Interativo */}
        <form onSubmit={handleProcessPayment} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
              Nome impresso no cartão
            </label>
            <input
              type="text"
              placeholder="Ex: ANA COSTA"
              value={cardName}
              onFocus={() => setIsFlipped(false)}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
              className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold uppercase focus:border-ttnb-blue focus:outline-none shadow-2xs"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
              Número do cartão de crédito
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                value={cardNumber}
                onFocus={() => setIsFlipped(false)}
                onChange={handleCardNumberChange}
                className="w-full p-3.5 pr-14 bg-white border border-slate-200 rounded-xl text-sm font-mono font-semibold focus:border-ttnb-blue focus:outline-none shadow-2xs"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black font-mono px-2 py-1 bg-slate-100 rounded-md border border-slate-200 text-slate-600">
                {brand.badge}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                Validade (MM / AA)
              </label>
              <input
                type="text"
                placeholder="12 / 29"
                maxLength={7}
                value={expiry}
                onFocus={() => setIsFlipped(false)}
                onChange={handleExpiryChange}
                className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-semibold focus:border-ttnb-blue focus:outline-none shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                Código CVV (Verso)
              </label>
              <input
                type="password"
                placeholder="•••"
                maxLength={4}
                value={cvv}
                onFocus={() => setIsFlipped(true)}
                onBlur={() => setIsFlipped(false)}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-semibold focus:border-ttnb-blue focus:outline-none shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
              Opção de parcelamento
            </label>
            <select
              value={installments}
              onChange={(e) => setInstallments(Number(e.target.value))}
              className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-ttnb-blue focus:outline-none shadow-2xs"
            >
              <option value={1}>
                1x de R$ {totalAmount.toFixed(2).replace('.', ',')} (à vista sem juros)
              </option>
              <option value={2}>
                2x de R$ {(totalAmount / 2).toFixed(2).replace('.', ',')} (sem juros)
              </option>
            </select>
          </div>

          {/* Garantia e Certificação */}
          <div className="pt-2 flex items-center justify-center space-x-2 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ambiente seguro • Criptografia AES-256 e conformidade PCI-DSS</span>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ttnb-orange hover:bg-[#d96728] active:scale-98 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60 text-base"
            >
              <span>
                {loading ? 'Processando transação segura...' : `Pagar R$ ${totalAmount.toFixed(2).replace('.', ',')}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
