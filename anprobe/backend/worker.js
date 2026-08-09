/*
 * Anprobe-API · Cloudflare Worker (kostenloser Tarif)
 * Black Rabbit Studio · Digitale Anprobe
 *
 * Endpunkte:
 *   POST /api/generate        Gemini-Proxy (Key bleibt auf dem Server)
 *   POST /api/links           Kurzlink anlegen  {url} -> {id, shortUrl}
 *   GET  /a/<id>              Kurzlink: 302-Weiterleitung auf den langen Link
 *   GET  /api/stats?key=...   Anproben-Zaehler des Haendlers im laufenden Monat
 *
 * Benoetigte Konfiguration (siehe wrangler.toml + backend/README.md):
 *   Secret  GEMINI_API_KEY    Google-AI-Studio-Key (niemals im Frontend!)
 *   KV      LINKS             Kurzlinks, Rate-Limits, Haendler-Keys, Zaehler
 *   Var     ALLOWED_ORIGINS   erlaubte Browser-Origins, kommasepariert
 *   Var     ANPROBE_BASE      Basis-URL der Anprobe-App (fuer Kurzlinks)
 *   Var     LINK_TTL_DAYS     Lebensdauer der Kurzlinks in Tagen (Standard 90)
 *
 * KV-Schluessel-Schema:
 *   rl:<ip>                   Rate-Limit-Fenster pro IP (max. 20 / 10 Min)
 *   l:<id>                    Kurzlink-Ziel (TTL = LINK_TTL_DAYS)
 *   key:<haendlerkey>         vorhandener Eintrag = Haendler-Key ist gueltig
 *   cnt:<haendlerkey>:<JJJJ-MM>  Anproben-Zaehler pro Monat (Abrechnung)
 */

const ALLOWED_MODELS = ["gemini-3-pro-image", "gemini-2.5-flash-image"];
const MAX_BODY_BYTES = 12 * 1024 * 1024; // 12 MB (Kundenfoto + Produktfotos, base64)
const RATE_LIMIT_MAX = 20;               // Anfragen ...
const RATE_LIMIT_WINDOW_S = 600;         // ... pro 10 Minuten pro IP
const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/* ---------- Hilfsfunktionen ---------- */

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

function corsHeaders(req, env) {
  const origin = req.headers.get("Origin") || "";
  const list = allowedOrigins(env);
  const h = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Anprobe-Key",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
  if (list.includes(origin.replace(/\/+$/, ""))) {
    h["Access-Control-Allow-Origin"] = origin;
  }
  return h;
}

function originAllowed(req, env) {
  const origin = req.headers.get("Origin");
  if (!origin) return true; // kein Origin-Header = kein Browser (z. B. Server, curl)
  return allowedOrigins(env).includes(origin.replace(/\/+$/, ""));
}

function json(status, data, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });
}

function fail(status, message, cors) {
  return json(status, { error: { code: status, message } }, cors);
}

function clientIp(req) {
  return req.headers.get("CF-Connecting-IP") || "unbekannt";
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7); // "JJJJ-MM"
}

function randomId(len) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let id = "";
  for (const b of bytes) id += BASE58[b % BASE58.length];
  return id;
}

/* Rate-Limit: festes 10-Minuten-Fenster pro IP, gespeichert in KV.
 * KV ist nicht atomar -- fuer diesen Zweck (Schutz vor Missbrauch,
 * nicht Abrechnung) ist die kleine Unschaerfe in Ordnung. */
async function checkRateLimit(env, ip) {
  const key = "rl:" + ip;
  const now = Math.floor(Date.now() / 1000);
  let entry = null;
  try {
    entry = JSON.parse((await env.LINKS.get(key)) || "null");
  } catch (_) {
    entry = null;
  }
  if (!entry || !entry.exp || entry.exp <= now) {
    entry = { n: 0, exp: now + RATE_LIMIT_WINDOW_S };
  }
  if (entry.n >= RATE_LIMIT_MAX) {
    return { ok: false, retryAfter: Math.max(1, entry.exp - now) };
  }
  entry.n += 1;
  await env.LINKS.put(key, JSON.stringify(entry), { expiration: entry.exp });
  return { ok: true };
}

/* ---------- Endpunkte ---------- */

async function handleGenerate(req, env, cors) {
  // 1) Payload-Limit (Header-Check vor dem Einlesen, danach echter Check)
  const declared = parseInt(req.headers.get("Content-Length") || "0", 10);
  if (declared > MAX_BODY_BYTES) {
    return fail(413, "Anfrage zu gross (max. 12 MB). Bitte Fotos verkleinern.", cors);
  }
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return fail(413, "Anfrage zu gross (max. 12 MB). Bitte Fotos verkleinern.", cors);
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch (_) {
    return fail(400, "Ungueltiges JSON im Anfrage-Body.", cors);
  }

  // 2) Rate-Limit pro IP
  const rl = await checkRateLimit(env, clientIp(req));
  if (!rl.ok) {
    const res = fail(429, "Zu viele Anfragen. Bitte in ein paar Minuten erneut versuchen.", cors);
    res.headers.set("Retry-After", String(rl.retryAfter));
    return res;
  }

  // 3) Optionaler Haendler-Key (Abrechnungsgrundlage pro Anprobe)
  const merchantKey = (req.headers.get("X-Anprobe-Key") || "").trim();
  if (merchantKey) {
    const known = await env.LINKS.get("key:" + merchantKey);
    if (known === null) {
      return fail(403, "Unbekannter Haendler-Schluessel (X-Anprobe-Key).", cors);
    }
    const cntKey = "cnt:" + merchantKey + ":" + currentMonth();
    const current = parseInt((await env.LINKS.get(cntKey)) || "0", 10);
    await env.LINKS.put(cntKey, String(current + 1));
  }

  // 4) Modell-Allowlist -- alles andere wird nicht durchgereicht
  const model = ALLOWED_MODELS.includes(body.model) ? body.model : ALLOWED_MODELS[0];
  delete body.model;

  if (!env.GEMINI_API_KEY) {
    return fail(500, "Server nicht konfiguriert: Secret GEMINI_API_KEY fehlt.", cors);
  }

  // 5) Weiterleitung an Google
  let upstream;
  try {
    upstream = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY,
        },
        body: JSON.stringify(body),
      }
    );
  } catch (_) {
    return fail(502, "Google-API nicht erreichbar. Bitte spaeter erneut versuchen.", cors);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });
}

