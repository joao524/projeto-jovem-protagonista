import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Printer,
  ArrowRight,
  UserCheck,
  DollarSign,
  FileSpreadsheet,
  Download,
  Receipt,
  CreditCard,
  Banknote,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';

export const OperatorPosPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'POS' | 'CASH_REGISTER'>('POS');
  const [destination, setDestination] = useState('Mar Grande');
  const [passengerName, setPassengerName] = useState('Passageiro Balcão');
  const [documentNumber, setDocumentNumber] = useState('000.000.000-00');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const [issuedTicketId, setIssuedTicketId] = useState<string | null>(null);

  // Estados de Fechamento de Caixa
  const [cashSummary, setCashSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const isMorro = destination.includes('Morro');
  const amount = isMorro ? 152.0 : 8.0;

  const fetchCashSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await api.get('/operations/cash-register-summary');
      setCashSummary(res.data);
    } catch (err) {
      console.error('Erro ao buscar fechamento de caixa', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'CASH_REGISTER') {
      fetchCashSummary();
    }
  }, [activeTab]);

  const handleIssueTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // 1. Cria a reserva presencial
      const bookingRes = await api.post('/bookings', {
        route_id: isMorro
          ? '22222222-2222-2222-2222-222222222222'
          : '11111111-1111-1111-1111-111111111111',
        trip_id: isMorro
          ? '44444444-4444-4444-4444-444444444401'
          : '33333333-3333-3333-3333-333333333303',
        travel_date: 'Hoje (Presencial)',
        departure_time: isMorro ? '09:00' : '06:00',
        origin: 'Salvador (Guichê)',
        destination: destination,
        operator: isMorro ? 'Biotur' : 'Marina Socicam',
        passengers: [
          {
            full_name: passengerName,
            document_number: documentNumber,
            passenger_type: 'ADULT',
          },
        ],
        customer_name: passengerName,
      });

      const bookingId = bookingRes.data.id;

      // 2. Baixa no Caixa Presencial
      const paymentRes = await api.post('/payments/pos-register', {
        booking_id: bookingId,
        method: paymentMethod,
        amount_paid: amount,
        operator_name: 'Operador Guichê 03',
      });

      const tickets = paymentRes.data.tickets;
      if (tickets && tickets.length > 0) {
        setIssuedTicketId(tickets[0].id);
      }
    } catch (err) {
      console.error('Erro na emissão presencial', err);
      alert('Erro ao emitir passagem no caixa.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = async () => {
    try {
      const response = await api.get('/operations/reports/export-csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ttnb_relatorio_fechamento_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erro ao baixar relatório', err);
      alert('Erro ao baixar relatório CSV.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 lg:px-8 py-6">
      {/* Cabeçalho */}
      <div className="border-b border-[#e5e5e5] pb-3">
        <span className="text-[10px] font-bold text-ttnb-teal uppercase tracking-wider block">
          TERMINAL DE CAIXA & GESTÃO
        </span>
        <h1 className="text-[20px] font-bold text-ttnb-blue">
          Operação de Guichê
        </h1>
      </div>

      {/* Abas Superiores */}
      <div className="mt-3.5 flex border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('POS')}
          className={`flex-1 py-2 text-center border-b-2 cursor-pointer transition-colors ${
            activeTab === 'POS'
              ? 'border-ttnb-orange text-ttnb-blue font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Venda Balcão (PDV)
        </button>
        <button
          onClick={() => setActiveTab('CASH_REGISTER')}
          className={`flex-1 py-2 text-center border-b-2 cursor-pointer transition-colors ${
            activeTab === 'CASH_REGISTER'
              ? 'border-ttnb-orange text-ttnb-blue font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Fechamento de Caixa
        </button>
      </div>

      {activeTab === 'POS' ? (
        /* ABA 1: VENDA BALCÃO */
        issuedTicketId ? (
          <div className="mt-5 p-5 bg-emerald-50 border border-emerald-300 rounded-md text-center">
            <p className="text-[16px] font-bold text-emerald-900">
              Passagem Emitida com Sucesso!
            </p>
            <p className="text-[12px] text-emerald-800 mt-1">
              Recebimento registrado em caixa e bilhete ativo para embarque.
            </p>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => navigate(`/bilhete/${issuedTicketId}`)}
                className="w-full bg-ttnb-blue hover:bg-ttnb-dark text-white font-bold py-2.5 px-4 rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Visualizar / Imprimir Bilhete</span>
              </button>

              <button
                onClick={() => {
                  setIssuedTicketId(null);
                  setPassengerName('Passageiro Balcão');
                }}
                className="w-full bg-white border border-slate-300 text-slate-700 hover:text-slate-900 font-bold py-2 px-4 rounded text-xs cursor-pointer"
              >
                Nova Emissão no Guichê
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleIssueTicket} className="mt-4 space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-ttnb-blue block mb-1">
                Destino da Travessia
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full p-2.5 bg-white border border-ttnb-border rounded-md text-xs font-semibold focus:outline-none focus:border-ttnb-blue"
              >
                <option value="Mar Grande">Mar Grande (Vera Cruz) - R$ 8,00</option>
                <option value="Morro de São Paulo">Morro de São Paulo - R$ 152,00</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-ttnb-blue block mb-1">
                Nome do Passageiro
              </label>
              <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                required
                className="w-full p-2.5 bg-white border border-ttnb-border rounded-md text-xs focus:outline-none focus:border-ttnb-blue"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-ttnb-blue block mb-1">
                Documento (CPF ou RG)
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="w-full p-2.5 bg-white border border-ttnb-border rounded-md text-xs focus:outline-none focus:border-ttnb-blue"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-ttnb-blue block mb-1">
                Forma de Recebimento no Guichê
              </label>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-2 rounded border font-semibold cursor-pointer ${
                    paymentMethod === 'CASH'
                      ? 'bg-ttnb-blue text-white border-ttnb-blue'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  Dinheiro
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('DEBIT_CARD')}
                  className={`p-2 rounded border font-semibold cursor-pointer ${
                    paymentMethod === 'DEBIT_CARD'
                      ? 'bg-ttnb-blue text-white border-ttnb-blue'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  Débito
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                  className={`p-2 rounded border font-semibold cursor-pointer ${
                    paymentMethod === 'CREDIT_CARD'
                      ? 'bg-ttnb-blue text-white border-ttnb-blue'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  Crédito
                </button>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Valor a cobrar:</span>
              <span className="text-lg font-black text-ttnb-blue">
                R$ {amount.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ttnb-orange hover:bg-[#d96728] text-white font-bold py-3 px-4 rounded-ttnb-btn flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              <span>{loading ? 'Processando baixa...' : 'Confirmar Recebimento e Emitir'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )
      ) : (
        /* ABA 2: FECHAMENTO DE CAIXA E RELATÓRIOS */
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Balanço do Turno Atual
            </span>
            <button
              onClick={fetchCashSummary}
              className="text-ttnb-teal hover:text-ttnb-blue text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loadingSummary ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>

          {/* Cards de Métricas de Caixa */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white border border-ttnb-border rounded-md p-3 shadow-2xs">
              <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-bold">
                <Banknote className="w-4 h-4" />
                <span>Dinheiro no Caixa</span>
              </div>
              <p className="text-[18px] font-black text-ttnb-blue mt-1">
                R$ {Number(cashSummary?.summary?.cash_on_hand || 0).toFixed(2).replace('.', ',')}
              </p>
              <span className="text-[9px] text-slate-500">Espécie física na gaveta</span>
            </div>

            <div className="bg-white border border-ttnb-border rounded-md p-3 shadow-2xs">
              <div className="flex items-center gap-1.5 text-ttnb-teal text-[11px] font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>Total Faturado</span>
              </div>
              <p className="text-[18px] font-black text-ttnb-blue mt-1">
                R$ {Number(cashSummary?.summary?.total_revenue || 0).toFixed(2).replace('.', ',')}
              </p>
              <span className="text-[9px] text-slate-500">
                {cashSummary?.summary?.confirmed_bookings || 0} compras confirmadas
              </span>
            </div>

            <div className="bg-white border border-ttnb-border rounded-md p-3 shadow-2xs">
              <div className="flex items-center gap-1.5 text-ttnb-blue text-[11px] font-bold">
                <Receipt className="w-4 h-4" />
                <span>Recebido via PIX</span>
              </div>
              <p className="text-[15px] font-bold text-slate-800 mt-1">
                R$ {Number(cashSummary?.summary?.pix_revenue || 0).toFixed(2).replace('.', ',')}
              </p>
            </div>

            <div className="bg-white border border-ttnb-border rounded-md p-3 shadow-2xs">
              <div className="flex items-center gap-1.5 text-indigo-700 text-[11px] font-bold">
                <CreditCard className="w-4 h-4" />
                <span>Recebido Cartões</span>
              </div>
              <p className="text-[15px] font-bold text-slate-800 mt-1">
                R$ {Number(cashSummary?.summary?.card_revenue || 0).toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>

          {/* Botão de Exportação CSV */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-bold text-ttnb-blue">
                Relatório Operacional Completo
              </p>
              <p className="text-[10px] text-slate-500">
                Exporta listagem detalhada com passageiros, placas e valores.
              </p>
            </div>
            <button
              onClick={handleDownloadCsv}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-ttnb-btn text-[11px] flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar CSV / Excel</span>
            </button>
          </div>

          {/* Tabela de Transações Recentes */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Últimas Transações Registradas:
            </span>
            <div className="bg-white border border-ttnb-border rounded-md divide-y divide-slate-100 max-h-56 overflow-y-auto text-xs shadow-2xs">
              {!cashSummary?.recent_transactions?.length ? (
                <p className="p-3 text-center text-slate-400">
                  Nenhuma transação recente no turno.
                </p>
              ) : (
                cashSummary.recent_transactions.map((tx: any, idx: number) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-ttnb-blue">
                        {tx.booking_code} · {tx.customer_name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {tx.route} ({tx.departure_time}) · {tx.method}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-emerald-700">
                      R$ {Number(tx.amount).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
