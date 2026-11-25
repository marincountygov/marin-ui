#!/usr/bin/env python3
"""Browser test of the Steps layout (shared/app-shell.js `nav[data-steps]`, shared/app-brand.css `.steps`), served over
HTTP from this repository and loading tests/fixtures/steps.html.

Needs Playwright for Python and Chromium:  python3 -m pip install playwright && python3 -m playwright install chromium
Run:  python3 tests/browser_steps.py
"""
from __future__ import annotations

import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = "tests/fixtures/steps.html"


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def states(page):
    return page.eval_on_selector_all("nav.steps a", "els => els.map(e => e.dataset.stepState)")


def words(page):
    return page.eval_on_selector_all("nav.steps .step-state", "els => els.map(e => e.textContent)")


def visible_steps(page):
    return page.eval_on_selector_all(".step", "els => els.filter(e => !e.hidden).map(e => e.id)")


AXE = os.environ.get("AXE_CORE")
SPACING = "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }"


def fits(page, what):
    require(page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), f"No horizontal scroll {what}")
    require(page.evaluate("[...document.querySelectorAll('.step:not([hidden]) .steps-pager button')].every(b => b.scrollWidth <= b.clientWidth + 1 && b.getBoundingClientRect().right <= window.innerWidth)"), f"The step buttons are not clipped {what}")


def reflow_checks(page, reload):
    """Text spacing (WCAG 1.4.12), 200% and 400% zoom (1.4.4, 1.4.10) and axe-core, on the second step."""
    original = page.viewport_size
    reload("#answer")
    page.add_style_tag(content=SPACING)
    fits(page, "with the text spacing overrides")
    require(page.evaluate("(() => { const side = document.querySelector('.search-sidebar').getBoundingClientRect(); return [...document.querySelectorAll('nav.steps a')].every(a => a.getBoundingClientRect().right <= side.right + 1 && a.scrollWidth <= a.clientWidth + 1); })()"), "Step names are not clipped with the text spacing overrides")
    for width, height, name in ((640, 400, "200% zoom"), (320, 256, "400% zoom")):
        page.set_viewport_size({"width": width, "height": height})
        reload("#answer")
        fits(page, f"at {name}")
        page.locator(".step:not([hidden]) [data-next-step]").scroll_into_view_if_needed()
        require(page.locator(".step:not([hidden]) [data-next-step]").is_visible(), f"Next can be reached at {name}")
    page.set_viewport_size(original)
    reload("#answer")
    if not AXE:
        print("SKIP: axe-core scan (set AXE_CORE to axe.min.js).")
        return
    page.add_script_tag(path=AXE)
    result = page.evaluate("axe.run(document.querySelector('main'), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] })")
    found = [(v["id"], [n["target"] for n in v["nodes"]]) for v in result["violations"]]
    require(not found, f"axe-core: {found}")


