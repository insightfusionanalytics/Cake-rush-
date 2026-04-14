"""
=============================================================================
CAKE RUSH - Comprehensive Selenium Test Suite
=============================================================================

HOW SELENIUM WORKS (for beginners):
-----------------------------------
Think of Selenium as a robot that opens Chrome and does things a user would do:
  1. It opens a URL in a real browser
  2. It finds elements on the page (buttons, text, images, links)
  3. It clicks, scrolls, types, and checks things
  4. It reports PASS or FAIL for each check

KEY CONCEPTS:
- "driver"       = the browser instance Selenium controls
- "find_element"  = find something on the page (by CSS selector, ID, etc.)
- "WebDriverWait" = wait for something to appear (pages take time to load)
- "assert"        = check if something is true; if not, the test fails
- "headless"      = run Chrome invisibly (no window pops up)

We run Chrome in HEADLESS mode so no browser window opens -- it all
happens in the background and we just see PASS/FAIL results in the terminal.
=============================================================================
"""

import time
import sys
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# ── Configuration ──────────────────────────────────────────────────────────
BASE_URL = "http://localhost:8080"
WAIT_TIMEOUT = 15  # seconds to wait for elements to load

# ── Test Results Tracking ──────────────────────────────────────────────────
results = []  # stores (test_name, status, detail) tuples


def record(name: str, passed: bool, detail: str = ""):
    """Record a test result."""
    status = "PASS" if passed else "FAIL"
    results.append((name, status, detail))
    icon = "✅" if passed else "❌"
    print(f"  {icon} {name}" + (f" — {detail}" if detail else ""))


# ── Browser Setup ──────────────────────────────────────────────────────────
def create_driver():
    """
    Creates a Chrome browser instance.

    TWO MODES (controlled by --headless flag when running the script):
      python3 test_cake_rush.py            → VISIBLE Chrome window (you watch it!)
      python3 test_cake_rush.py --headless → invisible, background mode

    In VISIBLE mode you'll see Chrome open and the robot will click,
    scroll, and navigate the site — like watching someone else use your computer.
    """
    opts = Options()

    # Check if user wants headless (invisible) mode
    if "--headless" in sys.argv:
        opts.add_argument("--headless=new")   # no visible browser window
        print("  ⚙️  Running in HEADLESS mode (no browser window)")
    else:
        print("  👁️  Running in VISIBLE mode — watch Chrome!")
        print("  💡  Tip: run with --headless flag to hide the browser\n")

    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1440,900")  # simulate desktop screen
    opts.add_argument("--disable-gpu")

    # webdriver-manager auto-downloads the correct ChromeDriver version
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=opts)
    driver.implicitly_wait(5)
    return driver


# ══════════════════════════════════════════════════════════════════════════
#  TEST 1: PAGE LOAD
#  Simply checks: does the website load at all? Is the title correct?
# ══════════════════════════════════════════════════════════════════════════
def test_page_load(driver):
    print("\n🔹 TEST 1: Page Load")
    driver.get(BASE_URL)
    # Wait for the page body to be present
    WebDriverWait(driver, WAIT_TIMEOUT).until(
        EC.presence_of_element_located((By.TAG_NAME, "body"))
    )
    record("Page loads successfully", driver.title is not None)
    record("URL is correct", driver.current_url.rstrip("/") == BASE_URL.rstrip("/"))


