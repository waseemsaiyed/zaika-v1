import React from 'react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { activeTab, cartCount, setIsCartOpen, setIsSheetViewerOpen } = useApp();

  const getSubTitle = () => {
    switch (activeTab) {
      case 'home':
        return '• Home Storefront';
      case 'menu':
        return '• Menu Ordering';
      case 'pos':
        return '• Pos Cashier Billing';
      case 'tables':
        return '• Tables Layout Reservation';
      case 'admin':
        return '• Admin Khata Dashboard';
      case 'order-success':
        return '• Kitchen Live Tracker';
      default:
        return '• Menu Ordering';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#fff8f1]/85 backdrop-blur-xl shadow-[0_4px_20px_-2px_rgba(43,26,18,0.05)] pt-safe">
      <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-4xl mx-auto w-full">
        {/* Brand & Status */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <img
            alt="Mumbai Zaika Modern Brand Logo"
            className="h-8 w-auto object-contain flex-shrink-0"
            src="https://lh3.googleusercontent.com/aida/AEtjO1VtNPluz_PQ2EKVDaJ0Ley4amuNWzjD2tER20aTTk0C87eCmUyoHSIjpR7_B4kfhaQHEbhD3wi7GoWRNOn4ADN8gsyn2QfXR5uZqbmKTUUWd-wS9VXC5K7_Z3HcHFdo8bPRCLTOkgkUH2i6jaWiEhnIktmK7anODVfUnsMzdCrAcL5YEL2KvNVa7LlCmv7gVuT8NPtJybyW5d9EBeLX20RNktKV_eZ0ig0JwyWJtfSqeTS250W7nMyYNg"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-headline-sm text-[17px] font-bold text-[#1e1b17] truncate tracking-tight">
                Mumbai Zaika
              </span>
              <span className="text-[11px] text-[#5a4136] font-normal hidden sm:inline">
                {getSubTitle()}
              </span>
            </div>
            <span className="text-[10px] text-[#006e2f] flex items-center gap-1 truncate font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006e2f] flex-shrink-0 animate-pulse"></span>
              Masjid Bunder, Mumbai • Open till 1AM
            </span>
          </div>
        </div>

        {/* Right Actions: Sheet DB, Cart & Profile */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsSheetViewerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#00b050]/15 text-[#006e2f] hover:bg-[#00b050]/25 text-[11px] font-bold active:scale-95 transition-all border border-[#00b050]/30 shadow-xs"
            title="Inspect Live Google Sheet Database"
          >
            <span className="material-symbols-outlined text-[16px]">table_view</span>
            <span>Sheet DB</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#006e2f] animate-ping"></span>
          </button>

          <button
            aria-label={`Cart with ${cartCount} items`}
            className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#1e1b17] hover:bg-[#f4ede5] transition-colors active:scale-95"
            onClick={() => setIsCartOpen(true)}
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 bg-[#ff6b00] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(255,107,0,0.4)]">
                {cartCount}
              </span>
            )}
          </button>
          <div className="w-9 h-9 flex items-center justify-center">
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover shadow-[0_2px_8px_rgba(43,26,18,0.12)] border border-[#e2bfb0]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhom6hc2JYhSDd4F18-kRysJoGeBpfkNdKxsAZx99jDLIy1-DEqM9wCeSVNeOToWF-_WfSEt_GfG6_IUgAxFdbdqNCx2gVsb9UeOQ97NY2KAo0HslNkhciETuyk6WWbNFKPIhIwVkbSx3AqgGr3rmybcBYDGC8CI3Osi71UAl_5RWm8gJjBYpcVsvP_Qe0W67JLT3Oli7tx6G7Lld2KsmeSLlpQnVarjH71cPZazitwV_n-W7R3II"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
