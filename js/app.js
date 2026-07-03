/* Otterbill — fully client-side invoice generator. No network calls, ever. */
(() => {
  "use strict";

  // Where "Get Pro" sends buyers (Ko-fi shop item).
  const PAYMENT_LINK = "https://ko-fi.com/s/1765e9aa86";
  // SHA-256 of the Pro unlock code delivered after purchase.
  const UNLOCK_HASH = "7b4b6a2a5e54e7f9d475d45fcb631bdb38b4c243145b7c650dd388fd958155ff";

  const STORE_KEY = "otterbill.invoice.v1";
  const LIST_KEY = "otterbill.invoices.v1";
  const PRO_KEY = "otterbill.pro";
  const DEFAULT_ACCENT = "#0d9488";

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
    logo: "", items: [{ desc: "", qty: "1", rate: "" }],
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
    return s;
  }

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
  }

  // ---------- line items ----------
  function addItem(focus) {
    state.items.push({ desc: "", qty: "1", rate: "" });
    renderItems();
    if (focus) {
      const rows = els.itemsBody.querySelectorAll("tr");
      rows[rows.length - 1]?.querySelector("input")?.focus();
    }
    save();
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
      const x = document.createElement("button");
      x.className = "row-remove"; x.textContent = "✕"; x.title = "Remove line";
      x.setAttribute("aria-label", `Remove line ${i + 1}`);
      x.addEventListener("click", () => {
        state.items.splice(i, 1);
        if (state.items.length === 0) state.items.push({ desc: "", qty: "1", rate: "" });
        renderItems(); renderTotals(); save();
      });
      tdX.appendChild(x);

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
  function renderList() {
    if (!els.invList) return;
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
    const payload = { app: "otterbill", version: 1, exported: todayISO(), current: state, invoices };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `otterbill-backup-${todayISO()}.json`;
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
        // Restore the exported working copy too — but never over unsaved work.
        if (data.current && !hasContent(state)) {
          const cur = normalize(data.current);
          if (invoices.some((x) => x.id === cur.id)) cur.id = newId();
          state = cur;
        }
        hydrate(); save();
        setTimeout(() => { els.saveNote.textContent = `Imported ${added} invoice${added === 1 ? "" : "s"} ✓`; }, 350);
      } catch {
        els.saveNote.textContent = "That file doesn't look like an Otterbill backup.";
      }
    };
    reader.readAsText(file);
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

  $("btn-unlock").addEventListener("click", async () => {
    const code = $("unlock-code").value.trim().toUpperCase();
    const msg = $("unlock-msg");
    if (!code) return;
    try {
      if (await sha256hex(code) === UNLOCK_HASH) {
        localStorage.setItem(PRO_KEY, "1");
        renderPro();
        msg.textContent = "Unlocked — thank you! 🦦";
        msg.className = "pro-hint ok";
      } else {
        msg.textContent = "That code doesn't look right — it's shown right after your purchase.";
        msg.className = "pro-hint err";
      }
    } catch {
      msg.textContent = "Couldn't verify the code in this browser.";
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
    bind(els.date, "date");
    bind(els.due, "due");
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
    renderPro();
    renderList();
  }

  $("btn-add-item").addEventListener("click", () => addItem(true));

  if (applyUrlTemplate()) save();
  hydrate();
})();
