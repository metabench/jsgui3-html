/*
    Used to display the contents of a month
    A component of other controls, such as Calendar, Date_Picker

    Could inherit from Grid.
    Just shows the month's days inside.
*/

var jsgui = require('../html-core/html-core');
const clone = jsgui.clone;
// A general purpose grid...
//  Have something with a similar API to Vectorious?
//var Data_Grid = jsgui.Data_Grid;

var stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof,
    is_defined = jsgui.is_defined;
var Control = jsgui.Control;

const Grid = require('./grid');

const Tile_Slider = require('./tile-slide');
// Don't want very much logic or code related to tile sliding right here.
//  

// clone_to_previous
// clone_to_next

// There can be some ways for controls to support tile sliding.

// A Tile_Slide_View or Tile_Slide_Panel would be useful.
//  

// Tile_Slide will be Control Transformer.
//  Transforms a control into another control.
//  May contain that initial control.


// const TS_Month_View = Tile_Slide({
//  'Ctrl': Month_View,
//  'previous': function that reduces the spec's month by 1 including handling year breaks
//  'next': function to increase spec by 1 month
// })

let days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

let bgc_disabled = '#DDDDDD';
let bgc_enabled = 'inherit';

const mx_date = require(`../control_mixins/date`);
const mx_selectable = require(`../control_mixins/selectable`);

// Want this to keep the same day in the month if possible.

