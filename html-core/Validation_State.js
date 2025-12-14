const { Evented_Class, tof } = require('lang-tools');

class Validation_State extends Evented_Class {
    constructor(spec = {}) {
        super(spec);

        this._valid = undefined;
        this._message = undefined;
        this._code = undefined;
        this._details = undefined;

        const t_spec = tof(spec);
        if (t_spec === 'boolean') {
            this._valid = spec;
        } else if (t_spec === 'string') {
            this._valid = false;
            this._message = spec;
        } else if (t_spec === 'object' && spec) {
            if (Object.prototype.hasOwnProperty.call(spec, 'valid')) this._valid = spec.valid;
            if (Object.prototype.hasOwnProperty.call(spec, 'message')) this._message = spec.message;
            if (Object.prototype.hasOwnProperty.call(spec, 'code')) this._code = spec.code;
            if (Object.prototype.hasOwnProperty.call(spec, 'details')) this._details = spec.details;
        }
    }

    set(value) {
        const t_value = tof(value);

        if (t_value === 'boolean') {
            this.valid = value;
            return;
        }

        if (t_value === 'undefined' || value === null) {
            this.valid = undefined;
            this.message = undefined;
            this.code = undefined;
            this.details = undefined;
            return;
        }

        if (t_value === 'string') {
            const str = value.trim().toLowerCase();
            if (str === 'valid' || str === 'true' || str === 'ok' || str === 'pass') {
                this.valid = true;
                this.message = undefined;
                return;
            }
            if (str === 'invalid' || str === 'false' || str === 'error' || str === 'fail') {
                this.valid = false;
                this.message = undefined;
                return;
            }
            if (str === 'neutral' || str === 'unknown' || str === '') {
                this.valid = undefined;
                this.message = undefined;
                return;
            }

            this.message = value;
            if (typeof this.valid === 'undefined') this.valid = false;
            return;
        }

        if (value instanceof Validation_State) {
            this.valid = value.valid;
            this.message = value.message;
            this.code = value.code;
            this.details = value.details;
            return;
        }

        if (value instanceof Error) {
            this.message = value.message;
            this.details = value;
            if (typeof this.valid === 'undefined') this.valid = false;
            return;
        }

        if (t_value === 'object' && value) {
            if (Object.prototype.hasOwnProperty.call(value, 'valid')) this.valid = value.valid;
            if (Object.prototype.hasOwnProperty.call(value, 'message')) this.message = value.message;
            if (Object.prototype.hasOwnProperty.call(value, 'code')) this.code = value.code;
            if (Object.prototype.hasOwnProperty.call(value, 'details')) this.details = value.details;
            return;
        }

        this.details = value;
        if (typeof this.valid === 'undefined') this.valid = false;
    }

    get valid() {
        return this._valid;
    }
    set valid(value) {
        if (value === this._valid) return;
        const old = this._valid;
        this._valid = value;
        this.raise('change', { name: 'valid', old, value });
    }

    get message() {
        return this._message;
    }
    set message(value) {
        const message = value instanceof Error ? value.message : value;
        const new_message = typeof message === 'undefined' || message === null ? message : String(message);
        if (new_message === this._message) return;
        const old = this._message;
        this._message = new_message;
        this.raise('change', { name: 'message', old, value: new_message });
    }

    get code() {
        return this._code;
    }
    set code(value) {
        if (value === this._code) return;
        const old = this._code;
        this._code = value;
        this.raise('change', { name: 'code', old, value });
    }

    get details() {
        return this._details;
    }
    set details(value) {
        if (value === this._details) return;
        const old = this._details;
        this._details = value;
        this.raise('change', { name: 'details', old, value });
    }
}

module.exports = Validation_State;
