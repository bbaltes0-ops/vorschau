# -*- coding: utf-8 -*-
import os, glob, re

BASE = "/sessions/trusting-determined-wozniak/mnt/Webseiten/vorschau"
DIRS = ["maria-sofia-a", "maria-sofia-b", "maria-sofia-c"]

A_REPL = [
  ("{{FIRMA}} · Friseur &amp; Kosmetik in {{ORT}}",
   "{{FIRMA}} · Kosmetikstudio in {{ORT}}"),
  ("{{FIRMA}} — Ihr Salon für Beauty &amp; Gesundheit in {{ORT}}. Haarschnitt &amp; Styling, Coloration, Kosmetik, Maniküre &amp; Pediküre, Wellness und Make-up für {{ORT}} und die Region.",
   "{{FIRMA}} — Ihr Kosmetikstudio in {{ORT}}. Gesichtsbehandlung, Wimpern, Maniküre &amp; Pediküre, Make-up, Haarentfernung und Anti-Aging für {{ORT}} und die Region."),
  ("Leistungen von {{FIRMA}}: Haarschnitt &amp; Styling, Coloration &amp; Strähnen, Kosmetik, Maniküre &amp; Pediküre, Wellness &amp; Massage sowie Make-up für {{ORT}} und die Region.",
   "Leistungen von {{FIRMA}}: kosmetische Gesichtsbehandlung, Wimpern &amp; Wimpernverlängerung, Maniküre &amp; Pediküre, Make-up, Haarentfernung sowie Anti-Aging für {{ORT}} und die Region."),
  ("{{FIRMA}} aus {{ORT}} — Ihr Salon für Beauty &amp; Gesundheit. {{SLOGAN}}.",
   "{{FIRMA}} aus {{ORT}} — Ihr Kosmetikstudio. {{SLOGAN}}."),
  ("Schön, dass Sie da sind. Beauty &amp; Gesundheit für {{ORT}} und die Region — von Haarschnitt und Coloration bis Kosmetik und Wellness.",
   "Schön, dass Sie da sind. Gepflegte Kosmetik für {{ORT}} und die Region — von der Gesichtsbehandlung über Wimpern bis zu Make-up und Anti-Aging."),
  ("Ihr Salon für <span class=\"accent\">Beauty &amp; Gesundheit</span> in {{ORT}}",
   "Ihr Kosmetikstudio für <span class=\"accent\">gepflegte Schönheit</span> in {{ORT}}"),
  ("Von Haarschnitt und Coloration über Kosmetik bis zu Wellness und Make-up — fühlen Sie sich rundum gepflegt, in entspannter Atmosphäre und mit persönlicher Beratung.",
   "Von der Gesichtsbehandlung über Wimpern und Maniküre bis zu Make-up und Anti-Aging — fühlen Sie sich rundum gepflegt, in entspannter Atmosphäre und mit persönlicher Beratung."),
  ("<h2>Beauty &amp; Gesundheit aus einer Hand</h2>",
   "<h2>Kosmetik aus einer Hand</h2>"),
  ("Sechs Kernleistungen — vom Haarschnitt über Kosmetik und Wellness bis zum Make-up für Ihren besonderen Anlass.",
   "Sechs Kernleistungen — von der Gesichtsbehandlung über Wimpern und Maniküre bis zum Make-up für Ihren besonderen Anlass."),
  ("Beauty &amp; Gesundheit aus einer Hand — gepflegt ausgeführt, individuell beraten und mit Zeit nur für Sie.",
   "Kosmetik aus einer Hand — gepflegt ausgeführt, individuell beraten und mit Zeit nur für Sie."),
  ("Persönliche Beratung rund um Haar, Kosmetik und Wellness — und Ihren Wohlfühl-Termin.",
   "Persönliche Beratung rund um Gesichtspflege, Wimpern und Make-up — und Ihren Wohlfühl-Termin."),

  ("<h3>Haarschnitt &amp; Styling</h3>\n        <p>Typgerechter Schnitt und Styling für Damen und Herren — passend zu Ihrem Stil und Alltag, sauber ausgeführt.</p>\n        <a class=\"card__link\" href=\"leistungen.html#haarschnitt\">",
   "<h3>Wimpern &amp; Wimpernverlängerung</h3>\n        <p>Ausdrucksvolle Augen mit Wimpernverlängerung, Lifting und Färben — sorgfältig gesetzt und auf Sie abgestimmt.</p>\n        <a class=\"card__link\" href=\"leistungen.html#wimpern\">"),
  ("<h3>Coloration &amp; Strähnen</h3>\n        <p>Von der natürlichen Nuance bis zu modernen Strähnen und Balayage — schonend, brillant und individuell abgestimmt.</p>\n        <a class=\"card__link\" href=\"leistungen.html#coloration\">",
   "<h3>Haarentfernung &amp; Waxing</h3>\n        <p>Sanfte Haarentfernung mit Waxing und Sugaring — gründlich, hautschonend und für ein langanhaltend glattes Hautgefühl.</p>\n        <a class=\"card__link\" href=\"leistungen.html#haarentfernung\">"),
  ("<h3>Wellness &amp; Massage</h3>\n        <p>Auszeit vom Alltag: entspannende Massagen und Wohlfühl-Anwendungen, die Körper und Geist neue Energie geben.</p>\n        <a class=\"card__link\" href=\"leistungen.html#wellness\">",
   "<h3>Anti-Aging &amp; Hautpflege</h3>\n        <p>Gezielte Anti-Aging-Behandlungen und intensive Pflege — für ein frisches, strahlendes und sichtbar gepflegtes Hautbild.</p>\n        <a class=\"card__link\" href=\"leistungen.html#antiaging\">"),

  ("id=\"haarschnitt\">\n      <div class=\"detail__media\"><img src=\"img/img3.jpg\" alt=\"Moderner Salon für Haarschnitt und Styling\"></div>\n      <div>\n        <span class=\"eyebrow\">Haarschnitt &amp; Styling</span>\n        <h2>Ein Schnitt, der zu Ihnen passt</h2>\n        <p>Wir beraten Sie typgerecht und schneiden so, dass Ihr Look auch zuhause leicht zu stylen ist. Für Damen und Herren — vom klassischen Schnitt bis zur modernen Trendfrisur.</p>\n        <div class=\"chips\"><span class=\"chip\">Damen</span><span class=\"chip\">Herren</span><span class=\"chip\">Föhnen &amp; Styling</span><span class=\"chip\">Typberatung</span></div>",
   "id=\"wimpern\">\n      <div class=\"detail__media\"><img src=\"img/img3.jpg\" alt=\"Wimpernverlängerung im Kosmetikstudio\"></div>\n      <div>\n        <span class=\"eyebrow\">Wimpern &amp; Wimpernverlängerung</span>\n        <h2>Ausdrucksvolle Augen</h2>\n        <p>Wimpernverlängerung, Lash-Lifting und das Färben von Wimpern und Augenbrauen — sorgfältig gearbeitet und auf Ihren Typ abgestimmt, für einen wachen, gepflegten Blick.</p>\n        <div class=\"chips\"><span class=\"chip\">Wimpernverlängerung</span><span class=\"chip\">Lash-Lifting</span><span class=\"chip\">Augenbrauen</span><span class=\"chip\">Färben</span></div>"),
  ("id=\"coloration\">\n      <div class=\"detail__media\"><img src=\"img/img2.jpg\" alt=\"Coloration und Strähnen im Salon\"></div>\n      <div>\n        <span class=\"eyebrow\">Coloration &amp; Strähnen</span>\n        <h2>Farbe, die strahlt</h2>\n        <p>Von der natürlichen Nuance über Strähnentechniken bis zu Balayage und Ansatzfärbung — wir wählen den Ton, der zu Ihnen passt, und arbeiten schonend für gepflegtes, glänzendes Haar.</p>\n        <div class=\"chips\"><span class=\"chip\">Coloration</span><span class=\"chip\">Strähnen</span><span class=\"chip\">Balayage</span><span class=\"chip\">Ansatz</span></div>",
   "id=\"haarentfernung\">\n      <div class=\"detail__media\"><img src=\"img/img2.jpg\" alt=\"Sanfte Haarentfernung im Kosmetikstudio\"></div>\n      <div>\n        <span class=\"eyebrow\">Haarentfernung &amp; Waxing</span>\n        <h2>Glatte, gepflegte Haut</h2>\n        <p>Sanfte Haarentfernung mit Waxing und Sugaring — gründlich, hautschonend und hygienisch. Für Gesicht, Beine und Körper, mit langanhaltend glattem Hautgefühl.</p>\n        <div class=\"chips\"><span class=\"chip\">Waxing</span><span class=\"chip\">Sugaring</span><span class=\"chip\">Gesicht</span><span class=\"chip\">Körper</span></div>"),
  ("id=\"wellness\">\n      <div class=\"detail__media\"><img src=\"img/img2.jpg\" alt=\"Wellness und Massage im Salon\"></div>\n      <div>\n        <span class=\"eyebrow\">Wellness &amp; Massage</span>\n        <h2>Eine Auszeit für Körper und Geist</h2>\n        <p>Entspannende Massagen und Wohlfühl-Anwendungen helfen Ihnen, abzuschalten und neue Energie zu tanken — in ruhiger Atmosphäre, ganz in Ihrem Tempo.</p>\n        <div class=\"chips\"><span class=\"chip\">Massage</span><span class=\"chip\">Entspannung</span><span class=\"chip\">Wellness</span><span class=\"chip\">Auszeit</span></div>",
   "id=\"antiaging\">\n      <div class=\"detail__media\"><img src=\"img/img2.jpg\" alt=\"Anti-Aging-Behandlung im Kosmetikstudio\"></div>\n      <div>\n        <span class=\"eyebrow\">Anti-Aging &amp; Hautpflege</span>\n        <h2>Frische für Ihre Haut</h2>\n        <p>Gezielte Anti-Aging-Behandlungen, intensive Feuchtigkeitspflege und straffende Anwendungen — abgestimmt auf Ihren Hauttyp, für ein strahlendes, sichtbar gepflegtes Hautbild.</p>\n        <div class=\"chips\"><span class=\"chip\">Anti-Aging</span><span class=\"chip\">Feuchtigkeit</span><span class=\"chip\">Straffung</span><span class=\"chip\">Pflege</span></div>"),

  ("<option>Haarschnitt &amp; Styling</option>\n              <option>Coloration &amp; Strähnen</option>\n              <option>Kosmetik &amp; Gesichtsbehandlung</option>\n              <option>Maniküre &amp; Pediküre</option>\n              <option>Wellness &amp; Massage</option>\n              <option>Make-up &amp; Anlässe</option>",
   "<option>Gesichtsbehandlung</option>\n              <option>Wimpern &amp; Wimpernverlängerung</option>\n              <option>Maniküre &amp; Pediküre</option>\n              <option>Make-up &amp; Anlässe</option>\n              <option>Haarentfernung &amp; Waxing</option>\n              <option>Anti-Aging &amp; Hautpflege</option>"),
  ("Klassische Maniküre, langlebiger Nagellack und wohltuende Fußpflege. Für gepflegte Hände und Füße, die sich rundum gut anfühlen — das ganze Jahr.",
   "Klassische und moderne Maniküre, langlebiger Nagellack sowie wohltuende Pediküre. Für gepflegte Hände und Füße, die sich rundum gut anfühlen — das ganze Jahr."),
]

