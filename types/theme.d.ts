/**
 * jsgui3-html Type Definitions
 * 
 * Theme system types including tokens, params, and variants.
 */

/**
 * CSS variable tokens (visual styling).
 * Keys become CSS custom properties with --theme- prefix.
 */
export type ThemeTokens = Record<string, string | number>;

/**
 * Window control composition parameters.
 */
export interface WindowParams {
    /** Button group position in title bar */
    button_position?: 'left' | 'right';
    /** Order of window buttons */
    button_order?: Array<'minimize' | 'maximize' | 'close'>;
    /** Visual style for buttons */
    button_style?: 'traffic-light' | 'icons' | 'text' | 'outlined' | 'minimal' | 'segoe';
    /** Show minimize button */
    show_minimize?: boolean;
    /** Show maximize button */
    show_maximize?: boolean;
    /** Show close button */
    show_close?: boolean;
    /** Show any buttons at all */
    show_buttons?: boolean;
    /** Title text alignment */
    title_alignment?: 'left' | 'center' | 'right';
    /** Whether window can be dragged */
    draggable?: boolean;
    /** Whether window can be resized */
    resizable?: boolean;
}

/**
 * Button control composition parameters.
 */
export interface ButtonParams {
    /** Button size preset */
    size?: 'small' | 'medium' | 'large' | 'xlarge';
    /** Button style variant */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'link';
    /** Icon position relative to text */
    icon_position?: 'left' | 'right' | 'only' | 'none';
    /** Whether button takes full width */
    full_width?: boolean;
    /** Button shape (for icon buttons) */
    shape?: 'default' | 'circle' | 'square';
    /** Shadow preset */
    shadow?: 'none' | 'small' | 'medium' | 'large';
}

/**
 * Panel control composition parameters.
 */
export interface PanelParams {
    /** Padding preset */
    padding?: 'none' | 'small' | 'medium' | 'large' | 'xlarge';
    /** Show border */
    border?: boolean;
    /** Shadow preset */
    shadow?: 'none' | 'small' | 'medium' | 'large' | 'inset';
    /** Border radius preset */
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    /** Panel header visibility */
    header?: boolean;
    /** Whether panel can be collapsed */
    collapsible?: boolean;
}

/**
 * Input control composition parameters.
 */
export interface InputParams {
    /** Input size */
    size?: 'small' | 'medium' | 'large';
    /** Label position */
    label_position?: 'top' | 'left' | 'floating';
    /** Show validation icons */
    show_validation_icon?: boolean;
}

/**
 * Collection of all control-type params.
 */
export interface ThemeParams {
    window?: WindowParams;
    button?: ButtonParams;
    panel?: PanelParams;
    input?: InputParams;
}

/**
 * Theme hooks derived from params.
 */
export interface ThemeHooks {
    /** Data attributes to apply (e.g., { 'data-button-style': 'traffic-light' }) */
    attrs?: Record<string, string>;
    /** CSS classes to add */
    classes?: string[];
}

/**
 * Result of resolving theme parameters.
 */
export interface ResolvedParams<T = Record<string, unknown>> {
    /** Merged and validated params */
    params: T;
    /** Derived styling hooks */
    hooks: ThemeHooks;
}

/**
 * Full theme specification.
 */
export interface ThemeSpec {
    /** Theme identifier */
    name?: string;
    /** Base theme/variant to extend (single-level) */
    extends?: string;
    /** CSS variable tokens */
    tokens?: ThemeTokens;
    /** Control composition parameters */
    params?: ThemeParams;
}

/**
 * Built-in window variants.
 */
export type WindowVariant = 'default' | 'macos' | 'windows-11' | 'minimal';

/**
 * Built-in button variants.
 */
export type ButtonVariant = 'default' | 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'link' | 'icon' | 'fab';

/**
 * Built-in panel variants.
 */
export type PanelVariant = 'default' | 'card' | 'elevated' | 'flush' | 'well' | 'glass' | 'outline' | 'hero' | 'collapsible';

/**
 * Theme preset names that can be used with spec.variant.
 */
export type BuiltInVariant = WindowVariant | ButtonVariant | PanelVariant;

/**
 * Size presets available for controls.
 */
export type SizePreset = 'small' | 'medium' | 'large' | 'xlarge';

/**
 * Shadow presets available for controls.
 */
export type ShadowPreset = 'none' | 'small' | 'medium' | 'large' | 'xlarge' | 'inset';

/**
 * Border radius presets available for controls.
 */
export type RadiusPreset = 'none' | 'small' | 'medium' | 'large' | 'xlarge' | 'full';
