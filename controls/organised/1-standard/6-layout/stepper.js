const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const { ensure_control_models } = require('../../../../html-core/control_model_factory');

const normalize_steps = steps => {
    if (!Array.isArray(steps)) return [];
    return steps.map((step, index) => {
        if (step && typeof step === 'object') {
            return {
                id: is_defined(step.id) ? String(step.id) : `step-${index}`,
                title: is_defined(step.title) ? step.title : `Step ${index + 1}`,
                content: step.content,
                completed: !!step.completed
            };
        }
        return {
            id: `step-${index}`,
            title: String(step),
            content: undefined,
            completed: false
        };
    });
};

class Stepper extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'stepper';
        super(spec);
        this.add_class('stepper');
        this.dom.tagName = 'div';

        ensure_control_models(this, spec);
        this.model = this.data.model;

        this.set_steps(spec.steps || []);
        this.set_current_step(is_defined(spec.current_step) ? spec.current_step : 0);

        if (!spec.el) {
            this.compose();
        }

        this.bind_model();
    }

    bind_model() {
        if (!this.model || typeof this.model.on !== 'function') return;

        this.model.on('change', e_change => {
            if (e_change.name === 'steps') {
                this.steps = normalize_steps(e_change.value);
                this.render_steps();
            }
            if (e_change.name === 'current_step') {
                this.current_step = Number(e_change.value) || 0;
                this.render_steps();
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
     * Set steps.
     * @param {Array} steps - Steps to set.
     */
    set_steps(steps) {
        const normalized = normalize_steps(steps);
        this.set_model_value('steps', normalized);
        this.steps = normalized;
    }

    /**
     * Set current step index.
     * @param {number} index - Step index.
     */
    set_current_step(index) {
        const next_index = Math.max(0, Number(index) || 0);
        this.set_model_value('current_step', next_index);
        this.current_step = next_index;
    }

    /**
     * Get current step index.
     * @returns {number}
     */
    get_current_step() {
        return this.current_step || 0;
    }

    /**
     * Mark a step completed.
     * @param {number} index - Step index.
     */
    mark_completed(index) {
        if (!Array.isArray(this.steps)) return;
        const next_steps = this.steps.slice();
        if (next_steps[index]) {
            next_steps[index] = { ...next_steps[index], completed: true };
            this.set_steps(next_steps);
        }
    }

    /**
     * Move to next step.
     */
    next() {
        const next_index = Math.min(this.steps.length - 1, this.get_current_step() + 1);
        this.set_current_step(next_index);
        this.raise('step_change', { current_step: this.current_step });
    }

    /**
     * Move to previous step.
     */
    previous() {
        const next_index = Math.max(0, this.get_current_step() - 1);
        this.set_current_step(next_index);
        this.raise('step_change', { current_step: this.current_step });
    }

    compose() {
        const { context } = this;

        const header_ctrl = new Control({ context, tag_name: 'ol' });
        header_ctrl.add_class('stepper-header');

        const body_ctrl = new Control({ context, tag_name: 'div' });
        body_ctrl.add_class('stepper-body');

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.header = header_ctrl;
        this._ctrl_fields.body = body_ctrl;

        this.add(header_ctrl);
        this.add(body_ctrl);

        this.render_steps();
    }

    render_steps() {
        const header_ctrl = this._ctrl_fields && this._ctrl_fields.header;
        const body_ctrl = this._ctrl_fields && this._ctrl_fields.body;
        if (!header_ctrl || !body_ctrl) return;

        header_ctrl.clear();
        body_ctrl.clear();

        const steps = this.steps || [];
        const current_index = this.get_current_step();

        steps.forEach((step, index) => {
            const item_ctrl = new Control({ context: this.context, tag_name: 'li' });
            item_ctrl.add_class('stepper-step');
            if (index === current_index) item_ctrl.add_class('is-current');
            if (step.completed) item_ctrl.add_class('is-complete');

            const button_ctrl = new Control({ context: this.context, tag_name: 'button' });
            button_ctrl.dom.attributes.type = 'button';
            button_ctrl.dom.attributes['data-step-index'] = String(index);
            button_ctrl.add_class('stepper-step-button');
            button_ctrl.dom.attributes['aria-current'] = index === current_index ? 'step' : 'false';
            button_ctrl.add(step.title);

            item_ctrl.add(button_ctrl);
            header_ctrl.add(item_ctrl);
        });

        const current_step = steps[current_index];
        if (current_step && is_defined(current_step.content)) {
            body_ctrl.add(current_step.content);
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const header_ctrl = this._ctrl_fields && this._ctrl_fields.header;
            if (!header_ctrl || !header_ctrl.dom.el) return;

            header_ctrl.add_dom_event_listener('click', e_click => {
                const target = e_click.target;
                if (!target || !target.getAttribute) return;
                const index_str = target.getAttribute('data-step-index');
                if (!is_defined(index_str)) return;
                const index = Number(index_str);
                if (!Number.isFinite(index)) return;
                this.set_current_step(index);
                this.raise('step_change', { current_step: this.current_step });
            });
        }
    }
}

Stepper.css = `
.stepper {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.stepper-header {
    list-style: none;
    display: flex;
    gap: 8px;
    padding: 0;
    margin: 0;
}
.stepper-step {
    flex: 1;
}
.stepper-step-button {
    width: 100%;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
    background: #fff;
    cursor: pointer;
}
.stepper-step.is-current .stepper-step-button {
    border-color: #666;
    background: #f5f5f5;
}
.stepper-step.is-complete .stepper-step-button {
    border-color: #3c8c3c;
}
.stepper-body {
    border: 1px solid #eee;
    padding: 12px;
    border-radius: 8px;
    background: #fff;
}
`;

module.exports = Stepper;