def run(page, base):
    page.goto(base + FIXTURE)
    page.wait_for_selector("nav.steps[data-steps-ready]", state="attached")

    # First step is current; later steps are up next; state is a word, not only a color.
    require(states(page) == ["current", "upcoming", "upcoming"], f"Initial states: {states(page)}")
    require(words(page) == ["Current", "Up next", "Up next"], f"State words: {words(page)}")
    require(page.get_attribute("nav.steps a >> nth=0", "aria-current") == "step", "The current link is aria-current=step")
    require(page.locator("nav.steps a[aria-current]").count() == 1, "Only one link is current")
    require(visible_steps(page) == ["gather"], "One step shows at a time")
    require(page.inner_text(".steps-progress p") == "Step 1 of 3: Gather", "The progress line names the step")
    # One announcement per step change: the status role is gone and the heading is described by the position.
    require(page.locator(".steps-progress [role='status'], .steps-progress [aria-live]").count() == 0, "The progress line is not a live region")
    require(page.evaluate("document.querySelectorAll('.step > h2[aria-describedby]').length") == 1, "Only the current step's heading is described")
    require(page.evaluate("(() => { const h = document.querySelector('.step:not([hidden]) > h2'); return document.getElementById(h.getAttribute('aria-describedby')).textContent; })()") == "Step 1 of 3", "The heading is described by its position")
    require(page.title() == "Steps fixture: Gather (step 1 of 3)", f"The page title names the step: {page.title()}")
    require(page.eval_on_selector(".steps-progress progress", "e => e.value + '/' + e.max") == "1/3", "The bar matches")
    require(page.evaluate("document.querySelector('.steps-progress progress').getAttribute('aria-hidden')") == "true", "The bar is decoration")
    require(page.is_visible(".filter-toggle"), "The Steps toggle shows once JavaScript runs")
    require(page.get_attribute(".filter-toggle", "aria-label") == "Steps", "The toggle is named Steps")

    # Pico's nav rules must not push the list outside the column, where the sidebar would clip the left bar.
    require(page.evaluate("(() => { const side = document.querySelector('.search-sidebar').getBoundingClientRect(); return [...document.querySelectorAll('nav.steps a')].every(a => a.getBoundingClientRect().left >= side.left && a.getBoundingClientRect().right <= side.right); })()"), "Step links stay inside the column")
    require(page.evaluate("getComputedStyle(document.querySelector('nav.steps a[aria-current]')).borderLeftWidth") == "4px", "The current step has its bar")

    # No shapes, images or icons inside the list.
    require(page.evaluate("document.querySelectorAll('nav.steps svg, nav.steps img, nav.steps canvas').length") == 0, "No icons or images in the list")
    require(page.evaluate("[...document.querySelectorAll('nav.steps a')].every(a => getComputedStyle(a).borderTopLeftRadius === '0px')"), "No rounded shapes on the left side of a step")

    # On this page lists the current step's parts, with the step as hidden context.
    toc = page.eval_on_selector_all(".steps-toc a", "els => els.map(e => e.textContent)")
    require(toc == ["What you do (1. Gather)", "What you get back (1. Gather)"], f"On this page: {toc}")

    # Next goes to step 2, marks step 1 completed, moves focus to the heading, updates the address.
    page.click("[data-next-step=answer]")
    require(states(page) == ["complete", "current", "upcoming"], f"After Next: {states(page)}")
    require(words(page) == ["Completed", "Current", "Up next"], f"After Next words: {words(page)}")
    require(visible_steps(page) == ["answer"], "Step 2 shows")
    require(page.evaluate("document.activeElement.id") == "answer-heading", "Focus moves to the step heading")
    require(page.url.endswith("#answer"), "The address names the step")
    require(page.inner_text(".steps-progress p") == "Step 2 of 3: Answer", "The progress line updates")
    require(page.title() == "Steps fixture: Answer (step 2 of 3)", f"The page title follows the step: {page.title()}")
    require(page.evaluate("document.getElementById(document.getElementById('answer-heading').getAttribute('aria-describedby')).textContent") == "Step 2 of 3", "The new heading is described by its position")
    page.evaluate("document.getElementById('start').hidden = true")
    page.wait_for_function("document.title === 'Steps fixture | County of Marin'", timeout=3000)
    page.evaluate("document.getElementById('start').hidden = false")
    page.wait_for_function("document.title === 'Steps fixture: Answer (step 2 of 3)'", timeout=3000)

    # Previous and Next are made for every step, in a named group, with names that match what is seen.
    group = page.locator(".step:not([hidden]) .steps-pager")
    require(group.evaluate("e => e.tagName") == "NAV" and group.get_attribute("aria-label") == "Previous and next step", "The pager is a named nav")
    require(group.locator("[data-prev-step]").get_attribute("aria-label") == "Previous: gather", "Previous is named")
    require(group.locator("[data-next-step]").inner_text().strip() == "Next: send", "Next keeps its words")
    require(page.locator("#gather .steps-pager [data-prev-step]").count() == 0 and page.locator("#send .steps-pager [data-next-step]").count() == 0, "No Previous on the first step and no Next on the last")
    require(group.locator("[disabled]").count() == 0, "Nothing is disabled")
    sizes = [b.bounding_box() for b in group.locator("button").all()]
    require(all(b["width"] < 400 for b in sizes), f"The buttons do not stretch: {sizes}")

    # Skip ahead: the last step is one click away, and the first two read as completed.
    page.click("nav.steps a[href='#send']")
    require(states(page) == ["complete", "complete", "current"], f"After skipping ahead: {states(page)}")
    require(page.locator("[data-next-step]:visible").count() == 0, "The last step has no Next")

    # Previous goes back and the Back button follows the address.
    page.click("[data-prev-step=answer]")
    require(states(page) == ["complete", "current", "upcoming"], f"After Previous: {states(page)}")
    page.go_back()
    require(states(page) == ["complete", "complete", "current"], f"After Back: {states(page)}")
    page.wait_for_function("document.activeElement.id === 'send-heading'", timeout=3000)

    # A hash can name a box inside a step.
    page.goto(base + FIXTURE + "#answer-your-notes")
    page.wait_for_selector("nav.steps[data-steps-ready]", state="attached")
    require(visible_steps(page) == ["answer"], "A box hash opens its step")

    # Narrow screen: the step line sits first beside the toggle, the column starts closed, and nothing scrolls sideways.
    page.set_viewport_size({"width": 320, "height": 700})
    page.goto(base + FIXTURE)
    page.wait_for_selector("nav.steps[data-steps-ready]", state="attached")
    require(page.is_visible(".steps-progress"), "The progress line shows on a narrow screen")
    require(page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), "No horizontal scroll at 320 px")
    page.click(".filter-toggle")
    require(page.is_visible("nav.steps"), "The toggle opens the steps")
    page.click("nav.steps a[href='#send']")
    require(page.get_attribute(".filter-toggle", "aria-expanded") == "false" and not page.is_visible("nav.steps"), "Choosing a step closes the list on a narrow screen")
    require(visible_steps(page) == ["send"] and page.evaluate("document.activeElement.id") == "send-heading", "The chosen step shows with focus on its heading")
    page.set_viewport_size({"width": 1200, "height": 800})

    reflow_checks(page, lambda hash_="": (page.goto(base + FIXTURE + hash_), page.wait_for_selector("nav.steps[data-steps-ready]", state="attached")))

    # Print shows every step.
    page.goto(base + FIXTURE)
    page.wait_for_selector("nav.steps[data-steps-ready]", state="attached")
    page.emulate_media(media="print")
    require(page.evaluate("[...document.querySelectorAll('.step')].every(e => getComputedStyle(e).display !== 'none')"), "Print shows every step")
    require(not page.is_visible("nav.steps"), "Print hides the step list")
    page.emulate_media(media="screen")


def run_without_script(browser, base):
    context = browser.new_context(java_script_enabled=False)
    page = context.new_page()
    page.goto(base + FIXTURE)
    require(page.locator(".step:visible").count() == 3, "Without JavaScript every step shows")
    require(not page.is_visible(".filter-toggle"), "Without JavaScript the toggle stays hidden")
    require(page.locator("nav.steps a").count() == 3, "The step links are plain links")
    context.close()


def main():
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(Handler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}/"
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        for scheme in ("light", "dark"):
            context = browser.new_context(color_scheme=scheme, viewport={"width": 1200, "height": 800})
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.on("console", lambda message: message.type == "error" and errors.append(message.text))
            run(page, base)
            require(not errors, f"Console errors ({scheme}): {errors}")
            context.close()
        run_without_script(browser, base)
        browser.close()
    server.shutdown()
    print("Steps layout: all checks passed (light and dark).")


if __name__ == "__main__":
    main()
