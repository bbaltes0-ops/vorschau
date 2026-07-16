import os, shutil, glob
BASE="/Users/bb/Desktop/Webseiten"
TPL=os.path.join(BASE,"Template Bestatter")
ASS=os.path.join(BASE,"Asset-Datenbank","_verworfen_bestatter_altgruen")
MICcss=open(os.path.join(BASE,"vorschau/michaelis/css/style.css")).read()
MICjs=open(os.path.join(BASE,"vorschau/michaelis/js/main.js")).read()
hero_block=MICcss[MICcss.index("/* ============================================================\n   HERO 2.0"):]
para_block=MICjs[MICjs.index("/* ------------------------------------------------------------\n   6) Hero-Parallax"):]
SITES={
 "steinhauer":{
  "tokens":{"{FIRMA}":"Steinhauer-Berger","{ORT}":"Lüneburg","{REGION}":"der Region Lüneburg",
   "{SLOGAN}":"Dem Leben wie dem Tod ein Haus.","{TEL}":"04131 60 60 110","{TEL_LINK}":"+4941316060110",
   "{EMAIL}":"info@berger.xyz","{WHATSAPP}":"","{ANSPRECH}":"Andree Berger",
   "{ADRESSE}":"Stadtkoppel 8 · 21337 Lüneburg","{GRUENDUNG}":"vielen Jahren"},
  "imgs":{"hero.jpg":"hero-05.jpg","natur-1.jpg":"natur-1-01.jpg","natur-2.jpg":"natur-1-04.jpg",
   "haende.jpg":"haende-01.jpg","raum.jpg":"raum-01.jpg","team.jpg":"team-02.jpg"},
  "theme":"\n/* ---------- THEME-OVERRIDE · Graublau (Steinhauer-Berger) ---------- */\n:root{\n  --c-dark:#2b3848; --c-dark-soft:#374859;\n  --c-accent:#44586e; --c-accent-hover:#374a5e; --c-accent-tint:#e3e8ee;\n  --c-line-dark:#46586b; --c-ink-inv-soft:#c3ccd6;\n}\n"},
 "kuemmel":{
  "tokens":{"{FIRMA}":"Kümmel Bestattungen","{ORT}":"Gießen","{REGION}":"der Region Gießen",
   "{SLOGAN}":"Gemeinsam schwere Wege gehen.","{TEL}":"0641 516 55","{TEL_LINK}":"+4964151655",
   "{EMAIL}":"info@kuemmel-bestattungen.de","{WHATSAPP}":"","{ANSPRECH}":"Sascha Kümmel",
   "{ADRESSE}":"Turnstraße 19 · 35396 Gießen","{GRUENDUNG}":"sechs Generationen"},
  "imgs":{"hero.jpg":"hero-02.jpg","natur-1.jpg":"natur-1-02.jpg","natur-2.jpg":"natur-1-06.jpg",
   "haende.jpg":"haende-03.jpg","raum.jpg":"raum-03.jpg","team.jpg":"team-04.jpg"},
  "theme":""},
 "jakob":{
  "tokens":{"{FIRMA}":"Bestattungen Jakob","{ORT}":"Kempten","{REGION}":"der Region Kempten",
   "{SLOGAN}":"Würdevoller Abschied im Allgäu.","{TEL}":"0831 52 00 20","{TEL_LINK}":"+49831520020",
   "{EMAIL}":"info@bestattungen-jakob.de","{WHATSAPP}":"","{ANSPRECH}":"Alexander Jakob",
   "{ADRESSE}":"Gerberstraße 18 · 87435 Kempten","{GRUENDUNG}":"1997"},
  "imgs":{"hero.jpg":"hero-01.jpg","natur-1.jpg":"natur-1-03.jpg","natur-2.jpg":"natur-1-08.jpg",
   "haende.jpg":"haende-05.jpg","raum.jpg":"raum-05.jpg","team.jpg":"team-06.jpg"},
  "theme":"\n/* ---------- THEME-OVERRIDE · Salbei (Bestattungen Jakob) ---------- */\n:root{\n  --c-dark:#2e3a2b; --c-dark-soft:#3b4a37;\n  --c-accent:#56684f; --c-accent-hover:#475741; --c-accent-tint:#e7ebe3;\n  --c-line-dark:#4d5f47; --c-ink-inv-soft:#c9d1c4;\n}\n"},
}
from PIL import Image
def place(src,dst):
    im=Image.open(src); w,h=im.size
    cw,ch=int(w*0.955),int(h*0.96)
    x=(w-cw)//2; y=(h-ch)//2
    im=im.crop((x,y,x+cw,y+ch))
    if max(im.size)>2000:
        r=2000/max(im.size); im=im.resize((int(im.width*r),int(im.height*r)),Image.LANCZOS)
    im.convert("RGB").save(dst,"JPEG",quality=88)
for slug,cfg in SITES.items():
    dest=os.path.join(BASE,"vorschau",slug)
    if os.path.exists(dest): shutil.rmtree(dest)
    shutil.copytree(TPL,dest)
    for f in glob.glob(os.path.join(dest,"*.html")):
        t=open(f,encoding="utf-8").read()
        for k,v in cfg["tokens"].items(): t=t.replace(k,v)
        open(f,"w",encoding="utf-8").write(t)
    for dst,src in cfg["imgs"].items():
        place(os.path.join(ASS,src), os.path.join(dest,"img",dst))
    css=open(os.path.join(dest,"css/style.css")).read()
    css+="\n\n"+hero_block+"\n.hero__brand-name{font-size:clamp(2.7rem,6.8vw,5.2rem);line-height:1.02}\n"+cfg["theme"]
    open(os.path.join(dest,"css/style.css"),"w").write(css)
    js=open(os.path.join(dest,"js/main.js")).read()
    js+="\n\n"+para_block
    open(os.path.join(dest,"js/main.js"),"w").write(js)
    open(os.path.join(dest,"js/config.js"),"w").write("window.KUNDE = {};\n")
    print(slug,"ok",sorted(os.listdir(os.path.join(dest,"img"))))
# Personenfotos ohne Crop
P=[("Steinhauer-Berger/Bilder/Referenzen/andree-berger-original.jpg","steinhauer/img/andree-portrait.jpg"),
   ("Steinhauer-Berger/Bilder/Referenzen/ines-berger-original.jpg","steinhauer/img/ines-portrait.jpg"),
   ("Steinhauer-Berger/Bilder/Referenzen/phillip-berger-original.jpg","steinhauer/img/phillip-portrait.jpg"),
   ("Kümmel Bestattungen/Bilder/Referenzen/sascha-kuemmel-original.jpg","kuemmel/img/sascha-portrait.jpg"),
   ("Kümmel Bestattungen/Bilder/Referenzen/maria-kuemmel-original.jpg","kuemmel/img/maria-portrait.jpg")]
for s,d in P:
    shutil.copy(os.path.join(BASE,s), os.path.join(BASE,"vorschau",d))
print("PERSON FOTOS OK")
