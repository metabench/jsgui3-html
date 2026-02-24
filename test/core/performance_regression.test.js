const { performance } = require('perf_hooks');
const { expect } = require('chai');
const jsgui = require('../../html-core/html-core');
const controls = require('../../controls/controls');

describe('Performance & Memory Regression Tests', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    it('Data_Table with 1000 rows should render SSR HTML in under 150ms', () => {
        // Arrange
        const columns = [
            { name: 'id', text: 'ID' },
            { name: 'name', text: 'Name' },
            { name: 'value', text: 'Value' }
        ];

        const data = Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `Row ${i}`,
            value: Math.random()
        }));

        // Act
        const start = performance.now();

        const table = new controls.Data_Table({
            context,
            columns: columns,
            data: data
        });

        const html = table.all_html_render(); // Trigger full SSR traversal

        const end = performance.now();
        const duration = end - start;

        console.log(`\n    -> [Perf Benchmark] Data_Table 1000x3 SSR render: ${duration.toFixed(2)}ms`);

        // Assert
        expect(duration).to.be.below(150, 'Data_Table SSR rendering performance regression! Expected <150ms');
        expect(html.length).to.be.greaterThan(1000); // Expect significant markup size
    });

    it('Repeated Control hydration should not leak excessive memory globally', () => {
        const initialMem = process.memoryUsage().heapUsed;

        for (let i = 0; i < 500; i++) {
            const ctrl = new jsgui.Control({ context });
            ctrl.add_class('test-leak');
            ctrl.active();
        }

        // If node is run with --expose-gc, we can guarantee cleanup, otherwise we baseline growth
        if (global.gc) {
            global.gc();
        }

        const finalMem = process.memoryUsage().heapUsed;
        const diffMB = (finalMem - initialMem) / 1024 / 1024;
        const grewTooMuch = diffMB > 25;

        console.log(`\n    -> [Memory Profiler] 500 instances heap growth: ${diffMB.toFixed(2)} MB`);

        // 25MB is a safe headroom for 500 controls kept in the context.map_controls registry
        expect(grewTooMuch).to.be.false;
    });
});
