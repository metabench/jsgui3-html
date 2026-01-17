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
 * Input control variants.
 */
const input_variants = {
    /**
     * Default input - standard text field with outline.
     */
    'default': {
        size: 'medium',
        label_position: 'top',
        fill_style: 'outline',
        validation_style: 'inline',
        clear_button: false,
        show_count: false,
        radius: 'medium'
    },

    /**
     * Compact - smaller, label on left.
     */
    'compact': {
        size: 'small',
        label_position: 'left',
        fill_style: 'outline',
        validation_style: 'tooltip',
        radius: 'small'
    },

    /**
     * Floating - animated floating label.
     */
    'floating': {
        size: 'medium',
        label_position: 'floating',
        fill_style: 'outline',
        validation_style: 'inline',
        radius: 'medium'
    },

    /**
     * Filled - solid background.
     */
    'filled': {
        size: 'medium',
        label_position: 'top',
        fill_style: 'filled',
        validation_style: 'inline',
        radius: 'medium'
    },

    /**
     * Underline - only bottom border.
     */
    'underline': {
        size: 'medium',
        label_position: 'floating',
        fill_style: 'underline',
        validation_style: 'inline',
        radius: 'none'
    },

    /**
     * Search - with search styling and clear button.
     */
    'search': {
        size: 'medium',
        label_position: 'hidden',
        fill_style: 'outline',
        shape: 'pill',
        clear_button: true,
        radius: 'full'
    },

    /**
     * Inline - minimal, blends with text.
     */
    'inline': {
        size: 'small',
        label_position: 'hidden',
        fill_style: 'transparent',
        border_on_focus: true,
        radius: 'none'
    }
};

/**
 * Tabbed Panel control variants.
 */
const tabbed_panel_variants = {
    /**
     * Default tabs - top position, underline indicator.
     */
    'default': {
        tab_position: 'top',
        indicator: 'underline',
        spacing: 'medium',
        size: 'medium',
        fill_style: 'none',
        radius: 'none'
    },

    /**
     * Pill tabs - rounded background indicator.
     */
    'pills': {
        tab_position: 'top',
        indicator: 'background',
        spacing: 'small',
        size: 'medium',
        fill_style: 'filled',
        radius: 'full'
    },

    /**
     * Card tabs - tab appears connected to panel.
     */
    'card': {
        tab_position: 'top',
        indicator: 'card',
        spacing: 'none',
        size: 'medium',
        fill_style: 'filled',
        radius: 'top'
    },

    /**
     * Vertical tabs on left side.
     */
    'vertical': {
        tab_position: 'left',
        indicator: 'left-border',
        spacing: 'small',
        size: 'medium',
        fill_style: 'none',
        radius: 'none'
    },

    /**
     * Vertical tabs on right side.
     */
    'vertical-right': {
        tab_position: 'right',
        indicator: 'right-border',
        spacing: 'small',
        size: 'medium',
        fill_style: 'none',
        radius: 'none'
    },

    /**
     * Bottom tabs.
     */
    'bottom': {
        tab_position: 'bottom',
        indicator: 'underline',
        spacing: 'medium',
        size: 'medium',
        fill_style: 'none',
        radius: 'none'
    },

    /**
     * Icon tabs - tabs with icons only.
     */
    'icon': {
        tab_position: 'top',
        indicator: 'background',
        spacing: 'small',
        size: 'large',
        fill_style: 'none',
        radius: 'medium',
        icon_only: true
    },

    /**
     * Compact tabs - minimal space usage.
     */
    'compact': {
        tab_position: 'top',
        indicator: 'underline',
        spacing: 'small',
        size: 'small',
        fill_style: 'none',
        radius: 'none'
    }
};

/**
 * Menu control variants.
 */
const menu_variants = {
    /**
     * Default horizontal menu bar.
     */
    'default': {
        direction: 'horizontal',
        spacing: 'medium',
        indicator: 'none',
        size: 'medium',
        separator: false
    },

    /**
     * Vertical menu (sidebar style).
     */
    'vertical': {
        direction: 'vertical',
        spacing: 'small',
        indicator: 'left-border',
        size: 'medium',
        separator: false
    },

    /**
     * Compact menu with smaller items.
     */
    'compact': {
        direction: 'horizontal',
        spacing: 'small',
        indicator: 'none',
        size: 'small',
        separator: false
    },

    /**
     * Menu with separators between items.
     */
    'divided': {
        direction: 'horizontal',
        spacing: 'none',
        indicator: 'none',
        size: 'medium',
        separator: true
    },

    /**
     * Pill-style menu.
     */
    'pills': {
        direction: 'horizontal',
        spacing: 'small',
        indicator: 'background',
        size: 'medium',
        separator: false,
        radius: 'full'
    },

    /**
     * Icon menu (icons only).
     */
    'icon': {
        direction: 'horizontal',
        spacing: 'small',
        indicator: 'none',
        size: 'large',
        separator: false,
        icon_only: true
    }
};

