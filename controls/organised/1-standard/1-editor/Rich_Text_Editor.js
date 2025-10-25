/**
 * Rich_Text_Editor - Simple WYSIWYG HTML editor control
 * 
 * A basic but extensible rich text editor that edits HTML content using contenteditable.
 * Provides toolbar with common formatting options and maintains clean HTML output.
 * 
 * Current Features (Phase 1 - MVP):
 * - Bold, Italic, Underline formatting
 * - Ordered and unordered lists
 * - Links with URL prompt
 * - Clear formatting
 * - HTML output (get_html/set_html methods)
 * - Clean paste (strips unwanted formatting)
 * - Undo/redo via browser
 * 
 * ARCHITECTURE NOTES:
 * ==================
 * This is a minimal implementation that uses contenteditable and execCommand.
 * While execCommand is deprecated, it's still widely supported and simple to use.
 * Future versions should migrate to a more robust approach.
 * 
 * PLANNED EXTENSIONS:
 * ===================
 * 
 * Phase 2 - Enhanced Formatting:
 * - Headings (H1-H6) with dropdown selector
 * - Text alignment (left, center, right, justify)
 * - Text color and background color pickers
 * - Font family selector (from predefined list)
 * - Font size selector
 * - Strikethrough, subscript, superscript
 * - Block quote
 * - Code block with syntax highlighting (integrate Prism.js or similar)
 * - Horizontal rule
 * 
 * Phase 3 - Advanced Content:
 * - Image insertion:
 *   - Upload from file system
 *   - Insert from URL
 *   - Drag and drop
 *   - Resize handles on selected images
 *   - Alt text editor
 * - Table insertion and editing:
 *   - Table wizard (rows/cols picker)
 *   - Add/remove rows and columns
 *   - Cell merging
 *   - Table styling
 * - Embedded media:
 *   - Video embed (YouTube, Vimeo)
 *   - Audio embed
 *   - iFrame embeds
 * - File attachments (with backend integration)
 * 
 * Phase 4 - Rich Interactions:
 * - Mentions system (@username autocomplete)
 * - Emoji picker
 * - Special characters dialog
 * - Find and replace
 * - Word count / character count display
 * - Markdown support (input markdown, render HTML)
 * - Full screen mode toggle
 * - Distraction-free writing mode
 * 
 * Phase 5 - Collaboration Features:
 * - Real-time collaborative editing (CRDT or OT algorithm)
 * - Cursor position indicators for other users
 * - Comment/annotation system on text ranges
 * - Track changes / revision history
 * - Conflict resolution UI
 * 
 * Phase 6 - Accessibility & Standards:
 * - ARIA labels on all toolbar buttons
 * - Keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)
 * - Keyboard shortcut help dialog (Ctrl+/)
 * - Screen reader announcements for state changes
 * - High contrast mode support
 * - Focus trap management when dialogs open
 * - Semantic HTML output (use <strong> not <b>, <em> not <i>)
 * 
 * Phase 7 - Advanced Features:
 * - Custom toolbar configuration (enable/disable buttons)
 * - Plugin system for custom buttons and functionality
 * - Template snippets (insert pre-formatted content blocks)
 * - Macro recording and playback
 * - Export to PDF, Word, Markdown
 * - Spell check integration (browser native + custom dictionary)
 * - Grammar checking (LanguageTool API or similar)
 * - Auto-save with draft recovery
 * - Version comparison (diff view between versions)
 * 
 * Phase 8 - Performance & Polish:
 * - Lazy load toolbar buttons (render on demand)
 * - Virtual scrolling for very long documents
 * - Debounced change events (avoid excessive re-renders)
 * - Memoized HTML sanitization
 * - Web Worker for heavy processing (sanitization, export)
 * - Progressive enhancement (fallback to textarea)
 * - Mobile-optimized toolbar (bottom sheet on touch devices)
 * - Touch gestures (swipe for undo/redo, pinch for zoom)
 * 
 * TECHNICAL DECISIONS:
 * ====================
 * 
 * ContentEditable vs Canvas/Custom Rendering:
 * - Phase 1 uses contenteditable for simplicity and browser support
 * - Future: Consider ProseMirror, Slate, Quill, or TipTap for production use
 * - These libraries provide:
 *   - Consistent cross-browser behavior
 *   - Schema-based content validation
 *   - Better undo/redo
 *   - Plugin architecture
 *   - Better accessibility
 * 
 * HTML Sanitization:
 * - Currently uses simple regex and DOM manipulation
 * - Future: Integrate DOMPurify for robust XSS protection
 * - Whitelist approach (allow only specific tags/attributes)
 * - Configurable sanitization rules
 * 
 * State Management:
 * - Phase 1: Direct DOM manipulation
 * - Future: Model-based approach (content model separate from view)
 * - This enables:
 *   - Better undo/redo
 *   - Real-time collaboration
 *   - Offline editing with sync
 *   - Multiple views of same content
 * 
 * Data Format:
 * - Phase 1: HTML string
 * - Future options:
 *   - JSON document structure (ProseMirror-style)
 *   - Markdown with HTML fallback
 *   - Delta format (Quill-style)
 *   - Custom AST for maximum control
 * 
 * SECURITY CONSIDERATIONS:
 * ========================
 * - Always sanitize HTML before setting content
 * - Never trust user input (XSS risk)
 * - Strip <script>, <iframe>, <object>, <embed> tags
 * - Strip event handlers (onclick, onerror, etc.)
 * - Whitelist allowed tags and attributes
 * - Use CSP headers in production
 * - Validate URLs in links (prevent javascript: protocol)
 * - Consider using Shadow DOM for isolation
 * 
 * BROWSER COMPATIBILITY:
 * ======================
 * - Modern browsers (Chrome, Firefox, Safari, Edge)
 * - contenteditable support (IE9+)
 * - execCommand support (deprecated but functional)
 * - Selection API support
 * - ClipboardEvent API for paste handling
 * - Fallback to plain textarea for old browsers
 * 
 * TESTING STRATEGY:
 * =================
 * - Unit tests for HTML sanitization
 * - Unit tests for format commands
 * - E2E tests for toolbar interactions
 * - E2E tests for keyboard shortcuts
 * - Visual regression tests for rendering
 * - Accessibility tests (axe-core, screen reader testing)
 * - Performance tests (large document editing)
 * - Cross-browser tests (BrowserStack or similar)
 * 
 * MIGRATION PATH (execCommand → Modern API):
 * ==========================================
 * Phase 1: Use execCommand (current implementation)
 * Phase 2: Wrap execCommand in abstraction layer
 * Phase 3: Implement custom command system that:
 *   - Maintains selection state manually
 *   - Applies formatting via DOM manipulation
 *   - Records changes for undo/redo
 *   - Works identically to execCommand API
 * Phase 4: Migrate to library like ProseMirror or build custom
 * 
 * This allows gradual migration without rewriting from scratch.
 */

