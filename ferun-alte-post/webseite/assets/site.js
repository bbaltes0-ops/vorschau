/* FERUN Alte Post – Webseite v2: ruhige Bewegung, Menue, Karte, Formulare (26.09.2026) */
(function(){
  'use strict';
  var d = document;
  d.documentElement.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Vollbild-Menue */
  var vm = d.getElementById('vollmenue'), mk = d.querySelector('.menue-knopf');
  if(vm && mk){
    var zu = vm.querySelector('.menue-zu');
    var auf = function(o){ vm.classList.toggle('offen', o); mk.setAttribute('aria-expanded', o); d.body.style.overflow = o ? 'hidden' : ''; (o ? zu : mk).focus(); };
    mk.addEventListener('click', function(){ auf(true); });
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
  if(st && fuss){ var pr = function(){ st.classList.toggle('weg', fuss.getBoundingClientRect().top < innerHeight - 40); }; addEventListener('scroll', pr, {passive:true}); pr(); }

  /* Karte: aktiver Gang */
  var kn = [].slice.call(d.querySelectorAll('.kartennav a'));
  if(kn.length && 'IntersectionObserver' in window){
    var ko = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) kn.forEach(function(a){ a.classList.toggle('an', a.hash === '#' + e.target.id); }); }); }, {rootMargin:'-35% 0px -60% 0px'});
    kn.forEach(function(a){ var z = d.querySelector(a.hash); if(z) ko.observe(z); });
  }

  /* Galerie: antippen = gross, Pfeile/Wischen = weiter */
  var gal = [].slice.call(d.querySelectorAll('.galerie3 a'));
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
