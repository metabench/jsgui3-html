
var jsgui = require('./essentials');
//var Data_Structures = require('./jsgui-data-structures');
var Data_Value = require('./data-value');
var Data_Object = require('./data-object');
var Sorted_KVS = require('./sorted-kvs');
var dobj = Data_Object.dobj;
//console.log('Data_Object', Data_Object);
//var Data_Object_Field_Collection = Data_Object.Fields_Collection;
//var Constraint = require('./constraint');

var Constraint = Data_Object.Constraint;
var j = jsgui;
var Class = j.Class;
var each = j.each;
var is_array = j.is_array;
var is_dom_node = j.is_dom_node;
var is_ctrl = j.is_ctrl;
var extend = j.extend;
var clone = j.clone;
var x_clones = j.x_clones;
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
var iterate_ancestor_classes = j.iterate_ancestor_classes;
var is_constructor_fn = j.is_constructor_fn;
var get_a_sig = j.get_a_sig;
var is_arr_of_strs = j.is_arr_of_strs;
var is_arr_of_arrs = j.is_arr_of_arrs;
//var dobj = Data_Object;
var input_processors = j.input_processors;
//var constraint_from_obj = Constraint.from_obj;
var native_constructor_tof = jsgui.native_constructor_tof;
var dop = Data_Object.prototype;

class Collection extends Data_Object {

    constructor(spec = {}, arr_values) {
        // Has problems setting up the index while it is initialising.
        //  Can't call set_index.
        super(spec);
        //console.log('Collection init');
        //console.log('spec ' + stringify(spec))
        //spec = spec || {};
        // Probably should act differently for an abstract collection.
        this.__type = 'collection';
        this.__type_name = 'collection';

        var t_spec = tof(spec);
        if (spec.abstract === true) {
            if (t_spec === 'function') {
                this.constraint(spec);
            }
            // Abstract collection of type.
            // Will not have an actual index system in abstract mode.
        } else {
            this._relationships = this._relationships || {};
            this._arr_idx = 0;
            this._arr = [];
            // Maybe some collections don't need indexing?
            //this.index_system = new Collection_Index_System({
            //    'collection' : this
            //});

            this.index = new Sorted_KVS();
            this.fn_index = spec.fn_index;

            //console.log('t_spec', t_spec);

            if (t_spec == 'array') {
                spec = {
                    'load_array': spec
                };
            } else {
                if (t_spec == 'function') {
                    if (spec.abstract === true) {
                        //throw 'Collection with abstract spec function';
                        this._abstract = true;
                    } else {
                    }

                } else if (t_spec == 'string') {
                    // May be like with the constraint above.
                    // still need to set up the constructor function.
                    var map_native_constructors = {
                        'array': Array,
                        'boolean': Boolean,
                        'number': Number,
                        'string': String,
                        'object': Object
                    }
                    var nc = map_native_constructors[spec];
                    if (nc) {
                        spec = {
                            'constraint': nc
                        };
                        if (nc == String) {
                            spec.index_by = 'value';
                        }
                    }
                }
            }
            if (is_defined(spec.items)) {
                spec.load_array = spec.load_array || spec.items;
            }
            if (arr_values) {
                //console.log('load arr_values ------------');
                spec.load_array = arr_values;
            }
            // keeping these things below the expected public interface.
            if (is_defined(spec.accepts)) {
                this._accepts = spec.accepts;
            }
            if (jsgui.__data_id_method === 'init') {
                // but maybe there will always be a context. May save download size on client too.
                if (this.context) {
                    this.__id = this.context.new_id(this.__type_name || this.__type);
                    this.context.map_objects[this.__id] = this;
                } else {
                    // don't think we want a whole bunch of objects mapped like this....
                    //  IDs will be very useful when they are controls... but maybe not always needed.

                    //this.__id = new_collection_id();
                    //map_jsgui_ids[this.__id] = this;
                }
            }
            if (!this.__type) {

            }
            if (spec.load_array) {
                this.load_array(spec.load_array);
            }
        }
    }
    // maybe use fp, and otherwise apply with the same params and context.
    'set' (value) {
        // get the tof(value)
        var tval = tof(value);
        //console.log('tval ' + tval);
        //throw('stop');
        var that = this;
        if (tval == 'data_object') {
            this.clear();
            return this.push(value);
        } else if (tval == 'array') {
            // for an array... clear, then add each.
            this.clear();
            each(value, function (v, i) {
                that.push(v);
            });
        } else {
            if (tval == 'collection') {
                // need to reindex - though could have optimization that checks to see if the indexes are the same...
                throw 'stop';
                this.clear();
                value.each(function (v, i) {
                    that.push(v);
                });
            } else {
                //console.log("_super:" + value);
                return this.super.set(value);
            }
        }
    }

