/**
 * @module controls/organised/1-standard/6-layout/group_box
 * @description A bordered container for grouping related form controls
 *   under a named heading (legend). Renders as a semantic `<fieldset>` with
 *   `<legend>` unless `use_div` is specified. Supports variants and
 *   invalid/disabled states.
 *
 * @example
 *   // Basic group box
 *   const gb = new Group_Box({ context, legend: 'Preferences' });
 *   gb.add_content(someControl);
 *
 *   // Elevated variant
 *   const card = new Group_Box({ context, legend: 'Details', variant: 'elevated' });
 *
 *   // Subtle headingless grouping with div
 *   const section = new Group_Box({ context, legend: 'Filters', variant: 'subtle', use_div: true });
 *
 *   // With validation error
 *   const form = new Group_Box({ context, legend: 'Login', invalid: true });
 *
 * @tier T3
 * @spec_version Control_Spec v1
 */
const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { themeable } = require('../../../../control_mixins/themeable');

/**
 * Group_Box control — a fieldset/div container with legend and content area.
 *
 * Defaults to `<fieldset>` with `<legend>`. Set `use_div: true` to use
 * `<div>` with a `<span>` heading instead (useful when nesting controls
 * that would conflict with `<fieldset>` styling).
 *
 * @extends Control
 *
 * @param {object}  spec
 * @param {string}  [spec.legend='']          - Heading text
 * @param {string}  [spec.variant='default']  - Visual variant: 'default', 'subtle', 'elevated'
 * @param {boolean} [spec.invalid=false]      - Show validation-error styling
 * @param {boolean} [spec.disabled=false]     - Disable interaction
 * @param {boolean} [spec.use_div=false]      - Use `<div>` instead of `<fieldset>`
 *
 * @css .jsgui-group-box                            — Root element
 * @css .jsgui-group-box .group-box-legend          — Legend/heading
 * @css .jsgui-group-box .group-box-content         — Content area
 * @css .jsgui-group-box[data-variant="subtle"]     — No border, muted legend
 * @css .jsgui-group-box[data-variant="elevated"]   — Box shadow
 * @css .jsgui-group-box-invalid                    — Error border color
 * @css .jsgui-group-box-disabled                   — Reduced opacity
 *
 * @tokens --j-border, --j-bg-elevated, --j-fg, --j-fg-muted, --j-danger
 */
class Group_Box extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'group_box';
        if (!spec.use_div) spec.tag_name = spec.tag_name || 'fieldset';
        super(spec);

        themeable(this, 'group_box', spec);

        this.add_class('group-box');
        this.add_class('jsgui-group-box');

        this.legend = spec.legend || '';
        this.variant = spec.variant || 'default';
        this.invalid = !!spec.invalid;
        this.disabled = !!spec.disabled;
        this.use_div = !!spec.use_div;

        this.dom.attributes['data-variant'] = this.variant;

        if (this.invalid) {
            this.add_class('group-box-invalid');
            this.dom.attributes['aria-invalid'] = 'true';
        }

        if (this.disabled) {
            this._apply_disabled(true);
        }

        if (!spec.el) {
            this.compose();
        }
    }

    /**
     * Build internal DOM. Creates a legend/heading element and a content area.
     */
    compose() {
        const { context } = this;

        if (this.use_div) {
            this.legend_ctrl = new Control({ context, tag_name: 'span' });
        } else {
            this.legend_ctrl = new Control({ context, tag_name: 'legend' });
        }
        this.legend_ctrl.add_class('group-box-legend');
        this.legend_ctrl.add(this.legend);
        this.add(this.legend_ctrl);

        this.content_ctrl = new Control({ context });
        this.content_ctrl.add_class('group-box-content');
        this.add(this.content_ctrl);
    }

    /**
     * Bind events. For Group_Box, mainly enables activation of child controls.
     */
    activate() {
        if (this.__active) return;
        super.activate();
    }

    /**
     * Update the legend text.
     * @param {string} text
     */
    set_legend(text) {
        this.legend = text || '';
        if (this.legend_ctrl) {
            this.legend_ctrl.clear();
            this.legend_ctrl.add(this.legend);
        }
    }

    /**
     * Set validation-error state.
     * @param {boolean} flag
     */
    set_invalid(flag) {
        this.invalid = !!flag;
        if (this.invalid) {
            this.add_class('group-box-invalid');
            this.dom.attributes['aria-invalid'] = 'true';
        } else {
            this.remove_class('group-box-invalid');
            delete this.dom.attributes['aria-invalid'];
        }
    }

    /**
     * Add a child control to the content area.
     * @param {Control} control
     */
    add_content(control) {
        if (this.content_ctrl) {
            this.content_ctrl.add(control);
        }
    }

    /**
     * Enable or disable the group box and all its children.
     * @param {boolean} flag
     */
    set_disabled(flag) {
        this.disabled = !!flag;
        this._apply_disabled(this.disabled);
    }

    /** @private */
    _apply_disabled(on) {
        if (on) {
            this.dom.attributes['aria-disabled'] = 'true';
            if (!this.use_div) {
                this.dom.attributes.disabled = true;
            }
            this.add_class('group-box-disabled');
        } else {
            delete this.dom.attributes['aria-disabled'];
            delete this.dom.attributes.disabled;
            this.remove_class('group-box-disabled');
        }
    }

    /**
     * Change the visual variant. Invalid values fall back to `'default'`.
     * @param {'default'|'subtle'|'elevated'} value
     */
    set_variant(value) {
        const allowed = ['default', 'subtle', 'elevated'];
        this.variant = allowed.includes(value) ? value : 'default';
        this.dom.attributes['data-variant'] = this.variant;
    }
}

Group_Box.css = `
.jsgui-group-box {
    border: 1px solid var(--j-border, #d1d5db);
    border-radius: 6px;
    padding: 12px;
    margin: 0;
    background: var(--j-bg-elevated, #fff);
}

.jsgui-group-box .group-box-legend {
    color: var(--j-fg, #111827);
    font-size: 13px;
    font-weight: 600;
    padding: 0 4px;
}

.jsgui-group-box .group-box-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* ── Variant: subtle ── */
.jsgui-group-box[data-variant="subtle"] {
    border-color: transparent;
    background: transparent;
    padding: 8px 0;
}

.jsgui-group-box[data-variant="subtle"] .group-box-legend {
    color: var(--j-fg-muted, #6b7280);
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.05em;
}

/* ── Variant: elevated ── */
.jsgui-group-box[data-variant="elevated"] {
    border-color: var(--j-border, #d1d5db);
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* ── Invalid ── */
.jsgui-group-box.group-box-invalid {
    border-color: var(--j-danger, #dc2626);
}

.jsgui-group-box.group-box-invalid .group-box-legend {
    color: var(--j-danger, #dc2626);
}

/* ── Disabled ── */
.jsgui-group-box.group-box-disabled {
    opacity: 0.55;
    pointer-events: none;
}
`;

module.exports = Group_Box;
