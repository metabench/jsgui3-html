# html-core

The core engine of jsgui3-html. This directory contains the base control classes, data binding infrastructure, MVVM support, validation, view management, and server-side HTML rendering.

## Entry Point

```javascript
const jsgui = require('jsgui3-html/html-core/html-core');
const { Control, Page_Context } = jsgui;
```

`html-core.js` bootstraps the framework by:
1. Loading `lang-tools` (evented classes, data objects, utilities)
2. Registering the `Control` class (which is actually `Data_Model_View_Model_Control`)
3. Creating HTML tag constructors (`div`, `span`, `h1`, `label`, `input`, etc.)
4. Exposing `Page_Context`, `parse_mount`, color palettes, and utility functions

## File Map

### Core Control Classes

| File | Class | Purpose |
|------|-------|---------|
| `control-core.js` | `Control_Core` | Base class — DOM attributes, events, rendering, content management, CSS class manipulation |
| `control.js` | `Control` | Extends `Control_Core` — adds data binding, view synchronization, compositional model, DOM event mapping |
| `control-enh.js` | `Control` (enhanced) | Additional control enhancements |
| `Data_Model_View_Model_Control.js` | `Data_Model_View_Model_Control` | Extends `Control` — three-layer MVVM with `data.model`, `view.data.model`, and `view.model` separation |

The inheritance chain: `Control_Core` → `Control` → `Data_Model_View_Model_Control`

The default `Control` exported by `html-core.js` is actually `Data_Model_View_Model_Control`, so every control in the framework has full MVVM capabilities.

### View & Data Management

| File | Purpose |
|------|---------|
| `Control_View.js` | Manages the visual representation of a control — layout state, display modes |
| `Control_View_Data.js` | View-specific data (the view model layer) |
| `View.js` | Base view class |
| `View_Data.js` | Base view data class |
| `Control_Data.js` | Data model management for controls |
| `Data.js` | Core data abstractions |
| `control_model_factory.js` | Factory for creating typed control models |

### Data Binding System

| File | Purpose |
|------|---------|
| `ModelBinder.js` | `ModelBinder`, `ComputedProperty`, `PropertyWatcher`, `BindingManager` — the core two-way binding infrastructure |
| `Transformations.js` | Data transformation library — string, number, date, array, object transforms + validators |
| `BindingDebugger.js` | `BindingDebugger`, `BindingDebugTools` — inspect, monitor, and snapshot bindings at runtime |
| `ReactiveCollection.js` | Observable collection that emits change events on add/remove/update |
| `DATA_BINDING.md` | Complete binding API documentation |

### Validation

| File | Purpose |
|------|---------|
| `Control_Validation.js` | Validation integration for controls |
| `Control_Validation_Data.js` | Validation data layer |
| `Control_Validation_Target.js` | Validation target resolution |
| `Control_Validation_Validator.js` | Validator attachment |
| `Control_Validation_View.js` | Visual validation feedback |
| `Control_Validation_View_Data.js` | Validation view data |
| `Data_Validation.js` | Core data validation engine |
| `Data_Validation_Target.js` | Validation target for data objects |
| `Data_Validation_Validator.js` | Validator definitions |
| `Validation_State.js` | Validation state tracking |

### Rendering & Parsing

| File | Purpose |
|------|---------|
| `html-core.js` | Main entry — bootstraps framework, creates HTML tag constructors |
| `page-context.js` | `Page_Context` — manages control registry, CSS collection, and rendering context for a page |
| `parse-mount.js` | `parse_mount` / `parse` — parse HTML strings into control trees; mount controls to existing DOM |
| `text-node.js` | `Text_Node` — represents raw text content in the control tree |
| `html_parser.js` | HTML parsing utilities |
| `selection-scope.js` | `Selection_Scope` — manages selection context for controls |

### Colors

| File | Purpose |
|------|---------|
| `Color_Value.js` | Color manipulation, conversion (RGB, HSL, hex) |
| `arr_colors.js` | Color array utilities |
| `palettes.js` | Color palette management |
| `pal_crayola_extended.js` | Extended Crayola color palette |
| `pal_crayola_sorted.js` | Sorted Crayola palette |
| `pal_css_named.js` | CSS named colors |
| `pal_pastels.js` | Pastel color palette |

### Compatibility

| File | Purpose |
|------|---------|
| `lang_tools_compat.js` | Compatibility patches for the `lang-tools` dependency |
| `control.d.ts` | TypeScript type definitions for the Control class |

## Key Concepts

### Page_Context

Every control requires a `Page_Context` to track IDs and collect CSS:

```javascript
const ctx = new jsgui.Page_Context();
const btn = new jsgui.controls.button({ context: ctx, text: 'OK' });
console.log(btn.html); // Renders the button HTML
```

### Control Lifecycle

1. **Construction** — build the control tree (server + client)
2. **Rendering** — `control.html` or `control.all_html_render()` generates HTML string
3. **Activation** — `control.activate()` binds event listeners to existing DOM (client only)

```javascript
// Server-side
const page_html = my_control.all_html_render();

// Client-side (after DOM is loaded)
my_control.activate();
```

### Three-Layer MVVM

Every control inherits `Data_Model_View_Model_Control`, providing:

| Layer | Access | Purpose | Example |
|-------|--------|---------|---------|
| Data Model | `this.data.model` | Business data (device-agnostic) | `{ user_id: 123, email: '...' }` |
| View Data Model | `this.view.data.model` | View-specific transformations | `{ formatted_email: '...', display_date: '...' }` |
| View Model | `this.view.model` | UI state | `{ is_expanded: true, selected_index: 0 }` |

See [DATA_BINDING.md](DATA_BINDING.md) for the full binding API and [MVVM.md](../MVVM.md) for architectural details.

### parse_mount

Parse HTML strings into control trees or mount controls onto existing DOM:

```javascript
const { parse_mount, parse } = require('jsgui3-html/html-core/parse-mount');

// Parse HTML string into a control
const ctrl = parse('<div class="card"><h2>Title</h2><p>Body</p></div>', ctx);

// Mount a control to an existing DOM element
parse_mount(document.getElementById('app'), ctrl);
```

## Related Documentation

- [DATA_BINDING.md](DATA_BINDING.md) — Complete binding API reference
- [MVVM.md](../MVVM.md) — MVVM architecture analysis and patterns
- [docs/MVC_MVVM_Developer_Guide.md](../docs/MVC_MVVM_Developer_Guide.md) — Developer-friendly MVVM guide
- [controls/README.md](../controls/README.md) — Pre-built control catalog
- [control_mixins/README.md](../control_mixins/README.md) — Behavior mixins
