var jsgui = require('lang-tools');
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


class Resource_Pool extends Evented_Class {
	constructor(spec) {
		super(spec);
		this.resources = new Collection({
			//'index_by': 'name'
			'fn_index': (item) => {
				var key = item.name;
				return key;
			}
		});
	}

	'add'(obj) {
		var obj_name = obj.name;
		let log_trace = () => {
			console.log('');
			console.log('** obj_name ' + obj_name);
			console.trace();
			console.log('');
		}
		//log_trace();
		// Items able to name themselves?

		if (obj_name === undefined) {
			console.log('obj', obj);
			console.trace();
			throw 'Resource_Pool.add(undefined) error';
		}
		if (this.has_resource(obj_name)) {
			throw 'Resource pool already has resource with name ' + obj_name;
		} else {
			this.resources.add(obj);
			obj.pool = this;
			if (obj.name !== undefined) {
				Object.defineProperty(this, obj.name, {
					get() {
						return obj;
					}
				});
			}
			this.raise_event('added', obj);
		}
	}
	'push'(obj) {
		return this.add(obj);
	}
	'has_resource'() {
		const a = arguments;
		//a.l = arguments.length;
		const sig = get_a_sig(a, 1);
		//return is_defined(this._dict_resources[resource_name]);
		//return
		if (sig == '[s]') {
			// one string value, that will be the value of the unique primary index
			const obj_lookup_val = a[0];
			return this.resources.has(obj_lookup_val);
		}
	}
	get resource_names() {
		var res = [];
		each(this.resources, (resource) => {
			res.push(resource.name);
		})
		return res;
	}
	'get_resource'() {
		var a = arguments;
		a.l = arguments.length;
		var sig = get_a_sig(a, 1);

		if (sig === '[s]') {
			var obj_lookup_val = a[0];
			var find_result = this.resources.find(obj_lookup_val);
			if (find_result) {
				var res = find_result;
			}
			return res;
		}
	}
	'count'() {
		return this.resources.length;
	}
	// May be useful to have a callback parameter here rather than just publish / subscribe.

	'start'(callback) {
		var arr_resources_meeting_requirements = [];
		this.resources.each(function (v, i) {
			var mr = v.meets_requirements();
			if (mr) {
				arr_resources_meeting_requirements.push(v);
			}
		});
		var l_resources = this.resources.length();
		if (arr_resources_meeting_requirements.length === l_resources) {
			var fns = [];
			var num_to_start = arr_resources_meeting_requirements.length;
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
			each(arr_resources_meeting_requirements, resource_ready_to_start => {
				resource_ready_to_start.start(cb);
				num_starting++;
			});
		}
	}
}

module.exports = Resource_Pool;