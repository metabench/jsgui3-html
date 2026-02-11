# Chapter 9: Deep Theme Integration

The color picker occupies a unique position in the jsgui3 control ecosystem: it is both **themed by** the theme system and **used to define** the theme system's colours. This chapter explores both directions and the architectural patterns that make this work cleanly.

## The Duality Problem

Most controls have a one-way relationship with themes:

```
Theme ───▶ Button    (theme tells button what colours to use)
Theme ───▶ Panel     (theme tells panel what shadow/radius to use)
```

The color picker is different. It has a **bidirectional** relationship:

```
Theme ───▶ Color_Picker    (theme styles the picker's own UI)
Color_Picker ───▶ Theme    (picker edits the theme's colour values)
```

This creates a feedback loop: changing a theme colour through the picker could change the picker's own appearance. This chapter addresses how to handle this elegantly.

---

## Part 1: The Color Picker as a Themed Control

### 1.1 Current Token Gap

The jsgui3 token system currently provides:

| Token Category | File | Scope |
|---------------|------|-------|
| **SIZE_TOKENS** | `themes/token_maps.js` | Heights, padding, font sizes per control |
| **SHADOW_TOKENS** | `themes/token_maps.js` | Box shadows (`none` → `xlarge`, `inset`) |
| **RADIUS_TOKENS** | `themes/token_maps.js` | Border radii (`none` → `full`) |
| **SPACING_TOKENS** | `themes/token_maps.js` | Gaps and margins |

**What's missing: COLOR_TOKENS.** No control in jsgui3 currently uses theme-managed colour tokens. The color picker is the ideal catalyst for introducing them.

### 1.2 Proposed COLOR_TOKENS

Add to `themes/token_maps.js`:

```javascript
const COLOR_TOKENS = {
    // Semantic colour roles
    light: {
        '--theme-bg':           '#FFFFFF',
        '--theme-bg-secondary': '#F5F5F5',
        '--theme-bg-tertiary':  '#E8E8E8',
        '--theme-fg':           '#1A1A1A',
        '--theme-fg-secondary': '#666666',
        '--theme-fg-muted':     '#999999',
        '--theme-border':       '#D4D4D4',
        '--theme-border-hover': '#A0A0A0',
        '--theme-accent':       '#1F75FE',
        '--theme-accent-hover': '#1560D4',
        '--theme-accent-fg':    '#FFFFFF',
        '--theme-success':      '#22C55E',
        '--theme-warning':      '#EAB308',
        '--theme-danger':       '#EF4444',
        '--theme-focus-ring':   'rgba(31, 117, 254, 0.4)'
    },
    dark: {
        '--theme-bg':           '#1A1A2E',
        '--theme-bg-secondary': '#222240',
        '--theme-bg-tertiary':  '#2A2A4A',
        '--theme-fg':           '#E8E8F0',
        '--theme-fg-secondary': '#A0A0B0',
        '--theme-fg-muted':     '#666680',
        '--theme-border':       '#3A3A5A',
        '--theme-border-hover': '#5A5A7A',
        '--theme-accent':       '#6C63FF',
        '--theme-accent-hover': '#8B83FF',
        '--theme-accent-fg':    '#FFFFFF',
        '--theme-success':      '#4ADE80',
        '--theme-warning':      '#FACC15',
        '--theme-danger':       '#F87171',
        '--theme-focus-ring':   'rgba(108, 99, 255, 0.4)'
    },
    // WLILO theme (the project's signature dark leather/gold theme)
    wlilo: {
        '--theme-bg':           '#1C1410',
        '--theme-bg-secondary': '#2A1F18',
        '--theme-bg-tertiary':  '#3D2E22',
        '--theme-fg':           '#E8D5B7',
        '--theme-fg-secondary': '#BFA882',
        '--theme-fg-muted':     '#8B7355',
        '--theme-border':       '#4A3828',
        '--theme-border-hover': '#6B5540',
        '--theme-accent':       '#D4A853',
        '--theme-accent-hover': '#E5C06A',
        '--theme-accent-fg':    '#1C1410',
        '--theme-success':      '#6BBA62',
        '--theme-warning':      '#D4A853',
        '--theme-danger':       '#C75050',
        '--theme-focus-ring':   'rgba(212, 168, 83, 0.4)'
    }
};
```

### 1.3 Color Picker Own-UI Theming

