/**
 * Theme Variant Registry
 * 
 * Built-in variant presets for controls. Each variant defines
 * composition parameters that can be selected via spec.variant
 * or context.theme.extends.
 */

/**
 * Window control variants.
 */
const window_variants = {
    /**
     * Default variant - matches current Window behavior exactly.
     * Right-aligned buttons in minimize/maximize/close order.
     */
    'default': {
        button_position: 'right',
        button_order: ['minimize', 'maximize', 'close'],
        button_style: 'icons',
        show_minimize: true,
        show_maximize: true,
        show_close: true,
        show_buttons: true,
        title_alignment: 'left',
        draggable: true,
        resizable: true
    },

    /**
     * macOS-style variant.
     * Left-aligned traffic light buttons in close/minimize/maximize order.
     */
    'macos': {
        button_position: 'left',
        button_order: ['close', 'minimize', 'maximize'],
        button_style: 'traffic-light',
        show_minimize: true,
        show_maximize: true,
        show_close: true,
        show_buttons: true,
        title_alignment: 'center',
        draggable: true,
        resizable: true
    },

    /**
     * Windows 11 style variant.
     * Right-aligned Segoe icon buttons.
     */
    'windows-11': {
        button_position: 'right',
        button_order: ['minimize', 'maximize', 'close'],
        button_style: 'segoe',
        show_minimize: true,
        show_maximize: true,
        show_close: true,
        show_buttons: true,
        title_alignment: 'left',
        draggable: true,
        resizable: true
    },

    /**
     * Minimal variant - close button only.
     */
    'minimal': {
        button_position: 'right',
        button_order: ['close'],
        button_style: 'icons',
        show_minimize: false,
        show_maximize: false,
        show_close: true,
        show_buttons: true,
        title_alignment: 'left',
        draggable: true,
        resizable: false
    }
};

/**
 * Button control variants.
 */
const button_variants = {
    'default': {
        size: 'medium',
        variant: 'secondary',
        icon_position: 'left',
        full_width: false
    },
    'primary': {
        size: 'medium',
        variant: 'primary',
        icon_position: 'left',
        full_width: false
    },
    'secondary': {
        size: 'medium',
        variant: 'secondary',
        icon_position: 'left',
        full_width: false
    },
    'ghost': {
        size: 'medium',
        variant: 'ghost',
        icon_position: 'left',
        full_width: false
    },
    'danger': {
        size: 'medium',
        variant: 'danger',
        icon_position: 'left',
        full_width: false
    },
    'success': {
        size: 'medium',
        variant: 'success',
        icon_position: 'left',
        full_width: false
    },
    'outline': {
        size: 'medium',
        variant: 'outline',
        icon_position: 'left',
        full_width: false
    },
    'link': {
        size: 'medium',
        variant: 'link',
        icon_position: 'left',
        full_width: false
    },
    'icon': {
        size: 'medium',
        variant: 'ghost',
        icon_position: 'only',
        shape: 'circle'
    },
    'fab': {
        size: 'large',
        variant: 'primary',
        icon_position: 'only',
        shape: 'circle',
        shadow: 'large'
    }
};

/**
 * Panel control variants.
 */
const panel_variants = {
    'default': {
        padding: 'medium',
        border: false,
        shadow: 'none',
        radius: 'none',
        header: true,
        collapsible: false
    },
    'card': {
        padding: 'medium',
        border: true,
        shadow: 'small',
        radius: 'medium',
        header: true,
        collapsible: false
    },
    'elevated': {
        padding: 'large',
        border: false,
        shadow: 'large',
        radius: 'large',
        header: true,
        collapsible: false
    },
    'flush': {
        padding: 'none',
        border: false,
        shadow: 'none',
        radius: 'none',
        header: false,
        collapsible: false
    },
    'well': {
        padding: 'medium',
        border: true,
        shadow: 'inset',
        radius: 'small',
        header: false,
        collapsible: false
    },
    'glass': {
        padding: 'medium',
        border: true,
        shadow: 'medium',
        radius: 'large',
        header: true,
        collapsible: false
    },
    'outline': {
        padding: 'medium',
        border: true,
        shadow: 'none',
        radius: 'medium',
        header: true,
        collapsible: false
    },
    'hero': {
        padding: 'xlarge',
        border: false,
        shadow: 'none',
        radius: 'none',
        header: false,
        collapsible: false
    },
    'collapsible': {
        padding: 'medium',
        border: true,
        shadow: 'small',
        radius: 'medium',
        header: true,
        collapsible: true
    }
};

/**
 * All variant registries keyed by control type (lowercase).
 */
const variants = {
    window: window_variants,
    button: button_variants,
    panel: panel_variants
};

/**
 * Get variant parameters for a control type.
 * @param {string} control_type - Control type name (e.g., 'window').
 * @param {string} variant_name - Variant name (e.g., 'macos').
 * @returns {Object} Variant parameters or empty object if not found.
 */
const get_variant_params = (control_type, variant_name) => {
    const type_key = String(control_type).toLowerCase().replace(/-/g, '_');
    const registry = variants[type_key];
    if (!registry) return {};

    const name = variant_name || 'default';
    return registry[name] || registry['default'] || {};
};

/**
 * Register a custom variant for a control type.
 * @param {string} control_type - Control type name.
 * @param {string} variant_name - Variant name.
 * @param {Object} params - Variant parameters.
 */
const register_variant = (control_type, variant_name, params) => {
    const type_key = String(control_type).toLowerCase().replace(/-/g, '_');
    if (!variants[type_key]) {
        variants[type_key] = {};
    }
    variants[type_key][variant_name] = { ...params };
};

/**
 * Get all variant names for a control type.
 * @param {string} control_type - Control type name.
 * @returns {string[]} Array of variant names.
 */
const get_variant_names = (control_type) => {
    const type_key = String(control_type).toLowerCase().replace(/-/g, '_');
    const registry = variants[type_key];
    return registry ? Object.keys(registry) : [];
};

module.exports = {
    variants,
    get_variant_params,
    register_variant,
    get_variant_names,
    // Export individual registries for direct access
    window_variants,
    button_variants,
    panel_variants
};
