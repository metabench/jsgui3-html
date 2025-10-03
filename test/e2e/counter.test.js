/**
 * E2E Tests for Enhanced Counter Example
 * 
 * Tests all functionality including:
 * - Increment/decrement/reset buttons
 * - Keyboard shortcuts (↑, ↓, R, Ctrl+Z, Ctrl+Y)
 * - Undo/redo history management
 * - localStorage persistence
 * - Display updates and parity indicator
 */

const { expect } = require('chai');
const {
    start_server,
    stop_server,
    launch_browser,
    get_text,
    click_element,
    get_local_storage,
    clear_local_storage
} = require('./helpers');

describe('Enhanced Counter E2E Tests', function() {
    this.timeout(30000);
    
    let browser;
    let page;
    let server;
    const PORT = 52001;
    
    // Start server and browser before all tests
    before(async function() {
        console.log('Starting counter server...');
        server = await start_server('counter', PORT);
        console.log(`Counter server started at ${server.url}`);
        
        console.log('Launching browser...');
        browser = await launch_browser();
        console.log('Browser launched');
    });
    
    // Close browser and server after all tests
    after(async function() {
        if (browser) {
            await browser.close();
            console.log('Browser closed');
        }
        if (server) {
            stop_server(server.process);
            console.log('Server stopped');
        }
    });
    
    // Create fresh page before each test
    beforeEach(async function() {
        page = await browser.newPage();
        await page.goto(server.url, { waitUntil: 'networkidle0' });
        
        // Clear localStorage before each test
        await clear_local_storage(page);
        
        // Wait for counter to be ready
        await page.waitForSelector('.counter', { timeout: 5000 });
    });
    
    // Close page after each test
    afterEach(async function() {
        if (page) {
            await page.close();
        }
    });
    
    describe('Initial State', function() {
        it('should display counter starting at 0', async function() {
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('0');
        });
        
        it('should show "even" parity indicator', async function() {
            const parity_text = await get_text(page, '.parity-indicator');
            expect(parity_text.toLowerCase()).to.include('even');
        });
        
        it('should have undo/redo buttons disabled', async function() {
            const undo_disabled = await page.$eval('.undo-btn', btn => btn.disabled);
            const redo_disabled = await page.$eval('.redo-btn', btn => btn.disabled);
            
            expect(undo_disabled).to.be.true;
            expect(redo_disabled).to.be.true;
        });
        
        it('should show history size as 1', async function() {
            const history_text = await get_text(page, '.counter-stats');
            expect(history_text).to.include('1');
        });
    });
    
    describe('Increment Button', function() {
        it('should increment counter by 1', async function() {
            await click_element(page, '.increment');
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('1');
        });
        
        it('should update parity to "odd"', async function() {
            await click_element(page, '.increment');
            
            const parity_text = await get_text(page, '.parity-indicator');
            expect(parity_text.toLowerCase()).to.include('odd');
        });
        
        it('should enable undo button', async function() {
            await click_element(page, '.increment');
            
            const undo_disabled = await page.$eval('.undo-btn', btn => btn.disabled);
            expect(undo_disabled).to.be.false;
        });
        
        it('should increment multiple times', async function() {
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('3');
        });
    });
    
    describe('Decrement Button', function() {
        it('should decrement counter by 1', async function() {
            await click_element(page, '.decrement');
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('-1');
        });
        
        it('should update parity to "odd"', async function() {
            await click_element(page, '.decrement');
            
            const parity_text = await get_text(page, '.parity-indicator');
            expect(parity_text.toLowerCase()).to.include('odd');
        });
        
        it('should work after increment', async function() {
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            await click_element(page, '.decrement');
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('1');
        });
    });
    
    describe('Reset Button', function() {
        it('should reset counter to 0', async function() {
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            
            await click_element(page, '.reset');
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('0');
        });
        
        it('should update parity to "even"', async function() {
            await click_element(page, '.increment');
            await click_element(page, '.reset');
            
            const parity_text = await get_text(page, '.parity-indicator');
            expect(parity_text.toLowerCase()).to.include('even');
        });
    });
    
    describe('Keyboard Shortcuts', function() {
        it('should increment with ArrowUp key', async function() {
            await page.keyboard.press('ArrowUp');
            await page.waitForTimeout(100);
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('1');
        });
        
        it('should decrement with ArrowDown key', async function() {
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(100);
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('-1');
        });
        
        it('should reset with R key', async function() {
            await page.keyboard.press('ArrowUp');
            await page.keyboard.press('ArrowUp');
            await page.keyboard.press('KeyR');
            await page.waitForTimeout(100);
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('0');
        });
        
        it('should handle multiple key presses', async function() {
            await page.keyboard.press('ArrowUp');
            await page.keyboard.press('ArrowUp');
            await page.keyboard.press('ArrowUp');
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(100);
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('2');
        });
    });
    
    describe('Undo/Redo Functionality', function() {
        it('should undo last action', async function() {
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            
            await click_element(page, '.undo-btn');
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('1');
        });
        
        it('should undo multiple actions', async function() {
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            
            await click_element(page, '.undo-btn');
            await click_element(page, '.undo-btn');
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('1');
        });
        
        it('should redo last undone action', async function() {
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            await click_element(page, '.undo-btn');
            
            await click_element(page, '.redo-btn');
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('2');
        });
        
        it('should undo with Ctrl+Z', async function() {
            await click_element(page, '.increment');
            await page.keyboard.down('Control');
            await page.keyboard.press('KeyZ');
            await page.keyboard.up('Control');
            await page.waitForTimeout(100);
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('0');
        });
        
        it('should redo with Ctrl+Y', async function() {
            await click_element(page, '.increment');
            await page.keyboard.down('Control');
            await page.keyboard.press('KeyZ');
            await page.keyboard.up('Control');
            
            await page.keyboard.down('Control');
            await page.keyboard.press('KeyY');
            await page.keyboard.up('Control');
            await page.waitForTimeout(100);
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('1');
        });
        
        it('should disable undo button when at start of history', async function() {
            await click_element(page, '.increment');
            await click_element(page, '.undo-btn');
            
            const undo_disabled = await page.$eval('.undo-btn', btn => btn.disabled);
            expect(undo_disabled).to.be.true;
        });
        
        it('should disable redo button when at end of history', async function() {
            await click_element(page, '.increment');
            await click_element(page, '.undo-btn');
            await click_element(page, '.redo-btn');
            
            const redo_disabled = await page.$eval('.redo-btn', btn => btn.disabled);
            expect(redo_disabled).to.be.true;
        });
        
        it('should clear redo history when new action is taken', async function() {
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            await click_element(page, '.undo-btn');
            
            // New action should clear redo
            await click_element(page, '.increment');
            
            const redo_disabled = await page.$eval('.redo-btn', btn => btn.disabled);
            expect(redo_disabled).to.be.true;
        });
    });
    
    describe('History Management', function() {
        it('should update history size display', async function() {
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            
            const history_text = await get_text(page, '.counter-stats');
            expect(history_text).to.include('3');
        });
        
        it('should show current position in history', async function() {
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            await click_element(page, '.undo-btn');
            
            const history_text = await get_text(page, '.counter-stats');
            // Should show position 2 of 3
            expect(history_text).to.match(/2.*3/);
        });
        
        it('should clear history', async function() {
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            
            await click_element(page, '.clear-history-btn');
            
            const count_text = await get_text(page, '.counter-display');
            const history_text = await get_text(page, '.counter-stats');
            
            expect(count_text).to.equal('0');
            expect(history_text).to.include('1');
        });
    });
    
    describe('localStorage Persistence', function() {
        it('should save counter value to localStorage', async function() {
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            
            // Wait for debounced save
            await page.waitForTimeout(600);
            
            const saved_data = await get_local_storage(page, 'counter_state');
            expect(saved_data).to.not.be.null;
            expect(saved_data.count).to.equal(3);
        });
        
        it('should save history to localStorage', async function() {
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            
            // Wait for debounced save
            await page.waitForTimeout(600);
            
            const saved_data = await get_local_storage(page, 'counter_state');
            expect(saved_data.history).to.be.an('array');
            expect(saved_data.history).to.have.lengthOf(3);
            expect(saved_data.history).to.deep.equal([0, 1, 2]);
        });
        
        it('should restore counter value from localStorage', async function() {
            // Set initial value
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            
            // Wait for save
            await page.waitForTimeout(600);
            
            // Reload page
            await page.reload({ waitUntil: 'networkidle0' });
            await page.waitForSelector('.counter');
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('3');
        });
        
        it('should restore history from localStorage', async function() {
            // Build history
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            await click_element(page, '.decrement');
            
            // Wait for save
            await page.waitForTimeout(600);
            
            // Reload page
            await page.reload({ waitUntil: 'networkidle0' });
            await page.waitForSelector('.counter');
            
            // Should be able to undo
            await click_element(page, '.undo-btn');
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('2');
        });
        
        it('should restore undo/redo state from localStorage', async function() {
            // Build history and undo
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            await click_element(page, '.undo-btn');
            
            // Wait for save
            await page.waitForTimeout(600);
            
            // Reload page
            await page.reload({ waitUntil: 'networkidle0' });
            await page.waitForSelector('.counter');
            
            // Should be at position 2 with redo available
            const redo_disabled = await page.$eval('.redo-btn', btn => btn.disabled);
            expect(redo_disabled).to.be.false;
            
            await click_element(page, '.redo-btn');
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('2');
        });
    });
    
    describe('Display Updates', function() {
        it('should update all displays synchronously', async function() {
            await click_element(page, '.increment');
            
            const count_text = await get_text(page, '.counter-display');
            const parity_text = await get_text(page, '.parity-indicator');
            const history_text = await get_text(page, '.counter-stats');
            
            expect(count_text).to.equal('1');
            expect(parity_text.toLowerCase()).to.include('odd');
            expect(history_text).to.include('2');
        });
    });
    
    describe('Complex Interaction Scenarios', function() {
        it('should handle rapid button clicks', async function() {
            for (let i = 0; i < 10; i++) {
                await click_element(page, '.increment');
            }
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('10');
        });
        
        it('should handle mixed button and keyboard input', async function() {
            await click_element(page, '.increment');
            await page.keyboard.press('ArrowUp');
            await click_element(page, '.increment');
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(100);
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('2');
        });
        
        it('should handle complex undo/redo sequence', async function() {
            // Build history
            await click_element(page, '.increment'); // 1
            await click_element(page, '.increment'); // 2
            await click_element(page, '.increment'); // 3
            await click_element(page, '.decrement'); // 2
            
            // Undo twice
            await click_element(page, '.undo-btn'); // back to 3
            await click_element(page, '.undo-btn'); // back to 2
            
            // Redo once
            await click_element(page, '.redo-btn'); // forward to 3
            
            // New action (should clear redo)
            await click_element(page, '.decrement'); // 2
            
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('2');
            
            // Redo should be disabled
            const redo_disabled = await page.$eval('.redo-btn', btn => btn.disabled);
            expect(redo_disabled).to.be.true;
        });
        
        it('should handle reset with existing history', async function() {
            await click_element(page, '.increment');
            await click_element(page, '.increment');
            await click_element(page, '.reset');
            
            // Should be able to undo the reset
            await click_element(page, '.undo-btn');
            const count_text = await get_text(page, '.counter-display');
            expect(count_text).to.equal('2');
        });
    });
});
