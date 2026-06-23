import asyncio, os
from playwright.async_api import async_playwright

OUT="/sessions/trusting-determined-wozniak/mnt/outputs"
BASE="/sessions/trusting-determined-wozniak/mnt/Webseiten/vorschau"
JOBS=[("fialho-a","fialho_a.jpg"),("fialho-b","fialho_b.jpg"),("fialho-c","fialho_c.jpg")]

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for folder,outname in JOBS:
            pg = await b.new_page(viewport={"width":1440,"height":900}, device_scale_factor=2)
            url = "file://%s/%s/index.html"%(BASE,folder)
            await pg.goto(url, wait_until="networkidle")
            await pg.evaluate("""() => {
                document.querySelectorAll('.welcome-overlay,#welcome').forEach(e=>{e.classList.remove('open');e.style.display='none';});
                document.querySelectorAll('.sales-overlay,#sales').forEach(e=>{e.style.display='none';});
            }""")
            await pg.wait_for_timeout(1400)
            tmp = "/tmp/%s.png"%folder
            await pg.screenshot(path=tmp, clip={"x":0,"y":0,"width":1440,"height":900})
            await pg.close()
            from PIL import Image
            im=Image.open(tmp).convert("RGB")
            im.save("%s/%s"%(OUT,outname), quality=86)
            print("rendered", outname, im.size)
        await b.close()
asyncio.run(main())
