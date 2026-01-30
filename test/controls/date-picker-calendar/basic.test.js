require('../../setup');
const { expect } = require('chai');
const Date_Picker_Progressive = require('../../../controls/organised/2-input/date_picker_progressive');
const Calendar = require('../../../controls/organised/2-input/calendar');
const { Data_Object } = require('lang-tools');

describe('Date_Picker_Progressive', function() {
    let context;

    beforeEach(function() {
        context = createTestContext();
    });

    it('should create a date picker with initial value', function() {
        const picker = new Date_Picker_Progressive({
            context,
            value: '2024-01-15'
        });

        expect(picker).to.be.an('object');
        expect(picker.value).to.equal('2024-01-15');
    });

    it('should have native input, toggle button, and calendar components', function() {
        const picker = new Date_Picker_Progressive({
            context,
            value: '2024-01-15'
        });

        expect(picker._ctrl_fields).to.be.an('object');
        expect(picker._ctrl_fields.native_input).to.exist;
        expect(picker._ctrl_fields.toggle).to.exist;
        expect(picker._ctrl_fields.calendar).to.exist;
    });

    it('should set value and sync to native input and calendar', function() {
        const picker = new Date_Picker_Progressive({
            context,
            value: '2024-01-15'
        });

        picker.set_value('2024-06-20');

        expect(picker.value).to.equal('2024-06-20');
    });

    it('should get value from native input', function() {
        const picker = new Date_Picker_Progressive({
            context,
            value: '2024-01-15'
        });

        const value = picker.get_value();
        expect(value).to.be.a('string');
    });

    it('should open and close calendar', function() {
        const picker = new Date_Picker_Progressive({
            context,
            value: '2024-01-15'
        });

        expect(picker.calendar_open).to.equal(false);

        picker.open_calendar();
        expect(picker.calendar_open).to.equal(true);

        picker.close_calendar();
        expect(picker.calendar_open).to.equal(false);
    });

    it('should toggle calendar state', function() {
        const picker = new Date_Picker_Progressive({
            context,
            value: '2024-01-15'
        });

        expect(picker.calendar_open).to.equal(false);
        picker.toggle_calendar();
        expect(picker.calendar_open).to.equal(true);
        picker.toggle_calendar();
        expect(picker.calendar_open).to.equal(false);
    });

    it('should clear value', function() {
        const picker = new Date_Picker_Progressive({
            context,
            value: '2024-01-15'
        });

        picker.clear();
        expect(picker.value).to.equal(null);
    });

    it('should apply min and max constraints', function() {
        const picker = new Date_Picker_Progressive({
            context,
            value: '2024-01-15',
            min: '2023-01-01',
            max: '2025-12-31'
        });

        expect(picker.min).to.equal('2023-01-01');
        expect(picker.max).to.equal('2025-12-31');
    });
});

