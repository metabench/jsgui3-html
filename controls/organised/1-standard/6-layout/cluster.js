const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;

class Cluster extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'cluster';
        super(spec);
        this.add_class('cluster');
        this.dom.tagName = 'div';

        this.gap = Number.isFinite(Number(spec.gap)) ? Number(spec.gap) : 12;
        this.justify = spec.justify || 'flex-start';
        this.align = spec.align || 'center';

        this.apply_layout();
    }

    /**
     * Set cluster gap.
     * @param {number} gap - Gap in px.
     */
    set_gap(gap) {
        const next_gap = Number(gap);
        if (Number.isFinite(next_gap)) {
            this.gap = next_gap;
            this.apply_layout();
        }
    }

    /**
     * Set justify content value.
     * @param {string} justify - CSS justify-content value.
     */
    set_justify(justify) {
        if (justify) {
            this.justify = justify;
            this.apply_layout();
        }
    }

    /**
     * Set align items value.
     * @param {string} align - CSS align-items value.
     */
    set_align(align) {
        if (align) {
            this.align = align;
            this.apply_layout();
        }
    }

    apply_layout() {
        this.dom.attributes.style.display = 'flex';
        this.dom.attributes.style.flexWrap = 'wrap';
        this.dom.attributes.style.gap = `${this.gap}px`;
        this.dom.attributes.style.justifyContent = this.justify;
        this.dom.attributes.style.alignItems = this.align;
    }
}

module.exports = Cluster;
