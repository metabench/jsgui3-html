# TypeScript Integration Strategy for jsgui3-html

This document outlines how TypeScript can be seamlessly integrated into jsgui3-html while maintaining full backward compatibility with standard JavaScript.

---

## Goals

1. **Zero breaking changes** - All existing JS code continues to work
2. **Optional adoption** - TypeScript available for those who want it
3. **High-level ergonomics** - Type safety when extending controls, calling APIs
4. **Theme params typed** - Compiler catches invalid theme/param configurations
5. **Progressive enhancement** - Start with types for public API, expand over time

---

## Strategy: Declaration Files (.d.ts) Alongside JS

The recommended approach is to **ship TypeScript declaration files (.d.ts) without converting the source to TypeScript**:

```
jsgui3-html/
├── html.js                    # Existing JS entry point
├── html.d.ts                  # NEW: Type declarations
├── html-core/
│   ├── control.js             # Existing JS
│   ├── control.d.ts           # NEW: Control type declarations
│   └── ...
├── controls/
│   └── organised/
│       └── 1-standard/
│           └── 6-layout/
│               ├── window.js   # Existing JS
│               └── window.d.ts # NEW: Window-specific types
└── types/                      # NEW: Shared type definitions
    ├── theme.d.ts              # Theme, tokens, params types
    ├── control-spec.d.ts       # Base spec interfaces
    └── index.d.ts              # Re-exports all types
```

### Why This Approach?

| Consideration | Declaration Files | Full TS Conversion |
|---------------|------------------|-------------------|
| JS Backward Compat | ✅ No changes to runtime | ⚠️ Requires build step |
| Adoption Barrier | ✅ Zero for JS users | ❌ Forces TS toolchain |
| Maintenance | ⚠️ Types can drift | ✅ Types always match |
| NPM Package | ✅ Works for TS & JS consumers | ✅ Same |

Declaration files provide types without changing the runtime behavior.

---

## Core Type Definitions

### Base Control Spec

```typescript
// types/control-spec.d.ts

export interface ControlSpec {
    context?: PageContext;
    class?: string | string[];
    id?: string;
    el?: HTMLElement;
    abstract?: boolean;
    theme?: ThemeSpec | string;
    theme_overrides?: Record<string, string>;
    params?: Record<string, unknown>;
    variant?: string;
}

export interface PageContext {
    document?: Document;
    theme?: ThemeSpec;
    [key: string]: unknown;
}
```

### Theme Types

```typescript
// types/theme.d.ts

export interface ThemeSpec {
    name?: string;
    extends?: string;
    tokens?: ThemeTokens;
    params?: ThemeParams;
}

export type ThemeTokens = Record<string, string | number>;

export interface ThemeParams {
    window?: WindowParams;
    button?: ButtonParams;
    panel?: PanelParams;
    [controlType: string]: Record<string, unknown> | undefined;
}

export interface WindowParams {
    button_position?: 'left' | 'right';
    button_order?: Array<'minimize' | 'maximize' | 'close'>;
    button_style?: 'traffic-light' | 'icons' | 'text' | 'outlined' | 'minimal';
    show_minimize?: boolean;
    show_maximize?: boolean;
    show_close?: boolean;
    title_alignment?: 'left' | 'center' | 'right';
    draggable?: boolean;
    resizable?: boolean;
}

export interface ButtonParams {
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export interface PanelParams {
    padding?: 'none' | 'small' | 'medium' | 'large';
    border?: boolean;
}
```

### Control Base Class

