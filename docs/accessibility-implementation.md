# Accessibility implementation

> The underlying *requirements* below are canonically defined in [marin-digital-standards/accessibility](https://github.com/marincountygov/marin-digital-standards/tree/main/accessibility) (mapped to WCAG 2.2 success criteria). What follows here is the corresponding **implementation** — the actual markup, CSS, and JS patterns Marin UI provides to satisfy those requirements. If the two ever disagree, `marin-digital-standards` is the source of truth for what's required; this document is the source of truth for how Marin UI currently implements it.

All generated apps must conform to WCAG 2.2 Level AA. This is not optional. Treat accessibility as an implementation requirement, not a cleanup task.

Build agents must satisfy these requirements:

## Structure and semantics

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

## Keyboard accessibility

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

## WCAG 2.2-specific interaction requirements

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

## Color and contrast

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

## Forms

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

## Tables

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

## Dialogs and modals

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

## Motion and animation

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

## Language and readability

Set document language:

```html
<html lang="en">
```

Use plain, task-focused text.

Heading case and card/page description rules are canonical in [marin-digital-standards/content-design/interface-writing.md](https://github.com/marincountygov/marin-digital-standards/blob/main/content-design/interface-writing.md) — AP-style sentence case at every heading level, one plain-language description sentence per card/page. This content moved out of marin-ui since it's a content-design rule, not a frontend implementation detail; apply it the same way regardless of what's rendering the heading.

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

## Images and icons

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

## Status messages

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

## WAVE browser-extension testing

Prefer testing a locally served HTTP URL such as `http://localhost:8000/` instead of opening the page with `file://`. If a local file must be tested, enable local-page access for the WAVE extension in Firefox's extension settings. A page that stays gray after WAVE is selected usually indicates that the extension cannot evaluate the local page, not that the site intentionally added an overlay.

Do not claim that a page "passes WAVE." Record automated findings and complete keyboard, zoom/reflow, contrast, and assistive-technology checks separately.
