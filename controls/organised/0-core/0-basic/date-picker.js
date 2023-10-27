/**
 * Created by james on 17/12/2016.
 */

// Could have an option to use the native date picker.
// The jsgui type of datepicker should look nicer though.


// Could define that this is only using the data type of date.
//   Maybe could pick time as well?
//     Or define that it picks the date part of date.





const jsgui = require('../../../../html-core/html-core');
const stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
const Control = jsgui.Control;
//var Calendar = require('./calendar');

// Let's have a really simple HTML date picker that gets / can be progressively enhanced.

/*

<label for="start">Start date:</label>

<input type="date" id="start" name="trip-start" value="2018-07-22" min="2018-01-01" max="2018-12-31" />


*/

class Date_Picker extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'date_picker';
        super(spec);
        this.add_class('date-picker');
        this.dom.tagName = 'input';
        this.dom.attributes.type = 'date';

        // value, min, max in YYYY-MM-DD

        // default to today???


        //mx_date(this, spec);

        // mx picker?

        // Could start with a current date
        // Maybe this renders a calendar?
        //  mini calendar?
        // will have month view
        //  that's the main view
        // Display all of the days of the month in a grid.
        //  Could use a grid control and render the days into them.
        // a month_view component
        // month_view could be used in calendars too.
        // year: left right arrows selector
        // month: left right arrows selector
        // day: month view
        // Join them all up together
        //  Raise external events when the date changes.

        if (!spec.el) {
            this.compose_date_picker();
            //this.finish_date_picker();
        }
    }
    compose_date_picker() {

        // Some kind of progressive enhancement to turn it into a more advanced / jsgui specific date picker control.

        


        // Not sure this is best.
        //  Maybe just assign these when on the server. Just don't need them client-side once they have been loaded.

        // Month view - want to be able to select a day.
        //  each day should be selectable.
        //  A .selectable property would be nice.
        //  could use defineProperty for this, rather than a .selectable() function.

        /*

        this._ctrl_fields = this._ctrl_fields || {};
        Object.assign(this._ctrl_fields, {
            year_picker: this.year_picker = new Year_Picker({
                context: this.context
            }),
            month_picker: this.month_picker = new Month_Picker({
                context: this.context
            }),
            month_view: this.month_view = new Month_View({
                context: this.context
            })
        })
        this.add(this.year_picker);
        this.add(this.month_picker);
        this.add(this.month_view);
        */
    }
}

module.exports = Date_Picker;