/**
 * Wizard — Multi-step form/workflow control with step indicators,
 * prev/next navigation, and validation hooks.
 *
 * Options:
 *   steps         — Array of { id, title, content?, icon?, validate? }
 *   active_step   — Initial step index (default 0)
 *   linear        — Force linear progression (default true)
 *   on_complete   — Called when last step finishes
 *   on_step_change — Called on every step change
 *
 * Events: step_change({ from, to, step }), complete({ steps })
 */
const Control = require('../../../../html-core/control');
const { is_defined } = require('../../../../html-core/html-core');

class Wizard extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'wizard';
        super(spec);
        this.add_class('wizard');
        this.add_class('jsgui-wizard');
        this.dom.tagName = 'div';

        this.steps = (spec.steps || []).map((s, i) => ({
            id: s.id || `step-${i}`,
            title: s.title || `Step ${i + 1}`,
            content: s.content || '',
            icon: s.icon || null,
            validate: s.validate || null,
            completed: false
        }));

        this.active_index = spec.active_step || 0;
        this.linear = spec.linear !== false;
        this.on_complete = spec.on_complete || null;
        this.on_step_change = spec.on_step_change || null;

        if (!spec.el) this.compose();
    }

    compose() {
        // Step indicators
        this._indicator = new Control({ context: this.context, tag_name: 'div' });
        this._indicator.add_class('wizard-indicator');
        this._indicator.dom.attributes.role = 'tablist';

        this.steps.forEach((step, i) => {
            const dot = new Control({ context: this.context, tag_name: 'button' });
            dot.add_class('wizard-step-dot');
            dot.dom.attributes.type = 'button';
            dot.dom.attributes['data-step-index'] = String(i);
            dot.dom.attributes.role = 'tab';
            dot.dom.attributes['aria-label'] = step.title;

            if (step.icon) {
                const icon_span = new Control({ context: this.context, tag_name: 'span' });
                icon_span.add_class('wizard-step-icon');
                icon_span.add(step.icon);
                dot.add(icon_span);
            } else {
                const num_span = new Control({ context: this.context, tag_name: 'span' });
                num_span.add_class('wizard-step-num');
                num_span.add(String(i + 1));
                dot.add(num_span);
            }

            const label_span = new Control({ context: this.context, tag_name: 'span' });
            label_span.add_class('wizard-step-label');
            label_span.add(step.title);
            dot.add(label_span);

            if (i === this.active_index) dot.add_class('is-active');
            if (step.completed) dot.add_class('is-completed');

            // Connector line (except last)
            if (i < this.steps.length - 1) {
                const connector = new Control({ context: this.context, tag_name: 'div' });
                connector.add_class('wizard-connector');
                this._indicator.add(dot);
                this._indicator.add(connector);
            } else {
                this._indicator.add(dot);
            }
        });

        this.add(this._indicator);

        // Content panels
        this._panels = new Control({ context: this.context, tag_name: 'div' });
        this._panels.add_class('wizard-panels');

        this.steps.forEach((step, i) => {
            const panel = new Control({ context: this.context, tag_name: 'div' });
            panel.add_class('wizard-panel');
            panel.dom.attributes['data-step-index'] = String(i);
            panel.dom.attributes.role = 'tabpanel';
            if (i !== this.active_index) panel.add_class('is-hidden');
            if (is_defined(step.content)) panel.add(step.content);
            this._panels.add(panel);
        });

        this.add(this._panels);

        // Navigation buttons
        this._nav = new Control({ context: this.context, tag_name: 'div' });
        this._nav.add_class('wizard-nav');

        this._prev_btn = new Control({ context: this.context, tag_name: 'button' });
        this._prev_btn.add_class('wizard-btn');
        this._prev_btn.add_class('wizard-btn--prev');
        this._prev_btn.dom.attributes.type = 'button';
        this._prev_btn.add('← Back');

        this._next_btn = new Control({ context: this.context, tag_name: 'button' });
        this._next_btn.add_class('wizard-btn');
        this._next_btn.add_class('wizard-btn--next');
        this._next_btn.dom.attributes.type = 'button';
        this._next_btn.add('Next →');

        this._nav.add(this._prev_btn);
        this._nav.add(this._next_btn);
        this.add(this._nav);

        this._update_nav_state();
    }

    _update_nav_state() {
        if (this.active_index === 0) {
            this._prev_btn.add_class('is-hidden');
        } else {
            this._prev_btn.remove_class('is-hidden');
        }

        const is_last = this.active_index === this.steps.length - 1;
        // Update next button text based on position
        // (can't easily change text server-side after compose, handled in activate)
        if (is_last) {
            this._next_btn.add_class('wizard-btn--finish');
        } else {
            this._next_btn.remove_class('wizard-btn--finish');
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            // Step dot clicks
            this.dom.el.querySelectorAll('.wizard-step-dot').forEach(dot => {
                dot.addEventListener('click', () => {
                    const idx = parseInt(dot.getAttribute('data-step-index'), 10);
                    if (!this.linear || idx <= this._max_reachable()) {
                        this.go_to(idx);
                    }
                });
            });

            // Prev/Next buttons
            const prev = this.dom.el.querySelector('.wizard-btn--prev');
            const next = this.dom.el.querySelector('.wizard-btn--next');

            if (prev) prev.addEventListener('click', () => this.prev());
            if (next) next.addEventListener('click', () => {
                if (this.active_index === this.steps.length - 1) {
                    this.finish();
                } else {
                    this.next();
                }
            });

            this._sync_ui();
        }
    }

    _max_reachable() {
        for (let i = 0; i < this.steps.length; i++) {
            if (!this.steps[i].completed && i !== this.active_index) return i;
        }
        return this.steps.length - 1;
    }

    go_to(index) {
        if (index < 0 || index >= this.steps.length) return;
        if (index === this.active_index) return;

        const from = this.active_index;
        this.active_index = index;

        this.raise('step_change', {
            from,
            to: index,
            step: this.steps[index]
        });

        if (this.on_step_change) {
            this.on_step_change(from, index, this.steps[index]);
        }

        this._sync_ui();
    }

    next() {
        // Validate current step
        const current = this.steps[this.active_index];
        if (current.validate && typeof current.validate === 'function') {
            const valid = current.validate();
            if (!valid) return;
        }
        current.completed = true;
        this.go_to(this.active_index + 1);
    }

    prev() {
        this.go_to(this.active_index - 1);
    }

    finish() {
        const current = this.steps[this.active_index];
        if (current.validate && typeof current.validate === 'function') {
            const valid = current.validate();
            if (!valid) return;
        }
        current.completed = true;
        this.raise('complete', { steps: this.steps });
        if (this.on_complete) this.on_complete(this.steps);
    }

    _sync_ui() {
        if (!this.dom.el) return;

        // Panels
        this.dom.el.querySelectorAll('.wizard-panel').forEach(panel => {
            const idx = parseInt(panel.getAttribute('data-step-index'), 10);
            panel.classList.toggle('is-hidden', idx !== this.active_index);
        });

        // Dots
        this.dom.el.querySelectorAll('.wizard-step-dot').forEach(dot => {
            const idx = parseInt(dot.getAttribute('data-step-index'), 10);
            dot.classList.toggle('is-active', idx === this.active_index);
            dot.classList.toggle('is-completed', this.steps[idx].completed);
        });

        // Nav buttons
        const prev = this.dom.el.querySelector('.wizard-btn--prev');
        const next = this.dom.el.querySelector('.wizard-btn--next');
        if (prev) prev.classList.toggle('is-hidden', this.active_index === 0);
        if (next) {
            const is_last = this.active_index === this.steps.length - 1;
            next.textContent = is_last ? 'Finish ✓' : 'Next →';
            next.classList.toggle('wizard-btn--finish', is_last);
        }
    }

    get_active_step() {
        return this.steps[this.active_index];
    }

    get_progress() {
        const completed = this.steps.filter(s => s.completed).length;
        return { completed, total: this.steps.length, percent: Math.round((completed / this.steps.length) * 100) };
    }
}

Wizard.css = `
.wizard {
    display: flex;
    flex-direction: column;
}
.wizard-indicator {
    display: flex;
    align-items: center;
}
.wizard-panel.is-hidden {
    display: none;
}
.wizard-btn.is-hidden {
    visibility: hidden;
}
`;

module.exports = Wizard;