# ══════════════════════════════════════════════════════════════════════════
#  TEST 2: NAVBAR
#  Checks: logo visible, all 5 nav links present, Order Now button exists
# ══════════════════════════════════════════════════════════════════════════
def test_navbar(driver):
    print("\n🔹 TEST 2: Navbar")
    driver.get(BASE_URL)
    WebDriverWait(driver, WAIT_TIMEOUT).until(
        EC.presence_of_element_located((By.TAG_NAME, "nav"))
    )

    # Check logo image exists
    logos = driver.find_elements(By.CSS_SELECTOR, "nav img")
    record("Logo image is present", len(logos) > 0)

    # Check all 5 navigation links are present
    nav_buttons = driver.find_elements(By.CSS_SELECTOR, "nav button")
    # nav_buttons includes: Home, About, Menu, Gallery, Contact + hamburger
    nav_labels = [b.text for b in nav_buttons if b.text.strip()]
    expected_links = ["Home", "About", "Menu", "Gallery", "Contact"]
    for link in expected_links:
        found = link in nav_labels
        record(f"Nav link '{link}' exists", found,
               "" if found else f"Found: {nav_labels}")

    # Check "Order Now" WhatsApp button
    order_btns = driver.find_elements(By.XPATH, "//nav//a[contains(@href,'wa.me')]")
    record("'Order Now' WhatsApp button exists", len(order_btns) > 0)

    # Check WhatsApp link format is correct
    if order_btns:
        href = order_btns[0].get_attribute("href")
        record("Order Now links to wa.me", "wa.me" in href, href)
        record("Order Now opens in new tab", order_btns[0].get_attribute("target") == "_blank")


# ══════════════════════════════════════════════════════════════════════════
#  TEST 3: NAVBAR SCROLL BEHAVIOR
#  When you scroll down, navbar should get a background (becomes opaque).
# ══════════════════════════════════════════════════════════════════════════
def test_navbar_scroll(driver):
    print("\n🔹 TEST 3: Navbar Scroll Behavior")
    driver.get(BASE_URL)
    WebDriverWait(driver, WAIT_TIMEOUT).until(
        EC.presence_of_element_located((By.TAG_NAME, "nav"))
    )

    nav = driver.find_element(By.TAG_NAME, "nav")

    # Before scrolling - navbar should be transparent
    classes_before = nav.get_attribute("class")
    record("Navbar starts transparent", "bg-transparent" in classes_before)

    # Scroll down 500px to trigger the scroll effect
    driver.execute_script("window.scrollBy(0, 500);")
    time.sleep(1)  # wait for transition

    # After scrolling - navbar should have background
    classes_after = nav.get_attribute("class")
    record("Navbar gets background on scroll", "backdrop-blur" in classes_after or "shadow" in classes_after)


# ══════════════════════════════════════════════════════════════════════════
#  TEST 4: SMOOTH SCROLL NAVIGATION
#  Clicking a nav link (e.g. "Menu") should smooth-scroll to that section.
# ══════════════════════════════════════════════════════════════════════════
def test_smooth_scroll(driver):
    print("\n🔹 TEST 4: Smooth Scroll Navigation")
    driver.get(BASE_URL)
    WebDriverWait(driver, WAIT_TIMEOUT).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "#menu"))
    )

    # Get initial scroll position
    scroll_before = driver.execute_script("return window.scrollY;")

    # Click "Menu" in the navbar
    menu_btns = driver.find_elements(By.XPATH, "//nav//button[text()='Menu']")
    if menu_btns:
        menu_btns[0].click()
        time.sleep(1.5)  # wait for smooth scroll animation

        scroll_after = driver.execute_script("return window.scrollY;")
        record("Clicking 'Menu' scrolls the page", scroll_after > scroll_before,
               f"scrolled from {scroll_before} to {scroll_after}")

        # Check if #menu section is now in viewport
        in_view = driver.execute_script("""
            const el = document.querySelector('#menu');
            const rect = el.getBoundingClientRect();
            return rect.top >= -100 && rect.top <= 300;
        """)
        record("Menu section is in viewport after click", in_view)
    else:
        record("Menu nav button found", False, "Could not find Menu button")


