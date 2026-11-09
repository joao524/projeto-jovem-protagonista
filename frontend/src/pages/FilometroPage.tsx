import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gauge, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const FilometroPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatus() {
      try {
        setLoading(true);
        const res = await api.get('/public/terminal-status');
        setData(res.data);
      } catch (err) {
        console.error('Erro ao buscar status do filômetro', err);
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
  }, []);

  return (
    <div className="max-w-3xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 py-6 flex flex-col justify-between">
      <div>
        {/* Título da Tela */}
        <div className="mt-1">
          <p className="text-[11px] font-bold text-ttnb-teal uppercase tracking-wider">
            ACOMPANHE O TERMINAL
          </p>
          <h1 className="text-[28px] font-bold text-ttnb-blue mt-0.5">
            Como está o movimento?
          </h1>
        </div>

        {/* Card Principal de Ocupação (Figma: Rectangle 20) */}
        <div className="mt-4 bg-white border border-ttnb-border rounded-md p-5 text-center shadow-2xs">
          {/* Indicador Numérico de Nível de Ocupação */}
          <div className="py-2">
            <span className="text-[44px] font-black text-ttnb-blue leading-none tracking-tight">
              {data?.occupancy_rate || 32}%
            </span>
            <p className="text-[10px] font-bold text-[#887878] uppercase tracking-wider mt-1">
              NÍVEL DE OCUPAÇÃO
            </p>
          </div>

          <div className="mt-2">
            <p className="text-[14px] font-bold text-emerald-800 tracking-wide uppercase">
              {data?.occupancy_status || 'MOVIMENTO TRANQUILO'}
            </p>
            <p className="text-[13px] font-semibold text-ttnb-blue mt-1">
              {data?.recommendation || 'Um bom momento para embarcar.'}
            </p>
            <p className="text-[11px] text-[#615f5e] mt-1.5 max-w-xs mx-auto leading-relaxed">
              {data?.description ||
                'O fluxo está leve. Chegue com antecedência para organizar seu embarque.'}
            </p>
          </div>

          {/* Barra de Progresso Visual de Ocupação */}
          <div className="mt-5 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${data?.occupancy_rate || 32}%` }}
            ></div>
          </div>

          <div className="my-4 border-t border-[#f0ece9]"></div>

          {/* Espera Estimada */}
          <div className="flex items-center justify-between text-left text-[12px]">
            <div>
              <p className="text-[10px] font-bold text-[#887878] uppercase">
                ESPERA ESTIMADA
              </p>
              <p className="text-[11px] text-[#887878]">
                {data?.last_updated || 'Atualizada há 8 min'}
              </p>
            </div>
            <span className="text-[18px] font-bold text-ttnb-blue">
              ~ {data?.estimated_wait_minutes || 15} min
            </span>
          </div>
        </div>

        {/* Card Horário de Maior Movimento (Figma: Rectangle 22 + Timer) */}
        <div className="mt-3.5 bg-white border border-ttnb-border rounded-md p-3.5 flex items-center space-x-3 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-ttnb-teal flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[12px] font-bold text-ttnb-blue">
              Horário de maior movimento
            </p>
            <p className="text-[11px] text-[#615f5e]">
              {data?.peak_hour || 'Geralmente por volta das 16:00.'}
            </p>
          </div>
        </div>

        <p className="text-[10px] text-center text-[#887878] mt-4">
          {data?.source ||
            'Dados obtidos pelo sistema de bilhetagem e monitoramento CFTV'}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-[#f0ece9]">
        <button
          onClick={() => navigate('/horarios')}
          className="w-full bg-ttnb-orange hover:bg-[#d96728] text-white font-bold py-3.5 px-4 rounded-ttnb-btn flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <span>Ver horários e passagens</span>
        </button>
      </div>
    </div>
  );
};
