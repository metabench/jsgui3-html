/**
 * Enhanced Counter Example - Client Side
 * 
 * Demonstrates:
 * - Basic MVVM data binding
 * - Server-side rendering + client-side activation
 * - Computed properties
 * - Event handling in isomorphic context
 * - Undo/Redo functionality
 * - Keyboard shortcuts
 * - localStorage persistence
 * - Animations
 * - History tracking
 */

const jsgui = require('../../../html');
const { Data_Object } = require('lang-tools');
const { Control, Active_HTML_Document } = jsgui;
const Data_Model_View_Model_Control = require('../../../html-core/Data_Model_View_Model_Control');

/**
 * Counter Control
 * An enhanced counter with undo/redo, keyboard shortcuts, and persistence
 */
class Counter extends Data_Model_View_Model_Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'counter';
        super(spec);
        
        const { context } = this;
        
        // Initialize undo/redo stacks
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        
        // Load from localStorage if available
        const savedCount = this._loadFromStorage();
        
        // Create the data model (runs on both server and client)
        this.model = new Data_Object({
            count: savedCount !== null ? savedCount : (spec.initialCount || 0),
            canUndo: false,
            canRedo: false
        });
        
        // Initialize history with starting value
        this._pushHistory(this.model.get('count'));
        
        // Add CSS class
        this.add_class('counter');
        
        // Create header
        const header = new Control({ context, tag_name: 'div' });
        header.add_class('counter-header');
        const title = new Control({ context, tag_name: 'h2' });
        title.add('Enhanced Counter');
        header.add(title);
        this.add(header);
        
        // Create display panel
        const displayPanel = new Control({ context, tag_name: 'div' });
        displayPanel.add_class('counter-display-panel');
        
        const display = new Control({ context, tag_name: 'div' });
        display.add_class('counter-display');
        displayPanel.add(display);
        
        // Parity indicator
        const parityIndicator = new Control({ context, tag_name: 'div' });
        parityIndicator.add_class('parity-indicator');
        displayPanel.add(parityIndicator);
        
        this.add(displayPanel);
        
        // Main controls
        const mainControls = new Control({ context, tag_name: 'div' });
        mainControls.add_class('counter-controls');
        
        const decrementBtn = new Control({ context, tag_name: 'button' });
        decrementBtn.add_class('counter-btn');
        decrementBtn.add_class('decrement');
        decrementBtn.add('−');
        decrementBtn.dom.attributes.title = 'Decrement (Arrow Down)';
        
        const incrementBtn = new Control({ context, tag_name: 'button' });
        incrementBtn.add_class('counter-btn');
        incrementBtn.add_class('increment');
        incrementBtn.add('+');
        incrementBtn.dom.attributes.title = 'Increment (Arrow Up)';
        
        const resetBtn = new Control({ context, tag_name: 'button' });
        resetBtn.add_class('counter-btn');
        resetBtn.add_class('reset');
        resetBtn.add('Reset');
        resetBtn.dom.attributes.title = 'Reset to 0 (R)';
        
        mainControls.add(decrementBtn);
        mainControls.add(incrementBtn);
        mainControls.add(resetBtn);
        this.add(mainControls);
        
        // History controls
        const historyControls = new Control({ context, tag_name: 'div' });
        historyControls.add_class('history-controls');
        
        const undoBtn = new Control({ context, tag_name: 'button' });
        undoBtn.add_class('history-btn');
        undoBtn.add_class('undo-btn');
        undoBtn.add('↶ Undo');
        undoBtn.dom.attributes.title = 'Undo (Ctrl+Z)';
        
        const redoBtn = new Control({ context, tag_name: 'button' });
        redoBtn.add_class('history-btn');
        redoBtn.add_class('redo-btn');
        redoBtn.add('↷ Redo');
        redoBtn.dom.attributes.title = 'Redo (Ctrl+Y)';
        
        const clearHistoryBtn = new Control({ context, tag_name: 'button' });
        clearHistoryBtn.add_class('history-btn');
        clearHistoryBtn.add_class('clear-history-btn');
        clearHistoryBtn.add('Clear History');
        
        historyControls.add(undoBtn);
        historyControls.add(redoBtn);
        historyControls.add(clearHistoryBtn);
        this.add(historyControls);
        
        // Stats panel
        const statsPanel = new Control({ context, tag_name: 'div' });
        statsPanel.add_class('counter-stats');
        
        const historySize = new Control({ context, tag_name: 'div' });
        historySize.add_class('stat-item');
        historySize.add(`History: ${this.history.length} items`);
        statsPanel.add(historySize);
        
        this.add(statsPanel);
        
        // Keyboard shortcuts help
        const helpPanel = new Control({ context, tag_name: 'div' });
        helpPanel.add_class('counter-help');
        helpPanel.add('Keyboard: ↑/↓ = Inc/Dec | R = Reset | Ctrl+Z/Y = Undo/Redo');
        this.add(helpPanel);
        
        // Store references for activation
        this._display = display;
        this._parityIndicator = parityIndicator;
        this._decrementBtn = decrementBtn;
        this._incrementBtn = incrementBtn;
        this._resetBtn = resetBtn;
        this._undoBtn = undoBtn;
        this._redoBtn = redoBtn;
        this._clearHistoryBtn = clearHistoryBtn;
        this._historySize = historySize;
        
        // Set up data binding
        this.bind('count', this.model, {
            toView: (value) => {
                return `${value}`;
            }
        }, display);
        
        // Computed property: parity
        this.computed(
            this.model,
            ['count'],
            (count) => count % 2 === 0 ? 'even' : 'odd',
            { propertyName: 'parity' }
        );
        
        // Watch parity changes
        this.watch(this.model, 'parity', (newParity, oldParity) => {
            if (oldParity) {
                display.remove_class(oldParity);
                parityIndicator.remove_class(oldParity);
            }
            display.add_class(newParity);
            parityIndicator.add_class(newParity);
            
            parityIndicator.content.clear();
            parityIndicator.add(newParity.toUpperCase());
        });
        
        // Watch undo/redo availability
        this.watch(this.model, 'canUndo', (canUndo) => {
            if (canUndo) {
                undoBtn.remove_class('disabled');
            } else {
                undoBtn.add_class('disabled');
            }
        });
        
        this.watch(this.model, 'canRedo', (canRedo) => {
            if (canRedo) {
                redoBtn.remove_class('disabled');
            } else {
                redoBtn.add_class('disabled');
            }
        });
    }
    
    _pushHistory(value) {
        // Remove any redo history
        this.history.splice(this.historyIndex + 1);
        
        // Add new value
        this.history.push(value);
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
        
        this._updateHistoryButtons();
        this._updateHistoryDisplay();
    }
    
    _updateHistoryButtons() {
        this.model.set('canUndo', this.historyIndex > 0);
        this.model.set('canRedo', this.historyIndex < this.history.length - 1);
    }
    
    _updateHistoryDisplay() {
        if (this._historySize) {
            this._historySize.content.clear();
            this._historySize.add(`History: ${this.history.length} items (at ${this.historyIndex + 1})`);
        }
    }
    
    _setCount(value, addToHistory = true) {
        const oldValue = this.model.get('count');
        if (oldValue === value) return;
        
        // Animate the change
        if (this._display && this._display.dom.el) {
            this._display.add_class('changing');
            setTimeout(() => {
                if (this._display) this._display.remove_class('changing');
            }, 300);
        }
        
        this.model.set('count', value);
        
        if (addToHistory) {
            this._pushHistory(value);
        }
        
        this._saveToStorage(value);
    }
    
    _undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const value = this.history[this.historyIndex];
            this._setCount(value, false);
            this._updateHistoryButtons();
            this._updateHistoryDisplay();
        }
    }
    
    _redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const value = this.history[this.historyIndex];
            this._setCount(value, false);
            this._updateHistoryButtons();
            this._updateHistoryDisplay();
        }
    }
    
    _clearHistory() {
        const currentValue = this.model.get('count');
        this.history = [currentValue];
        this.historyIndex = 0;
        this._updateHistoryButtons();
        this._updateHistoryDisplay();
    }
    
    _saveToStorage(value) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('counter_value', value.toString());
        }
    }
    
    _loadFromStorage() {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('counter_value');
            if (saved !== null) {
                return parseInt(saved, 10);
            }
        }
        return null;
    }
    
    activate() {
        // This only runs on the client
        if (!this.__active) {
            super.activate();
            
            // Attach click handlers
            this._decrementBtn.on('click', () => {
                const current = this.model.get('count');
                this._setCount(current - 1);
            });
            
            this._incrementBtn.on('click', () => {
                const current = this.model.get('count');
                this._setCount(current + 1);
            });
            
            this._resetBtn.on('click', () => {
                this._setCount(0);
            });
            
            this._undoBtn.on('click', () => {
                this._undo();
            });
            
            this._redoBtn.on('click', () => {
                this._redo();
            });
            
            this._clearHistoryBtn.on('click', () => {
                if (confirm('Clear history?')) {
                    this._clearHistory();
                }
            });
            
            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                // Arrow up/down
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const current = this.model.get('count');
                    this._setCount(current + 1);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const current = this.model.get('count');
                    this._setCount(current - 1);
                }
                // R for reset
                else if (e.key === 'r' || e.key === 'R') {
                    if (!e.ctrlKey && !e.metaKey) {
                        this._setCount(0);
                    }
                }
                // Ctrl+Z for undo
                else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                    e.preventDefault();
                    this._undo();
                }
                // Ctrl+Y for redo
                else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                    e.preventDefault();
                    this._redo();
                }
            });
            
            // Initialize parity display
            const initialParity = this.model.get('count') % 2 === 0 ? 'even' : 'odd';
            this._parityIndicator.content.clear();
            this._parityIndicator.add(initialParity.toUpperCase());
            this._parityIndicator.add_class(initialParity);
            this._display.add_class(initialParity);
            
            // Initialize history buttons
            this._updateHistoryButtons();
        }
    }
}

