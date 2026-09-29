import sys,json
from playwright.sync_api import sync_playwright
"""End-to-end check against the THAS sandbox with headless Chromium.

Usage (server must be running: python3 -m http.server 8090):
  python3 test/e2e.py standalone Portillo out.png   # data-rich patient
  python3 test/e2e.py standalone TWIDIR   out.png   # patient with no vitals -> empty states
  python3 test/e2e.py ehr        Portillo out.png   # EHR launch via the sandbox page
Options:
  --browser=firefox|webkit   default chromium (install with: python3 -m playwright install firefox webkit)
  --expiry                   afterwards, simulate an expired / rejected / expiring token
  --fail-weight              make the weight query return 500: only that card should show an error
  --app=URL                  test a deployed copy, e.g. --app=https://.../smart-vitals-demo (default http://localhost:8090)
Needs: pip install playwright && python3 -m playwright install chromium
"""
opts = [a for a in sys.argv[1:] if a.startswith("--")]
args = [a for a in sys.argv[1:] if not a.startswith("--")]
BROWSER = next((o.split("=", 1)[1] for o in opts if o.startswith("--browser=")), "chromium")
mode, name = args[0], args[1]
shot = args[2] if len(args) > 2 else "e2e.png"
APP = next((o.split("=", 1)[1] for o in opts if o.startswith("--app=")), "http://localhost:8090").rstrip("/")
# Edit fhirclient's saved state in sessionStorage (the same place a real session lives).
PATCH = """patch => { const id = JSON.parse(sessionStorage.getItem('SMART_KEY')); const s = JSON.parse(sessionStorage.getItem(id));
  if (patch.expiresIn !== undefined) s.expiresAt = Math.floor(Date.now() / 1000) + patch.expiresIn;
  if (patch.token) s.tokenResponse.access_token = patch.token;
  sessionStorage.setItem(id, JSON.stringify(s)); }"""
def expiry_checks(pg):
    pg.evaluate(PATCH, {"expiresIn": -10}); pg.reload(); pg.wait_for_function("document.body.dataset.ready", timeout=60000)
    print("expiry  already expired on reload ->", pg.evaluate("document.body.dataset.ready"), "|", pg.inner_text("#app")[:40].replace("\n", " "))
    pg.evaluate(PATCH, {"expiresIn": 3600, "token": "bad-token"}); pg.reload(); pg.wait_for_function("document.body.dataset.ready", timeout=60000)
    print("expiry  server rejects token     ->", pg.evaluate("document.body.dataset.ready"), "|", pg.inner_text("#app")[:40].replace("\n", " "))
    return pg
def pick(pg):
    pg.wait_for_selector("select"); pg.select_option("select",index=1); pg.click("button:has-text('Login')")
    pg.wait_for_selector("input[type=search]",timeout=30000); pg.fill("input[type=search]",name); pg.click("button:has-text('Search')"); pg.wait_for_timeout(2500)
    pg.locator("tbody tr").first.click()
with sync_playwright() as p:
    b=getattr(p, BROWSER).launch(); pg=b.new_page(viewport={"width":760,"height":1400})
    errs=[];reqs=[]
    pg.on("console",lambda m: errs.append(m.text) if m.type=="error" else None); pg.on("pageerror",lambda e: errs.append("PAGEERROR "+str(e)))
    pg.on("request",lambda r: reqs.append(r.url) if "/fhir/Observation" in r.url or "/fhir/Patient/" in r.url else None)
    if "--fail-weight" in opts: pg.context.route("**/fhir/Observation?*29463-7*", lambda route: route.fulfill(status=500, body="simulated"))
    if mode=="standalone":
        pg.goto(f"{APP}/launch.html"); pick(pg)
    else:
        pg.goto("https://thas.mohw.gov.tw/smart/sandbox"); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(1500)
        pg.click("button:has-text('請選擇')"); pg.wait_for_timeout(800); pg.locator("[role=option]:has-text('EHR Launch'), li:has-text('EHR Launch')").first.click()
        pg.fill("input[placeholder='Launch URL']",f"{APP}/ehr-launch.html")
        with pg.expect_popup() as pi: pg.click("button:has-text('立即測試')")
        pg=pi.value
        pg.on("console",lambda m: errs.append(m.text) if m.type=="error" else None); pg.on("pageerror",lambda e: errs.append("PAGEERROR "+str(e)))
        pg.on("request",lambda r: reqs.append(r.url) if "/fhir/Observation" in r.url or "/fhir/Patient/" in r.url else None)
        pick(pg)
    pg.wait_for_url("**/index.html**",timeout=60000); errs.clear()
    pg.wait_for_function("document.body.dataset.ready",timeout=90000)
    print("ready:",pg.evaluate("document.body.dataset.ready"))
    print("H1:",pg.inner_text("h1") if pg.locator("h1").count() else None)
    for sec in pg.locator("section.card").all():
        t=sec.locator("h2").inner_text(); 
        print(f"  [{t}] svg={sec.locator('svg.chart').count()} dots={sec.locator('circle').count()} |",sec.locator('.latest,.state').first.inner_text()[:70])
    print("scope in token:",pg.evaluate("()=>{const id=JSON.parse(sessionStorage.getItem('SMART_KEY'));return JSON.parse(sessionStorage.getItem(id)).tokenResponse.scope}"))
    print("console errors:",errs)
    for r in reqs[:8]: print("  REQ",r.replace("https://thas.mohw.gov.tw/v/r4/fhir","")[:190])
    pg.screenshot(path=shot,full_page=True)
    if "--expiry" in opts:
        pg.evaluate(PATCH, {"expiresIn": 4}); pg.reload(); pg.wait_for_function("document.body.dataset.ready", timeout=60000)
        pg.wait_for_function("document.body.dataset.expired", timeout=15000)
        print("expiry  expires while open       ->", pg.inner_text(".notice")[:40].replace("\n", " "), "| cards still shown:", pg.locator("section.card").count())
        expiry_checks(pg)
    b.close()
