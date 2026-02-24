var jsgui = require('./../../../../html-core/html-core');
var Toggle_Button = require('../../0-core/0-basic/1-compositional/Toggle_Button');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;

// Maybe a bit more niche.
//  Could make an extra controls expansion....

// Specifying / having a smaller default control set would help.
//  So would a function for declaring controls.
//   May have some more tricks for keeping things in a closure.




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
		//this.state = spec.state;
		// Want it to have events as well specific to start and stop.
		//  That will make it different to some other toggle buttons.
		// can listen for state change.
		// needs to be client-side event only.
		//  Maybe just on activation.

		// a 'changes' util function.

		this.on('change', (e_change) => {
			//console.log('Start_Stop_Toggle_Button e_change', e_change);
			const {name, value} = e_change;
			if (name === 'state') {
				// the state is just what the button says/will say.
				if (value === 'stop') {
					// start it.
					this.raise('start');
				}
				if (value === 'start') {
					// start it.
					this.raise('stop');
				}
			}
		});
	}
	'activate'() {
		// Need to check it's not active already.
		if (!this.__active) {
			super.activate();
			//console.log('* activate Start_Stop_Toggle_Button');
			//var that = this;
			
		}
	}
}

module.exports = Start_Stop_Toggle_Button;
