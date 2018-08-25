// object viewer

/*
 if (typeof define !== 'function') { var define = require('amdefine')(module) }

 // html-enh depending on Context_Menu?



 define(["../../jsgui-html", "./menu-node"],
 function(jsgui, Menu_Node) {

 */
var jsgui = require('../html-core/html-core');
var Menu_Node = require('./menu-node');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;

var group = jsgui.group;

class Horizontal_Menu extends Control {

	// could have a title field.
	//'fields': {
	//	'title': String
	//},


	// maybe add before make would be better. add will probably be used more.
	constructor(spec, add, make) {
		super(spec);

		this.__type_name = 'horizontal_menu';

		this.dom.attrs.class = 'horizontal menu';

		if (!spec.abstract && !spec.el) {


			var obj = spec.value;

			//console.log('menu obj', obj);

			// Create the menu nodes from it.
			var that = this;

			var tobj = tof(obj);
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
		}
	}
	'activate'() {
		// May need to register Flexiboard in some way on the client.

		if (!this.__active) {
			super.activate();

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
			this.content.each(function (v, i) {
				v.on('click', function (e_click) {
					//console.log('menu item clicked');

					// if it is already open?
					var v_state = v.get('state');
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
		this.content.each(function (v, i) {
			//console.log('i', i);
			//console.log('v', v);
			v.close_all();
		});
	}
}

module.exports = Horizontal_Menu;
