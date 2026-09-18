import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartCount,
    dispatchWhatsAppNumber,
    placeOrder,
    setActiveTab,
  } = useApp();

  const [orderType, setOrderType] = useState<'delivery' | 'dine-in' | 'takeaway'>('delivery');
  const [customerName, setCustomerName] = useState('Arif Khan');
  const [customerPhone, setCustomerPhone] = useState('+91 98200 98765');
  const [address, setAddress] = useState('Flat 402, Zakaria Masjid Road, Masjid Bunder, Mumbai');
  const [tableNumber, setTableNumber] = useState('T4');
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (!isCartOpen) return null;

  const deliveryFee = orderType === 'delivery' ? (cartSubtotal >= 300 ? 0 : 25) : 0;
  const gst = Math.round(cartSubtotal * 0.05 * 10) / 10;
  const grandTotal = cartSubtotal + deliveryFee + gst;

  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) return;

    const orderId = `MZ-${Math.floor(1000 + Math.random() * 9000)}`;

    const itemsText = cart
      .map(
        (ci, i) =>
          `${i + 1}. *${ci.item.name}* x${ci.quantity} - ₹${ci.item.price * ci.quantity}`
      )
      .join('%0A');

    const message = `*MUMBAI ZAIKA - NEW ORDER*%0A` +
      `--------------------------------%0A` +
      `*Order ID:* ${orderId}%0A` +
      `*Type:* ${orderType.toUpperCase()} ${orderType === 'dine-in' ? `(Table ${tableNumber})` : ''}%0A` +
      `*Customer:* ${customerName} (${customerPhone})%0A` +
      `${orderType === 'delivery' ? `*Address:* ${address}%0A` : ''}` +
      `--------------------------------%0A` +
      `*Items Ordered:*%0A${itemsText}%0A` +
      `--------------------------------%0A` +
      `*Subtotal:* ₹${cartSubtotal}%0A` +
      `${deliveryFee > 0 ? `*Delivery Fee:* ₹${deliveryFee}%0A` : ''}` +
      `*GST (5%):* ₹${gst}%0A` +
      `*Grand Total:* *₹${grandTotal.toFixed(2)}*%0A` +
      `${specialInstructions ? `*Note:* ${specialInstructions}%0A` : ''}` +
      `--------------------------------%0A` +
      `_Please confirm preparation time and payment._`;

    // Add to app context
    placeOrder({
      orderId,
      customerName,
      customerPhone,
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      address: orderType === 'delivery' ? address : undefined,
      items: [...cart],
      subtotal: cartSubtotal,
      deliveryFee,
      gst,
      grandTotal,
      paymentMethod: 'WhatsApp / UPI',
      time: 'Just now',
    });

    // Open WhatsApp
    const cleanWa = dispatchWhatsAppNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanWa}?text=${message}`, '_blank');

    setIsCartOpen(false);
    clearCart();
    setActiveTab('success');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#33302b]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-300"
      onClick={e => {
        if (e.target === e.currentTarget) setIsCartOpen(false);
      }}
    >
      <div className="bg-[#fff8f1] w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col transition-transform duration-300">
        {/* Cart Header */}
        <div className="sticky top-0 bg-[#fff8f1]/95 backdrop-blur-md px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#e2bfb0]/30 z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#ff6b00] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-[16px] font-bold text-[#1e1b17]">
                Your Zaika Cart
              </h3>
              <p className="text-[11px] text-[#5a4136]">
                {cartCount} items selected • Freshly prepared
              </p>
            </div>
          </div>
          <button
            aria-label="Close cart"
            className="w-8 h-8 rounded-full bg-[#f4ede5] flex items-center justify-center text-[#1e1b17] hover:bg-[#eee7df]"
            onClick={() => setIsCartOpen(false)}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        {cart.length > 0 ? (
          <div className="p-4 flex flex-col gap-4">
            {/* Order Type Tabs */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-[#5a4136] uppercase tracking-wide">
                Order Delivery Mode
              </span>
              <div className="grid grid-cols-3 p-1 bg-[#f9f3eb] rounded-xl gap-1 border border-[#e2bfb0]/25">
                {(['delivery', 'dine-in', 'takeaway'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`py-2 rounded-lg text-[12px] font-bold capitalize transition-all ${
                      orderType === type
                        ? 'bg-[#a04100] text-white shadow-xs'
                        : 'text-[#5a4136] hover:text-[#1e1b17]'
                    }`}
                  >
                    {type === 'dine-in' ? 'Dine-In' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Details Form */}
            <div className="bg-[#f9f3eb] p-3 rounded-xl flex flex-col gap-2.5 border border-[#e2bfb0]/25">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#5a4136] font-bold uppercase">Name</label>
                  <input
                    className="h-9 px-2.5 bg-white text-[#1e1b17] text-[12px] font-semibold rounded-lg border border-[#e2bfb0]/40 focus:outline-none"
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#5a4136] font-bold uppercase">Phone</label>
                  <input
                    className="h-9 px-2.5 bg-white text-[#1e1b17] text-[12px] font-semibold rounded-lg border border-[#e2bfb0]/40 focus:outline-none"
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>

              {orderType === 'delivery' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#5a4136] font-bold uppercase">
                    Delivery Address
                  </label>
                  <input
                    className="h-9 px-2.5 bg-white text-[#1e1b17] text-[12px] font-semibold rounded-lg border border-[#e2bfb0]/40 focus:outline-none"
                    placeholder="Building, street, landmark in Masjid Bunder..."
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>
              )}

              {orderType === 'dine-in' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#5a4136] font-bold uppercase">Table Number</label>
                  <select
                    className="h-9 px-2 bg-white text-[#1e1b17] text-[12px] font-semibold rounded-lg border border-[#e2bfb0]/40 focus:outline-none"
                    value={tableNumber}
                    onChange={e => setTableNumber(e.target.value)}
                  >
                    <option value="T1">Table 1 (2-Seater Cafe Corner)</option>
                    <option value="T2">Table 2 (4-Seater Center Hall)</option>
                    <option value="T3">Table 3 (4-Seater Garden View)</option>
                    <option value="T4">Table 4 (6-Seater Family Special)</option>
                    <option value="T5">Table 5 (2-Seater Window Side)</option>
                    <option value="T6">Table 6 (4-Seater Inner Hall)</option>
                    <option value="T7">Table 7 (4-Seater Balcony Side)</option>
                    <option value="T8">Table 8 (6-Seater Luxury Booth)</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#5a4136] font-bold uppercase">
                  Chef Notes / Cooking Preference
                </label>
                <input
                  className="h-9 px-2.5 bg-white text-[#1e1b17] text-[12px] rounded-lg border border-[#e2bfb0]/40 focus:outline-none"
                  placeholder="e.g. Extra spicy, less cheese, separate chutney..."
                  type="text"
                  value={specialInstructions}
                  onChange={e => setSpecialInstructions(e.target.value)}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#1e1b17]">Review Selected Dishes</span>
                <button
                  className="text-[11px] text-[#ba1a1a] font-semibold hover:underline"
                  onClick={clearCart}
                  type="button"
                >
                  Clear Cart
                </button>
              </div>

              {cart.map(item => (
                <div
                  key={item.item.id}
                  className="bg-white p-3 rounded-xl flex items-center justify-between gap-3 shadow-xs border border-[#e2bfb0]/25"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      alt={item.item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-[#f4ede5] flex-shrink-0"
                      src={item.item.image}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            item.item.isVeg ? 'bg-[#006e2f]' : 'bg-[#ba1a1a]'
                          }`}
                        ></span>
                        <h4 className="text-[12px] font-bold text-[#1e1b17] truncate">
                          {item.item.name}
                        </h4>
                      </div>
                      <span className="text-[11px] text-[#a04100] font-bold">
                        ₹{item.item.price} each
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center bg-[#f9d9cc] text-[#755d53] rounded-full px-1 py-0.5">
                      <button
                        className="w-6 h-6 rounded-full bg-white text-[#1e1b17] flex items-center justify-center active:scale-90"
                        onClick={() => updateQuantity(item.item.id, -1)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[14px]">remove</span>
                      </button>
                      <span className="px-2 text-[12px] font-bold text-[#755d53]">
                        {item.quantity}
                      </span>
                      <button
                        className="w-6 h-6 rounded-full bg-[#ff6b00] text-white flex items-center justify-center active:scale-90"
                        onClick={() => updateQuantity(item.item.id, 1)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                      </button>
                    </div>
                    <span className="text-[13px] font-bold text-[#1e1b17] min-w-[50px] text-right">
                      ₹{item.item.price * item.quantity}
                    </span>
                    <button
                      className="text-[#5a4136] hover:text-[#ba1a1a] p-1"
                      onClick={() => removeFromCart(item.item.id)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="bg-[#f9f3eb] p-3 rounded-xl flex flex-col gap-1.5 border border-[#e2bfb0]/25">
              <div className="flex items-center justify-between text-[#5a4136] text-[12px]">
                <span>Item Total</span>
                <span className="font-bold text-[#1e1b17]">₹{cartSubtotal}</span>
              </div>
              {orderType === 'delivery' && (
                <div className="flex items-center justify-between text-[#5a4136] text-[12px]">
                  <span>Packaging & Delivery</span>
                  <span className="font-bold text-[#1e1b17]">
                    {deliveryFee === 0 ? (
                      <span className="text-[#006e2f] font-bold">FREE (Orders ₹300+)</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-[#5a4136] text-[12px]">
                <span>GST (5%)</span>
                <span className="font-bold text-[#1e1b17]">₹{gst}</span>
              </div>
              <div className="pt-2 border-t border-[#e2bfb0]/40 flex items-center justify-between">
                <span className="font-headline-sm text-[15px] font-bold text-[#1e1b17]">
                  To Pay
                </span>
                <span className="font-headline-lg text-[20px] font-extrabold text-[#a04100]">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit / WhatsApp Order button */}
            <button
              className="w-full h-13 py-3.5 px-4 bg-[#006e2f] text-white rounded-full font-headline-sm text-[14px] font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#005a26]"
              onClick={handleCheckoutWhatsApp}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              <span>Send Order to Kitchen via WhatsApp</span>
            </button>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#f9d9cc] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[32px] text-[#755d53]">
                shopping_cart
              </span>
            </div>
            <h4 className="font-headline-sm text-[16px] font-bold text-[#1e1b17]">
              Your Cart is Empty
            </h4>
            <p className="text-[12px] text-[#5a4136] mt-1">
              Add your favorite cheese grilled sandwiches, cold coffee or cutting chai to get started!
            </p>
            <button
              className="mt-4 px-5 py-2.5 rounded-full bg-[#ff6b00] text-white text-[12px] font-bold shadow-md active:scale-95"
              onClick={() => {
                setIsCartOpen(false);
                setActiveTab('menu');
              }}
              type="button"
            >
              Explore Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
