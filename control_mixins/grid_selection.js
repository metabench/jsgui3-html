'use strict';

/**
 * Grid Selection Mixin
 * 
 * Adds row selection capabilities to a grid/table control.
 * Supports single, multiple, and range selection modes.
 * 
 * Provides: select_row, deselect_row, toggle_row, select_all,
 *           deselect_all, get_selected_rows, refresh_row_selection,
 *           _handle_selection_click
 * 
 * Usage:
 *   const grid_selection = require('./grid_selection');
 *   grid_selection(ctrl, { mode: 'multiple' });
 */

const grid_selection = (ctrl, options = {}) => {
    ctrl.__mx = ctrl.__mx || {};
    if (ctrl.__mx.grid_selection) return; // already applied
    ctrl.__mx.grid_selection = true;

    const mode = options.mode || 'none';

    ctrl.selection_mode = mode;
    ctrl.selected_rows = new Set();
    ctrl.last_selected_index = null;
    ctrl._selection_anchor = null;

    // Apply ARIA + CSS based on mode
    if (mode !== 'none') {
        ctrl.add_class('selection-enabled');
        if (mode === 'multiple') {
            ctrl.dom.attributes['aria-multiselectable'] = 'true';
        }
    }

    /**
     * Change selection mode at runtime.
     */
    ctrl.set_selection_mode = (new_mode) => {
        ctrl.selection_mode = new_mode;

        // CSS class
        if (new_mode !== 'none') {
            ctrl.add_class('selection-enabled');
        } else {
            ctrl.remove_class('selection-enabled');
            ctrl.selected_rows.clear();
            if (ctrl.render_table) ctrl.render_table();
        }

        // ARIA
        if (new_mode === 'multiple') {
            ctrl.dom.attributes['aria-multiselectable'] = 'true';
        } else {
            delete ctrl.dom.attributes['aria-multiselectable'];
        }

        // Downsize selection for single mode
        if (new_mode === 'single' && ctrl.selected_rows.size > 1) {
            const last = Array.from(ctrl.selected_rows).pop();
            ctrl.selected_rows.clear();
            ctrl.selected_rows.add(last);
            if (ctrl.render_table) ctrl.render_table();
        }
    };

    ctrl.select_row = (row_index) => {
        if (ctrl.selection_mode === 'none') return;
        const str_index = String(row_index);

        if (ctrl.selection_mode === 'single') {
            ctrl.selected_rows.clear();
            ctrl.selected_rows.add(str_index);
        } else {
            ctrl.selected_rows.add(str_index);
        }
        ctrl.last_selected_index = Number(row_index);
        ctrl.refresh_row_selection(row_index);
        ctrl.raise('selection_change', { selected: ctrl.get_selected_rows() });
    };

    ctrl.deselect_row = (row_index) => {
        const str_index = String(row_index);
        if (ctrl.selected_rows.has(str_index)) {
            ctrl.selected_rows.delete(str_index);
            ctrl.refresh_row_selection(row_index);
            ctrl.raise('selection_change', { selected: ctrl.get_selected_rows() });
        }
    };

    ctrl.toggle_row = (row_index) => {
        const str_index = String(row_index);
        if (ctrl.selected_rows.has(str_index)) {
            ctrl.deselect_row(row_index);
        } else {
            ctrl.select_row(row_index);
        }
    };

    ctrl.select_all = () => {
        if (ctrl.selection_mode !== 'multiple') return;
        if (!ctrl.visible_rows) return;
        ctrl.visible_rows.forEach((_, idx) => ctrl.selected_rows.add(String(idx)));
        if (ctrl.render_table) ctrl.render_table();
        ctrl.raise('selection_change', { selected: ctrl.get_selected_rows() });
    };

    ctrl.deselect_all = () => {
        if (ctrl.selected_rows.size > 0) {
            ctrl.selected_rows.clear();
            if (ctrl.render_table) ctrl.render_table();
            ctrl.raise('selection_change', { selected: [] });
        }
    };

    ctrl.get_selected_rows = () => {
        return Array.from(ctrl.selected_rows).map(Number).sort((a, b) => a - b);
    };

    ctrl.refresh_row_selection = (row_index) => {
        const body_ctrl = ctrl._ctrl_fields && ctrl._ctrl_fields.body;
        // In virtual mode, row_index does not match content index
        // We must find the control with the matching data-row-index attribute
        let row_ctrl = null;
        if (body_ctrl.content && body_ctrl.content.find) {
            row_ctrl = body_ctrl.content.find(ctrl => {
                return ctrl.dom && ctrl.dom.attributes && String(ctrl.dom.attributes['data-row-index']) === String(row_index);
            });
        }

        // Fallback for standard mode (optimization): if no virtualization, direct access might be safe but data-row-index is safer
        if (!row_ctrl && body_ctrl.content._arr && body_ctrl.content._arr[row_index]) {
            const candidate = body_ctrl.content._arr[row_index];
            if (candidate.dom && candidate.dom.attributes && String(candidate.dom.attributes['data-row-index']) === String(row_index)) {
                row_ctrl = candidate;
            }
        }

        if (row_ctrl) {
            const is_selected = ctrl.selected_rows.has(String(row_index));

            if (is_selected) {
                row_ctrl.add_class('is-selected');
                if (row_ctrl.dom && row_ctrl.dom.attributes) {
                    row_ctrl.dom.attributes['aria-selected'] = 'true';
                }
            } else {
                row_ctrl.remove_class('is-selected');
                if (row_ctrl.dom && row_ctrl.dom.attributes) {
                    row_ctrl.dom.attributes['aria-selected'] = 'false';
                }
            }

            // Direct DOM update for speed if live
            if (row_ctrl.dom && row_ctrl.dom.el) {
                if (is_selected) {
                    row_ctrl.dom.el.classList.add('is-selected');
                    row_ctrl.dom.el.setAttribute('aria-selected', 'true');
                } else {
                    row_ctrl.dom.el.classList.remove('is-selected');
                    row_ctrl.dom.el.setAttribute('aria-selected', 'false');
                }
            }
        }
    };

    ctrl._handle_selection_click = (row_index, event) => {
        if (ctrl.selection_mode === 'none') return;

        // Update anchor on regular click
        if (!event.shiftKey) {
            ctrl._selection_anchor = row_index;
        }

        if (ctrl.selection_mode === 'single') {
            if (event.ctrlKey || event.metaKey) {
                ctrl.toggle_row(row_index);
            } else {
                ctrl.selected_rows.clear();
                ctrl.select_row(row_index);
                if (ctrl.render_table) ctrl.render_table();
            }
        } else if (ctrl.selection_mode === 'multiple') {
            if (event.shiftKey && ctrl.last_selected_index !== null) {
                const start = Math.min(ctrl.last_selected_index, row_index);
                const end = Math.max(ctrl.last_selected_index, row_index);

                if (!event.ctrlKey && !event.metaKey) {
                    ctrl.selected_rows.clear();
                }

                for (let i = start; i <= end; i++) {
                    ctrl.selected_rows.add(String(i));
                }
                if (ctrl.render_table) ctrl.render_table();
                ctrl.raise('selection_change', { selected: ctrl.get_selected_rows() });
            } else if (event.ctrlKey || event.metaKey) {
                ctrl.toggle_row(row_index);
                ctrl.last_selected_index = row_index;
            } else {
                ctrl.selected_rows.clear();
                ctrl.select_row(row_index);
                if (ctrl.render_table) ctrl.render_table();
            }
        }
    };
};

module.exports = grid_selection;
