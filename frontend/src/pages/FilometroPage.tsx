import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gauge, Clock, ArrowRight, RefreshCw, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { api } from '../services/api';

export const FilometroPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStatus = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      const res = await api.get('/public/terminal-status');
      setData(res.data);
    } catch (err) {
      console.error('Erro ao buscar status do filômetro', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const occupancy = data?.occupancy_rate || 32;
  const isTranquilo = occupancy <= 45;
  const isModerado = occupancy > 45 && occupancy <= 75;

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col justify-between">
      <div>
        {/* Título da Tela e Barra Superior */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-ttnb-teal text-xs font-bold uppercase tracking-wider">
              <Gauge className="w-3.5 h-3.5" />
              Filômetro Digital TTNB
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-ttnb-blue mt-1">
              Como está o movimento?
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Monitoramento em tempo real do fluxo de passageiros no Terminal Náutico da Bahia.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadStatus(true)}
            disabled={refreshing || loading}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-ttnb-teal' : ''}`} />
            <span>{refreshing ? 'Atualizando...' : 'Atualizar agora'}</span>
          </button>
        </div>

        {/* Grid de Informações Responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-6">
          {/* Card Principal de Ocupação */}
          <div className="md:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 text-center shadow-xs">
            <div className="py-2">
              <span className="text-5xl sm:text-6xl font-black text-ttnb-blue leading-none tracking-tight">
                {occupancy}%
              </span>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">
                NÍVEL DE OCUPAÇÃO ATUAL
              </p>
            </div>

            <div className="mt-4">
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  isTranquilo
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : isModerado
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {data?.occupancy_status || (isTranquilo ? 'MOVIMENTO TRANQUILO' : 'FLUXO INTENSO')}
              </div>
              <p className="text-sm font-semibold text-ttnb-blue mt-2">
                {data?.recommendation || 'Um bom momento para embarcar sem filas prolongadas.'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                {data?.description ||
                  'O fluxo de passageiros está fluindo com agilidade nos portões e catracas.'}
              </p>
            </div>

            {/* Barra de Progresso Visual de Ocupação */}
            <div className="mt-6 w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isTranquilo ? 'bg-emerald-500' : isModerado ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, occupancy)}%` }}
              ></div>
            </div>

            <div className="my-5 border-t border-slate-100"></div>

            {/* Espera Estimada */}
            <div className="flex items-center justify-between text-left text-xs">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">
                  TEMPO MÉDIO DE ESPERA
                </p>
                <p className="text-xs text-slate-500">
                  {data?.last_updated || 'Atualizado há instantes'}
                </p>
              </div>
              <span className="text-2xl font-black text-ttnb-blue">
                ~ {data?.estimated_wait_minutes || 15} min
              </span>
            </div>
          </div>

          {/* Coluna Direita: Cards complementares */}
          <div className="md:col-span-5 space-y-4">
            {/* Card Horário de Maior Movimento */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-ttnb-teal flex items-center justify-center shrink-0 border border-blue-100">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Pico Operacional
                </p>
                <p className="text-sm font-bold text-ttnb-blue mt-0.5">
                  {data?.peak_hour || 'Geralmente das 16:30 às 18:00'}
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Planeje sua chegada 20 minutos antes nestas janelas de pico para embarque prioritário.
                </p>
              </div>
            </div>

            {/* Card Dica de Embarque com Bilhete Digital */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-ttnb-teal font-bold text-xs uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                Catraca Express
              </div>
              <p className="text-sm font-bold text-ttnb-blue">
                Evite a fila do guichê físico
              </p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Passageiros com QR Code digital no smartphone embarcam diretamente pelo leitor óptico sem passar pela bilheteria.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-slate-400 mt-6">
          {data?.source || 'Dados integrados via catracas eletrônicas e telemetria de cais TTNB'}
        </p>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-200/80">
        <button
          onClick={() => navigate('/horarios')}
          className="w-full sm:w-auto sm:min-w-[280px] mx-auto bg-ttnb-orange hover:bg-[#d96728] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <span>Consultar Próximas Saídas</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
