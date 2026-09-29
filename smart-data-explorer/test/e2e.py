import sys
from playwright.sync_api import sync_playwright
"""End-to-end check against the THAS sandbox with headless Chromium.

Usage (server must be running: python3 -m http.server 8091):
  python3 test/e2e.py standalone Portillo out.png   # data-rich patient (3539: 250 resources, 15 types)
  python3 test/e2e.py standalone TWIDIR   out.png   # sparse patient
  python3 test/e2e.py ehr        Portillo out.png   # EHR launch via the sandbox page
  add --no-everything to make $everything return 500 and exercise the per-type fallback
  add --browser=firefox|webkit to use another engine (python3 -m playwright install firefox webkit)
  add --app=https://.../smart-data-explorer to test a deployed copy instead of localhost
Needs: pip install playwright && python3 -m playwright install chromium
"""
NO_EVERYTHING = "--no-everything" in sys.argv
BROWSER = next((a.split("=", 1)[1] for a in sys.argv if a.startswith("--browser=")), "chromium")
args = [a for a in sys.argv[1:] if not a.startswith("--")]
mode, name = args[0], args[1]
shot = args[2] if len(args) > 2 else "e2e.png"
APP = next((a.split("=", 1)[1] for a in sys.argv if a.startswith("--app=")), "http://localhost:8091").rstrip("/")
def pick(pg):
    pg.wait_for_selector("select"); pg.select_option("select", index=1); pg.click("button:has-text('Login')")
    pg.wait_for_selector("input[type=search]", timeout=30000); pg.fill("input[type=search]", name); pg.click("button:has-text('Search')"); pg.wait_for_timeout(2500)
    pg.locator("tbody tr").first.click()
def watch(pg, errs, reqs):
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None); pg.on("pageerror", lambda e: errs.append("PAGEERROR " + str(e)))
    pg.on("request", lambda r: reqs.append(r.url) if "/fhir/" in r.url and "metadata" not in r.url else None)
    if NO_EVERYTHING: pg.route("**/$everything*", lambda route: route.fulfill(status=500, body="simulated"))
with sync_playwright() as p:
    b = getattr(p, BROWSER).launch(); pg = b.new_page(viewport={"width": 1000, "height": 1400})
    errs, reqs = [], []; watch(pg, errs, reqs)
    if mode == "standalone":
        pg.goto(f"{APP}/launch.html"); pick(pg)
    else:
        pg.goto("https://thas.mohw.gov.tw/smart/sandbox"); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(1500)
        pg.click("button:has-text('請選擇')"); pg.wait_for_timeout(800); pg.locator("[role=option]:has-text('EHR Launch'), li:has-text('EHR Launch')").first.click()
        pg.fill("input[placeholder='Launch URL']", f"{APP}/ehr-launch.html")
        with pg.expect_popup() as pi: pg.click("button:has-text('立即測試')")
        pg = pi.value; watch(pg, errs, reqs); pick(pg)
    pg.wait_for_url("**/index.html**", timeout=60000); errs.clear()
    pg.wait_for_function("document.body.dataset.ready", timeout=120000)
    print("ready:", pg.evaluate("document.body.dataset.ready"))
    print("H1:", pg.inner_text("h1"), "|", pg.inner_text(".banner p:last-child")[:120])
    print("groups:", pg.evaluate("[...document.querySelectorAll('.tiles')].map(u=>u.previousElementSibling.textContent.slice(0,20)+' → '+[...u.querySelectorAll('a')].map(a=>a.querySelector('span').textContent+':'+a.querySelector('strong').textContent).join(' ')).join('\\n  ')"))
    # open the first section via its tile, expand the first row's JSON
    first = pg.locator(".tiles a").first; first.click(); pg.wait_for_timeout(300)
    sec = pg.locator("details.card[open]").first
    print("opened:", sec.get_attribute("id"), "| rows:", sec.locator("tbody tr").count(), "| systems:", sec.locator("ul.chips").first.inner_text().replace("\n", "  ")[:200])
    sec.locator("button.link").first.click(); print("json chars:", len(sec.locator("tr.json pre").first.inner_text()))
    print("console errors:", errs)
    for r in reqs[:6]: print("  REQ", r.replace("https://thas.mohw.gov.tw/v/r4/fhir", "")[:160])
    sec.scroll_into_view_if_needed(); pg.screenshot(path=shot, full_page=False); b.close()
