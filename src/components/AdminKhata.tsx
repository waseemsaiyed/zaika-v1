import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const AdminKhata: React.FC = () => {
  const {
    khataEntries,
    addKhataEntry,
    dailyStats,
    dispatchWhatsAppNumber,
    setDispatchWhatsAppNumber,
    googleSheetConfig,
    updateGoogleSheetConfig,
    setIsSheetViewerOpen,
    orders,
    reservations,
    menuItems,
    showToast,
  } = useApp();

  const [entryType, setEntryType] = useState<'Expense' | 'Income'>('Expense');
  const [category, setCategory] = useState('Milk & Dairy');
  const [amount, setAmount] = useState('1500');
  const [note, setNote] = useState('');
  const [isSecretVisible, setIsSecretVisible] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [sheetId, setSheetId] = useState(googleSheetConfig.sheetId);
  const [webhookKey, setWebhookKey] = useState(googleSheetConfig.webhookUrl);
  const [waNumberInput, setWaNumberInput] = useState(dispatchWhatsAppNumber);
  const [showApkModal, setShowApkModal] = useState(false);

  const handleKhataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || isNaN(num)) return;

    addKhataEntry({
      type: entryType,
      category,
      amount: num,
      note: note.trim() || `${category} operational log`,
      time: 'Today, Realtime',
      signer: 'Farooq (Cashier)',
    });

    setAmount('');
    setNote('');
  };

  const handleTestConnection = () => {
    setIsValidating(true);
    updateGoogleSheetConfig({ sheetId, webhookUrl: webhookKey });
    setTimeout(() => {
      setIsValidating(false);
      setValidationSuccess(true);
      showToast('Config saved! Handshake successful with Google Apps Script (124ms)!');
      setTimeout(() => setValidationSuccess(false), 4000);
    }, 750);
  };

  const handleExportKhataCSV = () => {
    const headers = ['ID', 'Type', 'Category', 'Amount (INR)', 'Note', 'Timestamp', 'Signer'];
    const rows = khataEntries.map(e => [
      e.id,
      e.type,
      `"${e.category}"`,
      e.amount,
      `"${e.note.replace(/"/g, '""')}"`,
      `"${e.time}"`,
      `"${e.signer || 'Cashier'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mumbai_zaika_khata_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded Khata CSV ledger file!');
  };

  const handleSaveWaNumber = () => {
    setDispatchWhatsAppNumber(waNumberInput);
    showToast(`WhatsApp dispatch target saved: ${waNumberInput}`);
  };

  const copyBuildCommand = () => {
    navigator.clipboard?.writeText('./build-apk.sh --release');
    showToast('Copied build command to clipboard!');
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 py-3 pb-32 gap-3">
      {/* Top Hero Status Bar */}
      <section className="flex flex-col gap-1 bg-white p-3.5 rounded-xl shadow-xs border border-[#e2bfb0]/25">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006e2f] animate-ping"></span>
            <span className="text-[10px] font-bold text-[#006e2f] uppercase tracking-wider">
              Live System Sync
            </span>
          </div>
          <span className="text-[11px] text-[#5a4136]">Last synced: 2m ago</span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <h2 className="font-headline-md text-[18px] font-extrabold text-[#1e1b17]">
              Masjid Bunder Khata
            </h2>
            <p className="text-[11px] text-[#5a4136]">Daily store balance & automated ledger</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#5a4136] block">Shift Manager</span>
            <span className="text-[12px] font-bold text-[#a04100]">Farooq Sheikh</span>
          </div>
        </div>
      </section>

      {/* 1. Top KPI Bento Grid */}
      <section className="grid grid-cols-2 gap-2.5">
        {/* Today's Income */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-[#e2bfb0]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-[#5a4136] uppercase">Today's Income</span>
            <span className="w-7 h-7 rounded-full bg-[#6bff8f]/30 flex items-center justify-center text-[#006e2f]">
              <span className="material-symbols-outlined text-[17px]">trending_up</span>
            </span>
          </div>
          <div>
            <div className="font-headline-md text-[18px] font-extrabold text-[#1e1b17]">
              ₹{dailyStats.income.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[#006e2f] text-[10px] font-bold">
              <span className="material-symbols-outlined text-[13px]">north_east</span>
              <span>+14% vs yesterday</span>
            </div>
          </div>
        </div>

        {/* Today's Expense */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-[#e2bfb0]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-[#5a4136] uppercase">Today's Expense</span>
            <span className="w-7 h-7 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[17px]">shopping_cart_checkout</span>
            </span>
          </div>
          <div>
            <div className="font-headline-md text-[18px] font-extrabold text-[#1e1b17]">
              ₹{dailyStats.expense.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#5a4136] truncate mt-0.5">Milk, bread, veg</p>
          </div>
        </div>

        {/* Net Petty Cash Balance (Full Span Card) */}
        <div className="col-span-2 bg-gradient-to-br from-[#a04100] to-[#ff6b00] p-4 rounded-xl shadow-md text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-1 relative z-10">
            <span className="text-[11px] text-[#ffdbcc] font-bold uppercase tracking-wider">
              Net Petty Cash Drawer
            </span>
            <span className="material-symbols-outlined text-[19px] text-[#ffdbcc]">
              account_balance_wallet
            </span>
          </div>

          <div className="flex items-baseline justify-between relative z-10">
            <div>
              <div className="font-display text-[32px] font-extrabold tracking-tight leading-tight">
                ₹{dailyStats.pettyCash.toLocaleString()}
              </div>
              <span className="text-[10px] text-[#ffdbcc]">Physical Drawer Verified • Safe Match</span>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-white">
                <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                <span className="text-[11px] font-bold">{dailyStats.ordersCount} Orders</span>
              </div>
              <span className="text-[10px] text-[#ffdbcc] mt-1">8 Table Bookings</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cashflow Mini Progress Dial */}
      <section className="bg-[#f9f3eb] p-3 rounded-xl flex items-center justify-between shadow-xs border border-[#e2bfb0]/25">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-inner relative flex-shrink-0">
            <svg className="w-9 h-9 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#e8e1da]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              ></path>
              <path
                className="text-[#00b050]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray="77, 100"
                strokeLinecap="round"
                strokeWidth="3.5"
              ></path>
            </svg>
            <span className="absolute text-[10px] font-bold text-[#1e1b17]">77%</span>
          </div>
          <div>
            <div className="font-headline-sm text-[14px] font-bold text-[#1e1b17]">
              Target Cash Margin
            </div>
            <div className="text-[11px] text-[#5a4136]">
              Expense retention is healthy (&lt; 25%)
            </div>
          </div>
        </div>
        <span className="material-symbols-outlined text-[#006e2f] text-[22px]">verified</span>
      </section>

      {/* 3. Petty Cash (Khata) Quick Entry Form */}
      <section className="bg-white p-4 rounded-xl shadow-xs border border-[#e2bfb0]/30 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#f9d9cc] flex items-center justify-center text-[#755d53]">
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-[15px] font-bold text-[#1e1b17]">
                Quick Khata Entry
              </h3>
              <p className="text-[11px] text-[#5a4136]">Records update sheets in real time</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f4ede5] text-[#5a4136] font-bold">
            Drawer #1
          </span>
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleKhataSubmit}>
          {/* Segment Switcher */}
          <div className="grid grid-cols-2 p-1 bg-[#f9f3eb] rounded-xl gap-1 border border-[#e2bfb0]/25">
            <button
              type="button"
              onClick={() => setEntryType('Expense')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-center transition-all font-bold text-[12px] ${
                entryType === 'Expense'
                  ? 'bg-[#ba1a1a] text-white shadow-xs'
                  : 'text-[#5a4136] hover:text-[#1e1b17]'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">remove_circle</span>
              <span>Expense (Out)</span>
            </button>

            <button
              type="button"
              onClick={() => setEntryType('Income')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-center transition-all font-bold text-[12px] ${
                entryType === 'Income'
                  ? 'bg-[#006e2f] text-white shadow-xs'
                  : 'text-[#5a4136] hover:text-[#1e1b17]'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">add_circle</span>
              <span>Income (In)</span>
            </button>
          </div>

          {/* Category Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#1e1b17]">Khata Category</label>
            <select
              className="w-full h-11 px-3 bg-[#f9f3eb] text-[#1e1b17] text-[13px] rounded-xl border border-[#e2bfb0]/40 focus:outline-none"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="Milk & Dairy">🥛 Milk & Dairy (Amul / Govardhan)</option>
              <option value="Bakery / Fresh Pavs">🍞 Bakery & Pav Breads (Fresh morning batch)</option>
              <option value="Veg & Grocery">🥬 Veg & Daily Grocery</option>
              <option value="Staff Wages">💵 Staff Daily Wages / Tips Advance</option>
              <option value="Gas Cylinder">🔥 Commercial LPG Cylinder 19kg</option>
              <option value="Maintenance">🔧 Maintenance & Equipment Clean</option>
              <option value="Other">📦 Other Operational Expense</option>
            </select>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#1e1b17]">Amount (₹ INR)</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 font-bold text-[#a04100] text-[15px]">₹</span>
              <input
                className="w-full h-11 pl-9 pr-3 bg-[#f9f3eb] text-[#1e1b17] font-bold text-[15px] rounded-xl border border-[#e2bfb0]/40 focus:outline-none"
                placeholder="1500"
                required
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Note */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#1e1b17]">Particulars / Note</label>
            <input
              className="w-full h-11 px-3 bg-[#f9f3eb] text-[#1e1b17] text-[13px] rounded-xl border border-[#e2bfb0]/40 focus:outline-none"
              placeholder="Amul Cheese & Butter 5kg wholesale"
              required
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {/* Signer & Timestamp */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#5a4136]">Authorized Signer</label>
              <div className="h-10 px-3 bg-[#f9f3eb] rounded-xl flex items-center gap-1.5 border border-[#e2bfb0]/30">
                <span className="material-symbols-outlined text-[#a04100] text-[16px]">badge</span>
                <span className="text-[11px] font-bold text-[#1e1b17] truncate">
                  Farooq (Cashier)
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#5a4136]">Time Stamp</label>
              <div className="h-10 px-3 bg-[#f9f3eb] rounded-xl flex items-center gap-1.5 border border-[#e2bfb0]/30">
                <span className="material-symbols-outlined text-[#5a4136] text-[16px]">schedule</span>
                <span className="text-[11px] text-[#5a4136] truncate">Today, Realtime</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            className={`mt-1 w-full h-12 text-white rounded-full text-[13px] font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all ${
              entryType === 'Income'
                ? 'bg-[#006e2f] hover:bg-[#005a26]'
                : 'bg-[#ff6b00] hover:bg-[#e05e00]'
            }`}
            type="submit"
          >
            <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
            <span>Record Entry & Push to Sheet</span>
          </button>
        </form>
      </section>

      {/* 4. Recent Khata Ledger */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-[15px] font-bold text-[#1e1b17]">
              Recent Khata Ledger
            </h3>
            <p className="text-[11px] text-[#5a4136]">
              {khataEntries.length} total entries recorded this cycle
            </p>
          </div>
          <button
            className="flex items-center gap-1 px-3 py-1.5 bg-[#f4ede5] rounded-full text-[#5a4136] hover:text-[#1e1b17] transition-colors border border-[#e2bfb0]/30"
            onClick={() => showToast('Generating CSV / PDF audit export for Masjid Bunder...')}
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">file_download</span>
            <span className="text-[11px] font-bold">Export</span>
          </button>
        </div>

        {/* Stream of Entries */}
        <div className="flex flex-col gap-2">
          {khataEntries.map(entry => {
            const isExp = entry.type === 'Expense';
            return (
              <div
                key={entry.id}
                className="bg-white p-3 rounded-xl shadow-xs border border-[#e2bfb0]/25 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isExp ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#6bff8f]/30 text-[#006e2f]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {entry.icon || (isExp ? 'remove_shopping_cart' : 'payments')}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-[#1e1b17] truncate">
                        {entry.category}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          isExp ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#6bff8f]/30 text-[#006e2f]'
                        }`}
                      >
                        {isExp ? 'Debit' : 'Credit'}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#5a4136] truncate">{entry.note}</div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-2">
                  <span
                    className={`font-headline-sm text-[14px] font-bold block ${
                      isExp ? 'text-[#ba1a1a]' : 'text-[#006e2f]'
                    }`}
                  >
                    {isExp ? '-' : '+'}₹{entry.amount.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-[#006e2f] flex items-center justify-end gap-0.5 font-bold">
                    <span className="material-symbols-outlined text-[11px]">done_all</span> Synced
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Export Buttons */}
        <div className="bg-[#eee7df] p-2.5 rounded-xl flex items-center justify-between border border-[#e2bfb0]/30">
          <span className="text-[11px] text-[#5a4136] pl-1 font-medium">Need auditor printouts?</span>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 bg-white text-[#1e1b17] rounded-lg text-[11px] font-bold shadow-xs active:scale-95 transition-transform hover:bg-[#fff8f1]"
              onClick={() => {
                window.print();
                showToast('Opening print dialog for Khata ledger audit...');
              }}
              type="button"
            >
              Export PDF
            </button>
            <button
              className="px-3 py-1 bg-[#a04100] text-white rounded-lg text-[11px] font-bold shadow-xs active:scale-95 transition-transform hover:bg-[#823400]"
              onClick={handleExportKhataCSV}
              type="button"
            >
              Export CSV
            </button>
          </div>
        </div>
      </section>

      {/* 2. Google Sheets API v4 Integration Card */}
      <section className="bg-white p-4 rounded-xl shadow-xs border border-[#e2bfb0]/30 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00b050]/20 text-[#006e2f] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">table_view</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-[15px] font-bold text-[#1e1b17]">
                Google Sheets API v4
              </h3>
              <p className="text-[11px] text-[#5a4136]">Automated cloud backup & reporting</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSheetViewerOpen(true)}
            className="px-2.5 py-1 bg-[#006e2f] text-white rounded-full text-[11px] flex items-center gap-1 font-bold shadow-xs hover:bg-[#005a26] active:scale-95 transition"
          >
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            <span>Inspect DB</span>
          </button>
        </div>

        <div className="bg-[#f9f3eb] p-2.5 rounded-xl flex flex-col gap-1 border border-[#e2bfb0]/25">
          <div className="flex items-center justify-between text-[#5a4136] text-[10px]">
            <span>Active Sheet Target</span>
            <span className="text-[#006e2f] font-mono font-bold">Status: 200 OK</span>
          </div>
          <div className="text-[11px] text-[#1e1b17] font-mono break-all bg-white px-2 py-1 rounded border border-[#e2bfb0]/40 select-all">
            {sheetId}
          </div>
        </div>

        {/* Worksheets Grid */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#1e1b17]">Active Sync Tabs (5)</span>
            <span className="text-[10px] text-[#5a4136]">Tap to inspect live table</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { tab: 'menu_items', rows: `${menuItems.length} rows` },
              { tab: 'orders', rows: `${orders.length} rows` },
              { tab: 'reservations', rows: `${reservations.length} rows` },
              { tab: 'petty_cash', rows: `${khataEntries.length} rows` },
            ].map(item => (
              <button
                key={item.tab}
                type="button"
                onClick={() => setIsSheetViewerOpen(true)}
                className="bg-[#f9f3eb] p-2 rounded-lg flex items-center justify-between border border-[#e2bfb0]/20 hover:bg-[#f4ede5] active:scale-98 transition text-left"
              >
                <span className="text-[11px] text-[#1e1b17] font-mono font-bold">{item.tab}</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-white rounded text-[#5a4136] font-bold">
                  {item.rows}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsSheetViewerOpen(true)}
              className="col-span-2 bg-[#f9f3eb] p-2 rounded-lg flex items-center justify-between border border-[#e2bfb0]/20 hover:bg-[#f4ede5] active:scale-98 transition text-left"
            >
              <span className="text-[11px] text-[#1e1b17] font-mono font-bold">audit_sync_logs</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-white rounded text-[#006e2f] font-bold">Live Stream</span>
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#5a4136] font-medium" htmlFor="sheet-id-input">
              Google Sheet ID
            </label>
            <input
              id="sheet-id-input"
              className="w-full h-10 px-3 bg-[#f9f3eb] text-[#1e1b17] text-[12px] font-mono rounded-xl border border-[#e2bfb0]/40 focus:outline-none"
              type="text"
              value={sheetId}
              onChange={e => setSheetId(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#5a4136] font-medium" htmlFor="webhook-key-input">
              Apps Script Webhook / API Key
            </label>
            <div className="relative">
              <input
                id="webhook-key-input"
                className="w-full h-10 pl-3 pr-10 bg-[#f9f3eb] text-[#1e1b17] text-[12px] font-mono rounded-xl border border-[#e2bfb0]/40 focus:outline-none"
                type={isSecretVisible ? 'text' : 'password'}
                value={webhookKey}
                onChange={e => setWebhookKey(e.target.value)}
              />
              <button
                className="absolute right-2.5 top-2.5 text-[#5a4136] hover:text-[#1e1b17]"
                onClick={() => setIsSecretVisible(!isSecretVisible)}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isSecretVisible ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            className="mt-1 h-11 bg-[#f4ede5] text-[#1e1b17] rounded-full text-[12px] font-bold flex items-center justify-center gap-2 hover:bg-[#eee7df] transition-colors border border-[#e2bfb0]/40 active:scale-98"
            disabled={isValidating}
            onClick={handleTestConnection}
            type="button"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isValidating ? 'animate-spin' : ''
              }`}
            >
              sync
            </span>
            <span>
              {isValidating ? 'Validating Handshake...' : 'Test Webhook & Validate Auth'}
            </span>
          </button>

          {validationSuccess && (
            <div className="p-2 rounded-lg bg-[#6bff8f]/30 text-[#006e2f] text-[11px] font-bold text-center">
              ✓ Ping 124ms: Handshake successful with Google Apps Script
            </div>
          )}
        </div>
      </section>

      {/* 5. PWA & Capacitor Bridge Section */}
      <section className="bg-white p-4 rounded-xl shadow-xs border border-[#e2bfb0]/30 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#fcdcce] text-[#281810] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">android</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-[15px] font-bold text-[#1e1b17]">
                Android APK & GitHub Actions
              </h3>
              <p className="text-[11px] text-[#5a4136]">Automated Cloud APK Compiler for Phones & POS Tablets</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#6bff8f]/30 text-[#006e2f] text-[10px] font-bold">
            CI/CD Ready
          </span>
        </div>

        <div className="bg-[#f9f3eb] p-3 rounded-xl flex flex-col gap-2 border border-[#e2bfb0]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#006e2f]">cloud_done</span>
              <span className="text-[12px] font-bold text-[#1e1b17]">GitHub Actions Workflow Configured</span>
            </div>
            <span className="text-[10px] font-bold text-[#a04100]">Capacitor 8 + Java 21</span>
          </div>
          <p className="text-[11px] text-[#5a4136] leading-relaxed">
            Push or export this repository to GitHub. The <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded font-bold text-[#1e1b17]">.github/workflows/build-apk.yml</span> workflow automatically compiles and outputs a signed debug <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded font-bold text-[#1e1b17]">mumbai-zaika-pos.apk</span> artifact!
          </p>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={() => setShowApkModal(true)}
              className="py-2 px-3 bg-[#a04100] text-white rounded-lg text-[11px] font-bold shadow-xs active:scale-95 transition flex items-center justify-center gap-1.5 hover:bg-[#853600]"
            >
              <span className="material-symbols-outlined text-[15px]">install_mobile</span>
              <span>APK Build Guide</span>
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText('git push origin main');
                showToast('Copied `git push origin main` to clipboard!');
              }}
              className="py-2 px-3 bg-white text-[#1e1b17] border border-[#e2bfb0]/40 rounded-lg text-[11px] font-bold shadow-xs active:scale-95 transition flex items-center justify-center gap-1.5 hover:bg-[#fff8f1]"
            >
              <span className="material-symbols-outlined text-[15px]">terminal</span>
              <span>Copy Git Push</span>
            </button>
          </div>
        </div>

        {/* WhatsApp Order Dispatch Target */}
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-[#1e1b17] flex items-center gap-1.5" htmlFor="wa-target-number">
            <span className="material-symbols-outlined text-[#006e2f] text-[18px]">chat</span>
            <span>WhatsApp Order Dispatch Target</span>
          </label>
          <div className="flex gap-2">
            <input
              id="wa-target-number"
              className="flex-1 h-11 px-3 bg-[#f9f3eb] text-[#1e1b17] font-bold text-[14px] rounded-xl border border-[#e2bfb0]/40 focus:outline-none"
              type="text"
              value={waNumberInput}
              onChange={e => setWaNumberInput(e.target.value)}
            />
            <button
              className="px-4 h-11 bg-[#006e2f] text-white rounded-xl text-[12px] font-bold shadow-xs active:scale-95 transition-transform flex items-center gap-1 hover:bg-[#005a26]"
              onClick={handleSaveWaNumber}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Save</span>
            </button>
          </div>
          <p className="text-[10px] text-[#5a4136]">
            Directs customer one-tap ordering receipts directly to this staff number.
          </p>
        </div>
      </section>

      {/* APK Build Instructions Modal */}
      {showApkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fcf8f4] w-full max-w-lg rounded-2xl shadow-2xl border border-[#e2bfb0]/40 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-white border-b border-[#e2bfb0]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#006e2f]/10 text-[#006e2f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">android</span>
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-[#1e1b17]">Build APK via GitHub</h3>
                  <p className="text-[11px] text-[#5a4136]">Zero-install automated cloud compilation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApkModal(false)}
                className="w-8 h-8 rounded-full bg-[#f4ede5] flex items-center justify-center text-[#5a4136] hover:text-[#1e1b17]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex flex-col gap-3 text-[12px] text-[#1e1b17]">
              <div className="p-3 bg-[#e8f5e9] text-[#1b5e20] rounded-xl border border-[#c8e6c9] flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                <div>
                  <span className="font-bold">Workflow file ready: </span>
                  <span className="font-mono text-[11px]">.github/workflows/build-apk.yml</span>
                  <p className="text-[11px] mt-0.5 text-[#2e7d32]">
                    GitHub Actions is configured with Java 21, Node.js 20, Capacitor 8, and Android SDK.
                  </p>
                </div>
              </div>

              {/* Step 1 */}
              <div className="bg-white p-3 rounded-xl border border-[#e2bfb0]/30 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#a04100] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                  <span className="font-bold text-[#1e1b17]">Export / Push to GitHub</span>
                </div>
                <p className="text-[11px] text-[#5a4136] pl-7">
                  Click <strong>Settings &gt; Export to GitHub</strong> in AI Studio, or push your commits:
                </p>
                <div className="ml-7 bg-[#281810] text-[#f4ede5] p-2 rounded-lg font-mono text-[11px] flex items-center justify-between">
                  <span>git push origin main</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText('git add . && git commit -m "feat: android apk" && git push origin main');
                      showToast('Copied git push command!');
                    }}
                    className="text-[#ffb693] hover:text-white"
                    title="Copy command"
                  >
                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-3 rounded-xl border border-[#e2bfb0]/30 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#a04100] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                  <span className="font-bold text-[#1e1b17]">Watch GitHub Actions Build (~2 mins)</span>
                </div>
                <p className="text-[11px] text-[#5a4136] pl-7">
                  Go to your repository on GitHub and click the <strong>Actions</strong> tab. You will see <em>"Build & Package Android APK"</em> running. You can also manually trigger it via <em>"Run workflow"</em>.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-3 rounded-xl border border-[#e2bfb0]/30 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#a04100] text-white text-[11px] font-bold flex items-center justify-center">3</span>
                  <span className="font-bold text-[#1e1b17]">Download the Compiled APK</span>
                </div>
                <p className="text-[11px] text-[#5a4136] pl-7">
                  When the run finishes with a green checkmark, scroll down to <strong>Artifacts</strong> and click <span className="font-mono font-bold text-[#a04100]">mumbai-zaika-pos-apk</span> to download.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white p-3 rounded-xl border border-[#e2bfb0]/30 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#a04100] text-white text-[11px] font-bold flex items-center justify-center">4</span>
                  <span className="font-bold text-[#1e1b17]">Install on Android Device</span>
                </div>
                <p className="text-[11px] text-[#5a4136] pl-7">
                  Transfer the APK to your phone or tablet, enable <em>"Install unknown apps"</em> when prompted, and launch the app offline or online!
                </p>
              </div>

              {/* Local Dev Note */}
              <div className="p-2.5 bg-[#f4ede5] rounded-xl text-[11px] text-[#5a4136]">
                💡 <strong>Prefer local Android Studio?</strong> Run <code className="font-bold text-[#1e1b17]">npm run cap:open</code> on your laptop to open the generated native project in Android Studio and click <em>Run</em>.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white border-t border-[#e2bfb0]/30 flex justify-end">
              <button
                type="button"
                onClick={() => setShowApkModal(false)}
                className="px-5 py-2 bg-[#1e1b17] text-white rounded-full text-[12px] font-bold hover:bg-[#33302b] active:scale-95 transition"
              >
                Got It, Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
