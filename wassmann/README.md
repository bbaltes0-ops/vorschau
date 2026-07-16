# Waßmann — Website, erste Fassung

**Öffnen:** `index.html` per Doppelklick, oder besser mit Server (wegen AVIF-Caching):

    cd ~/Desktop/Wassmann/07_Website && python3 -m http.server 8901
    → http://localhost:8901

Eine Datei, alles inline. Keine Build-Tools, kein Framework, kein CDN-JavaScript.
Erster Bildaufbau: **223 KB** (36 KB HTML + 186 KB Hero) plus Google Fonts.
Der Rest lädt beim Scrollen nach.

---

## Das Intro

Das Siegel zeichnet sich, dann öffnet sich die Seite. **Gesamt 1300 ms.**

Drei Entscheidungen dahinter, die nicht willkürlich sind:

- **Die Ringe zeichnen unterschiedlich lang** — 620/600/460 ms. Sie sind unterschiedlich
  groß (Umfang 2953/2865/2186), also braucht gleiche *Geschwindigkeit* ungleiche *Dauer*.
  Gleiche Dauer bei ungleicher Länge ist das Merkmal, an dem man Tutorial-Animationen
  erkennt: der kurze Pfad zeichnet dann sichtbar langsamer als der lange.
- **Kein Überspringen-Knopf.** Ein Knopf gibt zu, dass es stört. Stattdessen bricht jede
  Eingabe ab: Klick, Taste, Scroll, Touch.
- **Nur einmal pro Sitzung** (`sessionStorage`, nicht `localStorage`). Beim zweiten Aufruf
  nur ein 250-ms-Gruß. Mit localStorage sähe ein Stammkunde das Siegel nie wieder — dann
  könnte man es auch weglassen.

**Warum es auf `document.fonts.ready` wartet:** Die Umlaufschrift des Siegels ist echter
`<text>` in Fraunces. Ohne geladene Schrift springt sie auf System-Serif und verrutscht
sichtbar. Notbremse nach 800 ms, damit ein hängendes Font-CDN kein Vorhang wird.
Zweite Notbremse rein in CSS bei 2400 ms — falls das JavaScript ganz ausfällt.

Bei `prefers-reduced-motion` wird das Siegel **statisch** gezeigt und weggeblendet,
nicht übersprungen. Die Marke bleibt, nur die Bewegung geht.

---

## Drei Fehler, die beim Bauen gefunden und behoben wurden

**1. Das Hero-Bild versteckte sich selbst.**
Gemessen: `clip-path: inset(0 0 56%)` bei Scroll 0. Die Masken-Animation verdeckte
ausgerechnet das LCP-Element, das der `preload` mit `fetchpriority="high"` vorher
mit Vorrang geholt hatte. Ein Eigentor. Deshalb steht im CSS `.bild:not(.hero-bild)` —
das ist kein Detail, sondern Pflicht.

**2. `nav{display:none}` traf auch das Menü.**
Die Kopfzeilen-Regeln waren nicht gescoped. Auf Mobil versteckte
`@media(max-width:880px){nav{display:none}}` auch das `<nav>` *im* Menü-Panel. Folge:
Panel sichtbar, Links mit `opacity: 1` — aber Größe 0×0, weil der Vorfahre weg war.
Jede Opacity-Messung log deshalb. Ebenso zwangen `nav{display:flex}` und
`nav a{font-family:Mono;text-transform:uppercase}` das Menü in Mono-Versalien.
Alle Kopfzeilen-Regeln heißen jetzt `header nav`.

**3. `.bild.auf` — zwei `animation`-Kurzschreibweisen auf einem Element.**
Die letzte gewinnt, die andere fällt still aus. Optisch war es richtig (die Maske *ist*
der Reveal), aber es hing an der CSS-Reihenfolge. `auf` ist von den Bild-Figuren entfernt.

---

## Bekannte Lücken

- **Vier Fotos fehlen:** Markus und Hella (gibt es nicht), die Ladentür mit dem
  Schriftzug „seit 1960" und der Meisterbrief. Letztere brauchen zwingend eine Kamera —
  KI kann keine Schrift. Die Platzhalter tragen die vollständige Bildregie.
