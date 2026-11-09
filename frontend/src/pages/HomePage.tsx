import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ChevronDown,
  Star,
  AlertTriangle,
  ShieldCheck,
  Wind,
  Waves,
  BellRing,
  ArrowRight,
  X,
} from 'lucide-react';
import { api } from '../services/api';

interface HomePageProps {
  onOpenMenu: () => void;
}

export const HomePage: React.FC<HomePageProps> = () => {
  const navigate = useNavigate();
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('ttnb_alert_dismissed') === 'true';
  });

  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await api.get('/operations/active-alerts');
        setActiveAlerts(res.data || []);
      } catch (err) {
        setActiveAlerts([]);
      }
    }
    loadAlerts();
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    sessionStorage.setItem('ttnb_alert_dismissed', 'true');
  };

  const firstAlert = activeAlerts.length > 0 && !isDismissed ? activeAlerts[0] : null;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#fffefa] flex flex-col justify-between">
      <div>
        {/* BANNER DINÂMICO VISUALMENTE RICO E INTERATIVO */}
        {firstAlert ? (
          <div
            onClick={() => navigate('/status')}
            className="m-3 p-3.5 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/70 border-l-4 border-l-amber-500 border border-amber-200 rounded-md shadow-xs cursor-pointer hover:shadow-sm transition-all group relative"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                ALERTA OPERACIONAL
              </span>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-amber-900 group-hover:text-amber-700 flex items-center gap-1">
                  <span>Ver detalhes</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
                <button
                  type="button"
                  onClick={handleDismiss}
                  title="Dispensar aviso"
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-2">
              <h3 className="text-[13px] font-bold text-slate-900 leading-tight">
                Viagem Suspensa: {firstAlert.route}
              </h3>
              <p className="text-[11px] text-slate-700 mt-1 leading-snug">
                Saída das <strong>{firstAlert.affected_time}</strong> cancelada: {firstAlert.reason}
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-amber-200/80 flex items-center justify-between text-[10px] text-amber-900 font-semibold">
              <span className="flex items-center gap-1">
                <Waves className="w-3 h-3 text-amber-700" />
                Reembolso integral garantido
              </span>
              <span className="underline font-bold">Toque para orientações</span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => navigate('/horarios')}
            className="bg-ttnb-mint px-4 py-2.5 flex items-center justify-between cursor-pointer border-b border-[#d8ebe1] hover:bg-[#e2f0e8] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <p className="text-[11px] font-bold text-ttnb-teal">
                Situação das travessias: operação normal no cais
              </p>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-ttnb-teal shrink-0" />
          </div>
        )}

        {/* Hero Section */}
        <div className="px-5 pt-5 pb-4">
          <p className="text-[11px] font-bold text-ttnb-teal uppercase tracking-wider mb-2">
            MARÉ EM MOVIMENTO
          </p>
          <h1 className="text-[32px] font-bold leading-[1.15] tracking-tight text-ttnb-blue">
            O caminho mais bonito começa{' '}
            <span className="text-ttnb-teal">por aqui.</span>
          </h1>
          <p className="text-[13px] text-[#615f5e] mt-3 leading-relaxed">
            Salvador, ilhas e litoral baiano: sua próxima travessia começa no mar.
          </p>

          {/* Botões de Ação Primários */}
          <div className="flex items-center space-x-3 mt-5">
            <button
              onClick={() => navigate('/horarios')}
              className="bg-ttnb-orange hover:bg-[#d96728] text-white font-bold text-[13px] px-5 py-3 rounded-ttnb-btn flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>Comprar passagem</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/horarios')}
              className="text-ttnb-teal hover:text-ttnb-blue font-bold text-[13px] px-3 py-3 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Ver horários</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Imagem de Destaque / Banner Náutico */}
        <div className="px-5 py-2">
          <div className="relative h-44 rounded-ttnb-card overflow-hidden shadow-xs border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80"
              alt="Travessia Náutica Salvador"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-3">
              <span className="text-white text-xs font-semibold drop-shadow-sm">
                Baía de Todos os Santos
              </span>
            </div>
          </div>

          {/* Avaliações e Rating (Figma: 4.2 / 7.908 avaliações) */}
          <div className="flex items-center justify-between mt-3 px-1 text-[11px]">
            <div className="flex items-center space-x-1">
              <div className="flex text-ttnb-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-bold text-ttnb-gold ml-1">4.2</span>
            </div>
            <span className="text-[#615f5e]">7.908 avaliações</span>
          </div>
        </div>

        {/* Escolha seu Destino */}
        <div className="mt-4 bg-ttnb-mintCard border-y border-[#dce8e2] px-5 py-4">
          <p className="text-[10px] font-bold text-[#615f5e] uppercase tracking-wider mb-2.5">
            ESCOLHA SEU DESTINO
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/horarios?destino=Mar%20Grande')}
              className="bg-white p-3 rounded-md border border-[#cddcd3] hover:border-ttnb-blue text-left flex items-center justify-between group transition-all shadow-2xs cursor-pointer"
            >
              <span className="text-[13px] font-bold text-ttnb-dark group-hover:text-ttnb-orange transition-colors">
                Mar Grande
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-ttnb-teal group-hover:text-ttnb-orange" />
            </button>

            <button
              onClick={() => navigate('/horarios?destino=Morro%20de%20S%C3%A3o%20Paulo')}
              className="bg-white p-3 rounded-md border border-[#cddcd3] hover:border-ttnb-blue text-left flex items-center justify-between group transition-all shadow-2xs cursor-pointer"
            >
              <span className="text-[13px] font-bold text-ttnb-dark group-hover:text-ttnb-orange transition-colors">
                Morro de São Paulo
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-ttnb-teal group-hover:text-ttnb-orange" />
            </button>
          </div>
        </div>
      </div>

      {/* Rodapé Institucional */}
      <div className="px-5 py-6 text-left border-t border-[#f0ece9] mt-6">
        <p className="text-[15px] font-bold text-ttnb-dark leading-snug">
          Uma conexão essencial para a Bahia.
        </p>
        <p className="text-[11px] text-[#615f5e] mt-1">
          42 vagas por viagem · cerca de 300 mil passageiros/mês
        </p>
        <p className="text-[10px] text-[#887878] mt-3">
          Terminal Náutico da Bahia (TTNB) © 2026. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};
