'use strict';

/**
 * Column Resize Mixin
 * 
 * Adds draggable column resize handles to a grid/table control.
 * Self-contained — no dependencies on other mixins.
 * 
 * Expects the control to have:
 *   - columns array with objects (each gets a .width property on resize)
 *   - render_table() method (called with column widths)
 *   - DOM headers with class .data-table-resize-handle
 * 
 * Usage:
 *   const column_resize = require('./column_resize');
 *   column_resize(ctrl);
 */

const column_resize = (ctrl, options = {}) => {
    ctrl.__mx = ctrl.__mx || {};
    if (ctrl.__mx.column_resize) return;
    ctrl.__mx.column_resize = true;

    ctrl._resizing = null;
    ctrl._resize_move_handler = null;
    ctrl._resize_end_handler = null;

    /**
     * Start a column resize operation.
     * @param {MouseEvent} e - mousedown event on the resize handle
     * @param {Object} column - column spec object
     * @param {Object} th_ctrl - the header Control instance
     */
    ctrl._handle_resize_start = (e, column, th_ctrl) => {
        if (e.which !== 1) return; // Left click only
        e.preventDefault();
        e.stopPropagation(); // Prevent sort trigger

        ctrl._resizing = {
            startX: e.clientX,
            startWidth: th_ctrl.dom.el ? th_ctrl.dom.el.offsetWidth : (column.width || 100),
            column: column,
            th_ctrl: th_ctrl
        };

        ctrl.add_class('is-resizing');

        ctrl._resize_move_handler = ctrl._handle_resize_move.bind(ctrl);
        ctrl._resize_end_handler = ctrl._handle_resize_end.bind(ctrl);

        if (typeof document !== 'undefined') {
            document.addEventListener('mousemove', ctrl._resize_move_handler);
            document.addEventListener('mouseup', ctrl._resize_end_handler);
        }
    };

    /**
     * Handle mouse movement during resize.
     */
    ctrl._handle_resize_move = (e) => {
        if (!ctrl._resizing) return;

        const deltaX = e.clientX - ctrl._resizing.startX;
        const newWidth = Math.max(30, ctrl._resizing.startWidth + deltaX);

        // Update column model
        ctrl._resizing.column.width = newWidth;

        // Update DOM immediately
        if (ctrl._resizing.th_ctrl.dom.el) {
            ctrl._resizing.th_ctrl.dom.el.style.width = `${newWidth}px`;
        } else {
            ctrl._resizing.th_ctrl.dom.attributes.style = `width: ${newWidth}px`;
        }
    };

    /**
     * Finalize the resize operation.
     */
    ctrl._handle_resize_end = (e) => {
        if (!ctrl._resizing) return;

        const column = ctrl._resizing.column;
        const finalWidth = column.width;

        ctrl.remove_class('is-resizing');

        if (typeof document !== 'undefined') {
            document.removeEventListener('mousemove', ctrl._resize_move_handler);
            document.removeEventListener('mouseup', ctrl._resize_end_handler);
        }

        ctrl._resizing = null;
        ctrl._resize_move_handler = null;
        ctrl._resize_end_handler = null;

        ctrl.raise('column_resize', { column, width: finalWidth });
    };
};

module.exports = column_resize;
