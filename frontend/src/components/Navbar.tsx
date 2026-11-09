import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ArrowLeft, Anchor } from 'lucide-react';

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

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fffefa] border-b border-[#e5e5e5] shadow-xs">
      {/* Barra superior de status estilo mobile integrada */}
      <div className="max-w-md mx-auto px-4 pt-1.5 pb-1 flex justify-between items-center text-[11px] text-[#615f5e]">
        <span className="font-semibold text-black">9:41</span>
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] tracking-tight">●●●</span>
          <span className="text-[10px]">5G</span>
          <div className="w-4 h-2.5 border border-black rounded-xs p-[0.5px] flex items-center">
            <div className="h-full w-2.5 bg-black rounded-xs"></div>
          </div>
        </div>
      </div>

      {/* Header com Identidade Visual do Figma */}
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        {showBack ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBack}
              className="p-1 -ml-1 text-black hover:text-ttnb-orange transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[13px] font-medium text-black">{backTitle}</span>
            </button>
          </div>
        ) : (
          <div
            onClick={() => navigate('/')}
            className="flex items-center space-x-2.5 cursor-pointer select-none"
          >
            <div className="w-7 h-7 rounded-md bg-ttnb-mint flex items-center justify-center text-ttnb-blue">
              <Anchor className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-ttnb-blue leading-tight tracking-wide">
                TERMINAL NÁUTICO
              </p>
              <p className="text-[10px] font-normal text-ttnb-subtle leading-tight">
                DA BAHIA - TTNB
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onOpenMenu}
          className="p-1 text-black hover:text-ttnb-orange transition-colors cursor-pointer"
          aria-label="Abrir Menu de Navegação"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};