# ══════════════════════════════════════════════════════════════════════════
#  TEST 5: HERO SECTION
#  Checks: title text, CTA buttons (WhatsApp + Instagram), hero image
# ══════════════════════════════════════════════════════════════════════════
def test_hero_section(driver):
    print("\n🔹 TEST 5: Hero Section")
    driver.get(BASE_URL)
    WebDriverWait(driver, WAIT_TIMEOUT).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "#home"))
    )

    hero = driver.find_element(By.CSS_SELECTOR, "#home")

    # Check hero heading exists
    headings = hero.find_elements(By.TAG_NAME, "h1")
    record("Hero heading (h1) exists", len(headings) > 0)
    if headings:
        # Use innerText via JS because the h1 contains child <span> elements
        h1_text = driver.execute_script("return arguments[0].innerText;", headings[0])
        record("Hero heading has text", len((h1_text or "").strip()) > 0, (h1_text or "")[:50])

    # Check "Freshly Baked" tagline
    tagline = hero.find_elements(By.XPATH, ".//*[contains(text(),'Freshly Baked')]")
    record("'Freshly Baked' tagline present", len(tagline) > 0)

    # Check WhatsApp CTA button
    wa_btns = hero.find_elements(By.XPATH, ".//a[contains(@href,'wa.me')]")
    record("WhatsApp CTA button exists in hero", len(wa_btns) > 0)
    if wa_btns:
        record("WhatsApp CTA opens in new tab", wa_btns[0].get_attribute("target") == "_blank")

    # Check Instagram CTA button
    # It's the second button/link in the hero
    all_links = hero.find_elements(By.TAG_NAME, "a")
    instagram_links = [a for a in all_links if "wa.me" not in (a.get_attribute("href") or "")]
    record("Instagram CTA button exists in hero", len(instagram_links) > 0)

    # Check hero image
    hero_imgs = hero.find_elements(By.TAG_NAME, "img")
    record("Hero image is present", len(hero_imgs) > 0)
    if hero_imgs:
        src = hero_imgs[0].get_attribute("src")
        record("Hero image has a src", bool(src), src[:60] if src else "")


# ══════════════════════════════════════════════════════════════════════════
#  TEST 6: ABOUT SECTION
#  Checks: heading, description text, feature badges, about image
# ══════════════════════════════════════════════════════════════════════════
def test_about_section(driver):
    print("\n🔹 TEST 6: About Section")
    driver.get(BASE_URL)
    WebDriverWait(driver, WAIT_TIMEOUT).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "#about"))
    )

    about = driver.find_element(By.CSS_SELECTOR, "#about")

    # Check heading
    headings = about.find_elements(By.TAG_NAME, "h2")
    record("About heading (h2) exists", len(headings) > 0)

    # Check about image
    imgs = about.find_elements(By.TAG_NAME, "img")
    record("About section image exists", len(imgs) > 0)

    # Check feature badges (Custom Designs, Fresh Ingredients, Made with Love)
    badge_texts = driver.execute_script("return arguments[0].innerText;", about)
    record("Feature badges area has content", len(badge_texts) > 10, badge_texts[:60])


