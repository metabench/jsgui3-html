const clamp_index = (value, max_index, options = {}) => {
    if (!Number.isFinite(value)) return 0;
    if (options.wrap && max_index >= 0) {
        const normalized = ((value % (max_index + 1)) + (max_index + 1)) % (max_index + 1);
        return normalized;
    }
    if (value < 0) return 0;
    if (value > max_index) return max_index;
    return value;
};

/**
 * Apply shared keyboard navigation behavior to a control.
 * @param {Control} ctrl - Control to enhance.
 * @param {Object} options - Navigation options.
 * @returns {Object} - Applied navigation state.
 */
const keyboard_navigation = (ctrl, options = {}) => {
    if (!ctrl) return null;

    const nav_state = ctrl._keyboard_nav_state || {};
    if (nav_state.applied) return nav_state;
    nav_state.applied = true;
    ctrl._keyboard_nav_state = nav_state;

    const get_items = typeof options.get_items === 'function'
        ? options.get_items
        : () => [];

    const get_active_index = () => {
        if (typeof options.get_active_index === 'function') {
            const idx = options.get_active_index();
            if (Number.isFinite(idx)) return idx;
        }
        return Number.isFinite(nav_state.active_index) ? nav_state.active_index : 0;
    };

    const apply_roving_tabindex = (items, active_index) => {
        if (!options.roving_tabindex) return;
        items.forEach((item, idx) => {
            if (!item || !item.dom) return;
            item.dom.attributes = item.dom.attributes || {};
            item.dom.attributes.tabindex = idx === active_index ? '0' : '-1';
        });
    };

    const focus_item = (items, active_index) => {
        if (!options.focus_item) return;
        const item = items[active_index];
        if (item && item.dom && item.dom.el && typeof item.dom.el.focus === 'function') {
            item.dom.el.focus();
        }
    };

    const set_active_index = (next_index, options_set = {}) => {
        const items = get_items();
        if (!items.length) return;
        const max_index = items.length - 1;
        const clamped = clamp_index(next_index, max_index, options);

        if (typeof options.set_active_index === 'function') {
            options.set_active_index(clamped, options_set);
        } else {
            nav_state.active_index = clamped;
        }

        apply_roving_tabindex(items, clamped);
        focus_item(items, clamped);
    };

    const move_active = delta => {
        const items = get_items();
        if (!items.length) return;
        const current = get_active_index();
        const next = clamp_index(current + delta, items.length - 1, options);
        set_active_index(next, { from_keyboard: true });
    };

    const handle_keydown = event => {
        if (!event || !event.key) return;
        const key = event.key;

        const use_vertical = options.orientation === 'vertical' || options.orientation === 'both';
        const use_horizontal = options.orientation === 'horizontal' || options.orientation === 'both';

        if (key === 'Home' && options.on_home) {
            event.preventDefault();
            options.on_home();
            return;
        }
        if (key === 'End' && options.on_end) {
            event.preventDefault();
            options.on_end();
            return;
        }

        if (key === 'ArrowUp' && use_vertical) {
            event.preventDefault();
            if (options.on_up) {
                options.on_up();
            } else {
                move_active(-1);
            }
            return;
        }
        if (key === 'ArrowDown' && use_vertical) {
            event.preventDefault();
            if (options.on_down) {
                options.on_down();
            } else {
                move_active(1);
            }
            return;
        }
        if (key === 'ArrowLeft' && use_horizontal) {
            event.preventDefault();
            if (options.on_left) {
                options.on_left();
            } else {
                move_active(-1);
            }
            return;
        }
        if (key === 'ArrowRight' && use_horizontal) {
            event.preventDefault();
            if (options.on_right) {
                options.on_right();
            } else {
                move_active(1);
            }
            return;
        }

        if ((key === 'Enter' || key === ' ') && options.on_activate) {
            event.preventDefault();
            options.on_activate();
        }
    };

    nav_state.handle_keydown = handle_keydown;

    if (ctrl.add_dom_event_listener) {
        ctrl.add_dom_event_listener('keydown', handle_keydown);
    } else if (ctrl.dom && ctrl.dom.el) {
        ctrl.dom.el.addEventListener('keydown', handle_keydown);
    }

    return nav_state;
};

module.exports = keyboard_navigation;
