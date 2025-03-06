const jsgui = require('../../../../../html-core/html-core');
const clone = jsgui.clone;
const each = jsgui.each, is_defined = jsgui.is_defined;
const Grid = require('./grid');
const Tile_Slider = require('../../../1-standard/6-layout/tile-slide');
let days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
let bgc_disabled = '#DDDDDD';
let bgc_enabled = 'inherit';
const mx_date = require(`../../../../../control_mixins/typed_data/date`);
class Month_View extends Grid {
    constructor(spec) {
        spec.grid_size = [7,7]; spec.size = spec.size || [360,200]; spec.__type_name = 'month_view';
        super(spec); mx_date(this, spec);
        if (!spec.el) { this.compose_month_view(); }
        this.context.new_selection_scope(this);
    }
    activate() {
        super.activate();
        let cells = this.$('grid_cell');
        each(cells, cell => {
            //cell.selectable = true;
            cell.on('change', e_change => {
                if(e_change.name==='selected' && e_change.value && is_defined(cell.value)) { this.day = cell.value; }
            });
        });
    }
    compose_month_view() {
        this.refresh_month_view(); this.add_class('month-view');
        let days_row = this._arr_rows[0]; 
        days_row.add_class('days'); days_row.add_class('header');
        // Insert day name abbreviations using cell.span.add():
        each(days_row.content._arr, (cell, i) => { if(cell.span) { cell.span.add(days[i]); } });
        let cell_pos = [0,1], ctrl_row = this._arr_rows[cell_pos[1]];
        let advance_cell = () => {
            if(cell_pos[0] === ctrl_row.content._arr.length - 1) {
                if(cell_pos[1] < this._arr_rows.length - 1) { cell_pos[0] = 0; cell_pos[1]++; ctrl_row = this._arr_rows[cell_pos[1]]; }
                else return false;
            } else { cell_pos[0]++; }
            return true;
        };
        let d = new Date(this.year, this.month, 1);
        let got_day = d.getDay() - 1; if(got_day < 0) got_day = 6;
        while(cell_pos[0] < got_day) {
            let cell = ctrl_row.content._arr[cell_pos[0]++];
            cell.selectable = false; cell.select_unique = true; cell.background.color = bgc_disabled;
        }
        let did_advance = true;
        while(did_advance) {
            let cell = ctrl_row.content._arr[cell_pos[0]];
            cell.selectable = true; cell.select_unique = true; cell.value = d.getDate();
            cell._fields = cell._fields || {}; cell._fields.value = cell.value;
            d.setDate(d.getDate() + 1);
            did_advance = advance_cell() && d.getDate() !== 1;
        }
        while(cell_pos[0] <= 6) {
            let cell = ctrl_row.content._arr[cell_pos[0]++];
            cell.selectable = false; cell.select_unique = true; cell.background.color = bgc_disabled;
        }
        if(cell_pos[1] < 6) {
            cell_pos = [0, 6]; ctrl_row = this._arr_rows[cell_pos[1]];
            while(cell_pos[0] <= 6) {
                let cell = ctrl_row.content._arr[cell_pos[0]++];
                cell.selectable = false; cell.select_unique = true; cell.background.color = bgc_disabled;
            }
        }
    }
    refresh_month_view() {
        let d = new Date(this.year, this.month, 1), m = d.getMonth();
        let got_day = d.getDay() - 1; if(got_day < 0) got_day = 6;
        let day = this.day;
        this.each_cell((cell, cell_pos) => {
            let [x, y] = cell_pos;
            if(y > 0) {
                if(y === 1) {
                    if(x < got_day) {
                        cell.background.color = bgc_disabled; cell.selectable = false;
                        if(cell.deselect) cell.deselect(); cell.value = null;
                        cell.iterate_this_and_subcontrols(ctrl => { if(ctrl.dom.tagName === 'span') ctrl.text = ''; });
                    } else {
                        cell.background.color = bgc_enabled; cell.selectable = true;
                        cell.span.add(d.getDate() + ''); d.setDate(d.getDate() + 1);
                    }
                } else {
                    let dm = d.getMonth();
                    if(dm === m) {
                        cell.background.color = bgc_enabled; cell.selectable = true;
                        cell.span.add(d.getDate() + ''); d.setDate(d.getDate() + 1);
                    } else {
                        cell.background.color = bgc_disabled; cell.selectable = false;
                        if(cell.deselect) cell.deselect(); cell.value = null;
                    }
                }
            }
        });
    }
}
Month_View.Tiled = Tile_Slider.wrap(Month_View, spec => {
    spec = clone(spec);
    if(!is_defined(spec.month)) {
        let now = new Date();
        spec.month = now.getMonth(); spec.year = now.getFullYear();
    }
    spec.month = spec.month - 1; if(spec.month < 0) { spec.month = 11; spec.year = spec.year - 1; }
    return spec;
}, spec => {
    spec = clone(spec);
    if(!is_defined(spec.month)) {
        let now = new Date();
        spec.month = now.getMonth(); spec.year = now.getFullYear();
    }
    spec.month = spec.month + 1; if(spec.month > 11) { spec.month = 0; spec.year = spec.year + 1; }
    return spec;
});
module.exports = Month_View;