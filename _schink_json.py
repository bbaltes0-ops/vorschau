import json
data = {
    "slug": "schink",
    "firma": "elektro.schink",
    "ort": "München",
    "branche": "Elektro-Meisterbetrieb",
    "sub": "Elektroinstallation, KNX Smart Home, Photovoltaik & Speicher, Beleuchtung, E-Mobilität/Wallbox und Kundendienst aus einer Hand.",
    "ansprech": "das Team von elektro.schink",
    "adresse": "München",
    "tel": "+49 171 5455909",
    "tel_href": "+491715455909",
    "email": "",
    "weburl": "",
    "kundennr": "AK-1054",
    "ref": "AK-1054",
    "emword": "Ihre Arbeit.",
    "strengthShort": "5,0★ aus 21 Bewertungen",
    "strengthLine": "21 Top-Bewertungen mit glatten 5,0 Sternen — die Kunden sind begeistert, online ist der Betrieb bisher aber unsichtbar: kein eigener Webauftritt, auf dem diese Stärke für Neukunden sichtbar wird.",
    "livedesc": "Klare Leistungen, Anruf mit einem Tipp, die 5,0★-Bewertungen prominent sichtbar — am Handy wie am PC.",
    "weakKind": "ohne-website",
    "note": "1 Live + 2 Design-Mockups",
}
with open("/sessions/trusting-determined-wozniak/mnt/outputs/schink.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("written")
