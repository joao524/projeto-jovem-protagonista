import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowUpRight, Phone, ShieldCheck, QrCode, ShoppingBag } from 'lucide-react';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const menuItems = [
    { number: '01', label: 'Início', path: '/' },
    { number: '02', label: 'Criar uma conta', path: '/cadastro' },
    { number: '03', label: 'Passagens', path: '/horarios' },
    { number: '04', label: 'Filômetro', path: '/filometro' },
    { number: '05', label: 'Previsão do tempo', path: '/previsao-tempo' },
    { number: '06', label: 'Notícias e avisos', path: '/noticias' },
    { number: '07', label: 'Área do passageiro', path: '/minha-conta' },
    { number: '08', label: 'Atualização operacional', path: '/atualizacao-operacional' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Content */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-[#fffefa] shadow-2xl flex flex-col justify-between p-5 overflow-y-auto">
        <div>
          {/* Header do Drawer */}
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
            <span className="text-[11px] font-bold tracking-widest text-[#615f5e] uppercase">
              NAVEGAÇÃO
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-black hover:text-ttnb-orange transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Itens 01 a 08 */}
          <nav className="mt-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.number}
                onClick={() => handleNavigate(item.path)}
                className="w-full flex items-center justify-between py-3 px-2 border-b border-[#f0ece9] hover:bg-ttnb-mint/50 transition-colors rounded-sm text-left group cursor-pointer"
              >
                <div className="flex items-baseline space-x-3">
                  <span className="text-[12px] font-semibold text-[#887878]">
                    {item.number}
                  </span>
                  <span className="text-[14px] font-bold text-ttnb-blue group-hover:text-ttnb-orange transition-colors">
                    {item.label}
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-ttnb-blue group-hover:text-ttnb-orange transition-colors" />
              </button>
            ))}
          </nav>

          {/* Atalhos Operacionais do Ferry-Boat */}
          <div className="mt-6 pt-4 border-t border-[#e5e5e5]">
            <p className="text-[10px] font-bold text-[#887878] uppercase tracking-wider mb-2">
              Painel do Operador & Gestão
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <button
                onClick={() => handleNavigate('/operador/embarque')}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-md hover:border-ttnb-blue transition-colors flex flex-col items-center gap-1 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">Embarque</span>
              </button>
              <button
                onClick={() => handleNavigate('/operador/caixa')}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-md hover:border-ttnb-blue transition-colors flex flex-col items-center gap-1 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-800">Guichê</span>
              </button>
              <button
                onClick={() => handleNavigate('/admin/reembolsos')}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-md hover:border-ttnb-blue transition-colors flex flex-col items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-slate-800">Reembolsos</span>
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé do Menu com Ajuda e Botão de Compra */}
        <div className="pt-6 mt-4 border-t border-[#e5e5e5]">
          <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded-md p-3 mb-4 text-left">
            <p className="text-[10px] font-bold tracking-wider text-[#615f5e] uppercase">
              PRECISA DE AJUDA?
            </p>
            <p className="text-[14px] font-bold text-ttnb-blue mt-0.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-ttnb-teal" />
              (71) 3241 - 9783
            </p>
            <p className="text-[11px] text-[#887878] mt-0.5">
              Comércio - Salvador, BA
            </p>
          </div>

          <button
            onClick={() => handleNavigate('/horarios')}
            className="w-full bg-ttnb-orange hover:bg-[#d96728] text-white font-bold py-3 px-4 rounded-ttnb-btn flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span>Comprar passagem</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
