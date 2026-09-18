import React from 'react';
import { useApp } from '../context/AppContext';

export const OrderSuccessScreen: React.FC = () => {
  const { lastOrder, setActiveTab, dispatchWhatsAppNumber } = useApp();

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 py-8 pb-32 items-center text-center">
      {/* Animated Success Icon */}
      <div className="relative w-20 h-20 rounded-full bg-[#006e2f]/15 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-4xl text-[#006e2f] animate-bounce">
          check_circle
        </span>
        <span className="absolute inset-0 rounded-full border-2 border-[#006e2f] animate-ping opacity-25"></span>
      </div>

      <span className="px-3 py-1 rounded-full bg-[#ffdbcc] text-[#351000] text-[11px] font-bold tracking-wide uppercase mb-2">
        Order Dispatched
      </span>

      <h2 className="font-headline-lg-mobile text-[24px] font-extrabold text-[#1e1b17] leading-tight">
        Order Received by Kitchen!
      </h2>
      <p className="text-[13px] text-[#5a4136] mt-1 max-w-sm">
        Our chefs at Masjid Bunder are preparing your fresh street zaika dishes.
      </p>

      {/* Order Summary Card */}
      {lastOrder ? (
        <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#e2bfb0]/30 mt-6 text-left flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#e2bfb0]/25">
            <div>
              <span className="text-[10px] text-[#5a4136] uppercase font-bold">Order ID</span>
              <p className="font-headline-sm text-[16px] font-bold text-[#a04100]">
                {lastOrder.orderId}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#5a4136] uppercase font-bold">Status</span>
              <p className="text-[12px] font-bold text-[#006e2f] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#006e2f] animate-pulse"></span> Cooking
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[12px] text-[#5a4136]">
            <span>Mode: <strong className="text-[#1e1b17] capitalize">{lastOrder.orderType}</strong></span>
            <span>Est. Time: <strong className="text-[#1e1b17]">15-20 Mins</strong></span>
          </div>

          <div className="flex flex-col gap-1.5 py-1">
            <span className="text-[11px] font-bold text-[#1e1b17]">Dishes in Ticket:</span>
            {lastOrder.items.map((ci: any, idx: number) => (
              <div
                key={ci.item?.id || idx}
                className="flex items-center justify-between text-[12px] text-[#5a4136]"
              >
                <span>
                  {ci.quantity}x {ci.item?.name || 'Dish'}
                </span>
                <span className="font-bold text-[#1e1b17]">
                  ₹{(ci.item?.price || 0) * (ci.quantity || 1)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#e2bfb0]/25 flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#1e1b17]">Total Amount:</span>
            <span className="font-headline-md text-[18px] font-extrabold text-[#a04100]">
              ₹{lastOrder.grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#e2bfb0]/30 mt-6 text-center">
          <p className="text-[12px] text-[#5a4136]">KOT #108 confirmed and synced to Google Sheets.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full flex flex-col gap-2.5 mt-6">
        <a
          className="w-full h-12 rounded-full bg-[#006e2f] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform hover:opacity-95"
          href={`https://wa.me/${dispatchWhatsAppNumber.replace(/[^0-9]/g, '')}?text=Hi%20Mumbai%20Zaika,%20checking%20status%20for%20order%20${lastOrder?.orderId || '#108'}`}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="material-symbols-outlined text-[20px]">chat</span>
          <span>Message Outlet on WhatsApp</span>
        </a>

        <button
          className="w-full h-12 rounded-full bg-[#f4ede5] text-[#1e1b17] text-[13px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform hover:bg-[#eee7df]"
          onClick={() => setActiveTab('home')}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};
