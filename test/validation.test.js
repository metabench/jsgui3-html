/**
 * Validation System Tests
 *
 * Tests for the validation engine, Error_Summary, and Inline_Validation_Message.
 */

const { expect } = require('chai');

// Import validation modules
const { Validation_Engine, default_engine, format_message } = require('../validation/validation_engine');
const Error_Summary = require('../validation/error_summary');
const Inline_Validation_Message = require('../controls/organised/1-standard/1-editor/inline_validation_message');
const controls = require('../controls/controls');

describe('Validation System Tests', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    describe('Validation_Engine', () => {
        describe('constructor', () => {
            it('should create engine with built-in rules', () => {
                const engine = new Validation_Engine();
                expect(engine.has_rule('required')).to.be.true;
                expect(engine.has_rule('email')).to.be.true;
                expect(engine.has_rule('min_length')).to.be.true;
                expect(engine.has_rule('max_length')).to.be.true;
            });
        });

        describe('register_rule', () => {
            it('should register a custom rule', () => {
                const engine = new Validation_Engine();
                engine.register_rule('custom_test', (value) => value === 'valid');

                expect(engine.has_rule('custom_test')).to.be.true;
            });

            it('should throw on invalid rule name', () => {
                const engine = new Validation_Engine();
                expect(() => engine.register_rule('', () => true)).to.throw();
                expect(() => engine.register_rule('   ', () => true)).to.throw();
            });

            it('should throw on invalid validator', () => {
                const engine = new Validation_Engine();
                expect(() => engine.register_rule('test', null)).to.throw();
                expect(() => engine.register_rule('test', 'not a function')).to.throw();
            });
        });

        describe('unregister_rule', () => {
            it('should remove a registered rule', () => {
                const engine = new Validation_Engine();
                engine.register_rule('temp_rule', () => true);
                expect(engine.has_rule('temp_rule')).to.be.true;

                const result = engine.unregister_rule('temp_rule');
                expect(result).to.be.true;
                expect(engine.has_rule('temp_rule')).to.be.false;
            });
        });

        describe('get_rule_names', () => {
            it('should return all registered rule names', () => {
                const engine = new Validation_Engine();
                const names = engine.get_rule_names();

                expect(names).to.include('required');
                expect(names).to.include('email');
                expect(names).to.include('min_length');
            });
        });

        describe('validate', () => {
            it('should validate required rule', async () => {
                const engine = new Validation_Engine();

                const valid = await engine.validate('test', ['required']);
                expect(valid.valid).to.be.true;

                const invalid = await engine.validate('', ['required']);
                expect(invalid.valid).to.be.false;
                expect(invalid.errors).to.have.lengthOf(1);
            });

            it('should validate email rule', async () => {
                const engine = new Validation_Engine();

                const valid = await engine.validate('test@example.com', ['email']);
                expect(valid.valid).to.be.true;

                const invalid = await engine.validate('not-an-email', ['email']);
                expect(invalid.valid).to.be.false;
            });

            it('should validate min_length rule', async () => {
                const engine = new Validation_Engine();

                const valid = await engine.validate('hello', [{ name: 'min_length', options: { min: 3 } }]);
                expect(valid.valid).to.be.true;

                const invalid = await engine.validate('hi', [{ name: 'min_length', options: { min: 3 } }]);
                expect(invalid.valid).to.be.false;
            });

            it('should validate max_length rule', async () => {
                const engine = new Validation_Engine();

                const valid = await engine.validate('hi', [{ name: 'max_length', options: { max: 5 } }]);
                expect(valid.valid).to.be.true;

                const invalid = await engine.validate('hello world', [{ name: 'max_length', options: { max: 5 } }]);
                expect(invalid.valid).to.be.false;
            });

            it('should validate pattern rule', async () => {
                const engine = new Validation_Engine();

                const valid = await engine.validate('abc123', [{ name: 'pattern', options: { pattern: /^[a-z0-9]+$/ } }]);
                expect(valid.valid).to.be.true;

                const invalid = await engine.validate('ABC!@#', [{ name: 'pattern', options: { pattern: /^[a-z0-9]+$/ } }]);
                expect(invalid.valid).to.be.false;
            });

            it('should validate range rule', async () => {
                const engine = new Validation_Engine();

                const valid = await engine.validate(50, [{ name: 'range', options: { min: 0, max: 100 } }]);
                expect(valid.valid).to.be.true;

                const invalid = await engine.validate(150, [{ name: 'range', options: { min: 0, max: 100 } }]);
                expect(invalid.valid).to.be.false;
            });

            it('should validate equals rule', async () => {
                const engine = new Validation_Engine();
                const context = { password: 'secret123' };

                const valid = await engine.validate('secret123', [{ name: 'equals', options: { field: 'password' } }], context);
                expect(valid.valid).to.be.true;

                const invalid = await engine.validate('different', [{ name: 'equals', options: { field: 'password' } }], context);
                expect(invalid.valid).to.be.false;
            });

            it('should validate multiple rules', async () => {
                const engine = new Validation_Engine();

                const result = await engine.validate('', ['required', 'email']);
                expect(result.valid).to.be.false;
                expect(result.errors.length).to.be.greaterThan(0);
            });

            it('should accept object-style rules', async () => {
                const engine = new Validation_Engine();

                const result = await engine.validate('test', {
                    required: true,
                    min_length: { min: 2 }
                });
                expect(result.valid).to.be.true;
            });

            it('should handle async validators', async () => {
                const engine = new Validation_Engine();
                engine.register_rule('async_test', async (value) => {
                    return new Promise(resolve => {
                        setTimeout(() => resolve(value === 'valid'), 10);
                    });
                });

                const valid = await engine.validate('valid', ['async_test']);
                expect(valid.valid).to.be.true;

                const invalid = await engine.validate('invalid', ['async_test']);
                expect(invalid.valid).to.be.false;
            });
        });

        describe('validate_all', () => {
            it('should validate multiple fields', async () => {
                const engine = new Validation_Engine();

                const values = {
                    email: 'test@example.com',
                    password: 'short'
                };

                const rules = {
                    email: ['required', 'email'],
                    password: ['required', { name: 'min_length', options: { min: 8 } }]
                };

                const result = await engine.validate_all(values, rules);
                expect(result.valid).to.be.false;
                expect(result.errors.email.valid).to.be.true;
                expect(result.errors.password.valid).to.be.false;
            });
        });
    });

    describe('format_message', () => {
        it('should format placeholders', () => {
            const result = format_message('Must be at least {min} characters', { min: 5 });
            expect(result).to.equal('Must be at least 5 characters');
        });

        it('should handle multiple placeholders', () => {
            const result = format_message('Must be between {min} and {max}', { min: 1, max: 100 });
            expect(result).to.equal('Must be between 1 and 100');
        });

        it('should leave unknown placeholders unchanged', () => {
            const result = format_message('Value is {unknown}', {});
            expect(result).to.equal('Value is {unknown}');
        });
    });

    describe('default_engine', () => {
        it('should be a singleton instance', () => {
            expect(default_engine).to.be.instanceOf(Validation_Engine);
            expect(default_engine.has_rule('required')).to.be.true;
        });
    });

    describe('Error_Summary', () => {
        it('should create error summary control', () => {
            const summary = new Error_Summary({ context });
            expect(summary).to.exist;
            expect(summary.html).to.include('error-summary');
        });

        it('should set errors', () => {
            const summary = new Error_Summary({ context });
            summary.set_errors({
                email: 'Invalid email address',
                password: 'Password is required'
            });

            expect(summary.error_count).to.equal(2);
            expect(summary.has_errors()).to.be.true;
        });

        it('should clear errors', () => {
            const summary = new Error_Summary({ context });
            summary.set_errors({ email: 'Error' });
            summary.clear();

            expect(summary.error_count).to.equal(0);
            expect(summary.has_errors()).to.be.false;
        });

        it('should add individual error', () => {
            const summary = new Error_Summary({ context });
            summary.add_error('field1', 'Error 1');
            summary.add_error('field2', 'Error 2');

            expect(summary.error_count).to.equal(2);
        });

        it('should remove individual error', () => {
            const summary = new Error_Summary({ context });
            summary.set_errors({
                field1: 'Error 1',
                field2: 'Error 2'
            });

            summary.remove_error('field1');
            expect(summary.error_count).to.equal(1);
        });

        it('should have ARIA attributes', () => {
            const summary = new Error_Summary({ context });
            expect(summary.html).to.include('role="alert"');
            expect(summary.html).to.include('aria-live="polite"');
        });

        it('should be exported from controls', () => {
            expect(controls.Error_Summary).to.exist;
            expect(controls.Error_Summary).to.equal(Error_Summary);
        });
    });

    describe('Inline_Validation_Message', () => {
        it('should create validation message control', () => {
            const msg = new Inline_Validation_Message({ context });
            expect(msg).to.exist;
            expect(msg.html).to.include('inline-validation-message');
        });

        it('should set message and status', () => {
            const msg = new Inline_Validation_Message({ context });
            msg.set_message('Error message', 'error');

            expect(msg.get_message()).to.equal('Error message');
            expect(msg.status).to.equal('error');
        });

        it('should have ARIA attributes', () => {
            const msg = new Inline_Validation_Message({ context });
            expect(msg.html).to.include('role="status"');
            expect(msg.html).to.include('aria-live="polite"');
        });

        it('should have convenience methods', () => {
            const msg = new Inline_Validation_Message({ context });

            msg.set_error('Error');
            expect(msg.status).to.equal('error');

            msg.set_success('Success');
            expect(msg.status).to.equal('success');

            msg.set_warning('Warning');
            expect(msg.status).to.equal('warn');

            msg.set_info('Info');
            expect(msg.status).to.equal('info');
        });

        it('should clear validation', () => {
            const msg = new Inline_Validation_Message({ context });
            msg.set_error('Error message');

            msg.clear_validation();
            expect(msg.get_message()).to.equal('');
            expect(msg.status).to.equal('');
        });

        it('should show icon when status is set', () => {
            const msg = new Inline_Validation_Message({
                context,
                message: 'Test',
                status: 'error',
                show_icon: true
            });

            expect(msg.html).to.include('inline-validation-icon');
        });
    });
});
