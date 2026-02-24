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

        // ── Adaptive layout options (all overridable) ──
        // layout_mode: 'auto' | 'phone' | 'tablet' | 'desktop'
        this.layout_mode = spec.layout_mode || 'auto';
        // Breakpoint for compact step indicator
        this.phone_breakpoint = is_defined(spec.phone_breakpoint) ? Number(spec.phone_breakpoint) : 600;
        // Whether to show compact indicator on phone (progress bar instead of dots)
        this.phone_compact_indicator = spec.phone_compact_indicator !== false;

        if (!spec.el) this.compose();
    }

    /**
     * Resolve the current layout mode.
     * @returns {'phone'|'tablet'|'desktop'}
     */
    resolve_layout_mode() {
        if (this.layout_mode !== 'auto') return this.layout_mode;
        if (this.context && this.context.view_environment && this.context.view_environment.layout_mode) {
            return this.context.view_environment.layout_mode;
        }
        if (typeof window !== 'undefined') {
            if (window.innerWidth < this.phone_breakpoint) return 'phone';
        }
        return 'desktop';
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

            // Apply initial layout mode
            const mode = this.resolve_layout_mode();
            this.dom.el.setAttribute('data-layout-mode', mode);

            // Listen for resize
            if (this.layout_mode === 'auto' && typeof window !== 'undefined') {
                this._resize_handler = () => {
                    this.dom.el.setAttribute('data-layout-mode', this.resolve_layout_mode());
                };
                window.addEventListener('resize', this._resize_handler);
            }

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
/* ─── Wizard ─── */
.jsgui-wizard {
    display: flex;
    flex-direction: column;
    color: var(--admin-text, #1e1e1e);
}
.wizard-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 8px;
}
.wizard-step-dot {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border: 1px solid var(--admin-border, #e0e0e0);
    border-radius: 20px;
    background: var(--admin-card-bg, #fff);
    color: var(--admin-muted, #999);
    cursor: pointer;
    min-height: var(--j-touch-target, 36px);
    font-size: 13px;
    white-space: nowrap;
    transition: background 0.15s, border-color 0.15s;
}
.wizard-step-dot:hover {
    background: var(--admin-hover-bg, #f0f0f0);
}
.wizard-step-dot.is-active {
    border-color: var(--admin-accent, #0078d4);
    background: var(--admin-accent, #0078d4);
    color: #fff;
}
.wizard-step-dot.is-completed {
    border-color: var(--j-success, #28a745);
    color: var(--j-success, #28a745);
}
.wizard-step-num {
    font-weight: 600;
}
.wizard-connector {
    flex: 1;
    height: 2px;
    min-width: 16px;
    background: var(--admin-border, #e0e0e0);
}
.wizard-panels {
    flex: 1;
    padding: 12px 0;
}
.wizard-panel.is-hidden {
    display: none;
}
.wizard-nav {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    gap: 8px;
}
.wizard-btn {
    padding: 8px 16px;
    border: 1px solid var(--admin-border, #e0e0e0);
    border-radius: var(--j-radius, 4px);
    background: var(--admin-card-bg, #fff);
    color: var(--admin-text, #333);
    cursor: pointer;
    min-height: var(--j-touch-target, 36px);
    transition: background 0.12s;
}
.wizard-btn:hover {
    background: var(--admin-hover-bg, #f0f0f0);
}
.wizard-btn--finish {
    background: var(--admin-accent, #0078d4);
    color: #fff;
    border-color: var(--admin-accent, #0078d4);
}
.wizard-btn--finish:hover {
    opacity: 0.9;
}
.wizard-btn.is-hidden {
    visibility: hidden;
}

/* ── Phone layout: compact indicator ── */
.jsgui-wizard[data-layout-mode="phone"] .wizard-indicator {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 8px 4px;
}
.jsgui-wizard[data-layout-mode="phone"] .wizard-step-label {
    display: none;
}
.jsgui-wizard[data-layout-mode="phone"] .wizard-step-dot {
    min-height: 44px;
    min-width: 44px;
    justify-content: center;
    padding: 6px;
}
.jsgui-wizard[data-layout-mode="phone"] .wizard-connector {
    min-width: 8px;
}
.jsgui-wizard[data-layout-mode="phone"] .wizard-btn {
    min-height: 44px;
    flex: 1;
}
`;

module.exports = Wizard;
