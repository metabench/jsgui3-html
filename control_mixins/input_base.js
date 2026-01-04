'use strict';

const jsgui = require('../html-core/html-core');
const { tof } = jsgui;
const { apply_focus_ring } = require('./a11y');

const resolve_input_element = (ctrl, options = {}) => {
    const option_el = options.input_el || ctrl._input_base_el;
    if (option_el) {
        if (option_el.dom && option_el.dom.el) return option_el.dom.el;
        return option_el;
    }
    const check_ctrl = ctrl._ctrl_fields && ctrl._ctrl_fields.check;
    if (check_ctrl && check_ctrl.dom && check_ctrl.dom.el) return check_ctrl.dom.el;
    return ctrl._native_el ||
        ctrl._native_input_el ||
        ctrl._native_check_el ||
        ctrl._native_radio_el ||
        (ctrl.dom ? ctrl.dom.el : null);
};

const normalize_value_mode = (ctrl, options = {}) => {
    if (options.value_mode) return options.value_mode;
    const el = resolve_input_element(ctrl, options);
    const type = el && el.type ? el.type : '';
    if (type === 'checkbox' || type === 'radio') return 'checked';
    return 'value';
};

const has_prop_descriptor = (ctrl, name) => {
    const own_descriptor = Object.getOwnPropertyDescriptor(ctrl, name);
    if (own_descriptor) return true;
    const proto = Object.getPrototypeOf(ctrl);
    if (!proto) return false;
    const proto_descriptor = Object.getOwnPropertyDescriptor(proto, name);
    return !!proto_descriptor;
};

const default_get_value = (ctrl, options = {}) => {
    const value_mode = normalize_value_mode(ctrl, options);
    const el = resolve_input_element(ctrl, options);
    if (value_mode === 'checked') {
        if (el) return !!el.checked;
        if (typeof ctrl.checked !== 'undefined') return !!ctrl.checked;
        return false;
    }

    if (el && typeof el.value !== 'undefined') return el.value;
    if (ctrl.dom && ctrl.dom.attributes && ctrl.dom.attributes.value !== undefined) {
        return ctrl.dom.attributes.value;
    }
    return ctrl._input_base_value;
};

const default_set_value = (ctrl, value, options = {}) => {
    const value_mode = normalize_value_mode(ctrl, options);
    const el = resolve_input_element(ctrl, options);
    ctrl._input_base_value = value;

    if (value_mode === 'checked') {
        const checked_value = !!value;
        if (typeof ctrl.set_checked === 'function') {
            ctrl.set_checked(checked_value);
            return;
        }
        if (el) {
            el.checked = checked_value;
            if (typeof el.setAttribute === 'function') {
                el.setAttribute('aria-checked', checked_value ? 'true' : 'false');
            }
        }
        ctrl.checked = checked_value;
        return;
    }

    if (has_prop_descriptor(ctrl, 'value') && !(ctrl.__mx && ctrl.__mx.input_base_value_property)) {
        ctrl.value = value;
        return;
    }

    const value_str = value === undefined || value === null ? '' : String(value);
    if (ctrl.dom && ctrl.dom.attributes) {
        ctrl.dom.attributes.value = value_str;
    }
    if (el && typeof el.value !== 'undefined') {
        el.value = value_str;
    }
};

const define_prop_if_missing = (ctrl, name, getter, setter) => {
    if (has_prop_descriptor(ctrl, name)) return;
    Object.defineProperty(ctrl, name, {
        configurable: true,
        enumerable: true,
        get: getter,
        set: setter
    });
};

/**
 * Apply base input behaviors to a control.
 * @param {Control} ctrl - Control to update.
 * @param {Object} [options] - Optional settings.
 */
