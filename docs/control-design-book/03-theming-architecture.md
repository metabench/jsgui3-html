# Chapter 3: Theming Architecture

> How the jsgui3-html theme system works from the ground up — tokens, variants,  
> the `themeable` mixin, merge priorities, and step-by-step theme creation.

---

## 3.1 Architecture Overview

The theming system has four layers, each building on the one below:

```
┌───────────────────────────────────────────────────────────────┐
│  Layer 4: Instance Overrides                                  │
│  spec.theme = { tokens: { color_primary: '#ff0000' } }        │
│  A single control instance says "make MY accent red"          │
├───────────────────────────────────────────────────────────────┤
│  Layer 3: Context Theme                                       │
│  context.theme = { name: 'dark', tokens: { ... } }            │
│  All controls in this page use the 'dark' theme               │
├───────────────────────────────────────────────────────────────┤
│  Layer 2: Variant Registries                                  │
│  button_variants['primary'] = { bg: 'primary', size: 'md' }  │
│  Named presets with default parameters for each control type  │
├───────────────────────────────────────────────────────────────┤
│  Layer 1: CSS Token Defaults                                  │
│  :root { --theme-color-bg: #f8fafc; ... }                    │
│  The base-level token values in the CSS                       │
└───────────────────────────────────────────────────────────────┘
```

**See:** [svg-06-theme-token-flow.svg](./svg-06-theme-token-flow.svg) — visual diagram of the token flow.

### Merge Priority

Higher layers override lower layers. The merge order is:

```
Final Value = merge(
    variant_defaults,       // Lowest: base defaults from the variant registry
    context.theme.params,   // Middle: theme-level overrides from context
    spec.params             // Highest: per-instance overrides from spec
)
```

This means a developer can:

1. Choose a global theme → all controls inherit its tokens
2. Choose a variant for one control → that control gets variant-specific defaults
3. Override individual params → surgical control over one instance

All three can be combined. The system handles merging transparently.

---

## 3.2 CSS Custom Properties (Tokens)

The foundation of the theme system is CSS custom properties. Every visual property that might vary between themes is expressed as a token.

### Token Naming Convention

```
--theme-{category}-{name}
```

Categories:

| Category | Purpose | Examples |
|----------|---------|----------|
| `color` | All colors | `--theme-color-bg`, `--theme-color-primary` |
| `space` | Spacing scale | `--theme-space-1` (4px), `--theme-space-2` (8px) |
| `radius` | Border radii | `--theme-radius-1` (4px), `--theme-radius-full` (9999px) |
| `font` | Typography | `--theme-font-family-base`, `--theme-font-size-base` |
| `shadow` | Box shadows | `--theme-shadow-1` (small), `--theme-shadow-3` (large) |
| `transition` | Animations | `--theme-transition-fast` (150ms), `--theme-transition-normal` (200ms) |
| `border` | Borders | `--theme-border-width` (1px), `--theme-border-color` |

### Complete Token Reference

