const Text_Input = require('./Text_Input');

class Tel_Input extends Text_Input {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'tel_input';
        super(spec);
        this.add_class('tel-input');
        this.dom.attributes.type = 'tel';
    }
}

module.exports = Tel_Input;
