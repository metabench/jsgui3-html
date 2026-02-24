/**
 * @module controls/organised/1-standard/5-ui/link_button
 * @description A button styled to look like a hyperlink. Supports variants,
 *   optional leading icons, and configurable underline behavior. Used for
 *   secondary actions that should be visually less prominent than standard buttons.
 *
 * @example
 *   // Basic link button
 *   const btn = new Link_Button({ context, text: 'View details' });
 *
 *   // With leading icon
 *   const dl = new Link_Button({ context, text: 'Download', icon: '↓' });
 *
 *   // Danger link
 *   const del = new Link_Button({ context, text: 'Delete', variant: 'danger' });
 *
 *   // Always underlined subtle link
 *   const help = new Link_Button({ context, text: 'Learn more', variant: 'subtle', underline: 'always' });
 *
 * @tier T2
 * @spec_version Control_Spec v1
 */
const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { themeable } = require('../../../../control_mixins/themeable');

/**
 * Link_Button control — a `<button>` styled as a text hyperlink.
 *
 * Unlike `<a>`, this remains a semantic button with `type="button"`.
 * The underline prop controls CSS text-decoration behavior.
 *
 * @extends Control
 *
 * @param {object}  spec
 * @param {string}  [spec.text='Link']          - Button text
 * @param {string}  [spec.icon='']              - Optional leading icon (text/emoji)
 * @param {string}  [spec.underline='hover']    - Underline mode: 'always', 'hover', 'none'
 * @param {string}  [spec.variant='default']    - Visual variant: 'default', 'subtle', 'danger'
 * @param {boolean} [spec.disabled=false]       - Disable the button
 *
 * @fires action  Emitted on click (when not disabled). Payload: `{}`.
 *
 * @css .jsgui-link-button                          — Root element
 * @css .jsgui-link-button .link-button-icon        — Optional leading icon span
 * @css .jsgui-link-button .link-button-text        — Text content span
 * @css .jsgui-link-button[data-variant="subtle"]   — Muted color, hover to full
 * @css .jsgui-link-button[data-variant="danger"]   — Danger/red color
 *
 * @tokens --j-primary, --j-fg-muted, --j-fg, --j-danger
 */
class Link_Button extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'link_button';
        spec.tag_name = spec.tag_name || 'button';
        super(spec);

        themeable(this, 'link_button', spec);

        this.add_class('link-button');
        this.add_class('jsgui-link-button');

        this.text = spec.text || 'Link';
        this.underline = spec.underline || 'hover';
        this.icon = spec.icon || '';
        this.variant = spec.variant || 'default';
        this.disabled = !!spec.disabled;

        this.dom.attributes.type = 'button';
        this.dom.attributes['data-underline'] = this.underline;
        this.dom.attributes['data-variant'] = this.variant;

        if (this.disabled) {
            this._apply_disabled(true);
        }

        if (!spec.el) {
            this.compose();
        }
    }

    /**
     * Build internal DOM. Optionally creates a leading icon `<span>`,
     * always creates a text `<span>`.
     */
    compose() {
        const { context } = this;

        if (this.icon) {
            this.icon_ctrl = new Control({ context, tag_name: 'span' });
            this.icon_ctrl.add_class('link-button-icon');
            this.icon_ctrl.add(this.icon);
            this.add(this.icon_ctrl);
        }

        this.text_ctrl = new Control({ context, tag_name: 'span' });
        this.text_ctrl.add_class('link-button-text');
        this.text_ctrl.add(this.text);
        this.add(this.text_ctrl);
    }

    /**
     * Bind click handler. Raises `action` event when not disabled.
     */
    activate() {
        if (this.__active) return;
        super.activate();

        if (this.dom && this.dom.el) {
            this.dom.el.addEventListener('click', () => {
                if (this.disabled) return;
                this.raise('action', {});
            });
        }
    }

    /**
     * Update the displayed text.
     * @param {string} text
     */
    set_text(text) {
        this.text = text || '';
        if (this.text_ctrl) {
            this.text_ctrl.clear();
            this.text_ctrl.add(this.text);
        }
    }

    /**
     * Enable or disable the button.
     * @param {boolean} flag
     */
    set_disabled(flag) {
        this.disabled = !!flag;
        this._apply_disabled(this.disabled);
    }

    /** @private */
    _apply_disabled(on) {
        if (on) {
            this.dom.attributes.disabled = true;
            this.dom.attributes['aria-disabled'] = 'true';
            this.add_class('link-button-disabled');
        } else {
            delete this.dom.attributes.disabled;
            delete this.dom.attributes['aria-disabled'];
            this.remove_class('link-button-disabled');
        }
    }

    /**
     * Change the visual variant. Invalid values fall back to `'default'`.
     * @param {'default'|'subtle'|'danger'} value
     */
    set_variant(value) {
        const allowed = ['default', 'subtle', 'danger'];
        this.variant = allowed.includes(value) ? value : 'default';
        this.dom.attributes['data-variant'] = this.variant;
    }
}

Link_Button.css = `
.jsgui-link-button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: none;
    background: transparent;
    color: var(--j-primary, #2563eb);
    font: inherit;
    padding: 0;
    cursor: pointer;
    transition: color 120ms ease;
}

/* ── Underline modes ── */
.jsgui-link-button[data-underline="always"] {
    text-decoration: underline;
}

.jsgui-link-button[data-underline="hover"] {
    text-decoration: none;
}

.jsgui-link-button[data-underline="hover"]:hover {
    text-decoration: underline;
}

.jsgui-link-button[data-underline="none"] {
    text-decoration: none;
}

/* ── Variants ── */
.jsgui-link-button[data-variant="subtle"] {
    color: var(--j-fg-muted, #6b7280);
}
.jsgui-link-button[data-variant="subtle"]:hover {
    color: var(--j-fg, #111827);
}

.jsgui-link-button[data-variant="danger"] {
    color: var(--j-danger, #dc2626);
}
.jsgui-link-button[data-variant="danger"]:hover {
    color: color-mix(in srgb, var(--j-danger, #dc2626) 80%, black);
}

/* ── Focus ── */
.jsgui-link-button:focus-visible {
    outline: 2px solid var(--j-primary, #2563eb);
    outline-offset: 2px;
    border-radius: 2px;
}

/* ── Disabled ── */
.jsgui-link-button.link-button-disabled {
    color: var(--j-fg-muted, #6b7280);
    cursor: not-allowed;
    text-decoration: none;
    opacity: 0.6;
}

/* ── Icon ── */
.jsgui-link-button .link-button-icon {
    display: inline-flex;
    align-items: center;
    font-size: 0.9em;
}
`;

module.exports = Link_Button;
