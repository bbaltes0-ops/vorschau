/*
 * Anprobe-API · Standalone-Node-Server (VPS-Variante, ohne Abhaengigkeiten)
 * Black Rabbit Studio · Digitale Anprobe
 *
 * Gleiche Endpunkte wie worker.js (Cloudflare-Variante):
 *   POST /api/generate        Gemini-Proxy (Key bleibt auf dem Server)
 *   POST /api/links           Kurzlink anlegen  {url} -> {id, shortUrl}
 *   GET  /a/<id>              Kurzlink: 302-Weiterleitung auf den langen Link
 *   GET  /api/stats?key=...   Anproben-Zaehler des Haendlers im laufenden Monat
 *
 * Konfiguration ueber Umgebungsvariablen (EnvironmentFile der systemd-Unit):
 *   GEMINI_API_KEY    Google-AI-Studio-Key (niemals im Frontend!)
 *   ALLOWED_ORIGINS   erlaubte Browser-Origins, kommasepariert
 *   ANPROBE_BASE      Basis-URL der Anprobe-App (fuer Kurzlinks)
 *   PUBLIC_BASE       oeffentliche Basis dieser API (fuer shortUrl), z. B.
 *                     https://b2b.dagmarvonschmaus.com/anprobe-api
 *   LINK_TTL_DAYS     Lebensdauer der Kurzlinks in Tagen (Standard 90)
 *   DAILY_LIMIT       maximale Generierungen pro Tag insgesamt (Standard 400,
 *                     Kostendeckel fuer den API-Key)
 *   PORT              Standard 8809 (nur 127.0.0.1, Caddy leitet durch)
 *   STATE_DIR         Datenverzeichnis (Standard /var/lib/anprobe-api)
 *
 * Hinter Caddy:  handle_path /anprobe-api/* { reverse_proxy 127.0.0.1:8809 }
 * (handle_path entfernt das Praefix, die Pfade kommen hier ohne /anprobe-api an.)
 */

import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ALLOWED_MODELS = ["gemini-3-pro-image", "gemini-2.5-flash-image"];
const MAX_BODY_BYTES = 12 * 1024 * 1024;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_S = 600;
const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const PORT = parseInt(process.env.PORT || "8809", 10);
const STATE_DIR = process.env.STATE_DIR || "/var/lib/anprobe-api";
const LINKS_DIR = path.join(STATE_DIR, "links");
const COUNTS_FILE = path.join(STATE_DIR, "counts.json");
const KEYS_FILE = path.join(STATE_DIR, "keys.json");
fs.mkdirSync(LINKS_DIR, { recursive: true });

/* ---------- Zustand ---------- */

const rateWindows = new Map(); // ip -> {n, exp}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch (_) { return fallback; }
}
function writeJson(file, data) {
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data));
  fs.renameSync(tmp, file);
}

/* Haendler-Keys: {"<key>": {"name": "Boutique X"}} — Eintrag vorhanden = gueltig */
function merchantKnown(key) {
  return Object.prototype.hasOwnProperty.call(readJson(KEYS_FILE, {}), key);
}
function bumpCounter(scope) {
  const counts = readJson(COUNTS_FILE, {});
  counts[scope] = (counts[scope] || 0) + 1;
  writeJson(COUNTS_FILE, counts);
  return counts[scope];
}
function readCounter(scope) {
  return readJson(COUNTS_FILE, {})[scope] || 0;
}

function currentMonth() { return new Date().toISOString().slice(0, 7); }
function currentDay() { return new Date().toISOString().slice(0, 10); }

function randomId(len) {
  const bytes = crypto.randomBytes(len);
  let id = "";
  for (const b of bytes) id += BASE58[b % BASE58.length];
  return id;
}

/* ---------- HTTP-Hilfen ---------- */