```css
:root {
    /* ═══ Colors ═══ */
    --theme-color-bg: #f8fafc;           /* Page background */
    --theme-color-surface: #ffffff;       /* Control surface / card bg */
    --theme-color-surface-elevated: #f1f5f9;  /* Elevated surface (hover) */
    --theme-color-text: #1e293b;         /* Primary text */
    --theme-color-text-secondary: #64748b; /* Secondary/label text */
    --theme-color-text-muted: #94a3b8;   /* Placeholder/hint text */
    --theme-color-primary: #667eea;      /* Accent / CTA color */
    --theme-color-primary-hover: #7c94f5; /* Accent hover */
    --theme-color-primary-text: #ffffff; /* Text on primary */
    --theme-color-focus: #3b82f6;        /* Focus ring color */
    --theme-color-border: #e2e8f0;       /* Default border color */
    --theme-color-border-focus: #3b82f6; /* Border when focused */
    --theme-color-danger: #ef4444;       /* Error/destructive */
    --theme-color-success: #22c55e;      /* Success/positive */
    --theme-color-warning: #f59e0b;      /* Warning/caution */
    --theme-color-info: #3b82f6;         /* Informational */

    /* ═══ Win32 3D-specific colors ═══ */
    --theme-color-highlight: #ffffff;    /* 3D top/left highlight */
    --theme-color-shadow: #808080;       /* 3D bottom/right shadow */
    --theme-color-dark-shadow: #404040;  /* 3D outer shadow */
    --theme-3d-light: #f0f0f0;          /* 3D inner highlight */

    /* ═══ Spacing scale ═══ */
    --theme-space-1: 4px;    /* Tight */
    --theme-space-2: 8px;    /* Normal */
    --theme-space-3: 12px;   /* Comfortable */
    --theme-space-4: 16px;   /* Generous */
    --theme-space-5: 24px;   /* Spacious */
    --theme-space-6: 32px;   /* Very spacious */

    /* ═══ Border radii ═══ */
    --theme-radius-1: 4px;
    --theme-radius-2: 8px;
    --theme-radius-3: 12px;
    --theme-radius-4: 16px;
    --theme-radius-full: 9999px;  /* Pill shape */

    /* ═══ Typography ═══ */
    --theme-font-family-base: Inter, system-ui, -apple-system, sans-serif;
    --theme-font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
    --theme-font-size-xs: 11px;
    --theme-font-size-sm: 12px;
    --theme-font-size-base: 14px;
    --theme-font-size-md: 16px;
    --theme-font-size-lg: 18px;
    --theme-font-size-xl: 24px;
    --theme-font-weight-normal: 400;
    --theme-font-weight-medium: 500;
    --theme-font-weight-bold: 600;
    --theme-line-height: 1.5;

    /* ═══ Shadows ═══ */
    --theme-shadow-1: 0 1px 2px rgba(0,0,0,0.05);
    --theme-shadow-2: 0 4px 6px rgba(0,0,0,0.07);
    --theme-shadow-3: 0 10px 25px rgba(0,0,0,0.1);

    /* ═══ Transitions ═══ */
    --theme-transition-fast: 150ms ease;
    --theme-transition-normal: 200ms ease;
    --theme-transition-slow: 300ms ease-in-out;

    /* ═══ Borders ═══ */
    --theme-border-width: 1px;
}
```

---

## 3.3 The `apply_theme_tokens` Function

Located in `control_mixins/theme.js`, this function takes a token map and applies each as a CSS variable to a control's DOM element:

```javascript
function apply_theme_tokens(control, tokens) {
    const el = control.dom.el;
    if (!el) return;
    
    Object.entries(tokens).forEach(([key, value]) => {
        const css_var = normalize_token_key(key);
        el.style.setProperty(css_var, value);
    });
}

function normalize_token_key(key) {
    // Convert 'color_bg' → '--theme-color-bg'
    if (key.startsWith('--')) return key;
    return `--theme-${key.replace(/_/g, '-')}`;
}
```

### The `apply_theme` Function

A higher-level function that sets the `data-theme` attribute and applies tokens:

```javascript
function apply_theme(control, theme) {
    const el = control.dom.el;
    if (!el) return;
    
    if (theme.name) {
        el.setAttribute('data-theme', theme.name);
    }
    
    if (theme.tokens) {
        apply_theme_tokens(control, theme.tokens);
    }
    
    // Ensure all DOM styles are applied
    ensure_dom_styles(control);
}
```

---

## 3.4 The `themeable` Mixin

Located in `control_mixins/themeable.js`, this is the primary API for making a control respond to themes.

### Usage

```javascript
const { themeable, get_theme_params } = require('./control_mixins/themeable');

class Slider extends Control {
    constructor(spec) {
        super(spec);
        
        // Apply the themeable mixin
        const params = themeable(this, 'slider', spec, {
            defaults: {
                size: 'medium',
                track_style: 'filled',
                thumb_shape: 'circle'
            }
        });
        
        // params is the fully resolved parameter object
        this._compose(params);
    }
}
```

### What `themeable` Does

1. **Sets `__type_name`** on the control (e.g., `'slider'`) for CSS targeting
2. **Calls `resolve_params`** to merge:
   - The defaults you provided
   - The variant registry defaults (if a variant was specified in `spec.variant`)
   - The context theme params  
   - The instance spec params
3. **Sets `data-variant`** attribute on the DOM element
4. **Sets any `data-*` attributes** for CSS hook-able properties
5. **Returns** the merged params object

### The `resolve_params` Function

Located in `control_mixins/theme_params.js`:

