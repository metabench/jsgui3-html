var jsgui = require('./essentials');

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

class Evented_Class {

    // Needs to initialize the bound events to start with.

    constructor() {
        this._bound_events = {};
    }

    'raise_event'() {

        let a = Array.prototype.slice.call(arguments),
            sig = get_item_sig(a, 1);
        a.l = a.length;

        let that = this;
        let target = this;
        let c, l, res;

        if (sig == '[s]') {
            let target = this;
            let event_name = a[0];
            let bgh = this._bound_general_handler;
            let be = this._bound_events;
            res = [];
            if (bgh) {
                for (c = 0, l = bgh.length; c < l; c++) {


                    //res.push(bgh[c].call(target, event_name));

                    res.push(bgh[c](event_name));

                }
            }

            if (be) {
                let bei = be[event_name];
                if (tof(bei) == 'array') {
                    for (c = 0, l = bei.length; c < l; c++) {
                        //res.push(bei[c].call(target));

                        res.push(bei[c]());

                    }
                    return res;
                }
            }
        }

        if (sig == '[s,B]') {
            let be = this._bound_events;
            let bgh = this._bound_general_handler;
            let event_name = a[0];

            //if (!a[1].target) a[1].target = target;

            res = [];
            if (bgh) {
                for (c = 0, l = bgh.length; c < l; c++) {
                    //res.push(bgh[c].call(target, event_name, a[1]));
                    res.push(bgh[c](event_name, a[1]));
                }
            }

            if (be) {
                let bei = be[event_name];
                if (tof(bei) === 'array') {
                    for (c = 0, l = bei.length; c < l; c++) {
                        //res.push(bei[c].call(target, a[1]));
                        res.push(bei[c](a[1]));
                    }
                }
            }
        }

        if (sig === '[s,b]' || sig === '[s,s]' || sig === '[s,n]' || sig === '[s,a]') {
            let be = this._bound_events;
            let bgh = this._bound_general_handler;
            let event_name = a[0];

            //if (!a[1].target) a[1].target = target;

            res = [];
            if (bgh) {
                for (c = 0, l = bgh.length; c < l; c++) {
                    //res.push(bgh[c].call(target, event_name, a[1]));
                    res.push(bgh[c](event_name, a[1]));
                }
            }

            if (be) {
                let bei = be[event_name];
                if (tof(bei) === 'array') {
                    for (c = 0, l = bei.length; c < l; c++) {
                        //res.push(bei[c].call(target, a[1]));
                        res.push(bei[c](a[1]));
                    }
                }
            }
        }




        if (sig == '[s,o]') {
            let be = this._bound_events;
            let bgh = this._bound_general_handler;
            let event_name = a[0];

            if (!a[1].target) a[1].target = target;

            res = [];
            if (bgh) {
                for (c = 0, l = bgh.length; c < l; c++) {
                    //res.push(bgh[c].call(target, event_name, a[1]));
                    res.push(bgh[c](event_name, a[1]));
                }
            }

            if (be) {
                let bei = be[event_name];
                if (tof(bei) === 'array') {
                    for (c = 0, l = bei.length; c < l; c++) {
                        res.push(bei[c](a[1]));
                    }
                }
            }
        } else {
            if (a.l > 2) {
                let event_name = a[0];
                let additional_args = [];
                let bgh_args = [event_name];
                for (c = 1, l = a.l; c < l; c++) {
                    additional_args.push(a[c]);
                    bgh_args.push(a[c]);
                }
                let be = this._bound_events;
                let bgh = this._bound_general_handler;
                res = [];

                if (bgh) {
                    for (c = 0, l = bgh.length; c < l; c++) {

                        //res.push(bgh[c].apply(target, bgh_args));
                        res.push(bgh[c](bgh_args))
                    }
                }
                if (be) {
                    let bei = be[event_name];
                    if (tof(bei) == 'array') {
                        if (bei.length > 0) {
                            // They are handlers that get called.

                            for (c = 0, l = bei.length; c < l; c++) {
                                if (bei[c]) res.push(bei[c].apply(target, additional_args));

                            }
                            return res;
                        } else {
                            return res;
                        }
                    }
                    // Or if it's just a function?
                }
            } else {
                // s,?



            }
        }

        return res;
    }

