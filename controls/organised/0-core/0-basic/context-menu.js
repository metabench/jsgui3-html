const jsgui = require('./../../../../html-core/html-core');
var Menu_Node = require('./menu-node');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;

// More advanced, but still comes as standard, basic in that way.

// May benefit from some kind of model overlay over the main part of the doc.

class Context_Menu extends Control {
	constructor(spec, add, make) {
		super(spec);

		this.__type_name = 'context_menu';

		//this.add_class('context menu');
		this.add_class('context menu');

		//console.log('Context_Menu init spec.el', spec.el);
		if (!spec.abstract) {

			const obj = spec.value;

			//console.log('menu obj', obj);

			// Create the menu nodes from it.
			//var that = this;

			const tobj = tof(obj);
			//console.log('tobj', tobj);
			if (tobj === 'object') {
				each(obj, (v, key) => {
					const menu_node = make(Menu_Node({
						'text': key,
						'value': v,
						'menu': this
					}))
					this.add(menu_node);
				})
			}

			// typed each
			//  would be useful with if statements and an item sig
			//  then also with mfp typed each!!! :)

			if (tobj === 'array') {
				each(obj, (v, index) => {

					//const tv = tof(v);
					//console.log('tv', tv);

					// then if it's string and function...

					var vsig = jsgui.get_item_sig(v, 1);
					//console.log('vsig', vsig);

					if (vsig == '[s,f]') {
						var text = v[0];
						var item_callback = v[1];

						var menu_node = make(Menu_Node({
							'text': text,
							'value': text,
							'menu': this
						}))
						this.add(menu_node);
					}
				})
			}
		}

		this._features = this._features || []; // an array is cool but map is better for testing for specific ones.
        each(['menu'], this._features.push);

	}
	'activate'() {
		//console.log('pre super this._.content._arr.length ' + this._.content._arr.length);
		// So it seems the problem lies within the activate function.
		super.activate();
		//var body = this.context.body;
		//var that = this;
		//var nodes = this.descendents('menu_node');

	}
	'close_all'() {
		console.log('menu close_all');
		// need to do this recursively I think.
		//  could call this recursively on all nodes.

		this.content.each(function (v, i) {
			v.close_all();
		});
	}
}

module.exports = Context_Menu;