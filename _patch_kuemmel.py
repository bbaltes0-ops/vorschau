#!/usr/bin/env python3
# Individualisierung kuemmel · index.html + impressum.html
import glob
P="/Users/bb/Desktop/Webseiten/vorschau/kuemmel/"
def rep(t, old, new, n=1):
    c=t.count(old)
    assert c==n, f"MATCH {c}!={n}: {old[:70]}"
    return t.replace(old, new)

t=open(P+"index.html",encoding="utf-8").read()

# 1) HERO
t=rep(t, """        <p class="hero__firm">Kümmel Bestattungen · Gießen</p>
        <h1>Im Trauerfall sind wir für Sie da. Tag und Nacht.</h1>
        <a class="call-block" href="tel:+4964151655">
          <strong>0641 516 55</strong>
          <span>24 Stunden erreichbar · jetzt anrufen</span>
        </a>
        <p class="hero__note">Auch an Sonn- und Feiertagen. Wir kümmern uns um alles Weitere.</p>""",
"""        <h1 class="hero__brand">
          <span class="hero-line l1 hero__brand-sub">Bestattungen · Gießen und die gesamte Region</span>
          <span class="hero-line l2 hero__brand-name">Kümmel</span>
        </h1>
        <p class="hero__since hero-line l3">Gemeinsam schwere Wege gehen.</p>
        <p class="hero__claim hero-line l4">Ihr familiäres Bestattungshaus in Gießen · in der sechsten Generation.</p>
        <a class="call-block hero-line l5" href="tel:+4964151655">
          <strong>0641 516 55</strong>
          <span>Tag und Nacht erreichbar · auch am Wochenende</span>
        </a>
        <p class="hero__note hero-line l6">Auch nachts, an Wochenenden und Feiertagen. Wir kümmern uns um alles Weitere.</p>""")

# 2) LEISTUNGSKARTEN
t=rep(t, """          <div class="reveal">
            <h3>Naturbestattung</h3>
            <p>Die letzte Ruhe unter einem Baum · in einem Bestattungswald wie FriedWald oder RuheForst in der Region Gießen.</p>
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
            <h3>Naturbestattung und Seebestattung</h3>
            <p>Die letzte Ruhe im Wald oder auf hoher See · wir beraten Sie offen zu allen Formen der Naturbestattung.</p>
          </div>
          <div class="reveal">
            <h3>Trauerfeier und Trauerfloristik</h3>
            <p>Organisation der Feier mit Floristik, Dekoration der Trauerhalle, Trauerrednern, Musikern und Kondolenzlisten.</p>
          </div>
          <div class="reveal">
            <h3>Überführung</h3>
            <p>Würdevolle Überführungen im Inland und aus dem Ausland · wir regeln alle Formalitäten für Sie.</p>
          </div>
          <div class="reveal">
            <h3>Erinnerungsstücke</h3>
            <p>Gedenkkristalle und Erinnerungsschmuck mit Fingerabdruck · eine sichtbare Erinnerung, die bleibt.</p>
          </div>""")

# 3) UEBER UNS -> Sascha + Maria
t=rep(t, """    <section data-screen-label="Über uns">
      <div class="shell split">
        <figure class="reveal">
          <img src="img/team.jpg" alt="Bildslot: Inhaberin und Team von Kümmel Bestattungen in natürlichem Licht">
          <figcaption>Sascha Kümmel und das Team von Kümmel Bestattungen</figcaption>
        </figure>
        <div class="reveal">
          <span class="eyebrow">Über uns</span>
          <h2>In Gießen zu Hause. Seit sechs Generationen.</h2>
          <p>Unser Haus wird seit sechs Generationen von unserer Familie geführt. Viele Menschen in Gießen und der Region Gießen kennen uns · weil wir schon ihre Eltern oder Großeltern begleitet haben.</p>
          <p>Was sich seitdem nicht geändert hat: Wer bei uns anruft, spricht mit jemandem, der hier lebt und Verantwortung übernimmt. Sascha Kümmel und unser kleines Team nehmen sich für jedes Gespräch die Zeit, die es braucht.</p>
          <p>Wir sagen Ihnen offen, was eine Bestattung kostet, und raten Ihnen zu nichts, was Sie nicht brauchen. Das ist unser Verständnis von einem Familienbetrieb.</p>
        </div>
      </div>
    </section>""",
"""    <section data-screen-label="Inhaber">
      <div class="shell split">
        <figure class="reveal">
          <!-- Slot sascha-portrait · wird durch generiertes Szenen-Bild ersetzt (Prompts SK-01) -->
          <img src="img/sascha-portrait.jpg" alt="Sascha Kümmel, Inhaber von Kümmel Bestattungen in Gießen">
          <figcaption>Sascha Kümmel · Inhaber</figcaption>
        </figure>
        <div class="reveal">
          <span class="eyebrow">Ihr Inhaber</span>
          <h2>Sascha Kümmel. In sechster Generation.</h2>
          <p>„Mit großem Verantwortungsbewusstsein freue ich mich darauf, in unserem Familienbetrieb Traditionelles mit Modernem zu verbinden. Freundlich, verlässlich und engagiert für Sie da zu sein, das liegt mir am Herzen."</p>
          <p>Unter seiner Leitung betreut Kümmel Bestattungen bereits in der sechsten Generation Sterbefälle in der gesamten Region Gießen und darüber hinaus. Tradition und Heimatverbundenheit sind uns wichtig · genauso wie moderne Angebote und ganz individuelle Abschiedsrituale.</p>
          <p>Unsere wichtigste Aufgabe: Ihnen im Trauerfall beizustehen, so wie Sie es wünschen · mit maximaler Unterstützung bei den Formalitäten und mit viel Zeit zum Zuhören.</p>
        </div>
      </div>
    </section>

    <!-- ============ BESTATTERIN ============ -->
    <section class="teaser" data-screen-label="Bestatterin">
      <div class="shell split">
        <div class="reveal">
          <span class="eyebrow">An Ihrer Seite</span>
          <h2>Maria Kümmel. Herz und Überblick.</h2>
          <p>„Mitmenschlichkeit, Aufmerksamkeit, Einfühlungsvermögen, Organisationstalent, Kreativität und kaufmännisches Wissen kann man in diesem Beruf wunderbar miteinander verbinden."</p>
          <p>Maria Kümmel ist Bestatterin und kümmert sich zugleich um Administration und Buchhaltung. Das immer neue Einfühlen und Begleiten von Menschen, die sich in einer Ausnahmesituation befinden, ist für sie eine erfüllende Aufgabe.</p>
          <p>Hinter Kümmel Bestattungen steht ein eingespieltes Team: Mit Heike Böck, Sascha Linnmann, Steffen Klein, Sabine Klos und Sybille Fritzius sind wir Ihre Ansprechpartner, Zuhörer, Begleiter und Berater · zum Weinen und zum Lachen.</p>
        </div>
        <figure class="reveal">
          <!-- Slot maria-portrait · wird durch generiertes Szenen-Bild ersetzt (Prompts MK-01) -->
          <img src="img/maria-portrait.jpg" alt="Maria Kümmel, Bestatterin bei Kümmel Bestattungen" loading="lazy">
          <figcaption>Maria Kümmel · Bestatterin, Administration und Buchhaltung</figcaption>
        </figure>
      </div>
    </section>""")

