# Session Plan: Showcase App + Theme Editor

**Date**: 2026-02-14
**Agent**: GitHub Copilot (GPT-5.3-Codex)
**Goal**: Build a polished showcase app that demonstrates a broad set of controls and provides a first-class in-app theme editing experience.

## Scope

### In Scope
- Create a new dev example app at `dev-examples/binding/showcase_app/` with:
  - curated showcase sections for many controls from `controls/controls.js`
  - consistent visual shell (hero/header, cards, responsive grid)
  - a dedicated **Theme Studio** panel for:
    - preset switching (`Admin_Theme` presets)
    - live CSS variable editing (`--admin-*` variables)
    - reset-to-preset behavior
- Keep implementation isomorphic-friendly (`compose` + `activate` patterns).
- Add app documentation (`README.md`) with run instructions.
- Add Playwright E2E coverage for interactive behavior:
  - preset switch updates theme attribute
  - variable editors apply style changes live
  - at least one showcased interactive control remains usable after theme changes
- Add/adjust aggregate Playwright run coverage as needed.

### Out of Scope
- Building a production design system editor with persistence/backend storage.
- Re-theming every legacy control in the repository.
- Visual regression infrastructure (image diff pipeline).

## Risks
- Some controls may not fully consume `--admin-*` tokens, reducing visible theme impact.
- Theme editor inputs can drift from applied variables without a central sync helper.
- Dense showcase layout may create mobile overflow if not constrained.

## Success Criteria
- [ ] New showcase app runs via `node dev-examples/binding/showcase_app/server.js`.
- [ ] Showcase app renders multiple categories of controls (layout, action, feedback, editor/data).
- [ ] Theme Studio can switch presets and edit core variables live.
- [ ] Reset action restores the currently selected preset values.
- [ ] Playwright test validates key interactions and passes.
- [ ] Showcase app README documents features and commands.

## Related Sessions
- [2026-02-12-visual-advancement](../2026-02-12-visual-advancement/PLAN.md)
- [2026-01-17-theme-system](../2026-01-17-theme-system/PLAN.md)
