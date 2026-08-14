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

## The `doc-updated` line

`<p class="doc-updated">Updated August 13, 2026</p>` shows when a document or tool page's content last changed. This should reflect the page's actual last-commit date, not a value typed once and left stale — see each consumer's own tooling for how it keeps this in sync (for example, a `scripts/stamp-updated-dates.js` that derives the date from `git log`, run before committing and checked in CI). `marin-ui` only owns the class's styling here, not a syncing mechanism, since that depends on each consumer's own content/build process.

## Shared CSS implementation

`shared/app-brand.css` is the executable source of truth. Do not copy a second CSS implementation into this specification. Consumers must vendor the complete versioned bundle and record the installed release in `BRAND_VERSION`.

The shared CSS must include OS-controlled light and dark tokens, the MarinOS banner, icon/title treatment, gold title-copy border, cards, text-only feedback button, Docs heading anchors, active table-of-contents state, responsive behavior, print behavior, visible focus, and reduced-motion handling.