describe('Calendar', function() {
    let context;

    beforeEach(function() {
        context = createTestContext();
    });

    it('should create a calendar with initial date', function() {
        const calendar = new Calendar({
            context,
            value: new Date(2024, 0, 15)
        });

        expect(calendar).to.be.an('object');
        expect(calendar.value).to.be.instanceOf(Date);
    });

    it('should have header and month view components', function() {
        const calendar = new Calendar({
            context,
            value: new Date(2024, 0, 15)
        });

        expect(calendar._ctrl_fields).to.be.an('object');
        expect(calendar._ctrl_fields.title).to.exist;
        expect(calendar._ctrl_fields.month_view).to.exist;
    });

    it('should set and get value', function() {
        const calendar = new Calendar({
            context,
            value: new Date(2024, 0, 15)
        });

        const new_date = new Date(2024, 5, 20);
        calendar.set_value(new_date);

        const value = calendar.get_value();
        expect(value).to.be.instanceOf(Date);
        expect(value.getMonth()).to.equal(5);
        expect(value.getDate()).to.equal(20);
    });

    it('should navigate to next month', function() {
        const calendar = new Calendar({
            context,
            value: new Date(2024, 0, 15)
        });

        const initial_month = calendar.display_date.getMonth();
        calendar.next_month();

        expect(calendar.display_date.getMonth()).to.equal(initial_month + 1);
    });

    it('should navigate to previous month', function() {
        const calendar = new Calendar({
            context,
            value: new Date(2024, 1, 15),
            display_date: new Date(2024, 1, 1)
        });

        expect(calendar.display_date.getMonth()).to.equal(1); // February
        calendar.prev_month();

        expect(calendar.display_date.getMonth()).to.equal(0); // January
        expect(calendar.display_date.getFullYear()).to.equal(2024);
    });

    it('should navigate to next year', function() {
        const calendar = new Calendar({
            context,
            value: new Date(2024, 0, 15)
        });

        const initial_year = calendar.display_date.getFullYear();
        calendar.next_year();

        expect(calendar.display_date.getFullYear()).to.equal(initial_year + 1);
    });

    it('should navigate to previous year', function() {
        const calendar = new Calendar({
            context,
            value: new Date(2024, 0, 15)
        });

        const initial_year = calendar.display_date.getFullYear();
        calendar.prev_year();

        expect(calendar.display_date.getFullYear()).to.equal(initial_year - 1);
    });

    it('should go to specific date', function() {
        const calendar = new Calendar({
            context,
            value: new Date(2024, 0, 15)
        });

        calendar.go_to_date(new Date(2024, 5, 15));

        expect(calendar.display_date.getMonth()).to.equal(5);
        expect(calendar.display_date.getFullYear()).to.equal(2024);
    });

    it('should go to today', function() {
        const calendar = new Calendar({
            context,
            value: new Date(2024, 0, 15)
        });

        calendar.go_to_today();

        const today = new Date();
        expect(calendar.display_date.getMonth()).to.equal(today.getMonth());
        expect(calendar.display_date.getFullYear()).to.equal(today.getFullYear());
    });

    it('should clear value', function() {
        const calendar = new Calendar({
            context,
            value: new Date(2024, 0, 15)
        });

        calendar.clear();
        expect(calendar.value).to.equal(null);
    });

    it('should support MVVM data binding', function() {
        const model = new Data_Object({
            selected_date: new Date(2024, 0, 15)
        });

        const calendar = new Calendar({
            context,
            data_model: model,
            value_property: 'selected_date',
            value: model.selected_date
        });

        expect(calendar.data_model).to.equal(model);
        expect(calendar.value_property).to.equal('selected_date');
    });

    it('should update model when date is selected', function() {
        const model = new Data_Object({
            selected_date: new Date(2024, 0, 15)
        });

        const calendar = new Calendar({
            context,
            data_model: model,
            value_property: 'selected_date',
            value: model.selected_date
        });

        const new_date = new Date(2024, 5, 20);
        calendar._apply_selected_date(new_date);

        expect(model.selected_date).to.equal(new_date);
    });

    it('should support custom first day of week', function() {
        const calendar = new Calendar({
            context,
            value: new Date(2024, 0, 15),
            first_day_of_week: 1  // Monday
        });

        expect(calendar.first_day_of_week).to.equal(1);
    });

    it('should support min and max date constraints', function() {
        const calendar = new Calendar({
            context,
            value: new Date(2024, 0, 15),
            min_date: new Date(2023, 0, 1),
            max_date: new Date(2025, 11, 31)
        });

        expect(calendar.min_date).to.be.instanceOf(Date);
        expect(calendar.max_date).to.be.instanceOf(Date);
    });

    it('should support locale', function() {
        const calendar = new Calendar({
            context,
            value: new Date(2024, 0, 15),
            locale: 'en-US'
        });

        expect(calendar.locale).to.equal('en-US');
    });

    it('should refresh calendar display', function() {
        const calendar = new Calendar({
            context,
            value: new Date(2024, 0, 15)
        });

        // Should not throw
        expect(() => calendar.refresh()).to.not.throw();
    });
});
