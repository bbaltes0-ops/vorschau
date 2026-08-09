# Digitale Anprobe (Virtual Try-on) · Black Rabbit Studio

Prototyp einer KI-Anprobe für den Shop / das Ordertool: Kund:innen wählen ein
Produkt, machen ein Foto per Kamera (Handy/Laptop) oder laden eines hoch, und
die KI rendert das Produkt fotorealistisch an die Person — mit
Vorher/Nachher-Regler, Größenwahl und direktem Bestell-CTA.

**Live-Demo:** `https://vorschau.black-rabbit.studio/anprobe/`

## Wie es funktioniert

1. `products.json` liefert das Sortiment (Name, Preis, Größen, Bild, Prompt-Hinweis).
2. Das Kundenfoto wird clientseitig auf max. 1024 px verkleinert (Datenschutz + Kosten).
3. Foto + Produktbild + Prompt gehen an Googles Bildmodell
   **`gemini-3-pro-image`** (Nano Banana Pro) bzw. `gemini-2.5-flash-image`.
4. Das Modell gibt ein Bild zurück: gleiche Person, gleiche Pose, gleicher
   Hintergrund — aber mit dem Produkt angezogen.
5. Ergebnis wird als Vorher/Nachher-Vergleich angezeigt; „Jetzt bestellen"
   springt in den Bestellfluss.

Das Foto wird **nicht gespeichert** — es geht ausschließlich als API-Request an
Google und lebt sonst nur im Browser-Speicher der Session.

## Demo-Modus vs. Live-Betrieb

| | Demo (jetzt) | Live im Ordertool |
|---|---|---|
| API-Key | Wird im Browser unter „⚙ KI-Setup" eingetragen (localStorage) | Liegt **nur** auf dem Server/Proxy |
| Aufruf | Browser → Google direkt | Browser → eigener Proxy → Google |
| Key holen | kostenlos: https://aistudio.google.com/apikey | Paid-Tier empfohlen (Rate-Limits) |

Ein API-Key darf **niemals** fest in eine öffentliche Seite eingebaut werden.
Für den Live-Betrieb daher den kleinen Proxy unten deployen und dessen URL im
„⚙ KI-Setup" (Feld Proxy-URL) bzw. fest im Code hinterlegen.

## Proxy für den Live-Betrieb (Cloudflare Worker, kostenlos)

```js
// wrangler: Secret GEMINI_API_KEY setzen, Route z. B. tryon.black-rabbit.studio
const ALLOWED_ORIGINS = ["https://vorschau.black-rabbit.studio"]; // + Ordertool-Domain
const ALLOWED_MODELS = ["gemini-3-pro-image", "gemini-2.5-flash-image"];

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

    const body = await req.json();
    const model = ALLOWED_MODELS.includes(body.model) ? body.model : ALLOWED_MODELS[0];
    delete body.model;

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify(body),
      }
    );
    return new Response(r.body, {
      status: r.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  },
};
```

Sinnvolle Ausbaustufen für den Proxy: Rate-Limit pro IP, max. Bildgröße prüfen,
Logging/Kostenüberwachung, evtl. Ergebnis-Caching pro (Foto-Hash, Produkt).

## Integration ins Ordertool

1. **Sortiment:** `products.json` durch die echten Ordertool-Produkte ersetzen
   (oder per API generieren). Felder:
   - `image` — am besten echtes Produktfoto (Freisteller); je besser das
     Produktbild, desto besser das Try-on-Ergebnis. Die SVGs hier sind nur
     Platzhalter.
   - `promptHint` — kurze englische Produktbeschreibung fürs Modell
     („a black softshell work jacket with …").
   - `category` — `Kopfbedeckung` setzt das Produkt auf den Kopf statt den
     Oberkörper umzuziehen; alles andere ersetzt die Oberbekleidung.
   - `orderUrl` bzw. `config.orderUrlBase` — Ziel des Bestell-Buttons. Ohne
     URL fällt der Button auf eine `mailto:`-Bestellanfrage an
     `config.orderMail` zurück. Beim Sprung werden `?product=<id>&size=<größe>`
     angehängt, damit das Ordertool den Artikel direkt in den Warenkorb legen
     kann.
2. **Einbau:** Entweder als eigene Seite verlinken („Anprobieren"-Button auf
   der Produktkarte) oder den Bereich `secPhoto`/`secTry` als Overlay ins
   Ordertool übernehmen — das Modul hat keine Abhängigkeiten (Vanilla JS,
   eine HTML-Datei).
3. **Recht/Datenschutz:** Hinweis in die Datenschutzerklärung aufnehmen
   (Übermittlung des Fotos an Google Gemini zur Bilderzeugung, keine
   Speicherung). Der Footer-Hinweis auf der Seite deckt die UI-Seite ab.

## Händler-Flow: Verkaufen per WhatsApp (ohne eigenen Onlineshop)

Zielgruppe: kleine Einzelhändler mit Stammkundschaft, die heute schon über
WhatsApp(-Gruppen) verkaufen, aber keinen Onlineshop haben.

**Ablauf** (`haendler.html`):

1. Händler fotografiert den Artikel im Laden (Vorderseite, optional Rückseite),
   trägt Name, Preis, Größen, Geschäftsname und WhatsApp-Nummer ein.
2. Die App erzeugt einen Anprobe-Link und eine fertige WhatsApp-Nachricht
   („Probier das mal an, das steht dir bestimmt") — teilbar an einzelne
   Kund:innen oder Gruppen (Web Share API bzw. wa.me).
3. Kund:in öffnet den Link, die Anprobe-Seite startet im **Artikelmodus**
   (Katalog ausgeblendet, nur dieser Artikel), macht ein Foto mit der
   Handy-Kamera und sieht die KI-Anprobe.
4. „Per WhatsApp bestellen" öffnet einen vorbefüllten Chat an die Nummer des
   Händlers mit Artikel, Größe und Preis — der Kauf wird da abgewickelt, wo
   die Kundschaft ohnehin ist.

**Technik im Prototyp:** Artikeldaten und komprimierte Fotos (384 px, JPEG)
stecken base64url-codiert direkt im URL-Fragment (`#a=…`) — komplett
serverlos, nichts wird gespeichert. Grenze: der Link wird ~20–60 KB lang.

**Für die Verkaufsversion an Händler** braucht es ein kleines Backend:

- Artikel-Upload → kurze Links (`anprobe.link/a/x7f3`) + QR-Code
- Händler-Konten mit Logo/Farben (White-Label pro Geschäft)
- Bestell-Eingang (Webhook/Dashboard) statt nur wa.me-Chat, optional
  Bezahllink (PayPal.Me, Stripe Payment Link) direkt in der Bestell-Nachricht
- Abrechnung pro Händler (monatlich oder pro Anprobe) — die KI-Kosten pro
  Bild liegen im Cent-Bereich und lassen sich sauber ummünzen
- Für „Live-Anprobe" wie bei [Decart Anywear](https://anywear.decart.ai/)
  (Echtzeit-Video statt Einzelbild) gibt es eine öffentliche
  Realtime-API: https://docs.platform.decart.ai/models/realtime/virtual-try-on

## Dateien

- `index.html` — Kunden-App (UI, Kamera, Upload, KI-Aufruf, Vergleich, Bestellung; Artikelmodus für Händler-Links)
- `haendler.html` — Händler-App (Artikel fotografieren, Link erzeugen, WhatsApp-Teilen)
- `products.json` — Sortiment + Konfiguration (Bestell-Mail/-URL, Währung)
- `img/*.svg` — Platzhalter-Produktbilder im CI
