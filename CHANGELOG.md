# MarinOS brand bundle changelog

## 1.17.1 — 2026-09-25

- Fix Marin Zipper's icon: `vendor/icons/lucide/zipper.svg` was a mislabeled copy of Lucide's real `file-archive` icon (verified against the actual published icon — same path data) — renamed to `file-archive.svg`. It also carried a customized `stroke-width="1"`, different from Lucide's real default of `2` and every other vendored icon in this bundle; fixed to `2`. Every consumer previously worked around the old file's thin weight with a per-instance override (`style="stroke-width:1"` on the `<svg>`, or a wrapping `<g stroke-width="1">`) — those overrides are no longer needed and were removed, so the icon now renders at the same standard weight as every other icon, matching its real appearance on lucide.dev.

## 1.17.0 — 2026-09-25

- `shared/app-shell.js`'s Updates feature: strip a leading Conventional Commits-style prefix (`fix:`, `feat(scope):`, etc.) from each commit title before display, so raw commit-message convention doesn't leak to a non-technical reader — this is text cleanup, not real plain-language rewriting, since a static client-side page has no way to genuinely rewrite arbitrary text at view time. Also add a Copy button to each update entry, reusing the existing `[data-copy-value]` mechanism and copy-button markup already documented in `docs/components.md`.

## 1.16.3 — 2026-09-22

- Vendor Chart.js (`vendor/chart.min.js`, `chart.js@4.5.1`'s UMD build, MIT licensed, license alongside at `vendor/CHART_LICENSE.md`) — first consumer is `marin-mentions`' Stats tab. Unlike the font/Pico/icon files, this one is opt-in per app: only copy it into a consumer if that app actually renders charts, not as part of every routine brand-bundle sync.
- Document the Chart.js canvas pattern in `docs/components.md` (`role="img"` plus a data-driven `aria-label` recomputed on every render, not a static caption — canvas has no accessible content of its own) and, in "Tab sections," how to handle a control that sits visually among tabs without following the tabs pattern (`aria-pressed`, not `role="tab"`/`aria-selected`) — both drawn directly from `marin-mentions`' Stats implementation.

## 1.16.2 — 2026-09-19

- Make the MarinOS nav-dropdown's `catalog.json` cache stale-while-revalidate instead of cache-instead-of-fetch: previously, once a browser had a cached copy, it never fetched again until the 6-hour TTL expired, so a `catalog.json` fix (like the 1.16.1 MarinDocs icon) could take up to 6 hours to reach a returning visitor with no way to tell it was stale. Now the cache still renders instantly, but a background fetch always runs and re-renders if the result differs, so fixes land on next load.

## 1.16.1 — 2026-09-18

- Fix the Open Sans rollout from 1.16.0: pointing `--pico-font-family-sans-serif` at `--app-font-body` did nothing because the vendored `pico.min.css` build never reads that variable — Pico's own `body` rule sets no `font-family` at all, so body text was silently still falling back to the browser default rather than Open Sans (or the documented Arial/Verdana fallback chain). Add `font-family: var(--app-font-body);` directly to `app-brand.css`'s own `body` rule, which is the rule that's actually in effect. No visual change to headings (still Jost via `h1`–`h6`/`.app-title`).

## 1.16.0 — 2026-09-18

- Finish the Open Sans rollout: `shared/app-brand.css` already vendored the font file but never loaded it — add its `@font-face`, a new `--app-font-body` token, and point `--pico-font-family-sans-serif` at it so body/UI text actually renders in Open Sans instead of the system-font-only stack it fell back to. Jost is unaffected and stays the heading font. Matches the standard already stated in `marin-digital-standards/brand/typography.md`, which this bundle wasn't actually implementing yet.
- Adopt Lucide as the icon system, self-hosted the same way as fonts (see `marin-digital-standards/brand/iconography.md`). Add `vendor/icons/lucide/` with the first five icons in use (`radar`, `chevron-down`, `copy`, `check`, `link`) plus Lucide's ISC `LICENSE`; redraw `.menu-toggle__caret` and the documented copy-button icons in `docs/components.md` using the real Lucide path data instead of the previous hand-drawn approximations. Documented the new "one icon, three places" convention (header `.app-icon`, favicon, `marin-os/catalog.json`) in `docs/components.md`'s new "App icon" section — no more generic-favicon-but-distinctive-nav-icon split.
- Update `SYNCING.md`'s bundle file list to include the new `vendor/fonts/open-sans/` files and `vendor/icons/lucide/`, and fix its stale references to the archived `marinappsbrand` repo (now `marin-ui`).

## 1.15.0 — 2026-08-26

- Remove `position: sticky` from `.site-header` — no page-level header or nav should pin to the viewport while scrolling. `.toc`'s sticky offset drops from `top: 5.5rem` (tuned to clear the old sticky header) to `top: 1rem`, matching `.docs-toc`; the sidebar TOC itself stays sticky, a different pattern from a persistent top bar. Documented as a hard rule in `docs/app-shell.md` and `marin-digital-standards/product-design/responsive-design.md`.
- Fix `.app-main` to size itself from the shared `--app-max-width` token instead of Pico's own breakpoint-based `.container` class (510/700/950/1200/1450px) — header, banner, footer, and content were never actually sharing one width or alignment. `--app-max-width` also moves from 1120px to 1280px for more usable content width. (`body`'s background and `.app-card`'s shadow were both experimented with during this change — tried `--app-bg`, then no property, then a flat `#ffffff`; and the card shadow was removed — but both landed back on their original values, `--app-bg-soft` and the `0 1px 2px` shadow, so there's no net change to either.)
- Document that `--marin-gold` is background/decorative-border only (1.91:1 as a foreground against white — fails even the 3:1 non-text minimum) — traced from a live WAVE contrast report against the SOP flow chart's decision-gateway marker, which used gold as a border and icon fill. Fixed in `marin-docs/sop/styles.css` (swapped to `--app-accent`) and added to `marin-app-builder`'s review checklist so it doesn't ship unnoticed again.
- Drop `font-weight: 700` from `.app-feedback` — the text-only Feedback button reads at normal weight now, platform-wide.