```typescript
// html-core/control.d.ts

import { ControlSpec, PageContext } from '../types/control-spec';

export interface DOM {
    tagName?: string;
    el?: HTMLElement;
    attributes: {
        class?: string[];
        style?: Record<string, string>;
        [key: string]: unknown;
    };
}

export interface Content {
    add(item: Control | string): void;
    remove(item: Control): void;
    clear(): void;
    [index: number]: Control;
    length: number;
}

export declare class Control {
    constructor(spec?: ControlSpec);
    
    readonly context: PageContext;
    readonly dom: DOM;
    readonly content: Content;
    readonly parent?: Control;
    readonly siblings: Control[];
    
    add(child: Control | string): this;
    add_class(...classNames: string[]): this;
    remove_class(...classNames: string[]): this;
    has_class(className: string): boolean;
    
    on(event: string, handler: (e: Event) => void): this;
    off(event: string, handler?: (e: Event) => void): this;
    
    activate(): void;
    remove(): void;
    
    bcr(): [[number, number], [number, number], [number, number]];
    
    // MVVM methods
    bind(bindings: Record<string, BindingSpec>, options?: BindingOptions): void;
    computed(
        model: object,
        dependencies: string | string[],
        computeFn: (...values: unknown[]) => unknown,
        options?: ComputedOptions
    ): void;
    watch(
        model: object,
        property: string,
        callback: (newVal: unknown, oldVal: unknown) => void,
        options?: WatchOptions
    ): void;
    
    // Theme
    readonly params: Record<string, unknown>;
}
```

### Window Control

```typescript
// controls/organised/1-standard/6-layout/window.d.ts

import { Control } from '../../../../html-core/control';
import { ControlSpec } from '../../../../types/control-spec';
import { WindowParams } from '../../../../types/theme';

export interface WindowSpec extends ControlSpec {
    title?: string;
    show_buttons?: boolean;
    snap?: boolean;
    snap_threshold?: number;
    dock_sizes?: { [edge: string]: number };
    min_size?: [number, number];
    max_size?: [number, number];
    resize_bounds?: Control | [[number, number], [number, number]];
    window_manager?: WindowManager;
    manager?: WindowManager;
    variant?: 'default' | 'macos' | 'windows-11' | 'minimal';
    params?: WindowParams;
}

export declare class Window extends Control {
    constructor(spec?: WindowSpec);
    
    readonly title_bar: Control;
    readonly inner: Control;
    readonly ctrl_inner: Control;
    readonly btn_minimize?: Control;
    readonly btn_maximize?: Control;
    readonly btn_close?: Control;
    
    minimize(): Promise<void>;
    maximize(): Promise<void>;
    close(): void;
    bring_to_front_z(): void;
    snap_to_bounds(options?: SnapOptions): boolean;
    dock_to(edge: 'left' | 'right' | 'top' | 'bottom' | 'fill', options?: DockOptions): void;
    undock(): void;
    glide_to_pos(pos: [number, number]): Promise<void>;
    
    snap_enabled: boolean;
    snap_threshold?: number;
    dock_sizes?: { [edge: string]: number };
    min_size: [number, number];
    max_size?: [number, number];
    resize_bounds: Control | [[number, number], [number, number]] | null;
    manager: WindowManager | null;
    dragable: boolean;
    
    static css: string;
}
```

---

## Usage Examples

### JavaScript (Unchanged)

```javascript
// Works exactly as before - no changes required
const jsgui = require('jsgui3-html');

const win = new jsgui.Window({
    context,
    title: 'My Window',
    variant: 'macos'
});
```

### TypeScript (Type-Safe)

```typescript
// TypeScript users get full type checking
import jsgui, { Window, WindowSpec, WindowParams } from 'jsgui3-html';

// ✓ Type-checked spec
const spec: WindowSpec = {
    context,
    title: 'My Window',
    variant: 'macos',  // ✓ Autocomplete: 'default' | 'macos' | 'windows-11' | 'minimal'
    params: {
        button_position: 'left',  // ✓ Autocomplete: 'left' | 'right'
        button_order: ['close', 'minimize', 'maximize']  // ✓ Type-checked array
    }
};

const win = new Window(spec);

// ✗ Compile error: 'center' is not assignable to 'left' | 'right'
const badSpec: WindowSpec = {
    params: { button_position: 'center' }  // Error!
};
```

### Extending Controls (TypeScript)

```typescript
import { Window, WindowSpec, Control } from 'jsgui3-html';

interface MyDialogSpec extends WindowSpec {
    confirm_text?: string;
    cancel_text?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

class MyDialog extends Window {
    private confirmBtn: Control;
    private cancelBtn: Control;
    
    constructor(spec: MyDialogSpec) {
        super({
            ...spec,
            variant: 'minimal',
            params: { show_minimize: false, show_maximize: false }
        });
        
        // TypeScript knows spec.confirm_text is string | undefined
        this.confirmBtn = new jsgui.Button({
            context: this.context,
            text: spec.confirm_text ?? 'OK'
        });
        
        // Full type safety on parent methods
        this.inner.add(this.confirmBtn);
    }
}
```

