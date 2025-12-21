const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;

class Stack extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'stack';
        super(spec);
        this.add_class('stack');
        this.dom.tagName = 'div';

        this.direction = spec.direction === 'row' ? 'row' : 'column';
        this.gap = Number.isFinite(Number(spec.gap)) ? Number(spec.gap) : 12;

        this.apply_layout();
    }

    /**
     * Set stack direction.
     * @param {string} direction - "row" or "column".
     */
    set_direction(direction) {
        this.direction = direction === 'row' ? 'row' : 'column';
        this.apply_layout();
    }

    /**
     * Set stack gap.
     * @param {number} gap - Gap in px.
     */
    set_gap(gap) {
        const next_gap = Number(gap);
        if (Number.isFinite(next_gap)) {
            this.gap = next_gap;
            this.apply_layout();
        }
    }

    apply_layout() {
        this.dom.attributes.style.display = 'flex';
        this.dom.attributes.style.flexDirection = this.direction;
        this.dom.attributes.style.gap = `${this.gap}px`;
    }
}

module.exports = Stack;
