/**
 * Matrix MVVM Binding Lab Experiment
 * 
 * Tests MVVM data binding patterns that will be used in the Matrix control:
 * - Data model changes propagate to view model
 * - Computed properties for derived data (e.g., cell state)
 * - Watch hooks for triggering UI updates
 * - Two-way binding for editable cells
 */
module.exports = {
    name: 'matrix_mvvm_binding',
    description: 'Validate MVVM binding patterns for Matrix control',

    /**
     * Run the MVVM Matrix binding experiment.
     * @param {Object} tools - Lab utilities.
     * @returns {Promise<Object>} Result summary.
     */
    run: async (tools) => {
        const { create_lab_context, assert, wait_for, cleanup } = tools;
        const jsgui = require('../../html-core/html-core');
        const { Data_Object } = require('lang-tools');
        const context = create_lab_context();

        console.log('🧪 Matrix MVVM Binding Lab Experiment');
        console.log('=====================================');

        // ==========================================
        // Part 1: Basic Data Model with Rows/Cols
        // ==========================================
        console.log('\n📊 Part 1: Basic Data Model');

        class Matrix_Data_Model_Control extends jsgui.Control {
            constructor(spec = {}) {
                super(spec);
                this.__type_name = 'matrix_data_model_control';

                // Data model: raw data
                this.data.model = new Data_Object({
                    rows: ['Row A', 'Row B', 'Row C'],
                    cols: ['Col 1', 'Col 2', 'Col 3'],
                    cells: {
                        '0,0': 10,
                        '0,1': 20,
                        '1,0': 30,
                        '2,2': 50
                    }
                });

                // View model: derived display values
                this.view.data.model = new Data_Object({
                    row_count: 0,
                    col_count: 0,
                    total: 0
                });

                // Computed: row_count from rows.length
                this.computed(
                    this.data.model,
                    ['rows'],
                    (rows) => (rows || []).length,
                    { propertyName: 'row_count', target: this.view.data.model }
                );

                // Computed: col_count from cols.length
                this.computed(
                    this.data.model,
                    ['cols'],
                    (cols) => (cols || []).length,
                    { propertyName: 'col_count', target: this.view.data.model }
                );

                // Computed: total from cells values
                this.computed(
                    this.data.model,
                    ['cells'],
                    (cells) => Object.values(cells || {}).reduce((sum, v) => sum + (v || 0), 0),
                    { propertyName: 'total', target: this.view.data.model }
                );

                // Track changes
                this.change_log = [];
                this.watch(this.view.data.model, 'total', (new_val, old_val) => {
                    this.change_log.push({ property: 'total', new_val, old_val });
                });
            }

            get_cell(row_idx, col_idx) {
                const key = `${row_idx},${col_idx}`;
                return this.data.model.cells[key] ?? null;
            }

            set_cell(row_idx, col_idx, value) {
                const key = `${row_idx},${col_idx}`;
                const cells = { ...this.data.model.cells };
                cells[key] = value;
                this.data.model.cells = cells;
            }
        }

        const matrix = new Matrix_Data_Model_Control({ context });
        await wait_for(50);

        // Verify initial computed values
        assert.strictEqual(matrix.view.data.model.row_count, 3, 'Initial row_count should be 3');
        assert.strictEqual(matrix.view.data.model.col_count, 3, 'Initial col_count should be 3');
        assert.strictEqual(matrix.view.data.model.total, 110, 'Initial total should be 110');
        console.log('  ✅ Initial computed values correct');

        // Test cell access
        assert.strictEqual(matrix.get_cell(0, 0), 10, 'Cell 0,0 should be 10');
        assert.strictEqual(matrix.get_cell(1, 1), null, 'Cell 1,1 should be null (sparse)');
        console.log('  ✅ Cell access working');

        // ==========================================
        // Part 2: Data Mutation -> View Update
        // ==========================================
        console.log('\n📊 Part 2: Data Mutation');

        matrix.set_cell(1, 1, 100);
        await wait_for(50);

        assert.strictEqual(matrix.get_cell(1, 1), 100, 'Cell 1,1 should now be 100');
        assert.strictEqual(matrix.view.data.model.total, 210, 'Total should update to 210');
        assert.strictEqual(matrix.change_log.length, 1, 'Should have one change event');
        console.log('  ✅ Cell mutation propagated to total');

        // Add a row
        matrix.data.model.rows = [...matrix.data.model.rows, 'Row D'];
        await wait_for(50);

        assert.strictEqual(matrix.view.data.model.row_count, 4, 'Row count should update to 4');
        console.log('  ✅ Row addition propagated to row_count');

        // ==========================================
        // Part 3: Cell State Modeling (like PlaceHubGuessing)
        // ==========================================
        console.log('\n📊 Part 3: Cell State Modeling');

        class Matrix_Cell_State_Control extends jsgui.Control {
            constructor(spec = {}) {
                super(spec);
                this.__type_name = 'matrix_cell_state_control';

                // Simulate mapping states like PlaceHubGuessingMatrixControl
                this.data.model = new Data_Object({
                    mappings: new Map([
                        ['0|host1', { status: 'verified', outcome: 'present' }],
                        ['1|host1', { status: 'candidate' }],
                        ['2|host1', { status: 'pending' }],
                        ['0|host2', null]  // unchecked
                    ])
                });
            }

            get_cell_state(place_id, host) {
                const key = `${place_id}|${host}`;
                const mapping = this.data.model.mappings.get(key);

                if (!mapping) return 'unchecked';
                if (mapping.status === 'verified') {
                    return mapping.outcome === 'present' ? 'verified-present' : 'verified-absent';
                }
                if (mapping.status === 'candidate') return 'guessed';
                return 'pending';
            }

            get_cell_class(place_id, host) {
                const state = this.get_cell_state(place_id, host);
                const class_map = {
                    'unchecked': 'cell--none',
                    'guessed': 'cell--guessed',
                    'pending': 'cell--pending',
                    'verified-present': 'cell--verified-present',
                    'verified-absent': 'cell--verified-absent'
                };
                return class_map[state] || 'cell--none';
            }
        }

        const cell_state = new Matrix_Cell_State_Control({ context });

        assert.strictEqual(cell_state.get_cell_state(0, 'host1'), 'verified-present');
        assert.strictEqual(cell_state.get_cell_state(1, 'host1'), 'guessed');
        assert.strictEqual(cell_state.get_cell_state(2, 'host1'), 'pending');
        assert.strictEqual(cell_state.get_cell_state(0, 'host2'), 'unchecked');
        console.log('  ✅ 5-state cell logic working');

        assert.strictEqual(cell_state.get_cell_class(0, 'host1'), 'cell--verified-present');
        assert.strictEqual(cell_state.get_cell_class(1, 'host1'), 'cell--guessed');
        console.log('  ✅ Cell CSS class mapping working');

        // ==========================================
        // Summary
        // ==========================================
        console.log('\n✅ All Matrix MVVM binding tests passed!');
        console.log('   Patterns validated:');
        console.log('   - Data_Object for data/view models');
        console.log('   - computed() for derived values');
        console.log('   - watch() for change tracking');
        console.log('   - Sparse cell storage (key-based)');
        console.log('   - 5-state cell status (like PlaceHubGuessing)');

        cleanup();
        return {
            ok: true,
            patterns_validated: [
                'Data_Object',
                'computed()',
                'watch()',
                'sparse_cells',
                'cell_state_machine'
            ]
        };
    }
};
