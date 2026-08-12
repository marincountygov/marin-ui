# Architecture

Build County of Marin micro-apps using a simple, durable, standalone-friendly frontend stack with consistent County branding and WCAG 2.2 Level AA accessibility. This is the default standard for small internal tools, local-first utilities, review apps, data cleanup tools, form workflows, dashboards, and other micro-apps.

## Default frontend stack

Use:

```text
HTML
Pico.css
shared/app-brand.css
vanilla JavaScript
optional Alpine.js only when it materially reduces repetitive DOM state code
optional Dexie.js for IndexedDB-backed record storage
```

Do not introduce React, Vue, Svelte, Angular, Next.js, Tailwind, Bootstrap, npm build steps, frontend routing frameworks, or component build systems unless explicitly requested.

Prefer code that can run in subfolders of basic web hosts and as:

```text
file:///.../index.html
```

When IndexedDB, service workers, sync, or stricter browser origin behavior matters, support running through a local static server or packaged runtime.

## Branding model

Use Pico.css as the base UI layer and `shared/app-brand.css` as the County-specific branding layer.

Pico provides:

```text
base typography
forms
buttons
tables
cards/articles
spacing
responsive behavior
light/dark support
semantic HTML defaults
```

`app-brand.css` provides:

```text
County visual identity
app shell
header
footer
navigation
collapsible narrow-viewport main menu
status badges
alerts
cards
toolbars
empty states
focus states
accessible color tokens
layout conventions
```

Do not rely on unmodified Pico defaults for final micro-app UI.

## Required file structure

Use this default structure:

```text
micro-app/
  index.html
  app.js
  assets/
    logo.png
  vendor/
    pico.min.css
    alpine.min.js          optional
    dexie.min.js           optional
  shared/
    app-brand.css
    app-shell.js           optional
```

For multi-screen apps, still prefer a single HTML file with hash-based navigation unless the user explicitly requests separate pages.

## JavaScript rules

Use vanilla JavaScript unless Alpine.js materially simplifies local state.

Required patterns:

```text
addEventListener, not inline onclick
const/let, not var
modules only when deployment supports them
small pure functions
clear separation between state, rendering, and storage
defensive JSON parsing
input validation before persistence
```

Do not create inaccessible custom controls when native HTML controls will work.

Use progressive enhancement where practical.

## Storage rules

Use:

```text
localStorage for small preferences only
IndexedDB through Dexie.js for records, imports, drafts, or larger structured data
JSON export/import for backup
CSV export when users need spreadsheet workflows
```

Any app that stores meaningful local data must include an export path.

Do not treat browser storage as the only durable copy of official records.
