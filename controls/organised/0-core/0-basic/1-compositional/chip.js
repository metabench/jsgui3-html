const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const { is_defined } = jsgui;

/**
 * Chip — A compact element for tags, filters, or selections.
 * 
 * @param {Object} spec
 * @param {string} [spec.label] — Display text
 * @param {string} [spec.icon] — Optional leading icon (text/emoji)
 * @param {boolean} [spec.dismissible=false] — Show close button
 * @param {string} [spec.variant] — Visual variant: 'default'|'primary'|'success'|'warning'|'error'
 * @param {boolean} [spec.selected=false] — Selected/active state
 * @param {boolean} [spec.disabled=false] — Disabled state
 * 
 * Events:
 *   'dismiss' { chip } — Fired when close button is clicked
 *   'click'  { chip } — Fired when chip body is clicked
 */
class Chip extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'chip';
        // Capture before super() — base Control may consume these
        const chip_icon = spec.chip_icon || spec.icon || '';
        const chip_label = is_defined(spec.label) ? String(spec.label) : '';
        const chip_dismissible = !!spec.dismissible;
        const chip_variant = spec.variant || 'default';
        const chip_selected = !!spec.selected;
        const chip_disabled = !!spec.disabled;
        super(spec);
        this.add_class('chip');
        this.dom.tagName = 'span';

        // Config
        this._label = chip_label;
        this._icon = chip_icon;
        this._dismissible = chip_dismissible;
        this._variant = chip_variant;
        this._selected = chip_selected;
        this._disabled = chip_disabled;

        this.add_class(`chip-${this._variant}`);
        if (this._selected) this.add_class('selected');
        if (this._disabled) this.add_class('disabled');

        if (!spec.el) {
            this._compose_chip();
        }
    }

    // ---- Public API ----

    get label() { return this._label; }
    get icon() { return this._icon; }
    get dismissible() { return this._dismissible; }
    get variant() { return this._variant; }
    get is_selected() { return this._selected; }
    get is_disabled() { return this._disabled; }

    set_label(text) {
        this._label = is_defined(text) ? String(text) : '';
        if (this._label_ctrl) {
            this._label_ctrl.clear();
            if (this._label) this._label_ctrl.add(this._label);
        }
    }

    set_selected(v) {
        this._selected = !!v;
        if (this._selected) this.add_class('selected');
        else this.remove_class('selected');
    }

    set_disabled(v) {
        this._disabled = !!v;
        if (this._disabled) this.add_class('disabled');
        else this.remove_class('disabled');
    }

    set_variant(v) {
        this.remove_class(`chip-${this._variant}`);
        this._variant = v || 'default';
        this.add_class(`chip-${this._variant}`);
    }

    // ---- Internal ----

    _compose_chip() {
        const { context } = this;

        // Icon (optional)
        if (this._icon) {
            this._icon_ctrl = new Control({ context, tag_name: 'span' });
            this._icon_ctrl.add_class('chip-icon');
            this._icon_ctrl.add(this._icon);
            this.add(this._icon_ctrl);
        }

        // Label
        this._label_ctrl = new Control({ context, tag_name: 'span' });
        this._label_ctrl.add_class('chip-label');
        if (this._label) this._label_ctrl.add(this._label);
        this.add(this._label_ctrl);

        // Dismiss button (optional)
        if (this._dismissible) {
            this._close_ctrl = new Control({ context, tag_name: 'span' });
            this._close_ctrl.add_class('chip-close');
            this._close_ctrl.add('×');
            this.add(this._close_ctrl);
        }
    }

    activate() {
        if (this._activated) return;
        super.activate();
        this._activated = true;

        const el = this.dom.el;
        if (!el) return;

        el.addEventListener('click', (e) => {
            if (this._disabled) return;
            // If clicking the close button, dismiss
            if (this._close_ctrl && this._close_ctrl.dom.el &&
                (e.target === this._close_ctrl.dom.el || this._close_ctrl.dom.el.contains(e.target))) {
                this.raise('dismiss', { chip: this });
                return;
            }
            this.raise('click', { chip: this });
        });
    }
}

Chip.css = `
.chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 0.8125em;
    font-weight: 500;
    background: #f1f5f9;
    color: #334155;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    user-select: none;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
    line-height: 1.4;
}
.chip:hover { background: #e2e8f0; }
.chip.selected {
    background: #3b82f6;
    color: #fff;
    border-color: #2563eb;
}
.chip.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

/* Variants */
.chip.chip-primary { background: #dbeafe; color: #1e40af; border-color: #93c5fd; }
.chip.chip-primary:hover { background: #bfdbfe; }
.chip.chip-success { background: #dcfce7; color: #166534; border-color: #86efac; }
.chip.chip-success:hover { background: #bbf7d0; }
.chip.chip-warning { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
.chip.chip-warning:hover { background: #fde68a; }
.chip.chip-error { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
.chip.chip-error:hover { background: #fecaca; }

/* Icon */
.chip .chip-icon {
    font-size: 1em;
    line-height: 1;
}

/* Close button */
.chip .chip-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    font-size: 14px;
    line-height: 1;
    color: inherit;
    opacity: 0.6;
    cursor: pointer;
    transition: opacity 0.15s, background 0.15s;
}
.chip .chip-close:hover {
    opacity: 1;
    background: rgba(0,0,0,0.1);
}
`;

module.exports = Chip;
