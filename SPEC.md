# Spec: Marin UI

## Purpose

Build County of Marin micro-apps using a simple, durable, standalone-friendly frontend stack with consistent County branding and WCAG 2.2 Level AA accessibility.

This is the default standard for small internal tools, local-first utilities, review apps, data cleanup tools, form workflows, dashboards, and other micro-apps.

## Documentation

This spec is split into focused documents. Start here, then go to the one you need:

- [`docs/architecture.md`](docs/architecture.md) — frontend stack, branding model, file structure, JavaScript rules, storage rules.
- [`docs/foundations.md`](docs/foundations.md) — color tokens and typography implementation.
- [`docs/components.md`](docs/components.md) — required shared CSS classes, the `.menu` disclosure component, shared CSS implementation.
- [`docs/app-shell.md`](docs/app-shell.md) — the required app shell markup (banner, header, footer, feedback).
- [`docs/accessibility-implementation.md`](docs/accessibility-implementation.md) — WCAG 2.2 AA implementation: structure, keyboard, contrast, forms, tables, dialogs, motion, status messages, WAVE testing.

Policy this spec implements — brand identity, content-design rules, accessibility requirements, product-design principles — is canonical in [marin-digital-standards](https://github.com/marincountygov/marin-digital-standards), not here. Each doc above links to the specific standard it implements where relevant.

## Building or reviewing a Marin micro-app

The build workflow and pre-acceptance review checklist for AI-generated code now live in [`marin-skills/marin-app-builder`](https://github.com/marincountygov/marin-skills/tree/main/marin-app-builder) — that skill sequences a build by consulting this spec's `docs/` and `marin-digital-standards` together, rather than restating either here.
