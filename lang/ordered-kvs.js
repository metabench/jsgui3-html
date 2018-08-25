/**
 * Created by James on 16/09/2016.
 */

var Doubly_Linked_List = require('./doubly-linked-list');

class Ordered_KVS {
	constructor() {
		this.dll = new Doubly_Linked_List();
		this.node_map = {};
	}
	'length'() {
		return this.dll.length;
	}
	'put'(key, value) {
		// does it already exist with that key - if so that item gets replaced, stays in the same position?
		// or maybe push - that means the item that goes in gets added to the end.
		return this.push(key, value);
	}
	'get'(key) {
		//console.log('get key ' + key);
		var kvs_node = this.node_map[key];
		if (kvs_node) {
			return kvs_node.value;
		} else {
			return undefined;
			//throw 'Missing KVS node: ' + key;
		}
	}
	'push'(key, value) {
		// does it already have a node with that key?
		var node = this.dll.push(value);
		node.key = key;
		this.node_map[key] = node;
	}
	'out'(key) {
		var node = this.node_map[key];
		//delete node.key;
		delete this.node_map[key]

		this.dll.remove(node);
	}
	'each'(callback) {
		// return the key as well as the value in the callback.
		this.dll.each_node(function (node, stop) {
			callback(node.key, node.value, stop);
		});
		//this.dll.each(callback);
	}
	'values'() {
		var res = [];
		this.each(function (key, value) {
			res.push(value);
		});
		return res;
	}
	'keys'() {
		var res = [];
		this.each(function (key, value) {
			res.push(key);
		});
		return res;
	}
	'keys_and_values'() {
		var res = [];
		this.each(function (key, value) {
			res.push([key, value]);
		});
		return res;
	}
	// will not need to deal with nodes on the user level.
	// want to be able to add and remove items, normally items will get pushed to the end of the list.

	// will provide a key and value in order to do this.
};

module.exports = Ordered_KVS;