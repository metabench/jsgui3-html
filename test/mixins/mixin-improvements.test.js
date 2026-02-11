'use strict';

/**
 * Mixin Improvements Test Suite
 * 
 * Self-contained tests using Node.js assert + jsdom.
 * Run: node test/mixins/mixin-improvements.test.js
 */

const assert = require('assert');
const { JSDOM } = require('jsdom');

// ── Setup jsdom ──
const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true
});

// Use defineProperty for globals that may be read-only in newer Node.js
function setGlobal(name, value) {
    try { global[name] = value; } catch (e) {
        Object.defineProperty(global, name, { value, writable: true, configurable: true });
    }
}
setGlobal('window', dom.window);
setGlobal('document', dom.window.document);
setGlobal('navigator', dom.window.navigator);
setGlobal('HTMLElement', dom.window.HTMLElement);
setGlobal('Event', dom.window.Event);
setGlobal('CustomEvent', dom.window.CustomEvent);
setGlobal('MutationObserver', dom.window.MutationObserver);

// ── Test infrastructure ──
let passed = 0;
let failed = 0;
const errors = [];

function test(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  ✓ ${name}`);
    } catch (e) {
        failed++;
        errors.push({ name, error: e });
        console.log(`  ✗ ${name}`);
        console.log(`    ${e.message}`);
    }
}

async function test_async(name, fn) {
    try {
        await fn();
        passed++;
        console.log(`  ✓ ${name}`);
    } catch (e) {
        failed++;
        errors.push({ name, error: e });
        console.log(`  ✗ ${name}`);
        console.log(`    ${e.message}`);
    }
}

function describe(name, fn) {
    console.log(`\n${name}`);
    fn();
}

// ── Helpers ──

/** Create a minimal mock control with eventing. */
function mock_control(tag = 'div') {
    const el = document.createElement(tag);
    document.body.appendChild(el);

    const _listeners = {};
    const _classes = new Set();

    /** Helper: create an evented object (used by both ctrl and body mock) */
    function make_evented() {
        const _l = {};
        return {
            _l,
            on(event_or_map, fn) {
                if (typeof event_or_map === 'object' && !fn) {
                    for (const [k, v] of Object.entries(event_or_map)) this.on(k, v);
                    return;
                }
                if (!_l[event_or_map]) _l[event_or_map] = [];
                _l[event_or_map].push(fn);
            },
            off(event_or_map, fn) {
                if (typeof event_or_map === 'object' && !fn) {
                    for (const [k, v] of Object.entries(event_or_map)) this.off(k, v);
                    return;
                }
                if (!_l[event_or_map]) return;
                _l[event_or_map] = _l[event_or_map].filter(f => f !== fn);
            },
            trigger(event, data) {
                if (!_l[event]) return;
                for (const fn of [..._l[event]]) fn(data);
            },
            raise(event, data) { this.trigger(event, data); }
        };
    }

    const body_mock = make_evented();
    const evented = make_evented();

    const ctrl = {
        dom: { el },
        __mx: {},
        _listeners: evented._l,
        event_events: false,

        on: evented.on.bind(evented),
        off: evented.off.bind(evented),
        trigger: evented.trigger.bind(evented),
        raise: evented.raise.bind(evented),

        once_active(fn) {
            // immediately call since we have a DOM element
            fn();
        },

        add_class(cls) {
            _classes.add(cls);
            el.classList.add(cls);
        },

        remove_class(cls) {
            _classes.delete(cls);
            el.classList.remove(cls);
        },

        has_class(cls) {
            return _classes.has(cls);
        },

        context: {
            body() { return body_mock; }
        },

        // minimal view.data.model for pressed-state
        view: {
            data: {
                model: mock_model()
            }
        },

        destroy() {
            if (el.parentNode) el.parentNode.removeChild(el);
        }
    };

    return ctrl;
}

/** Create a minimal model mock with field, eventing, and mixins. */
function mock_model() {
    const _listeners = {};
    const model = {
        mixins: {
            silent: false,
            _arr: [],
            push(item) {
                this._arr.push(item);
            }
        },

        on(event, fn) {
            if (!_listeners[event]) _listeners[event] = [];
            _listeners[event].push(fn);
        },

        off(event, fn) {
            if (!_listeners[event]) return;
            _listeners[event] = _listeners[event].filter(f => f !== fn);
        },

        /** obext's field() calls obj.raise() when values change */
        raise(event, data) {
            if (!_listeners[event]) return;
            for (const fn of [..._listeners[event]]) fn(data);
        }
    };

    // Note: do NOT define 'state' manually here — obext's field() will create it
    // when pressed-state calls field(model, 'state')

    return model;
}

function cleanup_dom() {
    document.body.innerHTML = '';
}

// ═══════════════════════════════════════════════════
//  TEST SUITES
// ═══════════════════════════════════════════════════

// ── 1. Mixin Cleanup ──

describe('1. mixin_cleanup', () => {
    const { create_mixin_cleanup, dispose_all_mixins } = require('../../control_mixins/mixin_cleanup');

    test('create_mixin_cleanup returns a handle with expected methods', () => {
        const ctrl = mock_control();
        const handle = create_mixin_cleanup(ctrl, 'test_mixin');

        assert.strictEqual(typeof handle.track_listener, 'function');
        assert.strictEqual(typeof handle.track_dom_listener, 'function');
        assert.strictEqual(typeof handle.track_element, 'function');
        assert.strictEqual(typeof handle.track_timer, 'function');
        assert.strictEqual(typeof handle.on_dispose, 'function');
        assert.strictEqual(typeof handle.dispose, 'function');
        assert.strictEqual(handle.disposed, false);

        ctrl.destroy();
    });

    test('dispose removes tracked jsgui listeners', () => {
        const ctrl = mock_control();
        let call_count = 0;
        const handler = () => { call_count++; };

        ctrl.on('test-event', handler);
        const handle = create_mixin_cleanup(ctrl, 'test_mixin');
        handle.track_listener(ctrl, 'test-event', handler);

        // listener should work before dispose
        ctrl.trigger('test-event');
        assert.strictEqual(call_count, 1);

        handle.dispose();

        // listener should be removed after dispose
        ctrl.trigger('test-event');
        assert.strictEqual(call_count, 1, 'listener should not fire after dispose');

        ctrl.destroy();
    });

    test('dispose removes tracked DOM listeners', () => {
        const ctrl = mock_control();
        const el = ctrl.dom.el;
        let click_count = 0;
        const handler = () => { click_count++; };

        el.addEventListener('click', handler);
        const handle = create_mixin_cleanup(ctrl, 'test_mixin');
        handle.track_dom_listener(el, 'click', handler);

        el.click();
        assert.strictEqual(click_count, 1);

        handle.dispose();

        el.click();
        assert.strictEqual(click_count, 1, 'DOM listener should be removed after dispose');

        ctrl.destroy();
    });

    test('dispose removes tracked DOM elements', () => {
        const ctrl = mock_control();
        const child = document.createElement('span');
        child.textContent = 'tracked';
        ctrl.dom.el.appendChild(child);

        const handle = create_mixin_cleanup(ctrl, 'test_mixin');
        handle.track_element(child);

        assert.strictEqual(child.parentNode, ctrl.dom.el);

        handle.dispose();

        assert.strictEqual(child.parentNode, null, 'child should be removed from DOM');

        ctrl.destroy();
    });

    test('dispose runs custom cleanup functions', () => {
        const ctrl = mock_control();
        let cleaned = false;

        const handle = create_mixin_cleanup(ctrl, 'test_mixin');
        handle.on_dispose(() => { cleaned = true; });

        assert.strictEqual(cleaned, false);
        handle.dispose();
        assert.strictEqual(cleaned, true);

        ctrl.destroy();
    });

    test('disposed property reflects state', () => {
        const ctrl = mock_control();
        const handle = create_mixin_cleanup(ctrl, 'test_mixin');

        assert.strictEqual(handle.disposed, false);
        handle.dispose();
        assert.strictEqual(handle.disposed, true);

        ctrl.destroy();
    });

    test('dispose clears __mx entry', () => {
        const ctrl = mock_control();
        ctrl.__mx = ctrl.__mx || {};
        ctrl.__mx.test_mixin = true;

        const handle = create_mixin_cleanup(ctrl, 'test_mixin');
        handle.dispose();

        assert.strictEqual(ctrl.__mx.test_mixin, undefined, '__mx entry should be removed');

        ctrl.destroy();
    });

    test('dispose_all_mixins clears all tracked mixins', () => {
        const ctrl = mock_control();
        let cleaned_a = false;
        let cleaned_b = false;

        const handle_a = create_mixin_cleanup(ctrl, 'mixin_a');
        handle_a.on_dispose(() => { cleaned_a = true; });

        const handle_b = create_mixin_cleanup(ctrl, 'mixin_b');
        handle_b.on_dispose(() => { cleaned_b = true; });

        dispose_all_mixins(ctrl);

        assert.strictEqual(cleaned_a, true, 'mixin_a should be cleaned');
        assert.strictEqual(cleaned_b, true, 'mixin_b should be cleaned');

        ctrl.destroy();
    });

    cleanup_dom();
});

// ── 2. Feature Detection (mx.js) ──

describe('2. has_feature / list_features', () => {
    const { has_feature, list_features, apply_feature_detection } = require('../../control_mixins/mx');

    test('has_feature returns false for clean control', () => {
        const ctrl = { __mx: {} };
        assert.strictEqual(has_feature(ctrl, 'dragable'), false);
    });

    test('has_feature returns true when mixin is applied', () => {
        const ctrl = { __mx: { dragable: true } };
        assert.strictEqual(has_feature(ctrl, 'dragable'), true);
    });

    test('has_feature handles null/undefined ctrl gracefully', () => {
        assert.strictEqual(has_feature(null, 'foo'), false);
        assert.strictEqual(has_feature(undefined, 'foo'), false);
        assert.strictEqual(has_feature({}, 'foo'), false);
    });

    test('list_features returns empty array for clean control', () => {
        const ctrl = { __mx: {} };
        const features = list_features(ctrl);
        assert.deepStrictEqual(features, []);
    });

    test('list_features returns applied mixin names', () => {
        const ctrl = { __mx: { dragable: true, selectable: true } };
        const features = list_features(ctrl);
        assert.ok(features.includes('dragable'));
        assert.ok(features.includes('selectable'));
        assert.strictEqual(features.length, 2);
    });

    test('apply_feature_detection adds methods to ctrl', () => {
        const ctrl = { __mx: { press_events: true } };
        apply_feature_detection(ctrl);

        assert.strictEqual(typeof ctrl.has_feature, 'function');
        assert.strictEqual(typeof ctrl.list_features, 'function');
        assert.strictEqual(ctrl.has_feature('press_events'), true);
        assert.strictEqual(ctrl.has_feature('nonexistent'), false);
        assert.deepStrictEqual(ctrl.list_features(), ['press_events']);
    });

    test('apply_feature_detection is idempotent', () => {
        const ctrl = { __mx: {} };
        apply_feature_detection(ctrl);
        const first_fn = ctrl.has_feature;
        apply_feature_detection(ctrl);
        assert.strictEqual(ctrl.has_feature, first_fn, 'should not recreate functions');
    });
});

// ── 3. Mixin Registry ──

describe('3. mixin_registry', () => {
    const {
        register_mixin,
        get_mixin_meta,
        list_registered,
        check_conflicts,
        check_dependencies,
        get_dependency_tree
    } = require('../../control_mixins/mixin_registry');

    test('register_mixin and get_mixin_meta round-trip', () => {
        register_mixin('test_alpha', {
            depends: ['press_events'],
            provides: ['alpha-feature'],
            conflicts: ['test_beta'],
            description: 'Test mixin A'
        });

        const meta = get_mixin_meta('test_alpha');
        assert.ok(meta !== null);
        assert.strictEqual(meta.name, 'test_alpha');
        assert.deepStrictEqual(meta.depends, ['press_events']);
        assert.deepStrictEqual(meta.provides, ['alpha-feature']);
        assert.deepStrictEqual(meta.conflicts, ['test_beta']);
    });

    test('get_mixin_meta returns null for unknown mixin', () => {
        assert.strictEqual(get_mixin_meta('nonexistent_xyz'), null);
    });

    test('list_registered includes registered mixins', () => {
        register_mixin('test_listed', {});
        const all = list_registered();
        assert.ok(all.includes('test_listed'));
    });

    test('check_conflicts detects conflicts', () => {
        register_mixin('test_conflicting', {
            conflicts: ['test_alpha']
        });

        const ctrl = { __mx: { test_alpha: true } };
        const conflicts = check_conflicts('test_conflicting', ctrl);
        assert.deepStrictEqual(conflicts, ['test_alpha']);
    });

    test('check_conflicts returns empty when no conflicts', () => {
        const ctrl = { __mx: {} };
        const conflicts = check_conflicts('test_conflicting', ctrl);
        assert.deepStrictEqual(conflicts, []);
    });

    test('check_dependencies detects missing deps', () => {
        const ctrl = { __mx: {} };
        const result = check_dependencies('test_alpha', ctrl);
        assert.strictEqual(result.satisfied, false);
        assert.deepStrictEqual(result.missing, ['press_events']);
    });

    test('check_dependencies passes when deps satisfied', () => {
        const ctrl = { __mx: { press_events: true } };
        const result = check_dependencies('test_alpha', ctrl);
        assert.strictEqual(result.satisfied, true);
        assert.deepStrictEqual(result.missing, []);
    });

    test('get_dependency_tree resolves transitive deps', () => {
        register_mixin('dep_root', { depends: [] });
        register_mixin('dep_mid', { depends: ['dep_root'] });
        register_mixin('dep_leaf', { depends: ['dep_mid'] });

        const tree = get_dependency_tree('dep_leaf');
        // dep_root should come before dep_mid, dep_mid before dep_leaf
        assert.ok(tree.indexOf('dep_root') < tree.indexOf('dep_mid'));
        assert.ok(tree.indexOf('dep_mid') < tree.indexOf('dep_leaf'));
    });
});

// ── 4. Collapsible Mixin ──

describe('4. collapsible mixin', () => {
    const collapsible_mixin = require('../../control_mixins/collapsible');

    test('collapsible adds expand/collapse/toggle methods', () => {
        const ctrl = mock_control();
        collapsible_mixin(ctrl);

        assert.strictEqual(typeof ctrl.expand, 'function');
        assert.strictEqual(typeof ctrl.collapse, 'function');
        assert.strictEqual(typeof ctrl.toggle_collapse, 'function');
        assert.strictEqual(typeof ctrl.is_expanded, 'function');
        assert.strictEqual(typeof ctrl.is_collapsed, 'function');

        ctrl.destroy();
    });

    test('starts expanded by default', () => {
        const ctrl = mock_control();
        collapsible_mixin(ctrl);

        assert.strictEqual(ctrl.is_expanded(), true);
        assert.strictEqual(ctrl.is_collapsed(), false);
        assert.ok(ctrl.dom.el.classList.contains('expanded'));

        ctrl.destroy();
    });

    test('starts collapsed when initial: "collapsed"', () => {
        const ctrl = mock_control();
        collapsible_mixin(ctrl, { initial: 'collapsed' });

        assert.strictEqual(ctrl.is_expanded(), false);
        assert.strictEqual(ctrl.is_collapsed(), true);
        assert.ok(ctrl.dom.el.classList.contains('collapsed'));

        ctrl.destroy();
    });

    test('toggle switches between states', () => {
        const ctrl = mock_control();
        collapsible_mixin(ctrl);

        ctrl.toggle_collapse();
        assert.strictEqual(ctrl.is_collapsed(), true);
        assert.ok(ctrl.dom.el.classList.contains('collapsed'));

        ctrl.toggle_collapse();
        assert.strictEqual(ctrl.is_expanded(), true);
        assert.ok(ctrl.dom.el.classList.contains('expanded'));

        ctrl.destroy();
    });

    test('collapse/expand fire events', () => {
        const ctrl = mock_control();
        collapsible_mixin(ctrl);

        const events = [];
        ctrl.on('collapse', () => events.push('collapse'));
        ctrl.on('expand', () => events.push('expand'));

        ctrl.collapse();
        ctrl.expand();

        assert.deepStrictEqual(events, ['collapse', 'expand']);

        ctrl.destroy();
    });

    test('sets aria-expanded on trigger element', () => {
        const ctrl = mock_control();
        collapsible_mixin(ctrl);

        assert.strictEqual(ctrl.dom.el.getAttribute('aria-expanded'), 'true');

        ctrl.collapse();
        assert.strictEqual(ctrl.dom.el.getAttribute('aria-expanded'), 'false');

        ctrl.expand();
        assert.strictEqual(ctrl.dom.el.getAttribute('aria-expanded'), 'true');

        ctrl.destroy();
    });

    test('hides content element on collapse', () => {
        const ctrl = mock_control();
        const content = document.createElement('div');
        content.className = 'body';
        ctrl.dom.el.appendChild(content);

        collapsible_mixin(ctrl, { content: '.body' });

        ctrl.collapse();
        assert.strictEqual(content.style.display, 'none');

        ctrl.expand();
        assert.strictEqual(content.style.display, '');

        ctrl.destroy();
    });

    test('dispose removes methods and CSS classes', () => {
        const ctrl = mock_control();
        const handle = collapsible_mixin(ctrl);

        assert.strictEqual(ctrl.__mx.collapsible, handle);
        assert.strictEqual(handle.disposed, false);

        handle.dispose();

        assert.strictEqual(handle.disposed, true);
        assert.strictEqual(ctrl.expand, undefined);
        assert.strictEqual(ctrl.collapse, undefined);
        assert.strictEqual(ctrl.toggle_collapse, undefined);

        ctrl.destroy();
    });

    test('double application returns same handle', () => {
        const ctrl = mock_control();
        const h1 = collapsible_mixin(ctrl);
        const h2 = collapsible_mixin(ctrl);
        assert.strictEqual(h1, h2, 'should return same handle on re-application');
        ctrl.destroy();
    });

    test('click on trigger toggles collapse', () => {
        const ctrl = mock_control();
        collapsible_mixin(ctrl);

        assert.strictEqual(ctrl.is_expanded(), true);

        ctrl.dom.el.click();
        assert.strictEqual(ctrl.is_collapsed(), true);

        ctrl.dom.el.click();
        assert.strictEqual(ctrl.is_expanded(), true);

        ctrl.destroy();
    });

    cleanup_dom();
});

// ── 5. Pressed-State with Dispose ──

describe('5. pressed-state with dispose', () => {
    const pressed_state = require('../../control_mixins/pressed-state');

    test('pressed-state applies and adds pressed class on press-start', () => {
        const ctrl = mock_control();
        pressed_state(ctrl);

        ctrl.trigger('press-start');
        assert.strictEqual(ctrl.has_class('pressed'), true, 'should have pressed class');

        ctrl.trigger('press-end');
        assert.strictEqual(ctrl.has_class('pressed'), false, 'should lose pressed class');

        ctrl.destroy();
    });

    test('pressed-state returns a cleanup handle', () => {
        const ctrl = mock_control();
        const handle = pressed_state(ctrl);

        assert.ok(handle !== undefined && handle !== null, 'should return handle');
        assert.strictEqual(typeof handle.dispose, 'function');
        assert.strictEqual(handle.disposed, false);

        ctrl.destroy();
    });

    test('pressed-state dispose stops responding to events', () => {
        const ctrl = mock_control();
        const handle = pressed_state(ctrl);

        // Should work before dispose
        ctrl.trigger('press-start');
        assert.strictEqual(ctrl.has_class('pressed'), true);
        ctrl.trigger('press-end');

        // Dispose
        handle.dispose();

        // Should NOT respond after dispose
        ctrl.trigger('press-start');
        assert.strictEqual(ctrl.has_class('pressed'), false,
            'should not add pressed class after dispose');

        ctrl.destroy();
    });

    test('pressed-state double application returns same handle', () => {
        const ctrl = mock_control();
        const h1 = pressed_state(ctrl);
        const h2 = pressed_state(ctrl);
        assert.strictEqual(h1, h2, 'double application should return same handle');

        ctrl.destroy();
    });

    test('pressed-state dispose clears __mx entry', () => {
        const ctrl = mock_control();
        const handle = pressed_state(ctrl);

        assert.ok(ctrl.__mx.pressed_state, 'should be registered');
        handle.dispose();
        assert.strictEqual(ctrl.__mx.pressed_state, undefined, 'should be unregistered');

        ctrl.destroy();
    });

    cleanup_dom();
});

// ═══════════════════════════════════════════════════
//  SUMMARY
// ═══════════════════════════════════════════════════

console.log('\n' + '═'.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);

if (failed > 0) {
    console.log('\nFailed tests:');
    for (const { name, error } of errors) {
        console.log(`  ✗ ${name}: ${error.message}`);
    }
    process.exit(1);
} else {
    console.log('All tests passed!');
    process.exit(0);
}
