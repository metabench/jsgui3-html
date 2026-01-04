/**
 * Deprecation warning utilities for jsgui3-html
 *
 * Used to warn developers about deprecated APIs while maintaining backwards compatibility.
 */

'use strict';

// Track which warnings have been shown to avoid spam
const warned = new Set();

/**
 * Emit a deprecation warning (once per unique old_name/new_name pair)
 * @param {string} old_name - The deprecated name
 * @param {string} new_name - The replacement name
 * @param {string} [removal_version='1.0.0'] - Version when the deprecated API will be removed
 */
function deprecation_warning(old_name, new_name, removal_version = '1.0.0') {
    // Skip in production
    if (process.env.NODE_ENV === 'production') return;

    const key = `${old_name}:${new_name}`;
    if (warned.has(key)) return;
    warned.add(key);

    console.warn(
        `[jsgui3-html] DEPRECATED: "${old_name}" is deprecated. ` +
        `Use "${new_name}" instead. ` +
        `This will be removed in v${removal_version}.`
    );
}

/**
 * Create a deprecated alias for a module
 * @param {*} canonical_module - The canonical module to re-export
 * @param {string} old_name - The deprecated name
 * @param {string} new_name - The canonical name
 * @param {string} [removal_version='1.0.0'] - Version when deprecated
 * @returns {*} The canonical module (after emitting warning)
 */
function create_deprecated_alias(canonical_module, old_name, new_name, removal_version = '1.0.0') {
    deprecation_warning(old_name, new_name, removal_version);
    return canonical_module;
}

/**
 * Clear all tracked warnings (useful for testing)
 */
function clear_warnings() {
    warned.clear();
}

/**
 * Check if a specific deprecation warning has been shown
 * @param {string} old_name
 * @param {string} new_name
 * @returns {boolean}
 */
function has_warned(old_name, new_name) {
    return warned.has(`${old_name}:${new_name}`);
}

module.exports = {
    deprecation_warning,
    create_deprecated_alias,
    clear_warnings,
    has_warned
};