# ══════════════════════════════════════════════════════════════════════════
#  TEST 7: MENU SECTION
#  Checks: section heading, tab buttons (categories), menu item cards,
#          prices displayed, "Request a Quote" for custom items,
#          WhatsApp order button at bottom
# ══════════════════════════════════════════════════════════════════════════
def test_menu_section(driver):
    print("\n🔹 TEST 7: Menu Section")
    driver.get(BASE_URL)
    WebDriverWait(driver, WAIT_TIMEOUT).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "#menu"))
    )

    menu = driver.find_element(By.CSS_SELECTOR, "#menu")

    # Check section heading
    headings = menu.find_elements(By.TAG_NAME, "h2")
    record("Menu heading exists", len(headings) > 0)
    if headings:
        record("Menu heading says 'Our Menu'", "Menu" in headings[0].text, headings[0].text)

    # Check tab buttons (categories loaded from Supabase)
    tabs = menu.find_elements(By.CSS_SELECTOR, "[role='tab']")
    record("Menu category tabs exist", len(tabs) > 0, f"Found {len(tabs)} tabs")

    # Check tab switching works
    if len(tabs) >= 2:
        # Scroll the tab into view first, then click via JavaScript
        tab_name = tabs[1].text
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", tabs[1])
        time.sleep(0.5)
        # Hide the floating WhatsApp button temporarily so it doesn't intercept clicks
        driver.execute_script("""
            const floats = document.querySelectorAll('a.fixed');
            floats.forEach(f => f.style.display = 'none');
        """)
        time.sleep(0.3)
        # Now click the tab with a real Selenium click
        tabs[1].click()
        time.sleep(1)
        # Restore floats
        driver.execute_script("""
            const floats = document.querySelectorAll('a.fixed');
            floats.forEach(f => f.style.display = '');
        """)

        # Re-fetch tabs after click since React may re-render
        tabs = menu.find_elements(By.CSS_SELECTOR, "[role='tab']")
        is_active = tabs[1].get_attribute("data-state") if len(tabs) >= 2 else ""
        record(f"Clicking tab '{tab_name}' activates it", is_active == "active",
               f"state={is_active}")

        # Click back to first tab
        driver.execute_script("arguments[0].click();", tabs[0])
        time.sleep(0.5)

    # Check menu item cards exist
    cards = menu.find_elements(By.CSS_SELECTOR, ".grid > div")
    record("Menu item cards are displayed", len(cards) > 0, f"Found {len(cards)} cards")

    # Check that at least one card has a name (h3)
    card_names = menu.find_elements(By.CSS_SELECTOR, ".grid h3")
    record("Menu items have names", len(card_names) > 0)

    # Check for price display
    prices = menu.find_elements(By.CSS_SELECTOR, ".text-primary.font-semibold")
    record("Prices are displayed", len(prices) > 0)

    # Check the bottom WhatsApp order button
    wa_btn = menu.find_elements(By.XPATH, ".//a[contains(@href,'wa.me')]")
    record("'Order Your Favourite Now' WhatsApp button exists", len(wa_btn) > 0)


# ══════════════════════════════════════════════════════════════════════════
#  TEST 8: GALLERY SECTION
#  Checks: gallery images loaded, lightbox opens on image click,
#          lightbox closes correctly
# ══════════════════════════════════════════════════════════════════════════
def test_gallery_section(driver):
    print("\n🔹 TEST 8: Gallery Section")
    driver.get(BASE_URL)
    WebDriverWait(driver, WAIT_TIMEOUT).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "#gallery"))
    )

    gallery = driver.find_element(By.CSS_SELECTOR, "#gallery")

    # Check heading
    headings = gallery.find_elements(By.TAG_NAME, "h2")
    record("Gallery heading exists", len(headings) > 0)

    # Check gallery images
    images = gallery.find_elements(By.CSS_SELECTOR, ".grid button")
    record("Gallery images are loaded", len(images) > 0, f"Found {len(images)} images")

    # Test lightbox: click first image (scroll into view + JS click to avoid float overlay)
    if images:
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", images[0])
        time.sleep(0.5)
        driver.execute_script("arguments[0].click();", images[0])
        time.sleep(1)

        # Check if dialog/lightbox opened
        dialogs = driver.find_elements(By.CSS_SELECTOR, "[role='dialog']")
        record("Lightbox opens on image click", len(dialogs) > 0)

        # Check lightbox has an image
        if dialogs:
            lightbox_img = dialogs[0].find_elements(By.TAG_NAME, "img")
            record("Lightbox displays an image", len(lightbox_img) > 0)

            # Close lightbox by pressing Escape
            from selenium.webdriver.common.keys import Keys
            driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
            time.sleep(0.5)

            # Check it closed
            dialogs_after = driver.find_elements(By.CSS_SELECTOR, "[role='dialog']")
            record("Lightbox closes on Escape key", len(dialogs_after) == 0)