The color picker's **own** appearance consumes these tokens via CSS custom properties:

```css
.color-picker {
    /* Container */
    background: var(--theme-bg-secondary);
    border: 1px solid var(--theme-border);
    border-radius: var(--radius, 8px);
    color: var(--theme-fg);
}

.color-picker .tab-container {
    background: var(--theme-bg-tertiary);
    border-bottom: 1px solid var(--theme-border);
}

.color-picker .tab.active {
    color: var(--theme-accent);
    border-color: var(--theme-accent);
}

.color-picker .swatch-grid .cell:hover {
    box-shadow: 0 0 0 2px var(--theme-accent);
}

.color-picker .swatch-grid .cell.selected {
    box-shadow: 0 0 0 3px var(--theme-focus-ring);
}

.color-picker .preview-bar {
    border-top: 1px solid var(--theme-border);
}

.color-picker .hex-label {
    color: var(--theme-fg-secondary);
    font-family: monospace;
}

.color-picker .btn-ok {
    background: var(--theme-accent);
    color: var(--theme-accent-fg);
}

.color-picker .btn-cancel {
    background: transparent;
    color: var(--theme-fg-secondary);
    border: 1px solid var(--theme-border);
}
```

### 1.4 Variant Registration for Color Picker

Register the color picker in the variant system:

```javascript
// In themes/variants.js
const color_picker_variants = {
    'default': {
        size: 'medium',
        modes: ['swatches', 'spectrum', 'hex'],
        show_alpha: false,
        show_actions: true,
        shadow: 'medium',
        radius: 'medium'
    },
    'compact': {
        size: 'small',
        modes: ['swatches'],
        show_alpha: false,
        show_actions: false,
        shadow: 'small',
        radius: 'small'
    },
    'full': {
        size: 'medium',
        modes: ['swatches', 'spectrum', 'wheel', 'sliders', 'hex', 'named'],
        show_alpha: true,
        show_actions: true,
        shadow: 'medium',
        radius: 'medium'
    },
    'inline': {
        size: 'medium',
        modes: ['spectrum', 'hex'],
        show_alpha: false,
        show_actions: false,
        shadow: 'none',
        radius: 'none',
        border: false
    },
    // Special variant for the theme editor context
    'theme-editor': {
        size: 'medium',
        modes: ['spectrum', 'sliders', 'hex', 'named'],
        show_alpha: true,
        show_actions: true,
        shadow: 'large',
        radius: 'medium',
        show_css_var: true,       // Show the CSS variable name being edited
        show_contrast: true,      // Show WCAG contrast ratio
        immune_to_self: true      // Don't re-theme self when editing
    }
};
```

### 1.5 Size Tokens for Color Picker

```javascript
// In themes/token_maps.js → SIZE_TOKENS
color_picker: {
    small: {
        '--cp-width': '240px',
        '--cp-swatch-size': '16px',
        '--cp-swatch-gap': '2px',
        '--cp-font-size': '12px',
        '--cp-padding': '8px',
        '--cp-preview-height': '32px'
    },
    medium: {
        '--cp-width': '320px',
        '--cp-swatch-size': '22px',
        '--cp-swatch-gap': '3px',
        '--cp-font-size': '14px',
        '--cp-padding': '12px',
        '--cp-preview-height': '40px'
    },
    large: {
        '--cp-width': '400px',
        '--cp-swatch-size': '28px',
        '--cp-swatch-gap': '4px',
        '--cp-font-size': '16px',
        '--cp-padding': '16px',
        '--cp-preview-height': '48px'
    }
}
```

---

## Part 2: The Color Picker as a Theme Editor

This is where the color picker becomes more than a control — it becomes **infrastructure** for theme authoring.

### 2.1 The Theme Color Map

Define a standard structure for theme colour definitions:

