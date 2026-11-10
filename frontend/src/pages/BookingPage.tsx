import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Plus,
  Minus,
  ArrowRight,
  Car,
  Info,
  ChevronDown,
  Check,
  X,
  Compass,
  ShieldCheck,
  User,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { safeStorage } from '../utils/storage';

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
  const toast = useToast();

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

  // Estado de Autenticação
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(safeStorage.getItem<string>('ttnb_token'));

  useEffect(() => {
    const syncAuth = () => {
      const currentToken = safeStorage.getItem<string>('ttnb_token');
      const currentUser = safeStorage.getItem<any>('ttnb_user');
      setToken(currentToken);
      setUser(currentUser);
    };
    syncAuth();
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  const vehiclePrice = includeVehicle ? 45.0 : 0.0;
  const totalEstimated = passengerCount * unitPrice + vehiclePrice;
  const availableTimes = isMorro ? AVAILABLE_TIMES_MORRO : AVAILABLE_TIMES_MAR_GRANDE;

  const handleIncrement = () => {
    if (passengerCount < 10) setPassengerCount(passengerCount + 1);
  };

  const handleDecrement = () => {
    if (passengerCount > 1) setPassengerCount(passengerCount - 1);
  };

  const handleQuickDemoLogin = async () => {
    try {
      setLoading(true);
      const res = await api.post('/auth/demo-token?role=passenger');
      safeStorage.setItem('ttnb_token', res.data.access_token);
      safeStorage.setItem('ttnb_user', res.data);
      setToken(res.data.access_token);
      setUser(res.data);
      window.dispatchEvent(new Event('storage'));
      toast.success('Conectado como Ana Costa (Passageira)!');
    } catch {
      toast.error('Não foi possível conectar automaticamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (includeVehicle && !vehiclePlate.trim()) {
      toast.warning('Por favor, informe a placa do veículo conforme exigido.');
      return;
    }

    try {
      setLoading(true);

      const passengersPayload = Array.from({ length: passengerCount }).map((_, i) => ({
        full_name: user?.name || `Passageiro ${i + 1}`,
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
              driver_name: user?.name || 'Motorista Titular',
            }
          : null,
      };

      const res = await api.post('/bookings', payload);
      const booking = res.data;
      localStorage.setItem('active_booking_id', booking.id);

      // Se já estiver logado, segue direto para checkout
      if (token) {
        toast.success('Reserva inicial criada com sucesso!');
        navigate(`/checkout/${booking.id}`);
      } else {
        toast.info('Reserva criada. Por favor, identifique-se para finalizar.');
        navigate(`/identificacao/${booking.id}`);
      }
    } catch (err: any) {
      console.error('Erro ao criar intenção de reserva', err);
      toast.error(
        err.response?.data?.detail || 'Erro ao registrar intenção de reserva. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto min-h-screen bg-[#fffefa] px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-32 lg:pb-12">
      {/* Header Big Tech com Breadcrumbs */}
      <div className="pb-6 border-b border-slate-200/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2 border border-slate-200">
          <Compass className="w-3.5 h-3.5 text-ttnb-teal" />
          <span>RESERVA ONLINE DE PASSAGEM</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Onde vamos navegar?
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure sua travessia na Baía de Todos-os-Santos com confirmação em tempo real.
        </p>
      </div>

      {/* CARD DE IDENTIFICAÇÃO / LOGIN INICIAL (CONFORME REQUISITO DO USUÁRIO) */}
      {!token ? (
        <div className="mt-6 p-5 sm:p-6 bg-gradient-to-r from-teal-50/90 via-sky-50/70 to-emerald-50/90 border border-teal-200/90 rounded-2xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
                <span className="text-xs font-black text-teal-900 uppercase tracking-wider">
                  IDENTIFICAÇÃO RECOMENDADA PARA COMPRA
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                Acesse sua conta para salvar seu bilhete e receber avisos de embarque
              </p>
              <p className="text-xs text-slate-600">
                Você pode entrar com 1 clique usando o perfil de demonstração ou efetuar login regular.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="bg-ttnb-blue hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Entrar como Ana Costa (1-Clique)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/login?redirect=${encodeURIComponent(
                      window.location.pathname + window.location.search
                    )}`
                  )
                }
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <span>Fazer Login / Cadastrar</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">
                Conectado como {user?.name || user?.email || 'Passageiro Autenticado'}
              </p>
              <p className="text-[11px] text-emerald-800/80">
                Bilhete fiscal e QR Code serão emitidos em seu nome.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg">
            Sessão Ativa
          </span>
        </div>
      )}

      {/* Grid Principal: 2 Colunas no Desktop */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Formulários de Configuração (7 colunas) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Trajeto */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
              TRAJETO SELECIONADO
            </label>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl">
              <div className="flex items-center space-x-3">
                <span className="text-base font-black text-slate-900">Salvador</span>
                <ArrowRightLeft className="w-4 h-4 text-ttnb-teal" />
                <span className="text-base font-black text-ttnb-teal">{destino}</span>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                {operador}
              </span>
            </div>
          </div>

          {/* Seleção de Data e Horário Interativos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* DATA DA VIAGEM */}
            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                DATA DA VIAGEM
              </label>
              <div className="relative bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3 flex items-center justify-between transition-colors">
                <input
                  type="date"
                  value={travelDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full text-sm font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                />
                <Calendar className="w-4 h-4 text-ttnb-teal pointer-events-none absolute right-3" />
              </div>
            </div>

            {/* HORÁRIO DA VIAGEM */}
            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                HORÁRIO DE PARTIDA
              </label>
              <button
                type="button"
                onClick={() => setShowTimeModal(true)}
                className="w-full bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3 flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <span className="text-sm font-bold text-slate-900">{horario}</span>
                <div className="flex items-center gap-1 text-ttnb-teal">
                  <Clock className="w-4 h-4" />
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>

          {/* Contador de Passageiros */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                  PASSAGEIROS
                </label>
                <p className="text-sm font-bold text-slate-900 mt-0.5">Bilhetes Adulto</p>
                <p className="text-xs text-slate-500">Tarifa regular • A partir de 12 anos</p>
              </div>

              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={passengerCount <= 1}
                  aria-label="Remover um passageiro"
                  className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span
                  className="text-base font-black text-slate-900 w-7 text-center tabular-nums"
                  aria-live="polite"
                  aria-label={`${passengerCount} passageiro(s)`}
                >
                  {passengerCount}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={passengerCount >= 10}
                  aria-label="Adicionar um passageiro"
                  className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Inclusão de Veículo */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeVehicle}
                onChange={(e) => setIncludeVehicle(e.target.checked)}
                className="mt-1 rounded text-ttnb-orange focus:ring-ttnb-orange w-4 h-4"
              />
              <div>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-ttnb-teal" />
                  Incluir vaga para veículo nesta viagem (+ R$ 45,00)
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Válido para carros de passeio, SUVs e motocicletas na lancha / ferry.
                </p>
              </div>
            </label>

            {includeVehicle && (
              <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Placa do Veículo (Padrão Mercosul ou Antigo)
                  </label>
                  <input
                    type="text"
                    placeholder="EX: BRA2E19"
                    maxLength={8}
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold uppercase focus:bg-white focus:outline-none focus:border-ttnb-blue"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    A placa pode ser atualizada até o horário do embarque na sua área de passageiro.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Categoria do Veículo
                  </label>
                  <select
                    value={vehicleCategory}
                    onChange={(e) => setVehicleCategory(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-ttnb-blue"
                  >
                    <option value="STANDARD_CAR">Automóvel de Passeio / SUV</option>
                    <option value="MOTORCYCLE">Motocicleta</option>
                    <option value="VAN">Van / Caminhonete Pequena</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita: Resumo Fixo / Sticky (5 colunas) */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-5">
            <h2 className="text-lg font-black text-slate-900 tracking-tight pb-3 border-b border-slate-100">
              Resumo da Travessia
            </h2>

            {/* Linhas de Resumo */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>
                  {passengerCount}x Passagem ({destino})
                </span>
                <span className="font-bold text-slate-900">
                  R$ {(passengerCount * unitPrice).toFixed(2).replace('.', ',')}
                </span>
              </div>

              {includeVehicle && (
                <div className="flex justify-between items-center text-slate-600">
                  <span>1x Vaga de Veículo ({vehicleCategory})</span>
                  <span className="font-bold text-slate-900">R$ 45,00</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-600">
                <span>Taxa de Embarque Terminal</span>
                <span className="font-bold text-emerald-600">Inclusa</span>
              </div>
            </div>

            {/* Totalizador */}
            <div className="pt-4 border-t border-slate-200/80 flex items-baseline justify-between">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  TOTAL ESTIMADO
                </p>
                <p className="text-[11px] text-slate-500">Sem cobranças surpresa</p>
              </div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                R$ {totalEstimated.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {/* Botão de Ação Principal */}
            <button
              type="button"
              onClick={handleContinue}
              disabled={loading}
              className="w-full bg-ttnb-orange hover:bg-[#d96728] active:scale-98 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60 text-sm sm:text-base"
            >
              <span>{loading ? 'Processando reserva...' : 'Prosseguir para Pagamento'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Garantias de Segurança */}
            <div className="pt-2 flex items-center justify-center space-x-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Transação protegida • Validade fiscal estadual</span>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA INFERIOR FLUTUANTE STICKY PARA DISPOSITIVOS MÓVEIS (UX ERGONOMICS) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {passengerCount}x passageiro{passengerCount > 1 ? 's' : ''} {includeVehicle ? '+ veículo' : ''}
          </span>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            R$ {totalEstimated.toFixed(2).replace('.', ',')}
          </span>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          className="bg-ttnb-orange hover:bg-[#d96728] active:scale-98 text-white font-bold py-3 px-5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60 text-xs sm:text-sm shrink-0"
        >
          <span>{loading ? 'Aguarde...' : 'Prosseguir'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* MODAL: SELETOR DE HORÁRIO INTERATIVO */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Clock className="w-4 h-4 text-ttnb-teal" />
                <h3 className="text-sm font-bold">Escolha o Horário de Saída</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTimeModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2.5">
              Horários disponíveis hoje para <strong>{destino}</strong>:
            </p>

            <div className="grid grid-cols-3 gap-2 mt-3.5 max-h-60 overflow-y-auto p-1">
              {availableTimes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setHorario(t);
                    setShowTimeModal(false);
                  }}
                  className={`py-2.5 px-2 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
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
              className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