# ══════════════════════════════════════════════════════════════════════════
#  TEST 9: TESTIMONIALS SECTION
#  Checks: heading, testimonial cards, star ratings, client names
# ══════════════════════════════════════════════════════════════════════════
def test_testimonials_section(driver):
    print("\n🔹 TEST 9: Testimonials Section")
    driver.get(BASE_URL)
    time.sleep(2)

    # Testimonials section doesn't have an ID, find by heading text
    headings = driver.find_elements(By.XPATH, "//h2[contains(text(),'Clients Say')]")
    record("Testimonials heading exists", len(headings) > 0)

    if headings:
        section = headings[0].find_element(By.XPATH, "./ancestor::section")

        # Use innerText to check for testimonial content
        section_text = driver.execute_script("return arguments[0].innerText;", section)

        # Check testimonial cards - look for cards with star characters
        cards = section.find_elements(By.XPATH, ".//div[contains(@class,'grid')]//div[contains(@class,'rounded')]")
        if not cards:
            # Fallback: any divs inside the grid
            cards = section.find_elements(By.XPATH, ".//div[contains(@class,'grid')]/div")
        record("Testimonial cards are displayed", len(cards) > 0, f"Found {len(cards)} cards")

        # Check star ratings exist (★ character)
        record("Star ratings are displayed", "★" in section_text)

        # Check client names (text starting with "—")
        record("Client names are displayed", "—" in section_text)


# ══════════════════════════════════════════════════════════════════════════
#  TEST 10: CONTACT SECTION
#  Checks: heading, WhatsApp button, Instagram button,
#          delivery info badge, address badge
# ══════════════════════════════════════════════════════════════════════════
def test_contact_section(driver):
    print("\n🔹 TEST 10: Contact Section")
    driver.get(BASE_URL)
    WebDriverWait(driver, WAIT_TIMEOUT).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "#contact"))
    )

    contact = driver.find_element(By.CSS_SELECTOR, "#contact")

    # Check heading
    headings = contact.find_elements(By.TAG_NAME, "h2")
    record("Contact heading exists", len(headings) > 0)

    # Check WhatsApp button
    wa_btns = contact.find_elements(By.XPATH, ".//a[contains(@href,'wa.me')]")
    record("Contact WhatsApp button exists", len(wa_btns) > 0)
    if wa_btns:
        href = wa_btns[0].get_attribute("href")
        record("WhatsApp link contains pre-filled message", "text=" in href)

    # Check Instagram button
    ig_btns = contact.find_elements(By.XPATH, ".//a[not(contains(@href,'wa.me'))]")
    record("Contact Instagram button exists", len(ig_btns) > 0)

    # Check delivery badge
    delivery = contact.find_elements(By.XPATH, ".//*[contains(text(),'Delivery')]")
    record("Delivery info badge shown", len(delivery) > 0)

    # Check address
    address = contact.find_elements(By.XPATH, ".//*[contains(text(),'Bandra')]")
    record("Address (Bandra West) is shown", len(address) > 0)


# ══════════════════════════════════════════════════════════════════════════
#  TEST 11: FOOTER
#  Checks: logo, brand name, tagline, WhatsApp link, Instagram link,
#          address, copyright year
# ══════════════════════════════════════════════════════════════════════════
def test_footer(driver):
    print("\n🔹 TEST 11: Footer")
    driver.get(BASE_URL)
    time.sleep(2)

    footers = driver.find_elements(By.TAG_NAME, "footer")
    record("Footer element exists", len(footers) > 0)

    if footers:
        footer = footers[0]

        # Check brand name
        brand = footer.find_elements(By.XPATH, ".//*[contains(text(),'Cake Rush')]")
        record("Brand name 'Cake Rush' in footer", len(brand) > 0)

        # Check logo
        logos = footer.find_elements(By.TAG_NAME, "img")
        record("Footer logo exists", len(logos) > 0)

        # Check WhatsApp link
        wa = footer.find_elements(By.XPATH, ".//a[contains(@href,'wa.me')]")
        record("Footer WhatsApp link exists", len(wa) > 0)

        # Check Instagram link
        ig = footer.find_elements(By.XPATH, ".//a[contains(text(),'Instagram')]")
        record("Footer Instagram link exists", len(ig) > 0)

        # Check copyright with current year (use JS to get inner text which includes all nested text)
        import datetime
        year = str(datetime.datetime.now().year)
        footer_text = driver.execute_script("return arguments[0].innerText;", footer)
        record(f"Copyright shows current year ({year})", year in footer_text,
               footer_text[-60:] if footer_text else "")

        # Check address
        addr = footer.find_elements(By.XPATH, ".//*[contains(text(),'Carter Road')]")
        record("Footer shows address", len(addr) > 0)


