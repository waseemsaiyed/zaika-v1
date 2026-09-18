import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem } from '../types';

export const AdminLoginModal: React.FC = () => {
  const { isAdminModalOpen, setIsAdminModalOpen, addMenuItem } = useApp();
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Form states
  const [dishName, setDishName] = useState('');
  const [category, setCategory] = useState<MenuItem['category']>('sandwiches');
  const [price, setPrice] = useState('140');
  const [description, setDescription] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  if (!isAdminModalOpen) return null;

  const handleUnlock = () => {
    if (pin === '1234') {
      setPinError(false);
      setIsUnlocked(true);
    } else {
      setPinError(true);
    }
  };

  const handleLock = () => {
    setPin('');
    setIsUnlocked(false);
    setPinError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    const newItem: MenuItem = {
      id: `custom-${Date.now()}`,
      name: dishName.trim(),
      category,
      price: parseFloat(price) || 120,
      description: description.trim() || 'Freshly prepared specialty with signature Zaika seasoning.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfTni2G3bGsUO_xhB_yLktTQvcUUuIkaHGrNzpi7eDIEm6CZt8PcIdytgaftHbB9RXMGNk86IMRvmAkAWyZk3st3ENlPRZh8wv2l5Gi4wDO3J-rgh5HPcWq7CjBdPw4rqmkuSXTfyj0r8LfrwAy4MS6zey5bf8XhhUX4eTwiLGjjT3ioPJiQr51drRLMHMYVSP0ddCQfE524JyhrCpej6j2Wz2Nt_38Ilbdpm7ji4nqIJ9bNhUNjQ',
      rating: 5.0,
      reviewsCount: 1,
      isVeg,
      tag: 'Sheet Added',
      sheetStockLocation: 'Sheets: Live Synced',
    };

    addMenuItem(newItem);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      setIsAdminModalOpen(false);
      setDishName('');
      setDescription('');
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#33302b]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-300"
      onClick={e => {
        if (e.target === e.currentTarget) setIsAdminModalOpen(false);
      }}
    >
      <div className="bg-[#fff8f1] w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col transition-transform duration-300">
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#fff8f1]/95 backdrop-blur-md px-4 pt-5 pb-3 flex items-center justify-between border-b border-[#e2bfb0]/40 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#f9d9cc] text-[#755d53] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">table_chart_view</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-[16px] font-bold text-[#1e1b17]">
                Google Sheets Menu Admin
              </h3>
              <p className="text-[11px] text-[#5a4136]">
                Target Sheet: <span className="font-semibold text-[#a04100]">menu_items_prod</span>
              </p>
            </div>
          </div>
          <button
            aria-label="Close modal"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f4ede5] text-[#1e1b17] hover:bg-[#eee7df] transition-colors"
            onClick={() => setIsAdminModalOpen(false)}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* PIN Authentication View */}
        {!isUnlocked ? (
          <div className="p-5 flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-[#f4ede5] flex flex-col gap-2">
              <span className="text-[13px] font-bold text-[#1e1b17]">Restricted Manager Access</span>
              <p className="text-[12px] text-[#5a4136] leading-relaxed">
                Enter manager PIN to simulate live append / edit rows in linked Google Sheet via API v4.
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#ffdbcc] text-[#351000]">
                  Default Demo PIN: 1234
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#1e1b17]" htmlFor="admin-pin-input">
                Manager PIN
              </label>
              <input
                id="admin-pin-input"
                className="h-12 px-4 rounded-xl bg-[#f9f3eb] text-center text-2xl font-bold tracking-widest text-[#1e1b17] border border-[#e2bfb0]/60 focus:outline-none focus:bg-white"
                maxLength={4}
                placeholder="••••"
                type="password"
                value={pin}
                onChange={e => {
                  setPin(e.target.value);
                  setPinError(false);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleUnlock();
                }}
              />
              {pinError && (
                <p className="text-[11px] font-semibold text-[#ba1a1a]">
                  Incorrect PIN. Use demo code '1234'.
                </p>
              )}
            </div>

            <button
              className="h-12 rounded-full bg-[#ff6b00] text-white text-[14px] font-bold shadow-md active:scale-95 transition-all hover:bg-[#e05e00]"
              onClick={handleUnlock}
              type="button"
            >
              Unlock Google Sheet Editor
            </button>
          </div>
        ) : (
          /* Editor Form */
          <form className="p-5 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between pb-1 border-b border-[#e2bfb0]/30">
              <div className="flex items-center gap-1 text-[#006e2f] text-[12px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#006e2f] animate-pulse"></span>
                Connected to Sheet API
              </div>
              <button
                className="text-[12px] text-[#5a4136] hover:text-[#ba1a1a] font-medium"
                onClick={handleLock}
                type="button"
              >
                Lock Console
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#1e1b17]" htmlFor="new-item-name">
                Dish / Beverage Name
              </label>
              <input
                id="new-item-name"
                className="h-11 px-3 rounded-lg bg-[#f4ede5] text-[#1e1b17] text-[14px] border border-[#e2bfb0]/40 focus:outline-none focus:bg-white"
                placeholder="e.g. Masala Bun Maska"
                required
                type="text"
                value={dishName}
                onChange={e => setDishName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#1e1b17]" htmlFor="new-item-category">
                  Category Tab
                </label>
                <select
                  id="new-item-category"
                  className="h-11 px-3 rounded-lg bg-[#f4ede5] text-[#1e1b17] text-[14px] border border-[#e2bfb0]/40 focus:outline-none focus:bg-white"
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                >
                  <option value="sandwiches">Sandwiches</option>
                  <option value="burgers">Burgers</option>
                  <option value="pizza">Pizza</option>
                  <option value="coffee">Coffee & Chai</option>
                  <option value="wraps">Wraps</option>
                  <option value="fries">Fries</option>
                  <option value="desserts">Desserts</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#1e1b17]" htmlFor="new-item-price">
                  Price (₹ INR)
                </label>
                <input
                  id="new-item-price"
                  className="h-11 px-3 rounded-lg bg-[#f4ede5] text-[#1e1b17] text-[14px] border border-[#e2bfb0]/40 focus:outline-none focus:bg-white"
                  placeholder="90"
                  required
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#1e1b17]" htmlFor="new-item-desc">
                Aromatic Menu Description
              </label>
              <textarea
                id="new-item-desc"
                className="p-3 rounded-lg bg-[#f4ede5] text-[#1e1b17] text-[13px] border border-[#e2bfb0]/40 focus:outline-none focus:bg-white resize-none"
                placeholder="Toasted pav, dollops of Amul butter, Zaika chai masala sprinkle..."
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f4ede5]">
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#1e1b17]">Vegetarian Indicator</span>
                <span className="text-[11px] text-[#5a4136]">Places green dot indicator badge</span>
              </div>
              <input
                type="checkbox"
                checked={isVeg}
                onChange={e => setIsVeg(e.target.checked)}
                className="w-5 h-5 accent-[#006e2f] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f4ede5]">
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#1e1b17]">Instantly Available</span>
                <span className="text-[11px] text-[#5a4136]">Reflects in POS & Storefront</span>
              </div>
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={e => setIsAvailable(e.target.checked)}
                className="w-5 h-5 accent-[#ff6b00] rounded cursor-pointer"
              />
            </div>

            {/* Simulated Cloud Upload */}
            <div className="p-3 rounded-xl bg-[#f9f3eb] flex flex-col gap-1.5 border border-[#e2bfb0]/30">
              <span className="text-[11px] font-semibold text-[#1e1b17] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#a04100]">add_photo_alternate</span>
                Image Asset Attachment
              </span>
              <div className="h-16 rounded-lg bg-white flex flex-col items-center justify-center text-center p-2 border border-dashed border-[#e2bfb0]">
                <span className="material-symbols-outlined text-[#5a4136] text-[20px]">cloud_upload</span>
                <span className="text-[10px] text-[#5a4136]">
                  Auto-uploads to Cloud Storage & appends Cell URL
                </span>
              </div>
            </div>

            <button
              className="w-full h-12 rounded-full bg-[#ff6b00] text-white text-[14px] font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#e05e00] mt-1"
              type="submit"
            >
              <span className="material-symbols-outlined text-[18px]">publish</span>
              <span>Write Row to Google Sheet</span>
            </button>
          </form>
        )}

        {/* Toast inside modal */}
        {showToast && (
          <div className="p-3 mx-4 mb-4 rounded-xl bg-[#006e2f] text-white text-[12px] font-bold text-center shadow-lg animate-bounce">
            Row added to Google Sheet successfully!
          </div>
        )}
      </div>
    </div>
  );
};
