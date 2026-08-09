#!/usr/bin/env python3
"""Anprobe Key-Proxy (laeuft auf Bernds Mac, Port 127.0.0.1:8811).

Der Google-Key bleibt auf dem Mac (DvS_API_Keys.env). Der Strato-VPS erreicht
diesen Proxy ueber einen SSH-Rueckkanal (siehe LaunchAgent com.anprobe.tunnel)
und reicht Gemini-Anfragen hierher durch, solange auf dem Server selbst kein
GEMINI_API_KEY eingetragen ist. Traegt Bernd den Key auf dem Server ein,
uebernimmt der Server automatisch und dieser Proxy wird nicht mehr gebraucht.

Nur POST /generate: Body = fertiger Gemini-Request (contents + generationConfig),
optional Feld "model". Antwort = Google-Antwort, unveraendert.
"""
import json
import os
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ENV_FILE = "/Users/bb/Desktop/DvS/DvS_API_Keys.env"
ALLOWED_MODELS = ["gemini-3-pro-image", "gemini-2.5-flash-image"]
MAX_BODY = 12 * 1024 * 1024


def api_key():
    with open(ENV_FILE) as f:
        for line in f:
            if line.startswith("GOOGLE_AI_API_KEY="):
                return line.split("=", 1)[1].strip()
    return ""


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # still bleiben; launchd-Log reicht

    def _fail(self, code, msg):
        body = json.dumps({"error": {"code": code, "message": msg}}).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/generate":
            return self._fail(404, "Unbekannter Endpunkt.")
        length = int(self.headers.get("Content-Length") or 0)
        if length > MAX_BODY:
            return self._fail(413, "Anfrage zu gross.")
        raw = self.rfile.read(length)
        try:
            body = json.loads(raw)
        except Exception:
            return self._fail(400, "Ungueltiges JSON.")
        model = body.pop("model", None)
        if model not in ALLOWED_MODELS:
            model = ALLOWED_MODELS[0]
        key = api_key()
        if not key:
            return self._fail(503, "Kein Key in DvS_API_Keys.env gefunden.")
        req = urllib.request.Request(
            "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent",
            data=json.dumps(body).encode(),
            headers={"Content-Type": "application/json", "x-goog-api-key": key},
        )
        try:
            with urllib.request.urlopen(req, timeout=170) as r:
                data = r.read()
                status = r.status
        except urllib.error.HTTPError as e:
            data = e.read()
            status = e.code
        except Exception:
            return self._fail(502, "Google-API nicht erreichbar.")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8811"))
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
