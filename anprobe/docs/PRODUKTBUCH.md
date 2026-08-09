# Produktbuch: Digitale Anprobe

Verbindlicher Stand 09.08.2026. Hier ist festgelegt, wie das Produkt
aussieht, wie es benutzt wird und was gilt. Aenderungen nur durch Bernd.

## 1. Was das Produkt ist

Ein Verkaufswerkzeug fuer Mode-Einzelhaendler und Onlineverkaeufer:
Der Haendler schickt einer Kundin eine persoenliche Empfehlung als Link.
Die Kundin oeffnet den Link und steht im Spiegel - sie sieht sich live in
der Kamera und traegt das empfohlene Teil. Gefaellt es, bestellt sie mit
zwei Tipps per WhatsApp oder fragt vorher ihre Freunde. Der komplette
Verkaufsweg ist digital: Empfehlung, Anprobe, Community, Kauf.

Besitzverhaeltnis: Software, Anprobe-Modell und Daten gehoeren Bernd
(Black Rabbit Studio). Es gibt keine Gebuehr pro Bild an Dritte.

## 2. Festes Design-System

- Farben: Schwarz #0E0E0E, Karte #181818, Linie #2A2A2A, Papier #F3EFE6,
  Grau #9C9890, Lime #D8FF3E (Akzent), Rot #FF3B2F (Fehler),
  WhatsApp-Gruen #25D366 nur fuer WhatsApp-Knoepfe.
- Schriften: Archivo Black (Ueberschriften, GROSS), Bodoni Moda kursiv
  (Serif-Akzente), Inter (Text), Monospace nur fuer kleine Statuszeilen.
- Grain-Overlay auf allen Seiten, dunkles Thema, runde Karten (16-20px).
- VERBOTEN: Emojis, Schmuckzeichen und Trennzeichen wie Punkte-Mitte oder
  lange Striche in Kundentexten und Nachrichten. Klare deutsche Saetze.
- Kundin wird geduzt. Haendler im Cockpit geduzt. Verkaufsseite an
  Geschaefte siezt.
- Jeder Zustand ist gestaltet: Warten, Fehler, leere Liste. Niemand sieht
  je eine rohe Fehlermeldung ohne Ausweg. Jeder Fehlerweg bietet einen
  Knopf, der weiterfuehrt.

## 3. Die Ablaeufe (so funktioniert die App)

### Haendler (haendler.html, 2 Minuten pro Empfehlung)
1. Artikel fotografieren (Vorderseite, optional Rueckseite), Name, Preis,
   Groessen, Kategorie. Jeder Artikel bleibt gespeichert (Meine Artikel).
2. Nachricht waehlen: Persoenliche Empfehlung, Empfehlung des Tages oder
   Neu eingetroffen, Name der Kundin optional, Text frei anpassbar.
3. Senden per WhatsApp (Einzelkundin oder Gruppe) oder QR-Code drucken
   (Kurzlink kommt automatisch vom eigenen Server). Danach empfohlen:
   kurze Sprachnachricht hinterher, das verkauft persoenlicher.
4. Mehrere Artikel angehakt = Katalog-Link (Kundin blaettert durch).

### Kundin (live.html, der Spiegel - Hauptweg)
1. Link oeffnen: Begruessung "<Geschaeft> schickt dir: <Artikel>",
   ein Knopf: Anprobe starten.
2. Kamera erlauben, in die Kamera schauen. Der Takt-Spiegel zeigt sie mit
   dem Teil an; das Bild erneuert sich automatisch alle paar Sekunden,
   die echte Kamera laeuft klein in der Ecke mit.
3. Bestellen per WhatsApp (vorbefuellte Nachricht an den Haendler) oder
   Freunde fragen (Bild mit der Frage "Steht mir das?" teilen).
4. Ausweichwege immer sichtbar: Foto-Anprobe (ein Foto statt Spiegel),
   Hinweis bei App-Browsern (Telegram, Instagram) mit Link-Kopieren.

### Onlineshops (widget/anprobe-widget.js)
Ein Script-Tag im Shop. Anprobieren-Knopf am Produktbild plus runder
Knopf unten rechts. Overlay im eigenen Design, Bestell-Ereignis geht in
den Warenkorb des Shops. Demo: widget/demo-shop.html.

## 4. Preisgeruest (Verkauf an Haendler)

- Kennenlernen: 0 EUR, 14 Tage, alle Funktionen, endet automatisch.
- Laden: 29 EUR/Monat - Cockpit, unbegrenzte Artikel und Links, QR,
  WhatsApp-Verkauf.
- Shop: 79 EUR/Monat - zusaetzlich Widget im eigenen Onlineshop.
- Monatlich kuendbar, Preise zzgl. USt. Verkaufsseite: verkauf.html.
- Kostenseite Bernd: ~184 EUR/Monat GPU-Server gesamt, 0 Cent pro Bild.
  Ab ~7 zahlenden Laden-Haendlern ist die Infrastruktur gedeckt.

## 5. Technik-Landkarte (wo was laeuft)

- Frontend: statische Seiten (GitHub Pages, umziehbar auf VPS).
- Steuer-Server: Strato-VPS b2b.dagmarvonschmaus.com/anprobe-api/
  (Kurzlinks, QR-Ziele, Zaehler pro Haendler, Weiche zum Motor).
- Eigener Motor: FASHN VTON 1.5 (Apache-Lizenz) auf GPU-Server;
  bis dahin Testbetrieb auf dem Mac (langsam, nur intern).
- Linkformate: #a= Einzelartikel (Ziel live.html), #k= Katalog (Ziel
  Foto-Anprobe mit Artikelleiste). Daten stecken im Link, serverlos.

## 6. Tag der Hetzner-Bestellung: was dann automatisch passiert

Bernd bestellt den GEX44 (hetzner.com, SSH-Schluessel des Macs hinterlegen).
Danach erledigt Claude ohne weitere Rueckfragen:
1. Modell und Motor-Server auf dem GPU-Server einrichten (Dateien liegen
   in backend/eigener-motor/), Dienst mit Autostart.
2. Absichern: Motor nur vom Strato-VPS erreichbar.
3. OWN_ENGINE_URL auf dem VPS setzen - ab da rechnen alle Anproben auf
   dem eigenen Motor, App unveraendert.
4. Ende-zu-Ende-Test: Haendler-Link, Spiegel, Bestellung, mit echten
   DvS-Artikeln, auf dem iPhone-Format. Lastprobe.
5. Meldung an Bernd mit Ergebnissen. Danach: erste echte Haendler-Tests.

## 7. Feste Regeln aus Bernds Feedback (nie wieder verletzen)

- Live zuerst: Der Spiegel ist der Hauptweg, Foto ist der Ausweich.
- Keine Emojis, keine Schmuckzeichen, nirgends.
- Einfachheit schlaegt alles: ein Link, ein Knopf, keine Technikfragen
  an die Kundin.
- Eigentum schlaegt Miete: kein Dienst pro Bild, wenn es einen eigenen
  Weg gibt. Miet-Dienste nur als klar begruendete Ausnahme mit Preis.
- Ehrliche Grenzen sofort benennen (z. B. 30fps-Live nur bei Anbietern).
- Qualitaet vor Geschwindigkeit: nichts geht zu Kunden, was Wartezeiten
  oder halbe Ergebnisse liefert.
