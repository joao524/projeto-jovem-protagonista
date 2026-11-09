import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Printer, ArrowRight, UserCheck, DollarSign } from 'lucide-react';
import { api } from '../services/api';

export const OperatorPosPage: React.FC = () => {
  const navigate = useNavigate();

  const [destination, setDestination] = useState('Mar Grande');
  const [passengerName, setPassengerName] = useState('Passageiro Balcão');
  const [documentNumber, setDocumentNumber] = useState('000.000.000-00');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const [issuedTicketId, setIssuedTicketId] = useState<string | null>(null);

  const isMorro = destination.includes('Morro');
  const amount = isMorro ? 152.0 : 8.0;

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

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#fffefa] px-5 py-4">
      <div className="border-b border-[#e5e5e5] pb-3">
        <span className="text-[10px] font-bold text-ttnb-teal uppercase tracking-wider block">
          TERMINAL DE CAIXA
        </span>
        <h1 className="text-[20px] font-bold text-ttnb-blue">
          Venda Presencial no Balcão
        </h1>
      </div>

      {issuedTicketId ? (
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
              className="w-full bg-white border border-slate-300 text-slate-700 font-bold py-2.5 px-4 rounded text-xs cursor-pointer hover:bg-slate-50"
            >
              Nova Venda no Guichê
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
              className="w-full p-2.5 bg-white border border-ttnb-border rounded-md text-[13px] font-semibold text-ttnb-blue focus:outline-none focus:border-ttnb-blue"
            >
              <option value="Mar Grande">Mar Grande (R$ 8,00)</option>
              <option value="Morro de São Paulo">Morro de São Paulo (R$ 152,00)</option>
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
              className="w-full p-2.5 bg-white border border-ttnb-border rounded-md text-[13px] focus:outline-none focus:border-ttnb-blue"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-ttnb-blue block mb-1">
              Documento (CPF / RG)
            </label>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className="w-full p-2.5 bg-white border border-ttnb-border rounded-md text-[13px] focus:outline-none focus:border-ttnb-blue"
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
      )}
    </div>
  );
};
