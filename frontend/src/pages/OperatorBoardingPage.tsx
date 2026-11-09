import React, { useState, useEffect } from 'react';
import { QrCode, Search, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, History } from 'lucide-react';
import { api } from '../services/api';

export const OperatorBoardingPage: React.FC = () => {
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  const fetchRecentLogs = async () => {
    try {
      const res = await api.get('/boarding/recent-logs');
      setRecentLogs(res.data);
    } catch (err) {
      console.error('Erro ao buscar logs de embarque', err);
    }
  };

  useEffect(() => {
    fetchRecentLogs();
  }, []);

  const handleValidate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualCode.trim()) return;

    try {
      setLoading(true);
      setValidationResult(null);

      const res = await api.post('/boarding/validate', {
        identifier: manualCode.trim(),
        validator_name: 'Fiscal de Catraca 01',
        method: manualCode.includes(':') ? 'QR_SCAN' : 'MANUAL_CODE',
      });

      setValidationResult(res.data);
      fetchRecentLogs();
      setManualCode('');
    } catch (err: any) {
      setValidationResult({
        result: 'DENIED',
        reason: err.response?.data?.detail || 'Erro na comunicação com a API.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#fffefa] px-5 py-4">
      {/* Cabeçalho Operacional */}
      <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
        <div>
          <span className="text-[10px] font-bold text-ttnb-teal uppercase tracking-wider block">
            CONTROLE DE EMBARQUE
          </span>
          <h1 className="text-[20px] font-bold text-ttnb-blue">
            Validação de Bilhetes
          </h1>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          Online
        </div>
      </div>

      {/* Campo de Busca Manual ou Leitor de Código */}
      <form onSubmit={handleValidate} className="mt-4">
        <label className="text-[11px] font-bold text-ttnb-blue block mb-1">
          Código do Bilhete ou Leitor QR
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Ex: TTNB-A7F29C-01 ou cole o payload QR"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="flex-1 p-3 bg-white border border-ttnb-border rounded-md text-[13px] font-mono uppercase focus:outline-none focus:border-ttnb-blue"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-ttnb-blue hover:bg-ttnb-dark text-white font-bold px-4 rounded-ttnb-btn flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-[#887878] mt-1">
          * Suporta bipagem de leitor de código de barras ou digitação manual.
        </p>
      </form>

      {/* Card de Resultado da Validação com Feedback Visual Forte */}
      {validationResult && (
        <div
          className={`mt-4 p-4 rounded-md border text-left transition-all ${
            validationResult.result === 'ALLOWED'
              ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
              : 'bg-red-50 border-red-400 text-red-950'
          }`}
        >
          <div className="flex items-start space-x-3">
            {validationResult.result === 'ALLOWED' ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-[15px] font-extrabold uppercase tracking-wide">
                {validationResult.result === 'ALLOWED'
                  ? 'EMBARQUE AUTORIZADO'
                  : 'EMBARQUE RECUSADO'}
              </p>
              <p className="text-[12px] font-medium mt-0.5">
                {validationResult.message || validationResult.reason}
              </p>

              {validationResult.result === 'ALLOWED' && (
                <div className="mt-3 pt-2 border-t border-emerald-200 text-[11px] space-y-1">
                  <p>
                    <strong>Passageiro:</strong> {validationResult.passenger_name}
                  </p>
                  <p>
                    <strong>Bilhete:</strong> {validationResult.ticket_code}
                  </p>
                  <p>
                    <strong>Trajeto:</strong> {validationResult.origin} ➔{' '}
                    {validationResult.destination} ({validationResult.departure_time})
                  </p>
                  <p>
                    <strong>Operador:</strong> {validationResult.operator}
                  </p>
                </div>
              )}

              {validationResult.first_boarded_at && (
                <p className="text-[10px] text-red-700 mt-2 font-bold">
                  Primeiro embarque registrado em: {validationResult.first_boarded_at}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Histórico Recente de Embarques na Catraca */}
      <div className="mt-6">
        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#887878] uppercase mb-2">
          <History className="w-3.5 h-3.5" />
          <span>Últimos Embarques Validados</span>
        </div>

        {recentLogs.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded p-4 text-center text-xs text-slate-500">
            Nenhum bilhete validado nesta sessão ainda.
          </div>
        ) : (
          <div className="space-y-2">
            {recentLogs.slice(0, 5).map((log, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 p-2.5 rounded text-[11px] flex justify-between items-center shadow-2xs"
              >
                <div>
                  <span className="font-bold text-ttnb-blue block">
                    {log.passenger_name}
                  </span>
                  <span className="text-[#887878] font-mono text-[10px]">
                    {log.ticket_code} · {log.method}
                  </span>
                </div>
                <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                  OK
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
