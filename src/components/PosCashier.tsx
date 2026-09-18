import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem } from '../types';

export const PosCashier: React.FC = () => {
  const {
    menuItems,
    dailyStats,
    showToast,
    dispatchWhatsAppNumber,
    placeOrder,
    holdPOSOrder,
    heldOrders,
    resumeHeldOrder,
    setPrintReceiptData,
    setIsSheetViewerOpen,
  } = useApp();

  const [orderMode, setOrderMode] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [selectedTable, setSelectedTable] = useState<string>('T4');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash');
  const [activeCategory, setActiveCategory] = useState<string>('popular');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // POS specific active cart items
  const [posItems, setPosItems] = useState<{ item: MenuItem; quantity: number }[]>([
    {
      item: {
        id: 'pos-1',
        name: 'Mumbai Double Cheese Grilled Sandwich',
        price: 140,
        category: 'sandwiches',
        description: 'Double spiced cheese',
        image: '',
        rating: 4.9,
        isVeg: true,
      },
      quantity: 2,
    },
    {
      item: {
        id: 'pos-2',
        name: 'Hazelnut Cold Coffee',
        price: 120,
        category: 'coffee',
        description: 'Rich hazelnut espresso blend',
        image: '',
        rating: 4.8,
        isVeg: true,
      },
      quantity: 1,
    },
    {
      item: {
        id: 'pos-3',
        name: 'Peri Peri Fries',
        price: 100,
        category: 'fries',
        description: 'Salted golden crunch',
        image: '',
        rating: 4.7,
        isVeg: true,
      },
      quantity: 1,
    },
  ]);

  // Quick Catalog speed items
  const speedItems = [
    { name: 'Cheese Grill', price: 140, category: 'Sandwiches', desc: 'Double spiced cheese', tag: 'Fast', isVeg: true },
    { name: 'Cutting Chai', price: 20, category: 'Coffee & Chai', desc: 'Cardamom & Ginger', tag: 'Hot', isVeg: true },
    { name: 'Cold Coffee', price: 110, category: 'Coffee & Chai', desc: 'Rich hazelnut blend', tag: 'Cold', isVeg: true },
    { name: 'Paneer Wrap', price: 160, category: 'Sandwiches', desc: 'Tandoori mint mayo', tag: 'Spicy', isVeg: true },
    { name: 'French Fries', price: 90, category: 'Snacks & Fries', desc: 'Salted golden crunch', tag: 'Side', isVeg: true },
    { name: 'Zaika Student Box', price: 149, category: 'Combos', desc: 'Sandwich + Chai + Dip', tag: 'Value', isVeg: true },
  ];

  const handleAddSpeedItem = (speedItem: typeof speedItems[0]) => {
    setPosItems(prev => {
      const existing = prev.find(p => p.item.name === speedItem.name);
      if (existing) {
        return prev.map(p =>
          p.item.name === speedItem.name ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [
        ...prev,
        {
          item: {
            id: `speed-${Date.now()}-${speedItem.name}`,
            name: speedItem.name,
            price: speedItem.price,
            category: 'sandwiches',
            description: speedItem.desc,
            image: '',
            rating: 4.8,
            isVeg: speedItem.isVeg,
          },
          quantity: 1,
        },
      ];
    });
    showToast(`Added ${speedItem.name} to POS ticket`);
  };

  const updatePosQty = (name: string, delta: number) => {
    setPosItems(prev => {
      return prev
        .map(p => {
          if (p.item.name === name) {
            const next = p.quantity + delta;
            return next > 0 ? { ...p, quantity: next } : null;
          }
          return p;
        })
        .filter(Boolean) as { item: MenuItem; quantity: number }[];
    });
  };

  const clearPosItems = () => {
    setPosItems([]);
    showToast('Cleared POS order');
  };

  const subtotal = posItems.reduce((acc, p) => acc + p.item.price * p.quantity, 0);
  const discount = subtotal >= 300 ? 50 : 0;
  const gst = Math.round(subtotal * 0.05 * 10) / 10;
  const grandTotal = Math.max(0, subtotal - discount + gst);

  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!barcodeQuery.trim()) return;
    const query = barcodeQuery.toLowerCase().trim();
    const found = menuItems.find(
      m => m.name.toLowerCase().includes(query) || m.id.toLowerCase().includes(query)
    );
    if (found) {
      setPosItems(prev => {
        const existing = prev.find(p => p.item.id === found.id);
        if (existing) {
          return prev.map(p => (p.item.id === found.id ? { ...p, quantity: p.quantity + 1 } : p));
        }
        return [...prev, { item: found, quantity: 1 }];
      });
      showToast(`Added ${found.name} to ticket`);
      setBarcodeQuery('');
    } else {
      showToast(`No item matching: "${barcodeQuery}"`);
    }
  };

  const handleCompleteSale = () => {
    if (posItems.length === 0) {
      showToast('No items in current order!');
      return;
    }

    setIsSyncing(true);
    const orderId = `MZ-${Math.floor(1000 + Math.random() * 9000)}`;
    const tableLabel = orderMode === 'dine-in' ? selectedTable : orderMode.toUpperCase();

    setTimeout(() => {
      setIsSyncing(false);
      // Place order and write to Google Sheet
      placeOrder({
        orderId,
        orderMode,
        tableNumber: tableLabel,
        customerName: 'POS Counter Guest',
        customerPhone: '+91 98200 00000',
        items: posItems.map(p => ({ item: p.item, quantity: p.quantity })),
        subtotal,
        discount,
        gst,
        grandTotal,
        paymentMethod: paymentMethod.toUpperCase(),
      });

      // Automatically open receipt preview modal
      setPrintReceiptData({
        type: 'Bill',
        orderId,
        tableNumber: tableLabel,
        orderMode,
        items: posItems.map(p => ({
          name: p.item.name,
          quantity: p.quantity,
          price: p.item.price,
        })),
        subtotal,
        discount,
        gst,
        grandTotal,
        paymentMethod: paymentMethod.toUpperCase(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // reset ticket
      setPosItems([]);
    }, 600);
  };

  const handlePrint = (type: 'KOT' | 'Bill') => {
    if (posItems.length === 0) {
      showToast('Add items to ticket before printing!');
      return;
    }
    const orderId = `MZ-${Math.floor(1000 + Math.random() * 9000)}`;
    const tableLabel = orderMode === 'dine-in' ? selectedTable : orderMode.toUpperCase();

    setPrintReceiptData({
      type,
      orderId,
      tableNumber: tableLabel,
      orderMode,
      items: posItems.map(p => ({
        name: p.item.name,
        quantity: p.quantity,
        price: p.item.price,
      })),
      subtotal,
      discount,
      gst,
      grandTotal,
      paymentMethod: paymentMethod.toUpperCase(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    showToast(`Generating ${type} preview for ${tableLabel}...`);
  };

  const handleHold = () => {
    if (posItems.length === 0) {
      showToast('No active items to put on hold');
      return;
    }
    const holdId = `HOLD-${Date.now()}`;
    holdPOSOrder({
      id: holdId,
      kotNumber: Math.floor(100 + Math.random() * 900),
      orderMode,
      tableNumber: selectedTable,
      customerName: 'Hold Customer',
      customerPhone: '',
      items: posItems.map(p => ({ item: p.item, quantity: p.quantity })),
      subtotal,
      discount,
      gst,
      grandTotal,
      paymentMethod,
      status: 'hold',
      timestamp: new Date().toLocaleTimeString(),
    });
    setPosItems([]);
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 py-3 pb-32 gap-3">
      {/* Register Metrics Pill Banner */}
      <div className="w-full bg-white rounded-xl p-3 shadow-xs border border-[#e2bfb0]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#f9d9cc] flex items-center justify-center text-[#71594f] flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-headline-sm text-[15px] font-bold text-[#1e1b17] truncate">
                Register #1
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00b050]/15 text-[#006e2f]">
                Online
              </span>
            </div>
            <span className="text-[11px] text-[#5a4136] truncate">
              Masjid Bunder Station Outpost
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <div className="flex items-center gap-2 bg-[#f9f3eb] px-3 py-1.5 rounded-lg flex-shrink-0 border border-[#e2bfb0]/20">
            <span className="material-symbols-outlined text-[#ff6b00] text-[18px]">payments</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#5a4136]">Today's Sales</span>
              <span className="text-[13px] font-extrabold text-[#1e1b17]">
                ₹{dailyStats.income.toLocaleString()}{' '}
                <span className="text-[10px] text-[#5a4136] font-normal">
                  ({dailyStats.ordersCount} ord)
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#f9f3eb] px-3 py-1.5 rounded-lg flex-shrink-0 border border-[#e2bfb0]/20">
            <span className="material-symbols-outlined text-[#71594f] text-[18px]">lock_clock</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#5a4136]">Cash in Drawer</span>
              <span className="text-[13px] font-extrabold text-[#1e1b17]">
                ₹{dailyStats.expense.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Google Sheets Integration Real-time Status */}
      <div className="w-full bg-[#00b050]/10 text-[#003a15] rounded-xl px-3 py-2 flex items-center justify-between gap-2 border border-[#00b050]/20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006e2f]"></span>
            <span className="absolute w-4 h-4 rounded-full bg-[#006e2f]/40 animate-ping"></span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-[#006e2f] flex-shrink-0">
            table_chart
          </span>
          <p className="text-[11px] truncate">
            Sync Active: Connected to Google Sheet{' '}
            <span className="underline font-bold">'orders'</span> via Apps Script Webhook
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsSheetViewerOpen(true)}
          className="text-[11px] bg-[#006e2f] text-white font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1 hover:bg-[#005a26] active:scale-95 transition-all flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[14px]">table_view</span>
          <span>Inspect Sheet</span>
        </button>
      </div>

      {/* Held Orders Bar if any */}
      {heldOrders.length > 0 && (
        <div className="bg-[#fff3e0] border border-[#ffe0b2] rounded-xl p-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#e65100]">
            <span className="material-symbols-outlined text-[18px]">pause_circle</span>
            <span>{heldOrders.length} Held Ticket(s) Pending</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {heldOrders.map(ho => (
              <button
                key={ho.id}
                type="button"
                onClick={() => {
                  const resumed = resumeHeldOrder(ho.id);
                  if (resumed) {
                    setPosItems(resumed.items.map(i => ({ item: i.item, quantity: i.quantity })));
                    setSelectedTable(resumed.tableNumber);
                    setOrderMode(resumed.orderMode);
                  }
                }}
                className="px-2.5 py-1 bg-[#e65100] text-white text-[11px] font-bold rounded-lg hover:bg-[#bf360c] active:scale-95 shadow-xs whitespace-nowrap"
              >
                Resume {ho.tableNumber} (₹{ho.grandTotal})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main POS Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT: Fast Touch Menu & Catalog */}
        <div className="lg:col-span-6 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#a04100] text-[20px]">touch_app</span>
              <h2 className="font-headline-sm text-[16px] font-bold text-[#1e1b17]">Speed Catalog</h2>
            </div>
            <span className="text-[11px] text-[#5a4136]">Tap to append cart</span>
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'popular', label: '🔥 All Popular' },
              { id: 'sandwiches', label: 'Sandwiches' },
              { id: 'coffee', label: 'Coffee & Chai' },
              { id: 'snacks', label: 'Snacks & Fries' },
              { id: 'combos', label: 'Combos' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap shadow-xs transition-all ${
                  activeCategory === tab.id
                    ? 'bg-[#71594f] text-white'
                    : 'bg-white text-[#1e1b17] hover:bg-[#f4ede5]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Tap Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {speedItems.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddSpeedItem(item)}
                className="flex flex-col justify-between p-3 bg-white rounded-xl shadow-xs hover:shadow-md active:scale-95 transition text-left border border-[#e2bfb0]/25 group"
              >
                <div className="flex items-start justify-between gap-1 w-full">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#00b050]/20 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006e2f]"></span>
                  </span>
                  <span className="text-[9px] font-bold bg-[#ffdbcc] text-[#351000] px-1.5 py-0.5 rounded">
                    {item.tag}
                  </span>
                </div>
                <div className="my-2">
                  <h3 className="text-[13px] font-bold text-[#1e1b17] group-hover:text-[#a04100] transition line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-[#5a4136] line-clamp-1">{item.desc}</p>
                </div>
                <div className="flex items-center justify-between w-full pt-1">
                  <span className="font-headline-sm text-[15px] font-bold text-[#a04100]">
                    ₹{item.price}
                  </span>
                  <span className="w-7 h-7 rounded-full bg-[#ffdbcc] flex items-center justify-center text-[#351000] group-hover:bg-[#ff6b00] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Barcode / SKU input */}
          <div className="bg-white p-2.5 rounded-xl shadow-xs border border-[#e2bfb0]/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#71594f] text-[20px]">
              barcode_scanner
            </span>
            <input
              className="flex-1 bg-[#f9f3eb] px-3 py-1.5 rounded-full text-[12px] text-[#1e1b17] placeholder:text-[#5a4136] focus:outline-none"
              placeholder="Type item name or barcode scan..."
              type="text"
              value={barcodeQuery}
              onChange={e => setBarcodeQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && barcodeQuery.trim()) {
                  handleAddSpeedItem({
                    name: barcodeQuery.trim(),
                    price: 120,
                    category: 'Sandwiches',
                    desc: 'Custom barcode scanned item',
                    tag: 'Scan',
                    isVeg: true,
                  });
                  setBarcodeQuery('');
                }
              }}
            />
            <button
              className="w-8 h-8 rounded-full bg-[#71594f] text-white flex items-center justify-center active:scale-95"
              onClick={() => {
                if (barcodeQuery.trim()) {
                  handleAddSpeedItem({
                    name: barcodeQuery.trim(),
                    price: 120,
                    category: 'Sandwiches',
                    desc: 'Custom barcode scanned item',
                    tag: 'Scan',
                    isVeg: true,
                  });
                  setBarcodeQuery('');
                }
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
            </button>
          </div>
        </div>

        {/* RIGHT: Active Order Bill Calculator */}
        <div className="lg:col-span-6 bg-white rounded-xl p-4 shadow-sm border border-[#e2bfb0]/30 flex flex-col gap-3">
          {/* Order Mode & Table Selector */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#1e1b17]">Order Mode</span>
              <span className="text-[11px] text-[#a04100] font-bold">KOT #108</span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-[#f9f3eb] p-1 rounded-xl">
              <button
                className={`py-1.5 rounded-lg text-[12px] font-bold text-center transition ${
                  orderMode === 'dine-in'
                    ? 'bg-[#71594f] text-white'
                    : 'text-[#1e1b17] hover:bg-[#eee7df]'
                }`}
                onClick={() => setOrderMode('dine-in')}
                type="button"
              >
                Dine-in ({selectedTable})
              </button>
              <button
                className={`py-1.5 rounded-lg text-[12px] font-bold text-center transition ${
                  orderMode === 'takeaway'
                    ? 'bg-[#71594f] text-white'
                    : 'text-[#1e1b17] hover:bg-[#eee7df]'
                }`}
                onClick={() => setOrderMode('takeaway')}
                type="button"
              >
                Takeaway
              </button>
              <button
                className={`py-1.5 rounded-lg text-[12px] font-bold text-center transition ${
                  orderMode === 'delivery'
                    ? 'bg-[#71594f] text-white'
                    : 'text-[#1e1b17] hover:bg-[#eee7df]'
                }`}
                onClick={() => setOrderMode('delivery')}
                type="button"
              >
                Delivery
              </button>
            </div>

            {/* Table Quick Selector */}
            {orderMode === 'dine-in' && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                <span className="text-[11px] text-[#5a4136] pr-1 flex-shrink-0">Table:</span>
                {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTable(t)}
                    className={`w-8 h-8 rounded-lg text-[11px] font-bold flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedTable === t
                        ? 'bg-[#a04100] text-white shadow-xs'
                        : 'bg-[#f4ede5] text-[#1e1b17] hover:bg-[#eee7df]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customer Details Mini Strip */}
          <div className="bg-[#f9f3eb] p-2.5 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#71594f] text-[20px] flex-shrink-0">
                person
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-[#1e1b17] truncate">Arif Khan</p>
                <p className="text-[11px] text-[#5a4136] truncate">+91 98200XXXXX</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold bg-[#006e2f]/15 text-[#006e2f] px-2 py-0.5 rounded-full">
                VIP (18 pts)
              </span>
              <button
                aria-label="Edit customer"
                className="w-7 h-7 rounded-full hover:bg-[#eee7df] flex items-center justify-center text-[#5a4136]"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            </div>
          </div>

          {/* Active Cart Items Listing */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between pb-0.5">
              <span className="text-[13px] font-bold text-[#1e1b17]">
                Order Items ({posItems.reduce((a, b) => a + b.quantity, 0)} items)
              </span>
              <button
                className="text-[11px] text-[#ba1a1a] hover:underline flex items-center gap-0.5 font-semibold"
                onClick={clearPosItems}
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">delete_sweep</span> Clear All
              </button>
            </div>

            {posItems.map((p, idx) => (
              <div
                key={idx}
                className="bg-[#f9f3eb]/60 rounded-xl p-2.5 flex items-center justify-between gap-2 border border-[#e2bfb0]/20"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#006e2f] flex-shrink-0"></span>
                    <h4 className="text-[12px] font-bold text-[#1e1b17] truncate">{p.item.name}</h4>
                  </div>
                  <p className="text-[10px] text-[#5a4136] pl-3.5">₹{p.item.price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white rounded-full px-1 py-0.5 shadow-xs border border-[#e2bfb0]/30">
                    <button
                      className="w-6 h-6 rounded-full text-[#1e1b17] flex items-center justify-center active:scale-90"
                      onClick={() => updatePosQty(p.item.name, -1)}
                      type="button"
                    >
                      -
                    </button>
                    <span className="text-[12px] font-bold px-1.5 text-[#1e1b17]">{p.quantity}</span>
                    <button
                      className="w-6 h-6 rounded-full text-[#a04100] font-bold flex items-center justify-center active:scale-90"
                      onClick={() => updatePosQty(p.item.name, 1)}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[13px] font-extrabold text-[#1e1b17] min-w-[50px] text-right">
                    ₹{p.item.price * p.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bill Breakdown Calculator */}
          <div className="bg-[#f9f3eb] p-3 rounded-xl flex flex-col gap-1.5 border border-[#e2bfb0]/20">
            <div className="flex items-center justify-between text-[#5a4136] text-[12px]">
              <span>Subtotal</span>
              <span className="font-bold text-[#1e1b17]">₹{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-[#006e2f] text-[12px] font-semibold">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">local_offer</span>
                  Discount (MUMBAI10)
                </span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-[#5a4136] text-[12px]">
              <span>GST 5% (CGST 2.5% + SGST 2.5%)</span>
              <span className="font-bold text-[#1e1b17]">+₹{gst.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-[#e2bfb0]/30 flex items-center justify-between">
              <div>
                <span className="font-headline-sm text-[15px] font-bold text-[#1e1b17]">Grand Total</span>
                <p className="text-[10px] text-[#5a4136]">Round-off applied</p>
              </div>
              <div className="text-right">
                <span className="font-headline-lg text-[22px] font-extrabold text-[#a04100] tracking-tight">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-[#5a4136] font-medium">Select Payment Channel</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-[#a04100] text-white shadow-md'
                    : 'bg-[#f9f3eb] text-[#1e1b17] hover:bg-[#eee7df]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">attach_money</span>
                <span className="text-[11px] font-bold">Cash</span>
                <span className="text-[9px] opacity-90">
                  {paymentMethod === 'cash' ? 'Selected' : 'Drawer'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-[#a04100] text-white shadow-md'
                    : 'bg-[#f9f3eb] text-[#1e1b17] hover:bg-[#eee7df]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] text-[#006e2f]">qr_code_2</span>
                <span className="text-[11px] font-bold">UPI QR</span>
                <span className="text-[9px] text-[#5a4136]">GPay / Paytm</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-[#a04100] text-white shadow-md'
                    : 'bg-[#f9f3eb] text-[#1e1b17] hover:bg-[#eee7df]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] text-[#71594f]">credit_card</span>
                <span className="text-[11px] font-bold">Card POS</span>
                <span className="text-[9px] text-[#5a4136]">Tap / Chip</span>
              </button>
            </div>
          </div>

          {/* POS Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleHold}
                className="py-2.5 px-2 rounded-xl bg-[#ffdbcc] text-[#351000] hover:bg-[#ffb693] flex items-center justify-center gap-1 shadow-xs active:scale-95 transition font-bold text-[12px]"
              >
                <span className="material-symbols-outlined text-[17px]">pause_circle</span>
                <span>Hold</span>
              </button>
              <button
                type="button"
                onClick={() => handlePrint('KOT')}
                className="py-2.5 px-2 rounded-xl bg-[#eee7df] text-[#5a4136] hover:bg-[#e8e1da] flex items-center justify-center gap-1 shadow-xs active:scale-95 transition font-bold text-[12px]"
              >
                <span className="material-symbols-outlined text-[17px]">soup_kitchen</span>
                <span>Print KOT</span>
              </button>
              <button
                type="button"
                onClick={() => handlePrint('Bill')}
                className="py-2.5 px-2 rounded-xl bg-[#f9d9cc] text-[#755d53] hover:bg-[#fcdcce] flex items-center justify-center gap-1 shadow-xs active:scale-95 transition font-bold text-[12px]"
              >
                <span className="material-symbols-outlined text-[17px]">receipt_long</span>
                <span>Print Bill</span>
              </button>
            </div>

            {/* Master Complete Sale Button */}
            <button
              type="button"
              onClick={handleCompleteSale}
              disabled={isSyncing}
              className="w-full py-3.5 px-4 rounded-xl bg-[#006e2f] text-white font-headline-sm text-[15px] font-bold flex items-center justify-center gap-2 shadow-[0_12px_28px_-6px_rgba(0,110,47,0.40)] active:scale-[0.98] transition hover:bg-[#005a26] disabled:opacity-80"
            >
              {isSyncing ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                  <span>Syncing to Google Sheets...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[22px]">task_alt</span>
                  <span>Complete Sale & Sync Sheet</span>
                  <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-[11px]">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
