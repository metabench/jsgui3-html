'use strict';

const jsgui = require('../../../../../html-core/html-core');
const { Control } = jsgui;
const Color_Value = require('../../../../../html-core/Color_Value');

/**
 * Swatch_Grid — Clickable color palette grid.
 *
 * Standalone sub-control implementing the color mode interface:
 *   - set color(cv)        — silent update (no event)
 *   - get color()          — current Color_Value
 *   - 'color-change' event — on user click
 *
 * @param {Object} spec
 * @param {string[]} [spec.palette]     — array of hex strings
 * @param {string}   [spec.palette_key] — key into palettes registry
 * @param {number[]} [spec.grid]        — [cols, rows] for CSS grid
 */
class Swatch_Grid extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'swatch_grid';
        super(spec);
        this.add_class('swatch-grid');

        this._color = spec.color instanceof Color_Value ? spec.color : new Color_Value(spec.value || '#3b82f6');

        // Resolve palette
        let colors = spec.palette;
        if (!colors && spec.palette_key) {
            try {
                const palettes = require('../../../../../html-core/palettes');
                const entry = palettes.get(spec.palette_key);
                if (entry) colors = entry.colors.map(c => c.hex);
            } catch (e) { /* palettes not available */ }
        }
        if (!colors) {
            colors = [
                '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
                '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
                '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c',
                '#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#ffffff',
            ];
        }
        this._palette = colors;
        this._grid_dims = spec.grid || [6, 4];

        if (!spec.el) this.compose();
    }

    /** Color mode interface: get current color */
    get color() { return this._color; }

    /** Color mode interface: silent update (no event) */
    set color(cv) {
        if (cv instanceof Color_Value) this._color = cv;
        else this._color.set(cv);
        this._update_selection();
    }

    compose() {
        const { context } = this;
        const [cols] = this._grid_dims;

        this._cells = [];
        this._palette.forEach(hex => {
            const cell = new Control({ context, tag_name: 'div' });
            cell.add_class('sg-cell');
            cell.dom.attributes['data-color'] = hex;
            cell.dom.attributes.style = `background:${hex}`;
            cell.dom.attributes.title = hex;
            cell.dom.attributes.tabindex = '0';
            cell.dom.attributes.role = 'gridcell';
            this._cells.push(cell);
            this.add(cell);
        });

        // Set grid columns via CSS custom property
        this.dom.attributes.style = `--sg-cols:${cols}`;
        this.dom.attributes.role = 'grid';
    }

    activate() {
        if (this._activated) return;
        super.activate();
        this._activated = true;

        if (this.dom.el) {
            this.dom.el.addEventListener('click', (e) => {
                const cell = e.target.closest('.sg-cell');
                if (cell) {
                    const hex = cell.getAttribute('data-color');
                    if (hex) {
                        this._color.set(hex);
                        this._update_selection();
                        this.raise('color-change', { color: this._color, hex });
                    }
                }
            });

            // Keyboard: Enter/Space to select
            this.dom.el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    const cell = e.target.closest('.sg-cell');
                    if (cell) {
                        e.preventDefault();
                        const hex = cell.getAttribute('data-color');
                        if (hex) {
                            this._color.set(hex);
                            this._update_selection();
                            this.raise('color-change', { color: this._color, hex });
                        }
                    }
                }
            });
        }

        this._update_selection();
    }

    _update_selection() {
        if (!this.dom.el) return;
        const current_hex = this._color.hex.toLowerCase();
        const cells = this.dom.el.querySelectorAll('.sg-cell');
        cells.forEach(cell => {
            const selected = (cell.getAttribute('data-color') || '').toLowerCase() === current_hex;
            cell.classList.toggle('sg-selected', selected);
        });
    }
}

Swatch_Grid.css = `
.swatch-grid {
    display: grid;
    grid-template-columns: repeat(var(--sg-cols, 6), 1fr);
    gap: 2px;
    padding: 4px;
}
.sg-cell {
    width: 24px; height: 24px;
    border-radius: 3px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.15s, transform 0.1s;
    outline: none;
}
.sg-cell:hover { transform: scale(1.15); z-index: 1; }
.sg-cell:focus-visible { border-color: #3b82f6; }
.sg-selected { border-color: #fff; box-shadow: 0 0 0 2px #3b82f6; }
`;

module.exports = Swatch_Grid;
