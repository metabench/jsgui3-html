var jsgui = require('../html-core/html-core');
var stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof;
var Control = jsgui.Control;
const Date_Picker = jsgui.Date_Picker;

// Extending, with field values being set?
//  Setting field values in definitions may be a useful thing.

// Date_Time_Selector
//  Not a calendar itself. Just used to select a Date value. Shows it on a calendar (fairly small).
//  Could use a Calendar control though, with specific config not to show other things.
//   Though could mark dates there too.

// Date_Picker
//  Maybe that will just have the date option.

// Starting / default values.

// From, to.
// .span




// text alias being title?
class Timespan_Selector extends Control {
    // fields... text, value, type?
    //  type could specify some kind of validation, or also 'password'.
    // single field?
    //  and can have other fields possibly.
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'timespan_selector';

        super(spec);

        if (spec.span) {
            this.span = spec.span;

        } else {
            //
            this.span = [];
        }

        if (!spec.skip_compose) {
            this.compose();
        }

    }
    compose() {
        let context = this.context;
        let date_from = this.span[0] || new Date('2018-06-20T11:00:00');
        let date_to = this.span[0] || new Date('2018-08-20T11:00:00');
        
        let picker_from = new Date_Picker({
            context: this.context,
            date: date_from
            
        });
        this.add(picker_from);

        let picker_to = new Date_Picker({
            context: this.context,
            date: date_to
            
        });
        this.add(picker_to);
        
    }
};
module.exports = Timespan_Selector;