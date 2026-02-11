'use strict';

/**
 * Mixin Cleanup Infrastructure
 * 
 * Provides a standard way for mixins to track resources (event listeners,
 * DOM elements, intervals) and clean them up when disposed.
 * 
 * Usage in a mixin:
 *   const cleanup = create_mixin_cleanup(ctrl, 'my_mixin');
 *   cleanup.track_listener(ctrl, 'press-start', handler);
 *   cleanup.track_element(some_dom_el);
 *   return cleanup; // caller can later call cleanup.dispose()
 */

/**
 * Create a cleanup tracker for a specific mixin on a control.
 * @param {Object} ctrl - The control instance.
 * @param {string} mixin_name - Name of the mixin (used as key in __mx_cleanup).
 * @returns {Object} Cleanup handle with track_* and dispose methods.
 */
function create_mixin_cleanup(ctrl, mixin_name) {
    ctrl.__mx_cleanup = ctrl.__mx_cleanup || {};

    const tracked = {
        listeners: [],  // { target, event, handler, is_dom }
        elements: [],   // DOM elements to remove
        intervals: [],  // setInterval / setTimeout IDs
        custom: []      // arbitrary cleanup functions
    };

    ctrl.__mx_cleanup[mixin_name] = tracked;

    const handle = {
        /**
         * Track a jsgui event listener (ctrl.on / ctrl.off style).
         * @param {Object} target - The evented object (ctrl or another control).
         * @param {string} event - Event name.
         * @param {Function} handler - Event handler.
         */
        track_listener(target, event, handler) {
            tracked.listeners.push({ target, event, handler, is_dom: false });
        },

        /**
         * Track a DOM event listener (addEventListener / removeEventListener).
         * @param {HTMLElement} target - DOM element.
         * @param {string} event - Event name.
         * @param {Function} handler - Event handler.
         */
        track_dom_listener(target, event, handler) {
            tracked.listeners.push({ target, event, handler, is_dom: true });
        },

        /**
         * Track a DOM element that should be removed on dispose.
         * @param {HTMLElement} element - DOM element to track.
         */
        track_element(element) {
            tracked.elements.push(element);
        },

        /**
         * Track an interval or timeout for clearing on dispose.
         * @param {number} id - The interval/timeout ID.
         * @param {'interval'|'timeout'} type - Whether it's setInterval or setTimeout.
         */
        track_timer(id, type = 'interval') {
            tracked.intervals.push({ id, type });
        },

        /**
         * Register an arbitrary cleanup function.
         * @param {Function} fn - Function to call on dispose.
         */
        on_dispose(fn) {
            tracked.custom.push(fn);
        },

        /**
         * Dispose all tracked resources for this mixin.
         */
        dispose() {
            // Remove event listeners
            for (const entry of tracked.listeners) {
                if (entry.is_dom) {
                    if (entry.target && typeof entry.target.removeEventListener === 'function') {
                        entry.target.removeEventListener(entry.event, entry.handler);
                    }
                } else {
                    if (entry.target && typeof entry.target.off === 'function') {
                        entry.target.off(entry.event, entry.handler);
                    }
                }
            }
            tracked.listeners.length = 0;

            // Remove DOM elements
            for (const el of tracked.elements) {
                if (el && el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            }
            tracked.elements.length = 0;

            // Clear timers
            for (const timer of tracked.intervals) {
                if (timer.type === 'interval') {
                    clearInterval(timer.id);
                } else {
                    clearTimeout(timer.id);
                }
            }
            tracked.intervals.length = 0;

            // Run custom cleanup
            for (const fn of tracked.custom) {
                try { fn(); } catch (e) { /* swallow */ }
            }
            tracked.custom.length = 0;

            // Remove from ctrl tracking
            if (ctrl.__mx) {
                delete ctrl.__mx[mixin_name];
            }
            if (ctrl.__mx_cleanup) {
                delete ctrl.__mx_cleanup[mixin_name];
            }
        },

        /** Whether this cleanup handle has been disposed. */
        get disposed() {
            return !ctrl.__mx_cleanup || !ctrl.__mx_cleanup[mixin_name];
        }
    };

    return handle;
}

/**
 * Dispose all mixins on a control.
 * @param {Object} ctrl - The control instance.
 */
function dispose_all_mixins(ctrl) {
    if (!ctrl.__mx_cleanup) return;
    const names = Object.keys(ctrl.__mx_cleanup);
    for (const name of names) {
        const tracked = ctrl.__mx_cleanup[name];
        // Build a temporary handle to call dispose
        create_mixin_cleanup_dispose(ctrl, name, tracked);
    }
    ctrl.__mx_cleanup = {};
}

/**
 * Internal helper — dispose a single tracked bag.
 * @private
 */
function create_mixin_cleanup_dispose(ctrl, mixin_name, tracked) {
    for (const entry of tracked.listeners) {
        if (entry.is_dom) {
            if (entry.target && typeof entry.target.removeEventListener === 'function') {
                entry.target.removeEventListener(entry.event, entry.handler);
            }
        } else {
            if (entry.target && typeof entry.target.off === 'function') {
                entry.target.off(entry.event, entry.handler);
            }
        }
    }
    for (const el of tracked.elements) {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }
    for (const timer of tracked.intervals) {
        if (timer.type === 'interval') {
            clearInterval(timer.id);
        } else {
            clearTimeout(timer.id);
        }
    }
    for (const fn of tracked.custom) {
        try { fn(); } catch (e) { /* swallow */ }
    }
    if (ctrl.__mx) {
        delete ctrl.__mx[mixin_name];
    }
}

module.exports = {
    create_mixin_cleanup,
    dispose_all_mixins
};
