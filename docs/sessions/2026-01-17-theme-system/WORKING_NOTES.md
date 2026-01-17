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

## Phase 3: Input Control Theming (2026-01-17)

**Goal**: Add theme support to Text_Input control

**Implementation**:
- [x] Added 7 input variants to `themes/variants.js`: default, compact, floating, filled, underline, search, inline
- [x] Updated `control_mixins/theme_params.js` with input/text_input schema and derive_hooks
- [x] Refactored `Text_Input.js` with themeable mixin and token mapping
- [x] Updated TypeScript declarations: theme.d.ts, variants.d.ts, index.d.ts
- [x] Created comprehensive unit tests (24 tests)

**Results**: All 86 tests passing (24 theme_params + 8 window + 15 button + 15 panel + 24 input)

**Files Modified**:
- `themes/variants.js` - added input_variants (7 variants)
- `control_mixins/theme_params.js` - added input/text_input schema and hooks
- `controls/.../Text_Input.js` - themeable mixin integration

**Files Created**:
- `test/controls/input_theme.test.js` - 24 unit tests

---

## Phase 4: Navigation Controls Theming (2026-01-17)

**Goal**: Add theme support to Tabbed_Panel and Horizontal_Menu controls

**Implementation**:
- [x] Added 8 tabbed_panel variants to `themes/variants.js`: default, pills, card, vertical, vertical-right, bottom, icon, compact
- [x] Added 6 menu variants to `themes/variants.js`: default, vertical, compact, divided, pills, icon
- [x] Updated `themes/token_maps.js` with tab and menu size tokens
- [x] Updated `control_mixins/theme_params.js` with tabbed_panel and menu schemas + derive_hooks
- [x] Integrated themeable mixin into `Tabbed_Panel.js` and `Horizontal_Menu.js`
- [x] Updated TypeScript declarations with TabbedPanelParams, MenuParams, TabbedPanelVariant, MenuVariant

**Results**: All 86 tests still passing (variants registered, controls use theme params)

**Files Modified**:
- `themes/variants.js` - added tabbed_panel_variants (8), menu_variants (6)
- `themes/token_maps.js` - added tab and menu size tokens
- `control_mixins/theme_params.js` - added schemas and hooks
- `controls/.../tabbed-panel.js` - themeable mixin integration
- `controls/.../horizontal-menu.js` - themeable mixin integration
- `types/theme.d.ts` - TabbedPanelParams, MenuParams, variant types
- `types/index.d.ts` - new exports

---

## Phase 5: Control Testing Infrastructure (2026-01-17)

**Goal**: Create comprehensive testing infrastructure for controls covering SSR, theme integration, and client-side behavior

**Implementation**:
- [x] Created `test/helpers/control_test_base.js` - reusable test utilities
- [x] Added 5 dropdown_menu variants to `themes/variants.js`
- [x] Added dropdown_menu schema and hooks to `control_mixins/theme_params.js`
- [x] Refactored `Dropdown_Menu.js` with themeable mixin and token maps
- [x] Created comprehensive `test/controls/dropdown_menu.test.js` with 37 tests

**Test Coverage**:
| Category | Tests |
|----------|-------|
| SSR Structure | 7 tests |
| SSR Options | 4 tests |
| Theme Variants | 5 tests |
| Token Application | 4 tests |
| Data Attributes | 3 tests |
| CSS Classes | 2 tests |
| Spec Override | 1 test |
| Context Theme | 2 tests |
| State Management | 3 tests |
| Activation | 2 tests |
| Accessibility | 2 tests |
| Backward Compat | 2 tests |

**Results**: All 123 theme tests passing (86 existing + 37 new dropdown tests)

**Files Created**:
- `test/helpers/control_test_base.js` - reusable test utilities
- `test/controls/dropdown_menu.test.js` - 37 tests

**Files Modified**:
- `themes/variants.js` - added dropdown_menu_variants (5)
- `control_mixins/theme_params.js` - added dropdown_menu schema and hooks
- `controls/.../Dropdown_Menu.js` - themeable mixin, token maps, JSDoc

---

## Phase 6: Additional Control Theming (2026-01-17)

**Goal**: Apply testing pattern to more controls - Context_Menu and List

**Implementation**:
- [x] Added 3 context_menu variants to `themes/variants.js`
- [x] Added 5 list variants to `themes/variants.js`
- [x] Added schemas and hooks to `control_mixins/theme_params.js`
- [x] Integrated themeable mixin into `Context_Menu.js` and `List.js`
- [x] Created `test/controls/context_menu.test.js` (10 tests)
- [x] Created `test/controls/list.test.js` (19 tests)
- [x] Fixed bug in Context_Menu._features initialization

**Variants Added**:
| Control | Variants |
|---------|----------|
| Context_Menu | default, compact, dark |
| List | default, compact, divided, large, cards |

**Results**: All 153 theme tests passing (2 pending for legacy pattern)

**Files Created**:
- `test/controls/context_menu.test.js` - 10 tests
- `test/controls/list.test.js` - 19 tests

**Files Modified**:
- `themes/variants.js` - added context_menu_variants (3), list_variants (5)
- `control_mixins/theme_params.js` - added schemas and hooks
- `controls/.../context-menu.js` - themeable mixin, fixed bug
- `controls/.../list.js` - themeable mixin

---

## Phase 7: Charting System with Data Binding (2026-01-17)

**Goal**: Create modern chart controls with MVVM data binding and theme support

**Implementation**:
- [x] Created `controls/charts/Chart_Base.js` - abstract base with data binding
- [x] Created `controls/charts/Bar_Chart.js` - grouped/stacked bar charts
- [x] Created `controls/charts/Pie_Chart.js` - pie and donut charts
- [x] Created `controls/charts/Area_Chart.js` - overlap/stacked area charts
- [x] Created `controls/charts/Scatter_Chart.js` - 2D scatter with trend lines
- [x] Created `controls/charts/index.js` - module exports
- [x] Created `controls/charts/README.md` - comprehensive API documentation
- [x] Added 6 chart variants to `themes/variants.js`
- [x] Added chart schema to `control_mixins/theme_params.js`
- [x] Created `test/controls/chart.test.js` with 35 tests
- [x] Fixed critical super() initialization order bug
- [x] Browser verified with demo server

**Chart Types**:
| Chart | Modes | Key Features |
|-------|-------|--------------|
| Bar_Chart | grouped, stacked | Vertical/horizontal orientation |
| Pie_Chart | pie, donut | Segment labels, percentages |
| Area_Chart | overlap, stacked | Fill opacity, border lines, points |
| Scatter_Chart | basic | Trend lines, custom point size |

**Bug Fix - Super() Initialization Order**:
> [!IMPORTANT]
> Chart_Base.super() calls compose_chart() before subclass properties were initialized,
> causing NaN calculations. Fixed by adding default fallbacks in render methods and
> re-rendering after super().

**Results**: All 188 tests passing (35 chart + 153 existing)

**Files Created**:
- `controls/charts/Chart_Base.js` - 485 lines
- `controls/charts/Bar_Chart.js` - 335 lines
- `controls/charts/Pie_Chart.js` - 305 lines
- `controls/charts/Area_Chart.js` - 320 lines
- `controls/charts/Scatter_Chart.js` - 365 lines
- `controls/charts/index.js` - Module exports
- `controls/charts/README.md` - API documentation
- `test/controls/chart.test.js` - 35 tests
- `lab/chart_demo_server.js` - Visual demo server

---

<!-- Add new entries above this line -->


