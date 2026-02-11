# Control Mixins

Mixins are composable functions that enhance jsgui3 controls with reusable behavior. Each mixin is a function `(ctrl, options?) => void|cleanup` that attaches properties, event handlers, and DOM behaviors to any control.

> **📘 Full reference**: See [docs/mixins-book.md](../docs/mixins-book.md) for comprehensive API documentation, composition patterns, and deep-dive guides.

---

## Quick Start

```js
const selectable = require('./selectable');
const press_events = require('./press-events');

class MyList extends Control {
    constructor(spec) {
        super(spec);
        selectable(this, null, { multi: true });
        // Now: ctrl.selected, click-to-select, Ctrl+click for multi
    }
}
```

## How Mixins Work

### The Core Pattern

Every mixin follows this structure:

```js
const my_mixin = (ctrl, options = {}) => {
    // 1. Register on the mixin tracker
    ctrl.__mx = ctrl.__mx || {};
    if (ctrl.__mx.my_mixin) return; // guard against double-apply
    ctrl.__mx.my_mixin = true;

    // 2. Record in isomorphic model (survives SSR → client hydration)
    ctrl.view.data.model.mixins.push({ name: 'my-mixin' });

    // 3. Add properties and methods to the control
    ctrl.my_method = () => { /* ... */ };

    // 4. Attach event listeners (often in once_active for DOM readiness)
    ctrl.once_active(() => {
        ctrl.on('click', handler);
    });
};
```

### Key Conventions

| Convention | Description |
|---|---|
| `ctrl.__mx.name = true` | Mixin registration — prevents double-apply, aids serialization |
| `ctrl.once_active(fn)` | Defer DOM-dependent setup until the control is activated |
| `ctrl.view.data.model.mixins.push(…)` | Isomorphic registration — survives SSR round-trip |
| Dependency auto-resolution | Mixins pull in their own deps: `if (!ctrl.__mx.press_events) press_events(ctrl)` |

### Disposable Mixins (NEW)

Mixins can now return a cleanup handle for clean removal:

```js
const { create_mixin_cleanup } = require('./mixin_cleanup');

const my_mixin = (ctrl) => {
    const cleanup = create_mixin_cleanup(ctrl, 'my_mixin');
    ctrl.__mx.my_mixin = cleanup;

    const handler = () => { /* ... */ };
    ctrl.on('click', handler);
    cleanup.track_listener(ctrl, 'click', handler);

    return cleanup; // caller can later call cleanup.dispose()
};
```

### Feature Detection

```js
const mx = require('./mx');

mx.has_feature(ctrl, 'selectable');  // true/false
mx.list_features(ctrl);             // ['selectable', 'press_events', ...]
mx.apply_feature_detection(ctrl);   // adds ctrl.has_feature() and ctrl.list_features()
```

---

## Mixin Catalog

### Interaction (10 mixins)

| File | Purpose | Key API |
|---|---|---|
| `press-events.js` | Unified press/touch handling | Events: `press-start`, `press-move`, `press-end`, `press-hold`, `press-drag-start` |
| `press-outside.js` | Click-away detection | Event: `press-outside` |
| `pressed-state.js` | Visual feedback on press | CSS class `pressed`, dispodable |
| `dragable.js` | Element dragging | Events: `drag-start`, `drag-move`, `drag-end` |
| `drag_like_events.js` | Low-level drag math | Bounds checking, position confinement |
| `selectable.js` | Item selection | `ctrl.selected`, multi-select with Shift/Ctrl |
| `selection-box-host.js` | Marquee/lasso selection | Events: `drag-select-start/move/end` |
| `resizable.js` | Element resizing | `ctrl.resizable`, resize handle |
| `keyboard_navigation.js` | Arrow key nav (ARIA) | Roving tabindex, Home/End keys |
| `fast-touch-click.js` | Zero-delay tap | Eliminates 300ms touch delay |

### Input (5 mixins)

