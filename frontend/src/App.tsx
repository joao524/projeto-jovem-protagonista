import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { ToastProvider } from './components/Toast';
import { PageSkeleton } from './components/PageSkeleton';

// Pages — carregadas sob demanda (code splitting por rota).
// A Home fica no bundle principal por ser a rota de entrada mais comum.
import { HomePage } from './pages/HomePage';

const lazyNamed = <T extends Record<string, React.ComponentType<any>>>(
  loader: () => Promise<T>,
  name: keyof T
) => lazy(() => loader().then((m) => ({ default: m[name] })));

const SchedulesPage = lazyNamed(() => import('./pages/SchedulesPage'), 'SchedulesPage');
const BookingPage = lazyNamed(() => import('./pages/BookingPage'), 'BookingPage');
const AuthPage = lazyNamed(() => import('./pages/AuthPage'), 'AuthPage');
const CheckoutPage = lazyNamed(() => import('./pages/CheckoutPage'), 'CheckoutPage');
const PixPaymentPage = lazyNamed(() => import('./pages/PixPaymentPage'), 'PixPaymentPage');
const CardPaymentPage = lazyNamed(() => import('./pages/CardPaymentPage'), 'CardPaymentPage');
const TicketSuccessPage = lazyNamed(() => import('./pages/TicketSuccessPage'), 'TicketSuccessPage');
const FilometroPage = lazyNamed(() => import('./pages/FilometroPage'), 'FilometroPage');
const WeatherPage = lazyNamed(() => import('./pages/WeatherPage'), 'WeatherPage');
const NewsPage = lazyNamed(() => import('./pages/NewsPage'), 'NewsPage');
const OperationalStatusPage = lazyNamed(() => import('./pages/OperationalStatusPage'), 'OperationalStatusPage');
const PassengerAreaPage = lazyNamed(() => import('./pages/PassengerAreaPage'), 'PassengerAreaPage');
const OperatorBoardingPage = lazyNamed(() => import('./pages/OperatorBoardingPage'), 'OperatorBoardingPage');
const OperatorPosPage = lazyNamed(() => import('./pages/OperatorPosPage'), 'OperatorPosPage');
const AdminRefundsPage = lazyNamed(() => import('./pages/AdminRefundsPage'), 'AdminRefundsPage');

/** Em SPAs o navegador mantém a rolagem da página anterior; voltamos ao topo a cada rota. */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

const AppContent: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handlers estáveis: evitam re-registrar listeners do Drawer a cada render
  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const isHome = location.pathname === '/';
  const getBackTitle = () => {
    if (location.pathname.startsWith('/horarios')) return 'Voltar ao início';
    if (location.pathname.startsWith('/reserva')) return 'Horários';
    if (location.pathname.startsWith('/identificacao')) return 'Reserva';
    if (location.pathname.startsWith('/checkout')) return 'Reserva';
    if (location.pathname.startsWith('/pagamento')) return 'Pagamento';
    if (location.pathname.startsWith('/bilhete')) return 'Início';
    return 'Voltar';
  };

  const handleNavbarBack = useCallback(() => {
    const path = location.pathname;
    if (
      path.startsWith('/horarios') ||
      path.startsWith('/bilhete') ||
      path.startsWith('/filometro') ||
      path.startsWith('/previsao-tempo') ||
      path.startsWith('/noticias') ||
      path.startsWith('/status') ||
      path.startsWith('/minha-conta') ||
      path.startsWith('/passageiro') ||
      path.startsWith('/login') ||
      path.startsWith('/cadastro')
    ) {
      navigate('/');
      return;
    }
    if (path.startsWith('/reserva')) {
      navigate('/horarios');
      return;
    }
    if (path.startsWith('/identificacao') || path.startsWith('/checkout')) {
      navigate(-1);
      return;
    }
    if (path.startsWith('/pagamento')) {
      navigate(-1);
      return;
    }
    navigate('/');
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-[#fffefa] text-slate-900 font-sans antialiased selection:bg-ttnb-orange selection:text-white">
      <ScrollToTop />

      {/* Link de pulo para usuários de teclado / leitores de tela */}
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-ttnb-blue focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
      >
        Pular para o conteúdo
      </a>

      {/* Navbar Global com Identidade TTNB */}
      <Navbar
        onOpenMenu={openMenu}
        showBack={!isHome}
        backTitle={getBackTitle()}
        onBack={handleNavbarBack}
      />

      {/* Drawer de Navegação 01 a 08 */}
      <NavigationDrawer isOpen={isMenuOpen} onClose={closeMenu} />

      {/* Roteamento Principal */}
      <main id="conteudo" className="pb-8">
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<HomePage onOpenMenu={openMenu} />} />
            <Route path="/horarios" element={<SchedulesPage />} />
            <Route path="/reserva" element={<BookingPage />} />
            <Route path="/identificacao/:bookingId" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/cadastro" element={<AuthPage />} />
            <Route path="/checkout/:bookingId" element={<CheckoutPage />} />
            <Route path="/pagamento/pix/:bookingId" element={<PixPaymentPage />} />
            <Route path="/pagamento/cartao/:bookingId" element={<CardPaymentPage />} />
            <Route path="/bilhete/:ticketId" element={<TicketSuccessPage />} />
            <Route path="/filometro" element={<FilometroPage />} />
            <Route path="/previsao-tempo" element={<WeatherPage />} />
            <Route path="/noticias" element={<NewsPage />} />
            <Route path="/atualizacao-operacional" element={<OperationalStatusPage />} />
            <Route path="/status" element={<OperationalStatusPage />} />
            <Route path="/aviso" element={<OperationalStatusPage />} />
            <Route path="/avisos" element={<OperationalStatusPage />} />
            <Route path="/minha-conta" element={<PassengerAreaPage />} />
            <Route path="/passageiro" element={<PassengerAreaPage />} />

            {/* Módulos Operacionais */}
            <Route path="/operador/embarque" element={<OperatorBoardingPage />} />
            <Route path="/operador/caixa" element={<OperatorPosPage />} />
            <Route path="/operador/pos" element={<OperatorPosPage />} />
            <Route path="/admin/reembolsos" element={<AdminRefundsPage />} />

            {/* Rota Fallback para prevenir qualquer tela em branco */}
            <Route path="*" element={<HomePage onOpenMenu={openMenu} />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
