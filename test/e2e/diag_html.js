const http = require('http');

http.get('http://127.0.0.1:3622/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        // Check for mv-range and data-selection-mode
        const mvRangeIdx = data.indexOf('id="mv-range"');
        console.log('Index of id="mv-range":', mvRangeIdx);
        if (mvRangeIdx !== -1) {
            // Get more context to see the full start tag
            const context = data.substring(mvRangeIdx - 400, mvRangeIdx + 400);
            console.log('Context around mv-range:\n', context);

            // Check if data-selection-mode is present
            const attrMatch = context.match(/data-selection-mode="([^"]+)"/);
            console.log('data-selection-mode attribute:', attrMatch ? attrMatch[0] : 'NOT FOUND');

            // Check if data-jsgui-type is present
            const typeMatch = context.match(/data-jsgui-type="([^"]+)"/);
            console.log('data-jsgui-type attribute:', typeMatch ? typeMatch[0] : 'NOT FOUND');
        } else {
            console.log('mv-range element NOT FOUND in HTML');
        }
    });
}).on('error', (err) => {
    console.error('Error fetching page:', err.message);
});