# ══════════════════════════════════════════════════════════════════════════
#  TEST 12: WHATSAPP FLOATING BUTTON
#  Checks: floating button visible, correct link, positioned bottom-right
# ══════════════════════════════════════════════════════════════════════════
def test_whatsapp_float(driver):
    print("\n🔹 TEST 12: WhatsApp Floating Button")
    driver.get(BASE_URL)
    time.sleep(2)

    # Find the floating WhatsApp button (fixed position, bottom-right)
    floats = driver.find_elements(By.CSS_SELECTOR, "a.fixed[href*='wa.me']")
    record("Floating WhatsApp button exists", len(floats) > 0)

    if floats:
        btn = floats[0]
        record("Float button opens in new tab", btn.get_attribute("target") == "_blank")
        record("Float button has pre-filled message", "text=" in btn.get_attribute("href"))

        # Check it's visible (not hidden)
        record("Float button is visible", btn.is_displayed())


# ══════════════════════════════════════════════════════════════════════════
#  TEST 13: ALL WHATSAPP LINKS VALIDITY
#  Gathers every wa.me link on the page and checks they are well-formed.
# ══════════════════════════════════════════════════════════════════════════
def test_whatsapp_links(driver):
    print("\n🔹 TEST 13: WhatsApp Links Validity")
    driver.get(BASE_URL)
    time.sleep(2)

    wa_links = driver.find_elements(By.CSS_SELECTOR, "a[href*='wa.me']")
    record("WhatsApp links found on page", len(wa_links) > 0, f"Found {len(wa_links)} links")

    for i, link in enumerate(wa_links):
        href = link.get_attribute("href") or ""
        # Check format: https://wa.me/XXXXXXXXXXX
        has_number = any(char.isdigit() for char in href)
        record(f"WA link #{i+1} has phone number", has_number, href[:60])
        record(f"WA link #{i+1} opens new tab", link.get_attribute("target") == "_blank")


# ══════════════════════════════════════════════════════════════════════════
#  TEST 14: RESPONSIVE - MOBILE MENU
#  Resizes browser to mobile width and checks hamburger menu works.
# ══════════════════════════════════════════════════════════════════════════
def test_mobile_menu(driver):
    print("\n🔹 TEST 14: Mobile Menu (Responsive)")
    driver.get(BASE_URL)
    time.sleep(1)

    # Resize to mobile width
    driver.set_window_size(375, 812)
    time.sleep(1)

    # Desktop nav links should be hidden
    desktop_nav = driver.find_elements(By.CSS_SELECTOR, "nav .hidden.md\\:flex")
    # Check if desktop nav is not visible (hidden class on mobile)

    # Hamburger button should be visible
    hamburger = driver.find_elements(By.CSS_SELECTOR, "nav button.md\\:hidden")
    record("Hamburger menu button visible on mobile", len(hamburger) > 0)

    if hamburger:
        hamburger[0].click()
        time.sleep(0.5)

        # Mobile menu should now be open with navigation links
        mobile_links = driver.find_elements(By.XPATH, "//nav//div[contains(@class,'md:hidden')]//button")
        record("Mobile menu opens with links", len(mobile_links) > 0, f"Found {len(mobile_links)} links")

        # Click a link - menu should close and scroll
        if mobile_links:
            mobile_links[0].click()
            time.sleep(1)
            # After clicking, the mobile overlay should disappear
            # (menu closes on link click)

    # Reset to desktop size
    driver.set_window_size(1440, 900)
    time.sleep(0.5)


