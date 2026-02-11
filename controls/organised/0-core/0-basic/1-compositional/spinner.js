const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const { is_defined } = jsgui;

/**
 * Spinner — A CSS-animated loading indicator.
 * 
 * @param {Object} spec
 * @param {string} [spec.size='md'] — Size preset: 'sm' (16px), 'md' (32px), 'lg' (48px)
 * @param {string} [spec.color] — Accent color (CSS color string)
 * @param {string} [spec.label] — Optional text label (e.g. "Loading...")
 * @param {boolean} [spec.visible=true] — Initial visibility
 */
class Spinner extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'spinner';
        super(spec);
        this.add_class('spinner-control');

        // Config
        this._size = spec.size || 'md';
        this._color = spec.color || null;
        this._label_text = spec.label || '';
        this._visible = is_defined(spec.visible) ? !!spec.visible : true;

        this.add_class(`spinner-${this._size}`);

        if (!this._visible) {
            this.add_class('hidden');
        }

        if (!spec.el) {
            this._compose_spinner();
        }
    }

    // ---- Public API ----

    get spinner_size() { return this._size; }
    get label() { return this._label_text; }
    get visible() { return this._visible; }

    /** Show the spinner */
    show() {
        this._visible = true;
        this.remove_class('hidden');
    }

    /** Hide the spinner */
    hide() {
        this._visible = false;
        this.add_class('hidden');
    }

    /** Toggle visibility */
    toggle() {
        if (this._visible) this.hide();
        else this.show();
    }

    /** Update label text */
    set_label(text) {
        this._label_text = text || '';
        if (this._label_ctrl) {
            this._label_ctrl.clear();
            if (this._label_text) {
                this._label_ctrl.add(this._label_text);
                this._label_ctrl.remove_class('hidden');
            } else {
                this._label_ctrl.add_class('hidden');
            }
        }
    }

    // ---- Internal ----

    _compose_spinner() {
        const { context } = this;

        // Ring element (the spinning part)
        const ring = new Control({ context, tag_name: 'span' });
        ring.add_class('spinner-ring');

        // Apply custom color via inline style
        if (this._color) {
            ring.dom.attributes = ring.dom.attributes || {};
            ring.dom.attributes.style = `border-top-color: ${this._color}`;
        }

        this.add(ring);

        // Optional label
        this._label_ctrl = new Control({ context, tag_name: 'span' });
        this._label_ctrl.add_class('spinner-label');
        if (this._label_text) {
            this._label_ctrl.add(this._label_text);
        } else {
            this._label_ctrl.add_class('hidden');
        }
        this.add(this._label_ctrl);
    }
}

Spinner.css = `
.spinner-control {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
}
.spinner-control.hidden {
    display: none;
}

/* Ring */
.spinner-control .spinner-ring {
    display: block;
    border-radius: 50%;
    border: 3px solid #e5e7eb;
    border-top-color: #3b82f6;
    animation: jsgui-spin 0.8s linear infinite;
}

/* Size presets */
.spinner-control.spinner-sm .spinner-ring {
    width: 16px;
    height: 16px;
    border-width: 2px;
}
.spinner-control.spinner-md .spinner-ring {
    width: 32px;
    height: 32px;
    border-width: 3px;
}
.spinner-control.spinner-lg .spinner-ring {
    width: 48px;
    height: 48px;
    border-width: 4px;
}

/* Label */
.spinner-control .spinner-label {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
}
.spinner-control .spinner-label.hidden {
    display: none;
}

@keyframes jsgui-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;

module.exports = Spinner;
