/**
 * Enhanced Counter Example - Client Side
 *
 * Demonstrates:
 * - Basic MVVM data binding
 * - Server-side rendering + client-side activation
 * - Computed properties
 * - Event handling in isomorphic context
 * - Undo/Redo functionality
 * - Keyboard shortcuts
 * - localStorage persistence
 * - Animations
 * - History tracking
 */

const jsgui = require('../../../html');
const bootstrap_client_controls = require('../../client_bootstrap');
const { Data_Object } = require('lang-tools');
const { Control, Active_HTML_Document } = jsgui;
const Data_Model_View_Model_Control = require('../../../html-core/Data_Model_View_Model_Control');

class Counter extends Data_Model_View_Model_Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'counter';
        super(spec);

        const saved_state = this._load_from_storage();
        const initial_count = saved_state && Number.isFinite(Number(saved_state.count))
            ? Number(saved_state.count)
            : this._coerce_number(spec.initialCount, 0);

        this.history = [];
        this.history_index = -1;
        this.max_history_size = 50;

        this.model = new Data_Object({
            count: initial_count,
            canUndo: false,
            canRedo: false,
            parity: initial_count % 2 === 0 ? 'even' : 'odd'
        });

        if (saved_state && Array.isArray(saved_state.history) && saved_state.history.length > 0) {
            this.history = saved_state.history
                .map(value => Number(value))
                .filter(value => Number.isFinite(value));

            if (this.history.length === 0) {
                this.history = [initial_count];
            }

            const saved_history_index = Number(saved_state.historyIndex);
            if (Number.isInteger(saved_history_index) && saved_history_index >= 0 && saved_history_index < this.history.length) {
                this.history_index = saved_history_index;
            } else {
                this.history_index = this.history.length - 1;
            }

            const restored_value = this.history[this.history_index];
            if (Number.isFinite(restored_value)) {
                this._set_model_value('count', restored_value);
                this._set_model_value('parity', restored_value % 2 === 0 ? 'even' : 'odd');
            }
        } else {
            this.history = [initial_count];
            this.history_index = 0;
        }

        this.add_class('counter');

        if (!spec.el) {
            this.compose_ui(spec.context);
        }

        this.watch(this.model, 'count', count => {
            const numeric_count = this._coerce_number(count, 0);
            this._render_count(numeric_count);
            this._set_model_value('parity', numeric_count % 2 === 0 ? 'even' : 'odd');
        }, { immediate: true });

        this.watch(this.model, 'parity', (parity, old_parity) => {
            this._render_parity(parity, old_parity);
        }, { immediate: true });

        this.watch(this.model, 'canUndo', can_undo => {
            this._render_button_enabled('undo_btn', '.undo-btn', !!can_undo);
        }, { immediate: true });

        this.watch(this.model, 'canRedo', can_redo => {
            this._render_button_enabled('redo_btn', '.redo-btn', !!can_redo);
        }, { immediate: true });

        this._update_history_buttons();
        this._render_history_display();
    }

    compose_ui(context) {
        const header = new Control({ context, tag_name: 'div' });
        header.add_class('counter-header');
        const title = new Control({ context, tag_name: 'h2' });
        title.add('Enhanced Counter');
        header.add(title);
        this.add(header);

        const display_panel = new Control({ context, tag_name: 'div' });
        display_panel.add_class('counter-display-panel');

        this.display = new Control({ context, tag_name: 'div' });
        this.display.add_class('counter-display');
        display_panel.add(this.display);

        this.parity_indicator = new Control({ context, tag_name: 'div' });
        this.parity_indicator.add_class('parity-indicator');
        display_panel.add(this.parity_indicator);
        this.add(display_panel);

        const main_controls = new Control({ context, tag_name: 'div' });
        main_controls.add_class('counter-controls');

        this.decrement_btn = new Control({ context, tag_name: 'button' });
        this.decrement_btn.add_class('counter-btn');
        this.decrement_btn.add_class('decrement');
        this.decrement_btn.add('-');
        this.decrement_btn.dom.attributes.title = 'Decrement (Arrow Down)';

        this.increment_btn = new Control({ context, tag_name: 'button' });
        this.increment_btn.add_class('counter-btn');
        this.increment_btn.add_class('increment');
        this.increment_btn.add('+');
        this.increment_btn.dom.attributes.title = 'Increment (Arrow Up)';

        this.reset_btn = new Control({ context, tag_name: 'button' });
        this.reset_btn.add_class('counter-btn');
        this.reset_btn.add_class('reset');
        this.reset_btn.add('Reset');
        this.reset_btn.dom.attributes.title = 'Reset to 0 (R)';

        main_controls.add(this.decrement_btn);
        main_controls.add(this.increment_btn);
        main_controls.add(this.reset_btn);
        this.add(main_controls);

        const history_controls = new Control({ context, tag_name: 'div' });
        history_controls.add_class('history-controls');

        this.undo_btn = new Control({ context, tag_name: 'button' });
        this.undo_btn.add_class('history-btn');
        this.undo_btn.add_class('undo-btn');
        this.undo_btn.add('Undo');
        this.undo_btn.dom.attributes.title = 'Undo (Ctrl+Z)';

        this.redo_btn = new Control({ context, tag_name: 'button' });
        this.redo_btn.add_class('history-btn');
        this.redo_btn.add_class('redo-btn');
        this.redo_btn.add('Redo');
        this.redo_btn.dom.attributes.title = 'Redo (Ctrl+Y)';

        this.clear_history_btn = new Control({ context, tag_name: 'button' });
        this.clear_history_btn.add_class('history-btn');
        this.clear_history_btn.add_class('clear-history-btn');
        this.clear_history_btn.add('Clear History');

        history_controls.add(this.undo_btn);
        history_controls.add(this.redo_btn);
        history_controls.add(this.clear_history_btn);
        this.add(history_controls);

        const stats_panel = new Control({ context, tag_name: 'div' });
        stats_panel.add_class('counter-stats');

        this.history_size = new Control({ context, tag_name: 'div' });
        this.history_size.add_class('stat-item');
        stats_panel.add(this.history_size);
        this.add(stats_panel);

        const help_panel = new Control({ context, tag_name: 'div' });
        help_panel.add_class('counter-help');
        help_panel.add('Keyboard: Up/Down = Inc/Dec | R = Reset | Ctrl+Z/Y = Undo/Redo');
        this.add(help_panel);

        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.display = this.display;
        this._ctrl_fields.parity_indicator = this.parity_indicator;
        this._ctrl_fields.decrement_btn = this.decrement_btn;
        this._ctrl_fields.increment_btn = this.increment_btn;
        this._ctrl_fields.reset_btn = this.reset_btn;
        this._ctrl_fields.undo_btn = this.undo_btn;
        this._ctrl_fields.redo_btn = this.redo_btn;
        this._ctrl_fields.clear_history_btn = this.clear_history_btn;
        this._ctrl_fields.history_size = this.history_size;
    }

    _get_storage() {
        if (typeof localStorage === 'undefined' || !localStorage) {
            return null;
        }
        if (typeof localStorage.getItem !== 'function' || typeof localStorage.setItem !== 'function') {
            return null;
        }
        return localStorage;
    }

    _coerce_number(value, fallback = 0) {
        if (value && typeof value.value === 'function') {
            value = value.value();
        } else if (value && value.value !== undefined && typeof value !== 'number') {
            value = value.value;
        } else if (value && typeof value.get === 'function' && typeof value !== 'number') {
            value = value.get();
        }

        const numeric_value = Number(value);
        return Number.isFinite(numeric_value) ? numeric_value : fallback;
    }

    _get_model_value(name) {
        if (!this.model) return undefined;
        if (this.model[name] !== undefined) {
            return this.model[name];
        }
        if (typeof this.model.get === 'function') {
            return this.model.get(name);
        }
        return undefined;
    }

    _set_model_value(name, value) {
        if (!this.model) return;
        if (typeof this.model.set === 'function') {
            this.model.set(name, value);
        } else {
            this.model[name] = value;
        }
    }

    _get_count() {
        return this._coerce_number(this._get_model_value('count'), 0);
    }

    _get_part_ctrl(name) {
        return this[name] || (this._ctrl_fields && this._ctrl_fields[name]) || null;
    }

    _get_part_el(name, selector) {
        const ctrl = this._get_part_ctrl(name);
        if (ctrl && ctrl.dom && ctrl.dom.el) {
            return ctrl.dom.el;
        }
        if (this.dom && this.dom.el && selector) {
            return this.dom.el.querySelector(selector);
        }
        return null;
    }

    _set_control_text(name, selector, text) {
        const next_text = String(text);
        const ctrl = this._get_part_ctrl(name);
        if (ctrl) {
            if (ctrl.dom && ctrl.dom.el) {
                ctrl.dom.el.textContent = next_text;
            } else if (ctrl.content) {
                ctrl.content.clear();
                ctrl.add(next_text);
            }
        }

        const el = this._get_part_el(name, selector);
        if (el) {
            el.textContent = next_text;
        }
    }

    _render_count(value) {
        this._set_control_text('display', '.counter-display', value);
    }

    _render_parity(parity, old_parity) {
        const next_parity = parity === 'odd' ? 'odd' : 'even';
        const previous_parity = old_parity === 'odd' || old_parity === 'even' ? old_parity : null;
        const controls = [
            this._get_part_ctrl('display'),
            this._get_part_ctrl('parity_indicator')
        ];
        const elements = [
            this._get_part_el('display', '.counter-display'),
            this._get_part_el('parity_indicator', '.parity-indicator')
        ];

        controls.forEach(ctrl => {
            if (!ctrl) return;
            if (previous_parity) {
                ctrl.remove_class(previous_parity);
            }
            ctrl.remove_class(next_parity === 'even' ? 'odd' : 'even');
            ctrl.add_class(next_parity);
        });

        elements.forEach(el => {
            if (!el || !el.classList) return;
            if (previous_parity) {
                el.classList.remove(previous_parity);
            }
            el.classList.remove(next_parity === 'even' ? 'odd' : 'even');
            el.classList.add(next_parity);
        });

        this._set_control_text('parity_indicator', '.parity-indicator', next_parity.toUpperCase());
    }

    _render_button_enabled(name, selector, enabled) {
        const ctrl = this._get_part_ctrl(name);
        if (ctrl) {
            if (enabled) {
                ctrl.remove_class('disabled');
                delete ctrl.dom.attributes.disabled;
            } else {
                ctrl.add_class('disabled');
                ctrl.dom.attributes.disabled = 'disabled';
            }
            if (ctrl.dom && ctrl.dom.el) {
                ctrl.dom.el.disabled = !enabled;
            }
        }

        const el = this._get_part_el(name, selector);
        if (el) {
            el.disabled = !enabled;
            el.classList.toggle('disabled', !enabled);
        }
    }

    _render_history_display() {
        this._set_control_text(
            'history_size',
            '.counter-stats .stat-item',
            `History: ${this.history_index + 1} of ${this.history.length} items`
        );
    }

    _update_history_buttons() {
        this._set_model_value('canUndo', this.history_index > 0);
        this._set_model_value('canRedo', this.history_index < this.history.length - 1);
    }

    _push_history(value) {
        this.history.splice(this.history_index + 1);
        this.history.push(value);

        if (this.history.length > this.max_history_size) {
            this.history.shift();
        } else {
            this.history_index++;
        }

        this._update_history_buttons();
        this._render_history_display();
    }

    _animate_display_change() {
        const display_ctrl = this._get_part_ctrl('display');
        const display_el = this._get_part_el('display', '.counter-display');

        if (display_ctrl) {
            display_ctrl.add_class('changing');
        }
        if (display_el) {
            display_el.classList.add('changing');
        }

        if (typeof setTimeout === 'function') {
            setTimeout(() => {
                if (display_ctrl) {
                    display_ctrl.remove_class('changing');
                }
                if (display_el) {
                    display_el.classList.remove('changing');
                }
            }, 300);
        }
    }

    _set_count(value, add_to_history = true) {
        const numeric_value = this._coerce_number(value, 0);
        const current_value = this._get_count();

        if (numeric_value === current_value && add_to_history) {
            return;
        }

        this._animate_display_change();
        this._set_model_value('count', numeric_value);

        if (add_to_history) {
            this._push_history(numeric_value);
        } else {
            this._update_history_buttons();
            this._render_history_display();
        }

        this._save_to_storage();
    }

    _undo() {
        if (this.history_index > 0) {
            this.history_index--;
            this._set_count(this.history[this.history_index], false);
        }
    }

    _redo() {
        if (this.history_index < this.history.length - 1) {
            this.history_index++;
            this._set_count(this.history[this.history_index], false);
        }
    }

    _clear_history() {
        this._set_model_value('count', 0);
        this.history = [0];
        this.history_index = 0;
        this._update_history_buttons();
        this._render_history_display();
        this._save_to_storage();
    }

    _save_to_storage() {
        const storage = this._get_storage();
        if (!storage) {
            return;
        }

        storage.setItem('counter_state', JSON.stringify({
            count: this._get_count(),
            history: this.history.slice(),
            historyIndex: this.history_index
        }));
    }

    _load_from_storage() {
        const storage = this._get_storage();
        if (!storage) {
            return null;
        }

        const saved = storage.getItem('counter_state');
        if (!saved) {
            return null;
        }

        try {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === 'object') {
                return parsed;
            }
        } catch (err) {
            return null;
        }

        return null;
    }

    _bind_dom_click(selector, handler) {
        if (!this.dom || !this.dom.el) return;
        const el = this.dom.el.querySelector(selector);
        if (!el) return;
        el.addEventListener('click', handler);
    }

    _render_all() {
        this._render_count(this._get_count());
        this._render_parity(this._get_model_value('parity'), null);
        this._render_history_display();
        this._render_button_enabled('undo_btn', '.undo-btn', !!this._get_model_value('canUndo'));
        this._render_button_enabled('redo_btn', '.redo-btn', !!this._get_model_value('canRedo'));
    }

    activate() {
        if (!this.__active) {
            super.activate();

            this._bind_dom_click('.decrement', () => {
                this._set_count(this._get_count() - 1);
            });

            this._bind_dom_click('.increment', () => {
                this._set_count(this._get_count() + 1);
            });

            this._bind_dom_click('.reset', () => {
                this._set_count(0);
            });

            this._bind_dom_click('.undo-btn', () => {
                this._undo();
            });

            this._bind_dom_click('.redo-btn', () => {
                this._redo();
            });

            this._bind_dom_click('.clear-history-btn', () => {
                this._clear_history();
            });

            if (typeof document !== 'undefined') {
                document.addEventListener('keydown', e => {
                    if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        this._set_count(this._get_count() + 1);
                    } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        this._set_count(this._get_count() - 1);
                    } else if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) {
                        this._set_count(0);
                    } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                        e.preventDefault();
                        this._undo();
                    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                        e.preventDefault();
                        this._redo();
                    }
                });
            }

            this._update_history_buttons();
            this._render_all();
        }
    }
}

