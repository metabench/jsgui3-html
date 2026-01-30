/**
 * Flexi_Chart Check Script
 * 
 * Verifies that the Flexi_Chart control can be instantiated 
 * and that data adapters work correctly.
 */

const Flexi_Chart = require('../Flexi_Chart');
const jsgui = require('../../../html-core/html-core');

console.log('Flexi_Chart Check');
console.log('-----------------');

try {
    // 1. Basic Instantiation
    console.log('1. Instantiating Flexi_Chart...');
    const chart = new Flexi_Chart({
        context: new jsgui.Page_Context(),
        type: 'column',
        data: [
            { label: 'A', value: 10 },
            { label: 'B', value: 20 }
        ],
        options: { key: 'label', value: 'value' }
    });

    console.log('   - Instantiation successful.');
    console.log('   - Type:', chart._chart_type);

    // 2. Verify Data Adaptation
    console.log('2. Verifying Data Adapter...');
    // Access the internal chart to check data
    const internal_chart = chart._chart;
    if (internal_chart) {
        const series = internal_chart._series;
        console.log('   - Internal series count:', series.length);
        console.log('   - Series 1 values:', series[0].values);

        if (series[0].values[0] === 10 && series[0].values[1] === 20) {
            console.log('   - Data adaptation correct.');
        } else {
            console.error('   - Data adaptation FAILED.');
            process.exit(1);
        }
    } else {
        console.error('   - Internal chart not created.');
        process.exit(1);
    }

    console.log('All checks passed.');

} catch (e) {
    console.error('Check failed with error:');
    console.error(e);
    process.exit(1);
}
