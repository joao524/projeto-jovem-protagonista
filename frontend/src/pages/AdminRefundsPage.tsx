import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const AdminRefundsPage: React.FC = () => {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / form de nova solicitação para teste do fluxo
  const [showNewModal, setShowNewModal] = useState(false);
  const [bookingIdInput, setBookingIdInput] = useState('');
  const [reasonInput, setReasonInput] = useState('Desistência formal de viagem');
  const [amountInput, setAmountInput] = useState('8.00');

  // Efetivação de pagamento no caixa
  const [disbursingRefundId, setDisbursingRefundId] = useState<string | null>(null);
  const [disburseMethod, setDisburseMethod] = useState<'CASH_REGISTER' | 'PIX'>('CASH_REGISTER');
  const [receiptRef, setReceiptRef] = useState('REC-2026-001');

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await api.get('/refunds/all');
      setRefunds(res.data);
    } catch (err) {
      console.error('Erro ao buscar reembolsos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleReview = async (refundId: string, decision: 'APPROVE' | 'REJECT') => {
    try {
      await api.post(`/refunds/${refundId}/review`, {
        admin_name: 'Administrador Geral',
        decision: decision,
        rejection_reason: decision === 'REJECT' ? 'Solicitação fora do prazo regulamentar.' : null,
      });
      fetchRefunds();
    } catch (err) {
      console.error('Erro ao revisar reembolso', err);
      alert('Erro ao processar decisão de reembolso.');
    }
  };

  const handleDisburse = async (refundId: string) => {
    try {
      await api.post(`/refunds/${refundId}/disburse`, {
        payout_method: disburseMethod,
        disbursed_by: 'Operador de Caixa do Guichê',
        receipt_reference: receiptRef,
      });
      setDisbursingRefundId(null);
      fetchRefunds();
    } catch (err) {
      console.error('Erro ao efetivar pagamento de reembolso', err);
      alert('Erro ao efetivar pagamento no caixa.');
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/refunds/request', {
        booking_id: bookingIdInput || 'sample-booking-id',
        amount: parseFloat(amountInput) || 8.0,
        reason: reasonInput,
        operator_name: 'Operador Guichê 01',
      });
      setShowNewModal(false);
      setBookingIdInput('');
      fetchRefunds();
    } catch (err) {
      console.error('Erro ao abrir solicitação', err);
      alert('Não foi possível registrar o pedido de reembolso.');
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#fffefa] px-5 py-4">
      <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
        <div>
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
            ADMINISTRAÇÃO FINANCEIRA
          </span>
          <h1 className="text-[20px] font-bold text-ttnb-blue">
            Gestão de Reembolsos
          </h1>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="bg-ttnb-blue hover:bg-ttnb-dark text-white font-bold text-[11px] px-2.5 py-1.5 rounded cursor-pointer"
        >
          + Solicitar
        </button>
      </div>

      {showNewModal && (
        <form onSubmit={handleCreateRequest} className="mt-4 p-4 bg-slate-50 border border-slate-300 rounded-md space-y-2 text-xs">
          <p className="font-bold text-slate-800">Nova Solicitação (Operador)</p>
          <input
            type="text"
            placeholder="Código da Reserva ou ID"
            value={bookingIdInput}
            onChange={(e) => setBookingIdInput(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Valor R$"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded"
            required
          />
          <input
            type="text"
            placeholder="Motivo do estorno"
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded"
            required
          />
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowNewModal(false)}
              className="px-3 py-1 bg-slate-200 text-slate-700 rounded font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-purple-700 text-white rounded font-semibold"
            >
              Registrar Pedido
            </button>
          </div>
        </form>
      )}

      {/* Lista de Reembolsos */}
      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-center text-xs text-slate-500 py-6">Carregando solicitações...</p>
        ) : refunds.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded p-6 text-center text-xs text-slate-500">
            Nenhuma solicitação de reembolso registrada no momento.
          </div>
        ) : (
          refunds.map((ref) => {
            const isPending = ref.status === 'PENDING_APPROVAL';
            const isApproved = ref.status === 'APPROVED';
            const isCompleted = ref.status === 'COMPLETED';

            return (
              <div
                key={ref.id}
                className="bg-white border border-slate-200 p-3.5 rounded-md text-left shadow-2xs space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-[13px] text-ttnb-blue block">
                      {ref.booking_code}
                    </span>
                    <span className="text-[11px] text-[#615f5e]">
                      Passageiro: {ref.customer_name}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isPending
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : isApproved
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : isCompleted
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {ref.status}
                  </span>
                </div>

                <div className="text-[11px] text-[#615f5e]">
                  <p><strong>Valor:</strong> R$ {ref.amount.toFixed(2).replace('.', ',')}</p>
                  <p><strong>Motivo:</strong> {ref.reason}</p>
                  <p className="text-[10px] text-[#887878] mt-0.5">
                    Solicitado por: {ref.requested_by}
                  </p>
                </div>

                {/* Ações de Aprovação do Administrador */}
                {isPending && (
                  <div className="flex space-x-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleReview(ref.id, 'APPROVE')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aprovar</span>
                    </button>
                    <button
                      onClick={() => handleReview(ref.id, 'REJECT')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Rejeitar</span>
                    </button>
                  </div>
                )}

                {/* Efetivação no Caixa Presencial (Dinheiro ou PIX) */}
                {isApproved && (
                  <div className="mt-2 pt-2 border-t border-blue-100 bg-blue-50/50 p-2 rounded">
                    <p className="text-[10px] font-bold text-blue-900 mb-1">
                      Aprovado! Registre o pagamento ao cliente:
                    </p>
                    <div className="flex space-x-1 mb-2">
                      <button
                        onClick={() => setDisburseMethod('CASH_REGISTER')}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          disburseMethod === 'CASH_REGISTER'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border text-slate-700'
                        }`}
                      >
                        Dinheiro Caixa
                      </button>
                      <button
                        onClick={() => setDisburseMethod('PIX')}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          disburseMethod === 'PIX'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border text-slate-700'
                        }`}
                      >
                        PIX
                      </button>
                    </div>
                    <button
                      onClick={() => handleDisburse(ref.id)}
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-1 px-2 rounded text-[10px] cursor-pointer"
                    >
                      Confirmar Efetivação de Pagamento
                    </button>
                  </div>
                )}

                {isCompleted && (
                  <div className="text-[10px] text-emerald-800 bg-emerald-50 p-1.5 rounded">
                    Efetivado via {ref.payout_method} por {ref.disbursed_by}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
