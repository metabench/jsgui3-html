const Date_Picker_Progressive = require('./date_picker_progressive');

class Date_Picker_Inline extends Date_Picker_Progressive {
    constructor(spec = {}) {
        super(Object.assign({}, spec, { mode: 'inline' }));
        this.add_class('date-picker-inline');
        if (this._ctrl_fields && this._ctrl_fields.calendar) {
            this._ctrl_fields.calendar.show();
        }
    }
}

module.exports = Date_Picker_Inline;