```javascript
function resolve_params(type_name, spec, options = {}) {
    const { defaults = {} } = options;
    
    // Start with the provided defaults
    let params = { ...defaults };
    
    // Layer 2: If a variant is specified, merge variant defaults
    if (spec.variant) {
        const registry = get_variant_registry(type_name);
        if (registry && registry[spec.variant]) {
            params = { ...params, ...registry[spec.variant] };
        }
    }
    
    // Layer 3: Merge context theme params
    if (spec.context && spec.context.theme && spec.context.theme.params) {
        params = { ...params, ...spec.context.theme.params };
    }
    
    // Layer 4: Merge instance-level params (highest priority)
    if (spec.params) {
        params = { ...params, ...spec.params };
    }
    
    return params;
}
```

---

## 3.5 Variant Registries

Each control type has a registry of named parameter presets. These are defined in `themes/variants.js`.

### Current Registries

#### Button Variants

```javascript
const button_variants = {
    default:   { variant: 'filled', shape: 'rounded', size: 'medium', shadow: 'small' },
    primary:   { variant: 'filled', shape: 'rounded', size: 'medium', bg: 'primary', shadow: 'primary' },
    secondary: { variant: 'filled', shape: 'rounded', size: 'medium', bg: 'secondary' },
    ghost:     { variant: 'text', shape: 'rounded', size: 'medium', shadow: 'none' },
    danger:    { variant: 'filled', shape: 'rounded', size: 'medium', bg: 'danger' },
    success:   { variant: 'filled', shape: 'rounded', size: 'medium', bg: 'success' },
    outline:   { variant: 'outlined', shape: 'rounded', size: 'medium', shadow: 'none' },
    link:      { variant: 'text', shape: 'none', size: 'medium', shadow: 'none' },
    icon:      { variant: 'filled', shape: 'circle', size: 'icon', shadow: 'none' },
    fab:       { variant: 'filled', shape: 'circle', size: 'large', shadow: 'large', bg: 'primary' }
};
```

#### Window Variants

```javascript
const window_variants = {
    default: {
        title_bar_style: 'gradient',
        button_style: 'circles',
        has_menu_bar: false,
        has_toolbar: false,
        shadow: 'elevated',
        resize: true
    },
    macos: {
        title_bar_style: 'flat',
        button_style: 'traffic-lights',
        button_position: 'left',
        has_menu_bar: false,
        shadow: 'elevated',
        resize: true
    },
    'windows-11': {
        title_bar_style: 'flat',
        button_style: 'flat-icons',
        button_position: 'right',
        has_menu_bar: false,
        shadow: 'mica',
        resize: true,
        backdrop: 'mica'
    },
    minimal: {
        title_bar_style: 'hidden',
        button_style: 'close-only',
        has_menu_bar: false,
        shadow: 'none',
        resize: false
    }
};
```

#### Panel Variants

```javascript
const panel_variants = {
    default:     { style: 'flat', shadow: 'small', radius: 'medium' },
    card:        { style: 'elevated', shadow: 'medium', radius: 'large' },
    elevated:    { style: 'elevated', shadow: 'large', radius: 'large' },
    flush:       { style: 'flat', shadow: 'none', radius: 'none', border: 'none' },
    well:        { style: 'inset', shadow: 'inset', radius: 'medium' },
    glass:       { style: 'glass', shadow: 'large', radius: 'xlarge', blur: '16px' },
    outline:     { style: 'outlined', shadow: 'none', radius: 'medium' },
    hero:        { style: 'gradient', shadow: 'large', radius: 'xlarge' },
    collapsible: { style: 'flat', shadow: 'small', radius: 'medium', collapsible: true }
};
```

### Adding a New Variant

To add Win32 Classic variants:

```javascript
// In themes/variants.js

button_variants['vs-classic'] = {
    variant: 'raised',
    shape: 'square',
    size: 'medium',
    border_style: 'beveled-3d',
    focus_style: 'dotted-rect',
    shadow: 'none',
    font_family: 'Tahoma',
    font_size: '11px',
    padding: '4px 12px'
};

window_variants['vs-classic'] = {
    title_bar_style: 'gradient',
    button_style: 'win32',
    button_position: 'right',
    has_menu_bar: true,
    has_toolbar: true,
    shadow: 'none',
    border_style: 'beveled-3d',
    resize: true,
    resize_grip: 'classic'
};

panel_variants['win32-dialog'] = {
    style: 'flat',
    shadow: 'none',
    radius: 'none',
    border: 'beveled-3d',
    bg: 'surface'
};

panel_variants['win32-group'] = {
    style: 'flat',
    shadow: 'none',
    radius: 'none',
    border: 'etched'
};
```

