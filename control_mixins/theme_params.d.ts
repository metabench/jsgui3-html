/**
 * TypeScript declarations for control_mixins/theme_params.js
 */

import { Control } from '../html-core/control';
import { ControlSpec, PageContext } from '../types/control-spec';
import { ThemeHooks, ResolvedParams } from '../types/theme';

/**
 * Warning handler function type.
 */
export type WarningHandler = (message: string) => void;

/**
 * Resolution options.
 */
export interface ResolveOptions {
    /** Custom warning handler */
    warn?: WarningHandler;
}

/**
 * Parameter schema for validation.
 */
export type ParamSchema = Record<string, string[] | undefined>;

/**
 * Parameter schemas for all control types.
 */
export declare const param_schemas: {
    window: ParamSchema;
    button: ParamSchema;
    panel: ParamSchema;
};

/**
 * Default warning handler.
 */
export declare const default_warning_handler: WarningHandler;

/**
 * Validate a parameter value against allowed values.
 * @param name - Parameter name.
 * @param value - Value to validate.
 * @param allowed - Allowed values.
 * @param fallback - Fallback if invalid.
 * @param warn - Warning handler.
 * @returns Validated value.
 */
export declare function validate_param<T>(
    name: string,
    value: T,
    allowed: T[] | undefined,
    fallback: T,
    warn?: WarningHandler
): T;

/**
 * Derive styling hooks from resolved params.
 * @param control_type - Control type.
 * @param params - Resolved params.
 * @returns Styling hooks.
 */
export declare function derive_hooks(
    control_type: string,
    params: Record<string, unknown>
): ThemeHooks;

/**
 * Resolve composition parameters for a control.
 * 
 * Priority (highest to lowest):
 * 1. spec.params - Direct params on the control spec
 * 2. context.theme.params[control_type] - Theme-level params
 * 3. Variant defaults - From the variant registry
 * 
 * @param control_type - Control type (e.g., 'window').
 * @param spec - Control specification.
 * @param context - Page context.
 * @param options - Resolution options.
 * @returns Resolved params and hooks.
 */
export declare function resolve_params<T = Record<string, unknown>>(
    control_type: string,
    spec?: ControlSpec,
    context?: PageContext,
    options?: ResolveOptions
): ResolvedParams<T>;

/**
 * Apply styling hooks to a control.
 * @param ctrl - Control instance.
 * @param hooks - Hooks from resolve_params.
 */
export declare function apply_hooks(ctrl: Control, hooks: ThemeHooks): void;

/**
 * Resolve and apply in one call.
 * @param ctrl - Control instance.
 * @param control_type - Control type.
 * @param spec - Control specification.
 * @param options - Resolution options.
 * @returns Resolved params (hooks already applied).
 */
export declare function resolve_and_apply<T = Record<string, unknown>>(
    ctrl: Control,
    control_type: string,
    spec?: ControlSpec,
    options?: ResolveOptions
): T;
