const Text_Input = require('./Text_Input');

class Email_Input extends Text_Input {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'email_input';
        super(spec);
        this.add_class('email-input');
        this.dom.attributes.type = 'email';
    }
}

module.exports = Email_Input;
