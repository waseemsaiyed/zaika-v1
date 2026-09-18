import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RestaurantTable } from '../types';

export const TablesLayout: React.FC = () => {
  const {
    tables,
    updateTableStatus,
    reservations,
    addReservation,
    seatReservation,
    showToast,
    setPrintReceiptData,
    placeOrder,
    setIsSheetViewerOpen,
  } = useApp();

  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [drawerTab, setDrawerTab] = useState<'reserve' | 'order'>('reserve');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Reservation Form State
  const [guestName, setGuestName] = useState('Salman Shaikh');
  const [guestPhone, setGuestPhone] = useState('+91 97738 48442');
  const [dateTime, setDateTime] = useState('Today, 8:00 PM');
  const [partySize, setPartySize] = useState(4);
  const [specialRequest, setSpecialRequest] = useState('Near AC / Window seat');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCount = tables.filter(t => t.status === 'available').length;
  const reservedCount = tables.filter(t => t.status === 'reserved').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;

  const handleOpenTableDrawer = (table: RestaurantTable) => {
    setSelectedTable(table);
    if (table.status === 'occupied') {
      setDrawerTab('order');
    } else {
      setDrawerTab('reserve');
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleSaveReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !guestName) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addReservation({
        guestName,
        phone: guestPhone,
        tableNumber: selectedTable.tableNumber,
        time: dateTime,
        partySize,
        preference: specialRequest,
        status: 'pending',
      });
      setIsSubmitting(false);
      handleCloseDrawer();
    }, 500);
  };

  const handleFireKOT = () => {
    if (!selectedTable) return;
    const billAmt = selectedTable.currentBill ? selectedTable.currentBill + 150 : 370;
    updateTableStatus(selectedTable.id, 'occupied', billAmt);

    setPrintReceiptData({
      type: 'KOT',
      orderId: `KOT-${Math.floor(100 + Math.random() * 900)}`,
      tableNumber: selectedTable.name,
      orderMode: 'dine-in',
      items: [
        { name: 'Chicken Tikka Biryani', quantity: 1, price: 320 },
        { name: 'Masala Cutting Chai', quantity: 2, price: 25 },
      ],
      subtotal: billAmt,
      discount: 0,
      gst: Math.round(billAmt * 0.05 * 10) / 10,
      grandTotal: billAmt + Math.round(billAmt * 0.05 * 10) / 10,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    showToast(`KOT dispatched to Kitchen for ${selectedTable.name}!`);
    handleCloseDrawer();
  };

  const handleSettleBill = () => {
    if (!selectedTable) return;
    const bill = selectedTable.currentBill || 370;
    const gst = Math.round(bill * 0.05 * 10) / 10;
    const grand = bill + gst;

    placeOrder({
      orderId: `MZ-${Math.floor(1000 + Math.random() * 9000)}`,
      orderMode: 'dine-in',
      tableNumber: selectedTable.name,
      customerName: selectedTable.reservedFor || 'Dine-in Guest',
      customerPhone: '+91 97738 48442',
      items: [
        { item: { name: selectedTable.currentItems || 'Dine-in meal', price: bill }, quantity: 1 },
      ],
      subtotal: bill,
      discount: 0,
      gst,
      grandTotal: grand,
      paymentMethod: 'CASH',
    });

    updateTableStatus(selectedTable.id, 'available', 0, '');
    showToast(`Settled ₹${grand.toFixed(2)} for ${selectedTable.name} & table freed!`);
    handleCloseDrawer();
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-32">
      {/* Top Ambient Banner & Visual Atmosphere */}
      <div className="px-4 pt-3 pb-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006e2f] shadow-[0_0_10px_rgba(0,176,80,0.5)] animate-pulse"></span>
              <span className="text-[10px] font-bold text-[#006e2f] uppercase tracking-wider">
                Live Floor Activity
              </span>
            </div>
            <h1 className="font-headline-lg-mobile text-[24px] font-extrabold text-[#1e1b17]">
              Dine-In Floor Plan
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsSheetViewerOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#006e2f]/10 text-[#006e2f] border border-[#006e2f]/20 shadow-xs active:scale-95 text-[11px] font-bold hover:bg-[#006e2f]/20 transition"
              title="Inspect Reservations & Tables in Sheet"
            >
              <span className="material-symbols-outlined text-[15px]">table_view</span>
              <span>Sheet DB</span>
            </button>
            <div className="flex items-center gap-1 bg-[#eee7df] px-3 py-1.5 rounded-full shadow-xs">
              <span className="material-symbols-outlined text-[18px] text-[#5a4136]">table_bar</span>
              <span className="text-[12px] font-bold text-[#1e1b17]">8 Tables</span>
            </div>
          </div>
        </div>

        {/* Live Status Legend Bar */}
        <div className="grid grid-cols-3 gap-2 bg-[#f9f3eb] p-2 rounded-xl border border-[#e2bfb0]/30">
          <div className="flex items-center justify-center gap-2 py-2 px-1 bg-white rounded-lg shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-[#006e2f]"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#5a4136] leading-none">Available</span>
              <span className="font-headline-sm text-[16px] text-[#1e1b17] leading-tight font-extrabold">
                {availableCount}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 py-2 px-1 bg-white rounded-lg shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff6b00]"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#5a4136] leading-none">Reserved</span>
              <span className="font-headline-sm text-[16px] text-[#1e1b17] leading-tight font-extrabold">
                {reservedCount}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 py-2 px-1 bg-white rounded-lg shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#5a4136] leading-none">Occupied</span>
              <span className="font-headline-sm text-[16px] text-[#1e1b17] leading-tight font-extrabold">
                {occupiedCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 8-Table Grid */}
      <div className="px-4 flex flex-col gap-2 mt-1">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-[#5a4136]">
            Tap table to manage or take orders
          </span>
          <span className="text-[11px] text-[#ff6b00] flex items-center gap-1 font-bold">
            <span className="material-symbols-outlined text-[14px]">touch_app</span> Interactive
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3" id="table-grid">
          {tables.map(table => {
            const isFree = table.status === 'available';
            const isOcc = table.status === 'occupied';
            const isRes = table.status === 'reserved';

            return (
              <div
                key={table.id}
                onClick={() => handleOpenTableDrawer(table)}
                className={`bg-white p-3.5 rounded-xl flex flex-col justify-between shadow-xs cursor-pointer transition-all active:scale-[0.98] border border-[#e2bfb0]/25 relative overflow-hidden ${
                  table.isTopPick ? 'ring-2 ring-[#ff6b00]/30 shadow-md' : ''
                }`}
              >
                {table.isTopPick && (
                  <div className="absolute -right-6 -top-6 w-16 h-16 bg-[#ff6b00]/10 rounded-full pointer-events-none"></div>
                )}

                <div className="flex items-start justify-between relative">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline-sm text-[16px] text-[#1e1b17] font-bold">
                        {table.tableNumber}
                      </span>
                      {isFree && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#006e2f]/10 text-[#006e2f] font-bold">
                          Free
                        </span>
                      )}
                      {isOcc && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-bold">
                          Occupied
                        </span>
                      )}
                      {isRes && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#f9d9cc] text-[#755d53] font-bold">
                          Reserved
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[11px] font-semibold mt-0.5 ${
                        table.isTopPick ? 'text-[#ff6b00]' : 'text-[#5a4136]'
                      }`}
                    >
                      {table.description}
                    </p>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isFree
                        ? 'bg-[#f4ede5] text-[#5a4136]'
                        : isOcc
                        ? 'bg-[#ffdad6]/60 text-[#93000a]'
                        : 'bg-[#f9d9cc] text-[#755d53]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {table.seats >= 6 ? 'family_restroom' : 'group'}
                    </span>
                  </div>
                </div>

                {/* Status-specific Middle Snippet */}
                {isOcc && (
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-[#5a4136]">Active Bill:</span>
                    <span className="font-bold text-[#1e1b17] text-[14px]">
                      ₹{table.currentBill || 540}
                    </span>
                  </div>
                )}
                {isRes && (
                  <div className="mt-2 text-[#1e1b17]">
                    <p className="text-[12px] font-bold truncate">
                      {table.reservedFor || 'Reserved Guest'}
                    </p>
                    <p className="text-[10px] text-[#5a4136]">
                      Slot: {table.reservationTime || '8:30 PM'}
                    </p>
                  </div>
                )}
                {isFree && table.isTopPick && (
                  <div className="mt-1 text-[#5a4136] text-[10px]">
                    Prime central booth with AC airflow
                  </div>
                )}

                {/* Bottom Card Footer Strip */}
                <div className="mt-3 pt-2 bg-[#f9f3eb] -mx-3.5 -mb-3.5 p-2.5 rounded-b-xl flex items-center justify-between border-t border-[#e2bfb0]/20">
                  {isFree && (
                    <>
                      <span className="text-[10px] text-[#006e2f] font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>{' '}
                        {table.isTopPick ? 'Top Pick' : 'Ready'}
                      </span>
                      <button
                        className="px-3 py-1 bg-[#ff6b00] text-white text-[10px] font-bold rounded-full shadow-xs"
                        type="button"
                      >
                        Book
                      </button>
                    </>
                  )}
                  {isOcc && (
                    <>
                      <span className="text-[10px] text-[#5a4136] flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">timer</span>{' '}
                        {table.occupiedDuration || '25m'}
                      </span>
                      <button
                        className="px-2.5 py-1 bg-[#71594f] text-white text-[10px] font-bold rounded-full"
                        type="button"
                      >
                        View Order
                      </button>
                    </>
                  )}
                  {isRes && (
                    <>
                      <span className="text-[10px] text-[#ff6b00] font-bold">Incoming</span>
                      <button
                        className="px-2.5 py-1 bg-[#006e2f] text-white text-[10px] font-bold rounded-full shadow-xs"
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          updateTableStatus(table.id, 'occupied', 0);
                          showToast(`Checked in ${table.reservedFor} to ${table.name}!`);
                        }}
                      >
                        Check-in
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Reservations Today Section */}
      <div className="px-4 mt-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff6b00] text-[20px]">
              event_upcoming
            </span>
            <h2 className="font-headline-sm text-[16px] font-bold text-[#1e1b17]">
              Upcoming Reservations
            </h2>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#eee7df] text-[#5a4136]">
            Today
          </span>
        </div>

        {/* Reservation Queue Cards */}
        <div className="flex flex-col gap-2.5">
          {reservations.map(res => (
            <div
              key={res.id}
              className="bg-white p-3 rounded-xl shadow-xs border border-[#e2bfb0]/25 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#ffdbcc] flex items-center justify-center text-[#351000] font-bold text-[15px] flex-shrink-0">
                  {res.initial}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-[#1e1b17] truncate">
                      {res.guestName}
                    </span>
                    <span className="px-1.5 py-0.2 bg-[#f9d9cc] text-[#755d53] text-[9px] font-bold rounded">
                      {res.tableNumber}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5a4136]">
                    {res.time} • {res.partySize} Guests • {res.preference}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <a
                  aria-label={`Call ${res.guestName}`}
                  className="w-8 h-8 rounded-full bg-[#f9f3eb] flex items-center justify-center text-[#ff6b00] hover:bg-[#eee7df] transition-colors"
                  href={`tel:${res.phone}`}
                >
                  <span className="material-symbols-outlined text-[17px]">call</span>
                </a>
                <button
                  className="px-3 py-1.5 rounded-full bg-[#006e2f] text-white text-[11px] font-bold shadow-xs active:scale-95 transition-transform"
                  onClick={() => seatReservation(res.id, res.tableNumber)}
                  type="button"
                >
                  Seat Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-Over / Bottom Modal Drawer for Table Management */}
      {isDrawerOpen && selectedTable && (
        <div
          className="fixed inset-0 z-50 bg-[#33302b]/40 backdrop-blur-xs transition-opacity duration-300 flex items-end justify-center"
          onClick={e => {
            if (e.target === e.currentTarget) handleCloseDrawer();
          }}
        >
          <div className="w-full max-w-lg bg-[#fff8f1] rounded-t-3xl shadow-[0_-8px_32px_-4px_rgba(43,26,18,0.2)] p-4 flex flex-col max-h-[85vh] overflow-y-auto border-t border-[#e2bfb0]/40">
            {/* Drawer Drag Bar */}
            <div className="w-12 h-1.5 bg-[#e8e1da] rounded-full mx-auto mb-2"></div>

            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#e2bfb0]/30">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-md text-[18px] font-bold text-[#1e1b17]">
                    {selectedTable.name} ({selectedTable.tableNumber})
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedTable.status === 'available'
                        ? 'bg-[#006e2f]/15 text-[#006e2f]'
                        : selectedTable.status === 'occupied'
                        ? 'bg-[#ffdad6] text-[#93000a]'
                        : 'bg-[#f9d9cc] text-[#755d53]'
                    }`}
                  >
                    {selectedTable.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[12px] text-[#5a4136]">{selectedTable.description}</p>
              </div>

              <button
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-[#f9f3eb] flex items-center justify-center text-[#5a4136] hover:text-[#1e1b17]"
                onClick={handleCloseDrawer}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#f9f3eb] rounded-full mt-3 border border-[#e2bfb0]/25">
              <button
                className={`py-2 rounded-full text-[12px] font-bold shadow-xs transition-all ${
                  drawerTab === 'reserve'
                    ? 'text-white bg-[#ff6b00]'
                    : 'text-[#5a4136] hover:text-[#1e1b17]'
                }`}
                onClick={() => setDrawerTab('reserve')}
                type="button"
              >
                Reserve Table
              </button>
              <button
                className={`py-2 rounded-full text-[12px] font-bold shadow-xs transition-all ${
                  drawerTab === 'order'
                    ? 'text-white bg-[#ff6b00]'
                    : 'text-[#5a4136] hover:text-[#1e1b17]'
                }`}
                onClick={() => setDrawerTab('order')}
                type="button"
              >
                Take Order
              </button>
            </div>

            {/* Tab 1: Reserve Form */}
            {drawerTab === 'reserve' ? (
              <form className="flex flex-col gap-3 mt-3.5" onSubmit={handleSaveReservation}>
                <div>
                  <label className="text-[11px] font-bold text-[#5a4136] uppercase tracking-wide block mb-1">
                    Guest Full Name
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined text-[18px] text-[#5a4136] absolute left-3.5">
                      person
                    </span>
                    <input
                      className="w-full h-11 bg-white rounded-xl pl-10 pr-4 text-[#1e1b17] text-[13px] shadow-xs border border-[#e2bfb0]/40 focus:outline-none"
                      required
                      type="text"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#5a4136] uppercase tracking-wide block mb-1">
                    Contact Phone
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined text-[18px] text-[#5a4136] absolute left-3.5">
                      call
                    </span>
                    <input
                      className="w-full h-11 bg-white rounded-xl pl-10 pr-4 text-[#1e1b17] text-[13px] shadow-xs border border-[#e2bfb0]/40 focus:outline-none"
                      required
                      type="tel"
                      value={guestPhone}
                      onChange={e => setGuestPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#5a4136] uppercase tracking-wide block mb-1">
                      Date & Time
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined text-[18px] text-[#5a4136] absolute left-3">
                        schedule
                      </span>
                      <input
                        className="w-full h-11 bg-white rounded-xl pl-9 pr-3 text-[#1e1b17] text-[12px] shadow-xs border border-[#e2bfb0]/40 focus:outline-none"
                        required
                        type="text"
                        value={dateTime}
                        onChange={e => setDateTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#5a4136] uppercase tracking-wide block mb-1">
                      Party Size
                    </label>
                    <select
                      className="w-full h-11 bg-white rounded-xl px-3 text-[#1e1b17] text-[12px] shadow-xs border border-[#e2bfb0]/40 focus:outline-none"
                      value={partySize}
                      onChange={e => setPartySize(parseInt(e.target.value, 10))}
                    >
                      <option value={2}>2 Persons</option>
                      <option value={4}>4 Persons</option>
                      <option value={6}>6 Persons</option>
                      <option value={8}>8 Persons</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#5a4136] uppercase tracking-wide block mb-1">
                    Special Request & Preferences
                  </label>
                  <input
                    className="w-full h-11 bg-white rounded-xl px-3 text-[#1e1b17] text-[13px] shadow-xs border border-[#e2bfb0]/40 focus:outline-none"
                    placeholder="e.g. Near AC / Window seat"
                    type="text"
                    value={specialRequest}
                    onChange={e => setSpecialRequest(e.target.value)}
                  />
                </div>

                <button
                  className="w-full h-12 py-3 px-4 bg-[#ff6b00] text-white text-[13px] font-bold rounded-full shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 hover:bg-[#e05e00] disabled:opacity-80"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                      <span>Writing to Sheet...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send_to_mobile</span>
                      <span>Confirm Reservation & Save to Sheet</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Tab 2: Take Order Pane */
              <div className="flex flex-col gap-3 mt-3.5">
                <div className="p-3 bg-[#f9f3eb] rounded-xl flex items-center justify-between border border-[#e2bfb0]/30">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ff6b00]">receipt_long</span>
                    <span className="text-[13px] font-bold text-[#1e1b17]">New KOT Ticket</span>
                  </div>
                  <span className="text-[11px] font-bold bg-[#006e2f]/15 text-[#006e2f] px-2 py-0.5 rounded">
                    Server: Rehan
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg shadow-xs border border-[#e2bfb0]/25">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-[#1e1b17]">
                        Chicken Tikka Biryani
                      </span>
                      <span className="text-[11px] text-[#5a4136]">₹320 • Full Dawat</span>
                    </div>
                    <span className="px-2 py-1 bg-[#f4ede5] rounded-full text-[12px] font-bold text-[#1e1b17]">
                      1x
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg shadow-xs border border-[#e2bfb0]/25">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-[#1e1b17]">
                        Masala Cutting Chai
                      </span>
                      <span className="text-[11px] text-[#5a4136]">₹25 • Special Kadak</span>
                    </div>
                    <span className="px-2 py-1 bg-[#f4ede5] rounded-full text-[12px] font-bold text-[#1e1b17]">
                      2x
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <button
                    className="w-full h-11 py-2.5 px-4 bg-[#ff6b00] text-white text-[13px] font-bold rounded-full shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-[#e05e00]"
                    onClick={handleFireKOT}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">soup_kitchen</span>
                    <span>Fire KOT to Kitchen (+₹150)</span>
                  </button>

                  {selectedTable.status === 'occupied' && (
                    <button
                      className="w-full h-11 py-2.5 px-4 bg-[#006e2f] text-white text-[13px] font-bold rounded-full shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-[#005a26]"
                      onClick={handleSettleBill}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">payments</span>
                      <span>Settle Bill & Free Table (₹{(selectedTable.currentBill || 370).toFixed(0)})</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
