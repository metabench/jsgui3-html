const Date_Picker_Progressive = require('./date_picker_progressive');

class Date_Picker_Range extends Date_Picker_Progressive {
    constructor(spec = {}) {
        super(Object.assign({}, spec, { mode: 'range' }));
        this.add_class('date-picker-range');
    }
}

module.exports = Date_Picker_Range;
