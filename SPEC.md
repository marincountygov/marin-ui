# Spec: County of Marin Micro-App

## Purpose

Build County of Marin micro-apps using a simple, durable, standalone-friendly frontend stack with consistent County branding and WCAG 2.2 Level AA accessibility.

This is the default standard for small internal tools, local-first utilities, review apps, data cleanup tools, form workflows, dashboards, and other micro-apps.

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

## Branding source of truth

Branding must be derived from the public County of Marin website and official County identity guidance.

The official County logo is available from:

```text
https://www.marincounty.gov/themes/custom/marin_county/logo.png
```

Store approved logo artwork locally in the codebase, such as `assets/logo.png`, and reference the local file from the app.

Use these principles:

1. Identify the app as an official County of Marin tool.
2. Use a County-style header and footer.
3. Use the approved County logo artwork when available.
4. Do not recreate, distort, redraw, recolor, stretch, or approximate the County logo.
5. Prefer the County Primary Logo where there is adequate space.
6. Use the County Secondary Logo where space is constrained.
7. Use black logo artwork on light backgrounds.
8. Use reversed white logo artwork only on dark backgrounds.
9. Maintain clear breathing room around logo artwork.
10. Do not overlap logos with text, icons, lines, decorative marks, or controls.

If approved County logo assets are not available in the project, render text branding as:

```text
Official County of Marin website
County of Marin
```

Do not generate fake logo art.

## County color tokens

Use the official County palette as the brand source. Define tokens in `app-brand.css`.

```css
:root {
  --marin-black: #000000;
  --marin-gold: #e5b53b;
  --marin-blue: #0777cf;
  --marin-dark-gray: #6f6f6f;
  --marin-light-gray: #a9a9a9;
  --marin-green: #73784a;
  --marin-brown: #a2662b;
  --marin-red: #b45340;

  --app-bg: #ffffff;
  --app-bg-soft: #f6f7f8;
  --app-surface: #ffffff;
  --app-text: #1f1f1f;
  --app-muted: #555f66;
  --app-border: #d8dee4;

  --app-brand: var(--marin-black);
  --app-accent: var(--marin-blue);
  --app-warning: var(--marin-gold);
  --app-danger: var(--marin-red);
  --app-success: var(--marin-green);

  --pico-primary: var(--marin-blue);
  --pico-primary-hover: #005ea8;
  --pico-primary-focus: rgba(7, 119, 207, 0.25);
  --pico-border-radius: 0.375rem;
}
```

Accessibility rule: do not use the official palette mechanically when contrast fails. Brand colors may be used as accents, borders, icons, section markers, badges, and chart colors, but text/background combinations must pass WCAG 2.2 Level AA contrast.

Avoid gold as body text on white. Use gold primarily as a non-text accent, divider, badge background with dark text, or decorative highlight.

## Typography

Use accessible system fonts by default.

```css
:root {
  --app-font-heading:
    "Jost",
    Arial,
    Verdana,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  --app-font-sans:
    Arial,
    Verdana,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  --app-font-serif:
    Georgia,
    "Times New Roman",
    serif;
}
```

Use Arial/Verdana-compatible typography for body copy.

