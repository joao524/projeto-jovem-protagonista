import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ArrowRightLeft, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const SchedulesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDestino = searchParams.get('destino') || 'Mar Grande';

  const [selectedDestino, setSelectedDestino] = useState(
    initialDestino.includes('Morro') ? 'Morro de São Paulo' : 'Mar Grande'
  );
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrips() {
      try {
        setLoading(true);
        const res = await api.get('/public/trips');
        setTrips(res.data);
      } catch (err) {
        console.error('Erro ao carregar viagens', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, []);

  const isMarGrande = selectedDestino === 'Mar Grande';
  const currentRouteId = isMarGrande
    ? '11111111-1111-1111-1111-111111111111'
    : '22222222-2222-2222-2222-222222222222';

  const filteredTrips = trips.filter((t) => t.route_id === currentRouteId);

  const handleSelectTrip = (trip: any) => {
    navigate(
      `/reserva?tripId=${trip.id}&routeId=${trip.route_id}&horario=${trip.time}&operador=${encodeURIComponent(
        trip.operator
      )}&destino=${encodeURIComponent(selectedDestino)}`
    );
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#fffefa] px-5 py-4">
      {/* Título da Seção */}
      <div className="mt-2">
        <p className="text-[11px] font-bold text-ttnb-teal uppercase tracking-wider">
          PLANEJE SUA VIAGEM
        </p>
        <h1 className="text-[26px] font-bold text-ttnb-blue mt-1">
          Horários & Travessias
        </h1>
      </div>

      {/* Card de Status da Operação (Figma: Rectangle 5) */}
      <div className="mt-4 bg-[#f4faf7] border border-[#d2ebe0] rounded-md p-3.5 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 stroke-[3]" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-emerald-900 leading-tight">
            Operação normal
          </p>
          <p className="text-[11px] text-[#615f5e] mt-0.5">
            Situação ilustrativa, confirmar antes da viagem.
          </p>
        </div>
      </div>

      {/* Seletor de Destinos (Tabs: Mar Grande vs Morro de São Paulo) */}
      <div className="mt-4 bg-[#edebe8] p-1 rounded-md flex space-x-1">
        <button
          onClick={() => setSelectedDestino('Mar Grande')}
          className={`flex-1 py-2 text-[12px] font-bold rounded-sm transition-all cursor-pointer ${
            isMarGrande
              ? 'bg-white text-ttnb-blue shadow-xs'
              : 'text-[#615f5e] hover:text-black'
          }`}
        >
          Mar Grande
        </button>
        <button
          onClick={() => setSelectedDestino('Morro de São Paulo')}
          className={`flex-1 py-2 text-[12px] font-bold rounded-sm transition-all cursor-pointer ${
            !isMarGrande
              ? 'bg-white text-ttnb-blue shadow-xs'
              : 'text-[#615f5e] hover:text-black'
          }`}
        >
          Morro de São Paulo
        </button>
      </div>

      {/* Detalhes da Rota Ativa */}
      <div className="mt-5 border-b border-[#ece8e5] pb-3">
        <div className="flex items-center space-x-2 text-[16px] font-bold text-ttnb-blue">
          <span>Salvador</span>
          <ArrowRightLeft className="w-4 h-4 text-ttnb-teal" />
          <span>{selectedDestino}</span>
        </div>
        <p className="text-[12px] text-[#615f5e] mt-1">
          {isMarGrande ? 'Lancha / Cerca de 40 minutos' : 'Catamarã / Cerca de 2h30'}
        </p>
      </div>

      {/* Lista de Horários e Partidas */}
      <div className="mt-4">
        <p className="text-[11px] font-bold text-[#887878] uppercase tracking-wider mb-2">
          Horários disponíveis hoje
        </p>

        {loading ? (
          <div className="py-10 text-center text-sm text-[#615f5e]">
            Carregando saídas marítimas...
          </div>
        ) : (
          <div className="divide-y divide-[#ece8e5]">
            {filteredTrips.map((trip) => {
              const isDelayed = trip.status === 'DELAYED';
              return (
                <div key={trip.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[18px] font-bold text-ttnb-blue tracking-tight">
                      {trip.time}
                    </span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[11px] text-[#615f5e]">
                        {trip.operator}
                      </span>
                      <span className="text-[10px] text-[#ccc]">·</span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-xs flex items-center gap-1 ${
                          isDelayed
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {isDelayed && <AlertCircle className="w-2.5 h-2.5" />}
                        {trip.tag}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[13px] font-bold text-ttnb-dark">
                      R$ {trip.price.toFixed(2).replace('.', ',')}
                    </span>
                    <button
                      onClick={() => handleSelectTrip(trip)}
                      className="bg-ttnb-orange hover:bg-[#d96728] text-white font-bold text-[12px] px-3.5 py-2 rounded-ttnb-btn flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                    >
                      <span>Comprar</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Nota de rodapé da tela */}
      <div className="mt-8 bg-[#f9f9f9] border border-[#eaeaea] rounded-md p-3 text-center">
        <p className="text-[11px] text-[#615f5e]">
          {isMarGrande
            ? 'Saída de embarcações a cada 30 min até as 18:00'
            : 'Os horários variam por operador e condição do Mar'}
        </p>
      </div>
    </div>
  );
};
