const { expect } = require('chai');

describe('Export Consistency', function() {
    this.timeout(10000);
    it('should not export duplicate control names', () => {
        const controls = require('../../controls/controls');
        const names = Object.keys(controls).filter(name => (
            name !== 'experimental' && name !== 'deprecated'
        ));
        const lower_names = names.map(name => name.toLowerCase());
        const unique_lower_names = new Set(lower_names);

        expect(lower_names.length).to.equal(unique_lower_names.size);
    });

    it('should map deprecated aliases to canonical controls', () => {
        const controls = require('../../controls/controls');

        expect(controls.deprecated.FormField).to.equal(controls.Form_Field);
        expect(controls.deprecated.PropertyEditor).to.equal(controls.Property_Editor);
    });
});
