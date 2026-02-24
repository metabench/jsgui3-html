const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;

class Grid_Gap extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'grid_gap';
        super(spec);
        this.add_class('grid-gap');
        this.dom.tagName = 'div';

        this.columns = spec.columns || 'repeat(auto-fit, minmax(160px, 1fr))';
        this.gap = Number.isFinite(Number(spec.gap)) ? Number(spec.gap) : 12;

        this.apply_layout();
    }

    /**
     * Set grid columns.
     * @param {string} columns - CSS grid-template-columns value.
     */
    set_columns(columns) {
        if (columns) {
            this.columns = columns;
            this.apply_layout();
        }
    }

    /**
     * Set grid gap.
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
        this.dom.attributes.style.display = 'grid';
        this.dom.attributes.style.gridTemplateColumns = this.columns;
        this.dom.attributes.style.gap = `${this.gap}px`;
    }
}

module.exports = Grid_Gap;
