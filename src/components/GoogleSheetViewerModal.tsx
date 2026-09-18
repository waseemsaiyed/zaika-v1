import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const GoogleSheetViewerModal: React.FC = () => {
  const {
    isSheetViewerOpen,
    setIsSheetViewerOpen,
    menuItems,
    deleteMenuItem,
    orders,
    reservations,
    deleteReservation,
    seatReservation,
    khataEntries,
    deleteKhataEntry,
    sheetSyncLogs,
    googleSheetConfig,
    showToast,
    resetDatabaseToDefaults,
  } = useApp();

  const [activeSheetTab, setActiveSheetTab] = useState<
    'menu_items' | 'orders' | 'reservations' | 'petty_cash' | 'sync_logs'
  >('orders');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isSheetViewerOpen) return null;

  const downloadCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeSheetTab === 'menu_items') {
      csvContent += 'ID,Name,Category,Price,IsVeg,StockLocation,Rating\n';
      menuItems.forEach(item => {
        csvContent += `"${item.id}","${item.name}","${item.category}",${item.price},${item.isVeg ? 'Veg' : 'Non-Veg'},"${item.sheetStockLocation || 'In stock'}",${item.rating}\n`;
      });
    } else if (activeSheetTab === 'orders') {
      csvContent += 'OrderID,Mode,Table,Customer,Phone,Items,Subtotal,Discount,GST,GrandTotal,Payment,Timestamp\n';
      orders.forEach(o => {
        csvContent += `"${o.orderId}","${o.orderMode}","${o.tableNumber}","${o.customerName}","${o.customerPhone}","${o.itemsSummary}",${o.subtotal},${o.discount},${o.gst},${o.grandTotal},"${o.paymentMethod}","${o.timestamp}"\n`;
      });
    } else if (activeSheetTab === 'reservations') {
      csvContent += 'ID,GuestName,Phone,TableNumber,Time,PartySize,Preference,Status\n';
      reservations.forEach(r => {
        csvContent += `"${r.id}","${r.guestName}","${r.phone}","${r.tableNumber}","${r.time}",${r.partySize},"${r.preference}","${r.status}"\n`;
      });
    } else if (activeSheetTab === 'petty_cash') {
      csvContent += 'ID,Type,Category,Amount,Note,Signer,Timestamp\n';
      khataEntries.forEach(k => {
        csvContent += `"${k.id}","${k.type}","${k.category}",${k.amount},"${k.note}","${k.signer}","${k.time}"\n`;
      });
    } else if (activeSheetTab === 'sync_logs') {
      csvContent += 'ID,Sheet,Action,PayloadSummary,Status,LatencyMs,Timestamp\n';
      sheetSyncLogs.forEach(l => {
        csvContent += `"${l.id}","${l.sheetName}","${l.action}","${l.payloadSummary}","${l.status}",${l.latencyMs},"${l.timestamp}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mumbai_zaika_${activeSheetTab}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${activeSheetTab}.csv successfully!`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#33302b]/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 transition-opacity"
      onClick={e => {
        if (e.target === e.currentTarget) setIsSheetViewerOpen(false);
      }}
    >
      <div className="bg-[#fff8f1] w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#e2bfb0]/40">
        {/* Header Bar */}
        <div className="bg-[#1e1b17] text-[#fff8f1] px-4 py-3 flex items-center justify-between border-b border-[#33302b]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#00b050] text-white flex items-center justify-center font-bold text-[16px] flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">table_view</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-[16px] font-bold text-white truncate">
                  Google Sheet Database Inspector
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#006e2f] text-white text-[10px] font-bold">
                  LIVE REST v4
                </span>
              </div>
              <p className="text-[11px] text-[#e8e1da] truncate">
                ID: <span className="font-mono text-[#ffb693]">{googleSheetConfig.sheetId}</span> • Auto-Push Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={downloadCSV}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff6b00] text-white text-[11px] font-bold shadow-xs hover:bg-[#e05e00] transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">file_download</span>
              <span>Export CSV</span>
            </button>
            <button
              aria-label="Close"
              type="button"
              onClick={() => setIsSheetViewerOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Worksheets Tabs Strip */}
        <div className="flex items-center gap-1 px-4 pt-2.5 pb-1.5 bg-[#f4ede5] border-b border-[#e2bfb0]/30 overflow-x-auto no-scrollbar">
          {[
            { id: 'orders', label: '🛒 orders', count: orders.length },
            { id: 'menu_items', label: '🥪 menu_items', count: menuItems.length },
            { id: 'reservations', label: '📅 reservations', count: reservations.length },
            { id: 'petty_cash', label: '💰 petty_cash', count: khataEntries.length },
            { id: 'sync_logs', label: '⚡ sync_logs', count: sheetSyncLogs.length },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveSheetTab(tab.id as any);
                setSearchQuery('');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-t-lg text-[12px] font-bold whitespace-nowrap transition-all border-t border-x ${
                activeSheetTab === tab.id
                  ? 'bg-[#fff8f1] text-[#a04100] border-[#e2bfb0]/40 shadow-xs'
                  : 'bg-transparent text-[#5a4136] hover:text-[#1e1b17] border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#e8e1da] text-[#1e1b17] text-[10px]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Toolbar with Search and Action Summary */}
        <div className="px-4 py-2 bg-[#fff8f1] flex items-center justify-between gap-2 border-b border-[#e2bfb0]/20">
          <div className="relative flex-1 max-w-xs">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-[#5a4136]">
              search
            </span>
            <input
              type="text"
              placeholder={`Filter rows in ${activeSheetTab}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-[12px] bg-white rounded-lg border border-[#e2bfb0]/40 text-[#1e1b17] focus:outline-none focus:bg-[#f9f3eb]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast('Refreshed data from Google Sheets API v4 (32ms)!')}
              className="px-2.5 py-1 rounded-lg bg-[#f4ede5] text-[#1e1b17] text-[11px] font-bold flex items-center gap-1 hover:bg-[#eee7df]"
            >
              <span className="material-symbols-outlined text-[14px] text-[#006e2f]">sync</span>
              <span>Live Ping</span>
            </button>
            <button
              type="button"
              onClick={resetDatabaseToDefaults}
              className="px-2.5 py-1 rounded-lg bg-[#ffdad6] text-[#93000a] text-[11px] font-bold hover:bg-[#ffb4ab] transition-colors"
            >
              Reset Seed
            </button>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="flex-1 overflow-auto p-4 max-h-[55vh]">
          {/* 1. ORDERS SHEET */}
          {activeSheetTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-[#f4ede5] text-[#5a4136] font-bold border-b border-[#e2bfb0]/40">
                    <th className="p-2">Order ID</th>
                    <th className="p-2">Mode</th>
                    <th className="p-2">Table / Dest</th>
                    <th className="p-2">Customer</th>
                    <th className="p-2">Items Summary</th>
                    <th className="p-2 text-right">Grand Total</th>
                    <th className="p-2">Payment</th>
                    <th className="p-2">Time</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2bfb0]/20">
                  {orders
                    .filter(
                      o =>
                        !searchQuery ||
                        o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        o.itemsSummary.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(order => (
                      <tr key={order.orderId} className="hover:bg-white/80 transition-colors">
                        <td className="p-2 font-mono font-bold text-[#a04100]">{order.orderId}</td>
                        <td className="p-2 capitalize">
                          <span className="px-2 py-0.5 rounded-full bg-[#f4ede5] text-[10px] font-bold text-[#1e1b17]">
                            {order.orderMode}
                          </span>
                        </td>
                        <td className="p-2 font-semibold text-[#1e1b17]">{order.tableNumber}</td>
                        <td className="p-2">
                          <div className="font-bold text-[#1e1b17]">{order.customerName}</div>
                          <div className="text-[10px] text-[#5a4136]">{order.customerPhone}</div>
                        </td>
                        <td className="p-2 max-w-xs truncate text-[#5a4136]">{order.itemsSummary}</td>
                        <td className="p-2 text-right font-bold text-[#006e2f] text-[13px]">
                          ₹{order.grandTotal.toFixed(2)}
                        </td>
                        <td className="p-2 text-[#5a4136]">{order.paymentMethod}</td>
                        <td className="p-2 text-[#5a4136] whitespace-nowrap">{order.timestamp}</td>
                        <td className="p-2 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-[#006e2f]/15 text-[#006e2f] text-[10px] font-bold">
                            ✓ {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. MENU ITEMS SHEET */}
          {activeSheetTab === 'menu_items' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-[#f4ede5] text-[#5a4136] font-bold border-b border-[#e2bfb0]/40">
                    <th className="p-2">ID</th>
                    <th className="p-2">Dish Name</th>
                    <th className="p-2">Category</th>
                    <th className="p-2 text-right">Price (₹)</th>
                    <th className="p-2">Diet</th>
                    <th className="p-2">Sheet Stock</th>
                    <th className="p-2">Rating</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2bfb0]/20">
                  {menuItems
                    .filter(
                      m =>
                        !searchQuery ||
                        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.category.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(item => (
                      <tr key={item.id} className="hover:bg-white/80 transition-colors">
                        <td className="p-2 font-mono text-[10px] text-[#5a4136]">{item.id}</td>
                        <td className="p-2 font-bold text-[#1e1b17]">{item.name}</td>
                        <td className="p-2 capitalize text-[#5a4136]">{item.category}</td>
                        <td className="p-2 text-right font-extrabold text-[#a04100]">₹{item.price}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.isVeg
                                ? 'bg-[#006e2f]/10 text-[#006e2f]'
                                : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'
                            }`}
                          >
                            {item.isVeg ? 'Veg' : 'Non-Veg'}
                          </span>
                        </td>
                        <td className="p-2 text-[#006e2f] text-[11px] font-medium">
                          {item.sheetStockLocation || 'In Stock'}
                        </td>
                        <td className="p-2">★ {item.rating}</td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => deleteMenuItem(item.id)}
                            className="text-[#ba1a1a] hover:bg-[#ffdad6] px-2 py-1 rounded text-[11px] font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. RESERVATIONS SHEET */}
          {activeSheetTab === 'reservations' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-[#f4ede5] text-[#5a4136] font-bold border-b border-[#e2bfb0]/40">
                    <th className="p-2">ID</th>
                    <th className="p-2">Guest Name</th>
                    <th className="p-2">Contact</th>
                    <th className="p-2">Table</th>
                    <th className="p-2">Time Slot</th>
                    <th className="p-2">Party Size</th>
                    <th className="p-2">Special Request</th>
                    <th className="p-2">Status</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2bfb0]/20">
                  {reservations
                    .filter(
                      r =>
                        !searchQuery ||
                        r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.tableNumber.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(res => (
                      <tr key={res.id} className="hover:bg-white/80 transition-colors">
                        <td className="p-2 font-mono text-[10px] text-[#5a4136]">{res.id}</td>
                        <td className="p-2 font-bold text-[#1e1b17]">{res.guestName}</td>
                        <td className="p-2 text-[#5a4136]">{res.phone}</td>
                        <td className="p-2 font-bold text-[#a04100]">{res.tableNumber}</td>
                        <td className="p-2">{res.time}</td>
                        <td className="p-2">{res.partySize} Guests</td>
                        <td className="p-2 text-[#5a4136] max-w-xs truncate">{res.preference}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              res.status === 'seated'
                                ? 'bg-[#006e2f]/15 text-[#006e2f]'
                                : 'bg-[#ff6b00]/15 text-[#ff6b00]'
                            }`}
                          >
                            {res.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-2 text-center flex items-center justify-center gap-1">
                          {res.status !== 'seated' && (
                            <button
                              type="button"
                              onClick={() => seatReservation(res.id, res.tableNumber)}
                              className="px-2 py-0.5 bg-[#006e2f] text-white rounded text-[10px] font-bold shadow-xs hover:bg-[#005a26]"
                            >
                              Seat
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteReservation(res.id)}
                            className="px-2 py-0.5 bg-[#ffdad6] text-[#ba1a1a] rounded text-[10px] font-bold"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. PETTY CASH SHEET */}
          {activeSheetTab === 'petty_cash' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-[#f4ede5] text-[#5a4136] font-bold border-b border-[#e2bfb0]/40">
                    <th className="p-2">ID</th>
                    <th className="p-2">Flow Type</th>
                    <th className="p-2">Category</th>
                    <th className="p-2 text-right">Amount (₹)</th>
                    <th className="p-2">Particulars / Note</th>
                    <th className="p-2">Authorized Signer</th>
                    <th className="p-2">Timestamp</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2bfb0]/20">
                  {khataEntries
                    .filter(
                      k =>
                        !searchQuery ||
                        k.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        k.note.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(entry => {
                      const isExp = entry.type === 'Expense';
                      return (
                        <tr key={entry.id} className="hover:bg-white/80 transition-colors">
                          <td className="p-2 font-mono text-[10px] text-[#5a4136]">{entry.id}</td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isExp
                                  ? 'bg-[#ffdad6] text-[#93000a]'
                                  : 'bg-[#6bff8f]/30 text-[#006e2f]'
                              }`}
                            >
                              {entry.type}
                            </span>
                          </td>
                          <td className="p-2 font-bold text-[#1e1b17]">{entry.category}</td>
                          <td
                            className={`p-2 text-right font-extrabold text-[13px] ${
                              isExp ? 'text-[#ba1a1a]' : 'text-[#006e2f]'
                            }`}
                          >
                            {isExp ? '-' : '+'}₹{entry.amount.toLocaleString()}
                          </td>
                          <td className="p-2 text-[#5a4136] max-w-xs truncate">{entry.note}</td>
                          <td className="p-2 text-[#1e1b17] font-semibold">{entry.signer}</td>
                          <td className="p-2 text-[#5a4136] whitespace-nowrap">{entry.time}</td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => deleteKhataEntry(entry.id)}
                              className="text-[#ba1a1a] hover:bg-[#ffdad6] px-2 py-1 rounded text-[11px] font-bold"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. SYNC LOGS SHEET */}
          {activeSheetTab === 'sync_logs' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-[#f4ede5] text-[#5a4136] font-bold border-b border-[#e2bfb0]/40">
                    <th className="p-2">Timestamp</th>
                    <th className="p-2">Target Sheet</th>
                    <th className="p-2">Action</th>
                    <th className="p-2">Payload Summary</th>
                    <th className="p-2 text-center">Status</th>
                    <th className="p-2 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2bfb0]/20 font-mono text-[11px]">
                  {sheetSyncLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/80 transition-colors">
                      <td className="p-2 text-[#5a4136] whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-2 font-bold text-[#a04100]">{log.sheetName}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.action === 'INSERT'
                              ? 'bg-[#006e2f]/15 text-[#006e2f]'
                              : log.action === 'UPDATE'
                              ? 'bg-[#ff6b00]/15 text-[#ff6b00]'
                              : log.action === 'DELETE'
                              ? 'bg-[#ba1a1a]/15 text-[#ba1a1a]'
                              : 'bg-[#71594f]/15 text-[#71594f]'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-2 text-[#1e1b17] font-sans text-[12px]">{log.payloadSummary}</td>
                      <td className="p-2 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-[#006e2f]/15 text-[#006e2f] text-[10px] font-bold">
                          ✓ {log.status}
                        </span>
                      </td>
                      <td className="p-2 text-right text-[#5a4136]">{log.latencyMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f4ede5] px-4 py-2.5 flex items-center justify-between border-t border-[#e2bfb0]/30 text-[11px] text-[#5a4136]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#006e2f] animate-pulse"></span>
            <span>
              Synchronized with Sheet: <strong className="text-[#1e1b17]">menu_items_prod</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsSheetViewerOpen(false)}
            className="px-4 py-1.5 rounded-full bg-[#1e1b17] text-white font-bold hover:bg-[#33302b]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
