/**
 * DEPRECATED: PropertyEditor is deprecated.
 * Use Property_Editor from property_editor.js instead.
 *
 * This file provides backwards compatibility and will be removed in v1.0.0.
 */

'use strict';

const { create_deprecated_alias } = require('../../../../utils/deprecation');
const Property_Editor = require('./property_editor');

module.exports = create_deprecated_alias(
    Property_Editor,
    'PropertyEditor',
    'Property_Editor',
    '1.0.0'
);
