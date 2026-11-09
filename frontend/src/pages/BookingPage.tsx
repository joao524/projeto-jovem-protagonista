import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, Plus, Minus, ArrowRight, Car, Info, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';

export const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tripId = searchParams.get('tripId') || '33333333-3333-3333-3333-333333333303';
  const routeId = searchParams.get('routeId') || '11111111-1111-1111-1111-111111111111';
  const destino = searchParams.get('destino') || 'Mar Grande';
  const horario = searchParams.get('horario') || '06:00';
  const operador = searchParams.get('operador') || 'Marina Socicam';

  const isMorro = destino.includes('Morro');
  const unitPrice = isMorro ? 152.0 : 8.0;

  // Estado da reserva
  const [passengerCount, setPassengerCount] = useState(1);
  const [travelDate, setTravelDate] = useState('2026-11-23');
  const [includeVehicle, setIncludeVehicle] = useState(false);
  const [vehicleCategory, setVehicleCategory] = useState('STANDARD_CAR');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const vehiclePrice = includeVehicle ? 45.0 : 0.0;
  const totalEstimated = passengerCount * unitPrice + vehiclePrice;

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

      const payload = {
        route_id: routeId,
        trip_id: tripId,
        travel_date: '23 nov. 2026',
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

      // Salva dados no storage para fluxo contínuo
      localStorage.setItem('active_booking_id', booking.id);

      navigate(`/identificacao/${booking.id}`);
    } catch (err) {
      console.error('Erro ao criar intenção de reserva', err);
      setErrorMsg('Erro ao registrar intenção de reserva. Tente novamente.');
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

        {/* Seleção de Data e Horário em 2 Colunas */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="text-[11px] font-bold text-[#887878] uppercase tracking-wider block mb-1">
              Data da viagem
            </label>
            <div className="bg-white border border-ttnb-border rounded-md p-2.5 flex items-center justify-between shadow-2xs">
              <span className="text-[13px] font-bold text-ttnb-dark">23 nov. 2026</span>
              <Calendar className="w-4 h-4 text-ttnb-teal" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#887878] uppercase tracking-wider block mb-1">
              Horário
            </label>
            <div className="bg-white border border-ttnb-border rounded-md p-2.5 flex items-center justify-between shadow-2xs">
              <span className="text-[13px] font-bold text-ttnb-dark">{horario}</span>
              <Clock className="w-4 h-4 text-ttnb-teal" />
            </div>
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
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="mt-1 w-full p-2 bg-white border border-slate-300 rounded text-sm font-mono uppercase focus:outline-none focus:border-ttnb-blue"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  * A placa pode ser corrigida até o embarque na Área do Passageiro.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Preço Unitário e Total Estimado */}
        <div className="mt-5 space-y-2 text-[12px]">
          <div className="flex justify-between text-[#615f5e]">
            <span>Valor por passageiro</span>
            <span className="font-bold text-black">
              R$ {unitPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>
          {includeVehicle && (
            <div className="flex justify-between text-[#615f5e]">
              <span>Vaga de veículo (Automóvel)</span>
              <span className="font-bold text-black">R$ 45,00</span>
            </div>
          )}
          <div className="border-t border-[#ece8e5] pt-2 flex justify-between items-baseline">
            <span className="text-[13px] font-bold text-ttnb-blue">Total estimado</span>
            <span className="text-[20px] font-extrabold text-ttnb-blue">
              R$ {totalEstimated.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            {errorMsg}
          </div>
        )}

        {/* Card Informativo (Figma: Rectangle 9) */}
        <div className="mt-5 bg-[#f5f5f5] border border-[#e5e5e5] rounded-md p-3 flex items-center space-x-2.5">
          <div className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center shrink-0">
            <Info className="w-3.5 h-3.5" />
          </div>
          <p className="text-[11px] text-[#615f5e] leading-snug">
            Para continuar, entre ou crie uma conta. Sua escolha será mantida.
          </p>
        </div>
      </div>

      {/* Botão de Continuar (Figma: Group 14) */}
      <div className="mt-6 pt-4 border-t border-[#f0ece9]">
        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full bg-ttnb-orange hover:bg-[#d96728] text-white font-bold py-3.5 px-4 rounded-ttnb-btn flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
        >
          <span>{loading ? 'Preparando reserva...' : 'Continuar para identificação'}</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
