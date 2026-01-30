const jsgui = require('../../../html-core/html-core');
const Control = jsgui.Control;

class Snap_Guide_Overlay extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'snap_guide_overlay';
        super(spec);
        this.add_class('snap-guide-overlay');

        this.container = spec.container || null;
        this.snap_threshold = spec.snap_threshold || 5;
        this.show_distances = spec.show_distances !== false;
        this.guide_color = spec.guide_color || '#ff00ff';
        this.snap_to_grid = spec.snap_to_grid !== false;
        this.grid_size = spec.grid_size || 8;
        this.snap_to_controls = spec.snap_to_controls !== false;
        this.snap_to_margins = spec.snap_to_margins !== false;

        if (!spec.abstract && !spec.el) {
            this._compose();
        }
    }

    _compose() {
        const { context } = this;
        this._ctrl_fields = this._ctrl_fields || {};
        const h = new Control({ context });
        h.add_class('snap-guide-h');
        const v = new Control({ context });
        v.add_class('snap-guide-v');
        this.add(h);
        this.add(v);
        this._ctrl_fields.h = h;
        this._ctrl_fields.v = v;
    }

    _apply_guide_styles() {
        const { h, v } = this._ctrl_fields || {};
        if (!h || !v) return;
        h.dom.attributes.style = h.dom.attributes.style || {};
        v.dom.attributes.style = v.dom.attributes.style || {};
        h.dom.attributes.style.background = this.guide_color;
        v.dom.attributes.style.background = this.guide_color;
    }

    start_drag(control) {
        this.drag_control = control;
        this.show();
        this._apply_guide_styles();
    }

    update(position) {
        if (!position) return;
        if (this.snap_to_grid) {
            const snapped = this.get_snapped_position(position);
            this.last_snapped_position = snapped;
        }
    }

    end_drag() {
        this.drag_control = null;
        this.hide();
    }

    get_snapped_position(pos) {
        if (!this.snap_to_grid || !Array.isArray(pos)) return pos;
        const size = this.grid_size || 1;
        const x = Math.round(pos[0] / size) * size;
        const y = Math.round(pos[1] / size) * size;
        return [x, y];
    }

    set_excluded(controls) {
        this.excluded_controls = Array.isArray(controls) ? controls.slice() : [];
    }
}

module.exports = Snap_Guide_Overlay;
