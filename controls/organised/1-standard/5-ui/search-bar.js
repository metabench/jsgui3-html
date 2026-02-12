const jsgui = require('../../../../html-core/html-core');

const { Control } = jsgui;
const { is_defined } = jsgui;
const { themeable } = require('../../../../control_mixins/themeable');

/**
 * Search_Bar — Text input with search icon, clear button, and optional loading state.
 *
 * @param {Object} spec
 * @param {string} [spec.placeholder='Search...'] — Placeholder text
 * @param {string} [spec.value] — Initial value
 * @param {string} [spec.size] — Size: sm, md (default), lg
 * @param {boolean} [spec.pill] — Pill-shaped border radius
 * @param {boolean} [spec.loading] — Show loading spinner
 * @param {string} [spec.icon='🔍'] — Search icon
 *
 * Events:
 *   'change' { value } — Fired when text changes
 *   'search' { value } — Fired on Enter key
 *   'clear' — Fired when clear button clicked
 */
class Search_Bar extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'search_bar';
        super(spec);
        this.add_class('search-bar');
        this.add_class('jsgui-search-bar');

        // Apply themeable
        themeable(this, 'search_bar', spec);

        // Size
        const size = spec.size || '';
        if (size && size !== 'md') {
            this.dom.attributes['data-size'] = size;
        }

        // Pill shape
        if (spec.pill) this.add_class('pill');

        // Loading
        this._loading = !!spec.loading;
        if (this._loading) this.add_class('loading');

        // Config
        this._placeholder = spec.placeholder || 'Search\u2026';
        this._icon_text = spec.icon || '🔍';
        this._value = is_defined(spec.value) ? String(spec.value) : '';

        if (!spec.el) {
            this.compose(spec);
        }
    }

    compose(spec) {
        const { context } = this;

        // Search icon
        const icon = new Control({ context, tag_name: 'span' });
        icon.add_class('search-icon');
        icon.add(this._icon_text);
        this.add(icon);

        // Input
        this._input = new Control({ context, tag_name: 'input' });
        this._input.add_class('search-input');
        this._input.dom.attributes.type = 'search';
        this._input.dom.attributes.placeholder = this._placeholder;
        if (this._value) {
            this._input.dom.attributes.value = this._value;
        }
        this.add(this._input);

        // Clear button
        this._clear_btn = new Control({ context, tag_name: 'button' });
        this._clear_btn.add_class('search-clear');
        this._clear_btn.dom.attributes.type = 'button';
        this._clear_btn.dom.attributes['aria-label'] = 'Clear search';
        this._clear_btn.dom.attributes.tabindex = '-1';
        this._clear_btn.add('×');
        this.add(this._clear_btn);

        // Mark has-value if initial value
        if (this._value) this.add_class('has-value');
    }

    // ── Public API ──

    get_value() {
        return this._value;
    }

    set_value(v) {
        this._value = is_defined(v) ? String(v) : '';
        if (this._input && this._input.dom.el) {
            this._input.dom.el.value = this._value;
        }
        this._update_has_value();
    }

    set_loading(v) {
        this._loading = !!v;
        if (this._loading) this.add_class('loading');
        else this.remove_class('loading');
    }

    set_placeholder(text) {
        this._placeholder = text || '';
        if (this._input && this._input.dom.el) {
            this._input.dom.el.placeholder = this._placeholder;
        }
    }

    _update_has_value() {
        if (this._value) this.add_class('has-value');
        else this.remove_class('has-value');
    }

    // ── Activation ──

    activate() {
        if (!this.__active) {
            super.activate();
            const input_el = this._input && this._input.dom.el;
            const clear_el = this._clear_btn && this._clear_btn.dom.el;
            if (!input_el) return;

            // Text change
            input_el.addEventListener('input', () => {
                this._value = input_el.value;
                this._update_has_value();
                this.raise('change', { value: this._value });
            });

            // Enter to search
            input_el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.raise('search', { value: this._value });
                }
            });

            // Clear button
            if (clear_el) {
                clear_el.addEventListener('click', () => {
                    this._value = '';
                    input_el.value = '';
                    this._update_has_value();
                    input_el.focus();
                    this.raise('clear');
                    this.raise('change', { value: '' });
                });
            }
        }
    }
}

// Legacy CSS for backward compat
Search_Bar.css = `
.search-bar {
    display: inline-flex;
    align-items: center;
    position: relative;
}
`;

module.exports = Search_Bar;