Use Jost (https://fonts.google.com/specimen/Jost) for heading fonts. Include the Jost font file in the codebase and load it with `@font-face`; do not require external font calls from the document `<head>`. Provide accessible sans-serif fallbacks.

Normalize Pico's responsive root font scaling to `--pico-font-size: 100%` at all Pico root breakpoints. Do not flatten heading-specific or `small` element font-size variables.

Use Futura only if an approved licensed County font file or official rendered logo/logotype asset is already available in the project. Do not fetch, embed, generate, or substitute unlicensed font files.

Do not use all-caps headings for long text. All-caps may be used only for short labels, eyebrow text, or metadata, with adequate letter spacing.

## Required app shell

Every micro-app must include:

```text
skip link
official County identifier
app title
main landmark
footer
accessibility/help link or contact area
visible focus styles
user-facing fixed top-right light/dark mode toggle represented by accessible SVG sun/moon icons
```

Use this shell unless the user asks for something materially different:

```html
<body>
  <a class="skip-link" href="#main">Skip to main content</a>

  <button type="button" class="app-theme-toggle" aria-pressed="false" aria-label="Switch to dark mode">
    <svg class="app-theme-toggle__icon app-theme-toggle__icon--sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <!-- sun icon path -->
    </svg>
    <svg class="app-theme-toggle__icon app-theme-toggle__icon--moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <!-- moon icon path -->
    </svg>
    <span class="app-theme-toggle__label visually-hidden">Switch to dark mode</span>
  </button>

  <header class="app-header" role="banner">
    <div class="app-header__inner">
      <div class="app-identity">
        <div class="app-official">Official County of Marin tool</div>
        <div class="app-title-row">
          <img
            src="./assets/logo.png"
            alt="County of Marin"
            class="app-logo"
          >
          <div>
            <h1 class="app-title">App Name</h1>
            <p class="app-subtitle">Short description of what this app does.</p>
          </div>
        </div>
      </div>

      <button type="button" class="app-menu-toggle" aria-expanded="false" aria-controls="app-nav">
        Menu
      </button>

      <nav id="app-nav" class="app-nav" aria-label="Application navigation">
        <a href="#home" aria-current="page">Home</a>
        <a href="#settings">Settings</a>
      </nav>
    </div>
  </header>

  <main id="main" class="container app-main" tabindex="-1">
    <!-- app content -->
  </main>

  <footer class="app-footer" role="contentinfo">
    <div>
      <strong>County of Marin</strong>
      <p>Internal micro-app. For accessibility help or accommodation requests, contact the responsible department.</p>
    </div>
  </footer>

  <script src="./app.js"></script>
</body>
```

If no approved logo asset exists, replace the logo image with accessible text:

```html
<div class="app-logotype" aria-label="County of Marin">County of Marin</div>
```

## Required shared CSS classes

Build agents should use these shared classes before inventing new visual patterns:

```text
skip-link
app-header
app-header__inner
app-official
app-identity
app-logo
app-logotype
app-title
app-subtitle
app-menu-toggle
app-nav
app-theme-toggle
app-main
app-footer
app-page-heading
app-kicker
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
```

## Base `app-brand.css`

Use this as the starting point:

```css
:root {
  --marin-black: #000000;
  --marin-gold: #e5b53b;
  --marin-blue: #0777cf;
  --marin-dark-gray: #6f6f6f;
  --marin-light-gray: #a9a9a9;
  --marin-green: #73784a;
  --marin-brown: #a2662b;
  --marin-red: #b45340;

  --app-bg: #ffffff;
  --app-bg-soft: #f6f7f8;
  --app-surface: #ffffff;
  --app-text: #1f1f1f;
  --app-muted: #4b5563;
  --app-border: #d8dee4;
  --app-focus: #0777cf;

  --app-brand: var(--marin-black);
  --app-accent: var(--marin-blue);
  --app-warning: var(--marin-gold);
  --app-danger: var(--marin-red);
  --app-success: #4f5f2f;

  --pico-font-family-sans-serif:
    Arial,
    Verdana,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  --pico-primary: var(--marin-blue);
  --pico-primary-hover: #005ea8;
  --pico-primary-focus: rgba(7, 119, 207, 0.25);
  --pico-border-radius: 0.375rem;
  --pico-font-size: 100%;
}

@media (min-width: 576px) {
  :host,
  :root {
    --pico-font-size: 100%;
  }
}

@media (min-width: 768px) {
  :host,
  :root {
    --pico-font-size: 100%;
  }
}

@media (min-width: 1024px) {
  :host,
  :root {
    --pico-font-size: 100%;
  }
}

@media (min-width: 1280px) {
  :host,
  :root {
    --pico-font-size: 100%;
  }
}

@media (min-width: 1536px) {
  :host,
  :root {
    --pico-font-size: 100%;
  }
}

html {
  color-scheme: light;
}

body {
  background: var(--app-bg-soft);
  color: var(--app-text);
}

.skip-link {
  position: absolute;
  left: 1rem;
  top: 0;
  transform: translateY(-120%);
  z-index: 999;
  padding: 0.75rem 1rem;
  background: var(--marin-black);
  color: #ffffff;
  border-radius: 0 0 0.375rem 0.375rem;
}

.skip-link:focus {
  transform: translateY(0);
}

:focus-visible {
  outline: 3px solid var(--app-focus);
  outline-offset: 3px;
}

.app-header {
  background: #ffffff;
  border-bottom: 1px solid var(--app-border);
}

.app-header__inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.app-official {
  color: var(--app-muted);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.app-title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-logo {
  width: auto;
  max-width: 180px;
  max-height: 56px;
}

.app-logotype {
  font-weight: 700;
  letter-spacing: 0.03em;
}

.app-title {
  margin: 0;
  font-size: clamp(1.35rem, 2vw, 1.75rem);
  line-height: 1.2;
}

.app-subtitle {
  margin: 0.25rem 0 0;
  color: var(--app-muted);
}

.app-nav {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.app-nav a {
  padding: 0.5rem 0.75rem;
  border-radius: var(--pico-border-radius);
  text-decoration: none;
}

.app-nav a[aria-current="page"],
.app-nav a:hover {
  background: #eef6fd;
  color: #004f8f;
}

.app-main {
  padding-top: 2rem;
  padding-bottom: 3rem;
}

.app-page-heading {
  margin-bottom: 1.5rem;
}

.app-kicker {
  margin-bottom: 0.25rem;
  color: #005ea8;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.app-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--pico-border-radius);
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06);
}

.app-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.app-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.app-alert {
  padding: 0.875rem 1rem;
  border: 1px solid var(--app-border);
  border-left: 0.375rem solid var(--app-accent);
  background: #ffffff;
  border-radius: var(--pico-border-radius);
}

.app-alert--success {
  border-left-color: var(--app-success);
}

.app-alert--warning {
  border-left-color: var(--app-warning);
}

.app-alert--danger {
  border-left-color: var(--app-danger);
}

.app-badge,
.app-status {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 1.5rem;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.2;
}

.app-status[data-status="open"] {
  background: #eef6fd;
  color: #004f8f;
}

.app-status[data-status="done"],
.app-status[data-status="complete"],
.app-status[data-status="success"] {
  background: #eef4e6;
  color: #34451d;
}

.app-status[data-status="warning"] {
  background: #fff6d8;
  color: #4d3900;
}

.app-status[data-status="error"],
.app-status[data-status="danger"] {
  background: #fbecea;
  color: #7f2d20;
}

.app-empty {
  padding: 2rem;
  text-align: center;
  color: var(--app-muted);
  background: #ffffff;
  border: 1px dashed var(--app-border);
  border-radius: var(--pico-border-radius);
}

.app-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.app-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: 1rem;
}

.app-required {
  color: #7f2d20;
  font-weight: 700;
}

.app-error {
  color: #7f2d20;
  font-weight: 700;
}

.app-help-text {
  color: var(--app-muted);
  font-size: 0.9375rem;
}

.app-footer {
  max-width: 1120px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2rem;
  color: var(--app-muted);
}

@media (max-width: 720px) {
  .app-header__inner {
    align-items: stretch;
    flex-direction: column;
  }

  .app-title-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .app-nav {
    flex-direction: column;
  }

  .app-nav a {
    width: 100%;
  }
}
```

## Accessibility standard

All generated apps must conform to WCAG 2.2 Level AA.

This is not optional. Treat accessibility as an implementation requirement, not a cleanup task.

Build agents must satisfy these requirements:

### Structure and semantics

Use semantic HTML before ARIA.

Required:

```text
one main landmark
proper heading order
labels for all form controls
button elements for actions
anchor elements for navigation
table markup only for tabular data
fieldsets and legends for grouped form options
lists for list content
```

Do not use clickable `div` or `span` elements.

Do not remove native outlines unless replacing them with an equally visible `:focus-visible` style.

### Keyboard accessibility

Every interactive element must be reachable and operable with keyboard alone.

Required checks:

```text
Tab reaches all controls in logical order
Shift+Tab works in reverse order
Enter/Space activate buttons
Escape closes dialogs, popovers, and transient panels
focus moves into opened dialogs
focus returns to the triggering control when dialogs close
no keyboard traps
focused content is not hidden behind sticky headers or overlays
```

### WCAG 2.2-specific interaction requirements

Build agents must account for WCAG 2.2 additions, especially:

```text
focus not obscured
dragging movements must have non-drag alternatives
pointer targets must be large enough or have adequate spacing
users must not re-enter the same information unnecessarily
authentication must not rely on cognitive-function tests alone
help/contact mechanisms must remain consistent where present
```

For micro-apps, use a minimum practical pointer target of:

```css
button,
[role="button"],
input,
select,
textarea,
.app-nav a {
  min-height: 44px;
}
```

### Color and contrast

All text must meet WCAG 2.2 Level AA contrast.

Required minimums:

```text
normal text: 4.5:1
large text: 3:1
meaningful UI components and graphical objects: 3:1
focus indicators: 3:1 against adjacent colors
```

Never convey status by color alone. Pair color with text, icon, shape, or label.

Bad:

```html
<span class="app-status app-status--red"></span>
```

Good:

```html
<span class="app-status" data-status="error">Error</span>
```

### Forms

Every form control must have:

```text
visible label
programmatic label
help text where needed
clear error message
error association with aria-describedby
required state indicated in text and code
```

Example:

```html
<label for="case-number">
  Case number <span class="app-required" aria-hidden="true">*</span>
</label>
<input
  id="case-number"
  name="caseNumber"
  required
  aria-describedby="case-number-help case-number-error"
>
<p id="case-number-help" class="app-help-text">Use the assigned case number.</p>
<p id="case-number-error" class="app-error" hidden>Enter a case number.</p>
```

Do not use placeholder text as the only label.

### Tables

For data tables:

```text
use caption when helpful
use th scope="col"
use th scope="row" where applicable
avoid nested interactive controls where possible
provide accessible names for row actions
support horizontal scrolling on small screens
```

Example:

```html
<div class="app-table-wrap">
  <table>
    <caption>Open review items</caption>
    <thead>
      <tr>
        <th scope="col">Item</th>
        <th scope="col">Status</th>
        <th scope="col">Assigned to</th>
        <th scope="col">Action</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">Broken link review</th>
        <td><span class="app-status" data-status="open">Open</span></td>
        <td>Unassigned</td>
        <td><button type="button">Review broken link item</button></td>
      </tr>
    </tbody>
  </table>
</div>
```

### Dialogs and modals

Use the native `<dialog>` element where possible.

Requirements:

```text
provide accessible title
move focus into dialog when opened
trap focus only while modal is open
close on Escape
return focus to opener
do not obscure focused controls
```

### Motion and animation

Respect reduced motion.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
  }
}
```

Do not use flashing content.

### Language and readability

Set document language:

```html
<html lang="en">
```

Use plain, task-focused text.

Button text must describe the action:

Bad:

```text
Submit
Click here
OK
```

Better:

```text
Save review
Export CSV
Delete draft
Apply filters
```

### Images and icons

All meaningful images need useful `alt` text.

Decorative images must use:

```html
alt=""
```

Icon-only buttons must have accessible names:

```html
<button type="button" aria-label="Delete record">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>
```

### Status messages

Dynamic messages must be announced to assistive technology.

Use:

```html
<div id="app-status-message" role="status" aria-live="polite"></div>
```

For errors requiring immediate attention:

```html
<div role="alert"></div>
```

Do not overuse `role="alert"`.

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

## Standard AI Code Agent prompt

Use this prompt when asking AI coding agents to build a County micro-app:

```text
Build this as a County of Marin micro-app.

Use semantic HTML, Pico.css, shared/app-brand.css, and vanilla JavaScript. Use Alpine.js only if it materially simplifies repetitive DOM state. Use Dexie.js only if the app needs IndexedDB-backed record storage.

Branding must be derived from www.marincounty.gov and the County of Marin identity guidance. Use the approved County logo asset if available. Do not recreate or alter the logo. Use County palette tokens from app-brand.css. Maintain a County-style app shell with skip link, official County identifier, app title, main landmark, and footer.

Use Jost for heading fonts from a local bundled font file with accessible sans-serif fallbacks, and always include a user-facing fixed top-right light/dark mode toggle represented by accessible SVG sun/moon icons.

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
The app has a user-facing fixed top-right light/dark mode toggle represented by accessible SVG sun/moon icons.
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
The footer identifies County of Marin and includes accessibility/help language.
Local data has export/import if meaningful.
```
