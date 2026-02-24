# Developing with MVC and MVVM Patterns in jsgui3

This guide provides practical instructions for building controls and applications using the Model-View-Controller (MVC) and Model-View-ViewModel (MVVM) patterns in jsgui3-html.

---

## Table of Contents

1. [Understanding the Patterns](#1-understanding-the-patterns)
2. [The jsgui3 Model Architecture](#2-the-jsgui3-model-architecture)
3. [Building Your First MVC Control](#3-building-your-first-mvc-control)
4. [Building MVVM Controls with Data Binding](#4-building-mvvm-controls-with-data-binding)
5. [Transformations and Validation](#5-transformations-and-validation)
6. [Computed Properties and Watchers](#6-computed-properties-and-watchers)
7. [Isomorphic Development](#7-isomorphic-development)
8. [Best Practices](#8-best-practices)
9. [Common Patterns and Recipes](#9-common-patterns-and-recipes)
10. [Closing NYI Gaps (Implementation Notes)](#10-closing-nyi-gaps-implementation-notes)

---

## 1. Understanding the Patterns

### MVC (Model-View-Controller)

MVC separates an application into three interconnected components:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Model    │────▶│    View     │◀────│ Controller  │
│  (Data)     │     │  (DOM)      │     │  (Logic)    │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                                       │
       └───────────────────────────────────────┘
```

- **Model**: The data and business logic
- **View**: The visual representation (DOM elements)
- **Controller**: Handles user input and updates the model

### MVVM (Model-View-ViewModel)

MVVM adds an intermediate layer that transforms data for display:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Model    │────▶│  ViewModel  │────▶│    View     │
│  (Raw Data) │◀────│ (UI State)  │◀────│   (DOM)     │
└─────────────┘     └─────────────┘     └─────────────┘
```

- **Model**: Raw application data (dates as Date objects, numbers as numbers)
- **ViewModel**: UI-formatted data (dates as formatted strings, numbers as currency)
- **View**: DOM elements that display the ViewModel

---

## 2. The jsgui3 Model Architecture

jsgui3 implements a three-layer model system within each control:

```javascript
control.data.model        // Raw application data
control.view.data.model   // UI-formatted view data
control.view.ui           // UI composition and layout metadata
```

### Why Three Layers?

Consider a price display control:

| Layer | Property | Example Value |
|-------|----------|---------------|
| `data.model` | `price` | `1234.56` (Number) |
| `view.data.model` | `displayPrice` | `"$1,234.56"` (String) |
| `view.ui` | `alignment` | `"right"` |

This separation provides:
- **Clean persistence**: Only serialize `data.model` to storage
- **Flexible display**: Multiple views of the same data
- **Testability**: Test business logic without UI dependencies

---

## 3. Building Your First MVC Control

### Step 1: Create a Basic Control

```javascript
const jsgui = require('jsgui3-html');
const Control = jsgui.Control;

class Counter extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'counter';
        super(spec);

        // Initialize the count
        this._count = spec.initialCount || 0;

        // Build the UI
        this.compose_counter();
    }

    compose_counter() {
        // Create display element
        this.display = new Control({
            __type_name: 'span',
            tag_name: 'span',
            text: String(this._count)
        });
        this.add(this.display);

        // Create increment button
        this.incrementBtn = new Control({
            __type_name: 'button',
            tag_name: 'button',
            text: '+'
        });
        this.add(this.incrementBtn);
    }

    // Controller logic: handle user interactions
    activate() {
        super.activate();

        this.incrementBtn.on('click', () => {
            this._count++;
            this.display.text = String(this._count);
        });
    }
}

module.exports = Counter;
```

### Step 2: Use the Control

```javascript
const Counter = require('./counter');

const counter = new Counter({ initialCount: 0 });

// Render HTML (server-side)
console.log(counter.all_html_render());

// Or add to a page
page.add(counter);
```

---

## 4. Building MVVM Controls with Data Binding

For controls that need sophisticated state management, use `Data_Model_View_Model_Control`:

### Step 1: Extend the MVVM Base Class

```javascript
const jsgui = require('jsgui3-html');
const { Data_Object } = require('lang-tools');
const Data_Model_View_Model_Control = require('jsgui3-html/html-core/Data_Model_View_Model_Control');
const { ensure_control_models } = require('jsgui3-html/html-core/control_model_factory');

class UserCard extends Data_Model_View_Model_Control {
    constructor(spec = {}) {
        super(spec);

        // Ensure all model layers are initialized
        ensure_control_models(this, spec);

        // Set up the data model (raw data)
        this.data.model.set('firstName', spec.firstName || '');
        this.data.model.set('lastName', spec.lastName || '');
        this.data.model.set('email', spec.email || '');

        // Set up bindings
        this.setupBindings();

        // Build the UI
        this.compose_card();
    }

    setupBindings() {
        // Bind firstName + lastName to fullName in view model
        this.computed(
            this.view.data.model,
            ['firstName', 'lastName'],
            (first, last) => {
                const firstName = this.data.model.get('firstName') || '';
                const lastName = this.data.model.get('lastName') || '';
                return `${firstName} ${lastName}`.trim();
            },
            { propertyName: 'fullName' }
        );

        // Simple property binding with transformation
        this.bind({
            'email': {
                to: 'displayEmail',
                transform: (email) => email ? email.toLowerCase() : '',
                reverse: (display) => display
            }
        });
    }

    compose_card() {
        // Display full name from view model
        this.nameDisplay = new jsgui.Control({
            tag_name: 'h2',
            text: this.view.data.model.get('fullName') || 'Unknown'
        });
        this.add(this.nameDisplay);

        // Display email
        this.emailDisplay = new jsgui.Control({
            tag_name: 'p',
            text: this.view.data.model.get('displayEmail') || ''
        });
        this.add(this.emailDisplay);
    }

    activate() {
        super.activate();

        // Watch for fullName changes and update DOM
        this.watch(this.view.data.model, 'fullName', (newValue) => {
            if (this.nameDisplay.dom.el) {
                this.nameDisplay.dom.el.textContent = newValue;
            }
        });

        // Watch for email changes
        this.watch(this.view.data.model, 'displayEmail', (newValue) => {
            if (this.emailDisplay.dom.el) {
                this.emailDisplay.dom.el.textContent = newValue;
            }
        });
    }
}

module.exports = UserCard;
```

### Step 2: Use the MVVM Control

```javascript
const UserCard = require('./user-card');

const card = new UserCard({
    firstName: 'John',
    lastName: 'Doe',
    email: 'JOHN.DOE@EXAMPLE.COM'
});

// Later, update the data model - view updates automatically
card.data.model.set('firstName', 'Jane');
```

### Step 3: Modern Declarative MVVM Composition (Using `jsgui.html`)

While manually instantiating controls and mapping bindings via `this.setupBindings()` in `activate()` is fully supported, the modern, recommended approach is to leverage the `jsgui.html` template parser to map UI directly into bindings natively.

Using the `tpl` tagged template literal and `this.mbind('property_name')`, you can deeply skip the standard `this.add(new Control(...))` and `this.watch(...)` boilerplate.

```javascript
const { tpl } = require('jsgui3-html');

class ModernUserCard extends Data_Model_View_Model_Control {
    constructor(spec = {}) {
        super(spec);
        ensure_control_models(this, spec);

        // Raw models
        this.data.model.set('firstName', spec.firstName || '');
        this.data.model.set('lastName', spec.lastName || '');

        // Generate full-name transparently
        this.computed(this.view.data.model, ['firstName', 'lastName'],
            (first, last) => `${first || ''} ${last || ''}`.trim(),
            { propertyName: 'fullName' }
        );

        this.compose_card();
    }

    compose_card() {
        // Build the layout entirely declaratively, intercepting 
        // the view model bindings automatically! 
        tpl`
            <div class="user-card-panel">
                <h2 bind-text=${[this.view.data.model, 'fullName']}>Unknown</h2>
                
                <div class="edit-actions">
                    <!-- Bidirectional bind to the model -->
                    <text_input bind-value=${this.mbind('firstName')} />
                    <text_input bind-value=${this.mbind('lastName')} />
                    
                    <!-- Native event listener routing -->
                    <button on-click=${() => this.saveProfile()}>Save</button>
                </div>
            </div>
        `.mount(this);
    }
    
    saveProfile() {
        console.log("Saved: ", this.view.data.model.get('fullName'));
    }
}
```

By leveraging `bind-*` and `on-*`, `jsgui3-html` automatically delegates state to `ModelBinder` and `this.on()` without any lifecycle spaghetti!

### Advanced Declarative Attributes

Beyond `bind-value` and `on-click`, the template parser supports three advanced declarative syntaxes for common UI patterns.

#### `bind-class` — Reactive CSS Class Toggling

Toggle CSS classes based on model state. Replaces imperative `add_class`/`remove_class` patterns.

```javascript
// BEFORE (imperative):
set_loading(v) {
    this._loading = !!v;
    if (this._loading) this.add_class('loading');
    else this.remove_class('loading');
}

// AFTER (declarative):
compose() {
    tpl`
        <div class="search-bar"
            bind-class=${{
                'loading': this.mbind('loading'),
                'has-value': this.mbind('has_value'),
                'disabled': this.mbind('disabled')
            }} />
    `.mount(this);
}

// Toggling is now automatic:
this.data.model.set('loading', true);  // adds 'loading' class
this.data.model.set('loading', false); // removes 'loading' class
```

Each key in the object is a CSS class name; each value is an `mbind()` binding or `[model, 'prop']` tuple. The class is added when the model value is truthy and removed when falsy.

#### `bind-list` — Reactive Array Rendering

Render a list of child controls from a collection, re-rendering when the collection changes.

```javascript
compose() {
    this.data.model.set('users', new Collection([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
    ]));

    tpl`
        <ul name="userList"
            bind-list=${this.mbind('users')}
            template=${(user, i) => tpl`
                <li class="user-row" data-id=${user.id}>${user.name}</li>
            `} />
    `.mount(this);
}
```

The `template` attribute receives a function called for each item. Adding/removing items from the collection triggers an automatic re-render.

#### `bind-style` — Dynamic Inline Styles

Similar to `bind-class`, this attribute intelligently maps a data model property to inline CSS properties. 

```javascript
compose() {
    tpl`
        <div class="progress-bar-fill"
            bind-style=${{
                'width': this.mbind('progress_percent'),
                'background-color': this.mbind('status_color')
            }} />
    `.mount(this);
}
```

The object keys map directly to CSS properties. When the bound model value becomes `undefined` or `null`, the inline style property is automatically removed.

#### `bind-visible` — Conditional Rendering

Instead of manually toggling `display: none` from your JavaScript methods, `bind-visible` directly links a model boolean to element visibility.

```javascript
compose() {
    tpl`
        <div class="error-banner" bind-visible=${this.mbind('has_error')}>
            An error occurred!
        </div>
    `.mount(this);
}

// Automatically styles with `display: none`
this.data.model.set('has_error', false); 
```

#### Native HTML Input Interception (`bind-value`)

In `jsgui3-html`, creating basic data-entry points previously required wrapping inputs in `jsgui`'s custom components like `<text_input>` or `<number_input>`. Our parser now natively intercepts `bind-value` on basic HTML form fields (`<input>`, `<textarea>`, `<select>`), providing seamless bidirectional MVVM on native tags without component overhead.

```javascript
compose() {
    tpl`
        <div class="simple-form">
            <label>Username</label>
            <!-- Native HTML input, fully bidirectional! -->
            <input type="text" bind-value=${this.mbind('username')} />
            
            <label>Age</label>
            <!-- Automatically casts numeric changes back to the model! -->
            <input type="number" bind-value=${this.mbind('age')} />
        </div>
    `.mount(this);
}
```

#### `data-model` — Contextual Data Scoping

Pass a `Data_Object` model down to child controls via attribute, enabling a React-like context pattern.

```javascript
compose() {
    tpl`
        <div data-model=${this.data.model}>
            <text_input bind-value=${this.mbind('first_name')} />
            <text_input bind-value=${this.mbind('last_name')} />
        </div>
    `.mount(this);
}
```


---

## 5. Transformations and Validation

jsgui3 includes a built-in transformations library for common data conversions.

### Using Built-in Transformations

```javascript
const { Transformations } = require('jsgui3-html/html-core/Transformations');

// Date transformations
const formatted = Transformations.date.format(new Date(), 'YYYY-MM-DD');
const parsed = Transformations.date.parse('2023-09-15', 'YYYY-MM-DD');

// Number transformations
const currency = Transformations.number.toCurrency(1234.56, 'USD');  // "$1,234.56"
const percent = Transformations.number.toPercent(0.156);             // "15.6%"

// String transformations
const upper = Transformations.string.toUpper('hello');               // "HELLO"
const truncated = Transformations.string.truncate('Long text...', 10); // "Long te..."
```

### Using Transformations in Bindings

```javascript
class PriceDisplay extends Data_Model_View_Model_Control {
    setupBindings() {
        this.bind({
            'price': {
                to: 'displayPrice',
                transform: (price) => Transformations.number.toCurrency(price, 'USD'),
                reverse: (display) => Transformations.number.parseCurrency(display)
            }
        });
    }
}
```

### Validation

```javascript
const { Validators } = require('jsgui3-html/html-core/Transformations');

// Validate values
Validators.isEmail('test@example.com');  // true
Validators.isRequired('');               // false
Validators.minLength('abc', 5);          // false
Validators.maxLength('abc', 5);          // true
```

---

## 6. Computed Properties and Watchers

### Computed Properties

Computed properties automatically recalculate when dependencies change:

```javascript
class ShoppingCart extends Data_Model_View_Model_Control {
    setupBindings() {
        // Computed total from items
        this.computed(
            this.view.data.model,
            ['items'],  // Dependencies
            () => {
                const items = this.data.model.get('items') || [];
                return items.reduce((sum, item) => sum + item.price * item.qty, 0);
            },
            { propertyName: 'total' }
        );

        // Computed item count
        this.computed(
            this.view.data.model,
            ['items'],
            () => {
                const items = this.data.model.get('items') || [];
                return items.reduce((sum, item) => sum + item.qty, 0);
            },
            { propertyName: 'itemCount' }
        );

        // Computed formatted total (depends on computed total)
        this.computed(
            this.view.data.model,
            ['total'],
            () => {
                const total = this.view.data.model.get('total') || 0;
                return Transformations.number.toCurrency(total, 'USD');
            },
            { propertyName: 'formattedTotal' }
        );
    }
}
```

### Property Watchers

Watch for changes and execute custom logic:

```javascript
class StatusIndicator extends Data_Model_View_Model_Control {
    activate() {
        super.activate();

        // Watch for status changes
        this.watch(this.data.model, 'status', (newStatus, oldStatus) => {
            console.log(`Status changed: ${oldStatus} → ${newStatus}`);

            // Update CSS classes
            if (oldStatus) this.remove_class(`status-${oldStatus}`);
            if (newStatus) this.add_class(`status-${newStatus}`);

            // Trigger animations, notifications, etc.
            if (newStatus === 'error') {
                this.showErrorAnimation();
            }
        });
    }
}
```

---

## 7. Isomorphic Development

jsgui3 supports isomorphic rendering - the same code runs on server and client.

### Server-Side Rendering

```javascript
// server.js
const express = require('express');
const jsgui = require('jsgui3-html');
const UserCard = require('./user-card');

const app = express();

app.get('/user/:id', async (req, res) => {
    const userData = await fetchUser(req.params.id);

    const card = new UserCard({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email
    });

    // Render to HTML string
    const html = card.all_html_render();

    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>User Profile</title></head>
        <body>
            ${html}
            <script src="/bundle.js"></script>
        </body>
        </html>
    `);
});
```

### Client-Side Activation

When the page loads on the client, controls are "activated" - reconnected to their DOM elements:

```javascript
// client.js
const UserCard = require('./user-card');

// The framework automatically:
// 1. Finds DOM elements with data-jsgui-* attributes
// 2. Recreates control instances with the existing DOM elements
// 3. Deserializes model state from attributes
// 4. Calls activate() to attach event handlers

// Controls are now interactive!
```

### Preserving State Across Server/Client

Models are serialized to DOM attributes:

```html
<div data-jsgui-id="ctrl_123"
     data-jsgui-type-name="user-card"
     data-jsgui-data-model="model_456"
     data-jsgui-fields='{"firstName":"John","lastName":"Doe"}'>
    <!-- Control content -->
</div>
```

On the client, these attributes are read to restore state.

---

## 8. Best Practices

### DO: Separate Data from View Concerns

```javascript
// Good: Raw data in data.model, formatted in view.data.model
this.data.model.set('createdAt', new Date());
this.view.data.model.set('displayDate', formatDate(this.data.model.get('createdAt')));

// Avoid: Mixing formatted data into data.model
this.data.model.set('createdAt', '2023-09-15');  // Don't do this
```

### DO: Use ensure_control_models()

```javascript
class MyControl extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        ensure_control_models(this, spec);  // Guarantees models exist
        // Now safe to use this.data.model, this.view.data.model, etc.
    }
}
```

### DO: Clean Up Bindings

```javascript
class MyControl extends Data_Model_View_Model_Control {
    destroy() {
        // BindingManager handles cleanup automatically
        if (this._binding_manager) {
            this._binding_manager.destroy();
        }
        super.destroy();
    }
}
```

### DON'T: Manipulate DOM Directly When Using MVVM

```javascript
// Avoid: Direct DOM manipulation
this.dom.el.querySelector('.price').textContent = '$100';

// Better: Update the model, let bindings handle DOM
this.data.model.set('price', 100);  // Bindings update the display
```

### DON'T: Create Circular Bindings

```javascript
// Avoid: A → B → A creates infinite loops
this.bind({ 'valueA': { to: 'valueB' } });
this.bind({ 'valueB': { to: 'valueA' } });  // Danger!

// Better: Use computed properties for derived values
this.computed(model, ['valueA'], (a) => a * 2, { propertyName: 'valueB' });
```

---

## 9. Common Patterns and Recipes

### Pattern: Form with Validation

```javascript
class ContactForm extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        ensure_control_models(this, spec);

        // Data model for form values
        this.data.model.set('name', '');
        this.data.model.set('email', '');
        this.data.model.set('message', '');

        // View model for validation state
        this.view.data.model.set('errors', {});
        this.view.data.model.set('isValid', false);
        this.view.data.model.set('isSubmitting', false);

        this.setupValidation();
        this.compose_form();
    }

    setupValidation() {
        // Computed validity based on all fields
        this.computed(
            this.view.data.model,
            ['name', 'email', 'message'],
            () => {
                const errors = {};
                const name = this.data.model.get('name');
                const email = this.data.model.get('email');
                const message = this.data.model.get('message');

                if (!name) errors.name = 'Name is required';
                if (!Validators.isEmail(email)) errors.email = 'Invalid email';
                if (!message) errors.message = 'Message is required';

                this.view.data.model.set('errors', errors);
                return Object.keys(errors).length === 0;
            },
            { propertyName: 'isValid' }
        );
    }

    async submit() {
        if (!this.view.data.model.get('isValid')) return;

        this.view.data.model.set('isSubmitting', true);
        try {
            await sendToServer(this.data.model.toJSON());
            this.view.data.model.set('submitSuccess', true);
        } catch (err) {
            this.view.data.model.set('submitError', err.message);
        } finally {
            this.view.data.model.set('isSubmitting', false);
        }
    }
}
```

### Pattern: List with Selection

```javascript
class SelectableList extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        ensure_control_models(this, spec);

        // Data: the items
        this.data.model.set('items', spec.items || []);

        // View state: selection
        this.view.data.model.set('selectedIndex', -1);
        this.view.data.model.set('selectedItem', null);

        this.setupSelectionBinding();
        this.compose_list();
    }

    setupSelectionBinding() {
        // When selectedIndex changes, update selectedItem
        this.watch(this.view.data.model, 'selectedIndex', (index) => {
            const items = this.data.model.get('items');
            const item = index >= 0 ? items[index] : null;
            this.view.data.model.set('selectedItem', item);

            // Emit event for parent controls
            this.raise('selection-change', { index, item });
        });
    }

    selectItem(index) {
        this.view.data.model.set('selectedIndex', index);
    }
}
```

### Pattern: Master-Detail View

```javascript
class MasterDetailView extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        ensure_control_models(this, spec);

        // Create master list
        this.masterList = new SelectableList({
            items: spec.items
        });
        this.add(this.masterList);

        // Create detail panel
        this.detailPanel = new DetailPanel();
        this.add(this.detailPanel);

        // Wire them together
        this.masterList.on('selection-change', (e) => {
            this.detailPanel.data.model.set('item', e.item);
        });
    }
}
```

---

## 10. Closing NYI Gaps (Implementation Notes)

This section documents a set of `NYI` (“Not Yet Implemented”) / debug-throw gaps that were present in the codebase, what capabilities were required to close them, and the implementation notes used to address each.

### 10.1 `Grid.get_cell(x, y)` (random access cell lookup)

**Problem:** `Grid.get_cell` existed but threw `NYI`. Meanwhile, `Grid.full_compose_as_divs()` already builds lookup structures:
- `grid.map_cells['[x,y]'] = cell`
- `grid.arr_cells[x][y] = cell`

**Needed capabilities**
- Accept common coordinate shapes: `(x, y)`, `[x, y]`, `{x, y}`.
- Work both before and after `activate()` (no DOM reliance).
- Handle optional row headers (content offset) and out-of-bounds coordinates safely.

**Plan**
- Implement `get_cell` as a pure lookup helper:
  1. Normalize `(x, y)` inputs.
  2. Prefer `map_cells` for O(1) lookup.
  3. Fallback to `arr_cells[x][y]`.
  4. Final fallback: resolve from `_arr_rows[y].content` with row-header offset.

### 10.2 `Tabbed_Panel` tab definition normalization (remove `NYI` on unexpected types)

**Problem:** `Tabbed_Panel.compose_tabbed_panel()` handled tab entries as `string`, `array`, or `object`, but logged and threw `NYI` for anything else. This made the control fragile when a caller passed a `Control` instance or other values.

**Needed capabilities**
- Accept a `Control` instance as a tab definition (treat it as tab content).
- Accept primitive values (number/boolean/etc.) without throwing.
- Avoid `console.log` in control runtime code paths.
- Preserve server-side rendering compatibility (no unguarded DOM access).

**Plan**
- Add a small normalization layer that converts each `tab` into `{ label_text, content }`.
- For `Control` instances: infer a label from `title/name/text/__type_name` and use the control as the content.
- For other non-supported values: coerce to a label string and create an empty tab page.
- Remove debugging logs and keep `activate()` consistent with normal control activation.

### 10.3 `Validation_State.set(...)` (richer inputs + change events)

**Problem:** `Validation_State.set` only accepted `true/false` and threw `NYI` for anything else. It also didn’t provide a robust, evented way to carry a message/code alongside validity.

**Needed capabilities**
- Support boolean validity, plus richer shapes like `{ valid, message, code }`.
- Provide stable `change` events when validity/message change (so indicator controls can react).
- Maintain backwards compatibility for existing boolean-only usage.

**Plan**
- Make `valid`, `message`, `code`, and `details` evented properties that raise `{ name, old, value }` changes.
- Extend `.set(...)` to accept:
  - `true/false` → sets `.valid`
  - `string` → sets `.message` and defaults `.valid = false` (if unset)
  - object payloads → sets supported properties without throwing

### 10.4 Control selector matching (`$match`, `matches_selector`, `find`)

**Problem:** `Control.matches_selector(...)` and multi-part selectors in `Control.$match(...)` threw `NYI`, making control-tree querying fragile.

**Implemented capabilities**
- Single-part selectors:
  - `.class_name` (matches `has_class`)
  - `type_name` or `:type_name` (matches `__type_name`)
  - `#id` (matches `dom.attributes.id` or `_id()`)
  - `[prop]` and `[prop=value]` (matches control properties)
