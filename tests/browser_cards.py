#!/usr/bin/env python3
"""Browser test of the record card in shared/app-brand.css (.search-results-list, .mm-card and its parts), served over HTTP
from this repository and loading tests/fixtures/cards.html.

Needs Playwright for Python and Chromium:  python3 -m pip install playwright && python3 -m playwright install chromium
For the axe-core scan point AXE_CORE at axe.min.js; without it the scan is skipped and says so.
Run:  python3 tests/browser_cards.py
"""
from __future__ import annotations

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = "tests/fixtures/cards.html"
AXE = os.environ.get("AXE_CORE")


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def style(page, selector, *props):
    return page.eval_on_selector(selector, "(e, props) => { const c = getComputedStyle(e); return props.map(p => c[p]); }", list(props))


def run(page, base, scheme):
    page.set_viewport_size({"width": 1200, "height": 800})
    page.goto(base + FIXTURE)
    # The three sizes, the same in every app.
    require(style(page, "#with-image .mm-card__title", "fontSize", "fontWeight") == ["20px", "700"], "The name is 1.25rem and bold")
    require(style(page, "#with-image .mm-card__text", "fontSize", "fontWeight") == ["16px", "400"], "The text is 1rem and regular")
    require(style(page, "#with-image .mm-card__byline", "fontSize", "fontWeight") == ["14px", "400"], "The byline is 0.875rem and regular")
    require(style(page, "#with-image .mm-card__meta", "fontSize", "fontWeight") == ["14px", "400"], "The meta line is 0.875rem and regular")
    require(style(page, "#with-image .mm-card__byline", "color") == style(page, "#with-image .mm-card__meta", "color"), "The small lines share one muted color")
    # The list: a column with a 1rem gap, no bullets, cards with no bottom margin of their own.
    require(style(page, "#plain", "display", "flexDirection", "rowGap", "listStyleType") == ["flex", "column", "16px", "none"], "The list is a column with a 1rem gap and no bullets")
    require(style(page, "#plain > li", "marginBottom", "listStyleType") == ["0px", "none"], "A card in the list has no margin of its own")
    # A row: checkbox, image, body, with the checkbox centered against the row and the body filling the rest.
    boxes = page.eval_on_selector_all("#with-image > *", "els => els.map(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })")
    require(boxes[0][0] < boxes[1][0] < boxes[2][0], "The checkbox, the image and the body sit in a row")
    require(abs(boxes[1][2] - 144) < 1 and abs(boxes[1][3] - 144) < 1, "The image is 9rem square")
    # The card surface has defaults, and the three custom properties are the one way to change it.
    plain = style(page, "#plain-card", "backgroundColor", "borderTopColor", "boxShadow")
    hooked = style(page, "#hooked-card", "backgroundColor", "borderTopColor", "boxShadow")
    require(plain[0] != "rgba(0, 0, 0, 0)" and plain[1] != "rgba(0, 0, 0, 0)" and plain[2] != "none", f"A card has its surface by default: {plain}")
    require(hooked == ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)", "none"], f"A card can change its colors through the three custom properties: {hooked}")
    require(style(page, "#hooked-card", "borderTopWidth", "paddingTop") == ["1px", "16px"], "The hooked card keeps its border width and padding")
    # Two columns.
    require(style(page, "#two-columns", "display") == ["grid"], "The two-column list is a grid")
    cols = page.eval_on_selector_all("#two-columns > li", "els => els.map(e => e.getBoundingClientRect().x)")
    require(cols[0] < cols[1], "The two-column list puts its cards side by side")
    # A narrow screen: stacked, the checkbox at the top, the image across, nothing wider than the screen.
    page.set_viewport_size({"width": 360, "height": 800})
    require(style(page, "#with-image", "flexDirection") == ["column"], "A card stacks on a narrow screen")
    stacked = page.eval_on_selector_all("#with-image > *", "els => els.map(e => { const r = e.getBoundingClientRect(); return [r.x, r.y]; })")
    require(stacked[0][1] < stacked[1][1] < stacked[2][1] and abs(stacked[0][0] - stacked[1][0]) < 1, "The checkbox, the image and the body stack, lined up on the left")
    image = page.eval_on_selector("#with-image .mm-card__image", "e => e.getBoundingClientRect().toJSON()")
    card = page.eval_on_selector("#with-image", "e => e.getBoundingClientRect().toJSON()")
    require(image["width"] > card["width"] * 0.85 and image["height"] == 160, f"The image takes the card's width at 10rem tall: {image}")
    require(page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), "No horizontal scroll at 360 px")
    cols = page.eval_on_selector_all("#two-columns > li", "els => els.map(e => e.getBoundingClientRect().y)")
    require(cols[0] < cols[1], "The two-column list is one column on a narrow screen")
    if not AXE:
        print(f"SKIP: axe-core scan ({scheme}; set AXE_CORE to axe.min.js).")
        return
    page.set_viewport_size({"width": 1200, "height": 800})
    page.add_script_tag(path=AXE)
    found = page.evaluate("axe.run(document.querySelector('main'), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] })")["violations"]
    require(not found, f"axe-core ({scheme}): {[(v['id'], [n['target'] for n in v['nodes']]) for v in found]}")


def main():
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(Handler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}/"
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        for scheme in ("light", "dark"):
            context = browser.new_context(color_scheme=scheme)
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            run(page, base, scheme)
            require(not errors, f"Page errors ({scheme}): {errors}")
            context.close()
        browser.close()
    server.shutdown()
    print("Record cards: all checks passed (light and dark).")


if __name__ == "__main__":
    main()
