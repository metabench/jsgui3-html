var jsgui = require('../lang/lang');
//var Resource = require('./resource');

var stringify = jsgui.stringify,
	each = jsgui.each,
	arrayify = jsgui.arrayify,
	tof = jsgui.tof,
	get_a_sig = jsgui.get_a_sig;
var filter_map_by_regex = jsgui.filter_map_by_regex;
var Evented_Class = jsgui.Evented_Class,
	Data_Object = jsgui.Data_Object;
var fp = jsgui.fp,
	is_defined = jsgui.is_defined;
var Collection = jsgui.Collection;

// Should work to get this closer to the desired get/set resource interface.
//  That would help with administering it.
//  Also would make subresources available, these would have their own interfaces.

// Not sure if the Resource_Pool should have an HTTP endpoint... maybe Server_Resource_Pool?


// A Collection of Resources?
//  Could make use of collection indexing too.


// Keeps track of resources available within JavaScript process (browser or node.js).



// Client-side resources may need to work differently.

// Want a general purpose client-side data resource.
// Makes a request to the server-side resource.
//  Or just a client-side resource client (which itself is a resource)





class Resource_Pool extends Evented_Class {

	constructor(spec) {
		super(spec);

		// Sorting them by a Data_Object's.meta name?
		//  need an easy way of expressing this.
		//  meta('name')?
		//  attached('meta', 'name')

		// I think indexing by attached Data_Object properties makes sense.
		//  That would mean defining an index as applying to an attached object.
		//   in this case 'meta'

		// sorted: [['attached', 'meta', 'name']]
		//  does not look nice, but it gets the point accross.
		//  hopefully would not be confused.
		//  One sorted index by its meta.name
		// I think the attached keyword makes sense here as meta is attached to the object rather
		//  than really a component of the object itself.

		// I think registering object attachments makes sense.
		//  That is more core-level work and I want to draw an end to that for the moment.
		// Object attachments being another interesting part which will be worthwhile.

		// Sort it by object type as well?
		//  Keep an object type in the prototype, not in initialization?
		//   Working around the new super() restriction.

		this.resources = new Collection({
			/*

			'index': {
				'sorted': [['name']] // similar to above, but literally it's a single index in a list of indexes, that index just has one field, in a list of fields

				// The syntax for specifying a (sorted) index is for an attached field.
				//  It gets the data for the attached object.
				// {'attached': {'meta': 'name'}}


				//'sorted': [[{'attached': {'meta': 'name'}}]]


				// just sorted by name will be best.
				//  Won't use as in depth a structure in jsgui2.





				//sorted: [[['attached', 'meta', 'name']]]
			}
			*/

			//'index_by': 'name'
			'fn_index': (item) => {
				var key = item.name;
				return key;
			}
		});
		//  Adds it to the sorted KVS.
		//   Make collections have a sorted KVS as an index by default anyway.

		// Functional indexing?
		//this.resources.index_by('name');

		//console.log('this.resources.index_system.index_map ', JSON.stringify(this.resources.index_system.index_map));
		//console.log('this.resources._arr ', this.resources._arr);
		//throw 'stop';

	}

	/*
	'resources'() {
		var a = arguments; a.l = arguments.length; var sig = get_a_sig(a, 1);
		if (sig == '[]') {
			return this.resources;
		}
	}
	*/

	'_get_resources_by_interface'(i_name) {
		var res = [];

		this.resources.each(function (i, resource) {
			console.log('resource ' + resource);
			// Not so sure we should treat 'get' like that for the resource.
			//  The resource may be a list of items, one of which is called 'interface'

			// Need that one on a lower level.
			//  Like resource.interface

			var i = resource.get('interface');
			if (tof(i) == 'string') {
				if (i == i_name) res.push(resource);
			} else if (tof(i) == 'array') {
				var done = true;
				each(i, function (i2, v) {
					if (!done) {
						if (i == i_name) res.push(resource);
						done = true;
					}
				})
			}
		});

		if (res.length > 1) return res;
		return res[0];

	}

