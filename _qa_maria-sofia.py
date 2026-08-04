from playwright.sync_api import sync_playwright
BASE = "/sessions/trusting-determined-wozniak/mnt/Webseiten/vorschau"
OUT = "/sessions/trusting-determined-wozniak/mnt/outputs"
W, H = 1600, 1100
pages = [
    ("maria-sofia-a", "kontakt.html", "_qa_ms-a_kontakt.jpg"),
    ("maria-sofia-b", "leistungen.html", "_qa_ms-b_leist.jpg"),
    ("maria-sofia-c", "leistungen.html", "_qa_ms-c_leist.jpg"),
]
FORCE = """() => {
    document.querySelectorAll('.welcome-overlay,#welcome,.sales-overlay,#sales,[role=\"dialog\"]').forEach(e=>{e.style.setProperty('display','none','important');});
    document.body.style.overflow='auto';
    document.querySelectorAll('[class*=\"anim\"],.reveal').forEach(e=>{e.classList.add('in','show','visible'); e.style.opacity='1'; e.style.transform='none';});
}"""
with sync_playwright() as p:
    b = p.chromium.launch()
    for folder, pg, out in pages:
        ctx = b.new_context(viewport={"width": W, "height": H}, device_scale_factor=1, reduced_motion="reduce")
        page = ctx.new_page()
        page.goto(f"file://{BASE}/{folder}/{pg}")
        page.wait_for_timeout(1500); page.evaluate(FORCE); page.wait_for_timeout(400)
        page.screenshot(path=f"{OUT}/{out}", type="jpeg", quality=85, full_page=True)
        print("qa", out); ctx.close()
    b.close()
print("DONE")
