const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;

class Center extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'center';
        super(spec);
        this.add_class('center');
        this.dom.tagName = 'div';

        this.min_height = Number.isFinite(Number(spec.min_height)) ? Number(spec.min_height) : null;
        this.max_width = Number.isFinite(Number(spec.max_width)) ? Number(spec.max_width) : null;

        this.apply_layout();
    }

    /**
     * Set minimum height.
     * @param {number} min_height - Min height in px.
     */
    set_min_height(min_height) {
        const next_value = Number(min_height);
        if (Number.isFinite(next_value)) {
            this.min_height = next_value;
            this.apply_layout();
        }
    }

    /**
     * Set max width.
     * @param {number} max_width - Max width in px.
     */
    set_max_width(max_width) {
        const next_value = Number(max_width);
        if (Number.isFinite(next_value)) {
            this.max_width = next_value;
            this.apply_layout();
        }
    }

    apply_layout() {
        this.dom.attributes.style.display = 'grid';
        this.dom.attributes.style.placeItems = 'center';
        if (Number.isFinite(this.min_height)) {
            this.dom.attributes.style.minHeight = `${this.min_height}px`;
        }
        if (Number.isFinite(this.max_width)) {
            this.dom.attributes.style.maxWidth = `${this.max_width}px`;
            this.dom.attributes.style.margin = '0 auto';
        }
    }
}

module.exports = Center;
