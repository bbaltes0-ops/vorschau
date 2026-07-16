/* Waßmann — gemeinsames Verhalten für alle Seiten. */
(function(){
  const body = document.body;
  const sparsam = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Menü (Mobil) ────────────────────────────────────── */
  const mKnopf = document.getElementById('menue-knopf');
  const mPanel = document.getElementById('menue');
  if(mKnopf && mPanel){
    mPanel.hidden = false;              // ohne JS bleibt das Panel weg
    let offen = false;
    const menue = (auf) => {
      offen = auf;
      mPanel.classList.toggle('offen', auf);
      mKnopf.setAttribute('aria-expanded', String(auf));
      mKnopf.textContent = auf ? 'Schließen' : 'Menü';
      body.style.overflow = auf ? 'hidden' : '';
      if(auf){
        // Das Panel ist in diesem Moment noch visibility:hidden (die Klasse .offen
        // wirkt erst im naechsten Frame), und focus() auf ein unsichtbares Element
        // schlaegt STILL fehl -- gemessen: activeElement blieb BODY. Also erst
        // fokussieren, wenn es wirklich sichtbar ist.
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          const ziel = mPanel.querySelector('a');
          if(ziel) ziel.focus({preventScroll:true});
        }));
      } else {
        mKnopf.focus({preventScroll:true});   // Fokus zurueck auf den Ausloeser
      }
    };
    mKnopf.addEventListener('click', ()=>menue(!offen));
    mPanel.addEventListener('click', e=>{ if(e.target.tagName==='A') menue(false); });
    addEventListener('keydown', e=>{ if(e.key==='Escape' && offen) menue(false); });
  }

  /* ── Kopfzeile setzt sich ab ─────────────────────────── */
  const kopf = document.getElementById('kopf');
  if(kopf){
    const wache = document.createElement('div');
    wache.style.cssText='position:absolute;top:0;height:1px;width:1px;pointer-events:none';
    body.prepend(wache);
    new IntersectionObserver(([e]) => kopf.classList.toggle('fest', !e.isIntersecting)).observe(wache);
  }

  /* ── Fallback für Browser ohne animation-timeline (Firefox) ── */
  if(!CSS.supports('animation-timeline','view()') && !sparsam){
    const io = new IntersectionObserver(es=>{
      es.forEach(e=>{
        if(!e.isIntersecting) return;
        e.target.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],
          {duration:800, easing:'cubic-bezier(0.22,1,0.36,1)', fill:'both'});
        io.unobserve(e.target);
      });
    },{rootMargin:'0px 0px -12% 0px'});
    document.querySelectorAll('.auf').forEach(el=>{el.style.opacity='0'; io.observe(el);});

    document.querySelectorAll('.bild:not(.hero-bild)').forEach(el=>{
      el.style.clipPath='inset(0 0 100% 0)';
      new IntersectionObserver((es,o)=>{
        es.forEach(e=>{ if(!e.isIntersecting) return;
          e.target.animate([{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0 0)'}],
            {duration:900, easing:'cubic-bezier(0.22,1,0.36,1)', fill:'both'});
          o.unobserve(e.target);
        });
      },{rootMargin:'0px 0px -8% 0px'}).observe(el);
    });
  }

  /* ── Kontaktformular ─────────────────────────────────────
     Prüft im Browser und meldet zurück. Es gibt noch KEIN Backend --
     der Versand muss serverseitig gebaut werden (siehe README).
     Bis dahin führt der Absenden-Weg ehrlich zu E-Mail statt so zu tun,
     als wäre die Nachricht angekommen. */
  const form = document.getElementById('kontaktformular');
  if(form){
    const status = document.getElementById('formular-status');
    form.addEventListener('submit', e=>{
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('input[required]').forEach(inp=>{
        const feld = inp.closest('.feld');
        const leer = !inp.value.trim();
        feld.classList.toggle('ungueltig', leer);
        if(leer) ok = false;
      });
      if(!ok){
        status.textContent = 'Bitte füllen Sie die markierten Felder aus.';
        form.querySelector('.feld.ungueltig input').focus();
        return;
      }
      const d = new FormData(form);
      const betreff = encodeURIComponent('Anfrage: ' + d.get('anliegen'));
      const text = encodeURIComponent(
        `Name: ${d.get('name')}\nKontakt: ${d.get('kontakt')}\nAnliegen: ${d.get('anliegen')}\n\n${d.get('nachricht')||''}`);
      status.textContent = 'Ihr E-Mail-Programm öffnet sich mit der fertigen Nachricht.';
      location.href = `mailto:info@juwelierwassmann.de?subject=${betreff}&body=${text}`;
    });
    form.querySelectorAll('input').forEach(inp=>{
      inp.addEventListener('input', ()=>inp.closest('.feld').classList.remove('ungueltig'));
    });
  }
})();
