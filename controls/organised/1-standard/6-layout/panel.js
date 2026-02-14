/**
 * Panel Control
 * 
 * A container control with theme support for padding, shadow, border, and styling.
 * 
 * Supports variants: default, card, elevated, flush, well, glass, outline, hero
 * Supports padding: none, small, medium, large, xlarge
 * Supports shadow: none, small, medium, large, inset
 * Supports radius: none, small, medium, large, full
 */

var jsgui = require('./../../../../html-core/html-core');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, def = jsgui.is_defined;
var Control = jsgui.Control;
const { resizable } = require('../../../../control_mixins/mx');
const { themeable } = require('../../../../control_mixins/themeable');
const { apply_token_map } = require('../../../../themes/token_maps');

const parse_px = value => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};

const get_parent_size = ctrl => {
    const parent = ctrl && ctrl.parent;
    if (!parent) return [0, 0];
    if (Array.isArray(parent.size) && parent.size.length === 2) {
        return parent.size;
    }
    const style = parent.dom && parent.dom.attributes && parent.dom.attributes.style;
    if (style) {
        const width = parse_px(style.width);
        const height = parse_px(style.height);
        if (width || height) return [width, height];
    }
    if (parent.dom && parent.dom.el && typeof parent.dom.el.getBoundingClientRect === 'function') {
        const rect = parent.dom.el.getBoundingClientRect();
        return [rect.width, rect.height];
    }
    return [0, 0];
};

class Panel extends Control {
    /**
     * Create a new Panel.
     * 
     * @param {Object} spec - Panel specification
     * @param {string} [spec.name] - Panel name/identifier
     * @param {string} [spec.title] - Panel title (creates header)
     * @param {string} [spec.variant] - Variant preset: default, card, elevated, flush, well, glass, outline, hero
     * @param {Object} [spec.params] - Theme params
     * @param {string} [spec.params.padding] - Padding: none, small, medium, large, xlarge
     * @param {string} [spec.params.shadow] - Shadow: none, small, medium, large, inset
     * @param {string} [spec.params.radius] - Border radius: none, small, medium, large, full
     * @param {boolean} [spec.params.border] - Whether to show border
     * @param {boolean} [spec.params.header] - Whether to show header (if title provided)
     * @param {boolean} [spec.params.collapsible] - Whether panel can be collapsed
     * @param {*} [spec.content] - Initial content to add
     * @param {boolean} [spec.resizable] - Whether panel is resizable
     * @param {Array} [spec.min_size] - Minimum size [width, height]
     * @param {Array} [spec.max_size] - Maximum size [width, height]
     */
    constructor(spec, add, make) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'panel';
        super(spec);
        this.add_class('panel');
        this.add_class('jsgui-panel');

        // Apply themeable - resolves params and applies hooks
        const params = themeable(this, 'panel', spec);

        // Set variant and padding as data attributes for CSS targeting
        if (params.variant || spec.variant) {
            this.dom.attributes['data-variant'] = params.variant || spec.variant;
        }
        if (params.padding) {
            this.dom.attributes['data-padding'] = params.padding;
        }

        // Apply token mappings (padding, shadow, radius)
        apply_token_map(this, 'panel', params);

        // Apply border class if specified
        if (params.border) {
            this.add_class('bordered');
        }

        this.resizable_enabled = !!spec.resizable;
        this.min_size = spec.min_size || null;
        this.max_size = spec.max_size || null;
        this.resize_bounds = spec.resize_bounds || spec.extent_bounds || null;
        this.pending_dock_edge = spec.dock || spec.docked || null;
        this._collapsible = params.collapsible || false;
        this._collapsed = false;

        // ARIA: region role with label from title
        this.dom.attributes.role = 'region';

        if (def(spec.name)) {
            this.name = spec.name;
        }

        if (def(spec.title)) {
            this.title = spec.title;
            this.dom.attributes['aria-label'] = spec.title;
        }

        // Hoverable interaction mode
        if (spec.hoverable || params.hoverable) {
            this.add_class('hoverable');
        }

