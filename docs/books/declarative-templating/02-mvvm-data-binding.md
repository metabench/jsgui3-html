# Chapter 2: Native MVVM Data Binding

The true power of `tpl` templating lies in its ability to automatically map reactive data layers and native events entirely inside the markup.

Gone are the days of manually querying DOM layouts (`this.find_controls_by_name()`), manually instantiating `ModelBinder`s, or writing verbose listeners across `data.model` and `view.data.model`.

## The Prefix Native Handlers

The `mount()` function natively intercepts attributes constructed with `bind-*` and `on-*`.

### 1. The `bind-*` Directive

When the mount parser hits an attribute prefixed with `bind-`, it immediately pipes the target property assignment directly to the `jsgui3` `BindingManager` backend.

```javascript
// Native MVVM Two-Way Binding Syntax
tpl`
    <div class="user-row">
        <!-- Two way syncing binding username to the input value -->
        <text_value_editor bind-value=${[this.data.model, 'username']} />
    </div>
`.mount(this);
```

Whenever the `username` updates upstream in the application logic, the `text_value_editor` refreshes its runtime DOM. If a user types dynamically into the text box, the `username` field is instantly synced upstream directly onto your model!

#### Advanced Bindings
`bind-*` accepts more than just arrays. To leverage custom functions, supply a complete configuration object:

```javascript
const cfg = {
    model: this.data.model,
    prop: 'price',
    transform: val => `$${val}`,    // Map the internal number to a currency string for UI
    reverse: str => parseFloat(str.replace('$', '')),  // Map UI strings back to pure numbers
    bidirectional: true
};

tpl`
    <text_input bind-text=${cfg} />
`.mount(this);
```

### 2. The `mbind()` Pattern Helper

As writing verbose tuple syntax `[this.data.model, 'some_field']` can quickly bloat layout declarations, `Data_Model_View_Model_Control` provides `.mbind()`.

`mbind('property_name')` automatically assumes `this.data.model` as the scope source!

```javascript
class ShoppingCart extends Data_Model_View_Model_Control {
    compose() {
        // Equivalent to [this.data.model, 'itemCount']
        tpl`
            <div class="header">
                <span class="count">Items: </span>
                <number_value_editor bind-value=${this.mbind('itemCount')} />
            </div>
        `.mount(this);
    }
}
```

It elegantly accepts advanced configuration parameters as well:
```javascript
this.mbind('price', {
    transform: val => `$${val}`,
    reverse: str => parseFloat(str.replace('$', ''))
});
```

### 3. The `on-*` Directive

In `jsgui3`, all controls host a `.on(event_name, callback)` and `.raise(event_name, payload)` event dispatcher.

Passing function scope traditionally required named mapping:
```javascript
// PRE-PHASE 4
tpl`<button name="submit_btn">Save</button>`.mount(this);
this.submit_btn.on('click', () => this.save());
```

With native `on-*` bindings, you simply pass the execution reference natively into the template:
```javascript
// POST-PHASE 4
tpl`
    <button on-click=${() => this.save()}>Save</button>
`.mount(this);
```

Any `jsgui3` standard dispatched event (`change`, `dblclick`, `drag`, `selection-change`) works seamlessly!

```javascript
tpl`
    <month_view on-selection-change=${(e) => this.selectDate(e.value)} />
`.mount(this);
```

## SSR + Activation Support

Declarative bindings are now designed to survive server render plus client activation when they can be represented by HTML metadata.

| Directive | SSR output | Client activation | Notes |
|-----------|------------|-------------------|-------|
| `bind-text` | Yes | Yes | Reattaches one-way model-to-text updates |
| `bind-value` | Yes | Yes | Restores two-way value binding for native inputs and controls with input descendants |
| `bind-class` | Yes | Yes | Supports the serialized truthy / simple-negation form |
| `bind-style` | Yes | Yes | Restores inline style updates from model state |
| `bind-visible` | Yes | Yes | Restores `display: none` toggling from model booleans |
| `bind-list` | Yes | Yes | Re-renders DOM from the recorded template function |
| `on-*` | Yes | Yes | Requires a handler that can be resolved to an instance method |

### Handler Serialization Rule

For SSR-to-activation, prefer handlers that point at instance methods:

```javascript
tpl`
    <button on-click=${this.save.bind(this)}>Save</button>
    <button on-click=${() => this.reset()}>Reset</button>
`.mount(this);
```

Those forms serialize as `data-jsgui-on-*` metadata and can be restored during activation.

### Activation Internals

`Data_Model_View_Model_Control` uses three internal helpers to restore declarative behavior:

- `_register_tpl_runtime_metadata(meta)` stores runtime-only template data, especially `bind-list` template functions.
- `_restore_model_state_from_dom()` loads serializable model values from `data-jsgui-model-state`.
- `_activate_tpl_bindings()` scans descendant DOM nodes owned by the control and reattaches supported directives.

### Current Limitation

`bind-list` activation currently restores DOM behavior rather than rebuilding a full child-control tree for each list item. That is sufficient for reactive DOM updates, but it is not yet a full child-control rehydration mechanism.
