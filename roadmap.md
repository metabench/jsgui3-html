# jsgui3-html Roadmap

This roadmap outlines the development priorities for jsgui3-html, organized by phase. For detailed improvement checklists, see `docs/jsgui3_html_improvement_plan.md`.

## Phase 1: Core & Reliability (Foundation)

**Goal:** Ensure all basic controls are correct, accessible, and well-tested.

- [x] Native input controls: textarea, number, range, progress, meter, email, password, tel, url
- [x] Compositional basics: toggle switch, badge, spinner, skeleton loader, inline validation message
- [x] Baseline a11y on core inputs (ARIA roles, labels, focus states, keyboard navigation mixin)
- [x] Fix known control bugs (checkbox sync, naming normalization)
- [x] Deprecation aliases for renamed controls (`FormField` → `Form_Field`)
- [ ] Comprehensive unit tests for all core controls (target: >80% coverage)
- [ ] Complete `parse_mount` adoption across controls to reduce composition code

## Phase 2: Data & Forms

**Goal:** First-class data display and form building.

- [x] Data_Table with sort, filter, pagination, column priority hiding
- [x] Virtual_List / Virtual_Grid for large datasets with windowed rendering
- [x] Form_Container with validation routing and inline errors
- [x] Tag_Input and Object_Editor (schema-driven)
- [x] Inline_Cell_Edit for in-place table cell editing
- [ ] Complete validation framework integration across all editor controls
- [ ] Schema-driven form generation from JSON definitions

## Phase 3: Layout & Advanced UX

**Goal:** Rich layout primitives and interactive components.

- [x] Split_Pane, Accordion, Drawer, Stepper, Wizard
- [x] Window/panel enhancements: snap, dock, resize, z-index management (Window_Manager)
- [x] Tree and File_Tree with lazy loading, multi-select
- [x] Sidebar_Nav with collapse/overlay modes
- [ ] Tree drag reparenting
- [ ] Multi-document interface (MDI) with tiling

## Phase 4: Theming & Styling

**Goal:** Flexible, complete theming system.

- [x] CSS custom property tokens (`--admin-*`, `--j-*`)
- [x] Token maps for size/spacing/density (`themes/token_maps.js`)
- [x] Theme parameter system (`control_mixins/theme_params.js`, `themeable.js`)
- [x] Admin theme with consistent token usage across all controls
- [ ] Theme profiles (light, dark, high-contrast)
- [ ] Dynamic theme switching at runtime
- [ ] Per-control token override API
- [ ] Theme kitchen-sink showcase page

## Phase 5: Device-Adaptive Composition

**Goal:** Controls work naturally on phone, tablet, and desktop.

- [x] Adaptive layout infrastructure: `layout_mode`, `resolve_layout_mode()`, `_apply_layout_mode()`
- [x] 12 controls upgraded: Master_Detail, Split_Pane, Form_Container, Modal, Toolbar, Sidebar_Nav, Drawer, Wizard, Data_Table, Window, Tabbed_Panel, Status_Dashboard
- [x] Touch target sizing via `--j-touch-target` token
- [x] `[data-layout-mode]` attribute selectors (not scattered `@media` queries)
- [x] Design book: `docs/books/device-adaptive-composition/` (8 chapters)
- [ ] View_Environment service (centralized `layout_mode`, `density_mode`, `interaction_mode`)
- [ ] Container-aware breakpoints (ResizeObserver-based, not just viewport)
- [ ] Touch swipe gestures for Tabbed_Panel and Drawer
- [ ] Viewport-matrix Playwright test harness

## Phase 6: Charts & Visualization

**Goal:** Rich, interactive data visualization.

- [x] Line_Chart, Bar_Chart, Pie_Chart, Area_Chart (SVG-based)
- [x] Sparkline (inline mini-chart)
- [x] Gauge (radial meter)
- [x] Status_Dashboard (auto-layout metric cards)
- [ ] Chart interactivity: tooltips, click handlers, zoom
- [ ] Real-time chart data streaming
- [ ] Responsive chart sizing

## Phase 7: Documentation & Testing

**Goal:** Comprehensive documentation and test coverage.

- [x] Framework README with architecture, API, examples
- [x] MVVM architecture guide
- [x] Data binding API documentation
- [x] Mixin catalog (39 mixins documented)
- [x] Device-adaptive composition book
- [x] Test suite (160+ tests across core, MVVM, mixins, integration)
- [x] Control catalog README with full inventory
- [ ] Per-control API reference documentation
- [ ] Interactive examples gallery (browser-based)
- [ ] Migration guide for breaking changes
- [ ] Contributing guide with architecture walkthrough

## Future Exploration

These are longer-term ideas being considered:

- **Icons system** — server-side icon registration, auto-resizing, easy referencing on both server and client
- **Observable feature parity** — deeper OFP (observable function programming) integration from lang-tools
- **Multi-model controls** — controls supporting multiple simultaneous data models (comparers, diffs)
- **WASM compilation** — tooling for compiling other languages' code to WebAssembly
- **React Native views** — alternative view renderers beyond HTML DOM

## Related Documents

- [docs/jsgui3_html_improvement_plan.md](docs/jsgui3_html_improvement_plan.md) — Detailed improvement plan
- [docs/jsgui3_html_improvement_priorities.md](docs/jsgui3_html_improvement_priorities.md) — Prioritized improvements
- [docs/jsgui3_html_improvement_checklists.md](docs/jsgui3_html_improvement_checklists.md) — Implementation checklists
- [docs/controls_expansion_ideas.md](docs/controls_expansion_ideas.md) — New control ideas
- [docs/books/device-adaptive-composition/](docs/books/device-adaptive-composition/) — Adaptive UI book
