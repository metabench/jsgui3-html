/**
 * Created by james on 17/12/2016.
 */

// needs to hold its date values in the right formats.

const jsgui = require('./../../../../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;

// Now seems like a more complex control, one that should have multiple views
//   Could have multiple possible data models too...?
//   And in its rawest form, does not need a data model, just uses the calendar object.





// This seems like a good candidate for multiple display modes.
//  as a mixin.

// mx_display_modes
//   seems more like core .view functionality now
//     choosing which view will be used
//       and that choice could be made based on the representation of data used.




// This one is advanced / composite / possibly connected through a data api?

// Advanced calendar / date picker control.
//  Flexible. Will use other smaller, more specific components.

// Keep this at core basic for the moment?
//  Maybe move some other date related controls to core basic.


class Calendar extends Control {
    // Can have different views open.
    // Can view by months, in different types.

    // could have a .view property
    //  string property, can say 'month', 'week',

    constructor(spec) {
        super();

        // Depending on the display mode...

        // display as a date (most zoomed out)
        // display as date with +- controls
        // display as date with year list, month list, view of days in month


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

