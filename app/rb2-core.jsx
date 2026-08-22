/* Raees Builder App v2 - core: theme, translations, helpers, icons, shared UI */
/* classic script (Babel react preset) - all top level names are global */

var NL = String.fromCharCode(10);

var TC = {
  appBg: "#211E17",
  appBg2: "#2A2620",
  paper: "#F4EFDE",
  paperDark: "#E9E1C8",
  paperLine: "#D8CDA9",
  ink: "#221F18",
  inkSoft: "#5B5546",
  concrete: "#9C9585",
  stamp: "#A63A2E",
  stampDark: "#7E2A20",
  garden: "#5C7A3F",
  gardenDark: "#44592E",
  slab: "#3E5C68",
  slabDark: "#2C424C",
  amber: "#B8791E",
  success: "#3F7A52",
  cream: "#F9F6EC"
};

var GARDEN_LENGTHS = (function () {
  var arr = [];
  for (var v = 10; v <= 20; v += 0.5) arr.push(Number(v.toFixed(2)));
  return arr;
})();

var SLAB_SIZES = [3, 3.25, 3.5, 3.75, 4.08, 4.25, 4.58];

function isoOf(d) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function rbToday() { return isoOf(new Date()); }
function rbUid() { return Math.random().toString(36).slice(2, 10); }
function rbDate(d) {
  var s = String(d || "");
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return s;
  return m[3] + "/" + m[2] + "/" + m[1].slice(2);
}
function roleName(t, r) { return r === "accountant" ? t("accountant") : (r === "admin" ? t("admin") : "-"); }
function rbMoney(n) {
  var v = Number(n) || 0;
  return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function rbWa(mobile, message) {
  var d = String(mobile || "").replace(/[^0-9]/g, "");
  if (d.length === 11 && d.charAt(0) === "0") d = "92" + d.slice(1);
  return "https://wa.me/" + d + "?text=" + encodeURIComponent(message);
}

var RB2_PRE = "rb2:";
/* per-login-session role marker (sessionStorage, not localStorage) - cleared when the
   browser tab / installed app is closed, so every fresh open re-asks for a PIN */
var RB_SESSION_ROLE_KEY = "rb2-session-role";
function rbGet(key, def) {
  try {
    var r = localStorage.getItem(RB2_PRE + key);
    return r === null ? def : JSON.parse(r);
  } catch (e) { return def; }
}
function rbSet(key, val) {
  try { localStorage.setItem(RB2_PRE + key, JSON.stringify(val)); return true; }
  catch (e) { return false; }
}

function variantCustomLabel(category, variant) {
  var labels = rbGet("variant-labels", {});
  var catLabels = labels[category] || {};
  return catLabels[variant] || "";
}

var ACTION_LABELS = {
  sale_created: "actionSaleCreated",
  sale_edited: "actionSaleEdited",
  stock_added: "actionStockAdded",
  payment_collected: "actionPaymentCollected",
  gatepass_created: "actionGatePassCreated",
  wastage_logged: "actionWastageLogged",
  size_added: "actionSizeAdded",
  stock_converted: "actionStockConverted"
};
var TRANSLATIONS = {
  en: {
    appName: "Raees Builder", tagline: "Chatai Sale & Inventory",
    navSale: "New Sale", navStock: "Stock", navDues: "Dues", navSettings: "Settings",
    navBills: "Bills", billsSummary: "Bills record", billsCount: "Bills",
    billsTotal: "Total amount", billsReceived: "Received", billsDue: "Balance (Baqi)", noBills: "No bills yet.",
    saleType: "Sale Type", cashSale: "Cash Sale", customizedSale: "Pemaishi Sale",
    customerName: "Customer name", date: "Date", addItem: "Add item",
    chooseCategory: "Choose category", garden: "Garder", slab: "Slab",
    discount: "Discount", preparedBy: "Prepared by", returnLabel: "Return", returnItems: "Return items",
    returnQty: "Return qty", returnReason: "Reason (optional)", returnSaved: "Return saved", returnTotal: "Return total",
    inStock: "in stock", qty: "Qty", length: "Length", width: "Width",
    sqft: "Sqft", rate: "Rate", amount: "Amount", description: "Description",
    noItemsYet: "No items added yet", tapAddItem: "Tap Add item to start the bill",
    roofLabour: "Roof labour", labourRate: "Labour rate", labourAmount: "Labour amount",
    labourNote: "Labour is paid by the factory on customized orders — not charged to customer.",
    priceNote: "Type the price for each item when you sell it — there is no fixed rate list.",
    paidInFull: "Paid in full (cash)", totalBill: "Total bill", advance: "Advance",
    dues: "Dues", saveSale: "Save sale", gatePassNo: "Gate Pass No.", billNo: "Bill Number",
    signature: "Signature", print: "Print", newBill: "New bill",
    stock: "Stock", addStock: "Add stock", currentStock: "Current stock",
    setRate: "Rate / sqft", duesList: "Dues", allSales: "All sales",
    duesOnly: "Dues only", searchCustomer: "Search customer...",
    markPaid: "Mark as paid", settings: "Settings", language: "Language",
    role: "Role", admin: "Admin", accountant: "User", permissions: "Permissions", permissionsHint: "Choose which features the User role can access.", userCanStock: "Stock tab", userCanWastage: "Wastage tab", userCanEditSale: "Edit sales & returns", userCanGatePass: "Create / edit gate pass", userCanBillsSummary: "See Bills totals (Total / Received / Baqi)",
    clearData: "Clear all data",
    clearDataConfirm: "This deletes all stock, sales and payment records saved on this device. Are you sure?",
    noDues: "No pending dues — all clear.", paid: "Paid", due: "Due",
    save: "Save", cancel: "Cancel", remove: "Remove", total: "Total",
    close: "Close", done: "Done", addRow: "Add row", customItem: "Custom item",
    sr: "Sr", items: "Items", saleSaved: "Sale saved", back: "Back",
    stockUpdated: "Stock updated", enterQty: "Enter quantity",
    noStockYet: "No stock recorded yet. Tap + to add some.",
    accountantNoStock: "Stock levels are visible to Admin only.",
    dataShared: "Stock, sales and payments are saved on this device.",
    variant: "Size", pieces: "pcs", searchNoResults: "No matching sales.",
    of: "of", added: "Added", sold: "Sold", remaining: "Remaining",
    collectPayment: "Collect payment", amountReceived: "Amount received",
    balanceRemaining: "Balance remaining", fullyPaid: "Fully paid",
    paymentReceiptTitle: "Payment receipt", quantity: "Quantity",
    forVariant: "For", recordPayment: "Record payment", noDuesOnThis: "This bill is fully paid.",
    makeGatePass: "Make gate pass", selectItemsToTake: "Select items being taken now",
    gatePassTitle: "Gate Pass", paymentHistory: "Payment History", stockHistory: "Stock History", confirmDeleteStockEntry: "Delete this stock entry?", edit: "Edit", editingBill: "Editing bill",
    cancelEdit: "Cancel edit", viewGatePass: "View gate pass",
    navGatePass: "Gate Pass", noGatePasses: "No gate passes yet.",
    billUpdated: "Bill updated", updateBill: "Update bill", gpMoreThanBill: "Gate pass bill se ziada", gpVsBill: "bill", gpVsGate: "gate pass", verifyGp: "Admin verify", gpVerifiedTag: "Admin verified", zeroBillTag: "Bill Rs 0 — rate nahi dala", rateRequired: "Har item ka rate daalein — Rs 0 ka bill save nahi ho sakta.",
    tapToAddQty: "Tap an item, then enter how many", add: "Add", selected: "Selected",
    mobileNumber: "Mobile number", whatsapp: "Share on WhatsApp",
    stockSummary: "Stock summary", paymentsSummary: "Payments received", today: "Today",
    last7Days: "7 days", last30Days: "30 days", allTime: "All time", customRange: "Custom",
    totalReceived: "Total received", noEntriesRange: "Nothing in this range.",
    addNewSize: "Add new size", enterNewSize: "New size", sizeLabelOptional: "Label (optional)", sizeLabelPlaceholder: "e.g. Grey", invalidSize: "Enter a valid size",
    duplicateSize: "This size already exists", sizeAdded: "Size added",
    navWastage: "Wastage", logWastage: "Log wastage", wastageSummary: "Wastage summary",
    wasted: "Wasted", reason: "Reason (optional)", gatePassSummary: "Gate pass summary",
    activityLog: "Activity log", noActivityYet: "No activity yet.",
    actionSaleCreated: "Sale created", actionSaleEdited: "Bill edited",
    actionStockAdded: "Stock added", actionPaymentCollected: "Payment collected",
    actionGatePassCreated: "Gate pass created", actionWastageLogged: "Wastage logged",
    actionSizeAdded: "New size added", updateGatePass: "Update gate pass",
    convertStock: "Convert size", convertTo: "Convert to",
    convertHint: "Move stock from one size into another (e.g. cut a 10.5 ft piece down to 10 ft).",
    actionStockConverted: "Stock converted"
  },
  ur: {
    appName: "رئیس بلڈر", tagline: "چھتائی سیل اینڈ انوینٹری",
    navSale: "نئی سیل", navStock: "اسٹاک", navDues: "بقایا", navSettings: "ترتیبات",
    navBills: "بل", billsSummary: "بلوں کا ریکارڈ", billsCount: "بل",
    billsTotal: "کل رقم", billsReceived: "وصول شدہ", billsDue: "باقی رقم", noBills: "ابھی تک کوئی بل نہیں۔",
    saleType: "سیل کی قسم", cashSale: "نقد سیل", customizedSale: "پیمائشی سیل",
    customerName: "گاہک کا نام", date: "تاریخ", addItem: "آئٹم شامل کریں",
    chooseCategory: "کیٹگری منتخب کریں", garden: "گارڈر", slab: "سلیب",
    discount: "رعایت", preparedBy: "تیار کنندہ", returnLabel: "واپسی", returnItems: "مال واپسی",
    returnQty: "واپسی تعداد", returnReason: "وجہ (اختیاری)", returnSaved: "واپسی محفوظ ہو گئی", returnTotal: "کل واپسی",
    inStock: "اسٹاک میں", qty: "تعداد", length: "لمبائی", width: "چوڑائی",
    sqft: "مربع فٹ", rate: "ریٹ", amount: "رقم", description: "تفصیل",
    noItemsYet: "ابھی کوئی آئٹم شامل نہیں", tapAddItem: "بل شروع کرنے کے لیے آئٹم شامل کریں",
    roofLabour: "چھت مزدوری", labourRate: "مزدوری ریٹ", labourAmount: "مزدوری رقم",
    labourNote: "فرمائش آرڈر پر مزدوری فیکٹری ادا کرتی ہے — گاہک سے وصول نہیں کی جاتی۔",
    priceNote: "ہر آئٹم فروخت کرتے وقت اس کی قیمت خود لکھیں — کوئی مقررہ ریٹ لسٹ نہیں۔",
    paidInFull: "مکمل ادائیگی (نقد)", totalBill: "کل بل", advance: "ایڈوانس",
    dues: "بقایا", saveSale: "سیل محفوظ کریں", gatePassNo: "گیٹ پاس نمبر", billNo: "بل نمبر",
    signature: "دستخط", print: "پرنٹ", newBill: "نئی رسید",
    stock: "اسٹاک", addStock: "اسٹاک شامل کریں", currentStock: "موجودہ اسٹاک",
    setRate: "ریٹ / مربع فٹ", duesList: "بقایا جات", allSales: "تمام سیلز",
    duesOnly: "صرف بقایا", searchCustomer: "گاہک تلاش کریں...",
    markPaid: "ادا شدہ نشان زد کریں", settings: "ترتیبات", language: "زبان",
    role: "کردار", admin: "ایڈمن", accountant: "صارف", permissions: "اختیارات", permissionsHint: "منتخب کریں کہ صارف کس فیچر تک رسائی رکھے۔", userCanStock: "اسٹاک ٹیب", userCanWastage: "ضائع شدہ مال ٹیب", userCanEditSale: "سیل و واپسی میں تبدیلی", userCanGatePass: "گیٹ پاس بنانا / تبدیل کرنا", userCanBillsSummary: "بلوں کے کل اعداد دیکھیں (کل / وصول شدہ / باقی)",
    clearData: "تمام ڈیٹا صاف کریں",
    clearDataConfirm: "اس سے اس ڈیوائس کا تمام اسٹاک، سیلز اور ادائیگی کا ریکارڈ ختم ہو جائے گا۔ کیا آپ مطمئن ہیں؟",
    noDues: "کوئی بقایا نہیں — سب کلیئر۔", paid: "ادا شدہ", due: "بقایا دار",
    save: "محفوظ کریں", cancel: "منسوخ", remove: "ہٹائیں", total: "ٹوٹل",
    close: "بند کریں", done: "ہو گیا", addRow: "رو شامل کریں", customItem: "خصوصی آئٹم",
    sr: "نمبر شمار", items: "آئٹمز", saleSaved: "سیل محفوظ ہو گئی", back: "واپس",
    stockUpdated: "اسٹاک اپ ڈیٹ ہو گیا", enterQty: "تعداد درج کریں",
    noStockYet: "ابھی تک کوئی اسٹاک درج نہیں۔ شامل کرنے کے لیے + دبائیں۔",
    accountantNoStock: "اسٹاک کی تفصیل صرف ایڈمن کو نظر آتی ہے۔",
    dataShared: "اسٹاک، سیلز اور ادائیگیاں اسی ڈیوائس میں محفوظ ہوتی ہیں۔",
    variant: "سائز", pieces: "عدد", searchNoResults: "کوئی سیل نہیں ملی۔",
    of: "میں سے", added: "شامل ہوئی", sold: "فروخت ہوئی", remaining: "باقی",
    collectPayment: "ادائیگی وصول کریں", amountReceived: "موصولہ رقم",
    balanceRemaining: "باقی بیلنس", fullyPaid: "مکمل ادا",
    paymentReceiptTitle: "ادائیگی کی رسید", quantity: "مقدار",
    forVariant: "برائے", recordPayment: "ادائیگی درج کریں", noDuesOnThis: "یہ بل مکمل ادا ہو چکا ہے۔",
    makeGatePass: "گیٹ پاس بنائیں", selectItemsToTake: "ابھی لے جانے والا مال منتخب کریں",
    gatePassTitle: "گیٹ پاس", paymentHistory: "ادائیگیوں کی تفصیل", stockHistory: "اسٹاک کی تاریخ", confirmDeleteStockEntry: "کیا یہ اسٹاک اندراج حذف کریں؟", edit: "ترمیم", editingBill: "بل میں ترمیم",
    cancelEdit: "ترمیم منسوخ کریں", viewGatePass: "گیٹ پاس دیکھیں",
    navGatePass: "گیٹ پاس", noGatePasses: "ابھی تک کوئی گیٹ پاس نہیں۔",
    billUpdated: "بل اپ ڈیٹ ہو گیا", updateBill: "بل اپ ڈیٹ کریں", gpMoreThanBill: "گیٹ پاس بل سے زیادہ", gpVsBill: "بل", gpVsGate: "گیٹ پاس", verifyGp: "ایڈمن تصدیق", gpVerifiedTag: "ایڈمن نے تصدیق کر دی", zeroBillTag: "بل صفر روپے — ریٹ درج نہیں", rateRequired: "ہر آئٹم کا ریٹ درج کریں — صفر روپے کا بل محفوظ نہیں ہو سکتا۔",
    tapToAddQty: "کوئی آئٹم دبائیں، پھر تعداد درج کریں", add: "شامل کریں", selected: "منتخب شدہ",
    mobileNumber: "موبائل نمبر", whatsapp: "واٹس ایپ پر بھیجیں",
    stockSummary: "اسٹاک کا خلاصہ", paymentsSummary: "ادائیگیوں کا خلاصہ", today: "آج",
    last7Days: "7 دن", last30Days: "30 دن", allTime: "تمام وقت", customRange: "مخصوص",
    totalReceived: "کل موصول شدہ", noEntriesRange: "اس مدت میں کچھ نہیں۔",
    addNewSize: "نیا سائز شامل کریں", enterNewSize: "نیا سائز", sizeLabelOptional: "لیبل (اختیاری)", sizeLabelPlaceholder: "مثلاً Grey", invalidSize: "درست سائز درج کریں",
    duplicateSize: "یہ سائز پہلے سے موجود ہے", sizeAdded: "سائز شامل ہو گیا",
    navWastage: "خراب مال", logWastage: "خراب مال درج کریں", wastageSummary: "خراب مال کا خلاصہ",
    wasted: "خراب", reason: "وجہ (اختیاری)", gatePassSummary: "گیٹ پاس کا خلاصہ",
    activityLog: "سرگرمی کا ریکارڈ", noActivityYet: "ابھی تک کوئی سرگرمی نہیں۔",
    actionSaleCreated: "سیل بنائی گئی", actionSaleEdited: "بل میں ترمیم ہوئی",
    actionStockAdded: "اسٹاک شامل ہوا", actionPaymentCollected: "ادائیگی وصول ہوئی",
    actionGatePassCreated: "گیٹ پاس بنا", actionWastageLogged: "خراب مال درج ہوا",
    actionSizeAdded: "نیا سائز شامل ہوا", updateGatePass: "گیٹ پاس اپ ڈیٹ کریں",
    convertStock: "سائز تبدیل کریں", convertTo: "کس سائز میں تبدیل کریں",
    convertHint: "ایک سائز کا اسٹاک دوسرے سائز میں منتقل کریں، جیسے 10.5 فٹ کو کاٹ کر 10 فٹ بنانا۔",
    actionStockConverted: "اسٹاک سائز تبدیل ہوا"
  }
};

function getRangeBounds(preset) {
  var today = rbToday();
  if (preset === "today") return { from: today, to: today };
  if (preset === "7d") { var a = new Date(); a.setDate(a.getDate() - 6); return { from: isoOf(a), to: today }; }
  if (preset === "30d") { var b = new Date(); b.setDate(b.getDate() - 29); return { from: isoOf(b), to: today }; }
  return { from: null, to: null };
}
function resolveRange(range) {
  if (range.preset === "custom") return { from: range.from || null, to: range.to || null };
  return getRangeBounds(range.preset);
}
function inDateRange(d, from, to) {
  return (!from || d >= from) && (!to || d <= to);
}
var DEFAULT_PERMISSIONS = { stock: true, wastage: false, editSale: false, gatePass: true, billsSummary: false }; /* Stock tab har role ko dikhta hai (User bhi) */ var ALWAYS_ALLOWED = { stock: true }; function hasPerm(role, permissions, feature) { if (role === "admin") return true; if (ALWAYS_ALLOWED[feature]) return true; var p = permissions || DEFAULT_PERMISSIONS; return !!p[feature]; }
/* ---- gate pass vs bill check: gate pass mein bill se ziada maal to nahi ja raha ---- */
function rbItemKey(it) { return String(it.category || "") + "|" + String(it.variant || ""); }
function gpExtraOverBill(sale, gp) {
  if (!sale || !gp || !gp.items || !gp.items.length) return [];
  var bill = {}; (sale.items || []).forEach(function (it) { var k = rbItemKey(it); bill[k] = (bill[k] || 0) + (Number(it.qty) || 0); });
  var pass = {}; gp.items.forEach(function (it) { var k = rbItemKey(it); pass[k] = (pass[k] || 0) + (Number(it.qty) || 0); });
  var out = [];
  Object.keys(pass).forEach(function (k) {
    var b = bill[k] || 0;
    if (pass[k] > b) { var pr = k.split("|"); out.push({ category: pr[0], variant: pr[1], bill: b, gp: pass[k] }); }
  });
  return out;
} /* ---------------- icons ---------------- */
var ICON_PATHS = {
  receipt: <g><path d="M5 3h14v18l-3-2-3 2-3-2-3 2Z" /><path d="M8 8h8" /><path d="M8 12h8" /></g>,
  pkg: <g><path d="M21 8v8l-9 5-9-5V8l9-5 9 5Z" /><path d="M3.3 7.5 12 12l8.7-4.5" /><path d="M12 12v9" /></g>,
  trash: <g><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 14h10l1-14" /><path d="M10 11v7" /><path d="M14 11v7" /></g>,
  truck: <g><path d="M3 6h11v10H3z" /><path d="M14 9h4l3 3v4h-7z" /><circle cx="7" cy="18" r="1.8" /><circle cx="17.5" cy="18" r="1.8" /></g>,
  wallet: <g><path d="M3 7h15a3 3 0 0 1 3 3v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M3 7V6a2 2 0 0 1 2-2h11" /><circle cx="17" cy="13.5" r="1.1" /></g>,
  gear: <g><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></g>,
  plus: <path d="M12 5v14M5 12h14" />,
  x: <g><path d="M6 6l12 12" /><path d="M18 6 6 18" /></g>,
  check: <path d="m4 12 5 5L20 6" />,
  search: <g><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></g>,
  printer: <g><path d="M7 9V3h10v6" /><path d="M5 9h14a2 2 0 0 1 2 2v6h-4v4H7v-4H3v-6a2 2 0 0 1 2-2Z" /></g>,
  chev: <path d="m9 6 6 6-6 6" />,
  globe: <g><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 3 2.5 15 0 18" /><path d="M12 3c-2.5 3-2.5 15 0 18" /></g>,
  usercog: <g><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.3 2.7-6 6-6h1" /><circle cx="17.5" cy="16.5" r="2.4" /><path d="M17.5 12.9v1M17.5 20.1v1M13.9 16.5h1M20.1 16.5h1" /></g>,
  loader: <path d="M12 3a9 9 0 1 0 9 9" />,
  alert: <g><circle cx="12" cy="12" r="9" /><path d="M12 7v6" /><path d="M12 16.3v.4" /></g>,
  arrowleft: <g><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></g>,
  sprout: <g><path d="M12 21v-8" /><path d="M12 13c0-4 3-6 8-6 0 5-3 7-8 6Z" /><path d="M12 13c0-3.5-2.5-5-7-5 0 4.5 2.5 6 7 5Z" /></g>,
  grid: <g><rect x="3" y="3" width="7.5" height="7.5" rx="1" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1" /></g>,
  pencil: <g><path d="M4 20h4l10-10-4-4L4 16v4Z" /><path d="m14 6 4 4" /></g>,
  chat: <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.9 8.9 0 0 1-3.8-.8L3 21l1.9-5.2A8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5Z" />,
  history: <g><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 8v5l4 2" /></g>,
  swap: <g><path d="M3 8h14l-3-3" /><path d="M21 16H7l3 3" /></g>
};

function Ico(p) {
  var size = p.size || 18;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={p.color || "currentColor"}
      strokeWidth={p.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round"
      className={p.className} style={Object.assign({ flexShrink: 0 }, p.style || {})}>
      {ICON_PATHS[p.name] || null}
    </svg>
  );
}

/* ---------------- fonts + print css ---------------- */
function FontLoader() {
  var css = "@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Courier+Prime:wght@400;700&family=Inter:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@500;700&display=swap');"
    + ".rb-display{font-family:'Oswald',sans-serif;letter-spacing:.02em;text-transform:uppercase}"
    + ".rb-mono{font-family:'Courier Prime',monospace}"
    + ".rb-urdu{font-family:'Noto Nastaliq Urdu',serif;line-height:2.1}"
    + "[dir=rtl] .rb-mono{direction:ltr;unicode-bidi:embed}"
    + "@keyframes rb2spin{to{transform:rotate(360deg)}}"
    + ".rb2-spin{animation:rb2spin 1s linear infinite}"
    + "#rb-root input,#rb-root select,#rb-root textarea,#rb-root button{font-family:inherit}"
    + "#rb-root button{box-shadow:none}"
    + "@media print{body *{visibility:hidden}.print-area,.print-area *{visibility:visible}"
    + ".print-area{position:absolute;top:0;left:0;width:100%}.no-print{display:none!important}}";
  return <style>{css}</style>;
}

/* ---------------- shared bits ---------------- */
function rbInput() {
  return {
    width: "100%", padding: "9px 10px", borderRadius: 6, border: "1.5px solid " + TC.paperLine,
    background: TC.cream, color: TC.ink, fontSize: 13.5, outline: "none", boxSizing: "border-box"
  };
}
function rbBtnOutline(color) {
  return {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    padding: "9px 8px", borderRadius: 7, border: "1.5px solid " + color, background: "transparent",
    color: color, fontSize: 12.5, fontWeight: 600, cursor: "pointer"
  };
}
function Field(p) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, color: TC.inkSoft, marginBottom: 4, fontWeight: 600 }} className={p.className}>{p.label}</div>
      {p.children}
    </div>
  );
}
function TotalRow(p) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" }}>
      <span style={{ fontSize: p.bold ? 13.5 : 12.5, color: p.accent || TC.ink, fontWeight: p.bold ? 700 : 600 }}>{p.label}</span>
      <span className="rb-mono" style={{ fontSize: p.bold ? 16 : 14, color: p.accent || TC.ink, fontWeight: 700 }}>Rs {p.value}</span>
    </div>
  );
}
function StatBlock(p) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 9, color: TC.inkSoft }}>{p.label}</div>
      <div className="rb-mono" style={{ fontSize: 13.5, fontWeight: p.bold ? 700 : 600, color: p.color || TC.ink }}>{p.value}</div>
    </div>
  );
}
function EmptyState(p) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 30px", textAlign: "center", gap: 10 }}>
      {p.icon}
      <div style={{ color: TC.concrete, fontSize: 13.5, maxWidth: 260 }}>{p.text}</div>
      {p.sub ? <div style={{ color: "#6B6656", fontSize: 12 }}>{p.sub}</div> : null}
    </div>
  );
}
function ModalShell(p) {
  return (
    <div onClick={p.onClose} className="no-print" style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9070,
      display: "flex", alignItems: "flex-end", justifyContent: "center"
    }}>
      <div onClick={function (e) { e.stopPropagation(); }} style={{
        width: "100%", maxWidth: 480, background: TC.appBg, borderRadius: "16px 16px 0 0",
        padding: 18, maxHeight: "85vh", overflowY: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="rb-display" style={{ color: TC.cream, fontSize: 15, fontWeight: 600 }}>{p.title}</div>
          <button onClick={p.onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <Ico name="x" size={20} color="#A39C8A" />
          </button>
        </div>
        {p.children}
      </div>
    </div>
  );
}
function RangeFilter(p) {
  var t = p.t, range = p.range, onChange = p.onChange;
  var presets = [["today", t("today")], ["7d", t("last7Days")], ["30d", t("last30Days")], ["all", t("allTime")], ["custom", t("customRange")]];
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        {presets.map(function (pr) {
          var id = pr[0], label = pr[1], on = range.preset === id;
          return (
            <button key={id} onClick={function () { onChange(Object.assign({}, range, { preset: id })); }} style={{
              padding: "5px 11px", borderRadius: 16, border: "1.5px solid " + (on ? TC.amber : "#3A362C"),
              background: on ? TC.amber : "transparent", color: on ? TC.ink : "#A39C8A",
              fontSize: 11.5, fontWeight: 600, cursor: "pointer"
            }}>{label}</button>
          );
        })}
      </div>
      {range.preset === "custom" ? (
        <div style={{ display: "flex", gap: 8 }}>
          <input type="date" value={range.from || ""} onChange={function (e) { onChange(Object.assign({}, range, { from: e.target.value })); }}
            style={Object.assign({}, rbInput(), { fontSize: 12, padding: "6px 8px" })} />
          <input type="date" value={range.to || ""} onChange={function (e) { onChange(Object.assign({}, range, { to: e.target.value })); }}
            style={Object.assign({}, rbInput(), { fontSize: 12, padding: "6px 8px" })} />
        </div>
      ) : null}
    </div>
  );
}

