# Control_DOM

`Control_DOM` manages DOM-level state for every control in jsgui3-html. It is instantiated automatically by `Control_Core` — you never create one directly. Instead, you interact with it through `this.dom` on any control instance.

**Location:** `html-core/control-core.js`

## Architecture

```
Control_Core
└── this.dom  →  Control_DOM instance
                 └── this.attributes  →  Proxy(DOM_Attributes)
                                         └── this.style  →  reactive style object
```

### Classes

| Class | Extends | Purpose |
|-------|---------|---------|
| `DOM_Attributes` | `Evented_Class` | Stores attribute key-value pairs; emits `change` events when any attribute is set |
| `Control_DOM` | `Evented_Class` | Owns a `DOM_Attributes` instance behind a `Proxy` that intercepts gets/sets for reactivity |

## Properties

Every control has `this.dom` with these members:

| Property | Description |
|----------|-------------|
| `dom.tagName` | HTML tag name (e.g., `'div'`, `'button'`, `'input'`) |
| `dom.el` | Reference to the real DOM element (client-side only; `undefined` on server) |
| `dom.attributes` | Proxied `DOM_Attributes` — set any HTML attribute here |
| `dom.attributes.style` | Reactive style object — supports both string and object notation |
| `dom.noClosingTag` | `true` for void elements like `<input>`, `<br>`, `<hr>` |

Shorthand: `dom.attrs` is an alias for `dom.attributes`.

## Usage

### Setting Attributes

```javascript
class My_Control extends Control {
    constructor(spec) {
        super(spec);
        // Set HTML attributes
        this.dom.attributes.id = 'my-control';
        this.dom.attributes.role = 'dialog';
        this.dom.attributes['aria-label'] = 'Settings panel';
        this.dom.attributes['data-layout-mode'] = 'phone';
    }
}
```

### Setting Styles

The `style` property accepts both string and object notation:

```javascript
// String notation (parsed into key-value pairs)
this.dom.attributes.style = 'color: red; font-size: 14px;';

// Object notation (preferred for individual properties)
this.dom.attributes.style['background-color'] = '#f0f0f0';
this.dom.attributes.style['z-index'] = 10;

// CSS custom properties (tokens)
this.dom.attributes.style['--btn-height'] = '36px';
```

### Change Events

Because `DOM_Attributes` extends `Evented_Class`, all attribute changes emit `change` events. This is how the framework tracks what needs updating:

```javascript
this.dom.attributes.on('change', (e) => {
    console.log(`Attribute changed: ${e.name} = ${e.value}`);
});
```

Style changes also bubble up as attribute `change` events with `property: 'style'`.

### Server-Side Rendering

On the server, `dom.el` is `undefined`. Always guard direct DOM element access:

```javascript
// Guard for server-side safety
if (this.dom.el) {
    this.dom.el.classList.add('active');
}
```

The framework uses `dom.attributes` to build the HTML string during `all_html_render()`. After `activate()` on the client, `dom.el` is populated with the real DOM element.

## Related

- [html-core/README.md](../html-core/README.md) — Core framework overview
- [html-core/control-core.js](../html-core/control-core.js) — Source implementation
- [docs/theming_and_styling_system.md](theming_and_styling_system.md) — CSS token system used with `dom.attributes.style`