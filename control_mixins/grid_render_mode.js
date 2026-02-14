'use strict';

/**
 * Grid Render Mode Mixin
 * 
 * Mode selection mixin for grid/table controls. Manages switching
 * between 'standard' (full DOM) and 'virtual' (windowed) rendering.
 * 
 * Auto-detects best mode based on row count threshold unless
 * explicitly overridden.
 * 
 * Usage:
 *   const grid_render_mode = require('./grid_render_mode');
 *   grid_render_mode(ctrl, { mode: 'auto', threshold: 1000 });
 */

const grid_render_mode = (ctrl, options = {}) => {
    ctrl.__mx = ctrl.__mx || {};
    if (ctrl.__mx.grid_render_mode) return;
    ctrl.__mx.grid_render_mode = true;

    const explicit_mode = options.mode || 'auto'; // 'standard', 'virtual', 'auto'
    const threshold = options.threshold || 1000;

    ctrl._render_mode_config = {
        explicit: explicit_mode,
        threshold: threshold,
        active: 'standard' // will be resolved
    };

    /**
     * Resolve the effective render mode based on config and row count.
     */
    ctrl._resolve_render_mode = () => {
        const config = ctrl._render_mode_config;
        if (config.explicit === 'standard') return 'standard';
        if (config.explicit === 'virtual') return 'virtual';

        // Auto: choose based on row count
        const row_count = ctrl.rows ? ctrl.rows.length : 0;
        return row_count > config.threshold ? 'virtual' : 'standard';
    };

    /**
     * Get the current effective render mode.
     */
    ctrl.get_render_mode = () => {
        return ctrl._render_mode_config.active;
    };

    /**
     * Set render mode explicitly. Pass 'auto' to revert to threshold-based.
     */
    ctrl.set_render_mode = (mode) => {
        const prev = ctrl._render_mode_config.active;
        ctrl._render_mode_config.explicit = mode;
        ctrl._render_mode_config.active = ctrl._resolve_render_mode();

        if (prev !== ctrl._render_mode_config.active) {
            ctrl._on_render_mode_change(prev, ctrl._render_mode_config.active);
        }
    };

    /**
     * Called when render mode changes. Override or listen to customize.
     */
    ctrl._on_render_mode_change = (from_mode, to_mode) => {
        ctrl.raise('render_mode_change', { from: from_mode, to: to_mode });

        // Cleanup virtual styles if leaving virtual mode
        if (from_mode === 'virtual' && to_mode !== 'virtual') {
            const body = ctrl._ctrl_fields && ctrl._ctrl_fields.body;
            if (body && body.dom && body.dom.attributes) {
                // Remove virtual scrolling styles
                if (body.dom.attributes.style) delete body.dom.attributes.style;
                if (body.dom.attributes['data-render-mode']) delete body.dom.attributes['data-render-mode'];
            }
        }

        // Delegate rendering to the appropriate renderer
        if (to_mode === 'virtual' && ctrl._virtual_renderer) {
            ctrl._active_renderer = ctrl._virtual_renderer;
        } else {
            ctrl._active_renderer = ctrl._standard_renderer || null;
        }

        if (ctrl.render_table) ctrl.render_table();
    };

    /**
     * Update active mode (called when rows change to support auto-detection).
     */
    ctrl._update_render_mode = () => {
        const resolved = ctrl._resolve_render_mode();
        const prev = ctrl._render_mode_config.active;

        if (resolved !== prev) {
            ctrl._render_mode_config.active = resolved;
            ctrl._on_render_mode_change(prev, resolved);
        } else {
            ctrl._render_mode_config.active = resolved;
        }
    };

    // Resolve initial mode
    ctrl._render_mode_config.active = ctrl._resolve_render_mode();
};

module.exports = grid_render_mode;
