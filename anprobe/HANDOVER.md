# Projekt-Übergabe: Digitale Anprobe (Virtual Try-on)

> Für Claude (oder jeden Entwickler), der an diesem Projekt weiterarbeitet —
> egal in welcher Session, auf welchem Gerät. Stand: 09.08.2026.
> Branch: `claude/virtual-try-on-shop-2tv6sr` im Repo `bbaltes0-ops/vorschau`.

## Worum es geht

Bernd (Black Rabbit Studio, b.baltes0@gmail.com) baut eine KI-gestützte
**digitale Anprobe**: Kund:innen probieren Kleidung per Handy-/Laptop-Kamera
virtuell an (Vorbilder: Decart Anywear · anywear.decart.ai, X-Posts von
@sofiasofian und @decartai). Zwei Zielrichtungen:

1. **Eigener Shop / Ordertool:** Anprobe-Funktion für die eigenen Produkte im
   Ordertool (Onlineshop). Das Ordertool selbst liegt NICHT in diesem Repo und
   war aus der bisherigen Session nicht erreichbar — Integration steht noch aus.
2. **Produkt für Einzelhändler (Verkaufsidee):** Kleine Händler ohne Onlineshop
   fotografieren Artikel im Laden, schicken per WhatsApp einen Anprobe-Link an
   Stammkunden/Gruppen („Probier das mal an, das steht dir bestimmt"), Kunde
   probiert digital an und bestellt per WhatsApp zurück. Später: White-Label,
   kurze Links/QR, Bezahllinks, Abrechnung pro Händler.

## Was schon gebaut und gepusht ist (Ordner `/anprobe/`)

- `index.html` — Kunden-App: Produktkatalog aus `products.json`, Foto per
  Kamera (getUserMedia) oder Upload (clientseitig auf 1024 px verkleinert),
  Try-on via Gemini-Bildmodell `gemini-3-pro-image` (Fallback
  `gemini-2.5-flash-image`), Vorher/Nachher-Schieberegler, Größenwahl,
  Bestell-CTA. Erkennt Händler-Links im URL-Fragment `#a=<base64url-JSON>`
  und startet dann im Artikelmodus (Katalog aus, nur der geschickte Artikel,
  Bestellung als vorbefüllte wa.me-Nachricht an den Händler).
- `haendler.html` — Händler-App: Artikel fotografieren (vorne/hinten),
  Preis/Größen/Geschäft/WhatsApp-Nummer erfassen, Anprobe-Link erzeugen
  (Artikeldaten + komprimierte Fotos stecken direkt im Link, serverlos),
  Teilen per Web Share API / wa.me.
- `products.json` — Beispielsortiment + Config (orderMail, orderUrlBase,
  Währung). SVG-Platzhalterbilder in `img/`.
- `README.md` — Funktionsweise, Demo- vs. Live-Betrieb, fertiger
  Cloudflare-Worker-Proxy (API-Key darf nie öffentlich ins Frontend!),
  Integrationsanleitung Ordertool, Händler-Flow und Ausbaustufen.

Design: Black-Rabbit-CI (Schwarz #0E0E0E, Papier #F3EFE6, Neon-Lime #D8FF3E,
Archivo Black / Bodoni Moda Italic / Inter, Grain-Overlay). Deutsch, mobil
getestet (Playwright, Händler→Kunde-Flow end-to-end grün).

## Offene Punkte / nächste Schritte

1. **KI live testen:** Gemini-API-Key nötig (aistudio.google.com/apikey),
   auf der Seite unter „⚙ KI-Setup" eintragen. Es gab noch KEINEN Test mit
   echtem Key — Prompt-Qualität pro Kategorie prüfen und nachschärfen.
2. **Ordertool-Integration:** Zugriff aufs Ordertool-Repo/System besorgen,
   echte Produkte + Bestell-URLs in `products.json`, Anprobe-Button auf
   Produktkarten.
3. **Verkaufsversion Händler:** kleines Backend für kurze Links + QR-Codes,
   Händler-Konten/White-Label, Bestell-Dashboard, Bezahllink (PayPal/Stripe),
   Preismodell (KI-Kosten pro Bild im Cent-Bereich).
4. **Live-Video-Anprobe** (wie Decart, 30 fps) später via
   docs.platform.decart.ai/models/realtime/virtual-try-on evaluieren.
5. X-Videos konnten aus der Cloud-Session nicht abgerufen werden (Netzwerk
   blockiert x.com) — falls Bernd die Videos bereitstellt: Frame-für-Frame
   auswerten und UX-Details übernehmen.

## Arbeitsweise mit Bernd

Deutsch, pragmatisch, wenig Technik-Jargon. Er arbeitet oft vom iPhone
(diese Session lief über die iOS-App) und will Ergebnisse sehen
(Screenshots schicken). Digitalisierung des Vertriebs ist das Leitmotiv.
