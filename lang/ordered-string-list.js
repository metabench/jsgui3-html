/**
 * Created by James on 16/09/2016.
 */


// This could be useful for a few things, like storing tables in a DB
// schema.
// Maybe quite a few more things.

// May make some objects with friendlier interfaces...
//  And may use collection for this to store lists of strings.
//  Like CSS flags at the moment.

// Uses private variables.
class Ordered_String_List {
	constructor() {
		// console.log('init osl sig ' + sig);

		var arr = [];
		var dict_indexes = {};

		var reindex_dict_indexes = function () {
			dict_indexes = {};
			for (var c = 0, l = arr.length; c < l; c++) {
				dict_indexes[arr[c]] = c;
			}
		}

		// (add), remove, get, get_all, has, put, move, splice
		this.has = function (value) {
			return (typeof dict_indexes[value] !== 'undefined');
		}

		this.put = function (value) {
			// by default puts it at the end.
			if (this.has(value)) {
				// stays in same place.
				// arr[dict_indexes[value]]
				// do nothing
			} else {
				var index = arr.length;
				arr.push(value);
				dict_indexes[value] = index;
			}

		}

		this.out = function (value) {
			if (this.has(value)) {
				var idx = dict_indexes[value];
				arr.splice(idx, 1);

				delete dict_indexes[value];

				for (var c = idx, l = arr.length; c < l; c++) {
					var i = arr[c];
					dict_indexes[i]--;
				}
				// will need the items after it and lower their indexes.

			}
		}

		this.toggle = function (value) {
			if (this.has(value)) {
				this.out(value);
			} else {
				this.put(value);
			}
		}

		this.move_value = function (value, index) {
			if (this.has(value) && dict_indexes[value] != index) {

				// gets removed from current position, causes items after it
				// to move back.
				// gets put in new position, gets items after that to move
				// forwards.

				var old_index = dict_indexes[value];
				arr.splice(old_index, 1);

				arr.splice(index, 0, value);

				if (index < old_index) {
					// moving back.
					// dict_indexes[]
					dict_indexes[arr[index]] = index;
					// the index object of the one it

					// for (var c = index, l = arr.length; c < l; c++) {
					for (var c = index + 1; c <= old_index; c++) {
						dict_indexes[arr[c]]++;
					}
				} else if (index > old_index) {
					dict_indexes[arr[index]] = index;
					for (var c = old_index; c < index; c++) {
						dict_indexes[arr[c]]--;
					}
				}

			}

		}
		// for testing

		this._index_scan = function () {
			for (var c = 0, l = arr.length; c < l; c++) {
				console.log('c ' + c + ' arr[c] ' + arr[c] + ' idx '
					+ dict_indexes[arr[c]]);
			};
		}

		this.toString = function () {
			var res = arr.join(' ');
			return res;
		}

		this.toString.stringify = true;

		this.set = (function (val) {

			if (typeof val === 'string') {
				arr = val.split(' ');
				reindex_dict_indexes();
			}

			//if (sig == '[s]') {
			//	arr = a[0].split(' ');
			//	// console.log('arr ' + jsgui.stringify(arr));
			//	reindex_dict_indexes();
			//}
		});

		// if (sig == '[s]') {
		// this.set(a[0]);
		// }

		var a = arguments;
		if (a.length == 1) {
			var spec = a[0];
			if (typeof spec === 'string') {
				// console.log('setting');
				this.set(spec);
			}
		}

	}
};

module.exports = Ordered_String_List;