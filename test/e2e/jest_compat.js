const { expect: chai_expect } = require('chai');

const build_expect = (actual, invert = false) => {
    const assertion = chai_expect(actual);
    const chain = invert ? assertion.not : assertion;

    const api = {
        toBe(expected) {
            chain.equal(expected);
        },
        toEqual(expected) {
            chain.deep.equal(expected);
        },
        toContain(expected) {
            if (typeof actual === 'string' || Array.isArray(actual)) {
                chain.include(expected);
                return;
            }
            chain.contain(expected);
        },
        toMatch(expected) {
            const matcher = expected instanceof RegExp ? expected : new RegExp(expected);
            chain.match(matcher);
        },
        toBeTruthy() {
            chain.ok;
        },
        toBeNull() {
            chain.equal(null);
        },
        toBeGreaterThan(expected) {
            chain.greaterThan(expected);
        },
        toBeGreaterThanOrEqual(expected) {
            chain.at.least(expected);
        },
        toBeLessThan(expected) {
            chain.lessThan(expected);
        },
        toBeLessThanOrEqual(expected) {
            chain.at.most(expected);
        }
    };

    Object.defineProperty(api, 'not', {
        enumerable: true,
        get() {
            return build_expect(actual, !invert);
        }
    });

    return api;
};

if (typeof global.beforeAll !== 'function') {
    global.beforeAll = before;
}

if (typeof global.afterAll !== 'function') {
    global.afterAll = after;
}

if (typeof global.test !== 'function') {
    global.test = it;
}

if (typeof global.expect !== 'function') {
    global.expect = build_expect;
}
