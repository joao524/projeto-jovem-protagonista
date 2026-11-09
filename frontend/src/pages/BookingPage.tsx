import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Plus,
  Minus,
  ArrowRight,
  Car,
  Info,
  ArrowUpRight,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';
import { api } from '../services/api';

const AVAILABLE_TIMES_MAR_GRANDE = [
  '05:00',
  '05:30',
  '06:00',
  '06:30',
  '07:00',
  '08:00',
  '09:30',
  '11:00',
  '12:30',
  '14:00',
  '15:30',
  '17:00',
  '18:00',
];

const AVAILABLE_TIMES_MORRO = [
  '08:30',
  '09:00',
  '10:30',
  '13:00',
  '14:30',
];

export const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tripId = searchParams.get('tripId') || '33333333-3333-3333-3333-333333333303';
  const routeId = searchParams.get('routeId') || '11111111-1111-1111-1111-111111111111';
  const destino = searchParams.get('destino') || 'Mar Grande';
  const initialHorario = searchParams.get('horario') || '06:00';
  const operador = searchParams.get('operador') || 'Marina Socicam';

  const isMorro = destino.includes('Morro');
  const unitPrice = isMorro ? 152.0 : 8.0;

  // Estado da reserva
  const [passengerCount, setPassengerCount] = useState(1);
  const [travelDate, setTravelDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [horario, setHorario] = useState(initialHorario);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [includeVehicle, setIncludeVehicle] = useState(false);
  const [vehicleCategory, setVehicleCategory] = useState('STANDARD_CAR');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const vehiclePrice = includeVehicle ? 45.0 : 0.0;
  const totalEstimated = passengerCount * unitPrice + vehiclePrice;

  const availableTimes = isMorro ? AVAILABLE_TIMES_MORRO : AVAILABLE_TIMES_MAR_GRANDE;

  const handleIncrement = () => {
    if (passengerCount < 10) setPassengerCount(passengerCount + 1);
  };

  const handleDecrement = () => {
    if (passengerCount > 1) setPassengerCount(passengerCount - 1);
  };

  const handleContinue = async () => {
    if (includeVehicle && !vehiclePlate.trim()) {
      setErrorMsg('Por favor, informe a placa do veículo conforme exigido.');
      return;
    }
    setErrorMsg('');

    try {
      setLoading(true);

      const passengersPayload = Array.from({ length: passengerCount }).map((_, i) => ({
        full_name: `Passageiro ${i + 1}`,
        document_number: '000.000.000-00',
        passenger_type: 'ADULT',
      }));

      // Formata data amigável
      const [year, month, day] = travelDate.split('-');
      const dateFormatted = `${day}/${month}/${year}`;

      const payload = {
        route_id: routeId,
        trip_id: tripId,
        travel_date: dateFormatted,
        departure_time: horario,
        origin: 'Salvador',
        destination: destino,
        operator: operador,
        passengers: passengersPayload,
        vehicle: includeVehicle
          ? {
              category_code: vehicleCategory,
              plate: vehiclePlate.toUpperCase().trim(),
              driver_name: 'Motorista Titular',
            }
          : null,
      };

      const res = await api.post('/bookings', payload);
      const booking = res.data;

      localStorage.setItem('active_booking_id', booking.id);
      navigate(`/identificacao/${booking.id}`);
    } catch (err: any) {
      console.error('Erro ao criar intenção de reserva', err);
      setErrorMsg(
        err.response?.data?.detail || 'Erro ao registrar intenção de reserva. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#fffefa] px-5 py-4 flex flex-col justify-between">
      <div>
        {/* Título da Tela */}
        <div className="mt-1">
          <p className="text-[11px] font-bold text-ttnb-teal uppercase tracking-wider">
            RESERVA ONLINE
          </p>
          <h1 className="text-[28px] font-bold text-ttnb-blue mt-0.5">
            Onde vamos?
          </h1>
        </div>

        {/* Card Trajeto (Figma: Rectangle 9) */}
        <div className="mt-4">
          <label className="text-[11px] font-bold text-[#887878] uppercase tracking-wider block mb-1">
            Trajeto
          </label>
          <div className="bg-white border border-ttnb-border rounded-md p-3.5 flex items-center justify-between shadow-2xs">
            <span className="text-[14px] font-bold text-ttnb-blue">Salvador</span>
            <div className="flex items-center space-x-1 text-ttnb-teal">
              <span className="text-xs">➔</span>
            </div>
            <span className="text-[14px] font-bold text-ttnb-blue">{destino}</span>
          </div>
        </div>

        {/* Seleção de Data e Horário Interativos */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {/* BOTÃO INTERATIVO: DATA DA VIAGEM */}
          <div>
            <label className="text-[11px] font-bold text-[#887878] uppercase tracking-wider block mb-1">
              Data da viagem
            </label>
            <div className="relative bg-white border border-ttnb-border hover:border-ttnb-blue rounded-md p-2 flex items-center justify-between shadow-2xs transition-colors">
              <input
                type="date"
                value={travelDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full text-[13px] font-bold text-ttnb-dark bg-transparent focus:outline-none cursor-pointer"
              />
              <Calendar className="w-4 h-4 text-ttnb-teal pointer-events-none absolute right-2.5" />
            </div>
          </div>

          {/* BOTÃO INTERATIVO: HORÁRIO */}
          <div>
            <label className="text-[11px] font-bold text-[#887878] uppercase tracking-wider block mb-1">
              Horário
            </label>
            <button
              type="button"
              onClick={() => setShowTimeModal(true)}
              className="w-full bg-white border border-ttnb-border hover:border-ttnb-blue rounded-md p-2 flex items-center justify-between shadow-2xs text-left cursor-pointer transition-colors"
            >
              <span className="text-[13px] font-bold text-ttnb-dark">{horario}</span>
              <div className="flex items-center gap-1 text-ttnb-teal">
                <Clock className="w-4 h-4" />
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>

        {/* Contador de Passageiros (Figma: Rectangle 12) */}
        <div className="mt-5">
          <label className="text-[11px] font-bold text-[#887878] uppercase tracking-wider block mb-1.5">
            Passageiros
          </label>
          <div className="bg-white border border-ttnb-border rounded-md p-3 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[14px] font-bold text-ttnb-blue">Adultos</p>
              <p className="text-[11px] text-[#887878]">A partir de 12 anos</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={passengerCount <= 1}
                className="w-7 h-7 rounded-sm border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-[15px] font-bold text-ttnb-blue w-4 text-center">
                {passengerCount}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-7 h-7 rounded-sm border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Inclusão de Veículo (Regra de Negócio Confirmada) */}
        <div className="mt-4 border border-slate-200 rounded-md p-3 bg-slate-50/70">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeVehicle}
              onChange={(e) => setIncludeVehicle(e.target.checked)}
              className="rounded text-ttnb-orange focus:ring-ttnb-orange w-4 h-4"
            />
            <span className="text-[12px] font-bold text-ttnb-blue flex items-center gap-1.5">
              <Car className="w-4 h-4 text-ttnb-teal" />
              Incluir vaga para veículo nesta viagem (+ R$ 45,00)
            </span>
          </label>

          {includeVehicle && (
            <div className="mt-3 space-y-2.5 pt-2.5 border-t border-slate-200">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block uppercase">
                  Placa do Veículo (Obrigatória na reserva)
                </label>
                <input
                  type="text"
                  placeholder="EX: BRA2E19"
                  maxLength={8}
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                  className="mt-1 w-full p-2 bg-white border border-slate-300 rounded text-sm font-mono uppercase focus:outline-none focus:border-ttnb-blue"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  A placa pode ser corrigida na sua área até o momento do embarque.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block uppercase">
                  Categoria do Veículo
                </label>
                <select
                  value={vehicleCategory}
                  onChange={(e) => setVehicleCategory(e.target.value)}
                  className="mt-1 w-full p-2 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-ttnb-blue"
                >
                  <option value="STANDARD_CAR">Automóvel de Passeio / SUV</option>
                  <option value="MOTORCYCLE">Motocicleta</option>
                  <option value="VAN">Van / Caminhonete</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Resumo de Valores */}
        <div className="mt-5 p-3.5 bg-white border border-ttnb-border rounded-md shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#887878] uppercase font-bold">Valor Estimado</p>
            <p className="text-[10px] text-slate-500">
              {passengerCount} passageiro(s) {includeVehicle ? '+ 1 veículo' : ''}
            </p>
          </div>
          <span className="text-[20px] font-black text-ttnb-blue">
            R$ {totalEstimated.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {errorMsg && (
          <p className="mt-3 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 p-2 rounded">
            {errorMsg}
          </p>
        )}
      </div>

      {/* Botão de Continuar */}
      <div className="mt-6 pt-4 border-t border-[#f0ece9]">
        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          className="w-full bg-ttnb-orange hover:bg-[#d96728] text-white font-bold py-3.5 px-4 rounded-ttnb-btn flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
        >
          <span>{loading ? 'Preparando reserva...' : 'Continuar para Identificação'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* MODAL: SELETOR DE HORÁRIO INTERATIVO */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md w-full max-w-sm p-4 shadow-xl border border-ttnb-border">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5 text-ttnb-blue">
                <Clock className="w-4 h-4 text-ttnb-teal" />
                <h3 className="text-sm font-bold">Escolha o Horário de Saída</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTimeModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mt-2">
              Horários regulares disponíveis para {destino}:
            </p>

            <div className="grid grid-cols-3 gap-2 mt-3 max-h-60 overflow-y-auto p-1">
              {availableTimes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setHorario(t);
                    setShowTimeModal(false);
                  }}
                  className={`py-2.5 px-2 rounded-md font-mono text-xs font-bold border transition-all cursor-pointer ${
                    horario === t
                      ? 'bg-ttnb-blue text-white border-ttnb-blue shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-ttnb-blue hover:bg-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowTimeModal(false)}
              className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded text-xs cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
