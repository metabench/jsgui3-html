module.exports = {
    name: 'text_mvvm_fixtures',
    description: 'Validate MVVM text transformations using fixtures.',
    /**
     * Run MVVM text fixture experiment.
     * @param {Object} tools - Lab utilities.
     * @returns {Promise<Object>} Result summary.
     */
    run: async (tools) => {
        const { create_lab_context, assert, wait_for, cleanup, load_fixture } = tools;
        const jsgui = require('../../html-core/html-core');
        const { Data_Object } = require('lang-tools');
        const fixture_data = load_fixture('text_mvvm_cases.json');
        const test_cases = fixture_data.cases || [];

        assert.ok(Array.isArray(test_cases) && test_cases.length > 0);

        class Text_Mvvm_Fixture_Control extends jsgui.Control {
            constructor(spec = {}) {
                super(spec);
                const string_transforms = this.transforms.string;
                this.data.model = new Data_Object({
                    raw_text: spec.raw_text || ''
                });
                this.view.data.model = new Data_Object({
                    trimmed_text: '',
                    upper_text: '',
                    slug_text: ''
                });
                this.change_log = [];

                this.bind({
                    'raw_text': {
                        to: 'trimmed_text',
                        transform: (value) => string_transforms.trim(value)
                    }
                });

                this.bind({
                    'raw_text': {
                        to: 'upper_text',
                        transform: (value) => string_transforms.toUpperCase(value)
                    }
                });

                this.computed(
                    this.data.model,
                    ['raw_text'],
                    (raw_text) => string_transforms.slugify(raw_text),
                    { propertyName: 'slug_text', target: this.view.data.model }
                );

                this.watch(
                    this.data.model,
                    'raw_text',
                    (new_val, old_val) => {
                        this.change_log.push({
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
            const control = new Text_Mvvm_Fixture_Control({ context });

            if (test_case.raw_text === '') {
                control.data.model.raw_text = 'temp';
                await wait_for(10);
            }

            control.data.model.raw_text = test_case.raw_text;
            await wait_for(25);

            assert.strictEqual(control.view.data.model.trimmed_text, test_case.expected_trimmed);
            assert.strictEqual(control.view.data.model.upper_text, test_case.expected_upper);
            assert.strictEqual(control.view.data.model.slug_text, test_case.expected_slug);
            assert.ok(control.change_log.some(entry => entry.new_val === test_case.raw_text));
        }

        cleanup();
        return {
            ok: true,
            case_count: test_cases.length
        };
    }
};
