import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  LogOut,
  Clock,
  Gauge,
  CloudSun,
  Car,
  Edit3,
  History,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';

export const PassengerAreaPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [selectedBookingForPlate, setSelectedBookingForPlate] = useState<any>(null);
  const [newPlateInput, setNewPlateInput] = useState('');
  const [plateReason, setPlateReason] = useState('Correção cadastral');
  const [plateUpdating, setPlateUpdating] = useState(false);
  const [plateError, setPlateError] = useState<string | null>(null);
  const [plateSuccess, setPlateSuccess] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      setMyBookings(res.data);
    } catch (err) {
      console.error('Erro ao buscar histórico', err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('ttnb_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser({ full_name: 'Ana Costa', email: 'ana@email.com' });
    }
    loadBookings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ttnb_token');
    localStorage.removeItem('ttnb_user');
    navigate('/');
  };

  const openPlateModal = (booking: any) => {
    setSelectedBookingForPlate(booking);
    setNewPlateInput(booking.vehicle?.license_plate || booking.vehicle?.plate || '');
    setPlateReason('Correção cadastral');
    setPlateError(null);
    setPlateSuccess(null);
  };

  const closePlateModal = () => {
    setSelectedBookingForPlate(null);
    setPlateError(null);
    setPlateSuccess(null);
  };

  const handleSavePlate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForPlate) return;

    try {
      setPlateUpdating(true);
      setPlateError(null);
      setPlateSuccess(null);

      const res = await api.patch(
        `/bookings/${selectedBookingForPlate.id}/vehicle-plate`,
        {
          new_plate: newPlateInput.trim().toUpperCase(),
          reason: plateReason,
          changed_by: user?.full_name || 'Passageiro',
        }
      );

      setPlateSuccess(
        `Placa atualizada com sucesso para ${res.data.vehicle?.license_plate || newPlateInput}!`
      );
      await loadBookings();

      setTimeout(() => {
        closePlateModal();
      }, 1500);
    } catch (err: any) {
      setPlateError(
        err.response?.data?.detail || 'Erro ao atualizar a placa do veículo.'
      );
    } finally {
      setPlateUpdating(false);
    }
  };

  const displayName = user?.full_name || 'Ana Costa';
  const initialLetter = displayName.charAt(0).toUpperCase();

  // Encontra a reserva confirmada mais recente ou fallback
  const latestBooking = myBookings.length > 0 ? myBookings[0] : null;

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

        {/* Card Próxima Viagem ou Lista de Reservas */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold text-[#887878] uppercase tracking-wider">
              Minhas Passagens
            </p>
            {myBookings.length > 0 && (
              <span className="text-[11px] font-semibold text-ttnb-teal">
                {myBookings.length} reserva(s)
              </span>
            )}
          </div>

          {myBookings.length === 0 ? (
            <div className="bg-white border border-ttnb-border rounded-md p-4 shadow-2xs text-center py-6">
              <p className="text-[13px] font-bold text-ttnb-blue">
                Nenhuma reserva encontrada
              </p>
              <p className="text-[11px] text-[#615f5e] mt-1">
                Compre sua passagem agora mesmo e acompanhe aqui.
              </p>
              <button
                onClick={() => navigate('/horarios')}
                className="mt-3 bg-ttnb-orange hover:bg-[#d96728] text-white text-[11px] font-bold py-2 px-4 rounded-ttnb-btn cursor-pointer inline-flex items-center gap-1.5"
              >
                Buscar Horários
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map((b) => {
                const ticketId = b.tickets?.[0]?.id;
                const hasVehicle = !!b.vehicle;
                const currentPlate =
                  b.vehicle?.license_plate || b.vehicle?.plate;
                const isBoarded =
                  b.status === 'BOARDED' ||
                  b.tickets?.some((t: any) => t.status === 'USED');

                return (
                  <div
                    key={b.id}
                    className="bg-white border border-ttnb-border rounded-md p-4 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#887878] uppercase tracking-wider">
                        VIAGEM: {b.travel_date}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-xs border ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : b.status === 'BOARDED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {b.status === 'CONFIRMED'
                          ? 'CONFIRMADA'
                          : b.status === 'BOARDED'
                          ? 'EMBARCADA'
                          : b.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[15px] font-bold text-ttnb-blue mt-2">
                      <span>{b.origin}</span>
                      <span className="text-ttnb-teal">➔</span>
                      <span>{b.destination}</span>
                    </div>

                    <p className="text-[12px] text-[#615f5e] mt-1">
                      {b.departure_time} / {b.passengers_count || b.passengers?.length || 1} passageiro(s) · {b.booking_code}
                    </p>

                    {/* Bloco de Veículo com Edição de Placa */}
                    {hasVehicle && (
                      <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Car className="w-4 h-4 text-ttnb-blue shrink-0" />
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block uppercase">
                              Placa Cadastrada
                            </span>
                            <span className="text-[12px] font-mono font-bold text-ttnb-blue">
                              {currentPlate}
                            </span>
                          </div>
                        </div>

                        {!isBoarded ? (
                          <button
                            onClick={() => openPlateModal(b)}
                            className="bg-white border border-slate-300 hover:border-ttnb-blue text-ttnb-blue hover:text-ttnb-dark text-[11px] font-bold px-2.5 py-1.5 rounded-xs inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            <Edit3 className="w-3 h-3 text-ttnb-teal" />
                            <span>Alterar Placa</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded-xs">
                            Embarcado
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2">
                      {ticketId ? (
                        <button
                          onClick={() => navigate(`/bilhete/${ticketId}`)}
                          className="text-ttnb-orange hover:text-[#d96728] text-[12px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ver bilhete</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-semibold">
                          Aguardando emissão
                        </span>
                      )}

                      <span className="text-[11px] font-bold text-ttnb-blue">
                        R$ {Number(b.total_amount).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

      {/* MODAL: Alteração de Placa do Veículo (Regra de Negócio com Auditoria) */}
      {selectedBookingForPlate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md w-full max-w-sm p-5 shadow-xl border border-ttnb-border">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-ttnb-teal" />
                <h3 className="text-[15px] font-bold text-ttnb-blue">
                  Alterar Placa do Veículo
                </h3>
              </div>
              <button
                onClick={closePlateModal}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlate} className="mt-3.5 space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-2.5 text-[11px] text-amber-800">
                <p className="font-semibold">Regra de Embarque:</p>
                <p className="mt-0.5">
                  A placa pode ser corrigida até o momento do embarque. Toda alteração fica registrada para auditoria.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-ttnb-blue block mb-1">
                  Nova Placa (Mercosul ou Padrão)
                </label>
                <input
                  type="text"
                  placeholder="Ex: BRA2E19 ou ABC1234"
                  maxLength={8}
                  value={newPlateInput}
                  onChange={(e) => setNewPlateInput(e.target.value.toUpperCase())}
                  required
                  className="w-full p-2.5 bg-white border border-ttnb-border rounded-md text-[14px] font-mono font-bold tracking-wider uppercase focus:outline-none focus:border-ttnb-blue"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-ttnb-blue block mb-1">
                  Motivo da Alteração
                </label>
                <select
                  value={plateReason}
                  onChange={(e) => setPlateReason(e.target.value)}
                  className="w-full p-2.5 bg-white border border-ttnb-border rounded-md text-[12px] focus:outline-none focus:border-ttnb-blue"
                >
                  <option value="Correção cadastral">Correção de digitação</option>
                  <option value="Troca de veículo para a viagem">Troca de veículo para a viagem</option>
                  <option value="Veículo alugado / substituto">Veículo alugado ou reserva</option>
                </select>
              </div>

              {/* Histórico de alterações anteriores */}
              {selectedBookingForPlate.vehicle_plate_history?.length > 0 && (
                <div className="mt-2 border-t border-slate-100 pt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Histórico de Auditoria:
                  </span>
                  <div className="max-h-24 overflow-y-auto space-y-1 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-xs border border-slate-200">
                    {selectedBookingForPlate.vehicle_plate_history.map(
                      (h: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span>
                            {h.previous_plate ? `${h.previous_plate} ➔ ` : ''}
                            <strong className="text-ttnb-blue">{h.new_plate}</strong>
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(h.changed_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {plateError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-md text-[11px] text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{plateError}</span>
                </div>
              )}

              {plateSuccess && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-md text-[11px] text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{plateSuccess}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closePlateModal}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-2.5 px-3 rounded-ttnb-btn text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={plateUpdating}
                  className="flex-1 bg-ttnb-orange hover:bg-[#d96728] text-white font-bold py-2.5 px-3 rounded-ttnb-btn text-xs cursor-pointer disabled:opacity-50"
                >
                  {plateUpdating ? 'Salvando...' : 'Salvar Alteração'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
