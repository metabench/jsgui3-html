/**
 * Theme Parameters Resolution
 * 
 * Resolves composition parameters for controls by merging:
 * 1. Variant defaults (from themes/variants.js)
 * 2. Theme params (from context.theme.params[control_type])
 * 3. Spec params (from spec.params)
 * 
 * Returns both the merged params and derived styling hooks
 * (data-attributes and classes for CSS targeting).
 */

const { get_variant_params } = require('../themes/variants');

/**
 * Default warning handler - logs to console in development.
 * @param {string} message - Warning message.
 */
const default_warning_handler = (message) => {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
        console.warn('[theme_params]', message);
    }
};

/**
 * Validate a parameter value against allowed values.
 * @param {string} name - Parameter name.
 * @param {*} value - Value to validate.
 * @param {Array} allowed - Allowed values.
 * @param {*} fallback - Fallback if invalid.
 * @param {Function} warn - Warning handler.
 * @returns {*} Validated value.
 */
const validate_param = (name, value, allowed, fallback, warn = default_warning_handler) => {
    if (value === undefined || value === null) return fallback;
    if (allowed && Array.isArray(allowed) && !allowed.includes(value)) {
        warn(`Param "${name}" has invalid value "${value}". Expected one of: ${allowed.join(', ')}. Using "${fallback}".`);
        return fallback;
    }
    return value;
};

/**
 * Parameter schemas for validation.
 * Each entry defines allowed values for params that have constraints.
 */
const param_schemas = {
    window: {
        button_position: ['left', 'right'],
        button_style: ['traffic-light', 'icons', 'text', 'outlined', 'minimal', 'segoe'],
        title_alignment: ['left', 'center', 'right']
    },
    button: {
        size: ['small', 'medium', 'large', 'xlarge'],
        variant: ['primary', 'secondary', 'ghost', 'danger', 'success', 'outline', 'link']
    },
    panel: {
        padding: ['none', 'small', 'medium', 'large', 'xlarge'],
        shadow: ['none', 'small', 'medium', 'large', 'inset'],
        radius: ['none', 'small', 'medium', 'large', 'full']
    },
    input: {
        size: ['small', 'medium', 'large'],
        label_position: ['top', 'left', 'right', 'floating', 'hidden'],
        fill_style: ['outline', 'filled', 'underline', 'transparent'],
        validation_style: ['inline', 'tooltip', 'popover', 'none'],
        radius: ['none', 'small', 'medium', 'large', 'full']
    },
    text_input: {
        size: ['small', 'medium', 'large'],
        label_position: ['top', 'left', 'right', 'floating', 'hidden'],
        fill_style: ['outline', 'filled', 'underline', 'transparent'],
        validation_style: ['inline', 'tooltip', 'popover', 'none'],
        radius: ['none', 'small', 'medium', 'large', 'full']
    },
    tabbed_panel: {
        tab_position: ['top', 'bottom', 'left', 'right'],
        indicator: ['underline', 'background', 'card', 'left-border', 'right-border', 'none'],
        spacing: ['none', 'small', 'medium', 'large'],
        size: ['small', 'medium', 'large'],
        fill_style: ['none', 'filled'],
        radius: ['none', 'small', 'medium', 'large', 'full', 'top']
    },
    menu: {
        direction: ['horizontal', 'vertical'],
        spacing: ['none', 'small', 'medium', 'large'],
        indicator: ['none', 'underline', 'background', 'left-border', 'right-border'],
        size: ['small', 'medium', 'large'],
        radius: ['none', 'small', 'medium', 'large', 'full']
    },
    horizontal_menu: {
        direction: ['horizontal', 'vertical'],
        spacing: ['none', 'small', 'medium', 'large'],
        indicator: ['none', 'underline', 'background', 'left-border', 'right-border'],
        size: ['small', 'medium', 'large'],
        radius: ['none', 'small', 'medium', 'large', 'full']
    },
    dropdown_menu: {
        size: ['small', 'medium', 'large'],
        fill_style: ['outline', 'filled', 'transparent'],
        radius: ['none', 'small', 'medium', 'large', 'full'],
        icon: ['chevron', 'triangle', 'none']
    },
    context_menu: {
        size: ['small', 'medium', 'large'],
        shadow: ['none', 'small', 'medium', 'large'],
        radius: ['none', 'small', 'medium', 'large']
    },
    list: {
        size: ['small', 'medium', 'large'],
        spacing: ['none', 'small', 'medium', 'large'],
        dividers: [true, false]
    },
    chart: {
        size: ['small', 'medium', 'large'],
        palette: ['categorical', 'monochrome', 'vibrant', 'dark'],
        grid: [true, false],
        legend: ['none', 'top', 'bottom', 'left', 'right'],
        animation: [true, false]
    }
};