    'clear' () {
        this._arr_idx = 0;
        this._arr = [];
        this.index.clear();
        // listner class hears the event but then loses access to its own this.
        this.raise('change', {
            'name': 'clear'
        });
    }

    'stringify' () {
        var res = [];
        if (this._abstract) {
            // then we can hopefully get the datatype name
            // if it's abstract we detect it, otherwise it should be in there.
            var ncto = native_constructor_tof(this._type_constructor);
            res.push('~Collection(')
            if (ncto) {
                res.push(ncto);
            } else {

            }
            res.push(')');

        } else {
            res.push('Collection(');
            //console.log('obj._arr ' + stringify(obj._arr));
            var first = true;
            this.each(function (v, i) {
                if (!first) {
                    res.push(', ');
                } else {
                    first = false;
                }
                res.push(stringify(v));
            });
            res.push(')');
        }
        return res.join('');
    }

    'toString' () {
        return stringify(this._arr);
    }

    'toObject' () {
        var res = [];
        this.each(function (v, i) {
            res.push(v.toObject());
        });
        return res;
    }

    'each' () {
        var a = arguments;
        a.l = arguments.length;
        var sig = get_a_sig(a, 1);
        // was callback, context
        // ever given the context?

        if (sig == '[f]') {
            return each(this._arr, a[0]);
        } else {

            if (sig == '[X,f]') {
                // X for index

                // we use the order of the index.
                //  possibly we can iterate using the index itself, maybe with that same callback.

                var index = a[0];
                var callback = a[1];
                return index.each(callback);

            } else {
                if (a.l == 2) {
                    return each(this._arr, a[0], a[1]);
                }
            }
        }
    }

    '_id' () {
        // gets the id.
        if (this.context) {
            this.__id = this.context.new_id(this.__type_name || this.__type);
        } else {
            if (!is_defined(this.__id)) {

                // get a temporary id from somewhere?
                //  but the collection should really have a context...
                //  or without a context, the collection is its own context?

                // Won't go setting the ID for the moment.

                //this.__id = new_collection_id();
            }
        }
        return this.__id;
    }

    'length' () {
        return this._arr.length;
    }

    'find' () {
        var a = arguments;
        a.l = arguments.length;
        var sig = get_a_sig(a, 1);
        if (a.l == 1) {
            var pos = this.index.get(a[0])[0];
            //console.log('pos', pos);
            var item = this._arr[pos];
            return item;
            // if there is only one index in the system then the search will be simple.
        }
        if (sig == '[o,s]') {
            return this.index_system.find(a[0], a[1]);
        }
        // and if looking for more than one thing...
        if (sig == '[s,s]') {
            return this.index_system.find(a[0], a[1]);
        }
        if (sig == '[a,s]') {
            return this.index_system.find(a[0], a[1]);
        }
        if (sig == '[s,o]') {
            var propertyName = a[0];
            var query = a[1];
            var foundItems = [];
            // for each object we need to go deeper into the fields.
            each(this, (item, index) => {
                //console.log('index ' + index);
                //console.log('item ' + stringify(item));
                //var matches = item.match(query);
                //var itemProperty = item.get(propertyName);
                if (item.get) {
                    var itemProperty = item.get(propertyName);
                } else {
                    var itemProperty = item[propertyName];
                }
                //console.log('itemProperty ' + stringify(itemProperty));
                //console.log('tof(itemProperty) ' + tof(itemProperty));
                var tip = tof(itemProperty);

                //console.log('tip', tip);
                var tip2;

                var ip2;

                if (tip === 'data_value') {
                    var ip2 = itemProperty.value();
                    tip2 = tof(ip2);

                    //console.log('tip2', tip2);

                } else {
                    ip2 = itemProperty;
                    tip2 = tip;
                }

                //throw 'stop';

                //console.log('query', query);

                if (tip2 === 'array') {
                    // possibly should be a collection
                    each(ip2, (v, i) => {
                        //console.log('v ' + stringify(v));
                        var matches = obj_matches_query_obj(v, query);
                        //console.log('matches ' + matches);
                        if (matches) {
                            foundItems.push(v);
                        }
                    })
                };
                // check each data item for the match.
                //throw '!stop';
            })

            //console.log('foundItems', foundItems);
            var res = new Collection(foundItems);
            //console.log('res', res);
            //throw 'stop';
            return res;
        }
    }
    // get seems like the way to get unique values.

