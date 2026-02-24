# Controls

The `controls/` directory contains all pre-built UI components in jsgui3-html. Every control is isomorphic — it renders server-side HTML and activates client-side interactivity with the same code.

## Directory Structure

```
controls/
├── controls.js                          # Main exports (require this)
├── _core.js                             # Core control re-exports
├── control-transformer.js               # Transform utilities
│
├── organised/
│   ├── 0-core/                          # Foundation controls
│   │   ├── 0-basic/
│   │   │   ├── 0-native-compositional/  # Thin wrappers around <input>, <button>, etc.
│   │   │   └── 1-compositional/         # Composed from multiple elements
│   │   └── 1-advanced/                  # Complex core controls (Canvas, Login, Vector)
│   │
│   └── 1-standard/                      # Application-level controls
│       ├── 0-viewer/                    # Read-only display (Property_Viewer, Markdown)
│       ├── 1-editor/                    # Form/editing (Form_Container, Code_Editor, Rich_Text)
│       ├── 2-misc/                      # Utility controls (arrows, selectors)
│       ├── 3-page/                      # Full-page layouts (Standard_Web_Page)
│       ├── 4-data/                      # Data display (Data_Table, Charts, Dashboards)
│       ├── 5-ui/                        # UI components (Toolbar, Wizard, Trees, Toast)
│       └── 6-layout/                    # Layout containers (Modal, Drawer, Tabs, Window)
│
├── base/                                # Legacy base controls
├── charts/                              # Legacy chart controls
├── connected/                           # Data-connected controls (Data_Grid)
├── matrix/                              # Matrix/spreadsheet controls
├── old/                                 # Deprecated controls
└── swaps/                               # Control swap registry
```

## Usage

```javascript
const controls = require('jsgui3-html/controls/controls');
const { Button, Modal, Data_Table, Tabbed_Panel } = controls;

const ctx = new jsgui.Page_Context();
const btn = new Button({ context: ctx, text: 'Click me' });
```

Or import individual controls directly:

```javascript
const Modal = require('jsgui3-html/controls/organised/1-standard/6-layout/modal');
```

## Control Tiers

### Core: Native Compositional (`0-core/0-basic/0-native-compositional/`)

Thin wrappers around native HTML elements with added MVVM capabilities:

| Control | Element | Description |
|---------|---------|-------------|
| `Button` | `<button>` | Standard button with press events |
| `Checkbox` | `<input type="checkbox">` | Boolean toggle |
| `Text_Input` | `<input type="text">` | Single-line text entry |
| `Textarea` | `<textarea>` | Multi-line text entry |
| `Number_Input` | `<input type="number">` | Numeric entry with constraints |
| `Range_Input` | `<input type="range">` | Slider for numeric ranges |
| `Date_Picker` | `<input type="date">` | Date selection |
| `Dropdown_List` | `<select>` | Drop-down selection |
| `Select_Options` | `<select>` | Options-based selection |
| `File_Upload` | `<input type="file">` | File selection |
| `Radio_Button` | `<input type="radio">` | Radio option |
| `Progress_Bar` | `<progress>` | Determinate progress indicator |
| `Meter` | `<meter>` | Scalar measurement display |
| `Email_Input` | `<input type="email">` | Email-validated input |
| `Password_Input` | `<input type="password">` | Masked text input |
| `Tel_Input` | `<input type="tel">` | Telephone number input |
| `Url_Input` | `<input type="url">` | URL-validated input |
| `Icon` | `<i>` / `<span>` | Icon display |

### Core: Compositional (`0-core/0-basic/1-compositional/`)

Multi-element controls assembled from simpler parts:

| Control | Description |
|---------|-------------|
| `Toggle_Switch` | On/off switch (composed from checkbox + visual) |
| `Toggle_Button` | Stateful push button |
| `Number_Stepper` | Increment/decrement numeric input |
| `Rating_Stars` | Star-based rating selector |
| `Badge` | Notification count indicator |
| `Avatar` | User image/initials display |
| `Chip` | Dismissible label tag |
| `Spinner` | Loading indicator |
| `Skeleton_Loader` | Placeholder shimmer |
| `Separator` | Visual divider |
| `Calendar` | Month grid date picker |
| `Month_View` | Calendar month display |
| `Time_Picker` | Hour/minute selector |
| `Datetime_Picker` | Combined date + time |
| `Combo_Box` | Searchable dropdown |
| `Grid` | CSS grid layout helper |
| `List` | Ordered/unordered list |
| `Scroll_View` | Scrollable container |
| `Scrollbar` | Custom scrollbar |
| `Context_Menu` | Right-click menu |
| `Dropdown_Menu` | Trigger-activated menu |
| `Menu_Node` | Menu tree node |
| `Radio_Button_Group` | Grouped radio options |
| `Color_Picker` | Color selection (HSL wheel, palette, hex) |
| `Color_Picker_Tabbed` | Tabbed color picker (wheel/palette/hex) |
| `Color_Grid` | Grid of color swatches |
| `Color_Palette` | Named color palette |
| `Stepped_Slider` | Discrete-step slider |
| `Item_Selector` | Multi-item selection list |
| `Status_Indicator` | Status dot/icon |
| `Indicator` | Generic indicator |
| `Validation_Status_Indicator` | Pass/fail/warning indicator |
| `Text_Field` | Label + input combination |
| `Text_Item` | Simple text display |
| `Plus_Minus_Toggle_Button` | +/- toggle |

### Standard: Editor (`1-standard/1-editor/`)

Form building and content editing:

