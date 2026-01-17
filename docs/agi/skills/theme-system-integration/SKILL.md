# Skill: theme-system-integration

## Scope
Add theme support to existing controls or integrate theming into new features.

**Does:**
- Define params schemas for controls
- Register variants in the variant registry
- Integrate `resolve_params` for merge priority
- Add CSS variable hooks and data attributes
- Test theme inheritance and override behavior

**Does Not:**
- Create controls from scratch (see jsgui3-control-creation skill)
- Handle runtime theme switching animations

## Inputs
- Control name to theme (e.g., `Button`, `Panel`, `Input`)
- Desired variants (e.g., `primary`, `ghost`, `compact`)
- Params to expose (e.g., `size`, `variant`, `position`)

## Procedure

### Phase 1: Define Params Schema

1. **Identify themeable properties:**
   - What composition decisions should be configurable?
   - What CSS properties should change per variant?
   - What structural elements can be toggled?

2. **Create schema in `themes/variants.js`:**
```javascript
const <control>_schema = {
    // Enum params (validated)
    size: ['small', 'medium', 'large'],
    variant: ['primary', 'secondary', 'ghost'],
    position: ['left', 'right'],
    
    // Boolean params
    show_icon: [true, false],
    
    // String params (no validation)
    // icon_name: ['string']
};

// Add to param_schemas:
const param_schemas = {
    // ... existing
    <control>: <control>_schema
};
```

### Phase 2: Register Variants

1. **Define variant presets:**
```javascript
const <control>_variants = {
    'default': {
        size: 'medium',
        variant: 'secondary',
        // ... all defaults
    },
    '<variant_name>': {
        // Override specific values
        size: 'medium',
        variant: 'primary'
    }
};
```

2. **Add to variants registry:**
```javascript
const variants = {
    window: window_variants,
    button: button_variants,
    panel: panel_variants,
    // ADD:
    <control>: <control>_variants
};
```

3. **Export if needed for direct access:**
```javascript
module.exports = {
    variants,
    get_variant_params,
    register_variant,
    // ADD:
    <control>_variants
};
```

### Phase 3: Derive Hooks

1. **Define hook derivation in `theme_params.js`:**
```javascript
const derive_hooks = (control_type, params) => {
    const attrs = {};
    const classes = [];
    
    if (control_type === '<control>') {
        // Data attributes for CSS targeting
        if (params.variant) {
            attrs['data-variant'] = params.variant;
        }
        if (params.size && params.size !== 'medium') {
            attrs['data-size'] = params.size;
        }
        
        // Classes for structural variants
        if (params.position) {
            classes.push(params.position);  // e.g., 'left', 'right'
        }
    }
    
    return { attrs, classes };
};
```

### Phase 4: Integrate into Control

1. **Import helpers:**
```javascript
const { resolve_params, apply_hooks } = require('<path>/control_mixins/theme_params');
```

2. **Call in constructor:**
```javascript
constructor(spec) {
    super(spec);
    this.__type_name = '<control>';
    
    // Resolve theme params
    const { params, hooks } = resolve_params('<control>', spec, this.context);
    this._theme_params = params;
    apply_hooks(this, hooks);
    
    // Use params in composition
    this._compose(params);
}
```

3. **Use params in composition:**
```javascript
_compose(params) {
    // Instead of hardcoded values:
    const size = params.size || 'medium';
    const show_icon = params.show_icon !== false;
    
    // Instead of hardcoded order:
    const order = params.order || ['a', 'b', 'c'];
    for (const item of order) {
        if (params[`show_${item}`] === false) continue;
        // Create item
    }
}
```

### Phase 5: Add Token Mappings

1. **Define size tokens in `themes/token_maps.js`:**
```javascript
const SIZE_TOKENS = {
    <control>: {
        small: {
            '--<control>-height': '28px',
            '--<control>-padding': '8px',
            '--<control>-font-size': '12px'
        },
        medium: {
            '--<control>-height': '36px',
            '--<control>-padding': '12px',
            '--<control>-font-size': '14px'
        },
        large: {
            '--<control>-height': '44px',
            '--<control>-padding': '16px',
            '--<control>-font-size': '16px'
        }
    }
};
```

