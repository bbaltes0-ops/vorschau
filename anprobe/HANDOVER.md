# Projekt-Übergabe: Digitale Anprobe (Virtual Try-on)

> Für Claude (oder jeden Entwickler), der an diesem Projekt weiterarbeitet —
> egal in welcher Session, auf welchem Gerät. Stand: 09.08.2026 (abends).
> Branch: `claude/virtual-try-on-shop-2tv6sr` im Repo `bbaltes0-ops/vorschau`.

## Worum es geht

Bernd (Black Rabbit Studio, b.baltes0@gmail.com) baut eine KI-gestützte
**digitale Anprobe** als VERKAUFBARES Produkt für Mode-Einzelhändler und
Onlineverkäufer: Der Händler schickt gezielt Produkte an Kund:innen
(WhatsApp-Link/QR), die Kund:in probiert per Handy-Kamera digital an
(Gemini-Bildmodell) und bestellt direkt zurück. Vorbild-UX: Decart Anywear
(anywear.decart.ai) — die beiden Referenzvideos wurden am 09.08. Frame für
Frame ausgewertet (Overlay-Panel auf der Produktseite, Drag-and-drop des
Produktbilds, Scan-Animation mit Kreisfortschritt, Fehlerkarte mit Restart,
Größenwahl im Panel).

## Stand: Verkaufsversion 1 ist FERTIG gebaut und getestet

Am 09.08. wurde per Agenten-Orchester (5 parallele Bau-Agenten) die
Verkaufsversion gebaut. Alle Flows im Browser end-to-end getestet
(Desktop + iPhone-Viewport 375px, keine JS-Fehler, kein horizontales Scrollen).

### Dateien in `/anprobe/`

- `index.html` — **Kunden-App**: Katalog aus products.json, Kamera/Upload,
  Gemini-Try-on, Decart-Scan-Zustand (abgedunkeltes Foto + Lime-Ring +
  Scanlinie), Fehlerkarte im Stage mit "Neu starten", Vorher/Nachher-Regler,
  Teilen (Web Share API mit Bild-File, Fallback Download), Größen-Merker
  (brs_size_pref). Händler-Links: `#a=` (1 Artikel, v1) UND `#k=`
  (Mini-Katalog v2 mit Artikelleiste zum Umschalten). Bestellung per
  WhatsApp (wa.me vorbefüllt) oder orderUrl/mailto.
- `haendler.html` — **Händler-Cockpit**: Artikel fotografieren + beschreiben,
  Anprobe-Link + fertige WhatsApp-Nachricht, **Artikel-Speicher** (localStorage
  brs_articles, Bereich "Meine Artikel" mit Teilen/Bearbeiten/Löschen,
  Quota-Behandlung), **Mini-Katalog** (mehrere Artikel anhaken → #k=-Link),
  **QR-Code** (eigener Inline-Encoder, qrcodegen-Ansatz: Byte-Modus, ECC M,
  Auto-Version, Masken-Penalty; Links ≤2300 Zeichen direkt, längere über
  optionale Kurzlink-API brs_shortlink_api, sonst Hinweis; PNG-Download
  "QR für den Ladentresen"). QR-Decode per BarcodeDetector verifiziert.
- `widget/anprobe-widget.js` + `widget/demo-shop.html` — **Shop-Widget**
  (Produktlinie 2): EIN Script-Tag, Shadow DOM, schwebender Button + Bindung
  an [data-anprobe]-Elemente, Panel im Decart-Stil (draggbar, Drop-Zone,
  Kamera/Upload, Scan, Vorher/Nachher, Fehlerkarte), Kauf-Button feuert
  CustomEvent "anprobe:order". Demo-Shop "ATELIER NORD" (bewusst fremdes,
  helles Design) demonstriert die Integration; Bestell-Event landet im
  Demo-Warenkorb. Konfig: data-proxy, data-model, data-cta, data-brand.
- `backend/` — **Cloudflare Worker** (deploybereit, noch NICHT deployt):
  POST /api/generate (Gemini-Proxy: Key nur als Secret, Origin-/Modell-
  Allowlist, 12-MB-Limit, Rate-Limit 20/10min pro IP via KV, optional
  X-Anprobe-Key mit Monatszähler cnt:<key>:<JJJJ-MM> = Abrechnungsgrundlage),
  POST /api/links + GET /a/<id> (Kurzlinks für QR/WhatsApp), GET /api/stats.
  wrangler.toml + Schritt-für-Schritt-README für Bernd.
- `verkauf.html` — **Verkaufsseite** für die Händler-Akquise (Sie-Form):
  Hero "Schicken Sie Ihren Kunden die Umkleide aufs Handy", 3 Schritte,
  zwei Produktlinien, Demo-Links, Preise (0 € Kennenlernen 14 Tage /
  29 €/Monat Laden / 79 €/Monat Shop, monatlich kündbar, zzgl. USt.),
  FAQ, Kontakt mailto. Kein JavaScript (FAQ über details/summary).
- `docs/VERTRIEB.md` — intern: Preislogik + Marge, 30-Sek- und 2-Min-Pitch,
  Einwandbehandlung (5 Einwände), Onboarding-Checkliste, 3 Akquise-Vorlagen.
- `products.json`, `img/*.svg`, `README.md` (Technik-Doku).

### Agentur-Struktur (Repo-Root `.claude/agents/`)

anprobe-produkt (Orchestrator), anprobe-frontend, anprobe-haendler,
anprobe-backend, anprobe-vertrieb, anprobe-qa — für künftige Sessions.

## Offene Punkte / nächste Schritte

1. **KI live testen (wichtigster Punkt):** Es gab noch KEINEN Test mit echtem
   Gemini-Key. Key von aistudio.google.com/apikey unter "⚙ KI-Setup"
   eintragen, Prompt-Qualität pro Kategorie prüfen (alle KI-Pfade wurden mit
   gemockten Antworten verifiziert, inkl. Fehlerpfade).
2. **Backend deployen:** Cloudflare-Account + wrangler, siehe
   backend/README.md. Danach: Proxy-URL im KI-Setup, Kurzlink-API im
   Händler-Cockpit eintragen → QR-Codes für lange Links funktionieren.
3. **Ordertool-Integration:** echte Produkte/Bestell-URLs in products.json;
   im eigenen Shop das Widget einbinden.
4. **Preise bestätigen:** 0/29/79 € sind gesetzt, aber Bernds Entscheidung.
5. **Später:** Bezahllink in Bestell-Nachricht (PayPal.Me/Stripe),
   White-Label pro Händler, Live-Video-Anprobe (Decart Realtime-API).

## Arbeitsweise mit Bernd

Deutsch, pragmatisch, wenig Technik-Jargon. Arbeitet oft vom iPhone und
will Ergebnisse sehen. Fertige Ergebnisse per Telegram melden
(@dvssocialmedia_bot, Token in /Users/bb/Desktop/DvS/DvS_API_Keys.env,
Chat-ID 8539755378). Digitalisierung des Vertriebs ist das Leitmotiv.
