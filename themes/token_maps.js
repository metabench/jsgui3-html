/**
 * Theme Token Maps
 * 
 * Maps abstract param values (like size: 'medium') to concrete CSS variables.
 * This enables consistent sizing, spacing, and visual properties across all
 * themed controls.
 */

/**
 * Size token mappings for different control types.
 * Each size maps to a set of CSS custom properties.
 */
const SIZE_TOKENS = {
    button: {
        small: {
            '--btn-height': '28px',
            '--btn-padding-x': '12px',
            '--btn-font-size': '12px',
            '--btn-icon-size': '14px',
            '--btn-border-radius': '4px',
            '--btn-gap': '4px'
        },
        medium: {
            '--btn-height': '36px',
            '--btn-padding-x': '16px',
            '--btn-font-size': '14px',
            '--btn-icon-size': '16px',
            '--btn-border-radius': '6px',
            '--btn-gap': '6px'
        },
        large: {
            '--btn-height': '44px',
            '--btn-padding-x': '20px',
            '--btn-font-size': '16px',
            '--btn-icon-size': '20px',
            '--btn-border-radius': '8px',
            '--btn-gap': '8px'
        },
        xlarge: {
            '--btn-height': '56px',
            '--btn-padding-x': '28px',
            '--btn-font-size': '18px',
            '--btn-icon-size': '24px',
            '--btn-border-radius': '12px',
            '--btn-gap': '10px'
        }
    },

    input: {
        small: {
            '--input-height': '32px',
            '--input-padding-x': '10px',
            '--input-font-size': '13px',
            '--input-border-radius': '4px'
        },
        medium: {
            '--input-height': '40px',
            '--input-padding-x': '12px',
            '--input-font-size': '14px',
            '--input-border-radius': '6px'
        },
        large: {
            '--input-height': '48px',
            '--input-padding-x': '16px',
            '--input-font-size': '16px',
            '--input-border-radius': '8px'
        }
    },

    panel: {
        // Panel uses padding sizes instead of height
        none: { '--panel-padding': '0' },
        small: { '--panel-padding': '8px' },
        medium: { '--panel-padding': '16px' },
        large: { '--panel-padding': '24px' },
        xlarge: { '--panel-padding': '40px' }
    },

    tab: {
        small: {
            '--tab-height': '28px',
            '--tab-padding-x': '8px',
            '--tab-font-size': '12px'
        },
        medium: {
            '--tab-height': '36px',
            '--tab-padding-x': '16px',
            '--tab-font-size': '14px'
        },
        large: {
            '--tab-height': '44px',
            '--tab-padding-x': '24px',
            '--tab-font-size': '16px'
        }
    },

    menu: {
        small: {
            '--menu-item-height': '28px',
            '--menu-item-padding-x': '8px',
            '--menu-font-size': '12px'
        },
        medium: {
            '--menu-item-height': '36px',
            '--menu-item-padding-x': '12px',
            '--menu-font-size': '14px'
        },
        large: {
            '--menu-item-height': '44px',
            '--menu-item-padding-x': '16px',
            '--menu-font-size': '16px'
        }
    }
};

/**
 * Shadow token mappings.
 * Can be applied to any control via the shadow param.
 */
const SHADOW_TOKENS = {
    none: { '--shadow': 'none' },
    small: { '--shadow': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)' },
    medium: { '--shadow': '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)' },
    large: { '--shadow': '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.1)' },
    xlarge: { '--shadow': '0 20px 40px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.1)' },
    inset: { '--shadow': 'inset 0 2px 4px rgba(0,0,0,0.1)' }
};

/**
 * Border radius token mappings.
 * Can be applied to any control via the radius param.
 */
const RADIUS_TOKENS = {
    none: { '--radius': '0' },
    small: { '--radius': '4px' },
    medium: { '--radius': '8px' },
    large: { '--radius': '12px' },
    xlarge: { '--radius': '16px' },
    full: { '--radius': '9999px' }
};

/**
 * Spacing token mappings.
 * For gaps, margins, and other spacing.
 */
const SPACING_TOKENS = {
    none: { '--spacing': '0' },
    xs: { '--spacing': '4px' },
    small: { '--spacing': '8px' },
    medium: { '--spacing': '16px' },
    large: { '--spacing': '24px' },
    xlarge: { '--spacing': '32px' },
    xxlarge: { '--spacing': '48px' }
};

