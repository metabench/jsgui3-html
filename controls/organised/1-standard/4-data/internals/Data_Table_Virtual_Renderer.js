const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const apply_virtual_window = require('../../../../../control_mixins/virtual_window');

class Data_Table_Virtual_Renderer {
    constructor(facade, options = {}) {
        this.facade = facade;
        this.options = {
            row_height: options.row_height || 36,
            buffer: options.buffer || 5, // Extra rows above/below
            viewport_height: options.viewport_height || 400
        };

        // Initialize virtual window mixin state (math helper)
        this._vw_state = apply_virtual_window(facade, {
            total_rows: 0,
            row_height: this.options.row_height,
            buffer: this.options.buffer,
            viewport_height: this.options.viewport_height
        });

        // Track last scroll output to avoid redundant renders
        this._last_render_state = null;
    }

    /**
     * Setup the DOM structure for virtual scrolling.
     * We need a scroll container (tbody) with fixed height/overflow,
     * and a spacer inside to simulate total height.
     */
    compose(head_ctrl, body_ctrl) {
        this.body_ctrl = body_ctrl;
        this.head_ctrl = head_ctrl;

        // Ensure body is scrollable
        body_ctrl.dom.attributes.style = `display: block; overflow-y: auto; height: ${this.options.viewport_height}px; position: relative;`;

        // Ensure head and body rows align (since tbody is block)
        // This usually requires table-layout: fixed on both, handled in CSS
        body_ctrl.dom.attributes['data-render-mode'] = 'virtual';
    }

    /**
     * Main render function - called by Facade.render_table
     */
    render(all_rows, columns, create_row_ctrl) {
        if (!this.body_ctrl) return;

        const total_rows = all_rows.length;

        // Update virtual window state with new data size
        this._vw_state.total_rows = total_rows;
        this._vw_state.viewport_height = this.body_ctrl.dom.el ? this.body_ctrl.dom.el.clientHeight : this.options.viewport_height;

        // Calculate visible range based on current scroll position
        const scrollTop = this.body_ctrl.dom.el ? this.body_ctrl.dom.el.scrollTop : 0;
        const range = this.facade.get_virtual_window_range(scrollTop, this._vw_state.total_rows);

        this._render_range(range, all_rows, columns, create_row_ctrl);
    }

    attach_scroll_listener() {
        if (this.body_ctrl && this.body_ctrl.dom.el) {
            // Remove existing listener if any to prevent duplicates
            if (this._scroll_handler) {
                this.body_ctrl.dom.el.removeEventListener('scroll', this._scroll_handler);
            }

            this._scroll_handler = () => {
                // requestAnimationFrame for performance
                if (this._scroll_ticking) return;
                this._scroll_ticking = true;
                requestAnimationFrame(() => {
                    this._on_scroll();
                    this._scroll_ticking = false;
                });
            };

            this.body_ctrl.dom.el.addEventListener('scroll', this._scroll_handler);
        }
    }

    _on_scroll() {
        if (!this.body_ctrl || !this.body_ctrl.dom.el) return;

        const scrollTop = this.body_ctrl.dom.el.scrollTop;
        const range = this.facade.get_virtual_window_range(scrollTop, this._vw_state.total_rows);

        // Check if render is needed (range changed)
        if (!this._last_render_state ||
            range.start !== this._last_render_state.start ||
            range.end !== this._last_render_state.end) {

            // Need access to current data/columns/factory
            // Ideally these are stored or accessed via facade, but facade passes them to render()
            // We can store them on last render
            if (this._last_args) {
                this._render_range(range, this._last_args.all_rows, this._last_args.columns, this._last_args.create_row_ctrl);
            }
        }
    }

    _render_range(range, all_rows, columns, create_row_ctrl) {
        // Save args for re-render on scroll
        this._last_args = { all_rows, columns, create_row_ctrl };
        this._last_render_state = range;

        this.body_ctrl.clear();

        // 1. Top Spacer
        if (range.padding_top > 0) {
            const spacer_top = new Control({ context: this.facade.context, tag_name: 'tr' });
            spacer_top.add_class('data-table-virtual-spacer');
            spacer_top.dom.attributes.style = `height: ${range.padding_top}px`;
            // Spacer shouldn't have borders/etc
            this.body_ctrl.add(spacer_top);
        }

        // 2. Visible Rows
        const visible_data = all_rows.slice(range.start, range.end);
        visible_data.forEach((row_data, i) => {
            const abs_index = range.start + i;
            const row_ctrl = create_row_ctrl(row_data, abs_index, columns);
            this.body_ctrl.add(row_ctrl);
        });

        // 3. Bottom Spacer
        if (range.padding_bottom > 0) {
            const spacer_bottom = new Control({ context: this.facade.context, tag_name: 'tr' });
            spacer_bottom.add_class('data-table-virtual-spacer');
            spacer_bottom.dom.attributes.style = `height: ${range.padding_bottom}px`;
            this.body_ctrl.add(spacer_bottom);
        }

        // 4. Re-apply frozen columns (Fix for Phase 2 bug)
        if (this.facade && typeof this.facade._apply_frozen_styles === 'function') {
            this.facade._apply_frozen_styles();
        }
    }
}

module.exports = Data_Table_Virtual_Renderer;
