import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, LogOut, Ticket, Clock, Gauge, CloudSun } from 'lucide-react';
import { api } from '../services/api';

export const PassengerAreaPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [myBookings, setMyBookings] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('ttnb_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser({ full_name: 'Ana Costa', email: 'ana@email.com' });
    }

    async function loadBookings() {
      try {
        const res = await api.get('/bookings/my-bookings');
        setMyBookings(res.data);
      } catch (err) {
        console.error('Erro ao buscar histórico', err);
      }
    }
    loadBookings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ttnb_token');
    localStorage.removeItem('ttnb_user');
    navigate('/');
  };

  const displayName = user?.full_name || 'Ana Costa';
  const initialLetter = displayName.charAt(0).toUpperCase();

  // Encontra a reserva confirmada mais recente
  const latestBooking =
    myBookings.find((b) => b.status === 'CONFIRMED') || {
      id: 'mock-1',
      booking_code: 'TTNB-A7F29C',
      origin: 'Salvador',
      destination: 'Mar Grande',
      travel_date: '23 OUT 2026',
      departure_time: '08 : 00',
      passengers_count: 1,
      tickets: [{ id: 'mock-ticket-1' }],
    };

  const latestTicketId = latestBooking.tickets?.[0]?.id || 'mock-ticket-1';

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#fffefa] px-5 py-4 flex flex-col justify-between">
      <div>
        {/* Título da Tela */}
        <div className="mt-1">
          <p className="text-[11px] font-bold text-ttnb-teal uppercase tracking-wider">
            ÁREA DO PASSAGEIRO
          </p>
          <h1 className="text-[28px] font-bold text-ttnb-blue mt-0.5">
            Olá, {displayName.split(' ')[0]}.
          </h1>
          <p className="text-[12px] text-[#615f5e] mt-1">
            Acompanhe suas passagens e dados da conta.
          </p>
        </div>

        {/* Card do Usuário (Figma: Rectangle 22) */}
        <div className="mt-4 bg-white border border-ttnb-border rounded-md p-3.5 flex items-center space-x-3 shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-ttnb-teal text-white flex items-center justify-center font-bold text-base shrink-0">
            {initialLetter}
          </div>
          <div className="overflow-hidden">
            <p className="text-[13px] font-bold text-ttnb-blue truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-[#615f5e] truncate">
              {user?.email || 'ana@email.com'}
            </p>
          </div>
        </div>

        {/* Card Próxima Viagem (Figma: Rectangle 20) */}
        <div className="mt-5">
          <p className="text-[11px] font-bold text-[#887878] uppercase tracking-wider mb-2">
            Passagens
          </p>

          <div className="bg-white border border-ttnb-border rounded-md p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#887878] uppercase tracking-wider">
                PRÓXIMA VIAGEM: {latestBooking.travel_date}
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-xs border border-emerald-200">
                CONFIRMADA
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[15px] font-bold text-ttnb-blue mt-2">
              <span>{latestBooking.origin}</span>
              <span className="text-ttnb-teal">➔</span>
              <span>{latestBooking.destination}</span>
            </div>

            <p className="text-[12px] text-[#615f5e] mt-1">
              {latestBooking.departure_time} / {latestBooking.passengers_count} adulto(s)
            </p>

            <button
              onClick={() => navigate(`/bilhete/${latestTicketId}`)}
              className="mt-3.5 text-ttnb-orange hover:text-[#d96728] text-[12px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Ver bilhete</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Acesso Rápido */}
        <div className="mt-6">
          <p className="text-[11px] font-bold text-[#887878] uppercase tracking-wider mb-2">
            Acesso rápido
          </p>

          <div className="bg-white border border-ttnb-border rounded-md divide-y divide-[#ece8e5] shadow-2xs">
            <button
              onClick={() => navigate('/horarios')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors text-[13px] font-bold text-ttnb-blue cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-ttnb-teal" />
                <span>Consultar horários</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => navigate('/filometro')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors text-[13px] font-bold text-ttnb-blue cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Gauge className="w-4 h-4 text-ttnb-teal" />
                <span>Ver filômetro</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => navigate('/previsao-tempo')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors text-[13px] font-bold text-ttnb-blue cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <CloudSun className="w-4 h-4 text-ttnb-teal" />
                <span>Previsão do tempo</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Botão de Logout */}
      <div className="mt-8 pt-4 border-t border-[#f0ece9]">
        <button
          onClick={handleLogout}
          className="w-full bg-white border border-slate-300 hover:border-red-400 text-slate-700 hover:text-red-600 font-bold py-3 px-4 rounded-ttnb-btn flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair da conta</span>
        </button>
      </div>
    </div>
  );
};
