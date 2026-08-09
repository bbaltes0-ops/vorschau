# VERTRIEB — Digitale Anprobe (intern, für Bernd)

Stand: 09.08.2026. Internes Arbeitsdokument, nicht für Kunden.
Verkaufsseite: `verkauf.html` · Demos: `index.html` (Kunde), `haendler.html` (Cockpit), `widget/demo-shop.html` (Widget).

---

## 1. Preislogik und Marge

### Kostenseite

Die variable Hauptkosten-Position ist der Gemini-Bildaufruf pro Anprobe.
Größenordnung (Stand 2026, je nach Modell):

| Posten | Kosten pro Anprobe |
|---|---|
| gemini-2.5-flash-image (Standard) | ca. 2–4 Cent |
| gemini-3-pro-image (beste Qualität) | ca. 10–15 Cent |
| Hosting/Proxy (Cloudflare Worker) | vernachlässigbar (Free/5-USD-Tier) |

Kalkulationsbasis konservativ: **5 Cent pro Anprobe** (Mischung aus Flash-Standard, gelegentlich Pro, plus Wiederholungen/Fehlversuche).

### Beispielrechnung: Händler im Laden-Paket, 200 Anproben/Monat

```
Umsatz            29,00 EUR
KI-Kosten         200 x 0,05 EUR   = 10,00 EUR
Hosting/Proxy                       ~ 0,50 EUR
------------------------------------------------
Rohertrag         18,50 EUR  (~64 % Marge)
```

Realistisch liegt ein kleiner Laden eher bei 30–80 Anproben/Monat
(dann 25–27 EUR Rohertrag, Marge >85 %). 200/Monat ist bereits ein sehr
aktiver Händler — selbst dann trägt sich das Paket klar.

Beim Shop-Paket (79 EUR) sind auch 500+ Anproben/Monat unproblematisch
(500 x 0,05 = 25 EUR Kosten, 54 EUR Rohertrag).

### Leitplanken

- **Fair-Use statt Kontingent kommunizieren.** "Unbegrenzte Anproben" verkauft
  sich besser als "500 inklusive". Absicherung intern: ab ~1.500 Anproben/Monat
  (75 EUR Kosten im 29-EUR-Paket) Gespräch suchen, nicht abschalten.
- **Pro-Modell nur wo nötig.** Standard-Route Flash; Pro-Modell als Qualitäts-
  Fallback oder späteres Premium-Merkmal.
- **Keine Rabatte im Erstgespräch.** Der 0-EUR-Test IST das Entgegenkommen.
  Wer nach 14 Tagen zögert, hat ein Nutzenproblem, kein Preisproblem.
- Preise zzgl. USt., monatlich kündbar — beides aktiv aussprechen, es baut
  Kaufangst ab.

---

## 2. Pitches (wörtlich, zum Auswendiglernen)

### 30-Sekunden-Pitch

> "Sie kennen das: Eine Stammkundin war Dienstag da, Mittwoch kommt die neue
> Ware rein — und Sie wissen genau, das eine Kleid wäre was für sie.
> Mit unserer digitalen Anprobe fotografieren Sie das Kleid mit dem Handy und
> schicken ihr einen WhatsApp-Link. Sie macht ein Foto von sich und sieht in
> zehn Sekunden, wie das Kleid an ihr aussieht — an ihr, nicht am Model.
> Gefällt es ihr, tippt sie auf Bestellen, und die Nachricht landet bei Ihnen
> im WhatsApp. Keine App, kein Shopsystem, nichts zu installieren.
> 14 Tage kostenlos, danach 29 Euro im Monat, monatlich kündbar.
> Soll ich es Ihnen einmal an einem Teil aus Ihrem Laden zeigen? Dauert
> zwei Minuten."

### 2-Minuten-Pitch

> "Darf ich Ihnen kurz was zeigen? Zwei Minuten, versprochen.
>
> Ihr größter Vorteil gegenüber Zalando ist, dass Sie Ihre Kundinnen kennen.
> Sie wissen, wem was steht, wer welche Größe trägt, wer auf welche Farben
> anspringt. Was Ihnen fehlt, ist ein Weg, dieses Wissen auszuspielen, wenn
> die Kundin gerade NICHT im Laden steht. Genau da setzen wir an.
>
> Das Ganze funktioniert so: Sie fotografieren einen Artikel mit Ihrem Handy —
> auf dem Bügel, auf dem Tresen, ganz egal. Sie tippen Name, Preis und Größen
> ein. Daraus entsteht ein Link. Den schicken Sie per WhatsApp an die Kundin,
> von der Sie wissen: Das ist was für sie.
>
> Die Kundin öffnet den Link auf ihrem Handy, macht ein Foto von sich — und
> unsere KI zeigt ihr in ein paar Sekunden, wie der Artikel an ihr aussieht.
> Nicht am Model, nicht an einer Puppe: an ihr, mit ihrer Figur, ihrer
> Haltung, ihrem Stil. Das ist der Moment, in dem aus 'ganz nett' ein
> 'das will ich' wird.
>
> Und dann das Wichtigste: Unter dem Bild ist ein Bestell-Button. Ein Tipp
> darauf, und bei Ihnen kommt eine fertige WhatsApp-Nachricht an — Artikel,
> Größe, Name. Sie legen das Teil zurück oder schicken es raus. Der ganze
> Verkauf läuft über den Kanal, den Sie sowieso schon nutzen.
>
> Was Sie dafür brauchen: Ihr Smartphone. Kein neues Gerät, keine Software,
> kein Techniker. Wenn Sie einen Onlineshop haben, gibt es zusätzlich ein
> Widget — eine Zeile Code, und Ihre Shop-Besucher können direkt auf der
> Produktseite anprobieren.
>
> Kostenpunkt: 14 Tage kostenlos mit allem drin. Danach 29 Euro im Monat für
> den Laden, 79 mit Shop-Widget. Monatlich kündbar, keine Einrichtungsgebühr.
>
> Am einfachsten ist: Wir nehmen jetzt ein Teil aus Ihrem Sortiment, ich
> zeige es Ihnen an Ihrem eigenen Handy. Welches Teil verkauft sich gerade
> am besten?"

