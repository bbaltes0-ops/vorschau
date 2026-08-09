# Anprobe-API · Backend einrichten (Cloudflare Worker, kostenlos)

Dieses Backend ist der Server-Teil der digitalen Anprobe. Es uebernimmt vier Aufgaben:

1. **Gemini-Proxy** (`POST /api/generate`) — der Google-API-Key liegt nur hier,
   nie im Browser. Mit Rate-Limit (20 Anfragen / 10 Minuten pro IP),
   Modell-Allowlist und 12-MB-Payload-Limit.
2. **Kurzlinks** (`POST /api/links` + `GET /a/<id>`) — macht aus den langen
   Haendler-Links kurze URLs fuer QR-Codes und WhatsApp.
3. **Haendler-Schluessel** — jede Anprobe mit Header `X-Anprobe-Key` wird pro
   Haendler und Monat gezaehlt (Abrechnungsgrundlage).
4. **Statistik** (`GET /api/stats?key=...`) — Anproben-Zaehler des laufenden Monats.

Alles laeuft im **kostenlosen Cloudflare-Tarif**. Es wird kein eigener Server
gemietet, nichts muss gewartet werden.

---

## Schritt 1: Kostenlosen Cloudflare-Account anlegen

1. https://dash.cloudflare.com/sign-up oeffnen.
2. Mit E-Mail-Adresse registrieren (der Free-Plan reicht, keine Zahlungsdaten noetig).
3. E-Mail bestaetigen — fertig.

## Schritt 2: Wrangler installieren (das Cloudflare-Werkzeug)

