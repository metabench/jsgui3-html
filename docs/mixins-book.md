# The jsgui3-html Mixins Book

> A comprehensive guide to the mixin system: existing capabilities, proposed enhancements, and the path to a composable control architecture.

---

## Table of Contents

1. [How Mixins Work](#1-how-mixins-work)
2. [Existing Mixins Catalog](#2-existing-mixins-catalog)
   - [Interaction Mixins](#21-interaction-mixins)
   - [Input Mixins](#22-input-mixins)
   - [Layout & Display Mixins](#23-layout--display-mixins)
   - [Lifecycle Mixins](#24-lifecycle-mixins)
   - [Theme Mixins](#25-theme-mixins)
   - [Data Mixins](#26-data-mixins)
   - [Accessibility Mixins](#27-accessibility-mixins)
3. [Mixin Composition Patterns](#3-mixin-composition-patterns)
4. [Future Mixins](#4-future-mixins)
5. [Deep Dive: Drag & Drop Zone](#5-deep-dive-drag--drop-zone)
6. [Mixin System Improvements](#6-mixin-system-improvements)

---

## 1. How Mixins Work

A mixin in jsgui3-html is a **function that takes a control instance and enhances it** with new behavior. Unlike class inheritance (which is single-parent), mixins allow any combination of behaviors to be layered onto any control.

### The Core Pattern

```js
// A mixin is just a function: (ctrl, options?) => void
const my_mixin = (ctrl, options = {}) => {
    // 1. Register on the mixin tracker
    ctrl.__mx = ctrl.__mx || {};
    ctrl.__mx.my_mixin = true;

    // 2. Add isomorphic model data (survives SSR)
    const old_silent = ctrl.view.data.model.mixins.silent;
    ctrl.view.data.model.mixins.silent = true;
    ctrl.view.data.model.mixins.push({ name: 'my-mixin' });
    ctrl.view.data.model.mixins.silent = old_silent;

    // 3. Add properties, methods, event handlers
    ctrl.my_method = () => { /* ... */ };

    // 4. Hook into DOM when active
    ctrl.once_active(() => {
        ctrl.dom.el.addEventListener('click', handler);
    });
};
```

### Key Conventions

| Convention | Purpose |
|---|---|
| `ctrl.__mx.mixin_name = true` | Guards against double-application |
| `setup_isomorphic()` | Registers the mixin in the serializable model so it re-applies after SSR |
| `ctrl.once_active(fn)` | Defers DOM work until the element is live in the page |
| `ctrl.raise('event-name', data)` | Emits a jsgui event (not a DOM event) |
| `body.on(event, handler)` | Listens on the document body for global events (mouseup outside, etc.) |

### Dependency Convention

Mixins can depend on other mixins. The standard guard is:

```js
if (!ctrl.__mx || !ctrl.__mx.press_events) {
    press_events(ctrl);  // apply dependency first
}
```

This means you never need to worry about application order — each mixin pulls in its own dependencies.

---

## 2. Existing Mixins Catalog

There are **39 files** in `control_mixins/`, organized here into 7 functional categories.

---

### 2.1 Interaction Mixins

These handle how the user physically interacts with controls — pressing, dragging, selecting, and navigating.

#### `press-events.js` — The Foundation

**Purpose**: Unifies mouse and touch into a single event model.

**Events raised**: `press-start`, `press-move`, `press-end`, `press-hold`, `press-drag-start`

**How it works**: On `mousedown`/`touchstart`, it captures the start position and attaches `mousemove`/`mouseup` (or touch equivalents) to the **body**. Every `press-move` carries `movement_offset` (displacement from start) and `move_mag` (magnitude). If movement exceeds 4px, `press-drag-start` fires. If the user holds still for 500ms, `press-hold` fires.

```js
press_events(ctrl);
ctrl.on('press-start', e => console.log('started at', e.pos));
ctrl.on('press-hold', e => console.log('long press!'));
ctrl.on('press-drag-start', e => console.log('started dragging'));
```

**Used by**: Nearly every interactive mixin. `dragable`, `pressed-state`, `press-outside`, `selectable`, and `selection-box-host` all depend on it.

---

#### `press-outside.js` — Click-Away Detection

**Purpose**: Detects when a press ends **outside** the control's DOM subtree.

**Events raised**: `press-outside`

**How it works**: Listens to `press-end` on the body, then checks whether the target element is inside the control using `ctrl_target.ancestor(ctrl)`. Only sets up the body listener when someone actually listens for `press-outside` (uses `add-event-listener` meta-events for lazy setup).

```js
press_outside(ctrl);
ctrl.on('press-outside', () => dropdown.close());
```

**Ideal for**: Dropdowns, context menus, modals, popups — anything that should close when the user clicks away.

---

#### `pressed-state.js` — Visual Press Feedback

**Purpose**: Adds a `pressed` CSS class while the control is being pressed.

**How it works**: Depends on `press-events`. On `press-start` sets `ctrl.view.data.model.state = 'pressed'`, on `press-end` sets `'not-pressed'`. A model change listener toggles the CSS class.

```js
pressed_state(ctrl);
// CSS: .my-button.pressed { transform: scale(0.97); }
```

---

#### `dragable.js` — Make Controls Draggable

**Purpose**: Allows a control to be moved by dragging.

**Key options**:
- `bounds`: Constrain drag to a region
- `handle`: Only start drag from a specific child element
- `axis`: Lock to `'x'` or `'y'` axis
- `snap`: Snap to grid positions

**How it works**: On `mousedown`/`touchstart`, captures the initial position of the control. On `mousemove`, calculates the delta and applies it as `position: absolute` with `left`/`top`. Listens on the body for `mouseup` to end.

```js
dragable(ctrl, { axis: 'y', bounds: parent_ctrl });
ctrl.on('drag-start', e => {});
ctrl.on('drag-move', e => { /* e.pos, e.movement_offset */ });
ctrl.on('drag-end', e => {});
```

**Isomorphic**: Registers itself in the model so the server knows this control is draggable.

---

#### `drag_like_events.js` — Low-Level Drag Events

**Purpose**: A more detailed version of `dragable` that provides drag-like events without actually moving the control. Useful for building custom drag behaviors (like drawing selection rectangles or resizing).

**Size**: 539 lines — the most complex interaction mixin, with bounds handling, position confining, and coordinate tracking.

---

#### `selectable.js` — Item Selection

**Purpose**: Adds single and multi-selection to container controls (lists, grids, trees).

**Features**:
- Click to select one item
- Shift+click for range selection
- Ctrl/Cmd+click for toggle selection
- Drag selection (marquee)
- `select_unique` mode (radio-like, only one at a time)

**Events raised**: `change` (on the model when selection changes)

```js
selectable(ctrl, ctrl_handle, { select_unique: true });
// Items get 'selected' class toggled automatically
```

---

#### `selection-box-host.js` — Marquee/Lasso Selection

**Purpose**: Drag on a container to create a selection rectangle that selects all items within it.

**How it works**: On `press-start`, creates a visible selection box control. On `press-move`, resizes it. On `press-end`, determines which child items intersect the box and selects them. Uses `get_ltrb_from_pair` to normalize coordinates.

---

#### `keyboard_navigation.js` — Arrow Key Navigation

**Purpose**: Adds arrow key, Home, End, Enter, and Space navigation to any control.

**Features**:
- Configurable orientation: `'vertical'`, `'horizontal'`, or `'both'`
- Roving tabindex (WAI-ARIA pattern)
- Wrapping at boundaries
- Custom handlers for each direction

```js
keyboard_navigation(ctrl, {
    orientation: 'vertical',
    roving_tabindex: true,
    wrap: true,
    get_items: () => list.get_child_controls(),
    on_activate: () => { /* Enter/Space pressed */ }
});
```

---

#### `fast-touch-click.js` — Touch Latency Elimination

**Purpose**: Eliminates the 300ms click delay on mobile touch devices. Small utility file (1KB).

---

### 2.2 Input Mixins

These handle value management, validation, and formatting for form-like controls.

#### `input_base.js` — Universal Input Behavior

**Purpose**: Gives any control a consistent value API with get/set, focus/blur, disabled/readonly flags.

**Key methods added**:
- `ctrl.get_value()` / `ctrl.set_value(v)` — value access
- `ctrl.focus()` / `ctrl.blur()` / `ctrl.select()` — focus management
- `ctrl.set_flag('disabled', true)` — sets both the property and ARIA attribute
- `ctrl.set_flag('readonly', true)` — same for readonly
- DOM listeners for `input`, `change`, `focus`, `blur` events

**Smart value resolution**: Walks up from `ctrl.value` property → DOM `.value` → model `.value`, depending on what's available.

```js
const { apply_input_base } = require('./input_base');
apply_input_base(ctrl, { value_mode: 'property' });
ctrl.set_value('hello');
ctrl.set_flag('disabled', true);
```

---

#### `input_validation.js` — Validation Pipeline

**Purpose**: Adds async validation with visual feedback and ARIA integration.

**Features**:
- Multiple validators in a pipeline (all must pass)
- Built-in validators: `required`, `min_length`, `max_length`, `pattern`, `email`, `number_range`, `custom`
- States: `none` → `pending` → `valid` | `invalid`
- Auto-validates on `change` or `blur` (configurable)
- Sets `aria-invalid` and CSS classes (`validation-valid`, `validation-invalid`, etc.)

```js
const { apply_input_validation, validators } = require('./input_validation');
apply_input_validation(ctrl, {
    validators: [validators.required, validators.email],
    validate_on_blur: true
});
const result = await ctrl.validate();
// { valid: false, message: 'Invalid email address' }
```

---

#### `input_mask.js` — Input Formatting

**Purpose**: Formats input values in real-time (phone numbers, dates, currency) while preserving raw values.

**Built-in masks**: `date` (YYYY-MM-DD), `phone` ((xxx) xxx-xxxx), `currency` (1,234.56)

**Custom masks**: Pass `{ format: fn, parse: fn }` for any format.

```js
apply_input_mask(ctrl, { mask_type: 'phone' });
ctrl.set_raw_value('5551234567');
// Displays: (555) 123-4567
// ctrl.get_raw_value() → '5551234567'
```

---

#### `field_status.js` — Field State Indicators

**Purpose**: Manages dirty/pristine/touched/untouched states for form fields. Useful for form controls that need to track whether the user has modified a value.

---

#### `input_api.js` — Input API Stub

**Purpose**: Small (475 bytes) shim for input API consistency. Placeholder for future expansion.

---

### 2.3 Layout & Display Mixins

These control how controls are positioned, sized, and displayed.

#### `display.js` — Display Mode Framework

**Purpose**: A comprehensive framework for controls to have multiple display modes organized by categories (size, interactivity, orientation, etc.).

**Key classes**:
- `Ctrl_Display` — The display state of a control
- `Ctrl_Display_Modes` — Collection of available modes
- `Ctrl_Display_Mode_Category` — A mode dimension (size, orientation, etc.)

**Size modes** (from README):
| Mode | Meaning | Example Size |
|------|---------|-------------|
| 0 | Hidden | 0×0 |
| 1 | Minimised | Icon or list item |
| 2 | Small | Fits on a phone |
| 3 | Medium | Quarter to half of a large screen |
| 4 | Large | Full screen or browser window |

```js
display(ctrl, { modes: { size: ['small', 'medium', 'large'] } });
ctrl.display.mode = 'small';
```

**Design intent**: Controls should be able to render differently at each size mode — a calendar might show a month view at "medium" but only a date input at "small". The display system provides the framework for this.

---

#### `display-modes.js` — Display Modes (Draft)

**Purpose**: Lighter version of `display.js`. Currently a stub (51 lines) with design notes. Will mature into a simpler API for the most common display mode patterns.

---

#### `resizable.js` — Resize Handles

**Purpose**: Makes a control resizable by dragging a corner handle.

**Options**: `resize_mode: 'br_handle'` (bottom-right handle — the default and currently only mode).

**How it works**: Adds a resize handle element to the control. On drag, calculates new dimensions and applies them. Supports both mouse and touch.

**Size**: 447 lines — substantial with edge-case handling.

---

#### `resize-handle.js` — Resize Handle Component

**Purpose**: The visual handle element used by `resizable`. A small (1.8KB) helper that creates and styles the actual draggable corner element.

---

#### `popup.js` — Popup Positioning

**Purpose**: Makes a control "pop up" — move from its current flow position to an absolute-positioned popup layer, maintaining its visual position.

**How it works**:
1. Creates a popup layer in the body (if not already present)
2. Measures the control's `getBoundingClientRect()`
3. Places a placeholder where the control was
4. Moves the control to the popup layer at the same screen position
5. Returns an `uncover` function to return it

```js
popup(ctrl);
const replace = ctrl.popup();
// ... later ...
replace(); // puts it back
```

---

#### `coverable.js` — Overlay Covers

**Purpose**: Adds a cover/overlay to a control — useful for modal windows, loading states, or disabled states.

```js
coverable(ctrl);
const cover_ctrl = ctrl.cover(loading_spinner);
// ... later ...
ctrl.uncover();
```

**How it works**: Creates a `cover` div with `background` and `foreground` layers, inserts content into the foreground.

---

#### `bind.js` — Spatial Binding (Draft)

**Purpose**: Bind a control's position/size relative to another control or space. Currently a design document (all comments, no implementation) exploring how to implement:
- Position binding (control A tracks position of control B)
- Size binding (control A fills remaining space next to B)
- Resize event monitoring via `ResizeObserver`

---

#### `virtual_window.js` — Scroll Virtualization

**Purpose**: Provides windowed rendering math for virtual scrolling (only render visible items).

**Key methods**:
- `get_virtual_window_range(scroll_top, item_count)` → `{ start_index, end_index, visible_count }`
- `get_virtual_total_height(item_count)` → total scrollable height
- `set_virtual_window_state({ item_height, viewport_height, buffer })` — update configuration

```js
apply_virtual_window(ctrl, { item_height: 32, height: 400, buffer: 5 });
const range = ctrl.get_virtual_window_range(scrollTop, 10000);
// Only render items range.start_index to range.end_index
```

**Used by**: `virtual_list.js`, `virtual_grid.js` — the high-performance data controls.

---

### 2.4 Lifecycle Mixins

These manage how controls go from HTML → live interactive objects.

#### `activation.js` — The Activation Manager

**Purpose**: The engine that turns static HTML elements into live jsgui controls. This is the core of progressive enhancement / hydration.

**Swap modes**:
| Mode | Behavior |
|------|----------|
| `full` | Replace the element entirely with a control |
| `wrap` | Wrap the element in a control, keeping children |
| `enhance` | Add behavior to the existing element without DOM changes |
| `overlay` | Place the control on top of the element |

**How it works**:
1. Scans a container for elements matching registered selectors (via `swap_registry`)
2. Extracts a spec from `data-*` attributes
3. Constructs the appropriate control class
4. Swaps it in using the configured mode

```js
const manager = new Activation_Manager(context);
const controls = manager.activate(container, { enhancement_mode: 'enhance' });
```

---

#### `swap_registry.js` — Control Registration

**Purpose**: A `Map<selector, { control_class, mode, options }>` that tells the Activation Manager which CSS selectors map to which control classes and swap modes.

```js
const { swap_registry } = require('./swap_registry');
swap_registry.set('[data-control="combo-box"]', {
    control_class: ComboBox,
    mode: 'full'
});
```

---

#### `hydration.js` — Server-Side Rendering Bridge

**Purpose**: Hydrates server-rendered HTML by running the Activation Manager across the page.

**Features**:
- Sync mode: `hydrate(context)` — processes everything immediately
- Async mode with batching: `hydrate(context, { async: true, batch_size: 50 })` — yields to browser between batches via `requestAnimationFrame`
- Progress callbacks: `on_progress(completed, total)`
- Error recovery: `on_error(error, element)` — continues processing remaining elements

---

#### `auto_enhance.js` — MutationObserver Integration

**Purpose**: Watches for new DOM nodes and automatically activates them as jsgui controls.

```js
const observer = enable_auto_enhancement(context, {
    container: document.body,
    immediate: true  // activate existing elements too
});
// Later: disable_auto_enhancement(observer);
```

**How it works**: Creates a `MutationObserver` on `childList` + `subtree`. When nodes are added, runs the Activation Manager on them.

---

#### `mx.js` — Mixin Loader

**Purpose**: Small (1.2KB) utility for loading and applying mixins by name. Maps string names to mixin functions.

---

### 2.5 Theme Mixins

These control visual theming — colors, variants, and CSS variable tokens.

#### `theme.js` — CSS Variable Tokens

**Purpose**: Applies CSS custom properties (variables) to controls for theming.

**Functions**:
- `apply_theme(ctrl, theme)` — Apply a theme by name or token map
- `apply_theme_tokens(ctrl, tokens)` — Set CSS variables directly
- `apply_theme_overrides(ctrl, overrides)` — Layer overrides on top

```js
apply_theme(ctrl, 'dark');                      // name-based
apply_theme(ctrl, { bg: '#1a1a2e', fg: '#eee' }); // token-based
apply_theme(ctrl, {
    name: 'ocean',
    tokens: { primary: '#0ea5e9', surface: '#0f172a' },
    overrides: { radius: '12px' }
});
```

---

#### `themeable.js` — Theme Integration Entry Point

**Purpose**: The primary way controls integrate with the theme system. Resolves params, applies hooks (data-attrs + CSS classes), and stores resolved params.

```js
class Button extends Control {
    constructor(spec) {
        super(spec);
        const params = themeable(this, 'button', spec);
        // params.size === 'medium', params.variant === 'primary'
        this._compose(params);
    }
}
```

**Utilities**: `is_themed(ctrl)`, `get_param(ctrl, 'size', 'medium')`

---

#### `theme_params.js` — Parameter Resolution Engine

**Purpose**: The engine behind `themeable`. Resolves composition parameters by merging (lowest to highest priority):

1. Variant defaults (from `themes/variants.js`)
2. Theme-level params (from `context.theme.params[control_type]`)
3. Spec params (from `spec.params`)

**Validation schemas** for: `window`, `button`, `text_input`, `tabbed_panel`, `accordion`, `tree_view`, `context_menu`, `list`, `chart`

---

### 2.6 Data Mixins

These handle data lifecycle — deletion, composition with selection, and model-view binding.

#### `deletable.js` — Deletable Controls

**Purpose**: Adds a `ctrl.delete()` method that removes the control from the DOM and raises a `'delete'` event.

```js
deletable(ctrl);
ctrl.delete(); // removes + raises event
```

---

#### `selected-deletable.js` — Delete Selected Items

**Purpose**: Combines `selectable` with `deletable` — press Delete key to remove selected items from a container. 1.6KB.

---

#### `selected-resizable.js` — Resize Selected Items

**Purpose**: Combines `selectable` with `resizable` — selected items get resize handles. 1.7KB.

---

#### `model_data_view_compositional_representation.js` — MVC Bridge

**Purpose**: Design exploration (2.3KB) for connecting model data to view composition. How data changes should trigger view re-composition.

---

### 2.7 Accessibility Mixins

#### `a11y.js` — ARIA & Screen Reader Support

**Functions**:
- `apply_role(ctrl, 'listbox')` — Set WAI-ARIA role
- `apply_label(ctrl, 'Select a color')` — Set aria-label
- `apply_focus_ring(ctrl, { include_tabindex: true })` — Focus ring CSS class + tabindex
- `ensure_sr_text(ctrl, 'Close', { add_sr_only: true })` — Add screen-reader-only text span for icon-only buttons

---

#### `link-hovers.js` — Hover Effects

**Purpose**: Tiny (189 bytes) utility for link hover styling. Stub for future expansion.

---

## 3. Mixin Composition Patterns

### Pattern 1: Linear Dependency Chain

```
press-events → pressed-state
press-events → press-outside
press-events → dragable
press-events → selectable → selection-box-host
```

Each mixin checks `ctrl.__mx.press_events` and applies the dependency if missing.

### Pattern 2: Feature Layering

A single control can stack multiple independent mixins:

```js
// A tree node that is selectable, draggable, keyboard-navigable, and has context menus
const tree_node = new Control(spec);
selectable(tree_node, tree_node, { select_unique: false });
dragable(tree_node, { handle: '.drag-handle' });
keyboard_navigation(tree_node, { orientation: 'vertical' });
press_outside(tree_node); // for context menu dismiss
```

### Pattern 3: Composite Mixins

Some mixins are *composites* of others:

```
selected-deletable = selectable + deletable + keyboard (Delete key)
selected-resizable = selectable + resizable
pressed-state      = press-events + CSS class management
```

### Pattern 4: The `__mx` Registry

Every mixin registers itself: `ctrl.__mx.mixin_name = true`. This serves three purposes:
1. **Guard against double-application** — don't apply twice
2. **Feature detection** — other code can check `if (ctrl.__mx.dragable)`
3. **Serialization** — the model knows which mixins to re-apply after hydration

---

## 4. Future Mixins

Based on the controls inventory and identified gaps, these mixins would enable the most impactful new controls.

### 4.1 `droppable` — Drop Zone Behavior

> *See [Section 5](#5-deep-dive-drag--drop-zone) for the full deep-dive.*

**Purpose**: Make any control accept dragged items.

**Why it's separate from `dragable`**: Drag and drop are two sides of a transaction. The source is `dragable`, the target is `droppable`. Keeping them separate means any control can be either, both, or neither.

---

### 4.2 `sortable` — Reorder Items by Dragging

**Purpose**: Drag to reorder child items within a container.

**Use cases**: Reorderable lists, kanban column cards, tab order.

```js
// Proposed API
sortable(list_ctrl, {
    items: () => list_ctrl.get_child_controls(),
    axis: 'y',
    handle: '.drag-handle',   // optional: only drag from handle
    ghost: true,              // show ghost of dragged item
    animation: 200,           // ms for reorder animation
    on_reorder: (from_index, to_index) => data.move(from_index, to_index)
});
```

**Implementation**: Uses `press-events`, tracks drag offset, calculates insertion point by comparing midpoints of siblings, inserts a placeholder, animates the reorder, calls back with new order.

---

### 4.3 `collapsible` — Expand/Collapse Content

**Purpose**: Toggle visibility of content with animation.

```js
collapsible(ctrl, {
    trigger: '.header',      // element that toggles
    content: '.body',        // element that collapses
    animation: 'slide',      // 'slide' | 'fade' | 'none'
    initial: 'collapsed',    // 'expanded' | 'collapsed'
    on_toggle: (expanded) => {}
});
```

**Use cases**: Accordion panels, tree nodes, FAQ sections, sidebar sections.

**Why a mixin, not a control?** Because *many different controls* need collapse — tree nodes, accordion panels, sidebar groups, property editors. Making it a mixin means they all share the same implementation.

---

### 4.4 `editable` — Inline Editing

**Purpose**: Double-click on a display value to edit it in-place.

```js
editable(label_ctrl, {
    trigger: 'dblclick',         // or 'click', 'F2'
    editor_type: 'text_input',   // which control to swap in
    commit_on: ['Enter', 'blur'],
    cancel_on: ['Escape'],
    get_value: () => model.name,
    set_value: (v) => { model.name = v; },
    validate: (v) => v.length > 0
});
```

**Use cases**: Spreadsheet-like data tables, tree node renaming, inline label editing.

---

### 4.5 `tooltip` — Tooltip Behavior

**Purpose**: Show a tooltip on hover/focus with positioning logic.

```js
tooltip(ctrl, {
    content: 'Click to save',      // or a control
    position: 'top',               // auto, top, bottom, left, right
    delay: { show: 300, hide: 100 },
    trigger: 'hover+focus'
});
```

---

### 4.6 `context_menu_host` — Right-Click Menus

**Purpose**: Attach a context menu to any control.

```js
context_menu_host(ctrl, {
    items: [
        { label: 'Cut', shortcut: 'Ctrl+X', action: () => cut() },
        { type: 'separator' },
        { label: 'Delete', variant: 'danger', action: () => del() }
    ],
    on_open: (menu, e) => { /* dynamic items based on selection */ }
});
```

---

### 4.7 `undoable` — Undo/Redo State

**Purpose**: Track state changes and enable undo/redo.

```js
undoable(ctrl, {
    get_state: () => ({ ...model }),
    set_state: (s) => Object.assign(model, s),
    max_history: 50
});
ctrl.undo();
ctrl.redo();
ctrl.can_undo; // boolean
```

---

### 4.8 `loading_state` — Loading/Skeleton States

**Purpose**: Show loading indicators and skeleton placeholders.

```js
loading_state(ctrl, {
    skeleton: true,          // show skeleton while loading
    spinner: true,           // show spinner overlay
    disable_interaction: true
});
ctrl.set_loading(true);
// ... async fetch ...
ctrl.set_loading(false);
```

---

### 4.9 `animatable` — Transition/Animation Helpers

**Purpose**: Fluent API for CSS transitions and keyframe animations.

```js
animatable(ctrl);
await ctrl.animate({ opacity: 0, transform: 'translateY(-10px)' }, 300);
ctrl.transition('height', 'auto', 200);
```

---

### 4.10 `searchable` — Filter/Search Content

**Purpose**: Add search/filter to any container of items.

```js
searchable(container_ctrl, {
    get_items: () => container_ctrl.get_child_controls(),
    get_text: (item) => item.label,
    highlight: true,         // highlight matching text
    debounce: 200
});
container_ctrl.search('foo');
```

---

## 5. Deep Dive: Drag & Drop Zone

This is the most requested missing mixin. Here we design it properly — starting from **how it will be used**, then working backward to implementation.

### 5.1 Usage Scenarios

#### Scenario A: File Upload Zone

```js
const upload_zone = new Control(spec);
droppable(upload_zone, {
    accept: 'files',
    on_drop: (e) => {
        const files = e.native_event.dataTransfer.files;
        upload_service.upload(files);
    }
});
// Visual: dashed border, icon, "Drop files here" text
// On hover: border highlights, text changes to "Release to upload"
```

#### Scenario B: Tree Node as Drop Target

```js
// Each tree node accepts dropped items and inserts them as children
tree.on('node-created', (node) => {
    dragable(node, { handle: '.tree-label' });
    droppable(node, {
        accept: (dragged) => dragged.__type_name === 'tree_node',
        indicator: 'insert-line',   // show a line between nodes
        positions: ['before', 'inside', 'after'],
        on_drop: (e) => {
            const { source, target, position } = e;
            tree.move_node(source.data, target.data, position);
        }
    });
});
```

#### Scenario C: Kanban Board

```js
// Columns accept cards from any column
kanban_columns.forEach(column => {
    droppable(column, {
        accept: '.kanban-card',
        group: 'kanban',           // items within this group can move between zones
        sort: true,                // enable reordering within the column
        on_drop: (e) => {
            const { source_data, target_column, insert_index } = e;
            board.move_card(source_data.id, target_column.id, insert_index);
        }
    });
});
```

#### Scenario D: Dashboard Widget Layout

```js
// Grid cells accept widgets
dashboard_grid.get_cells().forEach(cell => {
    droppable(cell, {
        accept: (dragged) => dragged.__mx.widget,
        max: 1,                    // only one widget per cell
        on_drop: (e) => dashboard.place_widget(e.source, cell.position),
        on_remove: (e) => dashboard.clear_cell(cell.position)
    });
});
```

#### Scenario E: Multi-Select Drag

```js
// Drag multiple selected items at once
selectable(file_list, file_list);
dragable(file_list, {
    multi: true,                   // drag all selected items
    ghost: 'count-badge',         // show "3 items" badge as ghost
});
droppable(folder, {
    accept: '.file-item',
    on_drop: (e) => {
        e.sources.forEach(file => move_to_folder(file, folder));
    }
});
```

### 5.2 High-Level API Design

```js
const droppable = require('./control_mixins/droppable');

droppable(ctrl, {
    // ── What to accept ──
    accept: 'all',                           // string selector, function, 'files', or 'all'
    accept: '.tree-node',                    // CSS selector on the dragged element
    accept: (dragged_ctrl) => boolean,       // function test
    accept: 'files',                         // native file drag

    // ── Visual feedback ──
    indicator: 'highlight',                  // 'highlight' | 'insert-line' | 'ghost' | 'none' | Function
    classes: {
        over: 'drop-zone-over',             // class when draggable hovers over
        active: 'drop-zone-active',         // class when a valid drag is happening anywhere
        invalid: 'drop-zone-invalid'         // class when an invalid drag hovers
    },

    // ── Positioning (for sorted containers) ──
    positions: ['inside'],                   // ['before', 'inside', 'after'] — where relative to target
    sort: false,                             // enable reorder on drop
    axis: 'y',                               // sort axis

    // ── Constraints ──
    group: null,                             // string group name (items move within/between groups)
    max: Infinity,                           // max items this zone accepts
    disabled: false,                         // disable drops

    // ── Callbacks ──
    on_drag_enter: (e) => {},               // a valid item entered the zone
    on_drag_over: (e) => {},                // a valid item is over the zone
    on_drag_leave: (e) => {},               // item left the zone
    on_drop: (e) => {},                      // item was dropped (THE MAIN CALLBACK)
    on_drop_validate: async (e) => true,    // async validation before accepting drop
    can_drop: (e) => true                   // synchronous check
});
```

### 5.3 The Drop Event Object

```js
{
    source: ctrl,               // the dragged control (or null for file drops)
    source_data: any,           // source.drag_data if set
    sources: [ctrl, ...],       // for multi-select drags
    target: ctrl,               // the drop zone control
    target_data: any,           // target.drop_data if set
    position: 'inside',         // 'before' | 'inside' | 'after'
    insert_index: 2,            // calculated insertion index (for sorted)
    native_event: DragEvent,    // the raw browser event
    files: FileList,            // for file drops
    cancelled: false,           // set to true to cancel
    cancel: () => {}            // cancel the drop
}
```

### 5.4 Implementation Strategy

The implementation breaks into 4 layers:

#### Layer 1: Drag Data Transfer (`drag_transfer.js`)

A global singleton that tracks the current drag operation — what's being dragged, where it started, and metadata.

```js
// Internal module - not a mixin
const drag_transfer = {
    active: false,
    source: null,
    source_data: null,
    sources: [],              // for multi-select
    start_pos: null,
    group: null,
    
    begin(source, data, group) { ... },
    end() { ... },
    is_active() { return this.active; },
    get_source() { return this.source; }
};
```

**Why a singleton?** Because drag-and-drop is a global operation — only one drag can happen at a time, and the drop zone needs to know what's being dragged even though it didn't initiate the drag.

#### Layer 2: Enhanced `dragable` (`dragable.js` update)

The existing `dragable` mixin needs a small extension to participate in the transfer protocol:

```js
// Added to existing dragable.js
dragable(ctrl, {
    // ... existing options ...
    drag_data: { id: 123, type: 'task' },  // NEW: data carried with the drag
    group: 'kanban',                        // NEW: group for zone matching
    multi: false,                           // NEW: drag all selected
    ghost: true,                            // NEW: show a drag ghost
    on_drag_start: (e) => {
        drag_transfer.begin(ctrl, opts.drag_data, opts.group);
    }
});
```

#### Layer 3: The `droppable` Mixin (`droppable.js` — new file)

```js
const droppable = (ctrl, opts = {}) => {
    ctrl.__mx = ctrl.__mx || {};
    ctrl.__mx.droppable = true;
    
    // Store config
    ctrl._drop_config = { ...defaults, ...opts };
    
    // Register with global drop zone registry
    drop_zone_registry.register(ctrl);
    
    ctrl.once_active(() => {
        const el = ctrl.dom.el;
        
        // ── Native drag events (for file drops and cross-window) ──
        el.addEventListener('dragenter', handle_drag_enter);
        el.addEventListener('dragover', handle_drag_over);
        el.addEventListener('dragleave', handle_drag_leave);
        el.addEventListener('drop', handle_drop);
        
        // ── jsgui internal drag events (for control-to-control) ──
        // These are checked via press-move polling
    });
    
    function handle_drag_enter(e) {
        if (!accepts(e)) return;
        e.preventDefault();
        ctrl.add_class(opts.classes?.over || 'drop-zone-over');
        opts.on_drag_enter?.({ native_event: e, target: ctrl });
    }
    
    function handle_drag_over(e) {
        if (!accepts(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (opts.sort) {
            update_insert_indicator(e);
        }
    }
    
    function handle_drop(e) {
        e.preventDefault();
        ctrl.remove_class(opts.classes?.over || 'drop-zone-over');
        
        const drop_event = build_drop_event(e);
        if (opts.can_drop && !opts.can_drop(drop_event)) return;
        
        opts.on_drop?.(drop_event);
        drag_transfer.end();
    }
    
    function accepts(e) {
        // Check accept rules against drag_transfer or native dataTransfer
        const { accept } = ctrl._drop_config;
        if (accept === 'all') return true;
        if (accept === 'files') return e.dataTransfer?.types?.includes('Files');
        if (typeof accept === 'function') return accept(drag_transfer.get_source());
        if (typeof accept === 'string') {
            const source = drag_transfer.get_source();
            return source?.dom?.el?.matches?.(accept);
        }
        return false;
    }
};
```

#### Layer 4: Drop Zone Registry (`drop_zone_registry.js`)

For jsgui-internal drags (not native `DragEvent`), we need a way to hit-test which drop zone the cursor is over:

```js
const drop_zone_registry = {
    zones: new Set(),
    
    register(ctrl) { this.zones.add(ctrl); },
    unregister(ctrl) { this.zones.delete(ctrl); },
    
    // Called during press-move to find which zone the cursor is over
    hit_test(pos) {
        for (const zone of this.zones) {
            if (!zone.dom?.el) continue;
            const rect = zone.dom.el.getBoundingClientRect();
            if (pos[0] >= rect.left && pos[0] <= rect.right &&
                pos[1] >= rect.top && pos[1] <= rect.bottom) {
                return zone;
            }
        }
        return null;
    }
};
```

### 5.5 Composition Examples

#### Tree Node = droppable + dragable + selectable + collapsible

```js
class Tree_Node extends Control {
    _compose() {
        // Each node is independently draggable and droppable
        dragable(this, {
            handle: '.node-label',
            drag_data: this.node_data,
            group: 'tree'
        });
        
        droppable(this, {
            accept: (source) => {
                // Can't drop onto self or own descendants
                return source !== this && !this.is_descendant_of(source);
            },
            positions: ['before', 'inside', 'after'],
            indicator: 'insert-line',
            on_drop: (e) => {
                this.tree.move_node(e.source_data, this.node_data, e.position);
            }
        });
        
        selectable(this, this, { select_unique: false });
        
        collapsible(this, {
            trigger: '.expand-icon',
            content: '.children-container',
            initial: this.node_data.expanded ? 'expanded' : 'collapsed'
        });
    }
}
```

#### Data Table Row = dragable + selectable + editable + context_menu_host

```js
class Data_Table_Row extends Control {
    _compose() {
        selectable(this, this);
        dragable(this, {
            axis: 'y',
            ghost: true,
            drag_data: this.row_data
        });
        
        // Double-click any cell to edit
        this.cells.forEach(cell => {
            editable(cell, {
                trigger: 'dblclick',
                editor_type: cell.column.editor || 'text_input',
                get_value: () => this.row_data[cell.column.key],
                set_value: (v) => {
                    this.row_data[cell.column.key] = v;
                    this.raise('cell-edit', { column: cell.column, value: v });
                }
            });
        });
        
        context_menu_host(this, {
            items: [
                { label: 'Edit Row', action: () => this.edit() },
                { label: 'Delete', variant: 'danger', action: () => this.delete() }
            ]
        });
    }
}
```

### 5.6 Native vs Internal Drag

The `droppable` mixin must handle **two worlds**:

| Aspect | Native (HTML5 DnD API) | Internal (jsgui press-events) |
|---|---|---|
| **When** | Files from OS, cross-window, cross-app | Control-to-control within same page |
| **Events** | `dragenter`, `dragover`, `dragleave`, `drop` | `press-move` + hit-testing |
| **Data** | `dataTransfer` object | `drag_transfer` singleton |
| **Ghost** | Browser-provided | Custom ghost element |
| **Advantages** | Works with OS, file drops | Full control over visuals, no ghost flicker |

The implementation listens for **both** — native events handle file drops and cross-window scenarios, while the internal system handles the smoother in-page experience.

---

## 6. Mixin System Improvements

### 6.1 Problem: Mixins Can Conflict

Currently, if two mixins both add a `ctrl.value` property, the second one silently overwrites the first. There's no detection or warning.

**Proposed solution — Feature Namespacing**:

```js
// Instead of directly attaching:
ctrl.value = 'hello';

// Mixins should use a namespace:
ctrl._features = ctrl._features || {};
ctrl._features.input_base = {
    get_value: () => ...,
    set_value: (v) => ...
};

// Then a convenience layer:
Object.defineProperty(ctrl, 'value', {
    get() { return ctrl._features.input_base.get_value(); },
    set(v) { ctrl._features.input_base.set_value(v); }
});
```

### 6.2 Problem: No Mixin Removal

Once applied, a mixin can't be cleanly removed. Some mixins add event listeners, DOM elements, and properties that can't be undone.

**Proposed solution — Disposable Mixins**:

```js
const my_mixin = (ctrl, opts) => {
    const listeners = [];
    const elements = [];
    
    // Track everything we add
    const handler = (e) => { ... };
    ctrl.on('press-start', handler);
    listeners.push(['press-start', handler]);
    
    // Return a dispose function
    return {
        dispose() {
            listeners.forEach(([name, fn]) => ctrl.off(name, fn));
            elements.forEach(el => el.remove());
            delete ctrl.__mx.my_mixin;
        }
    };
};
```

### 6.3 Problem: No Lifecycle Hooks

Mixins currently have no consistent hook for "when the control is about to be destroyed" or "when the control becomes visible."

**Proposed solution — Mixin Lifecycle Protocol**:

```js
// Mixins can register lifecycle hooks
ctrl._mixin_hooks = ctrl._mixin_hooks || {
    on_attach: [],    // when added to DOM
    on_detach: [],    // when removed from DOM
    on_show: [],      // when becoming visible
    on_hide: [],      // when becoming hidden
    on_dispose: []    // when control is destroyed
};

// A mixin registers:
ctrl._mixin_hooks.on_dispose.push(() => {
    clearInterval(polling_interval);
    observer.disconnect();
});
```

### 6.4 Problem: Mixin Dependencies Are Implicit

There's no formal way to declare that mixin A depends on mixin B. The current pattern is an imperative check-and-apply:

```js
if (!ctrl.__mx?.press_events) press_events(ctrl);
```

**Proposed solution — Formal Dependencies**:

```js
// Each mixin declares metadata
droppable.mixin_meta = {
    name: 'droppable',
    depends: ['press_events'],
    conflicts: [],
    provides: ['on_drop', 'accept_drop']
};

// A central apply function resolves the graph
function apply_mixin(ctrl, mixin, opts) {
    const meta = mixin.mixin_meta || {};
    
    // Auto-apply dependencies
    (meta.depends || []).forEach(dep => {
        if (!ctrl.__mx?.[dep]) {
            const dep_mixin = mixin_registry.get(dep);
            if (dep_mixin) apply_mixin(ctrl, dep_mixin);
        }
    });
    
    // Check conflicts
    (meta.conflicts || []).forEach(conflict => {
        if (ctrl.__mx?.[conflict]) {
            console.warn(`Mixin "${meta.name}" conflicts with "${conflict}"`);
        }
    });
    
    // Apply
    mixin(ctrl, opts);
}
```

### 6.5 Proposed: Mixin Presets

Common combinations should be packaged as presets:

```js
// presets/interactive_item.js
const interactive_item = (ctrl, opts = {}) => {
    selectable(ctrl, ctrl, opts.selectable);
    keyboard_navigation(ctrl, { orientation: 'vertical', ...opts.keyboard });
    press_events(ctrl);
    if (opts.draggable) dragable(ctrl, opts.draggable);
    if (opts.droppable) droppable(ctrl, opts.droppable);
    if (opts.deletable) deletable(ctrl);
    if (opts.editable) editable(ctrl, opts.editable);
    a11y.apply_role(ctrl, opts.role || 'option');
    a11y.apply_focus_ring(ctrl, { include_tabindex: true });
};

// Usage:
interactive_item(tree_node, {
    draggable: { handle: '.label' },
    droppable: { accept: '.tree-node' },
    editable: { trigger: 'dblclick' },
    role: 'treeitem'
});
```

### 6.6 Proposed: Feature Mixins (Cross-Cutting Concerns)

Beyond individual mixins, there's a need for **feature mixins** — higher-level behaviors that coordinate multiple mixins to deliver a complete feature across diverse controls.

```js
// feature: virtualized rendering
// Works on ANY container: list, grid, tree, table
const virtualized = (container_ctrl, opts) => {
    apply_virtual_window(container_ctrl, opts);
    
    // Override content rendering to use windowing
    const original_compose = container_ctrl._compose_items;
    container_ctrl._compose_items = (items) => {
        const range = container_ctrl.get_virtual_window_range(
            container_ctrl.scroll_top, items.length
        );
        const visible = items.slice(range.start_index, range.end_index);
        original_compose.call(container_ctrl, visible);
    };
    
    // Attach scroll listener to update window
    container_ctrl.on('scroll', (e) => {
        container_ctrl._compose_items(container_ctrl._all_items);
    });
};
```

This approach — wrapping/extending existing composition — means **any container** can opt into virtualization without being specially coded for it.

---

## Summary & Priority Roadmap

### What Exists (39 files, 7 categories)

| Category | Count | Maturity |
|----------|-------|----------|
| Interaction | 9 | **Strong** — press-events chain is solid |
| Input | 5 | **Strong** — validation + masking pipeline works |
| Layout/Display | 8 | **Mixed** — virtual_window solid, display/bind still evolving |
| Lifecycle | 5 | **Strong** — activation → hydration pipeline complete |
| Theme | 3 | **Strong** — param resolution + CSS vars system works |
| Data | 4 | **Light** — functional but minimal |
| A11y | 2 | **Good start** — role/label/focus-ring covered |

### Priority Build Order for New Mixins

| Priority | Mixin | Enables |
|----------|-------|---------|
| **1** | `droppable` | File uploads, tree reorder, kanban, dashboards |
| **2** | `sortable` | Reorderable lists, kanban columns, tab order |
| **3** | `collapsible` | Accordion, tree expand/collapse, sidebar groups |
| **4** | `editable` | Inline editing in tables, tree renaming, label editing |
| **5** | `context_menu_host` | Right-click menus on any control |
| **6** | `tooltip` | Tooltips on any control |
| **7** | `loading_state` | Skeleton screens, spinners, disabled-while-loading |
| **8** | `searchable` | Filter/search in lists, trees, tables |
| **9** | `undoable` | Undo/redo in editors, forms, drawing tools |
| **10** | `animatable` | Smooth transitions for any control |

### System Improvements Priority

1. **Disposable mixins** (return cleanup function) — small change, big impact
2. **Feature detection** (`ctrl.has_feature('droppable')`) — cleaner than `__mx`
3. **Mixin presets** — reduces boilerplate for common patterns
4. **Lifecycle hooks** — proper cleanup on destroy
5. **Formal dependencies** — future-proofing as the mixin count grows