Counter.css = `
    .counter {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 32px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        max-width: 500px;
        margin: 0 auto;
    }

    .counter-header h2 {
        margin: 0;
        font-size: 24px;
        color: #333;
        text-align: center;
    }

    .counter-display-panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .counter-display {
        font-size: 4em;
        font-weight: 900;
        color: white;
        text-align: center;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .counter-display.changing {
        transform: scale(1.2);
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
    }

    .parity-indicator {
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        background: rgba(255,255,255,0.2);
        color: white;
        transition: all 0.3s;
    }

    .counter-controls {
        display: flex;
        gap: 12px;
        justify-content: center;
    }

    .counter-btn {
        padding: 14px 28px;
        font-size: 1.1em;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 600;
        flex: 1;
        max-width: 150px;
    }

    .counter-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }

    .counter-btn:active {
        transform: translateY(0);
    }

    .counter-btn.increment {
        background: #4caf50;
        color: white;
    }

    .counter-btn.decrement {
        background: #f44336;
        color: white;
    }

    .counter-btn.reset {
        background: #ff9800;
        color: white;
    }

    .history-controls {
        display: flex;
        gap: 8px;
        justify-content: center;
        padding-top: 8px;
        border-top: 1px solid #eee;
    }

    .history-btn {
        padding: 10px 20px;
        font-size: 0.9em;
        border: 2px solid #ddd;
        border-radius: 6px;
        background: white;
        color: #666;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
    }

    .history-btn:hover:not(.disabled) {
        border-color: #667eea;
        color: #667eea;
        background: #f8f9ff;
    }

    .history-btn.disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .undo-btn:hover:not(.disabled),
    .redo-btn:hover:not(.disabled) {
        background: #667eea;
        color: white;
    }

    .clear-history-btn:hover {
        border-color: #f44336;
        color: #f44336;
        background: #ffebee;
    }

    .counter-stats {
        display: flex;
        justify-content: center;
        gap: 16px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
    }

    .stat-item {
        font-size: 0.85em;
        color: #666;
        font-weight: 500;
    }

    .counter-help {
        text-align: center;
        font-size: 0.8em;
        color: #999;
        padding: 12px;
        background: #fafafa;
        border-radius: 6px;
        line-height: 1.6;
    }
`;

