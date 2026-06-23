#!/usr/bin/env python3
# Individualisierung steinhauer · index.html + impressum.html
import io, sys
P="/Users/bb/Desktop/Webseiten/vorschau/steinhauer/"
def rep(t, old, new, n=1):
    c=t.count(old)
    assert c==n, f"MATCH {c}!={n}: {old[:70]}"
    return t.replace(old, new)

t=open(P+"index.html",encoding="utf-8").read()

# 1) HERO
t=rep(t, """        <p class="hero__firm">Steinhauer-Berger · Lüneburg</p>
        <h1>Im Trauerfall sind wir für Sie da. Tag und Nacht.</h1>
        <a class="call-block" href="tel:+4941316060110">
          <strong>04131 60 60 110</strong>
          <span>24 Stunden erreichbar · jetzt anrufen</span>
        </a>
        <p class="hero__note">Auch an Sonn- und Feiertagen. Wir kümmern uns um alles Weitere.</p>""",
"""        <h1 class="hero__brand">
          <span class="hero-line l1 hero__brand-sub">Bestattungen · Lüneburg · Bleckede · Hitzacker · Dahlenburg</span>
          <span class="hero-line l2 hero__brand-name">Steinhauer-Berger</span>
        </h1>
        <p class="hero__since hero-line l3">Dem Leben wie dem Tod ein Haus.</p>
        <p class="hero__claim hero-line l4">Familienunternehmen mit sieben Standorten in der Region Lüneburg.</p>
        <a class="call-block hero-line l5" href="tel:+4941316060110">
          <strong>04131 60 60 110</strong>
          <span>Tag und Nacht erreichbar · 365 Tage im Jahr</span>
        </a>
        <p class="hero__note hero-line l6">Auch nachts, an Wochenenden und Feiertagen. Wir kümmern uns um alles Weitere.</p>""")

# 2) LEISTUNGSKARTEN
t=rep(t, """          <div class="reveal">
            <h3>Naturbestattung</h3>
            <p>Die letzte Ruhe unter einem Baum · in einem Bestattungswald wie FriedWald oder RuheForst in der Region Lüneburg.</p>
          </div>
          <div class="reveal">
            <h3>Seebestattung</h3>
            <p>Beisetzung der Urne auf hoher See · auf Wunsch mit Begleitfahrt der Familie.</p>
          </div>
          <div class="reveal">
            <h3>Trauerfeier</h3>
            <p>Gestaltung und Organisation der Feier · Redner, Musik, Blumenschmuck und ein Rahmen, der Raum zum Erinnern lässt.</p>
          </div>
          <div class="reveal">
            <h3>Überführung</h3>
            <p>Würdevolle Überführungen im gesamten Bundesgebiet und aus dem Ausland · wir kümmern uns um alle Formalitäten.</p>
          </div>""",
"""          <div class="reveal">
            <h3>Naturbestattung im FriedWald</h3>
            <p>Die letzte Ruhe unter Bäumen · wir beraten Sie zu allen Möglichkeiten der Beisetzung im hausnahen FriedWald.</p>
          </div>
          <div class="reveal">
            <h3>Trauerfeier und Aufbahrung</h3>
            <p>Vom Abschied im kleinen Kreis bis zur Trauergesellschaft mit 80 Gästen in unserem Trauer·Café · auch am offenen Sarg.</p>
          </div>
          <div class="reveal">
            <h3>Trauerreden und Trauerdruck</h3>
            <p>Einfühlsame weltliche und religiöse Trauerreden · dazu Traueranzeigen, Trauerbriefe und Danksagungen.</p>
          </div>
          <div class="reveal">
            <h3>Trauerbeistand</h3>
            <p>Wir hören Ihnen zu, nehmen uns Zeit für Einzelgespräche und begleiten Sie auch nach der Beisetzung.</p>
          </div>""")

t=t.replace("Trauer·Café","Trauercafé")