    'get' () {
        var a = arguments;
        a.l = arguments.length;
        var sig = get_a_sig(a, 1);

        // integer... return the item from the collection.
        //console.log('collection get sig ' + sig);
        if (sig == '[n]' || sig == '[i]') {
            return this._arr[a[0]];
        }

        // getting by it's unique index?
        //  this may again refer to getting a property.

        if (sig == '[s]') {

            var ix_sys = this.index_system;
            var res;
            if (ix_sys) {
                //console.log('ix_sys', ix_sys);
                var pui = ix_sys._primary_unique_index;
                //console.log(pui);
                res = pui.get(a[0])[0];
            }

            if (res) {
                return res;
            }

            // Works differently when getting from an indexed collection.
            //  Need to look into the index_system
            //  there may be a primary_unique_index

            return Data_Object.prototype.get.apply(this, a);

        }
        // may take multiple params, specifying the fields in the
        // unique index.

    }

    // insert_before could be useful.
    //  In some HTML controls want to insert one control before another one.

    // Will a control always know what position it's in?

    'insert' (item, pos) {
        // use array splice...
        //  then modify the index somehow.
        //  perhaps add 1 to each item's position past that point.
        //  may mean n operations on the index.
        //   some kind of offset tree could be useful for fast changes and keeping accurate lookups.
        this._arr.splice(pos, 0, item);
        this.raise('change', {
            'name': 'insert',
            'item': item,
            'value': item,
            'pos': pos
        });

    }


    // swap
    //  remove an item, but swap it with another.

    // controls should have been indexed by name.
    //  operations would need to keep that index well maintained.

    swap(item, replacement) {


        // Remove the replacement from its container.

        let r_parent = replacement.parent;
        let repl_pos = replacement.parent.content.remove(replacement);
        let i_parent = item.parent;
        let item_pos = item.parent.content.remove(item);


        let item_index;
        // or swap the item itself
        i_parent.content.insert(replacement, item_pos);
        r_parent.content.insert(item, repl_pos);

        if (is_defined(item_index)) {

        }
    }


    // may have efficiencies for adding and removing multiple items at once.
    //  can be sorted for insertion into index with more rapid algorithmic time.

    'remove' () {
        // Make more monomorphic.

        var a = arguments;
        a.l = arguments.length;
        var sig = get_a_sig(a, 1);
        var that = this;

        //console.log('sig ' + sig);
        //throw 'stop';

        if (sig == '[n]') {
            var pos = a[0];
            var item = this._arr[pos];
            var o_item = item;
            var spliced_pos = pos;
            this._arr.splice(pos, 1);
            this._arr_idx--;
            var length = this._arr.length;
            while (pos < length) {
                // reassign the stored position of the item
                var item = this._arr[pos];
                item.relationships[own_id] = [that, pos];
                pos++;
            }
            var e = {
                'target': this,
                'value': item,
                'position': spliced_pos,
                'name': 'remove'
            }
            this.raise('change', e);

            return pos;
        } else if (sig == '[s]') {
            var key = a[0];
            var obj = this.index_system.find([
                ['value', key]
            ]);
            var my_id = this.__id;
            var item_pos_within_this = obj[0]._relationships[my_id];
            this._arr.splice(item_pos_within_this, 1);
            for (var c = item_pos_within_this, l = this._arr.length; c < l; c++) {
                //console.log('c ' + c);
                var item = this._arr[c];
                item._relationships[my_id]--;
            }
            var e = {
                'target': this,
                'value': obj[0],
                'position': item_pos_within_this,
                'name': 'remove'
            }
            this.raise('change', e);
        } else {
            let item_index;
            // or swap the item itself

            let arr = this._arr,
                l = arr.length;
            if (typeof item === 'number') {
                item_index = item;
            } else {
                // find the item

                let found = false,
                    c = 0;
                while (!found && c < l) {
                    found = arr[c] === item;
                    item_index = c;
                    c++;
                }
                //if (found) {
                //}

                if (is_defined(item_index)) {
                    return this.remove(item_index);
                }
            }
        }
    }

