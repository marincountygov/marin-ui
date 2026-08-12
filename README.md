# Marin UI

This project is the versioned UI source of truth for MarinOS apps and documentation — the implemented interface system for Marin digital products. It provides App and Docs shells built with semantic HTML, Pico.css, shared County branding, vanilla JavaScript, and WCAG 2.2 Level AA accessibility patterns.

Policy and standards this implements (plain language, accessibility requirements, brand identity, product design principles) live in [marin-digital-standards](https://github.com/marincountygov/marin-digital-standards), not here. This repo is implementation only — see that repo's README for the ownership boundary.

> This repo was seeded from `marinappsbrand`, which remains live for now and will be archived once every consumer has migrated to `marin-ui`. See `marin-repo-architecture-plan.md` in the top-level `marin/` working directory for the full migration plan.

## Purpose

Use this codebase as a reference for small internal tools, local-first utilities, review apps, data cleanup workflows, form workflows, dashboards, and other focused micro-apps that do not need a frontend framework or build step.

## Project Structure

```text
index.html
app.js
BRAND_VERSION
CHANGELOG.md
templates/
  app/index.html
  docs/index.html
vendor/
  pico.min.css
  fonts/
    Jost-wght.ttf
shared/
  app-brand.css
  app-shell.js
SPEC.md
README.md
```

- `index.html`: Demo page showing the required app shell and shared UI components.
- `app.js`: Vanilla JavaScript for form validation, live announcements, dialog focus handling, hash navigation state, and light/dark mode.
- `templates/app/index.html`: Generic task-focused application shell.
- `templates/docs/index.html`: Generic documentation shell with breadcrumbs and table of contents.
- `shared/app-brand.css`: County-specific branding layer, design tokens, accessibility styles, layout utilities, and component classes.
- `shared/app-shell.js`: Reusable responsive-menu, Docs heading-anchor, and active table-of-contents behavior.
- `vendor/pico.min.css`: Local Pico.css base stylesheet.
- `vendor/fonts/Jost-wght.ttf`: Local Jost variable font used for headings.
- `SPEC.md`: Full County of Marin micro-app standard and review checklist.

## How To Run

Open `index.html` directly in a browser:

```text
file:///path/to/index.html
```

You can also serve the folder with any static web server. A local server is recommended when browser origin behavior matters, such as IndexedDB, service workers, sync, or stricter runtime packaging.

## Included Demo Components

- Text-only MarinOS banner, County identity header, main landmark, and MarinOS-only footer.
- Separate generic App and Docs shells.
- Collapsible main menu on narrow viewports with accessible expanded/collapsed state.
- Product icons with a gold-bordered title and subtitle area.
- Jost heading typography loaded from a local bundled font file with accessible sans-serif fallbacks.
- Light/dark colors that follow the user's operating-system setting.
- Text-only Feedback button.
- Cards, toolbars, alerts, badges, and status pills.
- Accessible demo form with text input, select, radio buttons, checkboxes, textarea, help text, and validation errors.
- Responsive data table with scoped row hover styles.
- Empty state pattern.
- Native dialog with focus return.
- Live region for dynamic status announcements.

## Accessibility

The demo is designed around WCAG 2.2 Level AA expectations. It includes semantic landmarks, logical heading order, visible labels, visible focus states, keyboard-operable controls, non-color-only status indicators, reduced-motion support, accessible form errors, table headers with scope, and live status messages.

Light/dark mode follows `prefers-color-scheme`. The shell does not provide a manual toggle or store a theme preference.

## Branding

Pico.css provides the base UI layer. `shared/app-brand.css` provides the County-specific layer, including Marin color tokens, shell styles, component classes, focus styles, and light/dark theme tokens.

Use a simple product icon beside the app title rather than an app logotype block. If approved County logo art is used elsewhere, do not recreate, recolor, stretch, distort, or approximate it.

Use sentence case for interface text. Directory cards link their heading text rather than adding separate “Open” links.

## WAVE testing

Serve the project over local HTTP before activating the WAVE Firefox extension. If testing a `file://` page, enable local-page access for WAVE in Firefox's extension settings. See `SPEC.md` for the full accessibility-testing expectations.

## Consumer updates

Consumers vendor a complete release and record it in `BRAND_VERSION`. Copy `shared/`, required `vendor/` files, and `BRAND_VERSION` together. See `SYNCING.md` for the update and verification procedure.

## Development Notes

- Do not add React, Vue, Svelte, Angular, Tailwind, Bootstrap, npm build steps, frontend routing frameworks, or component build systems unless explicitly required.
- Do not add external font calls in the document `<head>`; load bundled font assets from the codebase.
- Prefer semantic HTML and native controls before custom JavaScript behavior.
- Keep apps standalone-friendly and able to run from a basic static host or local file path.
- Use `shared/app-brand.css` classes before creating new visual patterns.
- Refer to `SPEC.md` before extending the starter or creating a new County micro-app.
