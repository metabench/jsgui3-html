# Chapter 4: Separating Presentation from Data

> _"Data is what the control manages. Presentation is how it looks.  
> These must be separate concerns."_

---

## 4.1 The Core Principle

This is perhaps the most important chapter in this book. Everything else — themes, variants, visual modes — exists to serve this one principle: **the data a control manages and the way it presents that data are independent concerns**.

### Why This Is Non-Negotiable

Consider a date picker. The underlying data is a `Date` object: `2026-02-11`. But the user might see:

- `February 11, 2026` (long format)
- `02/11/2026` (US format)
- `11/02/2026` (European format)
- `2026-02-11` (ISO format)
- A calendar grid with day 11 highlighted
- A "3 days from now" relative label
- A position on a timeline

**Seven different presentations of the same data.** If the data and presentation are tangled together, changing the presentation means rewriting the data handling. If they're separate, you can swap presentations freely without touching the data layer.

This is especially important for jsgui3-html's multi-modal theming. A Win32 date picker and a modern calendar picker display the same `Date` object completely differently. The data layer must be identical in both cases.

---

## 4.2 The Three-Layer Model

jsgui3-html implements data/presentation separation through a three-layer model architecture:

```
┌─────────────────────────────────────────┐
│         Layer 3: DOM (view.ui)          │
│  What the browser renders               │
│  HTML elements, CSS classes, attributes  │
│  Manages layout and visual concerns      │
├─────────────────────────────────────────┤
│    Layer 2: View-Model (view.data.model) │
│  Data transformed for display            │
│  Formatted strings, computed states      │
│  Display-specific flags and values       │
├─────────────────────────────────────────┤
│       Layer 1: Model (data.model)       │
│  Raw application data                    │
│  Domain values as they exist in the app  │
│  No formatting, no display concerns      │
└─────────────────────────────────────────┘
```

**See:** [svg-07-mvvm-layers.svg](./svg-07-mvvm-layers.svg) — visual diagram of the three layers.

### Layer 1: `data.model` — The Raw Data

This holds the actual application data. It has no knowledge of how it will be displayed.

```javascript
control.data.model = new Data_Object({
    temperature_celsius: 22.5,
    selected_date: new Date(2026, 1, 11),
    user_name: 'James',
    is_active: true,
    count: 42
});
```

Rules for `data.model`:
- ✅ Store values in their natural types (numbers, dates, booleans)
- ✅ Store raw, unformatted data
- ❌ Never store display strings (`"February 11, 2026"`)
- ❌ Never store CSS values (`"#ff0000"`)
- ❌ Never store layout information (`"left"`, `"200px"`)

### Layer 2: `view.data.model` — The View-Model

This holds data _transformed_ for display purposes. It bridges raw data and the DOM.

```javascript
control.view.data.model = new Data_Object({
    temperature_display: '72.5°F',         // Formatted from celsius
    date_display: 'February 11, 2026',     // Formatted from Date
    greeting: 'Hello, James!',             // Computed from user_name
    status_class: 'active',                // Derived from is_active
    count_label: '42 items'                // Formatted from count
});
```

Rules for `view.data.model`:
- ✅ Store display-ready strings and values
- ✅ Store UI state flags (selected, expanded, hovered)
- ✅ Store computed/derived values for display
- ❌ Never modify `data.model` directly from here

### Layer 3: `view.ui` — The DOM

The actual HTML elements that the browser renders. Controlled by the view-model.

```javascript
control.view.ui = {
    layout: 'horizontal',
    visibility: 'visible',
    el: document.createElement('div')
};
```

---

## 4.3 Data Objects and Evented Properties

The foundation of data binding is jsgui3's `Data_Object` from `lang-tools`. It provides observable properties with change events.

```javascript
const { Data_Object } = require('lang-tools');

const model = new Data_Object();

// Set a value
model.set('count', 0);

// Listen for changes
model.on('change', (e) => {
    console.log(`Property "${e.name}" changed: ${e.old} → ${e.value}`);
});

// Trigger change
model.set('count', 1);
// Output: Property "count" changed: 0 → 1

// Get current value
const current = model.get('count'); // 1
```

### Why This Matters

Because properties emit change events, the UI can _react_ to data changes automatically. When `data.model.set('temperature', 25)` is called, any watching view-model property recalculates, and any bound DOM element updates. There is no need to manually call a "render" function.

This is fundamentally different from frameworks that require explicit state management (Redux dispatches, React setState). In jsgui3, setting a property _is_ the update mechanism.

---

## 4.4 Bindings

Declarative connections between model properties and view-model properties.

### Simple Binding

```javascript
// When data.model.temperature_celsius changes,
// automatically update view.data.model.temperature_display
this.bind({
    'temperature_celsius': {
        to: 'temperature_display',
        transform: (celsius) => `${(celsius * 9/5 + 32).toFixed(1)}°F`
    }
});
```

### Bidirectional Binding

