const { expect } = require('chai');
const sinon = require('sinon');

const {
    deprecation_warning,
    create_deprecated_alias,
    clear_warnings,
    has_warned
} = require('../../utils/deprecation');

describe('Deprecation Utilities', () => {
    let warn_stub;
    let original_env;

    beforeEach(() => {
        original_env = process.env.NODE_ENV;
        warn_stub = sinon.stub(console, 'warn');
        clear_warnings();
    });

    afterEach(() => {
        process.env.NODE_ENV = original_env;
        if (warn_stub) warn_stub.restore();
        clear_warnings();
    });

    it('should warn once per old/new pair', () => {
        deprecation_warning('Old_Name', 'New_Name', '2.0.0');
        deprecation_warning('Old_Name', 'New_Name', '2.0.0');

        expect(warn_stub.callCount).to.equal(1);
        expect(warn_stub.firstCall.args[0]).to.include('Old_Name');
        expect(warn_stub.firstCall.args[0]).to.include('New_Name');
    });

    it('should suppress warnings in production', () => {
        process.env.NODE_ENV = 'production';
        deprecation_warning('Old_Name', 'New_Name', '2.0.0');

        expect(warn_stub.notCalled).to.equal(true);
    });

    it('should report and clear warnings', () => {
        expect(has_warned('Old_Name', 'New_Name')).to.equal(false);

        deprecation_warning('Old_Name', 'New_Name', '2.0.0');
        expect(has_warned('Old_Name', 'New_Name')).to.equal(true);

        clear_warnings();
        expect(has_warned('Old_Name', 'New_Name')).to.equal(false);
    });

    it('should return canonical module from deprecated alias', () => {
        const canonical_module = { value: 42 };
        const result = create_deprecated_alias(canonical_module, 'Old_Name', 'New_Name', '2.0.0');

        expect(result).to.equal(canonical_module);
        expect(warn_stub.calledOnce).to.equal(true);
    });
});
