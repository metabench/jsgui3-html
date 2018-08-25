/**
 * Created by James on 25/09/2016.
 */

var jsgui = require('./essentials');
var mapify = jsgui.mapify;
var B_Plus_Tree = require('./b-plus-tree/b-plus-tree');

class Sorted_KVS {
	constructor(spec) {
		spec = spec || {};
		// both a dict and a BTree
		//  that is used in this case because the BTree only stores string keys.
		//  the improved B+ tree will have value objects/pointers within them

		if (typeof spec.unique_keys !== 'undefined') this.unique_keys = spec.unique_keys;
		//this.tree = new B_Plus_Tree(12); // order 12
		this.tree = B_Plus_Tree(12); // order 12


		//this.dict = {};
		// likely to make the dict refer to the tree node


	}

	'clear'() {
		this.tree.clear();
		//this.dict = {};
	}

	/*
	'put': mapify(function (key, value) {
		// inserting a bunch of things at once... could that be done more efficiently, such as in one traversal?
		//  sort the items, then can skip through the tree a bit quicker?


		var insert_res = this.tree.insert(key, value);
		// with tree.insert - nice if we can keep the treenode as a result.
		//  the tree does not store objects in the node.
		//   could make the tree node hold a reference to the object?

		//console.log('put insert_res ' + insert_res);
		//this.dict[key] = value;
	}),
	*/

	'out'(key) {
		//console.log('key ' + key);
		//

		this.tree.remove(key);
		//console.log('this.tree.keys_and_values() ' + stringify(this.tree.keys_and_values()));
		//throw '2.stop';
		//delete this.dict[key];
	}

	'get'(key) {
		//console.log('Sorted_KVS get');
		//console.log('key ' + stringify(key));


		// get all nodes with that key

		//var tree_res = this.tree.
		//console.log('this.tree.keys() ' + stringify(this.tree.keys()));
		//throw ('stop');

		//return
		// if this is treating the keys as unique it will just return 1 item or undefined / null.
		// otherwise it returns array on n items

		// don't want KVPs

		return this.tree.get_values_by_key(key);

		//return this.dict[key];
	}


	'has'(key) {
		//return (typeof this.dict[key] !== 'undefined');

		return this.key_count(key) > 0;

	}
	'get_cursor'() {
		//var res = new KSVS_Cursor(this);
		//res.move_first();
		//return res;
	}


	'keys'() {

		return this.tree.keys();

		//return this.tree.keys();
	}

	'keys_and_values'() {
		return this.tree.keys_and_values();
	}

	/*
	 'values': function() {
	 var keys = this.keys();
	 var res = [];
	 var that = this;
	 console.log('keys.length ' + keys.length );
	 console.log('keys ' + jsgui.stringify(keys));

	 each(keys, function(i, v) {
	 res.push(that.dict[v]);
	 });
	 return res;
	 },
	 */

	'key_count'(key) {

		if (typeof key !== 'undefined') {
			return this.tree.count(key);
		} else {
			return this.tree.count();
		}

		// also want to do it for a particular key


	}

	'get_keys_by_prefix'(prefix) {
		return this.tree.get_keys_by_prefix(prefix);
	}

	'each'(callback) {
		// iterate through every item
		//  key, value
		return this.tree.each(callback);
	}

	'get_by_prefix'(prefix) {

		return this.tree.get_by_prefix(prefix);
	}
};

// if we get a

Sorted_KVS.prototype.put = mapify(function (key, value) {
	// inserting a bunch of things at once... could that be done more efficiently, such as in one traversal?
	//  sort the items, then can skip through the tree a bit quicker?


	var insert_res = this.tree.insert(key, value);
	//return insert_res;
	// with tree.insert - nice if we can keep the treenode as a result.
	//  the tree does not store objects in the node.
	//   could make the tree node hold a reference to the object?


	//console.log('put insert_res ' + insert_res);
	//this.dict[key] = value;
});

module.exports = Sorted_KVS;