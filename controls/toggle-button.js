/*
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(["../../jsgui-html-enh"],
 function(jsgui) {
*/

// Should have a toggle button group to allow selection / activation of individual buttons.
//  Will have an event for when the button selection changes.
//  Perhaps this could be done with a selection group, like a radio group.
// For the moment, I think a Toggle_Button_Group is the right way to go.

// Maybe we really want a 'select_button'.
//  Don't want clicking it again to unselect it.
//  Perhaps we just want to say a button is 'selectable'.

var jsgui = require('../html-core/html-core');

//var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
//var Control = jsgui.Control;

const {stringify, each, tof, def, Control} = jsgui;
// Can the button contain an image?
//  Would be useful for a start/stop button.
//  Toggle button toggling between two images.

const { prop, field } = require('obext');

// May do more with attempting state change?

// Can we have an abstraction that will handle a variety of images in a variety of contexts?
//  We want to have SVGs that are suitable for start and stop.
//  Want to make use of the right images or the right image abstractions.
//   Possibly vector abstractions would be useful.
//   Perhaps late 2015 we can count on svg support. Deos not seem to have that good Android support.
//    Legacy support too?
//    Spritesheets may be quicker.

// Using image files / sprites makes sense.
//  A sprite + build abstraction would be nice.
//  Just using image files would be easy to begin with.

// Inherit from Button, with change events, and the possibility of changing between images?

// If we defined something as a Collection, we would need to have different handling.
//  Want to be able to have collections as fields.

var fields = [
    ['text', String],
    ['state', String],
    ['states', Array]
];

class Toggle_Button extends Control {

    // Though maybe tell it to be an array and it should be an array rather than a collection?
    //  Or a Data_Value that holds an array?

    constructor(spec, add, make) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'toggle_button';
        super(spec);
        // fields not getting set up
        // need a jsgui2 way to initialise the fields, from a fields variable.
        //  can initialise the fields at each level in the code here, rather than all at once.
        //this.__type_name = 'toggle_button';
        this.add_class('toggle-button');
        //console.log('spec.state', spec.state);

        field(this, 'states', spec.states || '');
        field(this, 'state', spec.state || '');

        if (!spec.abstract && !spec.el) {
            //console.log('1) this.state', this.state);
            var span_state = this.span_state = new jsgui.span({ 'context': this.context, text: this.state });
            //span_state.active();
            // Add a new text node?
            //span_state.add(state + '');
            /*
            span_state.add(new jsgui.Text_Node({
                context: this.context,
                text: state
            }));
            */
            this.add(span_state);
            //this.span_state = span_state;
        }

        this.on('change', e_change => {
            //console.log('Toggle_Button change', e_change);
            if (this.span_state) this.span_state.text = e_change.value;
        });
        //console.log('active_fields', active_fields);
        if (typeof document === 'undefined') {
            //this.dom.attributes['data-jsgui-fields'] = stringify(active_fields).replace(/"/g, "'");
            this.dom.attributes['data-jsgui-ctrl-fields'] = stringify({
                'span_state': this.span_state._id()
            }).replace(/"/g, "'");
            //this.set('dom.attributes.data-jsgui-fields', stringify(active_fields).replace(/"/g, "'"));
        }
        //this.get('state').on('change', function(e_state_change) {
        //  console.log('e_state_change', e_state_change);
        //})
        // use different quotes...
        //that.set('dom.attributes.data-jsgui-ctrl-fields', stringify(ctrl_fields).replace(/"/g, "'"));
        // Need to transfer the state and states properties/fields to the clients.
    }
    

    'activate'() {
        //console.log('toggle button activate this.__active', this.__active);
        //console.log('this', this);
        if (!this.__active) {
            super.activate();
            this.on('click', e_click => {
                //console.log('toggle button clicked');
                // needs to toggle through states.
                // Need to send the state field from the server to the client.
                var state = this.state;
                //console.log('state', state);
                // And need to look at the states.
                var states = this.states;
                var i_current_state;
                if (tof(states) === 'array') {
                    //console.log('states', states);
                    each(states, (i_state, i) => {
                        //console.log('i_state', i_state);
                        //console.log('tof i_state', tof(i_state));
                        if (i_state === state) {
                            i_current_state = i;
                        }
                    })
                    //console.log('i_current_state', i_current_state);
                    // then choose the next state
                    var i_next_state = i_current_state + 1;
                    if (i_next_state === states.length) i_next_state = 0;
                    var str_next_state = states[i_next_state];
                    //console.log('i_next_state', i_next_state);
                    //console.log('str_next_state', str_next_state);
                    //state.set(str_next_state);

                    this.raise('toggle', {
                        'state': str_next_state
                    });

                    this.state = str_next_state;
                    // needs to listen to the change in state
                    // field changes need to be observable
                    // need to listen for a change from the ctrl then.
                } else {
                    throw 'stop'
                }
            })
        }
    }
}
module.exports = Toggle_Button;