/**
 * Dropdown Menu control variants.
 */
const dropdown_menu_variants = {
    /**
     * Default dropdown - standard appearance.
     */
    'default': {
        size: 'medium',
        fill_style: 'outline',
        radius: 'medium',
        icon: 'chevron'
    },

    /**
     * Compact dropdown - smaller size.
     */
    'compact': {
        size: 'small',
        fill_style: 'outline',
        radius: 'small',
        icon: 'chevron'
    },

    /**
     * Filled dropdown - solid background.
     */
    'filled': {
        size: 'medium',
        fill_style: 'filled',
        radius: 'medium',
        icon: 'chevron'
    },

    /**
     * Ghost dropdown - minimal styling.
     */
    'ghost': {
        size: 'medium',
        fill_style: 'transparent',
        radius: 'none',
        icon: 'chevron'
    },

    /**
     * Native-like dropdown.
     */
    'native': {
        size: 'medium',
        fill_style: 'outline',
        radius: 'small',
        icon: 'triangle'
    }
};

/**
 * Context Menu control variants.
 */
const context_menu_variants = {
    /**
     * Default context menu.
     */
    'default': {
        size: 'medium',
        shadow: 'medium',
        radius: 'small'
    },

    /**
     * Compact context menu - smaller items.
     */
    'compact': {
        size: 'small',
        shadow: 'small',
        radius: 'small'
    },

    /**
     * Dark context menu.
     */
    'dark': {
        size: 'medium',
        shadow: 'large',
        radius: 'small',
        theme: 'dark'
    }
};

/**
 * List control variants.
 */
const list_variants = {
    /**
     * Default list.
     */
    'default': {
        size: 'medium',
        spacing: 'medium',
        dividers: false
    },

    /**
     * Compact list - smaller items and spacing.
     */
    'compact': {
        size: 'small',
        spacing: 'small',
        dividers: false
    },

    /**
     * List with dividers between items.
     */
    'divided': {
        size: 'medium',
        spacing: 'none',
        dividers: true
    },

    /**
     * Large list items.
     */
    'large': {
        size: 'large',
        spacing: 'medium',
        dividers: false
    },

    /**
     * Card-style list items.
     */
    'cards': {
        size: 'medium',
        spacing: 'small',
        dividers: false,
        item_style: 'card'
    }
};

/**
 * Chart control variants.
 */
const chart_variants = {
    /**
     * Default chart - categorical colors with grid.
     */
    'default': {
        size: 'medium',
        palette: 'categorical',
        grid: true,
        legend: 'bottom',
        animation: true
    },

    /**
     * Minimal chart - clean, no grid.
     */
    'minimal': {
        size: 'medium',
        palette: 'monochrome',
        grid: false,
        legend: 'none',
        animation: false
    },

    /**
     * Colorful chart - vibrant colors.
     */
    'colorful': {
        size: 'medium',
        palette: 'vibrant',
        grid: true,
        legend: 'right',
        animation: true
    },

    /**
     * Dark chart - for dark themes.
     */
    'dark': {
        size: 'medium',
        palette: 'dark',
        grid: true,
        legend: 'bottom',
        animation: true
    },

    /**
     * Compact chart - smaller size.
     */
    'compact': {
        size: 'small',
        palette: 'categorical',
        grid: false,
        legend: 'none',
        animation: false
    },

    /**
     * Large chart - presentation size.
     */
    'presentation': {
        size: 'large',
        palette: 'categorical',
        grid: true,
        legend: 'bottom',
        animation: true
    }
};

/**
 * All variant registries keyed by control type (lowercase).
 */
const variants = {
    window: window_variants,
    button: button_variants,
    panel: panel_variants,
    input: input_variants,
    text_input: input_variants,
    tabbed_panel: tabbed_panel_variants,
    menu: menu_variants,
    horizontal_menu: menu_variants,
    dropdown_menu: dropdown_menu_variants,
    context_menu: context_menu_variants,
    list: list_variants,
    chart: chart_variants,
    bar_chart: chart_variants,
    line_chart: chart_variants,
    pie_chart: chart_variants,
    area_chart: chart_variants,
    scatter_chart: chart_variants
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
    panel_variants,
    input_variants,
    tabbed_panel_variants,
    menu_variants
};

