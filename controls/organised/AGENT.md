# Controls Agent Guide

**Read this before creating, modifying, or testing any control in `controls/organised/`.**

## Directory Structure

```
controls/organised/
├── 0-core/
│   ├── 0-basic/0-native-compositional/   # Native HTML wrappers
│   └── 0-basic/1-compositional/          # Base composed controls
│   └── 1-advanced/                       # Advanced core features
└── 1-standard/
    ├── 1-editor/    # Form/editing controls (Property_Editor, etc.)
    ├── 4-data/      # Data display (Data_Table, Stat_Card, Activity_Feed, etc.)
    ├── 5-ui/        # UI components (Alert_Banner, Command_Palette, etc.)
    └── 6-layout/    # Layout controls (Tabbed_Panel, Accordion, etc.)
```

## Creating a New Control — Checklist

1. **File**: Create in the correct category under `controls/organised/1-standard/`
2. **Naming**: File = `snake_case.js`, Class = `Camel_Case`
3. **Compose method**: Build DOM in `compose()`, not constructor
4. **CSS**: Add as static `css` property on the class using CSS custom properties (`--admin-*`)
5. **Export**: Add to `controls/controls.js`
6. **E2E test**: Create `tmp/<control>-e2e.js` with Puppeteer (see `tmp/tabbed-panel-e2e.js`)
7. **Lessons**: Record any gotchas in `docs/agi/LESSONS.md`

## Compose Pattern

```javascript
class My_Control extends Control {
    compose() {
        // Build sub-components here
        this.compose_header();    // ✅ compose_<part>
        this.compose_body();      // ✅ compose_<part>
    }
    
    // NOT _render_header() — use compose_ prefix
    compose_header() { /* ... */ }
}
```

## E2E Testing — REQUIRED

Every interactive control needs a Puppeteer E2E test. See `AGENTS.md` → "E2E Tests with Puppeteer" for the full pattern. Key points:

- **Must test interactive behaviour**: clicks, keyboard, ARIA updates, CSS states
- **Self-contained**: builds page, starts server, runs tests, captures screenshots
- **Use `delay()` helper**, not `page.waitForTimeout()` (removed in Puppeteer 24)
- **Use `$$eval` with array indexing**, not `:nth-of-type()` selectors

## CSS Theming

All controls must use Admin_Theme CSS custom properties:

| Token | Usage |
|-------|-------|
| `--admin-accent` | Active/selected state colour |
| `--admin-border` | Border colour |
| `--admin-text` | Primary text |
| `--admin-muted` | Inactive/secondary text |
| `--admin-card-bg` | Card/panel background |
| `--admin-header-bg` | Header/toolbar background |
| `--admin-hover` | Hover state background |
| `--admin-font` | Font family stack |

## Key Reference Files

- [AGENTS.md](../../AGENTS.md) — Full project conventions
- [LESSONS.md](../agi/LESSONS.md) — Accumulated project learnings
- [tabbed-panel-e2e.js](../../tmp/tabbed-panel-e2e.js) — Reference E2E test (42 assertions)
