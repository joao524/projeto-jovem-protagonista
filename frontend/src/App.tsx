import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { NavigationDrawer } from './components/NavigationDrawer';

// Pages
import { HomePage } from './pages/HomePage';
import { SchedulesPage } from './pages/SchedulesPage';
import { BookingPage } from './pages/BookingPage';
import { AuthPage } from './pages/AuthPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PixPaymentPage } from './pages/PixPaymentPage';
import { CardPaymentPage } from './pages/CardPaymentPage';
import { TicketSuccessPage } from './pages/TicketSuccessPage';
import { FilometroPage } from './pages/FilometroPage';
import { WeatherPage } from './pages/WeatherPage';
import { NewsPage } from './pages/NewsPage';
import { OperationalStatusPage } from './pages/OperationalStatusPage';
import { PassengerAreaPage } from './pages/PassengerAreaPage';
import { OperatorBoardingPage } from './pages/OperatorBoardingPage';
import { OperatorPosPage } from './pages/OperatorPosPage';
import { AdminRefundsPage } from './pages/AdminRefundsPage';

const AppContent: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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

  return (
    <div className="min-h-screen bg-[#fffefa] text-slate-900 font-sans antialiased selection:bg-ttnb-orange selection:text-white">
      {/* Navbar Global com Identidade TTNB */}
      <Navbar
        onOpenMenu={() => setIsMenuOpen(true)}
        showBack={!isHome}
        backTitle={getBackTitle()}
      />

      {/* Drawer de Navegação 01 a 08 */}
      <NavigationDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Roteamento Principal */}
      <main className="pb-8">
        <Routes>
          <Route path="/" element={<HomePage onOpenMenu={() => setIsMenuOpen(true)} />} />
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
          <Route path="*" element={<HomePage onOpenMenu={() => setIsMenuOpen(true)} />} />
        </Routes>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
