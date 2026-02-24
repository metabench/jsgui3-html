const Select_Options = require('./Select_Options');

class Dropdown_List extends Select_Options {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'dropdown_list';
        super(spec);
        this.add_class('dropdown-list');
    }
}

module.exports = Dropdown_List;