```javascript
// html-core/theme-color-map.js

/**
 * A Theme_Color_Map describes all the colour tokens in a theme.
 * Each entry has a key (CSS variable name), a value (Color_Value),
 * a label, a group, and optional contrast requirements.
 */
class Theme_Color_Map {
    constructor(entries = []) {
        this._entries = entries.map(e => ({
            key: e.key,                    // '--theme-accent'
            value: Color_Value.from(e.value), // Color_Value instance
            label: e.label,                // 'Accent'
            group: e.group || 'general',   // 'backgrounds', 'text', 'semantic'
            contrast_against: e.contrast_against || null,  // key of token to check contrast with
            min_contrast: e.min_contrast || null           // WCAG level: 'AA', 'AAA', or number
        }));
    }

    get(key) { return this._entries.find(e => e.key === key); }
    set(key, color) {
        const entry = this.get(key);
        if (entry) entry.value = Color_Value.from(color);
    }

    get groups() {
        const groups = {};
        for (const e of this._entries) {
            (groups[e.group] = groups[e.group] || []).push(e);
        }
        return groups;
    }

    to_css_variables() {
        const vars = {};
        for (const e of this._entries) {
            vars[e.key] = e.value.css;
        }
        return vars;
    }

    to_json() {
        return this._entries.map(e => ({
            key: e.key,
            value: e.value.hex,
            label: e.label,
            group: e.group
        }));
    }

    static from_json(json) {
        return new Theme_Color_Map(json);
    }

    static from_css_variables(el) {
        // Read computed CSS variables from a DOM element
        const style = getComputedStyle(el);
        // ... parse --theme-* variables
    }
}
```

### 2.2 The Theme_Color_Editor Control

A specialised composite that uses multiple `Color_Picker` instances to edit a full theme:

```javascript
class Theme_Color_Editor extends Control {
    constructor(spec) {
        super(spec);
        this.__type_name = 'theme_color_editor';
        const params = themeable(this, 'theme_color_editor', spec);

        field(this, '_color_map', spec.color_map || Theme_Color_Map.default());
        prop(this, 'live_preview', spec.live_preview !== false);

        this._compose(params);
    }

    _compose(params) {
        const groups = this._color_map.groups;

        // Create a section for each group
        for (const [group_name, entries] of Object.entries(groups)) {
            const section = new Panel({
                context: this.context,
                variant: 'card',
                title: group_name
            });

            for (const entry of entries) {
                const row = this._create_color_row(entry);
                section.add(row);
            }

            this.add(section);
        }
    }

    _create_color_row(entry) {
        // Each row: [swatch] [label] [hex value] [edit button]
        const row = new Control({ context: this.context, class: 'color-row' });

        // Color swatch preview
        const swatch = new Control({ context: this.context, class: 'color-swatch' });
        swatch.style('background-color', entry.value.css);
        swatch.style('width', '32px');
        swatch.style('height', '32px');
        row.add(swatch);

        // Label
        const label = new Control({ context: this.context, tag: 'span' });
        label.set_content(entry.label);
        row.add(label);

        // CSS variable name (for developers)
        const var_name = new Control({ context: this.context, tag: 'code' });
        var_name.set_content(entry.key);
        row.add(var_name);

        // Hex value
        const hex = new Control({ context: this.context, tag: 'span', class: 'hex-value' });
        hex.set_content(entry.value.hex);
        row.add(hex);

        return row;
    }
}
```

### 2.3 Architecture: Picker Instance Per Token

When the user clicks a colour row, a `Color_Picker` appears (as a popover or inline expansion) bound to **that specific theme token**:

```javascript
activate() {
    // ... in Theme_Color_Editor

    this._rows.forEach((row, entry) => {
        row.on('click', () => {
            this._open_picker_for(entry);
        });
    });
}

_open_picker_for(entry) {
    // Close any existing picker
    if (this._active_picker) {
        this._active_picker.close();
    }

    const picker = new Color_Picker({
        context: this.context,
        variant: 'theme-editor',  // special variant
        color: entry.value,
        css_var_name: entry.key,  // display which token is being edited
        contrast_against: entry.contrast_against
            ? this._color_map.get(entry.contrast_against).value
            : null
    });

    picker.on('color-change', e => {
        // Update the map
        entry.value = e.value;

        // Update the swatch preview in the row
        row.swatch.style('background-color', e.value.css);
        row.hex.set_content(e.value.hex);

        // Live preview: inject the new value into the page
        if (this.live_preview) {
            document.documentElement.style.setProperty(entry.key, e.value.css);
        }

        // Raise event for external listeners
        this.raise('theme-color-change', {
            key: entry.key,
            value: e.value,
            label: entry.label,
            map: this._color_map
        });
    });

    picker.on('confirm', () => {
        this._active_picker = null;
    });

    picker.on('cancel', e => {
        // Revert live preview
        if (this.live_preview) {
            document.documentElement.style.setProperty(entry.key, e.original.css);
        }
        this._active_picker = null;
    });

    this._active_picker = picker;
}
```

