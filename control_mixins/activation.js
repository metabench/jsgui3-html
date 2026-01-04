'use strict';

const { swap_registry } = require('./swap_registry');

class Activation_Manager {
    /**
     * Create an activation manager for a context.
     * @param {Object} context - Page context for control construction.
     */
    constructor(context) {
        this.context = context;
        this.activated = new WeakSet();
    }

    /**
     * Activate all swappable elements in a container.
     * @param {HTMLElement} container - Root element to scan.
     * @param {Object} [options] - Activation options.
     * @returns {Array} Array of activated controls.
     */
    activate(container, options = {}) {
        if (!container || typeof container.querySelectorAll !== 'function') return [];

        const activated_controls = [];

        for (const [selector, config] of swap_registry) {
            const elements = [];

            if (typeof container.matches === 'function' && container.matches(selector)) {
                elements.push(container);
            }

            const node_list = container.querySelectorAll(selector);
            if (node_list && node_list.length) {
                node_list.forEach(el => elements.push(el));
            }

            elements.forEach(el => {
                if (!el || this.activated.has(el)) return;
                if (this._should_skip(el, options)) return;
                if (config.predicate && !config.predicate(el)) return;

                const mode = this._resolve_mode(el, config, options);
                if (!mode) return;

                try {
                    const control = this._activate_element(el, config, options, mode);
                    if (control) {
                        activated_controls.push(control);
                        this._mark_enhanced(el, control, mode);
                        this.activated.add(el);
                    }
                } catch (error) {
                    if (options.on_error) {
                        options.on_error(error, el, config);
                    } else if (typeof console !== 'undefined' && console.error) {
                        console.error('[jsgui3] Activation error for', selector, ':', error);
                    }
                }
            });
        }

        return activated_controls;
    }

    _activate_element(el, config, options, mode) {
        const control_class = config.control_class;

        switch (mode) {
            case 'full':
                return this._swap_full(el, control_class, options);
            case 'wrap':
                return this._swap_wrap(el, control_class, options);
            case 'enhance':
                return this._swap_enhance(el, control_class, options);
            case 'overlay':
                return this._swap_overlay(el, control_class, options);
            default:
                return null;
        }
    }

    _swap_full(el, control_class, options) {
        const spec = this._extract_spec(el);
        spec.el = el;
        spec.context = this.context;
        spec.activation_mode = 'full';

        const control = new control_class(spec);
        if (control && typeof control.activate === 'function') {
            control.activate();
        }
        return control;
    }

    _swap_wrap(el, control_class, options) {
        const doc = el?.ownerDocument || (typeof document !== 'undefined' ? document : null);
        if (!doc) return null;

        const wrapper_tag = options.wrapper_tag || 'div';
        const wrapper_el = doc.createElement(wrapper_tag);

        const spec = {
            context: this.context,
            el: wrapper_el,
            native_element: el,
            native_spec: this._extract_spec(el),
            activation_mode: 'wrap'
        };

        const control = new control_class(spec);
        if (el.parentNode) {
            el.parentNode.insertBefore(wrapper_el, el);
            wrapper_el.appendChild(el);
        }

        if (control && typeof control.activate === 'function') {
            control.activate();
        }
        return control;
    }

    _swap_enhance(el, control_class, options) {
        const spec = this._extract_spec(el);
        spec.el = el;
        spec.context = this.context;
        spec.enhance_only = true;
        spec.activation_mode = 'enhance';

        const control = new control_class(spec);
        if (control && typeof control.activate === 'function') {
            control.activate();
        }
        return control;
    }

    _swap_overlay(el, control_class, options) {
        const doc = el?.ownerDocument || (typeof document !== 'undefined' ? document : null);
        if (!doc) return null;

        const overlay_tag = options.overlay_tag || 'div';
        const overlay_el = doc.createElement(overlay_tag);
        overlay_el.classList.add('jsgui-overlay');

        const spec = {
            context: this.context,
            el: overlay_el,
            target: el,
            activation_mode: 'overlay'
        };

        const control = new control_class(spec);
        if (el.parentNode) {
            el.parentNode.insertBefore(overlay_el, el.nextSibling);
        }

        if (control && typeof control.activate === 'function') {
            control.activate();
        }
        return control;
    }

    _extract_spec(el) {
        const spec = {};

        if (!el) return spec;

        if (el.id) spec.id = el.id;
        if (el.name) spec.name = el.name;
        if (typeof el.value !== 'undefined') spec.value = el.value;
        if (el.disabled === true) spec.disabled = true;
        if (el.required === true) spec.required = true;
        if (el.placeholder) spec.placeholder = el.placeholder;

        if ((el.type === 'checkbox' || el.type === 'radio') && el.checked === true) {
            spec.checked = true;
        }

        if (el.attributes) {
            for (const attr of el.attributes) {
                if (!attr.name.startsWith('data-jsgui-')) continue;
                const key = attr.name.slice(11).replace(/-/g, '_');
                try {
                    spec[key] = JSON.parse(attr.value);
                } catch (error) {
                    spec[key] = attr.value;
                }
            }
        }

        return spec;
    }

    _resolve_mode(el, config, options) {
        const attr_mode = el?.getAttribute ? el.getAttribute('data-jsgui-mode') : null;
        const option_mode = options.enhancement_mode;
        const raw_mode = attr_mode || option_mode || config.enhancement_mode || 'full';
        const mode = String(raw_mode).toLowerCase();

        if (mode === 'styled' || mode === 'css' || mode === 'none') return null;
        return mode;
    }

    _should_skip(el, options) {
        if (!el) return true;
        if (el.classList && el.classList.contains('jsgui-no-enhance')) return true;
        if (el.getAttribute && el.getAttribute('data-jsgui-enhanced') === 'true') {
            return options.reactivate !== true;
        }
        return false;
    }

    _mark_enhanced(el, control, mode) {
        if (!el || !el.setAttribute) return;
        el.setAttribute('data-jsgui-enhanced', 'true');
        if (mode) {
            el.setAttribute('data-jsgui-enhanced-mode', mode);
        }
    }

    /**
     * Deactivate a control and restore the original element.
     * @param {HTMLElement} el - Element to deactivate.
     * @returns {boolean} True if deactivation succeeded.
     */
    deactivate(el) {
        if (!el || !this.activated.has(el)) return false;

        const mode = el.getAttribute ? el.getAttribute('data-jsgui-enhanced-mode') : null;

        // For wrap mode, unwrap the element
        if (mode === 'wrap' && el.parentNode) {
            const wrapper = el.parentNode;
            if (wrapper.classList && wrapper.classList.contains('jsgui-wrapper')) {
                const parent = wrapper.parentNode;
                if (parent) {
                    parent.insertBefore(el, wrapper);
                    parent.removeChild(wrapper);
                }
            }
        }

        // For overlay mode, remove the overlay
        if (mode === 'overlay' && el.nextSibling) {
            const overlay = el.nextSibling;
            if (overlay.classList && overlay.classList.contains('jsgui-overlay')) {
                overlay.parentNode.removeChild(overlay);
            }
        }

        // Clear markers
        if (el.removeAttribute) {
            el.removeAttribute('data-jsgui-enhanced');
            el.removeAttribute('data-jsgui-enhanced-mode');
        }

        this.activated.delete(el);
        return true;
    }
}

module.exports = {
    Activation_Manager
};
