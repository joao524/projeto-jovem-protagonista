import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ChevronDown,
  Star,
  ShieldCheck,
  Waves,
  ArrowRight,
  X,
  Compass,
  Clock,
  Phone,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 min-h-[calc(100vh-80px)] flex flex-col justify-between">
      <div>
        {/* BANNER DINÂMICO VISUALMENTE RICO E INTERATIVO */}
        {firstAlert ? (
          <div
            onClick={() => navigate('/status')}
            className="mb-6 p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/70 border-l-4 border-l-amber-500 border border-amber-200 rounded-xl shadow-xs cursor-pointer hover:shadow-sm transition-all group relative"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow-xs">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                ALERTA OPERACIONAL
              </span>

              <div className="flex items-center space-x-3">
                <span className="text-[12px] font-bold text-amber-900 group-hover:text-amber-700 flex items-center gap-1">
                  <span>Ver orientações completas</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
                <button
                  type="button"
                  onClick={handleDismiss}
                  title="Dispensar aviso"
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-2.5">
              <h3 className="text-[14px] sm:text-[15px] font-bold text-slate-900 leading-tight">
                Viagem Suspensa: {firstAlert.route}
              </h3>
              <p className="text-[12px] sm:text-[13px] text-slate-700 mt-1 leading-snug">
                Saída das <strong>{firstAlert.affected_time}</strong> cancelada: {firstAlert.reason}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-amber-200/80 flex items-center justify-between text-[11px] text-amber-900 font-semibold">
              <span className="flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-amber-700" />
                Reembolso integral garantido ou remarcação sem custo
              </span>
              <span className="underline font-bold">Toque para detalhes</span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => navigate('/horarios')}
            className="mb-6 bg-ttnb-mint/80 px-4 py-2.5 rounded-lg flex items-center justify-between cursor-pointer border border-[#d8ebe1] hover:bg-[#e2f0e8] transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <p className="text-[12px] font-bold text-ttnb-teal">
                Situação das travessias: operação normal no cais • Embarque liberado
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-ttnb-teal">
              <span>Consultar horários</span>
              <ArrowUpRight className="w-4 h-4 shrink-0" />
            </div>
          </div>
        )}

        {/* Hero Section Responsiva (Mobile empilhado, Desktop 2 colunas) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4">
          {/* Coluna de Texto e Ações (7 colunas no desktop) */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <p className="text-[11px] font-black text-ttnb-teal uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-ttnb-teal" />
                MARÉ EM MOVIMENTO — BAHIA
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.12] tracking-tight text-ttnb-blue">
                O caminho mais bonito começa{' '}
                <span className="text-ttnb-teal">por aqui.</span>
              </h1>
              <p className="text-[14px] sm:text-[15px] text-[#615f5e] mt-3 leading-relaxed max-w-xl">
                Salvador, ilhas e litoral baiano: sua próxima travessia começa no mar. Compre online em menos de 1 minuto, com assento garantido e embarque ágil por QR Code.
              </p>
            </div>

            {/* Botões de Ação Primários */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => navigate('/horarios')}
                className="bg-ttnb-orange hover:bg-[#d96728] active:scale-95 text-white font-bold text-[14px] px-6 py-3.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Comprar passagem</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/horarios')}
                className="text-ttnb-teal hover:text-ttnb-blue font-bold text-[14px] px-4 py-3 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Ver horários de hoje</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Avaliações e Rating */}
            <div className="flex items-center space-x-3 pt-2 text-[12px]">
              <div className="flex items-center space-x-1">
                <div className="flex text-ttnb-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="font-extrabold text-ttnb-gold ml-1">4.2</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-[#615f5e] font-medium">7.908 avaliações de passageiros</span>
            </div>

            {/* Seção Escolha seu Destino */}
            <div className="pt-4">
              <p className="text-[11px] font-bold text-[#615f5e] uppercase tracking-wider mb-3">
                ESCOLHA SEU DESTINO PRINCIPAL
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                <button
                  onClick={() => navigate('/horarios?destino=Mar%20Grande')}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-ttnb-blue hover:shadow-xs text-left flex items-center justify-between group transition-all cursor-pointer"
                >
                  <div>
                    <span className="text-[14px] font-bold text-ttnb-dark group-hover:text-ttnb-orange transition-colors block">
                      Mar Grande
                    </span>
                    <span className="text-[11px] text-slate-500">Ilha de Itaparica • 45 min</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-ttnb-teal group-hover:text-ttnb-orange" />
                </button>

                <button
                  onClick={() => navigate('/horarios?destino=Morro%20de%20S%C3%A3o%20Paulo')}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-ttnb-blue hover:shadow-xs text-left flex items-center justify-between group transition-all cursor-pointer"
                >
                  <div>
                    <span className="text-[14px] font-bold text-ttnb-dark group-hover:text-ttnb-orange transition-colors block">
                      Morro de São Paulo
                    </span>
                    <span className="text-[11px] text-slate-500">Catamarã Expresso • 2h30</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-ttnb-teal group-hover:text-ttnb-orange" />
                </button>
              </div>
            </div>
          </div>

          {/* Coluna Direita (Imagem de Destaque & Card Informativo - 5 colunas no desktop) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative h-64 sm:h-72 lg:h-80 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80"
                alt="Travessia Náutica Salvador"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-white text-sm font-bold drop-shadow-sm">
                  Baía de Todos os Santos • Salvador, Bahia
                </span>
              </div>
            </div>

            {/* Card com Informações Operacionais em Tempo Real */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 grid grid-cols-2 gap-3 text-[12px]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-ttnb-mint flex items-center justify-center text-ttnb-teal shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Saídas a cada 30 min</p>
                  <p className="text-[11px] text-slate-500">Das 05:00 às 20:00</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-ttnb-orange shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Suporte no Cais</p>
                  <p className="text-[11px] text-slate-500">(71) 3241-9783</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé Institucional */}
      <footer className="py-6 border-t border-slate-200 mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-slate-600 text-[12px]">
        <div>
          <p className="font-bold text-slate-800">
            Terminal Náutico da Bahia (TTNB) — Uma conexão essencial para o estado.
          </p>
          <p className="text-slate-500 text-[11px] mt-0.5">
            42 vagas por viagem · cerca de 300 mil passageiros transportados mensalmente.
          </p>
        </div>
        <p className="text-slate-400 text-[11px]">
          TTNB © 2026. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};
