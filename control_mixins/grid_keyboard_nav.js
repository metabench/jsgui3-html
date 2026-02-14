'use strict';

/**
 * Grid Keyboard Navigation Mixin
 * 
 * Adds keyboard-driven row navigation to a grid/table control.
 * Depends on: grid_selection (for select_row, toggle_row, etc.)
 * 
 * Handles: ArrowUp/Down, Space (toggle), Ctrl+A (select all)
 * 
 * Usage:
 *   const grid_keyboard_nav = require('./grid_keyboard_nav');
 *   grid_keyboard_nav(ctrl);
 */

const grid_keyboard_nav = (ctrl, options = {}) => {
    ctrl.__mx = ctrl.__mx || {};
    if (ctrl.__mx.grid_keyboard_nav) return;
    ctrl.__mx.grid_keyboard_nav = true;

    // Ensure grid_selection is applied
    if (!ctrl.__mx.grid_selection) {
        const grid_selection = require('./grid_selection');
        grid_selection(ctrl, { mode: ctrl.selection_mode || 'none' });
    }

    /**
     * Move selection by delta rows. Handles shift for range selection.
     */
    ctrl._move_selection = (delta, event) => {
        const visible_count = ctrl.visible_rows ? ctrl.visible_rows.length : 0;
        if (visible_count === 0) return;

        let current = ctrl.last_selected_index;
        if (current === null) {
            current = delta > 0 ? -1 : 0;
        }

        let next = current + delta;
        if (next < 0) next = 0;
        if (next >= visible_count) next = visible_count - 1;

        if (next === current && ctrl.selected_rows.size > 0 && ctrl.selection_mode === 'single') return;

        // Range selection with Shift
        if (ctrl.selection_mode === 'multiple' && event.shiftKey) {
            if (ctrl._selection_anchor === undefined || ctrl._selection_anchor === null) {
                ctrl._selection_anchor = current !== null ? current : next;
            }
            ctrl.selected_rows.clear();
            const start = Math.min(ctrl._selection_anchor, next);
            const end = Math.max(ctrl._selection_anchor, next);
            for (let i = start; i <= end; i++) ctrl.selected_rows.add(String(i));

            ctrl.last_selected_index = next;
            if (ctrl.render_table) ctrl.render_table();
            ctrl.raise('selection_change', { selected: ctrl.get_selected_rows() });
        } else {
            // Regular move
            ctrl.selected_rows.clear();
            ctrl.select_row(next);
            ctrl._selection_anchor = next;
            if (ctrl.render_table) ctrl.render_table();
        }

        // Scroll into view
        if (ctrl.dom && ctrl.dom.el) {
            const row_el = ctrl.dom.el.querySelector(`tr[data-row-index="${next}"]`);
            if (row_el) {
                row_el.scrollIntoView({ block: 'nearest' });
            }
        }
    };

    /**
     * Keydown handler for grid navigation.
     * Should be called from the control's activate() keydown listener.
     */
    ctrl._handle_grid_keydown = (e_key) => {
        if (ctrl.selection_mode === 'none') return false;

        const key = e_key.key;

        if (key === 'ArrowDown' || key === 'ArrowUp') {
            e_key.preventDefault();
            const delta = key === 'ArrowDown' ? 1 : -1;
            ctrl._move_selection(delta, e_key);
            return true;
        } else if ((key === 'a' || key === 'A') && (e_key.ctrlKey || e_key.metaKey)) {
            e_key.preventDefault();
            ctrl.select_all();
            return true;
        } else if (key === ' ') {
            e_key.preventDefault();
            if (ctrl.last_selected_index !== null) {
                ctrl.toggle_row(ctrl.last_selected_index);
            }
            return true;
        }

        return false;
    };
};

module.exports = grid_keyboard_nav;
