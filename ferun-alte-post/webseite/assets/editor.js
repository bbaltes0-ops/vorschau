/* FERUN Alte Post – Bild-Editor (26.09.2026)
   Jedes Bild mit data-edit ist editierbar:
   - Tauschen: Bild aus der Bibliothek (Leiste rechts) oder Datei vom Rechner auf das Feld ziehen
   - Ausschnitt: Bild mit der Maus verschieben, Mausrad oder +/- zum Zoomen
   - Groesse: Griff unten am Bild ziehen (Feld wird hoeher/flacher)
   Speichert automatisch im Browser (IndexedDB). "Stand sichern" erzeugt medien-data.js fuer alle.
   Vorlage: Medien-Editor aus dem Gatermann-Projekt, erweitert um Bibliothek und Groesse. */
(function(){
  'use strict';
  var d = document, html = d.documentElement;
  var VAR = html.dataset.variante || 'x', SEITE = html.dataset.seite || 'x';
  var BIB_PFAD = (html.dataset.assets || '../assets/') + 'bibliothek/';
  var NUR_ANSICHT = html.hasAttribute('data-ansicht');   /* Kunden-Ansicht: nur den gesicherten Bild-Stand zeigen, kein Werkzeug */
  var hosts = [].slice.call(d.querySelectorAll('.bild[data-edit]'));
  if(!hosts.length) return;
  function key(h){ return 'ferun_' + VAR + '_' + SEITE + '_' + h.dataset.edit; }
  function img(h){ return h.querySelector('img'); }
  hosts.forEach(function(h){ var i = img(h); if(i){ h.dataset.orig = i.getAttribute('src'); } h.dataset.origAr = h.style.aspectRatio || ''; });

  /* ---------- Speicher ---------- */
  var DB = null, dbFehler = false, state = {};
  function dbOpen(cb){ if(DB){ cb(DB); return; } if(dbFehler || !window.indexedDB){ cb(null); return; }
    try{ var rq = indexedDB.open('ferun_medien', 1); rq.onupgradeneeded = function(e){ e.target.result.createObjectStore('m'); };
      rq.onsuccess = function(e){ DB = e.target.result; cb(DB); }; rq.onerror = function(){ dbFehler = true; cb(null); }; }catch(e){ dbFehler = true; cb(null); } }
  function dbPut(k, v){ dbOpen(function(db){ if(!db){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(_){} return; }
    try{ var tx = db.transaction('m', 'readwrite').objectStore('m'); v === null ? tx.delete(k) : tx.put(v, k); }catch(e){} }); }
  function dbAlle(cb){ dbOpen(function(db){ var out = {};
    try{ for(var i = 0; i < localStorage.length; i++){ var lk = localStorage.key(i); if(lk.indexOf('ferun_') === 0){ try{ out[lk] = JSON.parse(localStorage.getItem(lk)); }catch(_){} } } }catch(_){}
    if(!db){ cb(out); return; }
    try{ var rq = db.transaction('m', 'readonly').objectStore('m').openCursor();
      rq.onsuccess = function(e){ var c = e.target.result; if(c){ out[c.key] = c.value; c.continue(); } else cb(out); }; rq.onerror = function(){ cb(out); }; }catch(e){ cb(out); } }); }

  /* ---------- Anwenden ---------- */
  function quelle(src){ return /^bib:/.test(src) ? BIB_PFAD + src.slice(4) : src; }
  function anwenden(h){
    var s = state[key(h)] || {}, i = img(h); if(!i) return;
    var soll = s.src ? quelle(s.src) : h.dataset.orig;
    if(i.getAttribute('src') !== soll){ i.setAttribute('src', soll); i.removeAttribute('srcset'); }
    i.style.setProperty('--px', (s.px == null ? (h.dataset.px || 50) : s.px) + '%');
    i.style.setProperty('--py', (s.py == null ? 50 : s.py) + '%');
    i.style.setProperty('--s', s.s || 1);
    if(!h.hasAttribute('data-fest')) h.style.aspectRatio = s.ar ? String(s.ar) : h.dataset.origAr;
  }
  var toastEl, toastT;
  function toast(t){ if(!toastEl){ toastEl = d.createElement('div'); toastEl.className = 'ed-toast'; d.body.appendChild(toastEl); }
    toastEl.textContent = t; toastEl.classList.add('an'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('an'); }, 1600); }
  var speicherT = {};
  function speichern(h, still){ var k = key(h); clearTimeout(speicherT[k]);
    speicherT[k] = setTimeout(function(){ var s = state[k] || {}; var leer = !s.src && s.px == null && s.py == null && (!s.s || s.s === 1) && !s.ar;
      dbPut(k, leer ? null : s); if(!still) toast('Gespeichert'); }, 180); }
  function laden(){ dbAlle(function(gespeichert){
    var basis = window.FERUN_MEDIA || {};
    hosts.forEach(function(h){ var k = key(h); state[k] = Object.assign({}, basis[k] || {}, gespeichert[k] || {}); anwenden(h); });
    var fv = gespeichert.ferun_favoriten || basis.ferun_favoriten; favs = Array.isArray(fv) ? fv.slice() : [];
    if(!NUR_ANSICHT && typeof filterKnoepfe === 'function'){ filterKnoepfe(); if(raster.children.length) zeichnen(); }
  }); }

  /* ---------- Datei vom Rechner ---------- */
  function verkleinern(datei, cb){ var bi = new Image(); bi.onload = function(){ var max = 2200, w = bi.width, hh = bi.height;
      if(w > max || hh > max){ var r = Math.min(max / w, max / hh); w = Math.round(w * r); hh = Math.round(hh * r); }
      var cv = d.createElement('canvas'); cv.width = w; cv.height = hh; cv.getContext('2d').drawImage(bi, 0, 0, w, hh);
      cb(cv.toDataURL('image/jpeg', .86)); URL.revokeObjectURL(bi.src); }; bi.src = URL.createObjectURL(datei); }
  function neuesBild(h, src){ var s = state[key(h)] = state[key(h)] || {}; s.src = src; s.px = s.py = null; s.s = 1; anwenden(h); speichern(h); h.classList.add('ed-neu'); setTimeout(function(){ h.classList.remove('ed-neu'); }, 700); }
  var waehler = d.createElement('input'); waehler.type = 'file'; waehler.accept = 'image/*'; waehler.hidden = true; d.body.appendChild(waehler);
  var ziel = null;
  waehler.addEventListener('change', function(){ var f = waehler.files[0]; if(ziel && f) verkleinern(f, function(u){ neuesBild(ziel, u); }); waehler.value = ''; });

  /* ---------- Bedienelemente pro Bild ---------- */
  var aktivBib = null;   // Bild aus der Bibliothek, das per Klick gesetzt wird (Tablet)
  hosts.forEach(function(h){
    var ctr = d.createElement('div'); ctr.className = 'ed-ctrl';
    ctr.innerHTML = '<button type="button" data-a="in" title="Vergrößern">+</button><button type="button" data-a="out" title="Verkleinern">−</button>' +
      '<button type="button" data-a="mitte" title="Ausschnitt zurücksetzen">Mitte</button><button type="button" data-a="orig" title="Ursprüngliches Bild">Original</button>' +
      '<button type="button" data-a="datei" title="Datei vom Rechner wählen">Datei</button>';
    h.appendChild(ctr);
    var name = d.createElement('div'); name.className = 'ed-name'; name.textContent = h.dataset.edit; h.appendChild(name);
    if(!h.hasAttribute('data-fest')){ var griff = d.createElement('div'); griff.className = 'ed-griff'; griff.title = 'Ziehen: Bild höher oder flacher'; h.appendChild(griff); griffAn(h, griff); }
    ctr.addEventListener('pointerdown', function(e){ e.stopPropagation(); });
    ctr.addEventListener('click', function(e){ var b = e.target.closest('button'); if(!b) return; e.preventDefault(); e.stopPropagation();
      var s = state[key(h)] = state[key(h)] || {}, a = b.dataset.a;
      if(a === 'in'){ s.s = Math.min((s.s || 1) + .12, 4); }
      else if(a === 'out'){ s.s = Math.max((s.s || 1) - .12, 1); }
      else if(a === 'mitte'){ s.px = s.py = null; s.s = 1; }
      else if(a === 'orig'){ state[key(h)] = {}; }
      else if(a === 'datei'){ ziel = h; waehler.click(); return; }
      anwenden(h); speichern(h); });
    h.addEventListener('wheel', function(e){ if(!aktiv()) return; e.preventDefault(); var s = state[key(h)] = state[key(h)] || {};
      s.s = Math.min(Math.max((s.s || 1) - e.deltaY * .0015, 1), 4); anwenden(h); speichern(h, true); }, {passive:false});
    var zieht = false, x0, y0, px0, py0;
    h.addEventListener('pointerdown', function(e){ if(!aktiv() || e.target.closest('.ed-ctrl,.ed-griff')) return;
      if(aktivBib){ neuesBild(h, 'bib:' + aktivBib); return; }
      zieht = true; h.classList.add('ed-zieht'); x0 = e.clientX; y0 = e.clientY; var s = state[key(h)] = state[key(h)] || {};
      px0 = s.px == null ? +(h.dataset.px || 50) : s.px; py0 = s.py == null ? 50 : s.py; try{ h.setPointerCapture(e.pointerId); }catch(_){} e.preventDefault(); });
    h.addEventListener('pointermove', function(e){ if(!zieht) return; var s = state[key(h)], r = h.getBoundingClientRect(), f = 110 / (s.s || 1);
      s.px = Math.max(0, Math.min(100, px0 - (e.clientX - x0) / r.width * f));
      s.py = Math.max(0, Math.min(100, py0 - (e.clientY - y0) / r.height * f)); anwenden(h); });
    h.addEventListener('pointerup', function(){ if(zieht){ zieht = false; h.classList.remove('ed-zieht'); speichern(h); } });
    h.addEventListener('dragover', function(e){ if(!aktiv()) return; e.preventDefault(); h.classList.add('ed-ueber'); });
    h.addEventListener('dragleave', function(){ h.classList.remove('ed-ueber'); });
    h.addEventListener('drop', function(e){ if(!aktiv()) return; e.preventDefault(); h.classList.remove('ed-ueber');
      var bib = e.dataTransfer.getData('text/x-ferun'); if(bib){ neuesBild(h, 'bib:' + bib); return; }
      var f = e.dataTransfer.files && e.dataTransfer.files[0]; if(f && /^image\//.test(f.type)) verkleinern(f, function(u){ neuesBild(h, u); }); });
  });
  function griffAn(h, g){
    var an = false, y0, h0, w;
    g.addEventListener('pointerdown', function(e){ if(!aktiv()) return; e.preventDefault(); e.stopPropagation(); an = true; var r = h.getBoundingClientRect(); y0 = e.clientY; h0 = r.height; w = r.width; try{ g.setPointerCapture(e.pointerId); }catch(_){} h.classList.add('ed-zieht'); });
    g.addEventListener('pointermove', function(e){ if(!an) return; var hn = Math.max(80, h0 + (e.clientY - y0)); var s = state[key(h)] = state[key(h)] || {};
      s.ar = Math.max(.3, Math.min(4.5, +(w / hn).toFixed(3))); anwenden(h); });
    g.addEventListener('pointerup', function(){ if(an){ an = false; h.classList.remove('ed-zieht'); speichern(h); } });
  }
  function aktiv(){ return d.body.classList.contains('bearbeiten'); }

  if(NUR_ANSICHT){ laden(); return; }
  /* ---------- Werkzeugleiste + Bibliothek ---------- */
  var knopf = d.createElement('button'); knopf.type = 'button'; knopf.className = 'ed-knopf'; knopf.textContent = 'Bilder bearbeiten'; d.body.appendChild(knopf);
  var leiste = d.createElement('div'); leiste.className = 'ed-leiste'; leiste.hidden = true;
  leiste.innerHTML = '<button type="button" data-a="bib">Bibliothek</button><button type="button" data-a="sichern" title="Datei medien-data.js herunterladen und in den Ordner assets legen – dann gilt der Stand für alle">Stand sichern</button>' +
    '<button type="button" data-a="laden">Stand laden</button><button type="button" data-a="reset">Seite zurücksetzen</button>' +
    '<span class="ed-tipp">Ziehen = Ausschnitt · Mausrad = Zoom · Griff unten = Größe · Bild aus der Bibliothek aufs Feld ziehen</span>';
  d.body.appendChild(leiste);
  var bib = d.createElement('aside'); bib.className = 'ed-bib'; bib.setAttribute('aria-label', 'Bildbibliothek');
  bib.innerHTML = '<div class="ed-bib-kopf"><b>Bibliothek</b><button type="button" class="ed-bib-zu" aria-label="Schließen">Schließen</button></div>' +
    '<div class="ed-filter"></div><div class="ed-filter ed-bereich"></div><p class="ed-bib-hinweis">Bild auf ein Feld ziehen. Am Tablet: Bild antippen, dann Feld antippen. <b class="ed-zahl"></b></p><div class="ed-raster"></div>';
  d.body.appendChild(bib);
  var raster = bib.querySelector('.ed-raster'), filter = bib.querySelector('.ed-filter'), bfilter = bib.querySelector('.ed-bereich'), zahl = bib.querySelector('.ed-zahl');
  var bereiche = ['Alle Bereiche', 'Gasthaus', 'Kaminstube', 'Vinothek', 'Bar', 'Greißlerei', 'Küche', 'Biergarten', 'Festsaal', 'Architektur'], bereichWert = 'Alle Bereiche';
  bfilter.innerHTML = bereiche.map(function(g){ return '<button type="button" data-b="' + g + '"' + (g === bereichWert ? ' class="an"' : '') + '>' + g + '</button>'; }).join('');
  bfilter.addEventListener('click', function(e){ var b = e.target.closest('button'); if(!b) return; bereichWert = b.dataset.b;
    [].forEach.call(bfilter.children, function(x){ x.classList.toggle('an', x === b); }); zeichnen(); });
  var liste = window.FERUN_BIB || [], filterWert = 'Alle';
  var gruppen = ['Alle', 'Favoriten', 'Ganzes Haus', 'Stillleben', 'Hero', 'Küche', 'Vinothek', 'Umbau', 'Biergarten', 'Räume', 'Magazin', 'Web-Format', 'Perspektiven', 'Gedeck', 'Essen', 'Getränke', 'Greißlerei', 'Details', 'Hände', 'Außen'];
  /* Favoriten: Stern an jedem Bild, gilt fuer alle Seiten und Varianten, wird mit "Stand sichern" mitgesichert */
  var FAV_KEY = 'ferun_favoriten', favs = [];
  function istFav(f){ return favs.indexOf(f) >= 0; }
  function filterKnoepfe(){
    filter.innerHTML = gruppen.map(function(g){ var n = g === 'Favoriten' ? ' (' + favs.length + ')' : '';
      return '<button type="button" data-f="' + g + '"' + (g === filterWert ? ' class="an"' : '') + (g === 'Favoriten' ? ' data-fav' : '') + '>' + g + n + '</button>'; }).join('');
  }
  var STERN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2 6.3 20.3l1.2-6.4L2.8 9.5l6.4-.8z"/></svg>';
  function zeichnen(){
    var sicht = filterWert === 'Favoriten' ? favs.map(function(f){ return liste.filter(function(b){ return b.f === f; })[0]; }).filter(Boolean)
      : liste.filter(function(b){ return filterWert === 'Alle' || b.k === filterWert; });
    if(bereichWert !== 'Alle Bereiche') sicht = sicht.filter(function(b){ return b.b === bereichWert; });
    if(zahl) zahl.textContent = sicht.length + ' Bilder';
    raster.innerHTML = sicht.length ? sicht.map(function(b){ var fv = istFav(b.f);
      return '<figure draggable="true" data-f="' + b.f + '" title="' + b.f + ' (' + b.w + '×' + b.h + ')"><img loading="lazy" src="' + BIB_PFAD + 'thumb/' + b.f + '" alt="">' +
        '<button type="button" class="ed-stern' + (fv ? ' an' : '') + '" aria-pressed="' + fv + '" aria-label="' + (fv ? 'Aus Favoriten entfernen' : 'Zu Favoriten') + '" title="' + (fv ? 'Aus Favoriten entfernen' : 'Zu Favoriten') + '">' + STERN + '</button>' +
        '<figcaption>' + b.f.replace('.jpg', '') + '</figcaption></figure>'; }).join('')
      : '<p class="ed-leer">' + (filterWert === 'Favoriten' ? 'Noch keine Favoriten. Tippt auf den Stern an einem Bild.' : 'Keine Bilder in dieser Gruppe.') + '</p>';
  }
  function favUmschalten(f){
    var i = favs.indexOf(f); if(i >= 0) favs.splice(i, 1); else favs.unshift(f);
    dbPut(FAV_KEY, favs.length ? favs.slice() : null); toast(i >= 0 ? 'Aus Favoriten entfernt' : 'Zu Favoriten hinzugefügt');
    filterKnoepfe(); zeichnen();
  }
  filterKnoepfe();
  filter.addEventListener('click', function(e){ var b = e.target.closest('button'); if(!b) return; filterWert = b.dataset.f;
    [].forEach.call(filter.children, function(x){ x.classList.toggle('an', x === b); }); zeichnen(); });
  raster.addEventListener('click', function(e){ var st = e.target.closest('.ed-stern'); if(!st) return;
    e.stopPropagation(); e.preventDefault(); favUmschalten(st.closest('figure').dataset.f); }, true);
  raster.addEventListener('dragstart', function(e){ var f = e.target.closest('figure'); if(!f) return; e.dataTransfer.setData('text/x-ferun', f.dataset.f); e.dataTransfer.effectAllowed = 'copy'; });
  raster.addEventListener('click', function(e){ var f = e.target.closest('figure'); if(!f) return;
    var gleich = aktivBib === f.dataset.f; aktivBib = gleich ? null : f.dataset.f;
    [].forEach.call(raster.children, function(x){ x.classList.toggle('an', !gleich && x === f); });
    if(aktivBib) toast('Jetzt ein Bildfeld antippen'); });
  bib.querySelector('.ed-bib-zu').addEventListener('click', function(){ d.body.classList.remove('ed-bib-offen'); });

  function umschalten(an){
    d.body.classList.toggle('bearbeiten', an); leiste.hidden = !an; knopf.textContent = an ? 'Fertig' : 'Bilder bearbeiten';
    if(an){ [].forEach.call(d.querySelectorAll('.reveal,.reveal-text,.split'), function(x){ x.classList.add('sichtbar'); }); if(!raster.children.length) zeichnen(); }
    else { d.body.classList.remove('ed-bib-offen'); aktivBib = null; }
    try{ sessionStorage.setItem('ferun_bearbeiten', an ? '1' : ''); }catch(_){}
  }
  knopf.addEventListener('click', function(){ umschalten(!aktiv()); });
  leiste.addEventListener('click', function(e){ var b = e.target.closest('button'); if(!b) return; var a = b.dataset.a;
    if(a === 'bib'){ if(!raster.children.length) zeichnen(); d.body.classList.toggle('ed-bib-offen'); }
    else if(a === 'sichern') sichern();
    else if(a === 'laden') ladeDatei.click();
    else if(a === 'reset'){ if(!confirm('Alle Bilder dieser Seite auf den Ursprung zurücksetzen?')) return;
      hosts.forEach(function(h){ state[key(h)] = {}; anwenden(h); dbPut(key(h), null); }); toast('Seite zurückgesetzt'); } });

  function sichern(){ dbAlle(function(g){ var alle = Object.assign({}, window.FERUN_MEDIA || {}, g);
    var js = '/* FERUN Bild-Stand, gesichert ' + new Date().toLocaleString('de-DE') + ' – in den Ordner assets/ legen */\nwindow.FERUN_MEDIA = ' + JSON.stringify(alle) + ';\n';
    var a = d.createElement('a'); a.href = URL.createObjectURL(new Blob([js], {type:'application/javascript'})); a.download = 'medien-data.js';
    d.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1500); toast('medien-data.js erstellt'); }); }
  var ladeDatei = d.createElement('input'); ladeDatei.type = 'file'; ladeDatei.accept = '.js,.json'; ladeDatei.hidden = true; d.body.appendChild(ladeDatei);
  ladeDatei.addEventListener('change', function(){ var f = ladeDatei.files[0]; if(!f) return; var r = new FileReader();
    r.onload = function(){ try{ var t = String(r.result), j = JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1));
      Object.keys(j).forEach(function(k){ if(k.indexOf('ferun_') === 0) dbPut(k, j[k]); });
      setTimeout(laden, 300); toast('Stand geladen'); }catch(e){ alert('Die Datei konnte nicht gelesen werden.'); } };
    r.readAsText(f); ladeDatei.value = ''; });

  /* Im Bearbeiten-Modus keine Links aus Bildern heraus */
  d.addEventListener('click', function(e){ if(!aktiv() || e.target.closest('.ed-ctrl,.ed-leiste,.ed-bib,.ed-knopf')) return;
    var a = e.target.closest('a'); if(e.target.closest('.bild[data-edit]') || (a && a.querySelector('.bild[data-edit]'))){ e.preventDefault(); } }, true);
  d.addEventListener('dragstart', function(e){ if(aktiv() && e.target.closest && e.target.closest('.bild[data-edit]')) e.preventDefault(); }, true);

  laden();
  try{ if(sessionStorage.getItem('ferun_bearbeiten') === '1') umschalten(true); }catch(_){}
})();
