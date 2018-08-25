// object viewer
var jsgui = require('../../html-core/html-core');
var Object_KVP_Viewer = require('./object-kvp');
var factory = require('./factory');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;

// The Object KVP will need to use the factory.
//  Maybe the factory will need to be side-loaded?
//   Or the factory can handle side-loading itself?
//    That may be easier in order to keep the sideloading in one module.
//     Then could better encapsulate / modularise the sideloading.
//     And remove it for deployement.W

// This will need to side-load other references.
//  Not sure exactly when is best to do that.
//  Hopefully it can be done inside the module, loaded as the module loads?
//  Or does it need to be the first time such an object is used?

// Maybe make this an Array_Viewer too?
class Object_Viewer extends Control {
	// Maybe should put this into a form, so that it does a form post.
	//  That could possibly be disabled.

	constructor(spec) {
		
		super(spec);
		var make = this.make;
		if (!this.factory) this.factory = factory;
		this.add_class('object-viewer');
		this.__type_name = 'object_viewer';
		var req = this.context.req;

		if (is_defined(spec.value)) {
			// Does that value become a data object?
			//  Want to listen to change events on it.
			//this.set('value', spec.value);
			this.value = spec.value;
		}

		if (!spec.el) {
			var ctrlOpen = new Control({
				'context': this.context
			})
			ctrlOpen.add_class('object-open');
			// Want to make it send the controls ids in the html.
			// Sending over the IDs of controls that gets activated seems important.
			//  Not in all cases, but in cases where controls need to interact with each other.
			//  Possibly for internal interaction.
			//ctrlOpen.set('dom.attributes.
			ctrlOpen.content.add('{');
			var ctrlOpenID = ctrlOpen._id();
			var ctrlInner = new Control({
				'context': this.context
			})
			ctrlInner.add_class('object-inner');
			var ctrlClose = new Control({
				'context': this.context
			})
			ctrlClose.add_class('object-close');
			ctrlClose.content.add('}');
			var ctrlCloseID = ctrlClose._id();
			this.add(ctrlOpen);
			this.add(ctrlInner);
			this.add(ctrlClose);
			this.inner = ctrlInner;
			// Calling this a 'change' event now.
			var ctrl_fields = {
				'open': ctrlOpenID,
				'close': ctrlCloseID,
				'inner': ctrlInner._id()
			}
			// use different quotes...
			this.set('dom.attributes.data-jsgui-ctrl-fields', stringify(ctrl_fields).replace(/"/g, "'"));
			this.refresh_internal();
		}
		var that = this;
	}
	'refresh_internal'() {
		var value = this.value;
		var inner = this.inner;
		//console.log('object viewer refresh_internal ');
		//console.log('value ' + stringify(value));
		inner.clear();
		//console.log('value ' + tof(value));
		// may need to clear the internal controls... seems likely on the client.
		//  could possibly go through the internal controls making small changes....
		// maybe will do this by making granular changes.
		var context = this._context;
		var that = this;
		var first = true;
		var prev_kvp;
		// In activation will need to go through the comma controls again.

		each(value, function(v, i) {
			// need to show the keys...
			if (!first) {
				var comma = new jsgui.span({
					'context': context
				})
				comma.content.push(',');

				prev_kvp.content.push(comma);
				//inner.add(comma);
			}
			// and want it so that we can either get the kvp viewer or editor.
			//  This needs to be overridable in a subclass.
			// .Object_KVP
			//  viewer or editor.
			//var kvp_viewer = new Object_KVP_Viewer({
			var kvp_viewer = new Object_KVP_Viewer({
				'context': context,
				'key': i,
				'value': v
			})
			var cInternal = that.factory(v, context);
			inner.add(kvp_viewer);
			first = false;
			prev_kvp = kvp_viewer;
		});
	}
	// Could put this in control or enhanced control?

	'activate'() {
		//console.log('activate Object_Viewer');
		super.activate();
		var ctrl_open = this.open;
		var ctrl_close = this.close;
		var ctrl_inner = this.inner;
		// Very nice to have this so concise now.
		var hover_class = 'bg-light-yellow';
		var group_open_close = jsgui.group_hover_class([ctrl_open, ctrl_close], hover_class);
		var that = this;
		// then for clicking on either the open or the close tag, should do the select actions for a selectable.

		group_open_close.selectable(this);
		var prev_comma;
		ctrl_inner.content.each(function(ctrl_kvp, i) {
			// Not the inner content...
			//  The inner content
			var ckvp = ctrl_kvp.content;
			//console.log('ckvp.length ' + ckvp.length());

			if (prev_comma) {
				prev_comma.click(function(e) {
					// can we find out which character was clicked?
					ctrl_kvp.action_select_only();
				})
			}

			if (ckvp.length() == 3) {
				var comma = ckvp.get(2);
				prev_comma = comma;
			}
		});
		this.on('change', function(e_change) {
			//console.log('object viewer change');
			// rerender the html!!!
			that.refresh_internal();

		});
		console.log('this._bound_events', this._bound_events);
	}
}
module.exports = Object_Viewer;