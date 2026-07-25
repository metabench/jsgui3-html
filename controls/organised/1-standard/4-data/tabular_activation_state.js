'use strict';

// A deliberately small, opt-in bridge for static Data_Table/Data_Grid state.
// The rendered DOM remains the source of the initial browser view; this state
// only restores the model needed for later filtering, sorting, paging, and
// selection after a fresh client activation.

const TABULAR_STATE_ATTRIBUTE = 'data-jsgui-tabular-state';
const TABULAR_STATE_VERSION = 1;
const MAX_STATE_CHARACTERS = 131072;
const MAX_ROWS = 500;
const MAX_COLUMNS = 64;
const MAX_DEPTH = 20;
const SELECTION_MODES = new Set(['none', 'single', 'multiple']);

const clone_json_value = (value, seen, depth) => {
    if (depth > MAX_DEPTH) throw new TypeError('tabular state is too deeply nested');
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'number') {
        if (!Number.isFinite(value)) throw new TypeError('tabular state numbers must be finite');
        return value;
    }
    if (typeof value !== 'object') {
        throw new TypeError('tabular state must contain only JSON-safe values');
    }
    if (seen.has(value)) throw new TypeError('tabular state must not contain cycles');
    seen.add(value);

    let cloned;
    if (Array.isArray(value)) {
        cloned = value.map(item => clone_json_value(item, seen, depth + 1));
    } else {
        const prototype = Object.getPrototypeOf(value);
        if (prototype !== Object.prototype && prototype !== null) {
            throw new TypeError('tabular state objects must be plain objects');
        }
        cloned = {};
        for (const key of Object.keys(value)) {
            cloned[key] = clone_json_value(value[key], seen, depth + 1);
        }
    }

    seen.delete(value);
    return cloned;
};

const normalize_state = source => {
    if (!source || typeof source !== 'object') return null;
    const columns = Array.isArray(source.columns) ? source.columns : [];
    const rows = Array.isArray(source.rows) ? source.rows : [];
    if (columns.length > MAX_COLUMNS || rows.length > MAX_ROWS) return null;

    try {
        const selected_row_indices = Array.isArray(source.selected_row_indices)
            ? Array.from(new Set(source.selected_row_indices
                .map(value => Number(value))
                .filter(value => Number.isInteger(value) && value >= 0 && value < rows.length)))
            : [];
        const state = {
            version: TABULAR_STATE_VERSION,
            columns: clone_json_value(columns, new Set(), 0),
            rows: clone_json_value(rows, new Set(), 0),
            sort_state: source.sort_state == null
                ? null
                : clone_json_value(source.sort_state, new Set(), 0),
            filters: source.filters == null
                ? null
                : clone_json_value(source.filters, new Set(), 0),
            page: Math.max(1, Number(source.page) || 1),
            page_size: source.page_size
                ? Math.max(1, Number(source.page_size) || 1)
                : null,
            selection_mode: SELECTION_MODES.has(source.selection_mode)
                ? source.selection_mode
                : 'none',
            selected_row_indices
        };
        if (typeof source.aria_label === 'string') state.aria_label = source.aria_label;
        if (typeof source.density === 'string') state.density = source.density;
        return state;
    } catch (error) {
        return null;
    }
};

const serialize_tabular_state = source => {
    const state = normalize_state(source);
    if (!state) return null;
    const json = JSON.stringify(state);
    if (json.length > MAX_STATE_CHARACTERS) return null;
    return json;
};

const read_tabular_state = element => {
    if (!element || typeof element.getAttribute !== 'function') return null;
    const json = element.getAttribute(TABULAR_STATE_ATTRIBUTE);
    if (!json || json.length > MAX_STATE_CHARACTERS) return null;
    try {
        const parsed = JSON.parse(json);
        if (!parsed || parsed.version !== TABULAR_STATE_VERSION) return null;
        return normalize_state(parsed);
    } catch (error) {
        return null;
    }
};

module.exports = {
    TABULAR_STATE_ATTRIBUTE,
    TABULAR_STATE_VERSION,
    MAX_STATE_CHARACTERS,
    MAX_ROWS,
    MAX_COLUMNS,
    normalize_state,
    serialize_tabular_state,
    read_tabular_state
};
