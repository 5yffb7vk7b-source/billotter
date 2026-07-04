import { hmacKey, mintCode, readJson, writeJson } from "./_lib.js";

/* Ko-fi POSTs application/x-www-form-urlencoded with a `data` field of JSON:
   { type, email, amount, kofi_transaction_id, ... }
   The webhook URL carries our own secret as ?s=... so no Ko-fi token is needed. */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if ((req.query.s || "") !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: "bad secret" });
  }

  let data;
  try {
    data = typeof req.body?.data === "string" ? JSON.parse(req.body.data) : req.body?.data;
  } catch {
    return res.status(400).json({ error: "unparseable payload" });
  }
  if (!data) return res.status(400).json({ error: "no data" });

  // Ops marker: proves Ko-fi reached us with the right secret, even for skipped events.
  await writeJson("meta/last-webhook.json", {
    at: new Date().toISOString(),
    type: data.type || null,
    amount: data.amount || null,
    tx: data.kofi_transaction_id || null,
  });

  const email = String(data.email || "").toLowerCase().trim();
  if (!email) return res.status(200).json({ ok: true, skipped: "no email" });

  // Only mint for the Pro purchase: shop orders, or any payment covering the price.
  const amount = parseFloat(data.amount || "0");
  if (data.type !== "Shop Order" && amount < 9) {
    return res.status(200).json({ ok: true, skipped: "not a Pro purchase" });
  }

  const emailPath = `emails/${hmacKey(email)}.json`;
  const record = (await readJson(emailPath)) || { codes: [], tx: [] };

  // Idempotency: Ko-fi retries webhooks; one code per transaction.
  const tx = data.kofi_transaction_id || null;
  if (tx && record.tx.includes(tx)) {
    return res.status(200).json({ ok: true, dedup: true });
  }

  const code = mintCode();
  await writeJson(`codes/${hmacKey(code)}.json`, {
    e: hmacKey(email),
    tx,
    created: new Date().toISOString(),
    activations: 0,
  });
  record.codes.push(code);
  if (tx) record.tx.push(tx);
  await writeJson(emailPath, record);

  return res.status(200).json({ ok: true });
}
