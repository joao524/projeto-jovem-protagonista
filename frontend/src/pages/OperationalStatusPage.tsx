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
} from 'lucide-react';
import { api } from '../services/api';

export const OperationalStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);

  // Form de Suspensão
  const [route, setRoute] = useState('Salvador ➔ Morro de São Paulo');
  const [affectedTime, setAffectedTime] = useState('14:30');
  const [reason, setReason] = useState('Ventos fortes e ondas superiores a 2.5m');
  const [severity, setSeverity] = useState('WARNING');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/operations/active-alerts');
      setActiveAlerts(res.data);
    } catch (err) {
      console.error('Erro ao buscar alertas operacionais', err);
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
      setShowSupervisorModal(false);
      fetchAlerts();
    } catch (err) {
      alert('Erro ao registrar suspensão de viagem.');
    }
  };

  const handleResumeTrip = async (suspensionId: string) => {
    try {
      await api.post('/operations/resume-trip', {
        suspension_id: suspensionId,
        resumed_by: 'Supervisor de Operações',
      });
      fetchAlerts();
    } catch (err) {
      alert('Erro ao reativar viagem.');
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#fffefa] px-5 py-4 flex flex-col justify-between">
      <div>
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mt-2">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <button
            onClick={() => setShowSupervisorModal(true)}
            className="bg-white border border-slate-300 hover:border-ttnb-blue text-ttnb-blue text-[11px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-ttnb-teal" />
            <span>Painel do Supervisor</span>
          </button>
        </div>

        <div className="mt-4">
          <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">
            ATUALIZAÇÃO OPERACIONAL E CLIMA
          </p>
          <h1 className="text-[26px] font-bold text-ttnb-blue mt-0.5 leading-tight">
            Situação das Travessias
          </h1>
          <p className="text-[12px] text-[#615f5e] mt-1.5 leading-relaxed">
            Monitoramento de condições meteorológicas da Capitania dos Portos e comunicados de segurança.
          </p>
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
                Mar calmo e ventos dentro dos limites regulamentares de segurança.
              </p>
            </div>
          ) : (
            activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white border-l-4 border-l-red-500 border border-ttnb-border rounded-md p-3.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-xs uppercase">
                    SUSPENSA: {alert.affected_time}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(alert.suspended_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <h3 className="text-[14px] font-bold text-ttnb-blue mt-2">
                  {alert.route}
                </h3>
                <p className="text-[11px] text-slate-600 mt-1">
                  <strong>Motivo:</strong> {alert.reason}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-semibold text-[10px]">
                    ✓ Reembolso integral ou remarcação livre
                  </span>
                  <button
                    onClick={() => handleResumeTrip(alert.id)}
                    className="text-ttnb-teal hover:text-ttnb-blue font-bold text-[10px] underline cursor-pointer"
                  >
                    Reativar Viagem
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Card O Que Fazer Agora? */}
        <div className="mt-4 bg-white border border-ttnb-border rounded-md p-4 shadow-2xs">
          <h2 className="text-[13px] font-bold text-ttnb-blue mb-2">
            O que fazer em caso de viagem suspensa?
          </h2>
          <ul className="text-[11px] text-[#615f5e] space-y-2 list-disc list-inside leading-relaxed">
            <li>Passageiros têm direito ao reembolso integral no caixa ou via PIX;</li>
            <li>Você pode remarcar seu bilhete para o próximo horário sem cobrança de taxas;</li>
            <li>Acompanhe esta página para novas liberações da Capitania dos Portos.</li>
          </ul>
        </div>

        {/* Informações do Terminal */}
        <div className="mt-3.5 bg-[#f9f9f9] border border-[#e5e5e5] rounded-md p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#887878] uppercase">
              INFORMAÇÕES DO TERMINAL
            </p>
            <p className="text-[14px] font-bold text-ttnb-blue mt-0.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-ttnb-teal" />
              (71) 3241 - 9783
            </p>
          </div>
        </div>
      </div>

      {/* Botão Inferior */}
      <div className="mt-6 pt-4 border-t border-[#f0ece9]">
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
                  placeholder="Ex: 14:30 ou 'Todas as saídas da tarde'"
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