- **Unterseiten fehlen.** Alle Links in „Die Arbeit" gehen auf `#`. Als Nächstes:
  `/uhrenankauf-hamburg/`, `/goldschmiede-werkstatt-neuer-wall/`,
  `/schmuck-umarbeiten-hamburg/`, die drei Personenseiten.
- **Impressum und Datenschutz** sind leer.
- **Schriftlizenzen** für Fraunces, Cormorant und IBM Plex Mono prüfen (alle Google
  Fonts, also unkritisch — aber vor dem Livegang bestätigen).
- **Rainers Unterschrift** vektorisieren, dann kann die Wortmarke final werden.

---

## Verwendete Bilder

Aus `05_Bilder/gemini_clean/`, Wasserzeichen herausgerechnet, in AVIF (q75) mit
WebP- und JPEG-Fallback:

| Datei | Motiv |
|---|---|
| `atelier` | A02 — Hero, das Atelier |
| `rainer` | R02 — Gründer, Kaschmir |
| `thorsten` | T01 — Sohn, Sakko |
| `fassen` | P07 — der Stichel an der Krappe |
| `beratung` | L02 — der Beratungstisch |

Weitere 11 liegen einsatzbereit in `assets/img/` für die Unterseiten.

---

## Fassung 2 — CD-Korrekturen 16.07.2026

**Bilder**
- Rainers Porträt getauscht: **R04** statt R02. R02 war nachweislich die schlechteste
  Ähnlichkeit von allen Varianten (volleres Gesicht, rundere Form, volleres Haar).
  R04 entstand mit einem deutlich härteren Identitäts-Lock, der Gemini Merkmal für
  Merkmal verbietet, das Gesicht zu rekonstruieren — schmales Gesicht, hohle Wangen,
  dünner Haaransatz. Alle Varianten liegen in `05_Bilder/gemini_clean/`.
- Acht neue Kategorie-Bilder: Paar bei den Trauringen, Trauring-Hände, Vintage-Uhr,
  Uhrwerk, Ankauf-Tisch, Erbstück, Collier.

**Text und Struktur**
- Hella Waßmann entfernt → „Drei Namen. Eine Tür."
- Claim neu: „Drei Goldschmiede. Ein Haus. Seit 1960." (statt „Der Boulevard verkauft
  Marken. Waßmann hat Hände.")
- Sektionsnummern (01–07) raus, „Das Haus" → „Über uns"
- Alle Bildunterschriften raus
- Nummern in der Leistungsliste → die **Raute aus dem Siegel**, die sich beim Hovern dreht
- Basis-Schriftgröße 16 → 17,5 px, Überschriften und Abstände entsprechend größer

**Neu**
- Facetten-Grund: die Rondiste-Geometrie des Siegels als Fläche, zur Mitte hin
  ausgeblendet. Bei .42 Deckkraft hat sie die Leistungsliste erschlagen — jetzt .26.
- Kopfzeile: volles **Siegel** statt Punze, deutlich größer, schrumpft beim Scrollen
- Telefonnummer als Pille mit Hörer-Symbol statt loser Zeile
- Kontaktformular statt „Termin vereinbaren"
- Zwei Unterseiten: `uhren-und-vintage.html`, `an-und-verkauf.html`
- Fuß komplett neu: vier Spalten, alle Leistungen als Links, Adresse, Öffnungszeiten

**SEO**
- Sprechende Titles und Descriptions pro Seite, Canonicals, Open Graph
- **JSON-LD**: `JewelryStore` mit Gründer, Mitarbeitern, Geo, Öffnungszeiten und
  Leistungskatalog · `Service` je Unterseite · `FAQPage` auf An- und Verkauf ·
  `BreadcrumbList`
- Alt-Texte mit Ort und Leistung statt „Bild1"

**Zwei Fehler, gefunden und behoben**
- **Formular auf dunklem Grund: schwarze Schrift auf schwarzem Grund.** Die Eingabefelder
  erbten `color: var(--anthrazit)`. Man hätte beim Tippen nichts gesehen. Jetzt 15,26:1
  gemessen. Ebenso Autofill abgefangen, das sonst weiße Kästen in die dunkle Sektion malt.