| Control | Description |
|---------|-------------|
| `Form_Container` | Auto-layout form with validation routing |
| `Form_Field` | Label + input + validation display |
| `Form_Designer` | Visual form builder |
| `Property_Editor` | Key-value property editing |
| `Property_Grid` | Grid-based property editor |
| `Code_Editor` | Syntax-highlighted code editing |
| `Rich_Text_Editor` | WYSIWYG text editing |
| `Tag_Input` | Tag/chip entry field |
| `Object_Editor` | JSON object editing |
| `Inline_Validation_Message` | Contextual validation feedback |

### Standard: Data (`1-standard/4-data/`)

Data display, visualization, and interaction:

| Control | Description |
|---------|-------------|
| `Data_Table` | Sortable, filterable data grid with column priority |
| `Virtual_List` | Windowed rendering for large lists |
| `Virtual_Grid` | Windowed rendering for grid data |
| `Tree_View` | Hierarchical data display |
| `Tree_Table` | Tree + table hybrid |
| `Key_Value_Table` | Key-value pair display |
| `Status_Dashboard` | Metric card grid dashboard |
| `Stat_Card` | Single metric display card |
| `Activity_Feed` | Timeline activity stream |
| `Log_Viewer` | Scrolling log output |
| `Inline_Cell_Edit` | In-place cell editing |
| `Data_Filter` | Filter control panel |
| `Line_Chart` | SVG line chart |
| `Bar_Chart` | SVG bar chart |
| `Pie_Chart` | SVG pie/donut chart |
| `Area_Chart` | SVG area chart |
| `Sparkline` | Inline mini chart |
| `Gauge` | Radial gauge meter |

### Standard: UI (`1-standard/5-ui/`)

Interactive UI components:

| Control | Description |
|---------|-------------|
| `Toolbar` | Button toolbar with overflow menu |
| `Wizard` | Multi-step workflow |
| `Toast` | Non-blocking notification |
| `Tooltip` | Hover information popup |
| `Alert_Banner` | Dismissible alert strip |
| `Breadcrumbs` | Navigation breadcrumb trail |
| `Pagination` | Page navigation controls |
| `Search_Bar` | Search input with suggestions |
| `Command_Palette` | Keyboard-driven command search |
| `Tree` | Interactive tree view |
| `File_Tree` | File system tree browser |
| `Horizontal_Menu` | Menu bar |
| `Horizontal_Slider` | Range slider |
| `Pop_Over` | Floating content panel |
| `Reorderable_List` | Drag-to-reorder list |
| `Console_Panel` | Terminal-style output |
| `Status_Bar` | Fixed status strip |
| `Toolbox` | Collapsible tool panel |
| `Split_Button` | Button + dropdown combo |
| `Icon_Button` | Button with icon |
| `Link_Button` | Styled link as button |
| `Filter_Chips` | Toggleable filter tags |

### Standard: Layout (`1-standard/6-layout/`)

Layout containers and structural components:

| Control | Description |
|---------|-------------|
| `Modal` | Dialog overlay with focus trap |
| `Drawer` | Sliding panel overlay |
| `Tabbed_Panel` | Tab-switching container |
| `Split_Pane` | Resizable two-panel layout |
| `Master_Detail` | List + detail two-panel layout |
| `Sidebar_Nav` | Collapsible sidebar navigation |
| `Window` | Floating draggable/resizable window |
| `Window_Manager` | Z-index and positioning manager |
| `Accordion` | Collapsible section panels |
| `Panel` | Basic content panel |
| `Titled_Panel` | Panel with header |
| `Group_Box` | Bordered content group |
| `Stack` | Vertical stacking layout |
| `Grid_Gap` | CSS grid with gap control |
| `Center` | Centered content |
| `Single_Line` | Horizontal inline layout |
| `Cluster` | Flexbox cluster layout |
| `Vertical_Expander` | Expandable vertical section |
| `Stepper` | Step indicator |
| `Tile_Slider` | Horizontal tile carousel |
| `Title_Bar` | Application title bar |

## Adaptive Layout

Most standard controls support device-adaptive layout with these common properties:

```javascript
const modal = new Modal({
    context: ctx,
    layout_mode: 'auto',       // 'auto' | 'phone' | 'tablet' | 'desktop'
    phone_breakpoint: 600,     // Width threshold for phone mode
    phone_fullscreen: true     // Phone-specific behavior (varies per control)
});
```

All adaptive behaviors are **overridable defaults**. CSS uses `[data-layout-mode="phone"]` attribute selectors rather than scattered `@media` queries, following the device-adaptive composition model described in `docs/books/device-adaptive-composition/`.

Controls with adaptive support: `Master_Detail`, `Split_Pane`, `Form_Container`, `Modal`, `Toolbar`, `Sidebar_Nav`, `Drawer`, `Wizard`, `Data_Table`, `Window`, `Tabbed_Panel`, `Status_Dashboard`.

## Stability

Controls exported from `controls.js` are organized by stability:

- **Stable** — the main `controls` object: safe for production
- **Experimental** — `controls.experimental`: API may change
- **Deprecated** — `controls.deprecated`: use canonical names instead (e.g., `Form_Field` not `FormField`)

## Related Documentation

- [AGENT.md](organised/AGENT.md) — Control creation guide (naming, testing, theming)
- [docs/controls/INDEX.md](../docs/controls/INDEX.md) — Controls documentation index
- [docs/books/device-adaptive-composition/](../docs/books/device-adaptive-composition/) — Multi-device composition book
- [docs/theming_and_styling_system.md](../docs/theming_and_styling_system.md) — Theme tokens and styling
- [control_mixins/README.md](../control_mixins/README.md) — Behavior mixins catalog






