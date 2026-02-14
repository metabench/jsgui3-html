'use strict';

/**
 * Frozen Columns Mixin
 * 
 * Adds frozen (sticky) column support to a grid/table control.
 * Uses CSS position: sticky to lock columns in place during
 * horizontal scrolling.
 * 
 * Usage:
 *   const frozen_columns = require('./frozen_columns');
 *   frozen_columns(ctrl, { left: 2, right: 1 });
 */

const frozen_columns = (ctrl, options = {}) => {
    ctrl.__mx = ctrl.__mx || {};
    if (ctrl.__mx.frozen_columns) return;
    ctrl.__mx.frozen_columns = true;

    ctrl._frozen_config = {
        left: options.left || 0,
        right: options.right || 0
    };

    /**
     * Set frozen column counts.
     * @param {Object} config - { left: N, right: N }
     */
    ctrl.set_frozen_columns = (config) => {
        if (config.left !== undefined) ctrl._frozen_config.left = config.left;
        if (config.right !== undefined) ctrl._frozen_config.right = config.right;
        ctrl._apply_frozen_styles();
    };

    ctrl.get_frozen_columns = () => {
        return { ...ctrl._frozen_config };
    };

    /**
     * Apply sticky positioning to frozen columns.
     * Called after render_table() to update header and body cells.
     */
    ctrl._apply_frozen_styles = () => {
        const columns = ctrl.columns || [];
        const left_count = ctrl._frozen_config.left;
        const right_count = ctrl._frozen_config.right;

        if (left_count === 0 && right_count === 0) return;

        // Calculate cumulative widths for left offset stacking
        const col_widths = columns.map(col => col.width || 120);

        const apply_to_row = (row_ctrl) => {
            if (!row_ctrl || !row_ctrl.content || !row_ctrl.content._arr) return;
            const cells = row_ctrl.content._arr;

            // Left frozen
            let left_offset = 0;
            for (let i = 0; i < Math.min(left_count, cells.length); i++) {
                const cell = cells[i];
                const style_parts = [
                    `position: sticky`,
                    `left: ${left_offset}px`,
                    `z-index: 2`,
                    `background: inherit`
                ];
                if (cell.dom) {
                    cell.dom.attributes.style = style_parts.join('; ');
                    cell.add_class('data-table-frozen-left');
                }
                left_offset += col_widths[i];
            }

            // Right frozen
            let right_offset = 0;
            for (let i = cells.length - 1; i >= Math.max(0, cells.length - right_count); i--) {
                const cell = cells[i];
                const style_parts = [
                    `position: sticky`,
                    `right: ${right_offset}px`,
                    `z-index: 2`,
                    `background: inherit`
                ];
                if (cell.dom) {
                    cell.dom.attributes.style = style_parts.join('; ');
                    cell.add_class('data-table-frozen-right');
                }
                right_offset += col_widths[i];
            }
        };

        // Apply to header row
        const head_ctrl = ctrl._ctrl_fields && ctrl._ctrl_fields.head;
        if (head_ctrl && head_ctrl.content && head_ctrl.content._arr) {
            head_ctrl.content._arr.forEach(apply_to_row);
        }

        // Apply to body rows
        const body_ctrl = ctrl._ctrl_fields && ctrl._ctrl_fields.body;
        if (body_ctrl && body_ctrl.content && body_ctrl.content._arr) {
            body_ctrl.content._arr.forEach(apply_to_row);
        }
    };
};

module.exports = frozen_columns;
