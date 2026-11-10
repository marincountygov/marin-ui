#!/usr/bin/env python3
"""Browser test of the record list (shared/app-shell.js), served over HTTP from this repository.

Needs Playwright for Python and Chromium:  python3 -m pip install playwright && python3 -m playwright install chromium
Run:  python3 tests/browser_record_list.py
"""
from __future__ import annotations

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = "tests/fixtures/record-list.html"


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def status(page, key):
    return page.inner_text(f"#{key if key.startswith('items') else 'list-' + key} [data-record-list-status]")


def titles(page, key):
    return page.eval_on_selector_all(f"#{key if key.startswith('items') else 'list-' + key} .app-card h3", "els => els.map(e => e.textContent)")


def main():
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(Handler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}/{FIXTURE}"
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        requests = []
        page.on("request", lambda r: requests.append(r.url))
        page.goto(base)

        # A list in a hidden tab fetches nothing until its tab is shown.
        page.wait_for_selector("#overview:not([hidden])")
        require(not any(u.endswith("record-list.json") for u in requests), "fetched before the tab was shown")

        page.goto(base + "#reach")
        page.wait_for_selector("#list-match .app-card")
        require(titles(page, "match") == ["Budget hearing", "Design review"], f"match, sort newest first: {titles(page, 'match')}")
        require(status(page, "match") == "", f"a plain count is not shown: {status(page, 'match')}")
        card = page.inner_text("#list-match .app-card")
        require("May 12, 2026 — San Rafael" in card, f"meta line with a long date and a dot path: {card!r}")
        require(page.inner_text("#list-match .app-badge") == "Planned", "badge")

        # A heading links only when the field holds an http(s) address.
        hrefs = page.eval_on_selector_all("#list-match .app-card h3 a", "els => els.map(e => e.getAttribute('href'))")
        require(hrefs == ["https://example.com/a"], f"link only for a safe address: {hrefs}")

        # Data is text, never markup.
        page.goto(base + "#markup")
        page.wait_for_selector("#list-markup .app-card")
        require(titles(page, "markup") == ["<b>Not markup</b>"], "title kept as text")
        require(page.locator("#list-markup b").count() == 0, "markup was injected")

        page.goto(base + "#none")
        page.wait_for_function("document.querySelector('#list-none [data-record-list-status]').textContent.startsWith('No')")
        require(status(page, "none") == "No engagements found.", status(page, "none"))

        page.goto(base + "#broken")
        page.wait_for_function("document.querySelector('#list-broken [data-record-list-status]').textContent.includes('could not')")
        require(status(page, "broken") == "Reach could not be loaded right now.", status(page, "broken"))

        # Key numbers: date tokens become real dates, numbers get separators, small counts are withheld.
        page.goto(base + "#numbers")
        page.wait_for_selector("#numbers-ok .mm-stats-kpi")
        cards = page.eval_on_selector_all("#numbers-ok .mm-stats-kpi", "els => els.map(e => e.innerText.replace(/\\s+/g, ' ').trim())")
        require(cards == ["Visits 12,345", "Links 3"], f"key numbers: {cards}")
        asked = [u for u in requests if "key-numbers.json" in u][0]
        require("{" not in asked and "from=" in asked and "to=" in asked, f"date tokens replaced: {asked}")
        require(page.inner_text("#numbers-ok [data-key-numbers-status]") == "", "no status once loaded")
        page.goto(base + "#numbers-small")
        page.wait_for_function("document.querySelector('#numbers-hidden [data-key-numbers-status]').textContent.length > 0")
        require(page.inner_text("#numbers-hidden [data-key-numbers-status]") == "Too few visits to show.", "withheld message")
        require(page.locator("#numbers-hidden .mm-stats-kpi").count() == 0, "no numbers when withheld")

        # How far back the records go, from the oldest, in the status line.
        page.goto(base + "#timeframe")
        page.wait_for_selector("#list-time .app-card")
        require(page.inner_text("#list-time [data-record-list-status]") == "Showing 2 of 3 records (since Mar 2, 2026).", f"timeframe: {page.inner_text('#list-time [data-record-list-status]')}")

        # Grouped: one card for each value of a field, with its count and the dates it spans, linking to a filtered page.
        page.goto(base + "#groups")
        page.wait_for_selector("#list-groups .app-card")
        groups = page.eval_on_selector_all("#list-groups .app-card", "els => els.map(e => [e.querySelector('h3').innerText, e.querySelector('h3 a') && e.querySelector('h3 a').href, e.querySelector('.mm-card__byline').innerText])")
        require([g[0] for g in groups] == ["Community Development Agency", "Office of the County Executive", "District 3"], f"groups, newest first: {groups}")
        require(groups[0][1] == "https://example.com/reach/?agency=Community%20Development%20Agency", f"group link: {groups[0][1]}")
        require(groups[0][2] == "2 engagements — Apr 1 – May 12, 2026", f"count and span: {groups[0][2]}")
        require(groups[2][2] == "1 engagement — Mar 2, 2026", f"one record, one date: {groups[2][2]}")
        require(page.inner_text("#list-groups [data-record-list-status]") == "", "a group list shows no plain count")

        # Numbers counted from the records, and charts drawn from them.
        page.goto(base + "#counted")
        page.wait_for_function("window.__charts && window.__charts.length >= 6")
        counted = page.eval_on_selector_all("#counted-numbers .mm-stats-kpi", "els => els.map(e => e.innerText.replace(/\\s+/g, ' ').trim())")
        require(counted == ["Engagements 2", "Planned 1", "Places 2"], f"counted numbers: {counted}")
        charts = {c["id"]: c["config"] for c in page.evaluate("window.__charts")}
        line = charts["chart-line"]
        require(line["type"] == "line" and line["data"]["labels"] == ["Apr 2026", "May 2026"] and line["data"]["datasets"][0]["data"] == [1, 1], f"line by month: {line['data']}")
        bar = charts["chart-bar"]
        require(bar["type"] == "bar" and bar["options"]["indexAxis"] == "y" and bar["data"]["labels"][0] == "Community Development Agency" and bar["data"]["datasets"][0]["data"][0] == 2 and len(bar["data"]["labels"]) == 2, f"bar top 2: {bar['data']}")
        daily = charts["chart-daily"]
        require(daily["data"]["labels"] == ["Oct 1", "Oct 2", "Oct 3"] and daily["data"]["datasets"][0]["data"] == [2, 0, 5], f"summed by day, quiet days kept: {daily['data']}")
        require(page.get_attribute("#chart-line canvas", "aria-label").startswith("Events over time. 2 total"), "chart has a text summary")
        require("chart-small" not in charts, "no chart when the numbers are withheld")
        # Charts of amounts the page holds: columns, stacked columns and bars, with dollar labels and a summary.
        cols = charts["chart-columns"]
        require(cols["type"] == "bar" and cols["options"]["indexAxis"] == "x" and len(cols["data"]["datasets"]) == 2 and cols["data"]["datasets"][1]["data"] == [17890809, 4911771], f"columns: {cols['data']}")
        require(cols["options"]["plugins"]["legend"]["display"] is True and not cols["options"]["scales"]["y"]["stacked"] and cols["options"]["scales"]["y"]["beginAtZero"] is True, "legend for two series, zero baseline, not stacked")
        stacked = charts["chart-stacked"]
        require(stacked["options"]["scales"]["x"]["stacked"] and stacked["options"]["scales"]["y"]["stacked"], "stacked")
        pie = charts["chart-pie"]
        require(pie["type"] == "pie" and pie["data"]["labels"] == ["Planning", "Building", "Housing"] and pie["data"]["datasets"][0]["data"] == [6000000, 3000000, 1000000], f"pie slices, largest first, no empty slice: {pie['data']}")
        require(page.get_attribute("#chart-pie canvas", "aria-label") == "Shares. Planning is the largest share, 60% of $10,000,000.", "pie text summary")
        require(page.evaluate("(() => { const c = window.__charts.find((x) => x.id === 'chart-pie'); return c.config.options.plugins.tooltip.callbacks.label({ label: 'Housing', parsed: 1000000 }) + ' | ' + c.config.options.plugins.legend.labels.generateLabels({ data: c.config.data }).map((l) => l.text).join(' | '); })()") == "Housing: $1,000,000 (10%) | Planning, 60% | Building, 30% | Housing, 10%", "pie tooltip and legend shares")
        bars = charts["chart-bars"]
        require(bars["options"]["indexAxis"] == "y" and bars["options"]["plugins"]["legend"]["display"] is False, "horizontal, no legend for one series")
        require(page.get_attribute("#chart-columns canvas", "aria-label") == "By type. Salaries and Benefits is the largest at $17,890,809.", "summary from the page")
        require(page.get_attribute("#chart-bars canvas", "aria-label") == "By division. Largest: Planning at $9,000,000, of 2 shown.", "generated summary in dollars")
        require(page.evaluate("(() => { const c = window.__charts.find((x) => x.id === 'chart-columns'); return c.config.options.scales.y.ticks.callback(17890809) + ' ' + c.config.options.scales.y.ticks.callback(250000) + ' ' + c.config.options.plugins.tooltip.callbacks.label({ dataset: { label: 'A' }, parsed: { y: -1500 } }); })()") == "$17.9M $250K A: −$1,500", "dollar axis and tooltip")

        # A list of counted items: numeric sort, words after a value, and the withheld message.
        page.goto(base + "#items")
        page.wait_for_selector("#items-ok .app-card")
        require(titles(page, "items-ok") == ["b.example/", "a.example/"], f"numeric sort: {titles(page, 'items-ok')}")
        require("10 visits" in page.inner_text("#items-ok .app-card"), "meta words after the value")
        page.wait_for_function("document.querySelector('#items-small [data-record-list-status]').textContent.length > 0")
        require(status(page, "items-small") == "Too few visits to show." and page.locator("#items-small .app-card").count() == 0, "withheld list")

        # Sub-tabs: the first panel shows, a hash on a panel switches to it, and what is in a hidden panel waits.
        requests.clear()
        page.goto(base + "#subs")
        page.wait_for_selector("#subs-home:not([hidden])")
        require(page.locator("#subs-stats").is_hidden(), "stats panel starts hidden")
        require(page.get_attribute("[data-subtabs-nav] a >> nth=0", "aria-current") == "page", "Home marked current")
        require(not any(u.endswith("record-list.json") for u in requests), "fetched from a hidden sub-tab")
        page.goto(base + "#subs-stats")
        page.wait_for_selector("#subs-stats:not([hidden])")
        require(page.locator("#subs-home").is_hidden(), "home panel hidden")
        require(page.get_attribute("[data-subtabs-nav] a >> nth=1", "aria-current") == "page", "Stats marked current")
        page.wait_for_selector("#sub-numbers .mm-stats-kpi")
        browser.close()
    print("record list: ok")


if __name__ == "__main__":
    main()
