const jsgui = require('../../../../../html-core/html-core');
const Menu_Node = require('./Menu_Node');
const { each, tof } = jsgui;
const Control = jsgui.Control;
const { themeable } = require('../../../../../control_mixins/themeable');
const { apply_token_map } = require('../../../../../themes/token_maps');

/**
 * Context Menu Control
 * 
 * A popup menu that appears on right-click or context trigger.
 * 
 * Supports variants: default, compact, dark
 * 
 * @example
 * // Object-based menu
 * new Context_Menu({ 
 *     value: { 'Cut': fn, 'Copy': fn, 'Paste': fn } 
 * });
 * 
 * // Array-based menu
 * new Context_Menu({ 
 *     value: [['Cut', fn], ['Copy', fn]] 
 * });
 */
class Context_Menu extends Control {
	constructor(spec, add, make) {
		super(spec);
		this.__type_name = 'context_menu';

		// Apply themeable - resolves params and applies hooks
		const params = themeable(this, 'context_menu', spec);

		// Apply token mappings
		apply_token_map(this, 'menu', params);

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

		this._features = this._features || [];
		this._features.push('menu');

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