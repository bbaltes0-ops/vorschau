# -*- coding: utf-8 -*-
import re, glob, os
BASE = "/sessions/trusting-determined-wozniak/mnt/Webseiten/vorschau"

def clean(html):
    # Fix bad mobil tel href that used display value
    html = html.replace('href="tel:02361 8489262"', 'href="tel:+4923618489262"')
    # Remove fake fax line (variant c)
    html = re.sub(r'<br><span>Fax: 02043 205354</span>', '', html)
    html = html.replace('Fax: 02043 205354', '')
    # variant b: remove the empty E-Mail anchor block inside .info-big
    html = re.sub(
        r'\s*<a href="mailto:">\s*<span class="ic">@</span>\s*<span><span class="lbl">E-Mail</span><br><span class="val"></span></span>\s*</a>',
        '', html, flags=re.S)
    # variant c: remove the empty E-Mail .it block
    html = re.sub(
        r'\s*<div class="it">\s*<svg[^>]*><path[^>]*/><path[^>]*/></svg>\s*<div><b>E-Mail</b><a href="mailto:"></a></div>\s*</div>',
        '', html, flags=re.S)
    # generic: any remaining empty mailto -> tel
    html = html.replace('href="mailto:"', 'href="tel:+4923618489262"')
    return html

for v in ("b", "c"):
    for fp in glob.glob(os.path.join(BASE, f"bozkurt-{v}", "*.html")):
        with open(fp, encoding="utf-8") as f:
            h = f.read()
        h2 = clean(h)
        if h2 != h:
            with open(fp, "w", encoding="utf-8") as f:
                f.write(h2)
            print("cleaned", os.path.basename(fp), v)
print("DONE")
