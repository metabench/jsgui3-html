/**
 * Created by James on 16/09/2016.
 */

var jsgui = require('../lang/lang');
var get_a_sig = jsgui.get_a_sig;
//var remove_sig_from_arr_shell = jsgui.remove_sig_from_arr_shell;
var each = jsgui.each;
var clone = jsgui.clone;
var Evented_Class = jsgui.Evented_Class;
//var Data_Value = jsgui.Data_Value;
var Data_Object = jsgui.Data_Object;
var Collection = jsgui.Collection;
var tof = jsgui.tof;
var stringify = jsgui.stringify;

const {
	prop,
	field
} = require('obext');
// Won't be fields, just items within the control.

// class Control_DOM
// create .content as a collection

// For the moment retiring the field constructors.
//  Likely to make an improved factory at some point soon.

// Have a specific style object...?

// Could apply input and output transformations here.

// Have a special class proxy.
//  Will use input and output formatters.

var px_handler = (target, property, value, receiver) => {
	let res;
	var t_val = tof(value);

	if (t_val === 'number') {
		res = value + 'px';
	} else if (t_val === 'string') {
		var match = value.match(/(\d*\.?\d*)(.*)/);
		//console.log('px_handler match', match);
		if (match.length === 2) {
			res = value + 'px';
		} else {
			res = value;
		}
	}
	return res;
}

var style_input_handlers = {
	'width': px_handler,
	'height': px_handler,
	'left': px_handler,
	'top': px_handler
}

// A new CSS Style Class.
//  Evented to allow for changes?

// Could also use proxies to set the style object from a string.

// Could build a prototype with all the styles as a defineProperty type property
//  


// Overhaul of this part looks useful.

// Not using proxies
// Setproperty / prop on all of the styles.




var new_obj_style = () => {
	//var style = new Evented_Class({});
	//var style = {}

	let style = new Evented_Class({});
	style.__empty = true;

	style.toString = () => {
		var res = [];
		var first = true;

		each(style, (value, key) => {
			//console.log('descriptor', Reflect.getOwnPropertyDescriptor(style, key));
			//console.log('key', key);
			if (key !== 'toString' && key !== '__empty' && key !== '_bound_events' && key !== 'on' && key !== 'subscribe' && key !== 'raise' && key !== 'trigger' && key !== {}) {
				if (first) {
					first = false;
				} else {
					res.push(' ');
				}
				//console.log('tof key ' + tof(key));
				//console.log('key', key);
				//console.log('tof value ' + tof(value));
				res.push(key + ': ' + value + ';');
			}
		});
		return res.join('');
	}

	var res = new Proxy(style, {
		set: (target, property, value, receiver) => {
			let res;
			//console.log('set style trap');
			//console.log('target, property, value', target, property, value);
			//console.trace();

			target['__empty'] = false;
			var old_value = target[property];
			if (style_input_handlers[property]) {
				//return style_input_handlers[property](target, property, value, receiver);
				//res = style_input_handlers[property](target, property, value, receiver);
				res = target[property] = style_input_handlers[property](target, property, value, receiver);
			} else {
				res = target[property] = value;
			}
			//console.log('pre raise style change');
			style.raise('change', {
				'key': property,
				'name': property,
				'old': old_value,
				'new': value,
				'value': value
			});
			//console.log('style set res', res);
			return res;
		},
		get: (target, property, receiver) => {

			// I'd like to have access to any arguments when
			// the property being accessed here is a function
			// that is being called

			return target[property];
		}
	});
	return res;
}

// Intercept the changing of the style attribute.

// Could code for the style with https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
//  For the moment it works with proxy, it would probably be faster and more compatible to use property definition with getting and setting a style as a string.
//   Would have clearer code too.

class DOM_Attributes extends Evented_Class {
	constructor(spec) {
		super(spec);
		//this._class = new Data_Value();
		// Some kind of a CSS style class?

		//var style = new_obj_style;
		// Could use proxy object for setting style
		this.style = new_obj_style();
		this.style.on('change', e_change => {
			//console.log('style e_change', e_change);
			this.raise('change', {
				'property': 'style',
				'key': 'style',
				'name': 'style',
				//'key': e_change.key,
				'value': this.style.toString()
			});
		})
		//console.log('this.style', this.style);
	}

	/*
	get style() {
		return this._style;
	}
	set style(value) {
		var t_value = tof(value);
		console.log('t_value', t_value);
		var style = this._style = this._style || new_obj_style();
		if (t_value === 'object') {
			
			each(value, (v, i) => {
				style[i] = v;
			})

		} else if (t_value === 'string') {
			//var style = this._style = new_obj_style();
			//each(value, (v, i) => {
			//	style[i] = v;
			//})
			console.log('value', value);
			var s_values = value.trim().split(';');
			var kv;
			each(s_values, (s_value) => {
				kv = s_value.split(':');
				//console.log('kv', kv);
				if (kv.length === 2) {
					kv[0] = kv[0].trim();
					kv[1] = kv[1].trim();
					style[kv[0]] = kv[1];
				}

			})

		} else {
			console.log('value', value);
			throw 'stop';
		}
	}
	*/

	/*

	'set'(key, value) {
		var old = this[key];
		this[key] = value;
		this.raise('change', {
			'key': key,
			'old': old,
			'new': value
		});
	}
	*/

}

/*
Object.defineProperty(DOM_Attributes.prototype, 'class', {
    get: function() { return this._class.value(); },
	set: function(value) { return this._class.set(value); }
});
*/
// 

