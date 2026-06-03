# County of Marin Level 2 Micro-App Standard

This project is a standalone demo and starter for County of Marin Level 2 micro-apps. It shows how to build small, durable County tools with semantic HTML, Pico.css, shared County branding, vanilla JavaScript, and WCAG 2.2 Level AA accessibility patterns.

## Purpose

Use this codebase as a reference for small internal tools, local-first utilities, review apps, data cleanup workflows, form workflows, dashboards, and other focused micro-apps that do not need a frontend framework or build step.

## Project Structure

```text
index.html
app.js
assets/
  logo.png
vendor/
  pico.min.css
  fonts/
    Jost-wght.ttf
shared/
  app-brand.css
SPEC.md
README.md
```

- `index.html`: Demo page showing the required app shell and shared UI components.
- `app.js`: Vanilla JavaScript for form validation, live announcements, dialog focus handling, hash navigation state, and light/dark mode.
- `assets/logo.png`: Official County of Marin logo stored locally.
- `shared/app-brand.css`: County-specific branding layer, design tokens, accessibility styles, layout utilities, and component classes.
- `vendor/pico.min.css`: Local Pico.css base stylesheet.
- `vendor/fonts/Jost-wght.ttf`: Local Jost variable font used for headings.
- `SPEC.md`: Full Level 2 micro-app standard and review checklist.

## How To Run

Open `index.html` directly in a browser:

```text
file:///path/to/index.html
```

You can also serve the folder with any static web server. A local server is recommended when browser origin behavior matters, such as IndexedDB, service workers, sync, or stricter runtime packaging.

## Included Demo Components

- County-style app shell with skip link, header, navigation, main landmark, and footer.
- Collapsible main menu on narrow viewports with accessible expanded/collapsed state.
- Official County logo loaded from the local `assets/logo.png` file.
- Jost heading typography loaded from a local bundled font file with accessible sans-serif fallbacks.
- Fixed top-right light/dark mode toggle using SVG sun/moon icons.
- Cards, toolbars, alerts, badges, and status pills.
- Accessible demo form with text input, select, radio buttons, checkboxes, textarea, help text, and validation errors.
- Responsive data table with scoped row hover styles.
- Empty state pattern.
- Native dialog with focus return.
- Live region for dynamic status announcements.

## Accessibility

The demo is designed around WCAG 2.2 Level AA expectations. It includes semantic landmarks, logical heading order, visible labels, visible focus states, keyboard-operable controls, non-color-only status indicators, reduced-motion support, accessible form errors, table headers with scope, and live status messages.

The light/dark mode toggle stores a small user preference in `localStorage` and falls back to `prefers-color-scheme` when no saved preference exists.

## Branding

Pico.css provides the base UI layer. `shared/app-brand.css` provides the County-specific layer, including Marin color tokens, shell styles, component classes, focus styles, and light/dark theme tokens.

The official County logo is stored locally at `assets/logo.png`. Do not recreate, recolor, stretch, distort, or approximate the logo artwork. If an approved logo asset is not available in a future project, use accessible text branding instead.

## Development Notes

- Do not add React, Vue, Svelte, Angular, Tailwind, Bootstrap, npm build steps, frontend routing frameworks, or component build systems unless explicitly required.
- Do not add external font calls in the document `<head>`; load bundled font assets from the codebase.
- Prefer semantic HTML and native controls before custom JavaScript behavior.
- Keep apps standalone-friendly and able to run from a basic static host or local file path.
- Use `shared/app-brand.css` classes before creating new visual patterns.
- Refer to `SPEC.md` before extending the starter or creating a new County micro-app.
