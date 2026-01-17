/**
 * TypeScript declarations for themes/token_maps.js
 */

/**
 * CSS token object mapping variable names to values.
 */
export type CSSTokens = Record<string, string>;

/**
 * Size tokens for a control type.
 */
export type SizeTokenMap = Record<string, CSSTokens>;

/**
 * Size tokens for all control types.
 */
export declare const SIZE_TOKENS: {
    button: {
        small: CSSTokens;
        medium: CSSTokens;
        large: CSSTokens;
        xlarge: CSSTokens;
    };
    input: {
        small: CSSTokens;
        medium: CSSTokens;
        large: CSSTokens;
    };
    panel: {
        none: CSSTokens;
        small: CSSTokens;
        medium: CSSTokens;
        large: CSSTokens;
        xlarge: CSSTokens;
    };
};

/**
 * Shadow tokens.
 */
export declare const SHADOW_TOKENS: {
    none: CSSTokens;
    small: CSSTokens;
    medium: CSSTokens;
    large: CSSTokens;
    xlarge: CSSTokens;
    inset: CSSTokens;
};

/**
 * Border radius tokens.
 */
export declare const RADIUS_TOKENS: {
    none: CSSTokens;
    small: CSSTokens;
    medium: CSSTokens;
    large: CSSTokens;
    xlarge: CSSTokens;
    full: CSSTokens;
};

/**
 * Spacing tokens.
 */
export declare const SPACING_TOKENS: {
    none: CSSTokens;
    xs: CSSTokens;
    small: CSSTokens;
    medium: CSSTokens;
    large: CSSTokens;
    xlarge: CSSTokens;
    xxlarge: CSSTokens;
};

import { Control } from '../html-core/control';

/**
 * Apply size tokens to a control.
 * @param ctrl - Control instance
 * @param control_type - Control type name
 * @param size - Size value (small, medium, large, etc.)
 */
export declare function apply_size_tokens(
    ctrl: Control,
    control_type: string,
    size: string
): void;

/**
 * Apply shadow tokens to a control.
 * @param ctrl - Control instance
 * @param shadow - Shadow value (none, small, medium, large, etc.)
 */
export declare function apply_shadow_tokens(
    ctrl: Control,
    shadow: string
): void;

/**
 * Apply radius tokens to a control.
 * @param ctrl - Control instance
 * @param radius - Radius value (none, small, medium, large, full)
 */
export declare function apply_radius_tokens(
    ctrl: Control,
    radius: string
): void;

/**
 * Apply all relevant tokens based on params.
 * This is the main entry point for applying token mappings.
 * @param ctrl - Control instance
 * @param control_type - Control type name
 * @param params - Resolved params
 */
export declare function apply_token_map(
    ctrl: Control,
    control_type: string,
    params: Record<string, unknown>
): void;

/**
 * Get raw token values for a control type and size.
 * @param control_type - Control type name
 * @param size - Size value
 * @returns Token object or empty object
 */
export declare function get_size_tokens(
    control_type: string,
    size: string
): CSSTokens;
