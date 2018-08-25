//if (typeof define !== 'function') { var define = require('amdefine')(module) }

//define(["../../jsgui-html", "./plus-minus-toggle-button", "./vertical-expander"],
var jsgui = require('../html-core/html-core');
var Plus_Minus_Toggle_Button = require('./plus-minus-toggle-button');
var Vertical_Expander = require('./vertical-expander');

//function(jsgui, Plus_Minus_Toggle_Button, Vertical_Expander) {

var stringify = jsgui.stringify,
	each = jsgui.each,
	tof = jsgui.tof;
var Control = jsgui.Control;

// Maybe reture this old code.

// 'fields': [['name', 'string']],


// Item_View_Basic_Type
//  String or number

// Render the view according to a function?
//  Be able to display relatively simple items automatically.
//  A picture and a name.

// Want it so we can give Item_View a string and it allows that to be viewed.


// Item-View implies editing is less of an option than just with 'Item'

// Item_View_String
// Item_View_Number

// View modes would help.
//  String view mode.

// Expander inside being optional.
//  More full rendering mode inside the expander.

class Item_View extends Control {

	//'class_name': 'item-view',

	constructor(spec) {
		spec.__type_name = spec.__type_name || 'item_view';
		super(spec);

		// Want it so that the name field can be written during the initialization.
		//  Will depend on the chained fields.
		var that = this;


		// render_mode.

		this.is_expander = spec.is_expander || false;


		//let is_expander = this.expander = spec.expander;



		// Need item property / getter setter.
		//  When the item changes, we update the item in the view.
		//  More work on view modes perhaps.

		// Could possibly use some other controls and have a map of which to use for different item types.

		// item-view-string
		// item-view-named-obj
		// item-view-obj

		// For the moment, different rendering modes will be most appropriate.

		// So it updates the view differently depending on the rendering mode.


		// Need to respond to item changes.

		let _item;

		Object.defineProperty(this, 'item', {
			// Using shorthand method names (ES2015 feature).
			// This is equivalent to:
			// get: function() { return bValue; },
			// set: function(newValue) { bValue = newValue; },
			get() {
				return _item;
			},
			set(value) {
				_item = value;
				this.raise('change', {
					'name': 'item',
					'value': value
				})
			},
			enumerable: true,
			configurable: true
		});



		if (spec.item) {
			_item = spec.item;
		}


		//this.__type_name = 'item_view';


		if (!spec.el) {
			this.compose_item_view();
		}

		//var dom = this.get('dom');

		//dom.set('tagName', 'div');
		//dom.get('attributes').set('class', 'item');

		//this.active();

		//that.set('dom.attributes.data-jsgui-fields', stringify({
		//		'name': name
		//}).replace(/"/g, "[DBL_QT]").replace(/'/g, "[SNG_QT]"));


		// render_mode = 'simple', 'string', 'expander', others
		//  template rendering? react?


		this._fields = this._fields || {};
		if (this.name) this._fields['name'] = name;


		//  If the item is a more complex object?
		//   If the item is a string it's fine to set the item in the UI.

		// Other item types could have differnt types of item views.

		//if (this.item)

		// render_mode

		if (this.render_mode) this._fields['render_mode'] = this.render_mode;


		if (this.path) this._fields['path'] = this.path;
		if (this.is_expander) this._fields['is_expander'] = this.is_expander;


	}
	'compose_item_view' () {
		this.add_class('item item-view');
		//console.log('this.item', this.item);

		// The item's likely to have a name.
		//var content = this.content;
		// get the name from the spec?

		// and respond to the name being set?

		// expander = true

		if (this.is_expander) {
			var ctrl_expand_contract = new Plus_Minus_Toggle_Button({
				'context': this.context,
				'state': '+'
			});
			ctrl_expand_contract.active();
			//var cec_dom = ctrl_expand_contract.get('dom');
			this.set('expand_contract', ctrl_expand_contract);
			//cec_dom.set('tagName', 'div');
			//cec_dom.get('attributes').set('class', 'expansion button');
			this.add(ctrl_expand_contract);
		}



		//  More work on controls will help.
		//   Give them more convenient methods. Make them faster too.


		// or the name has been set by now and the span with the name can be created.

		// an icon, and the name next to it.

		var ctrl_icon = new Control({
			'context': this.context
		});
		//ctrl_icon.get('dom').set('tagName', 'div');
		//ctrl_icon.get('dom').get('attributes').set('class', 'icon');
		ctrl_icon.add_class('icon');

		this.add(ctrl_icon);


		// Does not necessarily need item info.
		//  Could just render the item as a string.
		// For an object with a few properties such as 'name' and 'info'.

		// When it's just a string, we just render it as a string.

		let t_item = tof(this.item);
		if (t_item === 'object') {
			var ctrl_item_info = new Control({
				'context': this.context
			});
			//ctrl_item_info.get('dom').set('tagName', 'div');
			//ctrl_item_info.get('dom').get('attributes').set('class', 'info');
			ctrl_item_info.add_class('info');
			this.add(ctrl_item_info);

			// then add a name control. this will have a text node inside.

			var ctrl_name = new Control({
				'context': this.context
			});
			//ctrl_name.get('dom').set('tagName', 'div');
			//ctrl_name.get('dom').get('attributes').set('class', 'name');
			ctrl_name.add_class('name');

			//var name = this.get('name').get();
			//var name = this.get('name');
			//console.log('name ' + stringify(name));

			//throw('stop');

			// Should be able to set the name, with the name as a Data_Value.

			var ctrl_tn_name = new jsgui.textNode({
				'text': this.name,
				'context': this.context
			});
			//ctrl_name.content.add(ctrl_tn_name);
			ctrl_name.add(ctrl_tn_name);
			ctrl_item_info.add(ctrl_name);
		}
		if (t_item === 'string' || t_item === 'number') {
			this.render_mode = 'string';
			let span = new jsgui.span({
				context: this.context,
				text: this.item
			});
			this.add(span);
		}
		/*
		var ctrl_clearall_0 = new Control({
			'context': this.context
		});
		//ctrl_clearall_0.get('dom').set('tagName', 'div');
		//ctrl_clearall_0.get('dom').get('attributes').set('class', 'clearall');
		ctrl_clearall_0.add_class('clearall');
		this.add(ctrl_clearall_0);
		*/

		// Need to render the item itself.
		// 

		if (this.is_expander) {
			var ctrl_subitems = new Control({
				'context': this.context
			});
			//ctrl_subitems.get('dom').set('tagName', 'div');
			//ctrl_subitems.get('dom').get('attributes').set('class', 'subitems');
			ctrl_subitems.add_class('subitems');

			this.add(ctrl_subitems);
			ctrl_subitems.active();

			this.set('ctrl_subitems', ctrl_subitems);
			this.ctrl_subitems = ctrl_subitems;
		}

		/*
		var ctrl_clearall = new Control({
			'context': this.context
		});
		//ctrl_clearall.get('dom').set('tagName', 'div');
		//ctrl_clearall.get('dom').get('attributes').set('class', 'clearall');
		ctrl_clearall.add_class('clearall');
		this.add(ctrl_clearall);
		*/
		//if (typeof document === 'undefined') {

	}

