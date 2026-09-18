import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem } from '../types';

export const MenuOrdering: React.FC = () => {
  const {
    menuItems,
    cart,
    addToCart,
    updateQuantity,
    cartCount,
    cartSubtotal,
    setIsCartOpen,
    setIsAdminModalOpen,
    setIsSheetViewerOpen,
    dispatchWhatsAppNumber,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [currentDiet, setCurrentDiet] = useState<'all' | 'veg' | 'nonveg'>('all');

  const categories = [
    { id: 'all', label: 'All', count: menuItems.length },
    { id: 'sandwiches', label: '🥪 Sandwiches', count: menuItems.filter(i => i.category === 'sandwiches').length },
    { id: 'burgers', label: '🍔 Burgers', count: menuItems.filter(i => i.category === 'burgers').length },
    { id: 'pizza', label: '🍕 Pizza', count: menuItems.filter(i => i.category === 'pizza').length || 2 },
    { id: 'coffee', label: '☕ Coffee & Chai', count: menuItems.filter(i => i.category === 'coffee').length },
    { id: 'wraps', label: '🌯 Wraps', count: menuItems.filter(i => i.category === 'wraps').length },
    { id: 'fries', label: '🍟 Fries', count: menuItems.filter(i => i.category === 'fries').length },
    { id: 'desserts', label: '🍨 Desserts', count: menuItems.filter(i => i.category === 'desserts').length || 2 },
  ];

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
      const matchesDiet =
        currentDiet === 'all' ||
        (currentDiet === 'veg' && item.isVeg) ||
        (currentDiet === 'nonveg' && !item.isVeg);

      return matchesSearch && matchesCategory && matchesDiet;
    });
  }, [menuItems, searchQuery, currentCategory, currentDiet]);

  const getItemQuantity = (itemId: string) => {
    const item = cart.find(ci => ci.item.id === itemId);
    return item ? item.quantity : 0;
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCurrentCategory('all');
    setCurrentDiet('all');
  };

  const hasActiveFilters = searchQuery !== '' || currentCategory !== 'all' || currentDiet !== 'all';

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-32">
      {/* Live Synced Google Sheet Banner */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#f4ede5] shadow-xs border border-[#e2bfb0]/30">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00b050] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#006e2f]"></span>
            </span>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#006e2f]">sync</span>
                <span className="text-[11px] font-semibold text-[#1e1b17] truncate">
                  Live Synced: Google Sheet{' '}
                  <code className="text-[#a04100] font-bold">menu_items</code>
                </span>
              </div>
              <span className="text-[10px] text-[#5a4136] truncate">
                v4 REST API • Auto-fetches availability
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#006e2f]/10 text-[#006e2f] shadow-xs active:scale-95 transition-all text-[11px] font-bold border border-[#006e2f]/20 hover:bg-[#006e2f]/20"
              onClick={() => setIsSheetViewerOpen(true)}
              type="button"
              title="Inspect Live Sheet Table"
            >
              <span className="material-symbols-outlined text-[15px]">table_view</span>
              <span>Inspect DB</span>
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#1e1b17] shadow-xs active:scale-95 transition-all text-[11px] font-bold border border-[#e2bfb0]/40 hover:bg-[#fff8f1]"
              onClick={() => setIsAdminModalOpen(true)}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px] text-[#ff6b00]">key</span>
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Dietary Segment Bar */}
      <div className="px-4 py-1.5 flex flex-col gap-2">
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-4 text-[#5a4136] text-[22px] pointer-events-none">
            search
          </span>
          <input
            className="w-full h-[50px] pl-12 pr-11 rounded-full bg-white text-[#1e1b17] placeholder:text-[#5a4136] text-[14px] shadow-xs border border-[#e2bfb0]/40 focus:outline-none focus:bg-[#f9f3eb] transition-all"
            placeholder="Search burger, sandwich, cold coffee..."
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              aria-label="Clear Search"
              className="absolute right-3.5 w-7 h-7 flex items-center justify-center rounded-full text-[#5a4136] hover:bg-[#eee7df] transition-colors"
              onClick={() => setSearchQuery('')}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Dietary Filter Segments (All / Pure Veg / Non-Veg) */}
        <div className="flex items-center justify-between gap-1 p-1 bg-[#f9f3eb] rounded-full border border-[#e2bfb0]/30">
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-full text-[12px] font-bold transition-all ${
              currentDiet === 'all'
                ? 'bg-white shadow-xs text-[#1e1b17]'
                : 'text-[#5a4136] hover:text-[#1e1b17]'
            }`}
            onClick={() => setCurrentDiet('all')}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-[#a04100]">restaurant</span>
            <span>All Menu</span>
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-full text-[12px] font-bold transition-all ${
              currentDiet === 'veg'
                ? 'bg-white shadow-xs text-[#1e1b17]'
                : 'text-[#5a4136] hover:text-[#1e1b17]'
            }`}
            onClick={() => setCurrentDiet('veg')}
            type="button"
          >
            <span className="w-3.5 h-3.5 rounded-xs bg-[#f4ede5] flex items-center justify-center flex-shrink-0 border border-[#006e2f]/40">
              <span className="w-2 h-2 rounded-full bg-[#006e2f]"></span>
            </span>
            <span>Pure Veg</span>
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-full text-[12px] font-bold transition-all ${
              currentDiet === 'nonveg'
                ? 'bg-white shadow-xs text-[#1e1b17]'
                : 'text-[#5a4136] hover:text-[#1e1b17]'
            }`}
            onClick={() => setCurrentDiet('nonveg')}
            type="button"
          >
            <span className="w-3.5 h-3.5 rounded-xs bg-[#f4ede5] flex items-center justify-center flex-shrink-0 border border-[#ba1a1a]/40">
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
            </span>
            <span>Non-Veg</span>
          </button>
        </div>
      </div>

      {/* Category Pills Horizontal Scroller */}
      <div className="py-2 overflow-x-auto no-scrollbar flex items-center gap-2 px-4">
        {categories.map(cat => {
          const isActive = currentCategory === cat.id;
          return (
            <button
              key={cat.id}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-[12px] font-bold active:scale-95 transition-all shadow-xs ${
                isActive
                  ? 'bg-[#ff6b00] text-white'
                  : 'bg-[#f4ede5] text-[#1e1b17] hover:bg-[#eee7df]'
              }`}
              onClick={() => setCurrentCategory(cat.id)}
              type="button"
            >
              <span>{cat.label}</span>
              <span className="ml-1 opacity-80 text-[11px]">({cat.count})</span>
            </button>
          );
        })}
      </div>

      {/* Active Filter Notification Bar */}
      {hasActiveFilters && (
        <div className="px-4 py-1">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#f4ede5] rounded-lg text-[11px] font-semibold text-[#1e1b17]">
            <span>
              Showing: {currentCategory !== 'all' ? currentCategory.toUpperCase() : 'All'}{' '}
              {currentDiet !== 'all' ? `• ${currentDiet === 'veg' ? 'Pure Veg' : 'Non-Veg'}` : ''}{' '}
              {searchQuery ? `• "${searchQuery}"` : ''} ({filteredItems.length} items)
            </span>
            <button
              className="text-[#a04100] font-bold hover:underline"
              onClick={handleResetFilters}
              type="button"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Food Items Card List */}
      <div className="px-4 py-2 flex flex-col gap-3">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => {
            const qty = getItemQuantity(item.id);
            return (
              <article
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-[#e2bfb0]/25 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md"
              >
                <div className="flex flex-row p-3 gap-3">
                  {/* Item Image with Rating */}
                  <div className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-[#f4ede5]">
                    <img
                      alt={item.name}
                      className="w-full h-full object-cover"
                      src={item.image}
                    />
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#ff6b00] text-white text-[10px] font-bold shadow-xs flex items-center gap-0.5">
                      <span
                        className="material-symbols-outlined text-[11px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>{' '}
                      {item.rating}
                    </span>
                  </div>

                  {/* Info and Pricing */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-3.5 h-3.5 rounded-xs bg-[#f4ede5] flex items-center justify-center flex-shrink-0 border border-[#006e2f]/40"
                          title={item.isVeg ? 'Pure Veg' : 'Non-Veg'}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.isVeg ? 'bg-[#006e2f]' : 'bg-[#ba1a1a]'
                            }`}
                          ></span>
                        </span>
                        {item.isBestseller && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#f9d9cc] text-[#755d53]">
                            Bestseller
                          </span>
                        )}
                        {item.tag && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#f4ede5] text-[#5a4136]">
                            {item.tag}
                          </span>
                        )}
                      </div>

                      <h3 className="font-headline-sm text-[15px] font-bold text-[#1e1b17] truncate leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-[#5a4136] line-clamp-2 mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1">
                      <div className="flex flex-col">
                        <span className="text-[16px] text-[#ff6b00] font-extrabold leading-none">
                          ₹{item.price}
                        </span>
                        <span className="text-[9px] text-[#006e2f] font-medium mt-0.5">
                          {item.sheetStockLocation || 'Sheets: In stock'}
                        </span>
                      </div>

                      {/* Active Stepper or ADD button */}
                      {qty > 0 ? (
                        <div className="flex items-center bg-[#f9d9cc] text-[#755d53] rounded-full px-1 py-0.5 shadow-xs">
                          <button
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-[#1e1b17] active:scale-90 transition-transform"
                            onClick={() => updateQuantity(item.id, -1)}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[16px]">remove</span>
                          </button>
                          <span className="px-2.5 text-[12px] font-bold text-[#755d53]">{qty}</span>
                          <button
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-[#ff6b00] text-white active:scale-90 transition-transform"
                            onClick={() => updateQuantity(item.id, 1)}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[16px]">add</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          className="px-4 py-1.5 rounded-full bg-[#ff6b00] text-white text-[12px] font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1 hover:bg-[#e05e00]"
                          onClick={() => addToCart(item)}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                          <span>ADD</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          /* Empty State */
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#f9d9cc] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-3xl text-[#755d53]">fastfood</span>
            </div>
            <h4 className="font-headline-sm text-[16px] font-bold text-[#1e1b17]">
              No Zaika Dishes Found
            </h4>
            <p className="text-[12px] text-[#5a4136] mt-1 max-w-xs leading-relaxed">
              We couldn't find matches for your search. Try searching "Sandwich", "Chai", or "Burger".
            </p>
            <button
              className="mt-4 px-5 py-2 rounded-full bg-[#a04100] text-white text-[12px] font-bold active:scale-95 transition-transform"
              onClick={handleResetFilters}
              type="button"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Bottom Sticky Cart Island (Level 4 Floating Card) */}
      {cartCount > 0 && (
        <div className="fixed bottom-20 inset-x-0 z-40 px-4 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto bg-[#33302b] text-[#f7f0e8] rounded-2xl shadow-[0_12px_32px_rgba(43,26,18,0.25)] p-3 backdrop-blur-xl flex items-center justify-between gap-3 border border-[#e2bfb0]/20">
            <div
              className="flex items-center gap-3 min-w-0 pl-1 cursor-pointer"
              onClick={() => setIsCartOpen(true)}
            >
              <div className="relative w-10 h-10 rounded-xl bg-[#ff6b00] text-white flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(255,107,0,0.4)]">
                <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-[#ff6b00] text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-bold truncate">Total {cartCount} Items</span>
                  <span className="w-1 h-1 rounded-full bg-[#e2bfb0]"></span>
                  <span className="font-headline-sm text-[15px] text-[#ffb693] font-bold">
                    ₹{cartSubtotal}
                  </span>
                </div>
                <span className="text-[10px] text-[#e8e1da] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-[#4ae176]">verified</span>
                  Taxes & GST included
                </span>
              </div>
            </div>

            <a
              className="flex-shrink-0 px-4 py-2 rounded-full bg-[#ff6b00] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-[0_4px_16px_rgba(255,107,0,0.35)] active:scale-95 transition-transform hover:opacity-95"
              href={`https://wa.me/${dispatchWhatsAppNumber.replace(/[^0-9]/g, '')}?text=Hello%20Mumbai%20Zaika,%20I%20would%20like%20to%20place%20an%20order:%20${cart.map(c => `${c.quantity}x%20${c.item.name}`).join(',%20')}.%20Total:%20₹${cartSubtotal}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="material-symbols-outlined text-[17px]">chat</span>
              <span className="tracking-tight">Order via WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
