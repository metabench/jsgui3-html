var jsgui = require('../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;

var v_subtract = jsgui.v_subtract;


// Extending, with field values being set?
//  Setting field values in definitions may be a useful thing.

/*
 'fields': [
 ['min', Number],
 ['max', Number],
 ['value', Number],
 ['drag_mode', String]
 ],
 */



class Horizontal_Slider extends Control {
	// fields... text, value, type?
	//  type could specify some kind of validation, or also 'password'.

	// single field?

	//  and can have other fields possibly.

	// This should be customizable in which values it holds.
	//  For the moment, set up the value range on the server, and send that to the client as fields which we get back from the DOM when
	//  the Control gets activated.

	// I think this can take a min, a max, and a value.
	//  Perhaps operating in 'proportion' mode between 0 and 1 is easiest?
	//  Also having it handle time values - could use ms.


	// Basically, this needs to be told its min value, its max value, and its current value.

	// Also, want 'ghost' drag mode so that the handle can be dragged, and only changes position on release
	//  For different scrubber behaviour to what is in the iPod app.

	constructor(spec, add, make) {
		super(spec);
		this.__type_name = 'horizontal_slider';

		// Want a 'ghost' drag mode.

		if (!spec.abstract && !spec.el) {

			var div_relative = add(Control({ 'class': 'relative' }))
			this.add_class('horizontal slider');

			// Then we add the bar over the width.
			var h_bar = make(Control({ 'class': 'h-bar' }));
			var v_bar = make(Control({ 'class': 'v-bar' }));

			div_relative.add(h_bar);
			div_relative.add(v_bar);

			var ctrl_fields = {
				'div_relative': div_relative._id(),
				'h_bar': h_bar._id(),
				'v_bar': v_bar._id()
			}

			this.set('dom.attributes.data-jsgui-ctrl-fields', stringify(ctrl_fields).replace(/"/g, "'"));

			// Send the min, max and value fields over to the client too.

			// Fields to persist to client.

			var min = this.get('min').value();
			var max = this.get('max').value();



			//console.log('min', min);
			//console.log('max', max);

			// Is value a specific case?

			var value = this.value;

			var obj_fields = {
				//'ms_duration': ms_duration
				'min': min,
				'max': max,
				'value': value
			};
			var drag_mode = this.get('drag_mode');
			if (drag_mode) {
				obj_fields.drag_mode = drag_mode.value();
			}
			//console.log('tof(min)', tof(min));
			//throw 'stop';
			this.set('dom.attributes.data-jsgui-fields', stringify(obj_fields).replace(/"/g, "[DBL_QT]").replace(/'/g, "[SNG_QT]"));
			this.active();
		}


	}
	'activate'() {
		super.activate();
		console.log('Horizontal Slider activate');
		// Also need to deal with touch events.
		//  I think that touch tolerance would do the job.
		//  Need to find the right trick to use for this, if there is one.
		// Could probably work using a lower level touch API
		//  Detect if the touch is near the item we want to drag.
		// Perhaps touch tolerance could be done by using a larger touch overlay, or touch handle.

		var that = this;

		//var div_relative = this.get('div_relative');
		var h_bar = this.h_bar;
		var v_bar = this.v_bar;

		var ghost_v_bar;



		//console.log('h_bar', h_bar);
		//console.log('v_bar', v_bar);

		var size = this.size();
		//console.log('size', size);

		var size_v_bar = this.v_bar.size();
		var w_v_bar = size_v_bar[0];
		var h_w_v_bar = w_v_bar / 2;

		var h_padding = 5;

		var h_bar_width = size[0] - h_padding * 2;

		this.h_bar.style({
			'width': h_bar_width + 'px'
		});

		var ctrl_html_root = this.context.ctrl_document;


		// have lower level drag working on the h_bar?
		//  want some kind of flexible drag, but that could be done while cutting out code.
		//  for the moment, will do the eventhandlers?
		//   generic drag handlers would be useful for touch interfaces as well.

		var pos_down, pos_current, pos_offset;

		var orig_v_bar_l = parseInt(this.v_bar.style('left'), 10);
		var new_v_bar_l;

		//console.log('orig_v_bar_l', orig_v_bar_l);

		var drag_mode;

		var prop;

		var ctrl_ghost_v_bar;
		var context = this.context;

		var v_bar_center_pos;
		var v_bar_center_pos_when_pressed;

		var ensure_ctrl_ghost_v_bar = function () {
			if (!ctrl_ghost_v_bar) {
				ctrl_ghost_v_bar = new Control({
					'context': this.context,
					'class': 'ghost v-bar'
				});

				div_relative.add(ctrl_ghost_v_bar);

				// TODO: Automatic activation of an added control will be very useful.
				ctrl_ghost_v_bar.activate();
			} else {
				div_relative.add(ctrl_ghost_v_bar);
			}
		}

		var fn_mousemove = function (e_mousemove) {


			var bcr_h_bar = h_bar.bcr();
			//console.log('bcr_h_bar', bcr_h_bar);

			// Want the pageX -

			var bcr_h_bar_x = bcr_h_bar[0][0];
			var bcr_h_bar_w = bcr_h_bar[2][0];

			// then the position of the mouse event from that bcr_x

			var up_offset_from_bcr_h_bar_x = e_mousemove.pageX - bcr_h_bar_x;
			//console.log('up_offset_from_bcr_h_bar_x', up_offset_from_bcr_h_bar_x);

			if (up_offset_from_bcr_h_bar_x < 0) up_offset_from_bcr_h_bar_x = 0;
			if (up_offset_from_bcr_h_bar_x > bcr_h_bar_w) up_offset_from_bcr_h_bar_x = bcr_h_bar_w;

			//var prop = up_offset_from_bcr_h_bar_x / bcr_h_bar_w;

			//console.log('prop', prop);

			//var new_val = prop * max;
			// need to constrain the bar values.

			if (drag_mode == 'ghost') {
				ensure_ctrl_ghost_v_bar();
				//ctrl_ghost_v_bar.style('left', (pos_current[0] + new_v_bar_l) + 'px');

				//ctrl_ghost_v_bar.style('left', (up_offset_from_bcr_h_bar_x + (h_w_v_bar)) + 'px');
				ctrl_ghost_v_bar.style('left', (up_offset_from_bcr_h_bar_x) + 'px');

			} else {


				v_bar.style('left', up_offset_from_bcr_h_bar_x + 'px');
			}

			// Depending on the drag mode.
			//  If it is in ghost mode then we ensure existance of and then use a ghost v_bar control.


		}

		var fn_mouseup = function (e_mouseup) {

			console.log('e_mouseup', e_mouseup);

			ctrl_html_root.off('mousemove', fn_mousemove);
			ctrl_html_root.off('mouseup', fn_mouseup);


			var bcr_h_bar = h_bar.bcr();
			console.log('bcr_h_bar', bcr_h_bar);

			// Want the pageX -

			var bcr_h_bar_x = bcr_h_bar[0][0];
			var bcr_h_bar_w = bcr_h_bar[2][0];

			// then the position of the mouse event from that bcr_x

			var up_offset_from_bcr_h_bar_x = e_mouseup.pageX - bcr_h_bar_x;
			console.log('up_offset_from_bcr_h_bar_x', up_offset_from_bcr_h_bar_x);

			if (up_offset_from_bcr_h_bar_x < 0) up_offset_from_bcr_h_bar_x = 0;
			if (up_offset_from_bcr_h_bar_x > bcr_h_bar_w) up_offset_from_bcr_h_bar_x = bcr_h_bar_w;

			var prop = up_offset_from_bcr_h_bar_x / bcr_h_bar_w;

			console.log('prop', prop);


			if (drag_mode == 'ghost') {


				ctrl_ghost_v_bar.remove();

				var min = that.min;
				if (min.value) min = min.value();
				var max = that.max;
				if (max.value) max = max.value();

				console.log('pos_down', pos_down);

				//var prop = x_up_within_h_bar / h_bar_width;

				var new_val = prop * max;

				console.log('new_val', new_val);
				that.value = new_val;
			} else {
				orig_v_bar_l = new_v_bar_l;
			}
		}

		v_bar.on('mousedown', function (e_mousedown) {
			var dm = that.drag_mode;
			//drag_mode = ;
			if (dm) {
				drag_mode = dm.value();
			}
			v_bar_center_pos_when_pressed = v_bar_center_pos;

			//console.log('drag_mode', drag_mode);

			ctrl_html_root.on('mousemove', fn_mousemove);

			ctrl_html_root.on('mouseup', fn_mouseup);

			ctrl_html_root.add_class('dragging');

			// use pageX and pageY
			pos_down = [e_mousedown.pageX, e_mousedown.pageY];

		});
		// So the event does not get raised when setting a field?

		//this.get('value').on('change', function(name, value) {
		//	console.log('h slider value change ', name, value);
		//});


		this.on('change', function (e_change) {

			var name = e_change.name, value = e_change.value;
			//console.log('h slider change', e_change);

			if (name == 'value') {
				var min = that.min;

				var max = that.max;

				prop = value / max;

				var size_h_bar = h_bar.size;
				v_bar_center_pos = Math.round((size_h_bar[0] * prop) + h_padding - h_w_v_bar);
				v_bar.style('left', v_bar_center_pos + 'px');
			}
		});
		// need to
	}
}
module.exports = Horizontal_Slider;