const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const { ensure_control_models } = require('../../../../html-core/control_model_factory');

const normalize_orientation = value => (value === 'vertical' ? 'vertical' : 'horizontal');

const normalize_primary = value => (value === 'second' ? 'second' : 'first');

const normalize_size = value => {
    if (typeof value === 'string' && value.trim()) return value.trim();
    const num = Number(value);
    if (Number.isFinite(num)) return num;
    return '50%';
};

const size_to_css = value => {
    if (typeof value === 'string') return value;
    const num = Number(value);
    if (Number.isFinite(num)) return `${num}px`;
    return '50%';
};

class Split_Pane extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'split_pane';
        super(spec);
        this.add_class('split-pane');
        this.dom.tagName = 'div';

        ensure_control_models(this, spec);
        this.model = this.data.model;

        this.set_orientation(spec.orientation);
        this.set_primary(spec.primary);
        this.set_min_size(is_defined(spec.min_size) ? spec.min_size : null);
        this.set_max_size(is_defined(spec.max_size) ? spec.max_size : null);
        this.set_size(is_defined(spec.size) ? spec.size : spec.initial_size);
        this.handle_size = is_defined(spec.handle_size) ? Number(spec.handle_size) : 6;

        if (!spec.el) {
            this.compose_split_pane(spec);
        }

        this.bind_model();
    }

    bind_model() {
        if (!this.model || typeof this.model.on !== 'function') return;

        this.model.on('change', e_change => {
            const name = e_change.name;
            const value = e_change.value;
            if (name === 'orientation') {
                this.orientation = normalize_orientation(value);
            }
            if (name === 'primary') {
                this.primary = normalize_primary(value);
            }
            if (name === 'size') {
                this.size = normalize_size(value);
            }
            if (name === 'min_size') {
                this.min_size = is_defined(value) ? Number(value) : null;
            }
            if (name === 'max_size') {
                this.max_size = is_defined(value) ? Number(value) : null;
            }
            if (
                name === 'orientation' ||
                name === 'primary' ||
                name === 'size' ||
                name === 'min_size' ||
                name === 'max_size'
            ) {
                this.update_layout();
            }
        });
    }

    set_model_value(name, value) {
        if (this.model && typeof this.model.set === 'function') {
            this.model.set(name, value);
        } else if (this.model) {
            this.model[name] = value;
        }
    }

    /**
     * Set split orientation.
     * @param {string} orientation - "horizontal" or "vertical".
     */
    set_orientation(orientation) {
        const next = normalize_orientation(orientation);
        this.set_model_value('orientation', next);
        this.orientation = next;
    }

    /**
     * Set primary pane.
     * @param {string} primary - "first" or "second".
     */
    set_primary(primary) {
        const next = normalize_primary(primary);
        this.set_model_value('primary', next);
        this.primary = next;
    }

    /**
     * Set split size.
     * @param {number|string} size - Size in px or css string.
     */
    set_size(size) {
        const next = normalize_size(size);
        this.set_model_value('size', next);
        this.size = next;
        this.update_layout();
    }

    /**
     * Get split size.
     * @returns {number|string}
     */
    get_size() {
        return this.size;
    }

    /**
     * Set minimum size.
     * @param {number|null} min_size - Minimum size in px.
     */
    set_min_size(min_size) {
        const next = is_defined(min_size) ? Number(min_size) : null;
        this.set_model_value('min_size', next);
        this.min_size = Number.isFinite(next) ? next : null;
    }

    /**
     * Set maximum size.
     * @param {number|null} max_size - Maximum size in px.
     */
    set_max_size(max_size) {
        const next = is_defined(max_size) ? Number(max_size) : null;
        this.set_model_value('max_size', next);
        this.max_size = Number.isFinite(next) ? next : null;
    }

    compose_split_pane(spec = {}) {
        const { context } = this;

        const first_pane = new Control({ context, tag_name: 'div' });
        first_pane.add_class('split-pane-pane');
        first_pane.add_class('split-pane-pane-first');

        const handle = new Control({ context, tag_name: 'div' });
        handle.add_class('split-pane-handle');

        const second_pane = new Control({ context, tag_name: 'div' });
        second_pane.add_class('split-pane-pane');
        second_pane.add_class('split-pane-pane-second');

        if (Array.isArray(spec.panes)) {
            if (spec.panes[0]) first_pane.add(spec.panes[0]);
            if (spec.panes[1]) second_pane.add(spec.panes[1]);
        } else {
            if (spec.first) first_pane.add(spec.first);
            if (spec.second) second_pane.add(spec.second);
        }

        this.add(first_pane);
        this.add(handle);
        this.add(second_pane);

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.first_pane = first_pane;
        this._ctrl_fields.second_pane = second_pane;
        this._ctrl_fields.handle = handle;

        this.update_layout();
    }

    /**
     * Get the primary pane control.
     * @returns {Control}
     */
    get_primary_pane() {
        return this.primary === 'second'
            ? this._ctrl_fields.second_pane
            : this._ctrl_fields.first_pane;
    }

    /**
     * Get the secondary pane control.
     * @returns {Control}
     */
    get_secondary_pane() {
        return this.primary === 'second'
            ? this._ctrl_fields.first_pane
            : this._ctrl_fields.second_pane;
    }

    update_layout() {
        const first_pane = this._ctrl_fields && this._ctrl_fields.first_pane;
        const second_pane = this._ctrl_fields && this._ctrl_fields.second_pane;
        const handle = this._ctrl_fields && this._ctrl_fields.handle;
        if (!first_pane || !second_pane || !handle) return;

        const orientation = normalize_orientation(this.orientation);
        this.orientation = orientation;

        this.remove_class('split-pane-horizontal');
        this.remove_class('split-pane-vertical');
        this.add_class(`split-pane-${orientation}`);

        const primary_pane = this.get_primary_pane();
        const secondary_pane = this.get_secondary_pane();
        const size_value = size_to_css(this.size);

        first_pane.remove_class('split-pane-pane-primary');
        first_pane.remove_class('split-pane-pane-secondary');
        second_pane.remove_class('split-pane-pane-primary');
        second_pane.remove_class('split-pane-pane-secondary');
        primary_pane.add_class('split-pane-pane-primary');
        secondary_pane.add_class('split-pane-pane-secondary');

        primary_pane.dom.attributes.style.flex = `0 0 ${size_value}`;
        secondary_pane.dom.attributes.style.flex = '1 1 auto';

        if (orientation === 'horizontal') {
            handle.dom.attributes.style.width = `${this.handle_size}px`;
            handle.dom.attributes.style.height = '100%';
            handle.dom.attributes.style.cursor = 'col-resize';
        } else {
            handle.dom.attributes.style.height = `${this.handle_size}px`;
            handle.dom.attributes.style.width = '100%';
            handle.dom.attributes.style.cursor = 'row-resize';
        }
    }

    get_container_size() {
        if (!this.dom.el) return 0;
        const rect = this.dom.el.getBoundingClientRect();
        return this.orientation === 'vertical' ? rect.height : rect.width;
    }

    resolve_size_px() {
        const size = this.size;
        if (typeof size === 'number') return size;
        if (typeof size === 'string') {
            const trimmed = size.trim();
            if (trimmed.endsWith('%')) {
                const percent = Number(trimmed.replace('%', ''));
                if (Number.isFinite(percent)) {
                    return (this.get_container_size() * percent) / 100;
                }
            }
            const numeric = Number(trimmed);
            if (Number.isFinite(numeric)) return numeric;
        }
        return this.get_container_size() * 0.5;
    }

    clamp_size(next_size) {
        let size = next_size;
        if (Number.isFinite(this.min_size)) {
            size = Math.max(this.min_size, size);
        }
        if (Number.isFinite(this.max_size)) {
            size = Math.min(this.max_size, size);
        }
        return size;
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const handle = this._ctrl_fields && this._ctrl_fields.handle;
            if (!handle || !handle.dom.el || typeof document === 'undefined') return;

            let dragging = false;
            let start_pos = 0;
            let start_size = 0;

            const on_move = e_move => {
                if (!dragging) return;
                const current_pos = this.orientation === 'vertical' ? e_move.clientY : e_move.clientX;
                const delta = current_pos - start_pos;
                const next_size = this.clamp_size(start_size + delta);
                this.set_size(next_size);
            };

            const on_up = () => {
                if (!dragging) return;
                dragging = false;
                document.removeEventListener('mousemove', on_move);
                document.removeEventListener('mouseup', on_up);
                this.raise('resize', { size: this.size });
            };

            handle.add_dom_event_listener('mousedown', e_down => {
                e_down.preventDefault();
                dragging = true;
                start_pos = this.orientation === 'vertical' ? e_down.clientY : e_down.clientX;
                start_size = this.resolve_size_px();
                document.addEventListener('mousemove', on_move);
                document.addEventListener('mouseup', on_up);
            });
        }
    }
}

Split_Pane.css = `
.split-pane {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: stretch;
}
.split-pane-vertical {
    flex-direction: column;
}
.split-pane-pane {
    min-width: 0;
    min-height: 0;
}
.split-pane-handle {
    background: #e2e2e2;
}
`;

module.exports = Split_Pane;