### 2.4 Live Preview with Isolation

The critical challenge: when editing `--theme-accent`, the picker's own accent-coloured elements (active tab indicator, OK button) would change too. This creates a confusing feedback loop.

**Solution: Theme Isolation**

The `theme-editor` variant applies a **frozen snapshot** of the theme to the picker's own DOM, so editing tokens doesn't affect the picker itself:

```javascript
// In Color_Picker constructor, when variant === 'theme-editor':
if (params.immune_to_self) {
    this._freeze_own_theme();
}

_freeze_own_theme() {
    // Capture current computed values and apply them as inline styles
    // so CSS variable changes don't cascade into the picker
    const computed = getComputedStyle(this.dom.el);
    const tokens_to_freeze = [
        '--theme-bg', '--theme-bg-secondary', '--theme-bg-tertiary',
        '--theme-fg', '--theme-fg-secondary', '--theme-accent',
        '--theme-accent-hover', '--theme-accent-fg',
        '--theme-border', '--theme-border-hover', '--theme-focus-ring'
    ];

    for (const token of tokens_to_freeze) {
        const value = computed.getPropertyValue(token).trim();
        if (value) {
            // Set as a scoped variable with a different name
            this.dom.el.style.setProperty(token + '-frozen', value);
        }
    }

    // The picker's own CSS uses the frozen versions:
    this.add_class('theme-immune');
}
```

```css
/* When immune to self-editing, use frozen values */
.color-picker.theme-immune {
    background: var(--theme-bg-secondary-frozen, var(--theme-bg-secondary));
    border-color: var(--theme-border-frozen, var(--theme-border));
    color: var(--theme-fg-frozen, var(--theme-fg));
}
.color-picker.theme-immune .tab.active {
    color: var(--theme-accent-frozen, var(--theme-accent));
    border-color: var(--theme-accent-frozen, var(--theme-accent));
}
.color-picker.theme-immune .btn-ok {
    background: var(--theme-accent-frozen, var(--theme-accent));
    color: var(--theme-accent-fg-frozen, var(--theme-accent-fg));
}
```

This way, the rest of the page updates live as the user drags through colours, but the picker itself remains stable and usable.

---

## Part 3: WCAG Contrast Integration

When editing theme colours, it's critical to maintain accessibility. The color picker should show **real-time contrast ratios** when in theme-editor mode.

### 3.1 Contrast Ratio Calculation

Add to `Color_Value`:

```javascript
/**
 * Calculate WCAG 2.1 contrast ratio between two colours.
 * @returns {number} Ratio between 1:1 and 21:1
 */
static contrast_ratio(color_a, color_b) {
    const lum_a = color_a.relative_luminance();
    const lum_b = color_b.relative_luminance();
    const lighter = Math.max(lum_a, lum_b);
    const darker = Math.min(lum_a, lum_b);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Relative luminance per WCAG 2.1.
 * @returns {number} Between 0 (black) and 1 (white)
 */
relative_luminance() {
    const to_linear = c => {
        const srgb = c / 255;
        return srgb <= 0.03928
            ? srgb / 12.92
            : Math.pow((srgb + 0.055) / 1.055, 2.4);
    };
    const r = to_linear(this.r);
    const g = to_linear(this.g);
    const b = to_linear(this.b);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
```

### 3.2 Contrast Badge in the Picker

When `show_contrast` is enabled (theme-editor variant), display a badge:

```
┌─────────────────────────────┐
│ Editing: --theme-accent     │
│                             │
│  ┌─────────────────────┐    │
│  │   Spectrum Picker    │    │
│  └─────────────────────┘    │
│                             │
│  ┌──────────────────────┐   │
│  │ Contrast vs --theme-fg │  │
│  │      4.51 : 1          │  │
│  │   ✅ AA Normal Text    │  │
│  │   ✅ AA Large Text     │  │
│  │   ❌ AAA Normal Text   │  │
│  │   ✅ AAA Large Text    │  │
│  └──────────────────────┘   │
│                             │
│  #3A86FF         [OK][Cancel]│
└─────────────────────────────┘
```

WCAG thresholds:
- **AA Normal:** ≥ 4.5:1
- **AA Large:** ≥ 3:1
- **AAA Normal:** ≥ 7:1
- **AAA Large:** ≥ 4.5:1

