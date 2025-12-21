const jsgui = require('../html-core/html-core');

const { is_defined } = jsgui;

const strip_non_digits = value => String(value || '').replace(/\D/g, '');

const strip_currency = value => String(value || '').replace(/[^0-9.]/g, '');

const format_date = raw => {
    const digits = strip_non_digits(raw).slice(0, 8);
    const year = digits.slice(0, 4);
    const month = digits.slice(4, 6);
    const day = digits.slice(6, 8);
    if (!month) return year;
    if (!day) return `${year}-${month}`;
    return `${year}-${month}-${day}`;
};

const parse_date = value => strip_non_digits(value).slice(0, 8);

const format_phone = raw => {
    const digits = strip_non_digits(raw).slice(0, 10);
    const area = digits.slice(0, 3);
    const exchange = digits.slice(3, 6);
    const line = digits.slice(6, 10);
    if (!exchange) return area;
    if (!line) return `(${area}) ${exchange}`;
    return `(${area}) ${exchange}-${line}`;
};

const parse_phone = value => strip_non_digits(value).slice(0, 10);

const format_currency = raw => {
    const cleaned = strip_currency(raw);
    const parts = cleaned.split('.');
    const whole = parts[0] || '0';
    const fraction_raw = parts[1] || '';
    const fraction = fraction_raw.slice(0, 2).padEnd(2, '0');
    const normalized_whole = whole.replace(/^0+(?=\d)/, '');
    const with_commas = normalized_whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${with_commas || '0'}.${fraction}`;
};

const parse_currency = value => {
    const cleaned = strip_currency(value);
    const parts = cleaned.split('.');
    const whole = parts[0] || '0';
    const fraction = (parts[1] || '').slice(0, 2);
    return fraction ? `${whole}.${fraction}` : whole;
};

const DEFAULT_MASKS = {
    date: {
        format: format_date,
        parse: parse_date
    },
    phone: {
        format: format_phone,
        parse: parse_phone
    },
    currency: {
        format: format_currency,
        parse: parse_currency
    }
};

const resolve_mask = (mask_type, mask_pattern) => {
    if (mask_pattern) {
        if (typeof mask_pattern === 'function') {
            return {
                format: mask_pattern,
                parse: value => value
            };
        }
        if (mask_pattern && typeof mask_pattern === 'object') {
            return {
                format: mask_pattern.format || (value => value),
                parse: mask_pattern.parse || (value => value)
            };
        }
    }
    if (mask_type && DEFAULT_MASKS[mask_type]) {
        return DEFAULT_MASKS[mask_type];
    }
    return null;
};

const apply_input_mask = (ctrl, spec = {}) => {
    const mask_type = spec.mask_type || spec.mask;
    const mask_pattern = spec.mask_pattern;
    const mask = resolve_mask(mask_type, mask_pattern);
    if (!mask) return ctrl;

    ctrl.mask_type = mask_type;
    ctrl.raw_value = '';

    ctrl.apply_input_mask_value = value => {
        const parsed = mask.parse ? mask.parse(value) : value;
        const raw_value = is_defined(parsed) ? String(parsed) : '';
        const masked = mask.format ? mask.format(raw_value) : raw_value;
        ctrl.raw_value = raw_value;
        return masked;
    };

    /**
     * Get the raw value from the masked input.
     * @returns {string}
     */
    ctrl.get_raw_value = () => ctrl.raw_value || '';

    /**
     * Set the raw value and update the masked display.
     * @param {*} value - Raw value to set.
     * @returns {string}
     */
    ctrl.set_raw_value = value => {
        const masked = ctrl.apply_input_mask_value(value);
        if (ctrl.dom && ctrl.dom.el) {
            ctrl.dom.el.value = masked;
        }
        if (is_defined(ctrl.value)) {
            ctrl.value = masked;
        }
        if (ctrl.view && ctrl.view.data && ctrl.view.data.model) {
            ctrl.view.data.model.value = masked;
        }
        return masked;
    };

    return ctrl;
};

module.exports = apply_input_mask;
