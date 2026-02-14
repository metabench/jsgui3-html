'use strict';

/**
 * Palette Registry
 * 
 * Central registry of all available color palettes.
 * Each entry has: name, colors (array of {hex, name, rgb}), grid ([cols, rows]).
 *
 * API:
 *   palettes.get(key)                → palette entry or undefined
 *   palettes.register(key, entry)    → registers a custom palette
 *   palettes.list()                  → array of { key, name } for all palettes
 */

const pal_crayola = require('./arr_colors');
const pal_crayola_sorted = require('./pal_crayola_sorted');
const pal_crayola_extended = require('./pal_crayola_extended');
const pal_pastels = require('./pal_pastels');
const pal_css_named = require('./pal_css_named');

// Internal store
const _registry = {};

/**
 * Register a palette.
 * @param {string} key — unique identifier
 * @param {{ name: string, colors: Array, grid: [number, number] }} entry
 */
function register(key, entry) {
    if (!key || typeof key !== 'string') throw new Error('Palette key must be a non-empty string');
    if (!entry || !entry.name || !Array.isArray(entry.colors)) {
        throw new Error('Palette entry must have { name, colors[], grid? }');
    }
    _registry[key] = entry;
    // Keep ordered keys in sync
    if (!palettes.keys.includes(key)) {
        palettes.keys.push(key);
    }
}

/**
 * Get a palette by key.
 * @param {string} key
 * @returns {{ name: string, colors: Array, grid: [number, number] } | undefined}
 */
function get(key) {
    return _registry[key];
}

/**
 * List all registered palettes.
 * @returns {{ key: string, name: string }[]}
 */
function list() {
    return palettes.keys
        .filter(k => _registry[k])
        .map(k => ({ key: k, name: _registry[k].name }));
}

// Public API object
const palettes = {
    get,
    register,
    list,

    // Default palette key
    default_key: 'crayola_extended',

    // Ordered list of keys for UI display
    keys: []
};

// Register built-in palettes
register('crayola_extended', { name: 'Crayola Extended (144)', colors: pal_crayola_extended, grid: [12, 12] });
register('pastels', { name: 'Pastels (144)', colors: pal_pastels, grid: [12, 12] });
register('crayola_sorted', { name: 'Crayola (Sorted)', colors: pal_crayola_sorted, grid: [12, 12] });
register('crayola', { name: 'Crayola (Original)', colors: pal_crayola, grid: [12, 12] });
register('css_named', { name: 'CSS Named Colors', colors: pal_css_named, grid: [12, 13] });

// Backward compat: expose palettes as direct properties too
Object.defineProperty(palettes, 'crayola_extended', { get() { return _registry.crayola_extended; }, enumerable: true });
Object.defineProperty(palettes, 'pastels', { get() { return _registry.pastels; }, enumerable: true });
Object.defineProperty(palettes, 'crayola_sorted', { get() { return _registry.crayola_sorted; }, enumerable: true });
Object.defineProperty(palettes, 'crayola', { get() { return _registry.crayola; }, enumerable: true });
Object.defineProperty(palettes, 'css_named', { get() { return _registry.css_named; }, enumerable: true });

module.exports = palettes;
