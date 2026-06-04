# Chapter 1: `tpl` Syntax and Usage

The `jsgui3-html` platform has evolved significantly from its original imperative roots. Traditionally, building a UI component meant manually instantiating `Control` nodes, setting properties, and composing the tree piece by piece using `this.add()`. 

To streamline component development, the framework introduces a powerful **tagged template literal string parser** exposed as `jsgui.tpl` (typically destructured as `tpl`).

## The Problem with Traditional HTML Parsing

Most basic HTML-to-DOM string parsers evaluate template strings uniformly. If you try to pass a complex JavaScript object into an attribute slot, it's coerced into a string `"[object Object]"`.

```javascript
// A traditional parser stringifies everything it touches
const myObj = { items: [1, 2, 3] };
const html = `<custom_control config=${myObj} />`; 
// Result: <custom_control config="[object Object]"></custom_control>
```

## The `tpl` Solution

The `tpl` tagged template evaluates your layout while **preserving variable references**.

When the parser extracts your attributes during control instantiation, it links the actual JavaScript object, array, or function directly to the newly constructed `Control.js` instance.

## Public API

The supported public imports are:

```javascript
const { tpl } = require('jsgui3-html');
const { tpl: core_tpl, template } = require('jsgui3-html/html-core/html-core');
```

`template` is a compatibility alias for `tpl`. The symbol `jsgui.html` remains the native `<html>` control class, so `tpl` is the canonical declarative templating entry point.

### Basic Compilation

```javascript
const jsgui = require('jsgui3-html');
const { tpl } = jsgui;

class SimpleDialog extends jsgui.Control {
    constructor(spec = {}) {
        super(spec);
        
        // Pass dynamic variables naturally
        const title = spec.title || "Confirmation";
        const themeConfig = { mode: 'dark', rounded: true };

        // tpl captures string segments and primitive references
        const layout = tpl`
            <div class="dialog-mask">
                <div class="dialog-content" style_config=${themeConfig}>
                    <h3 name="title_bar">${title}</h3>
                    <div name="body_container"></div>
                </div>
            </div>
        `;

        // Compose the evaluated layout onto this control
        layout.mount(this);
    }
}
```

### The `.mount(target_control)` API

Building a layout with `tpl` produces an intermediate `Parsed_JSGUI_HTML` structure. To actually assemble the runtime `Control` instances and attach them to your component, invoke `.mount(this)`.

**What `.mount()` Does:**
1. Recursively iterates through the parsed DOM nodes.
2. Identifies HTML tags that map to jsgui3 controls (e.g., `<text_input>`, `<month_view>`, `<div>`).
3. Instantiates them, passing exactly the parameters bound inside the literal `${...}` scope.
4. Appends them to the targeted `Control`.
5. Maps `name="xyz"` attributes dynamically creating `this.xyz` on the parent control for instant accessibility.

### Named References

Notice the `name=""` tags in the example above:

```html
<h3 name="title_bar">${title}</h3>
<div name="body_container"></div>
```

By adding a `name` attribute, `.mount()` automatically creates a reference exactly on the mounted parent.

```javascript
layout.mount(this);

// You can instantly access and interact with the inner children
this.title_bar.add_class('highlight');
this.body_container.add(new jsgui.Control({ text: 'Loaded dynamically!' }));
```

This acts as a high-performance, robust alternative to runtime DOM queries (like `this.find()`). 

During normal client-side control activation, named child references continue to come from the standard control activation path (`_ctrl_fields` / `pre_activate`). The declarative binding restoration path is focused on reattaching behavior to already-rendered DOM.

### Contextual Evaluation

The parser is deeply aware of the global `jsgui.controls` registry. Any advanced layout component registered anywhere in your application (e.g. `Color_Picker`, `Drop_Down`, `Data_Grid`) becomes immediately usable as an HTML tag within the `tpl` layout!

```javascript
// Automatically instantiates a sophisticated Drop_Down control natively
tpl`
    <div class="settings">
        <label>Theme</label>
        <drop_down name="theme_selector" options=${['Light', 'Dark', 'Auto']} />
    </div>
`.mount(this);
```

## Activation Metadata

When a control using `tpl` is server-rendered, the template engine writes activation metadata into the HTML so client activation can restore behavior without rebuilding the whole DOM subtree.

Key attributes include:

- `data-jsgui-bind-owner`
- `data-jsgui-bind-text`
- `data-jsgui-bind-value`
- `data-jsgui-bind-class`
- `data-jsgui-bind-style`
- `data-jsgui-bind-visible`
- `data-jsgui-bind-list`
- `data-jsgui-on-*`
- `data-jsgui-model-state`

The higher-level binding semantics are covered in [Chapter 2](./02-mvvm-data-binding.md).
