/**
 * TypeScript declarations for control_mixins/themeable.js
 */

import { Control } from '../html-core/control';
import { ControlSpec, PageContext } from '../types/control-spec';

/**
 * Options for themeable application.
 */
export interface ThemeableOptions {
    /** Custom warning handler */
    warn?: (message: string) => void;
    /** Control-specific default params */
    defaults?: Record<string, unknown>;
}

/**
 * Apply theming to a control.
 * 
 * This is the primary entry point for controls to integrate with the theme system.
 * It resolves params, applies hooks (data-attrs and classes), and stores the
 * resolved params on the control for use during composition.
 * 
 * @param ctrl - The control instance
 * @param control_type - The control type name (e.g., 'button', 'panel')
 * @param spec - The control specification
 * @param options - Additional options
 * @returns Resolved params object
 * 
 * @example
 * class Button extends Control {
 *     constructor(spec) {
 *         super(spec);
 *         const params = themeable(this, 'button', spec);
 *         // params.size === 'medium'
 *         // params.variant === 'primary'
 *     }
 * }
 */
export declare function themeable<T = Record<string, unknown>>(
    ctrl: Control,
    control_type: string,
    spec: ControlSpec,
    options?: ThemeableOptions
): T;

/**
 * Get resolved params without applying hooks.
 * Useful for read-only inspection or testing.
 * 
 * @param control_type - Control type name
 * @param spec - Control specification
 * @param context - Page context
 * @param options - Resolution options
 * @returns Resolved params (hooks not applied)
 */
export declare function get_theme_params<T = Record<string, unknown>>(
    control_type: string,
    spec: ControlSpec,
    context: PageContext,
    options?: ThemeableOptions
): T;

/**
 * Check if a control has theme params applied.
 * 
 * @param ctrl - Control to check
 * @returns True if themeable was called
 */
export declare function is_themed(ctrl: Control): boolean;

/**
 * Get a specific param value from a themed control with fallback.
 * 
 * @param ctrl - Themed control
 * @param param_name - Parameter name
 * @param fallback - Fallback value if param not found
 * @returns Param value or fallback
 */
export declare function get_param<T = unknown>(
    ctrl: Control,
    param_name: string,
    fallback: T
): T;
