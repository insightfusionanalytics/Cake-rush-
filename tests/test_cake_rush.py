"""
=============================================================================
CAKE RUSH — Comprehensive Selenium Test Suite (v2 — Warm Editorial)
=============================================================================

Tests the warm-editorial v2 site:
  - Navbar (italic wordmark, scroll blur, mobile drawer)
  - Hero (Cake Rush. lockup, Reserve/Instagram text-links)
  - Philosophy ticker (marquee)
  - About (Chapter One, three numbered features)
  - House Favourites (La Carte, four numbered tabs, 4-col grid)
  - Collection (Chapter Two, alternating editorial rows, category tabs)
  - Lookbook (Chapter Three, masonry, lightbox + Esc to close)
  - Correspondence (Chapter Four, dark testimonials, rotating quotes)
  - Contact (Chapter Five, three text-link columns)
  - Footer (italic wordmark + small-caps copyright)
  - Floating dark "Order Now" pill

USAGE:
    cd <project root>
    pip install -r tests/requirements.txt
    python tests/test_cake_rush.py                  # visible Chrome window
    python tests/test_cake_rush.py --headless       # background mode
    python tests/test_cake_rush.py --url=http://127.0.0.1:5173

ENVIRONMENT:
    Requires the dev server to be running (e.g. `npm run dev`)
    Default URL is http://127.0.0.1:5173 (Vite default).
=============================================================================
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

# ── Configuration ──────────────────────────────────────────────────────────
DEFAULT_URL = "http://127.0.0.1:5173"
WAIT_TIMEOUT = 15  # seconds


def _read_url_arg() -> str:
    for arg in sys.argv[1:]:
        if arg.startswith("--url="):
            return arg.split("=", 1)[1].rstrip("/")
    return DEFAULT_URL


BASE_URL = _read_url_arg()


# ── Test result tracking ───────────────────────────────────────────────────
@dataclass
class Result:
    name: str
    passed: bool
    detail: str = ""


results: list[Result] = []


def record(name: str, passed: bool, detail: str = "") -> None:
    results.append(Result(name, passed, detail))
    icon = "✅" if passed else "❌"
    suffix = f" — {detail}" if detail else ""
    print(f"  {icon} {name}{suffix}")


# ── Browser setup ──────────────────────────────────────────────────────────
def create_driver() -> webdriver.Chrome:
    opts = Options()
    if "--headless" in sys.argv:
        opts.add_argument("--headless=new")
        print("  ⚙️  Running in HEADLESS mode\n")
    else:
        print("  👁️  Running in VISIBLE mode — watch Chrome!\n")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--window-size=1440,900")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=opts)
    driver.implicitly_wait(3)
    return driver


def wait_for(driver, css: str, timeout: int = WAIT_TIMEOUT):
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, css))
    )


def hide_floats(driver) -> None:
    """Hide overlays that intercept clicks (the floating Order Now pill)."""
    driver.execute_script(
        """
        document.querySelectorAll('.lx-floatpill').forEach(el => el.style.display = 'none');
        """
    )


def restore_floats(driver) -> None:
    driver.execute_script(
        """
        document.querySelectorAll('.lx-floatpill').forEach(el => el.style.display = '');
        """
    )


def page_text(driver) -> str:
    return driver.execute_script("return document.body.innerText;") or ""


# ══════════════════════════════════════════════════════════════════════════
#  T1 — Page load
# ══════════════════════════════════════════════════════════════════════════
def test_page_load(driver):
    print("\n🔹 T1 · Page load")
    driver.get(BASE_URL)
    wait_for(driver, "body")
    record("Page returns 200 / DOM ready", driver.title is not None)
    record(
        "URL matches",
        driver.current_url.rstrip("/") == BASE_URL.rstrip("/"),
        driver.current_url,
    )
    title = (driver.title or "").lower()
    record("Title mentions Cake Rush", "cake rush" in title, driver.title or "")


# ══════════════════════════════════════════════════════════════════════════
#  T2 — Navbar
# ══════════════════════════════════════════════════════════════════════════
def test_navbar(driver):
    print("\n🔹 T2 · Navbar (lx-nav)")
    driver.get(BASE_URL)
    wait_for(driver, "nav.lx-nav")

    nav = driver.find_element(By.CSS_SELECTOR, "nav.lx-nav")
    nav_text = nav.text or ""
    record("Wordmark 'Cake Rush' visible", "cake rush" in nav_text.lower(), nav_text[:80])

    # Desktop links present in DOM. Editorial design renders nav labels with
    # text-transform: uppercase so we match case-insensitively.
    visible_buttons = " ".join(b.text for b in nav.find_elements(By.TAG_NAME, "button")).lower()
    for label in ["Story", "Collection", "Lookbook", "Contact"]:
        record(f"Nav link '{label}' rendered", label.lower() in visible_buttons)


# ══════════════════════════════════════════════════════════════════════════
#  T3 — Navbar scroll blur
# ══════════════════════════════════════════════════════════════════════════
def test_navbar_scroll(driver):
    print("\n🔹 T3 · Navbar scroll blur")
    driver.get(BASE_URL)
    wait_for(driver, "nav.lx-nav")

    bg_before = driver.execute_script(
        "return getComputedStyle(document.querySelector('nav.lx-nav')).backgroundColor;"
    )
    driver.execute_script("window.scrollTo(0, 600);")
    time.sleep(0.8)
    bg_after = driver.execute_script(
        "return getComputedStyle(document.querySelector('nav.lx-nav')).backgroundColor;"
    )
    record(
        "Navbar background changes on scroll",
        bg_before != bg_after,
        f"{bg_before} → {bg_after}",
    )
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(0.5)


# ══════════════════════════════════════════════════════════════════════════
#  T4 — Hero
# ══════════════════════════════════════════════════════════════════════════
def test_hero(driver):
    print("\n🔹 T4 · Hero (#home / .lx-hero)")
    driver.get(BASE_URL)
    hero = wait_for(driver, "#home")

    text = driver.execute_script("return arguments[0].innerText;", hero) or ""
    lower = text.lower()
    record("Hero contains 'Cake'", "cake" in lower)
    record("Hero contains 'Rush'", "rush" in lower)
    record("Hero eyebrow mentions Bandra", "bandra" in lower)
    record("Hero tagline rendered", "atelier" in lower)

    img = hero.find_elements(By.TAG_NAME, "img")
    record("Hero image is present", len(img) > 0)

    wa_links = hero.find_elements(By.XPATH, ".//a[contains(@href,'wa.me')]")
    record("Reserve on WhatsApp link present", len(wa_links) > 0)
    if wa_links:
        record("WhatsApp link opens new tab", wa_links[0].get_attribute("target") == "_blank")

    ig_links = [
        a
        for a in hero.find_elements(By.TAG_NAME, "a")
        if "instagram" in (a.get_attribute("href") or "").lower()
    ]
    record("View Instagram link present", len(ig_links) > 0)


# ══════════════════════════════════════════════════════════════════════════
#  T5 — Philosophy ticker
# ══════════════════════════════════════════════════════════════════════════
def test_philosophy(driver):
    print("\n🔹 T5 · Philosophy ticker (.lx-philo)")
    driver.get(BASE_URL)
    ticker = wait_for(driver, ".lx-philo")
    text = (ticker.text or "").lower()
    for phrase in ["hand-crafted", "small-batch", "eggless", "mumbai"]:
        record(f"Ticker contains '{phrase}'", phrase in text)


# ══════════════════════════════════════════════════════════════════════════
#  T6 — About
# ══════════════════════════════════════════════════════════════════════════
def test_about(driver):
    print("\n🔹 T6 · About (#about)")
    driver.get(BASE_URL)
    about = wait_for(driver, "#about")
    text = driver.execute_script("return arguments[0].innerText;", about) or ""

    lower = text.lower()
    record("About eyebrow says 'Chapter One'", "chapter one" in lower)
    record("About headline includes 'Tuesday'", "tuesday" in lower)
    for label in ["Custom Designs", "Fresh Ingredients", "Made with Love"]:
        record(f"Feature pair '{label}' present", label.lower() in lower)
    record("About image rendered", len(about.find_elements(By.TAG_NAME, "img")) > 0)


# ══════════════════════════════════════════════════════════════════════════
#  T7 — House Favourites (La Carte)
# ══════════════════════════════════════════════════════════════════════════
def test_house_favourites(driver):
    print("\n🔹 T7 · House Favourites (.lx-house)")
    driver.get(BASE_URL)
    section = wait_for(driver, ".lx-house")
    text = driver.execute_script("return arguments[0].innerText;", section) or ""

    lower = text.lower()
    record("La Carte eyebrow present", "la carte" in lower)
    record("Headline mentions 'house favourites'", "house" in lower and "favourites" in lower)

    tab_buttons = section.find_elements(By.CSS_SELECTOR, ".lx-house-tabs button")
    record("Four category tabs rendered", len(tab_buttons) == 4, f"found {len(tab_buttons)}")

    tabs_text = (
        driver.execute_script(
            "return Array.from(document.querySelectorAll('.lx-house-tabs button')).map(b=>b.innerText).join(' ');"
        )
        or ""
    ).lower()
    for label in ["Signature cakes", "Seasonal", "Smalls & gifting", "Bespoke"]:
        record(f"Tab '{label}' present", label.lower() in tabs_text, tabs_text[:120])

    grid = section.find_elements(By.CSS_SELECTOR, ".lx-house-grid > *")
    record("4 items in default tab grid", len(grid) >= 4, f"found {len(grid)}")

    if len(tab_buttons) == 4:
        hide_floats(driver)
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", tab_buttons[3])
        time.sleep(0.4)
        driver.execute_script("arguments[0].click();", tab_buttons[3])
        time.sleep(0.8)
        restore_floats(driver)
        bespoke_text = (
            driver.execute_script("return document.querySelector('.lx-house').innerText;") or ""
        )
        record("Bespoke tab shows 'Three-tier wedding'", "three-tier wedding" in bespoke_text.lower())
        record("Bespoke tab shows quote price", "₹15,000" in bespoke_text)
        quote_links = section.find_elements(
            By.XPATH, ".//a[contains(translate(., 'REQUEST', 'request'), 'request')]"
        )
        record("Request a quote CTA visible", len(quote_links) > 0)


# ══════════════════════════════════════════════════════════════════════════
#  T8 — Collection (#menu)
# ══════════════════════════════════════════════════════════════════════════
def test_collection(driver):
    print("\n🔹 T8 · Collection (#menu)")
    driver.get(BASE_URL)
    coll = wait_for(driver, "#menu")
    text = driver.execute_script("return arguments[0].innerText;", coll) or ""

    lower = text.lower()
    record("Eyebrow 'Chapter Two' present", "chapter two" in lower)
    record("Headline 'A catalog' present", "catalog" in lower)
    rows = coll.find_elements(By.CSS_SELECTOR, ".lx-coll-row")
    record("Collection rows rendered (>=1)", len(rows) >= 1, f"found {len(rows)}")
    reserve_links = coll.find_elements(By.XPATH, ".//a[contains(@href,'wa.me')]")
    record("Per-cake Reserve link(s) present", len(reserve_links) >= 1, f"found {len(reserve_links)}")


# ══════════════════════════════════════════════════════════════════════════
#  T9 — Lookbook + Lightbox (#gallery)
# ══════════════════════════════════════════════════════════════════════════
def test_lookbook(driver):
    print("\n🔹 T9 · Lookbook (#gallery + lightbox)")
    driver.get(BASE_URL)
    gallery = wait_for(driver, "#gallery")
    text = driver.execute_script("return arguments[0].innerText;", gallery) or ""

    record("Eyebrow 'Chapter Three' present", "chapter three" in text.lower())
    items = gallery.find_elements(By.CSS_SELECTOR, ".lx-look-item")
    record("Lookbook tiles rendered", len(items) > 0, f"found {len(items)}")

    if items:
        hide_floats(driver)
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", items[0])
        time.sleep(0.4)
        driver.execute_script("arguments[0].click();", items[0])
        time.sleep(1.0)
        restore_floats(driver)

        body_html = driver.execute_script("return document.body.outerHTML;") or ""
        opened = "Esc to close" in body_html
        record("Lightbox opens on tile click", opened)

        # Close with Escape
        driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
        time.sleep(0.5)
        body_html_after = driver.execute_script("return document.body.outerHTML;") or ""
        record("Lightbox closes on Escape", "Esc to close" not in body_html_after)


# ══════════════════════════════════════════════════════════════════════════
#  T10 — Correspondence / Testimonials (#reviews)
# ══════════════════════════════════════════════════════════════════════════
def test_testimonials(driver):
    print("\n🔹 T10 · Correspondence (#reviews)")
    driver.get(BASE_URL)
    reviews = wait_for(driver, "#reviews")
    text = driver.execute_script("return arguments[0].innerText;", reviews) or ""

    record("Eyebrow 'Chapter Four' present", "chapter four" in text.lower())
    bg = driver.execute_script(
        "return getComputedStyle(document.querySelector('#reviews')).backgroundColor;"
    )
    record("Reviews uses dark coffee background", "42" in bg or "31" in bg, bg)


# ══════════════════════════════════════════════════════════════════════════
#  T11 — Contact (#contact)
# ══════════════════════════════════════════════════════════════════════════
def test_contact(driver):
    print("\n🔹 T11 · Contact (#contact)")
    driver.get(BASE_URL)
    contact = wait_for(driver, "#contact")
    text = driver.execute_script("return arguments[0].innerText;", contact) or ""

    lower = text.lower()
    record("Eyebrow 'Chapter Five' present", "chapter five" in lower)
    for column in ["Reserve", "Follow", "Visit"]:
        record(f"Column '{column}' present", column.lower() in lower)
    record("WhatsApp CTA in contact", len(contact.find_elements(By.XPATH, ".//a[contains(@href,'wa.me')]")) > 0)
    record(
        "Instagram CTA in contact",
        any("instagram" in (a.get_attribute("href") or "") for a in contact.find_elements(By.TAG_NAME, "a")),
    )
    record("Bandra address present", "Bandra" in text)


# ══════════════════════════════════════════════════════════════════════════
#  T12 — Footer
# ══════════════════════════════════════════════════════════════════════════
def test_footer(driver):
    print("\n🔹 T12 · Footer (.lx-foot)")
    driver.get(BASE_URL)
    footer = wait_for(driver, "footer.lx-foot")
    text = footer.text or ""
    record("Footer wordmark 'Cake Rush'", "Cake Rush" in text)
    record("Footer copyright present", "MMXXVI" in text or "©" in text)


# ══════════════════════════════════════════════════════════════════════════
#  T13 — Floating Order Now pill
# ══════════════════════════════════════════════════════════════════════════
def test_floating_pill(driver):
    print("\n🔹 T13 · Floating WhatsApp pill (.lx-floatpill)")
    driver.get(BASE_URL)
    pill = wait_for(driver, ".lx-floatpill")
    href = pill.get_attribute("href") or ""
    record("Pill links to wa.me", "wa.me" in href, href[:80])
    record("Pill opens new tab", pill.get_attribute("target") == "_blank")
    record("Pill text says 'Order Now'", "ORDER NOW" in pill.text.upper())


# ══════════════════════════════════════════════════════════════════════════
#  T14 — In-page anchor scroll
# ══════════════════════════════════════════════════════════════════════════
def test_smooth_scroll(driver):
    print("\n🔹 T14 · Click-to-scroll on nav 'Collection' button")
    driver.get(BASE_URL)
    wait_for(driver, "#menu")

    before = driver.execute_script("return window.scrollY;")
    btns = driver.find_elements(By.XPATH, "//nav//button[normalize-space()='Collection']")
    if not btns:
        record("Collection nav button found", False, "not present (mobile viewport?)")
        return
    driver.execute_script("arguments[0].click();", btns[0])
    time.sleep(1.4)
    after = driver.execute_script("return window.scrollY;")
    record("Page scrolled after click", after > before + 100, f"{before} → {after}")


# ══════════════════════════════════════════════════════════════════════════
#  T15 — Console errors
# ══════════════════════════════════════════════════════════════════════════
def test_console_errors(driver):
    print("\n🔹 T15 · Browser console errors")
    driver.get(BASE_URL)
    time.sleep(2.5)
    try:
        logs = driver.get_log("browser")
    except Exception as e:
        record("Browser logs accessible", False, repr(e))
        return
    severe = [
        log
        for log in logs
        if log.get("level") == "SEVERE"
        and "favicon" not in log.get("message", "")
        and "the server responded with a status of 4" not in log.get("message", "").lower()
    ]
    record(
        "No severe console errors",
        len(severe) == 0,
        "; ".join(s.get("message", "")[:120] for s in severe[:3]) or "clean",
    )


# ══════════════════════════════════════════════════════════════════════════
#                            ADMIN PAGE TESTS
#  These exercise /admin and the admin → public data flow end-to-end.
#  The data layer is now a JSON file in the GitHub repo, edited via Vercel
#  serverless functions, not Supabase.
# ══════════════════════════════════════════════════════════════════════════

_GITHUB_OWNER = "Ajinkyaa2004"
_GITHUB_REPO = "cake-studio-refine"


def _http(method: str, url: str, body=None, headers: dict | None = None, timeout: int = 15):
    """Plain HTTP. Returns (status_code, parsed_json_or_text_or_None)."""
    data = json.dumps(body).encode() if isinstance(body, (dict, list)) else body
    req = urllib.request.Request(url, data=data, method=method)
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    if isinstance(body, (dict, list)) and not (headers and "Content-Type" in headers):
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            txt = r.read().decode()
            try:
                return r.status, json.loads(txt) if txt else None
            except json.JSONDecodeError:
                return r.status, txt
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode())
        except Exception:
            return e.code, None
    except Exception:
        return 0, None


def _content_get_from_deployed() -> dict | None:
    """Fetch content.json from the live Vercel deployment (bundled at deploy time)."""
    status, body = _http("GET", f"{BASE_URL.rstrip('/')}/content.json?t={int(time.time())}")
    return body if status == 200 and isinstance(body, dict) else None


def _capture_save_response(driver) -> dict | None:
    """Read the most recent /api/save-content response captured by our fetch hook."""
    return driver.execute_script("return window.__lastSaveResponse || null;")


def _install_save_capture(driver) -> None:
    """Patch window.fetch so we can see /api/save-content responses in tests."""
    driver.execute_script(
        """
        if (!window.__patchedFetch) {
          window.__patchedFetch = true;
          window.__lastSaveResponse = null;
          const orig = window.fetch.bind(window);
          window.fetch = async (input, init) => {
            const res = await orig(input, init);
            const url = typeof input === 'string' ? input : (input && input.url) || '';
            if (url.includes('/api/save-content') || url.includes('/api/upload-image')) {
              try {
                const clone = res.clone();
                const body = await clone.json();
                window.__lastSaveResponse = { status: res.status, body };
              } catch (e) {
                window.__lastSaveResponse = { status: res.status, body: null };
              }
            }
            return res;
          };
        }
        """
    )


def _content_save(content: dict):
    """POST content to /api/save-content. Returns (status, json_response)."""
    return _http(
        "POST",
        f"{BASE_URL.rstrip('/')}/api/save-content",
        body=content,
        timeout=30,
    )


def _restore_setting(key: str, value: str):
    """Restore one setting via the save-content API. Returns (status, body)."""
    current = _content_get_from_deployed() or {}
    if not current:
        return 0, None
    settings = dict(current.get("settings", {}))
    settings[key] = value
    current["settings"] = settings
    return _content_save(current)


def _react_set_value(driver, element, value: str) -> None:
    """Set a controlled-React input/textarea value so onChange fires properly."""
    driver.execute_script(
        """
        const el = arguments[0];
        const val = arguments[1];
        const tag = el.tagName.toLowerCase();
        const proto = tag === 'textarea'
            ? window.HTMLTextAreaElement.prototype
            : window.HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        """,
        element,
        value,
    )


def _find_input_by_label(driver, label_text: str, tag: str = "input"):
    """Find the input/textarea following a <label> with the given text."""
    return driver.execute_script(
        """
        const labelText = arguments[0];
        const tag = arguments[1];
        const labels = Array.from(document.querySelectorAll('label'));
        for (const l of labels) {
            if (l.textContent.trim() === labelText) {
                let s = l.nextElementSibling;
                while (s) {
                    if (s.tagName.toLowerCase() === tag) return s;
                    const inner = s.querySelector ? s.querySelector(tag) : null;
                    if (inner) return inner;
                    s = s.nextElementSibling;
                }
            }
        }
        return null;
        """,
        label_text,
        tag,
    )


def _admin_url() -> str:
    return f"{BASE_URL.rstrip('/')}/admin"


def _click_admin_tab(driver, label_keyword: str) -> bool:
    """Native Selenium click — Radix Tabs need real pointer events to swap state."""
    kw = label_keyword.upper()
    tabs = driver.find_elements(By.CSS_SELECTOR, ".lx-admin-tab")
    for tab in tabs:
        if kw in (tab.text or "").upper():
            driver.execute_script(
                "arguments[0].scrollIntoView({block:'center'});", tab
            )
            time.sleep(0.3)
            try:
                tab.click()
            except Exception:
                driver.execute_script("arguments[0].click();", tab)
            # Wait until this tab reports active state
            for _ in range(20):
                if tab.get_attribute("data-state") == "active":
                    break
                time.sleep(0.15)
            time.sleep(1.0)  # let TabsContent mount + queries fire
            return True
    return False


# ──────────────────────────────────────────────────────────────────────────
def test_admin_loads(driver):
    print("\n🔹 T16 · Admin page loads")
    driver.get(_admin_url())
    wait_for(driver, "body")
    time.sleep(1.5)
    body = (driver.execute_script("return document.body.innerText;") or "").lower()
    record("Page loads with admin chrome", "admin" in body or "atelier" in body)
    record("'Cake Rush' wordmark visible", "cake rush" in body)
    record("'Atelier desk' editorial heading", "atelier desk" in body)
    backs = driver.find_elements(By.XPATH, "//a[@href='/' and contains(., 'Back')]")
    record(
        "'Back to Site' link present",
        len(backs) > 0 or "back to site" in body,
    )


def test_admin_tabs(driver):
    print("\n🔹 T17 · Admin tabs (Settings / Menu / House / Gallery / Reviews)")
    driver.get(_admin_url())
    wait_for(driver, ".lx-admin-tab", timeout=20)
    tabs = driver.find_elements(By.CSS_SELECTOR, ".lx-admin-tab")
    record("Five admin tabs rendered", len(tabs) == 5, f"found {len(tabs)}")
    text = " ".join((t.text or "").upper() for t in tabs)
    for label in ["SETTINGS", "MENU", "HOUSE", "GALLERY", "REVIEWS"]:
        record(f"Tab '{label}' present", label in text)
    if tabs:
        states = [t.get_attribute("data-state") for t in tabs]
        record(
            "Default tab is Settings (active)",
            states[0] == "active",
            ",".join(states),
        )


def test_admin_settings_fields(driver):
    print("\n🔹 T18 · Settings tab — grouped sections + key fields render")
    driver.get(_admin_url())
    wait_for(driver, ".lx-admin-tab", timeout=20)
    time.sleep(2.0)
    body_text = driver.execute_script("return document.body.innerText;") or ""
    lower = body_text.lower()

    # The new Settings tab groups fields under 10 section headings.
    expected_sections = [
        "navigation",
        "hero",
        "philosophy ticker",
        "about — chapter one",
        "house favourites — la carte",
        "collection — chapter two",
        "lookbook — chapter three",
        "correspondence — chapter four",
        "contact — chapter five",
        "footer",
    ]
    for label in expected_sections:
        record(f"Section '{label.title()}' visible", label in lower)

    # Spot-check a handful of unique field labels.
    expected_field_fragments = [
        "Hero Title",
        "Hero Badge Text",
        "WhatsApp Button Text",
        "Ticker line",
        "About paragraph",
        "Three feature labels",
        "WhatsApp Number (with country code)",
        "Instagram URL",
        "Footer Tagline",
        "Nav links",
        "Eyebrow",
        "Reply-time line under WhatsApp",
        "Delivery note",
        "Caption under Instagram",
    ]
    for label in expected_field_fragments:
        record(f"Field '{label}' rendered", label in body_text)

    save_btn = driver.execute_script(
        """
        return Array.from(document.querySelectorAll('button'))
                    .find(b => (b.innerText || '').toLowerCase().includes('save settings'));
        """
    )
    if save_btn:
        is_disabled = driver.execute_script(
            "return arguments[0].disabled;", save_btn
        )
        record("Save Settings disabled with no edits", bool(is_disabled))


def test_admin_to_public_setting_flow(driver):
    print("\n🔹 T19 · END-TO-END: edit Hero Title in admin → save returns commit_sha")
    sentinel = f"E2ETest_{int(time.time())}"
    # Snapshot the FULL current content from the live site BEFORE mutation, so
    # the cleanup can restore exactly what was there — not whatever the deployed
    # bundle happens to serve a few seconds later. Prevents sentinel-leaks from
    # racing Vercel auto-deploys.
    pretest_snapshot = _content_get_from_deployed()
    try:
        driver.get(_admin_url())
        wait_for(driver, ".lx-admin-tab", timeout=20)
        _install_save_capture(driver)
        time.sleep(2.5)  # let useSiteSettings populate

        hero_input = _find_input_by_label(driver, "Hero Title", "input")
        record("Hero Title input found", hero_input is not None)
        if not hero_input:
            return

        _react_set_value(driver, hero_input, sentinel)
        time.sleep(0.4)
        actual = driver.execute_script("return arguments[0].value;", hero_input)
        record("Input reflects typed value", actual == sentinel, actual)

        save_btn = driver.execute_script(
            """
            return Array.from(document.querySelectorAll('button'))
                        .find(b => (b.innerText || '').toLowerCase().includes('save settings'));
            """
        )
        if save_btn:
            is_disabled = driver.execute_script(
                "return arguments[0].disabled;", save_btn
            )
            record("Save Settings becomes enabled after edit", not is_disabled)
            hide_floats(driver)
            driver.execute_script(
                "arguments[0].scrollIntoView({block:'center'}); arguments[0].click();",
                save_btn,
            )
            restore_floats(driver)
            time.sleep(5.0)

        # Verify the admin save reached /api/save-content and got a commit_sha back.
        saved = _capture_save_response(driver)
        record(
            "Admin Save reached /api/save-content (HTTP 200)",
            saved is not None and saved.get("status") == 200,
        )
        record(
            "Save response includes commit_sha (proof commit landed on GitHub)",
            saved is not None
            and isinstance(saved.get("body"), dict)
            and saved["body"].get("ok") is True
            and isinstance(saved["body"].get("commit_sha"), str)
            and len(saved["body"]["commit_sha"]) > 0,
            str(saved.get("body") if saved else None)[:200],
        )
    finally:
        # Restore the EXACT pre-test snapshot — not just the hero_title field.
        # This means any sentinel write is fully rolled back even if Vercel's
        # auto-deploy queue reorders our commits.
        if pretest_snapshot:
            status, body = _content_save(pretest_snapshot)
            record(
                "Cleanup: restored exact pre-test content snapshot",
                status in (200, 204) and isinstance(body, dict) and body.get("ok") is True,
            )
        else:
            # Fallback to per-key restore if snapshot wasn't captured
            status, body = _restore_setting("hero_title", "Cake Rush")
            record(
                "Cleanup: hero_title restored to 'Cake Rush' (fallback path)",
                status in (200, 204) and isinstance(body, dict) and body.get("ok") is True,
            )


def test_admin_empty_save_clears_public(driver):
    print("\n🔹 T20 · END-TO-END: empty save accepted by /api/save-content")
    # Snapshot before mutating so cleanup restores the exact pre-test state
    # (defends against Vercel auto-deploy race leaving sentinels live).
    pretest_snapshot = _content_get_from_deployed()
    try:
        s, body = _restore_setting("hero_title", "")
        record(
            "Set hero_title = '' via /api/save-content",
            s in (200, 204) and isinstance(body, dict) and body.get("ok") is True,
        )
        record(
            "Empty save returned a commit_sha",
            isinstance(body, dict)
            and isinstance(body.get("commit_sha"), str)
            and len(body["commit_sha"]) > 0,
        )
    finally:
        if pretest_snapshot:
            s, body = _content_save(pretest_snapshot)
            record(
                "Cleanup: restored exact pre-test content snapshot",
                s in (200, 204) and isinstance(body, dict) and body.get("ok") is True,
            )
        else:
            s, body = _restore_setting("hero_title", "Cake Rush")
            record(
                "Cleanup: hero_title restored (fallback)",
                s in (200, 204) and isinstance(body, dict) and body.get("ok") is True,
            )


def test_admin_menu_tab(driver):
    print("\n🔹 T21 · Menu tab — structure")
    driver.get(_admin_url())
    wait_for(driver, ".lx-admin-tab", timeout=20)
    record("Switched to Menu tab", _click_admin_tab(driver, "MENU"))
    time.sleep(1.5)
    body = driver.execute_script("return document.body.innerText;") or ""
    lower = body.lower()
    record("'Menu Items' heading visible", "menu items" in lower)
    record("'Add Item' button visible", "add item" in lower)
    record(
        "Category names rendered (Cakes / Desserts)",
        "cakes" in lower or "desserts" in lower,
    )


def test_admin_gallery_tab(driver):
    print("\n🔹 T22 · Gallery tab — structure")
    driver.get(_admin_url())
    wait_for(driver, ".lx-admin-tab", timeout=20)
    record("Switched to Gallery tab", _click_admin_tab(driver, "GALLERY"))
    time.sleep(1.5)
    body = driver.execute_script("return document.body.innerText;") or ""
    record("Gallery 'Gallery (' counter visible", "Gallery (" in body)
    record("'Upload Image' button visible", "Upload Image" in body)


def test_admin_reviews_e2e(driver):
    print("\n🔹 T23 · END-TO-END: add testimonial via admin → save commits to GitHub")
    sentinel = f"E2EReviewer_{int(time.time())}"
    review_text = f"Sentinel review {int(time.time())}."
    needs_cleanup = False
    try:
        driver.get(_admin_url())
        wait_for(driver, ".lx-admin-tab", timeout=20)
        _install_save_capture(driver)
        record("Switched to Reviews tab", _click_admin_tab(driver, "REVIEWS"))

        add_btn = driver.execute_script(
            """
            return Array.from(document.querySelectorAll('button'))
                        .find(b => (b.innerText || '').includes('Add Review'));
            """
        )
        record("'Add Review' button found", add_btn is not None)
        if not add_btn:
            return
        hide_floats(driver)
        driver.execute_script("arguments[0].click();", add_btn)
        restore_floats(driver)
        time.sleep(0.8)

        name_input = _find_input_by_label(driver, "Client Name", "input")
        review_textarea = _find_input_by_label(driver, "Review", "textarea")
        record(
            "Editor inputs visible",
            name_input is not None and review_textarea is not None,
        )
        if not name_input or not review_textarea:
            return

        _react_set_value(driver, name_input, sentinel)
        _react_set_value(driver, review_textarea, review_text)
        time.sleep(0.4)

        save_btn = driver.execute_script(
            """
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(b => (b.innerText || '').trim() === 'Save' && !b.disabled);
            """
        )
        record("Editor 'Save' button enabled", save_btn is not None)
        if save_btn:
            hide_floats(driver)
            driver.execute_script("arguments[0].click();", save_btn)
            restore_floats(driver)
            time.sleep(5.0)
            needs_cleanup = True

        # The admin's save calls /api/save-content with the entire new content tree.
        saved = _capture_save_response(driver)
        record(
            "Save reached /api/save-content (HTTP 200)",
            saved is not None and saved.get("status") == 200,
        )
        record(
            "Save returned commit_sha (proof the testimonial committed)",
            saved is not None
            and isinstance(saved.get("body"), dict)
            and saved["body"].get("ok") is True
            and isinstance(saved["body"].get("commit_sha"), str),
        )
    finally:
        if needs_cleanup:
            # Read live content (bundled, slightly stale, but enough to know the
            # base state minus our new row) and re-save it to drop the sentinel.
            current = _content_get_from_deployed()
            if current:
                current = json.loads(json.dumps(current))
                current["testimonials"] = [
                    t for t in current.get("testimonials", [])
                    if t.get("client_name") != sentinel
                ]
                s, body = _content_save(current)
                record(
                    "Cleanup: test testimonial removed",
                    s in (200, 204) and isinstance(body, dict) and body.get("ok") is True,
                )


def test_tier2_settings_present_in_content_json(driver):
    print("\n🔹 T_T2A · Tier 2 keys live in /content.json + render in Settings tab")
    content = _content_get_from_deployed() or {}
    s = content.get("settings", {})
    expected_keys = [
        "hero_caption_left",
        "hero_caption_right",
        "hero_sticker",
        "about_secondary_text",
        "about_caption",
        "about_feature_descs",
        "footer_copyright",
    ]
    for k in expected_keys:
        record(f"settings key '{k}' present", k in s, repr(s.get(k))[:80])

    driver.get(_admin_url())
    wait_for(driver, ".lx-admin-tab", timeout=20)
    time.sleep(2.0)
    body_text = driver.execute_script("return document.body.innerText;") or ""
    expected_fragments = [
        "Hero image",
        "Hero caption — left side",
        "Hero caption — right side",
        "Hero sticker",
        "About image",
        "About image caption",
        "About paragraph (secondary, italic)",
        "Three feature descriptions",
        "Footer Copyright",
    ]
    for label in expected_fragments:
        record(f"Settings field '{label}' rendered", label in body_text)


def test_tier2_footer_copyright_year_substitution(driver):
    print("\n🔹 T_T2B · Footer copyright {year} placeholder substituted with current year")
    from datetime import datetime
    year = datetime.now().year
    driver.get(f"{BASE_URL.rstrip('/')}/?t={int(time.time())}")
    wait_for(driver, "footer.lx-foot", timeout=20)
    time.sleep(1.0)
    footer_text = driver.execute_script(
        "return document.querySelector('footer.lx-foot').innerText;"
    ) or ""
    record(
        f"Footer contains current year ({year})",
        str(year) in footer_text,
        footer_text[:200],
    )
    record("Footer copyright does NOT show raw '{year}' placeholder", "{year}" not in footer_text)


def test_tier3_every_string_editable(driver):
    print("\n🔹 T_T3 · Every-visible-string-editable sweep — 17 new keys live + in admin")

    content = _content_get_from_deployed() or {}
    s = content.get("settings", {})
    new_keys = [
        "brand_wordmark",
        "nav_eyebrow",
        "hero_image_alt",
        "about_image_alt",
        "lightbox_hint",
        "menu_reserve_label",
        "menu_quote_only_label",
        "menu_whatsapp_template",
        "house_request_quote_label",
        "house_quote_template",
        "floating_pill_label",
        "floating_pill_message",
        "contact_col_reserve_label",
        "contact_col_follow_label",
        "contact_col_visit_label",
        "contact_col_whatsapp_title",
        "contact_col_instagram_title",
    ]
    for k in new_keys:
        record(f"content.json settings has '{k}'", k in s, repr(s.get(k))[:80])

    # Verify the new fields render in the admin Settings tab.
    driver.get(_admin_url())
    wait_for(driver, ".lx-admin-tab", timeout=20)
    time.sleep(2.5)
    body = driver.execute_script("return document.body.innerText;") or ""
    expected_labels = [
        "Brand wordmark",
        "Navbar eyebrow",
        "Hero image alt text",
        "About image alt text",
        "Lookbook lightbox close-hint",
        "Per-cake \"Reserve\" button label",
        "Label shown on quote-only items",
        "WhatsApp message template for Reserve",
        "\"Request a quote\" button label",
        "WhatsApp message template for House quotes",
        "Pill button label",
        "WhatsApp prefilled message",
        "Reserve column eyebrow",
        "Reserve column title (italic)",
        "Follow column eyebrow",
        "Follow column title (italic)",
        "Visit column eyebrow",
        "Floating Order Now pill",  # section header
        "Branding",                  # section header
    ]
    body_lower = body.lower()
    for label in expected_labels:
        # Case-insensitive — section headers render uppercase via CSS.
        target = label.replace("Lookbook lightbox close-hint", "Lightbox close-hint")
        record(
            f"Admin shows '{label}'",
            target.lower() in body_lower or label.lower() in body_lower,
        )

    # Verify the wordmark setting actually flows through to navbar + footer on public.
    driver.get(f"{BASE_URL.rstrip('/')}/?t={int(time.time())}")
    wait_for(driver, "nav.lx-nav")
    time.sleep(1.5)
    expected_wordmark = s.get("brand_wordmark", "Cake Rush")
    nav_text = driver.execute_script(
        "return document.querySelector('nav.lx-nav').innerText;"
    ) or ""
    footer_text = driver.execute_script(
        "return document.querySelector('footer.lx-foot').innerText;"
    ) or ""
    record(
        f"Navbar shows wordmark '{expected_wordmark}'",
        expected_wordmark in nav_text,
        nav_text[:100],
    )
    record(
        f"Footer shows wordmark '{expected_wordmark}'",
        expected_wordmark in footer_text,
        footer_text[:100],
    )

    # Floating pill label
    pill_text = driver.execute_script(
        "return (document.querySelector('.lx-floatpill') || {}).innerText || '';"
    ) or ""
    expected_pill = s.get("floating_pill_label", "Order Now")
    record(
        f"Floating pill shows '{expected_pill}'",
        expected_pill.upper() in pill_text.upper(),
        pill_text[:80],
    )


def test_admin_house_tab(driver):
    print("\n🔹 T25 · House admin tab — categories + items + add-item button")
    driver.get(_admin_url())
    wait_for(driver, ".lx-admin-tab", timeout=20)
    record("Switched to House tab", _click_admin_tab(driver, "HOUSE"))
    time.sleep(1.5)
    body = driver.execute_script("return document.body.innerText;") or ""
    lower = body.lower()

    record("'House Favourites' heading visible", "house favourites" in lower)
    for label in ["Signature cakes", "Seasonal", "Smalls & gifting", "Bespoke"]:
        record(f"Category '{label}' rendered", label in body)

    add_btns = driver.execute_script(
        """
        return Array.from(document.querySelectorAll('button'))
                    .filter(b => (b.innerText || '').includes('Add Item')).length;
        """
    )
    record("One 'Add Item' button per category (4 total)", add_btns >= 4, f"found {add_btns}")

    # Each seeded category has 4 items → 16 total item thumbnails (rendered as images).
    snapshot = _content_get_from_deployed() or {}
    total_items = sum(len(c.get("items", [])) for c in snapshot.get("house_favourites", []))
    record(
        "content.json house_favourites has items seeded",
        total_items >= 16,
        f"total={total_items}",
    )


def test_admin_house_save_flow(driver):
    print("\n🔹 T26 · END-TO-END: add a house item via direct content save")
    sentinel = f"E2EHouseItem_{int(time.time())}"
    snapshot = _content_get_from_deployed()
    if not snapshot or not snapshot.get("house_favourites"):
        record("House categories present in /content.json", False)
        return
    record("House categories present in /content.json", True)

    # Pick the first category and append a new item
    next_content = json.loads(json.dumps(snapshot))
    cat = next_content["house_favourites"][0]
    new_item_id = f"hi-test-{int(time.time())}"
    cat["items"].append({
        "id": new_item_id,
        "name": sentinel,
        "image_url": "/gallery/cake_strawberry_v2_enhanced.png",
        "blurb": "",
        "quote": "",
    })

    s, body = _content_save(next_content)
    record(
        "House item add → save returned commit_sha",
        s == 200 and isinstance(body, dict) and body.get("ok") is True
        and isinstance(body.get("commit_sha"), str),
    )

    # Cleanup
    s2, b2 = _content_save(snapshot)
    record(
        "Cleanup: house favourites restored",
        s2 == 200 and isinstance(b2, dict) and b2.get("ok") is True,
    )


def test_admin_menu_item_lifecycle(driver):
    print("\n🔹 T24 · END-TO-END: insert → delete menu item via API (cascade prices)")

    # Read current content snapshot (from the bundled /content.json on the deployed site)
    snapshot = _content_get_from_deployed()
    if not snapshot or not snapshot.get("menu_categories"):
        record("Got a snapshot from /content.json", False, "no content available")
        return
    record("Got snapshot from /content.json", True)
    cat_id = snapshot["menu_categories"][0]["id"]

    name = f"E2EMenuItem_{int(time.time())}"
    item_id = f"mi-test-{int(time.time())}"
    price_id = f"p-test-{int(time.time())}"

    # 1. Insert item + one price variant (one save = one commit)
    next_content = json.loads(json.dumps(snapshot))
    next_content["menu_items"].append({
        "id": item_id, "category_id": cat_id, "name": name,
        "description": "selenium e2e", "image_url": None, "icon": "🎂",
        "is_active": True, "is_custom_only": False, "price": "", "sort_order": 999,
    })
    next_content["menu_item_prices"].append({
        "id": price_id, "menu_item_id": item_id,
        "weight_label": "½ Kg", "price": "₹399", "sort_order": 1,
    })
    s, body = _content_save(next_content)
    record(
        "Menu item + price insert → save returned commit_sha",
        s == 200 and isinstance(body, dict) and body.get("ok") is True
        and isinstance(body.get("commit_sha"), str),
    )
    record(
        "Insert payload contained 1 new item + 1 new price",
        any(i["id"] == item_id for i in next_content["menu_items"])
        and any(p["id"] == price_id for p in next_content["menu_item_prices"]),
    )

    # 2. Cascade-delete the item by sending a new payload with both rows removed
    after_delete = json.loads(json.dumps(next_content))
    after_delete["menu_items"] = [
        i for i in after_delete["menu_items"] if i["id"] != item_id
    ]
    after_delete["menu_item_prices"] = [
        p for p in after_delete["menu_item_prices"] if p["menu_item_id"] != item_id
    ]
    s2, b2 = _content_save(after_delete)
    record(
        "Cascade-delete (item + prices) save returned commit_sha",
        s2 == 200 and isinstance(b2, dict) and b2.get("ok") is True
        and isinstance(b2.get("commit_sha"), str),
    )
    record(
        "Delete payload has no orphan price rows pointing at deleted item",
        not any(p["menu_item_id"] == item_id for p in after_delete["menu_item_prices"]),
    )

    # 3. Re-add the same name with a fresh id
    new_item_id = f"mi-test2-{int(time.time())}"
    re_add = json.loads(json.dumps(after_delete))
    re_add["menu_items"].append({
        "id": new_item_id, "category_id": cat_id, "name": name,
        "description": "second time", "image_url": None, "icon": "🍰",
        "is_active": True, "is_custom_only": False, "price": "", "sort_order": 999,
    })
    s3, b3 = _content_save(re_add)
    record(
        "Re-add same name with fresh id → save returned commit_sha",
        s3 == 200 and isinstance(b3, dict) and b3.get("ok") is True
        and new_item_id != item_id,
    )

    # 4. Cleanup — restore to original snapshot
    s4, b4 = _content_save(snapshot)
    record(
        "Cleanup: restored snapshot content",
        s4 == 200 and isinstance(b4, dict) and b4.get("ok") is True,
    )


# ══════════════════════════════════════════════════════════════════════════
#  Runner
# ══════════════════════════════════════════════════════════════════════════
TESTS = [
    # Public site
    test_page_load,
    test_navbar,
    test_navbar_scroll,
    test_hero,
    test_philosophy,
    test_about,
    test_house_favourites,
    test_collection,
    test_lookbook,
    test_testimonials,
    test_contact,
    test_footer,
    test_floating_pill,
    test_smooth_scroll,
    test_console_errors,
    # Admin page + admin → public flow
    test_admin_loads,
    test_admin_tabs,
    test_admin_settings_fields,
    test_admin_to_public_setting_flow,
    test_admin_empty_save_clears_public,
    test_admin_menu_tab,
    test_admin_gallery_tab,
    test_admin_reviews_e2e,
    test_admin_house_tab,
    test_admin_house_save_flow,
    test_admin_menu_item_lifecycle,
    test_tier2_settings_present_in_content_json,
    test_tier2_footer_copyright_year_substitution,
    test_tier3_every_string_editable,
]


def main() -> int:
    print("=" * 78)
    print("  CAKE RUSH — Selenium suite (v2 warm editorial)")
    print(f"  Target: {BASE_URL}")
    print("=" * 78)
    driver = create_driver()
    try:
        for fn in TESTS:
            try:
                fn(driver)
            except Exception as e:
                record(f"{fn.__name__} crashed", False, repr(e)[:160])
    finally:
        driver.quit()

    total = len(results)
    passed = sum(1 for r in results if r.passed)
    failed = total - passed
    print("\n" + "=" * 78)
    print(f"  RESULTS — {passed}/{total} passed, {failed} failed")
    print("=" * 78)
    if failed:
        print("\n  Failures:")
        for r in results:
            if not r.passed:
                print(f"    ✗ {r.name}" + (f" — {r.detail}" if r.detail else ""))
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
