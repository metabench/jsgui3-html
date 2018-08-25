    // Want to get the core resources working and tested.
//  Want to run a clock website / service to start with.
//  The server could have a clock, while clients could connect to it and share the information.
//  Could also experiment with P2P distribution of the data.
//  A clock is also useful because it contains time signals so we can see how long it takes for data to reach various machines.


// Intersted in having a remote Linux computer.
//  Ability to SSH into it and run commands.

// Want to be able to remotely configure and access a Raspberry Pi as a Resource.





var jsgui = require('../lang/lang');
var Pool = require('./pool');

var Class = jsgui.Class, Data_Object = jsgui.Data_Object, Collection = jsgui.Collection;
var is_defined = jsgui.is_defined, fp = jsgui.fp, stringify = jsgui.stringify, tof = jsgui.tof;
var call_multi = jsgui.call_multi, get_a_sig = jsgui.get_a_sig;
var each = jsgui.each;

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


class Resource extends Data_Object {
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

        if (is_defined(spec.name)) {
            // Need to deal with both resource properties and inner properties.
            //  Not sure about having resource.set('name') naming the resource.
            //   Sounds OK normally, but Resource needs to be flexible, eg a resource could provide
            //   translations of a work to a different language, so get('name') needs to just be calling
            //   the resource with that value.

            // Perhaps some kind of inner get and set?
            // Or inner is the normal.
            //  An object to represent a resource's external properties?

            // Could have .name for it's name
            //  or .self for a Data_Object that refers to itself.
            //  or .inner or .resource for the Data_Object that is the resource's inner data?
            //  .data

            // I like having .get and .set for dealing with the resource's data.
            //  and different ways for indexing the resource.

            // .metadata

            // and name is part of the metadata.

            // this.set('meta.name')

            // This way there is a .meta object which holds the name




            //this.set('meta.name', spec.name);
        }

        if (spec.name) this.name = spec.name;
        if (spec.pool) this.pool = spec.pool;

        /*
        this.meta = new Data_Object({
            'fields': {
                name: 'string'
            }
        });
        */

        // But give the resource name in the spec?
        //  That may be the best way of doing it, but it's not the API for now.

        /*

        if (spec.meta) {
            var meta = spec.meta;
            if (meta.name) this.meta.set('name', meta.name);
            //console.log('meta.name ' + meta.name);
        }
        */
        // Set the meta url in the client side resource.

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

    // Resources could also operate in connected mode.
    //  How the connection gets handled will be outside of the scope of the resource itself.





    // the last item in the signature is the callback

    'set'(name, value, callback) {
        var al = arguments.length;

        // self setter?



        if (al === 3) {
            if (this.setters[name]) {
                this.setters[name](value, callback);
            }
        }

    }

    '_old_set'() {

        console.log('resource set');
        throw stop;

        var a = arguments; a.l = arguments.length; var sig = get_a_sig(a, 1);

        //console.log('Resource.set sig ' + sig);
        //console.log('Resource.set a ' + stringify(a));
        var last_param = a[a.l - 1];
        var callback;

        if (tof(last_param) == 'function') {
            callback = last_param;
            var arr_params = a.slice(0, a.l - 1);

            // checks the setters




            //var res = this._super.apply(this, arr_params);


            callback(null, res);

        } else {
            // but why is a callback still needed?
            //  because in super, it requires a callback when it calls 'get', which is the newer get.

            var res = this._super.apply(this, a);
            return res;
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

    // Can we expect a Resource to return its data as a Resource?
    //  Maybe not always




    '_old_get'() {
        var a = arguments; a.l = arguments.length; var sig = get_a_sig(a, 1);

        //console.log('Resource get sig', sig);

        // if it does not have a function in the sig, it's syncronous

        var is_async = sig.indexOf('f') > 0;

        if (is_async) {
            var callback;
            var last_param = a[a.l - 1];
            if (tof(last_param) == 'function') {
                callback = last_param;
            }
            if (callback) {
                var arr_params = a.slice(0, a.l - 1);


                var res = super.apply(this, a);
                return res;
                //console.log('res ' + stringify(res));
                //callback(null, res);
            }
        } else {
            //throw

            var res = Data_Object.prototype.get.apply(this, a);
            return res;
            //return super(a);
        }
    }

}

/*
var Web_Resource = Resource.extend({
    'init': function(spec) {
        this._super(spec);
    },
    'respond': function(res, req) {

    }

})

var Html_Resource = Web_Resource.extend({
    'init': function(spec) {
        this._super(spec);
    }
})


var Resource_Error = Data_Object.extend({
    'init': function(spec) {
        this._super(spec);

        if (spec.text) {
            this.set('text', spec.text);
        }
    }
});

var res = {
        'Resource_Error': Resource_Error,
        //'Resource_Connector': Resource_Connector,
        'Resource': Resource,
        'Web': Web_Resource,
        'Html': Html_Resource
}

return res;
*/

Resource.Pool = Pool;

module.exports = Resource;
	//return Resource;
//});