```javascript
// Two-way: changes in either direction propagate
this.bind({
    'temperature_celsius': {
        to: 'temperature_display',
        transform: (c) => `${(c * 9/5 + 32).toFixed(1)}°F`,
        reverse: (text) => {
            const f = parseFloat(text);
            return (f - 32) * 5/9;
        }
    }
});
```

The `reverse` function is called when the user edits the display value (e.g., typing in an input field). It converts the display format back to the raw data format.

### Binding with Validation

```javascript
this.bind({
    'email': {
        to: 'email_display',
        transform: (email) => email,
        validate: (email) => {
            if (!email.includes('@')) return 'Invalid email';
            return null; // null means valid
        }
    }
});
```

### Multi-Property Binding

```javascript
this.bind({
    'price': {
        to: 'total_display',
        depends: ['quantity'],
        transform: (price, { quantity }) => {
            return `$${(price * quantity).toFixed(2)}`;
        }
    }
});
```

---

## 4.5 Computed Properties

Derived values that automatically recalculate when their dependencies change.

```javascript
// Define a computed property on the view-model
this.computed(
    this.view.data.model,          // Target: where to store the result
    ['price', 'quantity', 'tax'],   // Dependencies: which data.model props to watch
    () => {
        const price = this.data.model.get('price') || 0;
        const qty = this.data.model.get('quantity') || 0;
        const tax = this.data.model.get('tax') || 0;
        const subtotal = price * qty;
        const total = subtotal * (1 + tax);
        return `$${total.toFixed(2)}`;
    },
    { propertyName: 'total_display' }
);
```

Now when any of `price`, `quantity`, or `tax` changes in `data.model`, the `total_display` property in `view.data.model` is automatically recalculated.

### Computed Properties vs. Bindings

| Feature | Binding | Computed Property |
|---------|---------|------------------|
| Number of inputs | One (with optional `depends`) | Multiple |
| Bidirectional? | Yes (with `reverse`) | No (read-only) |
| Complexity | Simple transforms | Arbitrary computation |
| Use case | Format/unformat one value | Derive from many values |

---

## 4.6 Watchers

Low-level observation mechanism for reacting to property changes without creating new properties:

```javascript
// Watch a data.model property and perform side effects
this.watch('count', (newValue, oldValue) => {
    if (newValue > 100) {
        this.dom.el.classList.add('over-limit');
    } else {
        this.dom.el.classList.remove('over-limit');
    }
});
```

Watchers are useful for:
- DOM manipulation that doesn't map to a property
- Triggering animations
- Logging or analytics
- Triggering validation

---

## 4.7 Transformations

Reusable transform functions that can be shared across controls:

```javascript
const transforms = {
    // Date formatting
    date_long: (date) => date.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }),
    date_short: (date) => date.toLocaleDateString('en-US'),
    date_iso: (date) => date.toISOString().split('T')[0],
    date_relative: (date) => {
        const diff = Date.now() - date.getTime();
        const days = Math.floor(diff / 86400000);
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    },
    
    // Number formatting
    currency: (n) => `$${n.toFixed(2)}`,
    percentage: (n) => `${(n * 100).toFixed(0)}%`,
    compact: (n) => {
        if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`;
        if (n >= 1000) return `${(n/1000).toFixed(1)}K`;
        return String(n);
    },
    
    // String formatting
    title_case: (s) => s.replace(/\b\w/g, c => c.toUpperCase()),
    truncate: (s, max = 50) => s.length > max ? s.slice(0, max) + '…' : s
};
```

Usage:

```javascript
this.bind({
    'created_at': {
        to: 'date_label',
        transform: transforms.date_relative
    },
    'revenue': {
        to: 'revenue_display',
        transform: transforms.currency
    },
    'followers': {
        to: 'followers_label',
        transform: transforms.compact
    }
});
```

---

## 4.8 The `ensure_control_models` Pattern

A utility pattern for initializing all three model layers when a control is constructed:

```javascript
class OrderItem extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        // Ensure all model layers exist with defaults
        ensure_control_models(this, {
            model: {
                product_name: '',
                price: 0,
                quantity: 1,
                discount: 0
            },
            view_model: {
                price_display: '$0.00',
                total_display: '$0.00',
                discount_badge: '',
                row_class: 'normal'
            },
            ui: {
                layout: 'horizontal',
                editable: true,
                selected: false
            }
        });
        
        // Set up bindings
        this.computed(
            this.view.data.model,
            ['price', 'quantity', 'discount'],
            () => {
                const p = this.data.model.get('price');
                const q = this.data.model.get('quantity');
                const d = this.data.model.get('discount');
                const total = (p * q) * (1 - d);
                return `$${total.toFixed(2)}`;
            },
            { propertyName: 'total_display' }
        );
    }
}
```

---

## 4.9 Practical Example: The Month View

The `month-view` control is one of the best examples of data/presentation separation in the library. Let's trace how data flows through all three layers.

### Layer 1: Data Model

```javascript
// Raw data — dates as JavaScript Date objects
data.model = {
    selected_date:    new Date(2026, 1, 11),     // Feb 11, 2026
    range_start:      new Date(2026, 1, 5),      // Feb 5
    range_end:        new Date(2026, 1, 15),      // Feb 15
    min_date:         new Date(2026, 0, 1),       // Jan 1 (can't go before)
    max_date:         new Date(2026, 11, 31),     // Dec 31 (can't go after)
    multi_select:     [],                          // Array of selected dates
    selection_mode:   'single'                     // 'single', 'range', 'multi'
};
```

### Layer 2: View Model

```javascript
// Display-ready data — strings, CSS classes, computed flags
view.data.model = {
    display_month:    'February 2026',
    header_cells:     ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    day_cells: [
        { day: 1,  iso: '2026-02-01', is_today: false, is_selected: false, 
          in_range: false, is_disabled: false, is_other_month: false },
        { day: 2,  iso: '2026-02-02', ... },
        // ... 28 or more cells
        { day: 11, iso: '2026-02-11', is_today: true, is_selected: true, 
          in_range: true, is_disabled: false, is_other_month: false },
        // ...
    ],
    selected_iso:     '2026-02-11',
    range_start_iso:  '2026-02-05',
    range_end_iso:    '2026-02-15',
    can_go_prev:      true,
    can_go_next:      true
};
```

### Layer 3: DOM

```html
<div class="jsgui-month-view" data-variant="default">
    <div class="mv-header">
        <button class="mv-prev">‹</button>
        <span class="mv-month-label">February 2026</span>
        <button class="mv-next">›</button>
    </div>
    <div class="mv-grid">
        <div class="mv-day-header">Sun</div>
        <div class="mv-day-header">Mon</div>
        <!-- ... -->
        <div class="mv-day" data-iso="2026-02-01">1</div>
        <div class="mv-day" data-iso="2026-02-02">2</div>
        <!-- ... -->
        <div class="mv-day selected today in-range" data-iso="2026-02-11">11</div>
        <!-- ... -->
    </div>
