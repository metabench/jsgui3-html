module.exports = {
    name: 'date_i18n_transform',
    description: 'Parse locale date strings to ISO and format for UI.',
    /**
     * Run the date i18n transformation experiment.
     * @param {Object} tools - Lab utilities.
     * @returns {Promise<Object>} Result summary.
     */
    run: async (tools) => {
        const { assert, cleanup, load_fixture } = tools;
        const transformations = require('../../html-core/Transformations');
        const date_transforms = transformations.date;
        const fixture_data = load_fixture('date_i18n_cases.json');
        const test_cases = fixture_data.cases || [];

        assert.ok(Array.isArray(test_cases) && test_cases.length > 0);

        test_cases.forEach(test_case => {
            const input_text = test_case.input_text;
            const input_locale = test_case.input_locale;
            const expected_iso = test_case.expected_iso;
            const expected_primary_display = test_case.expected_primary_display;
            const expected_secondary_display = test_case.expected_secondary_display || '';
            const secondary_locale = test_case.secondary_locale || '';
            const secondary_format = test_case.secondary_format || '';

            const iso_date = date_transforms.parse_i18n_to_iso(input_text, input_locale);
            assert.strictEqual(iso_date, expected_iso);

            const primary_display = iso_date || '';
            assert.strictEqual(primary_display, expected_primary_display);

            const secondary_display = (secondary_locale || secondary_format)
                ? date_transforms.format_iso_to_locale(
                    iso_date,
                    secondary_locale || 'en-US',
                    secondary_format || undefined
                )
                : '';

            assert.strictEqual(secondary_display, expected_secondary_display);
        });

        cleanup();
        return {
            ok: true,
            case_count: test_cases.length
        };
    }
};