	'index_resource'(obj) {
		// will get some metadata from the resource.

		// resource will be indexed by its location and its type.
		//  so will be able to find the local postgres dataabase that way

		// There will be different levels of locality
		//  May be a shorthand for the time and difficulty in communicating between two locations

		// in-process
		// same machine
		// lan (same data centre)
		// internet, same region
		// internet
		// stellar (could have more variations perhaps but will not be necessary for most applications)

		// to begin with, there will likely be some in-process resources.
		//  some of these resources could be resource connectors.


	}

	'receive_resource_event'() {
		//console.log('receive_resource_event sig ' + sig);
		var a = arguments;
		a.l = arguments.length;
		var sig = get_a_sig(a, 1);


		


		if (sig == '[D,s,[s,s]]') {
			var data_object = a[0];
			//console.log('data_object ' + stringify(data_object));
			//console.log('a[1] ' + a[1]);
			//console.log('a[2] ' + stringify(a[2]));
		}

		if (sig == '[D,s]') {
			var data_object = a[0];
			//console.log('data_object ' + stringify(data_object));
			//console.log('a[1] ' + a[1]);
			var event_name = a[1];
			//console.log('event_name ' + event_name);
			// could be that it has started?
			// then need to raise this event.
			// so if an resource has started, could have a particular handler for that.
			// There will be groups of resources that are needed for other ones to start.
			//  When one of these resources has loaded, it will check to see if others have also loaded.
			// This should be done with fairly fast algorithms, we don't want the system to slow down as it is getting going.
		}

	}

	'add'(obj) {
		// adds the resource obj to the pool.
		// Each resource will have its own individual name within the pool.
		//  There may be resources that get put into groups too.
		var that = this;

		//console.log('obj ' + stringify(obj));

		//var obj_name = obj.meta.get('name');
		var obj_name = obj.name;

		let log_trace = () => {
			console.log('');
			console.log('** obj_name ' + obj_name);
			console.trace();
			console.log('');
		}
		//log_trace();

		if (obj_name === undefined) {
			console.log('obj', obj);
			console.trace();
			throw 'Resource_Pool.add(undefined) error';
		}

		if (this.has_resource(obj_name)) {
			throw 'Resource pool already has resource with name ' + obj_name;
		} else {
			//this._dict_resources[obj_name] = obj;
			// raise an event saying that the resource was added.

			this.resources.add(obj);

			// Resources have an indexing function?

			//obj.parent(this);

			// don't think we can do it like that.
			//  obj.set('pool', this);
			//  the resource could have a 'pool' object of its own, the resource could hold sports results
			//   for example.

			//obj.meta.set('pool', this);

			obj.pool = this;

			if (obj.name !== undefined) {
				Object.defineProperty(this, obj.name, {
					get() {
						return obj;
					}
				});
			}

			this.raise_event('added', obj);
			// listen to events from that resource.

			// Do we want just a general listener for events?
			//  So we listen to any event from it?
			//obj.add_event_listener(that.receive_resource_event);
		}
	}
	'push'(obj) {
		return this.add(obj);
	}
	'has_resource'() {
		var a = arguments;
		a.l = arguments.length;
		var sig = get_a_sig(a, 1);

		//return is_defined(this._dict_resources[resource_name]);

		//return

		if (sig == '[s]') {
			// one string value, that will be the value of the unique primary index

			var obj_lookup_val = a[0];

			return this.resources.has(obj_lookup_val);

		}
	}

	// Likely to just be 'get', with it returning resources inside.
	//  And perhaps going through an adapter.

	// Can not get the actual resource as a programming object if it is remote.
	//  In that case, we need to use a transport mechanism.

	// Need to be able to access the resources' data with a convenient interface, not having to write repeated HTTP plumbing.



	get resource_names() {
		var res = [];
		each(this.resources, (resource) => {
			res.push(resource.name);
		})
		return res;
	}


	/*

	'get_resource_names'() {
		var res = [];
		each(this.resources, (resource) => {
			res.push(resource.name);
		})
		return res;
	}
	*/


