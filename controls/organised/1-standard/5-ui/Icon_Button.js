/**
 * @module controls/organised/1-standard/5-ui/icon_button
 * @description A compact button that displays only an icon, suitable for
 *   toolbars, action bars, and compact UI areas. Supports toggle mode,
 *   multiple visual variants, three size presets, and full ARIA labelling.
 *
 * @example
 *   // Basic icon button
 *   const btn = new Icon_Button({ context, icon: '✕', aria_label: 'Close' });
 *
 *   // Toggle button (bookmark)
 *   const fav = new Icon_Button({ context, icon: '★', toggle: true, aria_label: 'Favorite' });
 *
 *   // Danger variant, small size
 *   const del = new Icon_Button({ context, icon: '🗑', variant: 'danger', size: 'sm', aria_label: 'Delete' });
 *
 *   // Toolbar-style button
 *   const gear = new Icon_Button({ context, icon: '⚙', variant: 'toolbar', aria_label: 'Settings' });
 *
 * @tier T3
 * @spec_version Control_Spec v1
 */
const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { themeable } = require('../../../../control_mixins/themeable');

/**
 * Icon_Button control — a button rendered as a single icon.
 *
 * Toggle mode enables `aria-pressed` tracking. The `variant` prop controls
 * the visual style (border, background, color) and the `size` prop controls
 * dimensions (sm=24px, md=32px, lg=40px).
 *
 * @extends Control
 *
 * @param {object}  spec
 * @param {string}  [spec.icon='•']         - Text/emoji/HTML to display as the icon
 * @param {string}  [spec.aria_label]        - Accessible label (required for a11y)
 * @param {string}  [spec.label]             - Alias for aria_label
 * @param {string}  [spec.tooltip='']        - Tooltip text (title attribute)
 * @param {boolean} [spec.toggle=false]      - Enable toggle mode (aria-pressed)
 * @param {boolean} [spec.pressed=false]     - Initial pressed state (when toggle=true)
 * @param {boolean} [spec.disabled=false]    - Disable the button
 * @param {string}  [spec.variant='default'] - Visual variant: 'default', 'filled', 'subtle', 'danger', 'toolbar'
 * @param {string}  [spec.size='md']         - Size preset: 'sm' (24px), 'md' (32px), 'lg' (40px)
 *
 * @fires action   Emitted on click. Payload: `{ pressed }` when toggle=true, else `{}`.
 *
 * @css .jsgui-icon-button                        — Root element
 * @css .jsgui-icon-button .icon-button-icon      — Icon wrapper span
 * @css .jsgui-icon-button[data-variant="filled"]  — Primary filled style
 * @css .jsgui-icon-button[data-variant="subtle"]  — Borderless transparent style
 * @css .jsgui-icon-button[data-variant="danger"]  — Danger/destructive style
 * @css .jsgui-icon-button[data-variant="toolbar"] — Compact toolbar style
 * @css .jsgui-icon-button[data-size="sm"]         — 24×24px
 * @css .jsgui-icon-button[data-size="md"]         — 32×32px (default)
 * @css .jsgui-icon-button[data-size="lg"]         — 40×40px
 *
 * @tokens --j-border, --j-bg-elevated, --j-fg, --j-primary, --j-bg-hover, --j-danger
 */
