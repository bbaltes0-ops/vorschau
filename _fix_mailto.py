import glob
for p in glob.glob("/sessions/trusting-determined-wozniak/mnt/Webseiten/vorschau/maria-sofia-*/*.html"):
    s=open(p,encoding="utf-8").read()
    s=s.replace("-%20Maria &amp; Sofia Kosmetik%20(", "-%20Maria%20%26%20Sofia%20Kosmetik%20(")
    open(p,"w",encoding="utf-8").write(s)
print("mailto fixed")
