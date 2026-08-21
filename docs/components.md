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

## The `.menu` disclosure component

`.menu` / `.menu-toggle` / `.menu-panel` is the shared pattern for any click-to-open dropdown: the MarinOS banner (see `app-shell.md`), and grouped document actions (Share, Download) described in `accessibility-implementation.md`. It is a disclosure pattern (a toggle button plus a hidden panel), not a full ARIA `menu`/`menuitem` widget — that keeps keyboard support simple (Tab reaches the toggle and, once open, the panel's real links/buttons in order; Escape closes and returns focus to the toggle) and avoids the roving-tabindex and arrow-key requirements that `role="menu"` would demand.

```html
<div class="menu">
  <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="example-panel">
    Label
    <svg class="menu-toggle__caret" aria-hidden="true" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg>
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
  <svg class="copy-icon" aria-hidden="true" viewBox="0 0 16 16"><rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M3.5 10.5h-1a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v1"/></svg>
  <svg class="copy-check-icon" aria-hidden="true" viewBox="0 0 16 16"><path d="M2.5 8.5l3 3 8-8"/></svg>
</button>
```

`app-shell.js` swaps `copy-icon` for `copy-check-icon` for 1.5s after a successful copy via the `is-copied` class. It announces the copy through `#app-status-message` if the page has one (the standard app-shell live region), or a page-supplied `[data-copy-status]` live region otherwise — a page using this outside the standard app shell needs one of the two present for screen-reader feedback. Set `data-copy-announce` on the button for custom announcement text; otherwise it announces `Copied <value>`.

## Share button

Any `button[data-action="share"]` copies `window.location.href` on click and reports through the nearest `.doc-actions .doc-action-status` — no per-page JavaScript needed:

```html
<div class="doc-actions">
  <div class="menu">
    <button type="button" class="doc-action menu-toggle" aria-expanded="false" aria-controls="share-menu-panel">Share<svg class="menu-toggle__caret" aria-hidden="true" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg></button>
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

`app-shell.js` shows whichever group's name matches the current hash, or the first name it finds in the page if the hash is empty or doesn't match anything — so there's no need for an explicit "Home"/default nav tab (see "No Home" below). It also keeps `#app-nav`'s `aria-current="page"` in sync with whichever tab is active, if a `#app-nav` is present. A group can span more than one element (give each the same `data-tab-section` value) when the default view is built from several sibling sections, like a directory page's separate "Apps" and "Docs" grids.

Give every non-default section `hidden` in the static markup — without JavaScript, only the default group is reachable, matching how these are inherently JS-dependent single-page tools already (this is the same tradeoff `marin-magic`'s and `marin-decision-maker`'s own hash-routing already made, not a new one). A docs-shell page that's meant to work fully without JavaScript (see `marin-docs`'s SOP pages) shouldn't use this pattern — those stay as ordinary always-visible sections.

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

## Standard app nav: About and Updates

Every app-shell app's `#app-nav` should include an Updates tab and an About tab. Whether it also needs an explicit "Home" link depends on whether the default view already has its own named tab:

```html
<!-- Default view has no task-specific tab of its own (e.g. a directory or lookup landing page) -->
<nav class="app-nav" id="app-nav" aria-label="Application navigation">
  <a href="#<default-view-hash>" aria-current="page">Home</a>
  <a href="#about">About</a>
  <a href="#updates">Updates</a>
</nav>

<!-- Default view is itself a named task tab (e.g. "Estimate", "Start", "Builder") -->
<nav class="app-nav" id="app-nav" aria-label="Application navigation">
  <a href="#<task>" aria-current="page">…task-specific tab(s)…</a>
  <a href="#about">About</a>
  <a href="#updates">Updates</a>
</nav>
```

Don't add both — a "Home" link and a task tab that point at the exact same content is a duplicate, not a convenience.

**Use "About" — not "Help" — for the app's second, non-task tab, everywhere.** This is a single fixed label, not a per-app judgment call: usage instructions, "what this tool is," source/disclaimer content, and anything else that isn't the task itself all belong under one "About" tab and heading. The nav link text and the section's own heading must say the same thing ("About" in both). Structure: a plain `<section id="about" class="app-card" data-tab-section="about" hidden>`.

**The default view must be immediately functional.** Whatever tab is shown with no hash (the task itself) should be the working tool — inputs, actions, results — not explanatory copy, source metadata, or how-to instructions sitting above or beside it. Move anything that isn't part of operating the tool into About, even if it's a small block like "where this data comes from" or a topic-link list. A group can span more than one non-adjacent element (give each the same `data-tab-section="about"` value) when About needs to combine usage instructions with metadata like this.

If the app has a genuine default/landing view distinct from its other tabs (not just "the first tab happens to be named something task-specific"), give it both an explicit "Home" link in `#app-nav` (see above) and a clickable logo: wrap the header's `.app-title-row` in `<a href="#default-view-hash" class="app-title-row">`. `a.app-title-row` is already styled to inherit color and drop the underline.

For a docs-shell page (no `#app-nav`), About and Updates are ordinary always-visible sections in `.content` instead of hidden tabs — see `marin-docs`/`marin-expense`/`marin-os` for the pattern: a small `.app-nav`-styled link row next to the breadcrumb in `.header-inner`, pointing at `#about`/`#updates` sections further down the same page.

## The `doc-updated` line

`<p class="doc-updated">Updated August 18, 2026 at 5:15 PM PDT</p>` shows when a document or tool page's content last changed. This should reflect the page's actual last-commit date and time, not a value typed once and left stale — see each consumer's own tooling for how it keeps this in sync (for example, a `scripts/stamp-updated-dates.js` that derives the value from `git log`, run before committing and checked in CI). `marin-ui` only owns the class's styling here, not a syncing mechanism, since that depends on each consumer's own content/build process — `marin-docs` and `marin-expense` currently carry the canonical copy of that script; copy from one of them rather than reinventing it.

Pin `America/Los_Angeles` explicitly (County of Marin is a Pacific-time organization) with `timeZoneName: "short"` so PST/PDT render correctly across the DST boundary — don't hardcode "PT". Including minutes trades a small amount of CI reliability for real precision: a "dirty" (uncommitted) file is stamped with the moment the script runs, but a "clean" (already-committed) file is checked against its actual commit timestamp, so if more than about a minute passes between running the script and finishing `git commit`, the two can disagree by a minute and fail the CI check. Recovery is the same either way: re-run the script and recommit. Run the script as the very last step before committing to minimize this gap.

## Shared CSS implementation

`shared/app-brand.css` is the executable source of truth. Do not copy a second CSS implementation into this specification. Consumers must vendor the complete versioned bundle and record the installed release in `BRAND_VERSION`.

The shared CSS must include OS-controlled light and dark tokens, the MarinOS banner, icon/title treatment, gold title-copy border, cards, text-only feedback button, Docs heading anchors, active table-of-contents state, responsive behavior, print behavior, visible focus, and reduced-motion handling.
