# -*- coding: utf-8 -*-
import re, glob, os

BASE = "/sessions/trusting-determined-wozniak/mnt/Webseiten/vorschau"

# Common literal replacements (benarafa -> bozkurt)
COMMON = [
    # firm name
    ("Fachpraxis für Podologie", "Praxis für Podologie Gülcan Bozkurt"),
    # ort
    ("Gladbeck", "Recklinghausen"),
    # address (full, then any residual short form)
    ("Bülser Str. 109, 45964 Recklinghausen", "Hochlarmarkstraße 122, 45661 Recklinghausen"),
    ("Bülser Str. 109, 45964 Gladbeck", "Hochlarmarkstraße 122, 45661 Recklinghausen"),
    # ansprechpartner
    ("Gisela Optatzy", "Gülcan Bozkurt"),
    # phone tel href
    ('tel:+49204321169', 'tel:+4923618489262'),
    ('tel:023618489262', 'tel:+4923618489262'),
    # phone display
    ("02043 21169", "02361 8489262"),
    # kundennr / ref
    ("AK-1043", "AK-1065"),
    # praesentation url slug
    ("praesentation-podologie-benarafa", "praesentation-bozkurt"),
    # email in meta descriptions etc.
    ("fuss-praxis@mail.de", ""),
    ("podologie-gladbeck.de", ""),
]

def strip_email_web_rows(html):
    # Remove the E-Mail info-row (beauty / variant a style)
    html = re.sub(
        r'\s*<div class="info-row">\s*<svg[^>]*>.*?</svg>\s*<div><span class="lbl">E-Mail</span>.*?</div>\s*</div>',
        '', html, flags=re.S)
    # Remove the Web info-row
    html = re.sub(
        r'\s*<div class="info-row">\s*<svg[^>]*>.*?</svg>\s*<div><span class="lbl">Web</span>.*?</div>\s*</div>',
        '', html, flags=re.S)
    # Generic leftover simple rows  <div><span class="lbl">E-Mail</span>...</div>
    html = re.sub(r'\s*<div><span class="lbl">E-Mail</span>.*?</div>', '', html, flags=re.S)
    html = re.sub(r'\s*<div><span class="lbl">Web</span>.*?</div>', '', html, flags=re.S)
    # Any residual mailto -> tel (no email available)
    html = html.replace('mailto:fuss-praxis@mail.de', 'tel:+4923618489262')
    html = re.sub(r'href="https://"\s*>\s*</a>', '', html)
    # clean ", ." leftovers in meta from removed email
    html = html.replace(", .", ".").replace("Telefon 02361 8489262, .", "Telefon 02361 8489262.")
    html = html.replace("02361 8489262, .", "02361 8489262.")
    return html

def inject_rating_a(html):
    # variant a: turn first trust-item into a star rating item
    old = ('''    <div class="trust-item">
      <span class="num">Kassen</span>
      <span class="lbl"><strong>Alle Krankenkassen</strong>Behandlung auf Verordnung</span>
    </div>''')
    new = ('''    <div class="trust-item">
      <span class="num">5,0&#9733;</span>
      <span class="lbl"><strong>5,0 von 5 Sternen</strong>aus 25 Bewertungen</span>
    </div>
    <div class="trust-item">
      <span class="num">Kassen</span>
      <span class="lbl"><strong>Alle Krankenkassen</strong>Behandlung auf Verordnung</span>
    </div>''')
    return html.replace(old, new)

def inject_rating_b(html):
    # add rating into hero-meta and into hero-tag for prominence
    html = html.replace(
        '<div class="hero-meta">',
        '<div class="hero-meta">\n        <div class="item"><span class="k">Bewertung</span><span class="v">5,0&#9733; aus 25 Bewertungen</span></div>')
    # add a rating chip near the chips block
    html = html.replace(
        '<span class="chip">Hohe Hygiene</span>',
        '<span class="chip">5,0&#9733; aus 25 Bewertungen</span>\n        <span class="chip">Hohe Hygiene</span>')
    return html

def inject_rating_c(html):
    # variant c: replace first titlecard tc and first stat with rating
    html = html.replace(
        '<div class="tc"><b>Geschulte Hände</b><span>Ausgebildetes Fachteam</span></div>',
        '<div class="tc"><b>5,0&#9733;</b><span>aus 25 Bewertungen</span></div>')
    html = html.replace(
        '<div class="st"><b>Zeit</b><span>für jeden Termin</span></div>',
        '<div class="st"><b>5,0&#9733;</b><span>aus 25 Bewertungen</span></div>')
    return html

for v in ("a", "b", "c"):
    d = os.path.join(BASE, f"bozkurt-{v}")
    for fp in glob.glob(os.path.join(d, "*.html")):
        with open(fp, encoding="utf-8") as f:
            html = f.read()
        for a, b in COMMON:
            html = html.replace(a, b)
        html = strip_email_web_rows(html)
        with open(fp, "w", encoding="utf-8") as f:
            f.write(html)
    # rating injection on index only
    idx = os.path.join(d, "index.html")
    with open(idx, encoding="utf-8") as f:
        html = f.read()
    if v == "a":
        html = inject_rating_a(html)
    elif v == "b":
        html = inject_rating_b(html)
    else:
        html = inject_rating_c(html)
    with open(idx, "w", encoding="utf-8") as f:
        f.write(html)
    print("filled", v)

print("DONE")