class Demo_UI extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'counter_demo_ui';
        super(spec);

        const { context } = this;

        if (typeof this.body.add_class === 'function') {
            this.body.add_class('counter-demo');
        }

        if (!spec.el) {
            const title = new Control({ context, tag_name: 'h1' });
            title.add('Enhanced Counter with History & Keyboard Shortcuts');
            title.add_class('demo-title');

            const description = new Control({ context, tag_name: 'p' });
            description.add('A fully-featured counter with undo/redo, localStorage persistence, animations, and keyboard shortcuts. ' +
                'Server-rendered and client-activated with MVVM data binding.');
            description.add_class('demo-description');

            const counter = new Counter({
                context,
                initialCount: 0
            });

            const info = new Control({ context, tag_name: 'div' });
            info.add_class('demo-info');
            info.add('Tip: click the buttons and use the keyboard shortcuts to exercise the history state.');

            this.body.add(title);
            this.body.add(description);
            this.body.add(counter);
            this.body.add(info);
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
            console.log('Counter Demo UI activated');
        }
    }
}

Demo_UI.css = `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 40px 20px;
    }

    .counter-demo {
        max-width: 800px;
        margin: 0 auto;
    }

    .demo-title {
        color: white;
        text-align: center;
        margin-bottom: 20px;
        font-size: 2.5em;
        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .demo-description {
        color: white;
        text-align: center;
        margin-bottom: 40px;
        font-size: 1.2em;
        line-height: 1.6;
        opacity: 0.9;
    }

    .demo-info {
        color: white;
        text-align: center;
        margin-top: 40px;
        padding: 20px;
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        line-height: 1.6;
    }
`;

jsgui.controls = jsgui.controls || {};
jsgui.controls.Demo_UI = Demo_UI;
jsgui.controls.Counter = Counter;

bootstrap_client_controls(jsgui, {
    counter: Counter,
    counter_demo_ui: Demo_UI
}, {
    bootstrap_key: '__jsgui_counter_demo_context__'
});

module.exports = jsgui;
