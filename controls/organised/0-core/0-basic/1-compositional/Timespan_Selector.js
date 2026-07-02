var jsgui = require('../../../../../html-core/html-core');
var stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof;
var Control = jsgui.Control;
const Date_Picker = require('../0-native-compositional/Date_Picker');

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




/**
 * @deprecated Timespan_Selector is deprecated and will be removed in a
 * future release. Use Date_Range_Picker instead
 * (controls/organised/0-core/0-basic/_complex_date-range-picker.js /
 * controls registry key `Date_Range_Picker`): it provides single/dual
 * calendar popups, optional time inputs, range highlighting, and the full
 * isomorphic (SSR reattachment) contract — none of which this stub has.
 */
let warned_deprecated = false;

class Timespan_Selector extends Control {
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'timespan_selector';

        if (!warned_deprecated) {
            warned_deprecated = true;
            console.warn('[jsgui3-html] DEPRECATED: Timespan_Selector is deprecated. ' +
                'Use Date_Range_Picker (controls.Date_Range_Picker) instead.');
        }

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