- Facetten-Muster zu stark (siehe oben).

**Gemessene Kontraste (dunkle Sektion, alle über AA):**
Eingabefeld 15,26:1 · Feld-Label 5,79:1 · Hinweis 4,96:1 · Fußzeile 5,64:1

---

## Weiterhin offen

- **Das Formular hat kein Backend.** Es prüft im Browser und öffnet dann das
  E-Mail-Programm mit fertiger Nachricht. Ehrlicher Zwischenstand — aber vor dem
  Livegang braucht es einen serverseitigen Versand plus Spam-Schutz.
- **Impressum und Datenschutz** verlinkt, aber nicht gebaut. Pflicht vor Livegang.
- **Markus' Foto** fehlt weiter. Ebenso die Ladentür mit dem Schriftzug „seit 1960"
  und der Meisterbrief — die brauchen zwingend eine Kamera, weil KI keine Schrift kann.
- **Weitere Unterseiten**: Trauringe, Schmuck umarbeiten, Ring vergrößern — die Links
  in der Leistungsliste zeigen dafür noch auf den Kontakt.
- **`info@juwelierwassmann.de`** ist erfunden. Die echte Adresse ist eine web.de-Adresse,
  die vor dem Livegang durch eine Domain-Adresse ersetzt werden sollte.

---

## Fassung 3 — CD-Korrekturen 16.07.2026

**Zeichnungen, zweiter Anlauf.** Die erste Fassung war Müller-Vektorstrenge: zu
detailliert, zu hartkantig, Steinplatten-Raster. Neu ist eine **leichte Federzeichnung**
— wenige Linien, ungleichmäßig, an den Rändern auslaufend. „Suggest, do not describe."

- **Fassade:** Das Steinraster ist weg. Dafür steht jetzt **„Waßmann" im Schwungzug**
  über dem Eingang, und in beiden Schaufenstern ist Schmuck angedeutet.
- **Innenraum:** Die Kronleuchter sind das Hauptmotiv, die untere Hälfte läuft ins Weiße aus.
- **Alster** bleibt wie sie war (vom CD abgenommen).

**Porträts**
- **Rainer (R05):** Gesicht unverändert, nur der Ausdruck — jetzt warm und einladend
  statt streng. Die Maskenskulptur aus dem Originalfoto ist zurück im Hintergrund.
- **Markus (M01):** neu, aus einem Selfie in praller Sonne. Augen geöffnet (er kniff sie
  gegen die Sonne zusammen), Schatten weg, heller Laden, dunkelblaues Hemd.
  **Damit sind alle drei fotografiert — kein Platzhalter mehr auf der Startseite.**

**Ein Fehler, der die ganze Seite hätte kosten können**

`main{opacity:0}` plus `body.offen main{animation:...forwards}` — die Sichtbarkeit der
**kompletten Seite** hing an einer einzigen Animation. Gemessen: `playState: "running"`,
`currentTime: 0` → Seite unsichtbar. Ohne JavaScript wäre sie dauerhaft leer gewesen.

Jetzt ist `main` immer sichtbar, das Intro **verdeckt** es nur (deckendes Overlay).
Fällt das JS aus, räumt die CSS-Notbremse das Intro nach 2400 ms weg und darunter liegt
eine fertige Seite. **Mit `--disable-javascript` verifiziert.**

Dieselbe Fehlerklasse wie die Maske über dem LCP-Bild: ein Effekt, der etwas versteckt,
und nichts, was es zurückholt, wenn der Effekt ausfällt.

**Weiteres**
- „drei Goldschmiede" überall entfernt — der CD zweifelt die Zahl an. Ein Anspruch in der
  Überschrift, der nicht stimmt, ist schlimmer als keiner. **Zahl bitte bestätigen,
  dann kommt sie zurück — sie ist stark.**
