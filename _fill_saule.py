import os

V = os.path.dirname(os.path.abspath(__file__))
dirs = ["saule-a", "saule-b", "saule-c"]

# --- Fact corrections (applied BEFORE token fill) ---
fact_subs = [
    ("Notdienst 24/7", "Kundendienst"),
    ("Notdienst auch Sa/So &amp; Feiertag", "Wartung &amp; Reparatur"),
    ("ein schneller Notdienst rund um die Uhr — auch an Wochenenden und Feiertagen",
     "ein zuverlässiger Kundendienst, wenn einmal etwas ausfällt"),
    ("Unser Notdienst ist rund um die Uhr für Sie da — auch samstags, sonntags und an Feiertagen.",
     "Unser Kundendienst hilft schnell, wenn einmal etwas ausfällt."),
    ("Heizung defekt? Rohrbruch? Wir kommen.", "Heizung defekt? Rohrbruch? Rufen Sie uns an."),
    ("Notdienst auch Sa/So", "Termin nach Absprache"),
    ("24/7", "Service"),
    ("zum schnellen Notdienst", "zum zuverlässigen Kundendienst"),
    ("schneller Notdienst", "schneller Kundendienst"),
    ("Notdienst &amp; Reparatur", "Kundendienst &amp; Reparatur"),
    ("Wartung &amp; Notdienst", "Wartung &amp; Kundendienst"),
    ("Notdienst bei Störungen", "Kundendienst bei Störungen"),
    ("Notdienst bei Störung", "Hilfe bei Störung"),
    ("Notdienst<br>bei Störungen", "Kundendienst<br>bei Störungen"),
    ("Klima · Notdienst", "Klima · Spenglerei"),
    ("Heizung · Bad · Klima · Notdienst", "Sanitär · Heizung · Bauspenglerei"),
    ("Notdienst: {{MOBIL}}", "Kundendienst: {{MOBIL}}"),
    (">Notdienst<", ">Kundendienst<"),
    ("Notdienst</a>", "Kundendienst</a>"),
    ("schnelle Hilfe im Notfall", "zuverlässige Hilfe bei Störungen"),
    ("Störung oder Notfall? Einfach", "Störung? Einfach"),
    # Meisterbetrieb -> verified Familienbetrieb / Fachbetrieb
    ("SHK-Meisterbetrieb", "SHK-Fachbetrieb"),
    ("Eingetragener Meisterbetrieb", "Familienbetrieb seit 1977"),
    ("eingetragener Meisterbetrieb", "Familienbetrieb seit 1977"),
    ("Meisterbetrieb · {{ORT}}", "Familienbetrieb · {{ORT}}"),
    ("Als Meisterbetrieb", "Als eingespielter Familienbetrieb"),
    ("von Ihrem Meisterbetrieb", "von Ihrem Familienbetrieb"),
    ("Ihrem Meisterbetrieb", "Ihrem Familienbetrieb"),
    ("Ihr Meisterbetrieb", "Ihr Familienbetrieb"),
    ("Alles aus einer Meisterhand", "Alles aus einer Hand"),
    ("Mitglied im Fachverband SHK", "Familienbetrieb seit 1977"),
    (">Meisterbetrieb<", ">Familienbetrieb<"),
    ('"badge">Meisterbetrieb', '"badge">Familienbetrieb'),
    ("Meisterbetrieb für Sanitär", "Familienbetrieb für Sanitär"),
    ("Meisterbetrieb für Heizungsbau", "Familienbetrieb für Heizungsbau"),
    ("Qualität mit Brief und Siegel", "Familiengeführt in 2. Generation"),
    ("aus einer Meisterhand", "aus einer Hand"),
]

tokens = {
    "{{FIRMA}}": "Georg Saule GmbH",
    "{{SLOGAN}}": "Sanitär, Heizung und Bauspenglerei aus einer Hand.",
    "{{ORT}}": "Augsburg",
    "{{TEL}}": "+49 821 451524",
    "{{TEL_HREF}}": "+49821451524",
    "{{MOBIL}}": "+49 821 451524",
    "{{ANSPRECH}}": "das Team der Georg Saule GmbH",
    "{{ADRESSE}}": "Holzweg 22 a, 86156 Augsburg",
    "{{EMAIL}}": "info@georgsaulegmbh.de",
    "{{WEBURL}}": "https://www.saule-shk.de",
    "{{KUNDENNR}}": "AK-1026",
    "{{REF}}": "AK-1026",
    "{{PRAES_URL}}": "https://vorschau.black-rabbit.studio/praesentation-saule/",
}

for d in dirs:
    base = os.path.join(V, d)
    for fn in os.listdir(base):
        if not fn.endswith(".html"):
            continue
        p = os.path.join(base, fn)
        with open(p, encoding="utf-8") as f:
            t = f.read()
        for a, b in fact_subs:
            t = t.replace(a, b)
        for k, val in tokens.items():
            t = t.replace(k, val)
        with open(p, "w", encoding="utf-8") as f:
            f.write(t)
        print("filled", d, fn)
print("DONE")
