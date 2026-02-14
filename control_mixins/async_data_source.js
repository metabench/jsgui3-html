'use strict';

/**
 * Async Data Source Mixin
 * 
 * Adds server-side paging/sorting/filtering support to a grid/table control.
 * Manages loading states and skeleton row rendering.
 * 
 * Usage:
 *   const async_data_source = require('./async_data_source');
 *   async_data_source(ctrl, {
 *       data_source: async (params) => {
 *           const res = await fetch(`/api/data?page=${params.page}`);
 *           return res.json(); // { rows: [...], total: 1000 }
 *       }
 *   });
 */

const async_data_source = (ctrl, options = {}) => {
    ctrl.__mx = ctrl.__mx || {};
    if (ctrl.__mx.async_data_source) return;
    ctrl.__mx.async_data_source = true;

    ctrl._data_source = options.data_source || null;
    ctrl._loading = false;
    ctrl._total_rows = 0;
    ctrl._load_id = 0; // Track latest request to handle race conditions

    /**
     * Set the data source function.
     * @param {Function} fn - (params) => Promise<{ rows, total }>
     */
    ctrl.set_data_source = (fn) => {
        ctrl._data_source = fn;
    };

    /**
     * Check if the control is in a loading state.
     */
    ctrl.is_loading = () => ctrl._loading;

    /**
     * Get the total row count from the last data load.
     */
    ctrl.get_total_rows = () => ctrl._total_rows;

    /**
     * Load data from the async data source.
     * Builds params from current sort/filter/page state.
     * @param {Object} extra_params - additional params to merge
     */
    ctrl.load_data = async (extra_params = {}) => {
        if (!ctrl._data_source) return;

        const load_id = ++ctrl._load_id;

        // Build params from control state
        const params = {
            page: ctrl.page || 1,
            page_size: ctrl.page_size || 50,
            sort_state: ctrl.sort_state || null,
            filters: ctrl.filters || null,
            ...extra_params
        };

        ctrl._set_loading(true);

        try {
            const result = await ctrl._data_source(params);

            // Ignore stale responses
            if (load_id !== ctrl._load_id) return;

            if (result && Array.isArray(result.rows)) {
                ctrl._total_rows = result.total || result.rows.length;
                ctrl.rows = result.rows;
                ctrl.visible_rows = result.rows;
                if (ctrl.render_table) ctrl.render_table();
                ctrl.raise('data_loaded', {
                    rows: result.rows,
                    total: ctrl._total_rows,
                    params: params
                });
            }
        } catch (err) {
            if (load_id !== ctrl._load_id) return;
            ctrl.raise('data_error', { error: err, params: params });
        } finally {
            if (load_id === ctrl._load_id) {
                ctrl._set_loading(false);
            }
        }
    };

    /**
     * Set loading state and update UI.
     */
    ctrl._set_loading = (is_loading) => {
        ctrl._loading = is_loading;

        if (is_loading) {
            ctrl.add_class('data-table-loading');
            ctrl._render_skeleton_rows();
        } else {
            ctrl.remove_class('data-table-loading');
        }
    };

    /**
     * Render skeleton placeholder rows during loading.
     */
    ctrl._render_skeleton_rows = () => {
        const body_ctrl = ctrl._ctrl_fields && ctrl._ctrl_fields.body;
        if (!body_ctrl) return;

        const jsgui = require('../html-core/html-core');
        const { Control } = jsgui;
        const columns = ctrl.columns || [];
        const skeleton_count = Math.min(ctrl.page_size || 10, 20);

        body_ctrl.clear();

        for (let i = 0; i < skeleton_count; i++) {
            const tr = new Control({ context: ctrl.context, tag_name: 'tr' });
            tr.add_class('data-table-row');
            tr.add_class('data-table-skeleton-row');

            columns.forEach(() => {
                const td = new Control({ context: ctrl.context, tag_name: 'td' });
                td.add_class('data-table-cell');

                const bar = new Control({ context: ctrl.context, tag_name: 'div' });
                bar.add_class('data-table-skeleton-bar');
                td.add(bar);

                tr.add(td);
            });

            body_ctrl.add(tr);
        }
    };
};

module.exports = async_data_source;
