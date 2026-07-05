#!/usr/bin/env node
/* Generates the SEO template landing pages (templates/<slug>/index.html + templates/index.html).
   Run from repo root: node scripts/gen-templates.mjs
   Each page prefills the generator via ../../?template=<slug> (see TEMPLATES in js/app.js). */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://billotter.com";
const MARK = `<svg class="mark" width="21" height="21" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="5" y="3" width="22" height="26" rx="5" fill="#0d9488"/><path d="M10.5 13.5c1.8-2.2 3.7-2.2 5.5 0s3.7 2.2 5.5 0" stroke="#f2f7f3" stroke-width="2.4" stroke-linecap="round"/><path d="M10.5 20c1.8-2.2 3.7-2.2 5.5 0s3.7 2.2 5.5 0" stroke="#f2f7f3" stroke-width="2.4" stroke-linecap="round" opacity=".5"/></svg>`;

const NICHES = [
  {
    slug: "photography",
    emoji: "📷",
    name: "Photography",
    person: "photographers",
    keyword: "photography invoice template",
    blurb: "Sessions, editing, galleries & travel",
    title: "Free Photography Invoice Template — No Signup, Fills In Your Browser",
    desc: "A free invoice template for photographers: session fees, per-image editing, gallery delivery and travel, pre-filled and ready to edit in your browser. No account, nothing uploaded.",
    lede: "Shoot the wedding, edit six hundred frames, and the invoice is somehow still the hard part. This template pre-fills the line items photographers actually bill for — open it, put in your rates, download the PDF.",
    include: [
      "<strong>The session as its own line</strong> — date, event type and hours, so the client sees exactly what the day covered.",
      "<strong>Editing billed per image or per hour</strong> — separating it from the shoot justifies the price of the invisible half of the job.",
      "<strong>Delivery and gallery hosting</strong> — even at $0 it reminds clients this is included, not owed forever.",
      "<strong>Travel and mileage</strong> — list it, don't absorb it.",
      "<strong>Usage license</strong> — state whether images are licensed for personal or commercial use; it's the difference between a portrait rate and a campaign rate.",
    ],
    items: [
      { desc: "Photography session — [event / portrait / product] (hours)", qty: "4" },
      { desc: "Photo editing & retouching (per edited image)", qty: "25" },
      { desc: "Online gallery — hosting & digital delivery", qty: "1" },
      { desc: "Travel & mileage", qty: "1" },
    ],
    notes: "Edited high-resolution images delivered via private online gallery within 14 days.",
    terms: "50% retainer due at booking; balance due before final delivery. Images licensed for personal use — commercial licensing available on request.",
    tips: [
      "Take a retainer. A 50% deposit at booking is standard in photography — it protects the date you're turning other work away from, and clients who've paid half don't ghost. Put the retainer and the balance due date in the terms of every invoice.",
      "Never hand over final images before the balance clears. The gallery-link model makes this painless: send watermarked previews, release the download PIN when payment lands. Your invoice's terms line is where the client agreed to that.",
      "Price editing separately even if you quote a package. When a client asks for “just 30 more edited photos,” a per-image line on past invoices means the answer is a number, not a negotiation.",
    ],
    faq: [
      { q: "Should photographers charge a deposit or retainer?", a: "Yes — 50% at booking is the industry norm for weddings and events. It compensates you for reserving the date and filters out non-serious inquiries. Note it in the invoice terms so the paper trail is unambiguous." },
      { q: "How do photographers bill for editing?", a: "Most either roll a fixed number of edited images into the package or bill per edited image beyond it. A separate editing line item on the invoice makes extra-image requests easy to price later." },
      { q: "Do I need special software to invoice as a photographer?", a: "No. This template runs in your browser — fill in your rates, add your logo, download a PDF. Nothing is uploaded and no account is needed." },
    ],
  },
  {
    slug: "graphic-design",
    emoji: "🎨",
    name: "Graphic design",
    person: "graphic designers",
    keyword: "graphic design invoice template",
    blurb: "Logos, branding, revisions & file handover",
    title: "Free Graphic Design Invoice Template — No Signup, In-Browser",
    desc: "A free invoice template for graphic designers: logo concepts, brand guides, revision rounds and rights transfer, pre-filled and editable in your browser. No account required.",
    lede: "The logo's approved, the files are exported, and now the least creative document of the project is due. This template pre-fills a designer's typical line items — swap in your rates and send the PDF.",
    include: [
      "<strong>Deliverables, not hours alone</strong> — “Logo design: 3 concepts, 2 revision rounds” tells the client what they bought; a bare hour count invites auditing.",
      "<strong>Revision rounds included vs. billed</strong> — the single most disputed item in design work. Name the number on the invoice.",
      "<strong>File formats delivered</strong> — AI, SVG, PNG, PDF. Prevents the “can you also send…” email chain from reopening a closed project.",
      "<strong>Rights transfer condition</strong> — ownership moves on final payment, and the invoice is where that's written down.",
      "<strong>Extra work at an hourly rate</strong> — a visible rate for out-of-scope requests keeps scope creep priced instead of free.",
    ],
    items: [
      { desc: "Logo design — 3 concepts, 2 revision rounds", qty: "1" },
      { desc: "Brand style guide (colors, typography, usage)", qty: "1" },
      { desc: "Business card & letterhead design", qty: "1" },
      { desc: "Additional revisions beyond included rounds (hourly)", qty: "2" },
    ],
    notes: "Final files delivered as AI, SVG, PNG and PDF on receipt of payment.",
    terms: "50% due upfront, 50% on delivery. Two revision rounds included; further revisions billed at the hourly rate above. Full usage rights transfer on final payment.",
    tips: [
      "Split payment 50/50. Half upfront before you open the design file, half before final files ship. Designers who bill 100% on completion are lending money to strangers — the upfront half also makes the client's commitment real before you invest the concepts.",
      "Tie rights to payment, in writing, on the invoice. “Full usage rights transfer on final payment” is one sentence, and it converts an unpaid invoice from an awkward email into leverage: the brand isn't theirs until it's paid for.",
      "Count revisions out loud. “Round 2 of 2 included rounds” in a delivery email, matching the invoice line, resets the client's expectations before round 3 becomes an assumption.",
    ],
    faq: [
      { q: "How much should a graphic designer charge upfront?", a: "50% before work begins is the accepted standard for project work. For new clients or large projects, some designers use thirds: on signing, at concept approval, and on delivery." },
      { q: "How do designers handle unlimited revision requests?", a: "State the included rounds on the invoice itself (e.g. “2 revision rounds included”) and list an hourly rate for more. The paper trail turns scope creep into a billable decision the client makes." },
      { q: "When should design files be handed over?", a: "Source files ship after final payment clears. Send flattened previews for approval; the invoice terms should say rights and files transfer on payment." },
    ],
  },
  {
    slug: "web-development",
    emoji: "💻",
    name: "Web development",
    person: "web developers",
    keyword: "web developer invoice template",
    desc: "A free invoice template for freelance web developers: feature builds, testing, deployment and support windows, pre-filled and editable in your browser. No signup.",
    blurb: "Builds, testing, deployment & support",
    title: "Free Web Developer Invoice Template — No Signup, In-Browser",
    lede: "You shipped the feature, squashed the bugs, and wrote exactly zero invoices you enjoyed. This template pre-fills the lines freelance developers bill most — hours, testing, deploy, support — so you can get back to the code.",
    include: [
      "<strong>Hours against a named deliverable</strong> — “Development: checkout flow (20h)” survives a client's finance review; “dev work” doesn't.",
      "<strong>Testing as a visible line</strong> — cross-browser and responsive testing is real work; on the invoice it stops being assumed-free.",
      "<strong>Deployment and launch support</strong> — the go-live weekend has a price.",
      "<strong>A bounded bug-fix window</strong> — “30 days post-launch” converts “forever free support” into a defined deliverable.",
      "<strong>Where the code lives</strong> — note the repo handover in the invoice notes; it marks the moment delivery happened.",
    ],
    items: [
      { desc: "Development — [feature / project phase] (hours)", qty: "20" },
      { desc: "Responsive design & cross-browser testing", qty: "1" },
      { desc: "Deployment & launch support", qty: "1" },
      { desc: "Post-launch bug-fix window (30 days)", qty: "1" },
    ],
    notes: "Source code delivered via private Git repository on payment.",
    terms: "Payment due within 14 days of invoice date. Work on subsequent milestones begins once payment clears.",
    tips: [
      "Bill by milestone, not at the end. Deposit → milestone → launch keeps your exposure to any one unpaid invoice small, and “next milestone starts when this invoice clears” — written in the terms — is the polite version of leverage that actually works.",
      "Define the support window on the invoice. Every developer has a client who treats launch day as the start of a lifetime warranty. “Post-launch bug-fix window (30 days)” as a line item creates the expiry date in the client's own records.",
      "Name the deliverable next to the hours. Finance departments approve “Checkout flow — 20 hours” without questions; they email you about “development services.” The five extra words are worth days of payment delay.",
    ],
    faq: [
      { q: "Should freelance developers invoice hourly or fixed-price?", a: "Both work — the invoice discipline is the same: tie the amount to a named deliverable or milestone. Hourly suits open-ended work; fixed-price suits well-specified projects with a deposit and milestone schedule." },
      { q: "How do developers handle clients who keep reporting bugs for free?", a: "Put a bounded bug-fix window (e.g. 30 days post-launch) on the invoice as a line item. Inside the window it's covered; after it, fixes are new billable work by the client's own paperwork." },
      { q: "What payment terms are normal for freelance dev work?", a: "Net 14 is common for freelancers (Net 30 favors large companies, not you). Add that the next milestone starts when payment clears — it makes late payment self-penalizing." },
    ],
  },
  {
    slug: "writing",
    emoji: "✍️",
    name: "Writing & copywriting",
    person: "freelance writers",
    keyword: "freelance writer invoice template",
    blurb: "Articles, per-word rates, briefs & kill fees",
    title: "Free Freelance Writer Invoice Template — No Signup, In-Browser",
    desc: "A free invoice template for freelance writers and copywriters: per-word article rates, briefs, SEO extras and kill-fee terms, editable in your browser. No account, nothing uploaded.",
    lede: "Fifteen hundred words on deadline is easy; the invoice for them somehow isn't. This template pre-fills a writer's usual lines — per-word article rate, brief, SEO extras — with kill-fee terms already written in.",
    include: [
      "<strong>The per-word (or per-piece) rate visible as qty × rate</strong> — 1,500 words × your rate. It reprices future assignments automatically when the word count grows.",
      "<strong>What a “finished article” includes</strong> — research, one or two revision rounds. Bound it or revisions multiply.",
      "<strong>SEO extras as separate lines</strong> — meta descriptions, keyword research. Small amounts that vanish if bundled.",
      "<strong>A kill fee in the terms</strong> — 50% for work cancelled after drafting begins is the professional standard.",
      "<strong>Publication rights</strong> — first serial, exclusive, work-for-hire. One line prevents your article being resold without you.",
    ],
    items: [
      { desc: "Blog article — research, writing, 1 revision round (per word)", qty: "1500" },
      { desc: "SEO meta title & description", qty: "1" },
      { desc: "Content brief & keyword research", qty: "1" },
    ],
    notes: "One revision round included per article; further revisions billed separately.",
    terms: "Payment due within 14 days. A 50% kill fee applies to commissioned work cancelled after drafting begins.",
    tips: [
      "Put the kill fee on every invoice before you need it. Editors reorganize, campaigns get cancelled, and the writer without a kill-fee line eats the loss. 50% after drafting begins is standard enough that no reasonable client pushes back — but only if it was written down first.",
      "Make the word count do the math. Billing 1,500 words as qty × per-word rate (instead of a lump sum) means the 2,400-word revision of the brief reprices itself — no renegotiation email required.",
      "Cap revisions at the invoice level. “One revision round included” turns the fourth “small tweak” pass into a friendly new line item instead of an argument about what was implied.",
    ],
    faq: [
      { q: "What is a kill fee and should freelance writers charge one?", a: "A kill fee is partial payment (typically 50%) for commissioned work the client cancels before publication. Yes — put it in your invoice terms on every job; it costs nothing until the day it saves an entire week's income." },
      { q: "Should writers bill per word, per article, or per hour?", a: "Per word or per article are standard for content work; hourly suits editing and consulting. Whichever you choose, showing it as qty × rate on the invoice makes scope changes reprice automatically." },
      { q: "How many revisions should be included in a writing rate?", a: "One or two rounds is typical. State the number on the invoice — bounded revisions are the difference between a finished article and an eternal one." },
    ],
  },
  {
    slug: "consulting",
    emoji: "📊",
    name: "Consulting",
    person: "consultants",
    keyword: "consulting invoice template",
    blurb: "Hourly strategy, workshops & reports",
    title: "Free Consulting Invoice Template — No Signup, In-Browser",
    desc: "A free invoice template for consultants: hourly strategy work, discovery workshops and written deliverables with Net-15 terms, editable in your browser. No account needed.",
    lede: "The recommendations deck landed; the invoice shouldn't take a workshop of its own. This template pre-fills a consultant's standard structure — hours, workshop, written deliverable — with Net-15 terms attached.",
    include: [
      "<strong>Hours tied to the engagement phase</strong> — “Strategy consulting: discovery phase (10h)” reads as progress; unlabeled hours read as meter-running.",
      "<strong>Workshops and interviews as fixed lines</strong> — a day of stakeholder interviews is a product, not just hours.",
      "<strong>The written deliverable itself</strong> — the report is what survives the engagement; give it its own line.",
      "<strong>Scope boundary in the terms</strong> — “additional work quoted separately” is the sentence that keeps engagements from dissolving into free follow-ups.",
      "<strong>Late-payment interest</strong> — 1.5% monthly is customary and mostly works as a deterrent, which is the point.",
    ],
    items: [
      { desc: "Strategy consulting — [engagement / phase] (hours)", qty: "10" },
      { desc: "Discovery workshop & stakeholder interviews", qty: "1" },
      { desc: "Written recommendations report", qty: "1" },
    ],
    notes: "Summary of findings and recommended next steps delivered separately.",
    terms: "Net 15. Late payments accrue 1.5% monthly interest. Work beyond the agreed scope is quoted separately.",
    tips: [
      "Invoice on a schedule, not at the end. Monthly invoicing (or per-phase for shorter engagements) keeps any single unpaid invoice survivable and surfaces payment problems while you still have leverage — mid-engagement, not after handover.",
      "Give the deliverable a line of its own. Clients forget hours; they remember the workshop and the report. An invoice that lists artifacts alongside time reads as value received rather than time consumed — and gets approved faster.",
      "Write the scope boundary into the terms. “Work beyond agreed scope quoted separately” converts the sixth “quick follow-up call” from an obligation into a purchasing decision — theirs." ,
    ],
    faq: [
      { q: "What payment terms should consultants use?", a: "Net 15 is a sensible freelancer default — short enough to matter, long enough for a client's payment run. Pair it with modest late interest (1.5%/month) as a deterrent." },
      { q: "Should consultants bill hourly or by retainer?", a: "Hourly or per-phase suits project engagements; monthly retainers suit ongoing advisory. Retainers should still produce a monthly invoice listing what the period covered — it re-justifies the retainer every month." },
      { q: "How do consultants stop scope creep politely?", a: "Put “additional work quoted separately” in every invoice's terms. When the extra request comes, the answer is a friendly quote, not a confrontation — the boundary was already agreed to in writing." },
    ],
  },
  {
    slug: "tutoring",
    emoji: "📚",
    name: "Tutoring",
    person: "tutors",
    keyword: "tutoring invoice template",
    blurb: "Sessions, materials & monthly billing",
    title: "Free Tutoring Invoice Template — No Signup, In-Browser",
    desc: "A free invoice template for tutors and teachers: per-session billing, custom materials and progress reports, with prepayment and cancellation terms. Runs in your browser, no account.",
    lede: "Four sessions, custom worksheets, a progress email to the parents — and then the awkward money conversation. This template turns it into a clean monthly PDF: sessions × rate, materials, terms that handle cancellations for you.",
    include: [
      "<strong>Sessions as qty × rate</strong> — “4 × 60-minute session” makes the month self-explanatory to whoever pays (often not the student).",
      "<strong>The session dates in the notes</strong> — parents reconcile invoices against calendars; listing dates prevents every “are you sure about the 12th?” email.",
      "<strong>Materials as their own line</strong> — custom practice sets and worksheets are prep work; visible, they justify your rate.",
      "<strong>A cancellation window in the terms</strong> — 24 hours is standard. Without it, your calendar is a suggestion.",
      "<strong>Prepayment for the month</strong> — billing before the first session flips the default from chasing to scheduling.",
    ],
    items: [
      { desc: "Tutoring session — 60 minutes", qty: "4" },
      { desc: "Custom study materials & practice sets", qty: "1" },
      { desc: "Progress report & parent consultation", qty: "1" },
    ],
    notes: "Sessions covered by this invoice: [dates].",
    terms: "Payment due before the first session of the month. Sessions cancelled with less than 24 hours' notice are billed in full.",
    tips: [
      "Bill the month upfront. Tutoring's chronic problem is the drifting cancellation, and prepayment solves it structurally: a paid session gets rescheduled, an unpaid one evaporates. “Due before the first session of the month” is one line of terms.",
      "Enforce the 24-hour rule by invoice, not by argument. When the no-show happens, the line “Session — cancelled <24h notice” on the next invoice, backed by terms the parent already accepted, does the talking for you.",
      "Send the progress note with the invoice. One email: here's what we covered, here's the improvement, here's next month's invoice. The value and the price arrive together, which is exactly the order you want them considered in.",
    ],
    faq: [
      { q: "Should tutors charge before or after sessions?", a: "Before — bill the month's sessions before the first one. It eliminates chasing payments and makes late cancellations billable rather than debatable." },
      { q: "How do tutors charge for cancelled or missed sessions?", a: "State a cancellation window in the invoice terms (24 hours is standard). Sessions cancelled inside the window are billed in full; the pre-agreed term makes it routine instead of personal." },
      { q: "Do tutors need invoicing software?", a: "No — this template runs in your browser. Set your session rate, list the dates in the notes, download the PDF. No account, and no student data leaves your device." },
    ],
  },
  {
    slug: "videography",
    emoji: "🎬",
    name: "Videography",
    person: "videographers",
    keyword: "videography invoice template",
    blurb: "Day rates, editing, licensing & delivery",
    title: "Free Videography Invoice Template — No Signup, In-Browser",
    desc: "A free invoice template for videographers: filming day rates, editing hours, music licensing and 4K delivery, pre-filled and editable in your browser. No signup required.",
    lede: "A ten-hour shoot day, a week in the edit, and the invoice still has to explain why video costs what it costs. This template pre-fills the structure that does the explaining: day rate, edit hours, licensing, delivery.",
    include: [
      "<strong>The day rate as the anchor line</strong> — crew, camera and audio for a filming day is the industry's unit; hourly rates invite hourly arguments.",
      "<strong>Editing hours separate from the shoot</strong> — the edit is usually the bigger number; hidden inside a package it's the number clients dispute.",
      "<strong>Licensing costs passed through visibly</strong> — music and stock are real, receipted costs; on their own line nobody questions them.",
      "<strong>Deliverables spelled out</strong> — “4K master + social cuts” defines done. “The video” never stops being re-editable.",
      "<strong>Revision rounds on the edit</strong> — two included, then billed; the note that keeps the color-grade from going around a fourth time.",
    ],
    items: [
      { desc: "Filming day rate — crew of one, camera & audio", qty: "1" },
      { desc: "Video editing & color grading (hours)", qty: "8" },
      { desc: "Licensed music & stock footage (pass-through)", qty: "1" },
      { desc: "Final delivery — 4K master + social cuts", qty: "1" },
    ],
    notes: "Two revision rounds included on the edit; further rounds billed hourly.",
    terms: "50% deposit reserves the shoot date; balance due on delivery of final files. Raw footage available for an additional fee.",
    tips: [
      "Deposit reserves the date — say it exactly that way. A videographer's inventory is days, and an unpaid booking is a day sold twice or not at all. “50% deposit reserves the shoot date” makes the transaction legible to the client.",
      "Keep raw footage as an upsell, not a default. Delivering finals-only is standard; the terms line “raw footage available for an additional fee” captures the clients who want everything at a price that respects the storage and the rights.",
      "Pass licensing through at cost, visibly. Music and stock on their own line — with “pass-through” in the description — is the one line clients never argue with, and it stops the license cost from silently eating your edit rate.",
    ],
    faq: [
      { q: "How much deposit should videographers take?", a: "50% at booking is standard — it compensates for reserving the shoot date. The balance is due on delivery of final files, before handing over unwatermarked masters." },
      { q: "Should videographers give clients the raw footage?", a: "By default, no — deliverables are the edited masters. Offer raw footage as a priced add-on in your invoice terms; it converts an awkward request into a sale." },
      { q: "How do videographers bill for editing?", a: "Separately from the shoot, usually hourly, with a stated number of included revision rounds. The separation shows clients where the time actually goes — most of video is the edit." },
    ],
  },
  {
    slug: "cleaning",
    emoji: "🧹",
    name: "Cleaning services",
    person: "cleaning businesses",
    keyword: "cleaning service invoice template",
    blurb: "Standard cleans, deep-clean add-ons & supplies",
    title: "Free Cleaning Service Invoice Template — No Signup, In-Browser",
    desc: "A free invoice template for cleaning services: standard cleans, deep-clean add-ons, supplies and same-day payment terms, editable in your browser. No account, no uploads.",
    lede: "Three houses today and paperwork tonight is a bad trade. This template pre-fills a cleaning business's usual lines — standard clean, deep-clean add-ons, supplies — so the invoice takes a minute, not an evening.",
    include: [
      "<strong>The service tied to the property size</strong> — “Standard clean: 3 bed / 2 bath” prices itself; “cleaning” gets questioned.",
      "<strong>Add-ons as separate lines</strong> — oven, fridge, baseboards, windows. Visible add-ons are how a $120 job becomes $180 without a single awkward conversation.",
      "<strong>Supplies when you bring them</strong> — a small line that, over a month of jobs, is real money.",
      "<strong>Address and date in the notes</strong> — for landlords and property managers with five properties, this is the difference between paid-today and “which unit was this?”",
      "<strong>Day-of-service payment terms</strong> — residential cleaning is pay-on-completion; say so on the invoice.",
    ],
    items: [
      { desc: "Standard home cleaning — 3 bed / 2 bath", qty: "1" },
      { desc: "Deep-clean add-on — oven, fridge & baseboards", qty: "1" },
      { desc: "Cleaning supplies & materials", qty: "1" },
    ],
    notes: "Service address: [address]. Date of service: [date].",
    terms: "Payment due on the day of service. Cancellations with less than 48 hours' notice incur a 50% fee.",
    tips: [
      "Invoice same-day, every time. Residential cleaning runs on pay-on-completion, and an invoice that arrives three days later gets paid a week after that. Send the PDF from the driveway; the terms already say due today.",
      "Make add-ons a menu, not a favor. “Can you also do the oven?” should have a printed answer. Separate add-on lines on every invoice teach clients the extras have prices, and quietly raise your average ticket.",
      "Protect the schedule with a cancellation fee. A cancelled afternoon is unsellable inventory. “Less than 48 hours' notice: 50% fee” in the terms of every invoice makes the policy pre-agreed instead of announced mid-dispute.",
    ],
    faq: [
      { q: "When should cleaning services get paid?", a: "On the day of service for residential work — put it in the invoice terms. For commercial contracts and property managers, weekly or monthly invoicing with Net 7–15 is typical." },
      { q: "Should a cleaning business charge for cancellations?", a: "Yes — a 50% fee inside a 48-hour window is common. A cancelled slot usually can't be refilled; the fee in your standing invoice terms makes it enforceable without argument." },
      { q: "How should cleaning add-ons be priced?", a: "As separate flat-priced line items (oven, fridge, windows, baseboards) rather than bundled in. Clients accept visible menu prices readily, and the itemized invoice raises your average job value." },
    ],
  },
  {
    slug: "plumbing",
    emoji: "🔧",
    name: "Plumbing",
    person: "plumbers",
    keyword: "plumbing invoice template",
    blurb: "Service calls, labor, parts & emergency rates",
    title: "Free Plumbing Invoice Template — No Signup, Fills In Your Browser",
    desc: "A free invoice template for plumbers: service call, labor hours, parts and after-hours rates, pre-filled and editable in your browser. No account, nothing uploaded.",
    lede: "The water heater's in, the crawl space is behind you, and the last thing standing between you and the next job is paperwork. This template pre-fills the lines plumbers actually bill — service call, labor, parts — so the invoice is done before the truck is loaded.",
    include: [
      "<strong>The service call as its own line</strong> — the trip fee covers showing up and diagnosing; burying it in labor makes your hourly rate look inflated instead.",
      "<strong>Labor with hours shown</strong> — “Labor: 2.5 hrs” survives scrutiny; a single lump sum invites the phone call.",
      "<strong>Parts listed individually</strong> — the customer can google a fill valve. Let them. Honest part lines at your price build the trust that gets you the repipe job later.",
      "<strong>After-hours or emergency surcharge, separately</strong> — a visible 2am line item reads as fair; the same money hidden in labor reads as gouging.",
      "<strong>Your license number and warranty</strong> — “Licensed & insured, lic. #12345, 90-day labor warranty” turns an invoice into a credential.",
    ],
    items: [
      { desc: "Service call — diagnosis & estimate", qty: "1" },
      { desc: "Labor — [repair / installation] (hours)", qty: "2" },
      { desc: "Parts & materials — [valve / heater / fittings]", qty: "1" },
      { desc: "After-hours emergency surcharge", qty: "1" },
    ],
    notes: "Service address: [address]. Licensed & insured — license #[number]. Labor warrantied for 90 days.",
    terms: "Payment due on completion. Parts carry the manufacturer's warranty; labor warrantied 90 days from service date.",
    tips: [
      "Collect on completion, in the driveway. Plumbing is a due-on-receipt trade — the fixed leak gets less valuable to the customer every dry day that passes. Hand over the PDF invoice while you're still on site; “payment due on completion” in the terms means that was the deal all along.",
      "Never eat the trip. The service call fee is what makes no-fix visits survivable and quotes honest. Waive it if you like when the job lands — as a visible discount line — so the customer sees the fee exists and sees you choosing not to charge it.",
      "Quote flat, itemize anyway. Most residential plumbing sells better at a flat price, but the invoice should still break out service call, labor and parts. It reads as transparency to this customer, and it's your pricing record when the same job shows up across town.",
    ],
    faq: [
      { q: "Should plumbers charge a service call fee?", a: "Yes — a trip fee that covers arrival and diagnosis is standard, typically credited toward the repair if the customer proceeds. It filters tire-kickers and pays for the visits that end in a quote instead of a job." },
      { q: "How do plumbers bill for parts?", a: "List each significant part as its own line at your installed price. Markup over supplier cost is normal and expected — what customers dispute is a vague “materials” lump, not a named part with a number next to it." },
      { q: "When is a plumbing invoice due?", a: "On completion, for residential service work — put it in the terms and collect on site. Net 15–30 applies to property managers, general contractors and commercial accounts, where you should also reference their PO or unit number in the notes." },
    ],
  },
  {
    slug: "electrician",
    emoji: "⚡",
    name: "Electrical",
    person: "electricians",
    keyword: "electrician invoice template",
    blurb: "Troubleshooting, installs, materials & permits",
    title: "Free Electrician Invoice Template — No Signup, In-Browser",
    desc: "A free invoice template for electricians: troubleshooting, installation labor, materials and permit fees, pre-filled and editable in your browser. No account required.",
    lede: "The panel's labeled, the breaker holds, and the customer is already asking about recessed lights — but first, the invoice. This template pre-fills an electrician's usual lines so the paperwork takes less time than the walkthrough.",
    include: [
      "<strong>Troubleshooting as billed time</strong> — finding the fault is the skill. “Troubleshooting & diagnosis: 1.5 hrs” gets paid; unbilled detective work becomes free labor the customer never saw.",
      "<strong>Installation labor per fixture or per hour</strong> — “Install 6 recessed fixtures” prices itself in the customer's head before you say a number.",
      "<strong>Materials with the grade visible</strong> — 12/2 Romex, a 200A panel, AFCI breakers. Named materials justify prices and quietly document that you installed to code.",
      "<strong>Permit and inspection fees passed through</strong> — a separate line signals the work is permitted, which is exactly what the next home inspector will ask.",
      "<strong>License number on every invoice</strong> — electrical is a licensed trade; the number on the paper is what makes the warranty and the resale disclosure real.",
    ],
    items: [
      { desc: "Troubleshooting & diagnosis (hours)", qty: "1" },
      { desc: "Installation labor — [panel / fixtures / circuit] (hours)", qty: "3" },
      { desc: "Materials — [wire / breakers / fixtures]", qty: "1" },
      { desc: "Permit & inspection fee", qty: "1" },
    ],
    notes: "Work performed to NEC and local code. Licensed & insured — license #[number].",
    terms: "Payment due on completion for service work; Net 15 on contractor accounts. Labor warrantied 12 months from service date.",
    tips: [
      "Bill the diagnosis. Homeowners happily pay to have six fixtures installed and grumble at two hours spent finding a neutral fault — unless the invoice names it. “Troubleshooting & diagnosis” as a standing line item trains customers that finding the problem is the product.",
      "Separate the permit money. Pass permit and inspection fees through at cost, on their own line. It shows the job was inspected, it explains a chunk of the price you didn't keep, and it protects your quote when the county raises fees.",
      "Put the code on paper. “Work performed to NEC and local code” in the notes costs nothing and follows the house. Realtors, inspectors and the next owner will read that invoice — it's the cheapest marketing a licensed electrician can buy.",
    ],
    faq: [
      { q: "How do electricians usually charge — hourly or flat rate?", a: "Both are common: hourly (often with a first-hour minimum) for troubleshooting and service calls, flat per-job or per-fixture pricing for defined installs. Either way, itemize labor, materials and permits separately on the invoice." },
      { q: "Should permit fees appear on an electrical invoice?", a: "Yes, as their own pass-through line. It documents that the work was permitted and inspected — which matters at resale — and keeps your labor price legible instead of mysteriously padded." },
      { q: "Do electricians warranty their work?", a: "A 12-month labor warranty is common for licensed electricians, with materials under manufacturer warranty. State it in the invoice terms; it differentiates you from unlicensed competition at zero cost." },
    ],
  },
  {
    slug: "landscaping",
    emoji: "🌿",
    name: "Landscaping",
    person: "landscapers and lawn care businesses",
    keyword: "landscaping invoice template",
    blurb: "Recurring maintenance, projects, materials & haul-away",
    title: "Free Landscaping Invoice Template — No Signup, In-Browser",
    desc: "A free invoice template for landscaping and lawn care: recurring maintenance, one-off projects, materials and disposal, pre-filled and editable in your browser. No account, no uploads.",
    lede: "Eight yards on a Tuesday and the billing still has to happen at the kitchen table. This template pre-fills the lines landscaping runs on — recurring maintenance, project work, materials, haul-away — so invoicing keeps pace with the mowing.",
    include: [
      "<strong>Recurring maintenance at a per-visit or monthly rate</strong> — “Weekly maintenance, 4 visits” bills clean; vague “lawn care — June” invites the did-you-really-come-every-week audit.",
      "<strong>Project work separated from maintenance</strong> — the spring cleanup and the mulch install are not the mowing contract. Mixing them teaches clients that big jobs are included.",
      "<strong>Materials by quantity</strong> — “Hardwood mulch: 5 cu yd” at your delivered-and-installed price. Quantities make material lines self-justifying.",
      "<strong>Green waste and haul-away</strong> — disposal costs you dump fees and trailer time; an explicit line stops it from silently eating the margin.",
      "<strong>The property address in the notes</strong> — owners of multiple properties and HOAs pay the invoices they can match to a location without emailing you.",
    ],
    items: [
      { desc: "Lawn maintenance — mow, edge, blow (per visit)", qty: "4" },
      { desc: "Seasonal cleanup — beds, leaves & pruning", qty: "1" },
      { desc: "Mulch — delivered & installed (cu yd)", qty: "5" },
      { desc: "Green waste haul-away & disposal", qty: "1" },
    ],
    notes: "Service address: [address]. Service period: [month]. Weather-delayed visits roll to the next scheduled day.",
    terms: "Recurring maintenance invoiced monthly, due within 7 days. Projects over [amount] require a 50% materials deposit before scheduling.",
    tips: [
      "Bill maintenance monthly, projects immediately. Recurring work rides a predictable monthly invoice — clients budget for it and autopay it. Project work (cleanups, installs, grading) gets its own invoice the day it's done, while the transformation is still visible from the kitchen window.",
      "Take a materials deposit on installs. Five yards of mulch and thirty shrubs on your trailer is your money until the client pays. “50% materials deposit before scheduling” in the terms means the plants are pre-sold, not speculative inventory.",
      "Write the weather clause once. Rain weeks generate more billing disputes than bad work does. One sentence in the notes — “weather-delayed visits roll to the next scheduled day” — settles in advance the argument you'd otherwise have every wet spring.",
    ],
    faq: [
      { q: "Should landscapers bill per visit or monthly?", a: "Recurring maintenance is usually a flat monthly rate (annualized across the season) or a per-visit rate invoiced monthly. Flat monthly smooths your cash flow; per-visit is easier to defend when weather changes the count — either way, show the visit count on the invoice." },
      { q: "How should landscaping materials be priced?", a: "By quantity, delivered and installed — “5 cu yd hardwood mulch” — with your markup built into the unit price. Separate material lines also make the deposit conversation easy on bigger installs." },
      { q: "Do landscapers charge for haul-away?", a: "Yes — green waste disposal costs real dump fees and trailer time, so it belongs on the invoice as its own line. Clients accept a visible disposal fee far more readily than a padded labor number." },
    ],
  },
  {
    slug: "handyman",
    emoji: "🔨",
    name: "Handyman",
    person: "handymen and home repair pros",
    keyword: "handyman invoice template",
    blurb: "Task lists, hourly labor, minimums & materials",
    title: "Free Handyman Invoice Template — No Signup, In-Browser",
    desc: "A free invoice template for handyman work: itemized task lists, hourly labor with a minimum, and materials with receipts, editable in your browser. No account required.",
    lede: "Four small jobs at one house — a door that sticks, a fan that wobbles, drywall, caulk — and one invoice that has to make sense of it. This template pre-fills the handyman format: the task list, the hours, the materials, the minimum.",
    include: [
      "<strong>Each task as its own line</strong> — the client mentally re-buys every item on the list. “Fixed 4 things: $340” invites doubt; four named repairs at real prices reads as a bargain.",
      "<strong>Hourly labor with a stated minimum</strong> — the first hour is the truck, the tools and the drive. A visible minimum charge stops the $40 fantasy before it forms.",
      "<strong>Materials at cost plus pickup time</strong> — the Home Depot run is work. Bill the materials and the time it took to get them.",
      "<strong>Before-the-extra pricing for added tasks</strong> — “while you're here, could you also…” is where handyman margins go to die. New tasks get a price before they get done, and then a line on this invoice.",
      "<strong>Payment due on completion</strong> — small-job work is same-day money; the terms line makes it official.",
    ],
    items: [
      { desc: "Labor — [task 1: e.g. interior door repair] (hours)", qty: "1" },
      { desc: "Labor — [task 2: e.g. ceiling fan replacement] (hours)", qty: "1.5" },
      { desc: "Materials & supplies (receipts available)", qty: "1" },
      { desc: "Materials pickup & delivery", qty: "1" },
    ],
    notes: "Service address: [address]. Additional tasks quoted and approved on site before work began.",
    terms: "Payment due on completion. Two-hour minimum applies to all service visits.",
    tips: [
      "Defend the minimum cheerfully. A two-hour minimum isn't a penalty — it's what makes a 20-minute job worth driving to. Put it in the terms of every invoice and mention it when booking; the clients who balk were never going to be profitable.",
      "Turn “while you're here” into line items. Extra tasks are the best revenue in handyman work if they're priced out loud before you do them. Quote it on the spot, do it, add the line. The invoice's task list is your proof the extras were asked for, not smuggled in.",
      "Keep the receipts, bill the run. Materials at cost (receipts available on request) plus a pickup line for the store trip is the cleanest handyman materials policy — transparent enough that nobody checks, and the hour you spent in the plumbing aisle stops being free.",
    ],
    faq: [
      { q: "Should a handyman charge a minimum fee?", a: "Yes — one- to two-hour minimums are standard. Travel, setup and teardown are real costs on every visit regardless of job size; the minimum makes small jobs viable and is completely normal to state in your invoice terms." },
      { q: "How should a handyman invoice multiple small jobs?", a: "One invoice, one line per task, each with its own hours. An itemized task list justifies the total far better than a lump sum, and it becomes your price book for the next similar request." },
      { q: "Do handymen mark up materials?", a: "Common practice is either cost-plus (10–20%) or materials at cost with a separate line for pickup time. Both are legitimate — what matters is that materials appear on the invoice instead of silently inflating labor." },
    ],
  },
  {
    slug: "auto-repair",
    emoji: "🚗",
    name: "Auto repair",
    person: "independent mechanics and auto shops",
    keyword: "auto repair invoice template",
    blurb: "Diagnostics, labor hours, parts & shop fees",
    title: "Free Auto Repair Invoice Template — No Signup, In-Browser",
    desc: "A free invoice template for auto repair: diagnostics, labor hours, parts and shop fees with vehicle details, editable in your browser. No account, nothing uploaded.",
    lede: "The car's fixed and out of the bay — now the invoice has to explain a wheel bearing to someone who mostly wants to know it won't happen again. This template pre-fills the standard shop format: diagnosis, labor, parts, and the vehicle it all belongs to.",
    include: [
      "<strong>The vehicle in the notes</strong> — year, make, model, plate or VIN, and mileage. It's what makes the invoice a service record the customer keeps instead of paper they lose.",
      "<strong>Diagnostics as a real line</strong> — the scan and the road test are skilled time. Shops that credit the diag fee into an approved repair should show that as a visible discount, not silently absorb it.",
      "<strong>Labor hours in the open</strong> — book time or actual, “Labor: 2.4 hrs” is the industry-standard shape customers and insurers both recognize.",
      "<strong>Parts named, with quality tier</strong> — OEM, OE-equivalent or aftermarket. The named part at a fair installed price is your defense against the internet's parts-counter pricing.",
      "<strong>Warranty on parts and labor</strong> — “12 months / 12,000 miles” in the terms is why the customer comes back instead of shopping the next repair.",
    ],
    items: [
      { desc: "Diagnostics — scan, inspection & road test", qty: "1" },
      { desc: "Labor — [repair performed] (hours)", qty: "2.4" },
      { desc: "Parts — [part name, OEM / aftermarket]", qty: "1" },
      { desc: "Shop supplies & fluid disposal", qty: "1" },
    ],
    notes: "Vehicle: [year make model] — plate [number], [mileage] mi. Work authorized by customer on [date].",
    terms: "Payment due on vehicle pickup. Parts & labor warrantied 12 months / 12,000 miles, whichever comes first.",
    tips: [
      "Get authorization in writing before the wrench moves — and reference it on the invoice. “Work authorized by customer on [date]” closes the single biggest dispute in auto repair: surprise scope. If the job grew mid-repair, the call where they approved it belongs in the notes too.",
      "Show the diag credit. If you waive the diagnostic fee when the customer approves the repair, print the fee and then the credit. A freebie the customer can see buys goodwill; one they can't see buys nothing.",
      "Make the invoice the service record. Mileage, VIN, what was replaced and when it's warrantied until — a customer who keeps your invoices in the glovebox comes back to the shop whose paperwork they trust, and sends the car's next owner there too.",
    ],
    faq: [
      { q: "Should a mechanic charge a diagnostic fee?", a: "Yes — diagnosis is skilled labor and often the hardest part of the job. Many shops credit some or all of the fee toward the repair when it's approved; if you do, show it as a visible credit line on the invoice." },
      { q: "What has to be on an auto repair invoice?", a: "Vehicle identification (year/make/model, plate or VIN, mileage), the work performed, labor hours, each significant part, any shop fees, and your warranty terms. Several states also require written authorization for the work — reference it in the notes." },
      { q: "Is a shop supplies fee legitimate?", a: "A modest, clearly-labeled line for consumables (fluids disposal, rags, fasteners) is standard and honest — far better than hiding it in labor. Keep it proportionate; a percentage fee that rivals the parts line invites disputes." },
    ],
  },
  {
    slug: "catering",
    emoji: "🍽",
    name: "Catering",
    person: "caterers",
    keyword: "catering invoice template",
    blurb: "Per-guest menus, staff, rentals & deposits",
    title: "Free Catering Invoice Template — No Signup, In-Browser",
    desc: "A free invoice template for caterers: per-guest menu pricing, service staff, rentals, delivery and deposits, editable in your browser. No account, no uploads.",
    lede: "The event went beautifully, the chafing dishes are back in the van, and the invoice now has to hold together a number that was quoted per guest three months ago. This template pre-fills catering's moving parts — headcount, staff, rentals, deposit — so the math shows its work.",
    include: [
      "<strong>Menu priced per guest, headcount shown</strong> — “Buffet menu × 85 guests” recalculates itself when the count changes; a lump sum has to be renegotiated.",
      "<strong>The final-count deadline in the terms</strong> — you buy food and schedule staff off that number. The invoice should say when it locked and that you billed the greater of guaranteed vs. actual.",
      "<strong>Service staff as their own line</strong> — servers, bartenders, chef hours. Clients comparing caterers on menu price alone need to see where the service actually lives.",
      "<strong>Rentals and delivery separated</strong> — linens, glassware, delivery, setup and breakdown are real costs that don't belong inside the food number.",
      "<strong>Deposit shown as paid</strong> — the 50% that reserved the date appears as a credit, so the balance due is arithmetic, not archaeology.",
    ],
    items: [
      { desc: "Catering menu — [buffet / plated] (per guest)", qty: "85" },
      { desc: "Service staff — [servers / bartender] (hours)", qty: "12" },
      { desc: "Rentals — linens, glassware & serviceware", qty: "1" },
      { desc: "Delivery, setup & breakdown", qty: "1" },
    ],
    notes: "Event: [date, venue]. Final guest count of [number] confirmed [date]. Deposit of [amount] received [date] — balance shown below.",
    terms: "50% deposit reserves the event date. Final guest count due 7 days before the event; invoiced count is the greater of guaranteed and actual. Balance due on or before event day.",
    tips: [
      "Lock the headcount in writing, then bill from it. The final-count deadline (7 days out is typical) is the load-bearing clause of catering billing — you shop, prep and staff from that number. The invoice should name the count and the date it was confirmed, so a shrinking guest list after the deadline is visibly not your problem.",
      "Collect the balance before the last tray leaves. Day-of or day-before balance collection is standard and uncontroversial when it's in the terms from the first quote. Chasing an event's balance two weeks later, after the compliments have faded, is the worst collections position in food service.",
      "Price the service, not just the food. Staff hours, rentals, delivery and breakdown as separate lines protect your menu price from apples-to-oranges comparisons — and when a client trims budget, they can cut a bartender instead of asking you to cheapen the food.",
    ],
    faq: [
      { q: "How much deposit should a caterer require?", a: "50% to reserve the date is common, with the balance due on or shortly before event day. The deposit covers your purchasing and prep exposure — state on the invoice that it was received and show the remaining balance." },
      { q: "What is a final guest count deadline?", a: "The date (typically 5–7 days out) when the client's headcount locks for purchasing and staffing. Standard practice is to bill the greater of the guaranteed count and actual attendance — put that sentence in your invoice terms." },
      { q: "Should catering staff be a separate charge?", a: "Yes — server and bartender hours belong on their own line, not inside the per-guest food price. It keeps menu pricing comparable, makes staffing changes easy to price, and shows clients what full service actually involves." },
    ],
  },
  {
    slug: "personal-training",
    emoji: "💪",
    name: "Personal training",
    person: "personal trainers",
    keyword: "personal trainer invoice template",
    blurb: "Session packs, assessments & cancellation policies",
    title: "Free Personal Trainer Invoice Template — No Signup, In-Browser",
    desc: "A free invoice template for personal trainers: session packages, assessments, program design and late-cancellation terms, editable in your browser. No account required.",
    lede: "Coaching the 6am client is the job; invoicing them shouldn't take another session's worth of admin. This template pre-fills how training actually bills — packs paid up front, the assessment, the program, the no-show line nobody enjoys.",
    include: [
      "<strong>Sessions sold as prepaid packs</strong> — “10-session pack” on the invoice, paid before session one. Training billed per-session-after-the-fact turns a coach into a creditor.",
      "<strong>The pack's expiry window</strong> — 10 sessions in 12 weeks, on paper. Open-ended packs become year-old liabilities that haunt your calendar and your books.",
      "<strong>The initial assessment as a real line</strong> — movement screen, baselines, goal setting. Priced separately, it stops being a free sales call and starts being session zero.",
      "<strong>Program design distinct from floor time</strong> — the plan you write on Sunday night is billable product, especially for hybrid and online clients.",
      "<strong>The late-cancellation policy in the terms</strong> — 24 hours' notice or the session is used. It's only enforceable if it's on the paperwork the client already accepted.",
    ],
    items: [
      { desc: "1-on-1 training — 10-session pack", qty: "1" },
      { desc: "Initial assessment & movement screen", qty: "1" },
      { desc: "Program design & monthly check-in (online)", qty: "1" },
      { desc: "Late cancellation — [date] (per policy)", qty: "1" },
    ],
    notes: "Pack valid for 12 weeks from first session. Sessions: [gym / online]. Progress check scheduled at session 10.",
    terms: "Packages payable in full before the first session. Cancellations with less than 24 hours' notice count as a completed session.",
    tips: [
      "Sell packs, not sessions. Prepaid 5- and 10-packs put the money in front of the work, commit the client to the block where results actually happen, and end the monthly who-owes-what reconstruction. The invoice for a pack is one clean line — date it, expire it, done.",
      "Charge the late cancel like you mean it. The 24-hour rule protects the only inventory a trainer has: time slots. Enforce it kindly and identically for everyone — an invoice line reading “Late cancellation — per policy” with a date does the talking, and clients who've seen the line once rarely generate it twice.",
      "Bill the thinking, not just the reps. Assessments, program design and check-ins are where your expertise is densest. Separate lines for them raise your effective rate without touching the per-session price — and they make online coaching a product instead of a favor.",
    ],
    faq: [
      { q: "Should personal trainers charge for sessions upfront?", a: "Yes — prepaid packages are the industry standard. Payment before the first session protects your schedule, and the commitment measurably improves client adherence. Invoice the pack as a single line with its expiry window." },
      { q: "How do trainers handle late cancellations?", a: "A 24-hour cancellation policy, stated in the invoice terms, with late cancels counting as completed sessions. The slot can't be resold on short notice — consistent, unapologetic enforcement is what keeps the policy respected." },
      { q: "Should session packages expire?", a: "Yes — a 10-pack valid 8–12 weeks keeps clients training at result-producing frequency and keeps your books free of indefinite liabilities. Put the expiry on the invoice so it's agreed, not announced later." },
    ],
  },
  {
    slug: "painting",
    emoji: "🖌",
    name: "Painting",
    person: "painters",
    keyword: "painting invoice template",
    blurb: "Prep work, labor by room, paint & touch-ups",
    title: "Free Painting Invoice Template — No Signup, In-Browser",
    desc: "A free invoice template for painters: surface prep, labor by room or square foot, paint and materials, editable in your browser. No account, nothing uploaded.",
    lede: "Two coats, cut lines a laser would envy, and every outlet cover back on straight — the invoice should read as clean as the walls. This template pre-fills a painter's real line items, starting with the one clients never see coming: the prep.",
    include: [
      "<strong>Prep as a visible line</strong> — patching, sanding, caulking, masking. It's half the job and the whole difference between you and the low bid; on the invoice it finally gets paid like it.",
      "<strong>Labor by room or by square foot</strong> — “Interior painting: 3 bedrooms + hallway” scopes itself. Whole-house lump sums are where change requests go to hide.",
      "<strong>Paint spelled out</strong> — brand, line, sheen, gallons, coats. “2 coats Duration, eggshell” justifies the price and answers the touch-up question two years from now.",
      "<strong>Trim, doors and ceilings separated</strong> — the fiddly brushwork that doubles the hours should never be invisible inside a walls price.",
      "<strong>Deposit and walkthrough terms</strong> — a third down to schedule, balance after the blue-tape walkthrough. The invoice records both.",
    ],
    items: [
      { desc: "Surface prep — patch, sand, caulk & mask", qty: "1" },
      { desc: "Interior painting — [rooms / area], 2 coats", qty: "3" },
      { desc: "Trim, doors & ceilings", qty: "1" },
      { desc: "Paint & materials — [brand, sheen] (gallons)", qty: "6" },
    ],
    notes: "Colors: [names/codes]. Two coats throughout; touch-up walkthrough completed [date]. Leftover paint labeled and left with client.",
    terms: "One-third deposit to schedule; balance due on completion after final walkthrough. Workmanship warrantied for 2 years.",
    tips: [
      "Invoice the prep or lose it. Unprepped walls are why cheap paint jobs look cheap — but if prep hides inside the labor number, the client compares your bid to the guy who skips it. A named prep line educates the client and armors your price at the same time.",
      "Do the walkthrough before the invoice is due. Balance-on-walkthrough beats balance-on-someday: walk the rooms with the client and the blue tape, fix the misses that afternoon, and collect against an invoice whose terms said exactly this would happen.",
      "Leave the paint, note it on the invoice. Labeled leftover gallons plus the brand/color/sheen recorded in the notes turns your invoice into the house's paint registry. It's a five-minute courtesy that gets you the touch-up calls, the referrals, and the repaint in five years.",
    ],
    faq: [
      { q: "How do painters price jobs — by square foot or by room?", a: "Both are common: per-square-foot for large or empty spaces, per-room for occupied homes with normal prep. Whichever you quote, itemize prep, walls, trim and materials separately on the invoice so the price explains itself." },
      { q: "Should painters take a deposit?", a: "Yes — commonly a third (up to half for color-matched or special-order materials) to reserve the schedule, balance due after the final walkthrough. Both halves belong in the invoice terms so payment timing is pre-agreed." },
      { q: "Does paint go on the invoice separately from labor?", a: "Yes — list brand, line, sheen, gallon count and number of coats. It documents the quality level the client paid for, prevents mid-job product downgrades from being invisible, and gives everyone the reorder info for touch-ups." },
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
  <meta property="og:type" content="website">
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

const breadcrumbLd = (name, slug) => `  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Billotter", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Invoice templates", item: `${BASE}/templates/` },
      { "@type": "ListItem", position: 3, name, item: `${BASE}/templates/${slug}/` },
    ],
  }, null, 2).replace(/\n/g, "\n  ")}
  </script>
`;

const otherTemplates = (currentSlug, root) => `
  <h2>More free invoice templates</h2>
  <ul class="tpl-grid">
${NICHES.filter((n) => n.slug !== currentSlug)
  .map((n) => `    <li><a class="tpl-card" href="${root}templates/${n.slug}/"><strong>${n.name}</strong><span>${n.blurb}</span></a></li>`)
  .join("\n")}
  </ul>
`;

/* ---------- niche page ---------- */

function nichePage(n) {
  const root = "../../";
  const use = `${root}?template=${n.slug}#app`;
  return (
    head(n.title, n.desc, `templates/${n.slug}/`, `${root}css/style.css`, faqLd(n.faq) + breadcrumbLd(n.name, n.slug)) +
    topbar(root) +
    `
<main class="page">
  <nav class="crumbs"><a href="${root}">Billotter</a> › <a href="${root}templates/">Templates</a> › ${n.name}</nav>
  <h1>${n.name} invoice template</h1>
  <p class="lede">${n.lede}</p>
  <div class="cta-row">
    <a class="btn btn-primary" href="${use}">Use this template — free, no signup</a>
    <span class="cta-note">Opens in the generator with the line items below pre-filled. Runs 100% in your browser — nothing is uploaded.</span>
  </div>

  <h2>What's pre-filled</h2>
  <table class="sample-table">
    <thead><tr><th>Line item</th><th class="num">Qty</th><th class="num">Rate</th></tr></thead>
    <tbody>
${n.items.map((it) => `      <tr><td>${it.desc}</td><td class="num">${it.qty}</td><td class="num muted">your rate</td></tr>`).join("\n")}
      <tr><td class="muted">Notes: ${n.notes}</td><td class="num"></td><td class="num"></td></tr>
      <tr><td class="muted">Terms: ${n.terms}</td><td class="num"></td><td class="num"></td></tr>
    </tbody>
  </table>
  <p class="muted small">Rates are left blank on purpose — they're yours. Edit every line once it's open.</p>

  <h2>What to put on a ${n.name.toLowerCase()} invoice</h2>
  <ul class="checklist">
${n.include.map((b) => `    <li>${b}</li>`).join("\n")}
  </ul>

  <h2>Invoicing tips for ${n.person}</h2>
${n.tips.map((t) => `  <p>${t}</p>`).join("\n")}

  <div class="cta-row">
    <a class="btn btn-primary" href="${use}">Open the ${n.name.toLowerCase()} template →</a>
  </div>

  <h2>Frequently asked</h2>
${n.faq.map((f) => `  <details>\n    <summary>${f.q}</summary>\n    <p>${f.a}</p>\n  </details>`).join("\n")}

${otherTemplates(n.slug, root)}
  <p class="backlink"><a href="${root}">← Billotter: the free, private, in-browser invoice generator</a></p>
</main>
` +
    footer
  );
}

/* ---------- hub page ---------- */

function hubPage() {
  const root = "../";
  const title = "Free Invoice Templates — Pre-Filled for Your Line of Work | Billotter";
  const desc =
    "Free invoice templates for photographers, designers, developers, writers, consultants, tutors, videographers and cleaners. Each opens pre-filled in a private, in-browser generator — no signup.";
  const ld = `  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Free invoice templates",
    description: desc,
    url: `${BASE}/templates/`,
    hasPart: NICHES.map((n) => ({
      "@type": "WebPage",
      name: `${n.name} invoice template`,
      url: `${BASE}/templates/${n.slug}/`,
    })),
  }, null, 2).replace(/\n/g, "\n  ")}
  </script>
`;
  return (
    head(title, desc, "templates/", `${root}css/style.css`, ld) +
    topbar(root) +
    `
<main class="page">
  <h1>Free invoice templates</h1>
  <p class="lede">Every template opens in the same free generator with line items, notes and payment terms pre-filled
  for that line of work. Change anything — it's your invoice. No signup, and nothing you type leaves your browser.</p>

  <ul class="tpl-grid tpl-grid-lg">
${NICHES.map((n) => `    <li><a class="tpl-card" href="${n.slug}/"><strong>${n.name}</strong><span>${n.blurb}</span></a></li>`).join("\n")}
  </ul>

  <h2>How these templates work</h2>
  <p>Click a template and the <a href="${root}">Billotter generator</a> opens with that trade's usual line items already
  in place — session fees for photographers, revision rounds for designers, kill-fee terms for writers. Put in your own
  rates and client details, hit <strong>Download PDF</strong>, done.</p>
  <p>There's no account and no upload: the generator is a single page that runs entirely in your browser and saves your
  invoices to your own device. The templates are just head starts — every field stays editable.</p>

  <h2>Don't see your line of work?</h2>
  <p>The <a href="${root}#app">blank generator</a> covers everyone: unlimited line items, 26 currencies, tax and
  discounts, your logo, clean PDF output. Free without limits.</p>
</main>
` +
    footer
  );
}

/* ---------- write everything ---------- */

const outRoot = new URL("..", import.meta.url).pathname;
for (const n of NICHES) {
  const dir = join(outRoot, "templates", n.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), nichePage(n));
  console.log(`✓ templates/${n.slug}/index.html`);
}
writeFileSync(join(outRoot, "templates", "index.html"), hubPage());
console.log("✓ templates/index.html");

/* Emit the TEMPLATES map for js/app.js so page slugs and app prefills never drift. */
const map = {};
for (const n of NICHES) {
  map[n.slug] = {
    items: n.items.map((it) => ({ desc: it.desc, qty: it.qty, rate: "" })),
    notes: n.notes,
    terms: n.terms,
  };
}
writeFileSync(
  join(outRoot, "scripts", "templates-map.json"),
  JSON.stringify(map, null, 2) + "\n"
);
console.log("✓ scripts/templates-map.json (paste-checked against js/app.js TEMPLATES)");
