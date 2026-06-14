/* ============================================================
   js/main.js · Token-Ersetzung, Navigation, Reveals, Formular
   Kein Framework, keine Abhängigkeiten.
   ============================================================ */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* ----------------------------------------------------------
     1) Platzhalter-Tokens ersetzen (FIRMA, TEL, ...)
     Quelle: window.KUNDE aus js/config.js
     ---------------------------------------------------------- */
  function replaceTokens() {
    var data = window.KUNDE || {};

    function fill(str) {
      return str.replace(/\{([A-Z0-9_]+)\}/g, function (m, key) {
        return (key in data) ? data[key] : m;
      });
    }

    /* Titel und Meta-Description */
    document.title = fill(document.title);
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", fill(meta.getAttribute("content") || ""));

    /* Attribute: href (tel:/mailto:/wa.me), alt, aria-label */
    var attrs = ["href", "alt", "aria-label", "content"];
    document.querySelectorAll("*").forEach(function (el) {
      attrs.forEach(function (a) {
        var v = el.getAttribute && el.getAttribute(a);
        if (v && v.indexOf("{") !== -1) el.setAttribute(a, fill(v));
      });
    });

    /* Textknoten */
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.indexOf("{") !== -1) node.nodeValue = fill(node.nodeValue);
    }
  }

  /* ----------------------------------------------------------
     2) Mobile Navigation
     ---------------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Schließen" : "Menü";
    });
  }

  /* ----------------------------------------------------------
     3) Scroll-Reveals · einmalig, langsam
     ---------------------------------------------------------- */
  function initReveals() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------
     4) Kontaktformular
     PRODUKTION: action auf einen Formular-Dienst setzen, z. B.
       Formspree:  action="https://formspree.io/f/IHRE_ID" method="POST"
       Web3Forms:  action="https://api.web3forms.com/submit" method="POST"
                   + verstecktes Feld access_key
     Solange die Platzhalter-Action aktiv ist, zeigt das Skript
     eine Bestätigung, ohne Daten zu versenden.
     ---------------------------------------------------------- */
  function initForm() {
    var form = document.querySelector(".form");
    if (!form) return;
    var isPlaceholder = (form.dataset.placeholderAction === "true");
    form.addEventListener("submit", function (e) {
      if (!isPlaceholder) return; /* echte Action eingerichtet · normal absenden */
      e.preventDefault();
      var ok = form.querySelector(".form__success");
      if (ok) {
        ok.classList.add("is-visible");
        ok.focus && ok.focus();
      }
      form.querySelectorAll("input, textarea, button").forEach(function (el) {
        el.disabled = true;
      });
    });
  }

  /* ----------------------------------------------------------
     5) Jahreszahl im Footer
     ---------------------------------------------------------- */
  function initYear() {
    var el = document.querySelector("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    replaceTokens();
    initNav();
    initReveals();
    initForm();
    initYear();
  });
})();


/* ------------------------------------------------------------
   6) Hero-Parallax · Hintergrund scrollt langsamer (dezent)
   ------------------------------------------------------------ */
(function () {
  "use strict";
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.addEventListener("DOMContentLoaded", function () {
    var media = document.querySelector(".hero__media");
    if (!media) return;
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY || window.pageYOffset;
        if (y < window.innerHeight * 1.3) {
          media.style.transform = "translateY(" + (y * 0.22).toFixed(1) + "px)";
        }
        ticking = false;
      });
    }, { passive: true });
  });
})();
