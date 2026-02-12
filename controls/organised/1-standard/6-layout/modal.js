const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;

/**
 * Modal — Dialog overlay with header, body, footer, and backdrop.
 *
 * @param {Object} spec
 * @param {string} [spec.title] — Modal title text
 * @param {string} [spec.size] — Size: sm, md (default), lg, xl, full
 * @param {boolean} [spec.closable=true] — Show close button
 * @param {boolean} [spec.close_on_overlay=true] — Close when clicking overlay
 *
 * Events:
 *   'open' — Fired when modal opens
 *   'close' — Fired when modal closes
 */
class Modal extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'modal';
        super(spec);
        this.add_class('modal');
        this.add_class('jsgui-modal-overlay');

        this.dom.attributes.role = 'dialog';
        this.dom.attributes['aria-modal'] = 'true';

        // Config
        this._title = spec.title || '';
        this._size = spec.size || '';
        this._closable = is_defined(spec.closable) ? !!spec.closable : true;
        this._close_on_overlay = is_defined(spec.close_on_overlay) ? !!spec.close_on_overlay : true;
        this._is_open = false;

        if (!spec.el) {
            this.compose(spec);
        }
    }

    compose(spec) {
        const { context } = this;

        // Modal box
        this._box = new Control({ context });
        this._box.add_class('jsgui-modal');
        if (this._size && this._size !== 'md') {
            this._box.dom.attributes['data-size'] = this._size;
        }

        // Header
        this._header = new Control({ context });
        this._header.add_class('jsgui-modal-header');

        this._title_ctrl = new Control({ context, tag_name: 'h2' });
        this._title_ctrl.add_class('jsgui-modal-title');
        if (this._title) this._title_ctrl.add(this._title);
        this._header.add(this._title_ctrl);

        if (this._closable) {
            this._close_btn = new Control({ context, tag_name: 'button' });
            this._close_btn.add_class('jsgui-modal-close');
            this._close_btn.dom.attributes.type = 'button';
            this._close_btn.dom.attributes['aria-label'] = 'Close';
            this._close_btn.add('×');
            this._header.add(this._close_btn);
        }

        this._box.add(this._header);

        // Body
        this._body = new Control({ context });
        this._body.add_class('jsgui-modal-body');
        if (is_defined(spec.content)) {
            this._body.add(spec.content);
        }
        this._box.add(this._body);

        // Footer (empty slot)
        this._footer = new Control({ context });
        this._footer.add_class('jsgui-modal-footer');
        this._box.add(this._footer);

        this.add(this._box);
    }

    // ── Public API ──

    /** Open the modal */
    /** Open the modal */
    open() {
        this._is_open = true;
        this.add_class('is-open');
        this.raise('open');
        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', this._handle_keydown);
        }
    }

    /** Close the modal */
    close() {
        this._is_open = false;
        this.remove_class('is-open');
        this.raise('close');
        if (typeof document !== 'undefined') {
            document.removeEventListener('keydown', this._handle_keydown);
        }
    }

    /** Toggle open/close */
    toggle() {
        if (this._is_open) this.close();
        else this.open();
    }

    /** Set the modal title */
    set_title(text) {
        this._title = text || '';
        if (this._title_ctrl) {
            this._title_ctrl.clear();
            if (this._title) this._title_ctrl.add(this._title);
        }
    }

    /** Add content to the body */
    set_content(content) {
        if (this._body) {
            this._body.clear();
            if (content) this._body.add(content);
        }
    }

    /** Add content to the footer */
    set_footer(content) {
        if (this._footer) {
            this._footer.clear();
            if (content) this._footer.add(content);
        }
    }

    /** Get the body control for direct manipulation */
    get body() { return this._body; }
    get footer() { return this._footer; }

    // ── Activation ──

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            // Close button
            if (this._close_btn && this._close_btn.dom.el) {
                this._close_btn.dom.el.addEventListener('click', () => this.close());
            }

            // Overlay click
            if (this._close_on_overlay) {
                this.dom.el.addEventListener('click', (e) => {
                    if (e.target === this.dom.el) this.close();
                });
            }
        }
    }

    _handle_keydown = (e) => {
        if (e.key === 'Escape' && this._is_open && this._closable) {
            this.close();
        }
    }
}

// Legacy CSS for backward compat
Modal.css = `
.modal {
    display: block;
}
`;

module.exports = Modal;