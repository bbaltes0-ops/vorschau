/* FERUN Alte Post – Webseite v2: ruhige Bewegung, Menue, Karte, Formulare (26.09.2026) */
(function(){
  'use strict';
  var d = document;
  d.documentElement.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Vollbild-Menue */
  var vm = d.getElementById('vollmenue'), mks = [].slice.call(d.querySelectorAll('.menue-knopf')), mk = mks[0];
  if(vm && mk){
    var zu = vm.querySelector('.menue-zu');
    var auf = function(o){ vm.classList.toggle('offen', o); mks.forEach(function(k){ k.setAttribute('aria-expanded', o); }); d.body.style.overflow = o ? 'hidden' : '';
      if(o){ zu.focus(); } else { (mks.filter(function(k){ return k.offsetParent; })[0] || mk).focus(); } };
    mks.forEach(function(k){ k.addEventListener('click', function(){ auf(true); }); });
    zu.addEventListener('click', function(){ auf(false); });
    addEventListener('keydown', function(e){ if(e.key === 'Escape' && vm.classList.contains('offen')) auf(false); });
  }

  /* Sanftes Einblenden */
  var el = [].slice.call(d.querySelectorAll('.fade'));
  var zeige = function(x){ x.classList.add('sichtbar'); };
  if('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ zeige(e.target); io.unobserve(e.target); } }); }, {rootMargin:'0px 0px -6% 0px'});
    el.forEach(function(x){ io.observe(x); });
    var sofort = function(){ el.forEach(function(x){ var r = x.getBoundingClientRect(); if(r.top < innerHeight && r.bottom > 0) zeige(x); }); };
    requestAnimationFrame(sofort); setTimeout(sofort, 500);
  } else el.forEach(zeige);

  /* Stempel ausblenden, sobald der Fuss kommt */
  var st = d.querySelector('.stempel'), fuss = d.querySelector('.fuss');
  if(st && fuss){
    /* Grundfarbe: ueber Fotos hell, ueber hellem Grund Salbei (damit er nicht untergeht) */
    var pruefe = function(){
      st.classList.toggle('weg', fuss.getBoundingClientRect().top < innerHeight - 40);
      var r = st.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, aufBild = false;
      st.style.pointerEvents = 'none';
      var unter = d.elementsFromPoint ? d.elementsFromPoint(x, y) : [];
      st.style.pointerEvents = '';
      for(var k = 0; k < unter.length; k++){ var e = unter[k]; if(e === st || st.contains(e)) continue;
        if(e.tagName === 'IMG' || e.tagName === 'VIDEO' || (e.closest && e.closest('.bild, .hero-foto, .l2-buehne'))){ aufBild = true; } break; }
      st.classList.toggle('auf-grund', !aufBild);
    };
    var tp = false; addEventListener('scroll', function(){ if(!tp){ tp = true; requestAnimationFrame(function(){ pruefe(); tp = false; }); } }, {passive:true});
    addEventListener('resize', pruefe); addEventListener('load', pruefe); pruefe();
  }

  /* Karte: aktiver Gang */
  var kn = [].slice.call(d.querySelectorAll('.kartennav a'));
  if(kn.length && 'IntersectionObserver' in window){
    var leiste = kn[0].parentNode;
    var mitziehen = function(a){ var ziel = a.offsetLeft - leiste.offsetLeft - parseFloat(getComputedStyle(leiste).paddingLeft || 0);
      if(Math.abs(leiste.scrollLeft - ziel) > 4) leiste.scrollTo({left:Math.max(0, ziel), behavior: reduce ? 'auto' : 'smooth'}); };
    var ko = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) kn.forEach(function(a){ var an = a.hash === '#' + e.target.id; a.classList.toggle('an', an); if(an) mitziehen(a); }); }); }, {rootMargin:'-35% 0px -60% 0px'});
    kn.forEach(function(a){ var z = d.querySelector(a.hash); if(z) ko.observe(z); });
    /* ganz unten: letzten Gang markieren, auch wenn er die Mitte nie erreicht */
    var letzter = kn[kn.length - 1], lz = d.querySelector(letzter.hash);
    addEventListener('scroll', function(){ if(!lz) return; var r = lz.getBoundingClientRect();
      if(r.bottom > 0 && r.bottom < innerHeight * .9 && r.top < innerHeight * .6){
        kn.forEach(function(a){ a.classList.toggle('an', a === letzter); }); mitziehen(letzter); } }, {passive:true});
  }

  /* Galerie: antippen = gross, Pfeile/Wischen = weiter */
  var gal = [].slice.call(d.querySelectorAll('.galerie3 a, .l2-bahn a'));
  if(gal.length){
    var lb = d.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Bild vergrößert');
    lb.innerHTML = '<div class="oben"><span class="caps zaehler"></span><button type="button" class="caps zu">Schließen</button></div>' +
      '<div class="buehne"><button type="button" class="zur" aria-label="Vorheriges Bild">‹</button><img alt=""><button type="button" class="vor" aria-label="Nächstes Bild">›</button></div><div class="unten"></div>';
    d.body.appendChild(lb);
    var lbImg = lb.querySelector('img'), lbZ = lb.querySelector('.zaehler'), lbT = lb.querySelector('.unten'), idx = 0, zuvor = null;
    var zeig = function(i){ idx = (i + gal.length) % gal.length; var im = gal[idx].querySelector('img');
      lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt; lbT.textContent = im.alt; lbZ.textContent = (idx + 1) + ' / ' + gal.length; };
    var oeffne = function(i){ zuvor = d.activeElement; zeig(i); lb.classList.add('offen'); d.body.style.overflow = 'hidden'; lb.querySelector('.zu').focus(); };
    var schliesse = function(){ lb.classList.remove('offen'); d.body.style.overflow = ''; if(zuvor) zuvor.focus(); };
    gal.forEach(function(a, i){ a.addEventListener('click', function(e){ if(d.body.classList.contains('bearbeiten')) return; e.preventDefault(); oeffne(i); }); });
    lb.querySelector('.zu').addEventListener('click', schliesse);
    lb.querySelector('.vor').addEventListener('click', function(){ zeig(idx + 1); });
    lb.querySelector('.zur').addEventListener('click', function(){ zeig(idx - 1); });
    lb.addEventListener('click', function(e){ if(e.target === lb || e.target.classList.contains('buehne')) schliesse(); });
    addEventListener('keydown', function(e){ if(!lb.classList.contains('offen')) return;
      if(e.key === 'Escape') schliesse(); else if(e.key === 'ArrowRight') zeig(idx + 1); else if(e.key === 'ArrowLeft') zeig(idx - 1); });
    var tx = null;
    lbImg.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; }, {passive:true});
    lbImg.addEventListener('touchend', function(e){ if(tx === null) return; var dx = e.changedTouches[0].clientX - tx; if(Math.abs(dx) > 40) zeig(idx + (dx < 0 ? 1 : -1)); tx = null; });
  }

  /* Schatten-Video nur abspielen, wenn sichtbar */
  [].forEach.call(d.querySelectorAll('.schatten video'), function(v){
    if(reduce){ v.pause(); return; }
    var los = function(){ v.play().catch(function(){}); };
    if('IntersectionObserver' in window) new IntersectionObserver(function(es){ es[0].isIntersecting ? los() : v.pause(); }).observe(v); else los();
  });

  /* Intro: das Kastanienblatt zeichnet sich (wie Coming Soon), loest sich auf, dann die Seite */
  var intro = d.getElementById('intro');
  if(intro && !intro.hidden){
    var iv = intro.querySelector('video'), fertig = false;
    d.body.style.overflow = 'hidden';
    var ende = function(){
      if(fertig) return; fertig = true;
      try{ sessionStorage.setItem('ferun_intro', '1'); }catch(_){}
      intro.classList.add('aus'); d.body.style.overflow = '';
      setTimeout(function(){ intro.hidden = true; d.documentElement.classList.remove('mit-intro'); }, 1100);
    };
    iv.playbackRate = 1.43;
    iv.addEventListener('ended', function(){ iv.classList.add('weg'); setTimeout(ende, 650); });
    intro.addEventListener('click', ende);
    addEventListener('keydown', function(e){ if(!fertig && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) ende(); });
    setTimeout(function(){ var p = iv.play(); if(p && p.catch) p.catch(ende); iv.playbackRate = 1.43; iv.classList.add('an'); }, 200);
    setTimeout(ende, 9000);                                   // Sicherheit, falls das Video nicht startet
  }

  /* Tisch reservieren: Pop-up statt Seitenwechsel */
  var TEL = '+49 162 230 82 14', MAIL = 'holger.brunk@ferun.de';
  var pers = ''; for(var n = 1; n <= 10; n++) pers += '<option>' + n + '</option>';
  var rs = d.createElement('div'); rs.className = 'res'; rs.id = 'reservieren'; rs.setAttribute('role', 'dialog'); rs.setAttribute('aria-modal', 'true'); rs.setAttribute('aria-labelledby', 'res-titel');
  rs.innerHTML = '<div class="res-karte"><button type="button" class="res-zu caps" aria-label="Schließen">Schließen</button>' +
    '<span class="caps eyebrow">FERUN Alte Post</span><h2 id="res-titel">Ein Tischerl für Euch.</h2>' +
    '<p class="res-sub">Schreibt uns, wir melden uns mit einer Bestätigung. Lieber persönlich? <a href="tel:' + TEL.replace(/\s/g, '') + '">' + TEL + '</a></p>' +
    '<form class="formular" data-mail="' + MAIL + '" data-betreff="Tischreservierung" novalidate>' +
    '<div class="feld"><label class="caps" for="p-datum">Datum</label><input id="p-datum" name="datum" type="date" required data-label="Datum"></div>' +
    '<div class="feld"><label class="caps" for="p-zeit">Uhrzeit</label><input id="p-zeit" name="zeit" type="time" data-label="Uhrzeit"></div>' +
    '<div class="feld"><label class="caps" for="p-pers">Personen</label><select id="p-pers" name="personen" data-label="Personen">' + pers + '<option>mehr als 10</option></select></div>' +
    '<div class="feld"><label class="caps" for="p-wo">Wo</label><select id="p-wo" name="bereich" data-label="Wo"><option>Gasthaus</option><option>Kaminstube</option><option>Biergarten</option><option>Bar</option><option>Egal</option></select></div>' +
    '<div class="feld"><label class="caps" for="p-name">Name</label><input id="p-name" name="name" autocomplete="name" required data-label="Name"></div>' +
    '<div class="feld"><label class="caps" for="p-kontakt">Telefon oder E-Mail</label><input id="p-kontakt" name="kontakt" autocomplete="email" required data-label="Kontakt"></div>' +
    '<div class="feld voll"><label class="caps" for="p-text">Wünsche (freiwillig)</label><textarea id="p-text" name="wunsch" data-label="Wünsche"></textarea></div>' +
    '<p class="klein fehler voll" hidden>Bitte Datum, Name und Telefon oder E-Mail angeben.</p>' +
    '<div class="voll"><button class="knopf voll" type="submit">Anfrage senden</button></div>' +
    '<p class="danke voll" hidden>Danke! Euer E-Mail-Programm öffnet sich mit der fertigen Anfrage – nur noch auf Senden drücken.</p></form></div>';
  d.body.appendChild(rs);
  var resVorher = null;
  var resAuf = function(){ resVorher = d.activeElement; rs.classList.add('offen'); d.body.style.overflow = 'hidden'; setTimeout(function(){ rs.querySelector('#p-datum').focus(); }, 60); };
  var resZu = function(){ rs.classList.remove('offen'); d.body.style.overflow = ''; if(resVorher) resVorher.focus(); };
  d.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('[data-res]');
    if(!a || d.body.classList.contains('bearbeiten')) return;
    e.preventDefault(); if(vm && vm.classList.contains('offen')){ vm.classList.remove('offen'); mk.setAttribute('aria-expanded', false); }
    resAuf();
  });
  rs.querySelector('.res-zu').addEventListener('click', resZu);
  rs.addEventListener('click', function(e){ if(e.target === rs) resZu(); });
  addEventListener('keydown', function(e){ if(e.key === 'Escape' && rs.classList.contains('offen')) resZu(); });

  /* Formulare ohne Server: fertige E-Mail an Holger */
  [].forEach.call(d.querySelectorAll('form[data-mail]'), function(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var felder = [].slice.call(f.querySelectorAll('input,select,textarea')).filter(function(x){ return x.name; });
      var fehlt = felder.filter(function(x){ return x.required && !x.value.trim(); });
      var fe = f.querySelector('.fehler'); if(fe) fe.hidden = !fehlt.length;
      if(fehlt.length){ fehlt[0].focus(); return; }
      var text = 'Grüß Gott,\n\n' + felder.map(function(x){ return (x.dataset.label || x.name) + ': ' + x.value.trim(); }).join('\n') + '\n';
      location.href = 'mailto:' + f.dataset.mail + '?subject=' + encodeURIComponent(f.dataset.betreff || 'Anfrage') + '&body=' + encodeURIComponent(text);
      var dk = f.querySelector('.danke'); if(dk) dk.hidden = false;
    });
  });
})();