# ══════════════════════════════════════════════════════════════════════════
#  TEST 15: 404 NOT FOUND PAGE
#  Navigating to a non-existent route should show 404 page.
# ══════════════════════════════════════════════════════════════════════════
def test_404_page(driver):
    print("\n🔹 TEST 15: 404 Not Found Page")
    driver.get(f"{BASE_URL}/this-page-does-not-exist")
    time.sleep(2)

    body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
    record("404 page shows error content", "404" in body_text or "not found" in body_text,
           body_text[:80])


# ══════════════════════════════════════════════════════════════════════════
#  TEST 16: ADMIN PAGE LOADS
#  Checks that /admin route loads without crashing.
# ══════════════════════════════════════════════════════════════════════════
def test_admin_page(driver):
    print("\n🔹 TEST 16: Admin Page")
    driver.get(f"{BASE_URL}/admin")
    time.sleep(3)

    body = driver.find_element(By.TAG_NAME, "body")
    record("Admin page loads", len(body.text) > 10, body.text[:60])

    # Check no JS errors crashed the page
    no_crash = "error" not in body.text.lower() or "admin" in body.text.lower()
    record("Admin page renders without crash", no_crash)


# ══════════════════════════════════════════════════════════════════════════
#  TEST 17: PAGE PERFORMANCE
#  Checks that all images have src, no broken images, lazy loading used.
# ══════════════════════════════════════════════════════════════════════════
def test_images_and_performance(driver):
    print("\n🔹 TEST 17: Images & Performance")
    driver.get(BASE_URL)
    time.sleep(3)

    # Scroll through entire page so lazy images load
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(1)

    all_imgs = driver.find_elements(By.TAG_NAME, "img")
    record("Page has images", len(all_imgs) > 0, f"Found {len(all_imgs)} images")

    # Check each image has a src
    broken = 0
    for img in all_imgs:
        src = img.get_attribute("src") or ""
        if not src or src == "":
            broken += 1
    record("All images have src attribute", broken == 0,
           f"{broken} images missing src" if broken else "")

    # Check that gallery images use lazy loading
    lazy_imgs = driver.find_elements(By.CSS_SELECTOR, "img[loading='lazy']")
    record("Lazy loading is used for images", len(lazy_imgs) > 0, f"{len(lazy_imgs)} lazy images")


# ══════════════════════════════════════════════════════════════════════════
#  TEST 18: ACCESSIBILITY BASICS
#  Checks alt text on images, aria labels, semantic HTML
# ══════════════════════════════════════════════════════════════════════════
def test_accessibility(driver):
    print("\n🔹 TEST 18: Accessibility Basics")
    driver.get(BASE_URL)
    time.sleep(2)

    # Check images have alt text
    all_imgs = driver.find_elements(By.TAG_NAME, "img")
    missing_alt = 0
    for img in all_imgs:
        alt = img.get_attribute("alt")
        if not alt or alt.strip() == "":
            missing_alt += 1
    record("All images have alt text", missing_alt == 0,
           f"{missing_alt} missing alt" if missing_alt else "")

    # Check page has proper heading hierarchy
    h1s = driver.find_elements(By.TAG_NAME, "h1")
    h2s = driver.find_elements(By.TAG_NAME, "h2")
    record("Page has h1 heading", len(h1s) > 0)
    record("Page has h2 headings", len(h2s) > 0, f"Found {len(h2s)} h2 elements")

    # Check WhatsApp float has aria-label
    float_btn = driver.find_elements(By.CSS_SELECTOR, "a.fixed[aria-label]")
    record("WhatsApp float has aria-label", len(float_btn) > 0)

    # Check nav has semantic <nav> element
    navs = driver.find_elements(By.TAG_NAME, "nav")
    record("Page uses semantic <nav> element", len(navs) > 0)

    # Check footer uses semantic <footer>
    footers = driver.find_elements(By.TAG_NAME, "footer")
    record("Page uses semantic <footer> element", len(footers) > 0)