/**
 * Apply size tokens to a control.
 * 
 * @param {Control} ctrl - Control instance
 * @param {string} control_type - Control type name
 * @param {string} size - Size value (small, medium, large, etc.)
 */
const apply_size_tokens = (ctrl, control_type, size) => {
    const type_tokens = SIZE_TOKENS[control_type];
    if (!type_tokens) return;

    const tokens = type_tokens[size];
    if (!tokens) return;

    ctrl.dom = ctrl.dom || {};
    ctrl.dom.attributes = ctrl.dom.attributes || {};
    ctrl.dom.attributes.style = ctrl.dom.attributes.style || {};

    Object.assign(ctrl.dom.attributes.style, tokens);
};

/**
 * Apply shadow tokens to a control.
 * 
 * @param {Control} ctrl - Control instance
 * @param {string} shadow - Shadow value (none, small, medium, large, etc.)
 */
const apply_shadow_tokens = (ctrl, shadow) => {
    const tokens = SHADOW_TOKENS[shadow];
    if (!tokens) return;

    ctrl.dom = ctrl.dom || {};
    ctrl.dom.attributes = ctrl.dom.attributes || {};
    ctrl.dom.attributes.style = ctrl.dom.attributes.style || {};

    Object.assign(ctrl.dom.attributes.style, tokens);
};

/**
 * Apply radius tokens to a control.
 * 
 * @param {Control} ctrl - Control instance
 * @param {string} radius - Radius value (none, small, medium, large, full)
 */
const apply_radius_tokens = (ctrl, radius) => {
    const tokens = RADIUS_TOKENS[radius];
    if (!tokens) return;

    ctrl.dom = ctrl.dom || {};
    ctrl.dom.attributes = ctrl.dom.attributes || {};
    ctrl.dom.attributes.style = ctrl.dom.attributes.style || {};

    Object.assign(ctrl.dom.attributes.style, tokens);
};

/**
 * Apply all relevant tokens based on params.
 * This is the main entry point for applying token mappings.
 * 
 * @param {Control} ctrl - Control instance
 * @param {string} control_type - Control type name
 * @param {Object} params - Resolved params
 */
const apply_token_map = (ctrl, control_type, params) => {
    if (!ctrl || !params) return;

    // Ensure style object exists
    ctrl.dom = ctrl.dom || {};
    ctrl.dom.attributes = ctrl.dom.attributes || {};
    ctrl.dom.attributes.style = ctrl.dom.attributes.style || {};

    // Apply size tokens
    if (params.size && SIZE_TOKENS[control_type]) {
        const size_tokens = SIZE_TOKENS[control_type][params.size];
        if (size_tokens) {
            Object.assign(ctrl.dom.attributes.style, size_tokens);
        }
    }

    // Apply padding tokens for panels
    if (params.padding && SIZE_TOKENS.panel) {
        const padding_tokens = SIZE_TOKENS.panel[params.padding];
        if (padding_tokens) {
            Object.assign(ctrl.dom.attributes.style, padding_tokens);
        }
    }

    // Apply shadow tokens
    if (params.shadow && SHADOW_TOKENS[params.shadow]) {
        Object.assign(ctrl.dom.attributes.style, SHADOW_TOKENS[params.shadow]);
    }

    // Apply radius tokens
    if (params.radius && RADIUS_TOKENS[params.radius]) {
        Object.assign(ctrl.dom.attributes.style, RADIUS_TOKENS[params.radius]);
    }
};

/**
 * Get raw token values for a control type and size.
 * Useful for testing or custom token application.
 * 
 * @param {string} control_type - Control type name
 * @param {string} size - Size value
 * @returns {Object} Token object or empty object
 */
const get_size_tokens = (control_type, size) => {
    return SIZE_TOKENS[control_type]?.[size] || {};
};

module.exports = {
    SIZE_TOKENS,
    SHADOW_TOKENS,
    RADIUS_TOKENS,
    SPACING_TOKENS,
    apply_size_tokens,
    apply_shadow_tokens,
    apply_radius_tokens,
    apply_token_map,
    get_size_tokens
};