- Multi-part selectors with spaces (descendant chain) using the control’s `.parent` links.

**Notes**
- This is intentionally a small, control-tree selector subset (not full CSS).

### 10.5 `span.text` updates (no throw on complex content)

**Problem:** Updating `span.text` threw `NYI` unless the span had exactly one `Text_Node`.

**Implemented capabilities**
- If a `Text_Node` exists anywhere in the span’s content, it is updated.
- If no `Text_Node` exists, a new one is inserted at index `0` and cached as `span.text_node`.

### 10.6 Object-valued DOM attribute rendering

**Problem:** Object values in `dom.attributes` were not reliably representable as HTML attribute strings.

**Implemented capabilities**
- Non-`style` object attributes are now serialized using `stringify(...)` and have `"` replaced with `'` so they can be embedded safely in `key="..."`.

### 10.7 Mixins: `resizable`, `dragable`, `display`

**`resizable`**
- No longer throws when `ctrl.ctrl_relative` is missing: it falls back to using `ctrl` and ensures `position: relative` when needed.
- Detects an existing bottom-right resize handle (`.bottom-right.resize-handle`) before creating a new one.
- Avoids prematurely activating the handle when it does not yet have a DOM element.

**`dragable`**
- Adds `drag_mode: 'y'` support.
- Reapplying the mixin is now a no-op instead of throwing.

