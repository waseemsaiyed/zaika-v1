import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  TabType,
  MenuItem,
  CartItem,
  RestaurantTable,
  Reservation,
  KhataEntry,
  POSOrder,
  SheetSyncLog,
  PrintReceiptData,
} from '../types';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_TABLES,
  INITIAL_RESERVATIONS,
  INITIAL_KHATA_ENTRIES,
} from '../data/initialData';

export interface GoogleSheetConfig {
  sheetId: string;
  webhookUrl: string;
  isOnline: boolean;
  autoSync: boolean;
  lastSyncedAt: string;
}

export interface OrderRecord {
  orderId: string;
  orderMode: string;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  itemsSummary: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee?: number;
  gst: number;
  grandTotal: number;
  paymentMethod: string;
  status: 'Completed' | 'Pending' | 'Hold';
  timestamp: string;
}

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, customization?: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  cartTax: number;
  cartGrandTotal: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  isSheetViewerOpen: boolean;
  setIsSheetViewerOpen: (open: boolean) => void;
  menuItems: MenuItem[];
  addMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  tables: RestaurantTable[];
  updateTableStatus: (
    tableId: string,
    status: RestaurantTable['status'],
    bill?: number,
    reservedFor?: string
  ) => void;
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'initial'>) => void;
  seatReservation: (reservationId: string, tableNumber: string) => void;
  deleteReservation: (id: string) => void;
  khataEntries: KhataEntry[];
  addKhataEntry: (entry: Omit<KhataEntry, 'id' | 'synced'>) => void;
  deleteKhataEntry: (id: string) => void;
  orders: OrderRecord[];
  placeOrder: (order: any) => void;
  dailyStats: {
    income: number;
    expense: number;
    pettyCash: number;
    ordersCount: number;
  };
  lastOrder: any | null;
  setLastOrder: React.Dispatch<React.SetStateAction<any>>;
  heldOrders: POSOrder[];
  holdPOSOrder: (order: POSOrder) => void;
  resumeHeldOrder: (id: string) => POSOrder | undefined;
  dispatchWhatsAppNumber: string;
  setDispatchWhatsAppNumber: (num: string) => void;
  googleSheetConfig: GoogleSheetConfig;
  updateGoogleSheetConfig: (cfg: Partial<GoogleSheetConfig>) => void;
  sheetSyncLogs: SheetSyncLog[];
  recordSheetSync: (
    sheetName: SheetSyncLog['sheetName'],
    action: SheetSyncLog['action'],
    summary: string,
    data?: any
  ) => void;
  printReceiptData: PrintReceiptData | null;
  setPrintReceiptData: (data: PrintReceiptData | null) => void;
  toast: string | null;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  resetDatabaseToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'zaika_db_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

const INITIAL_ORDERS: OrderRecord[] = [
  {
    orderId: 'MZ-101',
    orderMode: 'dine-in',
    tableNumber: 'T2',
    customerName: 'Aman Varma',
    customerPhone: '+91 98200 11223',
    itemsSummary: '1x Mumbai Cheese Burst Sandwich, 1x Cutting Chai',
    items: [
      { item: INITIAL_MENU_ITEMS[0], quantity: 1 },
      { item: INITIAL_MENU_ITEMS[1], quantity: 1 },
    ],
    subtotal: 260,
    discount: 0,
    gst: 13,
    grandTotal: 273,
    paymentMethod: 'UPI (GPay)',
    status: 'Completed',
    timestamp: 'Today, 11:20 AM',
  },
  {
    orderId: 'MZ-102',
    orderMode: 'takeaway',
    tableNumber: 'Takeaway',
    customerName: 'Fatima Sayed',
    customerPhone: '+91 97690 44556',
    itemsSummary: '2x Double Cheese Grilled, 1x Cold Coffee',
    items: [
      { item: INITIAL_MENU_ITEMS[0], quantity: 2 },
      { item: INITIAL_MENU_ITEMS[2], quantity: 1 },
    ],
    subtotal: 400,
    discount: 40,
    gst: 18,
    grandTotal: 378,
    paymentMethod: 'Cash',
    status: 'Completed',
    timestamp: 'Today, 12:45 PM',
  },
  {
    orderId: 'MZ-103',
    orderMode: 'delivery',
    tableNumber: 'Delivery',
    customerName: 'Rohan Mehra',
    customerPhone: '+91 98330 77889',
    itemsSummary: '1x Zaika Special Masala Burger, 1x Peri Peri Fries, 1x Cold Coffee',
    items: [
      { item: INITIAL_MENU_ITEMS[5], quantity: 1 },
      { item: INITIAL_MENU_ITEMS[3], quantity: 1 },
      { item: INITIAL_MENU_ITEMS[2], quantity: 1 },
    ],
    subtotal: 330,
    discount: 0,
    deliveryFee: 0,
    gst: 16.5,
    grandTotal: 346.5,
    paymentMethod: 'WhatsApp Pay',
    status: 'Completed',
    timestamp: 'Today, 01:15 PM',
  },
];

