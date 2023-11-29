/**
 * Created by James on 16/09/2016.
 * 
 * 2022 - Could even see about moving some of this functionality / code to mixins.
 * 
 * Late 2023 - Want to make more subtle changes to the control system, keeping the current API working where possible.
 *   Though it seems likely to involve making a more deeply nested type of data structure inside the control.
 * 	 May be best to focus on things on a higher level for the moment, such as mixins, and then see what can be integrated here?
 * 
 * Maybe not though - the view.ui.data.model, view.data.model, data.model system seems like it may be useful.
 * As in making it standard that there are different things within each of the controls, with clearly defined roles,
 *  and where they overlap there are clear rules for syncing
 * 
 * composition.model makes a lot of sense
 * composition.models makes sense to (when defining them)
 * composition.model = 'divs' could make sense here when choosing between different ways something could be composed.
 * 
 * 
 * model_data_view_compositional_representation
 * 
 */
const jsgui = require('lang-tools');
const oext = require('obext');
const get_a_sig = jsgui.get_a_sig;
const each = jsgui.each;
const Evented_Class = jsgui.Evented_Class;
const Data_Object = jsgui.Data_Object;
const Collection = jsgui.Collection;
const tof = jsgui.tof;
const stringify = jsgui.stringify;



const Text_Node = require('./text-node');

//jsgui.custom_rendering = 'very-simple';

// May need some core improvements, possibly very style focused.
//   Ability to access a transitions object.

// view.ui.data.model.options???

// or a model that's not a Data_Model (explicitly in the . namespaces)

// view.data.model???
//  is that even necessary???
// .view is a data_model itself???

// .ui.data.model could work in fact.
//  just may want the shortcut ui.model

// DO WANT ctrl.view.ui.data.model
//   that would represent things like the label text.
//    possibly other options to do with the presentation of that text, and not necessarily following the same API as CSS.
//    This is intended to be a higher level than CSS.

// Putting things into ui.data.model would help when syncing or recording what happens within the UI.
//   Things that would be useful for screen sharing, but not for application undo and redo.

// ctrl.view.ui.data.model
//   would have things such as position.

// Maybe have a more explicit sync system between the ui data model and the ui dom.
//   Probably should be done with onchange handlers.
//     Focus mostly on syncing to the dom attributes and css.
//  .ui.node ???
//  ctrl.dom.node for example...???
//  .node as well as .el.
//  dom.node.type being either the HTML node type, or some kind of HTML_Node_Type instance, or a data type that expresses it.
//   want to be able to get and set it as an integer or string.
//  .node.type.toString() even???
//  .node.type.name perhaps too.



// May try making a new API-compatable control.
//   And then could introduce more parts of the API / change it further.













// Though could solve this with a 'no-size-transitions' class that's temporarily there.


// Keeping things within .data.model and .view.ui.data.model could be effective.

// Though at what level of the controls it's worth integrating it's hard to know right now.
//   Not so sure about using .data.model (with its types???) to model the dom attributes and style...
//    Though the types could be effective for converting to valid CSS.
//    Eg a CSS string type.
// The main point will be to allow simpler / simplest higher / highest level syntax.











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
		if (match.length === 2) {
			res = value + 'px';
		} else {
			res = value;
		}
	}
	return res;
}

// This could be moved to / recreated within a view.ui.html.dom.style
//   view.ui.html.model??? .dom.attributes.style????

// Does seem like it's worth nesting some functionality / settings further within sub-objects.
//   It would make for a more concise top level of the control (without the shortcuts)
//   

// Seems like this is possibly worth reimplementing using the new Data_Value system???
//   Though maybe first improve Data_Value so it could then work as Data_Object and power the Control class?

// Not so sure it's best to add this new functionality right into Control right now....?
//   Maybe best to split up some functionality from here, like the Control_Dom...?

// Maybe always put that into a Control_View class?
//  Making Control_View standard could help.
//   .view.data.model ??? there would not always be data in the view.
//   .view.ui.data.model ??? such as the title of a window?

// May be best putting propertyies behind .data.model for the moment and making it very standard.

