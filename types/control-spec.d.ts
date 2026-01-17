/**
 * jsgui3-html Type Definitions
 * 
 * Base interfaces for control specifications.
 */

import type { ThemeSpec } from './theme';

/**
 * Page context shared across controls.
 */
export interface PageContext {
    /** The document object (browser or jsdom) */
    document?: Document;
    /** Active theme configuration */
    theme?: ThemeSpec;
    /** Resource pool for assets */
    resource_pool?: unknown;
    /** Additional context properties */
    [key: string]: unknown;
}

/**
 * DOM attribute collection.
 */
export interface DOMAttributes {
    /** CSS classes as array */
    class?: string[];
    /** Inline styles as key-value pairs */
    style?: Record<string, string | number>;
    /** Data attributes */
    [key: string]: unknown;
}

/**
 * DOM representation of a control.
 */
export interface DOM {
    /** HTML tag name */
    tagName?: string;
    /** Underlying DOM element (client-side only) */
    el?: HTMLElement;
    /** Attributes including class, style, data-* */
    attributes: DOMAttributes;
}

/**
 * Base specification for all controls.
 */
export interface ControlSpec<TParams = Record<string, unknown>> {
    /** Page context (inherited if not provided) */
    context?: PageContext;
    /** CSS class(es) to add */
    class?: string | string[];
    /** Element ID */
    id?: string;
    /** Existing DOM element to hydrate */
    el?: HTMLElement;
    /** If true, skip DOM composition */
    abstract?: boolean;
    /** Theme name or full theme spec */
    theme?: ThemeSpec | string;
    /** Token overrides for this control */
    theme_overrides?: Record<string, string>;
    /** Composition parameters */
    params?: TParams;
    /** Named variant preset */
    variant?: string;
    /** Tag name override */
    tag_name?: string;
}

/**
 * Binding specification for MVVM.
 */
export interface BindingSpec {
    /** Target property name */
    to: string;
    /** Transform function (source → target) */
    transform?: (value: unknown) => unknown;
    /** Reverse transform (target → source) */
    reverse?: (value: unknown) => unknown;
    /** Whether binding is two-way */
    twoWay?: boolean;
}

/**
 * Options for creating bindings.
 */
export interface BindingOptions {
    /** Initial sync direction */
    initialSync?: 'source' | 'target' | 'none';
}

/**
 * Options for computed properties.
 */
export interface ComputedOptions {
    /** Property name to create on the model */
    propertyName?: string;
    /** Whether to compute immediately */
    immediate?: boolean;
}

/**
 * Options for property watchers.
 */
export interface WatchOptions {
    /** Whether to trigger immediately with current value */
    immediate?: boolean;
    /** Whether to deep watch objects/arrays */
    deep?: boolean;
}