BC_REPL = [
  ("<a href=\"leistungen.html#fusspflege\">Med. Fußpflege &amp; Podologie</a>",
   "<a href=\"leistungen.html#wimpern\">Wimpern &amp; Wimpernverlängerung</a>"),
  ("<a href=\"leistungen.html#hornhaut\">Hornhaut- &amp; Nagelpflege</a>",
   "<a href=\"leistungen.html#haarentfernung\">Haarentfernung &amp; Waxing</a>"),
  ("<a href=\"leistungen.html#wellness\">Wellness &amp; Massage</a>",
   "<a href=\"leistungen.html#antiaging\">Anti-Aging &amp; Hautpflege</a>"),

  ("{{FIRMA}} · Kosmetik &amp; Fußpflege in {{ORT}}", "{{FIRMA}} · Kosmetikstudio in {{ORT}}"),
  ("{{FIRMA}} · {{ORT}} – Kosmetik & Fußpflege", "{{FIRMA}} · {{ORT}} – Kosmetikstudio"),
  ("{{FIRMA}} in {{ORT}}: Kosmetik &amp; Fußpflege für medizinische Fußpflege &amp; Podologie, kosmetische Gesichtsbehandlung, Maniküre &amp; Pediküre, Hornhaut- &amp; Nagelpflege, Wellness &amp; Massage sowie Beratung. Ruhig, gepflegt, persönlich.",
   "{{FIRMA}} in {{ORT}}: Ihr Kosmetikstudio für kosmetische Gesichtsbehandlung, Wimpern &amp; Wimpernverlängerung, Maniküre &amp; Pediküre, Make-up, Haarentfernung sowie Anti-Aging. Ruhig, gepflegt, persönlich."),
  ("{{FIRMA}} in {{ORT}} – {{SLOGAN}} Medizinische Fußpflege, kosmetische Gesichtsbehandlung, Maniküre & Pediküre, Wellness und Pflegeberatung aus einer Hand.",
   "{{FIRMA}} in {{ORT}} – {{SLOGAN}} Kosmetische Gesichtsbehandlung, Wimpern, Maniküre & Pediküre, Make-up, Haarentfernung und Anti-Aging aus einer Hand."),
  ("Leistungen von {{FIRMA}}: medizinische Fußpflege &amp; Podologie, kosmetische Gesichtsbehandlung, Maniküre &amp; Pediküre, Hornhaut- &amp; Nagelpflege, Wellness &amp; Massage sowie Beratung &amp; Pflegeprodukte.",
   "Leistungen von {{FIRMA}}: kosmetische Gesichtsbehandlung, Wimpern &amp; Wimpernverlängerung, Maniküre &amp; Pediküre, Make-up, Haarentfernung sowie Anti-Aging &amp; Pflegeberatung."),
  ("Leistungen von {{FIRMA}} in {{ORT}}: Medizinische Fußpflege & Podologie, Gesichtsbehandlung, Maniküre & Pediküre, Hornhaut- & Nagelpflege, Wellness & Massage, Beratung & Pflegeprodukte.",
   "Leistungen von {{FIRMA}} in {{ORT}}: Kosmetische Gesichtsbehandlung, Wimpern & Wimpernverlängerung, Maniküre & Pediküre, Make-up, Haarentfernung, Anti-Aging & Pflegeberatung."),
  ("Über {{FIRMA}}: Ihre Kosmetik &amp; Fußpflege in {{ORT}}. Sorgfältig, ruhig und persönlich — Ansprechpartnerin {{ANSPRECH}}.",
   "Über {{FIRMA}}: Ihr Kosmetikstudio in {{ORT}}. Sorgfältig, ruhig und persönlich — {{ANSPRECH}} ist für Sie da."),
  ("Über {{FIRMA}} in {{ORT}} – Kosmetik- und Fußpflege-Studio mit ruhiger Atmosphäre, geschulten Händen und ehrlicher Beratung.",
   "Über {{FIRMA}} in {{ORT}} – Kosmetikstudio mit ruhiger Atmosphäre, geschulten Händen und ehrlicher Beratung."),

  ("{{ORT}} · Kosmetik &amp; Fußpflege", "{{ORT}} · Kosmetikstudio"),
  ("{{FIRMA}} · Kosmetik & Fußpflege · {{ORT}}", "{{FIRMA}} · Kosmetikstudio · {{ORT}}"),
  ("{{SLOGAN}} — {{FIRMA}} ist Ihr Ort für gepflegte Haut und gesunde Füße: von medizinischer Fußpflege über kosmetische Gesichtsbehandlung bis zu Wellness &amp; Massage. Persönliche Beratung, ruhige Atmosphäre, sorgfältige Hände.",
   "{{SLOGAN}} — {{FIRMA}} ist Ihr Ort für gepflegte, strahlende Haut: von der kosmetischen Gesichtsbehandlung über Wimpern und Make-up bis zu Haarentfernung und Anti-Aging. Persönliche Beratung, ruhige Atmosphäre, sorgfältige Hände."),
  ("Kosmetik · Fußpflege · Wellness", "Gesicht · Wimpern · Make-up"),
  ("Ruhiger Kosmetik- und Fußpflege-Behandlungsraum von {{FIRMA}}", "Ruhiger Behandlungsraum von {{FIRMA}}"),

  ("<h2>Pflege für<br>Haut &amp; Füße</h2>", "<h2>Pflege für<br>Ihre Schönheit</h2>"),
  ("Von der medizinischen Fußpflege bis zur entspannenden Gesichtsbehandlung — bei {{FIRMA}} in {{ORT}} bekommen Sie alles aus einer Hand. Sorgfältig, hygienisch, mit Ruhe.",
   "Von der kosmetischen Gesichtsbehandlung bis zur Wimpernverlängerung — bei {{FIRMA}} in {{ORT}} bekommen Sie alles aus einer Hand. Sorgfältig, hygienisch, mit Ruhe."),
  ("Von der medizinischen Fußpflege bis zur entspannenden Gesichtsbehandlung — bei {{FIRMA}} bekommen Sie alles aus einer Hand. Sorgfältig, hygienisch, mit Ruhe.",
   "Von der kosmetischen Gesichtsbehandlung bis zur Wimpernverlängerung — bei {{FIRMA}} bekommen Sie alles aus einer Hand. Sorgfältig, hygienisch, mit Ruhe."),

  ("<h2>Pflege für Füße, Gesicht und Wohlbefinden</h2>", "<h2>Pflege für Gesicht, Augen und Wohlbefinden</h2>"),
  ("Von der medizinischen Fußpflege bis zur entspannenden Behandlung. Sechs Bereiche, in denen wir für Sie da sind – im ruhigen Studio in {{ORT}}.",
   "Von der Gesichtsbehandlung bis zur Wimpernverlängerung. Sechs Bereiche, in denen wir für Sie da sind – im ruhigen Studio in {{ORT}}."),
  ("Von der medizinischen Fußpflege bis zur wohltuenden Gesichtsbehandlung – ruhige Atmosphäre, geschulte Hände und Zeit für Sie. Pflege, die man spürt – im Studio in {{ORT}}.",
   "Von der kosmetischen Gesichtsbehandlung bis zur Wimpernverlängerung – ruhige Atmosphäre, geschulte Hände und Zeit für Sie. Pflege, die man spürt – im Studio in {{ORT}}."),

  ("<h3>Medizinische Fußpflege &amp; Podologie</h3>\n          <p>Fachgerechte Behandlung von Hühneraugen, eingewachsenen Nägeln und Druckstellen — schonend und hygienisch für gesunde Füße.</p>",
   "<h3>Wimpern &amp; Wimpernverlängerung</h3>\n          <p>Ausdrucksvolle Augen mit Wimpernverlängerung, Lash-Lifting und Färben — sorgfältig gesetzt und auf Ihren Typ abgestimmt.</p>"),
  ("<h3>Medizinische Fußpflege &amp; Podologie</h3>\n        <p>Fachgerechte Behandlung von Hornhaut, Nägeln und beanspruchter Haut – ruhig, hygienisch und schonend, auch bei empfindlichen Füßen.</p>",
   "<h3>Wimpern &amp; Wimpernverlängerung</h3>\n        <p>Ausdrucksvolle Augen mit Wimpernverlängerung, Lash-Lifting und Färben – ruhig, sorgfältig und auf Ihren Typ abgestimmt.</p>"),
  ("<h3>Medizinische Fußpflege &amp; Podologie</h3>\n        <p>Fachgerechte Behandlung von Hornhaut, Nägeln und beanspruchter Haut. Schonend und hygienisch – auch bei Diabetes oder empfindlichen Füßen.</p>",
   "<h3>Wimpern &amp; Wimpernverlängerung</h3>\n        <p>Ausdrucksvolle Augen mit Wimpernverlängerung, Lash-Lifting und Färben. Sorgfältig gearbeitet und auf Ihren Typ abgestimmt.</p>"),

  ("<h3>Hornhaut- &amp; Nagelpflege</h3>\n          <p>Sanfte Entfernung von Hornhaut und fachgerechte Nagelpflege — für ein angenehmes, gesundes Hautgefühl.</p>",
   "<h3>Haarentfernung &amp; Waxing</h3>\n          <p>Sanfte Haarentfernung mit Waxing und Sugaring — gründlich, hautschonend und langanhaltend glatt.</p>"),
  ("<h3>Hornhaut- &amp; Nagelpflege</h3>\n          <p>Sanfte Entfernung störender Hornhaut und fachgerechte Pflege Ihrer Nägel. So bleiben Füße und Hände angenehm weich, gesund und gepflegt — Schritt für Schritt.</p>",
   "<h3>Haarentfernung &amp; Waxing</h3>\n          <p>Sanfte Haarentfernung mit Waxing und Sugaring für Gesicht, Beine und Körper. Gründlich, hautschonend und mit langanhaltend glattem Hautgefühl.</p>"),
  ("<h3>Hornhaut- &amp; Nagelpflege</h3>\n        <p>Entfernung von Hornhaut und Schwielen, Pflege eingewachsener und verdickter Nägel – für ein angenehmes, gesundes Gefühl beim Gehen.</p>",
   "<h3>Haarentfernung &amp; Waxing</h3>\n        <p>Sanfte Haarentfernung mit Waxing und Sugaring – gründlich und hautschonend, für ein langanhaltend glattes Hautgefühl.</p>"),
  ("<h3>Hornhaut- &amp; Nagelpflege</h3>\n        <p>Entfernung von Hornhaut und Schwielen, Pflege eingewachsener und verdickter Nägel – für ein angenehmes, gesundes Gefühl bei jedem Schritt.</p>",
   "<h3>Haarentfernung &amp; Waxing</h3>\n        <p>Sanfte Haarentfernung mit Waxing und Sugaring für Gesicht, Beine und Körper – gründlich, hautschonend und langanhaltend glatt.</p>"),

  ("<h3>Wellness &amp; Massage</h3>\n          <p>Entspannende Hand-, Fuß- und Teilmassagen — kurze Auszeiten, die Körper und Sinne zur Ruhe kommen lassen.</p>",
   "<h3>Anti-Aging &amp; Hautpflege</h3>\n          <p>Gezielte Anti-Aging-Behandlungen und intensive Pflege — für ein frisches, strahlendes Hautbild.</p>"),
  ("<h3>Wellness &amp; Massage</h3>\n        <p>Wohltuende Fuß- und Handmassagen sowie kleine Wellness-Momente, die Verspannungen lösen und neue Energie geben.</p>",
   "<h3>Anti-Aging &amp; Hautpflege</h3>\n        <p>Gezielte Anti-Aging-Behandlungen, Feuchtigkeitspflege und straffende Anwendungen, die das Hautbild sichtbar frischer wirken lassen.</p>"),

  ("{{SLOGAN}} — Ihre Kosmetik &amp; Fußpflege in {{ORT}}. Schauen Sie sich in Ruhe um.",
   "{{SLOGAN}} — Ihr Kosmetikstudio in {{ORT}}. Schauen Sie sich in Ruhe um."),
  ("{{SLOGAN}} — Ihre Kosmetik &amp; Fußpflege in {{ORT}}.", "{{SLOGAN}} — Ihr Kosmetikstudio in {{ORT}}."),

  ("<b>Fuß &amp; Gesicht</b><span>aus einer Hand</span>", "<b>Gesicht &amp; Augen</b><span>aus einer Hand</span>"),
  ("Fußpflege, Gesichtsbehandlung oder Wellness? Hinterlassen Sie eine kurze Nachricht, {{ANSPRECH}} meldet sich. Oder direkt per Telefon.",
   "Gesichtsbehandlung, Wimpern oder Make-up? Hinterlassen Sie eine kurze Nachricht, {{ANSPRECH}} meldet sich. Oder direkt per Telefon."),
  ("Fußpflege, Gesichtsbehandlung oder Wellness? Hinterlassen Sie eine kurze Nachricht, {{ANSPRECH}} meldet sich.",
   "Gesichtsbehandlung, Wimpern oder Make-up? Hinterlassen Sie eine kurze Nachricht, {{ANSPRECH}} meldet sich."),
  ("z. B. Medizinische Fußpflege, nächste Woche …", "z. B. Gesichtsbehandlung, nächste Woche …"),
  ("Ob Fußpflege, Gesichtsbehandlung oder Wellness – sichern Sie sich Ihren Wunschtermin bei {{FIRMA}} in {{ORT}}.",
   "Ob Gesichtsbehandlung, Wimpern oder Make-up – sichern Sie sich Ihren Wunschtermin bei {{FIRMA}} in {{ORT}}."),
  ("Ein moderner Blick auf Ihr Kosmetik- und Fußpflege-Studio in {{ORT}}. Schauen Sie sich in Ruhe um.",
   "Ein moderner Blick auf Ihr Kosmetikstudio in {{ORT}}. Schauen Sie sich in Ruhe um."),
  ("Fußpflege, Gesichtsbehandlung oder Wellness – melden Sie sich kurz, wir finden einen passenden Termin für Sie.",
   "Gesichtsbehandlung, Wimpern oder Make-up – melden Sie sich kurz, wir finden einen passenden Termin für Sie."),
  ("Mo–Fr 9–18 Uhr · Sa 9–13 Uhr", "Mo–Fr 9–18:30 Uhr · Sa 9–14:30 Uhr"),
]

