// Vertical_Expander


//if (typeof define !== 'function') { var define = require('amdefine')(module) }
var jsgui = require('../html-core/html-core');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;


// Extending, with field values being set?
//  Setting field values in definitions may be a useful thing.
class Vertical_Expander extends Control {
	// fields... text, value, type?
	//  type could specify some kind of validation, or also 'password'.

	// single field?
	//'fields': [
	//	['text', String]
	//],
	//  and can have other fields possibly.


	constructor(spec) {
		super(spec);

		this.add_class('vertical expander');
		this.__type_name = 'vertical_expander';

		// starts either open or closed.

		// Would have two possible states - open and closed.
		//  Would move between the two.

		//var state = spec.state || 'open'


		this.set('states', ['open', 'closed']);


		let state = spec.state;
		if (state === 'expanded') state = 'open';
		if (state === 'contracted') state = 'closed';

		this.set('state', state || 'open');



		//var span = new jsgui.span({
		//	'context': this.context
		//})
		//span.add(this.get('text').value());
		//ctrl_title_bar.set('dom.attributes.class', 'titlebar');
		//this.add(span);

	}
	'activate'() {
		//console.log('Vertical Expander activate');
        super.activate();

		// I think that animation should be handled by Contol, just getting called here.
		//  Will use css transitions where applicable.
		// Listen to the state being changed.
		// Then update the UI based on that
		var that = this;
		var orig_height;


		

		var el = that.dom.el;
		var ui_close = function() {
			var h = el.childNodes[0].offsetHeight;
			//console.log('h', h);
			orig_height = h;
			el.style.height = orig_height + 'px';
			el.style.overflow = 'hidden';
			// transition: width 3s linear;
			//el.style.transition = 'height 0.08s linear';
			el.style.transition = 'height 0.5s linear';
			//el.style['webkit-transition-property'] = 'height';
			//el.style['webkit-transition-duration'] = '1s';
			//el.style['webkit-transition-timing-function'] = 'linear';
			//el.style['transition-delay'] = '2s';
			// And to listen to the animation ending as well.
			setTimeout(function() {
				el.style.height = '0px';
			}, 0);
			// Better control over styles will help.
			//  Need the inline css layer.
			//  Then have the JSGUI style layer on top of that.
		}


		var ui_open = function() {
			el.style.height = orig_height + 'px';

			var fnTransitionEnd = function(e_end) {
				console.log('fnTransitionEnd');
				el.style.overflow = 'visible';
				el.removeEventListener('transitionend', fnTransitionEnd)
			}

			el.addEventListener('transitionend', fnTransitionEnd, false);

			// when the transition has completed, make the overflow visible.


			//el.style.overflow = 'visible';
		}

		var state = this.get('state');
		state.on('change', function(e_change) {
			console.log('Vertical_Expander state change', e_change);

			// Change it in the UI at this point.
			var val = e_change.value;

			if (val == 'closed') {
				ui_close();
			}

			if (val == 'open') {
				ui_open();
			}
		});

		// Going to be setting the height based on measured height of self / contents
		//  May use css transitions. Possibly 'transit' function.
		// May make animate function take similar syntax to jQuery but use CSS transitions where appropriate.

		// Have the UI respond to changes in the state variable.
	}
	'toggle'() {
		// Will change the state.
		console.log('vertical-expander toggle');
		var state = this.state;
		var v_state = state.value();
		//console.log('state', state);

		//console.log('tof state', tof(state));

		if (v_state == 'open') {
			//this.set('state', 'closed');
			state.set('closed');
		}
		if (v_state == 'closed') {
			//this.set('state', 'open');
			state.set('open');
		}
	}

	'open'() {
		this.state.set('open');
	}
	'close'() {
		this.state.set('closed');
	}
	// Open, close, expand, contract
	//  Could have a state variable as well.
	//  Will listen to changes in that state variable.

}
module.exports = Vertical_Expander;
