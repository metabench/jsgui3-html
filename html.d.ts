/**
 * jsgui3-html Type Definitions
 * 
 * Main entry point - re-exports all public types and controls.
 */

// Core types
export {
    PageContext,
    DOM,
    DOMAttributes,
    ControlSpec,
    BindingSpec,
    BindingOptions,
    ComputedOptions,
    WatchOptions
} from './types/control-spec';

// Theme types
export {
    ThemeSpec,
    ThemeTokens,
    ThemeParams,
    ThemeHooks,
    ResolvedParams,
    WindowParams,
    ButtonParams,
    PanelParams,
    InputParams,
    WindowVariant,
    BuiltInVariant
} from './types/theme';

// Base Control
export { Control, Content, BCR } from './html-core/control';

// Layout controls
export { Window, WindowSpec, WindowManager, SnapOptions, DockOptions, DockEdge } from './controls/organised/1-standard/6-layout/window';

// Import types for internal use
import { Control } from './html-core/control';
import { ControlSpec } from './types/control-spec';
import { ThemeSpec, ThemeTokens } from './types/theme';

/**
 * HTML element control interface.
 * All HTML tag controls share this base interface.
 */
export interface HTMLElementControl extends Control {
    new(spec?: ControlSpec): Control;
}

// HTML element controls (dynamically generated from tag names)
export declare const div: { new(spec?: ControlSpec): Control };
export declare const span: { new(spec?: ControlSpec): Control };
export declare const button: { new(spec?: ControlSpec): Control };
export declare const input: { new(spec?: ControlSpec): Control };
export declare const form: { new(spec?: ControlSpec): Control };
export declare const label: { new(spec?: ControlSpec): Control };
export declare const select: { new(spec?: ControlSpec): Control };
export declare const option: { new(spec?: ControlSpec): Control };
export declare const textarea: { new(spec?: ControlSpec): Control };
export declare const table: { new(spec?: ControlSpec): Control };
export declare const tr: { new(spec?: ControlSpec): Control };
export declare const td: { new(spec?: ControlSpec): Control };
export declare const th: { new(spec?: ControlSpec): Control };
export declare const thead: { new(spec?: ControlSpec): Control };
export declare const tbody: { new(spec?: ControlSpec): Control };
export declare const ul: { new(spec?: ControlSpec): Control };
export declare const ol: { new(spec?: ControlSpec): Control };
export declare const li: { new(spec?: ControlSpec): Control };
export declare const a: { new(spec?: ControlSpec): Control };
export declare const img: { new(spec?: ControlSpec): Control };
export declare const h1: { new(spec?: ControlSpec): Control };
export declare const h2: { new(spec?: ControlSpec): Control };
export declare const h3: { new(spec?: ControlSpec): Control };
export declare const h4: { new(spec?: ControlSpec): Control };
export declare const h5: { new(spec?: ControlSpec): Control };
export declare const h6: { new(spec?: ControlSpec): Control };
export declare const p: { new(spec?: ControlSpec): Control };
export declare const section: { new(spec?: ControlSpec): Control };
export declare const article: { new(spec?: ControlSpec): Control };
export declare const header: { new(spec?: ControlSpec): Control };
export declare const footer: { new(spec?: ControlSpec): Control };
export declare const nav: { new(spec?: ControlSpec): Control };
export declare const aside: { new(spec?: ControlSpec): Control };
export declare const canvas: { new(spec?: ControlSpec): Control };
export declare const svg: { new(spec?: ControlSpec): Control };
export declare const video: { new(spec?: ControlSpec): Control };
export declare const audio: { new(spec?: ControlSpec): Control };
export declare const link: { new(spec?: ControlSpec): Control };
export declare const meta: { new(spec?: ControlSpec): Control };
export declare const script: { new(spec?: ControlSpec): Control };
export declare const style: { new(spec?: ControlSpec): Control };
export declare const head: { new(spec?: ControlSpec): Control };
export declare const body: { new(spec?: ControlSpec): Control };
export declare const html: { new(spec?: ControlSpec): Control };
export declare const title: { new(spec?: ControlSpec): Control };

/**
 * Controls namespace containing all control classes.
 */
export declare const controls: {
    Control: typeof Control;
    Window: typeof import('./controls/organised/1-standard/6-layout/window').Window;
    div: typeof div;
    span: typeof span;
    button: typeof button;
    input: typeof input;
    form: typeof form;
    label: typeof label;
    select: typeof select;
    option: typeof option;
    textarea: typeof textarea;
    table: typeof table;
    tr: typeof tr;
    td: typeof td;
    th: typeof th;
    thead: typeof thead;
    tbody: typeof tbody;
    ul: typeof ul;
    ol: typeof ol;
    li: typeof li;
    a: typeof a;
    img: typeof img;
    h1: typeof h1;
    h2: typeof h2;
    h3: typeof h3;
    h4: typeof h4;
    h5: typeof h5;
    h6: typeof h6;
    p: typeof p;
    section: typeof section;
    article: typeof article;
    header: typeof header;
    footer: typeof footer;
    nav: typeof nav;
    aside: typeof aside;
    canvas: typeof canvas;
    svg: typeof svg;
    video: typeof video;
    audio: typeof audio;
};