class Control_DOM extends Evented_Class {
	constructor() {

		// Proxy the attributes, so that it raises an event for changes.
		super();
		var dom_attributes = new DOM_Attributes();
		//var that = this;


		// Proxy slows things down.
		//  We can probably use some other es5 or es6 goodness like eventcreate??? or object define.
		//   getters, setters?

		// Basically looks best to find another way apart from proxies based on benchmarks I saw/did a little while back.

		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
		//  instead?

		// Does not seem to be working right.
		//  On client-side, it's not carrying out 'set' style.
		//   because we are changing an object within style.

		/*
		
		*/

		var attrs = this.attrs = this.attributes = new Proxy(dom_attributes, {
			'set': (target, property, value, receiver) => {

				// proxy for setting the style with a string.
				//console.log('property', property)

				if (property === 'style') {
					//console.log('');
					//console.log('Control_DOM attrs set style')
					//console.log('value', value);
					//console.log('tof(value)', tof(value));

					var t_value = tof(value);
					//console.log('t_value', t_value);
					if (t_value === 'string') {

						var s_values = value.trim().split(';');
						var kv;
						each(s_values, (s_value) => {
							kv = s_value.split(':');
							//console.log('kv', kv);
							if (kv.length === 2) {
								kv[0] = kv[0].trim();
								kv[1] = kv[1].trim();
								target.style[kv[0]] = kv[1];
							}
						});
						// raise style change event.
						//  or dom attributes change
						dom_attributes.raise('change', {
							'property': property
						});
						// need to set the style items individually.
						//  or create new style object now.
					}
					// if we are setting it with a string, we need to break up these parts
					//console.trace();
				} else {
					var old_value = target[property];
					target[property] = value;
					//console.log('pre raise change');
					dom_attributes.raise('change', {
						'key': property,
						'name': property,
						'old': old_value,
						'new': value,
						'value': value
					});
				}
				return true;
			},
			get: (target, property, receiver) => {
				// I'd like to have access to any arguments when
				// the property being accessed here is a function
				// that is being called
				return target[property];
			}
		});

		
		//attrs.on('change', ech => {
		//	console.log('attrs ** ech', ech);
		//	this.raise('change', ech);
		//});
		
		// Then whenever the DOM attributes change...
	}
}

//class Control_Size {
//	'constructr'
//}

// May take these fields out of use for the moment.
/*
var my_fields = [
	['content', 'collection'],
	['dom', 'control_dom'],
	['size', 'size'],
	['color', 'color']
]


*/


// Time to make the Control extend Evented_Class so it raises events?
//  A bit surprised I've not used or needed Control's events.


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty

// Outside of dom attributes and style.
//  Dom attributes / style need to get updated from these properties.
class Control_Background extends Evented_Class {
	constructor(spec) {
		super();
		let _color, _opacity;
		Object.defineProperty(this, 'color', {
			get() {
				return _color;
			},
			set(value) {
				let old = _color;
				_color = value;
				this.raise('change', {
					'name': 'color',
					'old': old,
					'new': _color,
					'value': _color
				});
			},
			enumerable: true,
			configurable: true
		});
	}
	set(val) {
		// 
		// Value could be a string.
		//  Could be a color
		//  Could be a URL
		// Could be a programatic object that provides access to an image.
	}
}

// Control_Size = size2d

// further control-oriented JS types/classes would be useful.
//  raising specific change properties.
// 


//const px = arr_xy => {
//	// already containing px?
//}

class Control_Core extends Data_Object {

	constructor(spec, fields) {
		// but process / normalize the spec here?
		spec = spec || {};
		spec.__type_name = spec.__type_name || 'control';
		super(spec, fields);
		if (spec.id) {
			this.__id = spec.id;
		}
		if (spec.__id) {
			this.__id = spec.__id;
		}

		//console.log('done Control_Core super');
		//do_init_call(this, spec);
		this.mapListeners = {};
		this.__type = 'control';

		//console.log('post super init');
		var spec_content;
		// TextNodes don't have attributes
		let d = this.dom = new Control_DOM();

		prop(this, 'background', new Control_Background(), (e_change) => {
			let [value] = e_change;
			value.on('change', evt => {
				if (evt.name === 'color') {
					// Except may be better after all to use a Color class that can output to HTML better.
					d.attributes.style['background-color'] = evt.value;
				}
			});
			// or a change tuplet kvp.
		});
		prop(this, 'disabled', false);
		prop(this, 'size', spec.size, (e_change) => {
			let [value, old] = e_change;
			let [width, height] = value;
			const s = this.dom.attrs.style;
			s.width = width;
			s.height = height;
			this.raise('resize', {
				'value': value
			});
		});
		prop(this, 'pos', spec.pos, (e_change) => {
			let [value, old] = e_change;

			

			if (value.length === 2) {
				//console.log('old', old);
				if (old && old.length === 3) {
					value = [value[0], value[1], old[2]];
					this.pos = value;
				}
			}
			

			let [left, top] = value;
			let o_style = {
				'left': left,
				'top': top
			}

			//if (value.length === 3) {
			//	o_style['z-index'] = value[2];
			//}
			this.style(o_style);
			// raise change size.
			//console.log('pre raise resize');
			this.raise('move', {
				'value': value
			});
		});

		this.on('change', e => {

			if (e.name === 'disabled') {
				if (e.value === true) {
					this.add_class('disabled');
				} else {
					this.remove_class('disabled');
				}
			}
		});

		// then listen for background change.
		//  we then change the dom attributes style background-color
		//   then it automatically gets updated in the dom.

		//var cf = this._ctrl_fields = this._ctrl_fields || {};
		//var cf = this._fields = this._fields || {};

		// Could have object for internal properties, such as 'resizable'

		//this.size = {};

		// Have a Control_Size class?
		//  have size getters and setters (with a proxy?)

		//if (!this._abstract) {
		var tagName = spec.tagName || spec.tag_name || 'div';
		//this.set('dom.tagName', tagName);
		d.tagName = tagName;
		//this._icss = {};
		//this._.dom = {'tagName': 'div'};
		// Abstract controls won't have

		// The DOM is a field that it should be getting from the control.
		spec_content = spec.content;
		if (spec_content) {
			var tsc = tof(spec_content);
			if (tsc == 'array') {
				throw 'Content array not yet supported here.'
			} else if (tsc == 'string' || tsc == 'control') {
				this.content.add(spec_content);
			}
		}

		if (spec.el) {
			//console.log('spec.el', spec.el);
			//this.set('dom.el', spec.el);
			d.el = spec.el;
			//console.log('d.el', d.el);
			//console.log('this._.dom._.el', this._.dom._.el);
			//throw 'stop';
			d.tagName = spec.el.tagName.toLowerCase();
		}

		//var that = this;
		var context = this.context || spec.context;
		//console.log('context', context);
		// 
		if (context) {
			if (context.register_control) context.register_control(this);
		} else {
			//console.trace('');
			//throw 'Control requires context'
			// I think the very first Control object's prototype or something that inherits from it does not have
			//  a context at some stage.
		}
		if (spec['class']) {
			this.add_class(spec['class']);
			//d.attrs.set('class', spec['class']);
			//console.log('removed probably erroneous dom class setting.');
			//d.attrs['class'] = spec['class'];
		}

		//var content = this.content;
		//content._parent = this;
		// Content collection.

		//var content = this.content = this.contents = new Collection({});
		var content = this.content = new Collection({});

		// Want something in the change event that indicates the bubble level.
		//  It looks like the changes bubble upwards.

		// Want a 'target' for the change event.

		//if (spec.size) {
		//	this.size = spec.size;
		//}
	}

