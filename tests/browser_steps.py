#!/usr/bin/env python3
"""Browser test of the Steps layout (shared/app-shell.js `nav[data-steps]`, shared/app-brand.css `.steps`), served over
HTTP from this repository and loading tests/fixtures/steps.html.

Needs Playwright for Python and Chromium:  python3 -m pip install playwright && python3 -m playwright install chromium
Run:  python3 tests/browser_steps.py
"""
from __future__ import annotations

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

    # Skip ahead: the last step is one click away, and the first two read as completed.
    page.click("nav.steps a[href='#send']")
    require(states(page) == ["complete", "complete", "current"], f"After skipping ahead: {states(page)}")
    require(page.locator("[data-next-step]:visible").count() == 0, "The last step has no Next")

    # Previous goes back and the Back button follows the address.
    page.click("[data-prev-step=answer]")
    require(states(page) == ["complete", "current", "upcoming"], f"After Previous: {states(page)}")
    page.go_back()
    require(states(page) == ["complete", "complete", "current"], f"After Back: {states(page)}")

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
    page.set_viewport_size({"width": 1200, "height": 800})

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
