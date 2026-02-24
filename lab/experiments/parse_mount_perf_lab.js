const jsgui = require('../../html-core/html-core');
const controls = require('../../controls/controls');
const { Control } = jsgui;
const { performance } = require('perf_hooks');

module.exports = {
    name: 'parse_mount_perf',
    description: 'Measures performance and memory impact of parse_mount',
    run: async (tools) => {
        const { create_lab_context, assert, cleanup } = tools;
        const context = create_lab_context();

        const iterations = 5000;
        const html_str = '<div class="test-container" data-id="test1"><h1 class="header">Performance Test Header</h1><p>This is a paragraph of text used for testing the parsing and mounting capabilities.</p><ul class="list"><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul></div>';

        console.log(`=== Running parse_mount vs Native Instantiation Benchmark (${iterations} iterations) ===\n`);

        // --- 1. PARSE_MOUNT ---
        console.log(`Test 1: parse_mount HTML template...`);
        const start_time_pm = performance.now();
        const initial_memory_pm = process.memoryUsage().heapUsed;

        for (let i = 0; i < iterations; i++) {
            const target = new Control({ context });
            await jsgui.parse_mount(html_str, target, jsgui.controls);
        }

        const end_time_pm = performance.now();
        const final_memory_pm = process.memoryUsage().heapUsed;
        const duration_ms_pm = end_time_pm - start_time_pm;
        const mem_diff_mb_pm = (final_memory_pm - initial_memory_pm) / 1024 / 1024;

        // --- 2. NATIVE ---
        // Clean GC before test 2 to be somewhat fair if possible (requires --expose-gc but we'll just track diff)
        console.log(`Test 2: Native Control API instantiation...`);
        const start_time_nat = performance.now();
        const initial_memory_nat = process.memoryUsage().heapUsed;

        for (let i = 0; i < iterations; i++) {
            const target = new Control({ context });

            const div = new Control({ context, class: 'test-container' });
            div.dom.attributes['data-id'] = 'test1';

            const h1 = new Control({ context, class: 'header' });
            h1.dom.tagName = 'h1';
            h1.add('Performance Test Header');

            const p = new Control({ context });
            p.dom.tagName = 'p';
            p.add('This is a paragraph of text used for testing the parsing and mounting capabilities.');

            const ul = new Control({ context, class: 'list' });
            ul.dom.tagName = 'ul';

            const li1 = new Control({ context });
            li1.dom.tagName = 'li';
            li1.add('Item 1');

            const li2 = new Control({ context });
            li2.dom.tagName = 'li';
            li2.add('Item 2');

            const li3 = new Control({ context });
            li3.dom.tagName = 'li';
            li3.add('Item 3');

            ul.add(li1);
            ul.add(li2);
            ul.add(li3);

            div.add(h1);
            div.add(p);
            div.add(ul);

            target.add(div);
        }

        const end_time_nat = performance.now();
        const final_memory_nat = process.memoryUsage().heapUsed;
        const duration_ms_nat = end_time_nat - start_time_nat;
        const mem_diff_mb_nat = (final_memory_nat - initial_memory_nat) / 1024 / 1024;

        console.log(`\n=== Results (${iterations} runs) ===`);
        console.log(`1. parse_mount:`);
        console.log(`   - Total Time: ${duration_ms_pm.toFixed(2)} ms (${(duration_ms_pm / iterations).toFixed(3)} ms/op)`);
        console.log(`   - Memory Growth: ${mem_diff_mb_pm.toFixed(2)} MB`);

        console.log(`\n2. Native API:`);
        console.log(`   - Total Time: ${duration_ms_nat.toFixed(2)} ms (${(duration_ms_nat / iterations).toFixed(3)} ms/op)`);
        console.log(`   - Memory Growth: ${mem_diff_mb_nat.toFixed(2)} MB`);

        const multiplier = (duration_ms_pm / duration_ms_nat).toFixed(1);
        console.log(`\nConclusion: parse_mount is ${multiplier}x slower than native JS instantiation.\n`);

        cleanup();
        return {
            ok: true,
            parse_mount: { time_ms: duration_ms_pm, mem_mb: mem_diff_mb_pm },
            native: { time_ms: duration_ms_nat, mem_mb: mem_diff_mb_nat },
            ratio: multiplier
        };
    }
};
