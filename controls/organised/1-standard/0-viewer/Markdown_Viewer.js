/**
 * Markdown_Viewer — Renders Markdown text as a jsgui Control tree.
 *
 * Parses markdown into native jsgui Controls rather than injecting
 * raw HTML, respecting the platform's content escaping rules.
 *
 * Supports: headings, bold, italic, inline code, code blocks,
 * links, images, blockquotes, unordered/ordered lists, horizontal
 * rules, and paragraphs.
 *
 * Options:
 *   markdown   — Markdown source string
 *   theme      — 'default' | 'github' | 'minimal'
 *
 * Methods: set_markdown(md), get_html()
 */
const Control = require('../../../../html-core/control');

// ── Markdown → jsgui Control tree ───────────────────

/**
 * Parse a markdown string and return an array of jsgui Controls.
 */
function md_to_controls(md, ctx) {
    if (!md) return [];
    const controls = [];
    const lines = md.split('\n');
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Fenced code block
        const fence_match = line.match(/^```(\w*)/);
        if (fence_match) {
            const lang = fence_match[1] || 'text';
            const code_lines = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                code_lines.push(lines[i]);
                i++;
            }
            i++; // skip closing ```
            const pre = new Control({ context: ctx, tag_name: 'pre' });
            pre.add_class('md-code-block');
            const code_el = new Control({ context: ctx, tag_name: 'code' });
            code_el.add_class('lang-' + lang);
            code_el.add(code_lines.join('\n'));
            pre.add(code_el);
            controls.push(pre);
            continue;
        }

        // Blank line
        if (line.trim() === '') {
            i++;
            continue;
        }

        // Horizontal rule
        if (/^---+$/.test(line.trim())) {
            const hr = new Control({ context: ctx, tag_name: 'hr' });
            hr.dom.noClosingTag = true;
            controls.push(hr);
            i++;
            continue;
        }

        // Heading
        const heading_match = line.match(/^(#{1,6})\s+(.+)$/);
        if (heading_match) {
            const level = heading_match[1].length;
            const heading = new Control({ context: ctx, tag_name: 'h' + level });
            add_inline_content(heading, heading_match[2], ctx);
            controls.push(heading);
            i++;
            continue;
        }

        // Blockquote
        const bq_match = line.match(/^>\s+(.+)$/);
        if (bq_match) {
            const bq = new Control({ context: ctx, tag_name: 'blockquote' });
            add_inline_content(bq, bq_match[1], ctx);
            controls.push(bq);
            i++;
            continue;
        }

        // Unordered list
        if (/^\s*[-*+]\s+/.test(line)) {
            const ul = new Control({ context: ctx, tag_name: 'ul' });
            while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
                const li_text = lines[i].replace(/^\s*[-*+]\s+/, '');
                const li = new Control({ context: ctx, tag_name: 'li' });
                add_inline_content(li, li_text, ctx);
                ul.add(li);
                i++;
            }
            controls.push(ul);
            continue;
        }

        // Ordered list
        if (/^\s*\d+\.\s+/.test(line)) {
            const ol = new Control({ context: ctx, tag_name: 'ol' });
            while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
                const li_text = lines[i].replace(/^\s*\d+\.\s+/, '');
                const li = new Control({ context: ctx, tag_name: 'li' });
                add_inline_content(li, li_text, ctx);
                ol.add(li);
                i++;
            }
            controls.push(ol);
            continue;
        }

        // Paragraph (default) — collect contiguous non-special lines
        const para_lines = [];
        while (i < lines.length &&
            lines[i].trim() !== '' &&
            !/^```/.test(lines[i]) &&
            !/^#{1,6}\s/.test(lines[i]) &&
            !/^>\s/.test(lines[i]) &&
            !/^\s*[-*+]\s/.test(lines[i]) &&
            !/^\s*\d+\.\s/.test(lines[i]) &&
            !/^---+$/.test(lines[i].trim())) {
            para_lines.push(lines[i]);
            i++;
        }
        if (para_lines.length > 0) {
            const p = new Control({ context: ctx, tag_name: 'p' });
            add_inline_content(p, para_lines.join(' '), ctx);
            controls.push(p);
        }
    }

    return controls;
}

/**
 * Parse inline markdown (bold, italic, code, links) and add as
 * child controls/text to the parent control.
 */
function add_inline_content(parent, text, ctx) {
    // Tokenise: split on inline patterns, preserving tokens
    const tokens = tokenise_inline(text);
    for (const token of tokens) {
        if (token.type === 'text') {
            parent.add(token.value);
        } else if (token.type === 'code') {
            const code = new Control({ context: ctx, tag_name: 'code' });
            code.add_class('md-inline-code');
            code.add(token.value);
            parent.add(code);
        } else if (token.type === 'bold') {
            const strong = new Control({ context: ctx, tag_name: 'strong' });
            add_inline_content(strong, token.value, ctx);
            parent.add(strong);
        } else if (token.type === 'italic') {
            const em = new Control({ context: ctx, tag_name: 'em' });
            add_inline_content(em, token.value, ctx);
            parent.add(em);
        } else if (token.type === 'link') {
            const a = new Control({ context: ctx, tag_name: 'a' });
            a.dom.attributes.href = token.href;
            a.dom.attributes.target = '_blank';
            a.dom.attributes.rel = 'noopener';
            a.add(token.value);
            parent.add(a);
        } else if (token.type === 'image') {
            const img = new Control({ context: ctx, tag_name: 'img' });
            img.dom.attributes.src = token.src;
            img.dom.attributes.alt = token.value;
            img.add_class('md-image');
            img.dom.noClosingTag = true;
            parent.add(img);
        }
    }
}

/**
 * Tokenise inline markdown into an array of token objects.
 */
function tokenise_inline(text) {
    const tokens = [];
    // Pattern order: image, link, inline code, bold, italic
    const re = /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*(.+?)\*\*|\*(.+?)\*/g;
    let last = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
        if (m.index > last) {
            tokens.push({ type: 'text', value: text.slice(last, m.index) });
        }
        if (m[1] !== undefined || m[2] !== undefined) {
            // Image: ![alt](src)
            tokens.push({ type: 'image', value: m[1] || '', src: m[2] });
        } else if (m[3] !== undefined) {
            // Link: [text](href)
            tokens.push({ type: 'link', value: m[3], href: m[4] });
        } else if (m[5] !== undefined) {
            // Inline code
            tokens.push({ type: 'code', value: m[5] });
        } else if (m[6] !== undefined) {
            // Bold
            tokens.push({ type: 'bold', value: m[6] });
        } else if (m[7] !== undefined) {
            // Italic
            tokens.push({ type: 'italic', value: m[7] });
        }
        last = m.index + m[0].length;
    }
    if (last < text.length) {
        tokens.push({ type: 'text', value: text.slice(last) });
    }
    return tokens;
}

// Keep the old HTML parser for client-side use
function md_to_html(md) {
    if (!md) return '';
    let html = md;
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        const escaped = esc(code.trim());
        return `<pre class="md-code-block"><code class="lang-${lang || 'text'}">${escaped}</code></pre>`;
    });
    html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/^---+$/gm, '<hr>');
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-image">');
    html = html.replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');
    html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/\n\n+/g, '</p><p>');
    if (!html.startsWith('<')) html = '<p>' + html;
    if (!html.endsWith('>')) html = html + '</p>';
    html = html.replace(/\n/g, '<br>');
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<blockquote>)/g, '$1');
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
    return html;
}

function esc(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

class Markdown_Viewer extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'markdown_viewer';
        super(spec);
        this.add_class('markdown-viewer');
        this.add_class('jsgui-markdown-viewer');
        this.dom.tagName = 'article';

        if (spec.theme) {
            this.dom.attributes['data-theme'] = spec.theme;
        }

        this.markdown = spec.markdown || '';

        // Build content container
        this._content = new Control({ context: this.context, tag_name: 'div' });
        this._content.add_class('md-content');
        this._build_content();
        this.add(this._content);
    }

    _build_content() {
        const ctrls = md_to_controls(this.markdown, this.context);
        for (const ctrl of ctrls) {
            this._content.add(ctrl);
        }
    }

    set_markdown(md) {
        this.markdown = md;
        // Client-side: rebuild DOM using innerHTML for speed
        if (this.dom.el) {
            const el = this.dom.el.querySelector('.md-content');
            if (el) el.innerHTML = md_to_html(md);
        }
    }

    get_html() {
        return md_to_html(this.markdown);
    }
}

Markdown_Viewer.css = `
.markdown-viewer {
    line-height: 1.6;
    word-wrap: break-word;
}
.md-code-block {
    overflow-x: auto;
}
`;

// Export parsers for testing
Markdown_Viewer.md_to_html = md_to_html;
Markdown_Viewer.md_to_controls = md_to_controls;

module.exports = Markdown_Viewer;
