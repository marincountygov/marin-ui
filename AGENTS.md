# Working on marin-ui

## Architecture

This is the shared MarinOS brand bundle: CSS tokens/components (`shared/app-brand.css`) and generic behaviors (`shared/app-shell.js`), vendored into every consumer app via `scripts/sync-consumer.sh`. Consumers do not npm-install this — they get a file copy, version-pinned in their own `BRAND_VERSION`.

## Before making changes

1. New behaviors should be generic and data-attribute-driven ("no per-page JavaScript needed" is the design goal) — see the existing patterns (sortable tables, copy-to-clipboard, Share, tab-sections, Updates feed) in `shared/app-shell.js` before adding something new.
2. Document every new or changed pattern in `docs/components.md`.
3. Bump `BRAND_VERSION` and add a `CHANGELOG.md` entry ("why," not just "what") for any change, however small.

## Before finishing

After bumping the version, run `scripts/sync-consumer.sh ../<repo>` for every consumer app so they pick up the change, then check whether any consumer's own markup needs a matching update (e.g. a renamed class, a new required data attribute).

## Consumer apps

marin-magic, marin-decision-maker, marin-docs, marin-os, marin-app-template, marin-expense, marin-cupa-fees — see each one's own `marin.yml` for the version it currently has installed.

## References

- `docs/components.md` — the full component/pattern reference
- `marin-skills/marin-app-builder` — uses this bundle when scaffolding new apps: https://github.com/marincountygov/marin-skills
- `marin-digital-standards` — the accessibility/brand/content requirements this bundle implements: https://github.com/marincountygov/marin-digital-standards