// CSS for the counter
Counter.css = `
    .counter {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 32px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        max-width: 500px;
        margin: 0 auto;
    }
    
    .counter-header h2 {
        margin: 0;
        font-size: 24px;
        color: #333;
        text-align: center;
    }
    
    .counter-display-panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
    .counter-display {
        font-size: 4em;
        font-weight: 900;
        color: white;
        text-align: center;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    .counter-display.changing {
        transform: scale(1.2);
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
    }
    
    .parity-indicator {
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        background: rgba(255,255,255,0.2);
        color: white;
        transition: all 0.3s;
    }
    
    .counter-controls {
        display: flex;
        gap: 12px;
        justify-content: center;
    }
    
    .counter-btn {
        padding: 14px 28px;
        font-size: 1.1em;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 600;
        flex: 1;
        max-width: 150px;
    }
    
    .counter-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }
    
    .counter-btn:active {
        transform: translateY(0);
    }
    
    .counter-btn.increment {
        background: #4caf50;
        color: white;
    }
    
    .counter-btn.decrement {
        background: #f44336;
        color: white;
    }
    
    .counter-btn.reset {
        background: #ff9800;
        color: white;
    }
    
    .history-controls {
        display: flex;
        gap: 8px;
        justify-content: center;
        padding-top: 8px;
        border-top: 1px solid #eee;
    }
    
    .history-btn {
        padding: 10px 20px;
        font-size: 0.9em;
        border: 2px solid #ddd;
        border-radius: 6px;
        background: white;
        color: #666;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
    }
    
    .history-btn:hover:not(.disabled) {
        border-color: #667eea;
        color: #667eea;
        background: #f8f9ff;
    }
    
    .history-btn.disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
    
    .undo-btn:hover:not(.disabled),
    .redo-btn:hover:not(.disabled) {
        background: #667eea;
        color: white;
    }
    
    .clear-history-btn:hover {
        border-color: #f44336;
        color: #f44336;
        background: #ffebee;
    }
    
    .counter-stats {
        display: flex;
        justify-content: center;
        gap: 16px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .stat-item {
        font-size: 0.85em;
        color: #666;
        font-weight: 500;
    }
    
    .counter-help {
        text-align: center;
        font-size: 0.8em;
        color: #999;
        padding: 12px;
        background: #fafafa;
        border-radius: 6px;
        line-height: 1.6;
    }
`;

