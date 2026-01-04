'use strict';

const { Activation_Manager } = require('./activation');

/**
 * Hydration state tracking.
 */
const hydration_state = {
    hydrated: false,
    pending: [],
    completed: []
};

/**
 * Hydrate server-rendered HTML by activating jsgui controls.
 * This is the primary entry point for progressive enhancement.
 *
 * @param {Object} context - Page context for control construction.
 * @param {Object} [options] - Hydration options.
 * @param {HTMLElement} [options.container] - Root container (defaults to document.body).
 * @param {boolean} [options.async=false] - Whether to hydrate asynchronously.
 * @param {number} [options.batch_size=50] - Elements to process per batch in async mode.
 * @param {Function} [options.on_progress] - Progress callback(completed, total).
 * @param {Function} [options.on_complete] - Completion callback(controls).
 * @param {Function} [options.on_error] - Error callback(error, element).
 * @returns {Promise<Array>|Array} Array of hydrated controls.
 */
function hydrate(context, options = {}) {
    const manager = new Activation_Manager(context);
    const container = options.container ||
        (typeof document !== 'undefined' ? document.body : null);

    if (!container) {
        return options.async ? Promise.resolve([]) : [];
    }

    if (options.async) {
        return hydrate_async(manager, container, options);
    }

    return hydrate_sync(manager, container, options);
}

/**
 * Synchronous hydration.
 * @private
 */
function hydrate_sync(manager, container, options) {
    const controls = [];

    try {
        const activated = manager.activate(container, {
            enhancement_mode: options.enhancement_mode,
            reactivate: options.reactivate
        });
        controls.push(...activated);
        hydration_state.completed.push(...activated);
    } catch (error) {
        if (options.on_error) {
            options.on_error(error, container);
        }
    }

    hydration_state.hydrated = true;

    if (options.on_complete) {
        options.on_complete(controls);
    }

    return controls;
}

/**
 * Asynchronous hydration with batching.
 * @private
 */
async function hydrate_async(manager, container, options) {
    const batch_size = options.batch_size || 50;
    const controls = [];
    const { swap_registry } = require('./swap_registry');

    // Collect all elements to hydrate
    const elements = [];
    for (const [selector] of swap_registry) {
        const nodes = container.querySelectorAll(selector);
        nodes.forEach(el => {
            if (!elements.includes(el)) {
                elements.push(el);
            }
        });
    }

    const total = elements.length;
    let completed = 0;

    // Process in batches
    for (let i = 0; i < elements.length; i += batch_size) {
        const batch = elements.slice(i, i + batch_size);

        for (const el of batch) {
            try {
                const activated = manager.activate(el, {
                    enhancement_mode: options.enhancement_mode,
                    reactivate: options.reactivate
                });
                controls.push(...activated);
                hydration_state.completed.push(...activated);
            } catch (error) {
                if (options.on_error) {
                    options.on_error(error, el);
                }
            }
            completed++;
        }

        if (options.on_progress) {
            options.on_progress(completed, total);
        }

        // Yield to browser between batches
        if (i + batch_size < elements.length) {
            await new Promise(resolve => {
                if (typeof requestAnimationFrame !== 'undefined') {
                    requestAnimationFrame(resolve);
                } else if (typeof setImmediate !== 'undefined') {
                    setImmediate(resolve);
                } else {
                    setTimeout(resolve, 0);
                }
            });
        }
    }

    hydration_state.hydrated = true;

    if (options.on_complete) {
        options.on_complete(controls);
    }

    return controls;
}

/**
 * Check if hydration has been performed.
 * @returns {boolean} True if hydration has completed.
 */
function is_hydrated() {
    return hydration_state.hydrated;
}

/**
 * Get all controls that were hydrated.
 * @returns {Array} Array of hydrated controls.
 */
function get_hydrated_controls() {
    return hydration_state.completed.slice();
}

/**
 * Reset hydration state (for testing or re-hydration).
 */
function reset_hydration() {
    hydration_state.hydrated = false;
    hydration_state.pending = [];
    hydration_state.completed = [];
}

/**
 * Wait for hydration to complete if in progress.
 * @param {number} [timeout=5000] - Maximum wait time in ms.
 * @returns {Promise<boolean>} Resolves to true when hydrated.
 */
function when_hydrated(timeout = 5000) {
    if (hydration_state.hydrated) {
        return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            if (hydration_state.hydrated) {
                resolve(true);
            } else if (Date.now() - start > timeout) {
                reject(new Error('Hydration timeout'));
            } else {
                setTimeout(check, 50);
            }
        };
        check();
    });
}

module.exports = {
    hydrate,
    is_hydrated,
    get_hydrated_controls,
    reset_hydration,
    when_hydrated
};
