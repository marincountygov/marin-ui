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
          <a href="https://marincountygov.github.io/marin-magic/"><span class="marinos-menu__icon" aria-hidden="true"><!-- app icon --></span>MarinMagic</a>
          <a href="https://marincountygov.github.io/marin-waymaker/"><span class="marinos-menu__icon" aria-hidden="true"><!-- app icon --></span>Marin WayMaker</a>
          <a href="https://marincountygov.github.io/marin-docs/"><span class="marinos-menu__icon" aria-hidden="true"><!-- app icon --></span>MarinDocs</a>
          <a class="marinos-menu__all" href="https://marincountygov.github.io/marin-os/">Browse all in MarinOS</a>
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
    <div class="app-footer__inner"><a href="https://marincountygov.github.io/marin-os/">MarinOS</a></div>
  </footer>

  <a class="app-feedback" href="APPROVED_FEEDBACK_URL" target="_blank" rel="noreferrer">Feedback</a>

  <script src="./shared/app-shell.js"></script>
  <script src="./app.js"></script>
</body>
```

Use a simple, meaningful inline SVG icon in the header. Treat it as decorative with `aria-hidden="true"` because the adjacent app title supplies the accessible name. Do not use an app logotype block.

The MarinOS banner uses the shared MarinOS icon (the four-square mark shown above) inline before the word "MarinOS", colored with `currentColor` so it always matches the banner text. Use the same mark as the site favicon via the inline SVG data URI shown in the shell example above; do not add a separate `.ico` or PNG favicon file. The banner currently carries an `<sup>ALPHA</sup>` release marker; remove it only when the program formally exits alpha status.

The banner control is a click-to-open dropdown (the `.menu` component — see `components.md`), not a plain link. Clicking "MarinOS" opens a small panel listing every current MarinOS app and docs product with its icon, plus a "Browse all in MarinOS" link to the full directory. Keep this list in sync with `marinos/catalog.json` and `marinos/index.html` when a product is added or retired.

## Docs shell

A document or reference page (a documentation collection, a lookup/reference tool) uses a lighter header than the App shell above — a breadcrumb instead of an icon/title/subtitle identity block — plus a title/description/updated-date/actions area that the App shell doesn't need. Use `templates/docs/index.html` as the starting point:

```html
<header class="site-header">
  <div class="header-inner">
    <span class="docs-brand-icon" aria-hidden="true"><!-- product icon SVG --></span>
    <nav class="breadcrumb-nav" aria-label="Breadcrumb"><a href="../index.html">Collection</a> <span aria-hidden="true">/</span> Document title</nav>
  </div>
</header>
<main id="main" class="page" tabindex="-1">
  <div class="docs-layout">
    <article class="content">
      <h1 class="doc-title">Document title</h1>
      <p class="doc-description">One-sentence, plain-language description.</p>
      <p class="doc-updated">Updated August 13, 2026</p>
      <div class="doc-actions">
        <div class="menu">
          <button type="button" class="doc-action menu-toggle" aria-expanded="false" aria-controls="share-menu-panel">Share<svg class="menu-toggle__caret" aria-hidden="true" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg></button>
          <div id="share-menu-panel" class="menu-panel" hidden><button type="button" data-action="share">Copy link</button></div>
        </div>
        <span class="doc-action-status" role="status" aria-live="polite"></span>
      </div>
      <section class="section" id="overview"><h2>Overview</h2><p>...</p></section>
    </article>
    <aside class="toc" aria-label="On this page"><h2>On this page</h2><ul><li><a href="#overview">Overview</a></li></ul></aside>
  </div>
</main>
<footer class="site-footer" role="contentinfo"><div class="footer-inner"><a href="https://marincountygov.github.io/marin-os/">MarinOS</a></div></footer>
```

`app-shell.js` wires the Share button (`[data-action="share"]`, copies the current URL, reports through the nearest `.doc-actions .doc-action-status`), the "On this page" active-section tracking (`.toc`, same behavior as `.docs-toc`), and heading anchors (`.content`, same as `.docs-content`) generically — no per-page JavaScript needed for any of that.

This pair (`.site-header`/`.site-footer`/`.doc-title`/`.doc-description`/`.toc`) is a second, real-usage-validated Docs shell variant, kept alongside the original `.app-header`-based one (`.docs-breadcrumb`/`.docs-content`/`.docs-description`/`.docs-toc`) rather than replacing it — both are documented shared patterns; `.content`, `.section`, and `.details` are styled identically to their `docs-`-prefixed counterparts so either naming works, but `.toc`'s sticky offset is tuned for the shorter `.site-header` specifically and isn't interchangeable with `.docs-toc`. Prefer the `.site-header` pair for a new document/reference page — it's the one actual MarinOS documentation products use.

Keep the "Updated" date accurate to real edit history, not a value typed once — see `marindocs`'s or `marin-expense`'s `scripts/stamp-updated-dates.js` for the mechanism; `marin-ui` doesn't own that script since it depends on each consumer's own content process.
