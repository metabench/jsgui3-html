const jsgui = require('../html-core/html-core');

const { Control } = jsgui;

const ensure_dom_attributes = ctrl => {
    if (!ctrl || !ctrl.dom) return null;
    ctrl.dom.attributes = ctrl.dom.attributes || {};
    return ctrl.dom.attributes;
};

/**
 * Apply a role to a control.
 * @param {Control} ctrl - Control to update.
 * @param {string} role - Role name.
 * @param {Object} [options] - Optional settings.
 */
const apply_role = (ctrl, role, options = {}) => {
    if (!ctrl || !role) return;
    const attributes = ensure_dom_attributes(ctrl);
    if (!attributes) return;
    if (!attributes.role || options.force) {
        attributes.role = role;
    }
};

/**
 * Apply an aria-label to a control.
 * @param {Control} ctrl - Control to update.
 * @param {string} label_text - Label text.
 * @param {Object} [options] - Optional settings.
 */
const apply_label = (ctrl, label_text, options = {}) => {
    if (!ctrl || label_text === undefined || label_text === null) return;
    const attributes = ensure_dom_attributes(ctrl);
    if (!attributes) return;
    if (!attributes['aria-label'] || options.force) {
        attributes['aria-label'] = String(label_text);
    }
};

/**
 * Apply focus ring styling and optional tabindex.
 * @param {Control} ctrl - Control to update.
 * @param {Object} [options] - Optional settings.
 */
const apply_focus_ring = (ctrl, options = {}) => {
    if (!ctrl || !ctrl.add_class) return;
    ctrl.add_class('focus-ring');
    if (options.include_tabindex) {
        const attributes = ensure_dom_attributes(ctrl);
        if (attributes && attributes.tabindex === undefined) {
            attributes.tabindex = '0';
        }
    }
};

const has_sr_only_text = ctrl => {
    if (!ctrl || !ctrl.content || typeof ctrl.content.each !== 'function') return false;
    let has_sr_only = false;
    ctrl.content.each(child => {
        if (child && child.has_class && child.has_class('sr-only')) {
            has_sr_only = true;
        }
    });
    return has_sr_only;
};

/**
 * Ensure icon-only controls have screen reader text.
 * @param {Control} ctrl - Control to update.
 * @param {string} sr_text - Screen reader text.
 * @param {Object} [options] - Optional settings.
 */
const ensure_sr_text = (ctrl, sr_text, options = {}) => {
    if (!ctrl || sr_text === undefined || sr_text === null) return;
    const text_value = String(sr_text);
    apply_label(ctrl, text_value, options);
    if (options.add_sr_only === false) return;
    if (has_sr_only_text(ctrl)) return;
    const sr_span = new Control({
        context: ctrl.context,
        tag_name: 'span'
    });
    sr_span.add_class('sr-only');
    sr_span.add(text_value);
    ctrl.add(sr_span);
};

module.exports = {
    apply_role,
    apply_label,
    apply_focus_ring,
    ensure_sr_text
};
