import sys,json
from playwright.sync_api import sync_playwright
"""End-to-end check against the THAS sandbox with headless Chromium.

Usage (server must be running: python3 -m http.server 8090):
  python3 test/e2e.py standalone Portillo out.png   # data-rich patient
  python3 test/e2e.py standalone TWIDIR   out.png   # patient with no vitals -> empty states
  python3 test/e2e.py ehr        Portillo out.png   # EHR launch via the sandbox page
Needs: pip install playwright && python3 -m playwright install chromium
"""
mode, name = sys.argv[1], sys.argv[2]
shot = sys.argv[3] if len(sys.argv) > 3 else "e2e.png"
def pick(pg):
    pg.wait_for_selector("select"); pg.select_option("select",index=1); pg.click("button:has-text('Login')")
    pg.wait_for_selector("input[type=search]",timeout=30000); pg.fill("input[type=search]",name); pg.click("button:has-text('Search')"); pg.wait_for_timeout(2500)
    pg.locator("tbody tr").first.click()
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":760,"height":1400})
    errs=[];reqs=[]
    pg.on("console",lambda m: errs.append(m.text) if m.type=="error" else None); pg.on("pageerror",lambda e: errs.append("PAGEERROR "+str(e)))
    pg.on("request",lambda r: reqs.append(r.url) if "/fhir/Observation" in r.url or "/fhir/Patient/" in r.url else None)
    if mode=="standalone":
        pg.goto("http://localhost:8090/launch.html"); pick(pg)
    else:
        pg.goto("https://thas.mohw.gov.tw/smart/sandbox"); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(1500)
        pg.click("button:has-text('請選擇')"); pg.wait_for_timeout(800); pg.locator("[role=option]:has-text('EHR Launch'), li:has-text('EHR Launch')").first.click()
        pg.fill("input[placeholder='Launch URL']","http://localhost:8090/ehr-launch.html")
        with pg.expect_popup() as pi: pg.click("button:has-text('立即測試')")
        pg=pi.value
        pg.on("console",lambda m: errs.append(m.text) if m.type=="error" else None); pg.on("pageerror",lambda e: errs.append("PAGEERROR "+str(e)))
        pg.on("request",lambda r: reqs.append(r.url) if "/fhir/Observation" in r.url or "/fhir/Patient/" in r.url else None)
        pick(pg)
    pg.wait_for_url("**/index.html**",timeout=60000); errs.clear()
    pg.reload() if False else None
    pg.wait_for_function("document.body.dataset.ready",timeout=90000)
    print("ready:",pg.evaluate("document.body.dataset.ready"))
    print("H1:",pg.inner_text("h1") if pg.locator("h1").count() else None)
    for sec in pg.locator("section.card").all():
        t=sec.locator("h2").inner_text(); 
        print(f"  [{t}] svg={sec.locator('svg.chart').count()} dots={sec.locator('circle').count()} |",sec.locator('.latest,.state').first.inner_text()[:70])
    print("scope in token:",pg.evaluate("()=>{const id=JSON.parse(sessionStorage.getItem('SMART_KEY'));return JSON.parse(sessionStorage.getItem(id)).tokenResponse.scope}"))
    print("console errors:",errs)
    for r in reqs[:8]: print("  REQ",r.replace("https://thas.mohw.gov.tw/v/r4/fhir","")[:190])
    pg.screenshot(path=shot,full_page=True); b.close()
