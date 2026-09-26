# Components

## Required shared CSS classes

Build agents should use these shared classes before inventing new visual patterns:

```text
skip-link
app-header
app-header__inner
app-identity
app-logo
app-icon
app-card__icon
app-title
app-subtitle
app-title-copy
app-menu-toggle
app-nav
app-main
app-footer
app-feedback
app-page-heading
app-card
app-toolbar
app-actions
app-alert
app-alert--info
app-alert--success
app-alert--warning
app-alert--danger
app-badge
app-status
app-empty
app-table-wrap
app-form-grid
app-field
app-required
app-error
app-help-text
heading-anchor
docs-toc
doc-updated
sort-button
copy-button
copy-icon
copy-check-icon
site-header
header-inner
footer-inner
docs-brand-icon
breadcrumb-nav
page
doc-title
doc-description
doc-actions
doc-action
doc-action-status
details
topic-filters
topic-links
site-footer
toc
content
section
hero
lede
meta
```

The last block (`site-header` through `meta`) is the alternate Docs shell header/footer pair — see "Docs shell" in `app-shell.md` for when to use it instead of the `app-header`-based Docs shell.

Directory cards place a meaningful icon before their content and make the card's `h3` text the destination link. Do not add a second "Open …" link.

Documentation pages add hover/focus anchor links to content headings and use `aria-current="location"` to highlight the section currently in view in the "On this page" navigation.

## App icon

Every app has exactly one icon, defined once and reused in three places — not a generic default in some of them and something distinctive in others:

1. The header `.app-icon` (next to the app title).
2. The favicon, inlined as a `data:image/svg+xml` URI on `<link rel="icon">` — same shape as `.app-icon`'s `<svg>`, wrapped in the standard rounded black square with the gold stroke used across every app today.
3. `marin-os/catalog.json`'s `icon` field for that app (`{ "viewBox": ..., "markup": ... }`), which feeds the cross-app nav dropdown and the marin-os directory page.

Icons are drawn from the vendored Lucide set at `vendor/icons/lucide/` (see `SYNCING.md` for what to copy) — pick the closest stock Lucide icon for what the app does, rather than commissioning a bespoke shape. Use Lucide's own SVG conventions: `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`, one `<svg>` per icon, `<path>`/`<circle>`/`<rect>` children copied verbatim from the vendored file. Never load Lucide from a CDN (`unpkg`, `jsdelivr`, `cdnjs`) — see `marin-digital-standards/product-design/runtime-dependencies.md`, which forbids that for any icon library the same way it forbids it for fonts.

If `vendor/icons/lucide/` doesn't yet have the icon an app needs, add that one SVG file (sourced from lucide.dev, ISC-licensed) to `marin-ui`'s vendor folder as part of that app's update — don't mirror the whole Lucide library speculatively, and don't inline a one-off icon that skips the shared vendor folder.

## The `.menu` disclosure component

