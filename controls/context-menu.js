var jsgui = require('../html-core/html-core');
var Menu_Node = require('./menu-node');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;

class Context_Menu extends Control {
	constructor(spec, add, make) {
		super(spec);

		this.__type_name = 'context_menu';

		//this.add_class('context menu');
		this.add_class('context menu');

		console.log('Context_Menu init spec.el', spec.el);
		if (!spec.abstract) {

			var obj = spec.value;

			console.log('menu obj', obj);

			// Create the menu nodes from it.
			var that = this;

			var tobj = tof(obj);
			//console.log('tobj', tobj);
			if (tobj == 'object') {
				each(obj, function (v, key) {
					var menu_node = make(Menu_Node({
						'text': key,
						'value': v,
						'menu': that
					}))
					that.add(menu_node);

				})

			}
			if (tobj == 'array') {
				each(obj, function (v, index) {

					var tv = tof(v);
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
							'menu': that
						}))
						that.add(menu_node);
					}
				})
			}
		}

	}
	'activate'() {
		//console.log('pre super this._.content._arr.length ' + this._.content._arr.length);
		// So it seems the problem lies within the activate function.
		super.activate();
		//var body = this.context.body;
		//var that = this;
		//var nodes = this.descendants('menu_node');

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