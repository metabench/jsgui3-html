const lang_tools = require('lang-tools');

const {
    Data_Object: Base_Data_Object,
    Data_Value,
    tof
} = lang_tools;

let data_object_set_patched = false;
let data_value_id_patched = false;
let data_object_fields_patched = false;
let collection_data_model_push_patched = false;
let needs_patch_cached = null;

const is_plain_object = (value) => {
    if (value === null || typeof value !== 'object') return false;
    if (Array.isArray(value)) return false;
    if (value instanceof Date) return false;
    if (value.__data_model || value.__data_object || value.__data_value) return false;
    return true;
};

const unwrap_value = (value) => {
    if (value && value.__data_value) {
        return value.value;
    }
    return value;
};

const ensure_property_access = (obj, prop_name) => {
    if (typeof prop_name !== 'string') return;
    if (prop_name.indexOf('.') !== -1) return;
    if (prop_name.startsWith('_') || prop_name.startsWith('__')) return;

    const existing_descriptor = Object.getOwnPropertyDescriptor(obj, prop_name);
    if (existing_descriptor) {
        if (typeof existing_descriptor.get === 'function' || typeof existing_descriptor.set === 'function') return;
        if (typeof existing_descriptor.value === 'function') return;
    } else {
        if (prop_name in obj) return;
    }

    Object.defineProperty(obj, prop_name, {
        enumerable: true,
        configurable: true,
        get() {
            if (typeof obj.get === 'function') {
                return unwrap_value(obj.get(prop_name));
            }
        },
        set(value) {
            if (typeof obj.set === 'function') {
                obj.set(prop_name, value);
            } else {
                obj[prop_name] = value;
            }
        }
    });
};

const patch_data_object_set = () => {
    if (data_object_set_patched) return;
    data_object_set_patched = true;

    const original_set = Base_Data_Object.prototype.set;

    Base_Data_Object.prototype.set = function () {
        const a = arguments;
        const prop_name = a[0];

        if (typeof prop_name === 'string' && a.length >= 2) {
            const value = a[1];
            const silent_arg = a[2];
            const silent = typeof silent_arg === 'boolean' || typeof silent_arg === 'string'
                ? !!silent_arg
                : false;

            const old_raw = typeof this.get === 'function' ? this.get(prop_name) : this[prop_name];
            const old_val = unwrap_value(old_raw);
            const has_existing = typeof old_raw !== 'undefined';

            let safe_value = value;
            if (value === null && !has_existing) {
                safe_value = new Data_Value({ value: null });
            }

            if (!silent) {
                // Work around lang-tools 0.0.42 bug: Data_Object.set calls .value() on Data_Value/Data_Object.
                original_set.call(this, prop_name, safe_value, true);
                const stored_after_set = typeof this.get === 'function' ? this.get(prop_name) : undefined;
                if (stored_after_set && stored_after_set.__data_value && !stored_after_set.context && this.context) {
                    stored_after_set.context = this.context;
                }
                ensure_property_access(this, prop_name);

                const new_raw = typeof this.get === 'function' ? this.get(prop_name) : value;
                const new_val = unwrap_value(new_raw);

                // Use _emit_change for batch-awareness when available
                const emit = typeof this._emit_change === 'function'
                    ? this._emit_change.bind(this)
                    : (typeof this.raise_event === 'function' ? this.raise_event.bind(this, 'change') : null);
                if (emit) {
                    emit({
                        name: prop_name,
                        old: old_val,
                        value: new_val
                    });
                }
                return new_val;
            } else {
                const res = original_set.call(this, prop_name, safe_value, true);
                const stored_after_set = typeof this.get === 'function' ? this.get(prop_name) : undefined;
                if (stored_after_set && stored_after_set.__data_value && !stored_after_set.context && this.context) {
                    stored_after_set.context = this.context;
                }
                ensure_property_access(this, prop_name);
                return res;
            }
        }

        return original_set.apply(this, a);
    };
};

const patch_data_object_set_light = () => {
    if (data_object_set_patched) return;
    data_object_set_patched = true;

    const original_set = Base_Data_Object.prototype.set;

    Base_Data_Object.prototype.set = function () {
        const a = arguments;
        const prop_name = a[0];
        const res = original_set.apply(this, a);

        if (typeof prop_name === 'string' && a.length >= 2) {
            ensure_property_access(this, prop_name);
        }

        return res;
    };
};

