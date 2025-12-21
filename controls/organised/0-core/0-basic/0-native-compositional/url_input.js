const Text_Input = require('./Text_Input');

class Url_Input extends Text_Input {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'url_input';
        super(spec);
        this.add_class('url-input');
        this.dom.attributes.type = 'url';
    }
}

module.exports = Url_Input;