**`display`**
- No longer throws on assignment; `ctrl.display` is now safe to attach and reuse.
- Provides `ctrl.display.modes.value` as a minimal place to store the current display mode.

### 10.8 Resource compiler registration (`Resource.load_compiler`)

**Problem:** `Resource.load_compiler(...)` was `NYI`.

**Implemented capabilities**
- Registers a compiler function as a `Resource.Compiler` instance (overriding `.transform(...)`).
- Stores it under `Resource.compilers[name]`.
- Optionally adds it to a resource pool when `options.pool` or `options.resource_pool` is supplied.

### 10.9 `selectable` mixin idempotency (remove `NYI / Deprecated`)

**Problem:** Reapplying the `selectable` mixin to a control after `ctrl.selectable = true` could throw `NYI / Deprecated`. This made it fragile in layered code where a control might be made selectable more than once, and prevented “apply early, complete later” patterns when `dom.el` is not yet present.

**Implemented capabilities**
- The mixin is now idempotent: it tracks internal application state and does not throw on reapplication.
- Server-pre-render persistence handlers are only attached once.
- DOM-specific wiring is applied once `ctrl.dom.el` exists, allowing a second call after the element becomes available.

### 10.10 `Page_Context` DOM helpers (`document`, `map_els`, `get_ctrl_el`, `body`)