# 4) TRUST -> HAUS IN DER TURNSTRASSE
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
"""    <section data-screen-label="Unser Haus">
      <div class="shell editorial">
        <div class="editorial__head reveal">
          <span class="eyebrow">Willkommen in der Turnstraße</span>
          <h2>Räume für den Abschied.</h2>
          <p class="lead">In unserem Bestattungshaus in der Turnstraße 19 empfangen wir Sie mit Empathie, Zeit und Ruhe. Sie möchten lieber zu Hause sprechen? Wir kommen gern zu Ihnen.</p>
        </div>
        <div class="services">
          <div class="reveal">
            <h3>Abschiedsraum der Stille</h3>
            <p>Zeit, um in Ruhe Abschied zu nehmen. Wer noch einmal zum Verstorbenen spricht und ihn berührt, kann den Verlust besser begreifen · der erste wichtige Schritt auf dem Trauerweg.</p>
          </div>
          <div class="reveal">
            <h3>Ausstellungsraum</h3>
            <p>Särge und Urnen zum Anschauen und Anfassen · vom klassischen Design bis zur Urne in Herzform. Wir stehen Ihnen bei jeder Entscheidung beratend zur Seite.</p>
          </div>
          <div class="reveal">
            <h3>Hospiz und Lebenshilfe</h3>
            <p>Die Hospizarbeit und die Lebenshilfe unterstützen wir aus voller Überzeugung · diesen Vereinen fühlen wir uns besonders verbunden.</p>
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
                <span class="label">Instagram</span>
                <a href="https://www.instagram.com/kuemmel_bestattungen/" rel="noopener">@kuemmel_bestattungen folgen</a>
              </li>""")
t=rep(t, "<p><strong>Anfahrt:</strong> Sie finden uns zentral in Gießen, Parkplätze direkt am Haus.</p>",
"<p><strong>Anfahrt:</strong> Turnstraße 19 in Gießen · auf Wunsch kommen wir auch zu Ihnen nach Hause.</p>")

open(P+"index.html","w",encoding="utf-8").write(t)
print("index.html ok")

# Footer-Glättung auf allen Seiten
for f in glob.glob(P+"*.html"):
    s=open(f,encoding="utf-8").read()
    s=s.replace("begleiten wir Familien in Gießen und der Region Gießen","begleiten wir Familien in Gießen und der gesamten Region")
    open(f,"w",encoding="utf-8").write(s)

# 6) IMPRESSUM
t=open(P+"impressum.html",encoding="utf-8").read()
t=rep(t, "Inhaberin/Inhaber: Sascha Kümmel", "Inhaber: Sascha Kümmel")
t=rep(t, """        <h2>Umsatzsteuer</h2>
        <!-- PLATZHALTER: echte USt-IdNr. eintragen oder Absatz entfernen -->
        <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE 000 000 000 (PLATZHALTER · bitte eintragen)</p>""",
"""        <h2>Umsatzsteuer</h2>
        <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE360073497</p>""")
t=rep(t, """        <p>Zuständige Kammer: Handwerkskammer bzw. IHK (PLATZHALTER · bitte eintragen)<br>
        Zuständige Aufsichtsbehörde: Gewerbeamt der Stadt Gießen (PLATZHALTER · bitte prüfen)</p>""",
"""        <p>Zuständige Kammer und Aufsichtsbehörde: werden vor Livegang ergänzt.</p>""")
open(P+"impressum.html","w",encoding="utf-8").write(t)
print("impressum.html ok")
print("KUEMMEL PATCH KOMPLETT")
