import os, re

V = os.path.dirname(os.path.abspath(__file__))
dirs = ["schink-a", "schink-b", "schink-c"]

TEL      = "+49 171 5455909"
TEL_HREF = "+491715455909"

tokens = {
    "{{FIRMA}}": "elektro.schink",
    "{{SLOGAN}}": "Elektroinstallation, Smart Home und Photovoltaik aus einer Hand.",
    "{{ORT}}": "München",
    "{{TEL}}": TEL,
    "{{TEL_HREF}}": TEL_HREF,
    "{{MOBIL}}": TEL,
    "{{ANSPRECH}}": "das Team von elektro.schink",
    "{{ADRESSE}}": "München",
    "{{KUNDENNR}}": "AK-1054",
    "{{REF}}": "AK-1054",
    "{{PRAES_URL}}": "https://bbaltes0-ops.github.io/vorschau/praesentation-schink/",
}

# Phrasing fixes for ANSPRECH = "das Team von elektro.schink" (run before token fill)
phrase_subs = [
    # C kontakt: avoid "das Team ... und das Team von ..." + lowercase after period
    ("vorbei. {{ANSPRECH}} und das Team von {{FIRMA}} helfen Ihnen gern weiter.",
     "vorbei — {{ANSPRECH}} hilft Ihnen gern weiter."),
    # C ueber badge
    ("{{ANSPRECH}} &amp; Team", "{{ANSPRECH}}"),
    # B ueber-uns (sentence-initial -> capitalize "Das")
    ("<p>Ihr Ansprechpartner {{ANSPRECH}} und das Team begleiten Sie",
     "<p>Das Team von {{FIRMA}} begleitet Sie"),
    # B index strength line
    ("{{ANSPRECH}} und das Team sind vom ersten Anruf bis zur Abnahme für Sie da.",
     "{{ANSPRECH}} ist vom ersten Anruf bis zur Abnahme für Sie da."),
]

def strip_email_web(t):
    # --- Design A (elektro) & generic ---
    # E-Mail info-row (envelope icon) -> remove entirely (no email on file)
    t = re.sub(
        r'\s*<div class="info-row">\s*<svg viewBox="0 0 24 24"[^>]*>'
        r'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>\s*'
        r'<div><span class="lbl">E-Mail</span><br><a href="mailto:\{\{EMAIL\}\}">\{\{EMAIL\}\}</a></div>\s*</div>',
        '', t, flags=re.S)
    t = re.sub(
        r'\s*<div class="info-row">\s*<svg viewBox="0 0 24 24"[^>]*>'
        r'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/></svg>\s*'
        r'<div><span class="lbl">Web</span><br><a href="https://\{\{WEBURL\}\}">\{\{WEBURL\}\}</a></div>\s*</div>',
        '', t, flags=re.S)

    # --- Design B (elektro-b) ---
    # Contact-card "Mobil" anchor block -> remove (number is already shown as Telefon; single mobile line)
    t = re.sub(
        r'\s*<a href="tel:\{\{MOBIL\}\}">\s*<span class="ic">MOB</span>\s*'
        r'<span><span class="lbl">Mobil</span><br><span class="val">\{\{MOBIL\}\}</span></span>\s*</a>',
        '', t, flags=re.S)
    # Contact-card E-Mail anchor block (3 lines) -> remove (no email)
    t = re.sub(
        r'\s*<a href="mailto:\{\{EMAIL\}\}">\s*<span class="ic">@</span>\s*'
        r'<span><span class="lbl">E-Mail</span><br><span class="val">\{\{EMAIL\}\}</span></span>\s*</a>',
        '', t, flags=re.S)
    # Footer-style email line -> drop
    t = re.sub(r'\s*<a href="mailto:\{\{EMAIL\}\}">\{\{EMAIL\}\}</a>', '', t)
    # leistungen/ueber footer-ish email (same pattern handled above)
    t = re.sub(r'\s*<span>\{\{WEBURL\}\}</span>', '', t)
    t = re.sub(r'\s*<div class="info-row"><span>Web</span><b>\{\{WEBURL\}\}</b></div>', '', t)

    # --- Design C (elektro-c) ---
    # Telefon block: drop redundant single-mobile "Mobil:" line
    t = t.replace('<a href="tel:{{TEL_HREF}}">{{TEL}}</a><br><span>Mobil: {{MOBIL}}</span>',
                  '<a href="tel:{{TEL_HREF}}">{{TEL}}</a>')
    # E-Mail info ".it" block -> remove entirely (envelope icon; anchor may already be stripped)
    t = re.sub(
        r'\s*<div class="it">\s*<svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z"/>'
        r'<path d="M4 7l8 6 8-6"/></svg>\s*'
        r'<div><b>E-Mail</b>(?:<a href="mailto:\{\{EMAIL\}\}">\{\{EMAIL\}\}</a>)?</div>\s*</div>',
        '', t, flags=re.S)
    # CTA rows: drop the secondary mailto button so a single clean "Anrufen" remains
    t = re.sub(r'\s*<a href="mailto:\{\{EMAIL\}\}" class="btn btn-line">E-Mail schreiben</a>', '', t)
    t = re.sub(r'\s*<a href="mailto:\{\{EMAIL\}\}" class="btn btn-line">E-Mail</a>', '', t)
    t = t.replace('<br>{{WEBURL}} · Mo–Fr', '<br>Mo–Fr')

    # meta description email mentions
    t = t.replace('Telefon {{TEL}}, {{EMAIL}}.', 'Telefon {{TEL}}.')
    t = t.replace('Telefon {{TEL}}, E-Mail {{EMAIL}}.', 'Telefon {{TEL}}.')
    return t

def inject_rating(t, d):
    # Design A: convert first trust-item to a star rating
    t = t.replace(
        '<div class="trust-item">\n'
        '      <span class="num">Meister</span>\n'
        '      <span class="lbl"><strong>Eingetragener Meisterbetrieb</strong>geprüfte Qualität</span>\n'
        '    </div>',
        '<div class="trust-item">\n'
        '      <span class="num">5,0&#9733;</span>\n'
        '      <span class="lbl"><strong>21 Google-Bewertungen</strong>von zufriedenen Kunden</span>\n'
        '    </div>')
    return t

for d in dirs:
    base = os.path.join(V, d)
    for fn in os.listdir(base):
        if not fn.endswith(".html"):
            continue
        p = os.path.join(base, fn)
        with open(p, encoding="utf-8") as f:
            t = f.read()
        for a, b in phrase_subs:
            t = t.replace(a, b)
        t = strip_email_web(t)
        if fn == "index.html":
            t = inject_rating(t, d)
        for k, val in tokens.items():
            t = t.replace(k, val)
        with open(p, "w", encoding="utf-8") as f:
            f.write(t)
        print("filled", d, fn)
print("DONE")