### 3.3 Suggested Alternatives

If the chosen colour fails a contrast check, the picker can suggest the **nearest passing colour**:

```javascript
/**
 * Adjust lightness to meet a minimum contrast ratio.
 * @param {Color_Value} against - The background/foreground to contrast with
 * @param {number} min_ratio - Minimum contrast ratio (e.g. 4.5)
 * @returns {Color_Value} Adjusted colour, or the original if already passing
 */
suggest_for_contrast(against, min_ratio = 4.5) {
    if (Color_Value.contrast_ratio(this, against) >= min_ratio) {
        return this; // Already passes
    }

    const hsl = this.hsl;
    // Binary search on lightness to find the nearest passing value
    let lo = 0, hi = 100;
    const against_lum = against.relative_luminance();
    const should_lighten = against_lum < 0.5;

    if (should_lighten) { lo = hsl.l; }
    else { hi = hsl.l; }

    for (let i = 0; i < 20; i++) {
        const mid = (lo + hi) / 2;
        const candidate = Color_Value.from_hsl(hsl.h, hsl.s, mid);
        if (Color_Value.contrast_ratio(candidate, against) >= min_ratio) {
            if (should_lighten) hi = mid; else lo = mid;
        } else {
            if (should_lighten) lo = mid; else hi = mid;
        }
    }

    return Color_Value.from_hsl(hsl.h, hsl.s, (lo + hi) / 2);
}
```

---

## Part 4: Theme Export & Import

### 4.1 Export Formats

The `Theme_Color_Editor` can export the edited theme in multiple formats:

```javascript
class Theme_Color_Map {
    // ...

    /**
     * Export as CSS :root block
     */
    to_css() {
        const lines = [':root {'];
        for (const e of this._entries) {
            lines.push(`    ${e.key}: ${e.value.css};`);
        }
        lines.push('}');
        return lines.join('\n');
    }

    /**
     * Export as a jsgui3 theme context object
     */
    to_theme_context() {
        return {
            theme: {
                tokens: this.to_css_variables()
            }
        };
    }

    /**
     * Export as a JSON file for persistence
     */
    to_json_file() {
        return JSON.stringify({
            name: this._name,
            version: '1.0',
            colors: this.to_json(),
            generated: new Date().toISOString()
        }, null, 2);
    }

    /**
     * Export as token_maps.js entry
     */
    to_token_map_entry() {
        const entry = {};
        for (const e of this._entries) {
            entry[e.key] = e.value.hex;
        }
        return entry;
    }
}
```

### 4.2 Import from Existing Theme

Load colours from a live page, a saved JSON file, or a CSS file:

```javascript
// From the current page's computed styles
const map = Theme_Color_Map.from_computed(document.documentElement);

// From a JSON file
const map = Theme_Color_Map.from_json(parsed_json);

// From a CSS string
const map = Theme_Color_Map.from_css(css_string);

// From jsgui3 context.theme
const map = Theme_Color_Map.from_context(context);
```

---

## Part 5: Integration Points

### 5.1 As a Standalone Widget

```javascript
// Just pick a colour — the simplest use
const picker = new Color_Picker({
    context: ctx,
    color: Color_Value.from_hex('#FF0000')
});
picker.on('color-change', e => {
    my_element.style.color = e.value.css;
});
page.add(picker);
```

### 5.2 Inside a Form

```javascript
// Color field in a form — uses the compact variant
const form = new Form({ context: ctx });
form.add_field({
    type: 'color',
    name: 'brand_color',
    label: 'Brand Colour',
    control: new Color_Picker({
        context: ctx,
        variant: 'compact'
    })
});
```

### 5.3 As the Theme Editor

```javascript
// Full theme editing — uses Theme_Color_Editor
const editor = new Theme_Color_Editor({
    context: ctx,
    color_map: Theme_Color_Map.default_dark(),
    live_preview: true
});

editor.on('theme-color-change', e => {
    // Every change is applied live to the page
    console.log(`${e.key} changed to ${e.value.hex}`);
});

// Export when user is happy
save_button.on('click', () => {
    const theme_json = editor.color_map.to_json_file();
    download_file('my-theme.json', theme_json);
});
```

### 5.4 In the jsgui3 Admin UI

The admin UI can embed the `Theme_Color_Editor` as a settings page, allowing site themes to be customised without editing code:

