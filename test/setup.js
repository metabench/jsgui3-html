/**
 * Test Setup - Global configuration for test environment
 * 
 * Sets up jsdom for DOM testing and global test utilities
 */

const { JSDOM } = require('jsdom');
const { expect } = require('chai');

// Setup jsdom for DOM manipulation tests
const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Event = dom.window.Event;
global.CustomEvent = dom.window.CustomEvent;

// Make expect globally available
global.expect = expect;

// Helper to create a test context
global.createTestContext = function() {
    const jsgui = require('../html-core/html-core');
    return new jsgui.Page_Context();
};

// Helper to wait for async operations
global.waitFor = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper to trigger DOM events
global.triggerEvent = function(element, eventName, detail) {
    const event = new Event(eventName, { bubbles: true, cancelable: true });
    if (detail) {
        Object.assign(event, detail);
    }
    element.dispatchEvent(event);
};

// Helper to clean up after tests
global.cleanup = function() {
    // Clear document body
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
};

// Run cleanup after each test
if (typeof afterEach !== 'undefined') {
    afterEach(() => {
        cleanup();
    });
}

console.log('Test environment initialized');
