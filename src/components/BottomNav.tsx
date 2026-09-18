import React from 'react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, dispatchWhatsAppNumber } = useApp();

  const navItems: { id: TabType; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'storefront' },
    { id: 'menu', label: 'Menu', icon: 'restaurant_menu' },
    { id: 'pos', label: 'POS', icon: 'point_of_sale' },
    { id: 'tables', label: 'Tables', icon: 'table_restaurant' },
    { id: 'admin', label: 'Admin', icon: 'admin_panel_settings' },
  ];

  return (
    <>
      {/* Floating Order on WhatsApp pill */}
      <aside className="fixed bottom-20 sm:bottom-22 right-4 z-40">
        <a
          className="flex items-center gap-2 px-4 py-2.5 bg-[#006e2f] text-white rounded-full shadow-[0_8px_24px_-4px_rgba(0,110,47,0.4)] active:scale-95 transition-transform hover:opacity-95"
          href={`https://wa.me/${dispatchWhatsAppNumber.replace(/[^0-9]/g, '')}?text=Hello%20Mumbai%20Zaika,%20I%20want%20to%20place%20an%20order`}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="material-symbols-outlined text-[20px]">chat</span>
          <span className="text-[13px] font-semibold tracking-wide">Order on WhatsApp</span>
        </a>
      </aside>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-[#fff8f1]/90 backdrop-blur-2xl shadow-[0_-8px_32px_-4px_rgba(43,26,18,0.08)] border-t border-[#e2bfb0]/30">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
                  isActive
                    ? 'text-[#ff6b00] font-bold scale-105'
                    : 'text-[#5a4136] hover:text-[#1e1b17] font-medium'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="text-[11px] leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
