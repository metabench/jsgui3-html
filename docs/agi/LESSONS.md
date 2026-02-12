# 🧠 Project Lessons — jsgui3-html

Accumulated learnings from working on this codebase. **All agents should read this.**

---

## E2E Testing (2026-02-12)

- **Puppeteer 24 removed `page.waitForTimeout()`** — use `const delay = ms => new Promise(r => setTimeout(r, ms))` instead.
- **Never use `:nth-of-type()` CSS selectors** for mixed DOM siblings (e.g., `input` + `label` + `div` siblings). Use `page.$$eval()` with array indexing instead.
- **SSR controls need client-side activation scripts** in the test HTML. Without the `<script>` block that adds event listeners, server-rendered HTML is static and won't respond to clicks or keyboard events.
- **Self-contained E2E pattern**: each test file should build its own page, start its own HTTP server, run Puppeteer, capture screenshots, and shut everything down. See `tmp/tabbed-panel-e2e.js` for the reference implementation (42 assertions).

## Control Patterns (2026-02-12)

- **compose pattern naming**: Internal methods that build sub-component DOM inside a `compose()` method should be named `compose_<thing>` (e.g., `compose_results`), not `_render_<thing>`.
- **Tab icon/badge handling**: `normalize_tab_def` normalises all input types into `{ label_text, content, icon, badge }`. The raw `tab` value (not normalised) is passed to `add_tab`, so type checks must handle strings.
- **CSS radio selector chain**: `.tab-input:checked + .tab-label + .tab-page` relies on exact DOM sibling order — `input`, `label`, `page` must be rendered in that sequence.

## Admin Theme (2026-02-12)

- **CSS custom properties** (`--admin-accent`, `--admin-border`, etc.) are the theming mechanism. New controls must use these, not hardcoded colours.
- **Static `css` property on classes**: Theme CSS is accessed via `Admin_Theme.css` and `Tabbed_Panel.css` as static class properties. These are string literals, not files.
