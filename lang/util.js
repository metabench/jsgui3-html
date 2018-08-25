/**
 * Created by James on 16/09/2016.
 */

var jsgui = require('./essentials');
//var Data_Structures = require('./jsgui-data-structures');
var Collection = require('./collection');

//var Data_Grid = require('jsgui2-data-grid');

var j = jsgui;
var each = j.each;
var tof = j.tof;
var atof = j.atof;
var is_defined = j.is_defined;
var fp = j.fp;
var arrayify = j.arrayify;
var mapify = j.mapify;
var get_item_sig = j.get_item_sig;



//var B_Plus_Tree = Data_Structures.B_Plus_Tree;

var vectorify = function(n_fn) {
	// Creates a new polymorphic function around the original one.

	var fn_res = fp(function(a, sig) {
		//console.log('vectorified sig ' + sig);
		if (a.l > 2) {
			var res = a[0];
			for ( var c = 1, l = a.l; c < l; c++) {
				res = fn_res(res, a[c]);
				// console.log('res ' + res);
			}
			return res;
		} else {
			if (sig == '[n,n]') {
				return n_fn(a[0], a[1]);
			} else {
				// will need go through the first array, and the 2nd... but
				// will need to compare them.
				var ats = atof(a);
				//console.log('ats ' + stringify(ats));
				if (ats[0] == 'array') {
					if (ats[1] == 'number') {
						var res = [], n = a[1];
						each(a[0], function(v, i) {
							res.push(fn_res(v, n));
						});
						return res;
					}
					if (ats[1] == 'array') {
						if (ats[0].length != ats[1].length) {
							throw 'vector array lengths mismatch';
						} else {
							var res = [], arr2 = a[1];
							each(a[0], function(v, i) {
								res.push(fn_res(v, arr2[i]));
							});
							return res;
						}
					}
				}
			}
		}
	});
	return fn_res;
};

var n_add = function(n1, n2) {
	return n1 + n2;
}, n_subtract = function(n1, n2) {
	return n1 - n2;
}, n_multiply = function(n1, n2) {
	return n1 * n2;
}, n_divide = function(n1, n2) {
	return n1 / n2;
};

var v_add = vectorify(n_add), v_subtract = vectorify(n_subtract);

// these are not the standard, established vector or matrix operations. They
// can be used for scaling of arrays of vectors.
var v_multiply = vectorify(n_multiply), v_divide = vectorify(n_divide);

var vector_magnitude = function(vector) {
	// may calculate magnitudes of larger dimension vectors too.
	// alert(tof(vector[0]));
	// alert(vector[0] ^ 2);

	var res = Math.sqrt((Math.pow(vector[0], 2)) + (Math.pow(vector[1], 2)));
	return res;

};

var distance_between_points = function(points) {
	var offset = v_subtract(points[1], points[0]);
	//console.log('offset ' + stringify(offset));
	return vector_magnitude(offset);
}


var execute_on_each_simple = function(items, fn) {
	// currently no arguments provided, there may be in the future / future
	// versions
	var res = [], that = this;
	each(items, function(i, v) {
		res.push(fn.call(that, v)); // function called with item as its only
									// parameter.
	});
	return res;
};

var filter_map_by_regex = function(map, regex) {
	var res = {};
	each(map, function(i, v) {
		// if (regex.match(i)) {
		if (i.match(regex)) {
			res[i] = v;
		}
	});
	return res;
}

// May be replaced by a more veristile replacement system, ie input transformation and parsing in schemas.
var npx = arrayify(function(value) {
	// don't think we can use arrayify?

	// good candidate for pf? but how it deals with array trees...
	// could have another one, like sf or spf that is simpler in terms of
	// treating an array in the signature as just one array?

	var res, a = arguments, t = tof(a[0]);

	// fn sigs??? performance?

	if (t === 'string') {
		res = a[0];
	} else if (t === 'number') {
		res = a[0] + 'px';
	}
	return res;
});

var no_px = arrayify(fp(function(a, sig) {
	// no_px - removes the 'px' if it ends with px
	// Generally returns a number.
	// value
	var re = /px$/, res;
	if (sig == '[s]' && re.test(a[0])) {
		res = parseInt(a[0]);
	} else {
		res = a[0];
	}
	;
	return res;
}));

