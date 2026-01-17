/**
 * jsgui3-html Type Definitions
 * 
 * Control base class.
 */

import {
    ControlSpec,
    PageContext,
    DOM,
    BindingSpec,
    BindingOptions,
    ComputedOptions,
    WatchOptions
} from '../types/control-spec';

/**
 * Content collection for child controls.
 */
export interface Content {
    /** Add a child control or text */
    add(item: Control | string): void;
    /** Remove a child control */
    remove(item: Control): void;
    /** Remove all children */
    clear(): void;
    /** Access child by index */
    [index: number]: Control;
    /** Number of children */
    length: number;
}

/**
 * Bounding client rect as [[left, top], [right, bottom], [width, height]].
 */
export type BCR = [[number, number], [number, number], [number, number]];

/**
 * Base Control class - the foundation of all jsgui3-html UI components.
 */
export declare class Control {
    /**
     * Create a new control.
     * @param spec - Control specification
     */
    constructor(spec?: ControlSpec);

    /** Page context (inherited through control tree) */
    readonly context: PageContext;

    /** DOM representation */
    readonly dom: DOM;

    /** Child content collection */
    readonly content: Content;

    /** Parent control (if nested) */
    readonly parent?: Control;

    /** Sibling controls at same level */
    readonly siblings: Control[];

    /** Control type name (e.g., 'window', 'button') */
    readonly __type_name?: string;

    /** Resolved composition parameters */
    readonly params: Record<string, unknown>;

    /** Transform array for positioning [a, b, c, d, tx, ty] */
    ta: [number, number, number, number, number, number, number, number];

    /**
     * Add a child control or text content.
     * @param child - Control instance or text string
     * @returns this (for chaining)
     */
    add(child: Control | string): this;

    /**
     * Add one or more CSS classes.
     * @param classNames - Class names to add
     * @returns this (for chaining)
     */
    add_class(...classNames: string[]): this;

    /**
     * Remove one or more CSS classes.
     * @param classNames - Class names to remove
     * @returns this (for chaining)
     */
    remove_class(...classNames: string[]): this;

    /**
     * Check if control has a CSS class.
     * @param className - Class name to check
     * @returns true if class is present
     */
    has_class(className: string): boolean;

    /**
     * Add event listener.
     * @param event - Event name (e.g., 'click', 'mousedown')
     * @param handler - Event handler function
     * @returns this (for chaining)
     */
    on(event: string, handler: (e: Event) => void): this;

    /**
     * Remove event listener.
     * @param event - Event name
     * @param handler - Optional specific handler to remove
     * @returns this (for chaining)
     */
    off(event: string, handler?: (e: Event) => void): this;

    /**
     * Raise an event on this control.
     * @param event - Event name
     * @param data - Optional event data
     */
    raise(event: string, data?: unknown): void;

    /**
     * Activate the control (bind DOM events, client-side only).
     */
    activate(): void;

    /**
     * Remove the control from its parent.
     */
    remove(): void;

    /**
     * Get bounding client rect.
     * @returns [[left, top], [right, bottom], [width, height]]
     */
    bcr(): BCR;

    /**
     * Set control size.
     */
    set size(value: [number, number]);

    /**
     * Get control size.
     */
    get size(): [number, number];

    /**
     * Render as HTML string.
     * @returns HTML string
     */
    all_html_render(): string;

    // MVVM Methods

    /**
     * Create bindings between data model and view model.
     * @param bindings - Property binding definitions
     * @param options - Binding options
     * @example
     * this.bind({
     *     'date': {
     *         to: 'formattedDate',
     *         transform: (date) => formatDate(date),
     *         reverse: (str) => parseDate(str)
     *     }
     * });
     */
    bind(bindings: Record<string, BindingSpec>, options?: BindingOptions): void;

    /**
     * Create a computed property on a model.
     * @param model - Target model object
     * @param dependencies - Property names to watch
     * @param computeFn - Function to compute the value
     * @param options - Computed options
     * @example
     * this.computed(
     *     this.view.data.model,
     *     ['firstName', 'lastName'],
     *     (first, last) => `${first} ${last}`,
     *     { propertyName: 'fullName' }
     * );
     */
    computed(
        model: object,
        dependencies: string | string[],
        computeFn: (...values: unknown[]) => unknown,
        options?: ComputedOptions
    ): void;

    /**
     * Watch a property for changes.
     * @param model - Model to watch
     * @param property - Property name
     * @param callback - Callback function (newVal, oldVal)
     * @param options - Watch options
     * @example
     * this.watch(this.data.model, 'selectedItem', (newVal, oldVal) => {
     *     console.log('Changed:', oldVal, '→', newVal);
     * });
     */
    watch(
        model: object,
        property: string,
        callback: (newVal: unknown, oldVal: unknown) => void,
        options?: WatchOptions
    ): void;

    /**
     * Get transformations library.
     */
    transforms(): unknown;

    /**
     * Get validators library.
     */
    validators(): unknown;

    /**
     * Inspect all bindings for debugging.
     */
    inspectBindings(): unknown;

    /**
     * Cleanup bindings when control is destroyed.
     */
    destroy(): void;

    /** Static CSS for this control class */
    static css?: string;
}

export default Control;
