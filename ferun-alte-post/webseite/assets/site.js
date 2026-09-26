/* FERUN Alte Post – Webseite: Bewegung und Bedienung (26.09.2026) */
(function(){
  'use strict';
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bearbeiten = function(){ return d.body.classList.contains('bearbeiten'); };

  /* Kopfleiste: Zustand beim Scrollen */
  var kopf = d.querySelector('.kopf');
  function kopfZustand(){ if(kopf) kopf.classList.toggle('gescrollt', scrollY > 40); }
  kopfZustand(); addEventListener('scroll', kopfZustand, {passive:true});

  /* Vollbild-Menue */
  var vm = d.getElementById('vollmenue'), mk = d.querySelector('.menue-knopf');
  if(vm && mk){
    var zu = vm.querySelector('.menue-zu'), bilder = [].slice.call(vm.querySelectorAll('.vorschau img'));
    function auf(o){ vm.classList.toggle('offen', o); mk.setAttribute('aria-expanded', o); d.body.style.overflow = o ? 'hidden' : ''; if(o) zu.focus(); }
    mk.addEventListener('click', function(){ auf(true); });
    zu.addEventListener('click', function(){ auf(false); mk.focus(); });
    addEventListener('keydown', function(e){ if(e.key === 'Escape' && vm.classList.contains('offen')) auf(false); });
    [].forEach.call(vm.querySelectorAll('nav a[data-b]'), function(a){
      a.addEventListener('mouseenter', function(){ bilder.forEach(function(i){ i.classList.toggle('an', i.dataset.b === a.dataset.b); }); });
    });
  }

  /* Wort fuer Wort */
  [].forEach.call(d.querySelectorAll('[data-split]'), function(el){
    var i = 0;
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function(w){ return '<span class="w"><span style="--i:' + (i++) + '">' + w + '</span></span>'; }).join(' ');
    el.classList.add('split');
  });

  /* Einblenden beim Scrollen */
  var zeigen = [].slice.call(d.querySelectorAll('.reveal, .reveal-text, .split'));
  function imBild(el){ var r = el.getBoundingClientRect(); return r.top < innerHeight * 0.95 && r.bottom > 0; }
  if('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('sichtbar'); io.unobserve(e.target); } }); }, {rootMargin:'0px 0px -8% 0px', threshold:0.08});
    zeigen.forEach(function(el){ io.observe(el); });
    // Absicherung (z. B. verdeckter Tab, Vorschaubilder): was schon im Bild ist, sofort zeigen
    function sofort(){ zeigen.forEach(function(el){ if(!el.classList.contains('sichtbar') && imBild(el)) el.classList.add('sichtbar'); }); }
    requestAnimationFrame(sofort); setTimeout(sofort, 400); addEventListener('scroll', function(){ setTimeout(sofort, 250); }, {passive:true});
  } else { zeigen.forEach(function(el){ el.classList.add('sichtbar'); }); }

  /* Hero: Bereiche wechseln das Bild, sonst ruhiger Wechsel */
  var hero = d.querySelector('.hero');
  if(hero){
    var slides = [].slice.call(hero.querySelectorAll('.slide')), links = [].slice.call(hero.querySelectorAll('a[data-b]'));
    var spruch = hero.querySelector('.hero-sub'), grundText = spruch ? spruch.innerHTML : '', autoT = 0, reihe = 0, halt = false;
    function setze(b){
      slides.forEach(function(s){ s.classList.toggle('an', s.dataset.b === b); });
      links.forEach(function(a){ a.classList.toggle('an', a.dataset.b === b); });
      var a = links.filter(function(x){ return x.dataset.b === b; })[0];
      if(spruch) spruch.innerHTML = a ? '<span class="hero-spruch">' + a.dataset.spruch + '</span>' : grundText;
      hero.dataset.aktiv = b;
    }
    links.forEach(function(a){
      a.addEventListener('mouseenter', function(){ halt = true; setze(a.dataset.b); });
      a.addEventListener('focus', function(){ halt = true; setze(a.dataset.b); });
      a.addEventListener('click', function(e){ if(bearbeiten()){ e.preventDefault(); setze(a.dataset.b); } });
    });
    var leiste = hero.querySelector('.bereichsleiste, .bereichsliste');
    if(leiste) leiste.addEventListener('mouseleave', function(){ halt = false; });
    var folge = ['start'].concat(links.map(function(a){ return a.dataset.b; }));
    if(!reduce) autoT = setInterval(function(){ if(halt || bearbeiten() || d.hidden) return; reihe = (reihe + 1) % folge.length; setze(folge[reihe]); }, 6500);
    setze('start');
  }

  /* Parallax auf grossen Bildern + drehender Teller */
  var par = [].slice.call(d.querySelectorAll('.bild[data-parallax] .par'));
  var teller = [].slice.call(d.querySelectorAll('.teller'));
  var stempel = d.querySelector('.stempel'), fuss = d.querySelector('.fuss');
  function tick(){
    var h = innerHeight;
    if(!reduce){
      par.forEach(function(p){
        var r = p.parentNode.getBoundingClientRect(); if(r.bottom < 0 || r.top > h) return;
        var t = (r.top + r.height / 2 - h / 2) / (h + r.height);        // -0.5 .. 0.5
        p.style.transform = 'translate3d(0,' + (t * -9).toFixed(2) + '%,0)';
      });
      teller.forEach(function(t){
        var r = t.parentNode.getBoundingClientRect();
        t.style.transform = 'rotate(' + ((h - r.top) * 0.22).toFixed(1) + 'deg)';
      });
    }
    if(stempel && fuss){ stempel.classList.toggle('weg', fuss.getBoundingClientRect().top < h - 60); }
    ticking = false;
  }
  var ticking = false;
  function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(tick); } }
  addEventListener('scroll', onScroll, {passive:true}); addEventListener('resize', onScroll); tick();

  /* Vorschau-Bild folgt dem Mauszeiger ueber Listen */
  var mv = d.createElement('div'); mv.className = 'maus-vorschau'; mv.innerHTML = '<img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">'; d.body.appendChild(mv);
  var mvi = mv.firstChild, fein = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if(fein && !reduce){
    [].forEach.call(d.querySelectorAll('[data-vorschau]'), function(el){
      el.addEventListener('mouseenter', function(){ mvi.src = el.dataset.vorschau; mv.classList.add('an'); });
      el.addEventListener('mouseleave', function(){ mv.classList.remove('an'); });
      el.addEventListener('mousemove', function(e){ mv.style.left = (e.clientX + 150) + 'px'; mv.style.top = e.clientY + 'px'; });
    });
  }

  /* Streifen mit der Maus ziehen */
  [].forEach.call(d.querySelectorAll('.streifen'), function(s){
    var an = false, x0 = 0, l0 = 0, bewegt = false;
    s.addEventListener('pointerdown', function(e){ if(e.pointerType !== 'mouse' || bearbeiten()) return; an = true; bewegt = false; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('zieht'); });
    addEventListener('pointermove', function(e){ if(!an) return; var dx = e.clientX - x0; if(Math.abs(dx) > 4) bewegt = true; s.scrollLeft = l0 - dx; });
    addEventListener('pointerup', function(){ an = false; s.classList.remove('zieht'); });
    s.addEventListener('click', function(e){ if(bewegt){ e.preventDefault(); e.stopPropagation(); } }, true);
  });

  /* Karte: aktiver Gang in der Leiste */
  var kn = [].slice.call(d.querySelectorAll('.kartennav a'));
  if(kn.length && 'IntersectionObserver' in window){
    var ko = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ kn.forEach(function(a){ a.classList.toggle('an', a.hash === '#' + e.target.id); }); } }); }, {rootMargin:'-40% 0px -55% 0px'});
    kn.forEach(function(a){ var z = d.querySelector(a.hash); if(z) ko.observe(z); });
  }

  /* Kastanien-Schatten-Video: nur abspielen, wenn sichtbar */
  [].forEach.call(d.querySelectorAll('.schatten video'), function(v){
    if(reduce){ v.removeAttribute('autoplay'); v.pause(); return; }
    var los = function(){ v.play().catch(function(){}); };
    if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es[0].isIntersecting ? los() : v.pause(); }).observe(v); } else los();
  });

  /* Formulare ohne Server: fertige E-Mail an Holger oeffnen */
  [].forEach.call(d.querySelectorAll('form[data-mail]'), function(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var felder = [].slice.call(f.querySelectorAll('input,select,textarea')).filter(function(x){ return x.name; });
      var fehlt = felder.filter(function(x){ return x.required && !x.value.trim(); });
      var fehler = f.querySelector('.fehler'); if(fehler) fehler.hidden = !fehlt.length;
      if(fehlt.length){ fehlt[0].focus(); return; }
      var text = 'Grüß Gott,\n\n' + felder.map(function(x){ return (x.dataset.label || x.name) + ': ' + x.value.trim(); }).join('\n') + '\n';
      location.href = 'mailto:' + f.dataset.mail + '?subject=' + encodeURIComponent(f.dataset.betreff || 'Anfrage') + '&body=' + encodeURIComponent(text);
      var danke = f.querySelector('.danke'); if(danke) danke.hidden = false;
    });
  });
})();
