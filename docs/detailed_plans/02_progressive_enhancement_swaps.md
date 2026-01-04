# Progressive Enhancement (Swaps) - Detailed Implementation Plan

## Objective

Define and implement a progressive enhancement strategy that allows native HTML controls to be enhanced with jsgui3 functionality while maintaining accessibility, performance, and graceful degradation.

## Current State Analysis

### Existing Swaps Infrastructure

Located in `controls/swaps/`:
- Contains notes on progressive enhancement approach
- Strategy not fully implemented across controls

### Native-Compositional Pattern

Current controls in `0-native-compositional/` wrap native HTML elements:

```javascript
// Current pattern (button.js)
class Button extends Control {
    constructor(spec) {
        spec.tag_name = 'button';
        super(spec);
        // Enhancement logic
    }
}
```

### Gap Analysis

| Capability | Current State | Desired State |
|------------|--------------|---------------|
| SSR activation | Partial | Full support |
| Progressive enhancement | Ad-hoc | Systematic |
| Native fallback | Implicit | Explicit strategy |
| Enhancement detection | None | Clear API |

---

## Technical Specification

### 1. Progressive Enhancement Tiers

Define three enhancement levels:

| Tier | Description | JavaScript | CSS | Example |
|------|-------------|------------|-----|---------|
| T0 - Native | Raw HTML, no enhancement | None | Basic | `<input type="text">` |
| T1 - Styled | Native + CSS theming | Minimal | Theme | `<input class="jsgui-input">` |
| T2 - Enhanced | Full jsgui control | Full | Theme | `new Text_Input({...})` |

### 2. Swap Architecture

**Swap Registry:**

```javascript
// control_mixins/swap_registry.js

const swap_registry = new Map();

function register_swap(native_selector, control_class, options = {}) {
    swap_registry.set(native_selector, {
        control_class,
        priority: options.priority || 0,
        predicate: options.predicate || (() => true),
        enhancement_mode: options.enhancement_mode || 'full'
    });
}

function get_swap(element) {
    for (const [selector, config] of swap_registry) {
        if (element.matches(selector) && config.predicate(element)) {
            return config;
        }
    }
    return null;
}

module.exports = { register_swap, get_swap, swap_registry };
```

**Swap Modes:**

| Mode | Description | Use Case |
|------|-------------|----------|
| `full` | Replace native with control | Custom styling, complex behavior |
| `wrap` | Wrap native in control container | Validation, labels |
| `enhance` | Add behavior to native | Event normalization, a11y |
| `overlay` | Overlay control on native | Custom dropdown, datepicker |

### 3. Activation Pattern

For SSR-rendered HTML:

```javascript
// control_mixins/activation.js

class Activation_Manager {
    constructor(context) {
        this.context = context;
        this.activated = new WeakSet();
    }

    /**
     * Activate all swappable elements in container
     * @param {HTMLElement} container - Root element to scan
     * @param {Object} options - Activation options
     */
    activate(container, options = {}) {
        const { swap_registry } = require('./swap_registry');

        for (const [selector, config] of swap_registry) {
            const elements = container.querySelectorAll(selector);
            elements.forEach(el => {
                if (this.activated.has(el)) return;
                if (!config.predicate(el)) return;

                this._hydrate_element(el, config, options);
                this.activated.add(el);
            });
        }
    }

    _hydrate_element(el, config, options) {
        const { control_class, enhancement_mode } = config;

        switch (enhancement_mode) {
            case 'full':
                this._swap_full(el, control_class, options);
                break;
            case 'wrap':
                this._swap_wrap(el, control_class, options);
                break;
            case 'enhance':
                this._swap_enhance(el, control_class, options);
                break;
            case 'overlay':
                this._swap_overlay(el, control_class, options);
                break;
        }
    }

    _swap_full(el, Control_Class, options) {
        // Extract attributes and content
        const spec = this._extract_spec(el);
        spec.el = el; // Reuse existing element if control supports it
        spec.context = this.context;

        const control = new Control_Class(spec);
        control.activate();
    }

    _swap_wrap(el, Control_Class, options) {
        // Wrap element in control container
        const wrapper_spec = {
            context: this.context,
            native_element: el
        };
        const control = new Control_Class(wrapper_spec);
        el.parentNode.insertBefore(control.dom.el, el);
        control.dom.el.appendChild(el);
        control.activate();
    }

    _swap_enhance(el, Control_Class, options) {
        // Attach behavior without changing DOM structure
        const spec = {
            context: this.context,
            el: el,
            enhance_only: true
        };
        const control = new Control_Class(spec);
        control.activate();
    }

    _swap_overlay(el, Control_Class, options) {
        // Create overlay control positioned over native
        const spec = {
            context: this.context,
            target: el,
            overlay_mode: true
        };
        const control = new Control_Class(spec);
        control.activate();
    }

    _extract_spec(el) {
        const spec = {};

        // Standard attributes
        if (el.id) spec.id = el.id;
        if (el.name) spec.name = el.name;
        if (el.value) spec.value = el.value;
        if (el.disabled) spec.disabled = true;
        if (el.required) spec.required = true;
        if (el.placeholder) spec.placeholder = el.placeholder;

        // Data attributes
        for (const attr of el.attributes) {
            if (attr.name.startsWith('data-jsgui-')) {
                const key = attr.name.slice(11).replace(/-/g, '_');
                try {
                    spec[key] = JSON.parse(attr.value);
                } catch {
                    spec[key] = attr.value;
                }
            }
        }

        return spec;
    }
}

module.exports = { Activation_Manager };
```

