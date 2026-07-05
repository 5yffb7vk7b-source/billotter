#!/usr/bin/env node
/* Generates the /guides/ SEO content section (guides/<slug>/index.html + guides/index.html).
   Run from repo root: node scripts/gen-guides.mjs
   Long-form, evergreen invoicing guides that rank for high-intent searches and funnel into the
   free generator. CSP-safe: external CSS only, JSON-LD is the only inline <script>. */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://billotter.com";
const UPDATED = "2026-07-05";
const MARK = `<svg class="mark" width="21" height="21" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="5" y="3" width="22" height="26" rx="5" fill="#0d9488"/><path d="M10.5 13.5c1.8-2.2 3.7-2.2 5.5 0s3.7 2.2 5.5 0" stroke="#f2f7f3" stroke-width="2.4" stroke-linecap="round"/><path d="M10.5 20c1.8-2.2 3.7-2.2 5.5 0s3.7 2.2 5.5 0" stroke="#f2f7f3" stroke-width="2.4" stroke-linecap="round" opacity=".5"/></svg>`;

/* ---------- guide content ---------- */

const GUIDES = [
  {
    slug: "how-to-write-an-invoice",
    card: "How to write an invoice",
    cardSub: "The 8 parts, step by step, with an example",
    title: "How to Write an Invoice: Step-by-Step Guide (+ Free Template)",
    desc: "How to write a professional invoice: the eight things every invoice needs, how to number it, set payment terms and a due date — with a worked example and a free in-browser template.",
    h1: "How to write an invoice",
    dek: "An invoice is a request for payment that also doubles as your record of the sale. Get its eight parts right and you get paid faster with fewer questions. Here is exactly what goes on one, in order, with an example you can copy.",
    related: ["what-to-include-on-an-invoice", "invoice-payment-terms", "invoice-vs-estimate-vs-quote"],
    body: `
  <div class="toc">
    <strong>On this page</strong>
    <ul>
      <li><a href="#parts">The 8 things every invoice needs</a></li>
      <li><a href="#steps">How to write one, step by step</a></li>
      <li><a href="#example">A worked example</a></li>
      <li><a href="#mistakes">Common mistakes that delay payment</a></li>
    </ul>
  </div>

  <p>Whether you write it in a word processor, a spreadsheet or a <a href="../../#app">dedicated generator</a>, a professional invoice is the same document: a clear, itemized request for payment addressed to a specific client, carrying a unique number and a due date. Nail those and the rest is formatting.</p>

  <h2 id="parts">The 8 things every invoice needs</h2>
  <ul class="checklist">
    <li><strong>The word "Invoice"</strong> — plus your logo or business name at the top. It tells the recipient's accounts payable team what this is at a glance, so it lands in the right pile.</li>
    <li><strong>Your details</strong> — business name, address, email, and any tax or registration number you are required to show. This is who the money goes to.</li>
    <li><strong>The client's details</strong> — the billing name and address of the person or company that owes you, not just the person you email with. Large clients pay the "Bill to" name on the invoice.</li>
    <li><strong>A unique invoice number</strong> — sequential and never reused. It is how both of you refer to this specific bill later. <a href="../how-to-number-invoices/">More on numbering</a>.</li>
    <li><strong>Issue date and due date</strong> — when you sent it and when payment is expected. A due date is not optional; "whenever" is why invoices sit.</li>
    <li><strong>Itemized lines</strong> — a row per thing you are charging for, each with a description, quantity, unit rate, and line total. Detail here prevents disputes later.</li>
    <li><strong>Subtotal, tax and total</strong> — the math, shown. If you charge sales tax or VAT, it gets its own line so the total is defensible.</li>
    <li><strong>Payment terms and how to pay</strong> — the terms (e.g. "Net 14"), the methods you accept, and the details needed to pay you. Make paying the easy part.</li>
  </ul>
  <div class="callout"><p><strong>Nothing else is mandatory to get paid</strong> — everything beyond these eight is polish. Registered businesses may be legally required to add a tax number and a few extra fields; more on that in <a href="../what-to-include-on-an-invoice/">what to include on an invoice</a>.</p></div>

  <h2 id="steps">How to write an invoice, step by step</h2>
  <h3>1. Start with a header the client trusts</h3>
  <p>Your business name or logo, the word "Invoice", and your contact details. It does not need to be fancy — it needs to look like it came from a real business, because that is the first thing that gets an invoice paid instead of queried.</p>
  <h3>2. Give it a unique number</h3>
  <p>Assign a sequential number like <code>INV-0001</code> and never repeat one. Numbers are how you and your client's bookkeeper both find this exact invoice in six months. A tip most people miss: start your very first number at something like <code>INV-1001</code> rather than <code>0001</code>, so a new client cannot tell they are your first.</p>
  <h3>3. Address it to the right entity</h3>
  <p>Put your client's legal billing name and address under "Bill to". If they gave you a purchase-order (PO) number, add it — for many companies, an invoice without the PO number is an invoice that does not get paid.</p>
  <h3>4. List what you did, line by line</h3>
  <p>One row per deliverable or unit of work: a plain-English description, the quantity (hours, items, words), your rate, and the line total. "Website homepage — design and build (12 hrs)" survives a finance review; "web work" invites an email.</p>
  <h3>5. Add up the totals, tax included</h3>
  <p>Show the subtotal, then any tax or discount on its own line, then the grand total in bold. If you are registered for sales tax or VAT, the tax line and your registration number are usually legally required — check the rules where you operate.</p>
  <h3>6. State the terms and the due date</h3>
  <p>Spell out when payment is due ("Payment due within 14 days" or a specific date) and any late-payment policy. Vague terms are the single biggest cause of slow payment. See <a href="../invoice-payment-terms/">payment terms explained</a>.</p>
  <h3>7. Tell them exactly how to pay</h3>
  <p>Bank transfer details, a payment link, or a "pay by QR" code — whatever you accept, put the actual details on the invoice. Every extra step between the invoice and the payment is a day added to how long it takes.</p>
  <h3>8. Send it, and keep a copy</h3>
  <p>Email the PDF (PDFs cannot be accidentally edited and look the same on every device) and save a copy for your own records and taxes. Then log the invoice number so the next one continues the sequence.</p>

  <h2 id="example">A worked example</h2>
  <p>Here is what the itemized middle of a simple invoice looks like in practice:</p>
  <table class="sample-table">
    <thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead>
    <tbody>
      <tr><td>Brand logo — 3 concepts, 2 revision rounds</td><td class="num">1</td><td class="num">$900.00</td><td class="num">$900.00</td></tr>
      <tr><td>Business card design</td><td class="num">1</td><td class="num">$150.00</td><td class="num">$150.00</td></tr>
      <tr><td>Additional revision (hourly)</td><td class="num">2</td><td class="num">$75.00</td><td class="num">$150.00</td></tr>
      <tr><td class="muted">Subtotal</td><td class="num"></td><td class="num"></td><td class="num">$1,200.00</td></tr>
      <tr><td class="muted">Tax (8%)</td><td class="num"></td><td class="num"></td><td class="num">$96.00</td></tr>
      <tr><td><strong>Total due</strong></td><td class="num"></td><td class="num"></td><td class="num"><strong>$1,296.00</strong></td></tr>
    </tbody>
  </table>
  <p class="muted small">Terms: Payment due within 14 days of the invoice date. Bank transfer or card via the link below.</p>

  <div class="cta-row">
    <a class="btn btn-primary" href="../../#app">Write your invoice now — free, no signup</a>
    <span class="cta-note">Billotter fills in the structure above and does the math. Runs entirely in your browser — nothing is uploaded.</span>
  </div>

  <h2 id="mistakes">Common mistakes that delay payment</h2>
  <ul class="checklist">
    <li><strong>No due date.</strong> "Payable upon receipt" with no date is an invitation to pay later. Give a specific day.</li>
    <li><strong>Missing PO or reference number.</strong> Business clients route payment by these; leaving them off sends your invoice into a holding pattern.</li>
    <li><strong>Vague line items.</strong> "Consulting — $2,000" gets questioned; "Strategy consulting: discovery phase (10 hrs @ $200)" gets paid.</li>
    <li><strong>Reused or missing invoice numbers.</strong> They break your records and look unprofessional. One sequence, no gaps, no repeats.</li>
    <li><strong>Burying how to pay.</strong> If the client has to email you to ask how to send money, you have added a week. Put the details right there.</li>
  </ul>

  <p>Once you have the parts down, an invoice takes about two minutes. A pre-filled <a href="../../templates/">template for your line of work</a> makes it faster still.</p>
`,
    faq: [
      { q: "What has to be on an invoice?", a: "At minimum: the word Invoice, your business name and contact details, the client's billing details, a unique invoice number, the issue and due dates, itemized line items with quantities and rates, the subtotal and total (plus tax if applicable), and how to pay. Registered businesses usually must also show a tax or VAT number." },
      { q: "Can I write an invoice myself without software?", a: "Yes. An invoice is just a structured document — you can write one in a word processor, a spreadsheet, or a free in-browser generator like Billotter that lays out the fields, does the math, and exports a clean PDF. No accounting subscription is required to bill a client." },
      { q: "Should an invoice be a PDF?", a: "Usually yes. A PDF looks identical on every device, cannot be accidentally altered, and is the format finance teams expect. Send the PDF as an email attachment and keep a copy for your own records." },
      { q: "What is the difference between an invoice and a receipt?", a: "An invoice is a request for payment sent before the client pays; a receipt is proof of payment issued after. Many tools, including Billotter, can produce both. See our invoice vs receipt comparison for the full breakdown." },
    ],
  },

  {
    slug: "invoice-vs-estimate-vs-quote",
    card: "Invoice vs estimate vs quote vs receipt",
    cardSub: "Four documents people mix up, sorted out",
    title: "Invoice vs Estimate vs Quote vs Receipt: What's the Difference?",
    desc: "Invoice, estimate, quote and receipt do different jobs at different points in a sale. A clear comparison of what each one means, when to send it, and which is legally binding.",
    h1: "Invoice vs estimate vs quote vs receipt",
    dek: "They all list prices and line items, so they get used interchangeably — but they are four different documents that do four different jobs at four different points in a sale. Sending the wrong one costs you money or credibility. Here is how they differ.",
    related: ["how-to-write-an-invoice", "invoice-payment-terms", "how-to-invoice-as-a-freelancer"],
    body: `
  <h2>The short answer</h2>
  <table class="sample-table">
    <thead><tr><th>Document</th><th>Sent</th><th>Purpose</th><th>Price is</th></tr></thead>
    <tbody>
      <tr><td><strong>Quote</strong></td><td>Before the work</td><td>A fixed price offer</td><td>Firm — you commit to it</td></tr>
      <tr><td><strong>Estimate</strong></td><td>Before the work</td><td>An approximate price</td><td>A best guess — can change</td></tr>
      <tr><td><strong>Invoice</strong></td><td>After / on delivery</td><td>A request for payment</td><td>What is owed, due by a date</td></tr>
      <tr><td><strong>Receipt</strong></td><td>After payment</td><td>Proof it was paid</td><td>What was paid, already settled</td></tr>
    </tbody>
  </table>

  <h2>Quote: a firm price, before the work</h2>
  <p>A quote is a formal offer to do a defined job for a specific, fixed price. Once the client accepts it, you are generally expected to honor that number even if the work turns out harder than you thought — which is exactly why clients like them. Use a quote when the scope is clear and you are confident in your pricing. It is your pricing commitment in writing.</p>

  <h2>Estimate: an approximate price, before the work</h2>
  <p>An estimate is your best educated guess at the cost when the scope is not yet nailed down — "roughly $2,000–$2,500 depending on how many revisions." It sets expectations without locking you in. Use an estimate for open-ended work: renovations, debugging, anything where the final number genuinely depends on what you find. The key word, which belongs on the document, is <em>estimate</em>: it signals the number may move.</p>
  <div class="callout"><p><strong>Quote or estimate?</strong> If you would be comfortable being held to the number, send a quote. If the honest answer is "it depends," send an estimate and say what it depends on.</p></div>

  <h2>Invoice: the request for payment</h2>
  <p>Once the work is done (or hits an agreed milestone), the invoice is how you actually ask to be paid. It carries a unique number, itemizes what was delivered, states the total owed, and — crucially — sets a due date. Unlike a quote or estimate, an invoice creates an expectation of payment by a specific time and becomes part of both parties' financial records. This is the document you chase if it goes unpaid. Learn <a href="../how-to-write-an-invoice/">how to write one</a>.</p>

  <h2>Receipt: proof of payment</h2>
  <p>A receipt is issued <em>after</em> the client has paid, confirming the transaction is complete. It is the client's proof of purchase — for their records, expense claims, or taxes. Where an invoice says "you owe this," a receipt says "this is settled." Many businesses simply stamp the paid invoice as a receipt, which is perfectly standard.</p>

  <h2>How they flow through a job</h2>
  <p>On a typical project the documents come in order:</p>
  <ol>
    <li>The client asks what it will cost. You send a <strong>quote</strong> (firm) or an <strong>estimate</strong> (approximate).</li>
    <li>They accept. You do the work.</li>
    <li>You send an <strong>invoice</strong> for the agreed amount, with a due date.</li>
    <li>They pay. You issue a <strong>receipt</strong> (or mark the invoice paid).</li>
  </ol>
  <p>Not every job needs all four — a quick gig might be just an invoice and a receipt — but knowing which is which keeps you from, say, sending an "estimate" when the client expected a firm price, or an "invoice" for work you have not agreed to yet.</p>

  <div class="cta-row">
    <a class="btn btn-primary" href="../../#app">Create any of them, free</a>
    <span class="cta-note">Billotter switches between invoice, estimate, quote and receipt — same tool, right heading, in your browser.</span>
  </div>

  <p>Because these are really the same document with a different label and intent, a good generator lets you switch the document type with one setting. In Billotter that is the document-type control at the top of the sheet — pick invoice, estimate, quote or receipt and the heading and wording follow.</p>
`,
    faq: [
      { q: "Is a quote legally binding?", a: "Once a client accepts a quote, it generally forms the agreed price for the defined scope, and you are expected to honor it. An estimate is not a firm commitment — it explicitly signals the final figure may change. Exact legal treatment varies by jurisdiction and what your terms say." },
      { q: "What is the difference between an estimate and a quote?", a: "A quote is a fixed, firm price you commit to for a defined job. An estimate is an approximate figure for work whose scope is not fully known, and it can change as the job is clarified. Use a quote when scope is clear, an estimate when it depends." },
      { q: "Is an invoice the same as a receipt?", a: "No. An invoice is a request for payment sent before the client pays and includes a due date. A receipt is proof of payment issued after they pay. A common shortcut is to stamp the invoice PAID and reuse it as the receipt." },
      { q: "Do I send an invoice or a receipt first?", a: "The invoice comes first — it asks for payment. The receipt comes after the client has paid, confirming the money was received. In between, the invoice is the document you follow up on if payment is late." },
    ],
  },

  {
    slug: "invoice-payment-terms",
    card: "Invoice payment terms explained",
    cardSub: "Net 30, Net 15, Due on Receipt & how to choose",
    title: "Invoice Payment Terms Explained: Net 30, Net 15, Due on Receipt",
    desc: "What invoice payment terms mean — Net 30, Net 15, Net 7, Due on Receipt, 2/10 Net 30, deposits and late fees — and how to choose terms that actually get you paid on time.",
    h1: "Invoice payment terms, explained",
    dek: "\"Net 30\" is not jargon for its own sake — payment terms are the deadline you attach to an invoice, and choosing them well is one of the few levers a small business has over its own cash flow. Here is what the common terms mean and which to use.",
    related: ["how-to-write-an-invoice", "get-clients-to-pay-on-time", "invoice-vs-estimate-vs-quote"],
    body: `
  <h2>What "payment terms" actually means</h2>
  <p>Payment terms are the conditions under which you expect to be paid — most importantly, <em>by when</em>. They turn an invoice from a vague "please pay me" into a dated obligation. The term goes on the invoice itself, and the due date is calculated from the invoice date.</p>

  <h2>The common terms, translated</h2>
  <table class="sample-table">
    <thead><tr><th>Term</th><th>Means</th></tr></thead>
    <tbody>
      <tr><td><strong>Due on receipt</strong></td><td>Pay as soon as the invoice arrives. Best for one-off jobs and new clients.</td></tr>
      <tr><td><strong>Net 7</strong></td><td>Pay within 7 days of the invoice date.</td></tr>
      <tr><td><strong>Net 14</strong></td><td>Within 14 days. A sensible freelancer default — short, but gives a payment run time.</td></tr>
      <tr><td><strong>Net 15 / Net 30 / Net 60</strong></td><td>Within 15, 30 or 60 days. Net 30+ favors big buyers; the longer the term, the longer you wait.</td></tr>
      <tr><td><strong>2/10 Net 30</strong></td><td>Pay in full within 30 days, or take a 2% discount if you pay within 10. An incentive to pay early.</td></tr>
      <tr><td><strong>EOM</strong></td><td>Due at the end of the month the invoice was issued.</td></tr>
      <tr><td><strong>CIA / deposit</strong></td><td>Cash in advance, or a deposit (often 50%) before work starts. Standard for larger projects.</td></tr>
    </tbody>
  </table>

  <h2>How to choose your terms</h2>
  <p>The instinct to offer "Net 30 because that looks professional" quietly costs freelancers a month of cash flow. A few rules of thumb:</p>
  <ul class="checklist">
    <li><strong>Shorter is better for you.</strong> Net 30 is a norm invented by large companies that benefit from holding cash. As a small operator, Net 7 or Net 14 is entirely reasonable and gets money to you sooner.</li>
    <li><strong>New client? Take a deposit.</strong> A 50% deposit or "due on receipt" protects you from doing work for someone whose payment habits you have not seen yet.</li>
    <li><strong>Bigger job, split it.</strong> Deposit, milestone, balance. It caps your exposure to any single unpaid invoice.</li>
    <li><strong>Match the client's reality.</strong> Some large firms genuinely cannot pay faster than Net 30 because of their AP cycle. Price that delay in rather than fight it.</li>
  </ul>
  <div class="callout"><p><strong>Set the due date, do not just imply it.</strong> "Net 14" is clearer with the actual date next to it: "Net 14 — due August 5, 2026." A calendar date removes any argument about when the clock started.</p></div>

  <h2>Late fees and early-payment discounts</h2>
  <p>You can encourage on-time payment from both directions. A late-payment fee — commonly 1.5% per month on the overdue balance — is a standard deterrent; state it in your terms so it is pre-agreed rather than a surprise. An early-payment discount (the "2/10" above) does the opposite, rewarding clients who pay quickly. Whether interest on late invoices is enforceable, and at what rate, depends on where you operate and what your contract says.</p>

  <h2>Let the tool do the date math</h2>
  <p>Counting 14 days forward by hand is exactly the kind of small task that introduces errors. In <a href="../../#app">Billotter</a> you pick a term — Due on receipt, Net 7, 14, 15, 30 or 60 — and the due date fills in automatically from the invoice date. Change the invoice date and the due date moves with it; type a due date manually and it switches to "Custom." One less thing to get wrong.</p>

  <div class="cta-row">
    <a class="btn btn-primary" href="../../#app">Set your terms and due date, free</a>
    <span class="cta-note">Auto-calculated due dates, 26 currencies, clean PDF — all in your browser, no signup.</span>
  </div>
`,
    faq: [
      { q: "What does Net 30 mean on an invoice?", a: "Net 30 means the full invoice amount is due within 30 days of the invoice date. Net 15 and Net 7 work the same way with shorter windows. The 'net' refers to the full amount, as opposed to a discounted early-payment figure." },
      { q: "What are the best payment terms for a freelancer?", a: "Shorter terms favor you. Net 7 or Net 14 is a reasonable default for freelancers, often paired with a deposit for new clients or larger projects. Net 30 mainly benefits large buyers who like holding cash — you do not have to offer it by default." },
      { q: "Does 'due on receipt' mean pay immediately?", a: "Effectively yes — it asks the client to pay as soon as they receive the invoice, with no grace period. It is well suited to one-off jobs, small amounts, and clients you have not worked with before." },
      { q: "Can I charge a late fee on an overdue invoice?", a: "Often, yes — a common figure is 1.5% per month on the outstanding balance, stated in your invoice terms so it is agreed in advance. Enforceability and maximum rates vary by jurisdiction and your contract, so check your local rules." },
    ],
  },

  {
    slug: "how-to-invoice-as-a-freelancer",
    card: "How to invoice as a freelancer",
    cardSub: "Your first invoice, taxes, getting paid — no software",
    title: "How to Invoice as a Freelancer (Without Accounting Software)",
    desc: "A practical guide to invoicing as a freelancer: sending your first invoice, whether you need a registered business, getting paid, tracking numbers, and keeping records for tax — no subscription required.",
    h1: "How to invoice as a freelancer",
    dek: "Your first freelance invoice feels like it needs a lawyer and a subscription. It needs neither. Here is how to bill a client cleanly, get paid, and keep the records that make tax time painless — using tools that cost nothing.",
    related: ["how-to-write-an-invoice", "invoice-payment-terms", "get-clients-to-pay-on-time"],
    body: `
  <h2>Do you need a registered company to invoice?</h2>
  <p>In most places, no. You can generally invoice as a sole proprietor or individual under your own name — a business is a set of line items and a way to get paid, not a legal prerequisite for billing. That said, the moment your income crosses certain thresholds, some jurisdictions require you to register, collect sales tax or VAT, or add a tax ID to your invoices. This varies a lot by country, so treat it as the one thing worth a quick check with a local resource. Everything else below is universal.</p>

  <h2>Your first invoice, minus the anxiety</h2>
  <p>A freelance invoice is the same document any business sends. It needs your name and contact details, the client's billing details, a unique invoice number, the date and a due date, an itemized list of what you did, the total, and how to pay. If you want the field-by-field version, see <a href="../how-to-write-an-invoice/">how to write an invoice</a> — but the short version is: be specific about the work, and be explicit about the deadline and the payment method.</p>

  <h2>Getting paid: make it effortless</h2>
  <p>The gap between "invoice sent" and "money received" is where freelancers lose time. Close it:</p>
  <ul class="checklist">
    <li><strong>Offer the payment method the client already uses.</strong> Bank transfer is free and universal; cards and payment links cost a small fee but remove friction. A "pay by QR" code on the PDF turns paying into a phone tap.</li>
    <li><strong>Invoice immediately.</strong> Send it the day the work is done, while the value is fresh. An invoice that arrives two weeks late gets paid a month late.</li>
    <li><strong>Take a deposit from new clients.</strong> 50% up front is normal and filters out the people who were never going to pay.</li>
    <li><strong>Use short terms.</strong> Net 7 or Net 14 beats Net 30 for your cash flow, and most freelance clients will not blink. See <a href="../invoice-payment-terms/">payment terms</a>.</li>
  </ul>

  <h2>Keep records without a bookkeeping system</h2>
  <p>You do not need accounting software to stay organized — you need discipline about three things:</p>
  <ol>
    <li><strong>Sequential invoice numbers.</strong> One unbroken sequence across all clients (<code>INV-1001</code>, <code>INV-1002</code>…) so nothing is duplicated or missing. Details in <a href="../how-to-number-invoices/">how to number invoices</a>.</li>
    <li><strong>A saved copy of every invoice.</strong> Keep the PDFs. They are your proof of income and your backup if a client queries an old job.</li>
    <li><strong>A running total.</strong> Knowing what you have invoiced and what is still outstanding — even in a simple list — tells you who to chase and what you have actually earned this year.</li>
  </ol>
  <div class="callout"><p><strong>Set aside for tax as you go.</strong> As a freelancer, tax is not withheld for you. A common habit is to move a fixed percentage of every payment into a separate account the day it lands, so the tax bill is money you never counted as spendable. How much depends on where you live — but doing it per-invoice beats scrambling later.</p></div>

  <h2>Why "no accounting software" is a real option</h2>
  <p>Subscription invoicing apps are built for businesses with staff and integrations. As a solo freelancer, a free, single-page generator does everything you need: itemized lines, tax and discounts, multiple currencies, your logo, and a clean PDF — with your data staying on your own device instead of a vendor's server. <a href="../../#app">Billotter</a> is exactly this, and it keeps a running tally of what you have invoiced and what is outstanding this year so you always know where you stand.</p>

  <div class="cta-row">
    <a class="btn btn-primary" href="../../#app">Send your first invoice, free</a>
    <span class="cta-note">No account, no subscription, nothing uploaded. There are pre-filled templates for common freelance trades, too.</span>
  </div>

  <p>If your work fits a common trade, start from a <a href="../../templates/">pre-filled template</a> — writing, design, development, consulting, photography and more — and adjust the rates. It is the fastest way from "I need to invoice" to "invoice sent."</p>
`,
    faq: [
      { q: "Do I need a registered business to send an invoice?", a: "In most places you can invoice as an individual or sole proprietor under your own name without registering a company. However, some jurisdictions require registration, sales-tax/VAT collection, or a tax ID on invoices once you pass certain income thresholds. Check the rules where you live." },
      { q: "How do freelancers invoice without accounting software?", a: "A free single-page generator handles everything a solo freelancer needs: itemized lines, tax, currencies, your logo, and a clean PDF, with records kept on your own device. Paid accounting suites are built for larger businesses; you do not need one to bill clients." },
      { q: "What should a freelancer put on an invoice?", a: "Your name and contact details, the client's billing details, a unique invoice number, the issue and due dates, itemized work with quantities and rates, the total (plus tax if you charge it), and clear payment instructions. Add a tax ID if your jurisdiction requires one." },
      { q: "How much should I set aside from each invoice for tax?", a: "Tax is not withheld from freelance income, so many freelancers move a fixed percentage of every payment into a separate account as it arrives. The right percentage depends on your income and location — a local tax resource can give you a figure to use per invoice." },
    ],
  },

  {
    slug: "get-clients-to-pay-on-time",
    card: "How to get clients to pay on time",
    cardSub: "Deposits, clear terms, and a follow-up script",
    title: "How to Get Clients to Pay Invoices on Time",
    desc: "Practical, proven ways to get invoices paid on time: set terms up front, take deposits, invoice immediately, make paying easy, and follow up late payments with a script that works.",
    h1: "How to get clients to pay on time",
    dek: "Most late payments are not the client refusing to pay — they are friction, forgetfulness, and vague terms. Remove those and the money shows up. Here is how to design an invoice, and a follow-up routine, that gets you paid.",
    related: ["invoice-payment-terms", "how-to-write-an-invoice", "how-to-invoice-as-a-freelancer"],
    body: `
  <h2>Prevent late payment before you send the invoice</h2>
  <p>The best collections strategy is making late payment unlikely in the first place. Four things do most of the work:</p>
  <ul class="checklist">
    <li><strong>Agree terms up front, in writing.</strong> The due date and payment method should be settled before you start, not introduced on the invoice. No client should be surprised by "Net 14."</li>
    <li><strong>Take a deposit.</strong> 50% before work begins turns a stranger into someone with skin in the game, and guarantees you are not fully exposed on any job.</li>
    <li><strong>Invoice the moment the work is done.</strong> Value decays. The fixed leak, the delivered design, the finished article — all feel most worth paying for on day one. Send the invoice from the driveway, not next week.</li>
    <li><strong>Use short, specific terms.</strong> "Due August 5" beats "Net 30" beats "payable upon receipt." A concrete date is a concrete expectation.</li>
  </ul>

  <h2>Make paying you the easy part</h2>
  <p>Every step between the invoice and the payment is a place for it to stall. Put the actual payment details on the invoice — bank details, a payment link, or a scannable pay-by-QR code — so paying takes seconds and does not require a follow-up email to ask "how do I pay you?" If you can accept the method the client already uses, do; the small processing fee is cheaper than three weeks of waiting.</p>

  <h2>A follow-up sequence that works</h2>
  <p>When an invoice does go past due, a calm, scheduled sequence beats an anxious one-off email. Keep it factual — you are reminding, not accusing.</p>
  <h3>The day after the due date — a gentle nudge</h3>
  <p>"Hi [name], just a quick note that invoice INV-1042 ($1,296) was due yesterday. It may have slipped through — here it is again attached, with payment details at the bottom. Let me know if you need anything from me."</p>
  <h3>One week overdue — a clear reminder</h3>
  <p>"Hi [name], following up on invoice INV-1042, now a week overdue. Could you let me know when I can expect payment? Happy to resend in another format if that helps."</p>
  <h3>Two weeks overdue — firm, with a consequence</h3>
  <p>"Hi [name], invoice INV-1042 is now two weeks overdue. Per the terms, a late fee applies from today, and I will need payment before starting further work. Please let me know if there is an issue I can help resolve."</p>
  <div class="callout"><p><strong>Reference the invoice number every time.</strong> It lets the client's accounts team find and process the payment without a back-and-forth — and it signals you keep organized records, which itself encourages prompt payment.</p></div>

  <h2>The leverage you actually have</h2>
  <p>Two levers work better than nagging. First, <strong>pause future work</strong> until the outstanding invoice clears — stated politely, "the next milestone begins once this invoice is settled" is standard and effective. Second, a <strong>late fee</strong> written into your terms (commonly 1.5% per month) makes delay cost the client something. Both only work if they were agreed in advance, which is why terms belong on <em>every</em> invoice. More in <a href="../invoice-payment-terms/">payment terms explained</a>.</p>

  <h2>Know who is late at a glance</h2>
  <p>You cannot chase what you cannot see. Keep a view of which invoices are outstanding and how much is owed. <a href="../../#app">Billotter</a> keeps a running tally of what you have invoiced this year and what is still outstanding, so the follow-up list writes itself.</p>

  <div class="cta-row">
    <a class="btn btn-primary" href="../../#app">Build an invoice that gets paid, free</a>
    <span class="cta-note">Clear due dates, payment details on the PDF, outstanding-balance tracking — in your browser, no signup.</span>
  </div>
`,
    faq: [
      { q: "How do I get a client to pay an overdue invoice?", a: "Follow up on a schedule: a gentle nudge the day after the due date, a clearer reminder at one week, and a firm message referencing your late-fee terms at two weeks. Always cite the invoice number, keep it factual, and pause further work until it is settled." },
      { q: "Should I charge a deposit to avoid late payment?", a: "Yes — a deposit (commonly 50%) before starting work is one of the most effective ways to prevent non-payment. It commits the client, reduces your exposure on any single job, and filters out clients who were never going to pay." },
      { q: "What is a reasonable late payment fee?", a: "A common figure is 1.5% per month on the outstanding balance, stated in your invoice terms so it is agreed in advance. Whether interest is enforceable and at what maximum rate depends on your jurisdiction and contract." },
      { q: "How can I make it easier for clients to pay on time?", a: "Put the payment details directly on the invoice — bank details, a payment link, or a pay-by-QR code — set a specific due date rather than vague terms, invoice immediately after the work, and accept the payment method the client already uses." },
    ],
  },

  {
    slug: "how-to-number-invoices",
    card: "How to number invoices",
    cardSub: "Formats, sequences, and what to avoid",
    title: "How to Number Invoices: Formats, Sequences & Best Practices",
    desc: "How to number your invoices properly: why sequential unique numbers matter, common formats (INV-0001, year-based, client-based), what to avoid, and how to reset numbering each year.",
    h1: "How to number invoices",
    dek: "Invoice numbers look trivial until an accountant, a tax authority, or your own future self needs to find one specific bill among hundreds. A good numbering system takes ten seconds to set up and saves hours. Here is how to do it.",
    related: ["how-to-write-an-invoice", "how-to-invoice-as-a-freelancer", "what-to-include-on-an-invoice"],
    body: `
  <h2>Why invoice numbers matter</h2>
  <p>An invoice number is the unique handle for a single transaction. It is how you reference a bill in an email, how a client's accounts team logs the payment, and how you locate one invoice among a year's worth at tax time. In many places, sequential invoice numbering is also a legal or tax requirement — gaps and duplicates can raise questions in an audit. Three rules cover almost everything.</p>

  <h2>The three rules</h2>
  <ul class="checklist">
    <li><strong>Unique.</strong> No number is ever used twice. Two invoices with the same number is a records nightmare and looks like an error (or worse) to a tax authority.</li>
    <li><strong>Sequential.</strong> Numbers go up in order — 1001, 1002, 1003. This proves your records are complete.</li>
    <li><strong>No gaps.</strong> Do not skip numbers. A missing number looks like a deleted or hidden invoice. If you void one, keep the number and mark it voided rather than removing it.</li>
  </ul>

  <h2>Common invoice number formats</h2>
  <table class="sample-table">
    <thead><tr><th>Format</th><th>Example</th><th>Good for</th></tr></thead>
    <tbody>
      <tr><td>Simple sequential</td><td><code>INV-1001</code></td><td>Most freelancers and small businesses. Clean and hard to get wrong.</td></tr>
      <tr><td>Year prefixed</td><td><code>2026-001</code></td><td>Organizing by year; resets each January.</td></tr>
      <tr><td>Date based</td><td><code>INV-20260705-01</code></td><td>High volume, where issue date matters at a glance.</td></tr>
      <tr><td>Client coded</td><td><code>ACME-014</code></td><td>Few clients, lots of invoices each. Easy to sort by customer.</td></tr>
    </tbody>
  </table>
  <p>Any of these is fine — the best format is the simplest one you will actually keep consistent. Pick a pattern and never change it midstream; a mixed scheme is worse than a plain one.</p>

  <div class="callout"><p><strong>Do not start at 0001.</strong> A first invoice numbered <code>INV-0001</code> quietly tells a new client they are your very first customer. Start at something like <code>INV-1001</code> or <code>INV-100</code> instead. It costs nothing and reads as established.</p></div>

  <h2>Should numbering reset each year?</h2>
  <p>It is your choice, and both are common. A year-prefixed scheme (<code>2026-001</code>) resets to 001 each January, which keeps annual records tidy and maps neatly to tax years. A single lifetime sequence (<code>INV-1001</code> onward, forever) is simpler and equally valid. The only wrong answer is switching approaches partway through a year, which reintroduces the confusion the system exists to prevent.</p>

  <h2>Let the numbering take care of itself</h2>
  <p>The reliable way to keep an unbroken sequence is to not do it by hand. <a href="../../#app">Billotter</a> increments the invoice number for you each time you create a new one, so the sequence stays gap-free without you tracking the last number used. You set the starting number and format once; every new invoice continues from there.</p>

  <div class="cta-row">
    <a class="btn btn-primary" href="../../#app">Start a correctly-numbered invoice, free</a>
    <span class="cta-note">Auto-incrementing numbers, saved invoice history, clean PDFs — all in your browser.</span>
  </div>
`,
    faq: [
      { q: "How should I number my invoices?", a: "Use unique, sequential numbers with no gaps — for example INV-1001, INV-1002, INV-1003. Pick a single format and keep it consistent. Many businesses start at a higher number like 1001 rather than 0001 so a first invoice does not reveal they are new." },
      { q: "Can two invoices have the same number?", a: "No. Every invoice number must be unique. Duplicate numbers break your records and can raise red flags in a tax audit. If you need to cancel an invoice, keep its number and mark it voided rather than reusing it." },
      { q: "Should invoice numbers reset every year?", a: "Either approach works. A year-prefixed format like 2026-001 resets each January and keeps annual records tidy; a single lifetime sequence is simpler. Choose one and stay consistent — the problem to avoid is switching schemes partway through." },
      { q: "Is sequential invoice numbering a legal requirement?", a: "In many jurisdictions, yes — sequential, gap-free numbering is expected for tax purposes, and unexplained gaps can prompt questions in an audit. The exact rules vary by country, so confirm what applies where you operate." },
    ],
  },

  {
    slug: "what-to-include-on-an-invoice",
    card: "What to include on an invoice",
    cardSub: "The complete checklist of required fields",
    title: "What to Include on an Invoice: The Complete Checklist",
    desc: "A complete checklist of what to include on an invoice — the required fields, the details that get you paid faster, and the tax information some businesses must legally show.",
    h1: "What to include on an invoice",
    dek: "An invoice that is missing a field is an invoice that gets queried, delayed, or ignored. This is the complete checklist — the parts that are essential, the ones that get you paid faster, and the tax details some businesses are legally required to show.",
    related: ["how-to-write-an-invoice", "how-to-number-invoices", "invoice-payment-terms"],
    body: `
  <h2>The essentials — every invoice needs these</h2>
  <ul class="checklist">
    <li><strong>The word "Invoice."</strong> Clearly labeled, so it is routed correctly and not mistaken for a quote or a receipt.</li>
    <li><strong>Your business identity.</strong> Name, address, email, phone, and logo if you have one. This establishes who is owed and that you are a real operation.</li>
    <li><strong>The client's billing details.</strong> The legal name and address that should appear under "Bill to" — which may differ from your day-to-day contact.</li>
    <li><strong>A unique invoice number.</strong> Sequential, never reused. See <a href="../how-to-number-invoices/">how to number invoices</a>.</li>
    <li><strong>Invoice date and due date.</strong> When it was issued and when payment is expected. A specific due date, not "on receipt."</li>
    <li><strong>Itemized line items.</strong> One row per item: description, quantity, unit rate, line total.</li>
    <li><strong>Subtotal, tax, and total.</strong> The math shown, with tax on its own line, ending in a clear total due.</li>
    <li><strong>Payment terms and methods.</strong> The terms (e.g. Net 14) and exactly how to pay you.</li>
  </ul>

  <h2>The details that get you paid faster</h2>
  <p>These are not always mandatory, but each one removes a reason for payment to stall:</p>
  <ul class="checklist">
    <li><strong>A purchase-order (PO) number</strong> when the client uses them — for many companies, no PO means no payment.</li>
    <li><strong>Specific line-item descriptions</strong> that survive a finance review ("Homepage build — 12 hrs" not "web work").</li>
    <li><strong>The payment details right on the invoice</strong> — bank info, a link, or a pay-by-QR code — so no one has to email to ask.</li>
    <li><strong>A short thank-you or note.</strong> A civil tone measurably helps; people prioritize invoices from people they like working with.</li>
    <li><strong>Your late-payment policy</strong> stated in the terms, so any fee is pre-agreed rather than a surprise.</li>
  </ul>

  <h2>Tax details some businesses must show</h2>
  <p>If you are registered for sales tax, GST, or VAT, your invoices usually must carry additional information — your tax registration number, the tax rate and amount broken out, and sometimes specific wording or the client's tax number for cross-border sales. The requirements differ significantly by country and by whether you are registered, so this is the part of the checklist to confirm against your local rules rather than assume.</p>
  <div class="callout"><p><strong>When in doubt, itemize and label.</strong> An invoice that shows its work — clear lines, a broken-out tax figure, a stated total — is both easier to pay and easier to defend if anyone ever asks. Over-clarity has no downside.</p></div>

  <h2>The checklist, working for you automatically</h2>
  <p>A good generator includes these fields by design, so "what to include" stops being something you have to remember. <a href="../../#app">Billotter</a> lays out every field above, does the subtotal-tax-total math, numbers the invoice, and exports a clean PDF — with a pre-filled <a href="../../templates/">template</a> for common trades if you want a running start.</p>

  <div class="cta-row">
    <a class="btn btn-primary" href="../../#app">Create a complete invoice, free</a>
    <span class="cta-note">Every required field, the math handled, a clean PDF — in your browser, nothing uploaded.</span>
  </div>
`,
    faq: [
      { q: "What information is required on an invoice?", a: "At minimum: the word Invoice, your business name and contact details, the client's billing details, a unique invoice number, the issue and due dates, itemized line items with quantities and rates, the subtotal and total, tax if applicable, and payment terms and methods. Registered businesses typically must also show a tax number." },
      { q: "Do I have to include a tax number on my invoice?", a: "It depends on whether you are registered for sales tax, GST, or VAT and where you operate. Registered businesses usually must show their tax registration number and break out the tax amount. If you are not registered, you generally do not — but confirm the rules in your jurisdiction." },
      { q: "What makes an invoice get paid faster?", a: "Specific line-item descriptions, a clear due date, any required PO number, payment details right on the invoice, and a stated late-payment policy. Removing every reason for a query and every step needed to pay is what shortens the time to payment." },
      { q: "Does an invoice need a due date?", a: "Yes — practically speaking, an invoice without a due date invites late payment because there is no deadline to miss. State a specific date or a clear term like Net 14 so both sides know exactly when payment is expected." },
    ],
  },
];

