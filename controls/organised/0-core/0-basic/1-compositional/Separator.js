/**
 * @module controls/organised/0-core/0-basic/1-compositional/separator
 * @description A visual divider for separating content sections. Supports
 *   horizontal and vertical orientations, multiple visual variants, and
 *   an inset mode for indented separators.
 *
 * @example
 *   // Basic horizontal separator
 *   const sep = new Separator({ context });
 *
 *   // Vertical dashed separator
 *   const sep2 = new Separator({ context, orientation: 'vertical', variant: 'dashed' });
 *
 *   // Semantic (non-decorative) separator with ARIA
 *   const sep3 = new Separator({ context, decorative: false });
 *
 * @tier T2
 * @spec_version Control_Spec v1
 */
const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const { themeable } = require('../../../../../control_mixins/themeable');

/**
 * Separator control — renders a horizontal or vertical dividing line.
 *
 * Decorative separators (default) use `aria-hidden="true"` and no ARIA role.
 * Non-decorative separators get `role="separator"` and `aria-orientation`.
 *
 * @extends Control
 *
 * @param {object}  spec
 * @param {string}  [spec.orientation='horizontal']  - 'horizontal' or 'vertical'
 * @param {string}  [spec.variant='subtle']           - Visual variant: 'solid', 'dashed', 'inset', 'subtle'
 * @param {boolean} [spec.inset=false]                - Extra margin to indent the separator
 * @param {boolean} [spec.decorative=true]            - If true, uses aria-hidden; if false, uses role=separator
 *
 * @css .jsgui-separator                                    — Root element
 * @css .jsgui-separator .separator-line                    — The visible line element
 * @css .jsgui-separator[data-orientation="horizontal"]     — Horizontal layout
 * @css .jsgui-separator[data-orientation="vertical"]       — Vertical layout
 * @css .jsgui-separator[data-variant="solid"]              — Full-opacity line
 * @css .jsgui-separator[data-variant="dashed"]             — Dashed border line
 * @css .jsgui-separator[data-variant="inset"]              — Indented with reduced opacity
 * @css .jsgui-separator[data-variant="subtle"]             — Half-opacity line (default)
 *
 * @tokens --j-border
 */
class Separator extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'separator';
        super(spec);

        themeable(this, 'separator', spec);

        this.add_class('separator');
        this.add_class('jsgui-separator');

        this.orientation = spec.orientation === 'vertical' ? 'vertical' : 'horizontal';
        this.inset = !!spec.inset;
        this.decorative = spec.decorative !== false;
        this.variant = spec.variant || 'subtle';

        this.dom.attributes['data-orientation'] = this.orientation;
        this.dom.attributes['data-variant'] = this.variant;
        if (this.inset) this.dom.attributes['data-inset'] = 'true';

        if (this.decorative) {
            this.dom.attributes['aria-hidden'] = 'true';
        } else {
            this.dom.attributes.role = 'separator';
            this.dom.attributes['aria-orientation'] = this.orientation;
        }

        if (!spec.el) {
            this.compose();
        }
    }

    /**
     * Build internal DOM structure. Creates a single `<span>` child
     * with class `separator-line` that is styled as the visible line.
     */
    compose() {
        const { context } = this;
        this.line = new Control({ context, tag_name: 'span' });
        this.line.add_class('separator-line');
        this.add(this.line);
    }

    /**
     * Change the orientation at runtime.
     * Updates data attribute and, if non-decorative, the `aria-orientation`.
     *
     * @param {'horizontal'|'vertical'} value
     */
    set_orientation(value) {
        const next = value === 'vertical' ? 'vertical' : 'horizontal';
        this.orientation = next;
        this.dom.attributes['data-orientation'] = next;
        if (!this.decorative) {
            this.dom.attributes['aria-orientation'] = next;
        }
    }

    /**
     * Change the visual variant at runtime.
     * Invalid values fall back to `'subtle'`.
     *
     * @param {'solid'|'dashed'|'inset'|'subtle'} value
     */
    set_variant(value) {
        const allowed = ['solid', 'dashed', 'inset', 'subtle'];
        this.variant = allowed.includes(value) ? value : 'subtle';
        this.dom.attributes['data-variant'] = this.variant;
    }
}

Separator.css = `
.jsgui-separator {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--j-border, #d1d5db);
}

/* ── Orientation ── */
.jsgui-separator[data-orientation="horizontal"] {
    width: 100%;
    min-height: 1px;
    padding: 0;
}

.jsgui-separator[data-orientation="horizontal"][data-inset="true"] {
    margin-left: 16px;
    margin-right: 16px;
}

.jsgui-separator[data-orientation="vertical"] {
    height: 100%;
    min-width: 1px;
    padding: 0;
}

.jsgui-separator[data-orientation="vertical"][data-inset="true"] {
    margin-top: 8px;
    margin-bottom: 8px;
}

/* ── Line element ── */
.jsgui-separator .separator-line {
    display: block;
    background: var(--j-border, #d1d5db);
}

.jsgui-separator[data-orientation="horizontal"] .separator-line {
    width: 100%;
    height: 1px;
}

.jsgui-separator[data-orientation="vertical"] .separator-line {
    width: 1px;
    height: 100%;
}

/* ── Variants ── */
.jsgui-separator[data-variant="subtle"] .separator-line {
    opacity: 0.5;
}

.jsgui-separator[data-variant="solid"] .separator-line {
    opacity: 1;
}

.jsgui-separator[data-variant="dashed"] .separator-line {
    background: none;
    border: none;
}

.jsgui-separator[data-variant="dashed"][data-orientation="horizontal"] .separator-line {
    height: 0;
    border-top: 1px dashed var(--j-border, #d1d5db);
}

.jsgui-separator[data-variant="dashed"][data-orientation="vertical"] .separator-line {
    width: 0;
    border-left: 1px dashed var(--j-border, #d1d5db);
}

.jsgui-separator[data-variant="inset"] {
    margin-left: 16px;
    margin-right: 16px;
}

.jsgui-separator[data-variant="inset"] .separator-line {
    opacity: 0.5;
}
`;

module.exports = Separator;
