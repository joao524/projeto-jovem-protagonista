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
  Sparkles,
  Anchor,
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
    <div className="min-h-screen bg-[#fffefa] text-slate-900">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* BANNER DE ALERTA DINÂMICO ESTILO BIG TECH (COM ESPAÇAMENTO E RESPIRAÇÃO) */}
        {firstAlert ? (
          <div className="pt-6 sm:pt-8">
            <div
              onClick={() => navigate('/status')}
              className="p-5 sm:p-6 bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 border border-amber-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group relative"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    ALERTA OPERACIONAL
                  </span>
                  <span className="text-xs text-amber-800/80 font-medium hidden sm:inline">
                    Capitania dos Portos da Bahia
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-xs sm:text-sm font-bold text-amber-900 group-hover:text-amber-700 flex items-center gap-1.5">
                    <span>Ver orientações completas</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    title="Dispensar aviso"
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-black/5 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  Viagem Suspensa: {firstAlert.route}
                </h3>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed max-w-3xl">
                  Saída das <strong>{firstAlert.affected_time}</strong> cancelada: {firstAlert.reason}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-900 font-medium">
                <span className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-amber-600" />
                  Reembolso integral garantido ou remarcação sem custo no terminal.
                </span>
                <span className="underline font-bold text-amber-950">Toque para detalhes</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-6 sm:pt-8">
            <div
              onClick={() => navigate('/horarios')}
              className="py-3 px-5 bg-emerald-50/70 border border-emerald-200/60 rounded-full flex items-center justify-between cursor-pointer hover:bg-emerald-50 transition-all shadow-2xs"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <p className="text-xs sm:text-sm font-semibold text-emerald-900">
                  Operação regular no cais de Salvador • Saídas a cada 30 minutos
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <span className="hidden sm:inline">Consultar saídas</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" />
              </div>
            </div>
          </div>
        )}

        {/* HERO SECTION NO ESTILO BIG TECH (AMPLO ESPAÇAMENTO, TIPOGRAFIA REFINADA, RESPIRO) */}
        <section className="py-12 sm:py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Coluna Esquerda: Conteúdo & Ações (7 colunas) */}
            <div className="lg:col-span-7">
              {/* Badge Pílula Minimalista */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wider uppercase mb-6 border border-slate-200/80">
                <Compass className="w-3.5 h-3.5 text-ttnb-teal" />
                <span>MARÉ EM MOVIMENTO — BAHIA</span>
              </div>

              {/* Título Principal com Tipografia de Alto Impacto */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] mb-6">
                O caminho mais bonito começa{' '}
                <span className="text-ttnb-teal">por aqui.</span>
              </h1>

              {/* Subtítulo Arejado */}
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl mb-8">
                Salvador, ilhas e litoral baiano: sua próxima travessia começa no mar. Compre online em menos de 1 minuto, com assento garantido e embarque ágil por QR Code.
              </p>

              {/* Linha de Botões de Ação com Espaçamento Confortável */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <button
                  onClick={() => navigate('/horarios')}
                  className="bg-[#ed7837] hover:bg-[#d96728] active:scale-98 text-white font-bold text-sm sm:text-base px-8 py-4 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <span>Comprar passagem</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/horarios')}
                  className="bg-white hover:bg-slate-50 active:scale-98 text-slate-800 font-semibold text-sm sm:text-base px-7 py-4 rounded-full border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Ver horários de hoje</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Avaliações e Social Proof */}
              <div className="flex items-center space-x-3 mb-10 text-xs sm:text-sm text-slate-500">
                <div className="flex items-center space-x-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-slate-900">4.2</span>
                <span>•</span>
                <span>7.908 avaliações de passageiros</span>
              </div>

              {/* Seletor de Destinos em Cards Modernos com Margem Superior */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  ESCOLHA SEU DESTINO PRINCIPAL
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  <button
                    onClick={() => navigate('/horarios?destino=Mar%20Grande')}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-ttnb-blue hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer shadow-xs"
                  >
                    <div>
                      <span className="text-base font-bold text-slate-900 group-hover:text-ttnb-orange transition-colors block">
                        Mar Grande
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5 block">
                        Ilha de Itaparica • 45 min
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-orange-50 flex items-center justify-center transition-colors">
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-ttnb-orange transition-colors" />
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/horarios?destino=Morro%20de%20S%C3%A3o%20Paulo')}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-ttnb-blue hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer shadow-xs"
                  >
                    <div>
                      <span className="text-base font-bold text-slate-900 group-hover:text-ttnb-orange transition-colors block">
                        Morro de São Paulo
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5 block">
                        Catamarã Expresso • 2h30
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-orange-50 flex items-center justify-center transition-colors">
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-ttnb-orange transition-colors" />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Imagem Náutica com Card Flutuante (5 colunas) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/70 aspect-4/3 lg:aspect-auto lg:h-[480px]">
                <img
                  src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80"
                  alt="Travessia Náutica Salvador"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-6">
                  <div>
                    <span className="text-xs font-semibold text-ttnb-mint uppercase tracking-wider block">
                      Salvador, Bahia
                    </span>
                    <h4 className="text-lg font-bold text-white mt-0.5">
                      Baía de Todos os Santos
                    </h4>
                  </div>
                </div>
              </div>

              {/* Card Flutuante com Informações em Tempo Real */}
              <div className="mt-4 p-4 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xs grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-ttnb-teal shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Saídas regulares</p>
                    <p className="text-[11px] text-slate-500">A cada 30 minutos</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50/70 border border-orange-100/50 flex items-center justify-center text-ttnb-orange shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Suporte ao Passageiro</p>
                    <p className="text-[11px] text-slate-500">(71) 3241-9783</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RODAPÉ BIG TECH AREJADO E ELEGANTE */}
        <footer className="py-12 border-t border-slate-200/70 mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-800">
              Terminal Náutico da Bahia (TTNB) — Uma conexão essencial para o estado da Bahia.
            </p>
            <p className="text-slate-500 mt-1">
              Capacidade regular de 42 vagas por viagem · Mais de 300 mil passageiros transportados mensalmente.
            </p>
          </div>
          <p className="text-slate-400">
            TTNB © 2026. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
};
