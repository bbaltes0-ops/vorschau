from playwright.sync_api import sync_playwright
BASE = "/sessions/trusting-determined-wozniak/mnt/Webseiten/vorschau"
OUT = "/sessions/trusting-determined-wozniak/mnt/outputs"
W, H = 1600, 1000
variants = [
    ("fusspflege-buer-a", "fusspflege-buer_a.jpg"),
    ("fusspflege-buer-b", "fusspflege-buer_b.jpg"),
    ("fusspflege-buer-c", "fusspflege-buer_c.jpg"),
]
FORCE = """() => {
    const killSel = ['.overlay','.overlay-mask','.ov','.welcome','.welcome-overlay','.modal','.pop','.sales','.sales-bar','.sales-overlay','#welcome','#welcomeMask','#greet','#offer','#pop','#sales','#salesBar','[data-mask]','[role=\"dialog\"]'];
    killSel.forEach(s=>document.querySelectorAll(s).forEach(e=>{e.classList.remove('show','open'); e.style.setProperty('display','none','important'); e.style.visibility='hidden'; e.style.opacity='0'; e.style.pointerEvents='none';}));
    document.body.style.overflow='auto';
    document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'));
    document.querySelectorAll('[class*="anim"]').forEach(e=>{e.classList.add('in','show','visible'); e.style.animationDelay='0s'; e.style.animationDuration='0.01s'; e.style.opacity='1'; e.style.transform='none'; e.style.filter='none';});
    document.querySelectorAll('*').forEach(e=>{
        const cs = getComputedStyle(e);
        if (parseFloat(cs.opacity) < 1 && !e.closest('[style*=\"display: none\"]')) e.style.opacity='1';
        if (cs.filter && cs.filter !== 'none' && cs.filter.includes('blur')) e.style.filter='none';
        if (cs.backdropFilter && cs.backdropFilter !== 'none') e.style.backdropFilter='none';
    });
}"""
with sync_playwright() as p:
    browser = p.chromium.launch()
    for folder, outname in variants:
        ctx = browser.new_context(viewport={"width": W, "height": H}, device_scale_factor=2, reduced_motion="reduce")
        page = ctx.new_page()
        page.goto(f"file://{BASE}/{folder}/index.html")
        page.wait_for_timeout(1800)
        page.evaluate(FORCE)
        page.wait_for_timeout(600)
        page.evaluate(FORCE)
        page.wait_for_timeout(300)
        page.screenshot(path=f"{OUT}/{outname}", type="jpeg", quality=88, clip={"x":0,"y":0,"width":W,"height":H})
        print("rendered", outname)
        ctx.close()
    browser.close()
print("DONE")
