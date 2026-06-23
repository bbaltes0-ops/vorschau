#!/usr/bin/env python3
import sys, os
from playwright.sync_api import sync_playwright
slug=sys.argv[1]
out=os.path.expanduser(f"~/Desktop/Webseiten/_qa_shots/agent_{slug}.png")
os.makedirs(os.path.dirname(out),exist_ok=True)
url="file:///Users/bb/Desktop/Webseiten/vorschau/"+slug+"/index.html"
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    pg=b.new_page(viewport={"width":1440,"height":1000})
    pg.goto(url, wait_until="networkidle")
    pg.add_style_tag(content=".reveal,.hero-line,.js .hero-line,.js .reveal{opacity:1!important;transform:none!important;animation:none!important;transition:none!important}.js .chronik .step__num{opacity:1!important;transform:none!important}")
    pg.wait_for_timeout(800)
    pg.screenshot(path=out, full_page=True)
    print("OK", out)
    b.close()
