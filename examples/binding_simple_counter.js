/**
 * Example: Simple Counter (Minimal MVVM Example)
 * 
 * This is the simplest possible example demonstrating:
 * - Basic MVVM control structure
 * - Model binding
 * - Computed properties
 * - Event handling
 */

const jsgui = require('../html-core/html-core');
const { Data_Object } = require('lang-tools');
const Data_Model_View_Model_Control = require('../html-core/Data_Model_View_Model_Control');

class SimpleCounter extends Data_Model_View_Model_Control {
    constructor(spec) {
        super(spec);
        
        // Data model - the actual count
        this.data.model = new Data_Object({
            count: spec.initialCount || 0
        });
        
        // View model - UI representation
        this.view.data.model = new Data_Object({
            displayText: '',
            isPositive: false,
            isEven: false
        });
        
        this.setupBindings();
        this.setupComputed();
        
        if (!spec.el) {
            this.compose();
        }
    }
    
    setupBindings() {
        // Bind count to display text with formatting
        this.bind({
            'count': {
                to: 'displayText',
                transform: (count) => `Count: ${count}`
            }
        });
    }
    
    setupComputed() {
        // Computed: is count positive?
        this.computed(
            this.data.model,
            ['count'],
            (count) => count > 0,
            { propertyName: 'isPositive', target: this.view.data.model }
        );
        
        // Computed: is count even?
        this.computed(
            this.data.model,
            ['count'],
            (count) => count % 2 === 0,
            { propertyName: 'isEven', target: this.view.data.model }
        );
    }
    
    increment() {
        this.data.model.count++;
    }
    
    decrement() {
        this.data.model.count--;
    }
    
    reset() {
        this.data.model.count = 0;
    }
    
    compose() {
        this.add_class('simple-counter');
        
        // Display
        const display = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'counter-display'
        });
        
        // Update display text when it changes
        this.watch(
            this.view.data.model,
            'displayText',
            (text) => {
                display.clear();
                display.add(text);
            },
            { immediate: true }
        );
        
        // Update display class based on computed properties
        this.watch(
            this.view.data.model,
            ['isPositive', 'isEven'],
            (isPositive, isEven) => {
                display.remove_class('positive');
                display.remove_class('negative');
                display.remove_class('even');
                display.remove_class('odd');
                
                if (isPositive) {
                    display.add_class('positive');
                } else {
                    display.add_class('negative');
                }
                
                if (isEven) {
                    display.add_class('even');
                } else {
                    display.add_class('odd');
                }
            }
        );
        
        this.add(display);
        
        // Buttons container
        const buttons = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'counter-buttons'
        });
        
        // Decrement button
        const decrementBtn = new jsgui.Control({
            context: this.context,
            tagName: 'button',
            content: '−'
        });
        decrementBtn.on('click', () => this.decrement());
        buttons.add(decrementBtn);
        
        // Reset button
        const resetBtn = new jsgui.Control({
            context: this.context,
            tagName: 'button',
            content: 'Reset'
        });
        resetBtn.on('click', () => this.reset());
        buttons.add(resetBtn);
        
        // Increment button
        const incrementBtn = new jsgui.Control({
            context: this.context,
            tagName: 'button',
            content: '+'
        });
        incrementBtn.on('click', () => this.increment());
        buttons.add(incrementBtn);
        
        this.add(buttons);
        
        // Info display
        const info = new jsgui.Control({
            context: this.context,
            tagName: 'div',
            class: 'counter-info'
        });
        
        this.watch(
            this.view.data.model,
            ['isPositive', 'isEven'],
            (isPositive, isEven) => {
                info.clear();
                const sign = isPositive ? 'positive' : 'negative or zero';
                const parity = isEven ? 'even' : 'odd';
                info.add(`The count is ${sign} and ${parity}.`);
            },
            { immediate: true }
        );
        
        this.add(info);
    }
}

// Usage example
function createExample() {
    const context = new jsgui.Page_Context();
    
    const counter = new SimpleCounter({
        context,
        initialCount: 0
    });
    
    console.log('Initial state:');
    console.log('- Count:', counter.data.model.count);
    console.log('- Display:', counter.view.data.model.displayText);
    console.log('- Is positive:', counter.view.data.model.isPositive);
    console.log('- Is even:', counter.view.data.model.isEven);
    
    // Simulate some clicks
    console.log('\nIncrementing 3 times...');
    counter.increment();
    counter.increment();
    counter.increment();
    
    setTimeout(() => {
        console.log('After incrementing:');
        console.log('- Count:', counter.data.model.count);
        console.log('- Display:', counter.view.data.model.displayText);
        console.log('- Is positive:', counter.view.data.model.isPositive);
        console.log('- Is even:', counter.view.data.model.isEven);
        
        console.log('\nDecrementing 5 times...');
        counter.decrement();
        counter.decrement();
        counter.decrement();
        counter.decrement();
        counter.decrement();
        
        setTimeout(() => {
            console.log('After decrementing:');
            console.log('- Count:', counter.data.model.count);
            console.log('- Display:', counter.view.data.model.displayText);
            console.log('- Is positive:', counter.view.data.model.isPositive);
            console.log('- Is even:', counter.view.data.model.isEven);
            
            console.log('\nResetting...');
            counter.reset();
            
            setTimeout(() => {
                console.log('After reset:');
                console.log('- Count:', counter.data.model.count);
                console.log('- Display:', counter.view.data.model.displayText);
                console.log('- Is positive:', counter.view.data.model.isPositive);
                console.log('- Is even:', counter.view.data.model.isEven);
            }, 100);
        }, 100);
    }, 100);
    
    return counter;
}

if (require.main === module) {
    const counter = createExample();
    
    setTimeout(() => {
        console.log('\n=== Rendered HTML ===');
        console.log(counter.html);
    }, 500);
}

module.exports = SimpleCounter;