const apply_input_base = (ctrl, options = {}) => {
    if (!ctrl) return;
    ctrl.__mx = ctrl.__mx || {};
    ctrl.__mx.input_base = true;

    const original_get_value = options.get_value || (typeof ctrl.get_value === 'function'
        ? ctrl.get_value.bind(ctrl)
        : () => default_get_value(ctrl, options));
    const original_set_value = options.set_value || (typeof ctrl.set_value === 'function'
        ? ctrl.set_value.bind(ctrl)
        : value => default_set_value(ctrl, value, options));

    const get_value = () => original_get_value();
    const set_value = value => {
        const old_value = get_value();
        ctrl._input_base_setting = true;
        original_set_value(value);
        ctrl._input_base_setting = false;
        const next_value = get_value();
        ctrl._input_base_value = next_value;
        if (next_value !== old_value) {
            ctrl.raise('value_change', {
                value: next_value,
                old_value
            });
        }
    };

    if (typeof ctrl.get_value !== 'function') {
        ctrl.get_value = get_value;
    }
    if (typeof ctrl.set_value !== 'function' || options.wrap_set_value !== false) {
        ctrl.set_value = set_value;
    }

    // Only define a value property if the control doesn't have its own get_value.
    // Controls with their own get_value() that accesses this.value would cause
    // infinite recursion if we also define a value property getter that calls get_value().
    const ctrl_has_own_get_value = options.get_value ||
        (typeof ctrl.get_value === 'function' && ctrl.get_value !== get_value);

    if (!ctrl_has_own_get_value) {
        const has_value_prop_before = has_prop_descriptor(ctrl, 'value');
        define_prop_if_missing(ctrl, 'value', () => get_value(), value => {
            if (ctrl._input_base_setting) {
                ctrl._input_base_value = value;
                return;
            }
            set_value(value);
        });
        if (!has_value_prop_before) {
            ctrl.__mx.input_base_value_property = true;
        }
    }

    const set_flag = (name, value) => {
        const value_bool = !!value;
        ctrl[name] = value_bool;
        if (ctrl.dom && ctrl.dom.attributes) {
            if (value_bool) {
                ctrl.dom.attributes[name] = name;
            } else {
                delete ctrl.dom.attributes[name];
            }
        }
        const el = resolve_input_element(ctrl, options);
        if (el) {
            el[name] = value_bool;
            if (typeof el.setAttribute === 'function') {
                if (value_bool) {
                    el.setAttribute(name, name);
                } else {
                    el.removeAttribute(name);
                }
            }
        }
    };

    if (options.disabled !== undefined) set_flag('disabled', options.disabled);
    if (options.readonly !== undefined) set_flag('readonly', options.readonly);
    if (options.required !== undefined) set_flag('required', options.required);

    define_prop_if_missing(ctrl, 'disabled', () => !!ctrl.disabled, value => set_flag('disabled', value));
    define_prop_if_missing(ctrl, 'readonly', () => !!ctrl.readonly, value => set_flag('readonly', value));
    define_prop_if_missing(ctrl, 'required', () => !!ctrl.required, value => set_flag('required', value));

    if (typeof ctrl.focus !== 'function') {
        ctrl.focus = () => {
            const el = resolve_input_element(ctrl, options);
            if (el && typeof el.focus === 'function') el.focus();
        };
    }
    if (typeof ctrl.blur !== 'function') {
        ctrl.blur = () => {
            const el = resolve_input_element(ctrl, options);
            if (el && typeof el.blur === 'function') el.blur();
        };
    }
    if (typeof ctrl.select !== 'function') {
        ctrl.select = () => {
            const el = resolve_input_element(ctrl, options);
            if (el && typeof el.select === 'function') el.select();
        };
    }

    ctrl._get_input_element = ctrl._get_input_element || (() => resolve_input_element(ctrl, options));

    const attach_dom_listeners = () => {
        const el = ctrl._get_input_element();
        if (!el || typeof ctrl.add_dom_event_listener !== 'function') return;

        const sync_value = event_name => {
            if (ctrl._input_base_setting) return;
            const next_value = get_value();
            if (next_value !== ctrl._input_base_value) {
                ctrl._input_base_value = next_value;
            }
            ctrl.raise(event_name, {
                name: 'value',
                value: next_value
            });
        };

        ctrl.add_dom_event_listener('input', () => sync_value('input'));
        ctrl.add_dom_event_listener('change', () => sync_value('change'));
        ctrl.add_dom_event_listener('focus', () => {
            ctrl.raise('focus', {});
        });
        ctrl.add_dom_event_listener('blur', () => {
            ctrl.raise('blur', {});
        });

        if (options.apply_focus_ring) {
            apply_focus_ring(ctrl, options.focus_ring_options || {});
        }
    };

    if (options.wire_dom_events !== false) {
        if (ctrl.__active) {
            attach_dom_listeners();
        } else if (typeof ctrl.once_active === 'function') {
            ctrl.once_active(attach_dom_listeners);
        } else if (typeof ctrl.on === 'function') {
            ctrl.on('activate', attach_dom_listeners);
        }
    }

    if (ctrl._input_base_value === undefined) {
        ctrl._input_base_value = get_value();
    }
};

module.exports = {
    apply_input_base
};
