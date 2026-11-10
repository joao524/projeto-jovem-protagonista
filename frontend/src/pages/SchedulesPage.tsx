import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check,
  ArrowRightLeft,
  ArrowUpRight,
  Clock,
  AlertCircle,
  Calendar,
  Compass,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { safeStorage } from '../utils/storage';

const DEFAULT_TRIPS = [
  // Salvador -> Mar Grande
  {
    id: '33333333-3333-3333-3333-333333333301',
    route_id: '11111111-1111-1111-1111-111111111111',
    time: '05:00',
    operator: 'Marina Socicam',
    status: 'NORMAL',
    tag: 'Primeira Saída',
    price: 8.0,
    available_seats: 42,
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    route_id: '11111111-1111-1111-1111-111111111111',
    time: '05:30',
    operator: 'Marina Socicam',
    status: 'DELAYED',
    tag: 'Atraso / 15 min',
    price: 8.0,
    available_seats: 28,
  },
  {
    id: '33333333-3333-3333-3333-333333333303',
    route_id: '11111111-1111-1111-1111-111111111111',
    time: '06:00',
    operator: 'Marina Socicam',
    status: 'NORMAL',
    tag: 'Normal',
    price: 8.0,
    available_seats: 35,
  },
  {
    id: '33333333-3333-3333-3333-333333333304',
    route_id: '11111111-1111-1111-1111-111111111111',
    time: '07:00',
    operator: 'Marina Socicam',
    status: 'NORMAL',
    tag: 'Normal',
    price: 8.0,
    available_seats: 40,
  },
  {
    id: '33333333-3333-3333-3333-333333333305',
    route_id: '11111111-1111-1111-1111-111111111111',
    time: '08:00',
    operator: 'Marina Socicam',
    status: 'NORMAL',
    tag: 'Normal',
    price: 8.0,
    available_seats: 38,
  },
  {
    id: '33333333-3333-3333-3333-333333333306',
    route_id: '11111111-1111-1111-1111-111111111111',
    time: '09:30',
    operator: 'Marina Socicam',
    status: 'NORMAL',
    tag: 'Normal',
    price: 8.0,
    available_seats: 45,
  },
  // Salvador -> Morro de São Paulo
  {
    id: '44444444-4444-4444-4444-444444444401',
    route_id: '22222222-2222-2222-2222-222222222222',
    time: '09:00',
    operator: 'Biotur',
    status: 'NORMAL',
    tag: 'Normal',
    price: 152.0,
    available_seats: 60,
  },
  {
    id: '44444444-4444-4444-4444-444444444402',
    route_id: '22222222-2222-2222-2222-222222222222',
    time: '10:30',
    operator: 'Ilha Bela',
    status: 'DELAYED',
    tag: 'Atraso / 15 min',
    price: 152.0,
    available_seats: 40,
  },
  {
    id: '44444444-4444-4444-4444-444444444403',
    route_id: '22222222-2222-2222-2222-222222222222',
    time: '14:30',
    operator: 'Biotur',
    status: 'NORMAL',
    tag: 'Normal',
    price: 152.0,
    available_seats: 75,
  },
];

