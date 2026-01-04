'use strict';

/**
 * Validation Module
 *
 * Provides validation engine, built-in validators, and error display components.
 */

const { Validation_Engine, default_engine, format_message } = require('./validation_engine');
const Error_Summary = require('./error_summary');

module.exports = {
    Validation_Engine,
    default_engine,
    format_message,
    Error_Summary
};
