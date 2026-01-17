# Theme System Extension Roadmap

This document outlines comprehensive plans for extending the jsgui3-html theme system to support more controls, features, and use cases. It is intended to serve as a detailed specification for implementation.

---

## Table of Contents

1. [Current State](#1-current-state)
2. [Themeable Mixin](#2-themeable-mixin)
3. [Control Variant Registries](#3-control-variant-registries)
4. [Token-to-CSS Mapping System](#4-token-to-css-mapping-system)
5. [Theme Inheritance](#5-theme-inheritance)
6. [Global Theme Context](#6-global-theme-context)
7. [CSS Generation Strategy](#7-css-generation-strategy)
8. [TypeScript Types](#8-typescript-types)
9. [Implementation Phases](#9-implementation-phases)
10. [Open Questions](#10-open-questions)

---

## 1. Current State

### What Exists (Phase 2 Complete ✅)

| Component | Location | Description | Status |
|-----------|----------|-------------|--------|
| `variants.js` | `themes/variants.js` | Variant registry with Window (4), Button (10), Panel (9) presets | ✅ Complete |
| `theme_params.js` | `control_mixins/theme_params.js` | `resolve_params()` for merging params with validation | ✅ Complete |
| `themeable.js` | `control_mixins/themeable.js` | Reusable mixin for all controls | ✅ Complete |
| `token_maps.js` | `themes/token_maps.js` | Size/shadow/radius → CSS variable mappings | ✅ Complete |
| `theme.js` | `control_mixins/theme.js` | Token application utilities | ✅ Complete |
| Window control | `controls/.../window.js` | Refactored with theme params | ✅ Complete |
| Button control | `controls/.../button.js` | Full theme support with icon/size/variant | ✅ Complete |
| Panel control | `controls/.../panel.js` | Full theme support with header/collapsible | ✅ Complete |

### TypeScript Declarations

| File | Status |
|------|--------|
| `types/theme.d.ts` | ✅ Updated with all variants/params |
| `types/index.d.ts` | ✅ Exports all types |
| `themes/variants.d.ts` | ✅ All variants declared |
| `themes/token_maps.d.ts` | ✅ Complete |
| `control_mixins/themeable.d.ts` | ✅ Complete |
| `control_mixins/theme_params.d.ts` | ✅ Complete |

### Current Merge Priority

```
┌─────────────────────────┐
│ spec.params             │ ← Highest priority (per-instance)
├─────────────────────────┤
│ context.theme.params    │ ← Theme-level defaults
├─────────────────────────┤
│ Variant defaults        │ ← Base defaults
└─────────────────────────┘
```

### Current Variant Support

| Control | Variants Available |
|---------|-------------------|
| Window | `default`, `macos`, `windows-11`, `minimal` |
| Button | `default`, `primary`, `secondary`, `ghost`, `danger`, `success`, `outline`, `link`, `icon`, `fab` |
| Panel | `default`, `card`, `elevated`, `flush`, `well`, `glass`, `outline`, `hero`, `collapsible` |

---

## 2. Themeable Mixin

### Purpose

Provide a reusable mixin that any control can call to automatically resolve theme params and apply styling hooks. This eliminates boilerplate and ensures consistent theming behavior.

### API Design

```javascript
// control_mixins/themeable.js

const { resolve_params, apply_hooks, derive_hooks } = require('./theme_params');

/**
 * Apply theming to a control.
 * 
 * @param {Control} ctrl - The control instance
 * @param {string} control_type - The control type name (e.g., 'button', 'panel')
 * @param {Object} spec - The control specification
 * @param {Object} [options] - Additional options
 * @param {Function} [options.warn] - Custom warning handler
 * @param {Object} [options.defaults] - Control-specific default params
 * @returns {Object} Resolved params object
 * 
 * @example
 * class MyButton extends Control {
 *     constructor(spec) {
 *         super(spec);
 *         const params = themeable(this, 'button', spec, {
 *             defaults: { size: 'medium' }
 *         });
 *         this._compose(params);
 *     }
 * }
 */
const themeable = (ctrl, control_type, spec, options = {}) => {
    // Set control type for CSS targeting
    ctrl.__type_name = ctrl.__type_name || control_type;
    
    // Resolve params with merge priority
    const { params, hooks } = resolve_params(control_type, spec, ctrl.context, options);
    
    // Merge with control-specific defaults
    const merged = { ...options.defaults, ...params };
    
    // Store for later access
    ctrl._theme_params = merged;
    
    // Apply data-attributes and classes
    apply_hooks(ctrl, hooks);
    
    // Add variant data attribute if specified
    if (spec.variant) {
        ctrl.dom.attributes = ctrl.dom.attributes || {};
        ctrl.dom.attributes['data-variant'] = spec.variant;
    }
    
    return merged;
};

/**
 * Get resolved params without applying hooks.
 * Useful for read-only inspection.
 */
const get_theme_params = (control_type, spec, context) => {
    const { params } = resolve_params(control_type, spec, context);
    return params;
};

module.exports = { themeable, get_theme_params };
```

### TypeScript Declaration

```typescript
// control_mixins/themeable.d.ts

import { Control } from '../html-core/control';
import { ControlSpec } from '../types/control-spec';

export interface ThemeableOptions {
    /** Custom warning handler */
    warn?: (message: string) => void;
    /** Control-specific default params */
    defaults?: Record<string, unknown>;
}

/**
 * Apply theming to a control.
 */
export declare function themeable<T = Record<string, unknown>>(
    ctrl: Control,
    control_type: string,
    spec: ControlSpec,
    options?: ThemeableOptions
): T;

/**
 * Get resolved params without applying hooks.
 */
export declare function get_theme_params<T = Record<string, unknown>>(
    control_type: string,
    spec: ControlSpec,
    context: object
): T;
```

### Usage Pattern

```javascript
// Before (manual)
class Button extends Control {
    constructor(spec) {
        super(spec);
        this.__type_name = 'button';
        const { params, hooks } = resolve_params('button', spec, this.context);
        this._theme_params = params;
        apply_hooks(this, hooks);
        // ... use params
    }
}

// After (with mixin)
class Button extends Control {
    constructor(spec) {
        super(spec);
        const params = themeable(this, 'button', spec);
        // ... use params
    }
}
```

---

## 3. Control Variant Registries

### 3.1 Button Variants

```javascript
const button_variants = {
    /**
     * Default button - secondary style, medium size.
     */
    'default': {
        size: 'medium',
        variant: 'secondary',
        icon_position: 'left',
        full_width: false,
        disabled_style: 'muted',
        loading_style: 'spinner'
    },

    /**
     * Primary action button - prominent styling.
     */
    'primary': {
        size: 'medium',
        variant: 'primary',
        icon_position: 'left',
        full_width: false
    },

    /**
     * Ghost button - minimal background.
     */
    'ghost': {
        size: 'medium',
        variant: 'ghost',
        icon_position: 'left'
    },

    /**
     * Icon-only button - no text label.
     */
    'icon': {
        size: 'medium',
        variant: 'ghost',
        icon_position: 'only',
        shape: 'circle'
    },

    /**
     * Danger/destructive action.
     */
    'danger': {
        size: 'medium',
        variant: 'danger',
        icon_position: 'left'
    },

    /**
     * Success/confirmation action.
     */
    'success': {
        size: 'medium',
        variant: 'success',
        icon_position: 'left'
    },

    /**
     * Floating action button (FAB).
     */
    'fab': {
        size: 'large',
        variant: 'primary',
        icon_position: 'only',
        shape: 'circle',
        elevation: 'high',
        position: 'fixed'
    },

    /**
     * Outline button - bordered, transparent fill.
     */
    'outline': {
        size: 'medium',
        variant: 'outline',
        icon_position: 'left'
    },

    /**
     * Link-style button - appears as text link.
     */
    'link': {
        size: 'medium',
        variant: 'link',
        underline: 'hover'
    }
};
```

#### Button Params Schema

```javascript
const button_schema = {
    size: ['small', 'medium', 'large', 'xlarge'],
    variant: ['primary', 'secondary', 'ghost', 'danger', 'success', 'outline', 'link'],
    icon_position: ['left', 'right', 'only', 'none'],
    shape: ['rectangle', 'pill', 'circle', 'square'],
    full_width: [true, false],
    elevation: ['none', 'low', 'medium', 'high'],
    disabled_style: ['muted', 'grayed', 'strikethrough'],
    loading_style: ['spinner', 'dots', 'pulse', 'none']
};
```

### 3.2 Panel/Card Variants

```javascript
const panel_variants = {
    /**
     * Default panel - no special styling.
     */
    'default': {
        padding: 'medium',
        border: false,
        shadow: 'none',
        radius: 'none',
        header: false,
        footer: false
    },

    /**
     * Card - elevated container with border radius.
     */
    'card': {
        padding: 'medium',
        border: true,
        shadow: 'small',
        radius: 'medium',
        header: true,
        footer: false
    },

    /**
     * Elevated card - more prominent shadow.
     */
    'elevated': {
        padding: 'large',
        border: false,
        shadow: 'large',
        radius: 'large',
        header: true,
        footer: false
    },

    /**
     * Flush - no padding, fills container.
     */
    'flush': {
        padding: 'none',
        border: false,
        shadow: 'none',
        radius: 'none'
    },

    /**
     * Well - inset container.
     */
    'well': {
        padding: 'medium',
        border: true,
        shadow: 'inset',
        radius: 'small',
        background: 'recessed'
    },

    /**
     * Glass - glassmorphism effect.
     */
    'glass': {
        padding: 'medium',
        border: true,
        shadow: 'medium',
        radius: 'large',
        background: 'glass',
        border_style: 'subtle'
    },

    /**
     * Outline - just a border.
     */
    'outline': {
        padding: 'medium',
        border: true,
        shadow: 'none',
        radius: 'medium',
        border_style: 'solid'
    },

    /**
     * Hero - large featured section.
     */
    'hero': {
        padding: 'xlarge',
        border: false,
        shadow: 'none',
        radius: 'none',
        min_height: '400px',
        content_align: 'center'
    }
};
```

#### Panel Params Schema

```javascript
const panel_schema = {
    padding: ['none', 'small', 'medium', 'large', 'xlarge'],
    border: [true, false],
    border_style: ['solid', 'dashed', 'subtle', 'gradient'],
    shadow: ['none', 'small', 'medium', 'large', 'inset'],
    radius: ['none', 'small', 'medium', 'large', 'full'],
    background: ['default', 'recessed', 'elevated', 'glass', 'gradient'],
    header: [true, false],
    footer: [true, false],
    collapsible: [true, false],
    content_align: ['start', 'center', 'end']
};
```

### 3.3 Input Variants

```javascript
const input_variants = {
    /**
     * Default input - standard text field.
     */
    'default': {
        size: 'medium',
        label_position: 'top',
        fill_style: 'outline',
        validation_style: 'inline',
        clear_button: false,
        show_count: false
    },

    /**
     * Compact - smaller, label on left.
     */
    'compact': {
        size: 'small',
        label_position: 'left',
        fill_style: 'outline',
        validation_style: 'tooltip'
    },

    /**
     * Floating - animated floating label.
     */
    'floating': {
        size: 'medium',
        label_position: 'floating',
        fill_style: 'outline',
        validation_style: 'inline'
    },

    /**
     * Filled - solid background.
     */
    'filled': {
        size: 'medium',
        label_position: 'top',
        fill_style: 'filled',
        validation_style: 'inline'
    },

    /**
     * Underline - only bottom border.
     */
    'underline': {
        size: 'medium',
        label_position: 'floating',
        fill_style: 'underline',
        validation_style: 'inline'
    },

    /**
     * Search - with search icon and clear button.
     */
    'search': {
        size: 'medium',
        label_position: 'hidden',
        fill_style: 'outline',
        shape: 'pill',
        prefix_icon: 'search',
        clear_button: true,
        placeholder: 'Search...'
    },

    /**
     * Inline - minimal, blends with text.
     */
    'inline': {
        size: 'small',
        label_position: 'hidden',
        fill_style: 'transparent',
        border_on_focus: true
    }
};
```

#### Input Params Schema

```javascript
const input_schema = {
    size: ['small', 'medium', 'large'],
    label_position: ['top', 'left', 'right', 'floating', 'hidden'],
    fill_style: ['outline', 'filled', 'underline', 'transparent'],
    shape: ['rectangle', 'pill'],
    validation_style: ['inline', 'tooltip', 'popover', 'none'],
    validation_trigger: ['blur', 'change', 'submit'],
    clear_button: [true, false],
    show_count: [true, false],
    prefix_icon: ['string'],  // Icon name
    suffix_icon: ['string'],
    border_on_focus: [true, false]
};
```

### 3.4 Navigation Variants

```javascript
const nav_variants = {
    /**
     * Horizontal navigation bar.
     */
    'horizontal': {
        direction: 'horizontal',
        align: 'center',
        indicator: 'underline',
        spacing: 'medium',
        overflow: 'scroll'
    },

    /**
     * Vertical navigation (sidebar).
     */
    'vertical': {
        direction: 'vertical',
        align: 'start',
        indicator: 'background',
        spacing: 'small',
        overflow: 'scroll'
    },

    /**
     * Collapsible sidebar.
     */
    'sidebar': {
        direction: 'vertical',
        collapsible: true,
        collapsed_width: 64,
        expanded_width: 240,
        indicator: 'left-border',
        icons_only_collapsed: true
    },

    /**
     * Tabs - horizontal with panel switching.
     */
    'tabs': {
        direction: 'horizontal',
        align: 'start',
        indicator: 'underline',
        role: 'tablist',
        panel_connection: true
    },

    /**
     * Pills - rounded background indicator.
     */
    'pills': {
        direction: 'horizontal',
        align: 'start',
        indicator: 'background',
        shape: 'pill',
        spacing: 'small'
    },

    /**
     * Breadcrumb navigation.
     */
    'breadcrumb': {
        direction: 'horizontal',
        separator: '/',
        collapsible: true,
        max_items: 5,
        truncate_middle: true
    },

    /**
     * Stepper/wizard navigation.
     */
    'stepper': {
        direction: 'horizontal',
        numbered: true,
        show_connector: true,
        allow_skip: false,
        completed_style: 'checkmark'
    }
};
```

#### Navigation Params Schema

```javascript
const nav_schema = {
    direction: ['horizontal', 'vertical'],
    align: ['start', 'center', 'end', 'stretch'],
    indicator: ['none', 'underline', 'background', 'left-border', 'right-border'],
    spacing: ['none', 'small', 'medium', 'large'],
    overflow: ['scroll', 'wrap', 'menu', 'hidden'],
    collapsible: [true, false],
    collapsed_width: ['number'],
    expanded_width: ['number'],
    icons_only_collapsed: [true, false],
    shape: ['rectangle', 'pill'],
    role: ['navigation', 'tablist', 'menu']
};
```

### 3.5 Menu Variants

```javascript
const menu_variants = {
    /**
     * Standard dropdown menu.
     */
    'dropdown': {
        trigger: 'click',
        position: 'bottom-start',
        arrow: false,
        animation: 'fade-slide',
        close_on_select: true,
        close_on_outside: true
    },

    /**
     * Context menu (right-click).
     */
    'context': {
        trigger: 'contextmenu',
        position: 'cursor',
        arrow: false,
        animation: 'fade',
        close_on_select: true
    },

    /**
     * Hover-triggered cascading menu.
     */
    'cascading': {
        trigger: 'hover',
        position: 'right-start',
        open_delay: 200,
        close_delay: 300,
        nested: true,
        arrow: false
    },

    /**
     * Select/combobox dropdown.
     */
    'select': {
        trigger: 'click',
        position: 'bottom-start',
        match_trigger_width: true,
        searchable: false,
        multi_select: false,
        animation: 'slide'
    },

    /**
     * Autocomplete/typeahead menu.
     */
    'autocomplete': {
        trigger: 'focus',
        position: 'bottom-start',
        match_trigger_width: true,
        searchable: true,
        highlight_match: true,
        min_chars: 1
    },

    /**
     * Command palette (Ctrl+K style).
     */
    'command': {
        trigger: 'keyboard',
        position: 'center',
        modal: true,
        searchable: true,
        grouped: true,
        shortcuts: true,
        recent: true
    }
};
```

#### Menu Params Schema

```javascript
const menu_schema = {
    trigger: ['click', 'hover', 'focus', 'contextmenu', 'keyboard'],
    position: ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 
               'bottom-start', 'bottom-end', 'left-start', 'left-end',
               'right-start', 'right-end', 'cursor', 'center'],
    arrow: [true, false],
    animation: ['none', 'fade', 'slide', 'fade-slide', 'scale'],
    close_on_select: [true, false],
    close_on_outside: [true, false],
    match_trigger_width: [true, false],
    searchable: [true, false],
    multi_select: [true, false],
    modal: [true, false],
    open_delay: ['number'],
    close_delay: ['number']
};
```

### 3.6 Form Layout Variants

```javascript
const form_variants = {
    /**
     * Default - stacked labels.
     */
    'default': {
        layout: 'vertical',
        label_position: 'top',
        gap: 'medium',
        field_width: 'full'
    },

    /**
     * Inline - side by side.
     */
    'inline': {
        layout: 'horizontal',
        label_position: 'left',
        label_width: '30%',
        gap: 'small',
        align_labels: 'right'
    },

    /**
     * Compact - dense layout.
     */
    'compact': {
        layout: 'vertical',
        label_position: 'floating',
        gap: 'small',
        field_width: 'full'
    },

    /**
     * Two column grid.
     */
    'grid-2': {
        layout: 'grid',
        columns: 2,
        label_position: 'top',
        gap: 'medium',
        responsive_breakpoint: 768
    },

    /**
     * Three column grid.
     */
    'grid-3': {
        layout: 'grid',
        columns: 3,
        label_position: 'top',
        gap: 'medium',
        responsive_breakpoint: 1024
    },

    /**
     * Wizard - multi-step form.
     */
    'wizard': {
        layout: 'stepped',
        steps_position: 'top',
        label_position: 'top',
        gap: 'medium',
        show_progress: true,
        allow_back: true
    }
};
```

#### Form Params Schema

```javascript
const form_schema = {
    layout: ['vertical', 'horizontal', 'grid', 'stepped'],
    label_position: ['top', 'left', 'right', 'floating', 'hidden'],
    label_width: ['string'],  // CSS value like '30%' or '120px'
    align_labels: ['left', 'right'],
    gap: ['none', 'small', 'medium', 'large'],
    field_width: ['auto', 'full'],
    columns: ['number'],
    responsive_breakpoint: ['number'],
    show_required: [true, false],
    error_position: ['inline', 'bottom', 'tooltip']
};
```

### 3.7 Dialog/Modal Variants

```javascript
const dialog_variants = {
    /**
     * Standard modal dialog.
     */
    'default': {
        size: 'medium',
        position: 'center',
        backdrop: true,
        close_button: true,
        close_on_escape: true,
        close_on_backdrop: true,
        animation: 'fade-scale'
    },

    /**
     * Small alert dialog.
     */
    'alert': {
        size: 'small',
        position: 'center',
        backdrop: true,
        close_button: false,
        close_on_escape: true,
        close_on_backdrop: false,
        icon: 'warning'
    },

    /**
     * Full-screen modal.
     */
    'fullscreen': {
        size: 'fullscreen',
        position: 'center',
        backdrop: false,
        close_button: true,
        animation: 'slide-up'
    },

    /**
     * Side sheet - slides from edge.
     */
    'sheet': {
        size: 'auto',
        position: 'right',
        width: '400px',
        height: '100%',
        backdrop: true,
        animation: 'slide-right'
    },

    /**
     * Bottom sheet - slides from bottom.
     */
    'bottom-sheet': {
        size: 'auto',
        position: 'bottom',
        width: '100%',
        max_height: '90%',
        backdrop: true,
        animation: 'slide-up',
        drag_to_dismiss: true
    },

    /**
     * Drawer - persistent side panel.
     */
    'drawer': {
        size: 'auto',
        position: 'left',
        width: '280px',
        height: '100%',
        backdrop: false,
        persistent: true,
        push_content: true
    }
};
```

---

## 4. Token-to-CSS Mapping System

### Purpose

Map abstract param values (like `size: 'medium'`) to concrete CSS variables or styles. This enables consistent sizing, spacing, and visual properties across all themed controls.

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Resolved Params │ --> │ Token Mapper     │ --> │ CSS Variables   │
│ { size: 'md' }  │     │ (per control)    │     │ --btn-height    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Implementation

```javascript
// themes/token_maps.js

/**
 * Size token mappings for different controls.
 */
const SIZE_TOKENS = {
    button: {
        small: {
            '--btn-height': '28px',
            '--btn-padding-x': '12px',
            '--btn-font-size': '12px',
            '--btn-icon-size': '14px',
            '--btn-border-radius': '4px'
        },
        medium: {
            '--btn-height': '36px',
            '--btn-padding-x': '16px',
            '--btn-font-size': '14px',
            '--btn-icon-size': '16px',
            '--btn-border-radius': '6px'
        },
        large: {
            '--btn-height': '44px',
            '--btn-padding-x': '20px',
            '--btn-font-size': '16px',
            '--btn-icon-size': '20px',
            '--btn-border-radius': '8px'
        },
        xlarge: {
            '--btn-height': '56px',
            '--btn-padding-x': '28px',
            '--btn-font-size': '18px',
            '--btn-icon-size': '24px',
            '--btn-border-radius': '12px'
        }
    },
    input: {
        small: {
            '--input-height': '32px',
            '--input-padding-x': '10px',
            '--input-font-size': '13px',
            '--input-border-radius': '4px'
        },
        medium: {
            '--input-height': '40px',
            '--input-padding-x': '12px',
            '--input-font-size': '14px',
            '--input-border-radius': '6px'
        },
        large: {
            '--input-height': '48px',
            '--input-padding-x': '16px',
            '--input-font-size': '16px',
            '--input-border-radius': '8px'
        }
    },
    panel: {
        none: { '--panel-padding': '0' },
        small: { '--panel-padding': '8px' },
        medium: { '--panel-padding': '16px' },
        large: { '--panel-padding': '24px' },
        xlarge: { '--panel-padding': '40px' }
    }
};

/**
 * Shadow token mappings.
 */
const SHADOW_TOKENS = {
    none: { '--shadow': 'none' },
    small: { '--shadow': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)' },
    medium: { '--shadow': '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)' },
    large: { '--shadow': '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.1)' },
    inset: { '--shadow': 'inset 0 2px 4px rgba(0,0,0,0.1)' }
};

/**
 * Border radius token mappings.
 */
const RADIUS_TOKENS = {
    none: { '--radius': '0' },
    small: { '--radius': '4px' },
    medium: { '--radius': '8px' },
    large: { '--radius': '12px' },
    full: { '--radius': '9999px' }
};

/**
 * Apply token mapping to a control.
 * @param {Control} ctrl - Control instance
 * @param {string} control_type - Control type name
 * @param {Object} params - Resolved params
 */
const apply_token_map = (ctrl, control_type, params) => {
    ctrl.dom.attributes = ctrl.dom.attributes || {};
    ctrl.dom.attributes.style = ctrl.dom.attributes.style || {};
    
    // Apply size tokens
    if (params.size && SIZE_TOKENS[control_type]?.[params.size]) {
        Object.assign(ctrl.dom.attributes.style, SIZE_TOKENS[control_type][params.size]);
    }
    
    // Apply shadow tokens
    if (params.shadow && SHADOW_TOKENS[params.shadow]) {
        Object.assign(ctrl.dom.attributes.style, SHADOW_TOKENS[params.shadow]);
    }
    
    // Apply radius tokens
    if (params.radius && RADIUS_TOKENS[params.radius]) {
        Object.assign(ctrl.dom.attributes.style, RADIUS_TOKENS[params.radius]);
    }
    
    // Apply padding tokens (for panels)
    if (params.padding && SIZE_TOKENS.panel?.[params.padding]) {
        Object.assign(ctrl.dom.attributes.style, SIZE_TOKENS.panel[params.padding]);
    }
};

module.exports = {
    SIZE_TOKENS,
    SHADOW_TOKENS,
    RADIUS_TOKENS,
    apply_token_map
};
```

### CSS Variables Reference

```css
/* Base token variables set by theme */
:root {
    /* Colors */
    --color-primary: #0066cc;
    --color-secondary: #666666;
    --color-success: #28a745;
    --color-danger: #dc3545;
    --color-warning: #ffc107;
    
    /* Backgrounds */
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --bg-elevated: #ffffff;
    
    /* Text */
    --text-primary: #1a1a1a;
    --text-secondary: #666666;
    --text-muted: #999999;
    
    /* Borders */
    --border-color: #e0e0e0;
    --border-width: 1px;
    
    /* Spacing scale */
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 24px;
    --space-6: 32px;
    --space-7: 48px;
    --space-8: 64px;
}

/* Button uses its tokens */
.button {
    height: var(--btn-height, 36px);
    padding: 0 var(--btn-padding-x, 16px);
    font-size: var(--btn-font-size, 14px);
    border-radius: var(--btn-border-radius, 6px);
}

/* Input uses its tokens */
.input {
    height: var(--input-height, 40px);
    padding: 0 var(--input-padding-x, 12px);
    font-size: var(--input-font-size, 14px);
    border-radius: var(--input-border-radius, 6px);
}

/* Panel uses its tokens */
.panel {
    padding: var(--panel-padding, 16px);
    border-radius: var(--radius, 0);
    box-shadow: var(--shadow, none);
}
```

---

## 5. Theme Inheritance

### Purpose

Allow themes to extend other themes, inheriting their tokens and params while overriding specific values.

### Theme Registry

```javascript
// themes/registry.js

const themes = {};

/**
 * Register a theme.
 * @param {string} name - Theme name
 * @param {Object} theme - Theme definition
 */
const register_theme = (name, theme) => {
    themes[name] = theme;
};

/**
 * Resolve a theme with inheritance.
 * @param {string|Object} theme - Theme name or spec
 * @returns {Object} Fully resolved theme
 */
const resolve_theme = (theme) => {
    if (typeof theme === 'string') {
        theme = themes[theme];
        if (!theme) return { tokens: {}, params: {} };
    }
    
    // Base case - no inheritance
    if (!theme.extends) {
        return {
            name: theme.name,
            tokens: { ...theme.tokens },
            params: deep_clone(theme.params || {})
        };
    }
    
    // Recursive inheritance
    const parent = resolve_theme(theme.extends);
    
    return {
        name: theme.name,
        extends: theme.extends,
        tokens: { ...parent.tokens, ...theme.tokens },
        params: deep_merge(parent.params, theme.params || {})
    };
};

/**
 * Get list of all registered theme names.
 */
const get_theme_names = () => Object.keys(themes);

module.exports = { register_theme, resolve_theme, get_theme_names, themes };
```

### Built-in Themes

```javascript
// themes/presets.js

const { register_theme } = require('./registry');

// Base light theme
register_theme('light', {
    name: 'light',
    tokens: {
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f8f9fa',
        '--bg-elevated': '#ffffff',
        '--text-primary': '#1a1a1a',
        '--text-secondary': '#666666',
        '--border-color': '#e0e0e0',
        '--color-primary': '#0066cc',
        '--color-success': '#28a745',
        '--color-danger': '#dc3545'
    },
    params: {
        window: { button_style: 'icons' },
        button: { variant: 'secondary' },
        panel: { shadow: 'small' }
    }
});

// Dark theme - extends light
register_theme('dark', {
    name: 'dark',
    extends: 'light',
    tokens: {
        '--bg-primary': '#1a1a1a',
        '--bg-secondary': '#2d2d2d',
        '--bg-elevated': '#3d3d3d',
        '--text-primary': '#ffffff',
        '--text-secondary': '#b0b0b0',
        '--border-color': '#444444'
    }
});

// macOS theme - extends light with window params
register_theme('macos', {
    name: 'macos',
    extends: 'light',
    params: {
        window: {
            button_position: 'left',
            button_order: ['close', 'minimize', 'maximize'],
            button_style: 'traffic-light',
            title_alignment: 'center'
        }
    }
});

// macOS dark
register_theme('macos-dark', {
    name: 'macos-dark',
    extends: 'dark',
    params: {
        window: {
            button_position: 'left',
            button_order: ['close', 'minimize', 'maximize'],
            button_style: 'traffic-light',
            title_alignment: 'center'
        }
    }
});

// Windows 11 theme
register_theme('windows-11', {
    name: 'windows-11',
    extends: 'light',
    tokens: {
        '--color-primary': '#0078d4',
        '--radius': '8px'
    },
    params: {
        window: {
            button_position: 'right',
            button_style: 'segoe'
        },
        panel: {
            radius: 'medium'
        }
    }
});

// Windows 11 dark
register_theme('windows-11-dark', {
    name: 'windows-11-dark',
    extends: 'windows-11',
    tokens: {
        '--bg-primary': '#1f1f1f',
        '--bg-secondary': '#282828',
        '--text-primary': '#ffffff'
    }
});
```

### Usage

```javascript
// Apply a theme to context
const { resolve_theme } = require('jsgui3-html/themes/registry');

context.theme = resolve_theme('macos-dark');

// Now all controls in this context will use macos-dark params
const win = new Window({ context, title: 'Themed Window' });
// win uses button_position: 'left', button_style: 'traffic-light'
```

---

## 6. Global Theme Context

### Purpose

Provide a global or app-level theme that applies to all controls without needing to pass through context.

### Implementation

```javascript
// themes/global.js

let global_theme = null;

/**
 * Set the global theme.
 * @param {string|Object} theme - Theme name or spec
 */
const set_global_theme = (theme) => {
    const { resolve_theme } = require('./registry');
    global_theme = typeof theme === 'string' ? resolve_theme(theme) : theme;
};

/**
 * Get the global theme.
 * @returns {Object|null}
 */
const get_global_theme = () => global_theme;

/**
 * Clear the global theme.
 */
const clear_global_theme = () => {
    global_theme = null;
};

module.exports = { set_global_theme, get_global_theme, clear_global_theme };
```

### Integration with resolve_params

```javascript
// Update resolve_params to check global theme
const resolve_params = (control_type, spec, context, options = {}) => {
    const { get_global_theme } = require('../themes/global');
    
    // Theme priority: context.theme > global_theme > defaults
    const active_theme = context?.theme || get_global_theme() || {};
    
    // ... rest of implementation
};
```

---

## 7. CSS Generation Strategy

### Option A: Runtime Inline Styles

Currently implemented - tokens are applied as inline styles via `dom.attributes.style`.

**Pros:**
- Works immediately
- No build step required
- Per-instance overrides are trivial

**Cons:**
- Larger HTML output
- No CSS caching
- Specificity can be unpredictable

### Option B: Static CSS with Data Attributes

Generate CSS that targets data attributes.

```css
/* Generated/static CSS */
.button[data-size="small"] {
    height: 28px;
    padding: 0 12px;
    font-size: 12px;
}

.button[data-size="medium"] {
    height: 36px;
    padding: 0 16px;
    font-size: 14px;
}

.button[data-variant="primary"] {
    background: var(--color-primary);
    color: white;
}

.window[data-button-style="traffic-light"] .button-group button {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}
```

**Pros:**
- CSS caching
- Smaller HTML
- Standard specificity rules

**Cons:**
- Requires build/generation step
- Changes require CSS update

### Option C: Hybrid Approach (Recommended)

Use CSS variables for tokens, data attributes for structural variants.

```javascript
// Apply base CSS variables from theme
apply_theme_tokens(ctrl, theme.tokens);

// Apply data attribute for CSS targeting
ctrl.dom.attributes['data-size'] = params.size;
ctrl.dom.attributes['data-variant'] = params.variant;
```

```css
/* Base button styles reference variables */
.button {
    height: var(--btn-height);
    padding: 0 var(--btn-padding-x);
    font-size: var(--btn-font-size);
}

/* Structural variants via data attributes */
.button[data-variant="primary"] {
    background: var(--color-primary);
}

/* Theme overrides via data-theme on container */
[data-theme="dark"] .button {
    /* dark mode overrides */
}
```

---

## 8. TypeScript Types

### Extended Theme Types

```typescript
// types/theme.d.ts (extensions)

/**
 * Button control composition parameters.
 */
export interface ButtonParams {
    size?: 'small' | 'medium' | 'large' | 'xlarge';
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'link';
    icon_position?: 'left' | 'right' | 'only' | 'none';
    shape?: 'rectangle' | 'pill' | 'circle' | 'square';
    full_width?: boolean;
    elevation?: 'none' | 'low' | 'medium' | 'high';
    disabled_style?: 'muted' | 'grayed' | 'strikethrough';
    loading_style?: 'spinner' | 'dots' | 'pulse' | 'none';
}

/**
 * Panel control composition parameters.
 */
export interface PanelParams {
    padding?: 'none' | 'small' | 'medium' | 'large' | 'xlarge';
    border?: boolean;
    border_style?: 'solid' | 'dashed' | 'subtle' | 'gradient';
    shadow?: 'none' | 'small' | 'medium' | 'large' | 'inset';
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    background?: 'default' | 'recessed' | 'elevated' | 'glass' | 'gradient';
    header?: boolean;
    footer?: boolean;
    collapsible?: boolean;
    content_align?: 'start' | 'center' | 'end';
}

/**
 * Input control composition parameters.
 */
export interface InputParams {
    size?: 'small' | 'medium' | 'large';
    label_position?: 'top' | 'left' | 'right' | 'floating' | 'hidden';
    fill_style?: 'outline' | 'filled' | 'underline' | 'transparent';
    shape?: 'rectangle' | 'pill';
    validation_style?: 'inline' | 'tooltip' | 'popover' | 'none';
    validation_trigger?: 'blur' | 'change' | 'submit';
    clear_button?: boolean;
    show_count?: boolean;
    prefix_icon?: string;
    suffix_icon?: string;
    border_on_focus?: boolean;
}

/**
 * Navigation control composition parameters.
 */
export interface NavParams {
    direction?: 'horizontal' | 'vertical';
    align?: 'start' | 'center' | 'end' | 'stretch';
    indicator?: 'none' | 'underline' | 'background' | 'left-border' | 'right-border';
    spacing?: 'none' | 'small' | 'medium' | 'large';
    overflow?: 'scroll' | 'wrap' | 'menu' | 'hidden';
    collapsible?: boolean;
    collapsed_width?: number;
    expanded_width?: number;
    icons_only_collapsed?: boolean;
    shape?: 'rectangle' | 'pill';
    role?: 'navigation' | 'tablist' | 'menu';
}

/**
 * Menu control composition parameters.
 */
export interface MenuParams {
    trigger?: 'click' | 'hover' | 'focus' | 'contextmenu' | 'keyboard';
    position?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' |
               'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' |
               'right-start' | 'right-end' | 'cursor' | 'center';
    arrow?: boolean;
    animation?: 'none' | 'fade' | 'slide' | 'fade-slide' | 'scale';
    close_on_select?: boolean;
    close_on_outside?: boolean;
    match_trigger_width?: boolean;
    searchable?: boolean;
    multi_select?: boolean;
    modal?: boolean;
    open_delay?: number;
    close_delay?: number;
}

/**
 * Form layout composition parameters.
 */
export interface FormParams {
    layout?: 'vertical' | 'horizontal' | 'grid' | 'stepped';
    label_position?: 'top' | 'left' | 'right' | 'floating' | 'hidden';
    label_width?: string;
    align_labels?: 'left' | 'right';
    gap?: 'none' | 'small' | 'medium' | 'large';
    field_width?: 'auto' | 'full';
    columns?: number;
    responsive_breakpoint?: number;
    show_required?: boolean;
    error_position?: 'inline' | 'bottom' | 'tooltip';
}

/**
 * Dialog/modal composition parameters.
 */
export interface DialogParams {
    size?: 'small' | 'medium' | 'large' | 'fullscreen' | 'auto';
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    width?: string;
    height?: string;
    max_height?: string;
    backdrop?: boolean;
    close_button?: boolean;
    close_on_escape?: boolean;
    close_on_backdrop?: boolean;
    animation?: 'none' | 'fade' | 'fade-scale' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right';
    persistent?: boolean;
    push_content?: boolean;
    drag_to_dismiss?: boolean;
}

/**
 * Extended theme params with all control types.
 */
export interface ThemeParams {
    window?: WindowParams;
    button?: ButtonParams;
    panel?: PanelParams;
    input?: InputParams;
    nav?: NavParams;
    menu?: MenuParams;
    form?: FormParams;
    dialog?: DialogParams;
}
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Estimated: 1-2 days)
- [ ] Create `themeable` mixin
- [ ] Add `theme/registry.js` with inheritance
- [ ] Add `theme/token_maps.js` for size/shadow/radius
- [ ] Add TypeScript declarations

### Phase 2: Core Controls (Estimated: 2-3 days)
- [ ] Refactor Button to use `themeable`
- [ ] Refactor Panel to use `themeable`
- [ ] Add Input variants and refactor
- [ ] Add unit tests for each

### Phase 3: Navigation Controls (Estimated: 2 days)
- [ ] Add Nav variants
- [ ] Add Menu variants
- [ ] Add Tabs component or variant
- [ ] Add unit tests

### Phase 4: Form Layout (Estimated: 1-2 days)
- [ ] Add Form variants
- [ ] Add form layout support
- [ ] Add unit tests

### Phase 5: Dialogs (Estimated: 1-2 days)
- [ ] Add Dialog variants
- [ ] Add sheet/drawer variants
- [ ] Add unit tests

### Phase 6: Documentation & Polish (Estimated: 1 day)
- [ ] Update TYPESCRIPT_INTEGRATION.md
- [ ] Create theme authoring guide
- [ ] Add visual examples/demos

---

## 10. Open Questions

### For Review/Discussion

1. **Should params affect accessibility?**
   - E.g., should `size: 'large'` also increase touch target for mobile?
   - Should certain variants automatically add ARIA attributes?

2. **How should theme switching work at runtime?**
   - Re-render all controls?
   - Just update CSS variables?
   - Is hot-swapping themes a requirement?

3. **Should we support theme animations?**
   - E.g., smooth transitions when switching themes
   - Per-control animation preferences

4. **How do we handle SSR constraints?**
   - Current inline styles work fine
   - If we move to data attributes + CSS, need to ensure CSS is loaded

5. **Should there be a "theme builder" UI?**
   - Live preview of token changes
   - Export theme as JSON

6. **How do we version themes?**
   - If we ship built-in themes, how do breaking changes work?
   - User-created themes compatibility

7. **Should controls have "slots" for customization?**
   - E.g., Button could have `prefix_slot`, `suffix_slot`
   - Would params control slot visibility?

8. **Integration with design systems?**
   - Should we provide presets for Material, Fluent, etc.?
   - Or document how to create compatible themes?

---

## 11. Implementation Guidance & Platform Integration

### Low-Level Platform Primitives
- `field` helper: deep lookup with default + validator + warning hook (non-console), e.g., `field(theme, ['params','window','button_order'], ['minimize','maximize','close'], validate_array(...))`. Centralizes safety and fallback behavior for all controls.
- Param schemas per control: runtime objects defining allowed values, defaults, and hook derivation (data-attrs/classes). Use schemas to auto-generate JSDoc/TS types and validators; keep control-type keys lowercase (`window`, `button`, etc.).
- Variant registry accessor: `get_variant_params(control_type, variant_name, warn?)` normalizes casing, returns defaults, and separates variant choice from theme inheritance. Do not reuse `extends` for variant selection.
- Hook applier: `set_theme_hooks(ctrl, { attrs, classes })` to attach data attributes and classes emitted by schema-derived `resolve_params`, keeping controls from handcrafting styling hooks.
- Warning plumbing: injectable reporter (noop in prod/tests) to avoid noisy `console.warn` while preserving diagnostics.

### Medium-Level Plumbing
- `resolve_params(control_type, spec, context, opts)`: merge order `variant defaults -> context.theme.params[control_type] -> spec.params`; run schema validation post-merge; emit `{ params, hooks }` where `hooks` carries schema-defined data-attrs/classes (e.g., `data-button-style`, position class).
- Theme application wrapper: extend `apply_theme` to accept `{ tokens, params_hooks }`; apply CSS vars, then call `set_theme_hooks(ctrl, hooks)` in one place so controls focus on composition.
- Token vs params inheritance: `theme.extends` remains for tokens; composition variant comes from `spec.variant` (or optional `context.variant_<control_type>`). This avoids conflating visual inheritance with structural presets.
- Token maps: keep `token_maps.js` for size/shadow/radius; use hooks + CSS vars instead of inlining large style objects where possible to reduce SSR payload.
- Global theme fallback: `resolve_params` should check `context.theme`, then `global_theme`, then defaults.

### High-Level Control Adoption & Window-First Plan
- Window schema fields: `button_position (left|right)`, `button_order (array of minimize|maximize|close)`, `button_style (icons|traffic-light|text|outlined)`, `show_minimize/maximize/close`, `title_alignment (left|center|right)`, optional `draggable/resizable` flags.
- Window variants: ensure `default` mirrors current layout (right order minimize→maximize→close); add `macos` (left, traffic-light, centered title) and `minimal` (close only) to exercise params.
- Window composition: call `resolve_params('window', spec, context)` in constructor; `_compose_buttons` iterates `params.button_order`, skips hidden buttons, and attaches `hooks.attrs` (e.g., `data-button-style`) plus `hooks.classes` (e.g., position class on button group/title bar).
- Window CSS hooks: use classes/attrs from schema (`.button-group.left/right`, `[data-button-style="traffic-light"]`, `[data-title-align="center"]`); colors/sizing come from tokens/vars, not hardcoded values.
- SSR safety: all composition happens in constructor; no DOM access without guards in activate(); hooks applied via dom attributes to survive SSR → client hydration.

### Cross-Control Patterns (once Window lands)
- Buttons/Panels/Inputs/Nav/Menu/Form: replicate the Window flow—schema → variants → resolve_params → hooks → CSS vars; keep naming consistent with the data-attribute reference table.
- Accessibility: allow schemas to declare optional a11y side-effects (e.g., large size -> min touch target; `role` defaults). Hook into control constructors to set ARIA attrs when params demand it.
- Slot-aware params: for controls with prefix/suffix slots, add schema fields that toggle slot visibility; derive `data-slot-*` hooks so CSS can space them predictably.

### Testing & Migration Checkpoints
- Helper tests: validate merge order, variant fallback, invalid value fallback, hook emission (attrs/classes), and warning reporter usage.
- Window tests: assert default markup matches legacy (order/right alignment), and variant (macos) sets left alignment + `data-button-style` + order; snapshot SSR HTML for hooks.
- Migration guide: checklist for adopting helpers in other controls (set control_type key, wire schema, call themeable/resolve_params, apply hooks, replace inline styles with CSS vars).

## Appendix: Quick Reference

### Param to CSS Variable Naming

| Control | Param | CSS Variable |
|---------|-------|--------------|
| button | size | `--btn-height`, `--btn-padding-x`, `--btn-font-size` |
| input | size | `--input-height`, `--input-padding-x`, `--input-font-size` |
| panel | padding | `--panel-padding` |
| * | shadow | `--shadow` |
| * | radius | `--radius` |

### Data Attribute Naming

| Control | Param | Data Attribute |
|---------|-------|----------------|
| * | variant | `data-variant` |
| * | size | `data-size` |
| window | button_style | `data-button-style` |
| window | button_position | `data-button-position` |
| button | shape | `data-shape` |
| input | fill_style | `data-fill-style` |
