

class Node {
	constructor(spec) {
		// previous and next held as an array.

		// neighbours
		//  it could have no neighbours.
		//   a list will be empty, with no nodes.
		//   then it will have a node with no neighbours, which is both the first and the last node.
		//   then 2 nodes, 1 with each neighbour
		//   then 3 nodes, with the end nodes still having no neighbours.

		// This will just be for iterating through the list, adding, removing, doing basic operations.
		//  I may leave inefficient operations out, so the linked list gets used for what it is best at.
		//   But the inefficient/less efficient operations may be done to lower amounts, such as 12, by maintaining small LLs in data structures such as B+ trees.

		this.neighbours = spec.neighbours || [];

		// Adding and removing while maintaining an order?
		this.value = spec.value;


		// parent

	}
	'previous'() {
		return this.neighbours[0];
	}
	'next'() {
		return this.neighbours[1];
	}
};

// Do these linked list nodes need to have anything?
//  Just the means to insert their nodes etc?
//   Then their nodes could be made to carry other data by other components.

// Doubly_Linked_List could extend Node.
//  That way it can be put in a tree, and used for holding the data in a tree.
//  Want a B+ tree so that items can get put in correctly.

// Having a whole tree made up of a doubly linked list, with other structures indexing it?
//  Need some more fundamental data structures. The Collection and Data_Object will be good, but it will be good to store the fields in an appropriate object.


// Ordered_KVS - may be a useful one.
//  Would have the double linked list inside and map.


// Mapped_Linked_List? would need to know what field to look at.

/*
var nodify = function(fn) {

	var res = function(val) {
		if (val instanceof Node) {
			return fn(val);
		} else {
			var node = new Node({'value': val});
			return fn(node);
		}

	};
	return res;

}
*/


class Doubly_Linked_List {
	constructor(spec) {
		// spec could be the initial items for the list.

		this.first = null;
		this.last = null;

		this.length = 0;
		// harder to maintain the length when nodes could be moved around the list.
		//  would need to be able to see if a node is in the list to begin with...
		//   so each node could have a container object, and if it is set to the list already when an insert is done, then the list will be able to keep track of
		//    its length. That would be better than having to count them.

	}

	'each_node'(callback) {
		//console.log('each_node this.length ' + this.length);

		var node = this.first;
		var ctu = true;
		var stop = function () {
			ctu = false;
		};
		while (node && ctu) {
			callback(node, stop);
			node = node.neighbours[1];
		}
	}

	'each'(callback) {
		this.each_node(function (node, stop) {
			callback(node.value, stop);
		});
	}

	'remove'(node) {

		// can not remove a value... have to remove a node.
		//  this will be more useful when there is a map of values.

		if (node.neighbours[0]) {
			node.neighbours[0].neighbours[1] = node.neighbours[1];
		} else {
			this.first = node.neighbours[1];
		}

		if (node.neighbours[1]) {
			node.neighbours[1].neighbours[0] = node.neighbours[0];
		} else {
			this.last = node.neighbours[0];
		}

		node.neighbours = [];

		if (node.parent == this) {
			delete node.parent;
			this.length--;
		}

	}

	// check to see if the item is a 'node' object.
	//  if it is, can insert it as a node, otherwise create the node object and insert it.
	//   a bit like wrapping values in Data_Value.

	'insert_beginning'(val) {
		if (val instanceof Node) {
			if (this.first == null) {
				this.first = val;
				this.last = val;
				val.neighbours = [];
				if (val.parent != this) {
					val.parent = this;
					this.length++;
				}
			} else {
				// insert it before first item.
				this.insert_before(val, this.first);
			}
			return val;
		} else {
			var node = new Node({ 'value': val });
			return this.insert_beginning(node);
		}
	}

	// could use a nodify function.
	//  or ensure_data_wrapper

	'insert_before'(val, node) {
		// check to see if the new value is a node.

		if (val instanceof Node) {
			val.neighbours = [node.neighbours[0], node];
			if (node.neighbours[0] == null) {
				this.first = val;
			} else {
				node.neighbours[0].neighbours[1] = val;
			}
			node.neighbours[0] = val;

			if (val.parent != this) {
				val.parent = this;
				this.length++;
			}
			return val;
		} else {
			var new_node = new Node({ 'value': val });
			return this.insert_before(new_node, node);
		}

	}

	'insert_after'(val, node) {
		if (val instanceof Node) {
			//console.log('insert after node ' + node);

			val.neighbours = [node, node.neighbours[1]];
			if (node.neighbours[1] == null) {
				this.last = val;
			} else {
				node.neighbours[1].neighbours[0] = val;

			}
			node.neighbours[1] = val;

			//node.neighbours[0].neighbours[1] = val;
			if (val.parent != this) {
				val.parent = this;
				this.length++;
			}
			return val;
		} else {
			var new_node = new Node({ 'value': val });
			return this.insert_after(new_node, node);
		}
	}
	// not wrapping the item in a node?

	// want one where we are not pushing nodes, but items stored in nodes.
	//  Perhaps this is a Data_Value?
	// Or a doubly_linked_node.

	// Doubly_Linked_Node could take the form [prev, item, next]
	//  [prev, item, key, next]? probably not

	//  Maybe we could put more private variables, such as 'neighbours' as a var within the init statement.

	'push'(val) {

		if (val instanceof Node) {
			if (this.last == null) {
				this.insert_beginning(val);
			} else {
				return this.insert_after(val, this.last);
				/*
				 var last = this.last;
				 last.neighbours[1] = val;
				 this.last = val;

				 //console.log('val.parent ' + val.parent);
				 //console.log('this ' + this);

				 if (val.parent != this) {
				 val.parent = this;
				 this.length++;
				 }
				 */
			}
			return val;
		} else {
			var new_node = new Node({ 'value': val });
			return this.push(new_node);
		}
		// the item gets wrapped in a node.?
	}
};

Doubly_Linked_List.Node = Node;

module.exports = Doubly_Linked_List;
