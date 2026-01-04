'use strict';

const { Activation_Manager } = require('./activation');

/**
 * Enable automatic progressive enhancement.
 * @param {Object} context - Page context.
 * @param {Object} [options] - Enhancement options.
 * @returns {MutationObserver|Activation_Manager} Observer or manager.
 */
function enable_auto_enhancement(context, options = {}) {
    const manager = new Activation_Manager(context);

    if (typeof document === 'undefined') {
        return manager;
    }

    const root = options.container || document.body || document.documentElement;
    if (!root) return manager;

    if (options.immediate !== false) {
        manager.activate(root, options);
    }

    const observer_class = typeof MutationObserver !== 'undefined'
        ? MutationObserver
        : (typeof window !== 'undefined' ? window.MutationObserver : undefined);

    if (options.observe === false || !observer_class) {
        return manager;
    }

    const observer = new observer_class((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (!node || node.nodeType !== 1) return;
                manager.activate(node, options);
            });
        });
    });

    observer.observe(root, {
        childList: true,
        subtree: true
    });

    observer.manager = manager;
    return observer;
}

/**
 * Disable auto enhancement and disconnect the observer.
 * @param {MutationObserver} observer - Observer returned by enable_auto_enhancement.
 */
function disable_auto_enhancement(observer) {
    if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
    }
}

module.exports = {
    enable_auto_enhancement,
    disable_auto_enhancement
};
