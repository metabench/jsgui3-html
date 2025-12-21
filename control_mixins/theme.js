const is_plain_object = value => (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
);

const ensure_dom_style = ctrl => {
    if (!ctrl || !ctrl.dom) return null;
    ctrl.dom.attributes = ctrl.dom.attributes || {};
    ctrl.dom.attributes.style = ctrl.dom.attributes.style || {};
    return ctrl.dom.attributes.style;
};

const normalize_token_key = (token_key, options = {}) => {
    if (token_key === undefined || token_key === null) return null;
    const prefix = options.prefix || '--theme-';
    let key = String(token_key).trim();
    if (!key) return null;
    if (key.startsWith('--')) return key;
    const normalized = key.replace(/_/g, '-');
    const prefix_name = prefix.replace(/^--/, '');
    if (normalized.startsWith(prefix_name)) {
        return `--${normalized}`;
    }
    return `${prefix}${normalized}`;
};

/**
 * Apply CSS variable tokens to a control.
 * @param {Control} ctrl - Control to update.
 * @param {Object} tokens - Token map.
 * @param {Object} [options] - Optional settings.
 */
const apply_theme_tokens = (ctrl, tokens, options = {}) => {
    if (!ctrl || !tokens || !is_plain_object(tokens)) return;
    const style = ensure_dom_style(ctrl);
    if (!style) return;
    const prefix = options.prefix || '--theme-';
    Object.keys(tokens).forEach(token_key => {
        const css_var = normalize_token_key(token_key, {prefix});
        if (!css_var) return;
        const value = tokens[token_key];
        if (value === undefined || value === null) return;
        style[css_var] = String(value);
    });
};

/**
 * Apply a theme context to a control.
 * @param {Control} ctrl - Control to update.
 * @param {string|Object} theme - Theme name or token map.
 * @param {Object} [options] - Optional settings.
 */
const apply_theme = (ctrl, theme, options = {}) => {
    if (!ctrl || !theme) return;
    ctrl.dom.attributes = ctrl.dom.attributes || {};

    if (typeof theme === 'string') {
        ctrl.dom.attributes['data-theme'] = theme;
        return;
    }

    if (!is_plain_object(theme)) return;

    const theme_name = theme.name || theme.theme || theme.mode;
    if (theme_name) {
        ctrl.dom.attributes['data-theme'] = String(theme_name);
    }

    const tokens = theme.tokens || theme.variables || (
        theme_name || theme.overrides || theme.mode ? null : theme
    );
    if (tokens) {
        apply_theme_tokens(ctrl, tokens, options);
    }

    if (theme.overrides) {
        apply_theme_tokens(ctrl, theme.overrides, options);
    }
};

/**
 * Apply theme overrides to a control.
 * @param {Control} ctrl - Control to update.
 * @param {Object} overrides - Override token map.
 * @param {Object} [options] - Optional settings.
 */
const apply_theme_overrides = (ctrl, overrides, options = {}) => {
    apply_theme_tokens(ctrl, overrides, options);
};

module.exports = {
    apply_theme,
    apply_theme_overrides,
    apply_theme_tokens,
    normalize_token_key
};
