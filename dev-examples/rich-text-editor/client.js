/**
 * Rich Text Editor Test/Demo
 * 
 * Simple standalone test to verify RTE functionality
 */

const jsgui = require('../../html');
const { Control, Active_HTML_Document } = jsgui;
const Rich_Text_Editor = require('../../controls/organised/1-standard/1-editor/Rich_Text_Editor');

class RTE_Demo extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'rte_demo';
        super(spec);
        
        const { context } = this;
        
        if (typeof this.body.add_class === 'function') {
            this.body.add_class('rte-demo-body');
        }
        
        if (!spec.el) {
            // Add title
            if (this.head) {
                const title = new Control({ context, tag_name: 'title' });
                title.add('Rich Text Editor Demo');
                this.head.add(title);
                
                // Add RTE styles
                const style_link = new Control({ context, tag_name: 'link' });
                style_link.dom.attributes.rel = 'stylesheet';
                style_link.dom.attributes.href = '/controls/organised/1-standard/1-editor/rich_text_editor.css';
                this.head.add(style_link);
            }
            
            const container = new Control({ context, tag_name: 'div' });
            container.add_class('rte-demo-container');
            
            // Title
            const heading = new Control({ context, tag_name: 'h1' });
            heading.add('Rich Text Editor Demo');
            container.add(heading);
            
            // Description
            const desc = new Control({ context, tag_name: 'p' });
            desc.add('Try out the formatting toolbar. Type some text, select it, and click the buttons to format.');
            container.add(desc);
            
            // Rich Text Editor
            this.rte = new Rich_Text_Editor({
                context,
                placeholder: 'Start typing your content here...',
                initial_html: '<p>This is <strong>bold</strong> and this is <em>italic</em>.</p><ul><li>Bullet point 1</li><li>Bullet point 2</li></ul>',
                min_height: '300px',
                max_height: '600px',
                on_change: (html) => {
                    console.log('Content changed:', html);
                    this.update_output(html);
                }
            });
            
            container.add(this.rte);
            
            // Output display
            const output_section = new Control({ context, tag_name: 'div' });
            output_section.add_class('output-section');
            
            const output_title = new Control({ context, tag_name: 'h2' });
            output_title.add('HTML Output:');
            output_section.add(output_title);
            
            this.output_display = new Control({ context, tag_name: 'pre' });
            this.output_display.add_class('output-display');
            output_section.add(this.output_display);
            
            container.add(output_section);
            
            // Buttons
            const buttons_container = new Control({ context, tag_name: 'div' });
            buttons_container.add_class('buttons-container');
            
            const get_html_btn = new Control({ context, tag_name: 'button' });
            get_html_btn.add('Get HTML');
            buttons_container.add(get_html_btn);
            
            const get_text_btn = new Control({ context, tag_name: 'button' });
            get_text_btn.add('Get Plain Text');
            buttons_container.add(get_text_btn);
            
            const clear_btn = new Control({ context, tag_name: 'button' });
            clear_btn.add('Clear Content');
            buttons_container.add(clear_btn);
            
            const readonly_btn = new Control({ context, tag_name: 'button' });
            readonly_btn.add('Toggle Read-Only');
            buttons_container.add(readonly_btn);
            
            container.add(buttons_container);
            
            // Stats display
            this.stats_display = new Control({ context, tag_name: 'div' });
            this.stats_display.add_class('stats-display');
            container.add(this.stats_display);
            
            if (this.body) {
                this.body.add(container);
            } else {
                this.add(container);
            }
            
            // Store button references for event handlers
            this.get_html_btn = get_html_btn;
            this.get_text_btn = get_text_btn;
            this.clear_btn = clear_btn;
            this.readonly_btn = readonly_btn;
        }
    }
    
    activate() {
        if (!this.__active) {
            super.activate();
            
            // Initial output display
            this.update_output(this.rte.get_html());
            
            // Button event handlers
            this.get_html_btn.on('click', () => {
                const html = this.rte.get_html();
                alert('HTML:\n\n' + html);
            });
            
            this.get_text_btn.on('click', () => {
                const text = this.rte.get_text();
                alert('Plain Text:\n\n' + text);
            });
            
            this.clear_btn.on('click', () => {
                this.rte.clear();
                this.update_output('');
            });
            
            this.readonly_btn.on('click', () => {
                const is_readonly = this.rte.config.read_only;
                this.rte.set_read_only(!is_readonly);
            });
        }
    }
    
    update_output(html) {
        if (this.output_display.dom.el) {
            // Escape HTML for display
            const escaped = html
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            
            this.output_display.content.clear();
            this.output_display.dom.el.innerHTML = escaped;
        }
        
        // Update stats
        const char_count = this.rte.get_character_count();
        const word_count = this.rte.get_word_count();
        
        this.stats_display.content.clear();
        this.stats_display.add(`Characters: ${char_count} | Words: ${word_count}`);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Demo_UI: RTE_Demo };
}
