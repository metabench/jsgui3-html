const jsgui = require('../html-core/html-core');

const { is_defined } = jsgui;

const to_number = (value, fallback) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const clamp_non_negative = (value, fallback) => {
    const num = to_number(value, fallback);
    return num < 0 ? 0 : num;
};

/**
 * Apply virtual window helpers to a control.
 * @param {Control} ctrl - target control
 * @param {Object} spec - configuration
 * @returns {Object} virtual window state
 */
const apply_virtual_window = (ctrl, spec = {}) => {
    const state = {
        item_height: clamp_non_negative(spec.item_height, 32),
        viewport_height: clamp_non_negative(spec.height, 240),
        buffer: clamp_non_negative(spec.buffer, 3)
    };

    ctrl._virtual_window = state;

    ctrl.get_virtual_window_state = () => ({ ...state });

    ctrl.set_virtual_window_state = next_state => {
        if (!next_state || typeof next_state !== 'object') return;
        if (is_defined(next_state.item_height)) {
            state.item_height = clamp_non_negative(next_state.item_height, state.item_height);
        }
        if (is_defined(next_state.viewport_height) || is_defined(next_state.height)) {
            const next_height = is_defined(next_state.viewport_height)
                ? next_state.viewport_height
                : next_state.height;
            state.viewport_height = clamp_non_negative(next_height, state.viewport_height);
        }
        if (is_defined(next_state.buffer)) {
            state.buffer = clamp_non_negative(next_state.buffer, state.buffer);
        }
    };

    ctrl.get_virtual_window_range = (scroll_top, item_count, opts = {}) => {
        const item_height = clamp_non_negative(
            is_defined(opts.item_height) ? opts.item_height : state.item_height,
            state.item_height
        );
        const viewport_height = clamp_non_negative(
            is_defined(opts.viewport_height) ? opts.viewport_height : state.viewport_height,
            state.viewport_height
        );
        const buffer = clamp_non_negative(
            is_defined(opts.buffer) ? opts.buffer : state.buffer,
            state.buffer
        );
        const count = Math.max(0, Number(item_count) || 0);
        const safe_scroll = Math.max(0, Number(scroll_top) || 0);

        const start_index = Math.max(0, Math.floor(safe_scroll / item_height) - buffer);
        const visible_count = Math.ceil(viewport_height / item_height) + buffer * 2;
        const end_index = Math.min(count, start_index + visible_count);

        return {
            start_index,
            end_index,
            visible_count,
            item_height,
            viewport_height,
            buffer
        };
    };

    ctrl.get_virtual_total_height = (item_count, opts = {}) => {
        const row_height = clamp_non_negative(
            is_defined(opts.row_height) ? opts.row_height : state.item_height,
            state.item_height
        );
        const gap = clamp_non_negative(is_defined(opts.gap) ? opts.gap : 0, 0);
        const count = Math.max(0, Number(item_count) || 0);
        if (!count) return 0;
        const total = count * row_height - gap;
        return total < 0 ? 0 : total;
    };

    return state;
};

module.exports = apply_virtual_window;
