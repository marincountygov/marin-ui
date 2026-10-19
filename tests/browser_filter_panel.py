#!/usr/bin/env python3
"""Browser test of the collapsible filter panel (shared/app-shell.js + shared/app-brand.css), served over HTTP
from this repository so fonts and scripts load from one origin.

Needs Playwright for Python and Chromium:  python3 -m pip install playwright && python3 -m playwright install chromium
Run:  python3 tests/browser_filter_panel.py
"""
from __future__ import annotations

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = "tests/fixtures/filter-panel.html"
LOOK = "el => { const c = getComputedStyle(el); return [c.borderTopWidth, c.borderTopColor, c.borderRadius, c.backgroundColor, c.color]; }"


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def state(page, key="a"):
    return page.evaluate(
        """key => {
            const button = document.getElementById('toggle-' + key), layout = document.getElementById('layout-' + key), panel = document.getElementById('panel-' + key);
            return { expanded: button.getAttribute('aria-expanded'), filters: layout.dataset.filters, open: panel.dataset.open,
                     label: button.getAttribute('aria-label'), title: button.title,
                     icons: [...button.querySelectorAll('svg')].map(s => [s.dataset.filterIcon, s.hasAttribute('hidden')]) };
        }""",
        key,
    )


def run(base, context, page):
    url = base + FIXTURE
    page.goto(url)
    page.evaluate("localStorage.clear()")
    page.goto(url)
    page.wait_for_selector("#toggle-a svg", state="attached")

    # The shell draws the icons and names the button; the panel starts open on a wide screen.
    s = state(page)
    require(s["expanded"] == "true" and s["filters"] == "open" and s["open"] == "true", f"Starts open: {s}")
    require(s["label"] == "Filters" and s["title"] == "Filters", f"Default name: {s}")
    require(s["icons"] == [["open", False], ["closed", True]], f"Open shows the panel-right-open icon: {s['icons']}")
    require(page.is_visible("#panel-a") and page.inner_text("#toggle-a").strip() == "", "Panel visible, button has no text")

    # Looks like a white icon button; the icon is stroked, not a filled black square (a bare SVG fills black).
    require(page.locator("#toggle-a svg").first.evaluate("e => getComputedStyle(e).fill") == "none", "Icons are drawn as strokes, not filled")
    require(page.locator("#toggle-a").evaluate("e => getComputedStyle(e).backgroundColor") != "rgba(0, 0, 0, 0)", "The button has a solid background")
    box = page.evaluate("document.getElementById('toggle-a').getBoundingClientRect().right - document.getElementById('panel-a').getBoundingClientRect().right")
    require(abs(box) < 1, "Open, the button sits at the right edge of the column")

    # Click and keyboard (Enter and Space) hide and show it; focus stays; the panel leaves the tab order.
    page.click("#toggle-a")
    s = state(page)
    require(s["expanded"] == "false" and s["filters"] == "closed" and s["open"] == "false", f"Click hides: {s}")
    require(s["icons"] == [["open", True], ["closed", False]], f"Hidden shows the panel-left-open icon: {s['icons']}")
    require(not page.is_visible("#panel-a") and page.is_visible("#toggle-a") and page.evaluate("document.activeElement.id") == "toggle-a", "Panel hidden, button stays and keeps focus")
    require(page.evaluate("document.getElementById('toggle-a').getBoundingClientRect().left") < 100, "Hidden, the button is at the left edge")
    page.keyboard.press("Enter")
    require(state(page)["expanded"] == "true", "Enter shows the panel")
    page.keyboard.press("Space")
    require(state(page)["expanded"] == "false", "Space hides the panel")
    page.keyboard.press("Tab")
    require(page.evaluate("document.activeElement.id") != "search-a", "A hidden panel is not in the tab order")
    page.focus("#toggle-a")
    page.keyboard.press("Enter")

    # The name carries the active count, from data-filter-active, and clears again.
    page.evaluate("document.getElementById('toggle-a').dataset.filterActive = '3'")
    page.wait_for_function("document.getElementById('toggle-a').getAttribute('aria-label') === 'Filters, 3 active'", timeout=3000)
    require(page.get_attribute("#toggle-a", "title") == "Filters, 3 active", "The title matches the name")
    page.evaluate("document.getElementById('toggle-a').dataset.filterActive = '0'")
    page.wait_for_function("document.getElementById('toggle-a').getAttribute('aria-label') === 'Filters'", timeout=3000)

    # The choice is remembered per app and per toggle; another toggle is not affected.
    page.click("#toggle-a")
    require(page.evaluate("localStorage.getItem('marinos.filters.fixture.things')") == "closed", "The choice is saved under the app id and toggle name")
    page.reload()
    page.wait_for_selector("#toggle-a svg", state="attached")
    require(state(page)["filters"] == "closed" and state(page, "b")["filters"] == "open", "Reload keeps this choice and leaves the other toggle alone")

    # Own label and own icons (marked with data-filter-icon) work too.
    require(state(page, "b")["label"] == "Source filters", "data-filter-label sets the name")
    page.click("#toggle-b")
    require(state(page, "b")["icons"] == [["open", True], ["closed", False]], "Supplied icons are swapped too")

    # The event carries the new state, so an app can measure again.
    events = page.evaluate("window.__filterEvents")
    require(["toggle-b", False] in events, f"marin-filters-change fired for the toggle: {events}")

    # Narrow screens start closed, never save, and crossing the line returns to the default.
    page.evaluate("localStorage.clear()")
    page.set_viewport_size({"width": 360, "height": 700})
    page.goto(url)
    page.wait_for_selector("#toggle-a svg", state="attached")
    require(state(page)["filters"] == "closed" and not page.is_visible("#panel-a"), "Narrow screens start closed")
    require(page.evaluate("document.getElementById('toggle-a').getBoundingClientRect().left") < 40, "Narrow, the button is at the left")
    page.click("#toggle-a")
    require(page.is_visible("#panel-a") and page.evaluate("document.getElementById('toggle-a').getBoundingClientRect().bottom <= document.getElementById('panel-a').getBoundingClientRect().top"), "Narrow, the panel opens below the button")
    require(page.evaluate("localStorage.getItem('marinos.filters.fixture.things')") is None, "A narrow-screen choice is not saved")
    require(not page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth"), "No horizontal scroll at 360 px")
    page.set_viewport_size({"width": 1100, "height": 800})
    page.wait_for_timeout(200)
    require(state(page)["filters"] == "open", "Wide screens return to their default")


def run_storage_blocked(base, browser):
    """If storage throws (a private window, blocked site data), the panel still works."""
    context = browser.new_context(viewport={"width": 1100, "height": 800})
    context.add_init_script("Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });")
    page = context.new_page()
    page.goto(base + FIXTURE)
    page.wait_for_selector("#toggle-a svg", state="attached")
    require(state(page)["filters"] == "open", "Opens by default when storage is blocked")
    page.click("#toggle-a")
    require(state(page)["filters"] == "closed", "Still toggles when storage is blocked")
    context.close()


def main():
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(Handler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}/"
    problems = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            for scheme in ("light", "dark"):
                context = browser.new_context(color_scheme=scheme, viewport={"width": 1100, "height": 800})
                page = context.new_page()
                page.on("pageerror", lambda e: problems.append(str(e)))
                page.on("console", lambda m: problems.append(m.text) if m.type == "error" else None)
                run(base, context, page)
                context.close()
            run_storage_blocked(base, browser)
            browser.close()
    finally:
        server.shutdown()
    require(not problems, f"Console or page errors: {problems}")
    print("Filter panel browser test (light and dark): PASS")


if __name__ == "__main__":
    try:
        main()
    except AssertionError as error:
        print(f"ERROR: {error}", file=sys.stderr)
        sys.exit(1)
