/**
 * Palette Registry
 * 
 * Central registry of all available color palettes.
 * Each entry has: name, colors (array of {hex, name, rgb}), grid ([cols, rows]).
 */

const pal_crayola = require('./arr_colors');
const pal_crayola_sorted = require('./pal_crayola_sorted');
const pal_crayola_extended = require('./pal_crayola_extended');
const pal_pastels = require('./pal_pastels');

const palettes = {
    crayola_extended: { name: 'Crayola Extended (144)', colors: pal_crayola_extended, grid: [12, 12] },
    pastels: { name: 'Pastels (144)', colors: pal_pastels, grid: [12, 12] },
    crayola_sorted: { name: 'Crayola (Sorted)', colors: pal_crayola_sorted, grid: [12, 12] },
    crayola: { name: 'Crayola (Original)', colors: pal_crayola, grid: [12, 12] }
};

// Default palette key
palettes.default_key = 'crayola_extended';

// Ordered list of keys for UI display
palettes.keys = ['crayola_extended', 'pastels', 'crayola_sorted', 'crayola'];

module.exports = palettes;
