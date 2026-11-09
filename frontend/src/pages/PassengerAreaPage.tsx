import React, { useState, useEffect, useRef } from 'react';
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
  Settings,
  Bell,
  Sliders,
  Save,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { safeStorage } from '../utils/storage';

export const PassengerAreaPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'TICKETS' | 'SETTINGS'>('TICKETS');
  const [user, setUser] = useState<any>(null);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [selectedBookingForPlate, setSelectedBookingForPlate] = useState<any>(null);
  const [newPlateInput, setNewPlateInput] = useState('');
  const [plateReason, setPlateReason] = useState('Correção cadastral');
  const [plateUpdating, setPlateUpdating] = useState(false);
  const [plateError, setPlateError] = useState<string | null>(null);
  const [plateSuccess, setPlateSuccess] = useState<string | null>(null);

  // Configurações personalizadas do usuário
  const [userSettings, setUserSettings] = useState<any>({
    default_plate: 'BRA2E19',
    notify_weather_email: true,
    notify_weather_whatsapp: true,
    receipt_format: 'DIGITAL_QR',
    favorite_route: 'Salvador ➔ Mar Grande',
    auto_checkin: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const settingsTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (settingsTimeoutRef.current) {
        window.clearTimeout(settingsTimeoutRef.current);
      }
    };
  }, []);

  const loadBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      setMyBookings(res.data);
    } catch (err) {
      console.error('Erro ao buscar histórico', err);
    }
  };

  const loadUserConfig = async () => {
    try {
      const res = await api.get('/auth/me/config');
      if (res.data?.settings) {
        setUserSettings(res.data.settings);
      }
    } catch {
      // Usa defaults locais se a rota de config não responder
    }
  };

  useEffect(() => {
    const storedUser = safeStorage.getItem<any>('ttnb_user');
    if (storedUser) {
      setUser(storedUser);
    } else {
      setUser({ full_name: 'Ana Costa', email: 'ana@email.com' });
    }
    loadBookings();
    loadUserConfig();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      await api.patch('/auth/me/config', { settings: userSettings });
      setSettingsSuccess(true);
      if (settingsTimeoutRef.current) {
        clearTimeout(settingsTimeoutRef.current);
      }
      settingsTimeoutRef.current = setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar preferências:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogout = () => {
    safeStorage.removeItem('ttnb_token');
    safeStorage.removeItem('ttnb_user');
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
    <div className="max-w-4xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-between">
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

        {/* Card do Usuário com Papel do Sistema */}
        <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-ttnb-blue text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              {initialLetter}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-extrabold text-ttnb-blue truncate">
                  {displayName}
                </p>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md uppercase">
                  {user?.roles?.[0] || 'PASSAGEIRO'}
                </span>
              </div>
              <p className="text-[12px] text-slate-500 truncate mt-0.5">
                {user?.email || 'ana@email.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Abas: Minhas Passagens vs Configurações do Usuário */}
        <div className="mt-6 flex border-b border-slate-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('TICKETS')}
            className={`pb-3 px-4 text-[13px] font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'TICKETS'
                ? 'border-ttnb-blue text-ttnb-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Minhas Passagens</span>
            {myBookings.length > 0 && (
              <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono font-bold">
                {myBookings.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SETTINGS')}
            className={`pb-3 px-4 text-[13px] font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'SETTINGS'
                ? 'border-ttnb-blue text-ttnb-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4 text-ttnb-teal" />
            <span>Configurações & Parâmetros</span>
          </button>
        </div>

        {activeTab === 'SETTINGS' ? (
          /* PAINEL DE CONFIGURAÇÕES ESPECÍFICAS DO USUÁRIO */
          <form onSubmit={handleSaveSettings} className="mt-6 space-y-6 animate-fade-in">
            {/* Bloco 1: Notificações e Alertas de Maré */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Bell className="w-4 h-4 text-ttnb-teal" />
                <h3 className="text-[14px] font-bold text-slate-800">
                  Alertas Meteorológicos e Operacionais
                </h3>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">
                    Avisos de Ressaca e Suspensão por E-mail
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Receba e-mail imediatamente se a Capitania dos Portos suspender viagens.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={!!userSettings.notify_weather_email}
                  onChange={(e) =>
                    setUserSettings({ ...userSettings, notify_weather_email: e.target.checked })
                  }
                  className="w-4 h-4 text-ttnb-orange accent-ttnb-orange rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-3">
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">
                    Alertas Críticos via WhatsApp / SMS
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Notificação no smartphone para alterações de saída de última hora.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={!!userSettings.notify_weather_whatsapp}
                  onChange={(e) =>
                    setUserSettings({ ...userSettings, notify_weather_whatsapp: e.target.checked })
                  }
                  className="w-4 h-4 text-ttnb-orange accent-ttnb-orange rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Bloco 2: Veículo Padrão e Trajetos */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Car className="w-4 h-4 text-ttnb-teal" />
                <h3 className="text-[14px] font-bold text-slate-800">
                  Veículo Padrão & Preferências de Viagem
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Placa Padrão Pré-preenchida
                  </label>
                  <input
                    type="text"
                    value={userSettings.default_plate || ''}
                    onChange={(e) =>
                      setUserSettings({
                        ...userSettings,
                        default_plate: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="Ex: BRA2E19"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:border-ttnb-blue outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Facilita a compra de passagens de carro sem redigitar.
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Destino Frequente
                  </label>
                  <select
                    value={userSettings.favorite_route || 'Salvador ➔ Mar Grande'}
                    onChange={(e) =>
                      setUserSettings({ ...userSettings, favorite_route: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:border-ttnb-blue outline-none"
                  >
                    <option value="Salvador ➔ Mar Grande">Salvador ➔ Mar Grande (Itaparica)</option>
                    <option value="Salvador ➔ Morro de São Paulo">
                      Salvador ➔ Morro de São Paulo
                    </option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Formato Preferencial do Bilhete de Embarque
                </label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <label
                    className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between text-xs font-bold transition-all ${
                      userSettings.receipt_format === 'DIGITAL_QR'
                        ? 'border-ttnb-blue bg-blue-50/50 text-ttnb-blue'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span>📱 QR Code no Celular</span>
                    <input
                      type="radio"
                      name="receipt_format"
                      checked={userSettings.receipt_format === 'DIGITAL_QR'}
                      onChange={() =>
                        setUserSettings({ ...userSettings, receipt_format: 'DIGITAL_QR' })
                      }
                      className="hidden"
                    />
                  </label>

                  <label
                    className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between text-xs font-bold transition-all ${
                      userSettings.receipt_format === 'PRINT_A4'
                        ? 'border-ttnb-blue bg-blue-50/50 text-ttnb-blue'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span>📄 Voucher para Impressão</span>
                    <input
                      type="radio"
                      name="receipt_format"
                      checked={userSettings.receipt_format === 'PRINT_A4'}
                      onChange={() =>
                        setUserSettings({ ...userSettings, receipt_format: 'PRINT_A4' })
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Ações de Salvar */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                {settingsSuccess && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Preferências salvas com sucesso no seu perfil!
                  </>
                )}
              </span>

              <button
                type="submit"
                disabled={savingSettings}
                className="bg-ttnb-blue hover:bg-ttnb-dark active:scale-95 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Salvando...' : 'Salvar Preferências'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Card Próxima Viagem ou Lista de Reservas */
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
      )}

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
