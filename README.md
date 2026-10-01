# Marin UI

This project is the versioned UI source of truth for MarinOS apps and documentation — the implemented interface system for Marin digital products. It provides App and Docs shells built with semantic HTML, Pico.css, shared County branding, vanilla JavaScript, and WCAG 2.2 Level AA accessibility patterns.

Policy and standards this implements (plain language, accessibility requirements, brand identity, product design principles) live in [marin-digital-standards](https://github.com/marincountygov/marin-digital-standards), not here. This repo is implementation only — see that repo's README for the ownership boundary.

## Purpose

Use this codebase as a reference for small internal tools, local-first utilities, review apps, data cleanup workflows, dashboards, and other focused micro-apps that do not need a frontend framework or build step.

## Project Structure

```text
index.html
app.js
security.json
marin.yml
CHANGELOG.md
templates/
  app/index.html
  docs/index.html
vendor/
  marinos/
    marinos.css
    marinos.js
    manifest.json
    README.md
    licenses/
  fonts/
    Jost-wght.ttf
    open-sans/
      OpenSans-VariableFont_wdth,wght.woff2
      OFL.txt
  icons/
    lucide/
      *.svg
      LICENSE
docs/
  architecture.md
  foundations.md
  components.md
  app-shell.md
  accessibility-implementation.md
SPEC.md
README.md
```

- `index.html`: Demo page showing the required app shell and shared UI components powered by `marin-app-shell`.
- `app.js`: Vanilla JavaScript for form validation, live announcements, dialog focus handling, and application workflows.
- `security.json`: Security configuration for the application.
- `marin.yml`: Manifest recording the pinned shell version (`platform.shell`).
- `vendor/marinos/`: Vendored Marin App Shell release artifacts (`marinos.css`, `marinos.js`, `manifest.json`, licenses). Do not edit files inside `vendor/marinos/` directly.

## How To Run

Serve the folder with any static web server:

```text
python3 -m http.server 8765
```

Then open `http://127.0.0.1:8765/`. You can also open `index.html` directly in a browser:

```text
file:///path/to/index.html
```

## Accessibility

The demo is designed around WCAG 2.2 Level AA expectations. It includes semantic landmarks, logical heading order, visible labels, visible focus states, keyboard-operable controls, non-color-only status indicators, reduced-motion support, accessible form errors, table headers with scope, and live status messages.

## Branding

Pico.css and shared County branding are provided by the vendored `marin-app-shell` (`vendor/marinos/marinos.css`).

## Consumer updates

Consumers vendor a complete shell release and record it in `marin.yml` under `platform.shell`. See `SYNCING.md` for the update and verification procedure.

## Development Notes

- Do not add React, Vue, Svelte, Angular, Tailwind, Bootstrap, npm build steps, frontend routing frameworks, or component build systems unless explicitly required.
- Do not edit vendored shell files under `vendor/marinos/` directly; upgrade by replacing the directory with a tagged shell release.
