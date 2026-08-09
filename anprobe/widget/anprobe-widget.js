/*!
 * Black Rabbit Studio · Digitale Anprobe — Shop-Widget
 * ----------------------------------------------------
 * Einbindung (ein Script-Tag, fertig):
 *   <script src="anprobe-widget.js"
 *           data-proxy="https://tryon.black-rabbit.studio/api/generate"
 *           data-model="gemini-3-pro-image"
 *           data-brand="Mein Shop"
 *           data-cta="Jetzt kaufen"></script>
 *
 * Produktbilder markieren (optional, macht sie klickbar):
 *   <img src="produkt.jpg" data-anprobe="Produktname|Preis">
 *
 * Bestell-Event abfangen (Warenkorb des Shops):
 *   document.addEventListener("anprobe:order", e => { console.log(e.detail); });
 *
 * Ohne data-proxy läuft das Widget im Demo-Modus und nutzt einen
 * Gemini-API-Key aus localStorage ("brs_tryon_key").
 */
(function () {
  "use strict";
  if (window.__brsAnprobeWidget) return;
  window.__brsAnprobeWidget = true;

  /* ---------- Konfiguration aus dem eigenen Script-Tag ---------- */
  var SCRIPT = document.currentScript;
  function attr(n) { return (SCRIPT && SCRIPT.getAttribute(n)) || ""; }
  function lsGet(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var cfg = {
    proxy: attr("data-proxy"),
    model: attr("data-model"),
    cta: attr("data-cta") || "Jetzt kaufen",
    brand: attr("data-brand") || ""
  };
  function proxyUrl() { return cfg.proxy || lsGet("brs_tryon_proxy"); }
  function apiKey() { return lsGet("brs_tryon_key"); }
  function modelName() { return cfg.model || lsGet("brs_tryon_model") || "gemini-3-pro-image"; }

  /* ---------- Zustand ---------- */
  var S = {
    view: "product",            // product | person | scan | result | error | setup
    productName: "",
    productPrice: "",
    productDataUrl: null,       // PNG data-URL, max 768px
    personDataUrl: null,        // JPEG data-URL, max 1024px
    resultDataUrl: null,
    errMsg: "",
    stream: null,
    busy: false,
    progressTimer: null,
    lineTimer: null
  };

  var LOADING_LINES = [
    "Anprobe wird berechnet …",
    "Stoff, Licht und Schatten werden angepasst …",
    "Passform wird gerechnet …",
    "Gleich fertig …"
  ];

  /* ---------- Host + Shadow DOM (Stil-Isolation vom Shop) ---------- */
  var host = document.createElement("div");
  host.id = "brs-anprobe-widget";
  host.style.cssText = "all:initial;position:fixed;left:0;top:0;width:0;height:0;z-index:2147483000;";
  var root = host.attachShadow({ mode: "open" });

  root.innerHTML =
    '<style>' +
    ':host{all:initial}' +
    '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}' +
    '[hidden]{display:none!important}' +
    'button{font:inherit;cursor:pointer;border:none;background:none;color:inherit}' +
    'img{display:block;max-width:100%}' +
    ':host{--black:#0E0E0E;--ink:#161616;--card:#181818;--line:#2A2A2A;--paper:#F3EFE6;--muted:#9C9890;--lime:#D8FF3E;--red:#FF3B2F}' +

    /* Schwebender runder Button */
    '.fab{position:fixed;right:18px;bottom:18px;width:64px;height:64px;border-radius:50%;background:var(--lime);color:var(--black);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(0,0,0,.4),0 0 0 1px rgba(14,14,14,.15);transition:transform .15s;z-index:2}' +
    '.fab:hover{transform:scale(1.06)}' +
    '.fab:active{transform:scale(.96)}' +
    '.fab svg{width:30px;height:30px}' +
    '.fab .tip{position:absolute;right:74px;top:50%;transform:translateY(-50%);background:var(--black);color:var(--paper);font:600 12px/1 Inter,-apple-system,"Segoe UI",Roboto,sans-serif;padding:8px 12px;border-radius:999px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s;border:1px solid var(--line)}' +
    '.fab:hover .tip{opacity:1}' +

    /* Panel */
    '.panel{position:fixed;right:16px;bottom:94px;width:min(380px,calc(100vw - 24px));max-height:min(680px,calc(100vh - 116px));display:flex;flex-direction:column;background:var(--card);color:var(--paper);border:1px solid var(--line);border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.55);overflow:hidden;font-family:Inter,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.5;z-index:3}' +
    '@media(max-width:480px){.panel{left:8px;right:8px;width:auto;bottom:90px}}' +
    '.tbar{display:flex;align-items:center;gap:9px;padding:12px 14px;background:var(--ink);border-bottom:1px solid var(--line);cursor:grab;user-select:none;touch-action:none}' +
    '.tbar:active{cursor:grabbing}' +
    '.tdot{width:8px;height:8px;border-radius:50%;background:var(--lime);flex:none}' +
    '.ttitle{font-weight:800;font-size:12px;letter-spacing:.14em;text-transform:uppercase}' +
    '.tbrand{color:var(--muted);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;text-align:right}' +
    '.x{width:28px;height:28px;border-radius:8px;color:var(--muted);font-size:15px;line-height:1;flex:none;display:flex;align-items:center;justify-content:center}' +
    '.x:hover{color:var(--paper);background:var(--card)}' +
    '.pbody{padding:16px;overflow-y:auto;flex:1;min-height:120px}' +
    '.pfoot{padding:9px 14px;border-top:1px solid var(--line);color:var(--muted);font-size:10.5px;letter-spacing:.06em}' +
    '.pfoot b{color:var(--paper);font-weight:600}' +

    /* Bausteine */
    '.steplabel{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}' +
    '.btn{background:var(--lime);color:var(--black);border-radius:10px;padding:11px 16px;font-weight:600;font-size:14px;transition:filter .15s;display:inline-flex;align-items:center;justify-content:center;gap:8px}' +
    '.btn:hover{filter:brightness(1.08)}' +
    '.btn:disabled{opacity:.4;cursor:not-allowed}' +
    '.btn.ghost{background:none;color:var(--paper);border:1px solid var(--line)}' +
    '.btn.ghost:hover{border-color:var(--lime)}' +
    '.btn.wide{width:100%}' +
    '.btn.small{padding:8px 13px;font-size:13px}' +
    '.hint{color:var(--muted);font-size:12px;margin-top:12px;line-height:1.6}' +
    '.hint b{color:var(--paper);font-weight:600}' +
    '.inerr{margin-top:12px;background:rgba(255,59,47,.08);border:1px solid var(--red);border-radius:10px;padding:10px 12px;font-size:12.5px;line-height:1.55}' +
    '.inerr b{color:var(--red)}' +

    /* Drop-Zone */
    '.drop{border:1.5px dashed var(--line);border-radius:14px;background:var(--ink);padding:28px 18px;text-align:center;transition:border-color .15s,background .15s}' +
    '.drop.on{border-color:var(--lime);background:rgba(216,255,62,.05)}' +
    '.drop svg{width:34px;height:34px;margin:0 auto 10px;display:block;color:var(--muted)}' +
    '.drop .dt{font-weight:600;font-size:14px}' +
    '.drop .ds{color:var(--muted);font-size:12px;margin:5px 0 14px}' +

    /* Produktzeile */
    '.prodline{display:flex;align-items:center;gap:12px;background:var(--ink);border:1px solid var(--line);border-radius:12px;padding:10px;margin-bottom:14px}' +
    '.prodline img{width:52px;height:52px;object-fit:cover;border-radius:8px;background:#fff;flex:none}' +
    '.prodline .pn{font-weight:600;font-size:13.5px}' +
    '.prodline .pp{color:var(--lime);font-weight:700;font-size:13px;margin-top:2px}' +
    '.prodline .info{flex:1;min-width:0}' +
    '.link{color:var(--muted);font-size:12px;text-decoration:underline;flex:none}' +
    '.link:hover{color:var(--lime)}' +

    /* Foto-Quellen */
    '.choice{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '.srcb{background:var(--ink);border:1px dashed var(--line);border-radius:12px;padding:20px 10px;text-align:center;transition:border-color .15s}' +
    '.srcb:hover{border-color:var(--lime)}' +
    '.srcb .big{font-size:24px;display:block;margin-bottom:7px}' +
    '.srcb .t{font-weight:600;font-size:13px;display:block}' +
    '.srcb .d{color:var(--muted);font-size:11px;display:block;margin-top:3px}' +

    /* Kamera */
    '.camboxvideo,.camshot{width:100%;border-radius:12px;border:1px solid var(--line);background:#000}' +
    '.camboxvideo{transform:scaleX(-1)}' +
    '.camrow{display:flex;gap:9px;justify-content:center;align-items:center;margin-top:12px;flex-wrap:wrap}' +
    '.shutter{width:52px;height:52px;border-radius:50%;background:var(--paper);border:4px solid var(--lime);transition:transform .1s}' +
    '.shutter:active{transform:scale(.92)}' +

    /* Scan */
    '.scan{position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--line)}' +
    '.scan img{width:100%}' +
    '.scan .scrim{position:absolute;inset:0;background:rgba(14,14,14,.72)}' +
    '.scan svg.ring{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:110px;height:110px}' +
    '.scan .rbg{fill:none;stroke:var(--line);stroke-width:5}' +
    '.scan .rfg{fill:none;stroke:var(--lime);stroke-width:5;stroke-linecap:round;stroke-dasharray:251.33;stroke-dashoffset:251.33;transform:rotate(-90deg);transform-origin:50% 50%;transition:stroke-dashoffset .25s linear;filter:drop-shadow(0 0 8px rgba(216,255,62,.5))}' +
    '.scan .pct{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-weight:800;font-size:17px;color:var(--paper)}' +
    '.scan .stxt{position:absolute;left:0;right:0;bottom:14px;text-align:center;color:var(--muted);font-size:12.5px;padding:0 16px}' +

    /* Ergebnis: Vorher/Nachher */
    '.compare{position:relative;user-select:none;border-radius:14px;overflow:hidden;border:1px solid var(--line);touch-action:none}' +
    '.compare>img{width:100%}' +
    '.compare .before{position:absolute;inset:0;overflow:hidden}' +
    '.compare .before img{width:100%;height:100%;object-fit:cover}' +
    '.compare .divider{position:absolute;top:0;bottom:0;width:2px;background:var(--lime);box-shadow:0 0 12px rgba(216,255,62,.6)}' +
    '.compare .knob{position:absolute;top:50%;transform:translate(-50%,-50%);background:var(--lime);color:var(--black);font-weight:800;font-size:9px;letter-spacing:.06em;border-radius:999px;padding:5px 9px;white-space:nowrap;text-transform:uppercase}' +
    '.badge{position:absolute;top:10px;font-family:ui-monospace,Menlo,monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;background:rgba(14,14,14,.75);color:var(--paper);padding:4px 8px;border-radius:6px}' +
    '.badge.l{left:10px}.badge.r{right:10px}' +
    '.resultrow{display:flex;gap:9px;margin-top:12px}' +
    '.ordernote{margin-top:10px;color:var(--lime);font-size:12.5px}' +

    /* Fehler / Setup */
    '.errcard{background:rgba(255,59,47,.07);border:1px solid var(--red);border-radius:14px;padding:18px;text-align:center}' +
    '.errcard .et{font-weight:800;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--red);margin-bottom:8px}' +
    '.errcard .em{color:var(--paper);font-size:13px;line-height:1.6;margin-bottom:16px;word-break:break-word}' +
    '.field{margin-top:12px}' +
    '.field label{display:block;font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}' +
    '.field input{width:100%;background:var(--ink);border:1px solid var(--line);color:var(--paper);border-radius:10px;padding:10px 12px;font:inherit;font-size:13px}' +
    '.field input:focus{outline:none;border-color:var(--lime)}' +
    '</style>' +

    '<button class="fab" aria-label="Digitale Anprobe öffnen" title="Digitale Anprobe">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M12 5a2 2 0 1 1 2-2"/>' +
        '<path d="M12 5 3.5 10.2a1.4 1.4 0 0 0 .73 2.6h15.54a1.4 1.4 0 0 0 .73-2.6L12 5z"/>' +
        '<path d="M6 12.8v5.7A2.5 2.5 0 0 0 8.5 21h7a2.5 2.5 0 0 0 2.5-2.5v-5.7"/>' +
      '</svg>' +
      '<span class="tip">Anprobieren</span>' +
    '</button>' +

    '<div class="panel" hidden>' +
      '<div class="tbar">' +
        '<span class="tdot"></span>' +
        '<span class="ttitle">Digitale Anprobe</span>' +
        '<span class="tbrand"></span>' +
        '<button class="x" aria-label="Schließen">✕</button>' +
      '</div>' +
      '<div class="pbody"></div>' +
      '<div class="pfoot">KI-Anprobe · powered by <b>Black Rabbit Studio</b></div>' +
    '</div>' +

    '<input type="file" class="fprod" accept="image/*" hidden>' +
    '<input type="file" class="fpers" accept="image/*" hidden>';

  var fab = root.querySelector(".fab");
  var panel = root.querySelector(".panel");
  var body = root.querySelector(".pbody");
  var fileProd = root.querySelector(".fprod");
  var filePers = root.querySelector(".fpers");
  root.querySelector(".tbrand").textContent = cfg.brand;

  function mount() {
    if (document.body) document.body.appendChild(host);
    else document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(host); });
  }
  mount();

  /* ---------- Hilfsfunktionen ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function decodeEntities(s) {
    var t = document.createElement("textarea");
    t.innerHTML = s;
    return t.value;
  }
  function fmtPrice(p) {
    if (p == null || p === "") return "";
    var s = String(p).trim();
    if (/^\d+([.,]\d+)?$/.test(s)) {
      var n = parseFloat(s.replace(",", "."));
      try { return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" }); }
      catch (e) { return n.toFixed(2) + " €"; }
    }
    return s;
  }
  function clamp(v, min, max) { return Math.min(Math.max(v, min), Math.max(min, max)); }

  function scaleToDataUrl(source, max, mime, quality, whiteBg) {
    var w = source.naturalWidth || source.videoWidth || source.width || 0;
    var h = source.naturalHeight || source.videoHeight || source.height || 0;
    if (!w || !h) throw new Error("Bild ist leer.");
    var s = Math.min(1, max / Math.max(w, h));
    var c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w * s));
    c.height = Math.max(1, Math.round(h * s));
    var ctx = c.getContext("2d");
    if (whiteBg) { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, c.width, c.height); }
    ctx.drawImage(source, 0, 0, c.width, c.height);
    return c.toDataURL(mime, quality); // wirft SecurityError bei tainted Canvas
  }

  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var rd = new FileReader();
      rd.onload = function () { resolve(rd.result); };
      rd.onerror = function () { reject(new Error("Datei konnte nicht gelesen werden.")); };
      rd.readAsDataURL(file);
    });
  }

  function dataUrlToImage(dataUrl) {
    return new Promise(function (resolve, reject) {
      var im = new Image();
      im.onload = function () { resolve(im); };
      im.onerror = function () { reject(new Error("Bild konnte nicht geladen werden.")); };
      im.src = dataUrl;
    });
  }

  /* Produktbild aus einer URL laden — mit CORS-Fallback ueber fetch */
  function productFromSrc(src) {
    return new Promise(function (resolve, reject) {
      var im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = function () {
        try { resolve(scaleToDataUrl(im, 768, "image/png", undefined, true)); }
        catch (err) { fetchFallback(); }
      };
      im.onerror = function () { fetchFallback(); };
      im.src = src;

      function fetchFallback() {
        fetch(src, { mode: "cors" })
          .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.blob(); })
          .then(function (blob) {
            var url = URL.createObjectURL(blob);
            var im2 = new Image();
            im2.onload = function () {
              try { resolve(scaleToDataUrl(im2, 768, "image/png", undefined, true)); }
              catch (e) { reject(corsError()); }
              URL.revokeObjectURL(url);
            };
            im2.onerror = function () { URL.revokeObjectURL(url); reject(corsError()); };
            im2.src = url;
          })
          .catch(function () { reject(corsError()); });
      }
      function corsError() {
        return new Error("Dieses Bild ist geschützt (fremde Domain blockiert den Zugriff). Bitte das Bild speichern und über „Datei wählen“ hochladen.");
      }
    });
  }

  /* ---------- Panel oeffnen / schliessen / Drag ---------- */
  function openPanel() {
    panel.hidden = false;
    render();
  }
  function closePanel() {
    stopCam();
    stopProgress();
    panel.hidden = true;
  }
  fab.addEventListener("click", function () {
    if (panel.hidden) openPanel(); else closePanel();
  });
  root.querySelector(".x").addEventListener("click", closePanel);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) closePanel();
  });

  (function makeDraggable() {
    var tbar = root.querySelector(".tbar");
    tbar.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".x")) return;
      var r = panel.getBoundingClientRect();
      var ox = e.clientX - r.left, oy = e.clientY - r.top;
      function mv(ev) {
        var x = clamp(ev.clientX - ox, 4, window.innerWidth - r.width - 4);
        var y = clamp(ev.clientY - oy, 4, window.innerHeight - 56);
        panel.style.left = x + "px";
        panel.style.top = y + "px";
        panel.style.right = "auto";
        panel.style.bottom = "auto";
      }
      function up() {
        window.removeEventListener("pointermove", mv);
        window.removeEventListener("pointerup", up);
      }
      window.addEventListener("pointermove", mv);
      window.addEventListener("pointerup", up);
      e.preventDefault();
    });
  })();

  /* ---------- Produktbilder der Seite: [data-anprobe] ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest ? e.target.closest("[data-anprobe]") : null;
    if (!el) return;
    e.preventDefault();
    openFromElement(el);
  });
  function markElements() {
    var els = document.querySelectorAll("[data-anprobe]");
    for (var i = 0; i < els.length; i++) {
      els[i].style.cursor = "pointer";
      if (!els[i].title) els[i].title = "Digital anprobieren";
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", markElements);
  else markElements();

  function openFromElement(el) {
    var raw = el.getAttribute("data-anprobe") || "";
    var partsInfo = raw.split("|");
    S.productName = (partsInfo[0] || "").trim();
    S.productPrice = (partsInfo[1] || "").trim();
    var img = el.tagName === "IMG" ? el : el.querySelector("img");
    openPanel();
    if (!img || !img.src) {
      S.view = "product";
      render();
      return;
    }
    if (!S.productName && img.alt) S.productName = img.alt;
    productFromSrc(img.src).then(function (dataUrl) {
      S.productDataUrl = dataUrl;
      S.resultDataUrl = null;
      if (S.personDataUrl) startTryOn();
      else { S.view = "person"; render(); }
    }).catch(function (err) {
      S.view = "product";
      render();
      inlineError(err.message);
    });
  }

  /* ---------- Rendering ---------- */
  function render() {
    stopCam();
    if (S.view === "product") renderProduct();
    else if (S.view === "person") renderPerson();
    else if (S.view === "scan") renderScan();
    else if (S.view === "result") renderResult();
    else if (S.view === "error") renderError();
    else if (S.view === "setup") renderSetup();
  }

  function inlineError(msg) {
    var box = body.querySelector(".inerr");
    if (!box) return;
    box.innerHTML = "<b>Hoppla.</b> " + esc(msg);
    box.hidden = false;
  }

  /* --- Zustand A: Produkt waehlen (Drop-Zone) --- */
  function renderProduct() {
    body.innerHTML =
      '<div class="steplabel">Schritt 1 von 2 · Produkt</div>' +
      '<div class="drop" tabindex="0">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<rect x="3" y="3" width="18" height="18" rx="3"/>' +
          '<circle cx="9" cy="9" r="2"/>' +
          '<path d="m21 15-4.5-4.5L7 20"/>' +
        '</svg>' +
        '<div class="dt">Produktbild hierher ziehen</div>' +
        '<div class="ds">z. B. direkt von dieser Seite, aus einem anderen Tab oder vom Gerät</div>' +
        '<button class="btn ghost small pick">Datei wählen</button>' +
      '</div>' +
      '<div class="hint"><b>Tipp:</b> Produktbilder mit Anprobe-Funktion lassen sich auf dieser Seite auch direkt anklicken.</div>' +
      '<div class="inerr" hidden></div>';

    var drop = body.querySelector(".drop");
    body.querySelector(".pick").addEventListener("click", function () { fileProd.click(); });

    ["dragenter", "dragover"].forEach(function (t) {
      drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("on"); });
    });
    ["dragleave", "drop"].forEach(function (t) {
      drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove("on"); });
    });
    drop.addEventListener("drop", handleProductDrop);
  }

  function handleProductDrop(e) {
    var dt = e.dataTransfer;
    if (!dt) return;
    // 1. Datei aus dem Dateisystem
    if (dt.files && dt.files.length && /^image\//.test(dt.files[0].type || "")) {
      setProductFromFile(dt.files[0]);
      return;
    }
    // 2. Gezogenes IMG-Element (URL aus dataTransfer)
    var url = (dt.getData("text/uri-list") || "").split("\n")[0].trim();
    if (!url) {
      var html = dt.getData("text/html") || "";
      var m = /<img[^>]+src\s*=\s*["']([^"']+)["']/i.exec(html);
      if (m) url = decodeEntities(m[1]);
    }
    if (!url) url = (dt.getData("text/plain") || "").trim();
    if (url && (/^https?:/i.test(url) || /^data:image\//i.test(url) || /^blob:/i.test(url))) {
      productFromSrc(url).then(function (dataUrl) {
        S.productDataUrl = dataUrl;
        S.resultDataUrl = null;
        S.view = "person";
        render();
      }).catch(function (err) { inlineError(err.message); });
      return;
    }
    inlineError("Das ließ sich nicht als Bild lesen. Bitte ein Produktbild ziehen oder über „Datei wählen“ hochladen.");
  }

  function setProductFromFile(file) {
    fileToDataUrl(file)
      .then(dataUrlToImage)
      .then(function (im) {
        S.productDataUrl = scaleToDataUrl(im, 768, "image/png", undefined, true);
        S.resultDataUrl = null;
        if (!S.productName) S.productName = (file.name || "").replace(/\.[a-z0-9]+$/i, "");
        S.view = "person";
        render();
      })
      .catch(function (err) { inlineError(err.message); });
  }
  fileProd.addEventListener("change", function (e) {
    var f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (f) setProductFromFile(f);
  });

  /* --- Zustand B: Personenfoto --- */
  function prodlineHtml() {
    return '<div class="prodline">' +
      '<img src="' + S.productDataUrl + '" alt="">' +
      '<div class="info">' +
        '<div class="pn">' + esc(S.productName || "Dein Produkt") + '</div>' +
        (S.productPrice ? '<div class="pp">' + esc(fmtPrice(S.productPrice)) + '</div>' : '') +
      '</div>' +
      '<button class="link change">ändern</button>' +
    '</div>';
  }

  function renderPerson() {
    body.innerHTML =
      '<div class="steplabel">Schritt 2 von 2 · Dein Foto</div>' +
      prodlineHtml() +
      '<div class="choice">' +
        '<button class="srcb cam"><span class="big">📷</span><span class="t">Kamera</span><span class="d">Direkt aufnehmen</span></button>' +
        '<button class="srcb up"><span class="big">🖼</span><span class="t">Foto hochladen</span><span class="d">JPG oder PNG</span></button>' +
      '</div>' +
      '<div class="cambox" hidden>' +
        '<video class="camboxvideo" autoplay playsinline muted></video>' +
        '<img class="camshot" hidden alt="Dein Foto">' +
        '<div class="camrow">' +
          '<button class="shutter" title="Foto aufnehmen"></button>' +
          '<button class="btn ghost small retake" hidden>↺ Neu</button>' +
          '<button class="btn small use" hidden>Foto verwenden →</button>' +
          '<button class="btn ghost small camx">Abbrechen</button>' +
        '</div>' +
      '</div>' +
      '<div class="hint"><b>Gutes Licht, frontal, Oberkörper sichtbar.</b> Dein Foto wird nur für diese Anprobe verwendet und nicht gespeichert.</div>' +
      '<div class="inerr" hidden></div>';

    body.querySelector(".change").addEventListener("click", function () {
      S.view = "product"; render();
    });
    body.querySelector(".up").addEventListener("click", function () { filePers.click(); });
    body.querySelector(".cam").addEventListener("click", startCam);

    var video = body.querySelector("video");
    var shot = body.querySelector(".camshot");
    var shutter = body.querySelector(".shutter");
    var retake = body.querySelector(".retake");
    var use = body.querySelector(".use");
    var pendingShot = null;

    function startCam() {
      var box = body.querySelector(".cambox");
      var choice = body.querySelector(".choice");
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } } })
        .then(function (stream) {
          S.stream = stream;
          video.srcObject = stream;
          choice.hidden = true;
          box.hidden = false;
        })
        .catch(function (err) {
          inlineError("Kamera-Zugriff nicht möglich (" + esc(err.name || "Fehler") + "). Bitte Freigabe erlauben oder ein Foto hochladen. Hinweis: Kamera funktioniert nur über HTTPS.");
        });
    }
    shutter.addEventListener("click", function () {
      var c = document.createElement("canvas");
      c.width = video.videoWidth; c.height = video.videoHeight;
      var ctx = c.getContext("2d");
      ctx.translate(c.width, 0); ctx.scale(-1, 1); // entspiegeln
      ctx.drawImage(video, 0, 0);
      pendingShot = scaleToDataUrl(c, 1024, "image/jpeg", 0.9);
      shot.src = pendingShot;
      video.hidden = true; shot.hidden = false;
      shutter.hidden = true; retake.hidden = false; use.hidden = false;
    });
    retake.addEventListener("click", function () {
      pendingShot = null;
      video.hidden = false; shot.hidden = true;
      shutter.hidden = false; retake.hidden = true; use.hidden = true;
    });
    use.addEventListener("click", function () {
      if (!pendingShot) return;
      S.personDataUrl = pendingShot;
      stopCam();
      startTryOn();
    });
    body.querySelector(".camx").addEventListener("click", function () {
      stopCam();
      body.querySelector(".cambox").hidden = true;
      body.querySelector(".choice").hidden = false;
    });
  }

  filePers.addEventListener("change", function (e) {
    var f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    fileToDataUrl(f)
      .then(dataUrlToImage)
      .then(function (im) {
        S.personDataUrl = scaleToDataUrl(im, 1024, "image/jpeg", 0.9);
        startTryOn();
      })
      .catch(function (err) { inlineError(err.message); });
  });

  function stopCam() {
    if (S.stream) {
      S.stream.getTracks().forEach(function (t) { t.stop(); });
      S.stream = null;
    }
  }

  /* --- Zustand C: Scan / Fortschritt --- */
  var RING = 251.33; // 2 * PI * 40
  function renderScan() {
    body.innerHTML =
      '<div class="steplabel">Anprobe läuft</div>' +
      '<div class="scan">' +
        '<img src="' + S.personDataUrl + '" alt="">' +
        '<div class="scrim"></div>' +
        '<svg class="ring" viewBox="0 0 100 100" aria-hidden="true">' +
          '<circle class="rbg" cx="50" cy="50" r="40"/>' +
          '<circle class="rfg" cx="50" cy="50" r="40"/>' +
        '</svg>' +
        '<div class="pct">0 %</div>' +
        '<div class="stxt">' + LOADING_LINES[0] + '</div>' +
      '</div>' +
      '<div class="hint">Das dauert je nach Modell 10–40 Sekunden.</div>';
    startProgress();
  }
  function startProgress() {
    stopProgress();
    var p = 0, li = 0;
    S.progressTimer = setInterval(function () {
      p = Math.min(92, p + (94 - p) * 0.028);
      setProgress(p);
    }, 200);
    S.lineTimer = setInterval(function () {
      li = (li + 1) % LOADING_LINES.length;
      var el = body.querySelector(".stxt");
      if (el) el.textContent = LOADING_LINES[li];
    }, 3500);
  }
  function setProgress(p) {
    var fg = body.querySelector(".rfg");
    var pct = body.querySelector(".pct");
    if (fg) fg.style.strokeDashoffset = String(RING * (1 - p / 100));
    if (pct) pct.textContent = Math.round(p) + " %";
  }
  function stopProgress() {
    if (S.progressTimer) { clearInterval(S.progressTimer); S.progressTimer = null; }
    if (S.lineTimer) { clearInterval(S.lineTimer); S.lineTimer = null; }
  }

  /* --- Zustand D: Ergebnis --- */
  function renderResult() {
    var priceTxt = S.productPrice ? " · " + fmtPrice(S.productPrice) : "";
    body.innerHTML =
      '<div class="steplabel">Dein Ergebnis</div>' +
      '<div class="compare">' +
        '<img src="' + S.resultDataUrl + '" alt="Anprobe-Ergebnis">' +
        '<div class="before"><img src="' + S.personDataUrl + '" alt="Original"></div>' +
        '<div class="divider"></div>' +
        '<div class="knob">◂ Vorher · Nachher ▸</div>' +
        '<span class="badge l">Vorher</span><span class="badge r">Nachher · KI</span>' +
      '</div>' +
      '<div class="resultrow">' +
        '<button class="btn wide order">' + esc(cfg.cta) + esc(priceTxt) + ' →</button>' +
      '</div>' +
      '<div class="resultrow">' +
        '<button class="btn ghost small again" style="flex:1">↻ Neu generieren</button>' +
        '<button class="btn ghost small restart" style="flex:1">Neu starten</button>' +
      '</div>' +
      '<div class="ordernote" hidden>Bestellung an den Shop übergeben.</div>' +
      '<div class="hint">KI-Visualisierung – Passform und Farbe können vom realen Produkt abweichen.</div>';

    initCompare(body.querySelector(".compare"));
    body.querySelector(".order").addEventListener("click", dispatchOrder);
    body.querySelector(".again").addEventListener("click", startTryOn);
    body.querySelector(".restart").addEventListener("click", resetAll);
  }
  function initCompare(wrap) {
    var before = wrap.querySelector(".before");
    var div = wrap.querySelector(".divider");
    var knob = wrap.querySelector(".knob");
    var pos = 0.5;
    function apply() {
      before.style.clipPath = "inset(0 " + (100 - pos * 100) + "% 0 0)";
      div.style.left = (pos * 100) + "%";
      knob.style.left = (pos * 100) + "%";
    }
    function move(clientX) {
      var r = wrap.getBoundingClientRect();
      pos = clamp((clientX - r.left) / r.width, 0, 1);
      apply();
    }
    wrap.addEventListener("pointerdown", function (e) {
      wrap.setPointerCapture(e.pointerId);
      move(e.clientX);
    });
    wrap.addEventListener("pointermove", function (e) {
      if (e.buttons) move(e.clientX);
    });
    apply();
  }
  function dispatchOrder() {
    var detail = {
      product: S.productName || "Artikel",
      price: S.productPrice || "",
      priceFormatted: fmtPrice(S.productPrice),
      brand: cfg.brand,
      image: S.resultDataUrl
    };
    var ev = new CustomEvent("anprobe:order", { detail: detail, bubbles: true, cancelable: true });
    host.dispatchEvent(ev);
    var n = body.querySelector(".ordernote");
    if (n) n.hidden = false;
  }

  /* --- Zustand E: Fehlerkarte --- */
  function renderError() {
    body.innerHTML =
      '<div class="errcard">' +
        '<div class="et">Anprobe nicht möglich</div>' +
        '<div class="em">' + esc(S.errMsg || "Unbekannter Fehler.") + '</div>' +
        '<button class="btn wide restart">Neu starten</button>' +
      '</div>' +
      '<div class="resultrow" style="margin-top:10px">' +
        '<button class="btn ghost small again" style="flex:1">↻ Noch einmal versuchen</button>' +
      '</div>';
    body.querySelector(".restart").addEventListener("click", resetAll);
    body.querySelector(".again").addEventListener("click", function () {
      if (S.productDataUrl && S.personDataUrl) startTryOn();
      else resetAll();
    });
  }

  /* --- Zustand: Setup (Demo ohne Proxy) --- */
  function renderSetup() {
    body.innerHTML =
      '<div class="steplabel">Einmalige Einrichtung</div>' +
      '<div class="hint" style="margin-top:0">Dieses Widget läuft im <b>Demo-Modus</b>: Es ist keine Proxy-URL hinterlegt. Für den Test kann ein Gemini-API-Key eingetragen werden – er bleibt nur in diesem Browser (localStorage). Kostenlos unter <b>aistudio.google.com/apikey</b>.</div>' +
      '<div class="field">' +
        '<label>Gemini API-Key</label>' +
        '<input type="password" class="keyinp" placeholder="AIza…" autocomplete="off">' +
      '</div>' +
      '<div class="resultrow" style="margin-top:14px">' +
        '<button class="btn wide savekey">Speichern und anprobieren →</button>' +
      '</div>' +
      '<div class="resultrow">' +
        '<button class="btn ghost small restart" style="flex:1">Abbrechen</button>' +
      '</div>' +
      '<div class="inerr" hidden></div>';
    var inp = body.querySelector(".keyinp");
    inp.value = apiKey();
    body.querySelector(".savekey").addEventListener("click", function () {
      var v = inp.value.trim();
      if (!v) { inlineError("Bitte einen API-Key eintragen."); return; }
      lsSet("brs_tryon_key", v);
      startTryOn();
    });
    body.querySelector(".restart").addEventListener("click", resetAll);
  }

  function resetAll() {
    stopCam();
    stopProgress();
    S.view = "product";
    S.productName = "";
    S.productPrice = "";
    S.productDataUrl = null;
    S.personDataUrl = null;
    S.resultDataUrl = null;
    S.errMsg = "";
    S.busy = false;
    render();
  }

  /* ---------- Gemini-Aufruf (Muster wie index.html) ---------- */
  function buildPrompt() {
    var item = S.productName ? (S.productName + ". ") : "";
    return "Virtual try-on task. The first image shows a person. The second image shows a clothing product: " + item +
      "Put the product on the person, replacing the corresponding piece of their current outfit " +
      "(top, bottom, dress, jacket, headwear or accessory - whichever matches the product). " +
      "Keep the person's face, identity, hair, skin tone, body shape, pose and the photo background EXACTLY the same. " +
      "The product must fit naturally with realistic fabric drape, folds, lighting and shadows consistent with the original photo. " +
      "Photorealistic output, same framing and resolution as the first image. Output only the final image.";
  }

  function callGemini(prompt, personB64, productB64, productMime) {
    var parts = [
      { text: prompt },
      { inline_data: { mime_type: "image/jpeg", data: personB64 } },
      { inline_data: { mime_type: productMime, data: productB64 } }
    ];
    var reqBody = {
      contents: [{ parts: parts }],
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] }
    };
    var url, headers = { "Content-Type": "application/json" };
    if (proxyUrl()) {
      url = proxyUrl();
      reqBody.model = modelName();
    } else {
      url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName() + ":generateContent";
      headers["x-goog-api-key"] = apiKey();
    }
    return fetch(url, { method: "POST", headers: headers, body: JSON.stringify(reqBody) })
      .then(function (res) {
        if (!res.ok) {
          return res.json().catch(function () { return {}; }).then(function (j) {
            var msg = (j.error && j.error.message) || ("HTTP " + res.status);
            if (res.status === 400 && /API key/i.test(msg)) msg = "API-Key ungültig. Bitte neu eintragen.";
            if (res.status === 429) msg = "Rate-Limit erreicht. Kurz warten und erneut versuchen.";
            throw new Error(msg);
          });
        }
        return res.json();
      })
      .then(function (j) {
        var outParts = (j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || [];
        for (var i = 0; i < outParts.length; i++) {
          var d = outParts[i].inlineData || outParts[i].inline_data;
          if (d && d.data) return d.data;
        }
        throw new Error("Das Modell hat kein Bild zurückgegeben. Bitte mit anderem Foto erneut versuchen.");
      });
  }

  function startTryOn() {
    if (S.busy) return;
    if (!S.productDataUrl || !S.personDataUrl) { S.view = S.productDataUrl ? "person" : "product"; render(); return; }
    if (!proxyUrl() && !apiKey()) { S.view = "setup"; render(); return; }
    S.busy = true;
    S.view = "scan";
    render();
    var prodParts = S.productDataUrl.split(",");
    var prodMime = (/^data:([^;]+)/.exec(prodParts[0]) || [null, "image/png"])[1];
    var personB64 = S.personDataUrl.split(",")[1];
    callGemini(buildPrompt(), personB64, prodParts[1], prodMime)
      .then(function (b64) {
        S.resultDataUrl = "data:image/png;base64," + b64;
        stopProgress();
        setProgress(100);
        S.busy = false;
        setTimeout(function () { S.view = "result"; render(); }, 350);
      })
      .catch(function (err) {
        stopProgress();
        S.busy = false;
        S.errMsg = (err && err.message) ? err.message : String(err);
        S.view = "error";
        render();
      });
  }

  window.addEventListener("beforeunload", stopCam);
})();
