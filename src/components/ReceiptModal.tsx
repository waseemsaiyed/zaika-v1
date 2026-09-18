import React from 'react';
import { useApp } from '../context/AppContext';

export const ReceiptModal: React.FC = () => {
  const { printReceiptData, setPrintReceiptData, showToast } = useApp();

  if (!printReceiptData) return null;

  const handlePrint = () => {
    showToast(`Sending to thermal slip printer...`);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#33302b]/70 backdrop-blur-sm flex items-center justify-center p-3 transition-opacity"
      onClick={e => {
        if (e.target === e.currentTarget) setPrintReceiptData(null);
      }}
    >
      <div className="bg-white text-[#1e1b17] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#e2bfb0]/40">
        {/* Receipt Header */}
        <div className="bg-[#1e1b17] text-white p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#ff6b00]">
              {printReceiptData.type === 'KOT' ? 'soup_kitchen' : 'receipt_long'}
            </span>
            <span className="font-bold text-[14px]">
              {printReceiptData.type === 'KOT' ? 'Kitchen Order Ticket (KOT)' : 'Customer Tax Bill'}
            </span>
          </div>
          <button
            aria-label="Close"
            type="button"
            onClick={() => setPrintReceiptData(null)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Printable Thermal Slip Area */}
        <div className="p-5 font-mono text-[12px] flex flex-col gap-2.5 bg-[#fdfcf9]">
          <div className="flex flex-col items-center text-center border-b border-dashed border-[#a08a7e] pb-3">
            <img
              src="/logo.svg"
              alt="Mumbai Zaika"
              className="h-10 w-auto object-contain mb-1.5"
            />
            <p className="text-[10px] text-[#5a4136]">Zakaria Masjid Rd, Masjid Bunder, Mumbai-09</p>
            <p className="text-[10px] text-[#5a4136]">GSTIN: 27AABCM8492Q1Z3 • Ph: +91 97738 48442</p>
          </div>

          <div className="flex justify-between text-[11px] border-b border-dashed border-[#a08a7e] pb-2">
            <div>
              <p>
                <strong>Ref:</strong> {printReceiptData.orderId}
              </p>
              <p>
                <strong>Table:</strong> {printReceiptData.tableNumber}
              </p>
            </div>
            <div className="text-right">
              <p>
                <strong>Mode:</strong> {printReceiptData.orderMode.toUpperCase()}
              </p>
              <p>{printReceiptData.time}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-[11px] my-1">
            <thead>
              <tr className="border-b border-[#a08a7e]">
                <th className="pb-1">Item</th>
                <th className="pb-1 text-center">Qty</th>
                <th className="pb-1 text-right">Amt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dotted divide-[#a08a7e]/40">
              {printReceiptData.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1 pr-1 font-semibold">{item.name}</td>
                  <td className="py-1 text-center">{item.quantity}</td>
                  <td className="py-1 text-right">₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculations */}
          <div className="border-t border-dashed border-[#a08a7e] pt-2 flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{printReceiptData.subtotal.toFixed(2)}</span>
            </div>
            {printReceiptData.discount > 0 && (
              <div className="flex justify-between text-[#006e2f]">
                <span>Discount Promo</span>
                <span>-₹{printReceiptData.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span>₹{printReceiptData.gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-[14px] pt-1 border-t border-[#1e1b17]">
              <span>GRAND TOTAL</span>
              <span>₹{printReceiptData.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center pt-2 border-t border-dashed border-[#a08a7e] text-[10px] text-[#5a4136]">
            <p>*** Google Sheets Order Logged ***</p>
            <p>Thank you for visiting Mumbai Zaika!</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-[#f4ede5] flex gap-2 border-t border-[#e2bfb0]/30">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 h-10 rounded-full bg-[#ff6b00] text-white font-bold text-[12px] flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform hover:bg-[#e05e00]"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Receipt</span>
          </button>
          <button
            type="button"
            onClick={() => setPrintReceiptData(null)}
            className="px-4 h-10 rounded-full bg-white text-[#1e1b17] font-bold text-[12px] border border-[#e2bfb0]/40 active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
