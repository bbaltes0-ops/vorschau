import asyncio, os
from playwright.async_api import async_playwright

V = "/sessions/trusting-determined-wozniak/mnt/Webseiten/vorschau"
OUT = "/sessions/trusting-determined-wozniak/mnt/outputs"
W, H = 1600, 1000  # 16:10

jobs = [
    ("saule-a", "saule_a"),
    ("saule-b", "saule_b"),
    ("saule-c", "saule_c"),
]

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for d, name in jobs:
            page = await b.new_page(viewport={"width": W, "height": H}, device_scale_factor=2)
            url = "file://" + os.path.join(V, d, "index.html")
            await page.goto(url, wait_until="networkidle")
            # close any welcome popup / sales overlay so hero is clean
            await page.wait_for_timeout(1600)
            for sel in ["[data-close]", ".welcome [data-close]", ".x", ".sx", "#welcome .x", ".sales-close"]:
                try:
                    el = await page.query_selector(sel)
                    if el:
                        await el.click(timeout=500)
                except Exception:
                    pass
            await page.evaluate("""() => {
                document.querySelectorAll('.overlay-mask,.overlay,#welcome,#welcomeMask').forEach(e=>e.remove());
                document.querySelectorAll('.sales,.sales-bar,#salesBar').forEach(e=>e.style.display='none');
                window.scrollTo(0,0);
            }""")
            await page.wait_for_timeout(800)
            png = os.path.join(OUT, name + ".png")
            await page.screenshot(path=png, clip={"x":0,"y":0,"width":W,"height":H})
            await page.close()
            print("shot", png)
        await b.close()

asyncio.run(main())
print("RENDER DONE")