const patch_data_value_id = () => {
    if (data_value_id_patched) return;
    data_value_id_patched = true;

    const original_id = Data_Value.prototype._id;
    if (typeof original_id !== 'function') return;

    Data_Value.prototype._id = function () {
        if (this.__id) return this.__id;
        if (this.context) {
            return original_id.call(this);
        }
        return undefined;
    };
};

const patch_collection_data_model_push = () => {
    if (collection_data_model_push_patched) return;
    collection_data_model_push_patched = true;

    const { Collection } = lang_tools;
    if (!Collection || !Collection.prototype || typeof Collection.prototype.push !== 'function') return;

    const original_push = Collection.prototype.push;

    Collection.prototype.push = function (value) {
        const tv = tof(value);
        if (tv === 'data_model') {
            const { silent } = this;
            const fn_index = this.fn_index;
            let idx_key;
            let has_idx_key = false;
            if (fn_index) {
                idx_key = fn_index(value);
                has_idx_key = true;
            }

            const pos = this._arr.length;
            this._arr.push(value);
            this._arr_idx++;

            if (!silent) {
                this.raise('change', {
                    target: this,
                    item: value,
                    value: value,
                    position: pos,
                    name: 'insert'
                });
            }

            if (has_idx_key && this.index && typeof this.index.put === 'function') {
                this.index.put(idx_key, pos);
            }

            return value;
        }

        return original_push.call(this, value);
    };

    // Keep `.add` aligned with `.push` (lang-tools assigns it as an alias once at load-time).
    Collection.prototype.add = Collection.prototype.push;
};

const normalize_fields_spec = (fields) => {
    if (!fields) return [];
    if (Array.isArray(fields)) return fields;
    if (typeof fields === 'object') {
        return Object.keys(fields).map(key => [key, fields[key]]);
    }
    return [];
};

const patch_set_fields_from_spec = () => {
    if (data_object_fields_patched) return;
    data_object_fields_patched = true;

    Base_Data_Object.prototype.set_fields_from_spec = function (fields, spec = {}) {
        const normalized = normalize_fields_spec(fields);
        normalized.forEach(field_def => {
            const field_name = field_def[0];
            if (typeof field_name !== 'string') return;

            const has_value = spec && Object.prototype.hasOwnProperty.call(spec, field_name);
            const default_value = field_def.length >= 3 ? field_def[2] : undefined;
            const value_to_set = has_value ? spec[field_name] : default_value;

            if (typeof value_to_set === 'undefined') return;

            if (typeof this.set === 'function') {
                try {
                    this.set(field_name, value_to_set, true);
                } catch (e) {
                    this[field_name] = value_to_set;
                }
            } else {
                this[field_name] = value_to_set;
            }

            ensure_property_access(this, field_name);
        });
    };
};

class Data_Object_Compat extends Base_Data_Object {
    constructor(spec = {}, fields) {
        super(spec, fields);

        const reserved_keys = new Set([
            'context',
            'id',
            '__id',
            '_id',
            '__type_name',
            '__type',
            'parent',
            'abstract'
        ]);

        if (spec && typeof spec === 'object' && !Array.isArray(spec)) {
            Object.keys(spec).forEach(key => {
                if (reserved_keys.has(key)) return;
                if (key.startsWith('__')) return;

                let v = spec[key];

                try {
                    this.set(key, v, true);
                    ensure_property_access(this, key);
                } catch (e) {
                    this[key] = v;
                }
            });
        }
    }
}

