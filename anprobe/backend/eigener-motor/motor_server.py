#!/usr/bin/env python3
"""Eigener Motor der Digitalen Anprobe.

Selbst betriebener Anprobe-Server auf Basis von FASHN VTON v1.5
(Apache-2.0-Lizenz, kommerzielle Nutzung erlaubt, Gewichte liegen lokal).
Kein Google, kein Decart: Das Modell rechnet auf DIESEM Rechner.

Er spricht dasselbe Format wie der Gemini-Proxy: die App schickt ihren
normalen Anfrage-Body, der Server zieht Personen- und Artikelbild heraus,
rechnet die Anprobe und antwortet im selben Format zurueck. Dadurch muss
am Frontend NICHTS geaendert werden - auf dem VPS wird nur OWN_ENGINE_URL
gesetzt und der Verkehr laeuft ueber den eigenen Motor.

Start:
  python3 motor_server.py --weights ./weights --port 8821

Einrichtung siehe README-EIGENER-MOTOR.md im selben Ordner.
STATUS: Entwurf, ungetestet bis zum ersten Lauf auf einem Grafikserver -
beim ersten Start gemeinsam testen und diese Zeile entfernen.
"""
import argparse
import base64
import io
import json
import re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

MAX_BODY = 12 * 1024 * 1024

pipeline = None  # wird beim Start geladen


def load_pipeline(weights_dir):
    global pipeline
    from fashn_vton import TryOnPipeline
    pipeline = TryOnPipeline(weights_dir=weights_dir)


def category_from_prompt(prompt):
    """Die App beschreibt die Region im Prompt - daraus die Modell-Kategorie ableiten."""
    p = prompt.lower()
    if "lower body" in p or "skirt" in p or "pants" in p:
        return "bottoms"
    if "dress" in p or "outfit with the product dress" in p:
        return "one-pieces"
    return "tops"


def run_tryon(body):
    parts = body["contents"][0]["parts"]
    prompt = ""
    images = []
    for part in parts:
        if "text" in part:
            prompt += part["text"] + " "
        blob = part.get("inline_data") or part.get("inlineData")
        if blob and blob.get("data"):
            images.append(base64.b64decode(blob["data"]))
    if len(images) < 2:
        raise ValueError("Es werden Personenfoto und Artikelfoto benoetigt.")

    from PIL import Image
    person = Image.open(io.BytesIO(images[0])).convert("RGB")
    garment = Image.open(io.BytesIO(images[1])).convert("RGB")

    result = pipeline(
        person_image=person,
        garment_image=garment,
        category=category_from_prompt(prompt),
    )
    out = io.BytesIO()
    result.images[0].save(out, format="PNG")
    return base64.b64encode(out.getvalue()).decode()


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def _json(self, code, data):
        raw = json.dumps(data).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self):
        if self.path == "/":
            return self._json(200, {"service": "anprobe-eigener-motor", "modell": "fashn-vton-1.5"})
        self._json(404, {"error": {"code": 404, "message": "Unbekannter Endpunkt."}})

    def do_POST(self):
        if self.path != "/generate":
            return self._json(404, {"error": {"code": 404, "message": "Unbekannter Endpunkt."}})
        length = int(self.headers.get("Content-Length") or 0)
        if length > MAX_BODY:
            return self._json(413, {"error": {"code": 413, "message": "Anfrage zu gross."}})
        try:
            body = json.loads(self.rfile.read(length))
            b64 = run_tryon(body)
        except ValueError as e:
            return self._json(400, {"error": {"code": 400, "message": str(e)}})
        except Exception as e:
            return self._json(500, {"error": {"code": 500, "message": "Anprobe fehlgeschlagen: " + str(e)[:200]}})
        # Antwort im Gemini-Format, damit die App nichts merkt
        self._json(200, {
            "candidates": [{
                "content": {"parts": [{"inlineData": {"mimeType": "image/png", "data": b64}}]}
            }]
        })


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--weights", default="./weights")
    ap.add_argument("--port", type=int, default=8821)
    ap.add_argument("--host", default="127.0.0.1")
    args = ap.parse_args()
    print("Lade Modell (einmalig, kann eine Minute dauern) ...")
    load_pipeline(args.weights)
    print("Eigener Motor laeuft auf %s:%d" % (args.host, args.port))
    ThreadingHTTPServer((args.host, args.port), Handler).serve_forever()
