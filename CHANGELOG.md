# MarinOS brand bundle changelog

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
