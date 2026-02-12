/**
 * Stack — Flexible layout container with direction, gap, alignment, and wrapping.
 *
 * A simple but powerful flexbox-based layout primitive for composing controls
 * vertically or horizontally with consistent spacing.
 *
 * Options:
 *   direction  — 'column' (default) or 'row'
 *   gap        — Gap in px (default 12)
 *   align      — Cross-axis alignment: 'stretch' (default), 'start', 'center', 'end', 'baseline'
 *   justify    — Main-axis justification: 'start' (default), 'center', 'end', 'between', 'around', 'evenly'
 *   wrap       — Whether to wrap items (default false)
 *   padding    — Container padding in px (default 0)
 *   inline     — Use inline-flex instead of flex (default false)
 *   theme      — Admin theme name
 *
 * API:
 *   set_direction(dir)  — Change direction
 *   set_gap(value)      — Change gap
 *   set_align(value)    — Change cross-axis alignment
 *   set_justify(value)  — Change main-axis justification
 *   set_wrap(bool)      — Toggle wrapping
 */
const Control = require('../../../../html-core/control');

const JUSTIFY_MAP = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly'
};

const ALIGN_MAP = {
    stretch: 'stretch',
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    baseline: 'baseline'
};

class Stack extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'stack';
        super(spec);
        this.add_class('jsgui-stack');
        this.dom.tagName = 'div';

        this._direction = spec.direction === 'row' ? 'row' : 'column';
        this._gap = Number.isFinite(Number(spec.gap)) ? Number(spec.gap) : 12;
        this._align = spec.align || 'stretch';
        this._justify = spec.justify || 'start';
        this._wrap = !!spec.wrap;
        this._padding = Number.isFinite(Number(spec.padding)) ? Number(spec.padding) : 0;
        this._inline = !!spec.inline;

        if (spec.theme) {
            this.dom.attributes['data-admin-theme'] = spec.theme;
        }

        this._apply_layout();
    }

    // ── Public API ──

    /**
     * Set stack direction.
     * @param {'row'|'column'} direction
     */
    set_direction(direction) {
        this._direction = direction === 'row' ? 'row' : 'column';
        this._apply_layout();
    }

    /**
     * Set stack gap.
     * @param {number} gap — Gap in px.
     */
    set_gap(gap) {
        const next = Number(gap);
        if (Number.isFinite(next)) {
            this._gap = next;
            this._apply_layout();
        }
    }

    /**
     * Set cross-axis alignment.
     * @param {'stretch'|'start'|'center'|'end'|'baseline'} value
     */
    set_align(value) {
        if (ALIGN_MAP[value]) {
            this._align = value;
            this._apply_layout();
        }
    }

    /**
     * Set main-axis justification.
     * @param {'start'|'center'|'end'|'between'|'around'|'evenly'} value
     */
    set_justify(value) {
        if (JUSTIFY_MAP[value]) {
            this._justify = value;
            this._apply_layout();
        }
    }

    /**
     * Toggle item wrapping.
     * @param {boolean} wrap
     */
    set_wrap(wrap) {
        this._wrap = !!wrap;
        this._apply_layout();
    }

    // ── Internal ──

    _apply_layout() {
        const s = this.dom.attributes.style;
        s.display = this._inline ? 'inline-flex' : 'flex';
        s.flexDirection = this._direction;
        s.gap = `${this._gap}px`;
        s.alignItems = ALIGN_MAP[this._align] || 'stretch';
        s.justifyContent = JUSTIFY_MAP[this._justify] || 'flex-start';
        s.flexWrap = this._wrap ? 'wrap' : 'nowrap';
        if (this._padding > 0) {
            s.padding = `${this._padding}px`;
        }
    }
}

Stack.css = `
/* ─── Stack ─── */
.jsgui-stack {
    box-sizing: border-box;
}
.jsgui-stack > * {
    min-width: 0;
    min-height: 0;
}
`;

module.exports = Stack;