const Control = require('../../../../html-core/control');

class Rich_Text_Editor extends Control {
    constructor(options = {}) {
        options.__type_name = options.__type_name || 'rich_text_editor';
        super(options);
        
        const { context } = this;
        
        this.add_class('rich-text-editor');
        
        // Configuration
        this.config = {
            placeholder: options.placeholder || 'Start typing...',
            initial_html: options.initial_html || '',
            min_height: options.min_height || '200px',
            max_height: options.max_height || '500px',
            toolbar_position: options.toolbar_position || 'top', // top, bottom, floating
            on_change: options.on_change || null,
            read_only: options.read_only || false
        };
        
        // Create toolbar
        this._create_toolbar(context);
        
        // Create editable area
        this._create_editor(context);
        
        // Track state (only on client)
        this.is_dirty = false;
        this.last_html = '';
    }
    
    /**
     * Create the formatting toolbar
     */
    _create_toolbar(context) {
        this.toolbar = new Control({ context, tag_name: 'div' });
        this.toolbar.add_class('rte-toolbar');
        
        // Button definitions: [command, icon, title, custom_handler]
        const buttons = [
            ['bold', '<strong>B</strong>', 'Bold (Ctrl+B)'],
            ['italic', '<em>I</em>', 'Italic (Ctrl+I)'],
            ['underline', '<u>U</u>', 'Underline (Ctrl+U)'],
            ['separator'],
            ['insertUnorderedList', '• List', 'Bullet List'],
            ['insertOrderedList', '1. List', 'Numbered List'],
            ['separator'],
            ['createLink', '🔗', 'Insert Link', this._handle_create_link.bind(this)],
            ['unlink', '🔗✗', 'Remove Link'],
            ['separator'],
            ['removeFormat', '✗', 'Clear Formatting']
        ];
        
        buttons.forEach(btn_def => {
            if (btn_def[0] === 'separator') {
                const sep = new Control({ context, tag_name: 'span' });
                sep.add_class('rte-toolbar-separator');
                this.toolbar.add(sep);
            } else {
                const [command, icon, title, custom_handler] = btn_def;
                const button = new Control({ context, tag_name: 'button' });
                button.add_class('rte-toolbar-button');
                button.dom.attributes.type = 'button';
                button.dom.attributes.title = title;
                button.dom.attributes['data-command'] = command;
                button.dom.innerHTML = icon;
                
                // Store custom handler if provided
                if (custom_handler) {
                    button.custom_handler = custom_handler;
                }
                
                this.toolbar.add(button);
            }
        });
        
        this.add(this.toolbar);
    }
    
