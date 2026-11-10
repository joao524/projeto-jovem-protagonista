import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Ticket,
  Home,
  UserPlus,
  User,
  Clock,
  CloudSun,
  Megaphone,
  Info,
  ScanLine,
  Monitor,
  Coins,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { safeStorage } from '../utils/storage';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState<string>('VISITANTE');
  const [switching, setSwitching] = useState<boolean>(false);

  // Trava de scroll do body e listener de tecla Escape com cleanup estrito
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    try {
      const u = safeStorage.getItem<any>('ttnb_user');
      if (u && u.roles && u.roles.length > 0) {
        setCurrentRole(u.roles[0]);
        return;
      }
    } catch {
      // ignore
    }
    setCurrentRole('VISITANTE');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSwitchRole = async (targetRole: string) => {
    setSwitching(true);
    try {
      const res = await api.post(`/auth/demo-token?role=${targetRole}`);
      safeStorage.setItem('ttnb_token', res.data.access_token);
      safeStorage.setItem('ttnb_user', res.data);
      setCurrentRole(targetRole);
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Falha ao alternar papel de demonstração:', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-menu-title"
    >
      {/* Backdrop com desfoque e escurecimento */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer deslizante a partir da ESQUERDA */}
      <div className="absolute inset-y-0 left-0 w-80 sm:w-88 max-w-[85vw] bg-white shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-left duration-200 z-10">
        <div>
          {/* Header do Drawer: Título MENU e botão Fechar X */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 id="drawer-menu-title" className="text-xl font-black tracking-tight text-slate-900">
              MENU
            </h2>
            <button
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Fechar menu de navegação"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Botão de Destaque Laranja: Comprar passagem */}
          <button
            onClick={() => handleNavigate('/horarios')}
            className="w-full mt-3 bg-[#ed7837] hover:bg-[#d96728] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
          >
            <Ticket className="w-5 h-5 text-white" />
            <span className="text-[15px]">Comprar passagem</span>
          </button>

          {/* Seletor Rápido de Papel (Modo Demonstração / Avaliador) */}
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-ttnb-teal" />
                Papel Ativo
              </span>
              <span className="text-[10px] font-mono font-bold bg-white border border-slate-200 text-ttnb-blue px-2 py-0.5 rounded-full">
                {currentRole}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-semibold">
              <button
                type="button"
                disabled={switching}
                onClick={() => handleSwitchRole('PASSENGER')}
                className={`py-1.5 px-1 rounded-md transition-all cursor-pointer ${
                  currentRole === 'PASSENGER'
                    ? 'bg-ttnb-blue text-white shadow-2xs font-bold'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                }`}
              >
                Passageiro
              </button>
              <button
                type="button"
                disabled={switching}
                onClick={() => handleSwitchRole('OPERATOR')}
                className={`py-1.5 px-1 rounded-md transition-all cursor-pointer ${
                  currentRole === 'OPERATOR'
                    ? 'bg-ttnb-blue text-white shadow-2xs font-bold'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                }`}
              >
                Operador
              </button>
              <button
                type="button"
                disabled={switching}
                onClick={() => handleSwitchRole('SUPERVISOR')}
                className={`py-1.5 px-1 rounded-md transition-all cursor-pointer ${
                  currentRole === 'SUPERVISOR' || currentRole === 'ADMINISTRATOR'
                    ? 'bg-ttnb-blue text-white shadow-2xs font-bold'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                }`}
              >
                Supervisor
              </button>
            </div>
          </div>

          {/* Seção 1: MINHA VIAGEM */}
          <div className="mt-5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              MINHA VIAGEM
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNavigate('/')}
                className="w-full flex items-center gap-3.5 px-2 py-2 rounded-lg text-slate-700 hover:text-ttnb-blue hover:bg-slate-50 transition-colors text-left cursor-pointer group"
              >
                <Home className="w-5 h-5 text-slate-500 group-hover:text-ttnb-blue" />
                <span className="text-[14px] font-medium">Início</span>
              </button>

              <button
                onClick={() => handleNavigate('/cadastro')}
                className="w-full flex items-center gap-3.5 px-2 py-2 rounded-lg text-slate-700 hover:text-ttnb-blue hover:bg-slate-50 transition-colors text-left cursor-pointer group"
              >
                <UserPlus className="w-5 h-5 text-slate-500 group-hover:text-ttnb-blue" />
                <span className="text-[14px] font-medium">Criar uma conta</span>
              </button>

              <button
                onClick={() => handleNavigate('/horarios')}
                className="w-full flex items-center gap-3.5 px-2 py-2 rounded-lg text-slate-700 hover:text-ttnb-blue hover:bg-slate-50 transition-colors text-left cursor-pointer group"
              >
                <Ticket className="w-5 h-5 text-slate-500 group-hover:text-ttnb-blue" />
                <span className="text-[14px] font-medium">Passagens</span>
              </button>

              <button
                onClick={() => handleNavigate('/minha-conta')}
                className="w-full flex items-center gap-3.5 px-2 py-2 rounded-lg text-slate-700 hover:text-ttnb-blue hover:bg-slate-50 transition-colors text-left cursor-pointer group"
              >
                <User className="w-5 h-5 text-slate-500 group-hover:text-ttnb-blue" />
                <span className="text-[14px] font-medium">Área do passageiro</span>
              </button>
            </div>
          </div>

          {/* Seção 2: INFORMAÇÕES */}
          <div className="mt-5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              INFORMAÇÕES
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNavigate('/filometro')}
                className="w-full flex items-center gap-3.5 px-2 py-2 rounded-lg text-slate-700 hover:text-ttnb-blue hover:bg-slate-50 transition-colors text-left cursor-pointer group"
              >
                <Clock className="w-5 h-5 text-slate-500 group-hover:text-ttnb-blue" />
                <span className="text-[14px] font-medium">Filômetro</span>
              </button>

              <button
                onClick={() => handleNavigate('/previsao-tempo')}
                className="w-full flex items-center gap-3.5 px-2 py-2 rounded-lg text-slate-700 hover:text-ttnb-blue hover:bg-slate-50 transition-colors text-left cursor-pointer group"
              >
                <CloudSun className="w-5 h-5 text-slate-500 group-hover:text-ttnb-blue" />
                <span className="text-[14px] font-medium">Previsão do tempo</span>
              </button>

              <button
                onClick={() => handleNavigate('/noticias')}
                className="w-full flex items-center gap-3.5 px-2 py-2 rounded-lg text-slate-700 hover:text-ttnb-blue hover:bg-slate-50 transition-colors text-left cursor-pointer group"
              >
                <Megaphone className="w-5 h-5 text-slate-500 group-hover:text-ttnb-blue" />
                <span className="text-[14px] font-medium">Notícias e avisos</span>
              </button>

              <button
                onClick={() => handleNavigate('/status')}
                className="w-full flex items-center gap-3.5 px-2 py-2 rounded-lg text-slate-700 hover:text-ttnb-blue hover:bg-slate-50 transition-colors text-left cursor-pointer group"
              >
                <Info className="w-5 h-5 text-slate-500 group-hover:text-ttnb-blue" />
                <span className="text-[14px] font-medium">Atualização operacional</span>
              </button>
            </div>
          </div>

          {/* Seção 3: PAINEL DO OPERADOR (Card arredondado azul-cinza claro) */}
          <div className="mt-5 p-3.5 bg-[#eef3f6] rounded-2xl border border-[#e2e8f0]">
            <p className="text-[11px] font-bold text-[#5c6e7e] uppercase tracking-wider mb-2 px-1">
              PAINEL DO OPERADOR
            </p>
            <div className="space-y-1">
              <button
                onClick={() => handleNavigate('/operador/embarque')}
                className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-slate-700 hover:text-ttnb-blue hover:bg-white/80 transition-colors text-left cursor-pointer group"
              >
                <ScanLine className="w-4 h-4 text-slate-600 group-hover:text-ttnb-blue" />
                <span className="text-[13px] font-medium">Embarque</span>
              </button>

              <button
                onClick={() => handleNavigate('/operador/caixa')}
                className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-slate-700 hover:text-ttnb-blue hover:bg-white/80 transition-colors text-left cursor-pointer group"
              >
                <Monitor className="w-4 h-4 text-slate-600 group-hover:text-ttnb-blue" />
                <span className="text-[13px] font-medium">Guichê</span>
              </button>

              <button
                onClick={() => handleNavigate('/admin/reembolsos')}
                className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-slate-700 hover:text-ttnb-blue hover:bg-white/80 transition-colors text-left cursor-pointer group"
              >
                <Coins className="w-4 h-4 text-slate-600 group-hover:text-ttnb-blue" />
                <span className="text-[13px] font-medium">Reembolsos</span>
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé: Precisa de ajuda? */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              PRECISA DE AJUDA?
            </p>
            <a
              href="tel:7132419783"
              className="text-[13px] font-semibold text-slate-800 hover:text-ttnb-orange transition-colors"
            >
              Ligue (71) 3241-9783
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
