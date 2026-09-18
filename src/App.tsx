import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeStorefront } from './components/HomeStorefront';
import { MenuOrdering } from './components/MenuOrdering';
import { PosCashier } from './components/PosCashier';
import { TablesLayout } from './components/TablesLayout';
import { AdminKhata } from './components/AdminKhata';
import { OrderSuccessScreen } from './components/OrderSuccessScreen';
import { CartDrawer } from './components/CartDrawer';
import { AdminLoginModal } from './components/AdminLoginModal';

const MainScreen: React.FC = () => {
  const { activeTab, toastMessage } = useApp();

  return (
    <div className="min-h-screen bg-[#fff8f1] text-[#1e1b17] flex flex-col font-body selection:bg-[#ff6b00]/20 selection:text-[#a04100] relative">
      {/* Top Header */}
      <Header />

      {/* Main Screen Views */}
      <main className="flex-1 w-full overflow-x-hidden">
        {activeTab === 'home' && <HomeStorefront />}
        {activeTab === 'menu' && <MenuOrdering />}
        {activeTab === 'pos' && <PosCashier />}
        {activeTab === 'tables' && <TablesLayout />}
        {activeTab === 'admin' && <AdminKhata />}
        {activeTab === 'success' && <OrderSuccessScreen />}
      </main>

      {/* Bottom Floating Navigation */}
      <BottomNav />

      {/* Slide-in Cart Drawer */}
      <CartDrawer />

      {/* Google Sheets Admin PIN & Dish Creator Modal */}
      <AdminLoginModal />

      {/* Global Action Toast */}
      {toastMessage && (
        <div className="fixed top-16 inset-x-0 z-50 flex justify-center pointer-events-none px-4 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#1e1b17]/95 text-[#fff8f1] px-4 py-2.5 rounded-full text-[12px] font-bold shadow-2xl flex items-center gap-2 backdrop-blur-md border border-[#e2bfb0]/30 max-w-md">
            <span className="material-symbols-outlined text-[17px] text-[#4ae176]">
              check_circle
            </span>
            <span className="truncate">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainScreen />
    </AppProvider>
  );
}