    'has' (obj_key) {
        
    }
    'get_index' () {

        // Make (more) monomorphic, have it consult the sorted KVS.

        var a = arguments;
        a.l = arguments.length;
        var sig = get_a_sig(a, 1);
        if (sig === '[s]') {
            return this.index_system.search(a[0]);
        }

    }
    
    // More fp way of indexing.
    'index_by' () {
        var that = this;
        var a = arguments;
        a.l = arguments.length;
        var sig = get_a_sig(a, 1);
        
    }

    'push' (value) {
        var tv = tof(value);
        var fn_index = this.fn_index;
        var idx_key, has_idx_key = false,
            pos;
        if (fn_index) {
            idx_key = fn_index(value);
            has_idx_key = true;
        }
        if (tv === 'object' || tv === 'function') {

            // Long comments removed. Use functional constraint satisfaction if we have that.

            pos = this._arr.length;

            this._arr.push(value);
            //console.log('pushing value', value);
            //this.index_system.unsafe_add_object(value);
            this._arr_idx++;

            var e = {
                'target': this,
                'item': value,
                'value': value,
                'position': pos,
                'name': 'insert'
            }
            this.raise('change', e);
        }
        if (tv == 'collection') {

            pos = this._arr.length;

            this._arr.push(value);
            this._arr_idx++;

            var e = {
                'target': this,
                'item': value,
                'value': value,
                'position': pos,
                'name': 'insert'
            }
            this.raise('change', e);

        }
        if (tv == 'data_object' || tv == 'control') {

            //this.index_system.unsafe_add_object(value);

            pos = this._arr.length;
            // Should not need a context or ID just to be put in place.
            this._arr.push(value);
            this._arr_idx++;
            var e = {
                'target': this,
                'item': value,
                'value': value,
                'position': pos,
                'name': 'insert'
            }
            this.raise('change', e);
        }

        if (tv === 'array') {
            var new_coll = new Collection(value);
            pos = this._arr.length;
            // Should not need a context or ID just to be put in place.
            this._arr.push(new_coll);
            var e = {
                'target': this,
                'item': new_coll,
                'value': new_coll,
                'position': pos,
                'name': 'insert'
            }
            this.raise('change', e);
            //return this.push(new_coll);
        }

        if (tv == 'string' || tv == 'number') {
            var dv = new Data_Value({
                'value': value
            });
            pos = this._arr.length;
            // Should not need a context or ID just to be put in place.
            this._arr.push(dv);
            var e = {
                'target': this,
                'item': dv,
                'value': dv,
                'position': pos,
                'name': 'insert'
            }
            this.raise('change', e);
        }

        if (has_idx_key) {
            this.index.put(idx_key, pos);
        }
        //this._arr_idx++;
        return value;
    }

    'load_array' (arr) {
        for (var c = 0, l = arr.length; c < l; c++) {
            this.push(arr[c]);
        }
        this.raise('load');
    }
    'values' () {
        var a = arguments;
        a.l = arguments.length;
        var sig = get_a_sig(a, 1);
        if (a.l == 0) {
            return this._arr;
        } else {
            var stack = new Error().stack;
            throw 'not yet implemented';
        }
    }
    'value' () {
        var res = [];
        this.each((v, i) => {
            if (typeof v.value == 'function') {
                //res[i] = v.value();
                res.push(v.value());
            } else {
                res.push(v);
            }
        });
        return res;
    }
};

var p = Collection.prototype;
p.add = p.push;
module.exports = Collection;