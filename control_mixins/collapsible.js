'use strict';

/**
 * Collapsible Mixin
 * 
 * Adds expand/collapse behavior to any control. Configurable trigger,
 * animation, initial state, ARIA attributes, and CSS classes.
 * 
 * Usage:
 *   const collapsible = require('./collapsible');
 *   const cleanup = collapsible(ctrl, {
 *       trigger: '.header',        // CSS selector or child control
 *       content: '.body',          // CSS selector or child control
 *       initial: 'collapsed',      // 'expanded' | 'collapsed'
 *   });
 *   ctrl.toggle_collapse();
 *   ctrl.expand();
 *   ctrl.collapse();
 *   cleanup.dispose(); // clean removal
 */

const { create_mixin_cleanup } = require('./mixin_cleanup');

/**
 * Apply collapsible behavior to a control.
 * @param {Object} ctrl - The control instance.
 * @param {Object} [opts] - Options.
 * @param {string|null} [opts.trigger] - CSS selector for the trigger element within ctrl.
 * @param {string|null} [opts.content] - CSS selector for the collapsible content within ctrl.
 * @param {'expanded'|'collapsed'} [opts.initial='expanded'] - Initial state.
 * @returns {Object} Cleanup handle with dispose().
 */
const collapsible = (ctrl, opts = {}) => {
    // Guard against double-application
    ctrl.__mx = ctrl.__mx || {};
    if (ctrl.__mx.collapsible) return ctrl.__mx.collapsible;

    const cleanup = create_mixin_cleanup(ctrl, 'collapsible');
    ctrl.__mx.collapsible = cleanup;

    const initial_state = opts.initial || 'expanded';
    let _expanded = initial_state === 'expanded';

    // ── Internal helpers ──

    function get_trigger_el() {
        if (!ctrl.dom || !ctrl.dom.el) return null;
        if (opts.trigger) return ctrl.dom.el.querySelector(opts.trigger);
        return ctrl.dom.el; // whole control is the trigger
    }

    function get_content_el() {
        if (!ctrl.dom || !ctrl.dom.el) return null;
        if (opts.content) return ctrl.dom.el.querySelector(opts.content);
        return null; // no separate content — class on ctrl itself
    }

    function apply_state() {
        const el = ctrl.dom && ctrl.dom.el;
        if (!el) return;

        const content_el = get_content_el();
        const trigger_el = get_trigger_el();

        if (_expanded) {
            el.classList.remove('collapsed');
            el.classList.add('expanded');
            if (content_el) {
                content_el.style.display = '';
            }
        } else {
            el.classList.remove('expanded');
            el.classList.add('collapsed');
            if (content_el) {
                content_el.style.display = 'none';
            }
        }

        // ARIA
        if (trigger_el) {
            trigger_el.setAttribute('aria-expanded', String(_expanded));
        }
    }

    // ── Public API ──

    ctrl.is_expanded = () => _expanded;
    ctrl.is_collapsed = () => !_expanded;

    ctrl.expand = () => {
        if (_expanded) return;
        _expanded = true;
        apply_state();
        if (typeof ctrl.raise === 'function') {
            ctrl.raise('expand');
        }
    };

    ctrl.collapse = () => {
        if (!_expanded) return;
        _expanded = false;
        apply_state();
        if (typeof ctrl.raise === 'function') {
            ctrl.raise('collapse');
        }
    };

    ctrl.toggle_collapse = () => {
        if (_expanded) {
            ctrl.collapse();
        } else {
            ctrl.expand();
        }
    };

    // ── Attach trigger click handler ──

    const click_handler = (e) => {
        // Only respond to clicks directly on the trigger, not on nested interactive elements
        ctrl.toggle_collapse();
    };

    // Hook up when DOM is available
    const setup_dom = () => {
        const trigger_el = get_trigger_el();
        if (trigger_el) {
            trigger_el.addEventListener('click', click_handler);
            cleanup.track_dom_listener(trigger_el, 'click', click_handler);
        }
        // Apply initial state
        apply_state();
    };

    if (ctrl.dom && ctrl.dom.el) {
        setup_dom();
    } else if (typeof ctrl.once_active === 'function') {
        ctrl.once_active(setup_dom);
    }

    // ── Cleanup extensions ──

    cleanup.on_dispose(() => {
        delete ctrl.is_expanded;
        delete ctrl.is_collapsed;
        delete ctrl.expand;
        delete ctrl.collapse;
        delete ctrl.toggle_collapse;
    });

    return cleanup;
};

module.exports = collapsible;