function AppHeader(p) {
  var t = p.t, role = p.role;
  return (
    <div style={{ background: TC.appBg2, borderBottom: "3px solid " + TC.stamp, padding: "16px 18px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="rb-display" style={{ color: TC.cream, fontSize: 21, fontWeight: 700 }}>{t("appName")}</div>
          <div style={{ color: "#B4AC98", fontSize: 11.5, marginTop: 2 }}>{t("tagline")}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            background: role === "admin" ? TC.stamp : TC.slab, color: TC.cream,
            fontSize: 10.5, fontWeight: 700, padding: "5px 10px", borderRadius: 5,
            textTransform: "uppercase", letterSpacing: "0.05em"
          }}>{role === "admin" ? t("admin") : t("accountant")}</div>
          {p.onLogout ? (
            <button onClick={p.onLogout} style={{
              background: "transparent", border: "1.5px solid #6B6656", color: "#D8CDA9",
              fontSize: 10, fontWeight: 700, padding: "5px 9px", borderRadius: 5, cursor: "pointer"
            }}>Logout</button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TabBar(p) {
  var t = p.t, tab = p.tab, setTab = p.setTab, role = p.role, duesCount = p.duesCount, permissions = p.permissions;
  var tabs = [{ id: "sale", label: t("navSale"), icon: "receipt" }];
  tabs.push({ id: "bills", label: t("navBills"), icon: "history" });
  if (hasPerm(role, permissions, "stock")) {
    tabs.push({ id: "stock", label: t("navStock"), icon: "pkg" });
    } if (hasPerm(role, permissions, "wastage")) { tabs.push({ id: "wastage", label: t("navWastage"), icon: "trash" });
  }
  tabs.push({ id: "gatepass", label: t("navGatePass"), icon: "truck" });
  tabs.push({ id: "dues", label: t("navDues"), icon: "wallet", badge: duesCount });
  tabs.push({ id: "settings", label: t("navSettings"), icon: "gear" });
  return (
    <div className="no-print" style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 480, background: TC.appBg2, borderTop: "1px solid #3A362C",
      display: "flex", padding: "8px 6px 8px", zIndex: 9040
    }}>
      {tabs.map(function (it) {
        var active = tab === it.id;
        return (
          <button key={it.id} onClick={function () { setTab(it.id); }} style={{
            flex: 1, background: "none", border: "none", display: "flex",
            flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 2px",
            cursor: "pointer", position: "relative"
          }}>
            <Ico name={it.icon} size={19} color={active ? TC.stamp : "#8B8577"} strokeWidth={active ? 2.4 : 2} />
            <span style={{ fontSize: 9.5, color: active ? TC.cream : "#8B8577", fontWeight: active ? 600 : 500, whiteSpace: "nowrap" }}>{it.label}</span>
            {it.badge ? (
              <span style={{
                position: "absolute", top: 0, right: "26%", background: TC.amber, color: TC.ink,
                fontSize: 9, fontWeight: 700, borderRadius: 8, minWidth: 15, height: 15,
                display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px"
              }}>{it.badge}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