class Icon_Button extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'icon_button';
        spec.tag_name = spec.tag_name || 'button';
        super(spec);

        themeable(this, 'icon_button', spec);

        this.add_class('icon-button');
        this.add_class('jsgui-icon-button');

        this.icon = spec.icon || '•';
        this.aria_label = spec.aria_label || spec.label || 'Icon button';
        this.tooltip = spec.tooltip || '';
        this.toggle = !!spec.toggle;
        this.pressed = !!spec.pressed;
        this.disabled = !!spec.disabled;
        this.variant = spec.variant || 'default';
        this.size = spec.size || 'md';

        this.dom.attributes.type = 'button';
        this.dom.attributes['aria-label'] = this.aria_label;
        this.dom.attributes['data-variant'] = this.variant;
        this.dom.attributes['data-size'] = this.size;
        if (this.tooltip) this.dom.attributes.title = this.tooltip;
        if (this.toggle) {
            this.dom.attributes['aria-pressed'] = this.pressed ? 'true' : 'false';
        }
        if (this.disabled) {
            this._apply_disabled(true);
        }

        if (!spec.el) {
            this.compose();
        }
    }

    /**
     * Build internal DOM — creates a `<span class="icon-button-icon">` child.
     */
    compose() {
        const { context } = this;
        this.icon_ctrl = new Control({ context, tag_name: 'span' });
        this.icon_ctrl.add_class('icon-button-icon');
        this.icon_ctrl.add(this.icon);
        this.add(this.icon_ctrl);
    }

    /**
     * Bind click handler. In toggle mode, toggles `pressed` state and
     * raises `action` with `{ pressed }`. In normal mode, raises `action` with `{}`.
     */
    activate() {
        if (this.__active) return;
        super.activate();

        if (this.dom && this.dom.el) {
            this.dom.el.addEventListener('click', () => {
                if (this.disabled) return;
                if (this.toggle) {
                    this.set_pressed(!this.pressed);
                }
                this.raise('action', this.toggle ? { pressed: this.pressed } : {});
            });
        }
    }

    /**
     * Set the pressed state. Only meaningful in toggle mode.
     * Updates `aria-pressed` and the `icon-button-pressed` CSS class.
     *
     * @param {boolean} flag
     */
    set_pressed(flag) {
        this.pressed = !!flag;
        if (this.toggle) {
            this.dom.attributes['aria-pressed'] = this.pressed ? 'true' : 'false';
            if (this.pressed) this.add_class('icon-button-pressed');
            else this.remove_class('icon-button-pressed');
        }
    }

    /**
     * Replace the displayed icon.
     *
     * @param {string} icon - New icon text/emoji/HTML
     */
    set_icon(icon) {
        this.icon = icon || '•';
        if (this.icon_ctrl) {
            this.icon_ctrl.clear();
            this.icon_ctrl.add(this.icon);
        }
    }

    /**
     * Enable or disable the button.
     *
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
            this.add_class('icon-button-disabled');
        } else {
            delete this.dom.attributes.disabled;
            delete this.dom.attributes['aria-disabled'];
            this.remove_class('icon-button-disabled');
        }
    }

    /**
     * Change the visual variant. Invalid values fall back to `'default'`.
     *
     * @param {'default'|'filled'|'subtle'|'danger'|'toolbar'} value
     */
    set_variant(value) {
        const allowed = ['default', 'filled', 'subtle', 'danger', 'toolbar'];
        this.variant = allowed.includes(value) ? value : 'default';
        this.dom.attributes['data-variant'] = this.variant;
    }

    /**
     * Change the size preset. Invalid values fall back to `'md'`.
     *
     * @param {'sm'|'md'|'lg'} value
     */
    set_size(value) {
        const allowed = ['sm', 'md', 'lg'];
        this.size = allowed.includes(value) ? value : 'md';
        this.dom.attributes['data-size'] = this.size;
    }
}

Icon_Button.css = `
.jsgui-icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    border: 1px solid var(--j-border, #d1d5db);
    background: var(--j-bg-elevated, #fff);
    color: var(--j-fg, #111827);
    cursor: pointer;
    transition: background 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
    padding: 0;
}

/* ── Size variants ── */
.jsgui-icon-button[data-size="sm"] {
    width: 24px;
    height: 24px;
}
.jsgui-icon-button[data-size="sm"] .icon-button-icon { font-size: 13px; }

.jsgui-icon-button[data-size="md"] {
    width: 32px;
    height: 32px;
}
.jsgui-icon-button[data-size="md"] .icon-button-icon { font-size: 16px; }

.jsgui-icon-button[data-size="lg"] {
    width: 40px;
    height: 40px;
}
.jsgui-icon-button[data-size="lg"] .icon-button-icon { font-size: 20px; }

/* ── Default variant (outlined) ── */
.jsgui-icon-button:hover {
    background: var(--j-bg-hover, #f3f4f6);
}

.jsgui-icon-button:focus-visible {
    outline: 2px solid var(--j-primary, #2563eb);
    outline-offset: 1px;
}

/* ── Filled variant ── */
.jsgui-icon-button[data-variant="filled"] {
    background: var(--j-primary, #2563eb);
    border-color: var(--j-primary, #2563eb);
    color: #fff;
}
.jsgui-icon-button[data-variant="filled"]:hover {
    filter: brightness(1.1);
}

/* ── Subtle variant (no border) ── */
.jsgui-icon-button[data-variant="subtle"] {
    border-color: transparent;
    background: transparent;
}
.jsgui-icon-button[data-variant="subtle"]:hover {
    background: var(--j-bg-hover, #f3f4f6);
}

/* ── Danger variant ── */
.jsgui-icon-button[data-variant="danger"] {
    color: var(--j-danger, #dc2626);
    border-color: var(--j-danger, #dc2626);
}
.jsgui-icon-button[data-variant="danger"]:hover {
    background: color-mix(in srgb, var(--j-danger, #dc2626) 10%, transparent);
}

/* ── Toolbar variant (compact, no border) ── */
.jsgui-icon-button[data-variant="toolbar"] {
    border-color: transparent;
    background: transparent;
    border-radius: 4px;
}
.jsgui-icon-button[data-variant="toolbar"]:hover {
    background: var(--j-bg-hover, #f3f4f6);
}

/* ── States ── */
.jsgui-icon-button.icon-button-pressed {
    background: color-mix(in srgb, var(--j-primary, #2563eb) 15%, white);
    border-color: var(--j-primary, #2563eb);
}

.jsgui-icon-button.icon-button-disabled {
    opacity: 0.55;
    cursor: not-allowed;
    pointer-events: none;
}

.jsgui-icon-button .icon-button-icon {
    line-height: 1;
}
`;

module.exports = Icon_Button;