---

## 3. Einwandbehandlung

### "Meine Kunden sind nicht digital."

> "Ihre Kunden schreiben WhatsApp — das ist die ganze Technik, die sie
> brauchen. Es gibt keine App, kein Konto, kein Passwort. Link antippen,
> Foto machen, fertig. Das schafft jede Kundin, die Ihnen Fotos von ihren
> Enkeln schickt."

Zusatz, falls nötig: Der Händler selbst muss auch nichts installieren —
Cockpit im Browser, wie eine normale Webseite. Beste Antwort ist die Demo
am eigenen Handy des Händlers.

### "Sieht KI nicht komisch aus?"

> "Am besten beurteilen Sie das nicht auf mein Wort hin — machen Sie jetzt
> ein Foto von sich und probieren Sie ein Teil aus Ihrem Laden an. Dann sehen
> Sie genau das, was Ihre Kundin sieht."

Ehrlich bleiben: Es ist eine Visualisierung, keine Passform-Garantie, und
das steht auch unter jedem Ergebnis. Der Punkt ist nicht Perfektion, sondern:
Die Kundin sieht Farbe, Schnitt und Wirkung an sich selbst statt am Model.
Nie behaupten, es sei "wie echt" — das rächt sich beim ersten schwachen
Ergebnis.

### "Dafür habe ich keine Zeit."

> "Der Zeitaufwand pro Artikel ist ein Foto und zwei Zeilen Text — unter
> einer Minute. Und die Anprobe selbst macht die Kundin, nicht Sie.
> Verglichen damit, was Sie heute tun, wenn Sie einer Kundin neue Ware
> zeigen wollen — anrufen, beschreiben, auf den nächsten Besuch hoffen —
> SPART das Zeit."

Onboarding-Versprechen konkret machen: "Die Einrichtung übernehme ich,
30 Minuten, bei Ihnen im Laden. Danach können Sie es allein."

### "Was, wenn es dann doch nicht passt?"

> "Genau wie heute: Die Kundin probiert es real an, bevor sie es behält —
> im Laden oder daheim. Die digitale Anprobe ersetzt nicht die Umkleide,
> sie ersetzt den Moment davor: die Entscheidung 'Interessiert mich das
> überhaupt?'. Sie sortiert die Nein-Kandidaten aus, bevor jemand den Weg
> in den Laden macht. Was bei Ihnen ankommt, sind die Kundinnen, die das
> Teil schon an sich gesehen haben und es wollen."

Retouren-Winkel für Shop-Händler: Wer vorher an sich selbst gesehen hat,
wie das Teil wirkt, bestellt gezielter. (Keine Retourenquoten-Versprechen
machen — wir haben noch keine Zahlen.)

### "Zu teuer."

> "29 Euro sind ungefähr eine verkaufte Bluse im Monat — vor Marge gerechnet.
> Wenn Ihnen die Anprobe einen einzigen Zusatzverkauf im Monat bringt, hat
> sie sich bezahlt. Und ob sie das tut, müssen Sie mir nicht glauben:
> 14 Tage kostenlos, alle Funktionen, endet automatisch. Sie riskieren
> exakt nichts."

Nicht rabattieren. Wenn der Preis wirklich das Thema ist, den Test
verlängern statt den Preis senken.

---

## 4. Onboarding-Checkliste: erster Händler (30 Minuten)

Vorbereitung (vorher, ohne den Händler):
- [ ] Testzugang/Cockpit-Link bereit, auf eigenem Handy einmal durchgespielt
- [ ] Eigenes Demo-Ergebnisbild auf dem Handy (falls WLAN/Netz im Laden schwach)

Vor Ort:
- [ ] **Min. 0–5:** Cockpit (`haendler.html`) auf dem Händler-Handy öffnen,
      als Lesezeichen/Home-Icon ablegen
