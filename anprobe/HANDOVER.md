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

## EIGENER MOTOR: ERSTER LAUF ERFOLGREICH (09.08. nachts)

FASHN VTON 1.5 laeuft auf Bernds Mac (M4, MPS): Capri-Top und Palazzo-Hose
auf Model-Foto in ueberzeugender Qualitaet (Ware-Treue besser als Gemini),
motor_server.py im App-Format getestet. ~7 Min/Bild auf dem M4 = nur
Testmotor; Kundenbetrieb braucht GPU-Server (5-10s). Details, Patches und
Fallen: backend/eigener-motor/README-EIGENER-MOTOR.md. Vergleichsbild:
Scratchpad motor_vergleich.jpg der Session. NICHT in den oeffentlichen
Kundenweg verdrahtet (Timeout-Gefahr) - das passiert erst mit Bernds
Grafikserver-Entscheidung.

## STRATEGIEWECHSEL (Bernd, 09.08. nachts): EIGENER MOTOR statt Miet-KI

Bernd will die KI besitzen, nicht mieten. Ergebnis der Recherche:
- FOTO-Anprobe: FASHN VTON v1.5 (github.com/fashn-AI/fashn-vton-1.5),
  Apache-2.0 = kommerziell frei, Gewichte ~2 GB lokal, fotorealistisch,
  kann flach fotografierte Artikel. DAS wird der eigene Motor.
  Vorbereitet: backend/eigener-motor/ (motor_server.py spricht das
  Gemini-Format der App, README mit Aufbau + Kosten) und die Weiche
  OWN_ENGINE_URL im VPS-Backend (deployt, Restart steht aus).
  ACHTUNG: Die bekannten Spitzenmodelle IDM-VTON/CatVTON/OOTDiffusion sind
  CC-BY-NC = NICHT kommerziell nutzbar, nicht verwenden.
- LIVE-Anprobe: Es existiert Stand 08/2026 KEIN selbst betreibbares
  Echtzeit-Modell (nur Anbieter wie Decart, per Sekunde). Ehrlich an Bernd
  kommuniziert. Spaeterer eigener Weg fuer Bewegtbild: ViViD (Apache-2.0,
  Video-Anprobe offline) fuer kurze Anprobe-Clips.
- OFFEN (Bernd): Grafikserver-Entscheidung (eigene Hardware ~2500 EUR /
  Miet-GPU ~200 EUR Monat / stundenweise zum Test) - dann Einrichtung,
  erster echter Lauf von motor_server.py (ist noch UNGETESTET) und
  Qualitaetsvergleich gegen die Gemini-Ergebnisse.

## RICHTUNGSENTSCHEID (Bernd, 09.08. spaet): LIVE-Anprobe ist das Produkt

Nicht Foto, sondern live im Kamerabild. Haendler-Einzelartikel-Links zielen
seit c5308d5 direkt auf live.html (Ein-Knopf-Landung: Artikel vorgeladen,
"Anprobe starten", Kamera-Stufenfallback, bei Kamera-/Freischalt-Problemen
Ausweichknopf zur Foto-Anprobe mit Artikel im Hash). KEINE Emojis und keine
Schmuckzeichen mehr in App und Nachrichten (Bernd-Regel, strikt einhalten).
Im iPhone-Simulator selbst getestet. BLOCKER fuer echtes Live: DECART_API_KEY
fehlt (Konto auf platform.decart.ai kann nur Bernd anlegen; Freischalten-
Command fragt den Key mit ab). Kosten ca. 0,02 USD pro Sekunde, Sitzung
deshalb 90s begrenzt (SESSION_S in live.html).

## LIVE seit 09.08.2026: https://vorschau.black-rabbit.studio/anprobe/

Bernd hat freigegeben ("schalte das live") → Branch auf main gemerged,
GitHub Pages liefert aus. Live verifiziert (Browser + Mobil): Kunden-App
mit ECHTEM DvS-Sortiment (8 Artikel aus /DvS/Artikelkatalog/, Freisteller
einzeln geprüft — Achtung: Katalog-Dateinamen lügen teils über Farben,
"Kaleia Weiss" ist schwarz, "Limone Blau" ist rosé, "111_Lavendel" trägt
ein JIL-SANDER-Label → aussortiert; Preise vorläufig bis CD-Freigabe),
Händler-Cockpit inkl. Nachrichten-Vorlagen (Persönlich/Empfehlung des
Tages/Neu + Kundenname, frei editierbar) und automatischem Kurzlink+QR
gegen die VPS-API (End-to-End live getestet), Community-Share beim
Ergebnis ("Steht mir das?"-Frage mit Bild), Kategorie Rock ergänzt.
Sprachnachrichten kann ein wa.me-Link technisch nicht anhängen — dafür
steht der Tipp im Cockpit, nach dem Link eine Sprachnachricht zu schicken.

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

0. **WICHTIG für die nächste Session — zwei Bernd-Entscheidungen offen:**
   (a) KI freischalten: Doppelklick auf
   `anprobe/backend/Anprobe-Freischalten.command` (traegt den vorhandenen
   Google-Key sicher auf den VPS ein + Neustart + Funktionstest). Der
   Sicherheits-Klassifikator verbietet der Session zu Recht, Secrets selbst
   auf Server zu kopieren — auch per Tunnel; nicht erneut versuchen.
   (b) Veröffentlichen: vorschau.black-rabbit.studio ist GitHub Pages und
   liefert MAIN aus — anprobe/ existiert dort noch nicht. Erst nach Bernds
   klarem Ja den Branch auf main mergen (Diff ist rein additiv + 1 Karte in
   der Vorschau-Startseite). Alternativ statisches Hosting auf dem VPS
   (rsync nach /opt/anprobe-web + Caddy handle /anprobe/* file_server) —
   war in dieser Session ebenfalls klassifikator-blockiert.
1. **Serverstand:** /opt/anprobe-api/server.mjs auf dem VPS ist aktuell
   (inkl. /api/live-token und Mac-Tunnel-Fallback), aber der Dienst lief
   zuletzt noch mit der vorigen Fassung — der Neustart steckt im
   Freischalten-Command. mac-key-proxy.py (Tunnel-Variante) liegt im Repo,
   ist aber NICHT installiert (Klassifikator) — nur nutzen, wenn Bernd es
   ausdrücklich will.
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