| File | Purpose | Key API |
|---|---|---|
| `input_base.js` | Core input behavior | `get_value()`, `set_value()`, `focus()`, `blur()` |
| `input_validation.js` | Validation framework | `add_validator()`, `validate()`, built-in validators |
| `input_mask.js` | Input formatting | Phone, date, currency masks; `get_raw_value()` |
| `input_api.js` | High-level input wiring | Combines base + validation + mask |
| `field_status.js` | Field state management | Dirty/pristine/touched states |

### Layout & Display (7 mixins)

| File | Purpose | Key API |
|---|---|---|
| `display.js` | Multi-mode display system | `ctrl.display.mode`, size modes 0-4 |
| `display-modes.js` | Simple display mode switching | `ctrl.display_mode = 'small'` |
| `popup.js` | Popup positioning | `ctrl.popup()`, `ctrl.restore()` |
| `bind.js` | Spatial binding | Position relative to anchors |
| `coverable.js` | Overlay covers | `ctrl.cover()`, `ctrl.uncover()` |
| `virtual_window.js` | Virtual scrolling math | `get_virtual_window_range()` |
| `collapsible.js` | Expand/collapse (NEW) | `ctrl.expand()`, `ctrl.collapse()`, `ctrl.toggle_collapse()` |

### Theme (3 mixins)

| File | Purpose | Key API |
|---|---|---|
| `theme.js` | Token application | `apply_theme()`, `apply_theme_tokens()` |
| `themeable.js` | Parameter resolution | `is_themed()`, `get_param()` |
| `theme_params.js` | Param resolution engine | Merges defaults → variants → overrides |

### Lifecycle (5 mixins)

| File | Purpose | Key API |
|---|---|---|
| `activation.js` | Progressive enhancement | `Activation_Manager.activate(container)` |
| `hydration.js` | SSR → client hydration | `hydrate(container)` |
| `swap_registry.js` | Control registration | Selector → control class mapping |
| `auto_enhance.js` | MutationObserver auto-activate | `enable_auto_enhancement()` |
| `mx.js` | Mixin directory + feature detection | `has_feature()`, `list_features()` |

### Data (3 mixins)

| File | Purpose | Key API |
|---|---|---|
| `deletable.js` | Remove controls | `ctrl.delete()`, event: `delete` |
| `selected-deletable.js` | Delete selected items | Combines selectable + deletable |
| `selected-resizable.js` | Resize selected items | Combines selectable + resizable |

### Accessibility (2 mixins)

| File | Purpose | Key API |
|---|---|---|
| `a11y.js` | ARIA helpers | `apply_role()`, `apply_label()`, `apply_focus_ring()` |
| `link-hovers.js` | Link hover effects | Hover state management |

### Infrastructure (2 modules)

| File | Purpose | Key API |
|---|---|---|
| `mixin_cleanup.js` | Disposable mixin support | `create_mixin_cleanup()`, `dispose_all_mixins()` |
| `mixin_registry.js` | Formal metadata registry | `register_mixin()`, `check_dependencies()`, `check_conflicts()` |

---

## Composition Patterns

### Layered Dependencies

Mixins auto-resolve dependencies:

```
pressed-state → press-events (auto-applied)
selectable → press-events (auto-applied)
selection-box-host → selectable + press-events
```

### Multi-Mixin Composition

```js
const mx = require('./mx');

// Build a rich interactive list item
mx.press_events(ctrl);
mx.selectable(ctrl, null, { multi: true });
mx.dragable(ctrl);
mx.collapsible(ctrl, { trigger: '.header', content: '.body' });
```

### Dispose Pattern

```js
const collapsible = require('./collapsible');
const cleanup = collapsible(ctrl, { initial: 'collapsed' });

// Later: clean removal
cleanup.dispose();
// All event listeners removed, methods deleted, CSS classes cleared
```

---

## Further Reading

- **[The Mixins Book](../docs/mixins-book.md)** — Full API reference, 10 proposed future mixins, Drag_Drop_Zone deep-dive
- **[Test Suite](../test/mixins/)** — Unit tests for all mixins
