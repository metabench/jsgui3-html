/**
 * Matrix Control for jsgui3-html
 * 
 * A generic, reusable MVVM-enabled grid control that provides:
 * - Table mode (small datasets, accessibility-friendly)
 * - Virtual mode placeholder (large datasets)
 * - Reactive data binding
 * - Data-driven cell API (getCellData)
 * - Default renderer for standardized cell shapes
 * 
 * @module controls/matrix/Matrix
 */

'use strict';

const jsgui = require('../../html-core/html-core');
const { Data_Object } = require('lang-tools');
const { Control } = jsgui;
const StringControl = jsgui.String_Control;

// ============================================================================
// Helpers
// ============================================================================

function text(ctx, value) {
    return new StringControl({ context: ctx, text: String(value ?? '') });
}

function makeEl(ctx, tagName, className = null, attrs = null) {
    const el = new Control({ context: ctx, tagName, __type_name: tagName });
    if (className) el.add_class(className);
    if (attrs) {
        for (const [key, value] of Object.entries(attrs)) {
            if (value === undefined) continue;
            el.dom.attributes[key] = String(value);
        }
    }
    return el;
}

function truncateLabel(label, maxLen) {
    const s = String(label ?? '');
    const limit = Number.isFinite(maxLen) ? Math.max(0, Math.trunc(maxLen)) : 0;
    if (!limit || s.length <= limit) return { display: s, truncated: false };
    if (limit <= 1) return { display: '…', truncated: true };
    return { display: s.slice(0, limit - 1) + '…', truncated: true };
}

// ============================================================================
// Matrix Control
// ============================================================================

class Matrix extends Control {
    /**
     * @param {Object} spec - Configuration
     * @param {Array} spec.rows - Row data array
     * @param {Array} spec.cols - Column data array
     * @param {Map|Object} [spec.cells] - Sparse cell data map (key: "rowKey|colKey")
     * @param {Function} [spec.getCellData] - (row, col, rowIndex, colIndex) => CellData
     * @param {Function} [spec.getRowKey] - (row, index) => key
     * @param {Function} [spec.getRowLabel] - (row, index) => label
     * @param {Function} [spec.getRowTitle] - (row, index) => title
     * @param {Function} [spec.getColKey] - (col, index) => key
     * @param {Function} [spec.getColLabel] - (col, index) => label
     * @param {Function} [spec.getColTitle] - (col, index) => title
     * @param {Object} [spec.header] - Header options
     * @param {string} [spec.header.mode] - 'angle' or 'vertical'
     * @param {boolean} [spec.virtual] - Force virtual mode
     * @param {number} [spec.virtualThreshold] - Cell count for auto-virtual (default: 50000)
     */
    constructor(spec = {}) {
        super({
            ...spec,
            tagName: spec.tagName || 'div',
            __type_name: spec.__type_name || 'matrix'
        });

        this.add_class('matrix-control');

        // Initialize MVVM data models
        this.data.model = new Data_Object({
            rows: spec.rows || [],
            cols: spec.cols || [],
            cells: spec.cells instanceof Map ? spec.cells : new Map(Object.entries(spec.cells || {}))
        });

        this.view.data.model = new Data_Object({
            row_count: 0,
            col_count: 0,
            cell_count: 0,
            render_mode: 'table'
        });

        // Accessors
        this.getRowKey = spec.getRowKey || ((row, i) => i);
        this.getRowLabel = spec.getRowLabel || ((row) => String(row ?? ''));
        this.getRowTitle = spec.getRowTitle || this.getRowLabel;
        this.getColKey = spec.getColKey || ((col, i) => i);
        this.getColLabel = spec.getColLabel || ((col) => String(col ?? ''));
        this.getColTitle = spec.getColTitle || this.getColLabel;

        // Data Resolver
        this.getCellData = spec.getCellData || this._defaultGetCellData.bind(this);

        // Header options
        const header = spec.header || {};
        this.headerMode = header.mode === 'vertical' ? 'vertical' : 'angle';
        this.headerAngleDeg = Number.isFinite(header.angleDeg) ? Math.max(0, Math.min(90, header.angleDeg)) : 45;
        this.headerTruncateAt = Number.isFinite(header.truncateAt) ? Math.max(0, header.truncateAt) : 18;
        this.cornerLabel = spec.cornerLabel || '';

        // Virtual mode settings
        this.forceVirtual = !!spec.virtual;
        this.virtualThreshold = Number.isFinite(spec.virtualThreshold) ? spec.virtualThreshold : 50000;

        this._setupComputedProperties();

        if (!spec.el) {
            this.compose();
        }
    }