var arr_ltrb = [ 'left', 'top', 'right', 'bottom' ];

var str_arr_mapify = function(fn) {
	var res = fp(function(a, sig) {
		if (a.l == 1) {
			if (sig == '[s]') {
				var s_pn = a[0].split(' ');
				// console.log('s_pn ' + s_pn.length);

				if (s_pn.length > 1) {
					return res.call(this, s_pn);
				} else {
					return fn.call(this, a[0]);
				}
			}

			if (tof(a[0]) == 'array') {
				var res2 = {}, that = this;

				each(a[0], function(i, v) {
					res2[v] = fn.call(that, v);
				});
				return res2;
			}
		}
	});
	return res;
};


var arr_hex_chars = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
	'A', 'B', 'C', 'D', 'E', 'F' ];
var dict_hex_to_bin = {
	'0' : 0,
	'1' : 1,
	'2' : 2,
	'3' : 3,
	'4' : 4,
	'5' : 5,
	'6' : 6,
	'7' : 7,
	'8' : 8,
	'9' : 9,
	'A' : 10,
	'B' : 11,
	'C' : 12,
	'D' : 13,
	'E' : 14,
	'F' : 15
};
var str_hex_to_int = function(str_hex) {
	str_hex = str_hex.toUpperCase();
	var i = str_hex.length; // or 10
	var res = 0, exp = 1;
	while (i--) {
		var i_part = dict_hex_to_bin[str_hex.charAt(i)];
		var ip2 = i_part * exp;
		res = res + ip2;
		exp = exp * 16;
		// ...
	}
	;
	return res;
};
var byte_int_to_str_hex_2 = function(byte_int) {
	var a = Math.floor(byte_int / 16), b = byte_int % 16, sa = arr_hex_chars[a], sb = arr_hex_chars[b], res = sa
		+ sb;
	return res;
};
var arr_rgb_to_str_hex_6 = function(arr_rgb) {
	var r = byte_int_to_str_hex_2(arr_rgb[0]);
	var res = r + byte_int_to_str_hex_2(arr_rgb[1])
		+ byte_int_to_str_hex_2(arr_rgb[2]);
	return res;
};
var arr_rgb_to_css_hex_6 = function(arr_rgb) {
	// a / b // divide a by b
	// a % b // find the remainder of division of a by b
	return '#' + arr_rgb_to_str_hex_6(arr_rgb);
};

var input_processors = {};

var output_processors = {};

var validators = {
	'number' : function(value) {
		return tof(value) == 'number';
	}
};

var referred_object_is_defined = function(object_reference) {
	return is_defined(object_reference[0][object_reference[1]]);
}

var set_vals = function(obj, map) {
	each(map, function(i, v) {
		obj[i] = v;
	});
};


var extend = jsgui.extend, fp = jsgui.fp, stringify = jsgui.stringify, tof = jsgui.tof;
// Connecting these input processors in this instance to the Enhanced_Data_Object?
// So keep the color declaration here. Outside of HTML?
// color is an indexed array.
//  Does that mean it should be stored as a Data_Value?

var data_types_info = {
	'color': ['indexed_array', [
		['red', 'number'],
		['green', 'number'],
		['blue', 'number']
	]],
	'oltrb': ['optional_array', ['left', 'top', 'right', 'bottom']]
}

// Will use better (ES6) factory methods than create_input_function_from_data_type_info

