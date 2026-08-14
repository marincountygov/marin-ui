# MarinOS brand bundle changelog

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
