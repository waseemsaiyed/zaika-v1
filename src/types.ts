export type TabType = 'home' | 'menu' | 'pos' | 'tables' | 'admin' | 'success' | 'order-success';

export interface MenuItem {
  id: string;
  name: string;
  category: 'sandwiches' | 'burgers' | 'pizza' | 'coffee' | 'wraps' | 'fries' | 'desserts' | 'combos';
  price: number;
  description: string;
  image: string;
  rating: number;
  reviewsCount?: number;
  isVeg: boolean;
  isBestseller?: boolean;
  tag?: string;
  sheetStockLocation?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  customization?: string;
}

export type TableStatus = 'available' | 'reserved' | 'occupied';

export interface RestaurantTable {
  id: string;
  tableNumber: string; // e.g. T-1
  name: string; // e.g. Table 1
  seats: number;
  description: string;
  status: TableStatus;
  currentBill?: number;
  occupiedDuration?: string;
  reservedFor?: string;
  reservationTime?: string;
  isTopPick?: boolean;
  currentItems?: string;
}

export interface Reservation {
  id: string;
  guestName: string;
  phone: string;
  tableNumber: string;
  time: string;
  partySize: number;
  preference: string;
  status: 'confirmed' | 'seated' | 'pending';
  initial: string;
}

export interface KhataEntry {
  id: string;
  type: 'Expense' | 'Income';
  category: string;
  amount: number;
  note: string;
  time: string;
  signer: string;
  synced: boolean;
  icon?: string;
}

export interface POSOrder {
  id: string;
  kotNumber: number;
  orderMode: 'dine-in' | 'takeaway' | 'delivery';
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  gst: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'upi' | 'card';
  status: 'completed' | 'hold' | 'pending';
  timestamp: string;
}

export interface SheetSyncLog {
  id: string;
  timestamp: string;
  sheetName: 'menu_items' | 'orders' | 'reservations' | 'petty_cash' | 'tables_status';
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'SYNC';
  payloadSummary: string;
  status: '200 OK' | 'SYNCING' | 'LOCAL_SAVED';
  latencyMs: number;
}

export interface PrintReceiptData {
  type: 'KOT' | 'Bill';
  orderId: string;
  tableNumber: string;
  orderMode: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  discount: number;
  gst: number;
  grandTotal: number;
  paymentMethod?: string;
  serverName?: string;
  time: string;
}
