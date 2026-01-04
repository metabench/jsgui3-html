'use strict';

const swap_registry = new Map();

/**
 * Register a swap configuration for a native selector.
 * @param {string} native_selector - CSS selector for native elements.
 * @param {Function} control_class - Control class to instantiate.
 * @param {Object} [options] - Optional configuration.
 * @param {number} [options.priority=0] - Higher priority wins.
 * @param {Function} [options.predicate] - Predicate to allow swap.
 * @param {string} [options.enhancement_mode='full'] - Swap mode.
 * @returns {Object} The registered swap configuration.
 */
function register_swap(native_selector, control_class, options = {}) {
    if (typeof native_selector !== 'string' || !native_selector.trim()) {
        throw new Error('register_swap requires a non-empty selector string.');
    }
    if (!control_class) {
        throw new Error('register_swap requires a control class.');
    }

    const predicate = typeof options.predicate === 'function' ? options.predicate : () => true;
    const priority = Number.isFinite(options.priority) ? options.priority : 0;
    const enhancement_mode = options.enhancement_mode || 'full';

    const config = {
        control_class,
        priority,
        predicate,
        enhancement_mode
    };

    swap_registry.set(native_selector, config);
    return config;
}

/**
 * Find the best swap configuration for an element.
 * @param {Element} element - DOM element to evaluate.
 * @returns {Object|null} Matching swap configuration or null.
 */
function get_swap(element) {
    if (!element || typeof element.matches !== 'function') return null;

    let matched = null;
    let matched_priority = Number.NEGATIVE_INFINITY;

    for (const [selector, config] of swap_registry) {
        if (!element.matches(selector)) continue;
        if (config.predicate && !config.predicate(element)) continue;
        const priority = Number.isFinite(config.priority) ? config.priority : 0;
        if (matched === null || priority > matched_priority) {
            matched = config;
            matched_priority = priority;
        }
    }

    return matched;
}

/**
 * Remove a swap configuration.
 * @param {string} native_selector - CSS selector to unregister.
 * @returns {boolean} True if the swap was removed.
 */
function unregister_swap(native_selector) {
    return swap_registry.delete(native_selector);
}

/**
 * Get all registered swap configurations.
 * @returns {Array<[string, Object]>} Array of [selector, config] pairs.
 */
function get_all_swaps() {
    return Array.from(swap_registry.entries());
}

/**
 * Clear all registered swaps (for testing).
 */
function clear_swaps() {
    swap_registry.clear();
}

module.exports = {
    register_swap,
    unregister_swap,
    get_swap,
    get_all_swaps,
    clear_swaps,
    swap_registry
};