/**
 * Derive styling hooks from resolved params.
 * These hooks are used as data-attributes and classes for CSS targeting.
 * 
 * @param {string} control_type - Control type.
 * @param {Object} params - Resolved params.
 * @returns {Object} { attrs: {}, classes: [] }
 */
const derive_hooks = (control_type, params) => {
    const attrs = {};
    const classes = [];
    const type_key = String(control_type).toLowerCase();

    if (type_key === 'window') {
        if (params.button_style) {
            attrs['data-button-style'] = params.button_style;
        }
        if (params.title_alignment && params.title_alignment !== 'left') {
            attrs['data-title-align'] = params.title_alignment;
        }
        if (params.button_position) {
            // This will be used to add class to button group: 'left' or 'right'
            attrs['data-button-position'] = params.button_position;
        }
    }

    if (type_key === 'button') {
        if (params.variant) {
            classes.push(`btn-${params.variant}`);
        }
        if (params.size && params.size !== 'medium') {
            classes.push(`btn-${params.size}`);
        }
    }

    if (type_key === 'panel') {
        if (params.padding && params.padding !== 'medium') {
            classes.push(`padding-${params.padding}`);
        }
        if (params.border) {
            classes.push('bordered');
        }
    }

    if (type_key === 'input' || type_key === 'text_input') {
        if (params.fill_style) {
            attrs['data-fill-style'] = params.fill_style;
        }
        if (params.label_position) {
            attrs['data-label-position'] = params.label_position;
        }
        if (params.size && params.size !== 'medium') {
            classes.push(`input-${params.size}`);
        }
        if (params.shape === 'pill') {
            classes.push('input-pill');
        }
        if (params.clear_button) {
            classes.push('has-clear-button');
        }
    }

    if (type_key === 'tabbed_panel') {
        if (params.tab_position) {
            attrs['data-tab-position'] = params.tab_position;
        }
        if (params.indicator) {
            attrs['data-indicator'] = params.indicator;
        }
        if (params.size && params.size !== 'medium') {
            classes.push(`tabs-${params.size}`);
        }
        if (params.fill_style === 'filled') {
            classes.push('tabs-filled');
        }
    }

    if (type_key === 'menu' || type_key === 'horizontal_menu') {
        if (params.direction) {
            attrs['data-direction'] = params.direction;
        }
        if (params.indicator && params.indicator !== 'none') {
            attrs['data-indicator'] = params.indicator;
        }
        if (params.size && params.size !== 'medium') {
            classes.push(`menu-${params.size}`);
        }
        if (params.separator) {
            classes.push('menu-divided');
        }
        if (params.icon_only) {
            classes.push('menu-icon-only');
        }
    }

    if (type_key === 'dropdown_menu') {
        if (params.fill_style) {
            attrs['data-fill-style'] = params.fill_style;
        }
        if (params.icon && params.icon !== 'chevron') {
            attrs['data-icon'] = params.icon;
        }
        if (params.size && params.size !== 'medium') {
            classes.push(`dropdown-${params.size}`);
        }
    }

    if (type_key === 'context_menu') {
        if (params.size && params.size !== 'medium') {
            classes.push(`context-menu-${params.size}`);
        }
        if (params.theme === 'dark') {
            classes.push('dark-theme');
        }
    }

    if (type_key === 'list') {
        if (params.size && params.size !== 'medium') {
            classes.push(`list-${params.size}`);
        }
        if (params.dividers) {
            classes.push('list-divided');
        }
        if (params.item_style === 'card') {
            classes.push('list-cards');
        }
    }

    return { attrs, classes };
};