# 3) UEBER UNS -> drei Personen-Sektionen
t=rep(t, """    <section data-screen-label="Über uns">
      <div class="shell split">
        <figure class="reveal">
          <img src="img/team.jpg" alt="Bildslot: Inhaberin und Team von Steinhauer-Berger in natürlichem Licht">
          <figcaption>Andree Berger und das Team von Steinhauer-Berger</figcaption>
        </figure>
        <div class="reveal">
          <span class="eyebrow">Über uns</span>
          <h2>In Lüneburg zu Hause. Seit vielen Jahren.</h2>
          <p>Unser Haus wird seit vielen Jahren von unserer Familie geführt. Viele Menschen in Lüneburg und der Region Lüneburg kennen uns · weil wir schon ihre Eltern oder Großeltern begleitet haben.</p>
          <p>Was sich seitdem nicht geändert hat: Wer bei uns anruft, spricht mit jemandem, der hier lebt und Verantwortung übernimmt. Andree Berger und unser kleines Team nehmen sich für jedes Gespräch die Zeit, die es braucht.</p>
          <p>Wir sagen Ihnen offen, was eine Bestattung kostet, und raten Ihnen zu nichts, was Sie nicht brauchen. Das ist unser Verständnis von einem Familienbetrieb.</p>
        </div>
      </div>
    </section>""",
"""    <section data-screen-label="Inhaber">
      <div class="shell split">
        <figure class="reveal">
          <!-- Slot andree-portrait · wird durch generiertes Szenen-Bild ersetzt (Prompts AB-01) -->
          <img src="img/andree-portrait.jpg" alt="Andree Berger, Inhaber von Steinhauer-Berger in Lüneburg">
          <figcaption>Andree Berger · Inhaber</figcaption>
        </figure>
        <div class="reveal">
          <span class="eyebrow">Ihr Ansprechpartner</span>
          <h2>Andree Berger. Dafür steht er ein.</h2>
          <p>„Unser Anliegen ist es, Sie in diesen schweren Stunden zu unterstützen. Wir nehmen uns Zeit für Sie und geben Ihnen jeden Raum, den Sie für die Verarbeitung Ihres Verlustes brauchen." Mit diesen Worten begrüßt Andree Berger die Familien, die zu uns kommen.</p>
          <p>Als ausgebildeter Thanatologe ermöglicht er auch den Abschied am offenen Sarg · eine Form des Abschieds, die nur wenige Häuser anbieten. Ob weltliche Trauerfeier oder kirchliche Zeremonie: Die Wünsche des Verstorbenen und Ihre Vorstellungen sind für uns maßgeblich.</p>
          <p>Wir erledigen zuverlässig alle Formalitäten und besprechen den finanziellen Rahmen offen und ausführlich mit Ihnen.</p>
        </div>
      </div>
    </section>

    <!-- ============ ANSPRECHPARTNERIN ============ -->
    <section class="teaser" data-screen-label="Ansprechpartnerin">
      <div class="shell split">
        <div class="reveal">
          <span class="eyebrow">An Ihrer Seite</span>
          <h2>Ines Berger. Zeit, Ruhe und ein offenes Ohr.</h2>
          <p>In unserem Familienunternehmen finden Sie immer einen Ansprechpartner, der Ihnen zuhört und Ihnen in Zeiten der Trauer zuverlässig beisteht. Ines Berger nimmt sich für jedes Gespräch die Zeit, die es braucht.</p>
          <p>Wenn Sie das Bedürfnis haben, über Ihre Trauer und Ihren seelischen Schmerz zu sprechen, können Sie das jederzeit tun · wir geben Ihnen dazu Zeit und geschützten Raum in Einzelgesprächen.</p>
        </div>
        <figure class="reveal">
          <!-- Slot ines-portrait · wird durch generiertes Szenen-Bild ersetzt (Prompts IB-01) -->
          <img src="img/ines-portrait.jpg" alt="Ines Berger, Ansprechpartnerin bei Steinhauer-Berger" loading="lazy">
          <figcaption>Ines Berger · Ihre Ansprechpartnerin</figcaption>
        </figure>
      </div>
    </section>

    <!-- ============ ANSPRECHPARTNER ============ -->
    <section data-screen-label="Ansprechpartner">
      <div class="shell split">
        <figure class="reveal">
          <!-- Slot phillip-portrait · wird durch generiertes Szenen-Bild ersetzt (Prompts PB-01) -->
          <img src="img/phillip-portrait.jpg" alt="Phillip Berger, Ansprechpartner bei Steinhauer-Berger" loading="lazy">
          <figcaption>Phillip Berger · Ihr Ansprechpartner</figcaption>
        </figure>
        <div class="reveal">
          <span class="eyebrow">Immer erreichbar</span>
          <h2>Phillip Berger. Sie können uns jederzeit ansprechen.</h2>
          <p>Wir sind Tag und Nacht für Sie da · an allen sieben Standorten zwischen Lüneburg, Bleckede und dem Wendland. Phillip Berger gehört zu Ihren persönlichen Ansprechpartnern und sorgt dafür, dass Sie sich um nichts kümmern müssen.</p>
          <p>Sie erreichen uns rund um die Uhr unter <a href="tel:+4941316060110">04131 60 60 110</a> · nachts hören Sie keine Bandansage, sondern uns.</p>
        </div>
      </div>
    </section>""")