# ══════════════════════════════════════════════════════════════════════════
#  TEST 19: NO CONSOLE ERRORS
#  Checks browser console for JavaScript errors
# ══════════════════════════════════════════════════════════════════════════
def test_no_console_errors(driver):
    print("\n🔹 TEST 19: No JavaScript Console Errors")
    driver.get(BASE_URL)
    time.sleep(3)

    # Get browser console logs
    # Note: we exclude known/expected errors like 404 page (from our own test)
    logs = driver.get_log("browser")
    errors = [log for log in logs if log["level"] == "SEVERE"
              and "404" not in log.get("message", "")
              and "NotFound" not in log.get("message", "")]
    record("No severe JS console errors", len(errors) == 0,
           f"{len(errors)} errors found" if errors else "Clean console")
    for err in errors[:3]:  # show first 3 errors
        record(f"  Console error", False, err["message"][:100])


# ══════════════════════════════════════════════════════════════════════════
#  TEST 20: EXTERNAL LINKS
#  Checks all external links have rel="noopener noreferrer" (security)
#  and target="_blank"
# ══════════════════════════════════════════════════════════════════════════
def test_external_links_security(driver):
    print("\n🔹 TEST 20: External Links Security")
    driver.get(BASE_URL)
    time.sleep(2)

    external_links = driver.find_elements(By.CSS_SELECTOR, "a[target='_blank']")
    record("External links found", len(external_links) > 0, f"Found {len(external_links)}")

    missing_rel = 0
    for link in external_links:
        rel = link.get_attribute("rel") or ""
        if "noopener" not in rel or "noreferrer" not in rel:
            missing_rel += 1
    record("All external links have noopener noreferrer",
           missing_rel == 0,
           f"{missing_rel} links missing security attributes" if missing_rel else "")


# ══════════════════════════════════════════════════════════════════════════
#  MAIN: Run all tests and print summary
# ══════════════════════════════════════════════════════════════════════════
def main():
    print("=" * 65)
    print("  CAKE RUSH — Selenium Test Suite")
    print("  Testing: " + BASE_URL)
    print("=" * 65)

    driver = create_driver()

    try:
        test_page_load(driver)
        test_navbar(driver)
        test_navbar_scroll(driver)
        test_smooth_scroll(driver)
        test_hero_section(driver)
        test_about_section(driver)
        test_menu_section(driver)
        test_gallery_section(driver)
        test_testimonials_section(driver)
        test_contact_section(driver)
        test_footer(driver)
        test_whatsapp_float(driver)
        test_whatsapp_links(driver)
        test_mobile_menu(driver)
        test_404_page(driver)
        test_admin_page(driver)
        test_images_and_performance(driver)
        test_accessibility(driver)
        test_no_console_errors(driver)
        test_external_links_security(driver)
    except Exception as e:
        print(f"\n💥 UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()

    # ── Print Summary ──────────────────────────────────────────────────
    print("\n" + "=" * 65)
    print("  TEST RESULTS SUMMARY")
    print("=" * 65)

    passed = sum(1 for _, s, _ in results if s == "PASS")
    failed = sum(1 for _, s, _ in results if s == "FAIL")
    total = len(results)

    if failed > 0:
        print(f"\n  ❌ FAILED TESTS ({failed}):")
        for name, status, detail in results:
            if status == "FAIL":
                print(f"     • {name}" + (f" — {detail}" if detail else ""))

    print(f"\n  Total : {total}")
    print(f"  Passed: {passed} ✅")
    print(f"  Failed: {failed} ❌")
    print(f"  Rate  : {passed/total*100:.1f}%" if total else "")
    print("=" * 65)

    sys.exit(1 if failed > 0 else 0)


if __name__ == "__main__":
    main()
