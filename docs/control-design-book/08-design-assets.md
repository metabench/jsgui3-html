# Chapter 8: Design Assets Inventory

> A catalogue of all visual reference materials available for designing jsgui3-html controls.

---

## 8.1 SVG Design Mockups (In This Book)

These SVGs live inside the `docs/control-design-book/` folder:

| File | Visual Mode | Content |
|------|-------------|---------|
| [svg-01-design-spectrum.svg](./svg-01-design-spectrum.svg) | Diagram | The visual design spectrum from skeuomorphic to flat |
| [svg-02-vs-classic-buttons.svg](./svg-02-vs-classic-buttons.svg) | Win32 Classic | Raised 3D buttons (5 states), flat toolbar buttons with icons, sunken text inputs, combobox, checkboxes (2 states), radio buttons (2 states), group box with etched border, tab control (active + inactive tabs), horizontal scrollbar, chunky green progress bar, status bar sections |
| [svg-03-vs-classic-windows.svg](./svg-03-vs-classic-windows.svg) | Win32 Classic | MDI main window (gradient title bar, menu bar with access keys, toolbar with grip and icon buttons, code editor with line numbers and syntax highlighting, status bar); Properties dialog (tab control, form fields, dialog buttons with default focus); Solution Explorer tool window (tree view with icons and selection highlight); Properties panel (object selector, category grid, value cells, description pane) |
| [svg-04-modern-dark-buttons.svg](./svg-04-modern-dark-buttons.svg) | Modern Dark | Gradient buttons, outlined buttons, pill-shaped buttons, icon buttons, with drop shadows and hover states |
| [svg-05-glassmorphism-panels.svg](./svg-05-glassmorphism-panels.svg) | Glassmorphism | Analytics card with mini-chart, profile card with avatar and stats, notification panel with badge, quick settings form panel, system status panel |
| [svg-06-theme-token-flow.svg](./svg-06-theme-token-flow.svg) | Diagram | How tokens flow from theme → variant registry → themeable mixin → control → DOM |
| [svg-07-mvvm-layers.svg](./svg-07-mvvm-layers.svg) | Diagram | The three-layer model architecture: data.model → view.data.model → DOM |
| [svg-08-control-modes-comparison.svg](./svg-08-control-modes-comparison.svg) | Mixed | Same button, input, window, and progress bar in 4 visual modes side-by-side |
| [svg-09-ai-improvement-loop.svg](./svg-09-ai-improvement-loop.svg) | Diagram | The 6-step AI improvement methodology flowchart |

---

## 8.2 SVG Design Mockups (In `docs/design-mockups/`)

These SVGs live in the shared `docs/design-mockups/` folder. They were the earlier design explorations that informed this book:

| File | Visual Mode | Content |
|------|-------------|---------|
| [button_designs.svg](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/design-mockups/button_designs.svg) | Modern gradient | Gradient fill, outlined, pill-shaped, and icon buttons with shadow definitions |
| [card_panel_designs.svg](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/design-mockups/card_panel_designs.svg) | Glassmorphism dark | Analytics overview card, profile card with stats, notification panel, quick settings form, system status panel |
| [input_field_designs.svg](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/design-mockups/input_field_designs.svg) | Modern dark | Text inputs, search field, password field, textarea, validation states |
| [progress_gauge_designs.svg](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/design-mockups/progress_gauge_designs.svg) | Modern | Linear progress bars, circular gauges, multi-segment progress |
| [toggle_slider_designs.svg](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/design-mockups/toggle_slider_designs.svg) | Modern | Toggle switches, sliders, range inputs |
| [vs_classic_buttons.svg](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/design-mockups/vs_classic_buttons.svg) | Win32 Classic | (Same content as svg-02 in this book — buttons, toolbar, inputs, tabs, scrollbars, progress) |
| [vs_classic_windows.svg](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/design-mockups/vs_classic_windows.svg) | Win32 Classic | (Same content as svg-03 in this book — MDI window, dialog, tool windows) |

---

## 8.3 Screenshots and Raster Images

### Window Design Screenshots (in `docs/designs/`)

