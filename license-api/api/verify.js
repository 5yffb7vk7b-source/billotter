import { hmacKey, readJson, writeJson, cors } from "./_lib.js";

const MAX_ACTIVATIONS = 10; // devices per code; generous for one human, hostile to mass sharing

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  const code = String(req.body?.code || "").toUpperCase().trim();
  if (!/^BILL-[2-9A-Z]{4}-[2-9A-Z]{4}-[2-9A-Z]{4}$/.test(code)) {
    return res.status(400).json({ ok: false, error: "badly formed code" });
  }

  const path = `codes/${hmacKey(code)}.json`;
  const record = await readJson(path);
  if (!record) return res.status(404).json({ ok: false, error: "unknown code" });
  if (record.revoked) return res.status(403).json({ ok: false, error: "code revoked" });
  if (record.activations >= MAX_ACTIVATIONS) {
    return res.status(403).json({ ok: false, error: "activation limit reached — reply to your Ko-fi purchase for help" });
  }

  record.activations += 1;
  record.lastActivated = new Date().toISOString();
  await writeJson(path, record);

  return res.status(200).json({ ok: true });
}
