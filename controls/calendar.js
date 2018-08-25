/**
 * Created by james on 17/12/2016.
 */

// needs to hold its date values in the right formats.

var jsgui = require('../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;

class Calendar extends Control {
    // Can have different views open.
    // Can view by months, in different types.

    // could have a .view property
    //  string property, can say 'month', 'week',

    constructor(spec) {
        super();

        // Should have a few configuration options.

        // Different layouts... compact.

        // The calendar will have:

        // mode: datepicker

        // by default start on the current date, then render month view as html

        // .view property - month, week
        //  or call it view_type?

        // unit of time which gets displayed at once
        // view_time_unit

        // .view = 'month'
        // ??? .type = 'date_picker'

        // .view_type = 'month'

        // use today's date.

        var d = new Date();
        var i_month = d.getMonth() + 1;

        // Then show the current month as a view

        // Date display at the top
        //  Editable numbers
        //  Number combo box
        //  Could use a year selector combo box








        // Current date


    }


}

