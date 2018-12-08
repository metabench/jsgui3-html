var jsgui = require('../lang/lang');
var each = jsgui.each;
var tof = jsgui.tof;
const Control = require('./control');

class Selection_Scope extends jsgui.Data_Object {
	//var Selection_Scope = jsgui.Class.extend({
	constructor(spec) {
		super(spec);
		if (spec.context) this.context = spec.context;
		if (typeof spec.id !== 'undefined') this.id = spec.id;
		if (spec.ctrl) this.control = spec.ctrl;
		if (spec.control) this.control = spec.control;
		// Needs to be a list / map of all controls that are selected.
		// map of selected controls by id?
		//  also need to be able to go through the list of controls.
		this.map_selected_controls = {};
		// set the items by their id to point to the control.
		//  the control will know its index within its parent, can look up more info there.
	}
	'select_only'(ctrl) {
		var currently_selected;
		var count_deselected = 0;

		var selected;
		//console.log('select_only this.map_selected_controls', this.map_selected_controls);
		each(this.map_selected_controls, (v, i) => {
			// Don't want to select the selection scope itself.
			if (v && v !== ctrl && v !== this.control) {
				if (v.selected) {
					v.selected = false;
					count_deselected++;
				}
				//console.log('should have deselcted ' + v._id())
			}
			//console.log('v !== this.control', v !== this.control);
			if (v === ctrl && v !== this.control) {
				currently_selected = v.selected;
			}
		});
		this.map_selected_controls = {};
		if (typeof ctrl._id === 'function') {
			this.map_selected_controls[ctrl._id()] = ctrl;
		} else {
			//console.log('typeof ctrl._id', typeof ctrl._id);
		}
		// and then tell the control that it's selected.
		// could possibly set a CSS flag.

		//console.log('currently_selected', currently_selected);

		if (!currently_selected) {
			ctrl.selected = true;
			this.raise('change', {
				name: 'selected',
				value: ctrl
			});
		}
		if (count_deselected > 0 & !currently_selected) {
			//this.raise('change');
		}
	}
	'deselect_all'() {
		//console.log('this.map_selected_controls', this.map_selected_controls);
		each(this.map_selected_controls, (v, i) => {
			// Don't want to select the selection scope itself.
			if (v) {
				if (v.selected) {
					v.selected = false;
					//count_deselected++;
				}
			}
		});
		this.map_selected_controls = {};
	}
	'deselect'(ctrl) {
		if (ctrl.selected === true) {
			ctrl.selected = false;
		}
	}
	// deselect controls internal to a control.

	// When selecting a control, we want to make it so that controls inside it, in the same selection context are not selected.
	//  The Selection Scope does a fair bit of the management of the selections.

	'deselect_ctrl_content'(ctrl) {
		//var cs = ctrl.get('selection_scope');
		var cs = ctrl.selection_scope;
		var msc = this.map_selected_controls;
		var that = this;
		ctrl.content.each(v => {
			//var tv = tof(v);
			if (v instanceof Control) {
				v.selected = false;
				var id = v._id();
				if (msc[id]) msc[id] = false;
				that.deselect_ctrl_content(v);
			}
		});
		this.raise('change');
		//throw 'stop';
	}
	'select_toggle'(ctrl) {
		var sel = ctrl.selected;
		//console.log('tof(sel) ' + tof(sel));
		var msc = this.map_selected_controls;
		var id = ctrl._id();
		if (!sel) {
			var sel_anc = ctrl.find_selected_ancestor_in_scope();
			if (sel_anc) {
				console.log('1) not selecting because a selected ancestor in the selection scope has been found.');
			} else {
				ctrl.selected = true;
				// Check for a selected ancestor control in the scope.
				this.deselect_ctrl_content(ctrl);
				msc[id] = ctrl;
			}
		} else {
			var tsel = tof(sel);
			//console.log('tsel ' + (tsel))
			if (tsel == 'data_value') {
				var val = sel.get();
				//console.log('val ' + val);
				if (val) {
					ctrl.selected = false;
					msc[id] = false;
				} else {
					var sel_anc = ctrl.find_selected_ancestor_in_scope();
					if (sel_anc) {
						console.log('2) not selecting because a selected ancestor in the selection scope has been found.');
					} else {
						ctrl.selected = true;
						this.deselect_ctrl_content(ctrl);
						msc[id] = ctrl;
					}
				}
			}
			if (tsel == 'boolean') {
				if (sel) {
					ctrl.selected = false;
					msc[id] = false;
				} else {
					var sel_anc = ctrl.find_selected_ancestor_in_scope();
					if (sel_anc) {
						console.log('2) not selecting because a selected ancestor in the selection scope has been found.');
					} else {
						this.deselect_ctrl_content(ctrl);
						ctrl.selected = true;
						msc[id] = ctrl;
					}
				}
			}
		}
		this.raise('change');
	}
}

module.exports = Selection_Scope;