/* ---------- shared page bits ---------- */

const head = (title, desc, canonicalPath, cssPath, extraLd = "") => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${BASE}/${canonicalPath}">
  <meta property="og:image" content="${BASE}/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${BASE}/og.png">
  <link rel="canonical" href="${BASE}/${canonicalPath}">
  <meta name="theme-color" content="#0f172a">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="stylesheet" href="${cssPath}">
${extraLd}</head>
<body>
`;

const topbar = (root) => `
<header class="topbar">
  <div class="topbar-inner">
    <a class="brand" href="${root}">${MARK} <strong>Billotter</strong></a>
    <nav class="topnav">
      <a href="${root}templates/">Templates</a>
      <a href="${root}guides/">Guides</a>
      <a href="${root}#faq">FAQ</a>
      <a class="btn btn-primary" href="${root}#app">Create an invoice</a>
    </nav>
  </div>
</header>
`;

const footer = `
<footer class="site-footer">
  <p>Billotter — made for freelancers who'd rather be working.</p>
  <p class="foot-fine">no cookies · no analytics · no servers — check the network tab</p>
</footer>
</body>
</html>
`;

const faqLd = (faq) => `  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }, null, 2).replace(/\n/g, "\n  ")}
  </script>
`;

const articleLd = (g) => `  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.h1,
    description: g.desc,
    datePublished: UPDATED,
    dateModified: UPDATED,
    author: { "@type": "Organization", name: "Billotter", url: `${BASE}/` },
    publisher: { "@type": "Organization", name: "Billotter", logo: { "@type": "ImageObject", url: `${BASE}/favicon.png` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE}/guides/${g.slug}/` },
    image: `${BASE}/og.png`,
  }, null, 2).replace(/\n/g, "\n  ")}
  </script>
`;

const breadcrumbLd = (name, slug) => `  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Billotter", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${BASE}/guides/` },
      { "@type": "ListItem", position: 3, name, item: `${BASE}/guides/${slug}/` },
    ],
  }, null, 2).replace(/\n/g, "\n  ")}
  </script>
