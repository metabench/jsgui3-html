const { tof } = require('lang-tools');

/**
 * Transformation utilities for data binding.
 * Module exports the Transformations object directly, with Validators attached
 * for backwards compatibility via `{Transformations, Validators}` destructuring.
 */

const add_commas = (num_str) => {
    return num_str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const DATE_I18N_FORMATS = Object.freeze({
    'en-US': 'MM/DD/YYYY',
    'en-GB': 'DD/MM/YYYY',
    'de-DE': 'DD.MM.YYYY',
    'fr-FR': 'DD/MM/YYYY',
    'es-ES': 'DD/MM/YYYY',
    'it-IT': 'DD/MM/YYYY',
    'nl-NL': 'DD-MM-YYYY',
    'sv-SE': 'YYYY-MM-DD',
    'ja-JP': 'YYYY/MM/DD',
    'zh-CN': 'YYYY/MM/DD',
    'ko-KR': 'YYYY.MM.DD'
});

const escape_regex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pad_2 = (value) => String(value).padStart(2, '0');
const is_leap_year = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
const days_in_month = (year, month) => {
    const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 2 && is_leap_year(year)) {
        return 29;
    }
    return days[month - 1] || 0;
};

const build_format_regex = (format) => {
    const tokens = [];
    const parts = String(format).split(/(YYYY|MM|DD)/g).filter(part => part !== '');
    const regex_body = parts.map(part => {
        if (part === 'YYYY') {
            tokens.push(part);
            return '(\\d{4})';
        }
        if (part === 'MM' || part === 'DD') {
            tokens.push(part);
            return '(\\d{1,2})';
        }
        return escape_regex(part);
    }).join('');
    return {
        regex: new RegExp(`^${regex_body}$`),
        tokens
    };
};

const parse_format_parts = (value, format = 'YYYY-MM-DD') => {
    if (value === null || value === undefined) return null;
    const str = String(value).trim();
    if (str === '') return null;
    const { regex, tokens } = build_format_regex(format);
    const match = str.match(regex);
    if (!match) return null;

    const parts = {
        year: null,
        month: null,
        day: null
    };

    tokens.forEach((token, idx) => {
        const num = parseInt(match[idx + 1], 10);
        if (Number.isNaN(num)) {
            return;
        }
        if (token === 'YYYY') parts.year = num;
        if (token === 'MM') parts.month = num;
        if (token === 'DD') parts.day = num;
    });

    if (!parts.year || !parts.month || !parts.day) return null;
    if (parts.month < 1 || parts.month > 12) return null;
    const max_day = days_in_month(parts.year, parts.month);
    if (parts.day < 1 || parts.day > max_day) return null;

    return parts;
};

const format_parts = (parts, format = 'YYYY-MM-DD') => {
    if (!parts || !parts.year || !parts.month || !parts.day) return '';
    const year = String(parts.year).padStart(4, '0');
    const month = pad_2(parts.month);
    const day = pad_2(parts.day);
    return String(format)
        .replace(/YYYY/g, year)
        .replace(/MM/g, month)
        .replace(/DD/g, day);
};

const parts_to_iso = (parts) => format_parts(parts, 'YYYY-MM-DD');
const iso_to_parts = (iso_str) => parse_format_parts(iso_str, 'YYYY-MM-DD');
const resolve_i18n_format = (locale, fallback = 'YYYY-MM-DD') => {
    if (!locale) return fallback;
    return DATE_I18N_FORMATS[locale] || fallback;
};