**Problem:** Several controls and mixins assume context provides DOM helpers (for example `context.body()` and `context.get_ctrl_el(ctrl)`), but `Page_Context` did not provide them. This made activation and DOM event plumbing brittle in minimal contexts (tests, simple client setups).

**Implemented capabilities**
- `context.document` and `context.map_els` are initialized when a DOM is available.
- `context.get_ctrl_el(ctrl)` resolves a control’s DOM element via `ctrl.dom.el`, `context.map_els`, or a query for `[data-jsgui-id="..."]`.
- `context.body()` returns a `Control` bound to `document.body` and sets up DOM sync listeners so `body.add(ctrl)` appends into the live DOM.

### 10.11 Compositional model accepts `Control` instances

**Problem:** `compose_using_compositional_model()` treated `tof(...) === 'control'` entries as constructors and could throw `stop / nyi` on certain tuple shapes. This made compositional models fragile when using prebuilt `Control` instances.

**Implemented capabilities**
- Composition arrays can now include `Control` instances directly.
- Named tuple forms like `['name', ctrl_instance]` and `['name', ctrl_instance, options]` are accepted.
- Named controls are assigned into both `this._ctrl_fields[name]` and `this[name]` for easier access.

### 10.12 Rendering `Data_Model` / `Data_Object` items in control content