---

## 3.6 Creating a Complete Theme: Step by Step

### Step 1: Define the Token Set

Create a JSON or JS file with all token values:

```javascript
// themes/win32-classic.js
module.exports = {
    name: 'win32',
    tokens: {
        color_bg:           '#ECE9D8',
        color_surface:      '#D4D0C8',
        color_text:         '#000000',
        color_text_secondary: '#333333',
        color_text_muted:   '#808080',
        color_primary:      '#0A246A',
        color_focus:        '#000000',
        color_border:       '#808080',
        color_highlight:    '#FFFFFF',
        color_shadow:       '#808080',
        color_dark_shadow:  '#404040',
        color_danger:       '#CC0000',
        color_success:      '#008000',
        color_warning:      '#FFD700',
        radius_1:           '0px',
        radius_2:           '0px',
        radius_3:           '0px',
        radius_full:        '0px',
        font_family_base:   'Tahoma, "Segoe UI", sans-serif',
        font_size_base:     '11px',
        font_weight_normal: '400',
        line_height:        '1.3',
        space_1:            '2px',
        space_2:            '4px',
        space_3:            '8px',
        space_4:            '12px',
        shadow_1:           'none',
        shadow_2:           'none',
        shadow_3:           'none',
        transition_fast:    '0ms',
        transition_normal:  '0ms',
        border_width:       '2px'
    }
};
```

### Step 2: Register Variants

Add control-specific variant entries to the variant registries (as shown in Section 3.5).

### Step 3: Create the CSS

```css
/* themes/win32.css */

[data-theme="win32"] {
    /* Apply all tokens */
    --theme-color-bg: #ECE9D8;
    --theme-color-surface: #D4D0C8;
    /* ... all tokens from Step 1 ... */
}

/* Win32-specific button rendering */
[data-theme="win32"] .jsgui-button[data-variant="vs-classic"] {
    border: none;
    border-radius: 0;
    box-shadow:
        inset -1px -1px 0 0 #404040,
        inset 1px 1px 0 0 #ffffff,
        inset -2px -2px 0 0 #808080,
        inset 2px 2px 0 0 #f0f0f0;
    /* ...etc... */
}
```

### Step 4: Apply to Controls

```javascript
const win32Theme = require('./themes/win32-classic');
const context = new Page_Context({ theme: win32Theme });

// Now all controls created with this context use the Win32 theme
const button = new Button({ context, text: 'OK' });
const input = new Text_Field({ context, placeholder: 'Search...' });
const window = new Win({ context, title: 'Properties' });
```

### Step 5: Test

Use the theme showcase lab to verify all controls render correctly:

```bash
node lab/theme_showcase_server.js --theme win32
```

Open in browser. Every control should look Win32 Classic.

---

## 3.7 Token Cascade and Inheritance

Tokens cascade down the control tree. If a parent sets `data-theme="win32"`, all children inherit those CSS variable values unless they override them.

```html
<div data-theme="win32">           <!-- Win32 tokens apply here -->
    <div class="jsgui-panel">      <!-- Inherits Win32 tokens -->
        <div class="jsgui-button"> <!-- Inherits Win32 tokens -->
        </div>
        <div data-theme="modern-dark" class="jsgui-panel">
            <!-- Override: this panel and its children use modern dark -->
            <div class="jsgui-button"> <!-- Inherits modern dark tokens -->
            </div>
        </div>
    </div>
</div>
```

This enables **mixed-mode UIs** — for example, a modern dark IDE with a Win32-styled Properties panel embedded inside it, or a light-themed app with a dark-themed sidebar.

---

## 3.8 TypeScript Support

The theme system ships with TypeScript declarations in `themes/*.d.ts` and `control_mixins/theme_params.d.ts`. These provide:

- Type-safe token names (no misspelling `color_backgroud`)
- Autocomplete for variant names
- Type-safe params for `themeable` mixin

```typescript
interface ThemeParams {
    name?: string;
    tokens?: Partial<ThemeTokens>;
}

interface ThemeTokens {
    color_bg: string;
    color_surface: string;
    color_text: string;
    color_primary: string;
    // ... all tokens
}

type ButtonVariant = 'default' | 'primary' | 'secondary' | 'ghost'
    | 'danger' | 'success' | 'outline' | 'link' | 'icon' | 'fab'
    | 'vs-classic';
```
