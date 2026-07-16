# Bestattungs-Template · Anleitung

Premium-Website-Template für deutsche Bestattungsinstitute.
Reines HTML/CSS/JS · keine Build-Tools, keine Frameworks, kein Tracking.

## Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite: Hero, Soforthilfe, Leistungen, Über uns, Vorsorge-Teaser, Bewertungen, Kontakt |
| `trauerfall.html` | Leitfaden „Was tun im Trauerfall" · erste 24 Stunden, Dokumente, Leistungsumfang |
| `vorsorge.html` | Bestattungsvorsorge · Gründe, Ablauf, häufige Fragen |
| `impressum.html` | Impressum (Platzhalter-Stellen mit `PLATZHALTER` markiert) |
| `datenschutz.html` | Datenschutzerklärung (ohne Tracking, daher kein Cookie-Banner nötig) |

## Pro Kunde anpassen · 3 Schritte

### 1. `js/config.js` ausfüllen
Alle kundenspezifischen Texte stehen als Tokens (`{FIRMA}`, `{ORT}`, `{TEL}` …)
im HTML und werden beim Laden aus `js/config.js` ersetzt.

Tokens: `FIRMA` `ORT` `REGION` `SLOGAN` `TEL` `TEL_LINK` `EMAIL` `WHATSAPP`
`ANSPRECH` `ADRESSE` `GRUENDUNG` `BEWERTUNG` `ANZAHL_BEW`
`ZITAT_1` `ZITAT_1_NAME` `ZITAT_2` `ZITAT_2_NAME`

Alternative für die Produktion: Tokens per Suchen-und-Ersetzen direkt im HTML
austauschen und `js/config.js` entfernen · dann läuft die Seite auch ganz ohne JavaScript.

### 2. Farben in `css/style.css` umstellen
Das komplette Farbsystem liegt im `:root`-Block am Anfang der Datei.
Zwei fertige Alternativ-Themes („Taupe / Bronze" und „Salbei / Stein")
liegen direkt darunter als auskommentierte Blöcke · zum Aktivieren den
Default-Block auskommentieren und das gewünschte Preset einkommentieren.

### 3. Bilder ersetzen (`img/`)
Die mitgelieferten Dateien sind Platzhalter. Empfohlene Motive · warm und
entsättigt bearbeitet, keine Stock-Klischees:

| Slot | Motiv |
|---|---|
| `img/hero.jpg` | Ruhige Lichtung, Allee oder Licht durch Bäume · ca. 2000×1300 px |
| `img/team.jpg` | Inhaber/in und Team oder Geschäftsräume, natürliches Licht · 4:3 |
| `img/raum.jpg` | Abschiedsraum oder Beratungszimmer, hell und aufgeräumt · 4:3 (Reserve-Slot) |
| `img/natur-1.jpg` | Weg oder Wiese im Morgenlicht (Vorsorge-Seite) · 7:5 |
| `img/natur-2.jpg` | Stilles Wasser oder weiter Horizont (Trauerfall-Seite) · 7:5 |

## Vor dem Livegang

- [ ] Kontaktformular: in `index.html` die `action` auf Formspree oder Web3Forms
      setzen und `data-placeholder-action="true"` entfernen (Details in `js/main.js`)
- [ ] Echte Google-Rezensionen in `js/config.js` eintragen (`ZITAT_1/2`) ·
      niemals erfundene Bewertungen verwenden
- [ ] `impressum.html`: USt-IdNr., Kammer und Aufsichtsbehörde ergänzen
- [ ] `datenschutz.html`: Hosting-Anbieter und ggf. Formular-Dienst ergänzen
- [ ] Empfehlung: Google Fonts selbst hosten (google-webfonts-helper) und den
      Fonts-Abschnitt der Datenschutzerklärung entfernen

## Typografie

Newsreader (Überschriften, Serif) + Hanken Grotesk (Fließtext).
Beide über Google Fonts geladen · Schriftfamilien zentral in
`css/style.css` über `--font-head` und `--font-body` tauschbar.
