var jsgui = require('../html-core/html-core');
var Toggle_Button = require('./toggle-button');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;

class Start_Stop_Toggle_Button extends Toggle_Button {

	//'fields': [
		//['text', String]
	//],
	//  and can have other fields possibly.

	constructor(spec, add, make) {
		// Set it so it only has two states
		//  '+' and '-'
		spec.states = ['start', 'stop'];
		spec.state = spec.state || 'start';

		super(spec);
		this.__type_name = 'start_stop_toggle_button';

		this.add_class('start-stop toggle-button');

		// set not returning the Data_Value?
		this.state = spec.state;
		// Want it to have events as well specific to start and stop.
		//  That will make it different to some other toggle buttons.
		// can listen for state change.
		// needs to be client-side event only.
		//  Maybe just on activation.
	}
	'activate'() {
		// Need to check it's not active already.
		if (!this.__active) {
			super.activate();
			console.log('activate Start_Stop_Toggle_Button');
			var that = this;
			this.on('change', function(e_change) {
				//console.log('e_change', e_change);
				var name = e_change.name;
				var value = e_change.value;
				if (name === 'state') {
					// the state is just what the button says/will say.
					if (value === 'stop') {
						// start it.
						that.raise('start');
					}
					if (value === 'start') {
						// start it.
						that.raise('stop');
					}
				}
			});
		}
	}
}

module.exports = Start_Stop_Toggle_Button;
