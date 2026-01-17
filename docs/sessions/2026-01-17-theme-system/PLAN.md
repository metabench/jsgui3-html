# Session Plan: Theme System Implementation

**Date**: 2026-01-17
**Agent**: Codex (ChatGPT)
**Goal**: Ship a parameterized theme system that simplifies high-level control composition by strengthening lower-level helpers (field access, param resolution, validation, and data-attribute/class plumbing).

## Scope

### In Scope
- Define and implement low-level helpers: `field` accessor, param schema/validation, variant registry accessors, and `resolve_params` that emits params + attrs/classes.
- Update theme application plumbing so tokens and params flow together (hook into `apply_theme` or equivalent).
- Design data-attribute/class hooks for CSS consumers (e.g., `data-button-style`, position classes).
- Plan refactor steps for `window` control as first consumer; outline how other controls adopt the helpers.
- Testing and documentation approach for the new helpers and the first control integration.

### Out of Scope
- Full refactor of every control to the new system (only plan the rollout, implement for `window` first).
- Visual redesign of themes; focus is structural/thematic plumbing, not new aesthetic tokens.
- Runtime dynamic re-composition for params (remain construction-time).

## Risks
- Inconsistent control type naming between registry and controls could silently drop params.
- Overlapping concerns between `extends` (theme inheritance) and variant selection can confuse resolution order.
- Validation could be noisy (project discourages console logging) or too lax if not integrated into merge flow.
- CSS/data-attribute contract drift if controls forget to set hooks emitted by helpers.
- Backward-compatibility regressions for existing `window` behavior if defaults do not match current layout.

## Success Criteria
- [ ] Helper layer lands: `field` (safe lookup + validation), param schemas per control, variant registry accessor, `resolve_params` returning `{params, attrs, classes}`.
- [ ] Theme application path applies tokens and attaches attrs/classes emitted by `resolve_params` in one place.
- [ ] `window` control refactored to use helpers; default output matches current behavior; supports at least one additional variant (e.g., macOS).
- [ ] Tests cover helpers (unit) and `window` behavior (structure/css hooks) under default and variant params.
- [ ] Docs updated: brief usage guide for themes/params, notes on CSS hooks, and migration notes for other controls.

## Work Packages & Steps
- **Design contracts**
  - Lock control type naming conventions for registry keys (`'window'`, `'button'`, etc.).
  - Decide separation of theme inheritance vs variant selection (e.g., `theme.extends` for tokens, `spec.variant`/`context.variant` for structure).
  - Specify CSS/data attributes per control (e.g., `data-button-style`, `data-title-align`, position class names).
- **Implement helpers**
  - Add `field` utility: deep lookup with default + validator + warning handler (non-console hook).
  - Add param schemas (runtime object) per control with defaults and validators; export types/JSDoc.
  - Add variant registry + accessor (`get_variant_params(control_type, variant_name)`), handling default variant and missing entries.
  - Build `resolve_params(control_type, spec, context)` to merge variants + theme params + spec params, returning params plus attrs/classes derived from schema.
- **Plumb into theme application**
  - Extend `apply_theme` (or add wrapper) to accept `{ tokens, params_payload }`, applying CSS vars and attaching attrs/classes to controls once.
  - Provide `set_theme_attrs(control, attrs)` helper to apply emitted hooks consistently.
- **Refactor first consumer (`window`)**
  - Replace inline param handling with `resolve_params`.
  - Use returned `attrs/classes` to set `data-button-style`, alignment, and position classes.
  - Ensure default variant matches current layout; add sample variant (macOS-style) to exercise left/traffic-light params.
- **Testing**
  - Unit tests for helpers: schema validation, merge order, variant fallbacks, invalid param fallback behavior.
  - Control tests: assert rendered structure/classes/attributes for default and variant `window`; ensure SSR-safe behavior.
- **Documentation**
  - Add/update theme system README: tokens vs params, variants, helper API, CSS hooks.
  - Migration notes for other controls; checklist for adopting helpers.

## Related Sessions
- None (new session)
