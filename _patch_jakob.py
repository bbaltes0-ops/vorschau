#!/usr/bin/env python3
# Individualisierung jakob · index.html + impressum.html
import glob
P="/Users/bb/Desktop/Webseiten/vorschau/jakob/"
def rep(t, old, new, n=1):
    c=t.count(old)
    assert c==n, f"MATCH {c}!={n}: {old[:70]}"
    return t.replace(old, new)

t=open(P+"index.html",encoding="utf-8").read()

# 1) HERO
t=rep(t, """        <p class="hero__firm">Bestattungen Jakob · Kempten</p>
        <h1>Im Trauerfall sind wir für Sie da. Tag und Nacht.</h1>
        <a class="call-block" href="tel:+49831520020">
          <strong>0831 52 00 20</strong>
          <span>24 Stunden erreichbar · jetzt anrufen</span>
        </a>
        <p class="hero__note">Auch an Sonn- und Feiertagen. Wir kümmern uns um alles Weitere.</p>""",
"""        <h1 class="hero__brand">
          <span class="hero-line l1 hero__brand-sub">Bestattungen · Kempten im Allgäu</span>
          <span class="hero-line l2 hero__brand-name">Jakob</span>
        </h1>
        <p class="hero__since hero-line l3">Würdevoller Abschied im Allgäu.</p>
        <p class="hero__claim hero-line l4">Familienunternehmen in zweiter Generation · seit 1997 in Kempten.</p>
        <a class="call-block hero-line l5" href="tel:+49831520020">
          <strong>0831 52 00 20</strong>
          <span>Tag und Nacht erreichbar · jetzt anrufen</span>
        </a>
        <p class="hero__note hero-line l6">Auch nachts, an Wochenenden und Feiertagen. Wir kümmern uns um alles Weitere.</p>""")

# 2) LEISTUNGSKARTEN
t=rep(t, """          <div class="reveal">
            <h3>Naturbestattung</h3>
            <p>Die letzte Ruhe unter einem Baum · in einem Bestattungswald wie FriedWald oder RuheForst in der Region Kempten.</p>
          </div>""",
"""          <div class="reveal">
            <h3>Naturbestattung</h3>
            <p>Die letzte Ruhe in der Natur · auch als Tree of Life Baumbestattung, bei der aus der Asche ein junger Baum wächst.</p>
          </div>""")
t=rep(t, """          <div class="reveal">
            <h3>Trauerfeier</h3>
            <p>Gestaltung und Organisation der Feier · Redner, Musik, Blumenschmuck und ein Rahmen, der Raum zum Erinnern lässt.</p>
          </div>
          <div class="reveal">
            <h3>Überführung</h3>
            <p>Würdevolle Überführungen im gesamten Bundesgebiet und aus dem Ausland · wir kümmern uns um alle Formalitäten.</p>
          </div>""",
"""          <div class="reveal">
            <h3>Besondere Bestattungsformen</h3>
            <p>Diamantbestattung und anonyme Bestattung · wir beraten Sie offen zu allen Wegen des Abschieds.</p>
          </div>
          <div class="reveal">
            <h3>Überführung</h3>
            <p>Würdevolle Überführungen im Inland und aus dem Ausland · wir regeln alle Formalitäten für Sie.</p>
          </div>""")

# 3) UEBER UNS -> Familiengeschichte
t=rep(t, """        <figure class="reveal">
          <img src="img/team.jpg" alt="Bildslot: Inhaberin und Team von Bestattungen Jakob in natürlichem Licht">
          <figcaption>Alexander Jakob und das Team von Bestattungen Jakob</figcaption>
        </figure>
        <div class="reveal">
          <span class="eyebrow">Über uns</span>
          <h2>In Kempten zu Hause. Seit 1997.</h2>
          <p>Unser Haus wird seit 1997 von unserer Familie geführt. Viele Menschen in Kempten und der Region Kempten kennen uns · weil wir schon ihre Eltern oder Großeltern begleitet haben.</p>
          <p>Was sich seitdem nicht geändert hat: Wer bei uns anruft, spricht mit jemandem, der hier lebt und Verantwortung übernimmt. Alexander Jakob und unser kleines Team nehmen sich für jedes Gespräch die Zeit, die es braucht.</p>
          <p>Wir sagen Ihnen offen, was eine Bestattung kostet, und raten Ihnen zu nichts, was Sie nicht brauchen. Das ist unser Verständnis von einem Familienbetrieb.</p>
        </div>""",
"""        <figure class="reveal">
          <img src="img/team.jpg" alt="Beratungsraum von Bestattungen Jakob in Kempten">
          <figcaption>Bestattungen Jakob · Familienunternehmen in zweiter Generation</figcaption>
        </figure>
        <div class="reveal">
          <span class="eyebrow">Familienunternehmen</span>
          <h2>Familie Jakob. Tradition in zweiter Generation.</h2>
          <p>Der Firmengründer Horst Jakob und seine Ehefrau Sonja sind seit 1989 Bestatter und seit 1997 selbständig tätig. Sohn Alexander Jakob ist 2008 in das Familienunternehmen eingestiegen und hat es 2018 gemeinsam mit seiner Ehefrau Evelyn übernommen.</p>
          <p>Durch unsere jahrelange Erfahrung stehen wir Ihnen kompetent mit Rat und Tat zur Seite · im Trauerfall, bei Vorsorgegesprächen und bei allen Fragen rund um eine Bestattung. Auch eine günstige Bestattung kann und muss würdevoll sein · gern erstellen wir Ihnen einen unverbindlichen Kostenvoranschlag.</p>
          <p>Selbstverständlich dürfen Sie auch nach der Bestattung jederzeit auf uns zukommen. Wir haben immer ein offenes Ohr für Sie.</p>
        </div>""")

