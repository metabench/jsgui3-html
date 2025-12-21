const jsgui = require('../../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

const get_status_class = status => status ? `badge-${status}` : '';

class Badge extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'badge';
        super(spec);
        this.add_class('badge');
        this.dom.tagName = 'span';

        this.status = is_defined(spec.status) ? String(spec.status) : '';
        if (this.status) {
            this.add_class(get_status_class(this.status));
        }

        this.text = is_defined(spec.text) ? String(spec.text) : (is_defined(spec.label) ? String(spec.label) : '');
        if (!spec.el && this.text) {
            this.add(this.text);
        }
    }

    /**
     * Set badge text.
     * @param {string} text - The text to set.
     */
    set_text(text) {
        this.text = is_defined(text) ? String(text) : '';
        this.clear();
        if (this.text) {
            this.add(this.text);
        }
    }

    /**
     * Get badge text.
     * @returns {string}
     */
    get_text() {
        return this.text || '';
    }

    /**
     * Set badge status.
     * @param {string} status - The status to set.
     */
    set_status(status) {
        if (this.status) {
            this.remove_class(get_status_class(this.status));
        }
        this.status = is_defined(status) ? String(status) : '';
        if (this.status) {
            this.add_class(get_status_class(this.status));
        }
    }
}

Badge.css = `
.badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75em;
    background: #eee;
    color: #333;
}
.badge-info {
    background: #e3f2fd;
    color: #0d47a1;
}
.badge-success {
    background: #e8f5e9;
    color: #1b5e20;
}
.badge-warn {
    background: #fff8e1;
    color: #ff6f00;
}
.badge-error {
    background: #ffebee;
    color: #b71c1c;
}
`;

module.exports = Badge;
