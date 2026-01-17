/**
 * Matrix Control Data-Driven Lab
 * 
 * Verifies the new data-driven API:
 * 1. Default getCellData (sparse map -> default render)
 * 2. Custom getCellData (functional -> CellData object)
 * 3. Default Rendering features (glyph, state, className, href)
 */
module.exports = {
    name: 'matrix_control_smoke',
    description: 'Validate Matrix control data-driven platform',

    run: async (tools) => {
        const { create_lab_context, assert, wait_for, cleanup } = tools;
        const Matrix = require('../../controls/matrix/Matrix');
        const context = create_lab_context();

        console.log('🧪 Matrix Data-Driven Lab');
        console.log('=========================');

        // ==========================================
        // 1. Sparse Map Mode (Default)
        // ==========================================
        console.log('\n📊 1. Sparse Map & Default Renderer');

        const matrix1 = new Matrix({
            context,
            rows: ['A'],
            cols: ['1'],
            getRowKey: r => r,
            getColKey: c => c,
            cells: new Map([['A|1', { glyph: '✓', state: 'ok', title: 'Verified' }]])
        });

        await wait_for(50);
        const html1 = matrix1.all_html_render();

        assert(html1.includes('✓'), 'Should render glyph');
        assert(html1.includes('cell--ok'), 'Should render state class');
        assert(html1.includes('title="Verified"'), 'Should render title');
        console.log('  ✅ Default renderer works with sparse map');

        // ==========================================
        // 2. Custom getCellData Resolver
        // ==========================================
        console.log('\n📊 2. Functional getCellData Resolver');

        const matrix2 = new Matrix({
            context,
            rows: [{ id: 'r1', name: 'Row 1' }],
            cols: [{ id: 'c1', name: 'Col 1' }],
            getRowKey: r => r.id,
            getColKey: c => c.id,

            // PURE DATA FUNCTION via design doc
            getCellData: (row, col) => {
                if (row.id === 'r1' && col.id === 'c1') {
                    return {
                        glyph: '🔗',
                        href: '/link',
                        className: 'custom-link',
                        attrs: { 'data-test': '123' }
                    };
                }
                return null;
            }
        });

        await wait_for(50);
        const html2 = matrix2.all_html_render();

        assert(html2.includes('🔗'), 'Should render resolved glyph');
        assert(html2.includes('href="/link"'), 'Should render link');
        assert(html2.includes('custom-link'), 'Should render custom className');
        assert(html2.includes('data-test="123"'), 'Should render custom attributes');
        console.log('  ✅ getCellData resolver works correctly');

        cleanup();
        return { ok: true };
    }
};