| File | Description |
|------|-------------|
| [window_current_design.png](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/designs/window_current_design.png) | Current default window control — blue gradient title bar with circular buttons |
| [window_redesign_design.png](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/designs/window_redesign_design.png) | Redesigned window — dark theme, macOS-style traffic-light buttons |
| [window_redesigned.png](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/designs/window_redesigned.png) | Live screenshot of the redesigned window on graph paper background |
| [window_designs_preview.webp](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/designs/window_designs_preview.webp) | Side-by-side comparison of current and redesigned window |

### Reference UI Images

User-provided dark-mode UI control reference images showing targets for the modern dark visual mode:

**Controls shown:**
- Button (primary, secondary, outline variants)
- Text input with placeholder
- Notifications toggle (on/off switch)
- Dark mode toggle
- Dropdown menu with options list
- Slider/range with percentage label
- Number stepper with ± buttons
- Checkbox group (checked, unchecked, indeterminate)
- Radio button group (selected, unselected)
- Badges with labels (NEW, PRO, 99+)
- Progress bar with gradient fill
- Five-star rating (filled, half, empty)
- Chip/tag components with × close buttons

---

## 8.4 Documentation Files

These documents in `docs/` provide context for the design work:

| File | Lines | Content |
|------|-------|---------|
| [theming_and_styling_system.md](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/theming_and_styling_system.md) | 67 | Tokenized CSS variables, CSS layering strategy, theme context overrides |
| [THEME_SYSTEM_EXTENSION_ROADMAP.md](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/THEME_SYSTEM_EXTENSION_ROADMAP.md) | ~1700 | Complete roadmap for extending the theme system: variant registries, inheritance, token-to-CSS mapping |
| [MVC_MVVM_Developer_Guide.md](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/MVC_MVVM_Developer_Guide.md) | ~800 | Three-layer model architecture, bindings, transforms, computed properties |
| [controls_expansion_ideas.md](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/controls_expansion_ideas.md) | ~700 | Ideas for 40+ new controls with priority levels and API designs |
| [mixins-book.md](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/mixins-book.md) | — | Mixin system documentation |
| [property-value-editors-book.md](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/property-value-editors-book.md) | — | Property editor controls |
| [color-picker-book/](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/color-picker-book/) | 11 chapters | Comprehensive color picker design guide (already in book format) |

---

## 8.5 Source Code Files

Key source files for understanding and modifying the theme system:

| File | Purpose |
|------|---------|
| [theme.js](file:///c:/Users/james/Documents/repos/jsgui3-html/control_mixins/theme.js) | `apply_theme_tokens`, `apply_theme`, `normalize_token_key` |
| [themeable.js](file:///c:/Users/james/Documents/repos/jsgui3-html/control_mixins/themeable.js) | `themeable` mixin, `get_theme_params` |
| [theme_params.js](file:///c:/Users/james/Documents/repos/jsgui3-html/control_mixins/theme_params.js) | `resolve_params` — the merge-priority function |
| [variants.js](file:///c:/Users/james/Documents/repos/jsgui3-html/themes/variants.js) | Button, Window, Panel, Input, Nav, Menu variant registries |
| [token_maps.js](file:///c:/Users/james/Documents/repos/jsgui3-html/themes/token_maps.js) | Token → CSS variable mapping |

---

## 8.6 Asset Creation Guidelines

When creating new design assets:

### SVG Files
- **File naming:** `svg-{number}-{descriptive-name}.svg` (e.g., `svg-10-tabcontrol-designs.svg`)
- **ViewBox:** Use `viewBox="0 0 800 700"` for landscape designs
- **Fonts:** Use Tahoma for Win32 designs, Inter for modern designs
- **Colors:** Use the exact token values from this book's color references
- **Annotations:** Include a "Design Notes" or "jsgui3 Mapping Notes" panel in the SVG

### Raster Images
- **PNG** for screenshots with sharp text (lossless)
- **WebP** for previews and comparisons (good compression)

### Design Mockup Placement
- **Book-specific SVGs:** In `docs/control-design-book/`
- **Shared/reusable SVGs:** In `docs/design-mockups/`
- **Screenshots:** In `docs/designs/`
