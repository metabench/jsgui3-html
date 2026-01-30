const Date_Picker_Progressive = require('./date_picker_progressive');

class Date_Picker_Dropdown extends Date_Picker_Progressive {
    constructor(spec = {}) {
        super(Object.assign({}, spec, { mode: 'dropdown' }));
        this.add_class('date-picker-dropdown');
    }
}

module.exports = Date_Picker_Dropdown;