---

## package.json Configuration

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
    "./types/*": "./types/*.d.ts"
  }
}
```

---

## What's Possible Now vs Future Work

### Fully Compatible Now (No Breaking Changes)

| Feature | How It Works |
|---------|-------------|
| Type declarations for public API | Ship `.d.ts` files alongside `.js` |
| Typed theme specs | `ThemeSpec`, `WindowParams` interfaces |
| Typed control constructors | `WindowSpec extends ControlSpec` |
| Autocomplete for variants/params | Union types: `'left' | 'right'` |
| Extending controls in TS | `class MyWindow extends Window` |
| JSDoc in JS files | VS Code reads JSDoc even without TS |

### Requires User Toolchain (Still Compatible)

| Feature | Requirement |
|---------|-------------|
| Compile-time type checking | User runs `tsc` or uses TS-aware bundler |
| Generic controls | User writes TS code |
| Runtime type validation | Separate (already planned in theme system) |

### Future Considerations (May Require Changes)

| Feature | Consideration | Backward Compat |
|---------|--------------|-----------------|
| Source in TypeScript | Would require build step in library | ⚠️ NPM package still works, but contributors need TS |
| Schema-driven type generation | Generate `.d.ts` from param schemas | ✅ Compatible |
| Strict null checks | Some existing patterns may need guards | ⚠️ Library changes, user code unaffected |

---

## Implementation Phases

### Phase 1: Core Types (Recommended Start)
1. Create `types/` directory with base interfaces
2. Add `html.d.ts` with main export types
3. Add `html-core/control.d.ts` for Control class
4. Update `package.json` with `"types"` field

### Phase 2: Theme System Types
1. Add `types/theme.d.ts` with `ThemeSpec`, `*Params` interfaces
2. Type the `resolve_params` helper return value
3. Document typed theme usage

### Phase 3: Control-Specific Types
1. Add `.d.ts` for Window, Panel, Button, etc.
2. Type control-specific specs (e.g., `WindowSpec`)
3. Type static properties (e.g., `Window.css`)

### Phase 4: Advanced Patterns (Optional)
1. Generic controls: `Control<TSpec, TData>`
2. Typed event emitter: `on<K extends keyof Events>(event: K, handler: Events[K])`
3. Schema-to-type generation tooling

---

## JSDoc Alternative (Less Invasive)

If shipping `.d.ts` files feels premature, **JSDoc with TypeScript checking** provides partial benefits:

```javascript
// window.js - add JSDoc types inline

/**
 * @typedef {Object} WindowParams
 * @property {'left'|'right'} [button_position]
 * @property {Array<'minimize'|'maximize'|'close'>} [button_order]
 * @property {'traffic-light'|'icons'|'text'} [button_style]
 */

/**
 * @typedef {import('../../../types/control-spec').ControlSpec & {
 *   title?: string;
 *   variant?: 'default'|'macos'|'windows-11';
 *   params?: WindowParams;
 * }} WindowSpec
 */

class Window extends Control {
    /**
     * @param {WindowSpec} [spec]
     */
    constructor(spec) {
        // ...
    }
}
```

VS Code will provide autocomplete and type hints from JSDoc even for JS-only users who never install TypeScript.

---

## Recommendation

**Start with Phase 1 (Core Types)** - ship declaration files for:
- `Control` base class
- `ControlSpec` interface  
- `ThemeSpec` and `*Params` interfaces

This provides immediate value for TypeScript users extending controls or configuring themes, with **zero impact on JavaScript users**. The library source remains pure JavaScript, and the `.d.ts` files are simply "documentation that the compiler can read."

---

## Open Items for Future Work

> [!NOTE]
> The following are not currently possible while maintaining full backward compatibility and would be considered for a future major version:

1. **Strict mode support** - Some internal patterns use `any`-like dynamic access
2. **Generic Control types** - Would require rethinking `spec` parameter typing
3. **Source-level TypeScript** - Would change contributor experience
4. **Type-safe event system** - Current `on(event, handler)` is stringly-typed

These are documented here for future consideration when the project is ready for deeper TypeScript integration.