    _defaultGetCellData(row, col, rowIndex, colIndex) {
        const rowKey = this.getRowKey(row, rowIndex);
        const colKey = this.getColKey(col, colIndex);
        const key = `${rowKey}|${colKey}`;
        const data = this.data.model.cells.get(key);

        // Return structured CellData or raw data if it matches shape, or generic wrapper
        if (!data) return null;
        if (typeof data === 'object' && (data.glyph || data.className || data.state)) return data;
        return { glyph: String(data), value: data };
    }

    _setupComputedProperties() {
        this.computed(this.data.model, ['rows'], (rows) => (rows || []).length,
            { propertyName: 'row_count', target: this.view.data.model });

        this.computed(this.data.model, ['cols'], (cols) => (cols || []).length,
            { propertyName: 'col_count', target: this.view.data.model });

        this.computed(this.view.data.model, ['row_count', 'col_count'], (r, c) => r * c,
            { propertyName: 'cell_count', target: this.view.data.model });

        this.computed(this.view.data.model, ['cell_count'], (count) => {
            if (this.forceVirtual) return 'virtual';
            return count > this.virtualThreshold ? 'virtual' : 'table';
        }, { propertyName: 'render_mode', target: this.view.data.model });
    }

    compose() {
        const ctx = this.context;
        const renderMode = this.view.data.model.render_mode;
        const wrap = makeEl(ctx, 'div', 'matrix-wrap');

        if (renderMode === 'virtual') {
            wrap.add(this._composeVirtual());
        } else {
            wrap.add(this._composeTable());
        }

        this.add(wrap);
    }

    _composeTable() {
        const ctx = this.context;
        const { rows, cols } = this.data.model;
        const table = makeEl(ctx, 'table', 'matrix');

        // Header
        const thead = makeEl(ctx, 'thead');
        const trh = makeEl(ctx, 'tr', 'matrix-header-row');
        trh.add(makeEl(ctx, 'th', 'matrix-th matrix-th-corner', { 'aria-label': 'Corner' }).add(text(ctx, this.cornerLabel)));

        for (let ci = 0; ci < cols.length; ci++) {
            const col = cols[ci];
            const display = truncateLabel(this.getColLabel(col, ci), this.headerTruncateAt).display;
            const th = makeEl(ctx, 'th', `matrix-th matrix-th-col matrix-th-col--${this.headerMode}`, {
                'data-col-key': this.getColKey(col, ci),
                title: this.getColTitle(col, ci)
            });
            const inner = makeEl(ctx, 'div', 'matrix-th-col-inner',
                this.headerMode === 'angle' ? { style: `--matrix-angle: ${this.headerAngleDeg}deg;` } : null);
            inner.add(makeEl(ctx, 'span', 'matrix-th-col-label').add(text(ctx, display)));
            th.add(inner);
            trh.add(th);
        }
        thead.add(trh);
        table.add(thead);

        // Body
        const tbody = makeEl(ctx, 'tbody');
        for (let ri = 0; ri < rows.length; ri++) {
            const row = rows[ri];
            const rowKey = this.getRowKey(row, ri);
            const tr = makeEl(ctx, 'tr', 'matrix-row');

            // Row Header
            const th = makeEl(ctx, 'th', 'matrix-th matrix-th-row', {
                'data-row-key': rowKey,
                title: this.getRowTitle(row, ri)
            });
            th.add(text(ctx, this.getRowLabel(row, ri)));
            tr.add(th);

            // Cells
            for (let ci = 0; ci < cols.length; ci++) {
                const col = cols[ci];
                const colKey = this.getColKey(col, ci);

                // DATA RESOLUTION
                const cellData = this.getCellData(row, col, ri, ci);

                // RENDERING
                const td = makeEl(ctx, 'td', 'matrix-td');
                td.dom.attributes['data-row-key'] = String(rowKey);
                td.dom.attributes['data-col-key'] = String(colKey);

                this._renderDefaultCell(td, cellData);
                tr.add(td);
            }
            tbody.add(tr);
        }
        table.add(tbody);
        return table;
    }