`.menu` / `.menu-toggle` / `.menu-panel` is the shared pattern for any click-to-open dropdown: the MarinOS banner (see `app-shell.md`), and grouped document actions (Share, Download) described in `accessibility-implementation.md`. It is a disclosure pattern (a toggle button plus a hidden panel), not a full ARIA `menu`/`menuitem` widget — that keeps keyboard support simple (Tab reaches the toggle and, once open, the panel's real links/buttons in order; Escape closes and returns focus to the toggle) and avoids the roving-tabindex and arrow-key requirements that `role="menu"` would demand.

```html
<div class="menu">
  <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="example-panel">
    Label
    <svg class="menu-toggle__caret" aria-hidden="true" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  <div id="example-panel" class="menu-panel" hidden>
    <a href="...">Option one</a>
    <button type="button">Option two</button>
  </div>
</div>
```

`app-shell.js` wires up every `.menu` on the page generically: click toggles the panel (and closes any other open menu), clicking a link/button inside the panel closes it, clicking outside closes it, and Escape closes it and returns focus to the toggle. No per-page JavaScript is needed beyond that shared behavior. Give the toggle a second class (`marinos-menu__toggle`, or `doc-action` for a pill-styled action button) to skin it for its context — `.menu-toggle` itself only supplies layout, not visual style.

## Sortable table columns

Any `<table>` with a sort button in its header sorts generically — no per-page JavaScript needed. Give a `<th>` a `<button class="sort-button" data-sort-key="foo">`, and give each `<tbody>` row a matching `data-sort-foo="value"` attribute for every sortable column:

```html
<table>
  <thead>
    <tr><th scope="col" aria-sort="none"><button type="button" class="sort-button" data-sort-key="name">Name</button></th></tr>
  </thead>
  <tbody>
    <tr data-sort-name="Acme"><td>Acme</td></tr>
  </tbody>
</table>
```

`app-shell.js` reads and re-sorts `data-sort-*` attributes directly — it has no knowledge of what the keys mean, so the same behavior works for any table. Clicking toggles ascending/descending and updates the `<th>`'s `aria-sort`; give every sortable `<th>` an initial `aria-sort="none"`.

## Copy-to-clipboard buttons

Any `button[data-copy-value]` copies that value on click and shows brief feedback — no per-page JavaScript needed:

```html
<button type="button" class="copy-button" data-copy-value="411030" aria-label="Copy 411030">
  <svg class="copy-icon" aria-hidden="true" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
  <svg class="copy-check-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
</button>
```

`app-shell.js` swaps `copy-icon` for `copy-check-icon` for 1.5s after a successful copy via the `is-copied` class. It announces the copy through `#app-status-message` if the page has one (the standard app-shell live region), or a page-supplied `[data-copy-status]` live region otherwise — a page using this outside the standard app shell needs one of the two present for screen-reader feedback. Set `data-copy-announce` on the button for custom announcement text; otherwise it announces `Copied <value>`.

## Share button

Any `button[data-action="share"]` copies `window.location.href` on click and reports through the nearest `.doc-actions .doc-action-status` — no per-page JavaScript needed:

```html
<div class="doc-actions">
  <div class="menu">
    <button type="button" class="doc-action menu-toggle" aria-expanded="false" aria-controls="share-menu-panel">Share<svg class="menu-toggle__caret" aria-hidden="true" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button>
    <div id="share-menu-panel" class="menu-panel" hidden><button type="button" data-action="share">Copy link</button></div>
  </div>
  <span class="doc-action-status" role="status" aria-live="polite"></span>
</div>
```

## Inspector panel

An off-canvas panel for editing one item's detail without losing the list behind it — a list stays on screen, a click opens the item's fields in a slide-over panel instead of navigating to a separate page or replacing the list in place. `app-brand.css` provides the shared classes; unlike the patterns above, the open/close/edit behavior stays app-owned because it's coupled to app-specific data (which item, what fields), so there's no generic JavaScript for this one. Promoted from `marin-decision-maker`'s node editor — see that app's `index.html` for a complete reference implementation.

```html
<div id="inspector-overlay" class="app-inspector-overlay" hidden>
  <button id="inspector-backdrop" class="app-inspector-backdrop" type="button" aria-label="Close inspector"></button>
  <section class="app-inspector-panel" role="dialog" aria-modal="true" aria-labelledby="inspector-title">
    <div class="app-toolbar app-inspector-header">
      <div><h2 id="inspector-title">Edit selected item</h2></div>
      <button id="close-inspector" type="button" class="secondary">Close inspector</button>
    </div>
    <article id="item-editor"><!-- render the selected item's fields here --></article>
  </section>
</div>
```

`.app-inspector-panel` slides in from the right on wide viewports and collapses to a bottom sheet under 850px — CSS only, no JS needed for the responsive behavior. The JS the consuming app must supply:

- On open: set `hidden = false`, render the item's fields into the editor, move focus into the panel (the close button is a safe default), and record whatever element triggered the open so focus can return to it on close.
- On close (backdrop click, the close button, or <kbd>Escape</kbd>): set `hidden = true` and return focus to the trigger element recorded on open.
- Trap <kbd>Tab</kbd> focus inside the panel while it's open — cycle from the last focusable element back to the first (and Shift+Tab from the first back to the last) rather than letting focus escape to the page underneath.
- Announce open/close through the page's status region (`#app-status-message` or equivalent) for screen-reader users who won't see the panel animate in.

## Tab sections

Elements sharing a `data-tab-section="name"` value show together and hide together, one group at a time, matched against the URL hash — no per-page JavaScript needed:

```html
<nav class="app-nav" id="app-nav" aria-label="Application navigation">
  <a href="#estimate" aria-current="page">Estimate</a>
  <a href="#about">About</a>
</nav>
<section id="estimate" data-tab-section="estimate">…default view…</section>
<section id="about" class="app-card" data-tab-section="about" hidden>…</section>
```

`app-shell.js` shows whichever group's name matches the current hash, or the first name it finds in the page if the hash is empty or doesn't match anything — so there's no need for an explicit "Home"/default nav tab (see "Standard app nav: About and Updates" below). It also keeps `#app-nav`'s `aria-current="page"` in sync with whichever tab is active, if a `#app-nav` is present. A group can span more than one element (give each the same `data-tab-section` value) when the default view is built from several sibling sections, like a directory page's separate "Apps" and "Docs" grids.

Give every non-default section `hidden` in the static markup — without JavaScript, only the default group is reachable, matching how these are inherently JS-dependent single-page tools already (this is the same tradeoff `marin-magic`'s and `marin-decision-maker`'s own hash-routing already made, not a new one). A docs-shell page that's meant to work fully without JavaScript (see `marin-docs`'s SOP pages) shouldn't use this pattern — those stay as ordinary always-visible sections.

