'use strict';

/**
 * Value Editors — barrel index.
 * 
 * Requiring this file registers all built-in editors with the registry.
 */

const value_editor_registry = require('./value_editor_registry');
const Value_Editor_Base = require('./Value_Editor_Base');

// Each require self-registers with the registry
const Text_Value_Editor = require('./Text_Value_Editor');
const Number_Value_Editor = require('./Number_Value_Editor');
const Boolean_Value_Editor = require('./Boolean_Value_Editor');
const Enum_Value_Editor = require('./Enum_Value_Editor');
const Date_Value_Editor = require('./Date_Value_Editor');
const Color_Value_Editor = require('./Color_Value_Editor');

module.exports = {
    ...value_editor_registry,
    Value_Editor_Base,
    Text_Value_Editor,
    Number_Value_Editor,
    Boolean_Value_Editor,
    Enum_Value_Editor,
    Date_Value_Editor,
    Color_Value_Editor
};
