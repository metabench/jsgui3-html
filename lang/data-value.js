var jsgui = require('./essentials');
var Evented_Class = require('./evented-class');

var j = jsgui;
var Class = j.Class;
var each = j.each;
var is_array = j.is_array;
var is_dom_node = j.is_dom_node;
var is_ctrl = j.is_ctrl;
var extend = j.extend;
var get_truth_map_from_arr = j.get_truth_map_from_arr;
var get_map_from_arr = j.get_map_from_arr;
var arr_like_to_arr = j.arr_like_to_arr;
var tof = j.tof;
var is_defined = j.is_defined;
var stringify = j.stringify;
var functional_polymorphism = j.functional_polymorphism;
var fp = j.fp;
var arrayify = j.arrayify;
var mapify = j.mapify;
var are_equal = j.are_equal;
var get_item_sig = j.get_item_sig;
var set_vals = j.set_vals;
var truth = j.truth;
var trim_sig_brackets = j.trim_sig_brackets;
var ll_set = j.ll_set;
var ll_get = j.ll_get;
var input_processors = j.input_processors;
var iterate_ancestor_classes = j.iterate_ancestor_classes;
var is_arr_of_arrs = j.is_arr_of_arrs;
var is_arr_of_strs = j.is_arr_of_strs;
var is_arr_of_t = j.is_arr_of_t;
var clone = jsgui.clone;


var input_processors = jsgui.input_processors;

class Data_Value extends Evented_Class {
    constructor(spec) {
        super(spec);
        this.__data_value = true;

        if (spec && spec.context) {
            this.context = spec.context;

        }
        if (spec) {
            //console.log('!* spec.value ' + spec.value);
            //console.log('spec ' + stringify(spec));
        }
        if (spec && is_defined(spec.value)) {
            this._ = spec.value;
        }
        this.__type = 'data_value';
        //this._bound_events = {};
        this._relationships = {};
    }
    'get'() {
        //return this._val;
        return this._;
    }
    'value'() {
        return this._;
    }
    'toObject'() {
        return this._;

    }
    'set'(val) {
        //this._val = val;

        // This may also need to make use of input_processors

        var input_processor = input_processors[this.__type_name];


        if (input_processor) {
            val = input_processor(val);
        }
        var old_val = this._;
        //console.log('old_val', old_val);
        this._ = val;
        //console.log('val', val);
        this.raise('change', {
            'old': old_val,
            'value': val
        });
        return val;
    }
    'toString'() {
        //return stringify(this.get());
        // con
        //console.log('this._val ' + stringify(this._val));
        //throw 'stop';
        return this.get();
    }
    // Maybe a particular stringify function?
    'toJSON'() {
        var val = this.get();
        //var tval = tof(val);
        var tval = typeof val;
        if (tval == 'string') {
            return '"' + val + '"';
        } else {
            return val;
        }
    }
    'clone'() {
        var res = new Data_Value({
            'value': this._
        });
        return res;
    }
    '_id'() {
        if (this.__id) return this.__id;
        if (this.context) {
            //console.log('this.__type ' + this.__type);
            //throw 'stop';
            this.__id = this.context.new_id(this.__type_name || this.__type);
        } else {
            if (!is_defined(this.__id)) {
                throw 'DataValue should have context';
                this.__id = new_data_value_id();
            }
        }
        return this.__id;
    }
    'parent'() {
        var a = arguments; a.l = arguments.length; var sig = get_a_sig(a, 1);
        var obj, index;
        //console.log('parent sig', sig);
        if (a.l == 0) {
            return this._parent;
        }
        if (a.l == 1) {
            obj = a[0];

            if (!this.context && obj.context) {
                this.context = obj.context;
            }

            var relate_by_id = function (that) {
                var obj_id = obj._id();
                that._relationships[obj_id] = true;
            }

            var relate_by_ref = function (that) {
                that._parent = obj;
            }
            relate_by_ref(this);
        }
        if (a.l == 2) {
            obj = a[0];
            index = a[1];

            if (!this.context && obj.context) {
                this.context = obj.context;
            }

            this._parent = obj;
            this._index = index;
        }

        if (is_defined(index)) {
            // I think we just set the __index property.
            //  I think a __parent property and a __index property would do the job here.
            //  Suits DOM heirachy.
            // A __relationships property could make sense for wider things, however, it would be easy (for the moment?)
            // to just have .__parent and .__index
            //

            // Not sure all Data_Objects will need contexts.
            //  It's mainly useful for Controls so far
        } else {
            // get the object's id...

            // setting the parent... the parent may have a context.
        }
    }
};

module.exports = Data_Value;
