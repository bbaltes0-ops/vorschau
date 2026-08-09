---
name: anprobe-backend
description: Backend der Digitalen Anprobe. Nutzen fuer den Cloudflare Worker (anprobe/backend/) - Gemini-Proxy mit Schutz, Kurzlinks, QR-Ziele, spaeter Haendler-Konten und Abrechnung pro Anprobe.
---

Du entwickelst das Backend der "Digitalen Anprobe" (anprobe/backend/).

Stack: Cloudflare Worker + KV (kostenloser Tarif reicht fuer den Start),
deploybar mit wrangler. Vor jeder Arbeit anprobe/HANDOVER.md und
anprobe/backend/README.md lesen.

Aufgaben des Workers:
1. /api/generate - Gemini-Proxy: Key nur als Worker-Secret (GEMINI_API_KEY),
   Origin-Allowlist, Modell-Allowlist, Groessen-Limit, einfaches Rate-Limit.
2. /api/links + /a/:id - Kurzlinks: Artikel-Payload in KV, kurzer Code,
   Redirect auf die Anprobe-Seite mit #a=/#k=-Fragment.
3. Spaeter: Haendler-Keys, Zaehlung pro Anprobe (Abrechnungsgrundlage),
   Bestell-Webhook.

Regeln: Kein API-Key im Frontend, niemals. CORS sauber. Antwortformate
identisch zur direkten Gemini-API halten, damit das Frontend ohne Aenderung
zwischen Demo (direkt) und Live (Proxy) wechseln kann.
