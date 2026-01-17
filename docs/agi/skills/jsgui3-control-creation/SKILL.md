# Skill: jsgui3-control-creation

## Scope
Create new UI controls following jsgui3 patterns, conventions, and theme system integration.

**Does:**
- Scaffold new control class files.
- Apply correct naming conventions (Camel_Case for classes, snake_case for methods).
- Set up SSR-safe guards.
- Integrate with theme system using `themeable` mixin.
- Create accompanying SASS/CSS with CSS variable hooks.
- Generate TypeScript declaration files (.d.ts).

**Does Not:**
- Handle complex data binding (see data-adapter patterns).
- Implement full test suites (follow up with testing skill).

## Inputs
- Control name (e.g., `Matrix`, `Color_Picker`).
- Base class (default: `Control`).
- Target directory (default: `controls/organised/`).
- Variants (optional): List of preset variants to register.

## Procedure

### 1. Check existing patterns
```
Review: controls/organised/ for similar controls
Review: AGENTS.md for naming conventions
Review: themes/variants.js for variant patterns
```

### 2. Define control params schema
Before creating the control, define what params it accepts:

```javascript
// In themes/variants.js, add to param_schemas:
const <control>_schema = {
    size: ['small', 'medium', 'large'],
    variant: ['primary', 'secondary', ...],
    // ... control-specific params
};
```

### 3. Register variants
Add built-in variants to `themes/variants.js`:

```javascript
const <control>_variants = {
    'default': {
        size: 'medium',
        // ... default param values
    },
    '<variant_name>': {
        // ... variant-specific values
    }
};

// Add to variants object:
const variants = {
    // ... existing
    <control>: <control>_variants
};
```

### 4. Create control file
- File: `controls/organised/<category>/<control_name>.js`
- Class: `<Control_Name>` (Camel_Case)
- Methods: `snake_case` (e.g., `get_value`, `set_value`)

```javascript
const Control = require('<path>/html-core/control');
const { themeable } = require('<path>/control_mixins/themeable');

class <Control_Name> extends Control {
    constructor(spec) {
        super(spec);
        this.__type_name = '<control_name>';
        this.add_class('<control-name>');
        
        // Theme integration
        const params = themeable(this, '<control_name>', spec);
        
        // Compose using params
        if (!spec.abstract && !spec.el) {
            this._compose(params);
        }
    }
    
    _compose(params) {
        const { context } = this;
        // Use params.size, params.variant, etc.
        // Apply CSS variable hooks from token maps
    }
}

// Static CSS (optional)
<Control_Name>.css = `
.<control-name> {
    /* Use CSS variables for theming */
    height: var(--<control>-height);
    padding: var(--<control>-padding);
}

/* Variant-specific styles via data attributes */
.<control-name>[data-variant="primary"] {
    /* ... */
}
`;

module.exports = <Control_Name>;
```

### 5. Add SSR guard in activate()
```javascript
activate() {
    if (typeof window === 'undefined') return;
    super.activate();
    // DOM-dependent code here
}
```

### 6. Create TypeScript declaration file
- File: `controls/organised/<category>/<control_name>.d.ts`

```typescript
import { Control } from '<path>/html-core/control';
import { ControlSpec } from '<path>/types/control-spec';

export interface <Control_Name>Params {
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary';
    // ... param types
}

export interface <Control_Name>Spec extends ControlSpec<<Control_Name>Params> {
    // Control-specific spec properties
}

export declare class <Control_Name> extends Control {
    constructor(spec?: <Control_Name>Spec);
    // Public methods
}
```

### 7. Add token mappings (optional)
If the control uses size/spacing tokens, add to `themes/token_maps.js`:

```javascript
const SIZE_TOKENS = {
    // ... existing
    <control>: {
        small: { '--<control>-height': '28px', ... },
        medium: { '--<control>-height': '36px', ... },
        large: { '--<control>-height': '44px', ... }
    }
};
```

### 8. Create SASS/CSS file (optional)
- File: `controls/organised/<category>/<control_name>.scss`
- Use CSS variables for all themeable properties
- Target data attributes for structural variants

```scss
.<control-name> {
    height: var(--<control>-height, 36px);
    
    &[data-size="small"] { ... }
    &[data-size="large"] { ... }
    
    &[data-variant="primary"] { ... }
}
```

### 9. Register control
Add export to the appropriate controls index file.

### 10. Create unit tests
```javascript
// test/controls/<control_name>.test.js
require('../setup');

describe('<Control_Name>', () => {
    it('creates with default variant', () => { ... });
    it('respects variant param', () => { ... });
    it('applies theme context params', () => { ... });
});
```

## Validation Checklist
- [ ] Control file exists and exports class
- [ ] Class follows naming conventions (Camel_Case)
- [ ] Methods follow naming conventions (snake_case)
- [ ] SSR guard present in activate()
- [ ] `themeable` mixin called in constructor
- [ ] Variants registered in `themes/variants.js`
- [ ] TypeScript declaration file created
- [ ] CSS uses variables, not hardcoded values
- [ ] Unit tests for default and variant behavior

## References
- [AGENTS.md](file:///c:/Users/james/Documents/repos/jsgui3-html/AGENTS.md) - Coding conventions
- [Control.js](file:///c:/Users/james/Documents/repos/jsgui3-html/html-core/control.js) - Base class
- [themes/variants.js](file:///c:/Users/james/Documents/repos/jsgui3-html/themes/variants.js) - Variant registry
- [control_mixins/theme_params.js](file:///c:/Users/james/Documents/repos/jsgui3-html/control_mixins/theme_params.js) - resolve_params helper
- [THEME_SYSTEM_EXTENSION_ROADMAP.md](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/THEME_SYSTEM_EXTENSION_ROADMAP.md) - Full theme system design
