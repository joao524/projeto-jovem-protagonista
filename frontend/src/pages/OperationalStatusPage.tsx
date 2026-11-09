import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Phone, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const OperationalStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await api.get('/public/operational-status');
        setStatus(res.data);
      } catch (err) {
        console.error('Erro ao carregar status operacional', err);
      }
    }
    loadStatus();
  }, []);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#fffefa] px-5 py-4 flex flex-col justify-between">
      <div>
        {/* Ícone Circular de Alerta (Figma: Ellipse 1 + !) */}
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mt-2">
          <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
        </div>

        <div className="mt-4">
          <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">
            ATUALIZAÇÃO OPERACIONAL
          </p>
          <h1 className="text-[26px] font-bold text-ttnb-blue mt-0.5 leading-tight">
            {status?.title || 'Travessias suspensas temporariamente.'}
          </h1>
          <p className="text-[12px] text-[#615f5e] mt-2 leading-relaxed">
            {status?.description ||
              'Devido às fortes chuvas e às condições do mar, as saídas entre Salvador e Morro de São Paulo estão suspensas até nova avaliação.'}
          </p>
        </div>

        {/* Linha de Timestamp da Última Atualização */}
        <div className="my-4 py-2 border-y border-[#ece8e5] flex justify-between items-center text-[11px]">
          <span className="font-bold text-[#887878] uppercase">ÚLTIMA ATUALIZAÇÃO</span>
          <span className="font-bold text-ttnb-blue">
            {status?.last_update || 'Hoje, 14:20'}
          </span>
        </div>

        {/* Card O Que Fazer Agora? (Figma: Rectangle 22) */}
        <div className="bg-white border border-ttnb-border rounded-md p-4 shadow-2xs">
          <h2 className="text-[13px] font-bold text-ttnb-blue mb-2">
            O que fazer agora?
          </h2>
          <ul className="text-[11px] text-[#615f5e] space-y-2 list-disc list-inside leading-relaxed">
            {status?.instructions?.map((inst: string, i: number) => (
              <li key={i}>{inst}</li>
            )) || (
              <>
                <li>Não se dirija ao embarque até nova atualização;</li>
                <li>Entre em contato com a empresa onde comprou sua passagem;</li>
                <li>Bilhetes e remarcações devem ser tratados com o operador.</li>
              </>
            )}
          </ul>
        </div>

        {/* Informações do Terminal (Figma: Rectangle 20) */}
        <div className="mt-3.5 bg-[#f9f9f9] border border-[#e5e5e5] rounded-md p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#887878] uppercase">
              INFORMAÇÕES DO TERMINAL
            </p>
            <p className="text-[14px] font-bold text-ttnb-blue mt-0.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-ttnb-teal" />
              {status?.terminal_phone || '(71) 3241 - 9783'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[#f0ece9]">
        <button
          onClick={() => navigate('/horarios')}
          className="w-full bg-ttnb-orange hover:bg-[#d96728] text-white font-bold py-3.5 px-4 rounded-ttnb-btn flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <span>Ver outras travessias</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
