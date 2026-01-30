require('../../setup');
const { expect } = require('chai');
const Selection_Handles = require('../../../controls/organised/2-editor/selection_handles');
const Property_Grid = require('../../../controls/organised/2-editor/property_grid');
const { Data_Object } = require('lang-tools');
const Control = require('../../../html-core/html-core').Control;

describe('Selection_Handles', function() {
    let context;

    beforeEach(function() {
        context = createTestContext();
    });

    it('should create selection handles for a target element', function() {
        const target = new Control({ context });
        const handles = new Selection_Handles({
            context,
            target: target
        });

        expect(handles).to.be.an('object');
        expect(handles.target).to.equal(target);
    });

    it('should have configurable handle size', function() {
        const target = new Control({ context });
        const handles = new Selection_Handles({
            context,
            target: target,
            handle_size: 10
        });

        expect(handles.handle_size).to.equal(10);
    });

    it('should support different handle styles', function() {
        const target = new Control({ context });
        const handles = new Selection_Handles({
            context,
            target: target,
            handle_style: 'circle'
        });

        expect(handles.handle_style).to.equal('circle');
    });

    it('should have min and max size constraints', function() {
        const target = new Control({ context });
        const handles = new Selection_Handles({
            context,
            target: target,
            min_size: { width: 50, height: 50 },
            max_size: { width: 500, height: 300 }
        });

        expect(handles.min_size).to.deep.equal({ width: 50, height: 50 });
        expect(handles.max_size).to.deep.equal({ width: 500, height: 300 });
    });

    it('should support aspect ratio locking', function() {
        const target = new Control({ context });
        const handles = new Selection_Handles({
            context,
            target: target,
            maintain_aspect: true
        });

        expect(handles.maintain_aspect).to.equal(true);
    });

    it('should show handles by default', function() {
        const target = new Control({ context });
        const handles = new Selection_Handles({
            context,
            target: target
        });

        expect(handles.visible).to.not.equal(false);
    });

    it('should hide handles when hidden', function() {
        const target = new Control({ context });
        const handles = new Selection_Handles({
            context,
            target: target
        });

        // Should not throw
        expect(() => handles.hide()).to.not.throw();
    });

    it('should show handles when shown', function() {
        const target = new Control({ context });
        const handles = new Selection_Handles({
            context,
            target: target
        });

        handles.hide();
        // Should not throw
        expect(() => handles.show()).to.not.throw();
    });
});

describe('Property_Grid', function() {
    let context;

    beforeEach(function() {
        context = createTestContext();
    });

    it('should create a property grid with a target object', function() {
        const model = new Data_Object({
            name: 'Test',
            value: 42
        });

        const grid = new Property_Grid({
            context,
            target: model
        });

        expect(grid).to.be.an('object');
        expect(grid.target).to.equal(model);
    });

    it('should accept a schema definition', function() {
        const model = new Data_Object({
            name: 'Test'
        });

        const schema = [
            { name: 'name', label: 'Name', type: 'text' }
        ];

        const grid = new Property_Grid({
            context,
            target: model,
            schema: schema
        });

        expect(grid.schema).to.equal(schema);
    });

    it('should support showing/hiding categories', function() {
        const model = new Data_Object({});
        const grid = new Property_Grid({
            context,
            target: model,
            show_categories: true
        });

        expect(grid.view_mode).to.exist;
    });

    it('should support showing/hiding search', function() {
        const model = new Data_Object({});
        const grid = new Property_Grid({
            context,
            target: model,
            show_search: true
        });

        expect(grid.show_search).to.equal(true);
    });

    it('should filter properties', function() {
        const model = new Data_Object({
            name: 'Test',
            value: 42
        });

        const grid = new Property_Grid({
            context,
            target: model
        });

        // Should not throw
        expect(() => grid.filter('name')).to.not.throw();
    });

    it('should set target object', function() {
        const model1 = new Data_Object({ name: 'Test1' });
        const model2 = new Data_Object({ name: 'Test2' });

        const grid = new Property_Grid({
            context,
            target: model1
        });

        grid.set_target(model2);
        expect(grid.target).to.equal(model2);
    });

    it('should refresh property display', function() {
        const model = new Data_Object({
            name: 'Test'
        });

        const grid = new Property_Grid({
            context,
            target: model
        });

        // Should not throw
        expect(() => grid.refresh()).to.not.throw();
    });

    it('should register custom editors', function() {
        const model = new Data_Object({});
        const grid = new Property_Grid({
            context,
            target: model
        });

        class Custom_Editor extends Control {}

        // Should not throw
        expect(() => grid.register_editor('custom', Custom_Editor)).to.not.throw();
    });

    it('should support read-only mode', function() {
        const model = new Data_Object({});
        const grid = new Property_Grid({
            context,
            target: model,
            readonly: true
        });

        expect(grid.readonly).to.equal(true);
    });

    it('should have target set correctly', function() {
        const model = new Data_Object({
            name: 'Test',
            value: 42
        });

        const grid = new Property_Grid({
            context,
            target: model
        });

        expect(grid.target).to.equal(model);
        expect(grid.target.name).to.equal('Test');
    });

    it('should update target when set_target is called', function() {
        const model1 = new Data_Object({ name: 'Test1' });
        const model2 = new Data_Object({ name: 'Test2' });

        const grid = new Property_Grid({
            context,
            target: model1
        });

        grid.set_target(model2);
        expect(grid.target).to.equal(model2);
        expect(grid.target.name).to.equal('Test2');
    });
});
