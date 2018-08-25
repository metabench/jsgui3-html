// Vertical_Expander
var jsgui = require('../html-core/html-core');
var Horizontal_Slider = require('./horizontal-slider');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;
var v_subtract = jsgui.v_subtract;

// Extending, with field values being set?
//  Setting field values in definitions may be a useful thing.
class Audio_Volume extends jsgui.Control {
	// fields... text, value, type?
	//  type could specify some kind of validation, or also 'password'.

	// single field?
	//'fields': [
	//	['text', String]
	//],
	//  and can have other fields possibly.

	constructor(spec, add, make) {
		super(spec);
		this.__type_name = 'audio_volume';

		if (!spec.abstract && !spec.el) {

			this.add_class('audio-volume');
			// the bar at the top.

			// It's going to act as a drag handle for this.
			//  The drag system will integrate with various bands / window positions.

			// Maybe a property to say that it's dockable.

			//var top_bar = new Control({
			//	'context': this.context
			//})
			//top_bar.set('dom.attributes.class', 'title bar');


			//this.add(top_bar);

			var h_slider = add(Horizontal_Slider({
				'min': 0,
				'max': 100,
				'value': 100
			}));

			var ctrl_fields = {
				'h_slider': h_slider._id()
			}

			//this.set('dom.attributes.data-jsgui-ctrl-fields', stringify(ctrl_fields).replace(/"/g, "'"));
			this.active();
		}
	}
	'activate'() {
		super.activate();
		console.log('Audio Volume activate');

		var h_slider = this.h_slider;
	}
}

module.exports = Audio_Volume;