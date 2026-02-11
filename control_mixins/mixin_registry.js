'use strict';

/**
 * Mixin Metadata Registry
 * 
 * A formal registry for mixin metadata — dependencies, conflicts,
 * and provided features. Enables automated dependency resolution
 * and conflict detection.
 * 
 * Usage:
 *   const { register_mixin, get_mixin_meta, check_conflicts } = require('./mixin_registry');
 *   register_mixin('pressed_state', {
 *       depends: ['press_events'],
 *       provides: ['pressed-css-class'],
 *       conflicts: []
 *   });
 */

const _registry = new Map();

/**
 * Register mixin metadata.
 * @param {string} name - Mixin name (should match __mx key).
 * @param {Object} meta - Metadata object.
 * @param {string[]} [meta.depends] - Names of required mixins.
 * @param {string[]} [meta.provides] - Feature names this mixin provides.
 * @param {string[]} [meta.conflicts] - Mixin names that conflict.
 * @param {string} [meta.description] - Human-readable description.
 */
function register_mixin(name, meta = {}) {
    _registry.set(name, {
        name,
        depends: meta.depends || [],
        provides: meta.provides || [],
        conflicts: meta.conflicts || [],
        description: meta.description || ''
    });
}

/**
 * Get metadata for a registered mixin.
 * @param {string} name - Mixin name.
 * @returns {Object|null} Metadata or null if not registered.
 */
function get_mixin_meta(name) {
    return _registry.get(name) || null;
}

/**
 * List all registered mixins.
 * @returns {string[]} Array of mixin names.
 */
function list_registered() {
    return Array.from(_registry.keys());
}

/**
 * Check for conflicts between a mixin and what's already applied to a control.
 * @param {string} mixin_name - Mixin about to be applied.
 * @param {Object} ctrl - The control instance.
 * @returns {string[]} Array of conflict names (empty if none).
 */
function check_conflicts(mixin_name, ctrl) {
    const meta = _registry.get(mixin_name);
    if (!meta || !ctrl.__mx) return [];

    const conflicts = [];
    for (const conflict_name of meta.conflicts) {
        if (ctrl.__mx[conflict_name]) {
            conflicts.push(conflict_name);
        }
    }
    return conflicts;
}

/**
 * Check whether all dependencies of a mixin are satisfied on a control.
 * @param {string} mixin_name - Mixin to check.
 * @param {Object} ctrl - The control instance.
 * @returns {{ satisfied: boolean, missing: string[] }}
 */
function check_dependencies(mixin_name, ctrl) {
    const meta = _registry.get(mixin_name);
    if (!meta) return { satisfied: true, missing: [] };

    const missing = [];
    for (const dep of meta.depends) {
        if (!ctrl.__mx || !ctrl.__mx[dep]) {
            missing.push(dep);
        }
    }
    return { satisfied: missing.length === 0, missing };
}

/**
 * Get the full dependency tree for a mixin (recursive).
 * @param {string} mixin_name - Starting mixin.
 * @returns {string[]} Ordered list of all dependencies (deepest first).
 */
function get_dependency_tree(mixin_name) {
    const visited = new Set();
    const result = [];

    function walk(name) {
        if (visited.has(name)) return;
        visited.add(name);

        const meta = _registry.get(name);
        if (meta) {
            for (const dep of meta.depends) {
                walk(dep);
            }
        }
        result.push(name);
    }

    walk(mixin_name);
    return result;
}

module.exports = {
    register_mixin,
    get_mixin_meta,
    list_registered,
    check_conflicts,
    check_dependencies,
    get_dependency_tree
};