/**
 * Resolve composition parameters for a control.
 * 
 * Priority (highest to lowest):
 * 1. spec.params - Direct params on the control spec
 * 2. context.theme.params[control_type] - Theme-level params
 * 3. Variant defaults - From the variant registry
 * 
 * @param {string} control_type - Control type (e.g., 'window').
 * @param {Object} spec - Control specification.
 * @param {Object} context - Page context.
 * @param {Object} [options] - Resolution options.
 * @param {Function} [options.warn] - Custom warning handler.
 * @returns {Object} { params: {...}, hooks: { attrs: {}, classes: [] } }
 */
const resolve_params = (control_type, spec = {}, context = {}, options = {}) => {
    const warn = options.warn || default_warning_handler;
    const type_key = String(control_type).toLowerCase();

    // Determine variant name
    const variant_name = spec.variant
        || context?.theme?.extends
        || 'default';

    // Layer 1: Variant defaults
    const variant_params = get_variant_params(type_key, variant_name);

    // Layer 2: Theme params
    const theme_params = context?.theme?.params?.[type_key] || {};

    // Layer 3: Spec params
    const spec_params = spec.params || {};

    // Merge all layers
    const merged = { ...variant_params, ...theme_params, ...spec_params };

    // Validate params with schema
    const schema = param_schemas[type_key];
    if (schema) {
        for (const [key, allowed] of Object.entries(schema)) {
            if (merged[key] !== undefined) {
                const fallback = variant_params[key] ?? merged[key];
                merged[key] = validate_param(key, merged[key], allowed, fallback, warn);
            }
        }
    }

    // Derive styling hooks
    const hooks = derive_hooks(type_key, merged);

    return { params: merged, hooks };
};

/**
 * Apply styling hooks to a control.
 * Sets data-attributes and adds classes based on resolved hooks.
 * 
 * @param {Control} ctrl - Control instance.
 * @param {Object} hooks - Hooks from resolve_params.
 */
const apply_hooks = (ctrl, hooks) => {
    if (!ctrl || !hooks) return;

    // Apply data attributes
    if (hooks.attrs) {
        ctrl.dom = ctrl.dom || {};
        ctrl.dom.attributes = ctrl.dom.attributes || {};
        for (const [key, value] of Object.entries(hooks.attrs)) {
            ctrl.dom.attributes[key] = value;
        }
    }

    // Apply classes
    if (hooks.classes && hooks.classes.length > 0) {
        for (const cls of hooks.classes) {
            if (ctrl.add_class) {
                ctrl.add_class(cls);
            }
        }
    }
};

/**
 * Convenience function: resolve and apply in one call.
 * 
 * @param {Control} ctrl - Control instance.
 * @param {string} control_type - Control type.
 * @param {Object} spec - Control specification.
 * @param {Object} [options] - Resolution options.
 * @returns {Object} Resolved params (hooks already applied).
 */
const resolve_and_apply = (ctrl, control_type, spec, options = {}) => {
    const context = ctrl?.context || spec?.context || {};
    const { params, hooks } = resolve_params(control_type, spec, context, options);
    apply_hooks(ctrl, hooks);
    return params;
};

module.exports = {
    resolve_params,
    apply_hooks,
    resolve_and_apply,
    validate_param,
    derive_hooks,
    param_schemas,
    default_warning_handler
};
