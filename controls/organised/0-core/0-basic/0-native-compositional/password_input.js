const Text_Input = require('./Text_Input');

class Password_Input extends Text_Input {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'password_input';
        super(spec);
        this.add_class('password-input');
        this.dom.attributes.type = 'password';
    }
}

module.exports = Password_Input;
