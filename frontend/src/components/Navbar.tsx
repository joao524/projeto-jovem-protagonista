import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, ArrowLeft, Anchor, Ticket, User, HelpCircle } from 'lucide-react';

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

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#fffefa]/95 backdrop-blur-md border-b border-[#e5e5e5] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Esquerda: Botão Voltar ou Logo TTNB */}
        <div className="flex items-center space-x-3">
          {showBack ? (
            <button
              onClick={handleBack}
              className="p-1.5 -ml-1 text-slate-800 hover:text-ttnb-orange hover:bg-slate-100/60 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-ttnb-blue" />
              <span className="text-[14px] font-semibold text-slate-800">{backTitle}</span>
            </button>
          ) : (
            <div
              onClick={() => navigate('/')}
              className="flex items-center space-x-2.5 cursor-pointer select-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-ttnb-mint flex items-center justify-center text-ttnb-blue group-hover:bg-ttnb-blue group-hover:text-white transition-colors shadow-2xs">
                <Anchor className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[12px] font-extrabold text-ttnb-blue leading-tight tracking-wide">
                  TERMINAL NÁUTICO
                </p>
                <p className="text-[10px] font-semibold text-ttnb-subtle leading-tight">
                  DA BAHIA — TTNB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Centro: Links de Navegação Rápida (Desktop - telas md e maiores) */}
        <nav className="hidden md:flex items-center space-x-6 text-[13px] font-medium text-slate-700">
          <button
            onClick={() => navigate('/')}
            className={`transition-colors cursor-pointer ${
              isActive('/') ? 'text-ttnb-orange font-bold' : 'hover:text-ttnb-blue'
            }`}
          >
            Início
          </button>
          <button
            onClick={() => navigate('/horarios')}
            className={`transition-colors cursor-pointer ${
              isActive('/horarios') ? 'text-ttnb-orange font-bold' : 'hover:text-ttnb-blue'
            }`}
          >
            Horários & Tarifas
          </button>
          <button
            onClick={() => navigate('/filometro')}
            className={`transition-colors cursor-pointer ${
              isActive('/filometro') ? 'text-ttnb-orange font-bold' : 'hover:text-ttnb-blue'
            }`}
          >
            Filômetro
          </button>
          <button
            onClick={() => navigate('/status')}
            className={`transition-colors cursor-pointer ${
              isActive('/status') ? 'text-ttnb-orange font-bold' : 'hover:text-ttnb-blue'
            }`}
          >
            Status Operacional
          </button>
          <button
            onClick={() => navigate('/minha-conta')}
            className={`transition-colors cursor-pointer ${
              isActive('/minha-conta') ? 'text-ttnb-orange font-bold' : 'hover:text-ttnb-blue'
            }`}
          >
            Área do Passageiro
          </button>
        </nav>

        {/* Direita: Ações Desktop e Botão Menu Hamburger */}
        <div className="flex items-center space-x-3">
          {/* CTA Comprar passagem no Desktop */}
          <button
            onClick={() => navigate('/horarios')}
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#ed7837] hover:bg-[#d96728] text-white font-bold text-[13px] px-3.5 py-2 rounded-lg shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <Ticket className="w-4 h-4" />
            <span>Comprar passagem</span>
          </button>

          {/* Botão de Menu Principal (Abre o Drawer em Mobile e Desktop) */}
          <button
            onClick={onOpenMenu}
            className="p-2 text-slate-800 hover:text-ttnb-orange hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            aria-label="Abrir Menu de Navegação"
            title="Abrir Menu"
          >
            <Menu className="w-6 h-6" />
            <span className="hidden md:inline text-[13px] font-bold text-slate-800">Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};