**A control that needs to sit visually among a row of real tabs but doesn't behave like one** (a view toggle rather than a filter/section switch — `marin-mentions`' Stats button, which swaps a list for a set of charts in place, positioned next to its content-type tabs) doesn't get `role="tab"`/`aria-selected` just because of where it sits. Give it `aria-pressed` instead — real toggle-button semantics — and style `[aria-pressed="true"]` the same as `[aria-selected="true"]` for a consistent active look without claiming a keyboard pattern (arrow-key navigation between tabs) the control doesn't implement.

## Charts (canvas)

Chart.js is vendored at `vendor/chart.min.js` (`marin-ui`'s bundle — opt-in, like `vendor/xlsx.full.min.js`; only copy it into a consumer that actually renders charts). Load it before the app's own script:

```html
<script src="shared/app-shell.js"></script>
<script src="vendor/chart.min.js"></script>
<script src="assets/app.js"></script>
```

A `<canvas>` has no inherent accessible content — a screen reader sees an empty image unless told otherwise. Give every chart canvas `role="img"` and a `data-chart-title` (the static heading, matching the visible `<h3>` next to it), then set a real `aria-label` from actual data on every render, not just once at creation:

```html
<canvas id="chart" role="img" data-chart-title="Top sources"></canvas>
```

```js
function describeChart(canvas, summary) {
  const title = canvas.dataset.chartTitle || "Chart";
  canvas.setAttribute("aria-label", summary ? `${title}. ${summary}` : title);
}
// e.g. describeChart(canvas, `Top: ${topLabel} with ${topCount}, of ${entries.length} shown.`);
```

State the actual result (top value, total, peak point), not a generic caption — see `marin-digital-standards/accessibility/standard.md`'s "Components and interaction patterns" for the underlying requirement. Recompute the label every time the chart's data changes (filter change, refresh), the same way the chart itself redraws — a label frozen at creation goes stale the first time the underlying data updates.

Chart.js sizes a canvas at creation time. If a chart can be created while its container is `hidden` (behind a tab or toggle that starts closed), call `.resize()` on the `Chart` instance the first time it becomes visible, or it renders at 0×0 and looks blank.

## Updates feed

Any `[data-updates-repo="repo"]` section lazy-loads that repo's recent commits from the GitHub API the first time it becomes visible, and renders them as `.app-card` entries — no per-page JavaScript needed:

```html
<section id="updates" class="app-card" data-tab-section="updates" data-updates-repo="marin-magic" data-app-name="MarinMagic" hidden>
  <h2>Updates</h2>
  <p data-updates-status class="app-help-text" role="status" aria-live="polite" aria-atomic="true">Select the Updates tab to load recent commits.</p>
  <div data-updates-list></div>
</section>
```

The heading is always literally "Updates." There's a single description line, not two: `data-app-name="App Name"` on the same element as `data-updates-repo` tells `app-shell.js` to settle the status line on "App Name release notes." once commits finish loading, instead of the generic "Latest commits loaded." Without `data-app-name`, it falls back to the generic text.

`app-shell.js` detects visibility by watching the section's `hidden` attribute change, so it works with the tab-sections pattern above, any other tab/hash-routing a page has, or none: a section that's never `hidden` loads immediately. It fetches 15 commits and filters out merge-PR commits (`Merge pull request #N from …` — noise, not a real change) before showing up to 10; a multi-line commit body renders as a `<ul>` list rather than one run-together paragraph, since commit bodies are often already a bullet list. A bare repo name (`data-updates-repo="marin-magic"`) is assumed to be `marincountygov/<repo>`; pass `owner/repo` to point elsewhere. The GitHub API call is unauthenticated — fine for occasional use, but subject to GitHub's 60-requests-per-hour-per-IP unauthenticated rate limit, shared across everyone hitting the page from the same network.

## Security page

Any `[data-security-json="security.json"]` section lazy-loads that file (same origin, same repo — no cross-repo call, unlike Updates) the first time it becomes visible and renders only the `publicSecurity` block from it: profile, last-reviewed date, controls, and data declarations. It never renders the rest of the document, so internal configuration (exceptions, CSP directives, monitoring detail) stays out of the public page.

```html
<section id="security" class="app-card" data-tab-section="security" data-security-json="security.json" hidden>
  <h2>Security</h2>
  <h3>Application security</h3>
  <p data-security-status class="app-help-text" role="status" aria-live="polite" aria-atomic="true">Loading security information&hellip;</p>
  <div data-security-content></div>
</section>
```

Both `[data-security-status]` and `[data-security-content]` are required inside the section. An app with no `security.json` yet gets a plain "not yet published" status, not an error. Visibility is detected the same way as Updates (the section's `hidden` attribute), so it works with the tab-sections pattern or any custom hash routing. Link to files with **relative** paths (`.well-known/security.txt`, `security.json`), never root-absolute ones: apps are GitHub Pages project sites under `/<repo>/`, so `/.well-known/…` resolves to the org root and 404s.

## Standard app nav: About and Updates

`#app-nav` never includes a link to the app's own default/home view, whether or not that view has its own task-specific name — the header icon/title link (`.app-title-row`, see "App shell" in `app-shell.md`) is the only way back to it. `#app-nav` lists just what's left: About, Updates, Security, and any additional non-default task tabs the app genuinely has (e.g. a multi-step app with Preview/Publish steps beyond its default Build step).

```html
<!-- Default view has no task-specific tab of its own (e.g. a directory or lookup landing page) -->
<nav class="app-nav" id="app-nav" aria-label="Application navigation">
  <a href="#about">About</a>
  <a href="#updates">Updates</a>
</nav>

<!-- Default view is itself a named task tab (e.g. "Estimate", "Start", "Builder") — the tab's
     data-tab-section still exists and still loads by default via hash-fallback, it just isn't
     also duplicated as its own #app-nav entry -->
<nav class="app-nav" id="app-nav" aria-label="Application navigation">
  <a href="#about">About</a>
  <a href="#updates">Updates</a>
</nav>
```

Don't add a "Home"/"Start" nav link pointing at the same view the header icon/title already links to — that's a duplicate, not a convenience.

**The header icon/title links to `./` (the app's own root URL), not a `#<hash>`.** A hash link to the tab that's already showing doesn't do anything if you're on it but scrolled down — no hashchange fires for a same-hash click, so the page just stays wherever it was scrolled, and clicking it looks like it silently failed. `./` is a real navigation to a clean URL every time, which resets scroll (and all in-page state) on arrival the way "go home" should actually behave. Because `app-shell.js`'s tab-sync only tracks `a[href^="#"]` links (see "Tab sections" above), a `./` link is intentionally outside that system — don't hardcode `aria-current="page"` on it; that status belongs to whichever hash-tab is genuinely active, and `./` isn't one.

**Use "About" — not "Help" — for the app's second, non-task tab, everywhere.** This is a single fixed label, not a per-app judgment call: usage instructions, "what this tool is," source/disclaimer content, and anything else that isn't the task itself all belong under one "About" tab and heading. The nav link text and the section's own heading must say the same thing ("About" in both). Structure: a plain `<section id="about" class="app-card" data-tab-section="about" hidden>`.

**The default view must be immediately functional.** Whatever tab is shown with no hash (the task itself) should be the working tool — inputs, actions, results — not explanatory copy, source metadata, or how-to instructions sitting above or beside it. Move anything that isn't part of operating the tool into About, even if it's a small block like "where this data comes from" or a topic-link list. A group can span more than one non-adjacent element (give each the same `data-tab-section="about"` value) when About needs to combine usage instructions with metadata like this.

For a docs-shell page (no `#app-nav`), About and Updates are ordinary always-visible sections in `.content` instead of hidden tabs — see `marin-docs`/`marin-expense`/`marin-os` for the pattern: a small `.app-nav`-styled link row next to the breadcrumb in `.header-inner`, pointing at `#about`/`#updates` sections further down the same page.

## The `doc-updated` line

`<p class="doc-updated">Updated August 18, 2026 at 5:15 PM PDT</p>` shows when a document or tool page's content last changed. This should reflect the page's actual last-commit date and time, not a value typed once and left stale — see each consumer's own tooling for how it keeps this in sync (for example, a `scripts/stamp-updated-dates.js` that derives the value from `git log`, run before committing and checked in CI). `marin-ui` only owns the class's styling here, not a syncing mechanism, since that depends on each consumer's own content/build process — `marin-docs` and `marin-expense` currently carry the canonical copy of that script; copy from one of them rather than reinventing it.

Pin `America/Los_Angeles` explicitly (County of Marin is a Pacific-time organization) with `timeZoneName: "short"` so PST/PDT render correctly across the DST boundary — don't hardcode "PT". Including minutes trades a small amount of CI reliability for real precision: a "dirty" (uncommitted) file is stamped with the moment the script runs, but a "clean" (already-committed) file is checked against its actual commit timestamp, so if more than about a minute passes between running the script and finishing `git commit`, the two can disagree by a minute and fail the CI check. Recovery is the same either way: re-run the script and recommit. Run the script as the very last step before committing to minimize this gap.

## Shared CSS implementation

`shared/app-brand.css` is the executable source of truth. Do not copy a second CSS implementation into this specification. Consumers must vendor the complete versioned bundle and record the installed release in `BRAND_VERSION`.

The shared CSS must include OS-controlled light and dark tokens, the MarinOS banner, icon/title treatment, gold title-copy border, cards, text-only feedback button, Docs heading anchors, active table-of-contents state, responsive behavior, print behavior, visible focus, and reduced-motion handling.

`--marin-gold` fails contrast as a foreground color (1.91:1 against white) — it's a background/decorative-border accent only (the title-copy border and `.callout`-style left-border stripes above are the sanctioned uses), never text, an icon fill, or a border implying meaning on its own. Use `--app-accent` for anything that needs to read as interactive or semantically meaningful. See `marin-digital-standards/brand/color.md`.
