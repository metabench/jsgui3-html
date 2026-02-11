'use strict';

/**
 * Value Editor Registry
 * 
 * Central type→editor lookup.
 * Editors register themselves at import time; consuming code
 * asks `create_editor(type_name, spec)` and gets back a ready Control.
 */

const registry = new Map();

/**
 * Register an editor class for a value type.
 * @param {string} type_name  e.g. 'date', 'color', 'date_range', 'enum', 'number'
 * @param {Function} editor_class  Control class implementing Value_Editor interface
 * @param {Object} [options]  { priority, inline, popup, predicate }
 */
function register_value_editor(type_name, editor_class, options = {}) {
    const entry = {
        editor_class,
        priority: options.priority || 0,
        inline: options.inline !== false,
        popup: options.popup !== false,
        predicate: options.predicate || null
    };

    const existing = registry.get(type_name);
    if (!existing || entry.priority > existing.priority) {
        registry.set(type_name, entry);
    }
}

/**
 * Look up the best editor entry for a type.
 * @param {string} type_name
 * @param {Object} [context]  Optional context for predicate
 * @returns {{ editor_class, inline, popup } | null}
 */
function get_value_editor(type_name, context) {
    const entry = registry.get(type_name);
    if (!entry) return null;
    if (entry.predicate && !entry.predicate(context)) return null;
    return entry;
}

/**
 * Create an editor instance for a value.
 * @param {string} type_name
 * @param {Object} spec  Forwarded to the editor constructor
 * @returns {Control|null}
 */
function create_editor(type_name, spec) {
    const entry = get_value_editor(type_name, spec);
    if (!entry) return null;
    return new entry.editor_class(spec);
}

/**
 * Remove a registered editor.
 * @param {string} type_name
 */
function unregister_value_editor(type_name) {
    registry.delete(type_name);
}

/**
 * List all registered type names.
 * @returns {string[]}
 */
function list_registered_types() {
    return [...registry.keys()];
}

module.exports = {
    register_value_editor,
    get_value_editor,
    create_editor,
    unregister_value_editor,
    list_registered_types,
    registry
};
