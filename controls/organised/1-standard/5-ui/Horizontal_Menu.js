// object viewer

/*
 if (typeof define !== 'function') { var define = require('amdefine')(module) }

 // html-enh depending on Context_Menu?



 define(["../../jsgui-html", "./menu-node"],
 function(jsgui, Menu_Node) {

 */

// 2022 - Good candidate for deprecation - use Menu with display mode options.
//   Can choose various things to do with appearance using .view

var jsgui = require('../../../../html-core/html-core');
var Menu_Node = require('../../0-core/0-basic/1-compositional/menu-node');
const keyboard_navigation = require('../../../../control_mixins/keyboard_navigation');
const {
	apply_label,
	apply_role
} = require('../../../../control_mixins/a11y');
const { themeable } = require('../../../../control_mixins/themeable');
const { apply_token_map } = require('../../../../themes/token_maps');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;

var group = jsgui.group;

/**
 * Horizontal Menu Control
 * 
 * A horizontal navigation menu bar.
 * 
 * Supports variants: default, vertical, compact, divided, pills, icon
 * 
 * @example
 * // Default menu
 * new Horizontal_Menu({ value: { File: {}, Edit: {}, View: {} } });
 * 
 * // Compact menu
 * new Horizontal_Menu({ variant: 'compact', value: { Home: {}, About: {} } });
 */
class Horizontal_Menu extends Control {

	// could have a title field.
	//'fields': {
	//	'title': String
	//}

	// maybe add before make would be better. add will probably be used more.
	constructor(spec, add, make) {
		super(spec);
		this.__type_name = 'horizontal_menu';

		// Apply themeable - resolves params and applies hooks
		const params = themeable(this, 'horizontal_menu', spec);

		// Apply token mappings (size -> CSS variables)
		apply_token_map(this, 'menu', params);

		this.dom.attrs.class = 'horizontal menu';
		this.aria_label = spec.aria_label;
		apply_role(this, 'menubar');
		if (this.aria_label !== undefined) {
			apply_label(this, this.aria_label);
		}
		if (!spec.abstract && !spec.el) {
			var obj = spec.value;
			//var that = this;
			var tobj = tof(obj);
			if (tobj == 'object') {
				each(obj, (v, key) => {
					var menu_node = new Menu_Node({
						'context': this.context,
						'text': key,
						'value': v,
						'menu': this
					});
					this.add(menu_node);
				})
			}
		}
	}
	'activate'() {
		// May need to register Flexiboard in some way on the client.

		if (!this.__active) {
			super.activate();
			const get_menu_nodes = () => {
				const nodes = [];
				this.content.each((ctrl) => {
					if (ctrl && ctrl.__type_name === 'menu_node') nodes.push(ctrl);
				});
				return nodes;
			};
			const get_menu_items = () => get_menu_nodes().map(node => node.main_control || node);
			const set_active_index = (next_index) => {
				const menu_nodes = get_menu_nodes();
				if (!menu_nodes.length) return;
				const clamped = Math.max(0, Math.min(next_index, menu_nodes.length - 1));
				this.active_index = clamped;
				const menu_items = get_menu_items();
				menu_items.forEach((item, idx) => {
					if (item && item.dom) {
						item.dom.attributes = item.dom.attributes || {};
						item.dom.attributes.tabindex = idx === clamped ? '0' : '-1';
					}
				});
			};
			set_active_index(0);
			keyboard_navigation(this, {
				orientation: 'horizontal',
				roving_tabindex: true,
				focus_item: true,
				get_items: () => get_menu_items(),
				get_active_index: () => this.active_index,
				set_active_index,
				on_activate: () => {
					const menu_nodes = get_menu_nodes();
					const active_node = menu_nodes[this.active_index];
					if (active_node && active_node.open) active_node.open();
				},
				on_down: () => {
					const menu_nodes = get_menu_nodes();
					const active_node = menu_nodes[this.active_index];
					if (active_node && active_node.open) active_node.open();
				}
			});

			//console.log('activate Horizontal_Menu');
			// While it is open, clicking outside of the menu should close it.
			// Something for opening the menu.
			//  Need to respond to a click on a (root) node.
			// Want a quick way to get all controls of a certain type inside.
			//  eg this.find(':horizontal_menu')
			//  this.children(':horizontal_menu')
			// this.matches_selector(':horizontal_menu');
			// Needs to have various states
			//  Different parts of it can be open, closed.

			// On click, want to see if any of the nodes are open.
			//  I think being able to do some kind of selector / query that gets a group of controls would be very helpful here.

			// this.children(':menu_node[open]')
			//  Some kind of notation like that to find any open menu nodes.
			// The menu items should have 'state' properties
			var last_clicked;
			this.content.each((v, i) => {
				v.on('click', e_click => {
					//console.log('menu item clicked');

					// if it is already open?
					var v_state = v.state;
					//console.log('v_state', v_state);

					// Don't open if we are reclicking on the same menu item?
					//if (last_clicked !== v) {
					v.open();
					// And mousedown anywhere (else) to close.
					//console.log('pre setup one mousedown anywhere');
					// mousedown anywhere else?

					v.one_mousedown_anywhere(function (e_mousedown) {
						//console.log('e_mousedown.within_this ' + e_mousedown.within_this);
						if (!e_mousedown.within_this) {
							v.close();
							//
						} else {

						}
					});
					//}

					//last_clicked = v;

				})

				v.on('mouseup', function (e_mouseup) {
					//setTimeout(function() {
					//	last_clicked = null;
					//}, 0);
				});
			});
		}
		//  could find controls with classes and tag names using css queries.
		//
	}
	'close_all'() {
		console.log('menu close_all');
		// need to do this recursively I think.
		//  could call this recursively on all nodes.
		this.content.each((v, i) => {
			//console.log('i', i);
			//console.log('v', v);
			v.close_all();
		});
	}
}

module.exports = Horizontal_Menu;
