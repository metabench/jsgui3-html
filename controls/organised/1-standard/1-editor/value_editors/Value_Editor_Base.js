'use strict';

/**
 * Value_Editor_Base
 *
 * Abstract base for all value editors.
 * 
 * Contract:
 *   get_value()            → current canonical value
 *   set_value(v, opts)     → sets value; opts.silent skips events
 *   on('value-change', fn) → raised when user changes value
 *   validate()             → { valid, message }
 *   get_display_text()     → short text for inline display
 *   handle_keydown(e)      → returns true if key was consumed
 */

const jsgui = require('../../../../../html-core/html-core');
const Control = jsgui.Control;

const VARIES = Symbol('VARIES');

class Value_Editor_Base extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'value_editor';
        super(spec);
        this.add_class('value-editor');

        this._value = spec.value !== undefined ? spec.value : null;
        this._read_only = !!spec.read_only;
        this._varies = false;
    }

    /**
     * Get the current value.
     * @returns {*}
     */
    get_value() {
        return this._value;
    }

    /**
     * Set the value.
     * @param {*} value
     * @param {Object} [opts]  { silent, source }
     */
    set_value(value, opts = {}) {
        const old = this._value;
        this._value = value;
        this._varies = false;
        if (!opts.silent) {
            this.raise('value-change', { old, value, source: opts.source || 'api' });
        }
    }

    /**
     * Mark this editor as showing a "varies" state (multi-object selection).
     */
    set_varies() {
        this._varies = true;
        this._value = VARIES;
    }

    /**
     * @returns {boolean}
     */
    is_varies() {
        return this._varies;
    }

    /**
     * Short text for inline display.
     * @returns {string}
     */
    get_display_text() {
        if (this._varies) return '(varies)';
        return this._value != null ? String(this._value) : '';
    }

    /**
     * Validate the current value.
     * @returns {{ valid: boolean, message?: string }}
     */
    validate() {
        return { valid: true };
    }

    /**
     * Handle keyboard events.  Return true if consumed.
     * @param {KeyboardEvent} e
     * @returns {boolean}
     */
    handle_keydown(e) {
        if (e.key === 'Escape') {
            this.raise('editor-cancel');
            return true;
        }
        if (e.key === 'Enter') {
            this.raise('editor-commit', { value: this.get_value() });
            return true;
        }
        return false;
    }
}

Value_Editor_Base.VARIES = VARIES;

module.exports = Value_Editor_Base;