- Neuer Claim: „Seit 1960 machen wir, was wir verkaufen."
- Emblem über der Hero-Zeile weg
- Vier neue Unterseiten: Trauringe, Schmuck, Umarbeiten, Service
- Impressum aus den echten Daten · Datenschutz bewusst als Faktensammlung statt
  Rechtstext (siehe dort)
- Fuß deutlich kompakter, mit Alster-Zeichnung als Leiste

**Video-Prompts** in `04_Prompts/08_Video_Prompts.md` — sieben Clips im Stil des
CD-Referenzvideos (nur das Stück, hellgrauer Verlauf, flache Schärfe, kaum Bewegung).

---

## Fund am Rande: die echte Wortmarke

Auf dem Fassadenfoto (`photos_1_78.jpg`) ist der Ladenschriftzug zu sehen:
**„Waßmann" als goldener, handgeschriebener Schwungzug.** Der existiert also längst am
Haus. Das Cormorant-Kursiv des Markenpakets ist eine gute Interpretation — aber die
echte Wortmarke gehört abfotografiert und vektorisiert. Dann ist sie die Wortmarke,
und sie ist nicht erfunden, sondern gefunden.

---

## Fassung 4 — CD-Korrekturen 16.07.2026, zweite Runde

**Zum Video, ehrlich:** Ich habe keins erstellt. Ich hatte nur Prompts geschrieben,
damit der CD selbst generiert. Das war ein Missverständnis meinerseits.

**Für die Zeichen-Animation braucht es aber gar kein Video.** Sie braucht Vektoren.
Also gebaut: `05_Bilder/vektorisieren.py` macht aus den Gemini-Zeichnungen echte
SVG-Pfade (Schwelle → OpenCV-Konturen → Douglas-Peucker → SVG).

| Zeichnung | Pfade | Größe |
|---|---|---|
| Fassade | 185 | 29 KB |
| Innenraum | 386 | 57 KB |
| Alster | 621 | 72 KB |

Jeder Pfad bekommt `pathLength="1"` (dann rechnet CSS mit 0..1 statt echten Längen)
und einen `--i`-Index. Die Pfade sind nach Länge sortiert: lange Konturen zuerst,
also erst das Haus, dann die Details. Die Animation läuft scroll-getrieben über
`animation-range: entry calc(4% + var(--i) * 0.28%) ...`. Kein JavaScript, kein Video.

**Das ist besser als ein Video:** scharf in jeder Größe, 29 KB statt einiger MB,
scrollgesteuert statt abgespielt, und es respektiert `prefers-reduced-motion`.

**Weiteres**
- Schwarzweiß-Hover über den Porträts wieder raus, normale Farbbilder
- Zeichnungstyp zurück auf die Feder-Fassung (Z04/Z05), die neueste Runde verworfen
- Alle Zeichnungen sind transparente PNGs, kein Filter, keine Umfärbung.
  Auf dunklem Grund wird die Tinte hell statt golden, sonst sticht sie heraus.
- Alster liegt **im** Fuß als Grund über die volle Breite, `position:absolute`,
  macht ihn also nicht höher. Eigener Mobil-Ausschnitt.
- Hero-Zeichnung auf zwei Drittel der Breite
- Werkstattfoto unter dem Hero raus, Innenzeichnung rein
- Öffnungszeiten: **eine** Regel für Kontakt und Fuß. Vorher stand neben dem Kontakt
  Mono in Versalien und im Fuß Fließtext, zwei Schriftbilder für dieselbe Information.
- Name „Waßmann" neben dem Fuß-Siegel
- Vitrinen-Satz: Wort für Wort statt ganzem Satz, 14 Wörter, je 3,2 % versetzt

**Gedankenstriche:** 110 gefunden, 84 im Fließtext einzeln umgeschrieben.
Jetzt null. Das war eine vereinbarte Regel, an die ich mich nicht gehalten hatte.

## Weiterhin offen

- Service-Bilder nicht ausgetauscht
- Trauringe: Paar und Hände (vom CD als Feinschliff eingeordnet)
- Innen- und Alster-Zeichnung sind vektorisiert, aber noch nicht animiert
  (nur die Fassade im Hero)
- Formular ohne Backend, Datenschutz als Faktensammlung
