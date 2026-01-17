# Skill: typescript-types

## Scope
Create and maintain TypeScript declaration files (.d.ts) for jsgui3-html components.

**Does:**
- Generate .d.ts files for controls and modules
- Define interfaces for specs, params, and return types
- Update package.json exports for TypeScript consumers
- Maintain backward compatibility with JavaScript users

**Does Not:**
- Convert source files to TypeScript
- Add runtime type checking
- Handle complex generic patterns

## Inputs
- File or module to type (e.g., `window.js`, `theme_params.js`)
- Public API surface to expose
- Existing interfaces to extend

## Procedure

### Phase 1: Identify Public API

1. **What needs types?**
   - Constructor params (specs)
   - Public methods and their signatures
   - Public properties
   - Exported functions
   - Return types

2. **Read the source file:**
```
View: <file>.js
Identify: class, constructor, public methods, exports
```

### Phase 2: Create Spec Interface

For control classes, create a Spec interface:

```typescript
// <control>.d.ts

import { Control } from '<path>/html-core/control';
import { ControlSpec } from '<path>/types/control-spec';

/**
 * <Control> specific parameters.
 */
export interface <Control>Params {
    /** Description of param */
    size?: 'small' | 'medium' | 'large';
    /** Description of param */
    variant?: 'primary' | 'secondary';
    // ... all params with JSDoc comments
}

/**
 * <Control> specification.
 */
export interface <Control>Spec extends ControlSpec<<Control>Params> {
    /** Control-specific property */
    title?: string;
    /** Another property */
    show_buttons?: boolean;
    // ... control-specific spec properties
}
```

### Phase 3: Create Class Declaration

```typescript
/**
 * <Control> - description of what the control does.
 */
export declare class <Control> extends Control {
    /**
     * Create a new <Control>.
     * @param spec - Control specification
     */
    constructor(spec?: <Control>Spec);
    
    // Public readonly properties
    /** Description */
    readonly some_property: Type;
    
    // Public mutable properties
    /** Description */
    some_setting: boolean;
    
    // Public methods with full JSDoc
    /**
     * Description of method.
     * @param param - What it does
     * @returns What it returns
     */
    some_method(param: Type): ReturnType;
}

export default <Control>;
```

### Phase 4: Export Module Functions

For non-class modules:

```typescript
// module.d.ts

/**
 * Function description.
 * @param param1 - Description
 * @param param2 - Description
 * @returns Description
 */
export declare function function_name<T = DefaultType>(
    param1: Type1,
    param2?: Type2
): ReturnType<T>;

/**
 * Constant description.
 */
export declare const some_constant: {
    key1: Type;
    key2: Type;
};
```

### Phase 5: Update Type Aggregates

1. **Update `types/theme.d.ts` for new params:**
```typescript
// Add new param interface
export interface <Control>Params { ... }

// Update ThemeParams
export interface ThemeParams {
    window?: WindowParams;
    button?: ButtonParams;
    // ADD:
    <control>?: <Control>Params;
}
```

2. **Update `types/index.d.ts`:**
```typescript
export {
    // ... existing
    <Control>Params
} from './theme';
```

3. **Update `html.d.ts` main entry:**
```typescript
// Add export
export { <Control>, <Control>Spec } from './controls/.../<control>';
```

### Phase 6: Use Union Types for Variants

When params have fixed values, use union types:

```typescript
// Not this:
variant?: string;

// This:
variant?: 'default' | 'primary' | 'ghost' | 'danger';

// For control-level variant (preset name):
export interface WindowSpec extends ControlSpec<WindowParams> {
    variant?: 'default' | 'macos' | 'windows-11' | 'minimal';
}
```

### Phase 7: Document with JSDoc

All exports should have JSDoc comments:

```typescript
/**
 * Resolve composition parameters for a control.
 * 
 * Merges params from (highest to lowest priority):
 * 1. spec.params - Direct params on the control
 * 2. context.theme.params[control_type] - Theme-level params
 * 3. Variant defaults - From the variant registry
 * 
 * @param control_type - Control type (e.g., 'window')
 * @param spec - Control specification
 * @param context - Page context
 * @param options - Resolution options
 * @returns Resolved params and styling hooks
 * 
 * @example
 * const { params, hooks } = resolve_params('window', spec, context);
 * // params.button_position === 'left'
 * // hooks.attrs['data-button-style'] === 'traffic-light'
 */
export declare function resolve_params<T = Record<string, unknown>>(
    control_type: string,
    spec?: ControlSpec,
    context?: PageContext,
    options?: ResolveOptions
): ResolvedParams<T>;
```

### Phase 8: Update package.json

Ensure TypeScript consumers can find types:

```json
{
  "name": "jsgui3-html",
  "main": "html.js",
  "types": "html.d.ts",
  "exports": {
    ".": {
      "require": "./html.js",
      "types": "./html.d.ts"
    },
    "./types": {
      "types": "./types/index.d.ts"
    },
    "./types/*": {
      "types": "./types/*.d.ts"
    }
  }
}
```

### Phase 9: Verify Types

1. **Create a verification file:**
```typescript
// test/types/verify-<control>.ts

import { <Control>, <Control>Spec } from '../../html';

// Test spec typing
const spec: <Control>Spec = {
    variant: 'primary',  // Should autocomplete
    params: {
        size: 'large'    // Should autocomplete
    }
};

// Test construction
const ctrl = new <Control>(spec);

// Test methods
ctrl.some_method();  // Should have correct signature
```

2. **Check with TypeScript:**
```bash
npx tsc --noEmit test/types/verify-<control>.ts
```

## Common Patterns

### Generic ControlSpec with Params
```typescript
// Base pattern for all controls
export interface ControlSpec<TParams = Record<string, unknown>> {
    context?: PageContext;
    params?: TParams;
    variant?: string;
    // ...
}

// Control extends with specific params
export interface ButtonSpec extends ControlSpec<ButtonParams> {
    label?: string;
}
```

### Callback/Handler Types
```typescript
export type EventHandler<T = Event> = (event: T) => void;

export interface ControlEvents {
    click?: EventHandler<MouseEvent>;
    change?: EventHandler<CustomEvent>;
}
```

### Tuple Types
```typescript
// For position/size
export type Position = [number, number];
export type Size = [number, number];
export type BCR = [[number, number], [number, number], [number, number]];
```

### Optional Chaining-Friendly Types
```typescript
// Allow undefined for optional nested access
export interface PageContext {
    theme?: ThemeSpec;  // Can be undefined
    // ...
}
```

## Validation Checklist
- [ ] .d.ts file created alongside .js file
- [ ] All public API surface typed
- [ ] JSDoc comments on all exports
- [ ] Union types used for known string values
- [ ] Spec interface extends ControlSpec with params generic
- [ ] Types exported from types/index.d.ts
- [ ] Control exported from html.d.ts
- [ ] Verification test created
- [ ] No TypeScript errors when running tsc --noEmit

## References
- [types/control-spec.d.ts](file:///c:/Users/james/Documents/repos/jsgui3-html/types/control-spec.d.ts) - Base interfaces
- [types/theme.d.ts](file:///c:/Users/james/Documents/repos/jsgui3-html/types/theme.d.ts) - Theme types
- [html.d.ts](file:///c:/Users/james/Documents/repos/jsgui3-html/html.d.ts) - Main entry types
- [TYPESCRIPT_INTEGRATION.md](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/sessions/2026-01-17-theme-system/TYPESCRIPT_INTEGRATION.md) - Integration strategy