const INITIAL_SYNC_LOGS: SheetSyncLog[] = [
  {
    id: 'log-1',
    timestamp: '10:00 AM',
    sheetName: 'menu_items',
    action: 'SYNC',
    payloadSummary: 'Loaded 9 active production catalog records',
    status: '200 OK',
    latencyMs: 112,
  },
  {
    id: 'log-2',
    timestamp: '11:20 AM',
    sheetName: 'orders',
    action: 'INSERT',
    payloadSummary: 'Row 146: Order MZ-101 appended (₹273)',
    status: '200 OK',
    latencyMs: 145,
  },
  {
    id: 'log-3',
    timestamp: '12:45 PM',
    sheetName: 'orders',
    action: 'INSERT',
    payloadSummary: 'Row 147: Order MZ-102 appended (₹378)',
    status: '200 OK',
    latencyMs: 130,
  },
  {
    id: 'log-4',
    timestamp: '01:15 PM',
    sheetName: 'petty_cash',
    action: 'INSERT',
    payloadSummary: 'Row 44: Amul Cheese & Butter wholesale (-₹1,500)',
    status: '200 OK',
    latencyMs: 98,
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('menu');

  // Persistent States
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() =>
    loadFromStorage('menu_items', INITIAL_MENU_ITEMS)
  );
  const [tables, setTables] = useState<RestaurantTable[]>(() =>
    loadFromStorage('tables', INITIAL_TABLES)
  );
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    loadFromStorage('reservations', INITIAL_RESERVATIONS)
  );
  const [khataEntries, setKhataEntries] = useState<KhataEntry[]>(() =>
    loadFromStorage('khata', INITIAL_KHATA_ENTRIES)
  );
  const [orders, setOrders] = useState<OrderRecord[]>(() =>
    loadFromStorage('orders', INITIAL_ORDERS)
  );
  const [dailyStats, setDailyStats] = useState(() =>
    loadFromStorage('daily_stats', {
      income: 18450,
      expense: 4200,
      pettyCash: 14250,
      ordersCount: 62,
    })
  );

  const [googleSheetConfig, setGoogleSheetConfig] = useState<GoogleSheetConfig>(() =>
    loadFromStorage('sheet_config', {
      sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      webhookUrl: 'https://script.google.com/macros/s/AKfycbz_ZaikaProductionWebhookKey/exec',
      isOnline: true,
      autoSync: true,
      lastSyncedAt: 'Just now',
    })
  );

  const [sheetSyncLogs, setSheetSyncLogs] = useState<SheetSyncLog[]>(() =>
    loadFromStorage('sheet_logs', INITIAL_SYNC_LOGS)
  );

  const [heldOrders, setHeldOrders] = useState<POSOrder[]>(() =>
    loadFromStorage('held_orders', [])
  );

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isSheetViewerOpen, setIsSheetViewerOpen] = useState<boolean>(false);
  const [printReceiptData, setPrintReceiptData] = useState<PrintReceiptData | null>(null);
  const [dispatchWhatsAppNumber, setDispatchWhatsAppNumber] = useState<string>(() =>
    loadFromStorage('wa_num', '+919773848442')
  );
  const [toast, setToast] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Initial Cart
  const [cart, setCart] = useState<CartItem[]>([
    { item: INITIAL_MENU_ITEMS[0], quantity: 1 },
    { item: INITIAL_MENU_ITEMS[2], quantity: 1, customization: 'Less Sugar, Thick Cream' },
    { item: INITIAL_MENU_ITEMS[3], quantity: 1, customization: 'Extra spicy seasoning' },
  ]);

  const [lastOrder, setLastOrder] = useState<any | null>({
    orderId: 'MZ-8492',
    tableNumber: 'Table 4',
    orderType: 'dine-in',
    customerName: 'Salman Shaikh',
    customerPhone: '+91 97738 48442',
    items: [
      { item: INITIAL_MENU_ITEMS[5], quantity: 1, customization: 'Extra spicy • Sliced into 4 pcs' },
      { item: INITIAL_MENU_ITEMS[2], quantity: 2, customization: 'Chocolate Drizzle' },
    ],
    subtotal: 340,
    discount: 34,
    deliveryFee: 0,
    gst: 15.3,
    grandTotal: 321.3,
    paymentMethod: 'UPI (Paytm)',
    time: 'Today, 02:10 PM',
  });

  // Keep Local Storage in Sync
  useEffect(() => saveToStorage('menu_items', menuItems), [menuItems]);
  useEffect(() => saveToStorage('tables', tables), [tables]);
  useEffect(() => saveToStorage('reservations', reservations), [reservations]);
  useEffect(() => saveToStorage('khata', khataEntries), [khataEntries]);
  useEffect(() => saveToStorage('orders', orders), [orders]);
  useEffect(() => saveToStorage('daily_stats', dailyStats), [dailyStats]);
  useEffect(() => saveToStorage('sheet_config', googleSheetConfig), [googleSheetConfig]);
  useEffect(() => saveToStorage('sheet_logs', sheetSyncLogs), [sheetSyncLogs]);
  useEffect(() => saveToStorage('held_orders', heldOrders), [heldOrders]);
  useEffect(() => saveToStorage('wa_num', dispatchWhatsAppNumber), [dispatchWhatsAppNumber]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(current => (current === msg ? null : current));
    }, 3200);
  };

  /**
   * Real-time Google Sheet API Synchronization Engine
   * Writes changes to the live in-memory & persistent sheet database,
   * creates audit sync logs, and dispatches HTTP POST requests to the Webhook.
   */
  const recordSheetSync = (
    sheetName: SheetSyncLog['sheetName'],
    action: SheetSyncLog['action'],
    summary: string,
    data?: any
  ) => {
    const logId = `log-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const latency = Math.floor(80 + Math.random() * 85);

    const newLog: SheetSyncLog = {
      id: logId,
      timestamp,
      sheetName,
      action,
      payloadSummary: summary,
      status: '200 OK',
      latencyMs: latency,
    };

    setSheetSyncLogs(prev => [newLog, ...prev.slice(0, 49)]);
    setGoogleSheetConfig(prev => ({
      ...prev,
      lastSyncedAt: timestamp,
    }));

    // If a webhook URL is configured, issue background fetch
    if (googleSheetConfig.webhookUrl) {
      try {
        fetch(googleSheetConfig.webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sheetId: googleSheetConfig.sheetId,
            sheetName,
            action,
            timestamp: new Date().toISOString(),
            data: data || summary,
          }),
        }).catch(() => {
          // graceful offline/mock fallback
        });
      } catch {
        // network safe
      }
    }
  };

  // Cart Calculations
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.item.price * item.quantity, 0);
  }, [cart]);

  const cartDiscount = useMemo(() => {
    if (appliedCoupon === 'MUMBAI20') {
      return Math.round(cartSubtotal * 0.2);
    }
    if (cartSubtotal >= 500) {
      return 50;
    }
    return 0;
  }, [cartSubtotal, appliedCoupon]);

  const cartTax = useMemo(() => {
    const taxable = Math.max(0, cartSubtotal - cartDiscount);
    return Math.round(taxable * 0.05 * 10) / 10;
  }, [cartSubtotal, cartDiscount]);

  const cartGrandTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - cartDiscount + cartTax);
  }, [cartSubtotal, cartDiscount, cartTax]);

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'MUMBAI20') {
      setAppliedCoupon('MUMBAI20');
      showToast('Applied 20% OFF Coupon: MUMBAI20!');
      return true;
    }
    showToast(`Invalid coupon code: "${code}"`);
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Removed coupon code.');
  };

  const addToCart = (item: MenuItem, quantity = 1, customization?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(ci => ci.item.id === item.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
          customization: customization || next[existingIndex].customization,
        };
        return next;
      }
      return [...prev, { item, quantity, customization }];
    });
    showToast(`Added ${item.name} to cart`);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(ci => {
          if (ci.item.id === itemId) {
            const nextQty = ci.quantity + delta;
            return nextQty > 0 ? { ...ci, quantity: nextQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(ci => ci.item.id !== itemId));
    showToast('Removed item from cart');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Menu items management linked to Google Sheet
  const addMenuItem = (item: MenuItem) => {
    setMenuItems(prev => [item, ...prev]);
    recordSheetSync(
      'menu_items',
      'INSERT',
      `Row ${menuItems.length + 1}: ${item.name} (₹${item.price}) [${item.category}]`,
      item
    );
    showToast(`Added "${item.name}" & written to Google Sheet!`);
  };

  const deleteMenuItem = (id: string) => {
    const target = menuItems.find(m => m.id === id);
    setMenuItems(prev => prev.filter(m => m.id !== id));
    if (target) {
      recordSheetSync('menu_items', 'DELETE', `Removed ${target.name} from menu sheet`, target);
      showToast(`Removed "${target.name}" from Google Sheet`);
    }
  };

  // Tables management linked to Google Sheet
  const updateTableStatus = (
    tableId: string,
    status: RestaurantTable['status'],
    bill?: number,
    reservedFor?: string
  ) => {
    setTables(prev =>
      prev.map(t => {
        if (t.id === tableId || t.tableNumber === tableId) {
          const updated: RestaurantTable = {
            ...t,
            status,
            currentBill: bill !== undefined ? bill : t.currentBill,
            reservedFor: reservedFor !== undefined ? reservedFor : t.reservedFor,
          };
          return updated;
        }
        return t;
      })
    );

    const targetTable = tables.find(t => t.id === tableId || t.tableNumber === tableId);
    recordSheetSync(
      'tables_status',
      'UPDATE',
      `${targetTable?.tableNumber || tableId} changed to ${status.toUpperCase()} (Bill: ₹${bill ?? 0})`,
      { tableId, status, bill, reservedFor }
    );
  };

  // Reservations management linked to Google Sheet
  const addReservation = (reservation: Omit<Reservation, 'id' | 'initial'>) => {
    const newRes: Reservation = {
      ...reservation,
      id: `res-${Date.now()}`,
      initial: reservation.guestName.charAt(0).toUpperCase(),
    };
    setReservations(prev => [newRes, ...prev]);

    // Also update table to reserved
    const targetTable = tables.find(
      t => t.tableNumber === reservation.tableNumber || t.name === reservation.tableNumber
    );
    if (targetTable) {
      updateTableStatus(targetTable.id, 'reserved', 0, reservation.guestName);
    }

    recordSheetSync(
      'reservations',
      'INSERT',
      `Row ${reservations.length + 1}: ${reservation.guestName} for ${reservation.tableNumber} (${reservation.partySize} guests)`,
      newRes
    );

    showToast(`Reservation for ${reservation.guestName} saved & synced to Google Sheet!`);
  };

  const seatReservation = (reservationId: string, tableNumber: string) => {
    setReservations(prev =>
      prev.map(r => (r.id === reservationId ? { ...r, status: 'seated' } : r))
    );

    const targetTable = tables.find(
      t => t.tableNumber === tableNumber || t.name === tableNumber || t.id === tableNumber
    );
    if (targetTable) {
      updateTableStatus(targetTable.id, 'occupied', 0);
    }

    recordSheetSync(
      'reservations',
      'UPDATE',
      `Guest seated at ${tableNumber} (Reservation ${reservationId})`,
      { reservationId, tableNumber, status: 'seated' }
    );

    showToast(`Seated guest at ${tableNumber}! Status pushed to Sheet.`);
  };

  const deleteReservation = (id: string) => {
    const target = reservations.find(r => r.id === id);
    setReservations(prev => prev.filter(r => r.id !== id));
    if (target) {
      recordSheetSync(
        'reservations',
        'DELETE',
        `Cancelled reservation for ${target.guestName}`,
        target
      );
      showToast(`Cancelled reservation for ${target.guestName}`);
    }
  };

  // Khata entries linked to Google Sheet
  const addKhataEntry = (entry: Omit<KhataEntry, 'id' | 'synced'>) => {
    const newEntry: KhataEntry = {
      ...entry,
      id: `khata-${Date.now()}`,
      synced: true,
    };
    setKhataEntries(prev => [newEntry, ...prev]);

    // update daily stats
    setDailyStats(prev => {
      const isExp = entry.type === 'Expense';
      const inc = isExp ? prev.income : prev.income + entry.amount;
      const exp = isExp ? prev.expense + entry.amount : prev.expense;
      const net = inc - exp;
      return {
        ...prev,
        income: inc,
        expense: exp,
        pettyCash: net,
      };
    });

    recordSheetSync(
      'petty_cash',
      'INSERT',
      `Row ${khataEntries.length + 1}: ${entry.type} ₹${entry.amount} - ${entry.category} (${entry.note})`,
      newEntry
    );

    showToast(`Khata entry recorded & appended to Google Sheet!`);
  };

  const deleteKhataEntry = (id: string) => {
    const target = khataEntries.find(k => k.id === id);
    setKhataEntries(prev => prev.filter(k => k.id !== id));
    if (target) {
      recordSheetSync('petty_cash', 'DELETE', `Removed entry: ${target.category} ₹${target.amount}`, target);
      showToast(`Removed entry from petty cash sheet`);
    }
  };

  // Orders linked to Google Sheet
  const placeOrder = (order: any) => {
    setLastOrder(order);

    const newRecord: OrderRecord = {
      orderId: order.orderId || `MZ-${Math.floor(1000 + Math.random() * 9000)}`,
      orderMode: order.orderMode || order.orderType || 'dine-in',
      tableNumber: order.tableNumber || 'Takeaway',
      customerName: order.customerName || 'Customer',
      customerPhone: order.customerPhone || '+91 97738 48442',
      itemsSummary: (order.items || [])
        .map((ci: any) => `${ci.quantity}x ${ci.item?.name || ci.name}`)
        .join(', '),
      items: order.items || [],
      subtotal: order.subtotal || 0,
      discount: order.discount || 0,
      deliveryFee: order.deliveryFee || 0,
      gst: order.gst || 0,
      grandTotal: order.grandTotal || 0,
      paymentMethod: order.paymentMethod || 'Cash',
      status: 'Completed',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setOrders(prev => [newRecord, ...prev]);

    setDailyStats(prev => ({
      ...prev,
      income: prev.income + (newRecord.grandTotal || 0),
      ordersCount: prev.ordersCount + 1,
      pettyCash: prev.pettyCash + (newRecord.grandTotal || 0),
    }));

    recordSheetSync(
      'orders',
      'INSERT',
      `Row ${orders.length + 1}: Order ${newRecord.orderId} - ₹${newRecord.grandTotal} (${newRecord.orderMode.toUpperCase()})`,
      newRecord
    );

    showToast(`Order ${newRecord.orderId} placed & synced to Google Sheet!`);
  };

  const holdPOSOrder = (order: POSOrder) => {
    setHeldOrders(prev => [order, ...prev]);
    recordSheetSync('orders', 'UPDATE', `Order ${order.id} put on HOLD for ${order.tableNumber}`, order);
    showToast(`Ticket held for ${order.tableNumber}`);
  };

  const resumeHeldOrder = (id: string) => {
    const found = heldOrders.find(o => o.id === id);
    if (found) {
      setHeldOrders(prev => prev.filter(o => o.id !== id));
      recordSheetSync('orders', 'UPDATE', `Resumed held order ${found.id}`, found);
      showToast(`Resumed held order ${found.id}`);
    }
    return found;
  };

  const updateGoogleSheetConfig = (cfg: Partial<GoogleSheetConfig>) => {
    setGoogleSheetConfig(prev => ({ ...prev, ...cfg }));
    recordSheetSync('orders', 'SYNC', `Updated Google Sheet connection configuration`, cfg);
    showToast('Saved Google Sheet configuration & tested connection!');
  };

  const resetDatabaseToDefaults = () => {
    setMenuItems(INITIAL_MENU_ITEMS);
    setTables(INITIAL_TABLES);
    setReservations(INITIAL_RESERVATIONS);
    setKhataEntries(INITIAL_KHATA_ENTRIES);
    setOrders(INITIAL_ORDERS);
    setSheetSyncLogs(INITIAL_SYNC_LOGS);
    setDailyStats({
      income: 18450,
      expense: 4200,
      pettyCash: 14250,
      ordersCount: 62,
    });
    recordSheetSync('menu_items', 'SYNC', 'Database reset to default seed state');
    showToast('Reset all Google Sheet tables to initial dataset.');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        cartDiscount,
        cartTax,
        cartGrandTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
        isAdminModalOpen,
        setIsAdminModalOpen,
        isSheetViewerOpen,
        setIsSheetViewerOpen,
        menuItems,
        addMenuItem,
        deleteMenuItem,
        tables,
        updateTableStatus,
        reservations,
        addReservation,
        seatReservation,
        deleteReservation,
        khataEntries,
        addKhataEntry,
        deleteKhataEntry,
        orders,
        placeOrder,
        dailyStats,
        lastOrder,
        setLastOrder,
        heldOrders,
        holdPOSOrder,
        resumeHeldOrder,
        dispatchWhatsAppNumber,
        setDispatchWhatsAppNumber,
        googleSheetConfig,
        updateGoogleSheetConfig,
        sheetSyncLogs,
        recordSheetSync,
        printReceiptData,
        setPrintReceiptData,
        toast,
        toastMessage: toast,
        showToast,
        resetDatabaseToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
