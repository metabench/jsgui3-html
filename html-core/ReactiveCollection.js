'use strict';

/**
 * ReactiveCollection — wraps a source array/Collection and emits granular
 * 'insert', 'remove', and 'reset' events. Stage 1: filter support.
 *
 * @example
 * const visible = new ReactiveCollection(source, {
 *     filter: item => item.active
 * });
 * visible.on('insert', ({ position, item }) => { ... });
 * visible.on('remove', ({ position, item }) => { ... });
 * visible.on('reset',  ({ items }) => { ... });
 */

const Evented_Class = (() => {
    try {
        const lt = require('lang-tools');
        // lang-mini Evented_Class is the prototype base
        return lt.Evented_Class || Object.getPrototypeOf(lt.Data_Object.prototype).constructor;
    } catch (e) {
        return null;
    }
})();

class ReactiveCollection {
    constructor(source, options = {}) {
        this._source = source || [];
        this._filter_fn = options.filter || null;
        this._items = [];
        this._listeners = {};
        this._source_listeners = [];

        // Initial build
        this._rebuild();

        // Auto-attach to source change events if source is evented (Data_Object, Collection, etc.)
        if (this._source && typeof this._source.on === 'function') {
            const handler = (e) => this._on_source_change(e);
            this._source.on('change', handler);
            this._source_listeners.push({ event: 'change', handler });
        }
    }

    // ── Public API ──

    /**
     * Get filtered items.
     * @returns {Array}
     */
    get items() {
        return this._items.slice();
    }

    /**
     * Get item count.
     * @returns {number}
     */
    get length() {
        return this._items.length;
    }

    /**
     * Get item at index.
     * @param {number} index
     * @returns {*}
     */
    get(index) {
        return this._items[index];
    }

    /**
     * Update the filter function. Triggers a full diff.
     * @param {Function|null} fn
     */
    set_filter(fn) {
        this._filter_fn = fn || null;
        this._rebuild_with_diff();
    }

    /**
     * Set a new source array/Collection.
     * @param {Array|Collection} source
     */
    set_source(source) {
        // Detach old listeners
        this._detach_source_listeners();

        this._source = source || [];

        // Re-attach if evented
        if (this._source && typeof this._source.on === 'function') {
            const handler = (e) => this._on_source_change(e);
            this._source.on('change', handler);
            this._source_listeners.push({ event: 'change', handler });
        }

        this._rebuild_with_diff();
    }

    /**
     * Force full rebuild. Emits 'reset'.
     */
    reset() {
        this._rebuild();
        this._emit('reset', { items: this._items.slice() });
    }

    /**
     * Listen for events.
     * @param {string} event - 'insert', 'remove', or 'reset'
     * @param {Function} handler
     */
    on(event, handler) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(handler);
    }

    /**
     * Remove listener.
     * @param {string} event
     * @param {Function} handler
     */
    off(event, handler) {
        const list = this._listeners[event];
        if (!list) return;
        const idx = list.indexOf(handler);
        if (idx >= 0) list.splice(idx, 1);
    }

    /**
     * Destroy — detach all listeners.
     */
    destroy() {
        this._detach_source_listeners();
        this._listeners = {};
        this._items = [];
    }

    // ── Internal ──

    /**
     * Get raw items from source (supports Array and Collection).
     * @private
     */
    _get_source_items() {
        const src = this._source;
        if (Array.isArray(src)) return src;
        // Collection has ._arr
        if (src && src._arr && Array.isArray(src._arr)) return src._arr;
        // Or use toArray()
        if (src && typeof src.toArray === 'function') return src.toArray();
        return [];
    }

    /**
     * Apply filter to source items.
     * @private
     */
    _apply_filter(items) {
        if (!this._filter_fn) return items.slice();
        return items.filter(this._filter_fn);
    }

    /**
     * Full rebuild — no diff, no events.
     * @private
     */
    _rebuild() {
        const source_items = this._get_source_items();
        this._items = this._apply_filter(source_items);
    }

    /**
     * Rebuild with diff — emits granular insert/remove events.
     * Uses a simple linear diff for position-accurate events.
     * @private
     */
    _rebuild_with_diff() {
        const old_items = this._items;
        const source_items = this._get_source_items();
        const new_items = this._apply_filter(source_items);

        // Simple set-based diff for identity-based items
        const old_set = new Set(old_items);
        const new_set = new Set(new_items);

        // Items removed
        const removed = [];
        for (let i = old_items.length - 1; i >= 0; i--) {
            if (!new_set.has(old_items[i])) {
                removed.push({ position: i, item: old_items[i] });
            }
        }

        // Apply removals (emit in reverse order for stable positions)
        for (const r of removed) {
            this._emit('remove', r);
        }

        // Update internal list
        this._items = new_items;

        // Items inserted
        for (let i = 0; i < new_items.length; i++) {
            if (!old_set.has(new_items[i])) {
                this._emit('insert', { position: i, item: new_items[i] });
            }
        }
    }

    /**
     * Handle source change events (from Data_Object or Collection).
     * @private
     */
    _on_source_change(e) {
        if (!e) return;

        const name = e.name;

        // Collection insert
        if (name === 'insert') {
            const item = e.item || e.value;
            if (this._filter_fn && !this._filter_fn(item)) return;

            // Find correct insertion position in filtered list
            const source_items = this._get_source_items();
            const filtered = this._apply_filter(source_items);
            const pos = filtered.indexOf(item);
            if (pos >= 0) {
                this._items = filtered;
                this._emit('insert', { position: pos, item });
            }
            return;
        }

        // Collection remove
        if (name === 'remove') {
            const item = e.item || e.value;
            const pos = this._items.indexOf(item);
            if (pos >= 0) {
                this._items.splice(pos, 1);
                this._emit('remove', { position: pos, item });
            }
            return;
        }

        // Generic change — trigger full diff
        this._rebuild_with_diff();
    }

    /**
     * Emit event to listeners.
     * @private
     */
    _emit(event, data) {
        const list = this._listeners[event];
        if (!list || list.length === 0) return;
        for (const handler of list) {
            handler(data);
        }
    }

    /**
     * Detach from source events.
     * @private
     */
    _detach_source_listeners() {
        if (!this._source || typeof this._source.off !== 'function') {
            this._source_listeners = [];
            return;
        }
        for (const sl of this._source_listeners) {
            this._source.off(sl.event, sl.handler);
        }
        this._source_listeners = [];
    }
}

module.exports = ReactiveCollection;
