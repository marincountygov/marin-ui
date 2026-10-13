# Working on marin-ui

## Architecture

This is the shared MarinOS design system: CSS tokens and components (`shared/app-brand.css`) and generic behaviors (`shared/app-shell.js`). Apps do not copy it directly. The path is `marin-ui` -> `marin-app-shell` -> app (see `SYNCING.md`): the shell imports a reviewed `marin-ui` release into its own pinned `vendor/marin-ui/`, and apps install a shell release with the shell's installer. `BRAND_VERSION` is the release number of this repository. Which version the shell has pinned is in the shell's `MARIN_UI_VERSION`.

## Before making changes

1. New behaviors should be generic and data-attribute-driven ("no per-page JavaScript needed" is the design goal) — see the existing patterns (sortable tables, copy-to-clipboard, Share, tab-sections, Updates feed) in `shared/app-shell.js` before adding something new.
2. Document every new or changed pattern in `docs/components.md`.
3. When a rule overrides another (dark mode over light mode, or a `--pico-*` variable), check that it wins. Equal-specificity rules resolve by source order, so a dark-mode override placed before its base rule does nothing, and Pico sets some variables on `:root:not([data-theme=dark])`, which outranks a plain `:root`. Put overrides after the base rule and match Pico's selector. `scripts/check-contrast.js` reads token values only; it does not prove a rule applies, so also compare computed styles in a browser in both color schemes.
4. Bump `BRAND_VERSION` and add a `CHANGELOG.md` entry ("why," not just "what") for any change, however small. Add a pair to `scripts/check-contrast.js` when a new component puts one token color on another.

## Before finishing

Run `node scripts/check-contrast.js`. Then tell the `marin-app-shell` owners a refresh is due: the shell imports this repository with `scripts/sync-ui.sh ../marin-ui` (it needs a committed checkout), removes any compatibility blocks this release makes unnecessary, and releases a new shell. The shell's `scripts/check.sh` warns when this repository is ahead of its pinned baseline. Merge changes here with a merge commit, not a squash, because the shell's lock file records the commit.

## Consumers

Every MarinOS app consumes this through `marin-app-shell`. See each app's `marin.yml` (`platform.shell`) for the shell release it has installed, and the shell's `docs/brand.md` for what it pins.

## References

- `docs/components.md` — the full component/pattern reference
- `marin-skills/marin-app-builder` — uses this system when scaffolding new apps: https://github.com/marincountygov/marin-skills
- `marin-digital-standards` — the accessibility/brand/content requirements this implements: https://github.com/marincountygov/marin-digital-standards
