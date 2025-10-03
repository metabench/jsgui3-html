const { tof } = require('lang-tools');

/**
 * Transformation utilities for data binding
 * Provides common formatters, parsers, and validators for use in ModelBinder
 */

const Transformations = {
    /**
     * Date transformations
     */
    date: {
        /**
         * Format a Date object to ISO string
         */
        toISO: (date) => {
            if (!date) return '';
            if (date instanceof Date) return date.toISOString();
            return new Date(date).toISOString();
        },
        
        /**
         * Format a Date object to locale string
         */
        toLocale: (date, locale = 'en-US', options = {}) => {
            if (!date) return '';
            if (date instanceof Date) return date.toLocaleDateString(locale, options);
            return new Date(date).toLocaleDateString(locale, options);
        },
        
        /**
         * Format a Date object to custom format
         */
        format: (date, format = 'YYYY-MM-DD') => {
            if (!date) return '';
            const d = date instanceof Date ? date : new Date(date);
            
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
        
        /**
         * Parse a date string
         */
        parse: (str) => {
            if (!str) return null;
            const date = new Date(str);
            return isNaN(date.getTime()) ? null : date;
        },
        
        /**
         * Parse a date from custom format
         */
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
        }
    },
    
    /**
     * Number transformations
     */
    number: {
        /**
         * Format number to string with decimals
         */
        toFixed: (num, decimals = 2) => {
            if (num === null || num === undefined) return '';
            return Number(num).toFixed(decimals);
        },
        
        /**
         * Format number with thousands separator
         */
        toLocale: (num, locale = 'en-US', options = {}) => {
            if (num === null || num === undefined) return '';
            return Number(num).toLocaleString(locale, options);
        },
        
        /**
         * Format number as currency
         */
        toCurrency: (num, currency = 'USD', locale = 'en-US') => {
            if (num === null || num === undefined) return '';
            return Number(num).toLocaleString(locale, {
                style: 'currency',
                currency: currency
            });
        },
        
        /**
         * Format number as percentage
         */
        toPercent: (num, decimals = 0) => {
            if (num === null || num === undefined) return '';
            return (Number(num) * 100).toFixed(decimals) + '%';
        },
        
        /**
         * Parse number from string
         */
        parse: (str) => {
            if (str === null || str === undefined || str === '') return null;
            const num = parseFloat(String(str).replace(/[^0-9.-]/g, ''));
            return isNaN(num) ? null : num;
        },
        
        /**
         * Parse integer from string
         */
        parseInt: (str) => {
            if (str === null || str === undefined || str === '') return null;
            const num = parseInt(String(str).replace(/[^0-9-]/g, ''));
            return isNaN(num) ? null : num;
        },
        
        /**
         * Clamp number between min and max
         */
        clamp: (min, max) => (num) => {
            return Math.max(min, Math.min(max, Number(num)));
        }
    },
    
    /**
     * String transformations
     */
    string: {
        /**
         * Convert to uppercase
         */
        toUpper: (str) => {
            return str ? String(str).toUpperCase() : '';
        },
        
        /**
         * Convert to lowercase
         */
        toLower: (str) => {
            return str ? String(str).toLowerCase() : '';
        },
        
        /**
         * Capitalize first letter
         */
        capitalize: (str) => {
            if (!str) return '';
            const s = String(str);
            return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        },
        
        /**
         * Capitalize each word
         */
        titleCase: (str) => {
            if (!str) return '';
            return String(str).split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        },
        
        /**
         * Trim whitespace
         */
        trim: (str) => {
            return str ? String(str).trim() : '';
        },
        
        /**
         * Truncate string to length
         */
        truncate: (maxLength, suffix = '...') => (str) => {
            if (!str) return '';
            const s = String(str);
            if (s.length <= maxLength) return s;
            return s.substr(0, maxLength - suffix.length) + suffix;
        },
        
        /**
         * Default value if empty
         */
        default: (defaultValue) => (str) => {
            return str ? String(str) : defaultValue;
        }
    },
    
    /**
     * Boolean transformations
     */
    boolean: {
        /**
         * Convert to boolean
         */
        toBool: (value) => {
            if (value === null || value === undefined) return false;
            if (typeof value === 'boolean') return value;
            if (typeof value === 'number') return value !== 0;
            const str = String(value).toLowerCase();
            return str === 'true' || str === '1' || str === 'yes';
        },
        
        /**
         * Convert to yes/no string
         */
        toYesNo: (value) => {
            return Transformations.boolean.toBool(value) ? 'Yes' : 'No';
        },
        
        /**
         * Convert to on/off string
         */
        toOnOff: (value) => {
            return Transformations.boolean.toBool(value) ? 'On' : 'Off';
        },
        
        /**
         * Invert boolean
         */
        not: (value) => {
            return !Transformations.boolean.toBool(value);
        }
    },
    
    /**
     * Array transformations
     */
    array: {
        /**
         * Join array to string
         */
        join: (separator = ', ') => (arr) => {
            if (!Array.isArray(arr)) return '';
            return arr.join(separator);
        },
        
        /**
         * Get array length
         */
        length: (arr) => {
            return Array.isArray(arr) ? arr.length : 0;
        },
        
        /**
         * Filter array
         */
        filter: (predicate) => (arr) => {
            if (!Array.isArray(arr)) return [];
            return arr.filter(predicate);
        },
        
        /**
         * Map array
         */
        map: (mapper) => (arr) => {
            if (!Array.isArray(arr)) return [];
            return arr.map(mapper);
        },
        
        /**
         * Get first element
         */
        first: (arr) => {
            return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
        },
        
        /**
         * Get last element
         */
        last: (arr) => {
            return Array.isArray(arr) && arr.length > 0 ? arr[arr.length - 1] : null;
        },
        
        /**
         * Sort array
         */
        sort: (compareFn) => (arr) => {
            if (!Array.isArray(arr)) return [];
            return [...arr].sort(compareFn);
        }
    },
    
    /**
     * Object transformations
     */
    object: {
        /**
         * Get property value
         */
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
        
        /**
         * Check if object has property
         */
        has: (property) => (obj) => {
            return obj && obj.hasOwnProperty(property);
        },
        
        /**
         * Get object keys
         */
        keys: (obj) => {
            return obj ? Object.keys(obj) : [];
        },
        
        /**
         * Get object values
         */
        values: (obj) => {
            return obj ? Object.values(obj) : [];
        }
    },
    
    /**
     * Compose multiple transformations
     */
    compose: (...fns) => {
        return (value) => {
            return fns.reduce((acc, fn) => fn(acc), value);
        };
    },
    
    /**
     * Identity transformation (returns input unchanged)
     */
    identity: (value) => value,
    
    /**
     * Default value transformation
     */
    defaultTo: (defaultValue) => (value) => {
        return value !== null && value !== undefined ? value : defaultValue;
    },
    
    /**
     * Conditional transformation
     */
    when: (condition, thenTransform, elseTransform = Transformations.identity) => {
        return (value) => {
            return condition(value) ? thenTransform(value) : elseTransform(value);
        };
    },
    
    /**
     * Create a bidirectional transformation pair
     */
    bidirectional: (forward, reverse) => {
        return {
            transform: forward,
            reverse: reverse
        };
    }
};

/**
 * Validators - Common validation functions
 */
const Validators = {
    /**
     * Required field validator
     */
    required: (value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
    },
    
    /**
     * Email validator
     */
    email: (value) => {
        if (!value) return true; // Empty is valid, use required for mandatory
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(value));
    },
    
    /**
     * URL validator
     */
    url: (value) => {
        if (!value) return true;
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    },
    
    /**
     * Number range validator
     */
    range: (min, max) => (value) => {
        const num = Number(value);
        if (isNaN(num)) return false;
        return num >= min && num <= max;
    },
    
    /**
     * String length validator
     */
    length: (min, max) => (value) => {
        if (!value) return true;
        const len = String(value).length;
        return len >= min && len <= max;
    },
    
    /**
     * Pattern validator
     */
    pattern: (regex) => (value) => {
        if (!value) return true;
        return regex.test(String(value));
    },
    
    /**
     * Custom validator
     */
    custom: (fn) => fn
};

module.exports = {
    Transformations,
    Validators
};