# 4) TRUST -> STANDORTE
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
          <span class="eyebrow">Sieben Standorte in der Region</span>
          <h2>Immer in Ihrer Nähe.</h2>
          <p class="lead">Von Lüneburg über Bleckede bis ins Wendland und nach Bergedorf · ein Anruf unter 04131 60 60 110 erreicht uns immer.</p>
        </div>
        <div class="services">
          <div class="reveal">
            <h3>Lüneburg · Hauptsitz</h3>
            <p>Stadtkoppel 8 · 21337 Lüneburg<br>Telefon <a href="tel:+4941316060110">04131 60 60 110</a></p>
          </div>
          <div class="reveal">
            <h3>Barskamp</h3>
            <p>Köstorfer Straße 26 · 21354 Barskamp<br>Telefon <a href="tel:+495854247">05854 247</a></p>
          </div>
          <div class="reveal">
            <h3>Bleckede</h3>
            <p>Breite Straße 21 · 21354 Bleckede<br>Telefon <a href="tel:+495852958883">05852 95 88 83</a></p>
          </div>
          <div class="reveal">
            <h3>Hitzacker</h3>
            <p>Drawehnertorstraße 20 · 29456 Hitzacker<br>Telefon <a href="tel:+495862985899">05862 98 58 99</a></p>
          </div>
          <div class="reveal">
            <h3>Dahlenburg</h3>
            <p>Lüneburger Straße 7 · 21368 Dahlenburg<br>Telefon <a href="tel:+495851944444">05851 94 44 44</a></p>
          </div>
          <div class="reveal">
            <h3>Bergedorf</h3>
            <p>Chrysanderstraße 15 · 21029 Hamburg Bergedorf (vormals Rosenkranz)<br>Telefon <a href="tel:+494041626560">040 41 62 65 60</a></p>
          </div>
          <div class="reveal">
            <h3>Amt Neuhaus</h3>
            <p>Lange Reihe · 19273 Amt Neuhaus<br>Telefon <a href="tel:+49388416169 11">038841 61 69 11</a></p>
          </div>
        </div>
      </div>
    </section>""")

# 5) KONTAKT · WhatsApp-Zeile -> Gedenkportal, Anfahrt
t=rep(t, """              <li>
                <span class="label">WhatsApp</span>
                <a href="https://wa.me/" rel="noopener">Nachricht über WhatsApp senden</a>
              </li>""",
"""              <li>
                <span class="label">Gedenkportal</span>
                <a href="https://steinhauer-berger.gemeinsam-trauern.net" rel="noopener">Traueranzeigen und Gedenkseiten ansehen</a>
              </li>""")
t=rep(t, "<p><strong>Anfahrt:</strong> Sie finden uns zentral in Lüneburg, Parkplätze direkt am Haus.</p>",
"<p><strong>Anfahrt:</strong> Stadtkoppel 8 in Lüneburg · weitere Häuser in Barskamp, Bleckede, Hitzacker, Dahlenburg, Bergedorf und Amt Neuhaus.</p>")

open(P+"index.html","w",encoding="utf-8").write(t)
print("index.html ok")

# Korrektur Telefonlink + Footer auf allen Seiten
import glob
for f in glob.glob(P+"*.html"):
    s=open(f,encoding="utf-8").read()
    s=s.replace('tel:+49388416169 11','tel:+4938841616911')
    s=s.replace("begleiten wir Familien in Lüneburg und der Region Lüneburg","begleiten wir Familien zwischen Lüneburg, Bergedorf und dem Wendland")
    open(f,"w",encoding="utf-8").write(s)

# 6) IMPRESSUM
t=open(P+"impressum.html",encoding="utf-8").read()
t=rep(t, """        <p>
          Steinhauer-Berger<br>
          Inhaberin/Inhaber: Andree Berger<br>
          Stadtkoppel 8 · 21337 Lüneburg
        </p>""",
"""        <p>
          Berger GmbH (Steinhauer-Berger)<br>
          Vertreten durch: Andree Berger<br>
          Stadtkoppel 8 · 21337 Lüneburg
        </p>""")
t=rep(t, """        <h2>Umsatzsteuer</h2>
        <!-- PLATZHALTER: echte USt-IdNr. eintragen oder Absatz entfernen -->
        <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE 000 000 000 (PLATZHALTER · bitte eintragen)</p>""",
"""        <h2>Handelsregister</h2>
        <p>Registergericht: Amtsgericht Lüneburg · Handelsregister: 1865</p>

        <h2>Umsatzsteuer</h2>
        <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: wird vor Livegang ergänzt.</p>""")
t=rep(t, """        <p>Zuständige Kammer: Handwerkskammer bzw. IHK (PLATZHALTER · bitte eintragen)<br>
        Zuständige Aufsichtsbehörde: Gewerbeamt der Stadt Lüneburg (PLATZHALTER · bitte prüfen)</p>""",
"""        <p>Zuständige Kammer und Aufsichtsbehörde: werden vor Livegang ergänzt.</p>""")
open(P+"impressum.html","w",encoding="utf-8").write(t)
print("impressum.html ok")
print("STEINHAUER PATCH KOMPLETT")
