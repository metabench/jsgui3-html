// Vertical_Expander
const jsgui = require('./../../../../html-core/html-core');


var Horizontal_Slider = require('./Horizontal_Slider');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;
var v_subtract = jsgui.v_subtract;

// Extending, with field values being set?
//  Setting field values in definitions may be a useful thing.
class Audio_Volume extends Control {
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

			var h_slider = new Horizontal_Slider({
				'context': this.context,
				'min': 0,
				'max': 100,
				'value': 100
			});
			this.add(h_slider);

			var ctrl_fields = {
				'h_slider': h_slider._id()
			}

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