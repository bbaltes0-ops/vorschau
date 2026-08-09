# Kostenplan: Die komplette Anprobe auf eigener Technik

Stand 09.08.2026, Preise live recherchiert. Ziel: Das ganze Fahrzeug gehoert
Bernd - eigene Software, eigenes Modell, eigene Server, Daten in Deutschland,
immer online. Keine Gebuehr pro Bild an Google oder Decart.

## Die Ziel-Architektur

| Baustein | Wo | Kosten | Status |
|---|---|---|---|
| App (Kunden, Haendler, Spiegel, Widget, Verkaufsseite) | eigener Code | 0 EUR | FERTIG, gebaut und getestet |
| Anprobe-Modell FASHN VTON 1.5 (Apache-Lizenz) | liegt auf eigener Platte | 0 EUR | FERTIG, auf dem M4 getestet |
| Steuer-Server (Kurzlinks, QR, Zaehler, Weiche) | Strato-VPS, vorhanden | bereits bezahlt | LAEUFT |
| EIGENER MOTOR: GPU-Server Hetzner GEX44 | Falkenstein, Deutschland | 184 EUR/Monat + 79 EUR einmalig | BESTELLEN (nur Bernd) |
| Frontend-Hosting | heute GitHub Pages (0 EUR); auf Wunsch komplett auf VPS umziehbar | 0 EUR | laeuft |

**Gesamt laufend: ~184 EUR/Monat** (zzgl. vorhandener VPS). Einmalig 79 EUR.

## Was der GEX44 ist und warum genau der

Dedizierter Server bei Hetzner (deutscher Anbieter, Rechenzentrum
Falkenstein): NVIDIA RTX 4000 Ada mit 20 GB Grafikspeicher, 64 GB RAM,
i5-13500. Quelle: hetzner.com/dedicated-rootserver/gex44 (184 EUR/Monat,
79 EUR Setup). Das Modell braucht ~8-16 GB Grafikspeicher - passt mit Luft.

Damit leistet der eigene Motor:
- Foto-Anprobe: ~5-10 Sekunden pro Bild, 0 Cent pro Bild, unbegrenzt.
  Rechnerisch 6-10 Anproben pro Minute, ueber 8.000 am Tag - mehr als
  genug fuer hunderte Haendler.
- Takt-Spiegel (das Live-Gefuehl, bereits gebaut): Kamera laeuft
  durchgehend, das Spiegelbild mit angezogenem Teil erneuert sich alle
  ~6-12 Sekunden - komplett auf eigener Technik, ohne Decart, ohne Google.
- Alle Kundenfotos bleiben auf Bernds Servern in Deutschland (DSGVO-stark,
  gutes Verkaufsargument an Haendler).

## Verglichene Alternativen (live recherchiert)

| Option | Kosten 24/7 | Bewertung |
|---|---|---|
| Hetzner GEX44 (RTX 4000 Ada 20 GB) | 184 EUR/Monat | EMPFEHLUNG: guenstigster Dauerbetrieb, Deutschland, fester Preis |
| Hetzner GEX131 (RTX PRO 6000, 96 GB) | 889 EUR/Monat | Overkill fuer Foto; nur fuer spaetere Echtzeit-Experimente |
| RunPod RTX 4090 (Secure Cloud) | ~0,69 USD/Std = ~460 EUR/Monat bei 24/7 | teurer im Dauerbetrieb, US-Anbieter |
| RunPod Community | ~0,34 USD/Std = ~230 EUR/Monat | billig, aber geteilte Fremdrechner - nicht fuer Kundendaten |
| Eigene Hardware (RTX 4090 PC) | ~2.500 EUR einmalig + Strom ~20 EUR/Monat | ab ~14 Monaten guenstiger als Miete, ABER: haengt an Laden-Internet, kein Rechenzentrum, Ausfallrisiko |

## Wie fluessig wird der Spiegel wirklich (Schnellmodus)

Das Modell rechnet standardmaessig 30 Rechenschritte pro Bild. Fuer den
Spiegel ist das Verschwendung: Mit 8 Schritten und 512 Pixel Kantenlaenge
(Schalter "takt" im Motor, live.html sendet ihn automatisch) wird es rund
viermal schneller, bei fuer den Spiegel ausreichender Qualitaet.

Erwartete Erneuerungsrate auf dem GEX44 (RTX 4000 Ada):
- volle Qualitaet, 30 Schritte, 768 px: ~5-10 Sekunden pro Bild
- Spiegel-Schnellmodus, 8 Schritte, 512 px: grob 1,5-3 Sekunden pro Bild

Auf der groesseren Karte (GEX131, 889 EUR/Monat) waere unter einer Sekunde
denkbar. GENAU MESSEN laesst sich das erst auf der echten Karte - der erste
Messlauf steht direkt nach der Bestellung an, danach wird der Takt fest
eingestellt.

## Ehrliche Abgrenzung: echtes 30-Bilder-pro-Sekunde-Live

Fluessiges Echtzeit-Video wie die Anywear-App kann Stand heute kein frei
verfuegbares Modell - das koennen nur wenige Labore (Decart u. a.) auf
eigenen Spezial-Clustern, und die vermieten nur pro Sekunde (~2 US-Cent/s).
Der eigene Weg zum Live-Gefuehl ist der Takt-Spiegel (oben) - der ist
gebaut und getestet. Falls spaeter echtes 30fps gewuenscht: Decart als
zusaetzlicher Premium-Baustein (90s-Sitzung ~1,60-1,80 EUR) ODER
Forschungsprojekt auf dem GEX131 ohne Qualitaetsgarantie.

## Ablauf zum Optimum (nach Bernds Bestellung)

1. Bernd bestellt den GEX44 auf hetzner.com (Konto + Bestellung darf nur
   er; SSH-Schluessel des Macs dabei hinterlegen wie beim Strato-VPS).
2. Danach vollautonom durch Claude: Modell + Motor-Server einrichten
   (Anleitung und alle Dateien liegen in backend/eigener-motor/),
   Absicherung (nur VPS darf zugreifen), OWN_ENGINE_URL auf dem VPS setzen,
   Ende-zu-Ende-Test mit echten DvS-Artikeln, Lasttest, Uebergabe.
3. Optional im gleichen Zug: Frontend von GitHub Pages auf den VPS umziehen,
   dann liegt wirklich JEDES Teil auf Bernds Servern.

Quellen: hetzner.com/dedicated-rootserver/gex44, hetzner.com/pressroom
(GEX131), runpod.io/product/cloud-gpus, platform.decart.ai/pricing.
