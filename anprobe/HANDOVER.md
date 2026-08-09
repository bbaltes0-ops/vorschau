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

## Update 09.08. abends: KI getestet, Backend LIVE, Live-Spiegel gebaut

- **KI live getestet** mit dem vorhandenen Key aus
  `/Users/bb/Desktop/DvS/DvS_API_Keys.env` (`GOOGLE_AI_API_KEY`, kann auch
  gemini-3-pro-image): Oberteil + Hose mit echtem Model-Foto + Artikel-
  Freisteller — Ergebnisse stark (Identität/Pose/Hintergrund erhalten,
  3-pro ~20-28s, 2.5-flash ~10-13s, sporadisch IMAGE_OTHER → Retry).
  WICHTIGE LEHRE: Prompt muss das Produkt-BILD für maßgeblich erklären,
  sonst folgt 2.5-flash der Textbeschreibung (falsche Farbe). Umgesetzt in
  index.html + Widget ("The product IMAGE is the authoritative reference").
- **Backend läuft LIVE auf dem Strato-VPS** (nicht Cloudflare): `server-vps.mjs`
  als systemd-Dienst `anprobe-api` auf 31.70.107.0, Caddy-Route
  `https://b2b.dagmarvonschmaus.com/anprobe-api/*`. Kurzlinks + QR
  funktionieren (getestet: POST /api/links → 302-Redirect). Standard-Proxy
  und Kurzlink-API sind in index.html, Widget und haendler.html als Default
  verdrahtet (eigener Key/Proxy in localStorage hat Vorrang).
- **Live-Spiegel (live.html, Beta)** nach Bernds Wunsch "live in der Kamera":
  Decart Lucy VTON (Realtime-WebRTC, Vorbild Anywear-App). Aufbau nach dem
  offiziellen MIT-Beispielrepo DecartAI/tryon-examples: Server stellt
  kurzlebige Client-Tokens aus (POST /api/live-token, 501 solange
  DECART_API_KEY fehlt), Browser lädt @decartai/sdk via esm.sh, connect mit
  Modell "lucy-vton-latest", setImage(garment) — Outfitwechsel ohne
  Reconnect. Session-Timer 90s + Verlängern (Kosten ~0,02 USD/s!).
  Übernimmt #a=-Händler-Links inkl. WhatsApp-Bestell-CTA.

## Offene Punkte / nächste Schritte

1. **Bernds 1-Minuten-Handgriff (einziger Blocker für "KI für alle"):**
   Gemini-Key auf den VPS eintragen — genaue Befehle in backend/README.md
   ("Der eine offene Handgriff"). Der Sicherheits-Klassifikator verhindert
   (zu Recht), dass die Session Secrets auf fremde Server kopiert.
   Danach lief zuletzt noch der alte Serverstand ohne den Platzhalter-Check —
   der Restart im selben Handgriff aktiviert die neue Fassung.
2. **Live-Spiegel freischalten (optional, Beta):** Decart-Account +
   DECART_API_KEY in /etc/anprobe-api.env → erster echter WebRTC-Test
   (SDK-Feldnamen der Token-Antwort und onRemoteStream-Callback sind
   defensiv gebaut, aber ungetestet gegen die echte API).
3. **Ordertool-Integration:** echte Produkte/Bestell-URLs in products.json;
   im eigenen Shop das Widget einbinden.
4. **Preise bestätigen:** 0/29/79 € gesetzt; Live-Spiegel wegen
   Sekundenabrechnung als Premium-Baustein kalkulieren (docs/VERTRIEB.md).
5. **Später:** Bezahllink in Bestell-Nachricht, White-Label pro Händler.

## Arbeitsweise mit Bernd

Deutsch, pragmatisch, wenig Technik-Jargon. Arbeitet oft vom iPhone und
will Ergebnisse sehen. Fertige Ergebnisse per Telegram melden
(@dvssocialmedia_bot, Token in /Users/bb/Desktop/DvS/DvS_API_Keys.env,
Chat-ID 8539755378). Digitalisierung des Vertriebs ist das Leitmotiv.
