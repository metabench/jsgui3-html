# Session Plan: Visual Advancement Sprint — CSS Foundation + Core Controls

**Date**: 2026-02-12
**Agent**: Antigravity
**Goal**: Build the CSS token/layer architecture and implement styled core controls (Button, Text Input, Toggle, Checkbox, Radio)

## Scope

### In Scope
- Create `css/jsgui-tokens.css` (unified `--j-*` tokens, light + dark)
- Create `css/jsgui-reset.css` (minimal reset)
- Create `css/jsgui-utilities.css` (focus ring, sr-only, truncate)
- Create `css/jsgui.css` (master import with `@layer`)
- Create `css/components/button.css` (full spec from Ch.4)
- Create `css/components/input.css`
- Create `css/components/toggle.css`
- Create `css/components/checkbox.css`
- Create `css/components/radio.css`
- Update `button.js` — add `jsgui-button` class
- Update `checkbox.js` — add `themeable()`, custom SVG checkmark
- Verify via gallery server

### Out of Scope
- Panel, Data Table, Window (later sprint)
- Production build / minification
- Visual regression testing infrastructure

## Risks
- Breaking existing gallery rendering if legacy CSS conflicts with new layers
- `@layer` support requires modern browsers

## Success Criteria
- [ ] `css/jsgui-tokens.css` exists with full palette, spacing, shadows, motion
- [ ] `css/jsgui.css` master import loads all layers
- [ ] Button renders with all 6 variants × 5 states
- [ ] Checkbox renders with custom SVG checkmark, not native
- [ ] Toggle switches with spring animation
- [ ] Dark mode toggle works for all controls
- [ ] Gallery server serves new CSS

## Related Sessions
- [2026-01-17-theme-system](../2026-01-17-theme-system/PLAN.md)

## Reference Material
- `docs/control-design-book/visual-advancement/02-css-architecture.md` — CSS layer spec
- `docs/control-design-book/visual-advancement/04-control-specs.md` — per-control CSS
- `docs/control-design-book/visual-advancement/10-sprint-plan.md` — 30-day plan
- `docs/control-design-book/05-control-catalogue.md` — tier targets
