# Foundations

Color and typography implementation. The official brand values these tokens implement are canonical in [marin-digital-standards/brand](https://github.com/marincountygov/marin-digital-standards/tree/main/brand) — this document is how Marin UI turns those values into usable CSS custom properties, not a second copy of the brand standard.

## Branding source of truth

Branding must be derived from the public County of Marin website and official County identity guidance. The logo hierarchy, non-negotiable rules (never recreate/distort/redraw/recolor), and light/dark variant selection are canonical in [marin-digital-standards/brand/logo.md](https://github.com/marincountygov/marin-digital-standards/blob/main/brand/logo.md), including the official logo source file location — this section doesn't restate them.

Identify the app as an official County of Marin tool, with a County-style header and footer.

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

Heading and interface-copy case (sentence case, no forced all-caps) is canonical in [marin-digital-standards/content-design/interface-writing.md](https://github.com/marincountygov/marin-digital-standards/blob/main/content-design/interface-writing.md) — see that document rather than this one.
