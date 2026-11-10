(() => {
  // Local QA convenience, used by everything below that otherwise points at
  // MarinOS's production site: a link followed (or a fetch made) while
  // testing locally should land on the local marin-os dev server, not the
  // real deployed one, which can never reflect an uncommitted local change
  // by definition. Only true on localhost/127.0.0.1 — never for a real
  // visitor on a deployed site. Port matches this project's own established
  // local-dev convention for marin-os (see its AGENTS.md / README).
  const isLocalDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const MARINOS_HOMEPAGE_URL = isLocalDev ? "http://localhost:8935/" : "https://marincountygov.github.io/marin-os/";

  // Rewrites any static link pointed at the MarinOS homepage (the footer's
  // "MarinOS" link, bare, and its "Status" link, which points at
  // .../marin-os/#status) the same way — plain DOM rewriting, not a build
  // step, since these apps have none. Prefix match so it catches both the
  // bare URL and any #-suffixed one without needing a separate rule per
  // suffix. Does nothing in production, where the href is already correct.
  const MARINOS_PROD_BASE = "https://marincountygov.github.io/marin-os/";
  if (isLocalDev) {
    document.querySelectorAll(`a[href^="${MARINOS_PROD_BASE}"]`).forEach((link) => {
      link.href = link.getAttribute("href").replace(MARINOS_PROD_BASE, MARINOS_HOMEPAGE_URL);
    });
  }

  const menuToggle = document.querySelector("#menu-toggle");
  const navigation = document.querySelector("#app-nav");
  const menuQuery = window.matchMedia("(max-width: 720px)");

  function closeMenu() {
    menuToggle?.setAttribute("aria-expanded", "false");
    navigation?.removeAttribute("data-open");
  }

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(open));
      navigation.toggleAttribute("data-open", open);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement && menuQuery.matches) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        closeMenu();
        menuToggle.focus();
      }
    });

    menuQuery.addEventListener("change", (event) => {
      if (!event.matches) closeMenu();
    });
  }

  document.querySelectorAll(".menu").forEach((menu) => {
    const toggle = menu.querySelector(":scope > .menu-toggle");
    const panel = menu.querySelector(":scope > .menu-panel");
    if (!toggle || !panel) return;

    function closeMenuPanel() {
      toggle.setAttribute("aria-expanded", "false");
      panel.hidden = true;
    }

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      document.querySelectorAll(".menu-toggle[aria-expanded='true']").forEach((otherToggle) => {
        if (otherToggle !== toggle) {
          otherToggle.setAttribute("aria-expanded", "false");
          otherToggle.closest(".menu")?.querySelector(":scope > .menu-panel")?.setAttribute("hidden", "");
        }
      });
      toggle.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
    });

    panel.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) closeMenuPanel();
    });

    document.addEventListener("click", (event) => {
      if (toggle.getAttribute("aria-expanded") === "true" && !menu.contains(event.target)) closeMenuPanel();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        closeMenuPanel();
        toggle.focus();
      }
    });
  });

  // MarinOS banner menu: refresh from marinos/catalog.json so a new app
  // shows up in every other app's banner automatically, instead of every
  // app's HTML needing a hand edit. Falls back to the page's static links —
  // never touches the DOM — if the fetch fails, times out, or the response
  // isn't shaped as expected. Cached in localStorage for a few hours so a
  // visit doesn't refetch the catalog on every page load.
  const marinosMenuPanel = document.querySelector("#marinos-menu-panel");
  if (marinosMenuPanel) {
    // Local QA convenience: on localhost, prefer a locally-running marin-os
    // dev server over the real production catalog (isLocalDev, defined at
    // the top of this file) — the production URL can never reflect an
    // uncommitted local edit (to catalog.json, or to this file), by
    // definition, which made every status-badge feature above impossible
    // to actually QA locally before this. Fails silently back to the
    // existing cache/static-fallback behavior below if nothing's listening
    // on that port — same as any other fetch failure here.
    const CATALOG_URL = isLocalDev
      ? "http://localhost:8935/catalog.json"
      : "https://marincountygov.github.io/marin-os/catalog.json";
    // Bump this whenever the expected catalog shape or rendering changes
    // (for example, adding the `icon` field) so browsers holding an older
    // cached shape refetch immediately instead of waiting out the TTL.
    const CACHE_KEY = "marinos-catalog-cache-v2";
    const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

    function readCatalogCache() {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed.entries) || typeof parsed.fetchedAt !== "number") return null;
        if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
        return parsed.entries;
      } catch {
        return null;
      }
    }

    function writeCatalogCache(entries) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ entries, fetchedAt: Date.now() }));
      } catch {
        // Storage full or unavailable — refetching next load is fine.
      }
    }

    // Same labels/enum as marin-os's #status page — kept here too since
    // this menu has no shared JS module to import them from (vendored as a
    // plain script, not a module system).
    const MARINOS_STATUS_LABELS = { alpha: "Alpha", beta: "Beta", live: "Live" };

    function renderMarinosMenu(entries) {
      if (!Array.isArray(entries)) return;
      const current = window.location.href;
      const items = entries.filter((entry) => entry && entry.url && entry.name && !current.startsWith(entry.url));
      if (!items.length) return;

      const allLink = marinosMenuPanel.querySelector(".marinos-menu__all");
      marinosMenuPanel.querySelectorAll("a:not(.marinos-menu__all)").forEach((link) => link.remove());
      const links = items
        .map((entry) => {
          const icon =
            entry.icon && entry.icon.viewBox && entry.icon.markup
              ? `<span class="marinos-menu__icon" aria-hidden="true"><svg viewBox="${entry.icon.viewBox}">${entry.icon.markup}</svg></span>`
              : "";
          // Same .app-status badge every other status display uses — entries
          // from before this field's enum existed (or a fetch that races an
          // older cached shape) may have no recognized status; omit the
          // badge entirely rather than show a blank or wrong one.
          const label = MARINOS_STATUS_LABELS[entry.status];
          const badge = label
            ? `<span class="app-status marinos-menu__status" data-status="${entry.status}">${label}</span>`
            : "";
          return `<a href="${entry.url}">${icon}<span class="marinos-menu__name">${entry.name}</span>${badge}</a>`;
        })
        .join("");
      if (allLink) allLink.insertAdjacentHTML("beforebegin", links);
      else marinosMenuPanel.insertAdjacentHTML("beforeend", links);
    }

    // Same idea as the menu above, but for this page's own app title — "this
    // app is Beta" is exactly as useful to show as "here's what else is
    // Beta." Reuses the same fetched entries (no second request) and the
    // same labels; finds "self" the same way the menu excludes it (the
    // current URL starting with an entry's url). Idempotent: removes any
    // badge it previously added before adding the current one, so the
    // stale-while-revalidate re-render below doesn't stack a second badge
    // next to the first. No match (an app not in the catalog, e.g. MarinOS
    // itself) or no recognized status quietly renders nothing.
    function renderOwnStatusBadge(entries) {
      const titleEl = document.querySelector(".app-title");
      if (!titleEl || !Array.isArray(entries)) return;
      // Prefer <body data-app-id="..."> (matches catalog.json's own id
      // field) over comparing production URLs — a URL comparison can never
      // match when testing locally (http://localhost:PORT/ never starts
      // with https://marincountygov.github.io/<repo>/, even once deployed
      // for real), so local testing of this exact feature was silently
      // impossible before this. Falls back to the URL comparison for any
      // app that hasn't added the data-app-id marker yet.
      const appId = document.body.dataset.appId;
      const current = window.location.href;
      const self = appId
        ? entries.find((entry) => entry && entry.id === appId)
        : entries.find((entry) => entry && entry.url && current.startsWith(entry.url));
      const label = self && MARINOS_STATUS_LABELS[self.status];
      // Not in the catalog (MarinOS itself — it doesn't list itself) or no
      // recognized status: leave whatever's already there alone, same as
      // the menu leaving static fallback links alone on failure. In
      // particular, this must NOT remove a badge some other, non-generic
      // markup put there (MarinOS's own index.html hardcodes its own,
      // since it has no catalog entry for this mechanism to find) — only
      // ever touch a badge this same function added, scoped by its own
      // .app-title__status class, not the bare .app-status one.
      if (!label) return;
      const existing = titleEl.querySelector(".app-title__status");
      if (existing) existing.remove();
      // Links to MarinOS's #status section (MARINOS_HOMEPAGE_URL, defined
      // at the top of this file — the local dev server when testing
      // locally), where Alpha/Beta/Live are explained.
      titleEl.insertAdjacentHTML(
        "beforeend",
        ` <a class="app-status app-title__status" href="${MARINOS_HOMEPAGE_URL}#status" data-status="${self.status}">${label}</a>`
      );
    }

    // Stale-while-revalidate: the cache is only for instant paint on repeat
    // visits, never for skipping the network. Always fetch fresh in the
    // background and re-render if it differs, so a catalog.json fix reaches
    // a returning visitor on the next load instead of up to CACHE_TTL_MS
    // later — a stale-icon report once took hours to explain because of
    // this cache, before it revalidated on every load like this.
    const cachedEntries = readCatalogCache();
    if (cachedEntries) {
      renderMarinosMenu(cachedEntries);
      renderOwnStatusBadge(cachedEntries);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    fetch(CATALOG_URL, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("bad response"))))
      .then((entries) => {
        writeCatalogCache(entries);
        if (JSON.stringify(entries) !== JSON.stringify(cachedEntries)) {
          renderMarinosMenu(entries);
          renderOwnStatusBadge(entries);
        }
      })
      .catch(() => {
        // Leave whatever's already rendered (cache or static banner links) as-is.
      })
      .finally(() => clearTimeout(timeout));
  }

  const documentHeadings = document.querySelectorAll(
    ".docs-content h2, .docs-content h3, .docs-content h4, .content h2, .content h3, .content h4"
  );

  const claimedHeadingIds = new Set(Array.from(document.querySelectorAll("[id]"), (element) => element.id));

  function headingTargetId(heading) {
    if (heading.id) return heading.id;

    const section = heading.closest("section[id]");
    if (section && section.querySelector(":scope > h2, :scope > h3, :scope > h4") === heading) {
      return section.id;
    }

    const base = heading.textContent
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "section";
    let id = base;
    let suffix = 2;
    while (claimedHeadingIds.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }
    heading.id = id;
    claimedHeadingIds.add(id);
    return id;
  }

  documentHeadings.forEach((heading) => {
    if (heading.querySelector(".heading-anchor")) return;
    const targetId = headingTargetId(heading);

    const anchor = document.createElement("a");
    anchor.className = "heading-anchor";
    anchor.href = `#${targetId}`;
    anchor.setAttribute("aria-label", `Link to ${heading.textContent.trim()}`);
    anchor.textContent = "#";
    heading.append(" ", anchor);
  });

  // "On this page" table of contents: every .docs-toc / .toc marks the link for the
  // section being read with aria-current="location" (CSS makes it bold and accent
  // blue). The current section is the last one whose top has scrolled past a line
  // near the top of the window; at the very bottom of the page the last section
  // counts, even when it is too short to reach that line. Set data-on-this-page-line
  // on the list to move the line. A page that adds its
  // table of contents after load calls window.marinOnThisPage(nav).
  function marinOnThisPage(toc) {
    if (!toc || toc.dataset.onThisPageReady) return;
    const items = Array.from(toc.querySelectorAll('a[href^="#"]'))
      .filter((link) => link.hash.length > 1)
      .map((link) => ({ link, target: document.getElementById(decodeURIComponent(link.hash.slice(1))) }))
      .filter((item) => item.target);
    if (!items.length) return;
    toc.dataset.onThisPageReady = "true";

    let scheduled = false;
    function update() {
      scheduled = false;
      // The reading line: a quarter of the way down the window by default, or the
      // pixel distance from the top set with data-on-this-page-line (a page of short
      // sections wants a line near the top so a section at the top is the current one).
      const line = Number(toc.dataset.onThisPageLine);
      const threshold = line > 0 ? line : Math.max(96, window.innerHeight * 0.28);
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current = items[0];
      items.forEach((item) => {
        if (item.target.offsetParent === null) return;
        if (item.target.getBoundingClientRect().top <= threshold) current = item;
      });
      if (atBottom) current = items[items.length - 1];
      items.forEach((item) => {
        if (item === current) item.link.setAttribute("aria-current", "location");
        else item.link.removeAttribute("aria-current");
      });
    }
    function schedule() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    // Stop listening when the page replaces this table of contents.
    const watcher = new MutationObserver(() => {
      if (!document.contains(toc)) {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        window.removeEventListener("hashchange", schedule);
        watcher.disconnect();
      }
    });
    watcher.observe(document.body, { childList: true, subtree: true });
    update();
  }
  window.marinOnThisPage = marinOnThisPage;
  document.querySelectorAll(".docs-toc, .toc").forEach(marinOnThisPage);

  // Sortable table columns: a <thead> button[data-sort-key="foo"] sorts the
  // tbody's rows by their data-sort-foo attribute. Rows don't need any JS
  // registration — this reads whatever data-sort-* attributes are present.
  document.querySelectorAll("table").forEach((table) => {
    const sortButtons = table.querySelectorAll("thead button[data-sort-key]");
    const tbody = table.querySelector(":scope > tbody");
    if (!sortButtons.length || !tbody) return;

    let activeKey = null;
    let direction = "ascending";

    function applySort(key) {
      direction = activeKey === key && direction === "ascending" ? "descending" : "ascending";
      activeKey = key;

      const rows = Array.from(tbody.children);
      rows.sort((a, b) => {
        const valueA = a.getAttribute(`data-sort-${key}`) ?? "";
        const valueB = b.getAttribute(`data-sort-${key}`) ?? "";
        const result = valueA.localeCompare(valueB, undefined, { numeric: true, sensitivity: "base" });
        return direction === "ascending" ? result : -result;
      });
      tbody.append(...rows);

      sortButtons.forEach((button) => {
        button.closest("th")?.setAttribute("aria-sort", button.dataset.sortKey === key ? direction : "none");
      });
    }

    sortButtons.forEach((button) => {
      button.addEventListener("click", () => applySort(button.dataset.sortKey));
    });
  });

  // Copy: the same helpers as the Marin App Shell (marinCopyRich, marinCopyText), so apps that load this
  // bundle alone get clean HTML on the clipboard with none of the page's fonts, sizes or bold weights.
  /** Put `html` and `text` on the clipboard through the browser's copy event. Nothing is rendered,
   * so no fonts, sizes, colors or bold weights from this page come along: a CMS pastes plain
   * <h2> and <li> and applies its own look. A text box holds the selection the browser needs to
   * fire the event (Safari and Firefox do not fire it with nothing selected). */
  function copyViaCopyEvent(html, text) {
    const holder = document.createElement("textarea");
    holder.value = text || " ";
    holder.setAttribute("readonly", "");
    holder.setAttribute("aria-hidden", "true");
    holder.tabIndex = -1;
    holder.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
    const previousFocus = document.activeElement;
    document.body.appendChild(holder);
    holder.select();
    const onCopy = (event) => {
      if (html != null) event.clipboardData.setData("text/html", html);
      event.clipboardData.setData("text/plain", text ?? "");
      event.preventDefault();
    };
    document.addEventListener("copy", onCopy, { once: true });
    let copied = false;
    try {
      // marin-shared-helpers: allow (this bundle's own implementation of the copy helper)
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    document.removeEventListener("copy", onCopy);
    document.body.removeChild(holder);
    if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    return copied;
  }

  /** Copy rich text: HTML for a visual editor, plain text for everything else. Tries the browser's
   * copy event first, because it puts exactly the HTML given on the clipboard (the asynchronous
   * Clipboard API sanitizes it, and an app found a title losing its link that way), then the
   * asynchronous Clipboard API. Resolves true when copied. */
  async function copyRich(text, html) {
    if (copyViaCopyEvent(html, text)) return true;
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      try {
        // marin-shared-helpers: allow (this bundle's own implementation of the copy helper)
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": new Blob([text], { type: "text/plain" }),
            "text/html": new Blob([html], { type: "text/html" }),
          }),
        ]);
        return true;
      } catch {
        // Neither route worked: the caller shows its manual-copy box.
      }
    }
    return false;
  }

  /** Copy plain text. Resolves true when copied. */
  async function copyText(text) {
    try {
      // marin-shared-helpers: allow (this bundle's own implementation of the copy helper)
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return copyViaCopyEvent(null, text);
    }
  }

  // Copy-to-clipboard: any button[data-copy-value] copies that value and
  // shows brief feedback. Announces through #app-status-message if present
  // (the standard app-shell live region), otherwise a page-supplied
  // [data-copy-status] live region, if either exists. A button that also
  // carries [data-copy-html] copies that richer formatting instead (falling
  // back to the plain data-copy-value text if the rich copy fails).
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-copy-value]");
    if (!button) return;
    const value = button.dataset.copyValue;
    const html = button.dataset.copyHtml;
    const status = document.querySelector("#app-status-message, [data-copy-status]");

    const onCopied = () => {
      button.classList.add("is-copied");
      clearTimeout(button.copyResetTimeout);
      button.copyResetTimeout = setTimeout(() => button.classList.remove("is-copied"), 1500);
      if (status) status.textContent = button.dataset.copyAnnounce || `Copied ${value}`;
    };
    const onFailed = () => {
      if (status) status.textContent = `Couldn't copy ${value} — copy it manually`;
    };

    if (html) {
      copyRich(value, html).then((copied) => {
        if (copied) onCopied();
        else copyText(value).then((plain) => (plain ? onCopied() : onFailed()));
      });
      return;
    }

    copyText(value).then((copied) => (copied ? onCopied() : onFailed()));
  });

  // Share: any button[data-action="share"] copies the current page URL and
  // reports through a sibling .doc-action-status inside the same
  // .doc-actions group, if present.
  document.querySelectorAll('[data-action="share"]').forEach((button) => {
    button.addEventListener("click", async () => {
      const status = button.closest(".doc-actions")?.querySelector(".doc-action-status") ?? null;
      const copied = await copyText(window.location.href);
      if (status) status.textContent = copied ? "Link copied" : "Couldn't copy — copy the address bar link instead";
    });
  });

  // Tabs: every [role="tablist"] gets the ARIA tabs keyboard pattern with no
  // per-page JavaScript — one tab in the Tab order at a time (the selected
  // one, or the first if none is selected), Left/Right (Up/Down when
  // aria-orientation="vertical") move between tabs and wrap, Home/End jump to
  // the first/last, and moving to a tab selects it (focus, then click(), so
  // the app's own click handling runs). The Tab-order sync follows
  // aria-selected, however an app sets it. An app that handles these keys
  // itself just calls preventDefault() on them and this stands down. Tablists
  // added after load get the arrow keys but not the Tab-order sync.
  function enabledTabs(tablist) {
    return Array.from(tablist.querySelectorAll('[role="tab"]')).filter(
      (tab) => !tab.disabled && tab.getAttribute("aria-disabled") !== "true"
    );
  }

  function syncTabStops(tablist) {
    const tabs = enabledTabs(tablist);
    if (!tabs.length) return;
    const stop = tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0];
    tabs.forEach((tab) => {
      tab.tabIndex = tab === stop ? 0 : -1;
    });
  }

  document.querySelectorAll('[role="tablist"]').forEach((tablist) => {
    syncTabStops(tablist);
    new MutationObserver(() => syncTabStops(tablist)).observe(tablist, {
      attributes: true,
      attributeFilter: ["aria-selected"],
      childList: true,
      subtree: true,
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const current = event.target instanceof Element ? event.target.closest('[role="tab"]') : null;
    const tablist = current && current.closest('[role="tablist"]');
    if (!tablist) return;
    const tabs = enabledTabs(tablist);
    const index = tabs.indexOf(current);
    if (index === -1) return;
    const vertical = tablist.getAttribute("aria-orientation") === "vertical";
    const forward = vertical ? "ArrowDown" : "ArrowRight";
    const back = vertical ? "ArrowUp" : "ArrowLeft";
    let next;
    if (event.key === forward) next = tabs[(index + 1) % tabs.length];
    else if (event.key === back) next = tabs[(index - 1 + tabs.length) % tabs.length];
    else if (event.key === "Home") next = tabs[0];
    else if (event.key === "End") next = tabs[tabs.length - 1];
    else return;
    event.preventDefault();
    next.focus();
    next.click();
  });

  // Collapsible filter panels: any button[data-filter-toggle] hides and shows the filter panel it controls
  // (aria-controls) inside its nearest .search-layout. No per-page JavaScript needed. The shell:
  //  - draws the Lucide panel-right-open icon while the panel is open and panel-left-open while it is hidden
  //    (unless the button already holds its own SVGs),
  //  - sets aria-expanded, data-open on the panel and data-filters ("open" or "closed") on the layout,
  //  - starts open on wide screens (unless the person hid it; the choice is remembered in this browser) and
  //    closed on screens up to 850px,
  //  - names the button "Filters" (or data-filter-label), plus ", N active" when the app keeps
  //    data-filter-active="N" on it, and dispatches a bubbling "marin-filters-change" event
  //    ({ detail: { open, button, panel } }) so an app can resize anything sized by the results (a map).
  // The button has no visible text, so its name is the label.
  const filterToggles = document.querySelectorAll("button[data-filter-toggle]");
  if (filterToggles.length) {
    const narrowFilters = window.matchMedia("(max-width: 850px)");
    const SVG_NS = "http://www.w3.org/2000/svg";
    const FILTER_ICONS = {
      open: ["rect:18:18:3:3:2", "M15 3v18", "m10 15-3-3 3-3"],
      closed: ["rect:18:18:3:3:2", "M9 3v18", "m14 9 3 3-3 3"],
    };

    function filterIcon(kind) {
      const svg = document.createElementNS(SVG_NS, "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("aria-hidden", "true");
      svg.dataset.filterIcon = kind;
      FILTER_ICONS[kind].forEach((part) => {
        if (part.startsWith("rect:")) {
          const [, width, height, x, y, rx] = part.split(":");
          const rect = document.createElementNS(SVG_NS, "rect");
          Object.entries({ width, height, x, y, rx }).forEach(([name, value]) => rect.setAttribute(name, value));
          svg.append(rect);
        } else {
          const path = document.createElementNS(SVG_NS, "path");
          path.setAttribute("d", part);
          svg.append(path);
        }
      });
      return svg;
    }

    function filterStorageKey(button) {
      const app = document.body.dataset.appId || window.location.pathname;
      return `marinos.filters.${app}.${button.dataset.filterToggle || "filters"}`;
    }

    function savedFilterChoice(button) {
      try {
        return window.localStorage.getItem(filterStorageKey(button));
      } catch {
        return null;
      }
    }

    function setFilterPanel(button, open, remember) {
      const layout = button.closest(".search-layout");
      const panel = document.getElementById(button.getAttribute("aria-controls"));
      if (!layout || !panel) return;
      panel.dataset.open = String(open);
      layout.dataset.filters = open ? "open" : "closed";
      button.setAttribute("aria-expanded", String(open));
      button.querySelector('[data-filter-icon="open"]')?.toggleAttribute("hidden", !open);
      button.querySelector('[data-filter-icon="closed"]')?.toggleAttribute("hidden", open);
      if (remember && !narrowFilters.matches) {
        try {
          window.localStorage.setItem(filterStorageKey(button), open ? "open" : "closed");
        } catch {
          // The choice is just not remembered.
        }
      }
      layout.dispatchEvent(new CustomEvent("marin-filters-change", { bubbles: true, detail: { open, button, panel } }));
    }

    function nameFilterToggle(button) {
      const count = Number(button.dataset.filterActive) || 0;
      const base = button.dataset.filterLabel || "Filters";
      const name = count ? `${base}, ${count} active` : base;
      button.setAttribute("aria-label", name);
      button.title = name;
    }

    function applyFilterDefaults() {
      filterToggles.forEach((button) => {
        setFilterPanel(button, !narrowFilters.matches && savedFilterChoice(button) !== "closed", false);
      });
    }

    const filterNames = new MutationObserver((records) => records.forEach((record) => nameFilterToggle(record.target)));
    filterToggles.forEach((button) => {
      if (!button.querySelector("svg")) button.append(filterIcon("open"), filterIcon("closed"));
      nameFilterToggle(button);
      filterNames.observe(button, { attributes: true, attributeFilter: ["data-filter-active", "data-filter-label"] });
      button.addEventListener("click", () => {
        const panel = document.getElementById(button.getAttribute("aria-controls"));
        if (panel) setFilterPanel(button, panel.dataset.open !== "true", true);
      });
    });
    narrowFilters.addEventListener("change", applyFilterDefaults);
    applyFilterDefaults();
  }

  // Tab sections: elements sharing a data-tab-section="name" show together,
  // hidden unless "name" matches the current hash — everything else in the
  // group stays hidden, so a page reads as one section at a time (Help shows
  // only Help, Updates shows only Updates) instead of stacking under
  // whatever's already showing. An unrecognized or empty hash falls back to
  // the first name encountered in the page, so there's no need for an
  // explicit "Home" tab pointing at the default. Pairs automatically with
  // any #app-nav whose links use matching #name hashes — no per-page
  // JavaScript needed.
  const tabSections = document.querySelectorAll("[data-tab-section]");
  if (tabSections.length) {
    const tabNames = [];
    tabSections.forEach((section) => {
      const name = section.dataset.tabSection;
      if (!tabNames.includes(name)) tabNames.push(name);
    });
    const tabNav = document.querySelector("#app-nav");

    function showTabFromHash() {
      const hash = window.location.hash.slice(1);
      // A hash that names an element inside a tab section opens that section
      // and scrolls to the element (for example #tech-marin-ui).
      const target = hash && !tabNames.includes(hash) ? document.getElementById(hash) : null;
      const owner = target ? target.closest("[data-tab-section]") : null;
      const activeName = tabNames.includes(hash) ? hash : owner ? owner.dataset.tabSection : tabNames[0];
      tabSections.forEach((section) => {
        section.hidden = section.dataset.tabSection !== activeName;
      });
      if (owner && !target.hasAttribute("data-subtab")) target.scrollIntoView();
      if (tabNav) {
        tabNav.querySelectorAll('a[href^="#"]').forEach((link) => {
          if (link.getAttribute("href") === `#${activeName}`) link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        });
      }
    }

    showTabFromHash();
    window.addEventListener("hashchange", showTabFromHash);
  }

  // Sub-tabs: a [data-subtabs] group inside a tab section holds a [data-subtabs-nav]
  // of links (#panel-id) and [data-subtab] panels. One panel shows at a time: the one
  // the hash names (or contains an element it names), else the first. The nav marks
  // the current link with aria-current, as #app-nav does. A hash on a panel opens its
  // tab section without scrolling to it, so the page stays at the tabs.
  document.querySelectorAll("[data-subtabs]").forEach((group) => {
    const panels = [...group.querySelectorAll("[data-subtab]")];
    const nav = group.querySelector("[data-subtabs-nav]");
    if (!panels.length) return;
    function showSubtab() {
      const target = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
      const owner = target ? target.closest("[data-subtab]") : null;
      const active = panels.includes(owner) ? owner : panels[0];
      panels.forEach((panel) => {
        panel.hidden = panel !== active;
      });
      if (nav) {
        nav.querySelectorAll('a[href^="#"]').forEach((link) => {
          const to = document.getElementById(link.getAttribute("href").slice(1));
          // A link to the tab section itself (not to a panel) is the first panel's.
          const current = to && panels.includes(to) ? to === active : active === panels[0];
          if (current) link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        });
      }
    }
    showSubtab();
    window.addEventListener("hashchange", showSubtab);
  });

  // Updates: any [data-updates-repo="repo"] section lazy-loads that repo's
  // 10 most recent commits from the GitHub API the first time it becomes
  // visible, and renders them into its own [data-updates-list]. Visibility
  // is detected by watching the section's `hidden` attribute, so it works
  // with whatever tab/hash-routing a page already has (or none, if the
  // section is never hidden) — no per-page JavaScript needed. A bare repo
  // name is assumed to be marincountygov/<repo>; pass "owner/repo" to
  // override. Add [data-app-name="App Name"] on the same section so the
  // status line reads "App Name release notes." once loaded, instead of the
  // generic "Latest commits loaded." — the single description the section
  // needs, not a separate static line plus a loading message.
  document.querySelectorAll("[data-updates-repo]").forEach((section) => {
    const repo = section.dataset.updatesRepo;
    const appName = section.dataset.appName;
    const loadedText = appName ? `${appName} release notes.` : "Latest commits loaded.";
    const status = section.querySelector("[data-updates-status]");
    const list = section.querySelector("[data-updates-list]");
    if (!repo || !list) return;

    const owner = repo.includes("/") ? repo : `marincountygov/${repo}`;
    // GitHub Pages project sites always serve at
    // https://marincountygov.github.io/<repo-name>/, never the org root —
    // strip the owner off "owner/repo" overrides to get the bare repo name.
    const repoName = repo.includes("/") ? repo.split("/")[1] : repo;
    const siteUrl = `https://marincountygov.github.io/${repoName}/`;
    const SPARKLE_EMOJI = "✨"; // ✨
    const POINT_RIGHT_EMOJI = "\u{1F449}"; // 👉
    let loaded = false;

    function escapeHtml(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    // Strips a leading Conventional Commits-style prefix ("fix:", "feat
    // (scope):", "chore:", etc.) and capitalizes what's left, so a title
    // like "fix: stale cache key" reads as "Stale cache key" instead of
    // exposing commit-message convention to a non-technical reader. This
    // is text cleanup, not real plain-language rewriting — a static page
    // has no way to genuinely rewrite arbitrary text at view time.
    const CONVENTIONAL_COMMIT_PREFIX = /^[a-z]+(\([^)]*\))?!?:\s*/i;
    function cleanTitle(rawTitle) {
      const stripped = rawTitle.replace(CONVENTIONAL_COMMIT_PREFIX, "");
      return stripped ? stripped[0].toUpperCase() + stripped.slice(1) : rawTitle;
    }

    async function loadUpdates() {
      if (loaded) return;
      if (status) status.textContent = "Loading latest commits...";
      list.innerHTML = "";
      try {
        // Fetch more than we display: merge-PR commits are filtered out
        // below (they're noise, not a real change), so 15 fetched usually
        // leaves close to 10 real ones to show.
        const response = await fetch(`https://api.github.com/repos/${owner}/commits?per_page=15`, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
        const commits = (await response.json()).filter(
          (commit) => !/^Merge pull request #\d+/.test(String(commit?.commit?.message ?? ""))
        );
        if (!Array.isArray(commits) || !commits.length) {
          if (status) status.textContent = "No recent commits found.";
          return;
        }
        loaded = true;
        if (status) status.textContent = loadedText;
        list.innerHTML = commits
          .slice(0, 10)
          .map((commit) => {
            const message = String(commit?.commit?.message ?? "").trim();
            const title = cleanTitle(message.split("\n")[0] || "Untitled commit");
            const rawBodyLines = message
              .split("\n")
              .slice(1)
              .map((line) => line.trim())
              .filter(Boolean);
            const commitDate = commit?.commit?.committer?.date ? new Date(commit.commit.committer.date) : null;
            const date = commitDate
              ? commitDate.toLocaleString([], {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "Date unavailable";
            // Kicker date, same granularity as this project's own news
            // digest header ("Marin Mentions — Sep 25, 2026") — no time,
            // since the kicker line is app + date, not this exact commit's
            // timestamp (that's what the date line under the title is for).
            const kickerDate = commitDate
              ? commitDate.toLocaleString([], { year: "numeric", month: "short", day: "numeric" })
              : "Date unavailable";
            const url = commit?.html_url || `https://github.com/${owner}/commits`;

            // A commit body is either a real bullet list (lines starting
            // with -/*) or a hard-wrapped prose paragraph (this project's
            // own commit convention). Treating every raw line as its own
            // bullet, regardless of style, chopped wrapped sentences into
            // fragments that read as unrelated bullet points — a real
            // bullet's own wrapped continuation line isn't a new item, and
            // a prose paragraph's hard-wrap points usually fall mid-
            // sentence, not at a real boundary. Either way the list should
            // end up one <li> per actual point: for real bullets, that's
            // the bullet itself (with continuation lines merged back in);
            // for prose, it's each full sentence, found by reflowing the
            // wrapped lines back into one block first.
            const hasBullets = rawBodyLines.some((line) => /^[-*]\s+/.test(line));
            const bodyItems = [];
            if (hasBullets) {
              for (const line of rawBodyLines) {
                if (/^[-*]\s+/.test(line)) bodyItems.push(line.replace(/^[-*]\s+/, ""));
                else if (bodyItems.length) bodyItems[bodyItems.length - 1] += ` ${line}`;
                else bodyItems.push(line);
              }
            } else if (rawBodyLines.length) {
              // Split after ./!/? only when followed by whitespace then a
              // capital letter, "(", or "`" — keeps abbreviations ("e.g."),
              // decimals/versions ("1.17.2"), and dotted names ("Node.js")
              // intact (no space follows their periods), while still
              // splitting on genuine sentence boundaries.
              rawBodyLines
                .join(" ")
                .split(/(?<=[.!?])\s+(?=[A-Z(`])/)
                .map((sentence) => sentence.trim())
                .filter(Boolean)
                .forEach((sentence) => bodyItems.push(sentence));
            }
            const body = bodyItems.length
              ? `<ul>${bodyItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
              : "";
            // A commit copied or shared on its own (e.g. pasted into a
            // Slack message) loses the page context that says which app
            // it's about, so the copied text/HTML carries an app-name +
            // date kicker and a link back to the app's own site —
            // copy-only, not shown on the page itself, where that context
            // is already given by the page around the card. The kicker
            // already carries the date, so the copy drops the separate
            // date line the rendered card still shows under the title.
            const kicker = appName ? `${SPARKLE_EMOJI} ${appName} updates — ${kickerDate}` : "";
            const kickerHtml = appName
              ? `${SPARKLE_EMOJI} <b>${escapeHtml(appName)} updates — <i>${escapeHtml(kickerDate)}</i></b>`
              : "";
            const visitText = appName ? `${POINT_RIGHT_EMOJI} Visit ${appName}` : "";
            // Title and the full body content, as plain text - no link
            // markup (the title is never a hyperlink in the copied text,
            // only in the rendered card). A blank line sets the kicker
            // apart from the update itself, which stays single-spaced
            // internally (title/items/visit line).
            const updateBlock = [title, ...bodyItems, visitText && `${visitText}: ${siteUrl}`]
              .filter(Boolean)
              .join("\n");
            const copyText = [kicker, updateBlock].filter(Boolean).join("\n\n");
            // Rich version of the same content, formatted the same way this
            // project's own news-item copy is (bold title, then the
            // content) — so a paste into email/docs keeps that formatting
            // instead of landing as flat text.
            const copyHtml =
              (kickerHtml ? `${kickerHtml}<br><br>` : "") +
              `<b>${escapeHtml(title)}</b>` +
              body +
              // <ul> is already a block element with its own spacing, so no
              // <br> is needed before the visit line when a body list is
              // present (that would double the gap) — only when there's no
              // body list to provide that break itself.
              (visitText
                ? `${bodyItems.length ? "" : "<br>"}${POINT_RIGHT_EMOJI} <b><a href="${escapeHtml(siteUrl)}">Visit ${escapeHtml(appName)}</a></b>`
                : "");
            return (
              `<article class="app-card">` +
              `<h3><a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(title)}</a></h3>` +
              `<p class="app-help-text">${escapeHtml(date)}</p>` +
              body +
              `<button type="button" class="copy-button" data-copy-value="${escapeHtml(copyText)}" data-copy-html="${escapeHtml(copyHtml)}" data-copy-announce="Update copied" aria-label="Copy this update">` +
              `<svg class="copy-icon" aria-hidden="true" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>` +
              `<svg class="copy-check-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>` +
              `Copy` +
              `</button>` +
              `</article>`
            );
          })
          .join("");
      } catch (error) {
        console.error(error);
        if (status) status.textContent = "Could not load updates right now.";
      }
    }

    if (!section.hidden) loadUpdates();

    new MutationObserver(() => {
      if (!section.hidden) loadUpdates();
    }).observe(section, { attributes: true, attributeFilter: ["hidden"] });
  });

  // Security: any [data-security-json="path"] section lazy-loads that path
  // (same-origin, same repo — unlike Updates, there's no cross-repo GitHub
  // API call needed) the first time it becomes visible, and renders its
  // security.json's publicSecurity block only — never the full document,
  // per marin-digital-standards/security/standard.md's public/internal
  // separation. An app with no security.json yet (fetch 404s) gets a plain
  // "not yet published" status instead of an error, since that's the
  // honest, expected state for most apps today.
  document.querySelectorAll("[data-security-json]").forEach((section) => {
    const jsonPath = section.dataset.securityJson;
    const status = section.querySelector("[data-security-status]");
    const content = section.querySelector("[data-security-content]");
    if (!jsonPath || !status || !content) return;

    let loaded = false;

    function escapeHtml(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    const PROFILE_LABELS = {
      "public-web": "Public web application",
      "public-api": "Public API",
      authenticated: "Authenticated application",
      internal: "For County staff",
      custom: "Custom",
    };

    async function loadSecurity() {
      if (loaded) return;
      status.textContent = "Loading security information...";
      try {
        const response = await fetch(jsonPath, { cache: "no-store" });
        if (response.status === 404) {
          loaded = true;
          status.textContent = "No security information has been published for this application yet.";
          return;
        }
        if (!response.ok) throw new Error(`security.json fetch failed: ${response.status}`);
        const config = await response.json();
        const pub = config?.publicSecurity;
        loaded = true;
        if (!pub) {
          status.textContent = "This application's security.json has no public security summary yet.";
          return;
        }
        const profileLabel = pub.profile || PROFILE_LABELS[config.profile] || "Not set";
        status.textContent = pub.lastReviewed ? `Last reviewed ${escapeHtml(pub.lastReviewed)}.` : "Review date not recorded.";
        const controlsHtml =
          Array.isArray(pub.controls) && pub.controls.length
            ? `<ul>${pub.controls.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
            : "<p>No controls listed yet.</p>";
        const dataEntries = pub.data && typeof pub.data === "object" ? Object.entries(pub.data) : [];
        const dataHtml = dataEntries.length
          ? `<ul>${dataEntries
              .map(([key, value]) => `<li>${escapeHtml(key)}: ${escapeHtml(String(value))}</li>`)
              .join("")}</ul>`
          : "";
        content.innerHTML =
          `<p><b>Security profile:</b> ${escapeHtml(profileLabel)}</p>` +
          `<h4>Security controls</h4>${controlsHtml}` +
          (dataHtml ? `<h4>Data</h4>${dataHtml}` : "");
      } catch (error) {
        loaded = true;
        console.error(error);
        status.textContent = "Couldn't load security information right now.";
      }
    }

    if (!section.hidden) loadSecurity();

    new MutationObserver(() => {
      if (!section.hidden) loadSecurity();
    }).observe(section, { attributes: true, attributeFilter: ["hidden"] });
  });
  // Builds an accessibility score gauge (see .app-score in app-brand.css) for
  // an integer 0-100 Lighthouse score: a ring, the number, and the band word.
  // Bands match Lighthouse's own. Exposed as window.marinScoreGauge so other
  // scripts (marin-os's score table) draw the identical component.
  function marinScoreGauge(score, { large = false } = {}) {
    const value = Math.max(0, Math.min(100, Math.round(Number(score))));
    const band = value >= 90 ? "good" : value >= 50 ? "needs-improvement" : "poor";
    const label = { good: "Good", "needs-improvement": "Needs improvement", poor: "Poor" }[band];
    const SVG = "http://www.w3.org/2000/svg";
    const svgEl = (name, attrs) => {
      const el = document.createElementNS(SVG, name);
      Object.entries(attrs).forEach(([key, val]) => el.setAttribute(key, val));
      return el;
    };

    const wrapper = document.createElement("span");
    wrapper.className = `app-score${large ? " app-score--large" : ""}`;
    wrapper.dataset.band = band;

    // r = 100 / (2 * PI), so the circumference is exactly 100 and the arc's
    // dash length is simply the score.
    const ring = svgEl("svg", { class: "app-score__ring", viewBox: "0 0 36 36", "aria-hidden": "true", focusable: "false" });
    ring.append(
      svgEl("circle", { class: "app-score__track", cx: 18, cy: 18, r: 15.9155 }),
      svgEl("circle", {
        class: "app-score__arc",
        cx: 18,
        cy: 18,
        r: 15.9155,
        transform: "rotate(-90 18 18)",
        "stroke-dasharray": `${value} 100`,
      })
    );
    const number = svgEl("text", { class: "app-score__number", x: 18, y: 18 });
    number.textContent = String(value);
    ring.append(number);

    const text = document.createElement("span");
    text.className = "app-score__label";
    const hidden = document.createElement("span");
    hidden.className = "visually-hidden";
    hidden.textContent = `Accessibility score ${value} out of 100: `;
    text.append(hidden, document.createTextNode(label));

    wrapper.append(ring, text);
    return wrapper;
  }
  window.marinScoreGauge = marinScoreGauge;

  // Accessibility: any [data-accessibility-scores] section lazy-loads the
  // shared MarinOS Lighthouse results (marin-os's data/lighthouse.json, one
  // file for every app, keyed by catalog id) the first time it becomes
  // visible and shows this app's own entry in its [data-accessibility-content],
  // with progress in [data-accessibility-status]. The app is found by
  // data-accessibility-app-id on the section, else <body data-app-id>.
  // Automated testing only — never labelled as WCAG conformance. A failed scan
  // isn't shown as a low score: the last good result stays visible with its
  // date, or "not available" if there is none.
  document.querySelectorAll("[data-accessibility-scores]").forEach((section) => {
    const status = section.querySelector("[data-accessibility-status]");
    const content = section.querySelector("[data-accessibility-content]");
    if (!status || !content) return;

    const STALE_AFTER_DAYS = 14;
    const scoresUrl = `${MARINOS_HOMEPAGE_URL}data/lighthouse.json`;
    const appId = section.dataset.accessibilityAppId || document.body.dataset.appId || "";
    let loaded = false;

    function formatDate(iso) {
      const date = new Date(iso);
      return Number.isNaN(date.getTime())
        ? ""
        : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    }

    function show(entry) {
      const good =
        entry && entry.status === "success"
          ? { score: entry.score, testedAt: entry.testedAt }
          : (entry && entry.lastSuccess) || null;
      content.replaceChildren();
      if (!good) {
        status.textContent = "An accessibility score isn't available for this application yet.";
        return;
      }
      const scoreLine = document.createElement("p");
      scoreLine.append(marinScoreGauge(good.score, { large: true }));
      const source = document.createElement("p");
      source.className = "app-help-text";
      const notes = [];
      if (entry.status !== "success") notes.push("The latest scan didn't finish, so this is the last successful result.");
      else if (Date.now() - new Date(good.testedAt).getTime() > STALE_AFTER_DAYS * 86400000) notes.push("This result is out of date.");
      source.textContent = ["Google Lighthouse", `Tested ${formatDate(good.testedAt)}`, ...notes].join(". ") + (notes.length ? "" : ".");
      content.append(scoreLine, source);
      // The same test, run live: PageSpeed Insights' own results page for the
      // tested address (mobile, matching how the stored score was produced).
      const tested = entry.url;
      if (tested) {
        const report = document.createElement("p");
        const link = document.createElement("a");
        link.href = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(tested)}&form_factor=mobile`;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = "Lighthouse results";
        report.append(link);
        content.append(report);
      }
      status.textContent = "";
    }

    async function loadScore() {
      if (loaded) return;
      status.textContent = "Loading accessibility score...";
      try {
        const response = await fetch(scoresUrl, { cache: "no-store" });
        loaded = true;
        if (response.status === 404) {
          status.textContent = "Accessibility scores haven't been collected yet.";
          return;
        }
        if (!response.ok) throw new Error(`scores fetch failed: ${response.status}`);
        const data = await response.json();
        show(appId && data && data.apps ? data.apps[appId] : null);
      } catch (error) {
        loaded = true;
        console.error(error);
        status.textContent = "Couldn't load the accessibility score right now.";
      }
    }

    if (!section.hidden) loadScore();

    new MutationObserver(() => {
      if (!section.hidden) loadScore();
    }).observe(section, { attributes: true, attributeFilter: ["hidden"] });
  });

  // Records from another app: [data-record-list], [data-key-numbers] and [data-chart]
  // draw another app's published JSON as the same cards, numbers and charts that app
  // shows, so one app's records can appear on another app's page without a copy of that
  // app's code. Each one loads its file the first time it becomes visible (the `hidden`
  // attribute of the nearest [data-tab-section], or of the element itself, watched the
  // same way as Updates), so a page with many tabs fetches only what is opened.
  //
  // Shared attributes
  //   data-src       required. JSON address; may be on another site. {date:-29} becomes the UTC
  //                  date 29 days ago (YYYY-MM-DD) and {date:0} today.
  //   data-records   optional. Dot path to the array of records (default: the file itself).
  //   data-match     optional. Field to compare, with data-value. An array field matches when it
  //                  contains the value. Without it every record is used.
  //   data-app-name  optional. Names the source in the status lines.
  //   data-noun      optional. What the records are called (default "records").
  // Field names may be dot paths ("place.address.locality"). Values are set as text, never
  // as HTML; only http(s) addresses become links or images.
  const recordFiles = new Map();
  const dayMs = 86400000;
  const pickPath = (value, path) => String(path || "").split(".").filter(Boolean).reduce((found, key) => (found == null ? found : found[key]), value);
  const expandDates = (src) => src.replace(/\{date:(-?\d+)\}/g, (_, offset) => new Date(Date.now() + Number(offset) * dayMs).toISOString().slice(0, 10));
  const isWebAddress = (value) => /^https?:\/\//.test(value);

  // A YYYY-MM-DD value is a long date; a full date and time is the short form the
  // console shows on its cards ("Nov 2, 4:12 PM"), in Pacific time.
  const asText = (value) => {
    if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(", ");
    if (value == null) return "";
    const text = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      const date = new Date(`${text}T00:00:00Z`);
      if (!Number.isNaN(date.getTime())) return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(text)) {
      const date = new Date(text);
      if (!Number.isNaN(date.getTime())) return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" });
    }
    return text;
  };

  // The day a record falls on, in Pacific time, as YYYY-MM-DD.
  const dayOf = (value) => {
    const text = String(value ?? "");
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  };

  function fetchJson(src) {
    if (!recordFiles.has(src)) {
      recordFiles.set(src, fetch(expandDates(src), { cache: "no-store", credentials: "omit" }).then((response) => {
        if (!response.ok) throw new Error(`${src}: ${response.status}`);
        return response.json();
      }));
      recordFiles.get(src).catch(() => recordFiles.delete(src));
    }
    return recordFiles.get(src);
  }

  async function fetchRecords(el) {
    // data-src may name several files, separated by spaces; their records are joined, and a record
    // found in more than one file (same data-unique field) is kept once. One missing file is skipped.
    const sources = el.dataset.src.split(/\s+/).filter(Boolean);
    const loaded = await Promise.allSettled(sources.map((src) => fetchJson(src)));
    if (loaded.every((one) => one.status === "rejected")) throw loaded[0].reason;
    const lists = loaded.filter((one) => one.status === "fulfilled").map((one) => pickPath(one.value, el.dataset.records));
    if (!lists.every(Array.isArray)) throw new Error(`${el.dataset.src}: no list of records`);
    let records = lists.flat();
    if (el.dataset.unique) {
      const seen = new Set();
      records = records.filter((record) => {
        const key = pickPath(record, el.dataset.unique);
        if (key == null || !seen.has(key)) { seen.add(key); return true; }
        return false;
      });
    }
    if (el.dataset.match) {
      records = records.filter((record) => {
        const found = pickPath(record, el.dataset.match);
        return Array.isArray(found) ? found.includes(el.dataset.value) : found === el.dataset.value;
      });
    }
    if (el.dataset.exclude) {
      // "field=value": drop the records whose field equals the value (or lists it).
      const [field, ...rest] = el.dataset.exclude.split("=");
      const value = rest.join("=");
      records = records.filter((record) => {
        const found = pickPath(record, field);
        return !(Array.isArray(found) ? found.includes(value) : found === value);
      });
    }
    return records;
  }

  // Runs `load` once, the first time the element's tab section is shown.
  function whenShown(el, load) {
    const gates = [el.closest("[data-tab-section]"), el.closest("[data-subtab]")].filter(Boolean);
    if (!gates.length) gates.push(el);
    let started = false;
    const start = () => {
      if (started || gates.some((gate) => gate.hidden)) return;
      started = true;
      load();
    };
    start();
    if (!started) gates.forEach((gate) => new MutationObserver(start).observe(gate, { attributes: true, attributeFilter: ["hidden"] }));
  }

  const statusLine = (name) => {
    const status = document.createElement("p");
    status.setAttribute("role", "status");
    status.className = "app-help-text";
    status.dataset[name] = "";
    return status;
  };

  // Record lists: the app's result cards.
  //   data-title     required. Field shown as each card's heading.
  //   data-link      optional. Field holding an http(s) address; the heading links to it.
  //   data-link-template optional. Instead of data-link: an address with {field} parts filled from the record.
  //   data-meta      optional. Comma-separated fields shown under the heading, joined by " — ".
  //                  "field:words" adds words after the value ("redirects:visits" reads "5 visits").
  //   data-hidden-path  optional. Dot path to a flag; when true nothing is drawn and
  //                  data-hidden-text is shown (a service that hides small counts).
  //   data-text      optional. Field shown as a short description under the byline.
  //   data-image     optional. Field holding an http(s) address of a picture.
  //   data-badge     optional. Field shown as a badge above the heading.
  //   data-sort      optional. Field to sort by; data-sort-order is "desc" (default) or "asc".
  //   data-limit     optional. Most cards drawn (default 24).
  //   data-empty-text optional. Shown instead of "No {noun} found." when no record is left to draw.
  //   data-src       may name several files separated by spaces; data-unique is the field that makes a record the same
  //                  record when it is in more than one of them (an agency and its divisions).
  //   data-columns   optional. 2 or 3: cards in that many columns on a wide screen (one on a narrow one).
  //   data-group    optional. Field to group by (an array field counts each value). The list then draws one card for each
  //                  value, not one for each record: the value as the heading, how many records it has, and the dates
  //                  they span. data-group-link is the address the heading links to, with {value} replaced by the value
  //                  (a campaign's page of records, filtered); data-group-date is the date field for the span.
  //   data-timeframe optional. Field holding each record's date; the status line then says how far back the
  //                  records go: "(last week)", "(last month)", "(last 3 months)" or "(since Jan 5, 2026)".
  document.querySelectorAll("[data-record-list]").forEach((list) => {
    if (!list.dataset.src || !list.dataset.title) return;
    const appName = list.dataset.appName || "records";
    const noun = list.dataset.noun || "records";
    const limit = Number.parseInt(list.dataset.limit || "24", 10) || 24;
    const status = statusLine("recordListStatus");
    const cards = document.createElement("ul");
    cards.className = "search-results-list";
    if (["2", "3"].includes(list.dataset.columns)) cards.classList.add(`search-results-list--${list.dataset.columns}`);
    cards.setAttribute("aria-label", noun);
    list.replaceChildren(status, cards);

    const field = (record, name) => asText(pickPath(record, name));

    function draw(records) {
      records.slice(0, limit).forEach((record) => {
        const card = document.createElement("li");
        card.className = "app-card mm-card";
        const imageAddress = list.dataset.image ? field(record, list.dataset.image) : "";
        if (isWebAddress(imageAddress)) {
          const image = document.createElement("img");
          image.className = "mm-card__image";
          image.src = imageAddress;
          image.alt = "";
          image.loading = "lazy";
          card.append(image);
        }
        const body = document.createElement("div");
        body.className = "mm-card__body";
        const badge = list.dataset.badge ? field(record, list.dataset.badge) : "";
        if (badge) {
          const row = document.createElement("div");
          row.className = "mm-card__meta";
          const tag = document.createElement("span");
          tag.className = "app-badge";
          tag.textContent = badge.charAt(0).toUpperCase() + badge.slice(1);
          row.append(tag);
          body.append(row);
        }
        const heading = document.createElement("h3");
        heading.className = "mm-card__title";
        // data-link names a field holding the address; data-link-template builds it from fields: "https://x.org/?id={id}".
        const address = list.dataset.linkTemplate
          ? list.dataset.linkTemplate.replace(/\{([^}]+)\}/g, (_, name) => encodeURIComponent(pickPath(record, name) ?? ""))
          : list.dataset.link ? field(record, list.dataset.link) : "";
        if (isWebAddress(address)) {
          const anchor = document.createElement("a");
          anchor.href = address;
          anchor.target = "_blank";
          anchor.rel = "noreferrer";
          anchor.textContent = field(record, list.dataset.title);
          heading.append(anchor);
        } else {
          heading.textContent = field(record, list.dataset.title);
        }
        body.append(heading);
        // "field:words" adds the words after the value ("redirects:visits" reads "5 visits").
        const meta = (list.dataset.meta || "").split(",").map((entry) => {
          const [name, words] = entry.trim().split(":");
          const value = field(record, name);
          return value && words ? `${value} ${words}` : value;
        }).filter(Boolean).join(" — ");
        if (meta) {
          const byline = document.createElement("p");
          byline.className = "mm-card__byline";
          byline.textContent = meta;
          body.append(byline);
        }
        const text = list.dataset.text ? field(record, list.dataset.text) : "";
        if (text) {
          const description = document.createElement("p");
          description.className = "mm-card__text";
          description.textContent = text;
          body.append(description);
        }
        card.append(body);
        cards.append(card);
      });
    }

    whenShown(list, async () => {
      status.textContent = `Loading ${appName}…`;
      try {
        if (list.dataset.hiddenPath && pickPath(await fetchJson(list.dataset.src.split(/\s+/)[0]), list.dataset.hiddenPath) === true) {
          status.textContent = list.dataset.hiddenText || "Too few to show.";
          return;
        }
        let records = await fetchRecords(list);
        if (list.dataset.sort) {
          const direction = list.dataset.sortOrder === "asc" ? 1 : -1;
          records = [...records].sort((a, b) => direction * String(pickPath(a, list.dataset.sort) ?? "").localeCompare(String(pickPath(b, list.dataset.sort) ?? ""), "en", { numeric: true }));
        }
        if (!records.length) {
          status.textContent = list.dataset.emptyText || `No ${noun} found.`;
          return;
        }
        if (list.dataset.group) {
          // One card for each value of the field: its name, how many records it has, and the dates they span.
          const groups = new Map();
          records.forEach((record) => {
            const found = pickPath(record, list.dataset.group);
            (Array.isArray(found) ? found : [found]).filter((value) => value != null && value !== "").forEach((value) => {
              if (!groups.has(String(value))) groups.set(String(value), []);
              groups.get(String(value)).push(record);
            });
          });
          const span = (members) => {
            const days = members.map((record) => dayOf(pickPath(record, list.dataset.groupDate))).filter(Boolean).sort();
            if (!days.length) return { last: "", text: "" };
            const part = (day, withYear) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC" });
            const [first, last] = [days[0], days[days.length - 1]];
            const text = first === last ? part(first, true) : first.slice(0, 4) === last.slice(0, 4) ? `${part(first, false)} – ${part(last, true)}` : `${part(first, true)} – ${part(last, true)}`;
            return { last, text };
          };
          const entries = [...groups].map(([value, members]) => ({ value, members, ...span(members) }))
            .sort((a, b) => (b.last || "").localeCompare(a.last || "") || a.value.localeCompare(b.value, "en"));
          entries.slice(0, limit).forEach((entry) => {
            const card = document.createElement("li");
            card.className = "app-card mm-card";
            const body = document.createElement("div");
            body.className = "mm-card__body";
            const heading = document.createElement("h3");
            heading.className = "mm-card__title";
            const address = (list.dataset.groupLink || "").replace("{value}", encodeURIComponent(entry.value));
            if (isWebAddress(address)) {
              const anchor = document.createElement("a");
              anchor.href = address;
              anchor.target = "_blank";
              anchor.rel = "noreferrer";
              anchor.textContent = entry.value;
              heading.append(anchor);
            } else {
              heading.textContent = entry.value;
            }
            const byline = document.createElement("p");
            byline.className = "mm-card__byline";
            const unit = list.dataset.groupNoun || "records";
            byline.textContent = [`${entry.members.length} ${entry.members.length === 1 ? unit.replace(/s$/, "") : unit}`, entry.text].filter(Boolean).join(" — ");
            body.append(heading, byline);
            card.append(body);
            cards.append(card);
          });
          // A count of everything drawn says nothing a person cannot see; only a cut-off list says how much is left out.
          status.textContent = entries.length > limit ? `Showing ${limit} of ${entries.length} ${noun}.` : "";
          return;
        }
        draw(records);
        // How far back the records go, from the oldest one, in Pacific days.
        let span = "";
        if (list.dataset.timeframe) {
          const days = records.map((record) => dayOf(pickPath(record, list.dataset.timeframe))).filter(Boolean).sort();
          if (days.length) {
            const today = dayOf(new Date().toISOString());
            const ago = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${days[0]}T00:00:00Z`)) / dayMs);
            span = ago <= 7 ? "last week" : ago <= 31 ? "last month" : ago <= 93 ? "last 3 months" : `since ${asText(days[0])}`.replace(/(\w+) (\d+), (\d+)/, (_, m, d, y) => `${m.slice(0, 3)} ${d}, ${y}`);
          }
        }
        // A plain count of everything drawn is left out; a cut-off list, or one with a timeframe, says so.
        const counted = records.length > limit ? `Showing ${limit} of ${records.length} ${noun}` : `${records.length} ${noun}`;
        status.textContent = records.length > limit || span ? `${counted}${span ? ` (${span})` : ""}.` : "";
      } catch (error) {
        console.error(error);
        status.textContent = `${appName} could not be loaded right now.`;
      }
    });
  });

  // Key numbers: the app's stat cards. Either numbers a service already added up, or
  // numbers counted from the records.
  //   data-fields       "field:Label,field:Label"; each field is a dot path under data-path
  //                     (default "data") of the service's answer.
  //   data-compute      instead of data-fields, a JSON list counted from the records:
  //                     ["count","Label"], ["count","Label","field","value"] (records where the
  //                     field equals the value), or ["unique","Label","field"] (different values).
  //   data-hidden-path  optional. Dot path to a flag; when true the numbers are withheld and
  //                     data-hidden-text is shown instead (a service that hides small counts).
  document.querySelectorAll("[data-key-numbers]").forEach((box) => {
    if (!box.dataset.src) return;
    const fields = (box.dataset.fields || "")
      .split(",")
      .map((pair) => pair.split(":"))
      .filter(([field, label]) => field && label)
      .map(([field, label]) => [field.trim(), label.trim()]);
    let compute = [];
    try {
      compute = box.dataset.compute ? JSON.parse(box.dataset.compute) : [];
    } catch (error) {
      console.error(error);
    }
    if (!fields.length && !compute.length) return;
    const appName = box.dataset.appName || "numbers";
    const status = statusLine("keyNumbersStatus");
    const grid = document.createElement("div");
    grid.className = "mm-stats-kpis";
    box.replaceChildren(status, grid);

    const add = (label, value) => {
      const card = document.createElement("div");
      card.className = "mm-stats-kpi";
      const name = document.createElement("p");
      name.className = "app-help-text";
      name.textContent = label;
      const number = document.createElement("p");
      number.className = "mm-stats-kpi__value";
      number.textContent = value.toLocaleString("en-US");
      card.append(name, number);
      grid.append(card);
    };

    whenShown(box, async () => {
      status.textContent = `Loading ${appName}…`;
      try {
        if (compute.length) {
          const records = await fetchRecords(box);
          compute.forEach(([kind, label, field, value]) => {
            if (kind === "unique") add(label, new Set(records.map((record) => pickPath(record, field)).filter((v) => v != null && v !== "")).size);
            else add(label, field ? records.filter((record) => pickPath(record, field) === value).length : records.length);
          });
          status.textContent = "";
          return;
        }
        const body = await fetchJson(box.dataset.src);
        if (box.dataset.hiddenPath && pickPath(body, box.dataset.hiddenPath) === true) {
          status.textContent = box.dataset.hiddenText || "Too few to show.";
          return;
        }
        const data = pickPath(body, box.dataset.path || "data");
        if (!data || typeof data !== "object") throw new Error(`${box.dataset.src}: no numbers`);
        fields.forEach(([field, label]) => {
          const value = pickPath(data, field);
          if (typeof value === "number") add(label, value);
        });
        status.textContent = grid.children.length ? "" : `No ${appName} numbers found.`;
      } catch (error) {
        console.error(error);
        status.textContent = `${appName} could not be loaded right now.`;
      }
    });
  });

  // Charts: the app's chart cards, drawn with Chart.js from the page's own copy.
  //   data-chart-lib    required. Address of chart.min.js, loaded when the first chart is shown.
  //   data-chart-title  required. The card's heading.
  //   data-kind         "line" (default; counts per day, or per month) or "bar" (ranked, horizontal).
  //   data-date         line. Field holding each record's date; data-bucket is "day" (default) or "month".
  //   data-group        bar. Field to rank; an array field counts each of its values.
  //   data-sum          optional. Field to add up instead of counting records (rows a service
  //                     already added up by day).
  //   data-top          bar. Most bars drawn (default 10).
  //   data-hidden-path  optional. As for key numbers.
  // Amounts the page already holds (a budget): data-inline names a <script type="application/json"> in the
  // page, { labels: [...], series: [{ name, values: [...] }], format: "currency" | "number", summary: "..." },
  // instead of data-src. Then data-kind is "columns" (vertical), "bars" (horizontal) or "pie" (the first series as shares of a whole), data-stacked stacks
  // the series, and nothing is fetched except Chart.js.
  const chartLoads = new Map();
  const loadChartLib = (src) => {
    if (typeof window.Chart !== "undefined") return Promise.resolve();
    if (!chartLoads.has(src)) {
      chartLoads.set(src, new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`${src}: could not load the chart library`));
        document.head.append(script);
      }));
    }
    return chartLoads.get(src);
  };

  document.querySelectorAll("[data-chart]").forEach((box) => {
    if ((!box.dataset.src && !box.dataset.inline) || !box.dataset.chartLib || !box.dataset.chartTitle) return;
    const appName = box.dataset.appName || "chart";
    const inlineKind = ["columns", "bars", "pie"].includes(box.dataset.kind) ? box.dataset.kind : "";
    const kind = box.dataset.kind === "bar" ? "bar" : "line";
    const card = document.createElement("section");
    card.className = "app-card";
    const heading = document.createElement("h3");
    heading.textContent = box.dataset.chartTitle;
    const status = statusLine("chartStatus");
    const canvas = document.createElement("canvas");
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", box.dataset.chartTitle);
    canvas.hidden = true;
    card.append(heading, status, canvas);
    box.replaceChildren(card);

    const monthOf = (day) => day.slice(0, 7);
    function tally(records) {
      const sum = (record) => (box.dataset.sum ? Number(pickPath(record, box.dataset.sum)) || 0 : 1);
      const counts = new Map();
      if (kind === "bar") {
        records.forEach((record) => {
          const found = pickPath(record, box.dataset.group);
          (Array.isArray(found) ? found : [found]).filter((v) => v != null && v !== "").forEach((v) => counts.set(String(v), (counts.get(String(v)) || 0) + sum(record)));
        });
        return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, Number.parseInt(box.dataset.top || "10", 10) || 10);
      }
      const byMonth = box.dataset.bucket === "month";
      records.forEach((record) => {
        const day = dayOf(pickPath(record, box.dataset.date));
        if (!day) return;
        const key = byMonth ? monthOf(day) : day;
        counts.set(key, (counts.get(key) || 0) + sum(record));
      });
      const keys = [...counts.keys()].sort();
      if (!keys.length) return [];
      // Keep the quiet days and months on the line, so a gap looks like a gap.
      const filled = [];
      const step = (key) => {
        const [year, month, day] = key.split("-").map(Number);
        const next = byMonth ? new Date(Date.UTC(year, month, 1)) : new Date(Date.UTC(year, month - 1, day + 1));
        return next.toISOString().slice(0, byMonth ? 7 : 10);
      };
      for (let key = keys[0], guard = 0; key <= keys[keys.length - 1] && guard < 800; key = step(key), guard += 1) filled.push([key, counts.get(key) || 0]);
      return filled;
    }

    const labelFor = (key) => {
      if (kind === "bar") return key;
      const date = new Date(`${key.length === 7 ? `${key}-01` : key}T00:00:00Z`);
      return date.toLocaleDateString("en-US", key.length === 7 ? { month: "short", year: "numeric", timeZone: "UTC" } : { month: "short", day: "numeric", timeZone: "UTC" });
    };

    // Colors that stay apart for people who see color differently (Okabe and Ito); the series are also named
    // in the legend, so color is never the only signal.
    const seriesColors = ["#0072B2", "#E69F00", "#009E73", "#D55E00", "#CC79A7", "#56B4E9", "#8c6d1f", "#555555", "#999999"];
    const amountText = (value, format, short) => {
      if (format === "currency") {
        const sign = value < 0 ? "−" : "";
        const abs = Math.abs(value);
        if (short && abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(abs >= 1e8 ? 0 : 1).replace(/\.0$/, "")}M`;
        if (short && abs >= 1e3) return `${sign}$${Math.round(abs / 1e3)}K`;
        return `${sign}$${abs.toLocaleString("en-US")}`;
      }
      return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
    };
    async function drawInline() {
      const holder = document.getElementById(box.dataset.inline);
      const spec = holder ? JSON.parse(holder.textContent) : null;
      await loadChartLib(box.dataset.chartLib);
      if (!spec || !Array.isArray(spec.labels) || !spec.labels.length || !Array.isArray(spec.series) || !spec.series.length) {
        status.textContent = box.dataset.emptyText || "Nothing to show yet.";
        return;
      }
      const format = spec.format || "number";
      if (inlineKind === "pie") {
        // One series as shares of a whole: slices from the largest, each named in the legend with its share, and its
        // amount and percentage in the tooltip. A zero or negative value has no slice.
        const slices = spec.labels.map((label, index) => [label, Number(spec.series[0].values[index]) || 0]).filter(([, value]) => value > 0).sort((a, b) => b[1] - a[1]);
        const whole = slices.reduce((sum, [, value]) => sum + value, 0);
        if (!slices.length) {
          status.textContent = box.dataset.emptyText || "Nothing to show yet.";
          return;
        }
        const share = (value) => `${((value / whole) * 100).toFixed(value / whole < 0.1 ? 1 : 0)}%`;
        canvas.setAttribute("aria-label", `${box.dataset.chartTitle}. ${spec.summary || `${slices[0][0]} is the largest share, ${share(slices[0][1])} of ${amountText(whole, format)}.`}`);
        window.Chart.defaults.color = getComputedStyle(card).color;
        window.Chart.defaults.borderColor = getComputedStyle(card).borderTopColor;
        const wrapPie = document.createElement("div");
        wrapPie.style.position = "relative";
        // Many slices: the legend goes underneath, in as many rows as it needs, so no name is cut off.
        const many = slices.length > 8;
        wrapPie.style.height = many ? `${300 + slices.length * 14}px` : "320px";
        canvas.replaceWith(wrapPie);
        wrapPie.append(canvas);
        status.hidden = true;
        canvas.hidden = false;
        new window.Chart(canvas, {
          type: "pie",
          data: { labels: slices.map(([label]) => label), datasets: [{ data: slices.map(([, value]) => value), backgroundColor: slices.map((_, index) => seriesColors[index % seriesColors.length]), borderColor: getComputedStyle(card).backgroundColor, borderWidth: 2 }] },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: many ? "bottom" : "right", labels: { generateLabels: (chart) => chart.data.labels.map((label, index) => ({ text: `${label}, ${share(chart.data.datasets[0].data[index])}`, fillStyle: chart.data.datasets[0].backgroundColor[index], strokeStyle: chart.data.datasets[0].backgroundColor[index], hidden: false, index })) } },
              tooltip: { callbacks: { label: (item) => `${item.label}: ${amountText(item.parsed, format)} (${share(item.parsed)})` } },
            },
          },
        });
        return;
      }
      const horizontal = inlineKind === "bars";
      const stacked = box.hasAttribute("data-stacked");
      const many = spec.series.length > 1;
      let summary = spec.summary;
      if (!summary) {
        const first = spec.series[0];
        const top = first.values.indexOf(Math.max(...first.values));
        summary = many
          ? `${spec.series.map((one) => `${one.name} totals ${amountText(one.values.reduce((a, b) => a + b, 0), format)}`).join("; ")}.`
          : `Largest: ${spec.labels[top]} at ${amountText(first.values[top], format)}, of ${spec.labels.length} shown.`;
      }
      canvas.setAttribute("aria-label", `${box.dataset.chartTitle}. ${summary}`);
      window.Chart.defaults.color = getComputedStyle(card).color;
      window.Chart.defaults.borderColor = getComputedStyle(card).borderTopColor;
      // Horizontal bars get a row each; the chart's box grows with them.
      const wrap = document.createElement("div");
      wrap.style.position = "relative";
      wrap.style.height = horizontal ? `${Math.max(160, spec.labels.length * (many && !stacked ? 20 * spec.series.length : 28) + 64)}px` : "320px";
      canvas.replaceWith(wrap);
      wrap.append(canvas);
      status.hidden = true;
      canvas.hidden = false;
      const valueAxis = { beginAtZero: true, stacked, ticks: { callback: (value) => amountText(value, format, true) } };
      const labelAxis = { stacked, grid: { display: false } };
      new window.Chart(canvas, {
        type: "bar",
        data: {
          labels: spec.labels,
          datasets: spec.series.map((one, index) => ({ label: one.name, data: one.values, backgroundColor: seriesColors[index % seriesColors.length], borderColor: seriesColors[index % seriesColors.length] })),
        },
        options: {
          indexAxis: horizontal ? "y" : "x",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: many, position: "bottom" },
            tooltip: { callbacks: { label: (item) => `${item.dataset.label}: ${amountText(item.parsed[horizontal ? "x" : "y"], format)}` } },
          },
          scales: horizontal ? { x: valueAxis, y: labelAxis } : { x: labelAxis, y: valueAxis },
        },
      });
    }

    whenShown(box, async () => {
      status.textContent = `Loading ${appName}…`;
      try {
        if (inlineKind) {
          await drawInline();
          return;
        }
        const [body] = await Promise.all([fetchJson(box.dataset.src.split(/\s+/)[0]), loadChartLib(box.dataset.chartLib)]);
        if (box.dataset.hiddenPath && pickPath(body, box.dataset.hiddenPath) === true) {
          // The key numbers beside it already say why; a second card saying it again adds nothing.
          box.hidden = true;
          return;
        }
        const records = await fetchRecords(box);
        const entries = tally(records);
        if (!entries.length) {
          if ("hideEmpty" in box.dataset) {
            box.hidden = true;
            return;
          }
          status.textContent = box.dataset.emptyText || "Nothing to show yet.";
          return;
        }
        const labels = entries.map(([key]) => labelFor(key));
        const values = entries.map(([, count]) => count);
        const peak = values.indexOf(Math.max(...values));
        canvas.setAttribute("aria-label", kind === "bar"
          ? `${box.dataset.chartTitle}. Top: ${labels[0]} with ${values[0]}, of ${labels.length} shown.`
          : `${box.dataset.chartTitle}. ${values.reduce((a, b) => a + b, 0)} total, peaking at ${values[peak]} on ${labels[peak]}.`);
        // Chart.js draws its own text and grid, so give it the page's colors.
        window.Chart.defaults.color = getComputedStyle(card).color;
        window.Chart.defaults.borderColor = getComputedStyle(card).borderTopColor;
        status.hidden = true;
        canvas.hidden = false;
        canvas.style.maxHeight = "320px";
        new window.Chart(canvas, {
          type: kind,
          data: { labels, datasets: [{ data: values, borderColor: "#0777cf", backgroundColor: "#0777cf", tension: 0 }] },
          options: kind === "bar"
            ? { indexAxis: "y", responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { precision: 0 } } } }
            : { responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { precision: 0 }, beginAtZero: true } } },
        });
      } catch (error) {
        console.error(error);
        status.textContent = `${appName} could not be loaded right now.`;
      }
    });
  });
})();
