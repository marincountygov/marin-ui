# Plan: shared login gate for MarinOS sites

Status: plan only — not implemented.

## What this is (and isn't)

A client-side password screen that covers a site's content until the visitor
enters a shared username/password, using `sessionStorage`/`localStorage` to
remember the unlock. Confirmed with the requester: this is a **soft gate**,
not real access control, and all sites share **one credential pair**
(`marinadmin` / `sanpedrotest`).

Because every MarinOS site is static and served from GitHub Pages with no
backend, this gate cannot actually restrict access to content:

- Anyone can view page source, open dev tools, or just disable JavaScript
  and see the real content — the gate is a CSS/JS overlay, not a barrier.
- Anyone who fetches a page's URL directly (`curl`, a search engine crawler,
  a shared deep link) gets the full HTML/JSON/JS response; there's no server
  in front of GitHub Pages to reject the request.
- The password itself, even hashed, ships in a public JS file. A hash stops
  someone from `grep`-ing the plaintext out of the repo; it does not stop
  someone who opens dev tools and reads the comparison logic.

If real protection is ever needed (this matters most for
`marinexpense`, which surfaces county financial data),
the only real options are: put a proxy with actual auth in front of GitHub
Pages (Cloudflare Access/Workers), or move hosting to a platform with edge
auth (Netlify/Vercel + middleware). That's a separate, larger effort and out
of scope here.

## Design

**One new shared component, `shared/site-gate.js`**, added to the same
vendored bundle every consumer app already pulls in (`app-brand.css`,
`app-shell.js`). No HTML changes to any of the ~30 existing pages — the gate
is entirely JS-injected at runtime, the same way `app-shell.js` already
wires up the `.menu` component on every page without page-specific markup.

1. On load, `site-gate.js` checks `localStorage.marinGateUnlocked`.
   - If present and valid, do nothing further — page renders normally.
   - If absent, immediately inject a full-viewport overlay (`position:
     fixed`, covers everything, high `z-index`) with a centered login card:
     Marin banner icon, "Sign in" heading, username field, password field,
     submit button, error message slot.
2. On submit, hash the input (`crypto.subtle.digest("SHA-256", ...)`) and
   compare against a hardcoded hash of `marinadmin:sanpedrotest`. Match →
   set `localStorage.marinGateUnlocked`, remove the overlay. No match → show
   inline error, don't clear the fields.
3. Add a **Log out** entry to the existing `.marinos-menu__panel` banner
   dropdown (already present on every page) that clears
   `localStorage.marinGateUnlocked` and reloads the page.

**Accepted limitation, by design:** because there's no markup change to
existing pages, a visitor with JavaScript disabled sees the real page
content immediately, ungated. Given this is explicitly a soft gate (not
security), that tradeoff is what buys zero-touch rollout across every
existing page. If that gap ever matters, the fix is a one-line inline
`<style>body{visibility:hidden}</style>` + class-toggle added to every
page's `<head>` — noted here as a future option, not part of this plan.

**Session length:** `localStorage` (not `sessionStorage`) so visitors don't
re-enter credentials every browser session — persists until they explicitly
log out or clear site data. Flag if you'd rather it expire per-session.

**Styling:** new rules in `shared/app-brand.css` (`.site-gate`,
`.site-gate__card`, `.site-gate__error`, etc.) using the existing Marin
black/gold tokens, matching the login card to the same visual language as
the `.menu` dropdown and `.app-status` badge components.

## Rollout

Same mechanism as every prior shared-component change in this project:

1. Build `shared/site-gate.js` + CSS in `marinappsbrand` (source of truth).
2. Document the component and its explicit non-security caveat in
   `marinappsbrand/SPEC.md`, next to the other shared-component contracts.
3. Bump `BRAND_VERSION`, add a `CHANGELOG.md` entry.
4. Run `scripts/sync-consumer.sh <path>` against each consumer repo
   (marindocs, marinmagic, marinwaymaker, marinos) to vendor the updated
   bundle — same as every previous rollout.
5. No per-page edits needed in any consumer repo; the gate activates
   automatically everywhere `app-shell.js` is already loaded.

## Open questions before I build this

- **Same overlay design for every site, or does each app get its own
  copy/branding on the login card?** Recommend one shared design — it's a
  shared component like the banner, and per-site variants add maintenance
  cost for a gate that isn't security-critical.
- **Should `marinappsbrand`'s own demo/spec page (`index.html`) be gated
  too?** It's the design-system reference page, arguably meant to stay
  open. Recommend leaving it ungated; flag if it should match the others.
- **Any pages that should stay open regardless** (e.g., a public status
  page, or `marinos/index.html` as the directory entry point)? None
  identified yet — default plan gates every page uniformly.
