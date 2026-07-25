# tools/visual — standalone visual harness

Renders jsgui3-html controls server-side and captures batches of screenshots —
**no jsgui3-server, no jsgui3-client, no jsdom, no HTTP server**. Pages are
built as self-contained HTML strings (all CSS inlined) and handed to puppeteer
via `page.setContent()`, so nothing is served and nothing needs saving to run.

```
npm run visual:batch                 # all controls + suite pages (~300 shots, <1 min)
npm run visual:smoke                 # quick sanity subset
node tools/visual/batch.js --controls Button,Calendar --save-html
node tools/visual/batch.js --update-baselines
node tools/visual/batch.js --compare # pixel-diff against baselines/
```

Output lands in `tools/visual/output/` (gitignored): one PNG per
control x theme x viewport, plus `manifest.json`.

## For AI agents

Read `output/manifest.json` first — it lists every shot with its control,
theme, viewport, and any console/page/network errors, plus render failures
and skipped controls with reasons. Only open PNGs you need to judge.

Things to know before judging screenshots:

- **Theme axes are per control family.** Controls whose CSS consumes
  `--admin-*` variables ("admin" family in the manifest) respond to the 7
  `data-admin-theme` presets (vs-default, vs-dark, terminal, vs-classic,
  vs-aero, vs-2005, warm). All other controls ("j" family) are styled by
  `--j-*` tokens and have exactly two states: default and
  `data-theme="dark"`. Admin presets are pixel no-ops for the j family —
  an unchanged j-family screenshot under a preset is expected, not a bug.
- **A markup-only shell is not automatically a bug.** Container controls
  (Stack, Toolbar, ...) and overlay controls (Popup, Tooltip, Toast, ...)
  render nearly empty without children/content; enrich their spec in
  `specs.js` rather than reporting a render bug.
- **Hermeticity is asserted.** Pages contain no JS and no external
  references; any console error, page error, or failed request recorded in
  the manifest is a real bug.

## Modules

- `css_pipeline.js` — flattens `css/jsgui.css` (`@import`/`@layer` graph)
  into one inlineable payload; collects per-class `static css` by walking the
  **instantiated control tree** (walking only the root class's inheritance
  chain drops composed children's CSS — measured at 10–27% of pixels on real
  composites); classifies controls into theme families.
- `render_page.js` — `make_context()` (Page_Context + `req` stub so Login
  constructs) and `render_document()` producing a complete standalone HTML
  document.
- `specs.js` — per-control default specs: the gallery's `get_default_spec`
  (`test/e2e/gallery_server.js`) plus enrichment entries for controls whose
  bare render is an empty shell.
- `batch.js` — the driver: enumerates controls (deduping deprecated
  aliases), applies the per-family theme axis, captures everything in one
  browser session, writes `manifest.json`, and optionally pixel-diffs
  against `baselines/` (pixelmatch, from test/e2e/node_modules).

## Conventions

- Collected control statics are emitted inside `@layer jsgui-legacy`, so
  `css/components/*.css` (layer `jsgui-components`) wins where both style a
  control — matching the cascade order declared in `css/jsgui.css`.
- Baselines live in `tools/visual/baselines/` (tracked; `.gitignore` has a
  negation for it). Regenerate deliberately with `--update-baselines` and
  review the diff before committing.
