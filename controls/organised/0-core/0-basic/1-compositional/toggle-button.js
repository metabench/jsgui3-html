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

const jsgui = require('../../../../../html-core/html-core');

//var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
//var Control = jsgui.Control;

const {stringify, each, tof, def, Control} = jsgui;
// Can the button contain an image?
//  Would be useful for a start/stop button.
//  Toggle button toggling between two images.

// Nice of obext did a bit in terms of object.grammar.
//  Defining the grammar of objects and functions seems very useful.
//   In some cases, it could be used to make more concise and declarative code.

const { prop, field } = require('obext');

class Toggle_Button extends Control {

    constructor(spec, add, make) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'toggle_button';
        super(spec);
        this.add_class('toggle-button');
        field(this, 'states', spec.states || '');
        field(this, 'state', spec.state || '');
        if (!spec.abstract && !spec.el) {
            const _compose = () => {
                var span_state = this.span_state = new jsgui.span({ 'context': this.context, text: this.state });
                this.add(span_state);
            }
            const compose = () => jsgui.parse_mount(`<span name='span_state'>${this.state}</span>`, this, jsgui.controls);
            compose();
        }
        this.on('change', e_change => {
            //console.log('Toggle_Button change', e_change);
            if (this.span_state) this.span_state.text = e_change.value;
        });
        if (typeof document === 'undefined') {
            //this.dom.attributes['data-jsgui-fields'] = stringify(active_fields).replace(/"/g, "'");
            this.dom.attributes['data-jsgui-ctrl-fields'] = stringify({
                'span_state': this.span_state._id()
            }).replace(/"/g, "'");
            //this.set('dom.attributes.data-jsgui-fields', stringify(active_fields).replace(/"/g, "'"));
        }
    }

    'activate'() {
        if (!this.__active) {
            super.activate();
            this.on('click', e_click => {
                var state = this.state;
                var states = this.states;
                var i_current_state;
                if (tof(states) === 'array') {
                    each(states, (i_state, i) => {
                        if (i_state === state) {
                            i_current_state = i;
                        }
                    })
                    var i_next_state = i_current_state + 1;
                    if (i_next_state === states.length) i_next_state = 0;
                    var str_next_state = states[i_next_state];
                    this.raise('toggle', {
                        'state': str_next_state
                    });
                    this.state = str_next_state;
                } else {
                    throw 'stop'
                }
            })
        }
    }
}
module.exports = Toggle_Button;