// Eg when 'data' is in a spec, it would be loaded into the .data.model.
//  .data.load(x) could load it into the model (perhaps)











// Even need something that models CSS styles.
//   Seems like a job for Data_Model at the end of the day.





var style_input_handlers = {
	'width': px_handler,
	'height': px_handler,
	'left': px_handler,
	'top': px_handler
}

// Not sure why it's not returning the property correctly....

var new_obj_style = () => {
	let style = new Evented_Class({});
	style.__empty = true;
	style.toString = () => {
		var res = [];
		var first = true;
		each(style, (value, key) => {
			const tval = typeof value;

			// Use hasownproperty instead.

			if (tval !== 'function' && key !== 'toString' && key !== '__empty' && key !== '_bound_events' && key !== 'on' && key !== 'subscribe' && key !== 'raise' && key !== 'trigger') {
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
	const res = new Proxy(style, {
		set: (target, property, value, receiver) => {
			let res;
			target['__empty'] = false;
			var old_value = target[property];
			if (style_input_handlers[property]) {
				res = target[property] = style_input_handlers[property](target, property, value, receiver);
			} else {
				res = target[property] = value;
			}
			style.raise('change', {
				'key': property,
				'name': property,
				'old': old_value,
				'new': value,
				'value': value
			});
			return res;
		},
		get: (target, property, receiver) => {
			//console.log('style proxy get property: ' + property);

			if (property === 'toString') {
				// return a function....

				//console.log('target', target);

				return () => target + '';
			} else {
				return target[property];
			}
		}
	});
	return res;
}
class DOM_Attributes extends Evented_Class {
	constructor(spec) {
		super(spec);
		this.style = new_obj_style();
		this.style.on('change', e_change => {
			this.raise('change', {
				'property': 'style',
				'key': 'style',
				'name': 'style',
				'value': this.style.toString()
			});
		})
	}
}

// Could extend Data_Model or Data_Value???

class Control_DOM extends Evented_Class {
	constructor() {
		super();
		var dom_attributes = new DOM_Attributes();
		var attrs = this.attrs = this.attributes = new Proxy(dom_attributes, {
			'set': (target, property, value, receiver) => {
				if (property === 'style') {
					var t_value = tof(value);
					if (t_value === 'string') {
						var s_values = value.trim().split(';');
						var kv;
						each(s_values, (s_value) => {
							kv = s_value.split(':');
							if (kv.length === 2) {
								kv[0] = kv[0].trim();
								kv[1] = kv[1].trim();
								target.style[kv[0]] = kv[1];
							}
						});
						dom_attributes.raise('change', {
							'property': property
						});
					}
				} else {
					var old_value = target[property];
					target[property] = value;
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
				return target[property];
			}
		});
	}
}


// Part of the .view.ui I suppose.
// view.data and view.ui may be all that's needed in .view directly.

// ctrl.view.ui.background = ...


// ctrl.background = ... and it sets it within the ctrl.view.ui.background
//  or even ctrl.view.ui.data.model.background ???
//    could make it very wordy at that level but allow shortcuts.
//    eg setting the ctrl.background or ctrl.view.ui.background sets the above property.

// Does seem somewhat important as the controls could be representing data in different kinds of ways and at different kinds of levels.




// Looks like it would fit in with Data_Model.

class Control_Background extends Evented_Class {
	constructor(spec = {}) {
		super(spec);
		let _color, _opacity;
		Object.defineProperty(this, 'color', {
			get() {
				return _color;
			},
			set(value) {
				const old = _color;
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
	set(val) {}
}

// Control_Background - maybe make it part of the Data_Model and Data_Type system.

// There is a very large amount built on top of the current Data_Object.
//   It would prove somewhat tricky making a new Data_Object based on Data_Value or similar.
//   Possibly Data_Value while in 'object' mode. It's still a value of some sorts, and may be best
//     to do away with the distinction but keep them compatable.

// May be worth keeping different implementations of Control available for comparison.

// Could make and try different implementations of Control_Core.
//   Could carefully first make some changes to this current verson....
//   And run the benchmark too.




class Control_Core extends Data_Object {
	constructor(spec = {}, fields) {
		spec.__type_name = spec.__type_name || 'control';
		super(spec, fields);
		if (spec.id) {
			this.__id = spec.id;
		}
		if (spec.__id) {
			this.__id = spec.__id;
		}
		this.mapListeners = {};
		this.__type = 'control';
		var spec_content;
		let d = this.dom = new Control_DOM();

		// OK, so prop actually is used effectively somewhere???

		// .view.ui.background or .view.ui.data.model.background.
		//   

		// data model to dom syncing...?

		// The various .view.ui.data.model properties.
		//  Though there will likely be more.

		// Putting them within .view.ui.data.model could make sense for now.
		//  Later on could do some kind of view.ui.data.stream_to(something) for example.


		// Maybe have a UI_View_Control???
		// Data_View_UI_Control???

		// Do need things like the .view.ui.compositional.data.model
		//   Though want to avoid having to write them out too many times.

		







		prop(this, 'background', new Control_Background(), (e_change) => {
			//console.log('background change');
			// The background object itself has been changed.
			let {
				value
			} = e_change;


			// When the background gets changed?
			// When the change happens to the background...?


			/*
			value.on('change', evt => {
				if (evt.name === 'color') {
					d.attributes.style['background-color'] = evt.value;
				}
			});
			*/
		});

		// Maybe background could operate with a better facade pattern over CSS.
		// . A CSS Facade mixin may work well...
		// . Main priority to get API working.



		this.background.on('change', evt => {
			if (evt.name === 'color') {
				d.attributes.style['background-color'] = evt.value;
			}
		});

		prop(this, 'disabled', false);
		prop(this, 'size', spec.size, (e_change) => {
			let {
				value,
				old
			} = e_change;
			let [width, height] = value;
			const s = this.dom.attrs.style;
			s.width = width;
			s.height = height;
			this.raise('resize', {
				'value': value
			});
		});

		// OK, so this does have a 'pos' property, and should respect spec.pos.

		// Possibly 'pos' should be more flexible and advanced.
		//.  Have a simple interface to call, but take account of positions being set with translate3d properties of controls,
		//.    and including such properties in typed arrays.
		//   May want to be aware of different ways to position in CSS, but keep the 'pos' property simpler than all that
		//.    where possible, and be able to deal with the different ways controls can be positioned on a lower level.



		// Could model both left and top, as well as translate3d properties.
		//.  Or could have other parts of the system that use t3d positions make use of left and top css, as well as translate3d

		// Does seem worth it to bring more awareness of this functionality to a lower level, making it easy to avoid it being a problem
		//.  but also easy to get and set the positions (and sizes) of controls.

		// May be worth taking account of this in some Window code.
		//. Like glide_to_pos perhaps.

		// A more complex positioning API would help.
		//. But maybe adjusting some translations by the left and top position could help.

		// Maybe it could intelligently combine t3dpos and ltpos?


		// Would be nice in some ways to keep this simple / backwards compatable.

		// But maybe this is really ltpos, pos is somewhat more complex?


		// yes, this should most likely go in the .view
		//  or even .view.ui.data.model.pos

		// It's not the .view.data.model here....


		// But the UI data model.
		//   May make sense to consider it 'UI data'.

		// or ui.data.model even.
		// though can refer to it as ctrl.ui.pos, and also ctrl.pos, though the coding will make it clear that it's not part of
		//  the data.model or view.data.model, so when accessing the ctrl.data.model we know exactly what we are getting.


		// So putting some properties deeper into the system would help.
		//   A data model could possibly have a .pos property, so want to allow for that.


		// The .view.ui.data.model seems a bit more of a difficult abstraction to make....

		// .model would help to keep the data model itself enclosed.

		// .data.sync(data) could be another thing within .data.
		//   keeping properties like .sync available for other uses within the .model.




		// .data.model may be a useful standard here for the moment.









		prop(this, 'pos', undefined, (e_change) => {
			let {
				value,
				old
			} = e_change;
			if (value.length === 2) {

				/*
				if (old && old.length === 3) {
					value = [value[0], value[1], old[2]];
					this.pos = value;
				}
				*/

			}
			let [left, top] = value;

			// This could possibly set translate3d properties.

			let o_style = {
				'left': left,
				'top': top
			}
			this.style(o_style);


			this.raise('move', {
				'value': value
			});
		});



		if (spec.pos) this.pos = spec.pos;
		//. Also need to read the 'pos' from the (inline?) css on activation.



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
		d.tagName = tagName;
		var content = this.content = new Collection({});
		spec_content = spec.content;
		if (spec_content) {
			var tsc = tof(spec_content);
			if (tsc === 'array') {
				each(spec.content, item => {
					content.add(item);
				})
			} else if (tsc === 'string' || tsc === 'control') {
				content.add(spec_content);
			}
		}
		if (spec.el) {
			d.el = spec.el;
			if (spec.el.tagName) d.tagName = spec.el.tagName.toLowerCase();
		}
		var context = this.context || spec.context;
		if (context) {
			if (context.register_control) context.register_control(this);
		} else {}
		if (spec['class']) {
			this.add_class(spec['class']);
		}
		if (spec.hide) {
			this.hide();
		}
		if (spec.add) {
			this.add(spec.add);
		}
		if (spec.attrs) {
			this.dom.attributes = spec.attrs;
		}
	}
	get left() {
		

		// Though making use of translate3d would be good too.
		//.  Looks like this actually needs to make use of the .ta[6] .ta[7] properties as well.
		//.  Include both of them in the calculation.



		//return this.pos[0];

		// Checking if we have that dom.attributes.style.left???


		const sl = this.dom.attributes.style.left;
		if (sl) {
			return parseInt(sl) + this.ta[6];
		}


		
	}
	get top() {
		//return this.pos[1];
		const st = this.dom.attributes.style.top;
		if (st) {
			return parseInt(st) + this.ta[7];
		}
		
	}

	// and then setting the top...?
	//.  should take account of the existing style property value, and make any adjustment using the t3d ta system.
	//.    maybe not using translate3d by default? Not sure....
	
	set top(value) {
		// Make the modification using t3d (as well?)

		if (typeof value === 'number') {
			const measured_current_top = this.top;
			const diff = Math.round(value - measured_current_top);
			// round to an int....
			this.ta[7] += diff;


		}

	}



	// And setters for them too....
	//.  could even implement this with margin?
	//.    .margin.top may be a good interface for this.




	'hide'() {
		let e = {
			cancelDefault: false
		}
		this.raise('hide', e)
		if (!e.cancelDefault) {
			this.add_class('hidden');
		}
	}
	'show'() {
		let e = {
			cancelDefault: false
		}
		this.raise('show', e);
		if (!e.cancelDefault) {
			this.remove_class('hidden');
		}
	}
	get html() {
		return this.all_html_render();
	}
	get internal_relative_div() {
		return this._internal_relative_div || false;
	}
	set internal_relative_div(value) {
		var old_value = this._internal_relative_div;
		this._internal_relative_div = value;
		if (value === true) {}
	}
	get color() {
		return this.background.color;
	}
	set color(value) {
		this.background.color = value;
	}
	'post_init'(spec) {
		if (spec && spec.id === true) {
			this.dom.attrs.id = this._id();
		}
	}
	'has'(item_name) {
		var arr = item_name.split('.');
		var c = 0,
			l = arr.length;
		var i = this;
		var s;
		while (c < l) {
			s = arr[c];
			if (typeof i[s] == 'undefined') {
				return false;
			}
			i = i[s];
			c++;
		};
		return i;
	}
	'renderDomAttributes'() {
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
				if (scf.length > 2) {
					dom_attrs['data-jsgui-ctrl-fields'] = scf;
				}
			}
			if (this._fields) {
				let sf = stringify(this._fields).replace(/"/g, "'");
				if (sf.length > 2) {
					dom_attrs['data-jsgui-fields'] = sf;
				}
			}
			var arr = [];

			const id = this._id();
			if (id !== undefined) {
				arr.push(' data-jsgui-id="' + this._id() + '"');
			}


			const exempt_types = {
				html: true,
				head: true,
				body: true
			}
			if (this.context && this.__type_name) {
				if (!exempt_types[this.__type_name] && this.__type_name !== undefined) {
					arr.push(' data-jsgui-type="' + this.__type_name + '"');
				}
			}
			var dom_attrs_keys = Object.keys(dom_attrs);
			var key, item;
			for (var c = 0, l = dom_attrs_keys.length; c < l; c++) {
				key = dom_attrs_keys[c];
				if (key == '_bound_events') {} else if (key === 'style') {
					item = dom_attrs[key];
					if (typeof item !== 'function') {
						if (typeof item === 'object') {
							if (key === 'style') {
								const sprops = [];
								each(item, (v, k) => {
									const tval = typeof v;
									if (tval !== 'function') {
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
					if (item && item.toString) {
						arr.push(' ', key, '="', item.toString(), '"');
					}
				}
			}
			return arr.join('');
		}
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
	'renderEmptyNodeJqo'() {
		return [this.renderBeginTagToHtml(), this.renderEndTagToHtml(), this.renderHtmlAppendment()].join('');
	}
	'register_this_and_subcontrols'() {
		const context = this.context;
		this.iterate_this_and_subcontrols((ctrl) => {
			context.register_control(ctrl);
		});
	}
	'iterate_subcontrols'(ctrl_callback) {
		const content = this.content;
		content.each(v => {
			ctrl_callback(v);
			if (v && v.iterate_subcontrols) {
				v.iterate_subcontrols(ctrl_callback);
			}
		});
	}
	'iterate_this_and_subcontrols'(ctrl_callback) {
		ctrl_callback(this);
		const content = this.content;
		let tv;

		if (typeof content !== 'string') {
			content.each(v => {
				tv = tof(v);
				if (tv == 'string') {} else if (tv == 'data_value') {} else {
					if (v && v.iterate_this_and_subcontrols) {
						v.iterate_this_and_subcontrols(ctrl_callback);
					}
				}
			});
		}

		
	}
	'all_html_render'(callback) {
		// Should consider promises here too.
		if (callback) {
			var arr_waiting_controls = [];
			this.iterate_this_and_subcontrols((control) => {
				if (control.__status == 'waiting') arr_waiting_controls.push(control);
			});
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

		if (tof(content) === 'string') {
			return content;
		} else {
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
				}
			}
			return res.join('');
		}

		
	}
	'all_html_render_internal_controls'() {
		return this.render_content();
	}
	'render'() {
		return this.all_html_render(); // No callback, sync render only. Await readiness some other way.
	}
	'pre_all_html_render'() {}
	'compose'() {}
	'visible'(callback) {
		this.style('display', 'block', callback);
	}
	'transparent'(callback) {
		this.style('opacity', 0, callback);
	}
	'opaque'(callback) {
		return this.style({
			'opacity': 1
		}, callback);
	}
	'remove'() {

		// Seems like collection is not working properly is remove is not working properly.

		// .remove(this) should be an easy call. It would then need to note that it has been removed with the event(s).

		return this.parent.content.remove(this);
	}
	'add'(new_content) {
		const tnc = tof(new_content);
		let res;
		if (tnc === 'array') {
			let res = [];
			each(new_content, (v) => {
				res.push(this.add(v));
			});
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
		const target_index = target._index;
		const content = target_parent.content;
		content.insert(this, target_index);
	}
	'style'() {
		const a = arguments,
			sig = get_a_sig(a, 1), d = this.dom,
			da = d.attrs;
		a.l = a.length;
		let style_name, style_value, modify_dom = true;
		if (sig == '[s]') {
			style_name = a[0];
			// Maybe don't have the element
			// . Better to run some tests / checks
			const res = getComputedStyle(d.el)[style_name];
			return res;
		} else if (sig == '[s,s,b]') {
			[style_name, style_value, modify_dom] = a;
		} else if (sig == '[s,s]' || sig == '[s,n]') {
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
			} else {}
		}
		if (sig == '[o]') {
			each(a[0], (v, i) => {
				this.style(i, v);
			});
		}
	}
	'active'() {}
	'find_selection_scope'() {
		var res = this.selection_scope;
		if (res) return res;
		if (this.parent && this.parent.find_selection_scope) return this.parent.find_selection_scope();
	}
	'click'(handler) {
		this.on('click', handler);
	}
	'add_class'(class_name) {
		let da = this.dom.attrs,
			cls = da['class'];
		if (!cls) {
			da['class'] = class_name;
		} else {
			const tCls = tof(cls);
			if (tCls == 'object') {
				throw 'removed';
			} else if (tCls == 'string') {
				let arr_classes = cls.split(' '),
					already_has_class = false,
					l = arr_classes.length,
					c = 0;
				while (c < l && !already_has_class) {
					if (arr_classes[c] === class_name) {
						already_has_class = true;
					}
					c++;
				}
				if (!already_has_class) {
					arr_classes.push(class_name);
				}
				da['class'] = arr_classes.join(' ');
			}
		}
	}
	'has_class'(class_name) {
		let da = this.dom.attrs,
			cls = da['class'];
		if (cls) {
			var tCls = tof(cls);
			if (tCls == 'object') {
				throw 'removed';
			}
			if (tCls == 'string') {
				var arr_classes = cls.split(' ');
				var arr_res = [];
				var l = arr_classes.length,
					c = 0;
				while (c < l) {
					if (arr_classes[c] === class_name) {
						return true;
					}
					c++;
				}
			}
		}
	}
	'remove_class'(class_name) {
		let da = this.dom.attrs,
			cls = da['class'];
		if (cls) {
			var tCls = tof(cls);
			if (tCls == 'object') {
				throw 'removed';
			}
			if (tCls == 'string') {
				var arr_classes = cls.split(' ');
				var arr_res = [];
				var l = arr_classes.length,
					c = 0;
				while (c < l) {
					if (arr_classes[c] != class_name) {
						arr_res.push(arr_classes[c]);
					}
					c++;
				}
				da['class'] = arr_res.join(' ');
			}
		}
	}
	
	'is_ancestor_of'(target) {
		var t_target = tof(target);
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
			if (t_target === 'control') {}
		}
	}
	'find_selected_ancestor_in_scope'() {
		var s = this.selection_scope;
		var ps = this.parent.selection_scope;
		if (s === ps) {
			var psel = this.parent.selected;
			if (psel && psel.value && psel.value() == true) {
				return this.parent;
			} else {
				return this.parent.find_selected_ancestor_in_scope();
			}
		}
	}
	'closest'(match) {
		let tmatch = tof(match);
		if (tmatch === 'string') {}
		if (tmatch === 'function') {
			let search = (ctrl) => {
				if (match(ctrl)) {
					return ctrl;
				} else {
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
		var res = new Control({
			'context': this.context
		});
		var da = this.dom.attributes;
		var cl = da.class;
		var map_class_exclude = {
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

	// a function
	'matches_selector'(selector) {
		throw 'NYI'
		// maybe the same as '$match'?

		// or $find.

	}

	'find'(selector) { // or selector?
		// Prob best to do rec desc here.
		// . Assemble an array.

		const res = [];

		const desc = (node, callback) => {
			if (node.$match(selector)) {
				callback(node);
			}
			node.content.each(child => {
				desc(child, callback);
			})
		}

		desc(this, (node => res.push(node)));

		return res;
	}

	// Only for matching classes right now.
	// . I think accepting a function may work better, or be a decent alternative. Or an object (Control) type even.
	'$match'(selector) {

		if (typeof selector === 'function') {
			return selector(this);
		} else {
			let parse_word = word => {
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
			
		}

		
		let res = false;
		let tn = this.__type_name;
		if (tn) {
			if (tn === selector) res = true;
		}
		return res;
	}
	'$'(selector, handler) {
		let match = this.$match(selector);
		let res = [];
		if (match) {
			if (handler) handler(this);
			res.push(this)
		}
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
	'activate'() {}
	get this_and_descendents() {
		const res = [];
		this.iterate_this_and_subcontrols(ctrl => res.push(ctrl));
		return res;
	}
	get descendents() {
		const res = [];
		this.iterate_subcontrols(ctrl => res.push(ctrl));
		return res;
	}

	get siblings() {
		const res = [];
		if (this.parent) {
			const _ = this.parent.content._arr;
			_.forEach(x => {
				if (x !== this) res.push(x);
			})
		}
		return res;
	}

};
var p = Control_Core.prototype;
p.connect_fields = true;
const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

if (jsgui.custom_rendering === 'very-simple') {
	p[customInspectSymbol] = function(depth, inspectOptions, inspect) {
		// Convert the object to a string and add some formatting
		//return JSON.stringify(this, null, 2);

		return '< ' + this.dom.tagName + ' ' + this.__type_name +  ' >'
	};
}




module.exports = Control_Core;

if (require.main === module) {

	// May be a better syntax to accept attributes like this?

	const Control = Control_Core;

	function test_svg() {
		const passed = [];
		const failed = [];
		let svg;
		try {
			// Create a new SVG control
			svg = new Control({
				tagName: 'svg'
			});
			passed.push('Create SVG control');
		} catch (error) {
			failed.push('Create SVG control');
		}

		try {
			// Add a circle to the SVG control
			const circle = new Control({
				tagName: 'circle',
				attrs: {
					cx: 100,
					cy: 100,
					r: 50
				}
			});
			svg.add(circle);
			passed.push('Add circle to SVG control');
		} catch (error) {
			console.log('error', error);
			failed.push('Add circle to SVG control');
		}

		try {
			// Add a rectangle to the SVG control
			const rect = new Control({
				tagName: 'rect',
				attrs: {
					x: 150,
					y: 150,
					width: 100,
					height: 100
				}
			});
			svg.add(rect);
			passed.push('Add rectangle to SVG control');
		} catch (error) {
			console.log('error', error);
			failed.push('Add rectangle to SVG control');
		}

		try {
			// Check the rendering of the SVG control
			const expected = '<svg><circle cx="100" cy="100" r="50"></circle><rect x="150" y="150" width="100" height="100"></rect></svg>';
			const actual = svg.all_html_render();
			console.log('actual', actual);
			if (expected === actual) {
				passed.push('Check rendering of SVG control');
			} else {
				failed.push('Check rendering of SVG control');
			}
		} catch (error) {
			console.log('error', error);
			failed.push('Check rendering of SVG control');
		}

		return {
			passed,
			failed
		};
	}
	console.log(test_svg()); // prints the results of the test

	const test_background_color = () => {
		const expectedColor = '#ff0000';
		const passed = [];
		const failed = [];
		let div;

		try {
			// Create a new div control
			div = new Control({
				tagName: 'div',
			});
			passed.push('Create div control');
		} catch (error) {
			failed.push(['Create div control', error]);
		}

		try {
			// Set the background color of the div control
			div.background.color = expectedColor;
			passed.push('Set background color of div control');
		} catch (error) {
			failed.push(['Set background color of div control', error]);
		}

		try {
			// Validate the background color of the div control
			const validationColor = div.background.color;
			if (validationColor === expectedColor) {
				passed.push('Validate background color of div control');
			} else {
				failed.push(['Validate background color of div control', 'Background color is not as expected']);
			}
		} catch (error) {
			failed.push(['Validate background color of div control', error]);
		}

		try {
			// Check the rendering of the div control
			const expected = `<div style="background-color:${expectedColor}"></div>`;
			const actual = div.all_html_render();
			if (expected === actual) {
				passed.push('Check rendering of div control');
			} else {
				failed.push(['Check rendering of div control', 'Rendering does not match expected output', {
					expected,
					actual
				}]);
			}
		} catch (error) {
			failed.push(['Check rendering of div control', error]);
		}

		return {
			passed,
			failed,
		};
	};

	// Being able to recurse through a structure of controls would be interesting / useful.
	//  Improving the 'match' function would help.
	// . Worth having tests for its current functionality though.


	//console.log(JSON.stringify(test_background_color()), null, 2);
	const rtest = test_background_color();
	console.log(rtest);
	console.log(rtest.failed);

}