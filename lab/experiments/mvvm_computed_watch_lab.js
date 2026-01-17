module.exports = {
    name: 'mvvm_computed_watch',
    description: 'Validate computed properties and watch hooks across data/view models.',
    /**
     * Run the MVVM computed and watch experiment.
     * @param {Object} tools - Lab utilities.
     * @returns {Promise<Object>} Result summary.
     */
    run: async (tools) => {
        const { create_lab_context, assert, wait_for, cleanup } = tools;
        const jsgui = require('../../html-core/html-core');
        const { Data_Object } = require('lang-tools');
        const context = create_lab_context();

        class Mvvm_Computed_Watch_Lab_Control extends jsgui.Control {
            constructor(spec = {}) {
                spec.__type_name = spec.__type_name || 'mvvm_computed_watch_lab_control';
                super(spec);
                this.data.model = new Data_Object({
                    first_name: 'Ada',
                    last_name: 'Lovelace'
                });
                this.view.data.model = new Data_Object({
                    full_name: ''
                });
                this.change_events = [];

                this.computed(
                    this.data.model,
                    ['first_name', 'last_name'],
                    (first_name, last_name) => `${first_name} ${last_name}`.trim(),
                    {
                        propertyName: 'full_name',
                        target: this.view.data.model
                    }
                );

                this.watch(this.view.data.model, 'full_name', (new_val, old_val) => {
                    this.change_events.push({
                        new_val,
                        old_val
                    });
                });
            }
        }

        const control = new Mvvm_Computed_Watch_Lab_Control({ context });

        await wait_for(25);
        assert.strictEqual(control.view.data.model.full_name, 'Ada Lovelace');

        control.data.model.first_name = 'Grace';
        await wait_for(25);
        assert.strictEqual(control.view.data.model.full_name, 'Grace Lovelace');
        assert.strictEqual(control.change_events.length, 1);
        assert.strictEqual(control.change_events[0].new_val, 'Grace Lovelace');

        cleanup();
        return { ok: true };
    }
};