/**
 * Demo UI - Main Application Control
 */
class Demo_UI extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'counter_demo_ui';
        super(spec);
        
        const { context } = this;
        
        // Add page styling class
        if (typeof this.body.add_class === 'function') {
            this.body.add_class('counter-demo');
        }
        
        // Compose UI (runs on both server and client)
        if (!spec.el) {
            const title = new Control({ context, tag_name: 'h1' });
            title.add('Enhanced Counter with History & Keyboard Shortcuts');
            title.add_class('demo-title');
            
            const description = new Control({ context, tag_name: 'p' });
            description.add('A fully-featured counter with undo/redo, localStorage persistence, animations, and keyboard shortcuts. ' +
                          'Server-rendered and client-activated with MVVM data binding.');
            description.add_class('demo-description');
            
            const counter = new Counter({
                context,
                initialCount: 0
            });
            
            const info = new Control({ context, tag_name: 'div' });
            info.add_class('demo-info');
            info.add('💡 Try clicking the buttons. The display updates reactively thanks to data binding. ' +
                    'Notice how even/odd values get different colors through computed properties.');
            
            this.body.add(title);
            this.body.add(description);
            this.body.add(counter);
            this.body.add(info);
        }
    }
    
    activate() {
        // Client-side activation
        if (!this.__active) {
            super.activate();
            console.log('Counter Demo UI activated');
        }
    }
}

// Page CSS
Demo_UI.css = `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 40px 20px;
    }
    
    .counter-demo {
        max-width: 800px;
        margin: 0 auto;
    }
    
    .demo-title {
        color: white;
        text-align: center;
        margin-bottom: 20px;
        font-size: 2.5em;
        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .demo-description {
        color: white;
        text-align: center;
        margin-bottom: 40px;
        font-size: 1.2em;
        line-height: 1.6;
        opacity: 0.9;
    }
    
    .demo-info {
        color: white;
        text-align: center;
        margin-top: 40px;
        padding: 20px;
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        line-height: 1.6;
    }
`;

// Export for jsgui3-server
jsgui.controls = jsgui.controls || {};
jsgui.controls.Demo_UI = Demo_UI;
jsgui.controls.Counter = Counter;

module.exports = jsgui;
