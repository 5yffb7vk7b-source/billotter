import crypto from "node:crypto";
import { put, get } from "@vercel/blob";

export const hmacKey = (value) =>
  crypto.createHmac("sha256", process.env.LICENSE_SECRET)
    .update(String(value).toLowerCase().trim())
    .digest("hex")
    .slice(0, 40);

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O/1/I/L lookalikes

export function mintCode() {
  const bytes = crypto.randomBytes(12);
  let body = "";
  for (let i = 0; i < 12; i++) {
    body += ALPHABET[bytes[i] % ALPHABET.length];
    if (i % 4 === 3 && i < 11) body += "-";
  }
  return `BILL-${body}`;
}

export async function readJson(pathname) {
  try {
    const result = await get(pathname, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    if (!result || result.statusCode !== 200) return null;
    return JSON.parse(await new Response(result.stream).text());
  } catch (err) {
    console.error("readJson failed:", pathname, err?.name, err?.message);
    return null;
  }
}

export function writeJson(pathname, data) {
  return put(pathname, JSON.stringify(data), {
    access: "private",
    token: process.env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
    contentType: "application/json",
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
}

const ORIGINS = new Set([
  "https://billotter.com",
  "https://www.billotter.com",
  "http://127.0.0.1:8321",
  "http://localhost:8321",
]);

export function cors(req, res) {
  const origin = req.headers.origin;
  if (ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
}