	'refresh_item_view' () {
		//console.log('refresh_item_view');

		let render_mode = this.render_mode;
		//console.log('render_mode', render_mode);

		if (render_mode === 'string') {
			// find the span.
			// this.$('span')[0].text = this.item;
			// Definitely need a better way to query for content.
			//  $ to start with could just get by __type_name

			// Definitely need better finding / querying.

			let ctrl_span = this.$('span')[0];
			//console.log('ctrl_span', ctrl_span);

			ctrl_span.text = this.item;
		}
		

	}

	'activate' () {
		if (!this.__active) {
			super.activate();

			this.on('change', evt => {
				if (evt.name === 'item') {
					let new_item = evt.value;
					this.refresh_item_view();
				}
			})

			if (this.is_expander) {
				var expand_contract = this.expand_contract;
				//console.log('expand_contract', expand_contract);
				// When a control is added to the DOM, it as well as its subcontrols should be automatically activated, with the various controls
				//  registered with the jsgui.map_controls.
				//expand_contract.activate();

				expand_contract.on('change', e_change => {
					//console.log('e_change', e_change);

					if (e_change.name === 'state') {
						//e_change.value;

						//console.log('e_change.value', e_change.value);

						if (e_change.value === '-') {
							this.trigger('expand');
						}
						if (e_change.value === '+') {
							this.trigger('contract');
						}
						//}
						//span_state.clear();
						//span_state.add(e_change.value);
					}
				});
			}


		}
	}
};
//	return Item_View;
//});

module.exports = Item_View;