2. **Apply tokens in control:**
```javascript
const { apply_token_map } = require('<path>/themes/token_maps');

// After resolve_params:
apply_token_map(this, '<control>', params);
```

### Phase 6: Update CSS

1. **Use CSS variables:**
```css
.<control> {
    height: var(--<control>-height, 36px);
    padding: 0 var(--<control>-padding, 12px);
    font-size: var(--<control>-font-size, 14px);
}
```

2. **Target data attributes:**
```css
.<control>[data-variant="primary"] {
    background: var(--color-primary);
    color: white;
}

.<control>[data-variant="ghost"] {
    background: transparent;
    border: none;
}

.<control>[data-size="small"] {
    /* If needed beyond CSS vars */
}
```

### Phase 7: Add TypeScript Types

1. **Create/update param interface in `types/theme.d.ts`:**
```typescript
export interface <Control>Params {
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary' | 'ghost';
    position?: 'left' | 'right';
    show_icon?: boolean;
}
```

2. **Update ThemeParams:**
```typescript
export interface ThemeParams {
    window?: WindowParams;
    button?: ButtonParams;
    // ADD:
    <control>?: <Control>Params;
}
```

3. **Create control spec interface:**
```typescript
export interface <Control>Spec extends ControlSpec<<Control>Params> {
    variant?: '<variant1>' | '<variant2>';
}
```

### Phase 8: Write Tests

```javascript
// test/controls/<control>_theme.test.js
require('../setup');
const { expect } = require('chai');

describe('<Control> Theme Integration', () => {
    let <Control>, context;
    
    before(() => {
        <Control> = require('../../controls/.../<control>');
    });
    
    beforeEach(() => {
        context = createTestContext();
    });
    
    describe('default variant', () => {
        it('uses default params', () => {
            const ctrl = new <Control>({ context });
            expect(ctrl._theme_params.size).to.equal('medium');
        });
    });
    
    describe('spec.variant', () => {
        it('applies variant preset', () => {
            const ctrl = new <Control>({ context, variant: 'primary' });
            expect(ctrl._theme_params.variant).to.equal('primary');
        });
    });
    
    describe('spec.params override', () => {
        it('overrides variant defaults', () => {
            const ctrl = new <Control>({ 
                context, 
                variant: 'primary',
                params: { size: 'large' }
            });
            expect(ctrl._theme_params.size).to.equal('large');
        });
    });
    
    describe('context.theme.params', () => {
        it('applies theme-level defaults', () => {
            context.theme = {
                params: { <control>: { size: 'small' } }
            };
            const ctrl = new <Control>({ context });
            expect(ctrl._theme_params.size).to.equal('small');
        });
    });
    
    describe('backward compatibility', () => {
        it('works without any params', () => {
            const ctrl = new <Control>({ context });
            // Should produce same output as before theming
        });
    });
});
```

## Validation Checklist
- [ ] Params schema defined in `themes/variants.js`
- [ ] Variants registered with sensible defaults
- [ ] `default` variant matches pre-theme behavior (backward compat)
- [ ] Hook derivation added to `derive_hooks`
- [ ] Control calls `resolve_params` in constructor
- [ ] Control uses params for composition decisions
- [ ] CSS uses variables for themeable properties
- [ ] CSS targets data attributes for variant styles
- [ ] TypeScript types added/updated
- [ ] Tests cover default, variant, override, and context inheritance

## Merge Priority Reference
```
┌─────────────────────────┐
│ spec.params             │ ← Highest (per-instance)
├─────────────────────────┤
│ context.theme.params    │ ← Theme-level
│   [control_type]        │
├─────────────────────────┤
│ Variant defaults        │ ← From variant registry
│ (spec.variant or        │
│  context.theme.extends) │
└─────────────────────────┘
```

## References
- [themes/variants.js](file:///c:/Users/james/Documents/repos/jsgui3-html/themes/variants.js) - Variant registry
- [control_mixins/theme_params.js](file:///c:/Users/james/Documents/repos/jsgui3-html/control_mixins/theme_params.js) - resolve_params
- [THEME_SYSTEM_EXTENSION_ROADMAP.md](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/THEME_SYSTEM_EXTENSION_ROADMAP.md) - Full design
- [window.js](file:///c:/Users/james/Documents/repos/jsgui3-html/controls/organised/1-standard/6-layout/window.js) - Reference implementation