Voraussetzung: Node.js ist installiert (pruefen mit `node -v`; sonst von
https://nodejs.org laden).

Im Terminal in diesen Ordner wechseln und einmalig anmelden:

```bash
cd "/Users/bb/Desktop/Try on/vorschau/anprobe/backend"
npx wrangler login
```

Es oeffnet sich der Browser — dort den Zugriff bestaetigen. `npx` laedt
Wrangler bei Bedarf automatisch, eine feste Installation ist nicht noetig.

## Schritt 3: KV-Speicher anlegen

KV ist der kleine eingebaute Datenspeicher (fuer Kurzlinks und Zaehler):

```bash
npx wrangler kv namespace create LINKS
```

Die Ausgabe enthaelt eine Zeile wie:

```
id = "0f2ac74b498b48028cb68387c48e85f1"
```

Diese ID in `wrangler.toml` bei `id = "HIER_KV_NAMESPACE_ID"` eintragen.

## Schritt 4: Gemini-API-Key als Secret setzen

Den Key gibt es kostenlos unter https://aistudio.google.com/apikey
(fuer den Live-Betrieb ist der Paid-Tier wegen hoeherer Rate-Limits empfohlen).

```bash
npx wrangler secret put GEMINI_API_KEY
```

Beim Prompt den Key einfuegen und Enter druecken. Der Key liegt danach
verschluesselt bei Cloudflare — **niemals** in `wrangler.toml` oder in eine
HTML-Datei schreiben.

## Schritt 5: Domains eintragen und deployen

In `wrangler.toml` pruefen bzw. anpassen:

- `ALLOWED_ORIGINS` — alle Domains, von denen die App den Worker aufrufen darf
  (kommasepariert, ohne Slash am Ende). Fuer jede Shop-Domain, die das Widget
  einbettet, hier einen Eintrag ergaenzen.
- `ANPROBE_BASE` — Basis-URL der Anprobe-App. Nur Links, die so beginnen,
  werden gekuerzt (verhindert Missbrauch als offener Umleitungsdienst).

Dann:

```bash
npx wrangler deploy
```

Die Ausgabe nennt die fertige URL, z. B.:

```
https://anprobe-api.<dein-account>.workers.dev
```

Kurztest im Browser: die URL oeffnen — es erscheint eine kleine JSON-Uebersicht
der Endpunkte. Dann ist alles online.

Optional laesst sich im Cloudflare-Dashboard unter *Workers → anprobe-api →
Settings → Domains & Routes* eine eigene Domain verbinden
(z. B. `api.black-rabbit.studio`) — dann werden auch die Kurzlinks huebscher.

## Schritt 6: Proxy-URL in den Apps eintragen

- **Kunden-App** (`index.html`): auf der Seite „⚙ KI-Setup" oeffnen und als
  **Proxy-URL** eintragen:
  `https://anprobe-api.<dein-account>.workers.dev/api/generate`
  Das API-Key-Feld bleibt dann leer — der Key liegt ja im Worker.
- **Haendler-App** (`haendler.html`): in den Einstellungen als Kurzlink-API
  (`brs_shortlink_api` im localStorage) die Basis-URL eintragen:
  `https://anprobe-api.<dein-account>.workers.dev`
  Die Haendler-App erzeugt damit automatisch kurze QR-/WhatsApp-Links.

## Schritt 7: Haendler-Schluessel anlegen (fuer die Abrechnung)

Jeder Haendler bekommt einen eigenen Schluessel. Anlegen (Beispiel: Schluessel
`boutique-meier-7f3k`, als Wert eine Notiz, wem er gehoert):

```bash
npx wrangler kv key put --binding LINKS --remote "key:boutique-meier-7f3k" "Boutique Meier, Musterstadt"
```

- Die Kunden-App schickt den Schluessel als Header `X-Anprobe-Key` mit —
  er steckt im Haendler-Link, der Haendler muss nichts tun.
- Ein unbekannter Schluessel wird mit `403` abgelehnt.
- Anproben abfragen (fuer die Monatsrechnung):

```
https://anprobe-api.<dein-account>.workers.dev/api/stats?key=boutique-meier-7f3k
```

Antwort z. B.: `{"monat":"2026-08","anproben":142}`

Schluessel wieder sperren:

```bash
npx wrangler kv key delete --binding LINKS --remote "key:boutique-meier-7f3k"
```

## Kosten und Grenzen (Workers Free)

| Was | Free-Limit | Bedeutung fuer die Anprobe |
|---|---|---|
| Worker-Aufrufe | 100.000 pro Tag | ~100.000 Anproben/Weiterleitungen taeglich — mehr als genug fuer den Start |
| KV lesen | 100.000 pro Tag | jede Anprobe/Weiterleitung liest 1-3 Schluessel |
| KV schreiben | 1.000 pro Tag | ~1 Schreibvorgang pro Anprobe bzw. Kurzlink; reicht fuer mehrere hundert Anproben am Tag |
| CPU-Zeit | 10 ms pro Aufruf | der Worker reicht nur durch — voellig ausreichend |

**Was passiert bei Ueberschreitung?** Der Worker antwortet fuer den Rest des
Tages mit einem Fehler (HTTP 1027/429), ab Mitternacht (UTC) laeuft alles
wieder. Es entstehen **keine ungeplanten Kosten** — der Free-Plan bucht nichts
ab, er schaltet nur ab. Wird das Volumen ernsthaft erreicht, lohnt der Wechsel
auf **Workers Paid (5 USD/Monat)**: 10 Mio. Aufrufe inklusive, deutlich hoehere
KV-Limits.

Unabhaengig davon fallen die **Gemini-Bildkosten** bei Google an (Cent-Bereich
pro Anprobe, abgerechnet ueber den API-Key aus Schritt 4). Der monatliche
Zaehler pro Haendler (Schritt 7) ist die Grundlage, um diese Kosten
weiterzuberechnen.

## Endpunkte im Ueberblick

| Methode | Pfad | Zweck |
|---|---|---|
| POST | `/api/generate` | Gemini-Proxy; Body wie `generateContent` plus Feld `model`; optional Header `X-Anprobe-Key` |
| POST | `/api/links` | `{"url":"https://.../anprobe/#a=..."}` → `{"id":"aB3xK9","shortUrl":"https://.../a/aB3xK9"}` |
| GET | `/a/<id>` | 302-Weiterleitung auf den gespeicherten Link (Standard-Lebensdauer 90 Tage) |
| GET | `/api/stats?key=<haendlerkey>` | `{"monat":"2026-08","anproben":142}` |

Alle Fehler kommen als JSON mit klarer deutscher Meldung, z. B.
`{"error":{"code":429,"message":"Zu viele Anfragen. Bitte in ein paar Minuten erneut versuchen."}}`.
