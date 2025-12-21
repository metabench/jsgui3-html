module.exports = {
    name: 'date_i18n_mvvm',
    description: 'Bind date input to ISO storage with optional UI formats.',
    /**
     * Run the date i18n MVVM experiment.
     * @param {Object} tools - Lab utilities.
     * @returns {Promise<Object>} Result summary.
     */
    run: async (tools) => {
        const { create_lab_context, assert, wait_for, cleanup, load_fixture } = tools;
        const jsgui = require('../../html-core/html-core');
        const { Data_Object } = require('lang-tools');
        const fixture_data = load_fixture('date_i18n_cases.json');
        const test_cases = fixture_data.cases || [];

        assert.ok(Array.isArray(test_cases) && test_cases.length > 0);

        class Date_I18n_Lab_Control extends jsgui.Control {
            constructor(spec = {}) {
                super(spec);
                const date_transforms = this.transforms.date;
                this.data.model = new Data_Object({
                    input_text: spec.input_text || '',
                    input_locale: spec.input_locale || 'en-US',
                    iso_date: ''
                });

                this.view.data.model = new Data_Object({
                    primary_display: '',
                    secondary_display: '',
                    secondary_locale: spec.secondary_locale || '',
                    secondary_format: spec.secondary_format || ''
                });

                this.change_log = [];

                this.computed(
                    this.data.model,
                    ['input_text', 'input_locale'],
                    (input_text, input_locale) => {
                        return date_transforms.parse_i18n_to_iso(input_text, input_locale);
                    },
                    { propertyName: 'iso_date' }
                );

                this.bind({
                    'iso_date': {
                        to: 'primary_display',
                        transform: (iso_date) => iso_date || ''
                    }
                });

                this.computed(
                    [this.data.model, this.view.data.model],
                    ['iso_date', 'secondary_locale', 'secondary_format'],
                    (iso_date, secondary_locale, secondary_format) => {
                        if (!iso_date) {
                            return '';
                        }
                        if (!secondary_locale && !secondary_format) {
                            return '';
                        }
                        const locale = secondary_locale || 'en-US';
                        const format_override = secondary_format || undefined;
                        return date_transforms.format_iso_to_locale(iso_date, locale, format_override);
                    },
                    {
                        propertyName: 'secondary_display',
                        target: this.view.data.model
                    }
                );

                this.watch(
                    this.data.model,
                    'iso_date',
                    (new_val, old_val, name) => {
                        this.change_log.push({
                            name,
                            new_val,
                            old_val
                        });
                    },
                    { immediate: true }
                );
            }
        }

        for (const test_case of test_cases) {
            const context = create_lab_context();
            const control = new Date_I18n_Lab_Control({
                context,
                input_text: test_case.input_text,
                input_locale: test_case.input_locale,
                secondary_locale: test_case.secondary_locale || '',
                secondary_format: test_case.secondary_format || ''
            });

            await wait_for(25);
            assert.strictEqual(control.data.model.iso_date, test_case.expected_iso);
            assert.strictEqual(control.view.data.model.primary_display, test_case.expected_primary_display);
            assert.strictEqual(
                control.view.data.model.secondary_display,
                test_case.expected_secondary_display || ''
            );

            if (test_case.expected_iso) {
                assert.ok(control.change_log.some(entry => entry.new_val === test_case.expected_iso));
            } else {
                assert.ok(control.change_log.length > 0);
            }
        }

        cleanup();
        return {
            ok: true,
            case_count: test_cases.length
        };
    }
};