### 4. Auto-Enhancement API

```javascript
// control_mixins/auto_enhance.js

const { Activation_Manager } = require('./activation');
const { register_swap } = require('./swap_registry');

/**
 * Enable automatic progressive enhancement
 * @param {Object} context - Page context
 * @param {Object} options - Enhancement options
 */
function enable_auto_enhancement(context, options = {}) {
    const manager = new Activation_Manager(context);

    // Initial activation
    if (options.immediate !== false) {
        manager.activate(document.body, options);
    }

    // Watch for new elements
    if (options.observe !== false) {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        manager.activate(node, options);
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return observer;
    }

    return manager;
}

module.exports = { enable_auto_enhancement };
```

---

## Implementation Steps

### Phase 1: Foundation

**Step 1.1: Create swap registry**

File: `control_mixins/swap_registry.js`

- Implement registry data structure
- Add registration and lookup functions
- Export for use by controls

**Step 1.2: Create activation manager**

File: `control_mixins/activation.js`

- Implement all swap modes
- Add attribute extraction
- Handle SSR markers

**Step 1.3: Create auto-enhance module**

File: `control_mixins/auto_enhance.js`

- Implement MutationObserver integration
- Add configuration options
- Export convenience function

### Phase 2: Control Integration

**Step 2.1: Update Text_Input for enhancement**

```javascript
// Text_Input.js modifications

class Text_Input extends Control {
    constructor(spec = {}) {
        // Support enhance-only mode
        if (spec.enhance_only && spec.el) {
            super({ ...spec, abstract: true });
            this._setup_enhancement(spec.el);
            return;
        }

        // Normal construction
        spec.tag_name = 'input';
        super(spec);
        // ...
    }

    _setup_enhancement(el) {
        this._native_el = el;
        // Preserve native element, add behaviors
    }

    activate() {
        if (this._native_el) {
            this._wire_native_events();
            return;
        }
        super.activate();
    }

    _wire_native_events() {
        this._native_el.addEventListener('input', (e) => {
            this.raise('input', { value: e.target.value });
        });
        this._native_el.addEventListener('change', (e) => {
            this.raise('change', { value: e.target.value });
        });
    }
}

// Register for auto-enhancement
const { register_swap } = require('../../../../control_mixins/swap_registry');
register_swap('input[type="text"]', Text_Input, {
    enhancement_mode: 'enhance',
    predicate: (el) => el.classList.contains('jsgui-enhance')
});
```

**Step 2.2: Update form controls**

Apply same pattern to:
- `checkbox.js`
- `radio-button.js`
- `dropdown-list.js` / `Select_Options.js`
- `textarea.js`
- `number_input.js`
- `date-picker.js`

**Step 2.3: Update complex controls**

