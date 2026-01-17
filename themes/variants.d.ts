/**
 * TypeScript declarations for themes/variants.js
 */

import { WindowParams, ButtonParams, PanelParams } from '../types/theme';

/**
 * Window variant parameters.
 */
export declare const window_variants: {
    default: WindowParams;
    macos: WindowParams;
    'windows-11': WindowParams;
    minimal: WindowParams;
};

/**
 * Button variant parameters.
 */
export declare const button_variants: {
    default: ButtonParams;
    primary: ButtonParams;
    secondary: ButtonParams;
    ghost: ButtonParams;
    danger: ButtonParams;
    success: ButtonParams;
    outline: ButtonParams;
    link: ButtonParams;
    icon: ButtonParams;
    fab: ButtonParams;
};

/**
 * Panel variant parameters.
 */
export declare const panel_variants: {
    default: PanelParams;
    card: PanelParams;
    elevated: PanelParams;
    flush: PanelParams;
    well: PanelParams;
    glass: PanelParams;
    outline: PanelParams;
    hero: PanelParams;
    collapsible: PanelParams;
};

/**
 * All variant registries.
 */
export declare const variants: {
    window: typeof window_variants;
    button: typeof button_variants;
    panel: typeof panel_variants;
};

/**
 * Get variant parameters for a control type.
 * @param control_type - Control type name (e.g., 'window').
 * @param variant_name - Variant name (e.g., 'macos').
 * @returns Variant parameters or empty object if not found.
 */
export declare function get_variant_params<T = Record<string, unknown>>(
    control_type: string,
    variant_name?: string
): T;

/**
 * Register a custom variant for a control type.
 * @param control_type - Control type name.
 * @param variant_name - Variant name.
 * @param params - Variant parameters.
 */
export declare function register_variant(
    control_type: string,
    variant_name: string,
    params: Record<string, unknown>
): void;

/**
 * Get all variant names for a control type.
 * @param control_type - Control type name.
 * @returns Array of variant names.
 */
export declare function get_variant_names(control_type: string): string[];
