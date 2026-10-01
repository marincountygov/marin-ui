# Updating a MarinOS consumer

MarinOS consumer repositories vendor a versioned `marin-app-shell` release so they remain deployable independently and continue to work from simple static hosting.

`marin-ui` is the upstream design-system source. Consumer applications do not sync shared shell files directly from `marin-ui`. The supported update path is:

```text
marin-ui -> marin-app-shell -> MarinOS consumer
```

`marin-app-template` is a starter for new applications. Existing applications are not updated by copying files from the template.

## Ownership boundaries

- `marin-ui` owns low-level design-system styles, tokens, components, typography, and reusable visual rules.
- `marin-app-shell` packages the shared MarinOS application shell and a compatible `marin-ui` release into a distributable bundle.
- Consumer applications own their product-specific HTML, content, CSS, JavaScript, data, and optional libraries.
- Vendored shell files are read-only inside a consumer. Reusable fixes belong upstream in `marin-ui` or `marin-app-shell`, followed by a new shell release.

## Shell bundle

Copy the complete `marin-app-shell/dist/` directory from one tagged shell release into the consumer unchanged as `vendor/marinos/`:

```text
vendor/marinos/
  marinos.css
  marinos.js
  manifest.json
  README.md
  licenses/
```

Treat `vendor/marinos/` as one atomic dependency. Do not copy or update individual files from different releases.

`marinos.css` includes the Pico baseline and the shared MarinOS/Marin UI shell styles. Consumers using the app shell must not separately load or maintain `vendor/pico.min.css`, `shared/app-brand.css`, or other copies of those shared styles.

`marinos.js` owns shared shell behavior such as the MarinOS banner, application header and navigation, footer, standard information sections, and shared responsive/menu behavior. Consumers must not duplicate that behavior in app-specific JavaScript.

## Fonts and app-owned dependencies

Keep the required local font files at the paths expected by the shell:

```text
vendor/fonts/Jost-wght.ttf
vendor/fonts/open-sans/OpenSans-VariableFont_wdth,wght.woff2
vendor/fonts/open-sans/OFL.txt
```

Fonts remain local application assets even though the shell CSS references them. Do not replace them with runtime CDN or remote font requests.

Keep product-specific libraries such as `vendor/xlsx.full.min.js`, `vendor/chart.min.js`, or their license files only when the application uses them. These are app-owned dependencies and are not part of the shared shell bundle.

## Loading order

Load the shell before application-specific assets so the app can extend or intentionally override shared behavior:

```html
<link rel="stylesheet" href="vendor/marinos/marinos.css">
<link rel="stylesheet" href="assets/app.css">

<script src="vendor/marinos/marinos.js" defer></script>
<script src="assets/app.js" defer></script>
```

Optional product libraries may also be loaded as required by the application, but shared shell code must not be copied into app-owned files.

## Version metadata

The consumer pins the installed shell version in `marin.yml`:

```yaml
platform:
  shell: 1.0.0
```

Use the actual installed version. `vendor/marinos/manifest.json` records both the shell version and the `marin-ui` version incorporated into that shell release. The consumer does not independently assemble a shell from a separate `marin-ui` version.

When reviewing an update, confirm that `marin.yml` and `vendor/marinos/manifest.json` describe the shell version you intended to install.

## Migrating a pre-app-shell consumer

When converting an older consumer to `marin-app-shell`:

1. Add the complete shell distribution under `vendor/marinos/`.
2. Replace direct stylesheet references to `vendor/pico.min.css` and `shared/app-brand.css` with `vendor/marinos/marinos.css`.
3. Replace direct script references to `shared/app-shell.js` with `vendor/marinos/marinos.js`.
4. Remove obsolete vendored shared files after confirming they are no longer referenced.
5. Remove duplicate shell/navigation/footer behavior from app-specific CSS and JavaScript.
6. Add or update `platform.shell` in `marin.yml`.
7. Preserve required local fonts and app-specific dependencies.

Migration is complete only when the application no longer depends on the old directly vendored `marin-ui` shell files.

## Update procedure

1. Confirm the consumer has no unrelated uncommitted changes.
2. Choose one tagged `marin-app-shell` release and review its release notes or changelog. Major shell releases may include migration requirements; minor and patch releases should still be regression-tested in the consumer.
3. Replace the complete `vendor/marinos/` directory with that release's complete `dist/` directory. Do not merge individual shell files.
4. Update `platform.shell` in `marin.yml` to the installed shell version.
5. Review `vendor/marinos/manifest.json` and the resulting Git diff. Confirm the expected `shellVersion` and `marinUiVersion` are present.
6. Open the product from `file://` when that mode is supported.
7. Serve it locally and verify that pages and local resources return successfully. Check computed styles, not just network loading: confirm `body` renders with Open Sans and headings with Jost.
8. Verify the shared shell: header, navigation, MarinOS menu, footer, standard information sections, responsive behavior, and OS-controlled color mode. If the consumer is registered in `marin-os/catalog.json`, diff its `icon.markup` against the consumer's current header/favicon icon so the catalog does not silently drift from the application.
9. Run WAVE against the HTTP URL. If `file://` testing is required, first enable local-page access in the extension settings.
10. Test keyboard navigation, focus behavior, menu behavior, reflow, contrast, and the application's primary workflows.
11. Confirm the application makes no unintended runtime requests for shared CSS, JavaScript, fonts, or other shell assets from external hosts.
12. Commit the shell directory, version metadata, any required migration changes, and regression evidence together.

## Upstream fixes

Do not edit files under `vendor/marinos/` in a consumer.

- Make design-system fixes in `marin-ui`.
- Make shared application-shell behavior or packaging fixes in `marin-app-shell`.
- Release a new `marin-app-shell` version that incorporates the required upstream changes.
- Update consumers by replacing the complete vendored shell distribution.

This keeps each consumer reproducible and prevents applications from drifting into incompatible combinations of Marin UI and shell files.