	get html() {
		// The rendered control.
		return this.all_html_render();
	}
	set html(html) {
		// Can include jsgui custom controls.

		// need to parse this html.
		//  then generate jsgui controls from it.

		// will need to change tagName, a variety of other attributes too.
		// parse and activate
		// mount is the (similar) term from react.

		// Parse the HTML.
		//  Mount the HTML. Initialise controls based on the parsed html dom.

		// the parse_mount module could help.
		//  create the internal controls.
		//  set the properties of the control.
		//  some would just be DOM attributes. Need to tell the difference.
		// creation of inner controls...
		// setting of HTML is not best to do right now.
		// just use the page_context to create the new controls from markup for the moment.

	}


	get internal_relative_div() {
		return this._internal_relative_div || false;
	}
	set internal_relative_div(value) {
		var old_value = this._internal_relative_div;
		this._internal_relative_div = value;

		if (value === true) {
			// maybe re-render, raise event?
		}
	}
	// resizable...
	//  more of an enhanced property.

	//  with some it would be text or font or foreground color.
	//   generally divs because they fill space consider it background.
	// Could be a shortcut for .background.color
	get color() {
		// Could use some internal property system that's more developed. Can use proxied objects rather than fields.
		//return this._color;
		return this.background.color;
	}
	set color(value) {

		// Don't really have input processors any longer.
		// Could do with some internal style, such as iStyle object.
		//  or a non-css style abstraction, through proxy possibly.
		/*


		var input_processor = jsgui.input_processors['color'];
		var output_processor = jsgui.output_processors['color'];
		var processed = input_processor(value);
		//console.log('processed', processed);

		this.set('color', processed, false); // false not to raise change event from it?


		var html_color = output_processor(processed);
		//console.log('html_color', html_color);
		*/

		/*

		this._color = value;
		var color_property_name = this.color_property_name || 'background-color';
		this.style(color_property_name, value);

		*/
		this.background.color = value;

	}

	'post_init'(spec) {
		//throw 'stop';
		if (spec && spec.id === true) {
			// get the id from the context.
			//if (t)
			//this.set('dom.attributes.id', this._id());
			this.dom.attrs.id = this._id();
		}
	}

	// 'ret' function - gets something if possible.
	'has'(item_name) {
		var arr = item_name.split('.');
		//console.log('arr ' + arr);
		var c = 0,
			l = arr.length;
		var i = this;
		var s;
		while (c < l) {
			s = arr[c];
			//console.log('s ' + s);
			if (typeof i[s] == 'undefined') {
				return false;
			}
			i = i[s];
			c++;
		};
		return i;
	}