```javascript
// In admin routes or admin page composition
const theme_page = new Panel({
    context: ctx,
    variant: 'card',
    title: 'Theme Colours'
});

const editor = new Theme_Color_Editor({
    context: ctx,
    color_map: current_theme_map,
    live_preview: true
});

const save = new Button({
    context: ctx,
    variant: 'primary',
    label: 'Save Theme'
});

save.on('click', async () => {
    const theme_data = editor.color_map.to_json();
    await api.post('/admin/theme', { colors: theme_data });
});

theme_page.add(editor);
theme_page.add(save);
```

---

## Part 6: The Colour Token Standard

### 6.1 Token Naming Convention

All jsgui3 colour tokens follow this pattern:

```
--theme-{role}[-{modifier}]

Roles:     bg, fg, border, accent, success, warning, danger
Modifiers: secondary, tertiary, muted, hover, active, disabled, fg
```

Examples:
- `--theme-bg` — primary background
- `--theme-fg-muted` — de-emphasised text
- `--theme-accent-hover` — accent on hover
- `--theme-danger` — error/destructive colour

### 6.2 Control-Specific Colour Overrides

Controls can define their own colour tokens that fall back to the semantic tokens:

```css
.button {
    /* Falls back to theme tokens if not overridden */
    background: var(--btn-bg, var(--theme-accent));
    color: var(--btn-fg, var(--theme-accent-fg));
    border-color: var(--btn-border, var(--theme-border));
}

.button:hover {
    background: var(--btn-bg-hover, var(--theme-accent-hover));
}

.color-picker {
    background: var(--cp-bg, var(--theme-bg-secondary));
    border-color: var(--cp-border, var(--theme-border));
}
```

This two-level system means:
1. **By default**, all controls inherit from the theme's semantic colours
2. **Per-control overrides** are possible without breaking the global theme
3. **The Theme_Color_Editor** can edit both levels

### 6.3 Applying Colour Tokens

Extend `apply_token_map` in `token_maps.js`:

```javascript
const apply_token_map = (ctrl, control_type, params) => {
    // ... existing size/shadow/radius logic ...

    // Apply colour theme tokens
    if (params.color_scheme && COLOR_TOKENS[params.color_scheme]) {
        Object.assign(ctrl.dom.attributes.style, COLOR_TOKENS[params.color_scheme]);
    }
};
```

---

## Summary: The Full Picture

```
┌──────────────────────────────────────────────────────┐
│                    Theme System                       │
│                                                      │
│  ┌──────────────┐    ┌──────────────┐               │
│  │ COLOR_TOKENS │    │ SIZE_TOKENS  │               │
│  │  light/dark  │    │ SHADOW_TOKENS│               │
│  │  wlilo/...   │    │ RADIUS_TOKENS│               │
│  └──────┬───────┘    └──────┬───────┘               │
│         │                   │                        │
│         ▼                   ▼                        │
│  ┌──────────────────────────────────┐               │
│  │      apply_token_map()           │               │
│  │      themeable()                 │               │
│  └──────────────┬───────────────────┘               │
│                 │                                    │
│      ┌──────────┴──────────┐                        │
│      ▼                     ▼                        │
│  ┌────────┐         ┌──────────────┐               │
│  │ Button │         │ Color_Picker │◄──── themed    │
│  │ Panel  │         │              │               │
│  │ Input  │         │  Modes:      │               │
│  │ ...    │         │  Swatches    │               │
│  └────────┘         │  Spectrum    │               │
│                     │  Hex Input   │               │
│                     │  ...         │               │
│                     └──────┬───────┘               │
│                            │                        │
│              ┌─────────────┴─────────────┐         │
│              │  Theme_Color_Editor        │         │
│              │  (uses Color_Picker per    │         │
│              │   token, with isolation)   │         │
│              │                            │         │
│              │  Edits ──▶ COLOR_TOKENS ───┘         │
│              │  Exports ──▶ JSON / CSS / context    │
│              └────────────────────────────┘         │
└──────────────────────────────────────────────────────┘
```

The color picker is the **missing keystone** that completes the theme system. It introduces colour tokens that every other control can consume, while simultaneously providing the UI for editing those tokens. The isolation pattern (`theme-immune`) breaks the feedback loop, and the `Theme_Color_Map` abstraction makes themes portable and exportable.