For controls that need overlay mode:
- Calendar (date picker overlay)
- Combo-box (dropdown overlay)
- Color-picker (panel overlay)

### Phase 3: CSS Theming Layer

**Step 3.1: Create base native styles**

File: `css/native-enhanced.css`

```css
/* Tier 1: Styled native elements */

/* Text inputs */
input.jsgui-input,
input.jsgui-enhance,
.jsgui-form input[type="text"],
.jsgui-form input[type="email"],
.jsgui-form input[type="password"],
.jsgui-form input[type="tel"],
.jsgui-form input[type="url"],
.jsgui-form input[type="number"] {
    box-sizing: border-box;
    font-family: var(--jsgui-font-family, inherit);
    font-size: var(--jsgui-input-font-size, 14px);
    padding: var(--jsgui-input-padding, 8px 12px);
    border: var(--jsgui-input-border, 1px solid #ccc);
    border-radius: var(--jsgui-input-radius, 4px);
    background: var(--jsgui-input-bg, #fff);
    color: var(--jsgui-input-color, #333);
    transition: border-color 0.15s, box-shadow 0.15s;
}

input.jsgui-input:focus,
input.jsgui-enhance:focus,
.jsgui-form input:focus {
    outline: none;
    border-color: var(--jsgui-focus-color, #0066cc);
    box-shadow: 0 0 0 3px var(--jsgui-focus-ring, rgba(0, 102, 204, 0.2));
}

input.jsgui-input:disabled,
input.jsgui-enhance:disabled,
.jsgui-form input:disabled {
    background: var(--jsgui-input-disabled-bg, #f5f5f5);
    color: var(--jsgui-input-disabled-color, #999);
    cursor: not-allowed;
}

/* Validation states */
input.jsgui-invalid,
.jsgui-form input:invalid {
    border-color: var(--jsgui-error-color, #cc0000);
}

input.jsgui-valid,
.jsgui-form input.valid {
    border-color: var(--jsgui-success-color, #00cc00);
}

/* Buttons */
button.jsgui-button,
.jsgui-form button {
    font-family: var(--jsgui-font-family, inherit);
    font-size: var(--jsgui-button-font-size, 14px);
    padding: var(--jsgui-button-padding, 8px 16px);
    border: var(--jsgui-button-border, 1px solid #ccc);
    border-radius: var(--jsgui-button-radius, 4px);
    background: var(--jsgui-button-bg, #f0f0f0);
    color: var(--jsgui-button-color, #333);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
}

button.jsgui-button:hover,
.jsgui-form button:hover {
    background: var(--jsgui-button-hover-bg, #e0e0e0);
}

button.jsgui-button:active,
.jsgui-form button:active {
    background: var(--jsgui-button-active-bg, #d0d0d0);
}

/* Select */
select.jsgui-select,
.jsgui-form select {
    appearance: none;
    font-family: var(--jsgui-font-family, inherit);
    font-size: var(--jsgui-input-font-size, 14px);
    padding: var(--jsgui-input-padding, 8px 12px);
    padding-right: 32px;
    border: var(--jsgui-input-border, 1px solid #ccc);
    border-radius: var(--jsgui-input-radius, 4px);
    background: var(--jsgui-input-bg, #fff) url("data:image/svg+xml,...") no-repeat right 8px center;
    background-size: 12px;
}

/* Checkbox and Radio */
input[type="checkbox"].jsgui-checkbox,
input[type="radio"].jsgui-radio,
.jsgui-form input[type="checkbox"],
.jsgui-form input[type="radio"] {
    width: 18px;
    height: 18px;
    accent-color: var(--jsgui-accent-color, #0066cc);
}
```

**Step 3.2: Create enhancement markers**

Define CSS classes and data attributes that trigger enhancement:

| Marker | Effect |
|--------|--------|
| `.jsgui-enhance` | Enable auto-enhancement |
| `.jsgui-no-enhance` | Prevent auto-enhancement |
| `data-jsgui-mode="full"` | Force full swap mode |
| `data-jsgui-mode="styled"` | CSS only, no JS |
| `.jsgui-form` | Enhance all form inputs within |

