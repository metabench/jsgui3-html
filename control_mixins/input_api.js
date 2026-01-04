'use strict';

/**
 * Apply unified input API to a control.
 * @param {Control} ctrl - Control to update.
 * @param {Object} [options] - Optional settings.
 */
const apply_full_input_api = (ctrl, options = {}) => {
    const { apply_input_base } = require('./input_base');
    const { apply_input_validation } = require('./input_validation');

    apply_input_base(ctrl, options);
    apply_input_validation(ctrl, options);
};

module.exports = {
    apply_full_input_api
};
