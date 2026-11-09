import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, ArrowLeft, Anchor, Ticket, User as UserIcon, LogIn } from 'lucide-react';
import { safeStorage } from '../utils/storage';

interface NavbarProps {
  onOpenMenu: () => void;
  showBack?: boolean;
  backTitle?: string;
  onBack?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMenu,
  showBack = false,
  backTitle = "Voltar",
  onBack,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = () => {
      try {
        const u = safeStorage.getItem<any>('ttnb_user');
        setCurrentUser(u);
      } catch {
        setCurrentUser(null);
      }
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#fffefa]/90 backdrop-blur-xl border-b border-slate-200/70 transition-all">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
        {/* Esquerda: Logo Náutico TTNB ou Botão Voltar */}
        <div className="flex items-center space-x-4">
          {showBack ? (
            <button
              onClick={handleBack}
              className="px-3.5 py-2 -ml-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-full transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-ttnb-blue" />
              <span className="text-[14px] font-semibold">{backTitle}</span>
            </button>
          ) : (
            <div
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-ttnb-blue flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Anchor className="w-5 h-5 text-ttnb-mint" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-black tracking-tight text-ttnb-blue leading-tight">
                  TERMINAL NÁUTICO
                </span>
                <span className="text-[11px] font-medium text-slate-500 leading-tight">
                  DA BAHIA — TTNB
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Centro: Links de Navegação Big Tech com Espaçamento Arejado */}
        <nav className="hidden lg:flex items-center space-x-10 text-[14px] font-medium text-slate-600">
          <button
            onClick={() => navigate('/horarios')}
            className={`transition-colors cursor-pointer py-1 ${
              isActive('/horarios')
                ? 'text-ttnb-blue font-bold border-b-2 border-ttnb-blue'
                : 'hover:text-ttnb-blue'
            }`}
          >
            Horários & Tarifas
          </button>
          <button
            onClick={() => navigate('/filometro')}
            className={`transition-colors cursor-pointer py-1 ${
              isActive('/filometro')
                ? 'text-ttnb-blue font-bold border-b-2 border-ttnb-blue'
                : 'hover:text-ttnb-blue'
            }`}
          >
            Filômetro
          </button>
          <button
            onClick={() => navigate('/status')}
            className={`transition-colors cursor-pointer py-1 ${
              isActive('/status')
                ? 'text-ttnb-blue font-bold border-b-2 border-ttnb-blue'
                : 'hover:text-ttnb-blue'
            }`}
          >
            Status Operacional
          </button>
          <button
            onClick={() => navigate('/minha-conta')}
            className={`transition-colors cursor-pointer py-1 ${
              isActive('/minha-conta')
                ? 'text-ttnb-blue font-bold border-b-2 border-ttnb-blue'
                : 'hover:text-ttnb-blue'
            }`}
          >
            Área do Passageiro
          </button>
        </nav>

        {/* Direita: CTA Big Tech e Botão Menu */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {currentUser ? (
            <button
              onClick={() => navigate('/minha-conta')}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-200/60"
              title="Acessar Área do Passageiro"
            >
              <div className="w-5 h-5 rounded-full bg-ttnb-blue text-white flex items-center justify-center text-[10px]">
                {(currentUser.full_name || currentUser.email || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="truncate max-w-[120px]">
                {currentUser.full_name ? currentUser.full_name.split(' ')[0] : 'Minha Conta'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-ttnb-blue px-3 py-2 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}

          {/* Botão Pílula "Comprar passagem" */}
          <button
            onClick={() => navigate('/horarios')}
            className="hidden sm:inline-flex items-center gap-2 bg-[#ed7837] hover:bg-[#d96728] active:scale-95 text-white font-bold text-[13px] px-5 py-2.5 rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Ticket className="w-4 h-4" />
            <span>Comprar passagem</span>
          </button>

          {/* Botão Menu Hamburger com Design Minimalista */}
          <button
            onClick={onOpenMenu}
            className="w-10 h-10 rounded-full hover:bg-slate-100/90 active:scale-95 transition-all flex items-center justify-center text-slate-700 hover:text-slate-900 cursor-pointer"
            aria-label="Abrir Menu de Navegação"
            title="Abrir Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