    _renderDefaultCell(td, cellData) {
        if (!cellData) {
            td.add_class('matrix-td--empty');
            return;
        }

        // 1. Classes
        if (cellData.className) td.add_class(cellData.className);
        if (cellData.state) td.add_class(`cell--${cellData.state}`);

        // 2. Attributes
        if (cellData.title) td.dom.attributes.title = cellData.title;
        if (cellData.attrs) {
            for (const [k, v] of Object.entries(cellData.attrs)) {
                td.dom.attributes[k] = String(v);
            }
        }

        // 3. Content (Link or Text)
        const ctx = this.context;
        const display = cellData.glyph || cellData.text || (cellData.value !== undefined ? String(cellData.value) : '');

        if (cellData.href) {
            const a = makeEl(ctx, 'a', 'matrix-cell-link', { href: cellData.href, target: cellData.target || '_self' });
            a.add(text(ctx, display));
            td.add(a);
        } else {
            td.add(text(ctx, display));
        }
    }

    _composeVirtual() {
        const VirtualMatrix = require('./VirtualMatrix');
        const ctx = this.context;
        const { rows, cols } = this.data.model;

        // Prepare data for VirtualMatrix
        const rowKeys = [];
        const rowLabels = [];
        const rowTitles = [];
        const colKeys = [];
        const colLabels = [];
        const colTitles = [];

        for (let i = 0; i < rows.length; i++) {
            rowKeys.push(this.getRowKey(rows[i], i));
            rowLabels.push(this.getRowLabel(rows[i], i));
            rowTitles.push(this.getRowTitle(rows[i], i));
        }

        for (let i = 0; i < cols.length; i++) {
            colKeys.push(this.getColKey(cols[i], i));
            colLabels.push(this.getColLabel(cols[i], i));
            colTitles.push(this.getColTitle(cols[i], i));
        }

        const specialCells = [];
        const extractCellData = (value, key) => {
            const [rk, ck] = key.split('|');
            // Convert resolved data to simple object for virtual payload
            // If value is null, ignore
            if (value) {
                const cell = (typeof value === 'object') ? value : { glyph: String(value) };
                specialCells.push({
                    rowKey: rk,
                    colKey: ck,
                    state: cell.state,
                    className: cell.className,
                    glyph: cell.glyph,
                    title: cell.title,
                    href: cell.href
                });
            }
        };

        if (this.data.model.cells instanceof Map) {
            this.data.model.cells.forEach(extractCellData);
        }

        return new VirtualMatrix({
            context: ctx,
            cornerLabel: this.cornerLabel,
            rowKeys, rowLabels, rowTitles,
            colKeys, colLabels, colTitles,
            specialCells,
            // Pass through layout options if provided in spec (need to add to constructor or assume defaults)
            // For now use defaults or robust ones
            layout: {
                cellW: 44, cellH: 26, rowHeaderW: 220, colHeaderH: 120
            }
        });
    }

    /**
     * Set cell data (updates sparse map)
     */
    set_cell(rowKey, colKey, value) {
        const key = `${rowKey}|${colKey}`;
        const cells = new Map(this.data.model.cells);
        cells.set(key, value);
        this.data.model.cells = cells;
    }
}

// ============================================================================
// Internal CSS
// ============================================================================

Matrix.css = `
.matrix-control { font-family: system-ui, sans-serif; font-size: 14px; }
.matrix-wrap { overflow: auto; border: 1px solid #ccc; background: #fff; }
table.matrix { border-collapse: collapse; width: 100%; }
.matrix-th { background: #f8f9fa; color: #333; font-weight: 600; padding: 8px; border: 1px solid #dee2e6; text-align: left; }
.matrix-th-corner { position: sticky; left: 0; top: 0; z-index: 3; }
.matrix-th-row { position: sticky; left: 0; z-index: 1; min-width: 120px; }
.matrix-th-col { padding: 0; vertical-align: bottom; height: 100px; width: 40px; }
.matrix-th-col-inner { position: relative; height: 100px; width: 40px; }
.matrix-th-col--angle .matrix-th-col-label { position: absolute; left: 6px; bottom: 6px; transform-origin: left bottom; transform: rotate(calc(-1 * var(--matrix-angle, 45deg))); white-space: nowrap; font-size: 11px; }
.matrix-td { border: 1px solid #dee2e6; padding: 4px; text-align: center; width: 40px; height: 26px; font-family: monospace; }
.matrix-td:hover { outline: 2px solid #3b82f6; outline-offset: -2px; }
.matrix-cell-link { text-decoration: none; color: inherit; display: block; width: 100%; height: 100%; }
`;

module.exports = Matrix;
