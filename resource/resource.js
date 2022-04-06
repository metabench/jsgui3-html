    // Want to get the core resources working and tested.
//  Want to run a clock website / service to start with.
//  The server could have a clock, while clients could connect to it and share the information.
//  Could also experiment with P2P distribution of the data.
//  A clock is also useful because it contains time signals so we can see how long it takes for data to reach various machines.


// Intersted in having a remote Linux computer.
//  Ability to SSH into it and run commands.

// Want to be able to remotely configure and access a Raspberry Pi as a Resource.

var jsgui = require('lang-tools');

//const {Evented_Class} = jsgui;

var Pool = require('./pool');

const Evented_Class = jsgui.Evented_Class;
var Class = jsgui.Class, Collection = jsgui.Collection;
var is_defined = jsgui.is_defined, fp = jsgui.fp, stringify = jsgui.stringify, tof = jsgui.tof;
var call_multi = jsgui.call_multi, get_a_sig = jsgui.get_a_sig;
var each = jsgui.each;


// Data_Resource extends Evented_Class
//  or it's itself observable
// Evented_Class with the observable events and API.








// Could move this to its own module.

// Make Resource extend Evented_Class

// Then could move it outside of jsgui3


// Status to see if a resource has started or not?
//  I think resource status is important.
//  However status may entail more things.
//   status.phase
//   phase

// meta.phase

// A resource's context matters.
//  It will be the server rather than a page context.



// Resources can have events as well.
//  Look into how the publisher deals with them.

// A Data_Resource? Data_KV_Resource?
//  get, set?

// Also want Data_Transform_Resource.
//  And they should work both locally and remotely.



// Data_Transform_Resource:
//  .transform
//  no .get no .set


class Resource extends Evented_Class {
    // The link between the abstract resource and the resource on the internet / network / computer.
    //'fields': {
    //	//'meta': Data_Object
    //	'meta': 'data_object'
    //},

    // Problem with how it sets the fields.

    constructor(spec) {
        //console.log('Resource init');
        //
        if (!is_defined(spec)) spec = {};

        super(spec);

        if (spec.name) this.name = spec.name;
        if (spec.pool) this.pool = spec.pool;

        if (is_defined(spec.startup_type)) {
            //this.set('startup_type', spec.startup_type);
            this.startup_type = spec.startup_type;
        }

        this.getters = {};
        this.setters = {};

    }

    'start'(callback) {
        // check the requirements

        callback(null, true);

        //  check requirements recursive - checks the requirements of everything required, and if they have the check_requirements function, it uses that.
        //   I think using the system of names APIs will help here.

        // I think the base class should raise the event.

        //this.trigger('start');

        //console.log(new Error().stack);
        //throw 'no start function defined for resource (subclass)'
    }

    // meets_requirements
    //  check if all the prerequisite resources are active
    //  maybe check for login status if applicable.

    'meets_requirements'() {
        // Likely will be part of Status

        //return false;

        return true;
    }

    // 'get' will be the function to use.

    // may have toJson / to_json.
    'get_abstract'() {

        // Abstract_Resource - would be a description of a resource?
        //  Perhaps we'll only need json and json schema.
        //  Making the data_object and collection conform to json schema would be nice.
        //  Would have something very nice to do with creating a gui for forms.
        /*


        var res = new AR.Abstract_Resource({

        })
        */
    }

    'authenticate'(token) {
        //console.log('basic resource authenticate');
        return true;
    }

    // Resources could also operate in connected mode.
    //  How the connection gets handled will be outside of the scope of the resource itself.

    // the last item in the signature is the callback

    /*

    'set'(name, value, callback) {
        var al = arguments.length;

        // self setter?

        if (al === 3) {
            if (this.setters[name]) {
                this.setters[name](value, callback);
            }
        }
    }

    'get'(name, callback) {
        var al = arguments.length;
        if (al === 2) {
            if (this.getters[name]) {
                this.getters[name](callback);
            }
        }
    }

    */
}

Resource.Pool = Pool;

// Resource.Data_Transform etc...



module.exports = Resource;
	//return Resource;
//});