# 4) TRUST -> ZWEI BUEROS
t=rep(t, """    <section class="trust" data-screen-label="Bewertungen">
      <div class="shell">
        <div class="trust__rating reveal">
          <span class="trust__score">{BEWERTUNG}</span>
          <span class="trust__stars" aria-hidden="true">★★★★★</span>
          <span class="trust__meta">von 5 Sternen · aus {ANZAHL_BEW} Google-Bewertungen</span>
        </div>
        <div class="quotes">
          <blockquote class="reveal">
            <p>„{ZITAT_1}"</p>
            <cite>{ZITAT_1_NAME} · Google-Rezension</cite>
          </blockquote>
          <blockquote class="reveal">
            <p>„{ZITAT_2}"</p>
            <cite>{ZITAT_2_NAME} · Google-Rezension</cite>
          </blockquote>
        </div>
      </div>
    </section>""",
"""    <section data-screen-label="Standorte">
      <div class="shell editorial">
        <div class="editorial__head reveal">
          <span class="eyebrow">Zwei Büros in Kempten</span>
          <h2>Immer in Ihrer Nähe.</h2>
          <p class="lead">In der Gerberstraße und am Johannisweg sind wir für Sie da · und der Tag- und Nachtruf 0831 52 00 20 erreicht uns immer.</p>
        </div>
        <div class="services">
          <div class="reveal">
            <h3>Büro Gerberstraße</h3>
            <p>Gerberstraße 18 · 87435 Kempten<br>
            Hinter der Stadtverwaltung · Parkmöglichkeiten direkt am Haus<br>
            Mo bis Fr 9 bis 14 Uhr<br>
            <a href="https://www.google.com/maps/search/?api=1&amp;query=Bestattungen+Jakob+Gerberstra%C3%9Fe+18+Kempten" rel="noopener">Route planen</a></p>
          </div>
          <div class="reveal">
            <h3>Büro Johannisweg</h3>
            <p>Johannisweg 11 · 87439 Kempten<br>
            Nahe Krankenhaus · Parkmöglichkeiten direkt am Haus<br>
            Mo bis Do 9 bis 16.30 Uhr · Fr 9 bis 14 Uhr<br>
            <a href="https://www.google.com/maps/search/?api=1&amp;query=Bestattungen+Jakob+Johannisweg+11+Kempten" rel="noopener">Route planen</a></p>
          </div>
          <div class="reveal">
            <h3>24 Stunden Service</h3>
            <p>Außerhalb der Bürozeiten sind wir Tag und Nacht für Sie erreichbar<br>
            Telefon <a href="tel:+49831520020">0831 52 00 20</a><br>
            Fax 0831 52 00 10</p>
          </div>
        </div>
      </div>
    </section>""")

# 5) KONTAKT
t=rep(t, """              <li>
                <span class="label">WhatsApp</span>
                <a href="https://wa.me/" rel="noopener">Nachricht über WhatsApp senden</a>
              </li>""",
"""              <li>
                <span class="label">Zweites Büro</span>
                <span>Johannisweg 11 · 87439 Kempten (nahe Krankenhaus)</span>
              </li>""")
t=rep(t, "<p><strong>Anfahrt:</strong> Sie finden uns zentral in Kempten, Parkplätze direkt am Haus.</p>",
"<p><strong>Anfahrt:</strong> Gerberstraße 18, hinter der Stadtverwaltung · Parkmöglichkeiten direkt am Haus.</p>")

open(P+"index.html","w",encoding="utf-8").write(t)
print("index.html ok")

# Footer-Glättung auf allen Seiten
for f in glob.glob(P+"*.html"):
    s=open(f,encoding="utf-8").read()
    s=s.replace("begleiten wir Familien in Kempten und der Region Kempten","begleiten wir Familien in Kempten und im Allgäu")
    open(f,"w",encoding="utf-8").write(s)

# 6) IMPRESSUM
t=open(P+"impressum.html",encoding="utf-8").read()
t=rep(t, "Inhaberin/Inhaber: Alexander Jakob", "Inhaber: Alexander Jakob")
t=rep(t, """        <h2>Umsatzsteuer</h2>
        <!-- PLATZHALTER: echte USt-IdNr. eintragen oder Absatz entfernen -->
        <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE 000 000 000 (PLATZHALTER · bitte eintragen)</p>""",
"""        <h2>Umsatzsteuer</h2>
        <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE315741419</p>""")
t=rep(t, """        <p>Zuständige Kammer: Handwerkskammer bzw. IHK (PLATZHALTER · bitte eintragen)<br>
        Zuständige Aufsichtsbehörde: Gewerbeamt der Stadt Kempten (PLATZHALTER · bitte prüfen)</p>""",
"""        <p>Zuständige Kammer und Aufsichtsbehörde: werden vor Livegang ergänzt.</p>""")
t=rep(t, """        <p>
          Telefon: <a href="tel:+49831520020">0831 52 00 20</a><br>
          E-Mail: <a href="mailto:info@bestattungen-jakob.de">info@bestattungen-jakob.de</a>
        </p>""",
"""        <p>
          Telefon: <a href="tel:+49831520020">0831 52 00 20</a><br>
          Telefax: 0831 52 00 10<br>
          E-Mail: <a href="mailto:info@bestattungen-jakob.de">info@bestattungen-jakob.de</a>
        </p>""")
open(P+"impressum.html","w",encoding="utf-8").write(t)
print("impressum.html ok")
print("JAKOB PATCH KOMPLETT")