/**
 * Dragable mixin options.
 */
export interface DragableOptions {
    /** Drag mode: 'translate' for transform-based, 'position' for left/top */
    drag_mode?: 'translate' | 'position';
    /** Handle element for dragging (defaults to entire control) */
    handle?: Control;
    /** Bounding container or rect */
    bounds?: Control | [[number, number], [number, number]];
}

/**
 * Resizable mixin options.
 */
export interface ResizableOptions {
    /** Resize mode */
    resize_mode?: 'br_handle' | 'edges' | 'corners';
    /** Size bounds [[min_w, min_h], [max_w, max_h]] */
    bounds?: [[number, number], [number, number]?];
    /** Container bounds */
    extent_bounds?: Control | [[number, number], [number, number]];
}

/**
 * Mixins namespace containing control mixins.
 */
export declare const mixins: {
    /** Make a control draggable */
    dragable(ctrl: Control, options?: DragableOptions): void;
    /** Make a control resizable */
    resizable(ctrl: Control, options?: ResizableOptions): void;
    /** Apply theme to a control */
    apply_theme(ctrl: Control, theme: ThemeSpec | string, options?: object): void;
    /** Apply theme token overrides */
    apply_theme_overrides(ctrl: Control, overrides: ThemeTokens, options?: object): void;
    /** Apply theme tokens */
    apply_theme_tokens(ctrl: Control, tokens: ThemeTokens, options?: object): void;
};

/** Alias for mixins */
export declare const mx: typeof mixins;

// Activation functions
import { PageContext } from './types/control-spec';

/** Pre-activate controls (prepare for hydration) */
export declare function pre_activate(context: PageContext): void;
/** Activate controls (bind DOM events) */
export declare function activate(context: PageContext): void;

// Utility types
export declare const tof: (value: unknown) => string;
export declare function is_defined<T>(value: T | undefined | null): value is T;
export declare const def: typeof is_defined;

// Document classes
export declare class HTML_Document extends Control {
    constructor(spec?: ControlSpec);
}

export declare class Blank_HTML_Document extends HTML_Document {
    constructor(spec?: ControlSpec);
    head: Control;
    title: Control;
    body: Control;
}

// Resource system (basic types)
export declare namespace Resource {
    class Pool { add(resource: unknown): void; }
    class Data_KV { }
    class Data_Transform { }
    class Compilation { }
    class Compiler { }
    function load_compiler(name: string, fn: Function, options?: object): Compiler;
    const compilers: Record<string, Compiler>;
}

// Router
export declare class Router {
    constructor(spec?: object);
}

// Main jsgui object (default export)
declare const jsgui: {
    Control: typeof Control;
    Window: typeof import('./controls/organised/1-standard/6-layout/window').Window;
    controls: typeof controls;
    mixins: typeof mixins;
    mx: typeof mx;
    pre_activate: typeof pre_activate;
    activate: typeof activate;
    tof: typeof tof;
    def: typeof def;
    is_defined: typeof is_defined;
    Router: typeof Router;
    Resource: typeof Resource;
    HTML_Document: typeof HTML_Document;
    Blank_HTML_Document: typeof Blank_HTML_Document;
    // HTML element controls
    div: typeof div;
    span: typeof span;
    button: typeof button;
    input: typeof input;
    h1: typeof h1;
    h2: typeof h2;
    h3: typeof h3;
    h4: typeof h4;
    h5: typeof h5;
    h6: typeof h6;
    p: typeof p;
    a: typeof a;
    form: typeof form;
    label: typeof label;
    select: typeof select;
    option: typeof option;
    textarea: typeof textarea;
    table: typeof table;
    tr: typeof tr;
    td: typeof td;
    th: typeof th;
    thead: typeof thead;
    tbody: typeof tbody;
    ul: typeof ul;
    ol: typeof ol;
    li: typeof li;
    img: typeof img;
    section: typeof section;
    article: typeof article;
    header: typeof header;
    footer: typeof footer;
    nav: typeof nav;
    aside: typeof aside;
    canvas: typeof canvas;
    svg: typeof svg;
    video: typeof video;
    audio: typeof audio;
    link: typeof link;
    meta: typeof meta;
    script: typeof script;
    head: typeof head;
    body: typeof body;
    html: typeof html;
    title: typeof title;
};

export default jsgui;
