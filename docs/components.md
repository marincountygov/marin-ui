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

## Copy, download, file reading and upload

These are not defined in this bundle. They live in `marin-app-shell` 1.21.0 and later (`src/marinos.js`, `src/shell.css`): `marinCopyRich`, `marinCopyText`, `marinDownload`, `marinReadText`, `marinDecodeText`, `marinCleanText` and `marinUpload`, with the `.upload-panel` and `.upload-drop-overlay` styles. Rich copy puts only clean HTML on the clipboard (never a copied, rendered element, which carries this page's fonts and bold weights into a CMS); a CSV download starts with a byte-order mark; a file that is not UTF-8 is read as Windows-1252; an upload is a Browse files button with drop anywhere on the page and one set of messages. When there are several formats, Copy and Download are each one `.menu` button that lists Text, HTML, then Markdown. See the shell's `docs/components.md` and `marin-digital-standards/product-design/text-characters-copy-and-upload.md`.

## Copy-to-clipboard buttons

Any `button[data-copy-value]` copies that value on click and shows brief feedback — no per-page JavaScript needed:

```html
<button type="button" class="copy-button" data-copy-value="411030" aria-label="Copy 411030">
  <svg class="copy-icon" aria-hidden="true" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
  <svg class="copy-check-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
</button>
```

`app-shell.js` swaps `copy-icon` for `copy-check-icon` for 1.5s after a successful copy via the `is-copied` class. It announces the copy through `#app-status-message` if the page has one (the standard app-shell live region), or a page-supplied `[data-copy-status]` live region otherwise — a page using this outside the standard app shell needs one of the two present for screen-reader feedback. Set `data-copy-announce` on the button for custom announcement text; otherwise it announces `Copied <value>`.

## Action buttons

Secondary buttons (Copy, Link, Download, Reset, Next) and their groups are not defined in this bundle. They live in `marin-app-shell` 1.15.0 and later (`src/shell.css`): `.action-toolbar`, `.action-group` (add `.action-group--spaced` in 1.16.0 for pairs pressed often), `.action-button` and `.action-search` (the search field for a toolbar; the filter column's search is `.search-input-field`, see Filter column below). The buttons are an icon with or without a short label, named by `aria-label` and `title`; a lone button has a visible border, and buttons in a group share the group's border. Only a button that submits a form is the solid blue or dark one. See the shell's `docs/components.md` and `marin-digital-standards/product-design/interaction-design.md`. Apps that vendor the shell get these styles; this bundle's `.copy-button` and `.filter-toggle` remain the base the shell builds on.

## Filter column

Every filter column looks the same, so people who learn one app know the next. `marin-mentions` is the reference. The panel's contents, top to bottom:

```html
<aside id="filter-panel" class="search-sidebar" aria-labelledby="filter-panel-title">
  <div class="search-panel-header">
    <h2 class="search-panel-title" id="filter-panel-title">Filter software</h2>
    <button type="button" class="action-button" data-icon="rotate-ccw" aria-label="Reset filters" title="Reset filters"></button>
  </div>
  <div class="search-input-field">
    <label for="filter-search">Search</label>
    <input type="search" id="filter-search" placeholder="Search systems&hellip;" autocomplete="off">
  </div>
  <fieldset class="search-facet-group">
    <legend>Departments</legend>
    <details class="mm-facet-group">
      <summary>All departments</summary>
      <ul class="search-facet-list">
        <li><label><input type="checkbox"> Assessor <span class="search-facet-count">(4)</span></label></li>
      </ul>
    </details>
  </fieldset>
</aside>
```

- **Title:** "Filter" plus the plural thing being filtered ("Filter Mentions", "Filter software"), with the Reset icon button beside it.
- **Search first,** as a normal field: label above, a rounded-rectangle box like the selects (not Pico's pill), full width, no `role="search"` wrapper. Keep the placeholder short enough to fit the 248 px column ("Search systems…"). Search never goes in the toolbar.
- **Filter names** are plural nouns: "Departments", "Monitors", "Sources". Not "Custodian department" or "Filter by source".
- **Collapsed by default.** Each filter is a `details.mm-facet-group` that opens to its checkboxes. Open it on load when the address holds a choice, and say what is chosen in the summary ("3 selected").
- **Spacing:** 1.5rem between fields and groups, 0.45rem between checkbox rows, 24 px checkboxes. Do not add your own list or checkbox spacing in an app.

## Collapsible filter panel

A filter column beside a list of results can be hidden at any width, so the results can use the whole row. `marin-reach` and `marin-mentions` both use it. The requirement is in `marin-digital-standards/product-design/responsive-design.md` ("A filter panel can be collapsed"); this is the implementation. No per-page JavaScript is needed.

```html
<form class="search-layout" aria-label="Filter engagements">
  <div class="search-side">
    <button type="button" class="filter-toggle" data-filter-toggle="engagements" aria-controls="filter-panel"></button>
    <aside id="filter-panel" class="search-sidebar" aria-label="Filters">…search, date and facet fields…</aside>
  </div>
  <div class="search-results">…tabs, summary and results…</div>
</form>
```

The shell (`app-shell.js`) does the rest for every `button[data-filter-toggle]`:

- Draws the Lucide `panel-right-open` icon while the panel is open and `panel-left-open` while it is hidden. Leave the button empty. If you supply your own SVGs, give each `data-filter-icon="open"` or `data-filter-icon="closed"` so the shell can show one at a time. The icons are toggled with the `hidden` attribute, not the `hidden` property, because SVG elements have no `hidden` property.
- Sets `aria-expanded` on the button, `data-open` on the panel (the element named by `aria-controls`) and `data-filters="open"` or `"closed"` on the nearest `.search-layout`. The CSS uses those to hide the panel and, on a wide screen, shrink the column to just the button.
- Starts open on wide screens and closed on screens up to 850 px wide. On a wide screen the person's choice is remembered in this browser (`localStorage` key `marinos.filters.<app id>.<data-filter-toggle value>`, with `<body data-app-id>` as the app id, or the page path if there is none; the page keeps working if storage is blocked). Crossing the 850 px line returns to the default for that width, and a narrow-screen choice is never saved.
- Names the button "Filters" (change it with `data-filter-label`) and adds ", N active" when the app keeps `data-filter-active="N"` on the button (the shell watches the attribute). The button has no visible text, so this is its accessible name; it also sets `title`.
- Dispatches a bubbling `marin-filters-change` event on the layout with `detail: { open, button, panel }` each time the state is set, so an app can measure again anything sized by the results (for example a Leaflet map's `invalidateSize()`); charts that resize with their container need nothing.

Behavior to keep: hiding the panel never clears or changes a filter (the app keeps filtering exactly as before and still says what is active, for example in a "Showing:" line); the hidden panel is `display: none`, so it leaves the tab order; focus stays on the button when it is used; the button is the first thing in the left column, above the filters (on a narrow screen it sits above the page and the panel opens below it; App Shell 1.15.0 and later puts it beside the tab row instead); open, it sits at the column's right edge. The look is the same as the card icon buttons: a 1 px `--app-border` border, `--app-surface` background, `--app-muted` icon, and an accent border with a faint accent tint on hover. `.search-layout`, `.search-side`, `.search-sidebar` (the panel), `.search-results` and the field and filter styles described next are all defined here.

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

## On this page (table of contents)

A long page with several sections gets an "On this page" list: a `nav` of links to the sections' `id`s, in a right-hand column on wide screens and above the content on narrow ones. The list marks the section being read, so a reader always knows where they are — no per-page JavaScript needed:

```html
<nav class="docs-toc" aria-label="On this page">
  <h2>On this page</h2>
  <ul>
    <li><a href="#overview">Overview</a></li>
    <li><a href="#problem">Problem</a></li>
  </ul>
</nav>
```

- **Look:** the list is a bordered box (`1.25rem` padding, no shadow) with the heading ruled off from the links, and the links stacked with a `0.25rem` gap in the normal text color. Pointing at a link gives it a soft background and accent text. This is the same look as the Marin Learn notes reader. The page's content (`.content`) is a plain bordered box with no shadow next to it.
- **Current section:** `app-shell.js` sets `aria-current="location"` on the link for the section being read, and the CSS makes that link bold in the normal text color. The current section is the last one whose top has scrolled past a line about a quarter of the way down the window. At the very bottom of the page the last section is current, even when it is too short to reach that line. Only one link is current at a time. Do not rely on color alone: the bold weight is part of the signal.
- **The reading line** is about a quarter of the way down the window. A page made of short sections, such as a Note, can set `data-on-this-page-line="140"` (pixels from the top of the window) on the list, so the section at the top of the window is the current one rather than a short section below it.
- **Every list on the page** with the `.docs-toc` or `.toc` class is wired up, not just the first.
- **A list added after the page loads** (an app that builds its sections with JavaScript) calls `window.marinOnThisPage(nav)` once the sections and the list are in the page. It stops listening by itself when the list is removed.
- **Only list sections that exist.** A section that is hidden or empty gets no link. Section headings in the list use the same words as the headings on the page.
- Name the nav with `aria-label="On this page"` and use the same words for its visible heading.

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

**A control that needs to sit visually among a row of real tabs but doesn't behave like one** (a view toggle rather than a filter/section switch — `marin-mentions`' Stats button, which swaps a list for a set of charts in place, positioned next to its content-type tabs, **beside** the `role="tablist"` element in a shared wrapper row, never inside it, since a tablist may only contain tabs) doesn't get `role="tab"`/`aria-selected` just because of where it sits. Give it `aria-pressed` instead — real toggle-button semantics — and style `[aria-pressed="true"]` the same as `[aria-selected="true"]` for a consistent active look without claiming a keyboard pattern (arrow-key navigation between tabs) the control doesn't implement.

## Accessibility score gauge

`.app-score` shows a Google Lighthouse accessibility score (0-100) as a ring with the number inside and the band word beside it. Build it with `marinScoreGauge(score, { large })` from `shared/app-shell.js` (also on `window`) rather than writing the SVG by hand:

```js
cell.append(marinScoreGauge(96));                  // table-size
panel.append(marinScoreGauge(96, { large: true })); // stacked, bigger
```

Bands follow Lighthouse: good 90-100, needs improvement 50-89, poor 0-49. Color is never the only signal: the number and band word are always printed, and the ring is `aria-hidden` with "Accessibility score 96 out of 100: Good" in visually hidden text. Don't show a gauge for a failed scan or a missing score, and don't describe a score as WCAG conformance; it is automated testing only. `[data-accessibility-scores]` sections already use this for an app's own score.

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

Chart.js draws its own text and grid and ignores page colors, so its default dark grey text is nearly invisible in dark mode. Before creating a chart, set `Chart.defaults.color` to the page's text color and `Chart.defaults.borderColor` to a card's border color (read both with `getComputedStyle`), and destroy and rebuild charts when `prefers-color-scheme` changes (existing charts do not pick up new defaults). Keep the bar or line color at 3:1 or better on the card in both themes. Give each chart a visually hidden data table with the same numbers, wrapped in a `visually-hidden` `<div>` (the class does not clip a `<table>` element by itself, and an unwrapped table can cause sideways scrolling on narrow screens). When exporting a chart as PNG, draw it onto a canvas filled with the card's background color first, so light-on-dark text stays readable on any paper or slide.

## Form control borders

Text inputs, date inputs, selects, checkboxes and radio buttons take their border from `--app-control-border` (through Pico's `--pico-form-element-border-color`), which keeps the edge of a control at 3:1 or better in both themes (WCAG 1.4.11). Do not use `--app-border` for a control; it is the light divider for cards and tables. `node scripts/check-contrast.js` checks the pair.

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
