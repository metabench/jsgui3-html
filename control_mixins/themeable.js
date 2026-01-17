/**
 * Themeable Mixin
 * 
 * Provides a reusable wrapper for applying theme params to any control.
 * Handles param resolution, hook application, and token mapping in one call.
 */

const { resolve_params, apply_hooks } = require('./theme_params');

/**
 * Apply theming to a control.
 * 
 * This is the primary entry point for controls to integrate with the theme system.
 * It resolves params, applies hooks (data-attrs and classes), and stores the
 * resolved params on the control for use during composition.
 * 
 * @param {Control} ctrl - The control instance
 * @param {string} control_type - The control type name (e.g., 'button', 'panel')
 * @param {Object} spec - The control specification
 * @param {Object} [options] - Additional options
 * @param {Function} [options.warn] - Custom warning handler
 * @param {Object} [options.defaults] - Control-specific default params
 * @returns {Object} Resolved params object
 * 
 * @example
 * class Button extends Control {
 *     constructor(spec) {
 *         super(spec);
 *         const params = themeable(this, 'button', spec);
 *         // params.size === 'medium'
 *         // params.variant === 'primary'
 *         this._compose(params);
 *     }
 * }
 */
const themeable = (ctrl, control_type, spec, options = {}) => {
    // Set control type for CSS targeting and debugging
    ctrl.__type_name = ctrl.__type_name || control_type;

    // Resolve params with full merge priority
    const { params, hooks } = resolve_params(control_type, spec, ctrl.context, options);

    // Merge with control-specific defaults if provided
    const merged = options.defaults ? { ...options.defaults, ...params } : params;

    // Store for later access (useful for testing/debugging)
    ctrl._theme_params = merged;

    // Apply data-attributes and classes
    apply_hooks(ctrl, hooks);

    // Add variant data attribute if specified
    if (spec && spec.variant) {
        ctrl.dom = ctrl.dom || {};
        ctrl.dom.attributes = ctrl.dom.attributes || {};
        ctrl.dom.attributes['data-variant'] = spec.variant;
    }

    return merged;
};

/**
 * Get resolved params without applying hooks.
 * Useful for read-only inspection or testing.
 * 
 * @param {string} control_type - Control type name
 * @param {Object} spec - Control specification
 * @param {Object} context - Page context
 * @param {Object} [options] - Resolution options
 * @returns {Object} Resolved params (hooks not applied)
 */
const get_theme_params = (control_type, spec, context, options = {}) => {
    const { params } = resolve_params(control_type, spec, context, options);
    return params;
};

/**
 * Check if a control has theme params applied.
 * 
 * @param {Control} ctrl - Control to check
 * @returns {boolean} True if themeable was called
 */
const is_themed = (ctrl) => {
    return ctrl && typeof ctrl._theme_params === 'object';
};

/**
 * Get a specific param value from a themed control with fallback.
 * 
 * @param {Control} ctrl - Themed control
 * @param {string} param_name - Parameter name
 * @param {*} fallback - Fallback value if param not found
 * @returns {*} Param value or fallback
 */
const get_param = (ctrl, param_name, fallback) => {
    if (!ctrl || !ctrl._theme_params) return fallback;
    const value = ctrl._theme_params[param_name];
    return value !== undefined ? value : fallback;
};

module.exports = {
    themeable,
    get_theme_params,
    is_themed,
    get_param
};