</div>
```

### How the Layers Connect

When the user clicks a day:

1. **DOM → Model:** Click handler extracts `data-iso` from the clicked element, parses it to a `Date`, and calls `data.model.set('selected_date', newDate)`
2. **Model → View-Model:** Change event triggers. Computed properties recalculate: `selected_iso`, `day_cells[].is_selected`, `day_cells[].in_range`
3. **View-Model → DOM:** Watchers apply CSS classes based on updated flags: `selected`, `in-range`, `is-today`

**No layer directly modifies another.** The flow is always: DOM event → Model update → View-Model recompute → DOM update.

### Why This Works Across Visual Modes

A Win32-themed month view would have:
- Sharp borders on the grid
- No rounded corners
- Tahoma font
- Classic highlight color (#0A246A blue)
- No hover animations

A modern dark-themed month view would have:
- Rounded day cells
- Smooth hover transition
- Inter font
- Gradient accent color
- Subtle shadow on selected day

But **the data model is identical**. The same `selected_date: new Date(2026, 1, 11)` drives both. The view-model is also identical. Only the CSS changes.

This is the power of separating data from presentation.

---

## 4.10 Design Rules for Control Authors

### Always Ask These Questions

When designing a new control, work through these questions in order:

1. **What is the data?** Define `data.model` properties first
   - What type is each property? (number, string, Date, boolean, array)
   - What is the valid range/domain?
   - What are the defaults?

2. **What does the user see?** Define `view.data.model` properties
   - What formatted strings does the UI display?
   - What CSS classes need to be computed?
   - What UI state flags are needed? (expanded, selected, editing)

3. **What transforms connect them?** Define bindings/computed properties
   - How does each data property map to its display?
   - Are any transforms bidirectional?
   - Are there multi-property computations?

4. **What does the DOM look like?** Define the HTML structure
   - What elements make up the control?
   - What attributes/classes come from the view-model?
   - What events does the DOM expose?

### Anti-Patterns to Avoid

| ❌ Anti-Pattern | ✅ Correct Approach |
|-----------------|---------------------|
| `model.set('price', '$42.00')` | `model.set('price', 42)` — store number, format in view-model |
| `model.set('color', '#ff0000')` | `model.set('hue', 0); model.set('saturation', 100)` — store components |
| `model.set('visible', false); el.style.display = 'none'` | `model.set('visible', false)` → watcher sets display |
| Reading DOM to get data: `parseInt(el.textContent)` | Reading model: `model.get('count')` |
| Storing locale-specific strings in model | Store raw values, format via locale-aware transforms |

### The Test

If you can delete all CSS, change the theme, and the control still:
- Stores correct data
- Emits correct events
- Responds to model changes

Then your data/presentation separation is correct. The control is **functionally complete** independent of any visual mode.