var color_preprocessor_parser = fp(function(a, sig) {
	//console.log('color_preprocessor_parser a ' + stringify(a));
	//console.log('color_preprocessor_parser sig ' + sig);
	if (sig == '[s]') {
		var input = a[0];
		var rx_hex = /(#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2}))/;
		var m = input.match(rx_hex);
		//console.log('m ' + stringify(m));

		if (m) {
			// Could use arrayify or something to make the conversion quicker... will do that in more places, mainly want to get the code working now.

			var r = jsgui.str_hex_to_int(m[2]);
			var g = jsgui.str_hex_to_int(m[3]);
			var b = jsgui.str_hex_to_int(m[4]);

			var res = [r, g, b];
			return res;
		}
	}
})


var color_preprocessor = (function (fn_color_processor) {
	var that = this;
	//throw '!stop';
	var res = fp(function (a, sig) {

		//console.log('color_preprocessor sig ' + sig);

		if (sig == '[[s]]') {
			//var new_input =
			// use regexes to detect / read the string.

			//var rx_hex = /^#?[a-fA-F0-9][a-fA-F0-9][a-fA-F0-9]$/;
			var rx_hex = /(#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2}))/;
			//var rx_hex = /(#(([0-9A-Fa-f]{2}){3}))/;
			//var rx_hex = /(#([0-9A-Fa-f]{2}){3})/;
			var input = a[0][0];

			//var m = rx_hex.match(input);
			var m = input.match(rx_hex);
			//console.log('m ' + stringify(m));

			if (m) {
				// Could use arrayify or something to make the conversion quicker... will do that in more places, mainly want to get the code working now.

				var r = jsgui.str_hex_to_int(m[2]);
				var g = jsgui.str_hex_to_int(m[3]);
				var b = jsgui.str_hex_to_int(m[4]);

				var res = [r, g, b];
				return res;
			}

		} else {
			// call with the same arguments.
			//console.log('calling normal...');
			return fn_color_processor.apply(that, a);

		}
	});
	return res;
});

// In previous modules, it won't keep the same input_processors.
//  Is there a way of retrieving that from the most inner modules?
//test_Color();

// And inputting an indexed array.
//  Will need to accept 2d size inputs.
// Size could possibly be 3d, maybe 1d? A line has a size, which is also its length (though in the world of GUI it could also have
//  a thickness).

// Optional array looks more like a language feature (enhancement).
//  Or even a core language feature?


// There will be different types of optional arrays, will have different input parameters.
input_processors['optional_array'] = fp(function (a, sig) {

	if (a.l == 2) {
		var oa_params = a[0],
			input = a[1];
		if (tof(input) == 'array') {
			// check it is within the right number.
			if (input.length <= oa_params.length) {
				return input;
			}
		} else {
			return input;
		}
	}
	if (a.l == 3) {
		var oa_params = a[0],
			items_data_type_name = a[1],
			input = a[2];
		// now need to get every item in the array or the item to conform to the given type.
		var input_processor_for_items = jsgui.input_processors[items_data_type_name];
		//console.log('input_processor_for_items ' + input_processor_for_items);
		//console.log('tof(input) ' + tof(input));
		if (tof(input) == 'array') {
			// check it is within the right number.
			if (input.length <= oa_params.length) {
				var res = [];
				each(input, function (i, v) {
					res.push(input_processor_for_items(v));
				});
				return res;
			}
		} else {
			return input_processor_for_items(input);
		}
	}
	//console.log('oa_params ' + stringify(oa_params));
});

input_processors['indexed_array'] = fp(function (a, sig) {
	// it may be taking some kind of data type that things need to be applied to.
	// eg 'size': ['indexed_array', ['distance', ['width', 'height']]],
	// would need to take in objects with the names of the properties as well.

	console.log('indexed_array sig', sig);

	if (a.l == 2) {
		var ia_params = a[0],
			input = a[1];
		//console.log('ia_params ' + stringify(ia_params));

		if (tof(input) == 'array') {
			if (input.length <= ia_params.length) {
				return input;
			}
		}
	}
	if (a.l == 3) {
		var ia_params = a[0],
			items_data_type_name = a[1],
			input = a[2];
		var input_processor_for_items = jsgui.input_processors[items_data_type_name];
		if (tof(input) == 'array') {
			// check it is within the right number.
			if (input.length <= ia_params.length) {
				var res = [];
				each(input, function (i, v) {
					res.push(input_processor_for_items(v));
				});
				return res;
			}
		}
	}
});

input_processors['n_units'] = function (str_units, input) {
	// this will change things to have both the number of units and a string with the unit in an array.
	//  will make it easier to do maths on the distances.

	if (tof(input) == 'number') {
		return [input, str_units];
	}
	if (tof(input) == 'string') {
		//var rx_n_units = /^(?:(\d+)(\w+))|(?:(\d*)\.(\d+)(\w+))$/;
		var rx_n_units = /^(\d+)(\w+)$/;
		// then match it, should be multiple parts to the match.

		// Do want to get the various pieces working for the Control system.
		//  Then will be very nice indeed when compacted for a mobile-client.

		var match = input.match(rx_n_units);
		//console.log('match ' + stringify(match));

		if (match) {
			return [parseInt(match[1]), match[2]];
		}

		rx_n_units = /^(\d*\.\d+)(\w+)$/;
		match = input.match(rx_n_units);
		//console.log('match ' + stringify(match));
		if (match) {
			return [parseFloat(match[1]), match[2]];
		}
		//throw('stop');
	}
};



// Previously...
//var ensure_data_type_data_object_constructor = function (data_type_name) {
// Will use a Factory instead (I think)
//  Simpler coding pattern
//   Not needing such a huge word, or huge words to describe it.
//    Don't need unique constructors anyway, will have far more convenient factory methods


//console.log('jsgui.input_processors ' + stringify(Object.keys(jsgui.input_processors)));
var dti_color = jsgui.data_types_info['color'];

input_processors['color'] = function(input) {


	var res;
	console.log('processing color input: ' + stringify(input));

	var input_sig = get_item_sig(input, 2);
	//console.log('input_sig ' + input_sig);

	//var i;

	if (input_sig == '[s]') {
		//i = input[0];
		res = color_preprocessor_parser(input[0]);
	}

	if (input_sig == '[n,n,n]') {
		//input = input[0];
		//i = input[0];
		//var res = color_preprocessor_parser(input);
		res = input;
	}




	// not sure that using the preprocessor is right...
	//  it returns a function, I think it applies to a function.
	//throw '!!stop';
	console.log('res ' + stringify(res));

	// So, the 'color' property gets set.
	//  Then would need to set the CSS background-color property?
	//   Depening on what type of Control it is.


	console.log('color input_processors output', res);



	return res;
}

//color_preprocessor(create_input_function_from_data_type_info(dti_color));
//jsgui.ensure_data_type_data_object_constructor('color');

jsgui.output_processors['color'] = function (jsgui_color) {
	var res = jsgui.arr_rgb_to_css_hex_6(jsgui_color);
	return res;
};

// collection needs a context...
//  can get the context from the first object.

// Grouping not working so well so far... ???? Still the case 2016?
//  Maybe a less reflective way of making the group function?



var group = function() {

	// Hope this grouping system is not too slow.
	//  May be able to optimize / selectively make the grouping functions.

	var a = arguments;

	if (a.length == 1 && tof(a[0]) == 'array') {
		return group.apply(this, a[0]);
	}

	//var res = new Collection();
	var res;
	for (var c = 0, l = a.length; c < l; c++) {
		var item = a[c];

		if (c == 0) {
			res = new Collection({'context': item.context});

		}
		res.push(item);

	}

	var C = a[0].constructor;
	var p = C.prototype;

	//console.log('C ' + C);
	//console.log('p ' + p);
	var i;
	for (i in p) {
		var tpi = tof(p[i]);
		if (tpi == 'function') {
			// make a group version.
			(function(i) {
				//console.log('i ' + i);

				if (i != 'each' && i != 'get' && i != 'add_event_listener') {
					res[i] = function() {
						var a = arguments;
						res.each(function(v, i2) {
							v[i].apply(v, a);
						})
					}
				}
			})(i)
		}
	}
	return res;
};

var true_vals = function(map) {
	var res = [];
	for (var i in map) {
		if (map[i]) res.push(map[i]);
	}
	return res;
};

var util = {
	'vectorify' : vectorify,
	'v_add' : v_add,
	'v_subtract' : v_subtract,
	'v_multiply' : v_multiply,
	'v_divide' : v_divide,
	'vector_magnitude' : vector_magnitude,
	'distance_between_points' : distance_between_points,
	'execute_on_each_simple' : execute_on_each_simple,
	'mapify' : mapify,
	'filter_map_by_regex' : filter_map_by_regex,
	'atof' : atof,
	'npx' : npx,
	'no_px' : no_px,
	'str_arr_mapify' : str_arr_mapify,
	'arr_ltrb' : arr_ltrb,
	'true_vals': true_vals,
	'validators' : validators,
	'__data_id_method' : 'lazy',
	'str_hex_to_int' : str_hex_to_int,
	'arr_rgb_to_css_hex_6' : arr_rgb_to_css_hex_6,
	'group': group
};

module.exports = util;



