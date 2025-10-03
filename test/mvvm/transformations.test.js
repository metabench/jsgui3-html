/**
 * Transformation and Validation Tests
 * 
 * Tests all transformations, validators, and edge cases
 */

const { expect } = require('chai');
const Transformations = require('../../html-core/Transformations');

describe('Transformation and Validation Tests', () => {
    describe('String Transformations', () => {
        it('should capitalize first letter', () => {
            expect(Transformations.string.capitalize('hello')).to.equal('Hello');
            expect(Transformations.string.capitalize('HELLO')).to.equal('Hello');
            expect(Transformations.string.capitalize('')).to.equal('');
        });
        
        it('should convert to title case', () => {
            expect(Transformations.string.titleCase('hello world')).to.equal('Hello World');
            expect(Transformations.string.titleCase('THE QUICK BROWN FOX')).to.equal('The Quick Brown Fox');
        });
        
        it('should convert to uppercase', () => {
            expect(Transformations.string.toUpperCase('hello')).to.equal('HELLO');
            expect(Transformations.string.toUpperCase('')).to.equal('');
        });
        
        it('should convert to lowercase', () => {
            expect(Transformations.string.toLowerCase('HELLO')).to.equal('hello');
            expect(Transformations.string.toLowerCase('')).to.equal('');
        });
        
        it('should trim whitespace', () => {
            expect(Transformations.string.trim('  hello  ')).to.equal('hello');
            expect(Transformations.string.trim('\n\ttest\n')).to.equal('test');
        });
        
        it('should truncate string', () => {
            const long = 'This is a very long string that needs truncation';
            expect(Transformations.string.truncate(long, 20)).to.equal('This is a very long...');
            expect(Transformations.string.truncate('short', 20)).to.equal('short');
        });
        
        it('should truncate with custom suffix', () => {
            const long = 'This is a very long string';
            expect(Transformations.string.truncate(long, 15, '…')).to.equal('This is a very…');
        });
        
        it('should slugify string', () => {
            expect(Transformations.string.slugify('Hello World!')).to.equal('hello-world');
            expect(Transformations.string.slugify('Test & Demo')).to.equal('test-demo');
            expect(Transformations.string.slugify('  Multiple   Spaces  ')).to.equal('multiple-spaces');
        });
    });
    
    describe('Number Transformations', () => {
        it('should format as currency', () => {
            expect(Transformations.number.toCurrency(1234.56)).to.equal('$1,234.56');
            expect(Transformations.number.toCurrency(0)).to.equal('$0.00');
            expect(Transformations.number.toCurrency(-99.99)).to.equal('-$99.99');
        });
        
        it('should format currency with custom symbol', () => {
            expect(Transformations.number.toCurrency(100, '€')).to.equal('€100.00');
            expect(Transformations.number.toCurrency(1000, '£')).to.equal('£1,000.00');
        });
        
        it('should format as percentage', () => {
            expect(Transformations.number.toPercent(0.5)).to.equal('50.00%');
            expect(Transformations.number.toPercent(0.123)).to.equal('12.30%');
            expect(Transformations.number.toPercent(1)).to.equal('100.00%');
        });
        
        it('should format percentage with custom decimals', () => {
            expect(Transformations.number.toPercent(0.12345, 3)).to.equal('12.345%');
            expect(Transformations.number.toPercent(0.5, 0)).to.equal('50%');
        });
        
        it('should format with fixed decimals', () => {
            expect(Transformations.number.toFixed(3.14159, 2)).to.equal('3.14');
            expect(Transformations.number.toFixed(10, 2)).to.equal('10.00');
        });
        
        it('should round numbers', () => {
            expect(Transformations.number.round(3.14159, 2)).to.equal(3.14);
            expect(Transformations.number.round(3.5)).to.equal(4);
            expect(Transformations.number.round(3.4)).to.equal(3);
        });
        
        it('should format with thousands separator', () => {
            expect(Transformations.number.withCommas(1234567)).to.equal('1,234,567');
            expect(Transformations.number.withCommas(123)).to.equal('123');
        });
        
        it('should clamp numbers within range', () => {
            expect(Transformations.number.clamp(5, 0, 10)).to.equal(5);
            expect(Transformations.number.clamp(-5, 0, 10)).to.equal(0);
            expect(Transformations.number.clamp(15, 0, 10)).to.equal(10);
        });
    });
    
    describe('Date Transformations', () => {
        it('should format date with pattern', () => {
            const date = new Date('2025-03-15T10:30:00');
            expect(Transformations.date.format(date, 'YYYY-MM-DD')).to.equal('2025-03-15');
            expect(Transformations.date.format(date, 'MM/DD/YYYY')).to.equal('03/15/2025');
        });
        
        it('should parse date from string', () => {
            const date = Transformations.date.parse('2025-03-15');
            expect(date).to.be.instanceOf(Date);
            expect(date.getFullYear()).to.equal(2025);
            expect(date.getMonth()).to.equal(2); // 0-indexed
            expect(date.getDate()).to.equal(15);
        });
        
        it('should convert to ISO string', () => {
            const date = new Date('2025-03-15T10:30:00Z');
            const iso = Transformations.date.toISO(date);
            expect(iso).to.be.a('string');
            expect(iso).to.include('2025-03-15');
        });
        
        it('should handle invalid dates', () => {
            expect(Transformations.date.format(null, 'YYYY-MM-DD')).to.equal('');
            expect(Transformations.date.parse('invalid')).to.be.null;
        });
        
        it('should get relative time', () => {
            const now = new Date();
            const yesterday = new Date(now - 24 * 60 * 60 * 1000);
            const result = Transformations.date.relative(yesterday);
            expect(result).to.include('ago');
        });
    });
    
    describe('Boolean Transformations', () => {
        it('should convert to yes/no', () => {
            expect(Transformations.boolean.toYesNo(true)).to.equal('Yes');
            expect(Transformations.boolean.toYesNo(false)).to.equal('No');
        });
        
        it('should convert to on/off', () => {
            expect(Transformations.boolean.toOnOff(true)).to.equal('On');
            expect(Transformations.boolean.toOnOff(false)).to.equal('Off');
        });
        
        it('should convert to enabled/disabled', () => {
            expect(Transformations.boolean.toEnabledDisabled(true)).to.equal('Enabled');
            expect(Transformations.boolean.toEnabledDisabled(false)).to.equal('Disabled');
        });
        
        it('should parse string to boolean', () => {
            expect(Transformations.boolean.parse('true')).to.be.true;
            expect(Transformations.boolean.parse('yes')).to.be.true;
            expect(Transformations.boolean.parse('1')).to.be.true;
            expect(Transformations.boolean.parse('false')).to.be.false;
            expect(Transformations.boolean.parse('no')).to.be.false;
            expect(Transformations.boolean.parse('0')).to.be.false;
        });
    });
    
    describe('Array Transformations', () => {
        it('should join array elements', () => {
            expect(Transformations.array.join([1, 2, 3])).to.equal('1, 2, 3');
            expect(Transformations.array.join(['a', 'b', 'c'], ' - ')).to.equal('a - b - c');
        });
        
        it('should get first element', () => {
            expect(Transformations.array.first([1, 2, 3])).to.equal(1);
            expect(Transformations.array.first([])).to.be.undefined;
        });
        
        it('should get last element', () => {
            expect(Transformations.array.last([1, 2, 3])).to.equal(3);
            expect(Transformations.array.last([])).to.be.undefined;
        });
        
        it('should get array length', () => {
            expect(Transformations.array.length([1, 2, 3])).to.equal(3);
            expect(Transformations.array.length([])).to.equal(0);
        });
        
        it('should reverse array', () => {
            expect(Transformations.array.reverse([1, 2, 3])).to.deep.equal([3, 2, 1]);
        });
        
        it('should sort array', () => {
            expect(Transformations.array.sort([3, 1, 2])).to.deep.equal([1, 2, 3]);
        });
        
        it('should filter unique values', () => {
            expect(Transformations.array.unique([1, 2, 2, 3, 1])).to.deep.equal([1, 2, 3]);
        });
        
        it('should pluck property from objects', () => {
            const arr = [
                { name: 'Alice', age: 25 },
                { name: 'Bob', age: 30 }
            ];
            expect(Transformations.array.pluck(arr, 'name')).to.deep.equal(['Alice', 'Bob']);
        });
    });
    
    describe('Object Transformations', () => {
        it('should get object keys', () => {
            const obj = { a: 1, b: 2, c: 3 };
            expect(Transformations.object.keys(obj)).to.deep.equal(['a', 'b', 'c']);
        });
        
        it('should get object values', () => {
            const obj = { a: 1, b: 2, c: 3 };
            expect(Transformations.object.values(obj)).to.deep.equal([1, 2, 3]);
        });
        
        it('should convert to entries', () => {
            const obj = { a: 1, b: 2 };
            expect(Transformations.object.entries(obj)).to.deep.equal([['a', 1], ['b', 2]]);
        });
        
        it('should pick properties', () => {
            const obj = { a: 1, b: 2, c: 3 };
            expect(Transformations.object.pick(obj, ['a', 'c'])).to.deep.equal({ a: 1, c: 3 });
        });
        
        it('should omit properties', () => {
            const obj = { a: 1, b: 2, c: 3 };
            expect(Transformations.object.omit(obj, ['b'])).to.deep.equal({ a: 1, c: 3 });
        });
    });
    
    describe('Validators', () => {
        it('should validate required values', () => {
            expect(Transformations.validators.required('value')).to.be.true;
            expect(Transformations.validators.required('')).to.be.false;
            expect(Transformations.validators.required(null)).to.be.false;
            expect(Transformations.validators.required(undefined)).to.be.false;
        });
        
        it('should validate email addresses', () => {
            expect(Transformations.validators.email('test@example.com')).to.be.true;
            expect(Transformations.validators.email('user+tag@domain.co.uk')).to.be.true;
            expect(Transformations.validators.email('invalid')).to.be.false;
            expect(Transformations.validators.email('no@domain')).to.be.false;
        });
        
        it('should validate URLs', () => {
            expect(Transformations.validators.url('https://example.com')).to.be.true;
            expect(Transformations.validators.url('http://test.com/path')).to.be.true;
            expect(Transformations.validators.url('invalid')).to.be.false;
            expect(Transformations.validators.url('ftp://test.com')).to.be.false;
        });
        
        it('should validate number ranges', () => {
            expect(Transformations.validators.range(5, 0, 10)).to.be.true;
            expect(Transformations.validators.range(0, 0, 10)).to.be.true;
            expect(Transformations.validators.range(10, 0, 10)).to.be.true;
            expect(Transformations.validators.range(-1, 0, 10)).to.be.false;
            expect(Transformations.validators.range(11, 0, 10)).to.be.false;
        });
        
        it('should validate string length', () => {
            expect(Transformations.validators.length('test', 1, 10)).to.be.true;
            expect(Transformations.validators.length('', 1, 10)).to.be.false;
            expect(Transformations.validators.length('very long string', 1, 10)).to.be.false;
        });
        
        it('should validate patterns', () => {
            expect(Transformations.validators.pattern('ABC123', /^[A-Z]{3}\d{3}$/)).to.be.true;
            expect(Transformations.validators.pattern('abc123', /^[A-Z]{3}\d{3}$/)).to.be.false;
        });
        
        it('should validate minimum value', () => {
            expect(Transformations.validators.min(10, 5)).to.be.true;
            expect(Transformations.validators.min(5, 5)).to.be.true;
            expect(Transformations.validators.min(3, 5)).to.be.false;
        });
        
        it('should validate maximum value', () => {
            expect(Transformations.validators.max(5, 10)).to.be.true;
            expect(Transformations.validators.max(10, 10)).to.be.true;
            expect(Transformations.validators.max(15, 10)).to.be.false;
        });
    });
    
    describe('Composition', () => {
        it('should compose multiple transformations', () => {
            const transform = Transformations.compose(
                Transformations.string.trim,
                Transformations.string.toLowerCase,
                (s) => s.replace(/\s+/g, '-')
            );
            
            expect(transform('  Hello World  ')).to.equal('hello-world');
        });
        
        it('should pipe transformations', () => {
            const transform = Transformations.pipe(
                (n) => n * 2,
                (n) => n + 10,
                (n) => n.toFixed(2)
            );
            
            expect(transform(5)).to.equal('20.00');
        });
    });
    
    describe('Edge Cases', () => {
        it('should handle null/undefined values gracefully', () => {
            expect(Transformations.string.capitalize(null)).to.equal('');
            expect(Transformations.string.capitalize(undefined)).to.equal('');
            expect(Transformations.number.toCurrency(null)).to.equal('$0.00');
            expect(Transformations.array.join(null)).to.equal('');
        });
        
        it('should handle empty arrays', () => {
            expect(Transformations.array.first([])).to.be.undefined;
            expect(Transformations.array.last([])).to.be.undefined;
            expect(Transformations.array.join([])).to.equal('');
        });
        
        it('should handle empty objects', () => {
            expect(Transformations.object.keys({})).to.deep.equal([]);
            expect(Transformations.object.values({})).to.deep.equal([]);
        });
        
        it('should handle very large numbers', () => {
            const large = 1234567890.123456;
            expect(Transformations.number.withCommas(large)).to.include(',');
            expect(Transformations.number.toFixed(large, 2)).to.equal('1234567890.12');
        });
        
        it('should handle special characters in strings', () => {
            const special = '<script>alert("xss")</script>';
            expect(Transformations.string.toLowerCase(special)).to.equal('<script>alert("xss")</script>');
        });
    });
});
