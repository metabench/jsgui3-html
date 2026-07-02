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

/**
 * Apply grid semantics (role=grid + label) to a container control.
 * Callers are responsible for row/gridcell roles on descendants.
 * @param {Control} ctrl - Control to update.
 * @param {Object} [options] - {label, force}
 */
const apply_grid_aria = (ctrl, options = {}) => {
    apply_role(ctrl, 'grid', options);
    if (options.label) apply_label(ctrl, options.label, options);
};

/**
 * Apply spinbutton semantics to a control (e.g. a time component stepper).
 * @param {Control} ctrl - Control to update.
 * @param {Object} [options] - {label, min, max, now, force}
 */
const apply_spinbutton_aria = (ctrl, options = {}) => {
    apply_role(ctrl, 'spinbutton', options);
    if (options.label) apply_label(ctrl, options.label, options);
    const attributes = ensure_dom_attributes(ctrl);
    if (!attributes) return;
    if (options.min !== undefined && (attributes['aria-valuemin'] === undefined || options.force)) {
        attributes['aria-valuemin'] = String(options.min);
    }
    if (options.max !== undefined && (attributes['aria-valuemax'] === undefined || options.force)) {
        attributes['aria-valuemax'] = String(options.max);
    }
    if (options.now !== undefined && (attributes['aria-valuenow'] === undefined || options.force)) {
        attributes['aria-valuenow'] = String(options.now);
    }
};

/**
 * Update aria-valuenow/aria-valuetext at runtime (activated controls).
 * Falls back to VDOM attributes when no DOM element is connected.
 * @param {Control} ctrl - Control to update.
 * @param {number|string} now - Current value.
 * @param {string} [text] - Human-readable value text.
 */
const update_aria_now = (ctrl, now, text) => {
    if (!ctrl) return;
    const el = ctrl.dom && ctrl.dom.el;
    if (el && el.setAttribute) {
        el.setAttribute('aria-valuenow', String(now));
        if (text !== undefined) el.setAttribute('aria-valuetext', String(text));
    } else {
        const attributes = ensure_dom_attributes(ctrl);
        if (!attributes) return;
        attributes['aria-valuenow'] = String(now);
        if (text !== undefined) attributes['aria-valuetext'] = String(text);
    }
};

/**
 * Apply dialog semantics to a popup/overlay control.
 * @param {Control} ctrl - Control to update.
 * @param {Object} [options] - {label, modal, force}
 */
const apply_dialog_aria = (ctrl, options = {}) => {
    apply_role(ctrl, 'dialog', options);
    if (options.label) apply_label(ctrl, options.label, options);
    const attributes = ensure_dom_attributes(ctrl);
    if (attributes && (attributes['aria-modal'] === undefined || options.force)) {
        attributes['aria-modal'] = options.modal ? 'true' : 'false';
    }
};

module.exports = {
    apply_role,
    apply_label,
    apply_focus_ring,
    ensure_sr_text,
    apply_grid_aria,
    apply_spinbutton_aria,
    update_aria_now,
    apply_dialog_aria
};
