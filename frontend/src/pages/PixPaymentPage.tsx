import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Hourglass,
  Copy,
  Check,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export const PixPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const toast = useToast();

  const [pixData, setPixData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 minutos
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    async function initPixSession() {
      if (!bookingId) return;
      try {
        setLoading(true);
        const res = await api.post('/payments/pix-session', { booking_id: bookingId });
        setPixData(res.data);
      } catch (err) {
        console.error('Erro ao gerar sessão Pix', err);
        toast.error('Erro ao gerar cobrança Pix.');
      } finally {
        setLoading(false);
      }
    }
    initPixSession();
  }, [bookingId]);

  // Contador regressivo ao vivo
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleCopyPix = () => {
    if (!pixData?.pix_code) return;
    navigator.clipboard.writeText(pixData.pix_code);
    setCopied(true);
    toast.info('Código Pix copiado com sucesso!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmPayment = async () => {
    try {
      setConfirming(true);
      const res = await api.post(`/payments/confirm-pix/${bookingId}`);
      const tickets = res.data.tickets;
      toast.success('Pagamento Pix confirmado com sucesso!');
      if (tickets && tickets.length > 0) {
        navigate(`/bilhete/${tickets[0].id}`);
      } else {
        navigate('/minha-conta');
      }
    } catch (err: any) {
      console.error('Erro ao confirmar Pix', err);
      toast.error('Não foi possível confirmar o Pix. Tente novamente.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-slate-500 space-y-3">
        <div className="w-8 h-8 border-3 border-ttnb-teal border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Gerando QR Code Pix instantâneo...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-between">
      <div className="text-center space-y-4">
        {/* Ícone de Ampulheta Circular Big Tech */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
          <Hourglass className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200">
            <QrCode className="w-3.5 h-3.5 text-ttnb-teal" />
            <span>PIX • AGUARDANDO PAGAMENTO</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Escaneie para pagar
          </h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Seu assento na embarcação fica reservado por 15 minutos enquanto a liquidação é processada.
          </p>
        </div>

        {/* QR Code Container Centralizado */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-3xl inline-block shadow-md hover:shadow-lg transition-shadow">
          <QRCodeSVG
            value={pixData?.pix_code || '00020126580014BR.GOV.BCB.PIX...'}
            size={180}
            level="M"
            className="rounded-lg"
          />
        </div>

        {/* Campo Copia e Cola */}
        <div className="max-w-md mx-auto bg-white border border-slate-200/90 rounded-2xl p-2.5 pl-4 flex items-center justify-between shadow-2xs">
          <div className="overflow-hidden mr-3 text-left">
            <span className="text-xs text-slate-500 font-mono truncate block">
              {pixData?.pix_code?.substring(0, 36)}...
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyPix}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar código</span>
              </>
            )}
          </button>
        </div>

        {/* Contador Regressivo */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>
            Expira em: <strong className="text-slate-900 font-mono">{timerFormatted}</strong>
          </span>
        </div>
      </div>

      {/* Ações e Simulação */}
      <div className="mt-8 pt-6 border-t border-slate-200/80 space-y-4">
        <button
          type="button"
          onClick={handleConfirmPayment}
          disabled={confirming}
          className="w-full bg-ttnb-orange hover:bg-[#d96728] active:scale-98 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60 text-base"
        >
          <span>{confirming ? 'Confirmando no Banco Central...' : 'Já fiz o Pix (Confirmar)'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Liquidação automática e emissão instantânea de QR Code fiscal</span>
        </div>
      </div>
    </div>
  );
};
