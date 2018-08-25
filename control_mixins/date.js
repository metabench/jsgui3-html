let lang = require('../lang/lang');
let is_defined = lang.is_defined;

let date = (ctrl, spec) => {

    // Respond to touch events.

    // generally want a 'press' event too.
    //  Could be a click, or a touch press.

    // Could raise a press or click event.
    //  Press could cover click and touch.
    //  Click could specifically be a mouse event to make least confusion / ambiguity long term.

    // Could have an emulate_clicks option.

    let _date, _year, _month, _day;

    let constructor = () => {
        // define the year, month, day properties
        // on activate, will respond to changes in them.

        Object.defineProperty(ctrl, `date`, {
            get() {
                return _date;
            },
            set(value) {
                let old = _date;
                _date = value;
                // Handling the change may be best here though.
                if (typeof document === 'undefined') {
                    ctrl._fields = ctrl._fields || {};
                    ctrl._fields['date'] = value;
                }
                ctrl.raise('change', {
                    'name': 'date',
                    'old': old,
                    //'new': _disabled,
                    'value': _date
                });
            },
            enumerable: true,
            configurable: false
        });

        Object.defineProperty(ctrl, `year`, {
            get() {
                return _year;
            },
            set(value) {
                let old = _year;
                _year = value;
                // Handling the change may be best here though.
                if (typeof document === 'undefined') {
                    ctrl._fields = ctrl._fields || {};
                    ctrl._fields['year'] = value;
                }
                ctrl.raise('change', {
                    'name': 'year',
                    'old': old,
                    //'new': _disabled,
                    'value': _year
                });
            },
            enumerable: true,
            configurable: false
        });

        Object.defineProperty(ctrl, `month`, {
            get() {
                return _month;
            },
            set(value) {
                let old = _month;
                _month = value;
                // Handling the change may be best here though.
                if (typeof document === 'undefined') {
                    ctrl._fields = ctrl._fields || {};
                    ctrl._fields['month'] = value;
                }
                ctrl.raise('change', {
                    'name': 'month',
                    'old': old,
                    //'new': _disabled,
                    'value': _month
                });
            },
            enumerable: true,
            configurable: false
        });

        Object.defineProperty(ctrl, `day`, {
            get() {
                return _day;
            },
            set(value) {
                let old = _day;
                _day = value;
                // Handling the change may be best here though.
                if (typeof document === 'undefined') {
                    ctrl._fields = ctrl._fields || {};
                    ctrl._fields['day'] = value;
                }
                ctrl.raise('change', {
                    'name': 'day',
                    'old': old,
                    //'new': _disabled,
                    'value': _day
                });
            },
            enumerable: true,
            configurable: false
        });


        if (is_defined(spec.year) && is_defined(spec.month)) {
            //console.log('are defined');
            ctrl.month = spec.month; // 0 indexed
            ctrl.year = spec.year;
        } else {
            let now = new Date();
            //console.log('now', now);
            ctrl.month = now.getMonth(); // 0 indexed
            ctrl.year = now.getFullYear();
        }

        Object.assign(ctrl, {
            next_month: () => {
                if (ctrl.month === 11) {
                    ctrl.month = 0;
                    ctrl.year = ctrl.year + 1;
                } else {
                    ctrl.month = ctrl.month + 1;
                }
                ctrl.refresh_month_view();
            },
            previous_month: () => {
                if (ctrl.month === 0) {
                    ctrl.month = 11;
                    ctrl.year = ctrl.year - 1;
                } else {
                    ctrl.month = ctrl.month - 1;
                }
                ctrl.refresh_month_view();
            },
            next_year: () => {
                ctrl.year = ctrl.year + 1;
                ctrl.refresh_month_view();
            },
            previous_year: () => {
                ctrl.year = ctrl.year - 1;
                ctrl.refresh_month_view();
            }
        })
    
        



    }

    let activate = () => {

    }

    if (spec) {
        constructor();
    } else {
        activate();
    }

}

module.exports = date;