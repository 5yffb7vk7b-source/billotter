/* Billotter — fully client-side invoice generator. No network calls, ever. */
(() => {
  "use strict";

  // Where "Get Pro" sends buyers (Ko-fi shop item).
  const PAYMENT_LINK = "https://ko-fi.com/s/1765e9aa86";
  // SHA-256 of the Pro unlock code delivered after purchase.
  const UNLOCK_HASH = "7b4b6a2a5e54e7f9d475d45fcb631bdb38b4c243145b7c650dd388fd958155ff";

  const STORE_KEY = "billotter.invoice.v1";
  const LIST_KEY = "billotter.invoices.v1";
  const PRO_KEY = "billotter.pro";
  const CLIENTS_KEY = "billotter.clients.v1";
  const ITEMLIB_KEY = "billotter.itemlib.v1";
  const PROFILES_KEY = "billotter.profiles.v1";
  // Free taste of the Pro workflow features: one client, three saved items, one profile.
  const FREE_CLIENTS = 1, FREE_LIB_ITEMS = 3, FREE_PROFILES = 1;
  const DEFAULT_ACCENT = "#0d9488";
  // Payment terms → net days added to the invoice date to compute the due date.
  const TERM_DAYS = { receipt: 0, "7": 7, "14": 14, "15": 15, "30": 30, "60": 60 };

  // value = requires Pro
  const THEMES = { classic: false, minimal: false, serif: true, bold: true };
  const DOC_TYPES = {
    invoice: { title: "INVOICE", due: "Due" },
    estimate: { title: "ESTIMATE", due: "Valid" },
    quote: { title: "QUOTE", due: "Valid" },
    receipt: { title: "RECEIPT", due: "Due" },
  };

  const CURRENCIES = [
    "USD","EUR","GBP","CAD","AUD","NZD","CHF","JPY","CNY","INR","SGD","HKD",
    "SEK","NOK","DKK","PLN","CZK","RON","HUF","BRL","MXN","ZAR","AED","TRY","ILS","KRW"
  ];

  // Prefills for the SEO landing pages (templates/<slug>/ links here with ?template=<slug>).
  // Keep in sync with scripts/gen-templates.mjs — it emits scripts/templates-map.json to diff against.
  const TEMPLATES = {
    "photography": {
      items: [
        { desc: "Photography session — [event / portrait / product] (hours)", qty: "4", rate: "" },
        { desc: "Photo editing & retouching (per edited image)", qty: "25", rate: "" },
        { desc: "Online gallery — hosting & digital delivery", qty: "1", rate: "" },
        { desc: "Travel & mileage", qty: "1", rate: "" },
      ],
      notes: "Edited high-resolution images delivered via private online gallery within 14 days.",
      terms: "50% retainer due at booking; balance due before final delivery. Images licensed for personal use — commercial licensing available on request.",
    },
    "graphic-design": {
      items: [
        { desc: "Logo design — 3 concepts, 2 revision rounds", qty: "1", rate: "" },
        { desc: "Brand style guide (colors, typography, usage)", qty: "1", rate: "" },
        { desc: "Business card & letterhead design", qty: "1", rate: "" },
        { desc: "Additional revisions beyond included rounds (hourly)", qty: "2", rate: "" },
      ],
      notes: "Final files delivered as AI, SVG, PNG and PDF on receipt of payment.",
      terms: "50% due upfront, 50% on delivery. Two revision rounds included; further revisions billed at the hourly rate above. Full usage rights transfer on final payment.",
    },
    "web-development": {
      items: [
        { desc: "Development — [feature / project phase] (hours)", qty: "20", rate: "" },
        { desc: "Responsive design & cross-browser testing", qty: "1", rate: "" },
        { desc: "Deployment & launch support", qty: "1", rate: "" },
        { desc: "Post-launch bug-fix window (30 days)", qty: "1", rate: "" },
      ],
      notes: "Source code delivered via private Git repository on payment.",
      terms: "Payment due within 14 days of invoice date. Work on subsequent milestones begins once payment clears.",
    },
    "writing": {
      items: [
        { desc: "Blog article — research, writing, 1 revision round (per word)", qty: "1500", rate: "" },
        { desc: "SEO meta title & description", qty: "1", rate: "" },
        { desc: "Content brief & keyword research", qty: "1", rate: "" },
      ],
      notes: "One revision round included per article; further revisions billed separately.",
      terms: "Payment due within 14 days. A 50% kill fee applies to commissioned work cancelled after drafting begins.",
    },
    "consulting": {
      items: [
        { desc: "Strategy consulting — [engagement / phase] (hours)", qty: "10", rate: "" },
        { desc: "Discovery workshop & stakeholder interviews", qty: "1", rate: "" },
        { desc: "Written recommendations report", qty: "1", rate: "" },
      ],
      notes: "Summary of findings and recommended next steps delivered separately.",
      terms: "Net 15. Late payments accrue 1.5% monthly interest. Work beyond the agreed scope is quoted separately.",
    },
    "tutoring": {
      items: [
        { desc: "Tutoring session — 60 minutes", qty: "4", rate: "" },
        { desc: "Custom study materials & practice sets", qty: "1", rate: "" },
        { desc: "Progress report & parent consultation", qty: "1", rate: "" },
      ],
      notes: "Sessions covered by this invoice: [dates].",
      terms: "Payment due before the first session of the month. Sessions cancelled with less than 24 hours' notice are billed in full.",
    },
    "videography": {
      items: [
        { desc: "Filming day rate — crew of one, camera & audio", qty: "1", rate: "" },
        { desc: "Video editing & color grading (hours)", qty: "8", rate: "" },
        { desc: "Licensed music & stock footage (pass-through)", qty: "1", rate: "" },
        { desc: "Final delivery — 4K master + social cuts", qty: "1", rate: "" },
      ],
      notes: "Two revision rounds included on the edit; further rounds billed hourly.",
      terms: "50% deposit reserves the shoot date; balance due on delivery of final files. Raw footage available for an additional fee.",
    },
    "cleaning": {
      items: [
        { desc: "Standard home cleaning — 3 bed / 2 bath", qty: "1", rate: "" },
        { desc: "Deep-clean add-on — oven, fridge & baseboards", qty: "1", rate: "" },
        { desc: "Cleaning supplies & materials", qty: "1", rate: "" },
      ],
      notes: "Service address: [address]. Date of service: [date].",
      terms: "Payment due on the day of service. Cancellations with less than 48 hours' notice incur a 50% fee.",
    },
    "plumbing": {
      items: [
        { desc: "Service call — diagnosis & estimate", qty: "1", rate: "" },
        { desc: "Labor — [repair / installation] (hours)", qty: "2", rate: "" },
        { desc: "Parts & materials — [valve / heater / fittings]", qty: "1", rate: "" },
        { desc: "After-hours emergency surcharge", qty: "1", rate: "" },
      ],
      notes: "Service address: [address]. Licensed & insured — license #[number]. Labor warrantied for 90 days.",
      terms: "Payment due on completion. Parts carry the manufacturer's warranty; labor warrantied 90 days from service date.",
    },
    "electrician": {
      items: [
        { desc: "Troubleshooting & diagnosis (hours)", qty: "1", rate: "" },
        { desc: "Installation labor — [panel / fixtures / circuit] (hours)", qty: "3", rate: "" },
        { desc: "Materials — [wire / breakers / fixtures]", qty: "1", rate: "" },
        { desc: "Permit & inspection fee", qty: "1", rate: "" },
      ],
      notes: "Work performed to NEC and local code. Licensed & insured — license #[number].",
      terms: "Payment due on completion for service work; Net 15 on contractor accounts. Labor warrantied 12 months from service date.",
    },
    "landscaping": {
      items: [
        { desc: "Lawn maintenance — mow, edge, blow (per visit)", qty: "4", rate: "" },
        { desc: "Seasonal cleanup — beds, leaves & pruning", qty: "1", rate: "" },
        { desc: "Mulch — delivered & installed (cu yd)", qty: "5", rate: "" },
        { desc: "Green waste haul-away & disposal", qty: "1", rate: "" },
      ],
      notes: "Service address: [address]. Service period: [month]. Weather-delayed visits roll to the next scheduled day.",
      terms: "Recurring maintenance invoiced monthly, due within 7 days. Projects over [amount] require a 50% materials deposit before scheduling.",
    },
    "handyman": {
      items: [
        { desc: "Labor — [task 1: e.g. interior door repair] (hours)", qty: "1", rate: "" },
        { desc: "Labor — [task 2: e.g. ceiling fan replacement] (hours)", qty: "1.5", rate: "" },
        { desc: "Materials & supplies (receipts available)", qty: "1", rate: "" },
        { desc: "Materials pickup & delivery", qty: "1", rate: "" },
      ],
      notes: "Service address: [address]. Additional tasks quoted and approved on site before work began.",
      terms: "Payment due on completion. Two-hour minimum applies to all service visits.",
    },
    "auto-repair": {
      items: [
        { desc: "Diagnostics — scan, inspection & road test", qty: "1", rate: "" },
        { desc: "Labor — [repair performed] (hours)", qty: "2.4", rate: "" },
        { desc: "Parts — [part name, OEM / aftermarket]", qty: "1", rate: "" },
        { desc: "Shop supplies & fluid disposal", qty: "1", rate: "" },
      ],
      notes: "Vehicle: [year make model] — plate [number], [mileage] mi. Work authorized by customer on [date].",
      terms: "Payment due on vehicle pickup. Parts & labor warrantied 12 months / 12,000 miles, whichever comes first.",
    },
    "catering": {
      items: [
        { desc: "Catering menu — [buffet / plated] (per guest)", qty: "85", rate: "" },
        { desc: "Service staff — [servers / bartender] (hours)", qty: "12", rate: "" },
        { desc: "Rentals — linens, glassware & serviceware", qty: "1", rate: "" },
        { desc: "Delivery, setup & breakdown", qty: "1", rate: "" },
      ],
      notes: "Event: [date, venue]. Final guest count of [number] confirmed [date]. Deposit of [amount] received [date] — balance shown below.",
      terms: "50% deposit reserves the event date. Final guest count due 7 days before the event; invoiced count is the greater of guaranteed and actual. Balance due on or before event day.",
    },
    "personal-training": {
      items: [
        { desc: "1-on-1 training — 10-session pack", qty: "1", rate: "" },
        { desc: "Initial assessment & movement screen", qty: "1", rate: "" },
        { desc: "Program design & monthly check-in (online)", qty: "1", rate: "" },
        { desc: "Late cancellation — [date] (per policy)", qty: "1", rate: "" },
      ],
      notes: "Pack valid for 12 weeks from first session. Sessions: [gym / online]. Progress check scheduled at session 10.",
      terms: "Packages payable in full before the first session. Cancellations with less than 24 hours' notice count as a completed session.",
    },
    "painting": {
      items: [
        { desc: "Surface prep — patch, sand, caulk & mask", qty: "1", rate: "" },
        { desc: "Interior painting — [rooms / area], 2 coats", qty: "3", rate: "" },
        { desc: "Trim, doors & ceilings", qty: "1", rate: "" },
        { desc: "Paint & materials — [brand, sheen] (gallons)", qty: "6", rate: "" },
      ],
      notes: "Colors: [names/codes]. Two coats throughout; touch-up walkthrough completed [date]. Leftover paint labeled and left with client.",
      terms: "One-third deposit to schedule; balance due on completion after final walkthrough. Workmanship warrantied for 2 years.",
    },
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    currency: $("currency"), taxRate: $("tax-rate"), discount: $("discount"),
    accent: $("accent-color"), docType: $("doc-type"), theme: $("theme"),
    docTitle: $("doc-title"), dueLabel: $("due-label"),
    number: $("inv-number"), date: $("inv-date"), due: $("inv-due"),
    from: $("from"), to: $("to"), notes: $("notes"), terms: $("terms"),
    itemsBody: $("items-body"), amountPaid: $("amount-paid"),
    logoImg: $("logo-img"), logoFile: $("logo-file"),
    btnLogo: $("btn-logo"), btnLogoRemove: $("btn-logo-remove"),
    saveNote: $("save-note"), invList: $("inv-list"),
  };

  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const defaultState = () => ({
    id: newId(),
    number: "INV-0001", date: todayISO(), due: "",
    from: "", to: "", notes: "", terms: "",
    currency: guessCurrency(), taxRate: "", discount: "", amountPaid: "",
    accent: DEFAULT_ACCENT, docType: "invoice", theme: "classic",
    logo: "", payLink: "", paymentTerms: "", items: [{ desc: "", qty: "1", rate: "" }],
  });

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function guessCurrency() {
    try {
      const region = (Intl.DateTimeFormat().resolvedOptions().locale.split("-")[1] || "US").toUpperCase();
      const map = { GB: "GBP", CA: "CAD", AU: "AUD", NZ: "NZD", JP: "JPY", IN: "INR", CH: "CHF",
        SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", CZ: "CZK", BR: "BRL", MX: "MXN", ZA: "ZAR",
        AE: "AED", TR: "TRY", IL: "ILS", KR: "KRW", SG: "SGD", HK: "HKD", CN: "CNY",
        DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", IE: "EUR", PT: "EUR", AT: "EUR", BE: "EUR", FI: "EUR" };
      return map[region] || "USD";
    } catch { return "USD"; }
  }

  function normalize(raw) {
    const s = { ...defaultState(), ...raw };
    if (!s.id) s.id = newId();
    if (!Array.isArray(s.items) || s.items.length === 0) s.items = [{ desc: "", qty: "1", rate: "" }];
    s.items = s.items.map((it) => ({ desc: String(it.desc ?? ""), qty: String(it.qty ?? ""), rate: String(it.rate ?? "") }));
    if (!CURRENCIES.includes(s.currency)) s.currency = "USD";
    if (!/^#[0-9a-fA-F]{6}$/.test(s.accent)) s.accent = DEFAULT_ACCENT;
    if (!(s.docType in DOC_TYPES)) s.docType = "invoice";
    if (!(s.theme in THEMES)) s.theme = "classic";
    s.payLink = String(s.payLink ?? "");
    if (s.paymentTerms !== "" && !(s.paymentTerms in TERM_DAYS)) s.paymentTerms = "";
    return s;
  }

  function loadJsonList(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) { const l = JSON.parse(raw); if (Array.isArray(l)) return l; }
    } catch { /* corrupted — start fresh */ }
    return [];
  }
  let clients = loadJsonList(CLIENTS_KEY).filter((c) => c && c.id && c.label && typeof c.to === "string");
  let itemLib = loadJsonList(ITEMLIB_KEY).filter((x) => x && x.id && typeof x.desc === "string");
  let profiles = loadJsonList(PROFILES_KEY).filter((p) => p && p.id && p.label && typeof p.from === "string");
  const saveClients = () => { try { localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients)); } catch { /* full */ } };
  const saveLib = () => { try { localStorage.setItem(ITEMLIB_KEY, JSON.stringify(itemLib)); } catch { /* full */ } };
  const saveProfiles = () => { try { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); } catch { /* full */ } };

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return normalize(JSON.parse(raw));
    } catch { /* corrupted storage — start fresh */ }
    return defaultState();
  }

  function loadList() {
    try {
      const raw = localStorage.getItem(LIST_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) return list.map(normalize);
      }
    } catch { /* corrupted list — start fresh */ }
    return [];
  }

  let state = load();
  let invoices = loadList();

  // An invoice is only worth keeping in the list once it says something.
  // "from" doesn't count: it carries over to new invoices, which start empty.
  const hasContent = (s) =>
    Boolean(s.to.trim() || s.items.some((it) => it.desc.trim() || num(it.rate)));

  function upsertCurrent() {
    if (!hasContent(state)) return;
    const copy = JSON.parse(JSON.stringify(state));
    const i = invoices.findIndex((inv) => inv.id === state.id);
    if (i >= 0) invoices[i] = copy; else invoices.unshift(copy);
    if (invoices.length > 50) invoices.length = 50;
  }

  let saveTimer;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        upsertCurrent();
        localStorage.setItem(STORE_KEY, JSON.stringify(state));
        localStorage.setItem(LIST_KEY, JSON.stringify(invoices));
        els.saveNote.textContent = "Saved locally ✓";
      } catch {
        els.saveNote.textContent = "Couldn't save (storage full?)";
      }
      renderList();
    }, 250);
  }

  // ---------- money ----------
  const fmt = () => new Intl.NumberFormat(undefined, { style: "currency", currency: state.currency });
  const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

  function totals(s = state) {
    const subtotal = s.items.reduce((sum, it) => sum + num(it.qty) * num(it.rate), 0);
    const discount = subtotal * num(s.discount) / 100;
    const taxed = (subtotal - discount) * num(s.taxRate) / 100;
    const total = subtotal - discount + taxed;
    return { subtotal, discount, taxed, total, due: total - num(s.amountPaid) };
  }

  function renderTotals() {
    const t = totals(), f = fmt();
    $("t-subtotal").textContent = f.format(t.subtotal);
    $("row-discount").hidden = !num(state.discount);
    $("t-discount-pct").textContent = num(state.discount) + "%";
    $("t-discount").textContent = "−" + f.format(t.discount);
    $("row-tax").hidden = !num(state.taxRate);
    $("t-tax-pct").textContent = num(state.taxRate) + "%";
    $("t-tax").textContent = f.format(t.taxed);
    $("t-total").textContent = f.format(t.total);
    $("t-due").textContent = f.format(t.due);
    // Fully-settled invoices get the rubber stamp — receipts feel like receipts.
    $("sheet").classList.toggle("paid", t.total > 0 && num(state.amountPaid) > 0 && t.due <= 0.005);
  }

  // ---------- line items ----------
  function addItem(focus) {
    state.items.push({ desc: "", qty: "1", rate: "" });
    renderItems();
    if (focus) {
      const rows = els.itemsBody.querySelectorAll("tr");
      rows[rows.length - 1]?.querySelector("textarea")?.focus();
    }
    save();
  }

  // Reorder a line without retyping it. Keyboard-friendly: focus follows the moved row.
  function moveItem(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= state.items.length) return;
    [state.items[i], state.items[j]] = [state.items[j], state.items[i]];
    renderItems(); renderTotals(); save();
    const row = els.itemsBody.querySelectorAll("tr")[j];
    const btn = row?.querySelector(dir < 0 ? ".row-move-up" : ".row-move-down");
    (btn && !btn.disabled ? btn : row?.querySelector("textarea"))?.focus();
  }

  function renderItems() {
    els.itemsBody.textContent = "";
    state.items.forEach((item, i) => {
      const tr = document.createElement("tr");
      const isLast = () => i === state.items.length - 1;

      const mkInput = (props) => {
        const el = document.createElement("input");
        Object.assign(el, props);
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && isLast()) { e.preventDefault(); addItem(true); }
        });
        return el;
      };

      const tdDesc = document.createElement("td");
      // Textarea, not input: long descriptions wrap (and print in full) instead of clipping.
      const desc = document.createElement("textarea");
      desc.rows = 1;
      desc.placeholder = "Description of work or product";
      desc.value = item.desc;
      desc.setAttribute("aria-label", `Line ${i + 1} description`);
      desc.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && isLast()) { e.preventDefault(); addItem(true); }
      });
      desc.addEventListener("input", () => { item.desc = desc.value; save(); });
      autogrow(desc);
      tdDesc.appendChild(desc);

      const tdQty = document.createElement("td");
      const qty = mkInput({ type: "number", min: "0", step: "any", placeholder: "1", value: item.qty, ariaLabel: `Line ${i + 1} quantity` });
      qty.addEventListener("input", () => { item.qty = qty.value; updateRow(); });
      tdQty.appendChild(qty);

      const tdRate = document.createElement("td");
      const rate = mkInput({ type: "number", min: "0", step: "any", placeholder: "0.00", value: item.rate, ariaLabel: `Line ${i + 1} rate` });
      rate.addEventListener("input", () => { item.rate = rate.value; updateRow(); });
      tdRate.appendChild(rate);

      const tdAmount = document.createElement("td");
      tdAmount.className = "col-amount";

      const tdX = document.createElement("td");
      tdX.className = "no-print";

      const up = document.createElement("button");
      up.className = "row-move row-move-up"; up.textContent = "↑"; up.title = "Move line up";
      up.setAttribute("aria-label", `Move line ${i + 1} up`);
      up.disabled = i === 0;
      up.addEventListener("click", () => moveItem(i, -1));

      const down = document.createElement("button");
      down.className = "row-move row-move-down"; down.textContent = "↓"; down.title = "Move line down";
      down.setAttribute("aria-label", `Move line ${i + 1} down`);
      down.disabled = i === state.items.length - 1;
      down.addEventListener("click", () => moveItem(i, 1));

      const x = document.createElement("button");
      x.className = "row-remove"; x.textContent = "✕"; x.title = "Remove line";
      x.setAttribute("aria-label", `Remove line ${i + 1}`);
      x.addEventListener("click", () => {
        state.items.splice(i, 1);
        if (state.items.length === 0) state.items.push({ desc: "", qty: "1", rate: "" });
        renderItems(); renderTotals(); save();
      });

      const star = document.createElement("button");
      star.className = "row-save";
      star.textContent = "★";
      star.title = "Save to item library";
      star.setAttribute("aria-label", `Save line ${i + 1} to item library`);
      star.addEventListener("click", () => {
        const d = item.desc.trim();
        if (!d) { els.saveNote.textContent = "Give the line a description first."; return; }
        const existing = itemLib.find((l) => l.desc.trim().toLowerCase() === d.toLowerCase());
        if (!existing && itemLib.length >= FREE_LIB_ITEMS && !isPro()) { openModal(); return; }
        if (existing) existing.rate = item.rate;
        else itemLib.unshift({ id: newId(), desc: item.desc, rate: item.rate });
        saveLib(); renderLib();
        els.saveNote.textContent = existing ? "Library item updated ✓" : "Saved to item library ✓";
      });
      const actions = document.createElement("div");
      actions.className = "row-actions";
      actions.append(up, down, star, x);
      tdX.appendChild(actions);

      function updateRow() {
        tdAmount.textContent = fmt().format(num(item.qty) * num(item.rate));
        renderTotals(); save();
      }
      updateRow();

      tr.append(tdDesc, tdQty, tdRate, tdAmount, tdX);
      els.itemsBody.appendChild(tr);
    });
  }

  // ---------- saved invoices ----------
  // A quiet year-to-date tally so repeat users watch the money add up.
  function renderSummary() {
    const box = $("inv-summary");
    if (!box) return;
    const cur = state.currency, year = String(new Date().getFullYear());
    const mine = invoices.filter((inv) =>
      inv.docType === "invoice" && inv.currency === cur && String(inv.date).slice(0, 4) === year);
    if (mine.length === 0) { box.hidden = true; box.textContent = ""; return; }
    let invoiced = 0, outstanding = 0;
    mine.forEach((inv) => { const t = totals(inv); invoiced += t.total; outstanding += Math.max(0, t.due); });
    const f = new Intl.NumberFormat(undefined, { style: "currency", currency: cur });
    box.textContent = "";
    const yr = document.createElement("span");
    yr.className = "sum-year";
    yr.textContent = `${year} · ${cur}`;
    const line = document.createElement("span");
    line.className = "sum-line";
    const outStr = outstanding > 0.005 ? ` · ${f.format(outstanding)} due` : "";
    line.textContent = `${mine.length} invoice${mine.length === 1 ? "" : "s"} · ${f.format(invoiced)} invoiced${outStr}`;
    box.append(yr, line);
    box.hidden = false;
  }

  function renderList() {
    if (!els.invList) return;
    renderSummary();
    els.invList.textContent = "";
    if (invoices.length === 0) {
      const p = document.createElement("p");
      p.className = "inv-empty";
      p.textContent = "Invoices you create appear here.";
      els.invList.appendChild(p);
      return;
    }
    invoices.forEach((inv) => {
      const row = document.createElement("div");
      row.className = "inv-item" + (inv.id === state.id ? " current" : "");

      const open = document.createElement("button");
      open.className = "inv-open";
      open.type = "button";
      const client = (inv.to.split("\n")[0] || "—").trim() || "—";
      const total = new Intl.NumberFormat(undefined, { style: "currency", currency: inv.currency }).format(totals(inv).total);
      open.innerHTML = `<span class="inv-num"></span><span class="inv-client"></span><span class="inv-total"></span>`;
      open.querySelector(".inv-num").textContent = inv.number || "—";
      open.querySelector(".inv-client").textContent = client;
      open.querySelector(".inv-total").textContent = total;
      open.addEventListener("click", () => {
        if (inv.id === state.id) return;
        state = normalize(JSON.parse(JSON.stringify(inv)));
        hydrate(); save();
      });
      row.appendChild(open);

      if (inv.id !== state.id) {
        const del = document.createElement("button");
        del.className = "inv-del"; del.type = "button"; del.textContent = "✕";
        del.setAttribute("aria-label", `Delete invoice ${inv.number}`);
        del.addEventListener("click", () => {
          invoices = invoices.filter((x) => x.id !== inv.id);
          localStorage.setItem(LIST_KEY, JSON.stringify(invoices));
          renderList();
        });
        row.appendChild(del);
      }
      els.invList.appendChild(row);
    });
  }

  // ---------- field bindings ----------
  function bind(el, key, after) {
    el.value = state[key];
    if (!el.dataset.bound) {
      el.dataset.bound = "1";
      el.addEventListener("input", () => {
        state[key] = el.value;
        if (after) after();
        save();
      });
    }
  }

  function autogrow(ta) {
    const fit = () => { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; };
    if (!ta.dataset.grow) {
      ta.dataset.grow = "1";
      ta.addEventListener("input", fit);
    }
    setTimeout(fit, 0);
  }

  // ---------- logo ----------
  function renderLogo() {
    const has = Boolean(state.logo);
    els.logoImg.hidden = !has;
    if (has) els.logoImg.src = state.logo;
    els.btnLogo.hidden = has;
    els.btnLogoRemove.hidden = !has;
  }

  els.btnLogo.addEventListener("click", () => els.logoFile.click());
  els.logoFile.addEventListener("change", () => {
    const file = els.logoFile.files[0];
    if (!file) return;
    if (file.size > 800 * 1024) { alert("Please use an image under 800 KB."); return; }
    const reader = new FileReader();
    reader.onload = () => { state.logo = reader.result; renderLogo(); save(); };
    reader.readAsDataURL(file);
    els.logoFile.value = "";
  });
  els.btnLogoRemove.addEventListener("click", () => { state.logo = ""; renderLogo(); save(); });

  // ---------- document type & theme ----------
  function applyDoc() {
    const sheet = $("sheet");
    Object.keys(THEMES).forEach((t) => sheet.classList.toggle("theme-" + t, state.theme === t));
    els.docTitle.textContent = DOC_TYPES[state.docType].title;
    els.dueLabel.textContent = DOC_TYPES[state.docType].due;
    els.docType.value = state.docType;
    els.theme.value = state.theme;
  }

  els.theme.addEventListener("change", () => {
    if (THEMES[els.theme.value] && !isPro()) {
      els.theme.value = state.theme; // snap back, pitch Pro
      openModal();
      return;
    }
    state.theme = els.theme.value;
    applyDoc(); save();
  });

  // ---------- accent color (Pro) ----------
  function applyAccent() {
    const sheet = $("sheet");
    sheet.style.setProperty("--sheet-accent", state.accent);
    els.accent.value = state.accent;
  }

  els.accent.addEventListener("input", () => {
    if (!isPro()) {
      els.accent.value = state.accent;
      openModal();
      return;
    }
    state.accent = els.accent.value;
    applyAccent(); save();
  });

  // ---------- toolbar actions ----------
  $("btn-download").addEventListener("click", () => window.print());

  // Keep PDFs clean: no placeholder ghost-text, no empty optional rows.
  // Also name the saved PDF after the document ("INV-0007 — Acme Co"), not the page title.
  const printHidden = [];
  let prePrintTitle = null;
  window.addEventListener("beforeprint", () => {
    prePrintTitle = document.title;
    const client = (state.to.split("\n")[0] || "").trim();
    document.title = [state.number || DOC_TYPES[state.docType].title, client].filter(Boolean).join(" — ");
    document.querySelectorAll(".sheet input, .sheet textarea").forEach((el) => {
      if (!el.value && el.placeholder) { el.dataset.ph = el.placeholder; el.placeholder = ""; }
    });
    document.querySelectorAll(".sheet input[type=date]").forEach((el) => {
      if (!el.value) { printHidden.push(el.closest(".meta-row")); }
    });
    if (!num(state.amountPaid)) printHidden.push(document.querySelector(".totals-paid"));
    printHidden.forEach((row) => { if (row) row.style.visibility = "hidden"; });
  });
  window.addEventListener("afterprint", () => {
    if (prePrintTitle !== null) { document.title = prePrintTitle; prePrintTitle = null; }
    document.querySelectorAll(".sheet input, .sheet textarea").forEach((el) => {
      if (el.dataset.ph) { el.placeholder = el.dataset.ph; delete el.dataset.ph; }
    });
    printHidden.forEach((row) => { if (row) row.style.visibility = ""; });
    printHidden.length = 0;
  });

  $("btn-new").addEventListener("click", () => {
    upsertCurrent();
    const numbers = [state.number, ...invoices.map((i) => i.number)];
    const next = nextNumber(numbers);
    state = { ...normalize(JSON.parse(JSON.stringify(state))), id: newId(), number: next,
      date: todayISO(), due: "", to: "", notes: "", amountPaid: "",
      items: [{ desc: "", qty: "1", rate: "" }] };
    hydrate(); save();
  });

  // Same document again for a repeat client: everything kept, fresh number & date.
  $("btn-duplicate").addEventListener("click", () => {
    upsertCurrent();
    state = { ...normalize(JSON.parse(JSON.stringify(state))), id: newId(),
      number: nextNumber([state.number, ...invoices.map((i) => i.number)]),
      date: todayISO() };
    hydrate(); save();
  });

  // ---------- backup (export / import) ----------
  $("btn-export").addEventListener("click", () => {
    upsertCurrent();
    const payload = { app: "billotter", version: 1, exported: todayISO(), current: state, invoices, clients, itemLib, profiles };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `billotter-backup-${todayISO()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  $("btn-import").addEventListener("click", () => $("import-file").click());
  $("import-file").addEventListener("change", () => {
    const file = $("import-file").files[0];
    $("import-file").value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const incoming = Array.isArray(data) ? data : Array.isArray(data.invoices) ? data.invoices : null;
        if (!incoming) throw new Error("no invoices");
        let added = 0;
        incoming.map(normalize).forEach((inv) => {
          if (inv.id !== state.id && !invoices.some((x) => x.id === inv.id)) { invoices.push(inv); added++; }
        });
        if (Array.isArray(data.clients)) {
          data.clients.forEach((c) => {
            if (c && c.id && c.label && !clients.some((x) => x.id === c.id)) clients.push(c);
          });
          saveClients(); renderClients();
        }
        if (Array.isArray(data.itemLib)) {
          data.itemLib.forEach((l) => {
            if (l && l.id && l.desc && !itemLib.some((x) => x.id === l.id)) itemLib.push(l);
          });
          saveLib(); renderLib();
        }
        if (Array.isArray(data.profiles)) {
          data.profiles.forEach((p) => {
            if (p && p.id && p.label && !profiles.some((x) => x.id === p.id)) profiles.push(p);
          });
          saveProfiles(); renderProfiles();
        }
        // Restore the exported working copy too — but never over unsaved work.
        if (data.current && !hasContent(state)) {
          const cur = normalize(data.current);
          if (invoices.some((x) => x.id === cur.id)) cur.id = newId();
          state = cur;
        }
        hydrate(); save();
        setTimeout(() => { els.saveNote.textContent = `Imported ${added} invoice${added === 1 ? "" : "s"} ✓`; }, 350);
      } catch {
        els.saveNote.textContent = "That file doesn't look like an Billotter backup.";
      }
    };
    reader.readAsText(file);
  });

  // Export every saved invoice as a spreadsheet — for the accountant, at tax time (Pro).
  $("btn-export-csv").addEventListener("click", () => {
    if (!isPro()) { openModal(); return; }
    upsertCurrent();
    if (invoices.length === 0) { els.saveNote.textContent = "No saved invoices to export yet."; return; }
    const esc = (v) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const head = ["Number", "Date", "Due", "Type", "Client", "Currency",
      "Subtotal", "Discount", "Tax", "Total", "Paid", "Balance"];
    const rows = invoices.map((inv) => {
      const t = totals(inv);
      const client = (inv.to.split("\n")[0] || "").trim();
      return [inv.number, inv.date, inv.due, DOC_TYPES[inv.docType].title, client, inv.currency,
        t.subtotal.toFixed(2), t.discount.toFixed(2), t.taxed.toFixed(2), t.total.toFixed(2),
        num(inv.amountPaid).toFixed(2), t.due.toFixed(2)].map(esc).join(",");
    });
    const csv = head.join(",") + "\n" + rows.join("\n") + "\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `billotter-invoices-${todayISO()}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    els.saveNote.textContent = `Exported ${invoices.length} invoice${invoices.length === 1 ? "" : "s"} to CSV ✓`;
  });

  // Highest trailing number across known invoices, plus one — avoids duplicates.
  function nextNumber(numbers) {
    let prefix = "INV-", best = 0, width = 4;
    numbers.forEach((n) => {
      const m = String(n || "").match(/^(.*?)(\d+)\s*$/);
      if (m && parseInt(m[2], 10) >= best) {
        best = parseInt(m[2], 10); prefix = m[1]; width = m[2].length;
      }
    });
    return prefix + String(best + 1).padStart(width, "0");
  }

  $("btn-clear").addEventListener("click", () => {
    if (!confirm("Clear this invoice AND delete all locally saved invoices?")) return;
    localStorage.removeItem(STORE_KEY);
    localStorage.removeItem(LIST_KEY);
    invoices = [];
    state = defaultState();
    hydrate(); save();
  });

  // ---------- client book ----------
  const clientLabel = (to) => (to.split("\n")[0] || "").trim();

  function renderClients() {
    const row = $("client-row"), sel = $("client-pick");
    row.hidden = clients.length === 0;
    if (row.hidden) return;
    sel.textContent = "";
    sel.add(new Option(`Saved clients (${clients.length})…`, ""));
    clients.forEach((c) => sel.add(new Option(c.label, c.id)));
    // Preselect when the sheet already shows a saved client, so "forget" has a target.
    const cur = clients.find((c) => c.to === state.to);
    sel.value = cur ? cur.id : "";
    $("btn-forget-client").hidden = !cur;
  }

  $("btn-save-client").addEventListener("click", () => {
    const label = clientLabel(state.to);
    if (!label) {
      els.saveNote.textContent = "Fill in “Bill to” first — the first line becomes the client name.";
      return;
    }
    const existing = clients.find((c) => c.label.toLowerCase() === label.toLowerCase());
    if (!existing && clients.length >= FREE_CLIENTS && !isPro()) { openModal(); return; }
    if (existing) existing.to = state.to;
    else clients.unshift({ id: newId(), label, to: state.to });
    saveClients(); renderClients();
    els.saveNote.textContent = existing ? `Client “${label}” updated ✓` : `Client “${label}” saved ✓`;
  });

  $("client-pick").addEventListener("change", () => {
    const c = clients.find((x) => x.id === $("client-pick").value);
    $("btn-forget-client").hidden = !c;
    if (!c) return;
    state.to = c.to;
    els.to.value = c.to;
    autogrow(els.to);
    save();
  });

  $("btn-forget-client").addEventListener("click", () => {
    const id = $("client-pick").value;
    if (!id) return;
    clients = clients.filter((c) => c.id !== id);
    saveClients(); renderClients();
    els.saveNote.textContent = "Client removed ✓";
  });

  // ---------- business profiles (Pro) ----------
  // Save multiple "From" identities (business + freelance, or several brands) and swap in one click.
  function renderProfiles() {
    const row = $("profile-row"), sel = $("profile-pick");
    if (!row || !sel) return;
    row.hidden = profiles.length === 0;
    if (row.hidden) return;
    sel.textContent = "";
    sel.add(new Option(`Saved profiles (${profiles.length})…`, ""));
    profiles.forEach((p) => sel.add(new Option(p.label, p.id)));
    const cur = profiles.find((p) => p.from === state.from);
    sel.value = cur ? cur.id : "";
    $("btn-forget-profile").hidden = !cur;
  }

  $("btn-save-profile").addEventListener("click", () => {
    const label = (state.from.split("\n")[0] || "").trim();
    if (!label) {
      els.saveNote.textContent = "Fill in “From” first — the first line becomes the profile name.";
      return;
    }
    const existing = profiles.find((p) => p.label.toLowerCase() === label.toLowerCase());
    if (!existing && profiles.length >= FREE_PROFILES && !isPro()) { openModal(); return; }
    if (existing) existing.from = state.from;
    else profiles.unshift({ id: newId(), label, from: state.from });
    saveProfiles(); renderProfiles();
    els.saveNote.textContent = existing ? `Profile “${label}” updated ✓` : `Profile “${label}” saved ✓`;
  });

  $("profile-pick").addEventListener("change", () => {
    const p = profiles.find((x) => x.id === $("profile-pick").value);
    $("btn-forget-profile").hidden = !p;
    if (!p) return;
    state.from = p.from;
    els.from.value = p.from;
    autogrow(els.from);
    save();
  });

  $("btn-forget-profile").addEventListener("click", () => {
    const id = $("profile-pick").value;
    if (!id) return;
    profiles = profiles.filter((p) => p.id !== id);
    saveProfiles(); renderProfiles();
    els.saveNote.textContent = "Profile removed ✓";
  });

  // ---------- item library ----------
  function renderLib() {
    const sel = $("lib-pick");
    sel.hidden = itemLib.length === 0;
    if (sel.hidden) return;
    sel.textContent = "";
    sel.add(new Option(`Item library (${itemLib.length})…`, ""));
    itemLib.forEach((x) => {
      const label = x.desc.length > 48 ? x.desc.slice(0, 48) + "…" : x.desc;
      sel.add(new Option(num(x.rate) ? `${label} — ${x.rate}` : label, x.id));
    });
    sel.add(new Option("— remove last inserted item —", "__forget"));
  }

  let lastLibPick = null;
  $("lib-pick").addEventListener("change", () => {
    const val = $("lib-pick").value;
    $("lib-pick").value = "";
    if (val === "__forget") {
      if (lastLibPick) {
        itemLib = itemLib.filter((x) => x.id !== lastLibPick);
        lastLibPick = null;
        saveLib(); renderLib();
        els.saveNote.textContent = "Library item removed ✓";
      } else {
        els.saveNote.textContent = "Insert an item first, then remove it here.";
      }
      return;
    }
    const x = itemLib.find((l) => l.id === val);
    if (!x) return;
    lastLibPick = x.id;
    const last = state.items[state.items.length - 1];
    if (last && !last.desc.trim() && !num(last.rate)) {
      last.desc = x.desc; last.rate = x.rate; last.qty = last.qty || "1";
    } else {
      state.items.push({ desc: x.desc, qty: "1", rate: x.rate });
    }
    renderItems(); renderTotals(); save();
  });

  // ---------- pay-by-QR (Pro) ----------
  function renderPay() {
    const block = $("pay-block");
    const link = state.payLink.trim();
    const show = Boolean(link) && isPro();
    block.hidden = !show;
    $("pay-link").value = state.payLink;
    if (!show) return;
    const url = /^https?:\/\//i.test(link) ? link : "https://" + link;
    const a = $("pay-link-a");
    a.href = url;
    a.textContent = link.replace(/^https?:\/\//i, "");
    try {
      const q = qrcode(0, "M");
      q.addData(url);
      q.make();
      $("pay-qr").src = q.createDataURL(4, 8);
      $("pay-qr").hidden = false;
    } catch { $("pay-qr").hidden = true; }
  }

  $("pay-link").addEventListener("input", () => {
    if (!isPro()) { $("pay-link").value = state.payLink; openModal(); return; }
    state.payLink = $("pay-link").value;
    renderPay(); save();
  });

  // ---------- payment terms → due date ----------
  function applyTerms() {
    const sel = $("pay-terms");
    if (sel) sel.value = state.paymentTerms;
  }

  // Set the due date to invoice date + N days. Called on term change and when the date moves.
  function dueFromTerms() {
    if (state.paymentTerms === "" || !state.date) return;
    const base = new Date(state.date + "T00:00:00");
    if (Number.isNaN(base.getTime())) return;
    base.setDate(base.getDate() + (TERM_DAYS[state.paymentTerms] || 0));
    const iso = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}`;
    state.due = iso;
    els.due.value = iso;
  }

  $("pay-terms").addEventListener("change", () => {
    state.paymentTerms = $("pay-terms").value;
    dueFromTerms();
    save();
  });

  // ---------- Pro ----------
  const modal = $("pro-modal");
  const isPro = () => localStorage.getItem(PRO_KEY) === "1";
  const openModal = () => { modal.hidden = false; };

  function renderPro() {
    document.body.classList.toggle("pro", isPro());
    $("pro-locked").hidden = isPro();
    $("pro-active").hidden = !isPro();
    const buy = $("btn-buy");
    const configured = PAYMENT_LINK.startsWith("http");
    buy.hidden = !configured;
    $("buy-unavailable").hidden = configured;
    if (configured) buy.href = PAYMENT_LINK;
    els.accent.closest(".control-group").classList.toggle("locked", !isPro());
    $("pay-link").closest(".control-group").classList.toggle("locked", !isPro());
    renderPay();
  }

  $("btn-open-pro").addEventListener("click", openModal);
  $("btn-close-pro").addEventListener("click", () => { modal.hidden = true; });
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") modal.hidden = true; });

  async function sha256hex(text) {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  const LICENSE_API = "https://billotter-license.vercel.app";

  function activatePro(msg) {
    localStorage.setItem(PRO_KEY, "1");
    renderPro();
    msg.textContent = "Unlocked — thank you!";
    msg.className = "pro-hint ok";
  }

  $("btn-unlock").addEventListener("click", async () => {
    const code = $("unlock-code").value.trim().toUpperCase();
    const msg = $("unlock-msg");
    if (!code) return;
    try {
      if (await sha256hex(code) === UNLOCK_HASH) return activatePro(msg);
      if (/^BILL-/.test(code)) {
        msg.textContent = "Checking your code…";
        msg.className = "pro-hint";
        const res = await fetch(`${LICENSE_API}/api/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.ok) return activatePro(msg);
        msg.textContent = data.error === "unknown code"
          ? "That code doesn't match a purchase — retrieve it below with your purchase email."
          : (data.error || "Couldn't verify the code — try again in a minute.");
        msg.className = "pro-hint err";
        return;
      }
      msg.textContent = "That code doesn't look right — it's shown right after your purchase.";
      msg.className = "pro-hint err";
    } catch {
      msg.textContent = "Couldn't verify the code — check your connection and try again.";
      msg.className = "pro-hint err";
    }
  });

  $("btn-lost-code").addEventListener("click", () => {
    const row = $("email-row");
    row.hidden = !row.hidden;
    if (!row.hidden) $("buyer-email").focus();
  });

  $("btn-get-code").addEventListener("click", async () => {
    const email = $("buyer-email").value.trim();
    const msg = $("unlock-msg");
    if (!email) return;
    msg.textContent = "Looking up your purchase…";
    msg.className = "pro-hint";
    try {
      const res = await fetch(`${LICENSE_API}/api/get-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok && data.code) {
        $("unlock-code").value = data.code;
        msg.textContent = "Code found and filled in — hit Activate.";
        msg.className = "pro-hint ok";
      } else {
        msg.textContent = data.error || "Couldn't look that up — try again in a minute.";
        msg.className = "pro-hint err";
      }
    } catch {
      msg.textContent = "Couldn't reach the license service — check your connection and try again.";
      msg.className = "pro-hint err";
    }
  });

  // ---------- URL templates (?template=<slug> from the SEO landing pages) ----------
  function applyUrlTemplate() {
    let slug = null;
    try { slug = new URLSearchParams(location.search).get("template"); } catch { return false; }
    const t = slug && TEMPLATES[slug.toLowerCase()];
    if (!t) return false;
    if (hasContent(state)) {
      // Don't clobber work in progress — branch into a fresh invoice, like "New invoice".
      upsertCurrent();
      state = { ...normalize(JSON.parse(JSON.stringify(state))), id: newId(),
        number: nextNumber([state.number, ...invoices.map((i) => i.number)]),
        date: todayISO(), due: "", to: "", amountPaid: "" };
    }
    state.items = t.items.map((it) => ({ ...it }));
    state.notes = t.notes;
    state.terms = t.terms;
    // Strip the param so refresh/bookmark doesn't re-apply the template.
    try { history.replaceState(null, "", location.pathname + location.hash); } catch { /* file:// etc. */ }
    return true;
  }

  // ---------- init ----------
  function hydrate() {
    CURRENCIES.forEach((c) => {
      if (![...els.currency.options].some((o) => o.value === c)) {
        const opt = document.createElement("option");
        opt.value = opt.textContent = c;
        els.currency.appendChild(opt);
      }
    });
    bind(els.currency, "currency", () => { renderItems(); renderTotals(); });
    bind(els.docType, "docType", applyDoc);
    bind(els.taxRate, "taxRate", renderTotals);
    bind(els.discount, "discount", renderTotals);
    bind(els.number, "number");
    bind(els.date, "date", () => { if (state.paymentTerms) dueFromTerms(); });
    bind(els.due, "due", () => { state.paymentTerms = ""; applyTerms(); });
    bind(els.from, "from");
    bind(els.to, "to");
    bind(els.notes, "notes");
    bind(els.terms, "terms");
    bind(els.amountPaid, "amountPaid", renderTotals);
    document.querySelectorAll(".sheet textarea").forEach(autogrow);
    applyDoc();
    applyAccent();
    renderLogo();
    renderItems();
    renderTotals();
    renderClients();
    renderLib();
    renderProfiles();
    applyTerms();
    if (state.paymentTerms) dueFromTerms();
    renderPro();
    renderList();
  }

  $("btn-add-item").addEventListener("click", () => addItem(true));

  if (applyUrlTemplate()) save();
  hydrate();
})();