**Problem:** `Control.render_content()` could crash (or throw debug `stop`) when a `Data_Model`/`Data_Object` was present in `content`.

**Implemented capabilities**
- `data_model`/`data_object` content items are now stringified and safely rendered as escaped text instead of throwing.
- `lang-tools` compatibility: `Collection.push/add(...)` is patched to accept items where `tof(...) === 'data_model'` (so `Data_Model`/`Data_Object` can actually be stored in collections).
- `Text_Node` construction is now safe for string inputs (constructor normalizes `spec` before assigning `spec.__type_name`), so renderer paths that create text nodes from strings don’t throw.
- Detailed notes: see `docs/lang_tools_compat_patches.md`.

### 10.13 `Control.border()` (remove debug `stop`)

**Problem:** `Control.border()` logged and threw `stop`.

**Implemented capabilities**
- `border()` now returns `[left, top, right, bottom]` border widths (in pixels) using computed styles when running in a browser context.


---

## Quick Reference

### Model Layers

| Layer | Access | Purpose |
|-------|--------|---------|
| Data Model | `ctrl.data.model` | Raw application data |
| View Data Model | `ctrl.view.data.model` | UI-formatted data |
| View UI | `ctrl.view.ui` | Layout and composition |

### Key APIs

```javascript
// Binding
this.bind({ 'source': { to: 'target', transform: fn, reverse: fn } });

// Computed
this.computed(model, ['deps'], computeFn, { propertyName: 'result' });

// Watch
this.watch(model, 'property', (newVal, oldVal) => { });

// Inspect all bindings (debugging)
const bindings = this.inspectBindings();
```

### Key Classes

| Class | File | Purpose |
|-------|------|---------|
| `Control` | `html-core/control.js` | Base control class |
| `Data_Model_View_Model_Control` | `html-core/Data_Model_View_Model_Control.js` | MVVM base |
| `ModelBinder` | `html-core/ModelBinder.js` | Two-way binding |
| `Data_Object` | `lang-tools` | Observable data container |

---

## Further Reading

- [Data Binding API Reference](../html-core/DATA_BINDING.md)
- [MVVM Engine Review](./mvvm_engine_review.md)
- [Control_DOM Documentation](./Control_Dom.md)
