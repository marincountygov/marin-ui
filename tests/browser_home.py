#!/usr/bin/env python3
"""Browser test of the shared home page layout in shared/app-brand.css (main.container.app-main, .home-search, .directory-grid,
.directory-card), served over HTTP from this repository and loading tests/fixtures/home.html.

Every app's home page uses these, so two apps' home pages put the search box and the cards in the same place. This checks the
numbers that decide that, in light and dark, at a wide and a narrow width.

Needs Playwright for Python and Chromium:  python3 -m pip install playwright && python3 -m playwright install chromium
For the axe-core scan point AXE_CORE at axe.min.js; without it the scan is skipped and says so.
Run:  python3 tests/browser_home.py
"""
from __future__ import annotations

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = "tests/fixtures/home.html"
AXE = os.environ.get("AXE_CORE")


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def box(page, selector):
    return page.eval_on_selector(selector, "e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }")


def style(page, selector, *props):
    return page.eval_on_selector(selector, "(e, props) => { const c = getComputedStyle(e); return props.map(p => c[p]); }", list(props))


def run(page, base, scheme):
    page.set_viewport_size({"width": 1280, "height": 900})
    page.goto(base + FIXTURE)
    # The page: the app layout, 32 px above, 16 px at the sides, 72 px below, no wider than 1280 px.
    require(style(page, "main", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "maxWidth") == ["32px", "16px", "72px", "16px", "1280px"], f"The home page uses the app layout: {style(page, 'main', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'maxWidth')}")
    main = box(page, "main")
    require(box(page, "#home-search")[0] == main[0] + 16, "The search box starts at the page's left padding")
    # The search field is three quarters of the width, and the cards start at the same left edge.
    require(abs(box(page, ".home-search .search-input-field")[2] - (main[2] - 32) * 0.75) < 1.5, "The search field is 75% wide on a wide screen")
    require(box(page, "#directory-grid .app-card")[0] == box(page, "#home-search")[0], "The cards line up with the search box")
    # The grid: four columns, 1 rem apart, with no margin of their own under a card, the same for both grid classes.
    columns = style(page, "#directory-grid", "gridTemplateColumns", "columnGap", "rowGap")
    require(len(columns[0].split()) == 4 and columns[1:] == ["16px", "16px"], f"Four columns, 1rem apart: {columns}")
    require(style(page, "#directory-grid", "gap", "display") == style(page, "#docs-grid", "gap", "display"), "directory-grid and docs-grid are the same grid")
    require(style(page, "#directory-grid .app-card", "marginBottom", "display", "flexDirection") == ["0px", "flex", "column"], "A card has no margin under it and stacks its parts")
    gap = box(page, "#directory-grid .app-card:nth-child(5)")[1] - (box(page, "#directory-grid .app-card:nth-child(1)")[1] + box(page, "#directory-grid .app-card:nth-child(1)")[3])
    require(abs(gap - 16) < 1.5, f"Rows of cards are 1rem apart (not 2rem): {gap}")
    # The status badge sits at the bottom of the first card.
    first = box(page, "#directory-grid .app-card"), box(page, "#directory-grid .directory-card__badges")
    require(first[1][1] + first[1][3] <= first[0][1] + first[0][3] - 15, "The badge sits at the bottom of the card")
    # The results: grouped, each group's name above a ruled list.
    require(style(page, ".home-search__group li", "borderTopStyle")[0] == "solid", "Each result is ruled off")
    # Narrow: the search field takes the full width and the cards are one column.
    page.set_viewport_size({"width": 390, "height": 900})
    main = box(page, "main")
    require(abs(box(page, ".home-search .search-input-field")[2] - (main[2] - 32)) < 1.5, "The search field is the full width on a narrow screen")
    require(len(style(page, "#directory-grid", "gridTemplateColumns")[0].split()) == 1, "One column of cards on a narrow screen")
    require(page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), "No horizontal scroll at 390 px")
    if not AXE:
        print(f"SKIP: axe-core scan ({scheme}; set AXE_CORE to axe.min.js).")
        return
    page.set_viewport_size({"width": 1280, "height": 900})
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
    print("Home page layout: all checks passed (light and dark).")


if __name__ == "__main__":
    main()