        if (!spec.abstract && !spec.el) {
            this._compose(params, spec);
        }
    }

    /**
     * Compose panel structure based on theme params.
     * @param {Object} params - Resolved theme params
     * @param {Object} spec - Original spec
     */
    _compose(params, spec) {
        const { context } = this;

        // Store name field
        let n = this.name;
        if (def(n)) {
            let f = this._fields = this._fields || {};
            f.name = n;
        }

        // Create header if title is set and header param allows it
        const show_header = params.header !== false && def(this.title);
        if (show_header) {
            const header = new Control({
                context,
                class: 'panel-header jsgui-panel-header'
            });

            const title_ctrl = new Control({
                context,
                class: 'panel-title jsgui-panel-title'
            });
            title_ctrl.add(this.title);
            header.add(title_ctrl);

            // Add collapse toggle if collapsible
            if (this._collapsible) {
                const toggle = new Control({
                    context,
                    tag_name: 'button',
                    class: 'panel-collapse-toggle'
                });
                toggle.add('▼');
                header.add(toggle);
            }

            this.add(header);
            this._ctrl_fields = this._ctrl_fields || {};
            this._ctrl_fields.header = header;
            this._ctrl_fields.title = title_ctrl;
        }

        // Create content container
        const content_container = new Control({
            context,
            class: 'panel-content jsgui-panel-content'
        });
        this.add(content_container);
        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.content_container = content_container;
        this.content_container = content_container;

        // Add initial content
        if (def(spec.content)) {
            content_container.add(spec.content);
        }
    }

    /**
     * Add content to the panel.
     * If a content container exists, adds to it instead of directly.
     * @param {*} content - Content to add
     */
    add_content(content) {
        if (this.content_container) {
            this.content_container.add(content);
        } else {
            this.add(content);
        }
    }

    /**
     * Add a footer to the panel.
     * @param {*} content - Content to add to the footer
     * @returns {Control} The footer control
     */
    add_footer(content) {
        if (!this._ctrl_fields || !this._ctrl_fields.footer) {
            const { context } = this;
            const footer = new Control({
                context,
                class: 'panel-footer jsgui-panel-footer'
            });
            this.add(footer);
            this._ctrl_fields = this._ctrl_fields || {};
            this._ctrl_fields.footer = footer;
        }
        if (content) {
            this._ctrl_fields.footer.add(content);
        }
        return this._ctrl_fields.footer;
    }

    /**
     * Toggle collapsed state.
     */
    toggle_collapsed() {
        this._collapsed = !this._collapsed;
        if (this._collapsed) {
            this.add_class('collapsed');
        } else {
            this.remove_class('collapsed');
        }
    }

    /**
     * Set collapsed state.
     * @param {boolean} collapsed - Whether panel should be collapsed
     */
    set_collapsed(collapsed) {
        this._collapsed = !!collapsed;
        if (this._collapsed) {
            this.add_class('collapsed');
        } else {
            this.remove_class('collapsed');
        }
    }

    /**
     * Dock the panel to a parent edge.
     * @param {string} edge - Dock edge: left, right, top, bottom
     * @param {Object} [options] - Optional settings
     * @param {Array} [options.size] - Override size [width, height]
     */
    dock_to(edge, options = {}) {
        const parent_size = get_parent_size(this);
        const [parent_width, parent_height] = parent_size;
        if (!parent_width || !parent_height) return;
        const dock_edge = edge || 'left';
        if (!this._pre_dock_state) {
            this._pre_dock_state = {
                pos: this.pos,
                size: this.size
            };
        }
        let next_pos = [0, 0];
        let next_size = [parent_width, parent_height];
        if (dock_edge === 'left') {
            next_size = options.size || [Math.round(parent_width / 2), parent_height];
            next_pos = [0, 0];
        } else if (dock_edge === 'right') {
            next_size = options.size || [Math.round(parent_width / 2), parent_height];
            next_pos = [parent_width - next_size[0], 0];
        } else if (dock_edge === 'top') {
            next_size = options.size || [parent_width, Math.round(parent_height / 2)];
            next_pos = [0, 0];
        } else if (dock_edge === 'bottom') {
            next_size = options.size || [parent_width, Math.round(parent_height / 2)];
            next_pos = [0, parent_height - next_size[1]];
        }
        this.dom.attributes.style.position = 'absolute';
        this.pos = next_pos;
        this.size = next_size;
        this.docked_edge = dock_edge;
    }

    /**
     * Undock the panel and restore previous size/position.
     */
    undock() {
        if (!this._pre_dock_state) return;
        if (this._pre_dock_state.pos) this.pos = this._pre_dock_state.pos;
        if (this._pre_dock_state.size) this.size = this._pre_dock_state.size;
        this._pre_dock_state = null;
        this.docked_edge = null;
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (this.resizable_enabled) {
                resizable(this, {
                    resize_mode: 'br_handle',
                    bounds: [this.min_size, this.max_size],
                    extent_bounds: this.resize_bounds || this.parent
                });
            }
            if (this.pending_dock_edge) {
                this.dock_to(this.pending_dock_edge);
                this.pending_dock_edge = null;
            }

            // Wire up collapse toggle if present
            if (this._collapsible && this._ctrl_fields && this._ctrl_fields.header) {
                const toggle = this._ctrl_fields.header.dom?.el?.querySelector('.panel-collapse-toggle');
                if (toggle) {
                    toggle.addEventListener('click', () => this.toggle_collapsed());
                }
            }
        }
    }
}

module.exports = Panel;