### Phase 4: Documentation

**Step 4.1: Create usage guide**

File: `docs/progressive_enhancement_guide.md`

Contents:
- When to use each tier
- HTML markup patterns
- CSS customization
- JavaScript API
- SSR integration

**Step 4.2: Create examples**

Files in `dev-examples/progressive/`:
- `tier0-native.html` - No enhancement
- `tier1-styled.html` - CSS only
- `tier2-enhanced.html` - Full JavaScript
- `mixed-form.html` - Mixed enhancement levels
- `ssr-activation.html` - SSR activation example

---

## Code Patterns

### HTML Markup for Enhancement

```html
<!-- Tier 0: Native only -->
<input type="text" name="basic">

<!-- Tier 1: Styled native -->
<input type="text" name="styled" class="jsgui-input">

<!-- Tier 2: Auto-enhanced -->
<input type="text" name="enhanced" class="jsgui-enhance"
       data-jsgui-placeholder="Enter text..."
       data-jsgui-validation='{"required": true}'>

<!-- Full jsgui form -->
<form class="jsgui-form">
    <input type="text" name="auto" required>
    <input type="email" name="email">
    <button type="submit">Submit</button>
</form>
```

### Server-Side Rendering Markers

```html
<!-- SSR: Mark pre-rendered controls for activation -->
<div class="text-input jsgui-ssr" data-jsgui-activate="Text_Input">
    <input type="text" name="field" value="initial">
</div>

<!-- Client-side activation -->
<script>
    const { Activation_Manager } = require('jsgui3-html/control_mixins/activation');
    const manager = new Activation_Manager(page_context);

    // Activate SSR-rendered controls
    document.querySelectorAll('.jsgui-ssr').forEach(el => {
        const control_name = el.dataset.jsguiHydrate;
        // ... activation logic
    });
</script>
```

### Graceful Degradation Test

```javascript
// test/progressive/graceful_degradation.test.js

describe('Progressive enhancement', () => {
    it('should work without JavaScript', () => {
        // Render form with native elements
        const html = `
            <form class="jsgui-form">
                <input type="text" name="test" class="jsgui-input">
                <button type="submit">Submit</button>
            </form>
        `;

        // Verify form is functional without JS
        const form = document.createElement('div');
        form.innerHTML = html;
        const input = form.querySelector('input');

        // Native behavior works
        input.value = 'test';
        expect(input.value).toBe('test');
    });

    it('should enhance when JavaScript loads', () => {
        const input = document.createElement('input');
        input.type = 'text';
        input.classList.add('jsgui-enhance');
        document.body.appendChild(input);

        const { enable_auto_enhancement } = require('jsgui3-html/control_mixins/auto_enhance');
        enable_auto_enhancement(context);

        // Verify enhancement was applied
        expect(input.dataset.jsguiEnhanced).toBe('true');

        document.body.removeChild(input);
    });
});
```

---

## Testing Strategy

### Unit Tests

- Swap registry operations
- Activation manager modes
- Attribute extraction

### Integration Tests

- Full form enhancement
- Mixed enhancement levels
- SSR activation

### E2E Tests

- Progressive enhancement in browser
- JavaScript disabled fallback
- Slow network conditions

### Accessibility Tests

- Screen reader compatibility
- Keyboard navigation preserved
- Focus management

---

## Migration Notes

### For Existing Applications

Existing jsgui applications don't need changes - this adds new capabilities:

1. Add `native-enhanced.css` for Tier 1 styling
2. Add `jsgui-enhance` class to elements for auto-enhancement
3. Call `enable_auto_enhancement()` for automatic processing

### Opt-In Nature

Progressive enhancement is opt-in:
- No automatic changes to existing behavior
- Explicit markers required for enhancement
- Can mix enhanced and non-enhanced elements

---

## Success Criteria

1. **Native fallback works** - Forms function without JavaScript
2. **CSS-only tier works** - Styled elements look correct
3. **Enhancement is seamless** - No visible flash during activation
4. **Accessibility preserved** - Screen readers work at all tiers
5. **Performance acceptable** - Enhancement adds < 50ms on moderate forms
6. **Documentation complete** - Clear guide for each tier