	// The Dom attributes could count as fields, and wind up rendering themselves using Get.
	//  Dom attributes likely to be a collection as well, perhaps automatically sorted by name.
	// Could use collection rendering.
	'renderDomAttributes'() {
		//console.log('renderDomAttributes');

		// Pre-render dom attributes?
		//  To set the dom attributes programmatically according to properties.

		if (this.beforeRenderDomAttributes) {
			this.beforeRenderDomAttributes();
		}

		// Need to set up the data-jsgui-ctrl-fields attribute.
		//  Probably should not be setting it directly.
		//  It's just a string property.
		// The code that I'm currently using is messy and would be better if it were encapsulated.
		//  Just setting a property of a control with another control, on the server, should be enough to get this mechanism operating.
		//  It will be available as a field on the client-side.

		var dom_attrs = this.dom.attributes;

		if (!dom_attrs) {
			throw 'expecting dom_attrs';
		} else {

			if (this._) {
				var keys = Object.keys(this._);
				var key;
				//console.log('_ keys', keys);
				for (var c = 0, l = keys.length; c < l; c++) {
					key = keys[c];
					if (key !== '_bound_events') {
						//obj_ctrl_fields[key] = this._ctrl_fields[key]._id();
						if (key instanceof Control_Core) {
							//if (this._ctrl_fields && !this._ctrl_fields[key]) this._ctrl_fields[key] = this._[key];
							(this._ctrl_fields = this._ctrl_fields || {})[key] = this._[key];
						} else {
							this._fields = this._fields || {};
							this._fields[key] = this._[key];
							//(this._fields && !this._fields[key]) this._fields[key] = this._[key];
						}
					}
				}
			}

			if (this._ctrl_fields) {
				// go through the control fields, putting together the data attribute that will be persited to the client.
				// need to compose the string.
				var obj_ctrl_fields = {};
				var keys = Object.keys(this._ctrl_fields);

				var key;
				for (var c = 0, l = keys.length; c < l; c++) {
					key = keys[c];
					if (key !== '_bound_events') {
						//console.log('this._ctrl_fields[key]', this._ctrl_fields[key]);

						//console.log('this._id()', this._id());
						//console.log('key', key);


						obj_ctrl_fields[key] = this._ctrl_fields[key]._id();
					}
				}

				//each(this._ctrl_fields, function(ctrl_field, name) {
				//  obj_ctrl_fields[name] = ctrl_field._id();
				//});

				//this.set('dom.attributes.data-jsgui-ctrl-fields', stringify(obj_ctrl_fields).replace(/"/g, "'"));
				// lower level set here?
				//dom_attrs['data-jsgui-ctrl-fields'] = stringify(obj_ctrl_fields).replace(/"/g, "'");

				let scf = stringify(obj_ctrl_fields).replace(/"/g, "'");
				//console.log('scf', scf);

				if (scf.length > 2) {
					dom_attrs['data-jsgui-ctrl-fields'] = scf;
				}
			}

			if (this._fields) {
				// go through the control fields, putting together the data attribute that will be persited to the client.
				// need to compose the string.

				//var obj_fields = {};
				//each(this._ctrl_fields, function(ctrl_field, name) {
				//  obj_ctrl_fields[name] = ctrl_field._id();
				//});

				//this.set('dom.attributes.data-jsgui-fields', stringify({
				//    'num_days': num_days
				//}).replace(/"/g, "[DBL_QT]").replace(/'/g, "[SNG_QT]"));

				let sf = stringify(this._fields).replace(/"/g, "'");
				//console.log('sf', sf);

				if (sf.length > 2) {
					dom_attrs['data-jsgui-fields'] = sf;
				}
				//this.set('dom.attributes.data-jsgui-fields', stringify(this._fields).replace(/"/g, "[DBL_QT]").replace(/'/g, "[SNG_QT]"));
				//dom_attrs['data-jsgui-fields'] = stringify(this._fields).replace(/"/g, "[DBL_QT]").replace(/'/g, "[SNG_QT]");

			}
			var arr = [];
			//var arr_dom = dom_attrs._arr;
			//for (var c = 0, l = arr_dom.length; c < l; c++) {
			//  arr.push(' ', c, '="', arr_dom[c], '"');
			//}
			//var _ = dom_attrs._;
			var dom_attrs_keys = Object.keys(dom_attrs);
			//var dom_attrs_keys = Reflect.ownKeys(dom_attrs);
			// but now have a raise event key....
			//console.log('dom_attrs_keys', dom_attrs_keys);
			//throw 'stop';

			var key, item;
			for (var c = 0, l = dom_attrs_keys.length; c < l; c++) {
				key = dom_attrs_keys[c];
				//console.log('key', key);
				if (key == '_bound_events') {

				}
				//else if (key === 'raise') {} 
				else if (key === 'style') {
					item = dom_attrs[key];
					let is = item.toString();
					//console.log('item', item);
					//console.log('item', item.toString());
					//console.log('item.__empty', item.__empty);

					if (!item.__empty && is.length > 0) {
						arr.push(' ', key, '="', is, '"');
					}
				} else {
					item = dom_attrs[key];
					//console.log('item', item);
					if (item && item.toString) {
						arr.push(' ', key, '="', item.toString(), '"');
					}
					
				}
			}
			//dom_attrs.each(function (i, v) {
			//    arr.push(' ', i, '="', v, '"');
			//});
			return arr.join('');
		}
		// Maintaining a dict, or some data structure of the inline styles will help.
		//res = arr.join('');
		//return res;
	}
	'renderBeginTagToHtml'() {

		// will be in _.dom.tagName
		//  I think that's why we need the further level properties.

		// dom.style.transform3d.translate3d
		//  these property levels could go quite deep. Want a convenient way of using them without having to manually code lots of
		//  iterations, nested existance checks. Could have shortcuts so it knows what dom.translate3d means.
		// do we have 'get'?
		//var dom = this.get('dom');
		//var tagName = this.get('dom.tagName'),
		var tagName = this.dom.tagName;
		//console.log('this._.dom', this._.dom._.attributes);
		//console.log('tagName', tagName);
		var res;
		if (tagName === false) {
			res = '';
		} else {
			//var dom_attributes = this.renderDomAttributes();
			res = ['<', tagName, this.renderDomAttributes(), '>'].join('');
		}
		//var res = ['<', this._.tagName, this.renderDomAttributes(), '>'].join('');

		//console.log('renderBeginTagToHtml res ' + res);
		return res;
	}
	'renderEndTagToHtml'() {
		// will have different way of referring to the tagName, but that could be a shortcut.
		// dom.tagName();
		//  through the fields system.
		//var dom = this.get('dom');
		//var tagName = dom.get('tagName'),
		var res;
		var tagName = this.dom.tagName;
		var noClosingTag = this.dom.noClosingTag;
		//console.log(tof(noClosingTag));
		//throw 'stop';
		if (tagName === false || noClosingTag) {
			res = '';
		} else {
			res = ['</', tagName, '>'].join('');
		}
		//console.log('renderBeginTagToHtml res ' + res);
		return res;
	}
	'renderHtmlAppendment'() {
		return this.htmlAppendment || '';
	}

	// not rendering a jQuery object....
	// content including the tags? Not for the moment. Tags being false means there are no tags, and this tagless control acts as a container for other
	//  controls or content.
	// That will be useful for having different insertion points in controls without having to have them enclosed by an HTML element.

	'renderEmptyNodeJqo'() {
		return [this.renderBeginTagToHtml(), this.renderEndTagToHtml(), this.renderHtmlAppendment()].join('');
	}

	// register this and subcontrols
	'register_this_and_subcontrols'() {
		let context = this.context;
		this.iterate_this_and_subcontrols((ctrl) => {
			//console.log('iterate ctrl', ctrl);
			context.register_control(ctrl);
		});
	}
	/*
	'register_this_and_subels' () {
		// iterate elements rather than controls.
		let context = this.context;
		let iterate_els = (el, handler) => {
			if (el.nodeType === 1) {
				each(el.childNodes, cn => {

					iterate_els(cn, handler);
				})
				handler(el);
			}
		}
		iterate_els(this.dom.el, el => {
			//let jsgui_id = el.getAttribute('data-jsgui-id');
			//console.log('jsgui_id', jsgui_id);
			context.register_el(el);
		});
	}
	*/

	'iterate_this_and_subcontrols'(ctrl_callback) {
		ctrl_callback(this);
		var content = this.content;
		var that = this,
			tv;
		content.each(v => {
			//console.log('v', v);
			tv = tof(v);
			if (tv == 'string') {

			} else if (tv == 'data_value') {
				//var output = jsgui.output_processors['string'](n.get());
				//res.push(jsgui.output_processors['string'](n.get()));
			} else {
				//htm = n.all_html_render();
				//res.push(n.all_html_render());

				// it should not be null, but can ignore it for the moment / forever

				if (v && v.iterate_this_and_subcontrols) {
					v.iterate_this_and_subcontrols.call(v, ctrl_callback);
				}
			}
		});
	}

	/*
	'deferred'(cbfn) {
		this.__status = 'waiting';
		// The callback function will have a callback itself. ???
		//  
		//cbfn((err, ))
	}
	*/

	// Should now include deferred rendering.
	'all_html_render'(callback) {

		//console.log('all render callback', tof(callback));
		if (callback) {
			//var that = this;
			// want to recursively iterate through controls and subconstrols.
			var arr_waiting_controls = [];
			// Worth setting up the listener on this loop?
			this.iterate_this_and_subcontrols((control) => {
				if (control.__status == 'waiting') arr_waiting_controls.push(control);
			});
			// then if we are waiting on any of them we listen for them to complete.
			//console.log('arr_waiting_controls.length', arr_waiting_controls.length);
			if (arr_waiting_controls.length == 0) {
				var html = this.all_html_render();
				callback(null, html);
			} else {
				var c = arr_waiting_controls.length;
				var complete = () => {
					//console.log('complete');
					this.pre_all_html_render();

					var dom = this.dom;
					//console.log('dom', dom);

					if (dom) {
						var html = [this.renderBeginTagToHtml(), this.all_html_render_internal_controls(), this.renderEndTagToHtml(), this.renderHtmlAppendment()].join('');
						//console.log('html', html);
						callback(null, html);
						//throw ('stop');
					}
				}
				each(arr_waiting_controls, (control, i) => {
					control.on('ready', (e_ready) => {
						//console.log('control ready');
						c--;
						//console.log('c');
						if (c == 0) {
							complete();
						}
					});
				});
			}
		} else {
			this.pre_all_html_render();
			var dom = this.dom;
			if (dom) {
				return [this.renderBeginTagToHtml(), this.all_html_render_internal_controls(), this.renderEndTagToHtml(), this.renderHtmlAppendment()].join('');
			}
		}
	}

	'render_content'() {
		var content = this.content;

		// Does not have content?
		//  That's very strange.

		if (!content.length) {
			console.log('!!!no content length!!!');
			console.log('');
			console.log(this);
			console.log('');
			console.trace();
			console.log('content', content);
			console.log('tof(content) ' + tof(content));
			throw 'stop';
		}


		var contentLength = content.length();
		// will use getter instead.
		//console.log('contentLength', contentLength);
		//console.log('content._arr.length', content._arr.length);

		// var res = [];
		var res = new Array(contentLength);
		var tn, output;
		//console.log('content', content);

		// content._arr

		var arr = content._arr;
		var c, l = arr.length,
			n;

		for (c = 0; c < l; c++) {
			n = arr[c];
			// Could use faster duck typing here.
			tn = tof(n);

			//console.log('tn', tn);

			if (tn == 'string') {
				res.push(jsgui.output_processors['string'](n));
			}
			if (tn == 'data_value') {
				res.push(n._);
			} else {
				if (tn == 'data_object') {
					//console.log('n', n);
					//
					throw 'stop';
				} else {
					res.push(n.all_html_render());
				}
				//htm = n.all_html_render();
			}
		}
		/*
		if (this._internal_relative_div === true) {
			return '<div class="relative">' + res.join('') + '</div>';
		} else {
			return res.join('');
		}
		*/

		return res.join('');

		//console.log('res', res);

	}

	'all_html_render_internal_controls'() {
		//var controls = this.controls, res = [];
		return this.render_content();
	}
	'pre_all_html_render'() {

	}
	'compose'() {

		// I think having this avoids a recursion problem with _super calling itself.
	}

	/*
	'wait' (callback) {
		//console.log('wait');
		setTimeout(() => {
			callback();
		}, 0);
	}
	*/
	// could use aliases for style properties.

	'visible'(callback) {

		//console.log('vis');

		//return this.style('display', 'block', callback);
		this.style('display', 'block', callback);
	}

	// These kind of functions, that set a property to a value, could be made in a more efficient way.

	// have this in a function chain?
	'transparent'(callback) {
		this.style('opacity', 0, callback);
	}
	'opaque'(callback) {
		return this.style({
			'opacity': 1
		}, callback);
	}

	'add'(new_content) {
		var tnc = tof(new_content);
		let res;
		//console.log('control add content tnc', tnc);
		if (tnc == 'array') {
			let res = [];
			each(new_content, (v) => {
				res.push(this.add(v));
			});
			//res = new_content;
		} else {
			if (new_content) {
				//console.log('!!new_content', !!new_content);
				if (tnc === 'string') {
					//console.log('new content is string');

					new_content = new jsgui.textNode({
						'text': new_content,
						'context': this.context
					});

				} else {
					if (!new_content.context) {
						//console.log('1) !!new_content.context', !!new_content.context);
						//console.log('!!this.context', !!this.context);
						if (this.context) {
							new_content.context = this.context;
						}
					}


				}
				var inner_control = this.inner_control;
				if (inner_control) {
					res = inner_control.content.add(new_content);
				} else {
					//console.log('2) !!new_content.context', !!new_content.context);
					res = this.content.add(new_content);
				}
				new_content.parent = this;
				//register on event listen for add
				//console.log('this.__active', this.__active);
				//if (this.__active) {
				//	new_content.activate();
				//}
			}
		}
		return res;
	}
	'insert_before'(target) {
		//console.log('target', target);

		//console.log('pre find parent');
		//throw 'stop';

		// The parent of a content Collection being a Control?
		//  Probably makes sense.
		var target_parent = target.parent;
		//console.log('target_parent', target_parent);
		var target_index = target._index;
		var content = target_parent.content;
		content.insert(this, target_index);
	}
	/*
	'toJSON' () {
		var res = [];
		res.push('Control(' + stringify(this._) + ')');
		return res.join('');
	}
	*/
	'style'() {
		var a = arguments,
			sig = get_a_sig(a, 1);;
		a.l = a.length;
		//var sig = get_a_sig(a, 1);
		// For the moment, this should be a convenient way of updating the dom attributes style.

		const d = this.dom,
				da = d.attrs;
		//  This could do the document update or not....
		// No DOM modification here is best.
		//  Have it listen to style / dom changes on activation.
		var style_name, style_value, modify_dom = true;

		if (sig == '[s]') {

			// Best not to refer to the computed styles probably?
			//  Really want to interact with inline styles here.

			// maybe have some syntax for computed styles, such as .style('computed', style_name);
			//  Or just don't have it, get it from the element if needed.
			// Want to get a style value.
			//  This could get fairly complicated when getComputedStyle is not around, in older browsers.

			// May have a system to read through a stylesheet and work out what would get applied to an element

			// For the moment, will look at style of control property (need to develop that more).

			style_name = a[0];
			//console.log('get style ' + styleName);
			//var el = ;
			// Should probably return a copy of the style, not read from the DOM.

			var res = getComputedStyle(d.el)[style_name];
			return res;
		}
		//console.log('style sig ' + sig);

		if (sig == '[s,s,b]') {
			//styleName = a[0], styleValue = a[1];
			// Modify dom by default if there is a DOM.
			//modifyDom = a[2];
			[style_name, style_value, modify_dom] = a;
		};
		if (sig == '[s,s]' || sig == '[s,n]') {
			[style_name, style_value] = a;

		};
		if (style_name && typeof style_value !== 'undefined') {
			if (da.style) {
				da.style[style_name] = style_value;
				da.raise('change', {
					'property': 'style',
					'name': 'style',
					'value': da.style + ''
				});
			} else {
				//this.dom.attrs.style = styleName + ':' + ''
			}
		}
		//var that = this;

		if (sig == '[o]') {
			each(a[0], (v, i) => {
				//console.log('v', v);
				//console.log('i', i);
				//that.style(i, v, false);
				this.style(i, v);
			});
			
		}
	}
	'active'() {
		var id = this._id();
		var dom = this.dom,
			dom_attributes = dom.attributes;
		//console.log('dom_attributes', dom_attributes);
		//throw 'stop';
		/*
		dom_attributes['data-jsgui-id'] = new Data_Value({
			'value': id
		});
		dom_attributes['data-jsgui-type'] = new Data_Value({
			'value': this.__type_name
		});
		*/
		dom_attributes['data-jsgui-id'] = id;
		dom_attributes['data-jsgui-type'] = this.__type_name;
		//var el = this._.el || dom._.el;
		var el;
		if (dom.el) {
			el = dom.el;
		}

		if (el) {
			if (el.nodeType === 1) { // element
				//console.log('Removed dome update.');
				//el.setAttribute('data-jsgui-id', id);
				//el.setAttribute('data-jsgui-type', this.__type_name);
			}
		}
		var tCtrl;

		this.content.each(ctrl => {
			//console.log('active i', i);
			tCtrl = tof(ctrl);
			//console.log('tCtrl', tCtrl);
			if (tCtrl === 'control') {
				// if it's a text node then no
				if (ctrl instanceof jsgui.textNode || ctrl instanceof jsgui.code) {

				} else {
					//console.log('ctrl', ctrl);
					ctrl.active();
				}
			}
		});
	}
	// So I think the resource-pool will have a selection scope.
	'find_selection_scope'() {
		//console.log('find_selection_scope', this._id());
		var res = this.selection_scope;
		//console.log('find_selection_scope', this._id());
		if (res) return res;
		if (this.parent && this.parent.find_selection_scope) return this.parent.find_selection_scope();
	}
	'click'(handler) {
		// Adding the click event listener... does that add it to the DOM?

		this.on('click', handler);
	}

	// Hover could be a simple mixin
	//  Could raise events.

	// DOM can do that now.

	'hover'(fn_in, fn_out) {
		this.on('mouseover', e => {
			//console.log('hover mouseover');
			fn_in();
		})

		this.on('mouseout', e => {
			//console.log('hover mouseout');
			fn_out();
		})
	}
	'hover_class'(class_name) {
		//var that = this;
		this.hover(e_in => {
			this.add_class(class_name);
			//ctrl_key_close_quote.add_class(hover_class);
		}, e_out => {
			this.remove_class(class_name);
			//ctrl_key_close_quote.remove_class(hover_class);
		})
	}
	'add_class'(class_name) {
		// Should have already set these up on activation.
		//console.log('Control add_class ' + class_name);
		let da = this.dom.attrs,
			cls = da['class'];
		//console.log('cls ' + cls);
		//var el = this.dom.el;

		//console.log('add_class el ' + el);
		if (!cls) {

			//this.add_class(class_name);

			// Make the Dom Attributes Class a Data_Value?
			//  Then can have it respond to changes better.
			//   The class value changes, then it gets updated in the UI.

			//this.dom.attributes.class = class_name;
			//this.dom.attrs.set('class', class_name);
			//this.dom.attrs['class'] = class_name;
			//this.dom.attrs.set('class', class_name);
			da['class'] = class_name;

			// as well as that, need to have the class in the doc respond to this chaging.
			//  event listener listening for dom changes will update this.
			//if (el) el.className = class_name;
		} else {
			var tCls = tof(cls);
			//console.log('tCls ' + tCls);
			if (tCls == 'object') {

				throw 'removed';

				//cls

				/*
				cls[class_name] = true;
				// then get the classes from the obj
				var arr_class = [];
				each(cls, (v, i) => {
					if (v) arr_class.push(i);
				})
				//var str_cls = arr_class.join(' ');
				//el.className = str_class;
				//this.dom.attrs.set('class', str_cls);
				da['class'] = arr_class.join(' ');
				*/
			} else if (tCls == 'data_value') {
				throw 'removed';
				/*

				
				var val = cls.value();

				var arr_classes = val.split(' ');
				var already_has_class = false,
					l = arr_classes.length,
					c = 0;
				while (c < l & !already_has_class) {
					if (arr_classes[c] == class_name) {
						already_has_class = true;
					}
					c++;
				}
				if (!already_has_class) {
					arr_classes.push(class_name);
				}
				//var str_cls = arr_classes.join(' ');
				//console.log('str_cls', str_cls);
				//this.add_class(str_cls);
				//this.dom.attrs.set('class', str_cls);
				da['class'] = arr_classes.join(' ');
				//this.add_class(val);
				// And the DOM should update itself when one of these 'model' objects gets changed - depending on if its activated or not.

				*/
			} else if (tCls == 'string') {
				var arr_classes = cls.split(' ');
				var already_has_class = false,
					l = arr_classes.length,
					c = 0;

				while (c < l && !already_has_class) {
					if (arr_classes[c] === class_name) {
						already_has_class = true;
					}
					c++;
				}
				//console.log('already_has_class', already_has_class);
				if (!already_has_class) {
					arr_classes.push(class_name);
				}
				//var str_cls = arr_classes.join(' ');
				//console.log('add_class str_cls', str_cls);
				//this.add_class(str_cls);
				//this.dom.attrs.set('class', str_cls);
				//console.log('add arr_classes', arr_classes);
				da['class'] = arr_classes.join(' ');
				//this.dom.attrs['class'] = class_name;
				// And the DOM should update itself when one of these 'model' objects gets changed - depending on if its activated or not.
			}
		}
		//throw 'stop';
	}

	'has_class'(class_name) {
		let da = this.dom.attrs,
			cls = da['class'];
		if (cls) {
			var tCls = tof(cls);
			if (tCls == 'object') {
				//el.

				throw 'removed';
			}
			if (tCls == 'string') {
				//console.log('cls', cls);
				var arr_classes = cls.split(' ');
				var arr_res = [];
				var l = arr_classes.length,
					c = 0;
				//console.log('arr_classes', arr_classes);
				while (c < l) {
					//console.log('arr_classes[c]', arr_classes[c]);
					if (arr_classes[c] === class_name) {
						return true;
					}
					c++;
				}
			}
			// and if it's a data value, do similar...
			if (tCls == 'data_value') {
				throw 'removed';
			}
		}
	}

	'remove_class'(class_name) {
		//console.log('remove_class ' + class_name);
		let da = this.dom.attrs,
			cls = da['class'];
		//console.log('cls', cls);
		//var el = this.dom.el;
		//console.log('el.className', el.className);
		if (cls) {
			var tCls = tof(cls);
			//console.log('tCls', tCls);
			//throw 'stop';
			if (tCls == 'object') {
				//el.

				throw 'removed';

				/*

				// go through it again, building the class string...
				var arr_class = [];
				each(cls, (v, i) => {
					//if (v) arr_class.push(i);
					if (i === class_name) cls[i] = false;
					if (cls[i]) arr_class.push(i);
				})
				//var str_class = arr_class.join(' ');
				//this.add_class(str_cls);
				//this.dom.attrs.set()
				//this.dom.attrs.set('class', str_cls);
				da['class'] = arr_class.join(' ');
				//el.className = str_class;
				//console.log('str_class ' + str_class);

				*/
			}
			if (tCls == 'string') {
				//console.log('cls', cls);
				var arr_classes = cls.split(' ');
				var arr_res = [];
				var l = arr_classes.length,
					c = 0;
				//console.log('arr_classes', arr_classes);
				while (c < l) {
					//console.log('arr_classes[c]', arr_classes[c]);
					if (arr_classes[c] != class_name) {
						//already_has_class = true;
						arr_res.push(arr_classes[c]);
					}
					c++;
				}
				//console.log('arr_res', arr_res);
				//var str_cls = arr_res.join(' ');
				//console.log('str_cls', str_cls);
				//this.add_class(str_cls);
				//this.dom.attrs.set('class', str_cls);
				//console.log('remove arr_res', arr_res);
				da['class'] = arr_res.join(' ');
				//console.log('str_cls ' + str_cls);
				//throw 'stop';
			}
			// and if it's a data value, do similar...
			if (tCls == 'data_value') {
				throw 'removed';
				/*
				var cls2 = cls.value();
				var arr_classes = cls2.split(' ');
				var arr_res = [];
				var l = arr_classes.length,
					c = 0;
				//console.log('arr_classes', arr_classes);
				while (c < l) {
					if (arr_classes[c] !== class_name) {
						//already_has_class = true;
						arr_res.push(arr_classes[c]);
					}
					c++;
				}
				//console.log('arr_res', arr_res);
				//var str_cls = arr_res.join(' ');
				//console.log('str_cls ', str_cls);
				//this.add_class(str_cls);
				//this.dom.attrs.set('class', str_cls);
				da['class'] = arr_res.join(' ');
				//console.log('str_cls ' + str_cls);
				*/
			}

		}
	}

	
	'matches_selector'(selector) {

	}

	// Want to see if an element (or control) is a descendant of this.
	//  If this is an ancestor of element or control. is_ancestor_of
	// will go through DOM parent nodes or control parents.


	// Should work with controls.
	//  Would be a fair assumption that it does.

	// see 'ancestor' function.
	'is_ancestor_of'(target) {
		var t_target = tof(target);
		//console.log('t_target', t_target);

		var el = this.dom.el;

		var inner = (target2) => {
			if (target2 == el) {
				return true;
			}
			var parent = target2.parentNode;
			if (!parent) {
				return false;
			} else {
				return inner(parent);
			}
		}

		if (t_target === 'object') {
			if (el !== target) {
				var parent = target.parentNode;
				if (parent) {
					return inner(parent);
				}
			}

		} else {
			if (t_target === 'control') {

			}
		}
	}

	'find_selected_ancestor_in_scope'() {
		// same selection scope
		// is this one already selected?
		// best not to check....

		var s = this.selection_scope;
		//console.log('parent ' + parent);
		var ps = this.parent.selection_scope;

		if (s === ps) {
			// Probably would be much more convenient to get a data value just as its value,
			//  or have a more convenient data value idiom.
			var psel = this.parent.selected;
			if (psel && psel.value && psel.value() == true) {
				//throw 'stop';
				return this.parent;
			} else {
				return this.parent.find_selected_ancestor_in_scope();
			}
		}
		//throw 'stop';
	}


	// self and ancestor search
	'closest'(match) {
		let tmatch = tof(match);
		if (tmatch === 'string') {

		}
		if (tmatch === 'function') {
			// iterate self and ancestors

			let search = (ctrl) => {
				//console.log('match(ctrl)', match(ctrl));
				if (match(ctrl)) {
					return ctrl;
				} else {
					//console.log('ctrl.parent', ctrl.parent);
					if (ctrl.parent) {
						return search(ctrl.parent);
					} else {
						return undefined;
					}
				}
			}
			return search(this);
		}
	}

	'remove'() {
		// No, remove it from collection in parent.
		//  Have DOM respond to that.

		console.log('TO CHANGE: control-core.remove()');

		var el = this.dom.el;
		if (el) {
			if (el.parentNode) {
				el.parentNode.removeChild(el);
			}
		}
	}

	'shallow_copy'() {
		//console.log('Control shallow_copy');

		var res = new Control({
			'context': this.context
		});
		var da = this.dom.attributes;
		var cl = da.class;
		var map_class_exclude = {
			//'bg-light-yellow': true,
			'selected': true
		}

		each(cl.split(' '), (v, i) => {
			if (i && !map_class_exclude[i]) res.add_class(i);
		})

		var res_content = res.content;

		this.content.each((v, i) => {
			//console.log('v ' + v);
			//console.log('v ' + stringify(v));
			//console.log('tof v ' + tof(v));

			if (tof(v) == 'data_value') {
				res_content.add(v.value());
			} else {
				res_content.add(v.shallow_copy());
			}
		})
		return res;
	}

	'$match'(selector) {

		// [name=”value”]

		// need to parse the selector.

		// sequence of objects / tokens

		// separate by words
		//  then those words get parsed into selector stages

		//console.log('$match', this._id());

		// square brackets being about attributes
		// [name='value']

		// an attribute selector looks important
		// words are separated by spaces
		//  that means the heirachy

		// no space, its the same level on the heirachy.
		//  it's selecting by attribute.

		let parse_word = word => {

			// begins with full stop: matches css class
			// else matches __type_name

			if (word[0] === '.') {
				return () => this.has_class(word.substr(1));
			} else {
				return () => this.__type_name === word;
			}
		}

		let parse_selector = selector => {
			let words = selector.split(' ');
			// then the word gets turned unto a selection part.
			//  an oo selector with a test.
			let res = words.map(x => parse_word(x));
			// then with the stack of different selectors
			// need to be able to apply these selectors in sequence successfully.
			return res;
		}
		let parsed = parse_selector(selector);
		//console.log('parsed', parsed);

		// then in squence
		//  need to keep the control, with its ancestor controls too.

		// the control applies to the ultimate selector.

		// need to then go back through the control's parents to find the matching controls.
		// loop through the selectors
		//  moving to the parent as many times as necessary for each.

		// > symbol like the direct child of...
		//  they could be parsed as joining terms.

		// iterate this ancestors.

		if (parsed.length === 1) {
			return parsed[0]();
		} else {
			throw 'NYI';
		}
		// Does this match the selector?
		let res = false;
		let tn = this.__type_name;
		if (tn) {
			if (tn === selector) res = true;
		}
		return res;
	}

	// Want it to return an array of them.

	'$'(selector, handler) {
		let match = this.$match(selector);
		let res = [];
		if (match) {
			if (handler) handler(this);
			res.push(this)
		}
		//console.log('this.content.length()', this.content.length());
		this.content.each(item => {
			if (item.$) {
				let nested_res = item.$(selector, handler);
				Array.prototype.push.apply(res, nested_res);
			}
		});
		return res;
	}

	// 01/03/2016
	//  Better for color to be handled by the input and output processing systems and fields.
	//  Not using a function within the Control definition space.
	//  .size works like this already. Should be similar.
	///  ??? or not???


	'clear'() {
		// clear all the contents.
		// ui should react to the change.
		//return this.content.clear();
		this.content.clear();
		// ui seems not to react to this.
		// remove all dom nodes?
		// Or have a different part that responds to content events?
		// content event handlers seem important.
	}

	'activate'() {
		// Do nothing for basic control I think.
		//  Possibly will be doing some things depending on discovered properties.

		// Need to work more on heirachy in activation.
		//  Want html documents (and pretty much everythin else) to use the enhanced activation.
		//  Should be OK having that in the dependency chain on the server, much of the code won't be called though.

		// Or, enhance the activations of the prototypes?
		//  I'd prefer to have the enhancements become higher up the chain.
	}
};

var p = Control_Core.prototype;
//p.fields = Control_fields;
p.connect_fields = true;

// assign_fields(Control, control_fields);

module.exports = Control_Core;