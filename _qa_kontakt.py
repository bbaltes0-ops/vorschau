import asyncio
from playwright.async_api import async_playwright
from PIL import Image
BASE="/sessions/trusting-determined-wozniak/mnt/Webseiten/vorschau"
DST="/sessions/trusting-determined-wozniak/mnt/Webseiten/vorschau"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for f in ["schink-a","schink-b","schink-c"]:
            pg=await b.new_page(viewport={"width":1440,"height":1000},device_scale_factor=1)
            await pg.goto("file://%s/%s/kontakt.html"%(BASE,f),wait_until="networkidle")
            await pg.evaluate("()=>{document.querySelectorAll('.welcome-overlay,#welcome,.sales-overlay,#sales').forEach(e=>{e.style.display='none';});}")
            await pg.wait_for_timeout(800)
            t="/tmp/%s_k.png"%f
            await pg.screenshot(path=t,full_page=True)
            Image.open(t).convert("RGB").save("%s/_qa_%s_kontakt.jpg"%(DST,f),quality=82)
            await pg.close()
            print("ok",f)
        await b.close()
asyncio.run(main())
