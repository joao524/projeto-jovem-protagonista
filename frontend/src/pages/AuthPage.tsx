import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  ArrowRight,
  CheckSquare,
  Square,
  Anchor,
  ShieldCheck,
  User,
  LogIn,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { bookingId } = useParams();
  const toast = useToast();

  const redirectUrl = searchParams.get('redirect') || (bookingId ? `/checkout/${bookingId}` : '/minha-conta');

  const isRegisterRoute = location.pathname.includes('/cadastro');
  const [isLoginMode, setIsLoginMode] = useState(!isRegisterRoute);
  const [showPassword, setShowPassword] = useState(false);
  const [bookingSummary, setBookingSummary] = useState<any>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setIsLoginMode(!location.pathname.includes('/cadastro'));
  }, [location.pathname]);

  useEffect(() => {
    async function loadBooking() {
      if (!bookingId) return;
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBookingSummary(res.data);
      } catch (err) {
        console.error('Erro ao carregar detalhes da reserva', err);
      }
    }
    loadBooking();
  }, [bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Preencha seu e-mail e senha.');
      toast.warning('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!isLoginMode && !fullName) {
      setErrorMsg('Informe seu nome completo.');
      toast.warning('Informe seu nome completo.');
      return;
    }

    if (!isLoginMode && !acceptedTerms) {
      setErrorMsg('Você precisa aceitar os termos de uso.');
      toast.warning('Aceite os termos de serviço para prosseguir.');
      return;
    }

    try {
      setLoading(true);

      if (isLoginMode) {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('ttnb_token', res.data.access_token);
        localStorage.setItem('ttnb_user', JSON.stringify(res.data));
        window.dispatchEvent(new Event('storage'));
        toast.success(`Bem-vindo(a) de volta, ${res.data.email}!`);
      } else {
        const res = await api.post('/auth/register', {
          email,
          password,
          full_name: fullName,
        });
        localStorage.setItem('ttnb_token', res.data.access_token);
        localStorage.setItem('ttnb_user', JSON.stringify(res.data));
        window.dispatchEvent(new Event('storage'));
        toast.success('Conta criada com sucesso!');
      }

      navigate(redirectUrl);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Falha na autenticação. Verifique os dados.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: string) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.post(`/auth/demo-token?role=${role}`);
      localStorage.setItem('ttnb_token', res.data.access_token);
      localStorage.setItem('ttnb_user', JSON.stringify(res.data));
      window.dispatchEvent(new Event('storage'));
      toast.success(`Conectado como ${res.data.roles[0]} (${res.data.email})!`);
      navigate(redirectUrl);
    } catch (err: any) {
      toast.error('Erro ao gerar sessão de demonstração.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#fffefa] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        {/* Cabeçalho de Identidade Visual */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider border border-slate-200/80">
            <Anchor className="w-3.5 h-3.5 text-ttnb-teal" />
            <span>Terminal Náutico da Bahia • Acesso Seguro</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isLoginMode ? 'Acesse sua conta' : 'Crie sua conta'}
          </h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {isLoginMode
              ? 'Conecte-se para reservar travessias, emitir passagens e gerenciar bilhetes com agilidade.'
              : 'Cadastre-se em segundos para garantir assento na travessia e embarcar por QR Code.'}
          </p>
        </div>

        {/* Resumo de Reserva em Andamento (se veio do fluxo de compra) */}
        {bookingSummary && (
          <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl shadow-2xs">
            <p className="text-[10px] font-bold text-orange-800 uppercase tracking-wider mb-1">
              Finalização de Reserva
            </p>
            <div className="flex items-center justify-between text-slate-900 text-sm font-bold">
              <span>{bookingSummary.origin} ➔ {bookingSummary.destination}</span>
              <span className="text-ttnb-orange">R$ {Number(bookingSummary.total_amount).toFixed(2).replace('.', ',')}</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {bookingSummary.travel_date} às {bookingSummary.departure_time} • {bookingSummary.passengers_count} passageiro(s)
            </p>
          </div>
        )}

        {/* Notificação Contextual de Compra Inicial */}
        {redirectUrl.includes('/reserva') && !bookingSummary && (
          <div className="p-4 bg-teal-50/80 border border-teal-200/90 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2 text-teal-900 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-ttnb-teal" />
              <span>Identificação Inicial de Compra</span>
            </div>
            <p className="text-xs text-teal-800 leading-relaxed">
              Faça login ou utilize o <strong>Acesso 1-Clique</strong> abaixo para iniciar sua reserva e emitir seu cartão de embarque digital.
            </p>
          </div>
        )}

        {/* Card Principal de Formulário */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Alternador de Abas Moderno em Pílula */}
          <div className="bg-slate-100 p-1.5 rounded-full flex gap-1">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(true);
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isLoginMode
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Já tenho conta</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(false);
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                !isLoginMode
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Criar nova conta</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Nome e Sobrenome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-ttnb-blue outline-none transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-ttnb-blue outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Senha
                </label>
                {isLoginMode && (
                  <span className="text-[11px] text-slate-400 hover:text-ttnb-orange cursor-pointer">
                    Esqueceu a senha?
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium pr-11 focus:bg-white focus:border-ttnb-blue outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Termos de Serviço */}
            {!isLoginMode && (
              <div
                onClick={() => setAcceptedTerms(!acceptedTerms)}
                className="flex items-start space-x-2 pt-1 cursor-pointer select-none"
              >
                <div className="mt-0.5 text-ttnb-teal">
                  {acceptedTerms ? (
                    <CheckSquare className="w-4 h-4 text-ttnb-blue" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Li e concordo com os Termos de Serviço e a Política de Privacidade do Terminal Náutico da Bahia.
                </p>
              </div>
            )}

            {errorMsg && (
              <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">
                {errorMsg}
              </p>
            )}

            {/* Botão de Envio Principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#ed7837] hover:bg-[#d96728] active:scale-98 text-white font-bold py-3.5 px-6 rounded-full shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Processando...' : isLoginMode ? 'Entrar e Continuar' : 'Cadastrar e Continuar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Atalhos de Login Rápido (Modo Demonstração / Avaliação) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-ttnb-teal" />
              <span>Acesso Rápido de Demonstração:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('PASSENGER')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors cursor-pointer"
              >
                <p className="text-[11px] font-bold text-slate-800">Passageiro</p>
                <p className="text-[10px] text-slate-500">Ana Costa</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('OPERATOR')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors cursor-pointer"
              >
                <p className="text-[11px] font-bold text-slate-800">Operador</p>
                <p className="text-[10px] text-slate-500">Marcos Fiscal</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('SUPERVISOR')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors cursor-pointer"
              >
                <p className="text-[11px] font-bold text-slate-800">Supervisor</p>
                <p className="text-[10px] text-slate-500">Gestão TTNB</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
