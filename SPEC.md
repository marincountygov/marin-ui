# Spec: Marin UI

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

Use sentence case for headings, labels, navigation, metadata, and status text. Do not use CSS text transformation to force interface text into all caps. Preserve standard capitalization for acronyms and official names.

## Required app shell

Every micro-app must include:

```text
skip link
MarinOS banner linking to the directory
app title
main landmark
text-only MarinOS footer
visible focus styles
color mode that follows the user's operating-system preference through `prefers-color-scheme`
text-only Feedback button
```

Use this shell unless the user asks for something materially different:

```html
<head>
  ...
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='10' fill='%23000'/%3E%3Cg fill='none' stroke='%23e5b53b' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='9' y='9' width='12' height='12' rx='2'/%3E%3Crect x='27' y='9' width='12' height='12' rx='2'/%3E%3Crect x='9' y='27' width='12' height='12' rx='2'/%3E%3Crect x='27' y='27' width='12' height='12' rx='2'/%3E%3C/g%3E%3C/svg%3E">
</head>
<body>
  <a class="skip-link" href="#main">Skip to main content</a>

  <div class="marinos-banner">
    <div class="marinos-banner__inner">
      <div class="menu marinos-menu">
        <button type="button" class="menu-toggle marinos-menu__toggle" aria-expanded="false" aria-controls="marinos-menu-panel">
          <span class="marinos-banner__icon" aria-hidden="true">
            <svg viewBox="0 0 48 48"><rect x="7" y="7" width="13" height="13" rx="2"/><rect x="28" y="7" width="13" height="13" rx="2"/><rect x="7" y="28" width="13" height="13" rx="2"/><rect x="28" y="28" width="13" height="13" rx="2"/></svg>
          </span>
          MarinOS<sup>ALPHA</sup>
          <svg class="menu-toggle__caret" aria-hidden="true" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg>
        </button>
        <div id="marinos-menu-panel" class="menu-panel marinos-menu__panel" hidden>
          <a href="https://marincountygov.github.io/marinmagic/"><span class="marinos-menu__icon" aria-hidden="true"><!-- app icon --></span>MarinMagic</a>
          <a href="https://marincountygov.github.io/marinwaymaker/"><span class="marinos-menu__icon" aria-hidden="true"><!-- app icon --></span>Marin WayMaker</a>
          <a href="https://marincountygov.github.io/marindocs/"><span class="marinos-menu__icon" aria-hidden="true"><!-- app icon --></span>MarinDocs</a>
          <a class="marinos-menu__all" href="https://marincountygov.github.io/marinos/">Browse all in MarinOS</a>
        </div>
      </div>
    </div>
  </div>

  <header class="app-header" role="banner">
    <div class="app-header__inner">
      <div class="app-identity">
        <div class="app-title-row">
          <span class="app-icon" aria-hidden="true">
            <!-- simple product icon SVG -->
          </span>
          <div class="app-title-copy">
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
    <div class="app-footer__inner"><a href="https://marincountygov.github.io/marinos/">MarinOS</a></div>
  </footer>

  <a class="app-feedback" href="APPROVED_FEEDBACK_URL" target="_blank" rel="noreferrer">Feedback</a>

  <script src="./shared/app-shell.js"></script>
  <script src="./app.js"></script>
</body>
```

Use a simple, meaningful inline SVG icon in the header. Treat it as decorative with `aria-hidden="true"` because the adjacent app title supplies the accessible name. Do not use an app logotype block.

The MarinOS banner uses the shared MarinOS icon (the four-square mark shown above) inline before the word "MarinOS", colored with `currentColor` so it always matches the banner text. Use the same mark as the site favicon via the inline SVG data URI shown in the shell example above; do not add a separate `.ico` or PNG favicon file. The banner currently carries an `<sup>ALPHA</sup>` release marker; remove it only when the program formally exits alpha status.

The banner control is a click-to-open dropdown (the `.menu` component described below), not a plain link. Clicking "MarinOS" opens a small panel listing every current MarinOS app and docs product with its icon, plus a "Browse all in MarinOS" link to the full directory. Keep this list in sync with `marinos/catalog.json` and `marinos/index.html` when a product is added or retired.

### The `.menu` disclosure component

`.menu` / `.menu-toggle` / `.menu-panel` is the shared pattern for any click-to-open dropdown: the MarinOS banner above, and grouped document actions (Share, Download) described in the accessibility section below. It is a disclosure pattern (a toggle button plus a hidden panel), not a full ARIA `menu`/`menuitem` widget — that keeps keyboard support simple (Tab reaches the toggle and, once open, the panel's real links/buttons in order; Escape closes and returns focus to the toggle) and avoids the roving-tabindex and arrow-key requirements that `role="menu"` would demand.

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
```

Directory cards place a meaningful icon before their content and make the card's `h3` text the destination link. Do not add a second “Open …” link.

Documentation pages add hover/focus anchor links to content headings and use `aria-current="location"` to highlight the section currently in view in the “On this page” navigation.

## Shared CSS implementation

`shared/app-brand.css` is the executable source of truth. Do not copy a second CSS implementation into this specification. Consumers must vendor the complete versioned bundle and record the installed release in `BRAND_VERSION`.

The shared CSS must include OS-controlled light and dark tokens, the MarinOS banner, icon/title treatment, gold title-copy border, cards, text-only feedback button, Docs heading anchors, active table-of-contents state, responsive behavior, print behavior, visible focus, and reduced-motion handling.

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

Write card, list, and page descriptions (the short body text under a title, and `<meta name="description">`) as one sentence in plain language at roughly a 9th-grade reading level: short sentence, common words, no jargon, acronyms, or internal system names the reader wouldn't already know. Do not restate the title or pad the sentence with filler like "This page describes...".

Write every heading — page titles (`h1`), section and document headings (`h2`, `h3`, ...), card and directory-entry titles (`.card h2`, `.app-card h3`) — in AP-style sentence case. This applies to the whole heading hierarchy of a page, not just card titles: a document's `h1`, its `h2` section headings, and any `h3` step or sub-item headings underneath all follow the same rule.

- Use sentence case, not title case.
- Capitalize the first word and proper nouns.
- Capitalize acronyms and official names according to their standard usage.
- Do not capitalize ordinary words merely because they appear in a heading.
- Do not end headings with a period.
- Keep headings concise and descriptive.
- Apply the same capitalization rules at every heading level.

```text
Good: County services and programs
Good: How to apply for a permit
Good: Working with Marin County departments
Good: ADA accessibility requirements
Good: Next steps
Bad:  County Services and Programs
Bad:  How to Apply for a Permit
Bad:  Working With Marin County Departments
Bad:  Next Steps
Bad:  COUNTY SERVICES AND PROGRAMS (all caps)
```

If a document's headings are also used as node/section titles in another view of the same content (for example, a Flow view built from the same source data), keep that title text in sync with the heading — don't let one view show one capitalization style and another show a different one for what's meant to be the same title.

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
Directory card titles are the links; duplicate “Open” links are absent.
WAVE testing is run from an HTTP URL, or local-file access is enabled for the extension.
Local data has export/import if meaningful.
```

## WAVE browser-extension testing

Prefer testing a locally served HTTP URL such as `http://localhost:8000/` instead of opening the page with `file://`. If a local file must be tested, enable local-page access for the WAVE extension in Firefox's extension settings. A page that stays gray after WAVE is selected usually indicates that the extension cannot evaluate the local page, not that the site intentionally added an overlay.

Do not claim that a page “passes WAVE.” Record automated findings and complete keyboard, zoom/reflow, contrast, and assistive-technology checks separately.
