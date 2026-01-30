const jsgui = require('../../../html-core/html-core');
const Control = jsgui.Control;
const { v_add, v_subtract } = jsgui.util;
const drag_like_events = require('../../../control_mixins/drag_like_events');

const HANDLE_NAMES = [
    'n', 's', 'e', 'w',
    'ne', 'nw', 'se', 'sw'
];

const clamp_size = (size, min_size, max_size) => {
    if (!Array.isArray(size)) return size;
    let [w, h] = size;
    if (Array.isArray(min_size)) {
        if (min_size[0] !== null && min_size[0] !== undefined) w = Math.max(w, min_size[0]);
        if (min_size[1] !== null && min_size[1] !== undefined) h = Math.max(h, min_size[1]);
    }
    if (Array.isArray(max_size)) {
        if (max_size[0] !== null && max_size[0] !== undefined) w = Math.min(w, max_size[0]);
        if (max_size[1] !== null && max_size[1] !== undefined) h = Math.min(h, max_size[1]);
    }
    return [w, h];
};

class Selection_Handles extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'selection_handles';
        super(spec);
        this.add_class('selection-handles');

        this.target = spec.target || null;
        this.handle_size = spec.handle_size || 8;
        this.min_size = spec.min_size || [20, 20];
        this.max_size = spec.max_size || null;
        this.show_dimensions = spec.show_dimensions !== false;
        this.maintain_aspect = !!spec.maintain_aspect;
        this.handle_style = spec.handle_style || 'square';
        this.allow_move = spec.allow_move !== false;

        if (!spec.abstract && !spec.el) {
            this._compose();
        }
    }

    _compose() {
        const { context } = this;
        this._ctrl_fields = this._ctrl_fields || {};
        this.handles = {};

        HANDLE_NAMES.forEach(handle_name => {
            const handle = new Control({ context });
            handle.add_class('selection-handle');
            handle.add_class(`selection-handle-${handle_name}`);
            handle.dom.attributes.style = handle.dom.attributes.style || {};
            handle.dom.attributes.style.width = `${this.handle_size}px`;
            handle.dom.attributes.style.height = `${this.handle_size}px`;
            handle.dom.attributes['data-handle'] = handle_name;
            if (this.handle_style) {
                handle.add_class(`selection-handle-${this.handle_style}`);
            }
            this.add(handle);
            this.handles[handle_name] = handle;
            this._ctrl_fields[`handle_${handle_name}`] = handle;
        });

        if (this.show_dimensions) {
            const dimensions = new Control({ context });
            dimensions.add_class('selection-dimensions');
            this.add(dimensions);
            this._ctrl_fields.dimensions = dimensions;
        }
    }

    _update_dimensions_label(size) {
        if (!this._ctrl_fields || !this._ctrl_fields.dimensions) return;
        const label = this._ctrl_fields.dimensions;
        if (!size) return;
        label.clear();
        label.add(`${Math.round(size[0])} × ${Math.round(size[1])}`);
    }

    _apply_resize(handle_name, delta, initial) {
        if (!this.target) return;
        const start_pos = initial.pos || this.target.pos || [0, 0];
        const start_size = initial.size || this.target.size || [0, 0];
        let [new_w, new_h] = start_size;
        let new_pos = start_pos.slice();

        if (handle_name.indexOf('e') !== -1) {
            new_w = start_size[0] + delta[0];
        }
        if (handle_name.indexOf('w') !== -1) {
            new_w = start_size[0] - delta[0];
            new_pos = v_add(new_pos, [delta[0], 0]);
        }
        if (handle_name.indexOf('s') !== -1) {
            new_h = start_size[1] + delta[1];
        }
        if (handle_name.indexOf('n') !== -1) {
            new_h = start_size[1] - delta[1];
            new_pos = v_add(new_pos, [0, delta[1]]);
        }

        let next_size = [new_w, new_h];
        if (this.maintain_aspect && start_size[0] && start_size[1]) {
            const ratio = start_size[0] / start_size[1];
            const dominant = Math.abs(delta[0]) > Math.abs(delta[1]) ? 'x' : 'y';
            if (dominant === 'x') {
                next_size[1] = Math.round(next_size[0] / ratio);
            } else {
                next_size[0] = Math.round(next_size[1] * ratio);
            }
        }

        next_size = clamp_size(next_size, this.min_size, this.max_size);

        this.target.size = next_size;
        this.target.pos = new_pos;
        this._update_dimensions_label(next_size);
    }

    _apply_move(delta, initial) {
        if (!this.target) return;
        const start_pos = initial.pos || this.target.pos || [0, 0];
        this.target.pos = v_add(start_pos, delta);
    }

    set_target(target) {
        this.target = target;
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.handles) return;

            Object.keys(this.handles).forEach(handle_name => {
                const handle = this.handles[handle_name];
                drag_like_events(handle);
                let initial = {};

                handle.on('drag-like-action-start', () => {
                    if (!this.target) return;
                    initial = {
                        pos: (this.target.pos || [0, 0]).slice(),
                        size: (this.target.size || [0, 0]).slice()
                    };
                    this.raise('resize-start', { handle: handle_name, initial_size: initial.size });
                });

                handle.on('drag-like-action-move', e_move => {
                    if (!e_move || !e_move.offset) return;
                    this._apply_resize(handle_name, e_move.offset, initial);
                    this.raise('resize-move', { handle: handle_name, size: this.target.size, delta: e_move.offset });
                });

                handle.on('drag-like-action-end', e_end => {
                    if (!e_end || !e_end.offset) return;
                    this._apply_resize(handle_name, e_end.offset, initial);
                    this.raise('resize-end', { handle: handle_name, final_size: this.target.size });
                });
            });

            if (this.allow_move) {
                drag_like_events(this);
                let initial = {};
                this.on('drag-like-action-start', () => {
                    if (!this.target) return;
                    initial = {
                        pos: (this.target.pos || [0, 0]).slice()
                    };
                    this.raise('move-start', { initial_pos: initial.pos });
                });
                this.on('drag-like-action-move', e_move => {
                    if (!e_move || !e_move.offset) return;
                    this._apply_move(e_move.offset, initial);
                });
                this.on('drag-like-action-end', e_end => {
                    if (!e_end || !e_end.offset) return;
                    this._apply_move(e_end.offset, initial);
                    this.raise('move-end', { final_pos: this.target.pos, delta: e_end.offset });
                });
            }
        }
    }
}

module.exports = Selection_Handles;
