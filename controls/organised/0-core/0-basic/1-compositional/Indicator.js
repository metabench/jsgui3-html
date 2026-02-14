const jsgui = require('../../../../../html-core/html-core');
const {
    Control,
    parse_mount,
    parse,
    field
} = jsgui;

// Nice to make this flexible - make use of resources, svg, jsgui3-gfx....
//   Would be better to have this make use of other (lower level) functionality and to provide a nice API here.

// Would be nice to have low and medium level image features available to various controls, will be easy to put icons where they need to be
//   though this Icon control should make it easier in some ways.

class Indicator extends Control {

    constructor(spec) {
        spec.__type_name = spec.__type_name || 'indicator';
        super(spec);
        const {
            context
        } = this;
        this.add_class('indicator');

        if (!spec.el) {
            // Determine status and color
            const status = spec.status || spec.value || 'default';
            const color = spec.color || Indicator.STATUS_COLORS[status] || Indicator.STATUS_COLORS['default'];
            const size = spec.size || 12;
            const label_text = spec.label || spec.text;

            // Create the dot
            const dot = new Control({ context });
            dot.dom.tagName = 'span';
            dot.add_class('indicator-dot');
            dot.dom.attributes.style = [
                'display:inline-block',
                'width:' + size + 'px',
                'height:' + size + 'px',
                'border-radius:50%',
                'background:' + color,
                'vertical-align:middle'
            ].join(';');
            this.add(dot);
            this._dot = dot;

            // Optional label
            if (label_text) {
                const label = new Control({ context });
                label.dom.tagName = 'span';
                label.add_class('indicator-label');
                label.dom.attributes.style = 'margin-left:6px;vertical-align:middle';
                label.add(label_text);
                this.add(label);
                this._label = label;
            }

            this._status = status;
        }
    }

    /**
     * Set the indicator status.
     * @param {string} status - One of 'success', 'warning', 'error', 'info', 'default'
     */
    set_status(status) {
        this._status = status;
        const color = Indicator.STATUS_COLORS[status] || Indicator.STATUS_COLORS['default'];
        if (this._dot && this._dot.dom && this._dot.dom.el) {
            this._dot.dom.el.style.background = color;
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
        }
    }
}

Indicator.STATUS_COLORS = {
    'success': '#22c55e',
    'warning': '#f59e0b',
    'error': '#ef4444',
    'info': '#3b82f6',
    'default': '#9ca3af'
};

module.exports = Indicator;