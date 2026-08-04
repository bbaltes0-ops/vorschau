import asyncio
from playwright.async_api import async_playwright
from PIL import Image

OUT="/sessions/trusting-determined-wozniak/mnt/outputs"
BASE="/sessions/trusting-determined-wozniak/mnt/Webseiten/vorschau"
JOBS=[("almas-a","almas_a.jpg"),("almas-b","almas_b.jpg"),("almas-c","almas_c.jpg")]

HIDE="""() => {
  document.querySelectorAll('.welcome-overlay,#welcome,.welcome,.intro-overlay').forEach(e=>{e.classList.remove('open');e.style.display='none';});
  document.querySelectorAll('.sales-overlay,#sales,.sales-bar,#salesBar,.sales').forEach(e=>{e.style.display='none';});
}"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for folder,outname in JOBS:
            pg = await b.new_page(viewport={"width":1440,"height":900}, device_scale_factor=2)
            url = "file://%s/%s/index.html"%(BASE,folder)
            await pg.goto(url, wait_until="networkidle")
            await pg.evaluate(HIDE)
            await pg.wait_for_timeout(1600)
            tmp = "/tmp/%s.png"%folder
            await pg.screenshot(path=tmp, clip={"x":0,"y":0,"width":1440,"height":900})
            Image.open(tmp).convert("RGB").save("%s/%s"%(OUT,outname), quality=88)
            qtmp = "/tmp/%s_full.png"%folder
            await pg.screenshot(path=qtmp, full_page=True)
            Image.open(qtmp).convert("RGB").save("%s/_qa_%s_full.jpg"%(OUT,folder), quality=78)
            await pg.close()
            print("rendered", outname)
        await b.close()
asyncio.run(main())
