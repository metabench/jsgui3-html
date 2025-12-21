/**
 * Rich_Text_Editor - WYSIWYG editor with toolbar, optional markdown mode,
 * and sanitized paste handling.
 */
const Control = require('../../../../html-core/control');
const Rich_Text_Toolbar = require('./rich_text_toolbar');
const Textarea = require('../../0-core/0-basic/0-native-compositional/textarea');
const is_defined = value => value !== undefined && value !== null;
const escape_html = value => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
const decode_html = value => String(value || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
const normalize_markdown_url = value => {
    const cleaned = String(value || '').trim();
    if (!cleaned || /^\s*javascript:/i.test(cleaned)) return '';
    return cleaned.replace(/"/g, '%22');
};
const apply_inline_markdown = value => {
    let text = value;
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/`(.+?)`/g, '<code>$1</code>');
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
        const safe_url = normalize_markdown_url(url);
        if (!safe_url) return label;
        return `<a href="${safe_url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    });
    return text;
};
class Rich_Text_Editor extends Control {
    constructor(options = {}) {
        options.__type_name = options.__type_name || 'rich_text_editor';
        super(options);
        const { context } = this;
        this.add_class('rich-text-editor');
        this.config = {
            placeholder: options.placeholder || 'Start typing...',
            initial_html: options.initial_html || '',
            initial_markdown: options.initial_markdown || '',
            min_height: options.min_height || '200px',
            max_height: options.max_height || '500px',
            toolbar_position: options.toolbar_position || 'top',
            on_change: options.on_change || null,
            read_only: options.read_only || false,
            toolbar_buttons: options.toolbar_buttons || null,
            allow_markdown: !!options.allow_markdown,
            markdown_mode: !!options.markdown_mode,
            markdown_placeholder: options.markdown_placeholder || 'Write markdown...'
        };
        if (this.config.allow_markdown && this.config.initial_markdown && !this.config.initial_html) {
            this.config.initial_html = this._markdown_to_html(this.config.initial_markdown);
        }
        this.allow_markdown = this.config.allow_markdown;
        this.markdown_mode = this.allow_markdown && this.config.markdown_mode;
        this.markdown_text = this.config.initial_markdown || '';
        this._create_toolbar(context);
        this._create_editor(context);
        this.is_dirty = false;
        this.last_html = this.config.initial_html || '';
        if (this.config.read_only) {
            this.set_read_only(true);
        }
    }
    _create_toolbar(context) {
        const base_buttons = Array.isArray(this.config.toolbar_buttons)
            ? this.config.toolbar_buttons.slice()
            : Rich_Text_Toolbar.DEFAULT_BUTTONS.slice();
        if (this.allow_markdown) {
            base_buttons.push({ type: 'separator' });
            base_buttons.push({
                command: 'toggle_markdown',
                label: 'MD',
                title: 'Toggle Markdown'
            });
        }
        this.toolbar = new Rich_Text_Toolbar({
            context,
            buttons: base_buttons
        });
        this.add(this.toolbar);
    }
    _create_editor(context) {
        this.editor_container = new Control({ context, tag_name: 'div' });
        this.editor_container.add_class('rte-editor-container');
        this.editor = new Control({ context, tag_name: 'div' });
        this.editor.add_class('rte-editor');
        this.editor.dom.attributes.contenteditable = this.config.read_only ? 'false' : 'true';
        this.editor.dom.attributes['data-placeholder'] = this.config.placeholder;
        if (this.config.initial_html) {
            this.editor.dom.innerHTML = this.config.initial_html;
        }
        this.markdown_editor = new Textarea({
            context,
            value: this.markdown_text,
            placeholder: this.config.markdown_placeholder,
            autosize: false
        });
        this.markdown_editor.add_class('rte-markdown');
        this._apply_height_constraints(this.editor);
        this._apply_height_constraints(this.markdown_editor);
        this.editor_container.add(this.editor);
        this.editor_container.add(this.markdown_editor);
        this.add(this.editor_container);
        this._apply_mode_visibility();
    }
    _apply_height_constraints(control) {
        if (!control || !control.dom || !control.dom.attributes) return;
        const styles = [];
        if (this.config.min_height) {
            styles.push(`min-height:${this.config.min_height}`);
        }
        if (this.config.max_height) {
            styles.push(`max-height:${this.config.max_height}`);
        }
        if (styles.length) {
            const style_value = styles.join(';');
            control.dom.attributes.style = control.dom.attributes.style
                ? `${control.dom.attributes.style};${style_value}`
                : style_value;
        }
        if (control.dom.el) {
            control.dom.el.style.minHeight = this.config.min_height;
            control.dom.el.style.maxHeight = this.config.max_height;
        }
    }
    _apply_mode_visibility() {
        if (!this.editor || !this.markdown_editor) return;
        if (this.markdown_mode) {
            this.editor.add_class('is-hidden');
            this.markdown_editor.remove_class('is-hidden');
            this.add_class('markdown-mode');
        } else {
            this.editor.remove_class('is-hidden');
            this.markdown_editor.add_class('is-hidden');
            this.remove_class('markdown-mode');
        }
    }
    activate() {
        if (!this.__active) {
            super.activate();
            if (this.toolbar && this.toolbar.dom.el) {
                const toolbar_buttons = this.toolbar.dom.el.querySelectorAll('.rte-toolbar-button');
                toolbar_buttons.forEach(btn => {
                    btn.addEventListener('click', event => {
                        event.preventDefault();
                        const command = btn.getAttribute('data-command');
                        const value = btn.getAttribute('data-value');
                        const button_control = this._get_toolbar_button_control(btn);
                        this._handle_toolbar_action(command, value, button_control);
                        if (this.editor.dom.el && !this.markdown_mode) {
                            this.editor.dom.el.focus();
                        }
                    });
                });
            }
            if (this.editor.dom.el) {
                this.editor.dom.el.addEventListener('input', () => {
                    if (this.markdown_mode) return;
                    this.is_dirty = true;
                    this._handle_change();
                });
                this.editor.dom.el.addEventListener('paste', event => {
                    if (this.markdown_mode) return;
                    event.preventDefault();
                    const clipboard = event.clipboardData || window.clipboardData;
                    const html = clipboard && clipboard.getData('text/html');
                    const text = clipboard && clipboard.getData('text/plain');
                    if (html) {
                        const sanitized = this._sanitize_html(html);
                        if (typeof document.execCommand === 'function') {
                            document.execCommand('insertHTML', false, sanitized);
                        }
                    } else if (text) {
                        if (typeof document.execCommand === 'function') {
                            document.execCommand('insertText', false, text);
                        }
                    }
                });
                this.editor.dom.el.addEventListener('keydown', event => {
                    if (this.markdown_mode) return;
                    if (event.ctrlKey || event.metaKey) {
                        switch (event.key.toLowerCase()) {
                            case 'b':
                                event.preventDefault();
                                this._execute_command('bold');
                                break;
                            case 'i':
                                event.preventDefault();
                                this._execute_command('italic');
                                break;
                            case 'u':
                                event.preventDefault();
                                this._execute_command('underline');
                                break;
                        }
                    }
                });
            }
            if (this.markdown_editor && this.markdown_editor.dom.el) {
                const handle_markdown_input = () => {
                    this.markdown_text = this.markdown_editor.dom.el.value;
                    this.is_dirty = true;
                    this._handle_change();
                };
                this.markdown_editor.dom.el.addEventListener('input', handle_markdown_input);
                this.markdown_editor.dom.el.addEventListener('change', handle_markdown_input);
            }
            if (typeof document !== 'undefined') {
                document.addEventListener('selectionchange', () => {
                    if (this.markdown_mode) return;
                    if (this.editor.dom.el && this.editor.dom.el.contains(document.activeElement)) {
                        this._update_toolbar_states();
                    }
                });
            }
            this._update_toolbar_states();
        }
    }
    _get_toolbar_button_control(button_el) {
        if (!this.toolbar || !Array.isArray(this.toolbar.button_controls)) return null;
        return this.toolbar.button_controls.find(
            button_control => button_control.dom && button_control.dom.el === button_el
        );
    }
    _handle_toolbar_action(command, value, button_control) {
        if (!command) return;
        if (button_control && button_control.custom_handler) {
            button_control.custom_handler(command, value);
            return;
        }
        if (command === 'toggle_markdown') {
            this.toggle_markdown_mode();
            return;
        }
        if (this.markdown_mode) return;
        if (command === 'createLink') {
            this._handle_create_link();
            return;
        }
        this._execute_command(command, value);
    }
    _execute_command(command, value = null) {
        if (typeof document === 'undefined' || typeof document.execCommand !== 'function') {
            return;
        }
        document.execCommand(command, false, value);
        this._handle_change();
    }
    _handle_create_link() {
        if (typeof window === 'undefined') return;
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            return;
        }
        const url = prompt('Enter URL:', 'https://');
        if (url && url.trim() !== '' && url !== 'https://') {
            if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
                return;
            }
            this._execute_command('createLink', url);
        }
    }
    _update_toolbar_states() {
        if (!this.toolbar || !this.toolbar.dom.el) return;
        const toolbar_buttons = this.toolbar.dom.el.querySelectorAll('.rte-toolbar-button');
        toolbar_buttons.forEach(btn => {
            const command = btn.getAttribute('data-command');
            const value = btn.getAttribute('data-value');
            if (command === 'toggle_markdown') {
                btn.classList.toggle('active', this.markdown_mode);
                return;
            }
            if (this.markdown_mode) {
                btn.classList.remove('active');
                return;
            }
            if (command === 'formatBlock' && value && typeof document.queryCommandValue === 'function') {
                try {
                    const current = document.queryCommandValue('formatBlock') || '';
                    const normalized = current.toLowerCase();
                    const target = value.toLowerCase();
                    btn.classList.toggle('active', normalized.includes(target.replace(/[<>]/g, '')));
                } catch (e) {
                    btn.classList.remove('active');
                }
                return;
            }
            if (typeof document.queryCommandState !== 'function') {
                btn.classList.remove('active');
                return;
            }
            try {
                const is_active = document.queryCommandState(command);
                btn.classList.toggle('active', !!is_active);
            } catch (e) {
                btn.classList.remove('active');
            }
        });
    }
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
     * Get HTML content from editor.
     * @returns {string}
     */
    get_html() {
        if (this.markdown_mode) {
            return this._markdown_to_html(this.get_markdown());
        }
        if (this.editor.dom.el) {
            return this._sanitize_html(this.editor.dom.el.innerHTML || '');
        }
        if (this.editor.dom.innerHTML) {
            return this._sanitize_html(this.editor.dom.innerHTML);
        }
        return this._sanitize_html(this.config.initial_html || '');
    }
    /**
     * Set HTML content in editor.
     * @param {string} html - HTML to set.
     * @param {Object} [options] - Options for syncing.
     */
    set_html(html, options = {}) {
        const sanitized = this._sanitize_html(html || '');
        if (this.editor.dom) {
            this.editor.dom.innerHTML = sanitized;
        }
        if (this.editor.dom.el) {
            this.editor.dom.el.innerHTML = sanitized;
        }
        if (this.allow_markdown && options.sync_markdown) {
            this.markdown_text = this._html_to_markdown(sanitized);
            if (this.markdown_editor && this.markdown_editor.dom.el) {
                this.markdown_editor.dom.el.value = this.markdown_text;
            }
        }
        this.last_html = sanitized;
        this.is_dirty = false;
    }
    /**
     * Get markdown content.
     * @returns {string}
     */
    get_markdown() {
        if (this.markdown_editor && this.markdown_editor.dom.el) {
            this.markdown_text = this.markdown_editor.dom.el.value;
        }
        return this.markdown_text || '';
    }
    /**
     * Set markdown content.
     * @param {string} markdown - Markdown to set.
     * @param {Object} [options] - Options for syncing.
     */
    set_markdown(markdown, options = {}) {
        this.markdown_text = is_defined(markdown) ? String(markdown) : '';
        if (this.markdown_editor && this.markdown_editor.dom.el) {
            this.markdown_editor.dom.el.value = this.markdown_text;
        } else if (this.markdown_editor && typeof this.markdown_editor.set_value === 'function') {
            this.markdown_editor.set_value(this.markdown_text);
        }
        if (options.sync_html !== false) {
            this.set_html(this._markdown_to_html(this.markdown_text), { sync_markdown: false });
        }
    }
    /**
     * Toggle markdown mode.
     * @param {boolean} [force] - Force mode on/off.
     */
    toggle_markdown_mode(force) {
        if (!this.allow_markdown) return;
        const next_mode = typeof force === 'boolean' ? force : !this.markdown_mode;
        if (next_mode === this.markdown_mode) return;
        if (next_mode) {
            const html = this.get_html();
            this.set_markdown(this._html_to_markdown(html), { sync_html: false });
        } else {
            const markdown = this.get_markdown();
            this.set_html(this._markdown_to_html(markdown), { sync_markdown: false });
        }
        this.markdown_mode = next_mode;
        this._apply_mode_visibility();
        this._update_toolbar_states();
    }
    /**
     * Get plain text content.
     * @returns {string}
     */
    get_text() {
        if (this.markdown_mode) {
            return this.get_markdown();
        }
        if (!this.editor.dom.el) return '';
        return this.editor.dom.el.textContent || '';
    }
    _sanitize_html(html) {
        if (!html) return '';
        let sanitized = String(html);
        sanitized = sanitized.replace(
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            ''
        );
        sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
        sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
        sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
        const dangerous_tags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
        dangerous_tags.forEach(tag => {
            const regex = new RegExp(
                `<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`,
                'gi'
            );
            sanitized = sanitized.replace(regex, '');
        });
        return sanitized;
    }
    _markdown_to_html(markdown) {
        if (!markdown) return '';
        const lines = String(markdown).split(/\r?\n/);
        const html_lines = [];
        let in_list = false;
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) {
                if (in_list) {
                    html_lines.push('</ul>');
                    in_list = false;
                }
                html_lines.push('');
                return;
            }
            if (/^#{1,6}\s+/.test(trimmed)) {
                if (in_list) {
                    html_lines.push('</ul>');
                    in_list = false;
                }
                const level = trimmed.match(/^#{1,6}/)[0].length;
                const text = trimmed.replace(/^#{1,6}\s+/, '');
                html_lines.push(
                    `<h${level}>${apply_inline_markdown(escape_html(text))}</h${level}>`
                );
                return;
            }
            if (/^>\s+/.test(trimmed)) {
                if (in_list) {
                    html_lines.push('</ul>');
                    in_list = false;
                }
                const text = trimmed.replace(/^>\s+/, '');
                html_lines.push(
                    `<blockquote>${apply_inline_markdown(escape_html(text))}</blockquote>`
                );
                return;
            }
            if (/^[-*]\s+/.test(trimmed)) {
                const text = trimmed.replace(/^[-*]\s+/, '');
                if (!in_list) {
                    html_lines.push('<ul>');
                    in_list = true;
                }
                html_lines.push(`<li>${apply_inline_markdown(escape_html(text))}</li>`);
                return;
            }
            if (in_list) {
                html_lines.push('</ul>');
                in_list = false;
            }
            html_lines.push(`<p>${apply_inline_markdown(escape_html(trimmed))}</p>`);
        });
        if (in_list) {
            html_lines.push('</ul>');
        }
        return this._sanitize_html(html_lines.join('\n'));
    }
    _html_to_markdown(html) {
        if (!html) return '';
        let markdown = String(html);
        markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
        markdown = markdown.replace(/<\/p>\s*<p>/gi, '\n\n');
        markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
        markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
        markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
        markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n');
        markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n');
        markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n');
        markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n');
        markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
        markdown = markdown.replace(/<\/?ul[^>]*>/gi, '');
        markdown = markdown.replace(/<\/?ol[^>]*>/gi, '');
        markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
        markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
        markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
        markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
        markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
        markdown = markdown.replace(
            /<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi,
            '[$2]($1)'
        );
        markdown = markdown.replace(/<[^>]+>/g, '');
        markdown = decode_html(markdown);
        markdown = markdown.replace(/\n{3,}/g, '\n\n');
        return markdown.trim();
    }
    /**
     * Clear all content.
     */
    clear() {
        this.set_html('', { sync_markdown: false });
        if (this.allow_markdown) {
            this.set_markdown('', { sync_html: false });
        }
    }
    /**
     * Check if editor has content.
     * @returns {boolean}
     */
    is_empty() {
        const text = this.get_text().trim();
        return text.length === 0;
    }
    /**
     * Set read-only mode.
     * @param {boolean} read_only - Whether to set read-only mode.
     */
    set_read_only(read_only) {
        this.config.read_only = !!read_only;
        if (this.editor.dom.el) {
            this.editor.dom.el.contentEditable = read_only ? 'false' : 'true';
        }
        if (this.markdown_editor && this.markdown_editor.dom.el) {
            this.markdown_editor.dom.el.readOnly = !!read_only;
        }
        if (read_only) {
            this.add_class('read-only');
            this.toolbar.add_class('disabled');
        } else {
            this.remove_class('read-only');
            this.toolbar.remove_class('disabled');
        }
    }
    /**
     * Focus the active editor.
     */
    focus() {
        if (this.markdown_mode && this.markdown_editor && this.markdown_editor.dom.el) {
            this.markdown_editor.dom.el.focus();
        } else if (this.editor.dom.el) {
            this.editor.dom.el.focus();
        }
    }
    /**
     * Get character count.
     * @returns {number}
     */
    get_character_count() {
        return this.get_text().length;
    }
    /**
     * Get word count.
     * @returns {number}
     */
    get_word_count() {
        const text = this.get_text().trim();
        if (!text) return 0;
        return text.split(/\s+/).length;
    }
}
module.exports = Rich_Text_Editor;
