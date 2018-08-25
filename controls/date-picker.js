/**
 * Created by james on 17/12/2016.
 */

// Could have an option to use the native date picker.
// The jsgui type of datepicker should look nicer though.

const jsgui = require('../html-core/html-core');
const stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
const Control = jsgui.Control;
//var Calendar = require('./calendar');
const Left_Right_Arrows_Selector = require('../controls/left-right-arrows-selector');
const Month_View = require('../controls/month-view');

/*
Being able to select dates (including times) in a nice user-friendly way is going to be worthwhile functionality for a variety of things.
*/
/*
    Micro Controls
    // Simple, encapsulated, extensible.
    Year Picker
    Month Picker
    Then we use Month View too
*/

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022];

const mx_date = require(`../control_mixins/date`);

class Year_Picker extends Left_Right_Arrows_Selector {
    constructor(spec) {
        Object.assign(spec, {
            'items': years,
            'item_index': 4,
            'loop': false
        });
        super(spec);
        this.add_class('year-picker');
    }
}

class Month_Picker extends Left_Right_Arrows_Selector {
    constructor(spec) {
        Object.assign(spec, {
            'items': months,
            'item_index': 7,
            'loop': true
        });
        super(spec);
        this.add_class('month-picker');
    }
}

class Date_Picker extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'date_picker';
        super(spec);
        this.add_class('date-picker');

        mx_date(this, spec);


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
            this.finish_date_picker();
        }

        // Should have a Date object of its own.
        //  Maybe only at some times.

        // various properties here, concerning date

        // js date object
        // year, month day_of_month
        // or just day in this context

        // will have various properties, get other controls to change their properties based on changes here.


    }
    finish_date_picker() {
        this.year_picker.on('change', e_change => {
            //console.log('yp change', e_change);
            let year = e_change.value;
            this.year = year;
        });
        this.month_picker.on('change', e_change => {
            //console.log('yp change', e_change);
            let month = e_change.index;
            this.month = month;
        })

        // then the change for the year.
        //  will then need to set the year for other controls.

        this.on('change', e_change => {
            console.log('Date_Picker e_change', e_change);
            if (e_change.name === 'year') {
                //this.year_picker.year = e_change.value;
                this.month_view.year = e_change.value;
                this.month_view.refresh_month_view();
            }
            if (e_change.name === 'month') {
                //this.year_picker.year = e_change.value;
                this.month_view.month = e_change.value;
                this.month_view.refresh_month_view();
            }
        })

    }
    compose_date_picker() {
        // Not sure this is best.
        //  Maybe just assign these when on the server. Just don't need them client-side once they have been loaded.

        // Month view - want to be able to select a day.
        //  each day should be selectable.
        //  A .selectable property would be nice.
        //  could use defineProperty for this, rather than a .selectable() function.

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
    }
    activate() {
        if (!this.__active) {
            super.activate();
            // Should keep track of year etc properties.
            //  Maybe handle silent updates too.
            //let is_first_year = false;
            //let is_first_month = false;
            let is_first_month, is_first_year, is_last_month, is_last_year;
            let disable_enable_month_arrows = () => {
                if (is_first_year && is_first_month) {
                    this.month_picker.left_arrow.disabled = true;
                } else {
                    this.month_picker.left_arrow.disabled = false;
                }
                if (is_last_year && is_last_month) {
                    this.month_picker.right_arrow.disabled = true;
                } else {
                    this.month_picker.right_arrow.disabled = false;
                }
                if (is_last_year) {
                    this.year_picker.right_arrow.disabled = true;
                } else {
                    this.year_picker.right_arrow.disabled = false;
                }
                if (is_first_year) {
                    this.year_picker.left_arrow.disabled = true;
                } else {
                    this.year_picker.left_arrow.disabled = false;
                }
            }
            this.year_picker.on('change', e_year_change => {
                //console.log('e_year_change', e_year_change);
                if (e_year_change.size === -1) {
                    this.month_view.previous_year();
                }
                if (e_year_change.size === 1) {
                    this.month_view.next_year();
                }
                is_first_year = !!e_year_change.first;
                is_last_year = !!e_year_change.last;
                disable_enable_month_arrows();
                // Need to disable move right / next if at last month
                //is_first_year = !! e_year_change.first;
            })
            this.month_picker.on('change', e_month_change => {
                //console.log('e_month_change', e_month_change);
                is_first_month = !!e_month_change.first;
                is_last_month = !!e_month_change.last;
                if (e_month_change.size === -1) {
                    this.month_view.previous_month();
                }
                if (e_month_change.size === 1) {
                    this.month_view.next_month();
                }
                // Need to do this silently.
                if (e_month_change.loop === -1) {
                    this.year_picker.previous();
                }
                if (e_month_change.loop === 1) {
                    this.year_picker.next();
                }
                disable_enable_month_arrows();
                // old value too..
                // old index?
                //this.month_view.
            });

            this.month_view.on('change', emv_change => {
                //console.log('emv_change', emv_change);
                let cell = emv_change.value;
                let day_of_month = cell.value;

                //console.log('day_of_month', day_of_month);
                //console.log('this.month_view.day', this.month_view.day);

                if (emv_change.name === 'day') {
                    this.day = day_of_month;
                };
            });

            this.finish_date_picker();

            // month view change date...
        }
    }
}

module.exports = Date_Picker;