/* Variante Linie: Verzeichnis wechselt das Bild im Rahmen */
(function(){
  var liste = document.querySelector('.l-liste'), rahmen = document.querySelector('.l-rahmen');
  if(!liste || !rahmen) return;
  var bilder = [].slice.call(rahmen.querySelectorAll('.l-rbild')), links = [].slice.call(liste.querySelectorAll('a[data-i]')), text = rahmen.querySelector('.l-rtext');
  var setze = function(i){ bilder.forEach(function(b){ b.classList.toggle('an', b.dataset.i === String(i)); });
    links.forEach(function(a){ a.classList.toggle('an', a.dataset.i === String(i)); });
    var li = links[i] && links[i].parentNode; if(text && li) text.textContent = li.querySelector('.l-was').textContent; };
  links.forEach(function(a){ a.addEventListener('mouseenter', function(){ setze(a.dataset.i); }); a.addEventListener('focus', function(){ setze(a.dataset.i); }); });
  setze(0);
})();

/* Variante Linie v2: Buehne, Querfahrt, Parallax, Maus-Kreis */
(function(){
  var d = document, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bearb = function(){ return d.body.classList.contains('bearbeiten'); };

  /* Buehne: Zeichnung -> Foto, dann ruhiger Wechsel */
  [].forEach.call(d.querySelectorAll('.l2-buehne'), function(bu){
    var hero = bu.closest('.l2-hero'), slides = [].slice.call(bu.querySelectorAll('.l2-slide'));
    var cap = hero.querySelector('.l2-cap'), fort = hero.querySelector('.l2-fort i'), i = 0, DAUER = 6500, t = 0;
    var lauf = function(){ if(!fort) return; fort.classList.remove('lauf'); void fort.offsetWidth; fort.style.setProperty('--dauer', DAUER + 'ms'); fort.classList.add('lauf'); };
    var weiter = function(){ if(bearb() || d.hidden || slides.length < 2){ t = setTimeout(weiter, DAUER); return; }
      slides[i].classList.remove('an'); i = (i + 1) % slides.length; slides[i].classList.add('an');
      var im = slides[i].querySelector('img'); if(im && im.loading === 'lazy') im.loading = 'eager';
      if(cap){ cap.style.opacity = 0; setTimeout(function(){ cap.textContent = slides[i].dataset.t; cap.style.opacity = 1; }, 400); }
      lauf(); t = setTimeout(weiter, DAUER); };
    var start = function(){ bu.classList.add('offen'); if(!reduce){ lauf(); t = setTimeout(weiter, DAUER); } };
    if(bu.classList.contains('mit-skizze')){
      var gesehen = false; try{ gesehen = !!sessionStorage.getItem('ferun_skizze'); }catch(_){}
      if(reduce || gesehen || bearb()){ bu.classList.add('offen'); var p = bu.querySelector('.l2-papier'); if(p) p.remove(); start(); }
      else { setTimeout(start, 2300); try{ sessionStorage.setItem('ferun_skizze', '1'); }catch(_){} }
    } else start();
  });

  /* Querfahrt: senkrechtes Scrollen bewegt die Bilder seitwaerts (nur grosse Bildschirme) */
  var quer = [].slice.call(d.querySelectorAll('.l2-quer'));
  var mq = matchMedia('(min-width: 861px)');
  function masse(){
    quer.forEach(function(q){ var bahn = q.querySelector('.l2-bahn');
      if(!mq.matches || reduce){ q.style.height = ''; bahn.style.transform = ''; return; }
      var weg = Math.max(0, bahn.scrollWidth - innerWidth);
      q._weg = weg; q.style.height = (q.querySelector('.l2-pin').offsetHeight + weg) + 'px'; });
    tick();
  }
  var band = [].slice.call(d.querySelectorAll('.l2-band-bild .bild'));
  function tick(){
    quer.forEach(function(q){ if(!mq.matches || reduce || !q._weg) return;
      var r = q.getBoundingClientRect(), pin = q.querySelector('.l2-pin'), gesamt = q.offsetHeight - pin.offsetHeight;
      var pr = Math.min(1, Math.max(0, (-r.top + (parseFloat(getComputedStyle(pin).top) || 0)) / (gesamt || 1)));
      q.querySelector('.l2-bahn').style.transform = 'translate3d(' + (-pr * q._weg).toFixed(1) + 'px,0,0)'; });
    if(!reduce) band.forEach(function(b){ var r = b.parentNode.getBoundingClientRect(); if(r.bottom < 0 || r.top > innerHeight) return;
      var pr = (r.top + r.height / 2 - innerHeight / 2) / (innerHeight + r.height); b.style.transform = 'translate3d(0,' + (pr * -14).toFixed(2) + '%,0)'; });
  }
  var tk = false;
  addEventListener('scroll', function(){ if(!tk){ tk = true; requestAnimationFrame(function(){ tick(); tk = false; }); } }, {passive:true});
  addEventListener('resize', masse); addEventListener('load', masse); masse();
  [].forEach.call(d.querySelectorAll('.l2-bahn img'), function(im){ im.addEventListener('load', masse); });

  /* Maus-Kreis mit Hinweis */
  if(!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches && d.querySelector('.l2-hero')){
    var m = d.createElement('div'); m.className = 'l2-maus'; m.innerHTML = '<span></span>'; d.body.appendChild(m);
    var sp = m.firstChild, x = 0, y = 0, mx = 0, my = 0;
    addEventListener('mousemove', function(e){ x = e.clientX; y = e.clientY; m.classList.add('an'); });
    d.addEventListener('mouseleave', function(){ m.classList.remove('an'); });
    (function schleife(){ mx += (x - mx) * .2; my += (y - my) * .2; m.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)'; requestAnimationFrame(schleife); })();
    var ziel = function(sel, txt){ [].forEach.call(d.querySelectorAll(sel), function(el){
      el.addEventListener('mouseenter', function(){ sp.textContent = txt; m.classList.add('gross'); });
      el.addEventListener('mouseleave', function(){ m.classList.remove('gross'); }); }); };
    ziel('.l2-bahn a', 'Ansehen'); ziel('.l-liste a', 'Entdecken'); ziel('.l2-buehne', 'FERUN');
  }

/* Die Alte Post: Zeichnung zeichnet sich beim Hinscrollen, alte Aufnahmen legen sich dazu */
(function(){
  var f = document.querySelector('.ap-feld'); if(!f) return;
  if(!('IntersectionObserver' in window)){ f.classList.add('ap-an'); return; }
  var los = function(){ f.classList.add('ap-an'); var sk = f.querySelector('img.ap-skizze'); if(sk) hausZeichnen(sk); };
  var o = new IntersectionObserver(function(es){ if(es[0].isIntersecting){ los(); o.disconnect(); } }, {threshold:.25});
  o.observe(f);
})();
/* Hauszeichnung Strich fuer Strich: Die echten Linien (haus_linien.js) sind der Weg des Stifts,
   sichtbar ist immer die Originalzeichnung genau dort, wo der Stift schon war.
   Reihenfolge wie beim Hausbau: tragende Linien von unten nach oben, dann Fenster und Details, dann Schraffur. */
function hausZeichnen(img){
  var D = window.FERUN_HAUS, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fertig = function(){ img.classList.add('gezeichnet'); };
  if(!D || reduce || !img.complete || !img.naturalWidth){ if(!D || reduce) fertig(); else img.addEventListener('load', function(){ hausZeichnen(img); }, {once:true}); return; }
  var r = img.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
  var cw = Math.max(1, Math.round(r.width * dpr)), ch = Math.round(cw * D.h / D.w), sc = cw / D.w;
  var cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; cv.className = img.className + ' ap-leinwand'; cv.setAttribute('aria-hidden', 'true');
  var m = document.createElement('canvas'); m.width = cw; m.height = ch;
  var c = cv.getContext('2d'), mc = m.getContext('2d');
  img.parentNode.insertBefore(cv, img.nextSibling); img.style.display = 'none';
  mc.lineCap = mc.lineJoin = 'round'; mc.strokeStyle = '#000';
  /* Linien vorbereiten */
  var zufall = function(i){ var x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
  var L = D.l.map(function(l, i){
    var p = l.slice(1), n = p.length / 2, cum = [0], yc = 0, xc = 0, len = 0;
    for(var k = 1; k < n; k++){ len += Math.hypot(p[2*k] - p[2*k-2], p[2*k+1] - p[2*k-1]); cum.push(len); }
    for(var k2 = 0; k2 < n; k2++){ xc += p[2*k2]; yc += p[2*k2+1]; } xc /= n; yc /= n;
    var t0, v, VOR = .32, rnd = zufall(i);
    if(len >= 200){ t0 = .5 * (1 - yc / D.h); v = 2600; }                       /* tragende Linien, von unten */
    else if(yc < 345){ t0 = 1.45 + .75 * Math.abs(xc - 696) / 705 + .08 * rnd; v = len >= 20 ? 1100 : 600; }   /* Dach: von der Spitze nach aussen */
    else { var hw = Math.min(1, Math.max(0, (795 - yc) / 450));                  /* Mauern: Stockwerk fuer Stockwerk */
      if(len >= 20){ t0 = .35 + 1.1 * hw + .2 * rnd; v = 950; } else { t0 = .55 + 1.1 * hw + .25 * rnd; v = 520; } }
    return {p:p, cum:cum, len:len, t0:t0 + VOR, v:v, w:Math.min(7, Math.max(4.5, l[0] * 2.8)) * sc, gez:0, k:1};
  }).filter(function(x){ return x.len > 0; }).sort(function(a, b){ return a.t0 - b.t0; });
  var ende = 0; L.forEach(function(x){ ende = Math.max(ende, x.t0 + x.len / x.v); });
  /* Hilfslinien wie auf dem Reissbrett: Boden, Waende, Achse, Dachschraegen (ueberstehend) */
  var HILF = [[60,795,1340,795],[163,850,163,290],[1231,850,1231,290],[696,850,696,-20],[-30,223,760,-20],[1430,221,630,-20],[0,340,1400,340]];
  var kupfer = getComputedStyle(document.documentElement).getPropertyValue('--kupfer').trim() || '#AC845B';
  var naechste = 0, aktiv = [], start = null;
  function schritt(ts){
    if(start === null) start = ts;
    var t = (ts - start) / 1000;
    while(naechste < L.length && L[naechste].t0 <= t) aktiv.push(L[naechste++]);
    aktiv = aktiv.filter(function(x){
      var soll = Math.min(x.len, (t - x.t0) * x.v); if(soll <= x.gez) return x.gez < x.len;
      var p = x.p, cum = x.cum;
      mc.beginPath();
      var k = x.k, f0 = cum[k] > cum[k-1] ? (x.gez - cum[k-1]) / (cum[k] - cum[k-1]) : 0;
      mc.moveTo((p[2*k-2] + (p[2*k] - p[2*k-2]) * f0) * sc, (p[2*k-1] + (p[2*k+1] - p[2*k-1]) * f0) * sc);
      while(k < cum.length - 1 && cum[k] <= soll){ mc.lineTo(p[2*k] * sc, p[2*k+1] * sc); k++; }
      var f = cum[k] > cum[k-1] ? Math.min(1, (soll - cum[k-1]) / (cum[k] - cum[k-1])) : 1;
      mc.lineTo((p[2*k-2] + (p[2*k] - p[2*k-2]) * f) * sc, (p[2*k-1] + (p[2*k+1] - p[2*k-1]) * f) * sc);
      mc.globalAlpha = .3; mc.lineWidth = x.w * 1.9; mc.stroke();   /* weicher Tintenrand */
      mc.globalAlpha = 1; mc.lineWidth = x.w; mc.stroke(); x.k = k; x.gez = soll;
      return soll < x.len;
    });
    c.globalCompositeOperation = 'copy'; c.drawImage(m, 0, 0);
    c.globalCompositeOperation = 'source-in'; c.drawImage(img, 0, 0, cw, ch);
    /* am Ende die letzten Feinheiten sanft vervollstaendigen, dann das Originalbild zeigen */
    /* Hilfslinien: schnell gezogen, am Ende ausgeblendet */
    var ha = t < ende - .7 ? .75 : Math.max(0, .75 * (ende - .1 - t) / .6);
    if(ha > 0){ c.globalCompositeOperation = 'source-over'; c.strokeStyle = kupfer; c.lineWidth = Math.max(1, dpr * .8); c.globalAlpha = ha;
      HILF.forEach(function(h, i){ var q = Math.min(1, Math.max(0, (t - i * .06) / .42)); if(!q) return; q = 1 - Math.pow(1 - q, 3);
        c.beginPath(); c.moveTo(h[0] * sc, h[1] * sc); c.lineTo((h[0] + (h[2] - h[0]) * q) * sc, (h[1] + (h[3] - h[1]) * q) * sc); c.stroke(); });
      c.globalAlpha = 1; }
    if(t > ende){ c.globalCompositeOperation = 'source-over'; c.globalAlpha = Math.min(1, (t - ende) / .45); c.drawImage(img, 0, 0, cw, ch); c.globalAlpha = 1; }
    if(t < ende + .45) requestAnimationFrame(schritt);
    else { img.style.display = ''; img.classList.add('gezeichnet', 'sofort'); cv.remove(); }
  }
  requestAnimationFrame(schritt);
}
/* Vorher / Nachher */
[].forEach.call(document.querySelectorAll('.vn'), function(v){
  var r = v.querySelector('.vn-regler'); if(!r) return;
  var setz = function(){ v.style.setProperty('--pos', r.value + '%'); };
  r.addEventListener('input', setz); setz();
});
})();
