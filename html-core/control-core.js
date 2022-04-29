/**
 * Created by James on 16/09/2016.
 */

const jsgui = require('lang-tools');
const get_a_sig = jsgui.get_a_sig;
//var remove_sig_from_arr_shell = jsgui.remove_sig_from_arr_shell;
const each = jsgui.each;
const clone = jsgui.clone;
const Evented_Class = jsgui.Evented_Class;
//var Data_Value = jsgui.Data_Value;
const Data_Object = jsgui.Data_Object;
const Collection = jsgui.Collection;
const tof = jsgui.tof;
const stringify = jsgui.stringify;
const Text_Node = require('./text-node');

const {
	prop,
	field
} = require('obext');

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

var new_obj_style = () => {
	//var style = new Evented_Class({});
	//var style = {}

	let style = new Evented_Class({});
	style.__empty = true;

	style.toString = () => {
		var res = [];
		var first = true;

		each(style, (value, key) => {
			const tval = typeof value;
			if (tval !== 'function' && key !== 'toString' && key !== '__empty' && key !== '_bound_events' && key !== 'on' && key !== 'subscribe' && key !== 'raise' && key !== 'trigger' && key !== {}) {
				if (first) {
					first = false;
				} else {
					res.push(' ');
				}
				res.push(key + ': ' + value + ';');
			}
		});
		return res.join('');
	}

	var res = new Proxy(style, {
		set: (target, property, value, receiver) => {
			let res;
			target['__empty'] = false;
			var old_value = target[property];
			if (style_input_handlers[property]) {
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
}

class Control_DOM extends Evented_Class {
	constructor() {

		// Proxy the attributes, so that it raises an event for changes.
		super();
		var dom_attributes = new DOM_Attributes();
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
	}
}


// Time to make the Control extend Evented_Class so it raises events?
//  A bit surprised I've not used or needed Control's events.


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty

// Outside of dom attributes and style.
//  Dom attributes / style need to get updated from these properties.
class Control_Background extends Evented_Class {
	constructor(spec = {}) {
		super(spec);
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

class Control_Core extends Data_Object {

	constructor(spec = {}, fields) {
		// but process / normalize the spec here?
		//spec = spec || {};
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
			let {value} = e_change;
			value.on('change', evt => {
				if (evt.name === 'color') {
					// Except may be better after all to use a Color class that can output to HTML better.
					d.attributes.style['background-color'] = evt.value;
				}
			});
			// or a change tuplet kvp.
		});
		prop(this, 'disabled', false);

		// size property - but also need way to measure property or obtain it from the DOM.
		//  ctrl-enh needs to be initialised with the correct size property if possible.
		prop(this, 'size', spec.size, (e_change) => {
			//console.log('e_change', e_change);
			let {value, old} = e_change;
			//console.log('value', value);
			//throw 'stop';
			let [width, height] = value;
			const s = this.dom.attrs.style;
			s.width = width;
			s.height = height;
			this.raise('resize', {
				'value': value
			});
		});
		prop(this, 'pos', spec.pos, (e_change) => {
			let {value, old} = e_change;
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
		let tagName = spec.tagName || spec.tag_name || 'div';
		//this.set('dom.tagName', tagName);
		d.tagName = tagName;
		//this._icss = {};
		//this._.dom = {'tagName': 'div'};
		// Abstract controls won't have
		var content = this.content = new Collection({});

		// The DOM is a field that it should be getting from the control.
		spec_content = spec.content;
		if (spec_content) {
			var tsc = tof(spec_content);
			if (tsc === 'array') {
				each(spec.content, item => {
					content.add(item);
				})
				//throw 'Content array not yet supported here.'
			} else if (tsc === 'string' || tsc === 'control') {
				content.add(spec_content);
			}
		}

		if (spec.el) {
			d.el = spec.el;
			if (spec.el.tagName) d.tagName = spec.el.tagName.toLowerCase();
		}

		//var that = this;
		var context = this.context || spec.context;
		//console.log('context', context);
		// 

		// Context does not seem manditory right now.
		if (context) {
			if (context.register_control) context.register_control(this);
		} else {
		}
		if (spec['class']) {
			this.add_class(spec['class']);
		}
		if (spec.hide) {
			this.hide();
		}
		if (spec.add) {
			this.add(spec.add);
		}
	}
	'hide'() {
		//console.log('hide');
		//this.add_class('hidden');
		let e = {
			cancelDefault: false
		}
		this.raise('hide', e)
		if (!e.cancelDefault) {
			this.add_class('hidden');
		}
	}
	'show'() {
		//console.log('show');
		let e = {
			cancelDefault: false
		}
		//console.log('pre raise show')
		this.raise('show', e);
		if (!e.cancelDefault) {
			this.remove_class('hidden');
		}
	}

	get html() {
		// The rendered control.
		return this.all_html_render();
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
						if (key instanceof Control_Core) {
							(this._ctrl_fields = this._ctrl_fields || {})[key] = this._[key];
						} else {
							this._fields = this._fields || {};
							this._fields[key] = this._[key];
						}
					}
				}
			}

			if (this._ctrl_fields) {
				var obj_ctrl_fields = {};
				var keys = Object.keys(this._ctrl_fields);

				var key;
				for (var c = 0, l = keys.length; c < l; c++) {
					key = keys[c];
					if (key !== '_bound_events') {
						obj_ctrl_fields[key] = this._ctrl_fields[key]._id();
					}
				}

				let scf = stringify(obj_ctrl_fields).replace(/"/g, "'");
				//console.log('scf', scf);

				if (scf.length > 2) {
					dom_attrs['data-jsgui-ctrl-fields'] = scf;
				}
			}

			if (this._fields) {

				let sf = stringify(this._fields).replace(/"/g, "'");
				//console.log('sf', sf);

				if (sf.length > 2) {
					dom_attrs['data-jsgui-fields'] = sf;
				}
				//this.set('dom.attributes.data-jsgui-fields', stringify(this._fields).replace(/"/g, "[DBL_QT]").replace(/'/g, "[SNG_QT]"));
				//dom_attrs['data-jsgui-fields'] = stringify(this._fields).replace(/"/g, "[DBL_QT]").replace(/'/g, "[SNG_QT]");

			}
			var arr = [];
			arr.push(' data-jsgui-id="' + this._id() + '"');
			// only if its not an html / svg / browser tag.

			// and div?
			const exempt_types = {
				html: true,
				head: true,
				body: true
			}
			if (this.__type_name) {

				// Still seems as though the body is not being activated properly.
				//  New controls not appearing in the body as they should right now.
				if (!exempt_types[this.__type_name]) {
					arr.push(' data-jsgui-type="' + this.__type_name + '"');
				}
			}
			var dom_attrs_keys = Object.keys(dom_attrs);
			var key, item;
			for (var c = 0, l = dom_attrs_keys.length; c < l; c++) {
				key = dom_attrs_keys[c];
				//console.log('key', key);
				if (key == '_bound_events') {

				} else if (key === 'style') {
					item = dom_attrs[key];
					if (typeof item !== 'function') {
						// if its an object, need to build up the string.
						//  and ignore functions in there, such as 'off'.
						if (typeof item === 'object') {
							// for style in particular..
							//console.log('key', key);
							if (key === 'style') {
								// can join an array with ;.
								const sprops = [];
								each(item, (v, k) => {
									const tval = typeof v;
									if (tval !== 'function') {
										// need to write out the inline css here.
										if (k !== '__empty') {
											const sprop = k + ':' + v;
											sprops.push(sprop);
										}
									}
								});
								if (sprops.length > 0) arr.push(' ', key, '="', sprops.join(';'), '"');
							} else {
								console.trace();
								throw 'NYI';
							}
						} else {
							let is = item.toString();
							if (!item.__empty && is.length > 0) {
								arr.push(' ', key, '="', is, '"');
							}
						}
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
		const tagName = this.dom.tagName;
		var res;
		if (tagName === false) {
			res = '';
		} else {
			res = ['<', tagName, this.renderDomAttributes(), '>'].join('');
		}
		return res;
	}
	'renderEndTagToHtml'() {
		var res;
		const tagName = this.dom.tagName;
		const noClosingTag = this.dom.noClosingTag;
		if (tagName === false || noClosingTag) {
			res = '';
		} else {
			res = ['</', tagName, '>'].join('');
		}
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
		const context = this.context;
		this.iterate_this_and_subcontrols((ctrl) => {
			//console.log('iterate ctrl', ctrl);
			context.register_control(ctrl);
		});
	}
	'iterate_subcontrols'(ctrl_callback) {
		//ctrl_callback(this);
		const content = this.content;
		//let tv;
		content.each(v => {
			ctrl_callback(v);
			//console.log('v', v);
			//tv = tof(v);
			if (v && v.iterate_subcontrols) {
				//v.iterate_this_and_subcontrols.call(v, ctrl_callback);
				v.iterate_subcontrols(ctrl_callback);
			}
		});
	}
	'iterate_this_and_subcontrols'(ctrl_callback) {
		ctrl_callback(this);
		const content = this.content;
		let tv;
		content.each(v => {
			//console.log('v', v);
			tv = tof(v);
			if (tv == 'string') {

			} else if (tv == 'data_value') {
				//var output = jsgui.output_processors['string'](n.get());
				//res.push(jsgui.output_processors['string'](n.get()));
			} else {
				if (v && v.iterate_this_and_subcontrols) {
					//v.iterate_this_and_subcontrols.call(v, ctrl_callback);
					v.iterate_this_and_subcontrols(ctrl_callback);
				}
			}
		});
	}
	'all_html_render'(callback) {

		// observable result may be better.

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
				callback(null, this.all_html_render());
			} else {
				var c = arr_waiting_controls.length;
				var complete = () => {
					this.pre_all_html_render();
					var dom = this.dom;
					if (dom) {
						callback(null, [this.renderBeginTagToHtml(), this.all_html_render_internal_controls(), this.renderEndTagToHtml(), this.renderHtmlAppendment()].join(''));
					}
				}
				each(arr_waiting_controls, (control, i) => {
					control.on('ready', e_ready => {
						c--;
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
		var contentLength = content.length();
		var res = new Array(contentLength);
		var tn, output;
		var arr = content._arr;
		var c, l = arr.length,
			n;
		for (c = 0; c < l; c++) {
			n = arr[c];
			tn = tof(n);
			if (tn === 'string') {
				res.push(jsgui.output_processors['string'](n));
			} else if (tn === 'data_value') {
				res.push(n._);
			} else {
				if (tn === 'data_object') {
					throw 'stop';
				} else {
					res.push(n.all_html_render());
				}
				//htm = n.all_html_render();
			}
		}
		return res.join('');
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

	'remove'() {
		const {parent} = this;
		parent.content.remove(this);
	}

	'add'(new_content) {
		const tnc = tof(new_content);
		let res;
		//console.log('control add content tnc', tnc);
		if (tnc === 'array') {
			let res = [];
			each(new_content, (v) => {
				res.push(this.add(v));
			});
			//res = new_content;
		} else {
			if (new_content) {
				if (tnc === 'string') {
					new_content = new Text_Node({
						'text': new_content,
						'context': this.context
					});
				} else {
					if (!new_content.context) {
						if (this.context) {
							new_content.context = this.context;
						}
					}
				}
				var inner_control = this.inner_control;
				if (inner_control) {
					res = inner_control.content.add(new_content);
				} else {
					res = this.content.add(new_content);
				}
				new_content.parent = this;
			}
		}
		return res;
	}
	'insert_before'(target) {
		const target_parent = target.parent;
		//console.log('target_parent', target_parent);
		const target_index = target._index;
		const content = target_parent.content;
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
		const a = arguments,
			sig = get_a_sig(a, 1);;
		a.l = a.length;
		const d = this.dom,
			da = d.attrs;
		var style_name, style_value, modify_dom = true;

		if (sig == '[s]') {
			style_name = a[0];
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
		// do nothing for the moment.

		//console.log('Deprecated active. Functionality now part of standard control rendering.');
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
	'add_class'(class_name) {
		// Should have already set these up on activation.
		//console.log('Control add_class ' + class_name);
		let da = this.dom.attrs,
			cls = da['class'];
		if (!cls) {
			da['class'] = class_name;
		} else {
			const tCls = tof(cls);
			//console.log('tCls ' + tCls);
			if (tCls == 'object') {

				throw 'removed';
			} else if (tCls == 'string') {
				let arr_classes = cls.split(' '),  already_has_class = false, l = arr_classes.length, c = 0;

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
				da['class'] = arr_classes.join(' ');
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
				da['class'] = arr_res.join(' ');
			}

		}
	}
	'matches_selector'(selector) {
		throw 'NYI'
	}
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
			if (tof(v) == 'data_value') {
				res_content.add(v.value());
			} else {
				res_content.add(v.shallow_copy());
			}
		})
		return res;
	}

	'$match'(selector) {
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
			let res = words.map(x => parse_word(x));
			return res;
		}
		let parsed = parse_selector(selector);
		if (parsed.length === 1) {
			return parsed[0]();
		} else {
			console.trace();
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
	'clear'() {
		this.content.clear();
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

	get this_and_descendents() {
		const res = [];
		// then iterate the descendents.
		this.iterate_this_and_subcontrols(ctrl => res.push(ctrl));
		return res;
	}
	get descendents() {
		const res = [];
		// then iterate the descendents.
		this.iterate_subcontrols(ctrl => res.push(ctrl));
		return res;
	}
};

var p = Control_Core.prototype;
//p.fields = Control_fields;
p.connect_fields = true;
// assign_fields(Control, control_fields);

module.exports = Control_Core;