async function handleCreateLink(req, env, cors, reqUrl) {
  let body;
  try {
    body = await req.json();
  } catch (_) {
    return fail(400, "Ungueltiges JSON im Anfrage-Body.", cors);
  }
  const target = String(body && body.url || "").trim();
  if (!target) {
    return fail(400, 'Feld "url" fehlt.', cors);
  }

  // Nur Links auf die eigene Anprobe-App kuerzen (kein offener Redirect-Dienst)
  const base = String(env.ANPROBE_BASE || "").trim();
  if (!base) {
    return fail(500, "Server nicht konfiguriert: Variable ANPROBE_BASE fehlt.", cors);
  }
  if (!target.startsWith(base)) {
    return fail(400, "Nur Links auf die Anprobe-App koennen gekuerzt werden.", cors);
  }
  if (target.length > 200000) {
    return fail(413, "Link zu lang (max. 200 kB).", cors);
  }

  const ttlDays = Math.max(1, parseInt(env.LINK_TTL_DAYS || "90", 10) || 90);
  const ttlSeconds = ttlDays * 86400;

  // 6-stellige base58-ID, bei (sehr seltener) Kollision neu wuerfeln
  let id = "";
  for (let i = 0; i < 5; i++) {
    const candidate = randomId(6);
    if ((await env.LINKS.get("l:" + candidate)) === null) {
      id = candidate;
      break;
    }
  }
  if (!id) {
    return fail(500, "Konnte keine freie Kurzlink-ID finden. Bitte erneut versuchen.", cors);
  }

  await env.LINKS.put("l:" + id, target, { expirationTtl: ttlSeconds });

  return json(200, {
    id,
    shortUrl: reqUrl.origin + "/a/" + id,
    gueltigTage: ttlDays,
  }, cors);
}

async function handleRedirect(env, id, cors) {
  const target = await env.LINKS.get("l:" + id);
  if (!target) {
    return new Response(
      "Dieser Anprobe-Link ist abgelaufen oder existiert nicht.\n" +
      "Bitte beim Geschaeft einen neuen Link anfragen.",
      { status: 404, headers: { ...cors, "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
  return new Response(null, {
    status: 302,
    headers: { ...cors, "Location": target, "Cache-Control": "no-store" },
  });
}

async function handleStats(req, env, cors, reqUrl) {
  const merchantKey = (reqUrl.searchParams.get("key") || "").trim();
  if (!merchantKey) {
    return fail(400, 'Parameter "key" fehlt.', cors);
  }
  const known = await env.LINKS.get("key:" + merchantKey);
  if (known === null) {
    return fail(403, "Unbekannter Haendler-Schluessel.", cors);
  }
  const monat = currentMonth();
  const anproben = parseInt((await env.LINKS.get("cnt:" + merchantKey + ":" + monat)) || "0", 10);
  return json(200, { monat, anproben }, cors);
}

/* ---------- Router ---------- */

export default {
  async fetch(req, env) {
    const cors = corsHeaders(req, env);
    const url = new URL(req.url);
    const path = url.pathname;

    // Preflight immer beantworten
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    // Kurzlink-Weiterleitung (kein Origin-Check -- wird direkt geoeffnet)
    const redirectMatch = path.match(/^\/a\/([1-9A-HJ-NP-Za-km-z]{4,12})$/);
    if (req.method === "GET" && redirectMatch) {
      return handleRedirect(env, redirectMatch[1], cors);
    }

    // API: Browser-Anfragen nur von erlaubten Origins
    if (path.startsWith("/api/") && !originAllowed(req, env)) {
      return fail(403, "Origin nicht erlaubt.", cors);
    }

    if (path === "/api/generate") {
      if (req.method !== "POST") return fail(405, "Nur POST erlaubt.", cors);
      return handleGenerate(req, env, cors);
    }

    if (path === "/api/links") {
      if (req.method !== "POST") return fail(405, "Nur POST erlaubt.", cors);
      return handleCreateLink(req, env, cors, url);
    }

    if (path === "/api/stats") {
      if (req.method !== "GET") return fail(405, "Nur GET erlaubt.", cors);
      return handleStats(req, env, cors, url);
    }

    if (path === "/" || path === "") {
      return json(200, {
        service: "anprobe-api",
        endpunkte: ["POST /api/generate", "POST /api/links", "GET /a/<id>", "GET /api/stats?key=..."],
      }, cors);
    }

    return fail(404, "Unbekannter Endpunkt.", cors);
  },
};
