/**
 * Module Load Regression Tests
 *
 * Covers previously-fixed issues around:
 * - Incorrect control exports
 * - Broken module exports
 * - Broken require paths for viewer/editor modules
 * - Noisy `console.trace()` during `require('./html.js')`
 */

const path = require('path');
const { spawnSync } = require('child_process');

const { expect } = require('chai');

describe('Module Load Regression Tests', () => {
    it('should export Color_Grid separately from Color_Palette', () => {
        const controls = require('../../controls/controls');

        expect(controls).to.have.property('Color_Grid');
        expect(controls).to.have.property('Color_Palette');

        expect(controls.Color_Grid).to.not.equal(controls.Color_Palette);
        expect(controls.Color_Grid).to.be.a('function');
        expect(controls.Color_Palette).to.be.a('function');

        expect(controls.Color_Grid.name).to.equal('Color_Grid');
        expect(controls.Color_Palette.name).to.equal('Color_Palette');
    });

    it('should export Data_Validation correctly', () => {
        const Data_Validation = require('../../html-core/Data_Validation');
        expect(Data_Validation).to.be.a('function');
        expect(Data_Validation.name).to.equal('Data_Validation');
    });

    it('should pass context into Tile_Slider subcontrols', () => {
        const controls = require('../../controls/controls');
        const test_context = createTestContext();

        const tile_slider = new controls.Tile_Slider({ context: test_context });

        expect(tile_slider).to.exist;
        expect(tile_slider.above).to.exist;
        expect(tile_slider.left_ctrl).to.exist;
        expect(tile_slider.central).to.exist;
        expect(tile_slider.right).to.exist;
        expect(tile_slider.below).to.exist;

        expect(tile_slider.above.context).to.equal(test_context);
        expect(tile_slider.left_ctrl.context).to.equal(test_context);
        expect(tile_slider.central.context).to.equal(test_context);
        expect(tile_slider.right.context).to.equal(test_context);
        expect(tile_slider.below.context).to.equal(test_context);
    });

    it('should handle Data_Value in viewer factory', () => {
        const { Data_Value } = require('lang-tools');
        const viewer_factory = require('../../controls/organised/1-standard/0-viewer/factory');

        const test_context = createTestContext();
        const data_value = new Data_Value({ value: 42 });

        expect(() => viewer_factory(data_value, test_context)).to.not.throw();
        const viewer = viewer_factory(data_value, test_context);
        expect(viewer).to.exist;
    });

    it('should require key viewer/editor modules without throwing', () => {
        const module_paths = [
            '../../controls/organised/1-standard/0-viewer/array',
            '../../controls/organised/1-standard/0-viewer/factory',
            '../../controls/organised/1-standard/0-viewer/number',
            '../../controls/organised/1-standard/0-viewer/object',
            '../../controls/organised/1-standard/0-viewer/object-kvp',
            '../../controls/organised/1-standard/0-viewer/string',
            '../../controls/organised/1-standard/1-editor/array',
            '../../controls/organised/1-standard/1-editor/number',
            '../../controls/organised/1-standard/1-editor/object',
            '../../controls/organised/1-standard/1-editor/object-kvp',
            '../../controls/organised/1-standard/1-editor/string',
            '../../controls/organised/1-standard/2-misc/up-down-arrow-buttons'
        ];

        module_paths.forEach(module_path => {
            expect(() => require(module_path), module_path).to.not.throw();
        });
    });

    it('should not call console.trace during require(html.js)', function () {
        this.timeout(20000);

        const repo_root_path = path.resolve(__dirname, '..', '..');
        const script = [
            "console.trace = () => { process.stderr.write('TRACE_CALLED\\n'); };",
            "require('./html.js');"
        ].join('\n');

        const result = spawnSync(process.execPath, ['-e', script], {
            cwd: repo_root_path,
            encoding: 'utf8'
        });

        expect(result.status).to.equal(0);
        expect(result.stderr || '').to.not.include('TRACE_CALLED');
    });
});