`;

const bySlug = Object.fromEntries(GUIDES.map((g) => [g.slug, g]));

const relatedBlock = (g, root) => {
  const rel = (g.related || []).map((s) => bySlug[s]).filter(Boolean);
  if (!rel.length) return "";
  return `
  <h2>Keep reading</h2>
  <ul class="tpl-grid">
${rel.map((r) => `    <li><a class="tpl-card" href="${root}guides/${r.slug}/"><strong>${r.card}</strong><span>${r.cardSub}</span></a></li>`).join("\n")}
  </ul>
`;
};

/* ---------- guide page ---------- */

function guidePage(g) {
  const root = "../../";
  return (
    head(g.title, g.desc, `guides/${g.slug}/`, `${root}css/style.css`, articleLd(g) + faqLd(g.faq) + breadcrumbLd(g.h1, g.slug)) +
    topbar(root) +
    `
<main class="page">
  <nav class="crumbs"><a href="${root}">Billotter</a> › <a href="${root}guides/">Guides</a> › ${g.card}</nav>
  <h1>${g.h1}</h1>
  <p class="guide-meta">Updated ${UPDATED} · Billotter</p>
  <p class="lede">${g.dek}</p>
${g.body}
  <h2>Frequently asked</h2>
${g.faq.map((f) => `  <details>\n    <summary>${f.q}</summary>\n    <p>${f.a}</p>\n  </details>`).join("\n")}
${relatedBlock(g, root)}
  <p class="backlink"><a href="${root}">← Billotter: the free, private, in-browser invoice generator</a></p>