- [ ] **Min. 5–10:** Ersten Artikel GEMEINSAM anlegen: Händler fotografiert
      selbst (Bügel, ruhiger Hintergrund), Name/Preis/Größen eintippen
- [ ] **Min. 10–15:** Händler schickt sich den Link selbst per WhatsApp und
      macht die Anprobe mit dem eigenen Foto durch — der Aha-Moment gehört ihm
- [ ] **Min. 15–20:** Test-Bestellung auslösen: zeigen, wie die Bestell-
      Nachricht bei ihm im WhatsApp ankommt und was er dann tut
- [ ] **Min. 20–25:** QR-Code erzeugen, ausdrucken oder aufs Tablet — Platz
      am Tresen festlegen. Zweiten und dritten Artikel anlegt der Händler
      allein (nur zuschauen, nicht eingreifen)
- [ ] **Min. 25–30:** Erste echte Aktion vereinbaren: "Welchen 3 Kundinnen
      schicken Sie diese Woche welchen Artikel?" — konkret, mit Namen.
      Folgetermin/Check-in in 7 Tagen festhalten

Nach dem Termin:
- [ ] Kurze WhatsApp mit Cockpit-Link + "bei Fragen einfach hier antworten"
- [ ] Nach 7 Tagen nachfassen: Wie viele Links verschickt? Was kam zurück?

---

## 5. Akquise-Nachrichten (WhatsApp / Instagram-DM)

**Vorlage 1 — Laden, kalt (nach Ladenbesuch oder Instagram-Fund):**

> Hallo [Name], ich bin Bernd von Black Rabbit Studio aus [Ort]. Ich habe
> ein Werkzeug gebaut, mit dem Sie Ihren Stammkundinnen neue Ware per
> WhatsApp schicken — und die Kundin sieht auf einem Foto von sich selbst,
> wie das Teil an ihr aussieht. Bestellung kommt direkt als WhatsApp zurück.
> Darf ich es Ihnen an einem Artikel aus Ihrem Sortiment zeigen? Dauert
> 2 Minuten, hier ist die Demo: [Link]

**Vorlage 2 — Onlineshop-Betreiber:**

> Hallo [Name], Ihr Shop [Shopname] gefällt mir. Eine Frage: Ihre Kunden
> sehen Ihre Ware am Model — würden Sie ihnen zeigen wollen, wie sie an
> ihnen selbst aussieht? Wir haben ein Anprobe-Widget, das mit einer Zeile
> Code auf Ihrer Produktseite läuft. Hier können Sie es in einem Demo-Shop
> selbst testen: [Link]. Wenn es Sie überzeugt: 14 Tage kostenlos im
> eigenen Shop.

**Vorlage 3 — Nachfassen nach Erstkontakt ohne Antwort (nach ~5 Tagen):**

> Hallo [Name], kurzes Nachfassen zu meiner Nachricht neulich. Ich habe
> die Anprobe testweise mit einem Artikel gemacht, wie Sie ihn führen —
> das Ergebnis hängt an. So sähe das für Ihre Kundinnen aus. Wenn Sie es
> einmal mit echter Ware aus Ihrem Laden sehen wollen: Ich richte Ihnen
> den kostenlosen Test in 30 Minuten ein, ich komme dafür vorbei.

Regeln für alle Nachrichten: kein "Sehr geehrte/r", kein "innovativ",
keine Ausrufezeichen-Ketten, immer ein konkreter nächster Schritt,
immer ein anfassbarer Link oder ein Bild.

---

## 6. Nächste Ausbaustufen (mit Verkaufsargument)

| Stufe | Was es ist | Verkaufsargument |
|---|---|---|
| **Kurzlinks/QR live** | Kurze, stabile Links (`brs.link/abc`) statt langer #-URLs; QR-Codes, die auch nach Artikeländerung funktionieren | "Der QR-Code am Tresen bleibt derselbe, auch wenn Sie die Ware wechseln — einmal drucken, immer aktuell." Öffnet außerdem Etiketten, Schaufenster-Aufkleber, Beileger im Paket. |
| **Bezahllink** | Nach der Anprobe direkt bezahlen (z. B. PayPal/Stripe-Link in der Bestellnachricht) | "Aus 'gefällt mir' wird 'gekauft', bevor die Kundin es sich anders überlegt — nachts um zehn, wenn Ihr Laden zu ist." Rechtfertigt zudem eine höhere Paketstufe oder eine kleine Transaktionsgebühr. |
| **White-Label** | Anprobe komplett im Look des Händlers: Logo, Farben, eigene Domain | "Ihre Kundin sieht IHR Geschäft, nicht unsere Marke — die Anprobe wirkt wie Ihr eigener Service." Argument für größere Händler und Agenturen; preislich eigene Stufe oberhalb von Shop (79 EUR). |

Reihenfolge-Empfehlung: erst Kurzlinks/QR (macht den Laden-Alltag rund und
ist Voraussetzung für gedruckte Materialien), dann Bezahllink (Umsatzhebel),
dann White-Label (skaliert auf größere Kunden und Wiederverkäufer).
