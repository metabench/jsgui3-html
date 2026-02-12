# Chapter 9: From Inline Strings to a Proper CSS Pipeline

> The static `.css` string pattern was a pragmatic start.  
> It's time to replace it with something that scales.

---

## 9.1 How CSS Currently Gets to the Browser

Today, each control has a pattern like:

```javascript
Toggle_Switch.css = `.toggle-switch { ... }`;
```

This string is injected into a `<style>` tag at some point during page render. There is no central registry, no deduplication, and no ordering control. If two controls happen to have conflicting class names, the last one loaded wins.

### Problems

| Problem | Impact |
|---------|--------|
| No cascade control | Specificity conflicts between controls |
| No deduplication | If a control is instantiated twice, its CSS may be injected twice |
| No ordering | Cannot guarantee token layer loads before component layer |
| No tree-shaking | All CSS is bundled regardless of which controls are used |
| No source maps | Debugging inline `<style>` content is painful |
| No dark mode | Static strings can't respond to `[data-theme]` |
| No token usage | Strings contain hardcoded values |

---

## 9.2 The CSS Registry Pattern

### Step 1: Create a central CSS registry

```javascript
// css/css-registry.js
class CSSRegistry {
    constructor() {
        this._registered = new Map();
        this._injected = new Set();
        this._style_el = null;
    }

    register(name, css) {
        if (!this._registered.has(name)) {
            this._registered.set(name, css);
        }
    }

    inject(name) {
        if (this._injected.has(name)) return; // deduplicate
        const css = this._registered.get(name);
        if (!css) return;

        this._ensure_style_el();
        this._style_el.textContent += `\n/* [${name}] */\n${css}\n`;
        this._injected.add(name);
    }

    inject_all() {
        for (const name of this._registered.keys()) {
            this.inject(name);
        }
    }

    _ensure_style_el() {
        if (this._style_el) return;
        this._style_el = document.createElement('style');
        this._style_el.id = 'jsgui-components';
        document.head.appendChild(this._style_el);
    }
}

module.exports = new CSSRegistry(); // singleton
```

### Step 2: Controls register their CSS

```javascript
// In button.js constructor
const css_registry = require('../../css/css-registry');
css_registry.register('button', Button.css);

// ... later when activated
css_registry.inject('button');
```

### Step 3: Page context injects token layer first

```javascript
// In page-context.js
const css_registry = require('../css/css-registry');

// Register layers in order
css_registry.register('_tokens', `@layer jsgui-tokens { ... }`);
css_registry.register('_reset', `@layer jsgui-reset { ... }`);

// These always inject first
css_registry.inject('_reset');
css_registry.inject('_tokens');
```

---

## 9.3 Migration Path: Inline → External → Registry

### Phase 1: Keep inline, add registry (backward-compatible)

```javascript
// Each control's static .css property keeps working
// But constructor also registers with the registry
class Button extends Control {
    constructor(spec) {
        super(spec);
        css_registry.register('button', Button.css);
        css_registry.inject('button');
    }
}
```

### Phase 2: Move CSS to external files

Move each control's CSS to `css/components/button.css`. The static `.css` property now reads from the file (at build time) or is replaced by an import.

### Phase 3: Remove inline strings

Once all CSS is in external files and loaded via the registry, delete the static `.css` properties from all control classes.

---

## 9.4 Production Build Optimisation

For production, concatenate all CSS files in layer order:

```
css/jsgui-reset.css
css/jsgui-tokens.css
css/components/*.css      (alphabetical is fine within the layer)
css/jsgui-utilities.css
```

This produces a single `jsgui.min.css` (~15–20KB gzipped) that loads in a single request, with no runtime injection needed.

---

## 9.5 Development vs Production Comparison

| Aspect | Development | Production |
|--------|-------------|------------|
| CSS loading | Registry injects per-control | Single `jsgui.min.css` |
| Source maps | Inline `<style>` with comments | External `.css.map` |
| Hot reload | Registry can re-inject updated CSS | Full page reload |
| Tree-shaking | Automatic — only used controls inject | Manual — include only needed component files |
| Layer order | Registry enforces order | Concatenation order |

---

**Next:** [Chapter 10 — The 30-Day Sprint Plan](./10-sprint-plan.md)