export const SchedulesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const initialDestino = searchParams.get('destino') || 'Mar Grande';

  const [selectedDestino, setSelectedDestino] = useState(
    initialDestino.includes('Morro') ? 'Morro de São Paulo' : 'Mar Grande'
  );
  const [trips, setTrips] = useState<any[]>(DEFAULT_TRIPS);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    let isMounted = true;
    async function loadTrips() {
      try {
        const res = await api.get('/public/trips');
        if (isMounted && res.data && res.data.length > 0) {
          setTrips(res.data);
        }
      } catch (err) {
        // Mantém DEFAULT_TRIPS garantindo que a tela nunca fique em branco
      }
    }
    loadTrips();
    return () => {
      isMounted = false;
    };
  }, []);

  const isMarGrande = selectedDestino === 'Mar Grande';
  const currentRouteId = isMarGrande
    ? '11111111-1111-1111-1111-111111111111'
    : '22222222-2222-2222-2222-222222222222';

  const filteredTrips = trips.filter((t) => t.route_id === currentRouteId);

  const handleSelectTrip = (trip: any) => {
    const bookingPath = `/reserva?tripId=${trip.id}&routeId=${trip.route_id}&horario=${trip.time}&operador=${encodeURIComponent(
      trip.operator
    )}&destino=${encodeURIComponent(selectedDestino)}`;

    const token = safeStorage.getItem<string>('ttnb_token');
    if (!token) {
      toast.info('Para iniciar sua compra e emitir seu cartão de embarque, acesse ou crie sua conta.');
      navigate(`/login?redirect=${encodeURIComponent(bookingPath)}`);
      return;
    }

    navigate(bookingPath);
  };

  return (
    <div className="max-w-5xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Título e Header Big Tech */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2 border border-slate-200">
            <Compass className="w-3.5 h-3.5 text-ttnb-teal" />
            <span>PLANEJE SUA VIAGEM</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Horários & Travessias
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consulte horários atualizados em tempo real e garanta sua passagem com antecedência.
          </p>
        </div>

        {/* Card de Status da Operação Big Tech */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl px-5 py-3 flex items-center space-x-3.5 shadow-2xs self-start md:self-auto">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-950 leading-tight">
              Operação normal no cais
            </p>
            <p className="text-[11px] text-emerald-800/80 mt-0.5">
              Embarque regular em Salvador • Mar calmo
            </p>
          </div>
        </div>
      </div>

      {/* Controles de Filtro (Destino + Data) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Seletor de Destinos Segmentado */}
        <div className="md:col-span-7 bg-slate-100/90 p-1.5 rounded-2xl flex space-x-1 border border-slate-200/70">
          <button
            onClick={() => setSelectedDestino('Mar Grande')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              isMarGrande
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mar Grande (Itaparica)
          </button>
          <button
            onClick={() => setSelectedDestino('Morro de São Paulo')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              !isMarGrande
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Morro de São Paulo
          </button>
        </div>

        {/* Seletor de Data da Viagem */}
        <div className="md:col-span-5 bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center space-x-2.5">
            <Calendar className="w-4 h-4 text-ttnb-teal shrink-0" />
            <span className="text-xs font-bold text-slate-700">Data de Consulta:</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Detalhes da Rota Ativa */}
      <div className="mt-8 p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-base sm:text-lg font-bold text-slate-900">
            <span>Salvador (Terminal Náutico)</span>
            <ArrowRightLeft className="w-4 h-4 text-ttnb-teal shrink-0" />
            <span className="text-ttnb-teal">{selectedDestino}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isMarGrande ? 'Lancha rápida regular • Cerca de 40 minutos' : 'Catamarã Expresso • Cerca de 2h30'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-ttnb-teal bg-teal-50 border border-teal-200/80 px-3 py-1.5 rounded-full">
            {filteredTrips.length} saídas programadas
          </span>
        </div>
      </div>

      {/* Grid de Horários em Big Tech Cards */}
      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTrips.map((trip) => {
            const isDelayed = trip.status === 'DELAYED';
            const priceNum = Number(trip.price) || (isMarGrande ? 8.0 : 152.0);

            return (
              <div
                key={trip.id}
                className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-ttnb-blue hover:shadow-md transition-all flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-ttnb-blue transition-colors">
                      {trip.time}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isDelayed
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                      }`}
                    >
                      {isDelayed ? (
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      )}
                      {trip.tag}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Operador: <strong className="text-slate-800">{trip.operator}</strong> • {trip.available_seats} vagas
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-lg font-black text-slate-900">
                    R$ {priceNum.toFixed(2).replace('.', ',')}
                  </span>
                  <button
                    onClick={() => handleSelectTrip(trip)}
                    className="bg-ttnb-orange hover:bg-[#d96728] active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs hover:shadow-sm transition-all cursor-pointer"
                  >
                    <span>Comprar</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nota Informativa de Rodapé */}
      <div className="mt-10 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-center max-w-2xl mx-auto shadow-2xs">
        <p className="text-xs text-slate-600 leading-relaxed">
          {isMarGrande
            ? 'Embarcações para Mar Grande saem a cada 30 minutos das 05h às 18h no Terminal Náutico da Bahia. Acesso preferencial garantido a idosos e gestantes.'
            : 'Para Morro de São Paulo, o embarque ocorre nas baias de catamarãs com antecedência mínima de 20 minutos para despacho de bagagens.'}
        </p>
      </div>
    </div>
  );
};
