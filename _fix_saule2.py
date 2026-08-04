import os

V = os.path.dirname(os.path.abspath(__file__))
dirs = ["saule-a", "saule-b", "saule-c"]

# Second-pass corrections for subpage phrasings + artifacts.
subs = [
    # broken artifact from first pass
    ("Unser Notdienst ist Service für Sie erreichbar — auch samstags, sonntags und an Feiertagen.",
     "Unser Kundendienst hilft Ihnen schnell weiter, wenn einmal etwas ausfällt."),
    ("Service Notdienst", "Kundendienst"),
    # ueber-uns / kontakt / leistungen 24-7 + Meister phrasings
    ("ein Notdienst rund um die Uhr", "ein zuverlässiger Kundendienst"),
    ("Notdienst rund um die Uhr erreichen", "den Kundendienst erreichen"),
    ("Meisterbetrieb für Augsburg und die Region", "Familienbetrieb für Augsburg und die Region"),
    ("Handwerk mit Meisterbrief", "Handwerk aus zweiter Generation"),
    ("Handwerk auf Meisterniveau", "Handwerk mit Sorgfalt"),
    ("handwerklich auf Meisterniveau", "handwerklich sorgfältig"),
    ("Das volle SHK-Handwerk aus Meisterhand", "Das volle SHK-Handwerk aus einer Hand"),
    ('<b>Meister</b><span>Eingetragener SHK-Betrieb</span>',
     '<b>1977</b><span>Familienbetrieb seit Gründung</span>'),
    ("<b>Service</b><span>Notdienst, auch Sa/So</span>",
     "<b>Service</b><span>Wartung &amp; Reparatur</span>"),
    ("Mit unserem Notdienst sind wir rund um die Uhr erreichbar — auch am Wochenende und an Feiertagen.",
     "Wenn einmal etwas ausfällt, hilft unser Kundendienst schnell und zuverlässig weiter."),
    ("Im Notfall an Ihrer Seite", "Wenn schnell Hilfe nötig ist"),
    ("Unser Notdienst ist Service für Sie erreichbar", "Unser Kundendienst ist für Sie da"),
    ("Heizungsausfall, Rohrbruch oder defekte Armatur? Unser Notdienst ist für Sie da — auch samstags, sonntags und an Feiertagen.",
     "Heizungsausfall, Rohrbruch oder defekte Armatur? Rufen Sie uns an — wir kümmern uns schnell darum."),
    ("Es ist ein Notfall?", "Schnelle Hilfe nötig?"),
    ("erreichen Sie uns rund um die Uhr — auch am Wochenende und an Feiertagen.",
     "rufen Sie uns an — wir kümmern uns schnell darum."),
    ("sind wir rund um die Uhr für Sie da — auch samstags, sonntags und an Feiertagen.",
     "helfen wir Ihnen schnell und zuverlässig weiter."),
    ("In unserem Meisterbetrieb", "In unserem Familienbetrieb"),
    ("im modernen Meisterbetrieb in Augsburg", "im Familienbetrieb in Augsburg"),
    ("im Meisterbetrieb in Augsburg", "im Familienbetrieb in Augsburg"),
    ("Ein Meisterbetrieb in Augsburg", "Ein Familienbetrieb in Augsburg"),
    ("Meisterbetrieb mit geschultem Team", "Familienbetrieb mit geschultem Team"),
    ("Meisterbetrieb mit moderner Technik", "Familienbetrieb mit moderner Technik"),
    ("im modernen Meisterbetrieb", "im Familienbetrieb"),
    # remaining meta-description notdienst mentions
    ("sowie Wartung und Notdienst für Augsburg und die Region.",
     "sowie Wartung und Kundendienst für Augsburg und die Region."),
    ("Wartung &amp; Service, Notdienst und Energieberatung",
     "Wartung &amp; Service, Kundendienst und Bauspenglerei"),
    ("Klima &amp; Lüftung sowie Notdienst in Augsburg und Region.",
     "Klima &amp; Lüftung sowie Bauspenglerei in Augsburg und Region."),
    ("Wartung, Notdienst und Energieberatung aus einer Hand.",
     "Wartung, Kundendienst und Bauspenglerei aus einer Hand."),
    ("Wartung & Service, Notdienst und Energieberatung.",
     "Wartung & Service, Kundendienst und Bauspenglerei."),
    ("Beratung anfragen, Termin vereinbaren oder den Kundendienst erreichen.",
     "Beratung anfragen oder Termin vereinbaren."),
    # generic leftover label
    ("Ihr SHK-Fachbetrieb in Augsburg. Ehrliche Beratung, saubere Arbeit und ein zuverlässiger Kundendienst.",
     "Ihr SHK-Familienbetrieb in Augsburg. Ehrliche Beratung, saubere Arbeit und ein zuverlässiger Kundendienst."),
]

for d in dirs:
    base = os.path.join(V, d)
    for fn in os.listdir(base):
        if not fn.endswith(".html"):
            continue
        p = os.path.join(base, fn)
        with open(p, encoding="utf-8") as f:
            t = f.read()
        orig = t
        for a, b in subs:
            t = t.replace(a, b)
        if t != orig:
            with open(p, "w", encoding="utf-8") as f:
                f.write(t)
            print("fixed", d, fn)
print("DONE2")