const detect_needs_patch = () => {
    if (needs_patch_cached !== null) return needs_patch_cached;

    const with_suppressed_console_trace = fn => {
        const orig_trace = console.trace;
        console.trace = () => { };
        try {
            return fn();
        } finally {
            console.trace = orig_trace;
        }
    };

    const requirements = {
        needs_heavy_set_patch: false,
        needs_accessors_patch: false,
        needs_data_value_id_patch: false,
        needs_data_object_compat: false,
        needs_set_fields_patch: false,
        needs_collection_data_model_patch: false
    };

    // 1) Spec activation should populate internal storage (get) not just direct props.
    try {
        const inst = new Base_Data_Object({ a: 1 });
        const got = typeof inst.get === 'function' ? inst.get('a') : undefined;
        const got_val = got && got.__data_value ? got.value : got;
        if (got_val !== 1) {
            requirements.needs_data_object_compat = true;
        }
    } catch (e) {
        requirements.needs_data_object_compat = true;
    }

    // 2) set should accept null safely (old bug).
    try {
        const inst = new Base_Data_Object();
        if (typeof inst.set === 'function') {
            inst.set('n', null, true);
        } else {
            requirements.needs_heavy_set_patch = true;
        }
    } catch (e) {
        requirements.needs_heavy_set_patch = true;
    }

    // 3) repeated set with Data_Value should not throw (old bug called .value()).
    if (!requirements.needs_heavy_set_patch) {
        try {
            const inst = new Base_Data_Object();
            inst.set('dv', new Data_Value({ value: 2 }), true);
            inst.set('dv', 3, true);
        } catch (e) {
            requirements.needs_heavy_set_patch = true;
        }
    }

    // 4) Change event payload should include old + plain value.
    if (!requirements.needs_heavy_set_patch) {
        try {
            const inst = new Base_Data_Object({ a: 1 });
            let evt;
            inst.on('change', e => { evt = e; });
            inst.set('a', 2);
            const old_is_data_value = evt && evt.old && evt.old.__data_value;
            const value_is_data_value = evt && evt.value && evt.value.__data_value;
            if (!evt || !Object.prototype.hasOwnProperty.call(evt, 'old') || old_is_data_value || value_is_data_value) {
                requirements.needs_heavy_set_patch = true;
            }
        } catch (e) {
            requirements.needs_heavy_set_patch = true;
        }
    }

    // 5) Direct assignment should be reactive after set (accessor support).
    if (!requirements.needs_heavy_set_patch) {
        try {
            const inst = new Base_Data_Object();
            inst.set('x', 1, true);
            const desc = Object.getOwnPropertyDescriptor(inst, 'x');
            if (!desc || typeof desc.get !== 'function' || typeof desc.set !== 'function') {
                requirements.needs_accessors_patch = true;
            } else {
                inst.x = 2;
                const got = inst.get('x');
                const got_val = got && got.__data_value ? got.value : got;
                if (got_val !== 2) requirements.needs_accessors_patch = true;
            }
        } catch (e) {
            requirements.needs_accessors_patch = true;
        }
    }

    // 6) Data_Value._id should not hard-throw without context.
    try {
        const dv = new Data_Value({ value: 1 });
        if (typeof dv._id === 'function') dv._id();
    } catch (e) {
        requirements.needs_data_value_id_patch = true;
    }

    // 7) set_fields_from_spec should not throw (new lang-tools deprecates it).
    if (typeof Base_Data_Object.prototype.set_fields_from_spec === 'function') {
        try {
            with_suppressed_console_trace(() => {
                // eslint-disable-next-line no-new
                new Base_Data_Object({}, [['__compat_test', String]]);
            });
        } catch (e) {
            requirements.needs_set_fields_patch = true;
        }
    }

    // 8) Collection should accept Data_Model/Data_Object items (new lang-tools uses tof === 'data_model').
    try {
        const { Collection, Data_Object } = lang_tools;
        if (Collection && Data_Object) {
            const col = new Collection({});
            col.add(new Data_Object({}));
            if (typeof col.length === 'function' && col.length() === 0) {
                requirements.needs_collection_data_model_patch = true;
            }
        }
    } catch (e) {
        requirements.needs_collection_data_model_patch = true;
    }

    needs_patch_cached = requirements;
    return requirements;
};

const apply_patches_if_needed = () => {
    const requirements = detect_needs_patch();

    if (requirements.needs_heavy_set_patch) {
        patch_data_object_set();
    } else if (requirements.needs_accessors_patch) {
        patch_data_object_set_light();
    }

    if (requirements.needs_data_value_id_patch) {
        patch_data_value_id();
    }

    if (requirements.needs_set_fields_patch) {
        patch_set_fields_from_spec();
    }

    if (requirements.needs_data_object_compat) {
        lang_tools.Data_Object = Data_Object_Compat;
    }

    if (requirements.needs_collection_data_model_patch) {
        patch_collection_data_model_push();
    }
};

const patch_lang_tools = () => {
    apply_patches_if_needed();
    return lang_tools;
};

// Apply patches on load only if upstream lacks required features.
apply_patches_if_needed();

module.exports = {
    Base_Data_Object,
    Data_Object_Compat,
    patch_lang_tools,
    unwrap_value,
    ensure_property_access
};
