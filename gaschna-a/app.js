// GASCHNA — Variante A — shared interactions
(function () {
  'use strict';

  // Sticky header: solid on scroll (only when header is overlaying a hero)
  var header = document.querySelector('.header');
  if (header) {
    var overlayMode = header.classList.contains('over-hero');
    function onScroll() {
      if (!overlayMode) return;
      if (window.scrollY > 40) header.classList.add('solid');
      else header.classList.remove('solid');
    }
    if (overlayMode) {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  // Mobile burger menu
  var burger = document.querySelector('.burger');
  var navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { navLinks.classList.remove('open'); });
    });
  }

  // Welcome popup
  var mask = document.getElementById('welcomeMask');
  if (mask) {
    var open = function () { mask.classList.add('show'); };
    var close = function () { mask.classList.remove('show'); };
    window.setTimeout(open, 350);
    mask.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (el.hasAttribute('data-mask') && e.target !== mask) return;
        close();
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  // Sales overlay close
  var salesClose = document.querySelector('.sales .sx');
  if (salesClose) {
    salesClose.addEventListener('click', function () {
      document.querySelector('.sales').classList.add('hidden');
    });
  }

  // Demo form: prevent actual submission
  document.querySelectorAll('form[data-demo]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = f.querySelector('.form-success');
      if (msg) { msg.style.display = 'block'; }
      f.reset();
    });
  });
})();