## 1.14.0 — 2026-08-18

- Document the current `doc-updated` convention: date and time, pinned to `America/Los_Angeles` with `timeZoneName: "short"` (not a hardcoded "PT") so it renders PST/PDT correctly across the DST boundary. `marin-docs` and `marin-expense` are the two consumers using it today — this doesn't affect the Updates feed's live commit timestamps, which correctly render in each visitor's own browser timezone instead and were left alone.

## 1.13.0 — 2026-08-14

- Add the "Inspector panel" pattern (`.app-inspector-overlay`/`.app-inspector-backdrop`/`.app-inspector-panel`/`.app-inspector-header`), promoted from `marin-waymaker`'s node editor: an off-canvas panel for editing one item without losing the list behind it, sliding in from the right on wide viewports and collapsing to a bottom sheet under 850px. Only the CSS is shared — open/close/focus-trap/render stays app-owned since it's coupled to app-specific data. Documented in `docs/components.md` with the full JS behavior contract (focus management, Escape, backdrop click, live-region announcements).

## 1.12.0 — 2026-08-14

- Collapse the Updates section back to one description instead of two: `[data-updates-repo]` sections can now add `data-app-name="App Name"`, and `app-shell.js` uses it to settle the status line on "App Name release notes." once commits finish loading, replacing the generic "Latest commits loaded." Removed the separate static description paragraph added in 1.10.0/1.11.0 from all seven consumers now that the status line carries it.
- `marin-magic`: moved the "Build clean HTML from tabular data" tagline and "Supported output" card out of the default view and into About — the default view is now only the upload tool, with a proper `<h2>` heading in place of the plain form `<label>` it had before.

## 1.11.0 — 2026-08-14

