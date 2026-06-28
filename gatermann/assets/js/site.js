(function(){
  document.documentElement.classList.add('js');
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var page = (location.pathname.split('/').pop()||'index.html').replace('.html','')||'index';

  /* ---------- Intro (nur Start, manuell schließen) ---------- */
  var intro=document.getElementById('intro');
  if(intro){
    var seen=false; try{seen=sessionStorage.getItem('gm_intro')==='1';}catch(e){}
    function endIntro(){ intro.classList.add('done'); document.body.classList.remove('intro-active'); try{sessionStorage.setItem('gm_intro','1');}catch(e){} setTimeout(function(){intro.style.display='none';},950); }
    if(rm||seen){ endIntro(); }
    var eb=document.getElementById('introEnter'); if(eb) eb.addEventListener('click', endIntro);
  }

  /* ---------- Header ---------- */
  var header=document.getElementById('header');
  if(header){ var onScroll=function(){header.classList.toggle('scrolled',window.scrollY>20);}; onScroll(); window.addEventListener('scroll',onScroll,{passive:true}); }

  /* ---------- Burger + Dropdown ---------- */
  var burger=document.getElementById('burger'), navLinks=document.getElementById('navLinks'), backdrop=document.getElementById('navBackdrop');
  function closeMenu(){ if(!navLinks)return; navLinks.classList.remove('open'); if(burger)burger.classList.remove('open'); document.body.classList.remove('menu-open'); }
  if(burger&&navLinks){
    burger.addEventListener('click',function(){var o=navLinks.classList.toggle('open');burger.classList.toggle('open',o);document.body.classList.toggle('menu-open',o);});
    navLinks.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){
      if(a.classList.contains('top'))return; closeMenu();});});
    if(backdrop) backdrop.addEventListener('click',closeMenu);
  }
  document.querySelectorAll('.nav-item>a.top').forEach(function(t){
    t.addEventListener('click',function(e){ if(window.matchMedia('(max-width:1080px)').matches){ e.preventDefault(); t.parentNode.classList.toggle('open'); } });
  });

  /* ---------- Reveal ---------- */
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.14,rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
  } else { document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in');}); }

  /* ---------- Aktiver Navi-Status ---------- */
  document.querySelectorAll('.nav-links a').forEach(function(a){
    var href=a.getAttribute('href')||'';
    if((href===page+'.html')||(page==='index'&&href==='index.html')) a.classList.add('active');
  });

  /* ---------- Karten Tap (mobil/a11y) ---------- */
  document.querySelectorAll('.cards .card').forEach(function(c){
    c.addEventListener('click',function(e){ if(e.target.closest('a'))return; if(window.matchMedia('(hover:hover)').matches)return; c.classList.toggle('open'); });
    if(c.hasAttribute('tabindex')) c.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();c.classList.toggle('open');} });
  });

  /* ---------- Sanfter Parallax (Desktop) ---------- */
  if(!rm && window.matchMedia('(min-width:981px)').matches){
    var px=[].slice.call(document.querySelectorAll('[data-parallax]')), ticking=false;
    function par(){ px.forEach(function(el){ var r=el.getBoundingClientRect(); if(r.bottom>0&&r.top<innerHeight){ var sp=parseFloat(el.getAttribute('data-parallax'))||0.05; var off=(r.top-innerHeight/2)*-sp; el.style.transform='translateY('+off.toFixed(1)+'px)'; } }); ticking=false; }
    if(px.length){ window.addEventListener('scroll',function(){ if(!ticking){requestAnimationFrame(par);ticking=true;} },{passive:true}); par(); }
  }

  /* ---------- Video-Play-Badge ---------- */
  /* Autoplay-Videos sicher als Dauerschleife starten */
  function playVideos(){ document.querySelectorAll('video[autoplay]').forEach(function(v){ v.muted=true; v.loop=true; v.setAttribute('playsinline',''); var pr=v.play&&v.play(); if(pr&&pr.catch) pr.catch(function(){}); }); }
  playVideos(); window.addEventListener('load',playVideos);
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) playVideos(); });

  /* ---------- Medien-Editor: Datei wählen, Drag&Drop, Zoom, Pan, Video ---------- */
  (function(){
    // Editor nur mit geheimem Schalter (?edit oder #edit). Kunden sehen NUR die fertigen Bilder.
    var EDIT=/[?&]edit\b/.test(location.search)||location.hash.replace('#','')==='edit';
    var hosts=[].slice.call(document.querySelectorAll('[data-edit]'));
    var tog=document.getElementById('editToggle');
    if(!hosts.length){ if(tog) tog.style.display='none'; return; }
    function key(h){ return 'gm_media_'+page+'_'+(h.getAttribute('data-edit')||'x'); }
    function getCM(h){ if(h.tagName==='IMG'||h.tagName==='VIDEO') return {c:h.parentElement,m:h}; return {c:h,m:h.querySelector('img,video')}; }
    var state={};
    hosts.forEach(function(h){ state[key(h)]={x:0,y:0,s:1}; });
    // Persistenz: IndexedDB (große Kapazität für viele Bilder), Fallback localStorage
    var DB=null, DBfail=false;
    function dbOpen(cb){ if(DB){cb(DB);return;} if(DBfail||!window.indexedDB){cb(null);return;} try{ var rq=indexedDB.open('gm_media_db',1); rq.onupgradeneeded=function(e){ try{e.target.result.createObjectStore('m');}catch(_){} }; rq.onsuccess=function(e){ DB=e.target.result; cb(DB); }; rq.onerror=function(){ DBfail=true; cb(null); }; }catch(e){ DBfail=true; cb(null); } }
    function dbPut(k,v){ dbOpen(function(db){ if(!db){ try{localStorage.setItem(k,JSON.stringify(v));}catch(_){ } return; } try{ db.transaction('m','readwrite').objectStore('m').put(v,k); }catch(e){ try{localStorage.setItem(k,JSON.stringify(v));}catch(_){ } } }); }
    function dbGetAll(cb){ dbOpen(function(db){ var out={}; try{ for(var i=0;i<localStorage.length;i++){ var lk=localStorage.key(i); if(lk.indexOf('gm_media_')===0){ try{out[lk]=JSON.parse(localStorage.getItem(lk));}catch(_){} } } }catch(_){} if(!db){cb(out);return;} try{ var rq=db.transaction('m','readonly').objectStore('m').openCursor(); rq.onsuccess=function(e){ var c=e.target.result; if(c){ out[c.key]=c.value; c.continue(); } else { cb(out); } }; rq.onerror=function(){cb(out);}; }catch(e){ cb(out); } }); }
    function ensureMedia(h,type){
      var cm=getCM(h),c=cm.c,m=cm.m;
      if(m && ((type==='video')!==(m.tagName==='VIDEO'))){ m.parentNode.removeChild(m); m=null; }
      if(!m){
        m=document.createElement(type==='video'?'video':'img');
        if(type==='video'){ m.muted=true;m.loop=true;m.autoplay=true;m.setAttribute('playsinline',''); } else { m.alt=''; }
        var ph=c.querySelector('.ph'); if(ph) ph.parentNode.removeChild(ph);
        c.classList.remove('empty');
        c.insertBefore(m,c.firstChild);
      }
      if(m.tagName==='VIDEO'){ m.loop=true; m.muted=true; m.setAttribute('playsinline',''); if(m.play) m.play().catch(function(){}); }
      c.style.overflow='hidden'; if(getComputedStyle(c).position==='static') c.style.position='relative'; c.style.background='#ECE6D8';
      m.style.width='100%';m.style.height='100%';m.style.objectFit='contain';m.style.display='block';m.style.transformOrigin='center center';m.style.willChange='transform';
      m.draggable=false;
      return m;
    }
    function applyT(h){ var cm=getCM(h); if(!cm.m)return; var s=state[key(h)]; cm.m.style.transform='translate('+(s.x||0)+'px,'+(s.y||0)+'px) scale('+(s.s||1)+')'; }
    // Slots behalten ihr festes Format der Seite; das Bild wird per Zoom/Verschieben eingepasst (object-fit cover)
    function setSrc(h,src,type){ var m=ensureMedia(h,type); if(type==='video'){ while(m.firstChild)m.removeChild(m.firstChild); m.src=src; if(m.play)m.play().catch(function(){}); } else { m.src=src; } applyT(h); }
    var _toastEl,_toastT;
    function gmToast(msg){ if(!_toastEl){_toastEl=document.createElement('div');_toastEl.className='gm-toast';document.body.appendChild(_toastEl);} _toastEl.textContent=msg; _toastEl.classList.add('show'); clearTimeout(_toastT); _toastT=setTimeout(function(){_toastEl.classList.remove('show');},1500); }
    function save(h){ var k=key(h),s=state[k],cm=getCM(h),m=cm.m; var o={x:s.x||0,y:s.y||0,s:s.s||1}; if(m){ if(m.tagName==='IMG'&&/^data:/.test(m.src)){o.src=m.src;o.type='image';} else if(m.tagName==='VIDEO'){o.type='video';} } dbPut(k,o); gmToast('✓ Automatisch gespeichert'); }
    function compress(file,cb){ var img=new Image(); img.onload=function(){ var max=1600,w=img.width,h=img.height; if(w>max||h>max){var r=Math.min(max/w,max/h);w=Math.round(w*r);h=Math.round(h*r);} var cv=document.createElement('canvas');cv.width=w;cv.height=h;cv.getContext('2d').drawImage(img,0,0,w,h);cb(cv.toDataURL('image/jpeg',0.85));URL.revokeObjectURL(img.src); }; img.src=URL.createObjectURL(file); }
    function handleFile(h,file){ if(!file)return; if(/^video\//.test(file.type)){ setSrc(h,URL.createObjectURL(file),'video'); save(h); } else if(/^image\//.test(file.type)){ compress(file,function(d){ setSrc(h,d,'image'); save(h); }); } }
    hosts.forEach(function(h){ applyT(h); });
    function loadSaved(){ dbGetAll(function(saved){ hosts.forEach(function(h){ var k=key(h); var st=saved[k]||(window.GM_MEDIA&&window.GM_MEDIA[k])||null; if(st){ state[k]={x:st.x||0,y:st.y||0,s:st.s||1,src:st.src,type:st.type}; } }); hosts.forEach(function(h){ var s=state[key(h)]; if(s.src){ setSrc(h,s.src,s.type||'image'); } else { applyT(h); } }); }); }
    loadSaved();
    // Ab hier: nur im Editor-Modus. Ohne ?edit wird KEIN Bearbeiten-Button, keine Steuerung, kein Export erzeugt.
    if(!EDIT){ if(tog) tog.style.display='none'; return; }
    var picker=document.createElement('input'); picker.type='file'; picker.accept='image/*,video/*'; picker.style.display='none'; document.body.appendChild(picker);
    var target=null;
    picker.addEventListener('change',function(){ if(target&&picker.files[0]) handleFile(target,picker.files[0]); picker.value=''; });
    var saveT;
    hosts.forEach(function(h){
      var cm=getCM(h),c=cm.c;
      if(cm.m) cm.m.draggable=false;
      if(getComputedStyle(c).position==='static') c.style.position='relative';
      c.style.overflow='hidden';
      var ctr=document.createElement('div'); ctr.className='edit-ctrls';
      ctr.innerHTML='<button type="button" data-a="in" title="Vergrößern">+</button><button type="button" data-a="out" title="Verkleinern">−</button><button type="button" data-a="file" title="Datei wählen">↓</button><button type="button" data-a="reset" title="Zurücksetzen">↺</button>';
      c.appendChild(ctr);
      var hint=document.createElement('div'); hint.className='edit-hint'; hint.textContent='Ziehen = verschieben · Scrollen = zoomen · Datei hierher ziehen'; c.appendChild(hint);
      ctr.addEventListener('pointerdown',function(e){ e.stopPropagation(); });
      ctr.addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b)return; e.preventDefault();e.stopPropagation(); var s=state[key(h)],a=b.getAttribute('data-a');
        if(a==='in'){s.s=Math.min((s.s||1)+0.15,6);applyT(h);save(h);}
        else if(a==='out'){s.s=Math.max((s.s||1)-0.15,1);applyT(h);save(h);}
        else if(a==='reset'){s.x=0;s.y=0;s.s=1;applyT(h);save(h);}
        else if(a==='file'){target=h;picker.click();}
      });
      c.addEventListener('wheel',function(e){ if(!document.body.classList.contains('editing'))return; e.preventDefault(); var s=state[key(h)]; s.s=Math.min(Math.max((s.s||1)-e.deltaY*0.0016,1),6); applyT(h); clearTimeout(saveT); saveT=setTimeout(function(){save(h);},250); },{passive:false});
      var drag=false,sx,sy,ox,oy;
      c.addEventListener('pointerdown',function(e){ if(!document.body.classList.contains('editing'))return; if(e.target.closest('.edit-ctrls'))return; drag=true; c.classList.add('dragging'); sx=e.clientX;sy=e.clientY; var s=state[key(h)];ox=s.x||0;oy=s.y||0; try{c.setPointerCapture(e.pointerId);}catch(_){} });
      c.addEventListener('pointermove',function(e){ if(!drag)return; var s=state[key(h)]; s.x=ox+(e.clientX-sx); s.y=oy+(e.clientY-sy); applyT(h); });
      c.addEventListener('pointerup',function(){ if(drag){drag=false;c.classList.remove('dragging');save(h);} });
      c.addEventListener('dragover',function(e){ if(!document.body.classList.contains('editing'))return; e.preventDefault(); c.classList.add('dragover'); });
      c.addEventListener('dragleave',function(){ c.classList.remove('dragover'); });
      c.addEventListener('drop',function(e){ if(!document.body.classList.contains('editing'))return; e.preventDefault(); c.classList.remove('dragover'); var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0]; if(f)handleFile(h,f); });
    });
    if(tog){ tog.classList.add('show'); tog.textContent='Bilder bearbeiten'; tog.addEventListener('click',function(){ var on=document.body.classList.toggle('editing'); tog.classList.toggle('on',on); tog.textContent=on?'Bearbeiten beenden':'Bilder bearbeiten'; }); }
    // Speichern: alle Platzierungen als medien-data.js exportieren (dauerhaft)
    var saveBtn=document.createElement('button'); saveBtn.id='editSave'; saveBtn.type='button'; saveBtn.textContent='⤓ Sicherung exportieren'; saveBtn.title='Optional: alle Platzierungen als Datei sichern (für Server/anderes Gerät). Im Browser ist alles automatisch gespeichert.'; document.body.appendChild(saveBtn);
    saveBtn.addEventListener('click',function(){
      dbGetAll(function(data){
        var js='window.GM_MEDIA = '+JSON.stringify(data)+';\n';
        var blob=new Blob([js],{type:'application/javascript'});
        var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='medien-data.js'; document.body.appendChild(a); a.click();
        setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},1200);
        saveBtn.textContent='✓ Datei erstellt'; setTimeout(function(){saveBtn.textContent='⤓ Sicherung exportieren';},1800);
      });
    });
    // Im Bearbeiten-Modus keine Navigation: weder beim Klick auf ein editierbares Bild,
    // noch wenn der umgebende Link ein editierbares Bild enthält (z. B. Anwalts-Karten).
    function blockNav(e){
      if(!document.body.classList.contains('editing')) return;
      if(e.target.closest('.edit-ctrls')) return;
      var a=e.target.closest('a');
      if(e.target.closest('[data-edit]') || (a && a.querySelector && a.querySelector('[data-edit]'))){ e.preventDefault(); e.stopPropagation(); }
    }
    document.addEventListener('click',blockNav,true);
    document.addEventListener('dragstart',function(e){ if(document.body.classList.contains('editing') && e.target.closest('[data-edit]')) e.preventDefault(); },true);
  })();

  /* ---------- Mini-Porträts im Anwälte-Dropdown: auf jeder Seite das gesetzte
       Porträt-/Team-Foto des jeweiligen Anwalts spiegeln (läuft unabhängig vom Editor) ---------- */
  (function(){
    var minis=[].slice.call(document.querySelectorAll('[data-navmini]'));
    if(!minis.length) return;
    function applyFrom(store){
      function srcFor(k){ var st=(store&&store[k])||(window.GM_MEDIA&&window.GM_MEDIA[k]); return st&&st.src?st.src:null; }
      ['manfred','gabriele'].forEach(function(who){
        var src=srcFor('gm_media_'+who+'-gatermann_portrait')||srcFor('gm_media_index_'+who);
        if(src){ minis.forEach(function(img){ if(img.getAttribute('data-navmini')===who) img.src=src; }); }
      });
    }
    applyFrom({}); // sofort aus committeter Basis (Kundenansicht)
    try{ if(window.indexedDB){ var rq=indexedDB.open('gm_media_db',1);
      rq.onupgradeneeded=function(e){ try{e.target.result.createObjectStore('m');}catch(_){} };
      rq.onsuccess=function(e){ var db=e.target.result; try{ var out={}; var cur=db.transaction('m','readonly').objectStore('m').openCursor();
        cur.onsuccess=function(ev){ var c=ev.target.result; if(c){ out[c.key]=c.value; c.continue(); } else { applyFrom(out); } }; }catch(_){} }; } }catch(_){}
  })();

  /* ---------- Kontaktformular ---------- */
  var form=document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var first=val('cf-first'),last=val('cf-last'),mail=val('cf-mail'),msg=val('cf-msg'),consent=document.getElementById('cf-consent').checked;
      var ok=first&&last&&/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)&&msg.length>4&&consent;
      var err=document.getElementById('cf-err');
      if(!ok){ err.classList.add('show'); return; }
      err.classList.remove('show');
      var phone=val('cf-phone');
      var subject='Kontaktanfrage von '+first+' '+last;
      var inhalt='Name: '+first+' '+last+'\nE-Mail: '+mail+'\nTelefon: '+phone+'\n\nNachricht:\n'+msg+'\n\nÜbermittelt über das Kontaktformular der Website.';
      function done(){ document.getElementById('cf-ok').classList.add('show'); form.style.display='none'; }
      function fallback(){ window.location.href='mailto:info@gg-xanten.de?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(inhalt); done(); }
      var btn=form.querySelector('button[type="submit"],button:not([type])'); if(btn){ btn.disabled=true; }
      var data=new URLSearchParams({type:'kontakt',name:first+' '+last,email:mail,phone:phone,area:'',inhalt:inhalt,firma:''});
      fetch('sendmail.php',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:data.toString()})
        .then(function(r){return r.ok?r.json():Promise.reject();})
        .then(function(j){ if(j&&j.ok){ done(); } else { fallback(); } })
        .catch(function(){ fallback(); });
    });
    function val(id){var n=document.getElementById(id);return n?n.value.trim():'';}
  }
})();
