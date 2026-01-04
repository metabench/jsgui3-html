/**
 * DEPRECATED: FormField is deprecated.
 * Use Form_Field from form_field.js instead.
 *
 * This file provides backwards compatibility and will be removed in v1.0.0.
 */

'use strict';

const { create_deprecated_alias } = require('../../../../utils/deprecation');
const Form_Field = require('./form_field');

module.exports = create_deprecated_alias(
    Form_Field,
    'FormField',
    'Form_Field',
    '1.0.0'
);
