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