class Month_View extends Grid {
    constructor(spec) {
        // M T W T F S S
        spec.grid_size = [7, 7];
        spec.size = spec.size || [360, 200];

        // Up to 5 weeks shows, top row for title
        spec.__type_name = 'month_view';
        super(spec);

        // months are 0 indexed (for consistency with other things.)
        mx_date(this, spec);

        /*
        if (is_defined(spec.year) && is_defined(spec.month)) {
            //console.log('are defined');
            this.month = spec.month; // 0 indexed
            this.year = spec.year;
        } else {
            let now = new Date();
            //console.log('now', now);
            this.month = now.getMonth(); // 0 indexed
            this.year = now.getFullYear();
        }
        */
        // 7 * 5 grid

        // problem is compose will override the previous compose 
        //  giving them more specific names.

        if (!spec.el) {
            this.compose_month_view();
        }

        //this.selection_scope();
        //this.selection_scope = this.context.new_selection_scope();
        this.context.new_selection_scope(this);
        // putting selection_scope true in the data-jsgui-fields would be nice.
        //this.selectable();
    }
    activate() {
        // respond to a date / cell being selected.
        super.activate();
        // want a selector for .something. Select by class
        // selection_change event?
        //each(this.$('control'), control
        let cells = this.$('grid_cell');
        //console.log('cells.length', cells.length);
        each(cells, cell => {
            //console.log('cell', cell);
            ///console.log('cell.selectable', cell.selectable);
            //cell.selectable = true;

            mx_selectable(cell);

            cell.on('change', e_change => {
                if (e_change.name === 'selected') {
                    if (e_change.value) {
                        if (is_defined(cell.value)) this.day = cell.value;
                    }
                }
            });

            /*

            cell.on('select', () => {
                // day of month change.

                console.log('cell selected');

                if (is_defined(cell.value)) this.day = cell.value;

                this.raise('change', {
                    name: 'select',
                    value: cell
                })
            })
            */
        });
        // want to go through all cells / controls.
    }
    compose_month_view() {

        this.refresh_month_view();
        

        let old = () => {
            // go through the month in question.
            // get date for 1st of that month
            // Put rows into the header.
            this.add_class('month-view');
            //this.add_class('month');
            let days_row = this._arr_rows[0];
            days_row.add_class('days');
            days_row.add_class('header');
            //console.log('days_row.content', days_row.content);
            //console.log('days_row.content._arr[0]', days_row.content._arr[0]);

            // Creates new spans here.
            //  At other points, we need to change the values in those spans.
            // Consider composition of spans separate to filling their data in.
            each(days_row.content._arr, (ctrl_header_cell, i) => {
                //console.log('ctrl_header_cell', ctrl_header_cell);
                /*
                let day_span = new jsgui.span({
                    'context': this.context,
                    'text': days[i]
                });
                day_span.add_class('day');
                ctrl_header_cell.add(day_span);
                */
                
            });

            // Need to go through the days of the month, putting the number in the appropriate cell.
            //  To start with, need to find the cell for the 1st of the month.
            // this.rows[x]?

            let cell_pos = [0, 1];
            let ctrl_row = this._arr_rows[cell_pos[1]];
            let advance_cell = () => {
                //console.log('cell_pos', cell_pos);
                //if no more in the control this._arr_rows...
                if (cell_pos[0] === ctrl_row.content._arr.length - 1) {

                    // have we reached the end now?

                    if (cell_pos[1] < this._arr_rows.length - 1) {
                        cell_pos[0] = 0;
                        cell_pos[1]++;
                        ctrl_row = this._arr_rows[cell_pos[1]];
                    } else {
                        // it's on the last one. no more now.
                        return false;
                    }
                } else {
                    cell_pos[0]++;
                }
                return true;
            }
            //console.log('this.year, this.month', this.year, this.month);
            let d = new Date(this.year, this.month, 1);
            //console.log('d', d);
            // day of week
            //  sunday is 0 from JS. I prefer monday to be 0
            //console.log('d.getDay()', d.getDay());

            let got_day = d.getDay() - 1;
            if (got_day < 0) got_day = 6;
            //console.log('got_day', got_day);

            let day_name = days[got_day];
            // need to progress until the position is aligned with the beginning of the week.

            // A Cell control could be useful.

            while (cell_pos[0] < got_day) {
                //console.log('cell_pos[0]', cell_pos[0]);

                let cell = ctrl_row.content._arr[cell_pos[0]];

                /*

                let day_span = new jsgui.span({
                    context: this.context,
                    text: ''
                });
                cell.add(day_span);
                */
                cell.selectable = false;
                cell.select_unique = true;

                cell.background.color = bgc_disabled;
                cell_pos[0]++;
            }

            // Still need to make sure it's within the month
            //let date_of_month = 1;
            let did_advance = true;

            while (did_advance) {
                //console.log('cell_pos[0]', cell_pos[0]);
                let cell = ctrl_row.content._arr[cell_pos[0]];

                /*

                let day_span = new jsgui.span({
                    context: this.context,
                    text: d.getDate() + ''
                });
                cell.add(day_span);

                */
                cell.selectable = true;
                cell.select_unique = true;
                cell.value = d.getDate();
                cell._fields = cell._fields || {};
                cell._fields.value = cell.value;

                d.setDate(d.getDate() + 1);
                did_advance = advance_cell() && d.getDate() !== 1;
            }

            while (cell_pos[0] <= 6) {
                //console.log('cell_pos[0]', cell_pos[0]);
                let cell = ctrl_row.content._arr[cell_pos[0]];

                /*

                let day_span = new jsgui.span({
                    context: this.context,
                    text: ''
                });
                cell.add(day_span);
                */
                //cell.selectable = true;
                cell.selectable = false;
                cell.select_unique = true;

                cell.background.color = bgc_disabled;
                cell_pos[0]++;
            }

            if (cell_pos[1] < 6) {
                cell_pos[0] = 0;
                cell_pos[1] = 6;
                ctrl_row = this._arr_rows[cell_pos[1]];
                while (cell_pos[0] <= 6) {

                    let cell = ctrl_row.content._arr[cell_pos[0]];

                    /*

                    let day_span = new jsgui.span({
                        context: this.context,
                        text: ''
                    });
                    cell.add(day_span);
                    */
                    cell.selectable = false;
                    cell.select_unique = true;
                    //cell.selectable = true;

                    //console.log('cell.selectable', cell.selectable);

                    //console.log('cell_pos[0]', cell_pos[0]);
                    ctrl_row.content._arr[cell_pos[0]].background.color = bgc_disabled;
                    cell_pos[0]++;
                }
            }
            // A delegate for on cell select?
        }
        
    }

    // refresh_month_view
    // or update
    // iterate through the grid cells

