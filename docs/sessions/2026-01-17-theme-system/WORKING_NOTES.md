# Working Notes

Session: Theme system implementation (low/medium/high layers + Window first)

---

## 2026-01-17T00:00Z

**Context**: Produce detailed guidance on implementing the theme system across low/medium/high layers and chart the path to theme the Window control first (most complex control).

**Findings**:
- Low-level (primitives):
  - Need a `field` helper for deep lookup with default + validator + warning hook (no direct console use). Should accept a resolver path, fallback, validator fn, and warning reporter (can plug into logging later).
  - Param schemas per control (runtime objects) define allowed values, defaults, and how to derive CSS hooks (data-attrs/classes) from params. Schemas should drive both validation and type/JSDoc generation.
  - Variant registry accessor (`get_variant_params(control_type, variant_name)`) must normalize control_type casing (`window`, `button`, etc.) and distinguish variant selection from theme inheritance (`extends` stays for token inheritance; `variant` for composition).
  - Small helper to attach theme-derived hooks: `set_theme_hooks(control, { attrs, classes })` to apply data-attributes and classes consistently.
  - Validation strategy: warn-and-fallback to variant default; warnings routed via injectable handler to keep tests clean and avoid console noise.
- Medium-level (plumbing):
  - `resolve_params(control_type, spec, context)` merges params in order: variant defaults -> theme params -> spec params, applying schema validation and returning `{ params, hooks }` where `hooks` contains data-attrs/classes derived from params.
  - `apply_theme` (or wrapper) should accept `{ tokens, params_payload }`; tokens flow to CSS vars, `params_payload` hooks are applied via `set_theme_hooks`. This keeps composition code focused on structure.
  - Theme inheritance: single-level `extends` for tokens only; composition variant chosen via `spec.variant` (or optional `context.variant_<control_type>`), preventing overload of `extends`.
  - CSS contract: document which hooks exist per control (e.g., `data-button-style`, `data-title-align`, `button-group` position class). Hooks come from schema so controls do not handcraft them.
- High-level (control adoption + ergonomics):
  - Controls read `resolve_params` once in constructor (SSR-safe), use returned `params` to compose structure (order, presence) and returned `hooks` to set attributes/classes for CSS.
  - Activation code remains minimal; no client-only behavior in constructors; composition decisions stay server-safe.
  - Backward compatibility: default variant mirrors current output exactly; tests assert default markup/class/attr parity.
  - Documentation must separate tokens (visual) vs params (structural), list variants, and show override precedence (variant < theme params < spec params).
- Window-first rollout:
  - Define `window` param schema: position (`left|right`), order (array of `minimize|maximize|close`), style (`icons|traffic-light|text|outlined`), visibility toggles, title alignment, draggable/resizable flags if needed.
  - Create variant registry entry with `default` matching current behavior; add a `macos` variant (left buttons, traffic-light style) to prove flexibility.
  - Refactor `window.js`: call `resolve_params('window', spec, context)`; `_compose_buttons` uses `params.button_order` and skips hidden buttons; apply `hooks.attrs` (e.g., `data-button-style`) and `hooks.classes` (position class on group/title bar as needed).
  - Update Window CSS to read CSS vars and hook selectors (e.g., `.button-group.left`, `[data-button-style="traffic-light"]`) without hardcoding colors (tokens drive them).
  - Tests: assert default structure matches legacy (order, right alignment); assert macos variant left alignment, order, data attribute set; ensure SSR render contains hooks.

**Decisions**:
- Keep `extends` for token inheritance only; use `variant` (spec or context) for composition params to avoid conflation.
- Merge order: `variant` defaults -> `theme.params[control_type]` -> `spec.params`; validation runs post-merge with fallback to variant default per field.
- Control type keys will be lowercase snake_case (e.g., `window`, `panel`, `button`) across registry, schema, and theme params for consistency.
- Warning handler will be injectable (default noop or test-captured), avoiding console usage.
- Hooks derived from schema are the single source for data-attrs/classes; controls should not manually invent additional styling hooks.

**Next Steps**:
- Implement helpers: `field`, schemas, variant registry accessor, `resolve_params`, `set_theme_hooks`.
- Extend theme application to pass params hooks alongside tokens.
- Define `window` schema + variants (default + macos) and refactor `window.js` to use helpers/hooks.
- Add unit tests for helper merge/validation and `window` structural tests for default and macos variants.
- Document the system (tokens vs params, precedence, hooks) and add migration notes for other controls.

---

## 2026-01-17T06:17Z - Phase 2: Core Infrastructure + Control Adoption

**Context**: Phase 1 completed (variants.js, theme_params.js, Window refactor). Now implementing remaining core infrastructure and adopting for Button/Panel controls.

**Phase 2 Goals**:
1. Create `themeable` mixin - reusable wrapper for all controls
2. Create `themes/token_maps.js` - CSS variable mappings for size/shadow/radius
3. Refactor Button control with full theme support
4. Refactor Panel control with full theme support
5. Add TypeScript declarations for new modules
6. Add unit tests

**Implementation Order**:
- [x] `control_mixins/themeable.js` - wrapper mixin
- [x] `themes/token_maps.js` - token -> CSS var mappings
- [x] Button refactor with full theme support
- [x] Panel refactor with full theme support
- [x] TypeScript declarations (themeable.d.ts, token_maps.d.ts)
- [x] Unit tests (button_theme.test.js, panel_theme.test.js)

**Results**: All 62 tests passing (24 theme_params + 8 window + 15 button + 15 panel)

**Files Created**:
- `control_mixins/themeable.js` + `.d.ts`
- `themes/token_maps.js` + `.d.ts`
- `test/controls/button_theme.test.js`
- `test/controls/panel_theme.test.js`

**Files Modified**:
- `control_mixins/mx.js` - added themeable export
- `themes/variants.js` - expanded button (10 variants) and panel (9 variants)
- `controls/.../button.js` - full theme integration
- `controls/.../panel.js` - full theme integration

**Lab Verification**:
- Created `lab/experiments/theme_showcase_lab.js`
- Created `generate_showcase.js` for HTML generation
- Screenshot captured: All controls render correctly with theme params
- Fixed: `xlarge` size was missing from param_schemas - now correctly shows 56px height

---

<!-- Add new entries above this line -->