</main>
` +
    footer
  );
}

/* ---------- hub page ---------- */

function hubPage() {
  const root = "../";
  const title = "Invoicing Guides — How to Invoice, Get Paid & Do It Right | Billotter";
  const desc =
    "Plain-English guides to invoicing: how to write an invoice, payment terms, numbering, invoicing as a freelancer, and getting clients to pay on time. Free, from the makers of Billotter.";
  const ld = `  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Invoicing guides",
    description: desc,
    url: `${BASE}/guides/`,
    hasPart: GUIDES.map((g) => ({
      "@type": "Article",
      name: g.h1,
      url: `${BASE}/guides/${g.slug}/`,
    })),
  }, null, 2).replace(/\n/g, "\n  ")}
  </script>
`;
  return (
    head(title, desc, "guides/", `${root}css/style.css`, ld) +
    topbar(root) +
    `
<main class="page">
  <h1>Invoicing guides</h1>
  <p class="lede">Everything about invoicing that nobody teaches you — how to write one, what to put on it, how to
  number it, which payment terms to use, and how to actually get paid. Plain English, no fluff, free.</p>

  <ul class="tpl-grid tpl-grid-lg">
${GUIDES.map((g) => `    <li><a class="tpl-card" href="${g.slug}/"><strong>${g.card}</strong><span>${g.cardSub}</span></a></li>`).join("\n")}
  </ul>

  <h2>Then put it into practice</h2>
  <p>Every guide points back to the same place: the free <a href="${root}#app">Billotter generator</a>, which lays out
  the fields, does the math, numbers the invoice, and exports a clean PDF — entirely in your browser, with nothing
  uploaded. If your work fits a common trade, start from a <a href="${root}templates/">pre-filled template</a> instead
  of a blank page.</p>
</main>
` +
    footer
  );
}

/* ---------- write everything ---------- */

const outRoot = new URL("..", import.meta.url).pathname;
for (const g of GUIDES) {
  const dir = join(outRoot, "guides", g.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), guidePage(g));
  console.log(`✓ guides/${g.slug}/index.html`);
}
writeFileSync(join(outRoot, "guides", "index.html"), hubPage());
console.log("✓ guides/index.html");
console.log(`\n${GUIDES.length} guides + hub written.`);