COMMENT_REPL = [
  ("AKIRA Studio · Kosmetik/Fußpflege-Template", "AKIRA Studio · Kosmetik-Template"),
  ("Kosmetik & Fußpflege Design C", "Kosmetik Design C"),
]

TEL = "+49 1514 7242536"
TOKENS = {
  "{{FIRMA}}": "Maria &amp; Sofia Kosmetik",
  "{{SLOGAN}}": "Zeit für Ihre Schönheit",
  "{{ORT}}": "Gladbeck",
  "{{TEL}}": TEL,
  "{{TEL_HREF}}": "+4915147242536",
  "{{MOBIL}}": TEL,
  "{{ANSPRECH}}": "das Team von Maria &amp; Sofia",
  "{{ADRESSE}}": "Friedrichstr. 30, 45964 Gladbeck",
  "{{OEFFNUNGSZEITEN}}": "Mo–Fr 09:00–18:30 · Sa 09:00–14:30",
  "{{KUNDENNR}}": "AK-1069",
  "{{REF}}": "AK-1069",
  "{{PRAES_URL}}": "https://vorschau.black-rabbit.studio/praesentation-maria-sofia/",
  "{{EMAIL}}": "",
  "{{WEBURL}}": "",
}

def process_file(path, variant):
    with open(path, encoding="utf-8") as f:
        html = f.read()

    repls = A_REPL if variant == "a" else BC_REPL
    for a, b in repls + COMMENT_REPL:
        html = html.replace(a, b)

    # remove empty E-Mail / Web rows (token markup, pre-fill)
    html = re.sub(
        r'\s*<div class="info-row">\s*<svg[^>]*>.*?</svg>\s*<div><span class="lbl">E-Mail</span><br><a href="mailto:\{\{EMAIL\}\}">\{\{EMAIL\}\}</a></div>\s*</div>',
        '', html, flags=re.S)
    html = re.sub(
        r'\s*<div class="info-row">\s*<svg[^>]*>.*?</svg>\s*<div><span class="lbl">Web</span><br><a href="https://\{\{WEBURL\}\}">\{\{WEBURL\}\}</a></div>\s*</div>',
        '', html, flags=re.S)
    html = re.sub(
        r'\s*<a href="mailto:\{\{EMAIL\}\}">\s*<svg.*?</svg>\s*<span><span class="lbl">E-Mail</span><br><span class="val">\{\{EMAIL\}\}</span></span>\s*</a>',
        '', html, flags=re.S)
    html = html.replace('<a href="mailto:{{EMAIL}}">{{EMAIL}}</a>', '<a href="tel:+4915147242536">+49 1514 7242536</a>')
    html = re.sub(r'\s*<span>\{\{WEBURL\}\}</span>', '', html)
    html = re.sub(r'\s*<div class="info-row"><span>Web</span><b>\{\{WEBURL\}\}</b></div>', '', html)
    html = html.replace('<div><b>E-Mail</b><a href="mailto:{{EMAIL}}">{{EMAIL}}</a></div>',
                        '<div><b>Telefon</b><a href="tel:+4915147242536">+49 1514 7242536</a></div>')
    html = html.replace('<a href="mailto:{{EMAIL}}" class="btn btn-line">E-Mail schreiben</a>',
                        '<a href="tel:+4915147242536" class="btn btn-line">Anrufen</a>')
    html = html.replace('<a href="mailto:{{EMAIL}}" class="btn btn-line">E-Mail</a>',
                        '<a href="tel:+4915147242536" class="btn btn-line">Anrufen</a>')
    html = html.replace('{{WEBURL}} · ', '')
    html = html.replace('<br>{{WEBURL}} ·', '<br>')

    for k, v in TOKENS.items():
        html = html.replace(k, v)

    html = html.replace('href="mailto:"', 'href="tel:+4915147242536"')
    html = html.replace('href="https://"', 'href="tel:+4915147242536"')

    with open(path, "w", encoding="utf-8") as f:
        f.write(html)

for d in DIRS:
    variant = d.split("-")[-1]
    for path in glob.glob(os.path.join(BASE, d, "*.html")):
        process_file(path, variant)
        print("filled", os.path.relpath(path, BASE))

print("DONE")
