import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const HomeStorefront: React.FC = () => {
  const {
    setActiveTab,
    cart,
    addToCart,
    updateQuantity,
    cartCount,
    cartSubtotal,
    setIsCartOpen,
    dispatchWhatsAppNumber,
    applyCoupon,
    appliedCoupon,
  } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: 'stars' },
    { id: 'fastfood', label: 'Fast Food', icon: 'lunch_dining' },
    { id: 'sandwiches', label: 'Sandwiches', icon: 'breakfast_dining' },
    { id: 'coffee', label: 'Coffee & Chai', icon: 'local_cafe' },
    { id: 'burgers', label: 'Burgers', icon: 'fastfood' },
    { id: 'pizza', label: 'Pizza', icon: 'local_pizza' },
    { id: 'combos', label: 'Combos', icon: 'interests' },
    { id: 'desserts', label: 'Desserts', icon: 'icecream' },
  ];

  // Best-seller items for the home page
  const homeBestsellers = [
    {
      id: 'home-1',
      name: 'Double Cheese Grilled Sandwich',
      desc: 'Spiced aloo masala, capsicum, mint chutney & dripping Amul cheese',
      price: 140,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfTni2G3bGsUO_xhB_yLktTQvcUUuIkaHGrNzpi7eDIEm6CZt8PcIdytgaftHbB9RXMGNk86IMRvmAkAWyZk3st3ENlPRZh8wv2l5Gi4wDO3J-rgh5HPcWq7CjBdPw4rqmkuSXTfyj0r8LfrwAy4MS6zey5bf8XhhUX4eTwiLGjjT3ioPJiQr51drRLMHMYVSP0ddCQfE524JyhrCpej6j2Wz2Nt_38Ilbdpm7ji4nqIJ9bNhUNjQ',
      rating: '4.9 (420+)',
      tag: "Chef's Pick",
      isVeg: true,
      category: 'sandwiches',
    },
    {
      id: 'home-2',
      name: 'Zaika Special Masala Burger',
      desc: 'Desi spiced crisp patty, secret zaika mayo & toasted buttery bun',
      price: 120,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxIwXlOtcM4VdDwhXmmwUgRXWXCX3zs4eSHrdk3kSHc6xpOeCetPUlvCCD96s-e8K25Ks2i8nks9YZ-WyOhBvoMAwd9gmxQL8VJaVG77mAp8R1Q9s_RnMfRSRiyASQBqPON_uaNM3d0buKHI0swdXgaEwQ4XdUopPul4IQ68NemUiK-sZY8_Dq233O4OohL7kBP7GvYdGuB9hG9IN4N5zMPSXmW0IzSe9fG7bjv9zBwUufKF6D6rE',
      rating: '4.8 (310+)',
      tag: 'Spicy 🔥',
      isVeg: true,
      category: 'burgers',
    },
    {
      id: 'home-3',
      name: 'Cold Coffee with Chocolate Ice Cream',
      desc: 'Heavy-cream espresso brew with Belgian chocolate scoop',
      price: 110,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuUk6Gf13Gm3D-i1LCWJuAk5_Ek9Sj8QHG1iFpbah_XQiWCmErk2sWLx4pIgBvctG0d7EnHbfNAoWd_kW_4HwoujR7jGQ5jUH4o3JoBOHJ89ML4lvxXDj9C294-mKX6U6-ZGW79mwQkbBYRB9eOiID54MYYvhvlHeSR7Hj8ndo1Fi7bDDvX3exw7womEgr1EJ9TS0dvKbGrtPmkwsJ4rSsyzuNx-GfyWT_RbUgAoKEX7iwgPw-nY0',
      rating: '4.9 (550+)',
      tag: 'Best Seller',
      isVeg: true,
      category: 'coffee',
    },
    {
      id: 'home-4',
      name: 'Peri Peri Paneer Wrap',
      desc: 'Smoky cottage cheese cubes, peri dust & herb dressing in crisp grilled wrap',
      price: 160,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_GvilFwTsQj5js2F-ycrGgIYjGGnBNDLgN553E-g56qTMsLul0nLMWWOghylNfmjSU07vyOWxyUfJcacX0IpPOT4cqOUOJPxdG_vK3QiSgXL22d33-QvP-95pSyd5kLoVGVW6na44GOEWA6Zct0ozabNi_CIVgf7y7_0di7X6PlC05bFEKqr1wui52xX1pCPezXR9eUoUbePqSQz01aJnF_LbGzH2DnKPHNABpmroGRJwucDpdUg',
      rating: '4.7 (180+)',
      tag: 'Crispy Wrap',
      isVeg: true,
      category: 'wraps',
    },
  ];

  const filteredItems = selectedCategory === 'all'
    ? homeBestsellers
    : homeBestsellers.filter(item => item.category === selectedCategory);

  const getItemQuantity = (id: string, name: string) => {
    const found = cart.find(ci => ci.item.id === id || ci.item.name === name);
    return found ? found.quantity : 0;
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-28">
      {/* Live Flash Offer Ticker */}
      <div className="px-4 pt-3 pb-1">
        <button
          type="button"
          onClick={() => applyCoupon('MUMBAI20')}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-full bg-[#ff6b00]/10 text-[#a04100] active:scale-[0.99] transition-all hover:bg-[#ff6b00]/15"
          title="Click to apply 20% discount coupon"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="material-symbols-outlined text-[18px] text-[#ff6b00] animate-pulse"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <span className="text-[11px] font-semibold tracking-normal truncate text-[#1e1b17]">
              20% OFF on first online order
            </span>
          </div>
          <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full shadow-xs">
            <span className="text-[11px] text-[#a04100] font-bold tracking-wider">
              {appliedCoupon === 'MUMBAI20' ? '✓ APPLIED' : 'TAP MUMBAI20'}
            </span>
          </div>
        </button>
      </div>

      {/* Hero Welcome Card */}
      <div className="px-4 py-2">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-md border border-[#e2bfb0]/20">
          <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-[#ff6b00]/15 blur-2xl pointer-events-none"></div>
          <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full bg-[#00b050]/10 blur-2xl pointer-events-none"></div>
          
          <div className="relative p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#ff6b00] text-white text-[10px] font-bold tracking-wide shadow-xs">
                AUTHENTIC STREET SOUL
              </span>
              <span className="text-[10px] text-[#006e2f] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006e2f] animate-ping"></span> Live Kitchen
              </span>
            </div>

            <div className="flex flex-col">
              <h2 className="font-headline-lg-mobile text-[26px] font-extrabold text-[#1e1b17] tracking-tight leading-tight">
                Mumbai Zaika
              </h2>
              <p className="text-[13px] text-[#a04100] font-bold mt-0.5">
                Taste of Mumbai, Served Fresh
              </p>
              <p className="text-[12px] text-[#5a4136] mt-1 leading-snug">
                Near Zakaria Masjid, Masjid Bunder • Order direct via WhatsApp or Dine-in
              </p>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex items-center gap-2 pt-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('menu')}
                className="flex-1 flex items-center justify-center gap-1.5 h-11 px-4 rounded-full bg-[#ff6b00] text-white text-[13px] font-bold shadow-md active:scale-95 transition-transform hover:bg-[#e05e00]"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                <span>Order Now</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('menu')}
                className="flex-1 flex items-center justify-center gap-1.5 h-11 px-4 rounded-full bg-[#eee7df] text-[#1e1b17] text-[13px] font-bold active:scale-95 transition-transform hover:bg-[#e8e1da]"
              >
                <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
                <span>View Menu</span>
              </button>
              <button
                aria-label="Book Table"
                type="button"
                onClick={() => setActiveTab('tables')}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-[#eee7df] text-[#1e1b17] active:scale-95 transition-transform hover:bg-[#e8e1da]"
                title="Book Table"
              >
                <span className="material-symbols-outlined text-[20px]">table_restaurant</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Explore Categories Horizontal Scroller */}
      <div className="py-2">
        <div className="flex items-center justify-between px-4 mb-2">
          <span className="text-[14px] font-bold text-[#1e1b17]">Explore Categories</span>
          <span className="text-[11px] text-[#a04100] font-bold">Swipe →</span>
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 no-scrollbar py-1">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 h-10 rounded-full text-[12px] font-bold whitespace-nowrap shadow-xs flex-shrink-0 active:scale-95 transition-all ${
                  isSelected
                    ? 'bg-[#1e1b17] text-[#fff8f1]'
                    : 'bg-white text-[#1e1b17] hover:bg-[#f4ede5]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bestsellers Section ("Mumbai's Favorites") */}
      <section className="px-4 pt-3 pb-2 flex flex-col gap-3" id="bestsellers">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-[20px] text-[#ff6b00]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                whatshot
              </span>
              <h3 className="font-headline-sm text-[17px] font-bold text-[#1e1b17] tracking-tight">
                Mumbai's Favorites
              </h3>
            </div>
            <p className="text-[12px] text-[#5a4136]">
              Handcrafted, loaded with cheese & signature spices
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className="text-[11px] text-[#a04100] font-bold px-2 py-1 rounded-md hover:bg-[#a04100]/10"
          >
            View All
          </button>
        </div>

        {/* Product Cards List */}
        <div className="flex flex-col gap-3">
          {filteredItems.map(item => {
            const qty = getItemQuantity(item.id, item.name);
            return (
              <div
                key={item.id}
                className="relative flex flex-col rounded-2xl bg-white shadow-sm overflow-hidden p-3 gap-2.5 border border-[#e2bfb0]/20 transition-all"
              >
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#f4ede5]">
                  <img
                    alt={item.name}
                    className="w-full h-full object-cover"
                    src={item.image}
                  />
                  {/* Floating Diet & Rating Pills */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {item.isVeg && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[#006e2f] text-[10px] shadow-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-[#006e2f]"></span> 100% Veg
                      </span>
                    )}
                    {item.tag && (
                      <span className="px-2 py-0.5 rounded-full bg-[#ff6b00] text-white text-[10px] font-bold shadow-xs">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[#1e1b17] text-[10px] shadow-xs">
                    <span
                      className="material-symbols-outlined text-[13px] text-[#ff6b00]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="font-bold">{item.rating}</span>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-2 px-1">
                  <div className="flex flex-col min-w-0 flex-1">
                    <h4 className="font-headline-sm text-[15px] font-bold text-[#1e1b17] leading-snug truncate">
                      {item.name}
                    </h4>
                    <p className="text-[12px] text-[#5a4136] line-clamp-1 mt-0.5">
                      {item.desc}
                    </p>
                    <span className="font-headline-sm text-[16px] text-[#a04100] font-bold mt-1">
                      ₹{item.price}
                    </span>
                  </div>

                  {qty > 0 ? (
                    <div className="flex items-center bg-[#f9d9cc] text-[#755d53] rounded-full px-1 py-0.5 shadow-xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-[#1e1b17] active:scale-90 transition-transform"
                      >
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </button>
                      <span className="px-2.5 text-[12px] font-bold text-[#755d53]">{qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-[#ff6b00] text-white active:scale-90 transition-transform"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          id: item.id,
                          name: item.name,
                          category: item.category as any,
                          price: item.price,
                          description: item.desc,
                          image: item.image,
                          rating: 4.8,
                          isVeg: item.isVeg,
                        })
                      }
                      className="flex items-center justify-center gap-1 h-10 px-4 rounded-full bg-[#ff6b00] text-white text-[12px] font-bold shadow-md active:scale-95 transition-transform flex-shrink-0 hover:bg-[#e05e00]"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      <span>ADD</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Story / About Us Section */}
      <section className="px-4 py-2">
        <div className="p-4 rounded-2xl bg-[#f9d9cc] text-[#755d53] relative overflow-hidden border border-[#e2bfb0]/40">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="material-symbols-outlined text-[22px] text-[#a04100]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_dining
            </span>
            <h3 className="font-headline-sm text-[16px] font-bold text-[#1e1b17]">
              Our Zaika Story
            </h3>
          </div>
          <p className="text-[13px] leading-relaxed text-[#5a4136]">
            Authentic Mumbai Street Zaika meets Modern Cafe Culture. Fresh ingredients, artisanal chai, rich filter coffee & loaded cheesy grills crafted for late-night cravings and bustling mid-day breaks.
          </p>
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-[#e2bfb0]/50">
            <div className="flex flex-col">
              <span className="font-headline-sm text-[16px] font-bold text-[#a04100]">100%</span>
              <span className="text-[10px] text-[#755d53] font-medium">Fresh Daily</span>
            </div>
            <div className="w-px h-7 bg-[#e2bfb0]"></div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-[16px] font-bold text-[#a04100]">15k+</span>
              <span className="text-[10px] text-[#755d53] font-medium">Happy Orders</span>
            </div>
            <div className="w-px h-7 bg-[#e2bfb0]"></div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-[16px] font-bold text-[#a04100]">1:30 AM</span>
              <span className="text-[10px] text-[#755d53] font-medium">Open Late</span>
            </div>
          </div>
        </div>
      </section>

      {/* Store Information & Outlet Quick Card */}
      <section className="px-4 pt-2 pb-4 flex flex-col gap-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm flex flex-col gap-3 border border-[#e2bfb0]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-[#a04100]">store</span>
              <h3 className="font-headline-sm text-[15px] font-bold text-[#1e1b17]">
                Masjid Bunder Outlet
              </h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-[#006e2f] bg-[#00b050]/15 px-2 py-0.5 rounded-full font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006e2f]"></span> Open Now
            </span>
          </div>

          {/* Map Location Snapshot */}
          <div
            className="w-full h-32 bg-cover bg-center rounded-xl relative overflow-hidden flex items-end p-2.5 shadow-inner border border-[#e2bfb0]/30"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCkd1eXk48fyu05Cbp5PhX5zN5sIzWDN6dXiUjtj0rkuZ9wtU3S3LcBVkoRAH1waVy9sRx7ePuMo7dwzyBGkEckOe0QfEnY_LrAztUABwjdJ-UGBQTsLgBivds7F8RD_BZMFhCcLPBPJAtCSYHiHsI2-jrFxJeW1uUyf5C5CFJbgbM_Q_FR8kRD7s318G5e-zZIMzkV_6ro85Waunzycx703qTctJnvinoHdhdkKnSFCFg2JFm4_A0')`,
            }}
          >
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs">
              <span className="material-symbols-outlined text-[16px] text-[#ff6b00]">pin_drop</span>
              <span className="text-[11px] font-semibold text-[#1e1b17]">
                Zakaria Masjid Road, Mumbai-400009
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-[#5a4136] text-[12px]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#71594f]">schedule</span>
              <span>Everyday: <strong className="text-[#1e1b17]">10:00 AM – 01:30 AM</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#71594f]">call</span>
              <span>
                Call / Helpline:{' '}
                <a className="text-[#a04100] font-bold hover:underline" href="tel:+919773848442">
                  +91 9773848442
                </a>
              </span>
            </div>
          </div>

          <a
            className="flex items-center justify-center gap-2 h-12 w-full rounded-full bg-[#006e2f] text-white text-[13px] font-bold shadow-md active:scale-95 transition-transform hover:opacity-95"
            href={`https://wa.me/${dispatchWhatsAppNumber.replace(/[^0-9]/g, '')}?text=Hi%20Mumbai%20Zaika,%20I%20want%20to%20order`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            <span>Chat on WhatsApp to Order</span>
          </a>
        </div>
      </section>

      {/* Sticky Bottom Cart Island Bar */}
      {cartCount > 0 && (
        <div className="sticky bottom-20 inset-x-0 z-30 px-4 pb-1 pointer-events-none">
          <div className="pointer-events-auto flex items-center justify-between p-2.5 pl-4 rounded-full bg-[#1e1b17]/95 text-white shadow-[0_12px_28px_-6px_rgba(255,107,0,0.35)] backdrop-blur-md">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => setIsCartOpen(true)}
            >
              <div className="w-8 h-8 rounded-full bg-[#ff6b00] text-white flex items-center justify-center text-[11px] font-bold">
                {cartCount}
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold leading-tight">{cartCount} Items in Cart</span>
                <span className="text-[11px] text-[#fcdcce]">
                  Total: <strong className="text-white font-bold">₹{cartSubtotal}</strong>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 h-10 px-4 rounded-full bg-[#ff6b00] text-white text-[12px] font-bold shadow active:scale-95 transition-transform"
            >
              <span>View Cart</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
