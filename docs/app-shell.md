# App shell

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

The banner control is a click-to-open dropdown (the `.menu` component — see `components.md`), not a plain link. Clicking "MarinOS" opens a small panel listing every current MarinOS app and docs product with its icon, plus a "Browse all in MarinOS" link to the full directory. Keep this list in sync with `marinos/catalog.json` and `marinos/index.html` when a product is added or retired.