- Add "Home" as the first `#app-nav` link, pointing at the default view's hash, for apps whose default view has no task-specific tab of its own (`marin-magic`, `marin-os`, `marin-docs`, `marin-expense`). Apps whose default view already is a named task tab (`marin-waymaker`'s Builder, `marin-cupa-fees`'s Estimate, the template's Start) are left alone — a second link to the same content would be a duplicate, not a convenience. Documented the distinction in "Standard app nav."
- Standardize the Updates section: heading is always literally "Updates" (was "Latest updates," or in `marin-magic`'s case "Latest MarinMagic commits"), with a one-line "*App name* release notes." description underneath.

## 1.10.0 — 2026-08-14

- Standardize on "About" as the single, fixed label for every app's non-task nav tab — replacing "Help," and dropping the earlier Help-vs-About content-type distinction (1.9.0) that let each app pick either. Applied to `marin-magic`, `marin-waymaker`, `marin-expense`, and `marin-app-template` (the four apps still labeled "Help").
- Document that the default (no-hash) tab must be immediately functional — inputs, actions, results — not explanatory copy or metadata alongside the tool. `marin-expense`'s Overview and Topics sections moved out of the default lookup view and into About, since they're context about the data, not part of looking it up.

## 1.9.0 — 2026-08-14

- Add generic tab sections: elements sharing `data-tab-section="name"` show/hide together, matched to the URL hash, with `#app-nav` `aria-current` kept in sync — no per-page JavaScript needed. Lets a page read as one section at a time (Help shows only Help, Updates shows only Updates) instead of everything stacking under whatever's already visible.
- Fix the Updates feed: filter out merge-PR commits (noise, not a real change) and render a multi-line commit body as a list instead of one run-together paragraph.
- Document Help-vs-About: use whichever fits the content, but the nav label and the section heading must say the same thing.

## 1.8.0 — 2026-08-14

- Add a generic Updates feed: any `[data-updates-repo="repo"]` section lazy-loads that repo's recent commits from the GitHub API and renders them, detecting visibility via the section's `hidden` attribute so no per-page JavaScript or tab-routing integration is needed. Promoted out of `marin-magic`'s hand-written, per-app implementation — same treatment as the earlier sort/copy/share promotions.
- Document the standard app nav: Help + Updates tabs, no "Home" (a tab shouldn't just point back to what's already showing by default).
- Fix `marin-magic`/`marin-waymaker`: neither page loaded `shared/app-shell.js` at all (vendored but never referenced by a `<script>` tag), so the MarinOS banner dropdown had no click handler. Also removed each app's own duplicate hand-written mobile-nav-toggle logic, which would otherwise double-fire against `app-shell.js`'s version now that it's loaded.

## 1.7.2 — 2026-08-13

- Fix: the MarinOS banner's catalog cache key wasn't versioned, so a browser that had already cached `catalog.json` before the 1.7.1 `icon` field was added kept serving icon-less entries for up to 6 hours (the TTL never noticed the shape changed). Bumped the cache key to invalidate immediately; documented bumping it again alongside any future catalog shape/rendering change.

## 1.7.1 — 2026-08-13

- Render the per-app icon (`{viewBox, markup}`) in dynamically-rendered MarinOS banner menu entries, matching `marinos/catalog.json`'s new `icon` field. Closes the "text-only, no icon" gap from 1.7.0 — verified byte-for-byte identical output to the existing static fallback markup for all three current entries.

## 1.7.0 — 2026-08-13

- The MarinOS banner menu now refreshes itself from `marinos/catalog.json` at load (cached in `localStorage` for 6 hours), instead of every app hardcoding the same static list of links. A new app added to `catalog.json` now appears in every other app's banner automatically — no more hand-editing every consumer repo. Falls back untouched to the page's static links if the fetch fails, times out (4s), or the page can't reach `marincountygov.github.io` (e.g. local `file://` testing) — confirmed GitHub Pages serves `catalog.json` with `access-control-allow-origin: *`, so the cross-origin fetch itself is unrestricted. The current page excludes itself from its own rendered menu.

## 1.6.0 — 2026-08-13

- Add the "Docs shell, alternate header/footer" pattern (`.site-header`/`.site-footer`/`.header-inner`/`.footer-inner`/`.docs-brand-icon`/`.breadcrumb-nav`/`.doc-title`/`.doc-description`/`.doc-actions`/`.doc-action`/`.doc-action-status`/`.details`/`.topic-filters`/`.topic-links`/`.page`/`.toc`/`.hero`/`.lede`/`.meta`), promoted from CSS that `marindocs` and `marin-expense` each independently duplicated in full (~90 identical lines in each). `templates/docs/index.html` now uses this pattern, since it's the one real MarinOS documentation products actually use — kept alongside the original `app-header`-based Docs shell rather than replacing it.
- Alias `.content`/`.section`/`.details` to the existing `.docs-content`/`.docs-section`/`.docs-details` rules, since the two Docs shell variants styled them identically under different names.
- Add generic Share-button behavior (`button[data-action="share"]` copies the page URL, reports through `.doc-actions .doc-action-status`) to `app-shell.js`, promoted from identical per-page code in both consumers.

## 1.5.0 — 2026-08-13

- Add generic sortable table columns: a `<thead>` `.sort-button[data-sort-key]` sorts `<tbody>` rows by their matching `data-sort-*` attribute, no per-page JavaScript needed. Promoted out of `marin-expense`'s page-specific implementation.
- Add generic copy-to-clipboard buttons: any `button[data-copy-value]` copies and shows feedback, announcing through `#app-status-message` or a page-supplied `[data-copy-status]`. Also promoted out of `marin-expense`.
- Add the `.doc-updated` class (styling only — each consumer owns keeping its date in sync). Previously duplicated as page-specific CSS in `marindocs` and `marin-expense`.

## 1.4.2 — 2026-08-12

- Add `margin-bottom: 1rem` to `.app-card` and `margin: 1rem 0` to `.app-alert` so stacked cards/alerts in normal page flow (a form workflow, a stack of program sections) get vertical separation without page-specific CSS. Neutralized in the two known grid contexts that already provide spacing via `gap` (`.docs-grid > .app-card`, `.demo-grid > .app-card`, `.demo-stack > .app-alert`), so directory-card grids and the marin-ui demo page are unaffected.

## 1.4.1 — 2026-08-12

- Fix `.app-feedback` to use the same pill shape (`border-radius: 999px`) as every other action button (`.doc-action`, `.menu-toggle`, `.view-toggle`) instead of Pico's smaller default corner radius.
- Link the "MarinOS" text in the standard footer (`.app-footer__inner`) to `https://marincountygov.github.io/marinos/`, styled to match the surrounding footer text with an accent color on hover.

## 1.4.0 — 2026-08-07

- Add the shared `.menu` disclosure-dropdown component (toggle button + panel, generic open/close/outside-click/Escape behavior in `app-shell.js`).
- Turn the MarinOS banner into a click-to-open dropdown listing every current app/docs product with its icon, plus a "Browse all in MarinOS" link, instead of a plain link to the directory.
- Reset Pico's default `nav { justify-content: space-between }` to `flex-start` sitewide; components that need space-between set it explicitly.
- Reset Pico's default `margin-bottom` on `[type="button"]`, `[type="reset"]`, and `[type="submit"]` to `0`.

## 1.3.1 — 2026-08-07

- Fix `app-shell.js` "On this page" active-section tracking so it skips headings inside a `hidden` container instead of treating their zero-value bounding rect as "in view." This surfaced when a page toggles between two content panels (for example a text/flow view switch) and the inactive panel's headings were being reported as the current section.

## 1.3.0 — 2026-08-07

- Add an `ALPHA` superscript tag next to the MarinOS wordmark in the banner, styled small and muted so it reads as a status marker rather than a second heading.

## 1.2.0 — 2026-08-07

- Add the MarinOS icon to the banner, colored to match the banner text.
- Use the MarinOS icon as the shared favicon (inline SVG data URI, no separate icon file).

## 1.1.0 — 2026-08-06

- Remove the manual color-mode toggle and follow the operating-system preference.
- Replace app logotype and official-label blocks with product icons and gold-bordered title copy.
- Require sentence case instead of all-caps interface styling.
- Link directory card headings and remove duplicate “Open” links.
- Standardize a text-only Feedback button on every page.
- Add hover/focus heading anchors and active “On this page” tracking for Docs.
- Document WAVE Firefox testing over HTTP and local-page extension permissions.

## 1.0.0 — 2026-08-05

- Establish the versioned consumer bundle.
- Add the text-only MarinOS banner.
- Standardize the footer as non-interactive `MarinOS` text only.
- Add shared App and Docs layout primitives.
- Add generic App and Docs shell templates.
- Add reusable theme and responsive-menu behavior.