const Transformations = {
    date: {
        /**
         * Map of locale tags to default date formats.
         */
        i18n_formats: DATE_I18N_FORMATS,
        /**
         * Resolve a locale to a supported format string.
         * @param {string} locale - Locale tag (e.g. en-US).
         * @param {string} fallback - Fallback format string.
         * @returns {string} Format string.
         */
        resolve_i18n_format: (locale, fallback = 'YYYY-MM-DD') => resolve_i18n_format(locale, fallback),
        /**
         * Parse a date string into parts using a format string.
         * @param {string} value - Date string to parse.
         * @param {string} format - Format string (e.g. DD/MM/YYYY).
         * @returns {Object|null} Parsed parts or null.
         */
        parse_format_parts: (value, format = 'YYYY-MM-DD') => parse_format_parts(value, format),
        /**
         * Format date parts using a format string.
         * @param {Object} parts - { year, month, day }.
         * @param {string} format - Format string (e.g. YYYY-MM-DD).
         * @returns {string} Formatted date string.
         */
        format_parts: (parts, format = 'YYYY-MM-DD') => format_parts(parts, format),
        /**
         * Convert date parts into ISO YYYY-MM-DD format.
         * @param {Object} parts - { year, month, day }.
         * @returns {string} ISO date string.
         */
        parts_to_iso: (parts) => parts_to_iso(parts),
        /**
         * Parse ISO YYYY-MM-DD string into date parts.
         * @param {string} iso_str - ISO date string.
         * @returns {Object|null} Parsed parts or null.
         */
        iso_to_parts: (iso_str) => iso_to_parts(iso_str),
        /**
         * Parse a locale-specific date string into ISO YYYY-MM-DD.
         * @param {string} value - Date string to parse.
         * @param {string} locale - Locale tag (e.g. en-GB).
         * @param {string} format_override - Optional format override.
         * @returns {string} ISO date string.
         */
        parse_i18n_to_iso: (value, locale = 'en-US', format_override) => {
            if (!value) return '';
            const iso_parts = parse_format_parts(value, 'YYYY-MM-DD');
            if (iso_parts) {
                return parts_to_iso(iso_parts);
            }
            const format = format_override || resolve_i18n_format(locale);
            const parts = parse_format_parts(value, format);
            return parts ? parts_to_iso(parts) : '';
        },
        /**
         * Format an ISO YYYY-MM-DD date string for a locale or format override.
         * @param {string} iso_str - ISO date string.
         * @param {string} locale - Locale tag (e.g. en-US).
         * @param {string} format_override - Optional format override.
         * @returns {string} Formatted date string.
         */
        format_iso_to_locale: (iso_str, locale = 'en-US', format_override) => {
            if (!iso_str) return '';
            const parts = parse_format_parts(iso_str, 'YYYY-MM-DD');
            if (!parts) return '';
            const format = format_override || resolve_i18n_format(locale);
            return format_parts(parts, format);
        },
        toISO: (date) => {
            if (!date) return '';
            const d = date instanceof Date ? date : new Date(date);
            return isNaN(d.getTime()) ? '' : d.toISOString();
        },
        toLocale: (date, locale = 'en-US', options = {}) => {
            if (!date) return '';
            const d = date instanceof Date ? date : new Date(date);
            return isNaN(d.getTime()) ? '' : d.toLocaleDateString(locale, options);
        },
        format: (date, format = 'YYYY-MM-DD') => {
            if (!date) return '';
            const d = date instanceof Date ? date : new Date(date);
            if (isNaN(d.getTime())) return '';
            const map = {
                YYYY: d.getFullYear(),
                MM: String(d.getMonth() + 1).padStart(2, '0'),
                DD: String(d.getDate()).padStart(2, '0'),
                HH: String(d.getHours()).padStart(2, '0'),
                mm: String(d.getMinutes()).padStart(2, '0'),
                ss: String(d.getSeconds()).padStart(2, '0')
            };
            return format.replace(/YYYY|MM|DD|HH|mm|ss/g, matched => map[matched]);
        },
        parse: (str) => {
            if (!str) return null;
            const d = new Date(str);
            return isNaN(d.getTime()) ? null : d;
        },
        parseFormat: (str, format = 'YYYY-MM-DD') => {
            if (!str) return null;
            const parts = {
                YYYY: { start: format.indexOf('YYYY'), length: 4 },
                MM: { start: format.indexOf('MM'), length: 2 },
                DD: { start: format.indexOf('DD'), length: 2 }
            };
            const year = parseInt(str.substr(parts.YYYY.start, parts.YYYY.length));
            const month = parseInt(str.substr(parts.MM.start, parts.MM.length)) - 1;
            const day = parseInt(str.substr(parts.DD.start, parts.DD.length));
            return new Date(year, month, day);
        },
        relative: (date, now = new Date()) => {
            if (!date) return '';
            const d = date instanceof Date ? date : new Date(date);
            if (isNaN(d.getTime())) return '';
            const diff_ms = now.getTime() - d.getTime();
            const diff_s = Math.floor(Math.abs(diff_ms) / 1000);
            const is_past = diff_ms >= 0;

            const units = [
                ['year', 60 * 60 * 24 * 365],
                ['month', 60 * 60 * 24 * 30],
                ['day', 60 * 60 * 24],
                ['hour', 60 * 60],
                ['minute', 60],
                ['second', 1]
            ];

            let unit_name = 'second';
            let unit_value = diff_s;
            for (const [name, seconds] of units) {
                if (diff_s >= seconds) {
                    unit_name = name;
                    unit_value = Math.floor(diff_s / seconds);
                    break;
                }
            }

            const plural = unit_value === 1 ? '' : 's';
            return is_past
                ? `${unit_value} ${unit_name}${plural} ago`
                : `in ${unit_value} ${unit_name}${plural}`;
        }
    },

    number: {
        toFixed: (num, decimals = 2) => {
            if (num === null || num === undefined || num === '') return '';
            return Number(num).toFixed(decimals);
        },
        round: (num, decimals = 0) => {
            if (num === null || num === undefined || num === '') return 0;
            const factor = Math.pow(10, decimals);
            return Math.round(Number(num) * factor) / factor;
        },
        withCommas: (num) => {
            if (num === null || num === undefined || num === '') return '';
            const n = Number(num);
            if (isNaN(n)) return '';
            const [int_part, dec_part] = String(n).split('.');
            const int_with = add_commas(int_part);
            return dec_part ? `${int_with}.${dec_part}` : int_with;
        },
        toCurrency: (num, symbol = '$', decimals = 2) => {
            const n = num === null || num === undefined || num === '' ? 0 : Number(num);
            if (isNaN(n)) return `${symbol}0.00`;
            const sign = n < 0 ? '-' : '';
            const abs = Math.abs(n);
            const fixed = abs.toFixed(decimals);
            const [int_part, dec_part] = fixed.split('.');
            const int_with = add_commas(int_part);
            return `${sign}${symbol}${int_with}.${dec_part}`;
        },
        toPercent: (num, decimals = 2) => {
            if (num === null || num === undefined || num === '') return '';
            return (Number(num) * 100).toFixed(decimals) + '%';
        },
        toLocale: (num, locale = 'en-US', options = {}) => {
            if (num === null || num === undefined || num === '') return '';
            return Number(num).toLocaleString(locale, options);
        },
        parse: (str) => {
            if (str === null || str === undefined || str === '') return null;
            const num = parseFloat(String(str).replace(/[^0-9.-]/g, ''));
            return isNaN(num) ? null : num;
        },
        parseInt: (str) => {
            if (str === null || str === undefined || str === '') return null;
            const num = parseInt(String(str).replace(/[^0-9-]/g, ''));
            return isNaN(num) ? null : num;
        },
        clamp: (num, min, max) => {
            const n = Number(num);
            if (isNaN(n)) return min;
            return Math.max(min, Math.min(max, n));
        },
        clamp_fn: (min, max) => (num) => Transformations.number.clamp(num, min, max)
    },

    string: {
        toUpperCase: (str) => {
            return str ? String(str).toUpperCase() : '';
        },
        toLowerCase: (str) => {
            return str ? String(str).toLowerCase() : '';
        },
        toUpper: (str) => Transformations.string.toUpperCase(str),
        toLower: (str) => Transformations.string.toLowerCase(str),
        capitalize: (str) => {
            if (!str) return '';
            const s = String(str);
            return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        },
        titleCase: (str) => {
            if (!str) return '';
            return String(str).split(/\s+/)
                .filter(v => v.length > 0)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        },
        trim: (str) => {
            return str ? String(str).trim() : '';
        },
        truncate: (str, maxLength, suffix = '...') => {
            if (!str) return '';
            const s = String(str);
            if (s.length <= maxLength) return s;
            const head = s.substr(0, maxLength).trimEnd();
            return head + suffix;
        },
        truncate_fn: (maxLength, suffix = '...') => (str) => Transformations.string.truncate(str, maxLength, suffix),
        slugify: (str) => {
            if (!str) return '';
            return String(str)
                .toLowerCase()
                .replace(/&/g, ' ')
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
        },
        default: (defaultValue) => (str) => {
            return str ? String(str) : defaultValue;
        }
    },

    boolean: {
        toBool: (value) => {
            if (value === null || value === undefined) return false;
            if (typeof value === 'boolean') return value;
            if (typeof value === 'number') return value !== 0;
            const str = String(value).toLowerCase();
            return str === 'true' || str === '1' || str === 'yes' || str === 'on' || str === 'enabled';
        },
        parse: (value) => Transformations.boolean.toBool(value),
        toYesNo: (value) => Transformations.boolean.toBool(value) ? 'Yes' : 'No',
        toOnOff: (value) => Transformations.boolean.toBool(value) ? 'On' : 'Off',
        toEnabledDisabled: (value) => Transformations.boolean.toBool(value) ? 'Enabled' : 'Disabled',
        not: (value) => !Transformations.boolean.toBool(value)
    },

    array: {
        join: (arr, separator = ', ') => {
            if (!Array.isArray(arr) || arr.length === 0) return '';
            return arr.join(separator);
        },
        first: (arr) => Array.isArray(arr) && arr.length > 0 ? arr[0] : undefined,
        last: (arr) => Array.isArray(arr) && arr.length > 0 ? arr[arr.length - 1] : undefined,
        length: (arr) => Array.isArray(arr) ? arr.length : 0,
        reverse: (arr) => Array.isArray(arr) ? arr.slice().reverse() : [],
        sort: (arr, compare_fn) => {
            if (!Array.isArray(arr)) return [];
            const copy = arr.slice();
            if (compare_fn) return copy.sort(compare_fn);
            return copy.sort((a, b) => {
                const ta = tof(a), tb = tof(b);
                if (ta === 'number' && tb === 'number') return a - b;
                return String(a).localeCompare(String(b));
            });
        },
        unique: (arr) => Array.isArray(arr) ? Array.from(new Set(arr)) : [],
        pluck: (arr, prop) => Array.isArray(arr) ? arr.map(item => item && item[prop]) : []
    },

    object: {
        get: (propertyPath) => (obj) => {
            if (!obj) return null;
            const parts = propertyPath.split('.');
            let value = obj;
            for (const part of parts) {
                if (value === null || value === undefined) return null;
                value = value[part];
            }
            return value;
        },
        has: (property) => (obj) => obj && Object.prototype.hasOwnProperty.call(obj, property),
        keys: (obj) => obj ? Object.keys(obj) : [],
        values: (obj) => obj ? Object.values(obj) : [],
        entries: (obj) => obj ? Object.entries(obj) : [],
        pick: (obj, keys) => {
            const res = {};
            if (!obj || !Array.isArray(keys)) return res;
            keys.forEach(k => {
                if (Object.prototype.hasOwnProperty.call(obj, k)) res[k] = obj[k];
            });
            return res;
        },
        omit: (obj, keys) => {
            const res = {};
            if (!obj) return res;
            const omit_set = new Set(Array.isArray(keys) ? keys : []);
            Object.keys(obj).forEach(k => {
                if (!omit_set.has(k)) res[k] = obj[k];
            });
            return res;
        }
    },

    compose: (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value),
    pipe: (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value),
    identity: (value) => value,
    defaultTo: (defaultValue) => (value) => value !== null && value !== undefined ? value : defaultValue,
    when: (condition, thenTransform, elseTransform = Transformations.identity) => (value) => condition(value) ? thenTransform(value) : elseTransform(value),
    bidirectional: (forward, reverse) => ({ transform: forward, reverse })
};

const Validators = {
    required: (value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
    },
    email: (value) => {
        if (!value) return true;
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(value));
    },
    url: (value) => {
        if (!value) return false;
        try {
            const u = new URL(value);
            return u.protocol === 'http:' || u.protocol === 'https:';
        } catch {
            return false;
        }
    },
    range: (value, min, max) => {
        const num = Number(value);
        if (isNaN(num)) return false;
        return num >= min && num <= max;
    },
    length: (value, min, max) => {
        if (value === null || value === undefined) return false;
        const len = String(value).length;
        return len >= min && len <= max;
    },
    pattern: (value, regex) => {
        if (value === null || value === undefined) return false;
        return regex.test(String(value));
    },
    min: (value, min) => Number(value) >= min,
    max: (value, max) => Number(value) <= max,
    custom: (fn) => fn
};

Transformations.validators = Validators;
Transformations.Validators = Validators;

module.exports = Object.assign(Transformations, {
    Transformations,
    Validators,
    validators: Validators
});