function allowedOrigins() {
  return String(process.env.ALLOWED_ORIGINS || "")
    .split(",").map((s) => s.trim().replace(/\/+$/, "")).filter(Boolean);
}
function corsHeaders(req) {
  const origin = req.headers.origin || "";
  const h = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Anprobe-Key",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
  if (allowedOrigins().includes(origin.replace(/\/+$/, ""))) {
    h["Access-Control-Allow-Origin"] = origin;
  }
  return h;
}
function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // kein Origin-Header = kein Browser
  return allowedOrigins().includes(origin.replace(/\/+$/, ""));
}
function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}
function json(res, status, data, cors) {
  send(res, status, { ...cors, "Content-Type": "application/json; charset=utf-8" }, JSON.stringify(data));
}
function fail(res, status, message, cors, extra) {
  res.writeHead(status, { ...cors, ...(extra || {}), "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ error: { code: status, message } }));
}
function clientIp(req) {
  const fwd = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return fwd || req.socket.remoteAddress || "unbekannt";
}
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) { reject(new Error("too_large")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function checkRateLimit(ip) {
  const now = Math.floor(Date.now() / 1000);
  let entry = rateWindows.get(ip);
  if (!entry || entry.exp <= now) entry = { n: 0, exp: now + RATE_LIMIT_WINDOW_S };
  if (entry.n >= RATE_LIMIT_MAX) return { ok: false, retryAfter: Math.max(1, entry.exp - now) };
  entry.n += 1;
  rateWindows.set(ip, entry);
  if (rateWindows.size > 5000) { // Speicher begrenzen
    for (const [k, v] of rateWindows) if (v.exp <= now) rateWindows.delete(k);
  }
  return { ok: true };
}

/* ---------- Endpunkte ---------- */

async function handleGenerate(req, res, cors) {
  let raw;
  try {
    raw = await readBody(req, MAX_BODY_BYTES);
  } catch (_) {
    return fail(res, 413, "Anfrage zu gross (max. 12 MB). Bitte Fotos verkleinern.", cors);
  }
  let body;
  try { body = JSON.parse(raw); } catch (_) {
    return fail(res, 400, "Ungueltiges JSON im Anfrage-Body.", cors);
  }

  const rl = checkRateLimit(clientIp(req));
  if (!rl.ok) {
    return fail(res, 429, "Zu viele Anfragen. Bitte in ein paar Minuten erneut versuchen.", cors,
      { "Retry-After": String(rl.retryAfter) });
  }

  // Tages-Kostendeckel fuer den API-Key
  const dailyLimit = Math.max(1, parseInt(process.env.DAILY_LIMIT || "400", 10) || 400);
  if (readCounter("day:" + currentDay()) >= dailyLimit) {
    return fail(res, 429, "Tageslimit der Anprobe erreicht. Bitte morgen erneut versuchen.", cors);
  }

  const merchantKey = String(req.headers["x-anprobe-key"] || "").trim();
  if (merchantKey) {
    if (!merchantKnown(merchantKey)) {
      return fail(res, 403, "Unbekannter Haendler-Schluessel (X-Anprobe-Key).", cors);
    }
    bumpCounter("cnt:" + merchantKey + ":" + currentMonth());
  }

  const model = ALLOWED_MODELS.includes(body.model) ? body.model : ALLOWED_MODELS[0];
  delete body.model;

  const gKey = String(process.env.GEMINI_API_KEY || "").trim();
  const hasKey = gKey && gKey !== "HIER_KEY_EINTRAGEN";
  const ownEngine = String(process.env.OWN_ENGINE_URL || "").trim();

  let upstream;
  try {
    if (ownEngine) {
      /* EIGENER MOTOR (FASHN VTON auf eigenem Grafikserver) hat Vorrang:
       * gleiches Anfrage- und Antwortformat, kein Google noetig. */
      delete body.model;
      upstream = await fetch(ownEngine, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else if (hasKey) {
      upstream = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": gKey },
          body: JSON.stringify(body),
        }
      );
    } else {
      /* Kein Key auf dem Server: Anfrage durch den SSH-Rueckkanal zum Mac
       * reichen (mac-key-proxy.py, Port 8811) — der Key bleibt auf dem Mac.
       * Traegt Bernd den Key hier ein, hat der direkte Weg oben Vorrang. */
      body.model = model;
      upstream = await fetch("http://127.0.0.1:8811/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
  } catch (_) {
    if (!hasKey) {
      return fail(res, 503, "Die Anprobe wird gerade eingerichtet. Bitte spaeter erneut versuchen.", cors);
    }
    return fail(res, 502, "Google-API nicht erreichbar. Bitte spaeter erneut versuchen.", cors);
  }
  bumpCounter("day:" + currentDay());
  const text = await upstream.text();
  send(res, upstream.status, { ...cors, "Content-Type": "application/json; charset=utf-8" }, text);
}

async function handleCreateLink(req, res, cors) {
  let body;
  try { body = JSON.parse(await readBody(req, 300000)); } catch (_) {
    return fail(res, 400, "Ungueltiges JSON im Anfrage-Body.", cors);
  }
  const target = String((body && body.url) || "").trim();
  if (!target) return fail(res, 400, 'Feld "url" fehlt.', cors);

  const base = String(process.env.ANPROBE_BASE || "").trim();
  if (!base) return fail(res, 500, "Server nicht konfiguriert: ANPROBE_BASE fehlt.", cors);
  if (!target.startsWith(base)) {
    return fail(res, 400, "Nur Links auf die Anprobe-App koennen gekuerzt werden.", cors);
  }
  if (target.length > 200000) return fail(res, 413, "Link zu lang (max. 200 kB).", cors);

  const ttlDays = Math.max(1, parseInt(process.env.LINK_TTL_DAYS || "90", 10) || 90);

  let id = "";
  for (let i = 0; i < 5; i++) {
    const candidate = randomId(6);
    if (!fs.existsSync(path.join(LINKS_DIR, candidate))) { id = candidate; break; }
  }
  if (!id) return fail(res, 500, "Konnte keine freie Kurzlink-ID finden. Bitte erneut versuchen.", cors);

  writeJson(path.join(LINKS_DIR, id), { url: target, exp: Date.now() + ttlDays * 86400000 });

  const publicBase = String(process.env.PUBLIC_BASE || "").replace(/\/+$/, "");
  json(res, 200, { id, shortUrl: publicBase + "/a/" + id, gueltigTage: ttlDays, url: publicBase + "/a/" + id }, cors);
}

function handleRedirect(res, id, cors) {
  const file = path.join(LINKS_DIR, id);
  const entry = readJson(file, null);
  if (!entry || (entry.exp && entry.exp < Date.now())) {
    if (entry) fs.rmSync(file, { force: true });
    return send(res, 404, { ...cors, "Content-Type": "text/plain; charset=utf-8" },
      "Dieser Anprobe-Link ist abgelaufen oder existiert nicht.\nBitte beim Geschaeft einen neuen Link anfragen.");
  }
  send(res, 302, { ...cors, "Location": entry.url, "Cache-Control": "no-store" }, null);
}

function handleStats(res, urlObj, cors) {
  const merchantKey = (urlObj.searchParams.get("key") || "").trim();
  if (!merchantKey) return fail(res, 400, 'Parameter "key" fehlt.', cors);
  if (!merchantKnown(merchantKey)) return fail(res, 403, "Unbekannter Haendler-Schluessel.", cors);
  const monat = currentMonth();
  json(res, 200, { monat, anproben: readCounter("cnt:" + merchantKey + ":" + monat) }, cors);
}

/* Live-Anprobe (Decart Lucy VTON): kurzlebigen Client-Token ausstellen.
 * Braucht DECART_API_KEY in der Umgebung — ohne Key antwortet der Endpunkt
 * mit 501 und die Live-Seite zeigt "noch nicht freigeschaltet". */
async function handleLiveToken(req, res, cors) {
  if (!process.env.DECART_API_KEY) {
    return fail(res, 501, "Live-Anprobe ist noch nicht freigeschaltet (DECART_API_KEY fehlt auf dem Server).", cors);
  }
  const rl = checkRateLimit(clientIp(req));
  if (!rl.ok) {
    return fail(res, 429, "Zu viele Anfragen. Bitte in ein paar Minuten erneut versuchen.", cors,
      { "Retry-After": String(rl.retryAfter) });
  }
  let upstream;
  try {
    upstream = await fetch("https://api.decart.ai/v1/client/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.DECART_API_KEY },
      body: JSON.stringify({ expiresIn: 300 }),
    });
  } catch (_) {
    return fail(res, 502, "Decart-API nicht erreichbar. Bitte spaeter erneut versuchen.", cors);
  }
  bumpCounter("live:" + currentDay());
  const text = await upstream.text();
  send(res, upstream.status, { ...cors, "Content-Type": "application/json; charset=utf-8" }, text);
}

/* ---------- Router ---------- */

const server = http.createServer(async (req, res) => {
  const cors = corsHeaders(req);
  const urlObj = new URL(req.url, "http://localhost");
  const p = urlObj.pathname;

  try {
    if (req.method === "OPTIONS") return send(res, 204, cors, null);

    const redirectMatch = p.match(/^\/a\/([1-9A-HJ-NP-Za-km-z]{4,12})$/);
    if (req.method === "GET" && redirectMatch) return handleRedirect(res, redirectMatch[1], cors);

    if (p.startsWith("/api/") && !originAllowed(req)) return fail(res, 403, "Origin nicht erlaubt.", cors);

    if (p === "/api/generate") {
      if (req.method !== "POST") return fail(res, 405, "Nur POST erlaubt.", cors);
      return await handleGenerate(req, res, cors);
    }
    if (p === "/api/links") {
      if (req.method !== "POST") return fail(res, 405, "Nur POST erlaubt.", cors);
      return await handleCreateLink(req, res, cors);
    }
    if (p === "/api/live-token") {
      if (req.method !== "POST") return fail(res, 405, "Nur POST erlaubt.", cors);
      return await handleLiveToken(req, res, cors);
    }
    if (p === "/api/stats") {
      if (req.method !== "GET") return fail(res, 405, "Nur GET erlaubt.", cors);
      return handleStats(res, urlObj, cors);
    }
    if (p === "/" || p === "") {
      return json(res, 200, {
        service: "anprobe-api",
        endpunkte: ["POST /api/generate", "POST /api/links", "GET /a/<id>", "GET /api/stats?key=..."],
      }, cors);
    }
    fail(res, 404, "Unbekannter Endpunkt.", cors);
  } catch (e) {
    fail(res, 500, "Interner Fehler.", cors);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("anprobe-api laeuft auf 127.0.0.1:" + PORT);
});
