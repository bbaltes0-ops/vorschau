# Eigener Motor: Die Anprobe-KI auf eigenem Server

Bernds Vorgabe: kein gemieteter Motor pro Bild, sondern das eigene Fahrzeug
mit eigenem Motor. Dieses Verzeichnis ist genau das.

## Was der eigene Motor ist

**FASHN VTON v1.5** ist ein frei veroeffentlichtes Anprobe-Modell unter
**Apache-2.0-Lizenz** (kommerzielle Nutzung ausdruecklich erlaubt, Quelle:
github.com/fashn-AI/fashn-vton-1.5). Die Modell-Gewichte (~2 GB) werden
einmal heruntergeladen und liegen danach auf UNSEREM Server. Niemand
kassiert pro Bild mit, keine Kundendaten gehen an Google oder sonstwen.
Fotorealistisch, funktioniert auch mit flach fotografierten Artikeln
(genau unser Haendler-Fall). Kategorien: Oberteile, Unterteile, Kleider.

Klare Ansage zur Grenze: Fuer die LIVE-Anprobe (30 Bilder pro Sekunde im
Kamerabild) gibt es Stand August 2026 KEIN frei nutzbares Modell, das man
selbst betreiben koennte - das koennen nur die grossen Anbieter auf ihren
Rechenzentren. Eigener Motor heisst deshalb zunaechst: Foto-Anprobe komplett
selbst. Fuer bewegte Anprobe gibt es ViViD (Apache-2.0, Video-Anprobe als
Verarbeitung, nicht live) als spaeteren Ausbauschritt: Kurze Anprobe-Videos
aus einem Kundenvideo, auf eigenem Server gerechnet.

## Was der Motor zum Laufen braucht: einen Grafikserver

Das Modell rechnet auf einer Grafikkarte (GPU, ab ~16 GB Speicher, besser 24).
Drei Wege, alle in Bernds Besitz-Logik (das Modell gehoert uns, die Frage
ist nur, wo das Blech steht):

| Weg | Kosten | Charakter |
|---|---|---|
| Eigene Hardware kaufen (PC mit RTX 4090, 24 GB) | ca. 2.500 EUR einmalig + Strom | Steht im Laden/Buero, gehoert komplett dir |
| Gemieteter GPU-Server monatlich (z. B. Hetzner GEX-Reihe) | ca. 200 EUR/Monat fest | Wie der Strato-VPS, nur mit Grafikkarte; unbegrenzte Anproben, feste Kosten |
| GPU nach Bedarf (RunPod u. ae.) | ca. 0,40-0,70 EUR/Stunde nur bei Nutzung | Zum Testen ideal, spaeter Wechsel auf fest |

Rechenzeit pro Anprobe: grob 5-10 Sekunden auf einer RTX 4090.

## Aufbau (auf dem Grafikserver, einmalig)

```bash
git clone https://github.com/fashn-AI/fashn-vton-1.5.git
cd fashn-vton-1.5
pip install -e .
python scripts/download_weights.py           # laedt die ~2 GB Gewichte
# Motor-Server aus unserem Repo dazulegen:
#   anprobe/backend/eigener-motor/motor_server.py
python3 motor_server.py --weights ./weights --port 8821
```

Dann auf dem Strato-VPS in /etc/anprobe-api.env eine Zeile ergaenzen und
den Dienst neu starten:

```
OWN_ENGINE_URL=http://<adresse-des-grafikservers>:8821/generate
```

Ab dem Moment laufen ALLE Anproben ueber den eigenen Motor - die App und
alle Links bleiben unveraendert, Google wird nicht mehr angefragt.
(Der Grafikserver sollte nur vom VPS erreichbar sein: einfachster Weg ist
ein SSH-Tunnel vom VPS zum Grafikserver oder eine Firewall-Freigabe nur
fuer die VPS-Adresse 31.70.107.0.)

## Status und naechster Schritt

- motor_server.py liegt bereit (Entwurf, beim ersten Start auf echter
  GPU gemeinsam testen).
- Die Weiche im VPS-Backend (OWN_ENGINE_URL) ist eingebaut.
- ENTSCHEIDUNG BERND: welcher der drei Grafikserver-Wege. Danach richte
  ich alles ein und teste die Qualitaet gegen die bisherigen Ergebnisse
  mit echten DvS-Artikeln.