    refresh_month_view() {
        // Day of week of 1st date in month...

        let d = new Date(this.year, this.month, 1);
        let m = d.getMonth();
        let got_day = d.getDay() - 1;
        if (got_day < 0) got_day = 6;
        //console.log('got_day', got_day);
        console.log('got_day', got_day);

        let day_name = days[got_day];

        let d_ctrl;

        let day = this.day;

        this.each_cell((cell, cell_pos) => {
            console.log('cell_pos', cell_pos);

            let [x, y] = cell_pos;
            if (y > 0) {
                if (y === 1) {
                    if (x < got_day) {
                        cell.background.color = bgc_disabled;
                        cell.selectable = false;

                        // only on client?
                        if (cell.deselect) cell.deselect();
                        cell.value = null;
                        // remove text in the span.
                        //cell.find('span')[0].text = '';
                        //console.log(cell.content._arr)
                        cell.iterate_this_and_subcontrols(ctrl => {
                            //console.log('ctrl', ctrl);
                            //console.log('ctrl.dom.tagName', ctrl.dom.tagName);
                            if (ctrl.dom.tagName === 'span') {
                                ctrl.text = '';
                            }
                        });

                    } else {
                        cell.background.color = bgc_enabled;
                        cell.selectable = true;

                        cell.iterate_this_and_subcontrols(ctrl => {
                            //console.log('ctrl', ctrl);
                            //console.log('ctrl.dom.tagName', ctrl.dom.tagName);
                            if (ctrl.dom.tagName === 'span') {
                                d_ctrl = d.getDate();
                                cell.value = d_ctrl;
                                ctrl.text = d_ctrl + '';
                                d.setDate(d.getDate() + 1);

                                //console.log('d_ctrl', d_ctrl);
                                //console.log('day', day);

                                if (d_ctrl === day) {
                                    cell.action_select_only();
                                }
                            }
                        });
                    }
                } else {
                    let dm = d.getMonth();
                    //console.log('dm', dm);
                    if (dm === m) {
                        cell.background.color = bgc_enabled;
                        cell.selectable = true;
                        cell.iterate_this_and_subcontrols(ctrl => {
                            //console.log('ctrl', ctrl);
                            //console.log('ctrl.dom.tagName', ctrl.dom.tagName);
                            if (ctrl.dom.tagName === 'span') {
                                d_ctrl = d.getDate();
                                console.log('d_ctrl', d_ctrl);
                                cell.value = d_ctrl;
                                ctrl.text = d_ctrl + '';
                                d.setDate(d.getDate() + 1);

                                //console.log('d_ctrl', d_ctrl);
                                //console.log('day', day);

                                if (d_ctrl === day) {
                                    cell.action_select_only();
                                }
                            }
                        });
                    } else {
                        cell.background.color = bgc_disabled;
                        cell.selectable = false;
                        if (cell.deselect) cell.deselect();
                        cell.value = null;
                        // remove text in the span.
                        //cell.find('span')[0].text = '';

                        //console.log(cell.content._arr)

                        cell.iterate_this_and_subcontrols(ctrl => {
                            //console.log('ctrl', ctrl);
                            //console.log('ctrl.dom.tagName', ctrl.dom.tagName);
                            if (ctrl.dom.tagName === 'span') {
                                ctrl.text = '';
                            }
                        });
                    }
                }
            }
        });

        //console.log('this.day', this.day);
    }

    // a mechanism for refreshing the UI based on changes in data.
    // can iterate the month cells
    //  a different algorythm could know which cell corresponds to which.


    // previous and next

    // choose a different month, re-render the data in the cells.
    //  change what's in the spans.

    // Will have a very different transition system to using slides.
    //  That transition system will change what month is displayed in a single month view in order to do its things.

    // recompose - take a spec, and modify the current object to match that spec.
    //  recompose seems like it would be very useful for the sliding tile system.

    // recompose_month_view

}

Month_View.Tiled = Tile_Slider.wrap(Month_View, spec => {
    spec = clone(spec);
    if (!is_defined(spec.month)) {
        let now = new Date();
        //console.log('now', now);
        spec.month = now.getMonth(); // 0 indexed
        spec.year = now.getFullYear();
    }
    //console.log('spec.month', spec.month);
    spec.month = spec.month - 1;
    //console.log('spec.month', spec.month);
    if (spec.month < 0) {
        spec.month = 11;
        spec.year = spec.year - 1;
    }
    //console.log('spec', spec);
    return spec;
}, spec => {
    spec = clone(spec);
    if (!is_defined(spec.month)) {
        let now = new Date();
        //console.log('now', now);
        spec.month = now.getMonth(); // 0 indexed
        spec.year = now.getFullYear();
    }
    spec.month = spec.month + 1;
    if (spec.month > 11) {
        spec.month = 0;
        spec.year = spec.year + 1;
    }
    return spec;
});

module.exports = Month_View;