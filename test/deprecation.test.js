/**
 * Deprecation Utilities Tests
 *
 * Tests for the deprecation warning system including:
 * - deprecation_warning function
 * - create_deprecated_alias function
 * - Legacy alias exports (FormField, PropertyEditor)
 */

const { expect } = require('chai');

// Import deprecation utilities
const {
    deprecation_warning,
    create_deprecated_alias,
    clear_warnings,
    has_warned
} = require('../utils/deprecation');

// Import controls to test deprecated aliases
const controls = require('../controls/controls');

describe('Deprecation Utilities Tests', () => {
    let originalConsoleWarn;
    let warnings;

    beforeEach(() => {
        // Capture console.warn calls
        warnings = [];
        originalConsoleWarn = console.warn;
        console.warn = (...args) => {
            warnings.push(args.join(' '));
        };

        // Clear the warning cache before each test
        clear_warnings();
    });

    afterEach(() => {
        // Restore console.warn
        console.warn = originalConsoleWarn;
        clear_warnings();
    });

    describe('deprecation_warning', () => {
        it('should emit a warning with old and new names', () => {
            deprecation_warning('OldName', 'New_Name');

            expect(warnings).to.have.lengthOf(1);
            expect(warnings[0]).to.include('OldName');
            expect(warnings[0]).to.include('New_Name');
            expect(warnings[0]).to.include('deprecated');
        });

        it('should include removal version in warning', () => {
            deprecation_warning('OldName', 'New_Name', '2.0.0');

            expect(warnings[0]).to.include('2.0.0');
        });

        it('should default to v1.0.0 removal version', () => {
            deprecation_warning('OldName', 'New_Name');

            expect(warnings[0]).to.include('1.0.0');
        });

        it('should only warn once per old/new pair', () => {
            deprecation_warning('OldName', 'New_Name');
            deprecation_warning('OldName', 'New_Name');
            deprecation_warning('OldName', 'New_Name');

            expect(warnings).to.have.lengthOf(1);
        });

        it('should warn separately for different pairs', () => {
            deprecation_warning('OldName1', 'New_Name1');
            deprecation_warning('OldName2', 'New_Name2');

            expect(warnings).to.have.lengthOf(2);
        });
    });

    describe('has_warned', () => {
        it('should return false before warning', () => {
            expect(has_warned('OldName', 'New_Name')).to.be.false;
        });

        it('should return true after warning', () => {
            deprecation_warning('OldName', 'New_Name');
            expect(has_warned('OldName', 'New_Name')).to.be.true;
        });
    });

    describe('clear_warnings', () => {
        it('should reset the warning cache', () => {
            deprecation_warning('OldName', 'New_Name');
            expect(has_warned('OldName', 'New_Name')).to.be.true;

            clear_warnings();

            expect(has_warned('OldName', 'New_Name')).to.be.false;
        });

        it('should allow warnings to be emitted again', () => {
            deprecation_warning('OldName', 'New_Name');
            clear_warnings();
            deprecation_warning('OldName', 'New_Name');

            expect(warnings).to.have.lengthOf(2);
        });
    });

    describe('create_deprecated_alias', () => {
        it('should return the canonical module', () => {
            const canonical = { foo: 'bar' };
            const alias = create_deprecated_alias(canonical, 'OldModule', 'New_Module');

            expect(alias).to.equal(canonical);
        });

        it('should emit a deprecation warning', () => {
            const canonical = { foo: 'bar' };
            create_deprecated_alias(canonical, 'OldModule', 'New_Module');

            expect(warnings).to.have.lengthOf(1);
            expect(warnings[0]).to.include('OldModule');
            expect(warnings[0]).to.include('New_Module');
        });

        it('should include custom removal version', () => {
            const canonical = { foo: 'bar' };
            create_deprecated_alias(canonical, 'OldModule', 'New_Module', '3.0.0');

            expect(warnings[0]).to.include('3.0.0');
        });
    });

    describe('Deprecated Control Aliases', () => {
        let context;

        beforeEach(() => {
            context = createTestContext();
        });

        describe('FormField alias', () => {
            it('should exist on controls object', () => {
                expect(controls.FormField).to.exist;
            });

            it('should be the same as Form_Field', () => {
                // Both should reference the same underlying class
                expect(controls.FormField).to.equal(controls.Form_Field);
            });

            it('should be in deprecated namespace', () => {
                expect(controls.deprecated).to.exist;
                expect(controls.deprecated.FormField).to.exist;
            });

            it('should create a working control', () => {
                const field = new controls.FormField({
                    context,
                    name: 'test_field',
                    label: 'Test',
                    field_type: 'text'
                });

                expect(field).to.exist;
                expect(field.html).to.be.a('string');
            });
        });

        describe('PropertyEditor alias', () => {
            it('should exist on controls object', () => {
                expect(controls.PropertyEditor).to.exist;
            });

            it('should be the same as Property_Editor', () => {
                expect(controls.PropertyEditor).to.equal(controls.Property_Editor);
            });

            it('should be in deprecated namespace', () => {
                expect(controls.deprecated.PropertyEditor).to.exist;
            });

            it('should create a working control', () => {
                const editor = new controls.PropertyEditor({
                    context,
                    properties: [
                        { name: 'test_prop', type: 'string', value: 'test' }
                    ]
                });

                expect(editor).to.exist;
                expect(editor.html).to.be.a('string');
            });
        });
    });

    describe('Deprecated namespace structure', () => {
        it('should have deprecated property on controls', () => {
            expect(controls.deprecated).to.be.an('object');
        });

        it('should have experimental property on controls', () => {
            expect(controls.experimental).to.be.an('object');
        });

        it('should expose deprecated controls at top level for backwards compatibility', () => {
            // Top-level access should work (for backwards compat)
            expect(controls.FormField).to.exist;
            expect(controls.PropertyEditor).to.exist;
        });
    });
});
