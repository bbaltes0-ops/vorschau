(function(){
  "use strict";

  // ---- Topbar scroll state ----
  var topbar = document.querySelector('.topbar');
  function onScroll(){
    if(!topbar) return;
    topbar.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // ---- Mobile menu ----
  var burger = document.querySelector('.burger');
  var menu = document.querySelector('.menu');
  if(burger && menu){
    burger.addEventListener('click', function(){
      menu.classList.toggle('open');
      var open = menu.classList.contains('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ menu.classList.remove('open'); });
    });
  }

  // ---- Welcome popup ----
  var pop = document.getElementById('welcome');
  if(pop){
    var openPop = function(){ pop.classList.add('show'); };
    var closePop = function(){ pop.classList.remove('show'); };
    setTimeout(openPop, 550);
    pop.querySelectorAll('[data-close]').forEach(function(el){
      el.addEventListener('click', closePop);
    });
    pop.addEventListener('click', function(e){ if(e.target === pop) closePop(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closePop(); });
  }

  // ---- Sales overlay close ----
  var sales = document.getElementById('sales');
  if(sales){
    var sx = sales.querySelector('.sx');
    if(sx) sx.addEventListener('click', function(){ sales.classList.add('hidden'); });
  }

  // ---- Reveal on scroll ----
  var reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && reveals.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('in'); });
  }

  // ---- Demo form (no real submit) ----
  var form = document.getElementById('demoform');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var ok = form.querySelector('.form-note');
      if(ok){
        ok.textContent = 'Demo-Formular — in der finalen Website wird Ihre Anfrage direkt an Elektro Hinzelmann gesendet.';
        ok.style.color = '#16a34a';
      }
    });
  }
})();
