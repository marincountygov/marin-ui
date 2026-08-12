# Spec: Marin UI

## Purpose

Build County of Marin micro-apps using a simple, durable, standalone-friendly frontend stack with consistent County branding and WCAG 2.2 Level AA accessibility.

This is the default standard for small internal tools, local-first utilities, review apps, data cleanup tools, form workflows, dashboards, and other micro-apps.

## Documentation

This spec is split into focused documents. Start here, then go to the one you need:

- [`docs/architecture.md`](docs/architecture.md) — frontend stack, branding model, file structure, JavaScript rules, storage rules.
- [`docs/foundations.md`](docs/foundations.md) — color tokens and typography implementation.
- [`docs/components.md`](docs/components.md) — required shared CSS classes, the `.menu` disclosure component, shared CSS implementation.
- [`docs/app-shell.md`](docs/app-shell.md) — the required app shell markup (banner, header, footer, feedback).
- [`docs/accessibility-implementation.md`](docs/accessibility-implementation.md) — WCAG 2.2 AA implementation: structure, keyboard, contrast, forms, tables, dialogs, motion, status messages, WAVE testing.

Policy this spec implements — brand identity, content-design rules, accessibility requirements, product-design principles — is canonical in [marin-digital-standards](https://github.com/marincountygov/marin-digital-standards), not here. Each doc above links to the specific standard it implements where relevant.

## Standard AI Code Agent prompt

> Per the marin-digital-standards migration plan, this prompt and the review checklist below are slated to become `marin-skills/marin-app-builder` in a later phase (consulting both `marin-digital-standards` and `marin-ui` rather than embedding a copy of both here). Not extracted yet — still current and authoritative in the meantime.

Use this prompt when asking AI coding agents to build a County micro-app:

```text
Build this as a County of Marin micro-app.

Use semantic HTML, Pico.css, shared/app-brand.css, and vanilla JavaScript. Use Alpine.js only if it materially simplifies repetitive DOM state. Use Dexie.js only if the app needs IndexedDB-backed record storage.

Branding must be derived from www.marincounty.gov and the County of Marin identity guidance. Do not recreate or alter the County logo. Use County palette tokens from app-brand.css. Maintain the MarinOS shell with a skip link, MarinOS banner, product icon, app title, main landmark, MarinOS footer, and text-only Feedback button.

Use Jost for heading fonts from a local bundled font file with accessible sans-serif fallbacks. Use sentence case throughout the interface. Follow the user's operating-system light/dark preference with CSS `prefers-color-scheme`; do not add a theme toggle or store a theme preference.

Collapse the main menu on narrow viewports with a keyboard-operable button that uses `aria-expanded` and `aria-controls`.

The app must conform to WCAG 2.2 Level AA. Use semantic controls, visible labels, proper heading order, keyboard operability, visible focus styles, accessible form errors, sufficient contrast, non-color-only status indicators, reduced-motion support, and accessible live regions for dynamic status messages.

Do not introduce React, Vue, Svelte, Angular, Tailwind, Bootstrap, npm build steps, or frontend routing frameworks unless explicitly requested.

Prefer a standalone-friendly structure:
index.html
app.js
vendor/pico.min.css
shared/app-brand.css

Use localStorage only for small preferences. Use IndexedDB through Dexie for real records. Include JSON export/import for any meaningful local data.
```

## Review checklist before accepting generated code

Before accepting AI code agent output, verify:

```text
No unnecessary framework was introduced.
Pico.css is used as the base layer.
app-brand.css is used for County-specific styling.
The app has a skip link.
The app has one main landmark.
Jost is used for heading fonts from a local bundled font file with accessible fallbacks.
Light and dark colors follow the operating-system preference through `prefers-color-scheme`; no theme toggle or stored override is present.
The main menu collapses on narrow viewports with correct `aria-expanded` and `aria-controls` state.
Heading order is logical.
All controls have visible labels.
All buttons and links have accessible names.
The app is fully keyboard operable.
Focus states are visible.
Focus is not obscured.
Color contrast passes WCAG 2.2 AA.
Status is not conveyed by color alone.
Dynamic messages use role="status" or role="alert" appropriately.
Forms expose clear validation errors.
Tables use proper headers and scope.
Touch/click targets are adequately sized.
Reduced motion is respected.
Logo artwork is not recreated or distorted.
The footer contains only the text MarinOS, linked to https://marincountygov.github.io/marinos/.
The text-only Feedback button is present and has no icon.
Interface headings and labels use sentence case rather than forced all caps.
Directory card titles are the links; duplicate "Open" links are absent.
WAVE testing is run from an HTTP URL, or local-file access is enabled for the extension.
Local data has export/import if meaningful.
```
