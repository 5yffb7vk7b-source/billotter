import { hmacKey, readJson, cors } from "./_lib.js";

/* Buyer enters their Ko-fi purchase email on billotter.com and gets their code back. */
export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  const email = String(req.body?.email || "").toLowerCase().trim();
  if (!email || !email.includes("@")) {
    return res.status(400).json({ ok: false, error: "That doesn't look like an email address." });
  }

  const record = await readJson(`emails/${hmacKey(email)}.json`);
  if (!record || !record.codes?.length) {
    return res.status(404).json({
      ok: false,
      error: "No purchase found for that email yet. Codes appear within a minute of buying — use the exact email from your Ko-fi receipt.",
    });
  }

  return res.status(200).json({ ok: true, code: record.codes[record.codes.length - 1] });
}
