/* ============================================================
   js/main.js · Token-Ersetzung, Navigation, Reveals, Formular
   Kein Framework, keine Abhängigkeiten.
   ============================================================ */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* ----------------------------------------------------------
     1) Platzhalter-Tokens ersetzen ({FIRMA}, {TEL}, ...)
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
     5) Anfrage-Assistent · strukturiert Anfrage per Mailto
     ---------------------------------------------------------- */
  function initRequestAssistant() {
    var root = document.querySelector("[data-request-assistant]");
    if (!root) return;

    var steps = Array.prototype.slice.call(root.querySelectorAll(".request-step"));
    var next = root.querySelector("[data-request-next]");
    var back = root.querySelector("[data-request-back]");
    var counter = root.querySelector("[data-request-counter]");
    var progress = root.querySelector("[data-request-progress]");
    var alert = root.querySelector("[data-request-alert]");
    var summary = root.querySelector("[data-request-summary]");
    var mail = root.querySelector("[data-request-mail]");
    var form = root.querySelector(".request-form");
    var requestEmail = root.closest(".request-assistant") && root.closest(".request-assistant").dataset.requestEmail || root.dataset.requestEmail || "hello@black-rabbit.studio";
    var requestFirm = root.closest(".request-assistant") && root.closest(".request-assistant").dataset.requestFirm || root.dataset.requestFirm || document.title.split("·")[0].trim() || "Bestattungshaus";
    var state = {
      situation: "",
      urgency: "",
      type: "",
      services: [],
      prepared: [],
      contactWay: ""
    };
    var index = 0;
    var total = steps.length;

    function label(value) {
      return value && value.length ? value : "nicht angegeben";
    }

    function html(value) {
      return label(value).replace(/[&<>"']/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[char];
      });
    }

    function getField(name) {
      return form.querySelector('[name="' + name + '"]');
    }

    function fieldValue(name) {
      var field = getField(name);
      return field ? field.value.trim() : "";
    }

    function priority() {
      if (state.situation === "Sterbefall ist eingetreten" && state.urgency === "Sofort / heute") {
        return "Akut · bitte zeitnah zurückrufen";
      }
      if (state.situation === "Sterbefall ist eingetreten") {
        return "Trauerfall · kurzfristige Beratung";
      }
      if (state.situation === "Bestattungsvorsorge planen") {
        return "Vorsorge · Beratungstermin gewünscht";
      }
      return "Information · persönliche Rückmeldung";
    }

    function selectedValues(field) {
      if (field === "services") return state.services;
      if (field === "prepared") return state.prepared;
      return state[field] ? [state[field]] : [];
    }

    function isStepComplete(stepIndex) {
      if (stepIndex === 0) return !!state.situation && !!state.urgency;
      if (stepIndex === 1) return !!state.type;
      if (stepIndex === 2) return state.services.length > 0;
      if (stepIndex === 3) return state.prepared.length > 0;
      return true;
    }

    function updateOptions() {
      root.querySelectorAll("[data-field]").forEach(function (button) {
        var field = button.dataset.field;
        var values = selectedValues(field);
        var selected = values.indexOf(button.dataset.value) !== -1;
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-pressed", selected ? "true" : "false");
      });
    }

    function updateSummary() {
      if (!summary || !mail) return;
      var data = {
        name: fieldValue("name"),
        phone: fieldValue("phone"),
        email: fieldValue("email"),
        place: fieldValue("place"),
        message: fieldValue("message")
      };
      var services = state.services.length ? state.services.join(", ") : "nicht angegeben";
      var prepared = state.prepared.length ? state.prepared.join(", ") : "nicht angegeben";
      var prio = priority();
      summary.innerHTML =
        "<strong>" + html(prio) + "</strong>" +
        "<ul>" +
          "<li><span>Situation:</span> " + html(state.situation) + "</li>" +
          "<li><span>Dringlichkeit:</span> " + html(state.urgency) + "</li>" +
          "<li><span>Bestattungsart:</span> " + html(state.type) + "</li>" +
          "<li><span>Unterstützung:</span> " + html(services) + "</li>" +
          "<li><span>Vorbereitet:</span> " + html(prepared) + "</li>" +
          "<li><span>Ort:</span> " + html(data.place) + "</li>" +
          "<li><span>Kontaktweg:</span> " + html(state.contactWay) + "</li>" +
        "</ul>";

      var body = [
        "Anfrage über die Website",
        "",
        "Priorität: " + prio,
        "Situation: " + label(state.situation),
        "Dringlichkeit: " + label(state.urgency),
        "Bestattungsart: " + label(state.type),
        "Gewünschte Unterstützung: " + services,
        "Vorhandene Unterlagen / Wünsche: " + prepared,
        "Ort / Region: " + label(data.place),
        "Bevorzugter Kontaktweg: " + label(state.contactWay),
        "",
        "Name: " + label(data.name),
        "Telefon: " + label(data.phone),
        "E-Mail: " + label(data.email),
        "",
        "Nachricht:",
        label(data.message)
      ].join("\n");
      var subject = "Anfrage über die Website · " + requestFirm + " · " + prio;
      mail.href = "mailto:" + encodeURIComponent(requestEmail) + "?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    }

    function showStep(nextIndex) {
      index = Math.max(0, Math.min(total - 1, nextIndex));
      steps.forEach(function (step, i) {
        var active = i === index;
        step.hidden = !active;
        step.classList.toggle("is-active", active);
      });
      if (counter) counter.textContent = "Schritt " + (index + 1) + " von " + total;
      if (progress) progress.style.width = (((index + 1) / total) * 100).toFixed(2) + "%";
      if (back) back.disabled = index === 0;
      if (next) next.hidden = index === total - 1;
      if (alert) alert.textContent = "";
      updateOptions();
      updateSummary();
    }

    root.querySelectorAll("[data-field]").forEach(function (button) {
      button.addEventListener("click", function () {
        var field = button.dataset.field;
        var value = button.dataset.value;
        if (field === "services" || field === "prepared") {
          var list = state[field];
          var pos = list.indexOf(value);
          if (pos === -1) list.push(value);
          else list.splice(pos, 1);
        } else {
          state[field] = value;
        }
        updateOptions();
        updateSummary();
        if (alert) alert.textContent = "";
      });
    });

    root.querySelectorAll("input, textarea").forEach(function (field) {
      field.addEventListener("input", updateSummary);
    });

    if (next) {
      next.addEventListener("click", function () {
        if (!isStepComplete(index)) {
          if (alert) alert.textContent = "Bitte wählen Sie eine passende Option aus.";
          return;
        }
        showStep(index + 1);
      });
    }

    if (back) {
      back.addEventListener("click", function () {
        showStep(index - 1);
      });
    }

    showStep(0);
  }


  /* ----------------------------------------------------------
     6) Jahreszahl im Footer
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
    initRequestAssistant();
    initYear();
  });
})();