    /**
     * Create the contenteditable editor area
     */
    _create_editor(context) {
        this.editor_container = new Control({ context, tag_name: 'div' });
        this.editor_container.add_class('rte-editor-container');
        
        this.editor = new Control({ context, tag_name: 'div' });
        this.editor.add_class('rte-editor');
        this.editor.dom.attributes.contenteditable = 'true';
        this.editor.dom.attributes['data-placeholder'] = this.config.placeholder;
        
        // Set initial content if provided
        if (this.config.initial_html) {
            // Note: In real implementation, sanitize before setting
            this.editor.dom.innerHTML = this.config.initial_html;
        }
        
        // Apply height constraints
        if (this.editor.dom.el) {
            this.editor.dom.el.style.minHeight = this.config.min_height;
            this.editor.dom.el.style.maxHeight = this.config.max_height;
        }
        
        if (this.config.read_only && this.editor.dom.el) {
            this.editor.dom.el.contentEditable = 'false';
        }
        
        this.editor_container.add(this.editor);
        this.add(this.editor_container);
    }
    
    /**
     * Activate - attach event listeners (client-only)
     */
    activate() {
        if (!this.__active) {
            super.activate();
            
            // Toolbar button clicks
            const toolbar_buttons = this.toolbar.dom.el.querySelectorAll('.rte-toolbar-button');
            toolbar_buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const command = btn.getAttribute('data-command');
                    
                    // Check for custom handler
                    const button_control = Array.from(this.toolbar.content._items).find(
                        item => item.dom && item.dom.el === btn
                    );
                    
                    if (button_control && button_control.custom_handler) {
                        button_control.custom_handler(command);
                    } else {
                        this._execute_command(command);
                    }
                    
                    // Return focus to editor
                    this.editor.dom.el.focus();
                });
            });
            
            // Editor input events
            this.editor.dom.el.addEventListener('input', () => {
                this.is_dirty = true;
                this._handle_change();
            });
            
            // Paste event - clean pasted content
            this.editor.dom.el.addEventListener('paste', (e) => {
                e.preventDefault();
                
                // Get plain text from clipboard
                const text = e.clipboardData.getData('text/plain');
                
                // Insert as plain text (no formatting)
                document.execCommand('insertText', false, text);
                
                // TODO Phase 2: Implement smart paste
                // - Detect if pasting from Word (preserve some formatting)
                // - Detect if pasting HTML (sanitize and preserve structure)
                // - Detect if pasting code (wrap in <code> block)
            });
            
            // Keyboard shortcuts
            this.editor.dom.el.addEventListener('keydown', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    switch(e.key.toLowerCase()) {
                        case 'b':
                            e.preventDefault();
                            this._execute_command('bold');
                            break;
                        case 'i':
                            e.preventDefault();
                            this._execute_command('italic');
                            break;
                        case 'u':
                            e.preventDefault();
                            this._execute_command('underline');
                            break;
                        // TODO Phase 6: Add more shortcuts
                        // Ctrl+K: insert link
                        // Ctrl+Shift+7: ordered list
                        // Ctrl+Shift+8: unordered list
                        // Ctrl+/: show keyboard shortcuts help
                    }
                }
            });
            
            // Update toolbar button states on selection change
            document.addEventListener('selectionchange', () => {
                if (this.editor.dom.el.contains(document.activeElement)) {
                    this._update_toolbar_states();
                }
            });
            
            // Initialize toolbar states
            this._update_toolbar_states();
        }
    }
    
    /**
     * Execute a formatting command
     */
    _execute_command(command, value = null) {
        // execCommand is deprecated but still widely supported
        // TODO Phase 3: Replace with custom implementation for better control
        document.execCommand(command, false, value);
        this._handle_change();
    }
    
    /**
     * Handle link creation (custom handler)
     */
    _handle_create_link(command) {
        // Check if there's a selection
        const selection = window.getSelection();
        if (selection.rangeCount === 0 || selection.isCollapsed) {
            alert('Please select text to create a link');
            return;
        }
        
        // Prompt for URL
        // TODO Phase 3: Replace with custom modal dialog
        const url = prompt('Enter URL:', 'https://');
        
        if (url && url.trim() !== '' && url !== 'https://') {
            // Validate URL (basic check)
            // TODO Phase 3: More robust URL validation
            if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
                alert('URL must start with http://, https://, or mailto:');
                return;
            }
            
            this._execute_command('createLink', url);
        }
    }
    
    /**
     * Update toolbar button active states based on current selection
     */
    _update_toolbar_states() {
        const toolbar_buttons = this.toolbar.dom.el.querySelectorAll('.rte-toolbar-button');
        
        toolbar_buttons.forEach(btn => {
            const command = btn.getAttribute('data-command');
            
            // Check if command is currently active at cursor
            // Note: queryCommandState is also deprecated
            // TODO Phase 3: Replace with custom state detection
            try {
                const is_active = document.queryCommandState(command);
                if (is_active) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            } catch (e) {
                // Some commands don't support queryCommandState
                btn.classList.remove('active');
            }
        });
    }
    
    /**
     * Handle content change
     */
    _handle_change() {
        const current_html = this.get_html();
        
        if (current_html !== this.last_html) {
            this.last_html = current_html;
            
            if (this.config.on_change) {
                this.config.on_change(current_html);
            }
        }
    }
    
    /**
     * Get HTML content from editor
     */
    get_html() {
        if (!this.editor.dom.el) {
            return this.config.initial_html || '';
        }
        
        const html = this.editor.dom.el.innerHTML;
        
        // Basic sanitization
        // TODO Phase 2: Use DOMPurify or similar for robust sanitization
        return this._sanitize_html(html);
    }
    
    /**
     * Set HTML content in editor
     */
    set_html(html) {
        const sanitized = this._sanitize_html(html);
        
        if (this.editor.dom.el) {
            this.editor.dom.el.innerHTML = sanitized;
        }
        
        this.last_html = sanitized;
        this.is_dirty = false;
    }
    
    /**
     * Get plain text content (strips all HTML)
     */
    get_text() {
        if (!this.editor.dom.el) {
            return '';
        }
        return this.editor.dom.el.textContent || '';
    }
    
    /**
     * Basic HTML sanitization
     * Removes dangerous tags and attributes
     * 
     * TODO Phase 2: Replace with DOMPurify for production
     * This is a minimal implementation for MVP
     */
    _sanitize_html(html) {
        if (!html) return '';
        
        // Remove script tags and content
        html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        // Remove event handlers
        html = html.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
        html = html.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
        
        // Remove javascript: protocols
        html = html.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
        
        // Remove dangerous tags (basic approach)
        const dangerous_tags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
        dangerous_tags.forEach(tag => {
            const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
            html = html.replace(regex, '');
        });
        
        // TODO Phase 2: Whitelist approach
        // Only allow specific tags: p, br, strong, em, u, ul, ol, li, a, h1-h6
        // Only allow specific attributes: href, title, alt, src (for images)
        
        return html;
    }
    
    /**
     * Clear all content
     */
    clear() {
        this.set_html('');
    }
    
    /**
     * Check if editor has content
     */
    is_empty() {
        const text = this.get_text().trim();
        return text.length === 0;
    }
    
    /**
     * Set read-only mode
     */
    set_read_only(read_only) {
        this.config.read_only = read_only;
        if (this.editor.dom.el) {
            this.editor.dom.el.contentEditable = read_only ? 'false' : 'true';
        }
        
        if (read_only) {
            this.toolbar.add_class('disabled');
        } else {
            this.toolbar.remove_class('disabled');
        }
    }
    
    /**
     * Focus the editor
     */
    focus() {
        if (this.editor.dom.el) {
            this.editor.dom.el.focus();
        }
    }
    
    /**
     * Get character count
     * TODO Phase 4: Add to UI, show live count below editor
     */
    get_character_count() {
        return this.get_text().length;
    }
    
    /**
     * Get word count
     * TODO Phase 4: Add to UI, show alongside character count
     */
    get_word_count() {
        const text = this.get_text().trim();
        if (text.length === 0) return 0;
        return text.split(/\s+/).length;
    }
}

module.exports = Rich_Text_Editor;
