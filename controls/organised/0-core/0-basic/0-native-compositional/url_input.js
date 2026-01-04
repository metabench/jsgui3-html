const Text_Input = require('./Text_Input');

class Url_Input extends Text_Input {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'url_input';
        super(spec);
        this.add_class('url-input');
        this.dom.attributes.type = 'url';
    }
}

const { register_swap } = require('../../../../../control_mixins/swap_registry');

const should_enhance = el => {
    if (!el || !el.classList) return false;
    if (el.classList.contains('jsgui-enhance')) return true;
    if (typeof el.closest === 'function' && el.closest('.jsgui-form')) return true;
    return false;
};

register_swap('input[type="url"]', Url_Input, {
    enhancement_mode: 'enhance',
    predicate: should_enhance
});

module.exports = Url_Input;
