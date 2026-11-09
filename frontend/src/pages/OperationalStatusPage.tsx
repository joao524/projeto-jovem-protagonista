import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Phone,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  PlusCircle,
  X,
  RefreshCw,
  Wind,
  Waves,
  Compass,
  ArrowLeft,
  LifeBuoy,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const DEFAULT_ALERTS = [
  {
    id: 'susp-1',
    route: 'Salvador ➔ Morro de São Paulo',
    affected_time: '14:30',
    reason: 'Ventos fortes no trecho oceânico acima de 28 nós e ondas de 2.5m.',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    suspended_by: 'Capitania dos Portos / Supervisão TTNB',
    suspended_at: new Date().toISOString(),
    free_refund_enabled: true,
  },
];

export const OperationalStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeAlerts, setActiveAlerts] = useState<any[]>(DEFAULT_ALERTS);
  const [loading, setLoading] = useState(false);
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);

  // Form de Suspensão
  const [route, setRoute] = useState('Salvador ➔ Morro de São Paulo');
  const [affectedTime, setAffectedTime] = useState('14:30');
  const [reason, setReason] = useState('Ventos fortes no trecho oceânico acima de 28 nós');
  const [severity, setSeverity] = useState('CRITICAL');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/operations/active-alerts');
      if (res.data && res.data.length > 0) {
        setActiveAlerts(res.data);
      }
    } catch (err) {
      // Mantém DEFAULT_ALERTS como fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleSuspendTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/operations/suspend-trip', {
        route,
        affected_time: affectedTime,
        reason,
        severity,
        suspended_by: 'Supervisor de Operações',
      });
      toast.success('Suspensão de viagem registrada no sistema.');
      setShowSupervisorModal(false);
      fetchAlerts();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao registrar suspensão de viagem.');
    }
  };

  const handleResumeTrip = async (suspensionId: string) => {
    try {
      await api.post('/operations/resume-trip', {
        suspension_id: suspensionId,
        resumed_by: 'Supervisor de Operações',
      });
      toast.success('Viagem reativada com sucesso.');
      fetchAlerts();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao reativar viagem.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-between">
      <div>
        {/* Topo com Ícone e Botão Voltar */}
        <div className="flex items-center justify-between mt-1">
          <button
            onClick={() => navigate('/')}
            className="text-slate-600 hover:text-ttnb-blue text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Início</span>
          </button>

          <button
            onClick={() => setShowSupervisorModal(true)}
            className="bg-white border border-slate-300 hover:border-ttnb-blue text-ttnb-blue text-[11px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-ttnb-teal" />
            <span>Painel do Supervisor</span>
          </button>
        </div>

        {/* Título com Alerta Visual */}
        <div className="mt-4">
          <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Condição Meteorológica Especial</span>
          </div>
          <h1 className="text-[26px] font-bold text-ttnb-blue mt-0.5 leading-tight">
            Situação das Travessias
          </h1>
          <p className="text-[12px] text-[#615f5e] mt-1.5 leading-relaxed">
            Boletim oficial de navegabilidade emitido com base nas orientações da Capitania dos Portos da Bahia.
          </p>
        </div>

        {/* Indicadores Marítimos em Tempo Real */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white border border-slate-200 rounded-md p-2.5 text-center shadow-2xs">
            <div className="flex items-center justify-center text-amber-600 mb-1">
              <Wind className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Vento</span>
            <span className="text-[13px] font-black text-ttnb-blue">28 nós</span>
            <span className="text-[9px] text-amber-600 block font-semibold">Moderado/Forte</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-2.5 text-center shadow-2xs">
            <div className="flex items-center justify-center text-rose-600 mb-1">
              <Waves className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Ondas</span>
            <span className="text-[13px] font-black text-ttnb-blue">2.5 m</span>
            <span className="text-[9px] text-rose-600 block font-semibold">Trecho Aberto</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-2.5 text-center shadow-2xs">
            <div className="flex items-center justify-center text-ttnb-teal mb-1">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Maré</span>
            <span className="text-[13px] font-black text-ttnb-blue">2.1 m</span>
            <span className="text-[9px] text-emerald-600 block font-semibold">Preamar 14:15</span>
          </div>
        </div>

        {/* Lista de Alertas e Suspensões Ativas */}
        <div className="mt-4 space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-emerald-900 mt-1">
                Todas as travessias operando normalmente!
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Mar calmo na Baía de Todos-os-Santos e fluxo regular.
              </p>
            </div>
          ) : (
            activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white border-l-4 border-l-red-500 border border-ttnb-border rounded-md p-4 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black bg-red-100 text-red-800 border border-red-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    SUSPENSÃO: {alert.affected_time}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(alert.suspended_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <h3 className="text-[15px] font-bold text-ttnb-blue mt-2">
                  {alert.route}
                </h3>
                <p className="text-[12px] text-slate-700 mt-1">
                  <strong>Motivo:</strong> {alert.reason}
                </p>

                <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900 flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1">
                    <LifeBuoy className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    Reembolso integral ou remarcação sem taxa
                  </span>
                  <button
                    onClick={() => handleResumeTrip(alert.id)}
                    className="text-ttnb-teal hover:text-ttnb-blue font-bold text-[10px] underline cursor-pointer shrink-0 ml-1"
                  >
                    Reativar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Card de Direitos e O Que Fazer */}
        <div className="mt-4 bg-white border border-ttnb-border rounded-md p-4 shadow-2xs">
          <h2 className="text-[13px] font-bold text-ttnb-blue mb-2 flex items-center gap-1.5">
            <span>Direitos do Passageiro em caso de Suspensão</span>
          </h2>
          <ul className="text-[11px] text-[#615f5e] space-y-1.5 list-disc list-inside leading-relaxed">
            <li><strong>Reembolso integral garantido:</strong> direto no guichê ou estorno por PIX.</li>
            <li><strong>Remarcação livre:</strong> você pode utilizar seu bilhete no próximo horário sem cobrança.</li>
            <li><strong>Embarque seguro:</strong> travessias marítimas são retomadas assim que o mar se estabilizar.</li>
          </ul>
        </div>

        {/* Informações do Terminal */}
        <div className="mt-3.5 bg-[#f9f9f9] border border-[#e5e5e5] rounded-md p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#887878] uppercase">
              CENTRAL DE ATENDIMENTO TTNB
            </p>
            <p className="text-[14px] font-bold text-ttnb-blue mt-0.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-ttnb-teal" />
              (71) 3241 - 9783 · (71) 3326 - 1000
            </p>
          </div>
        </div>
      </div>

      {/* Botões de Ação no Rodapé */}
      <div className="mt-6 pt-4 border-t border-[#f0ece9] space-y-2">
        <button
          onClick={() => navigate('/horarios')}
          className="w-full bg-ttnb-orange hover:bg-[#d96728] text-white font-bold py-3.5 px-4 rounded-ttnb-btn flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <span>Ver horários e outras travessias</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* MODAL: Painel do Supervisor (Suspender Viagem por Clima) */}
      {showSupervisorModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md w-full max-w-sm p-5 shadow-xl border border-ttnb-border">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h3 className="text-[15px] font-bold text-ttnb-blue">
                  Suspender Viagem (Supervisor)
                </h3>
              </div>
              <button
                onClick={() => setShowSupervisorModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSuspendTrip} className="mt-3.5 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-ttnb-blue block mb-1">
                  Rota Afetada
                </label>
                <select
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  className="w-full p-2.5 bg-white border border-ttnb-border rounded-md text-xs focus:outline-none focus:border-ttnb-blue"
                >
                  <option value="Salvador ➔ Morro de São Paulo">Salvador ➔ Morro de São Paulo</option>
                  <option value="Morro de São Paulo ➔ Salvador">Morro de São Paulo ➔ Salvador</option>
                  <option value="Salvador ➔ Mar Grande">Salvador ➔ Mar Grande</option>
                  <option value="Mar Grande ➔ Salvador">Mar Grande ➔ Salvador</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-ttnb-blue block mb-1">
                  Horário da Saída
                </label>
                <input
                  type="text"
                  placeholder="Ex: 14:30"
                  value={affectedTime}
                  onChange={(e) => setAffectedTime(e.target.value)}
                  required
                  className="w-full p-2.5 bg-white border border-ttnb-border rounded-md text-xs focus:outline-none focus:border-ttnb-blue"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-ttnb-blue block mb-1">
                  Motivo da Suspensão
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full p-2 bg-white border border-ttnb-border rounded-md text-xs focus:outline-none focus:border-ttnb-blue"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSupervisorModal(false)}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-2.5 px-3 rounded-ttnb-btn text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-3 rounded-ttnb-btn text-xs cursor-pointer shadow-sm"
                >
                  Publicar Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
