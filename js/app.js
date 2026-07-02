/* Otterbill — fully client-side invoice generator. No network calls, ever. */
(() => {
  "use strict";

  // Set this to your Stripe Payment Link to enable Pro purchases.
  const PAYMENT_LINK = "REPLACE_WITH_STRIPE_PAYMENT_LINK";
  // SHA-256 of the Pro unlock code shown on the Stripe receipt page.
  const UNLOCK_HASH = "7b4b6a2a5e54e7f9d475d45fcb631bdb38b4c243145b7c650dd388fd958155ff";

  const STORE_KEY = "otterbill.invoice.v1";
  const PRO_KEY = "otterbill.pro";

  const CURRENCIES = [
    "USD","EUR","GBP","CAD","AUD","NZD","CHF","JPY","CNY","INR","SGD","HKD",
    "SEK","NOK","DKK","PLN","CZK","RON","HUF","BRL","MXN","ZAR","AED","TRY","ILS","KRW"
  ];

  const $ = (id) => document.getElementById(id);
  const els = {
    currency: $("currency"), taxRate: $("tax-rate"), discount: $("discount"),
    number: $("inv-number"), date: $("inv-date"), due: $("inv-due"),
    from: $("from"), to: $("to"), notes: $("notes"), terms: $("terms"),
    itemsBody: $("items-body"), amountPaid: $("amount-paid"),
    logoImg: $("logo-img"), logoFile: $("logo-file"),
    btnLogo: $("btn-logo"), btnLogoRemove: $("btn-logo-remove"),
    saveNote: $("save-note"),
  };

  const defaultState = () => ({
    number: "INV-0001", date: todayISO(), due: "",
    from: "", to: "", notes: "", terms: "",
    currency: guessCurrency(), taxRate: "", discount: "", amountPaid: "",
    logo: "", items: [{ desc: "", qty: "1", rate: "" }],
  });

  let state = load();

  function todayISO() { return new Date().toISOString().slice(0, 10); }

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

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = { ...defaultState(), ...JSON.parse(raw) };
        if (!Array.isArray(s.items) || s.items.length === 0) s.items = defaultState().items;
        return s;
      }
    } catch { /* corrupted storage — start fresh */ }
    return defaultState();
  }

  let saveTimer;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(state));
        els.saveNote.textContent = "Saved locally ✓";
      } catch {
        els.saveNote.textContent = "Couldn't save (storage full?)";
      }
    }, 300);
  }

  // ---------- money ----------
  const fmt = () => new Intl.NumberFormat(undefined, { style: "currency", currency: state.currency });
  const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

  function totals() {
    const subtotal = state.items.reduce((sum, it) => sum + num(it.qty) * num(it.rate), 0);
    const discount = subtotal * num(state.discount) / 100;
    const taxed = (subtotal - discount) * num(state.taxRate) / 100;
    const total = subtotal - discount + taxed;
    return { subtotal, discount, taxed, total, due: total - num(state.amountPaid) };
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
  function renderItems() {
    els.itemsBody.textContent = "";
    state.items.forEach((item, i) => {
      const tr = document.createElement("tr");

      const tdDesc = document.createElement("td");
      const desc = document.createElement("input");
      desc.placeholder = "Description of work or product";
      desc.value = item.desc;
      desc.addEventListener("input", () => { item.desc = desc.value; save(); });
      tdDesc.appendChild(desc);

      const tdQty = document.createElement("td");
      const qty = document.createElement("input");
      qty.type = "number"; qty.min = "0"; qty.step = "any"; qty.placeholder = "1";
      qty.value = item.qty;
      qty.addEventListener("input", () => { item.qty = qty.value; updateRow(); });
      tdQty.appendChild(qty);

      const tdRate = document.createElement("td");
      const rate = document.createElement("input");
      rate.type = "number"; rate.min = "0"; rate.step = "any"; rate.placeholder = "0.00";
      rate.value = item.rate;
      rate.addEventListener("input", () => { item.rate = rate.value; updateRow(); });
      tdRate.appendChild(rate);

      const tdAmount = document.createElement("td");
      tdAmount.className = "col-amount";

      const tdX = document.createElement("td");
      tdX.className = "no-print";
      const x = document.createElement("button");
      x.className = "row-remove"; x.textContent = "✕"; x.title = "Remove line";
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

  // ---------- toolbar actions ----------
  $("btn-download").addEventListener("click", () => window.print());

  // Keep PDFs clean: no placeholder ghost-text, no empty optional rows.
  const printHidden = [];
  window.addEventListener("beforeprint", () => {
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
    document.querySelectorAll(".sheet input, .sheet textarea").forEach((el) => {
      if (el.dataset.ph) { el.placeholder = el.dataset.ph; delete el.dataset.ph; }
    });
    printHidden.forEach((row) => { if (row) row.style.visibility = ""; });
    printHidden.length = 0;
  });

  $("btn-new").addEventListener("click", () => {
    const m = state.number.match(/^(.*?)(\d+)\s*$/);
    const nextNumber = m ? m[1] + String(parseInt(m[2], 10) + 1).padStart(m[2].length, "0") : state.number;
    state = { ...state, number: nextNumber, date: todayISO(), due: "",
      to: "", notes: "", amountPaid: "", items: [{ desc: "", qty: "1", rate: "" }] };
    hydrate(); save();
  });

  $("btn-clear").addEventListener("click", () => {
    if (!confirm("Clear the invoice and everything saved locally?")) return;
    localStorage.removeItem(STORE_KEY);
    state = defaultState();
    hydrate(); save();
  });

  // ---------- Pro ----------
  const modal = $("pro-modal");
  const isPro = () => localStorage.getItem(PRO_KEY) === "1";

  function renderPro() {
    document.body.classList.toggle("pro", isPro());
    $("pro-locked").hidden = isPro();
    $("pro-active").hidden = !isPro();
    const buy = $("btn-buy");
    const configured = PAYMENT_LINK.startsWith("http");
    buy.hidden = !configured;
    $("buy-unavailable").hidden = configured;
    if (configured) buy.href = PAYMENT_LINK;
  }

  $("btn-open-pro").addEventListener("click", () => { modal.hidden = false; });
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
        msg.textContent = "";
      } else {
        msg.textContent = "That code doesn't look right — it's on your Stripe receipt page.";
        msg.className = "pro-hint err";
      }
    } catch {
      msg.textContent = "Couldn't verify the code in this browser.";
      msg.className = "pro-hint err";
    }
  });

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
    renderLogo();
    renderItems();
    renderTotals();
    renderPro();
  }

  $("btn-add-item").addEventListener("click", () => {
    state.items.push({ desc: "", qty: "1", rate: "" });
    renderItems(); save();
  });

  hydrate();
})();