	'get_resource'() {
		var a = arguments;
		a.l = arguments.length;
		var sig = get_a_sig(a, 1);
		//console.log('get_resource sig ' + sig);

		//return is_defined(this._dict_resources[resource_name]);
		//return

		// Will look up the index of a resource, then get it out of the collection.
		//  Tricky though if the collection changes the position. Would need to update the indexed value



		if (sig == '[s]') {
			// one string value, that will be the value of the unique primary index

			var obj_lookup_val = a[0];

			//console.log('this.resources.index_system.index_map ', JSON.stringify(this.resources.index_system.index_map));
			//console.log('this.resources._arr ', this.resources._arr);



			//var find_result = this.resources.find('name', obj_lookup_val);

			// May need to do more work on the index finding.

			var find_result = this.resources.find(obj_lookup_val);


			//console.log('find_result', find_result);
			//console.trace();

			//throw 'stop';


			if (find_result) {
				var res = find_result;
			}

			//console.log('post find resource');

			//var res = this.resources.find(stringify(["attached", "meta", "name"]), obj_lookup_val)[0];
			//console.log('this.resources.length() ' + this.resources.length());
			//console.log('res ' + stringify(res));

			return res;

		}



	}

	// have resources as a field?
	//  Means no need for the boilerplate code when it is linked.
	//'resources'

	'count'() {
		return this.resources.length;
	}


	// May be useful to have a callback parameter here rather than just publish / subscribe.

	'start'(callback) {

		//console.log('resource pool start');

		// needs to look at the various resources in the pool.
		//  start each of them if they are supposed to start automatically.


		var arr_resources_meeting_requirements = [];

		//console.log('this.resources.length() ' + this.resources.length());
		//console.log('this.resources', this.resources);

		this.resources.each(function (v, i) {


			//console.log('i ' + i);
			//console.log('v ' + stringify(v));

			// if it has all its requirements met, start it.

			// requirments - there may be conditional requirements in the future (like email address is not required when a Facebook profile URL is given), but for the moment each requirement is required
			//  could still be similar, with OR composite requirements.

			// check if the resource meets the requirements...
			//console.log('pre meets_requirements');

			//console.log('v', v);
			var mr = v.meets_requirements();
			//console.log('post meets_requirements');

			// and need a callback for when they all have started.

			//  I think doing the requirements network planning before starting will be the best way.
			//   That could get things to start very efficiently.

			//console.log('meets_requirements ' + mr);
			if (mr) {
				//v.start();
				arr_resources_meeting_requirements.push(v);
			}
		});

		//console.log('arr_resources_meeting_requirements.length ' + arr_resources_meeting_requirements.length);
		var l_resources = this.resources.length();
		//console.log('l_resources ' + l_resources);



		if (arr_resources_meeting_requirements.length == l_resources) {

			var fns = [];

			// can do this without call_multi - though I would prefer to use call_multi and have it work by a long way.

			var num_to_start = arr_resources_meeting_requirements.length;

			//console.log('num_to_start ' + num_to_start);
			//throw 'stop';

			var num_starting = 0,
				num_started = 0;
			var cb = function (err, start_res) {
				num_starting--;
				num_started++;
				//console.log('cb');
				//console.log('num_started ' + num_started);

				if (num_started == num_to_start) {
					if (callback) callback(null, true);
				}
			}

			each(arr_resources_meeting_requirements, function (resource_ready_to_start) {
				//console.log('');
				//console.log('');
				//console.log('resource_ready_to_start ', resource_ready_to_start);
				//throw 'stop';
				// should give the context OK.
				//fns.push([resource_ready_to_start, resource_ready_to_start.start, []]);
				//console.log('pre resource start');

				// But starting with the wrong context???
				resource_ready_to_start.start(cb);
				//console.log('post resource start');

				num_starting++;
				// but the callback...

				//fns.push([function(callback) {
				//    resource_ready_to_start.start(callback);
				//}, []])

			});
		}

	}
}

module.exports = Resource_Pool;