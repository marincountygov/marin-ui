# Updating a MarinOS consumer

Consumer repositories vendor the brand bundle so they remain deployable independently and work from simple static hosting.

## Bundle files

Copy these files together from one `marinappsbrand` release:

```text
BRAND_VERSION
shared/app-brand.css
shared/app-shell.js
vendor/pico.min.css
vendor/fonts/Jost-wght.ttf
```

Copy optional libraries such as `vendor/xlsx.full.min.js` only when the product uses them.

## Update procedure

1. Confirm the consumer has no unrelated uncommitted changes.
2. Copy the complete bundle from one tagged release or commit.
3. Review the changelog and the resulting diff.
4. Open the product from `file://` when that mode is supported.
5. Serve it locally and verify pages and local resources return successfully.
6. Run WAVE against the HTTP URL. If `file://` testing is required, first enable local-page access in the extension settings.
7. Test keyboard navigation, focus, menu behavior, OS-controlled color mode, reflow, contrast, and product workflows.
8. Commit the bundle update and regression evidence together.

Do not update one shared file independently or edit vendored shared files in a consumer. Make reusable fixes in `marinappsbrand`, release them, and then update consumers.