    'add_event_listener'() {
        var a = Array.prototype.slice.call(arguments),
            sig = get_item_sig(a, 1);
        a.l = a.length;
        // event listener for all events...
        //  that could work with delegation, and then when the code finds the event it interprets it.
        //console.log('');
        //console.log('data_object add_event_listener sig ' + sig);

        // Why is this getting called so many times, for the same object?



        //console.log('');
        // Why is the bound events array getting so big?

        if (sig == '[f]') {
            //var stack = new Error().stack;
            //console.log(stack);
            //throw 'stop';



            this._bound_general_handler = this._bound_general_handler || [];
            if (Array.isArray(this._bound_general_handler)) {
                //if (tof(this._bound_general_handler) == 'array') {
                this._bound_general_handler.push(a[0]);
            };
        }
        // Why does a change event listener get bound to the wrong control, or bound multiple times?
        //  Changes getting pushed up through the tree?


        if (sig == '[s,f]') {
            // bound to a particular event name

            // want the general triggering functions to be done too.
            //  with a different function
            var event_name = a[0],
                fn_listener = a[1];
            //console.log('event_name ' + event_name);
            this._bound_events = this._bound_events || {};

            // removing from a bound general handler being slow?
            //  perhaps... but we won't have so many of these anyway.
            //  could get id for object and have it within collection.
            //   But not sure about using collections for events... collections use events...?

            // Different controls binding to the same array of events?

            if (!this._bound_events[event_name]) this._bound_events[event_name] = [];

            var bei = this._bound_events[event_name];
            //console.log('this._id() ' + this._id());
            if (Array.isArray(bei)) {
                //if (tof(bei) == 'array') {
                //console.log('this', this);
                //console.log('add_event_listener bei.length ' + bei.length);
                bei.push(fn_listener);
            };
        }

    }

    // A way of proxying functions below?
    //  Or simply use function alias?

    /*
    'on' () {
        // However, need to make use of some document events.
        //  With some controls, we need to pass through

        return this.add_event_listener.apply(this, arguments);


    }
    */

    'remove_event_listener'(event_name, fn_listener) {


        // TODO
        // And remove something that's bound to the general handler...?



        // needs to go through the whole array?
        // think so....

        //console.log('remove_event_listener');
        //console.log('this._bound_events', this._bound_events);
        if (this._bound_events) {
            //console.log('event_name', event_name);
            var bei = this._bound_events[event_name] || [];

            //var tbei = tof(bei);
            //console.log('tbei', tbei);

            //console.log('Array.isArray(bei)', Array.isArray(bei));

            if (Array.isArray(bei)) {
                // bei.push(fn_listener);

                var c = 0,
                    l = bei.length,
                    found = false;

                //console.log('l', l);

                while (!found && c < l) {
                    //console.log('bei[c]', bei[c]);
                    if (bei[c] === fn_listener) {
                        found = true;
                    } else {
                        c++;
                    }
                }
                //console.log('found', found);
                //console.log('c', c);
                if (found) {
                    bei.splice(c, 1);
                }
            };
        }


    }

    'off'() {
        // However, need to make use of some document events.
        //  With some controls, we need to pass through

        return this.remove_event_listener.apply(this, arguments);

    }
    'one'(event_name, fn_handler) {

        var inner_handler = (e) => {
            //var result = fn_handler.call(this, e);
            fn_handler.call(this, e);
            this.off(event_name, inner_handler);
            //return result;
        };

        this.on(event_name, inner_handler);
    }
};

var p = Evented_Class.prototype;
p.raise = p.raise_event;
p.trigger = p.raise_event;
p.subscribe = p.add_event_listener;
p.on = p.add_event_listener;


module.exports = Evented_Class;