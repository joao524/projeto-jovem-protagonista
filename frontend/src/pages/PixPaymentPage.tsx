import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Hourglass, Copy, Check, Clock, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const PixPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();

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
  const timerFormatted = `${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;

  const handleCopyPix = () => {
    if (!pixData?.pix_code) return;
    navigator.clipboard.writeText(pixData.pix_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmPayment = async () => {
    try {
      setConfirming(true);
      const res = await api.post(`/payments/confirm-pix/${bookingId}`);
      const tickets = res.data.tickets;
      if (tickets && tickets.length > 0) {
        navigate(`/bilhete/${tickets[0].id}`);
      } else {
        navigate('/minha-conta');
      }
    } catch (err) {
      console.error('Erro ao confirmar Pix', err);
      alert('Não foi possível confirmar o Pix. Tente novamente.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#fffefa] flex items-center justify-center text-[#615f5e]">
        Gerando QR Code Pix...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#fffefa] px-5 py-4 flex flex-col justify-between">
      <div className="text-center">
        {/* Ícone de Ampulheta Circular (Figma: Ellipse 1 + Hourglass) */}
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mt-2">
          <Hourglass className="w-7 h-7" />
        </div>

        <p className="text-[11px] font-bold text-[#615f5e] uppercase tracking-wider mt-3">
          PIX, AGUARDANDO PAGAMENTO
        </p>
        <h1 className="text-[28px] font-bold text-ttnb-blue mt-0.5">
          Escaneie para pagar.
        </h1>
        <p className="text-[12px] text-[#615f5e] mt-1 max-w-xs mx-auto">
          Seu lugar fica reservado por 15 minutos enquanto o pagamento é concluído.
        </p>

        {/* QR Code Container Centralizado (Figma: qr_mare_em_movimento 1) */}
        <div className="mt-5 p-4 bg-white border border-[#cfcfcf] rounded-md inline-block shadow-xs">
          <QRCodeSVG
            value={pixData?.pix_code || '00020126580014BR.GOV.BCB.PIX...'}
            size={160}
            level="M"
          />
        </div>

        {/* Campo Copia e Cola (Figma: Rectangle 19) */}
        <div className="mt-4 bg-white border border-ttnb-border rounded-md p-2 pl-3 flex items-center justify-between text-left shadow-2xs">
          <div className="overflow-hidden mr-2">
            <span className="text-[11px] text-[#615f5e] font-mono truncate block">
              {pixData?.pix_code?.substring(0, 32)}...
            </span>
          </div>
          <button
            onClick={handleCopyPix}
            className="bg-slate-100 hover:bg-slate-200 text-ttnb-blue font-bold text-[12px] px-3 py-1.5 rounded-sm flex items-center gap-1 shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Card Valor do Pix (Figma: Rectangle 17) */}
        <div className="mt-3.5 bg-white border border-ttnb-border rounded-md p-3.5 flex items-center justify-between shadow-2xs">
          <span className="text-[12px] font-bold text-ttnb-blue">Valor do Pix</span>
          <span className="text-[20px] font-extrabold text-ttnb-blue">
            R$ {pixData?.amount ? pixData.amount.toFixed(2).replace('.', ',') : '8,00'}
          </span>
        </div>

        {/* Temporizador Regressivo de Expiração (Figma: Alarm_12_Fill) */}
        <div className="mt-4 flex items-center justify-center space-x-1.5 text-amber-800 text-[12px] font-bold">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Expira em {timerFormatted}</span>
        </div>

        <p className="text-[11px] text-[#887878] mt-2">
          Leia o QR code para efetuar o pagamento
        </p>
      </div>

      {/* Botão de Prosseguir / Ir para Passagem */}
      <div className="mt-6 pt-4 border-t border-[#f0ece9]">
        <button
          onClick={handleConfirmPayment}
          disabled={confirming}
          className="w-full bg-ttnb-orange hover:bg-[#d96728] text-white font-bold py-3.5 px-4 rounded-ttnb-btn flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
        >
          <span>{confirming ? 'Emitindo bilhete...' : 'Ir para passagem'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
