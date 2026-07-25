/**
 * Markdown_Viewer — Renders Markdown text as a jsgui Control tree.
 *
 * Parses markdown into native jsgui Controls rather than injecting
 * raw HTML, respecting the platform's content escaping rules.
 *
 * Supports: headings, bold, italic, inline code, code blocks,
 * links, images, blockquotes, unordered/ordered lists, tables,
 * horizontal rules, and paragraphs.
 *
 * Options:
 *   markdown   — Markdown source string
 *   theme      — 'default' | 'github' | 'minimal'
 *
 * Methods: set_markdown(md), get_html()
 */
const Control = require('../../../../html-core/control');

// ── Markdown → jsgui Control tree ───────────────────

function split_table_row(line) {
    const source = String(line || '').trim();
    if (!source.includes('|')) return null;

    const cells = [];
    let cell = '';
    let escaped = false;
    let in_code = false;
    for (const character of source) {
        if (escaped) {
            cell += character;
            escaped = false;
            continue;
        }
        if (character === '\\') {
            escaped = true;
            cell += character;
            continue;
        }
        if (character === '`') {
            in_code = !in_code;
            cell += character;
            continue;
        }
        if (character === '|' && !in_code) {
            cells.push(cell.trim());
            cell = '';
            continue;
        }
        cell += character;
    }
    cells.push(cell.trim());

    if (source.startsWith('|')) cells.shift();
    if (source.endsWith('|')) cells.pop();
    return cells.length > 0 ? cells : null;
}

function parse_table_delimiter(line, expected_count) {
    const cells = split_table_row(line);
    if (!cells || cells.length !== expected_count) return null;
    const alignments = [];
    for (const cell of cells) {
        const delimiter = cell.replace(/\s/g, '');
        if (!/^:?-{3,}:?$/.test(delimiter)) return null;
        const left = delimiter.startsWith(':');
        const right = delimiter.endsWith(':');
        alignments.push(left && right ? 'center' : (right ? 'right' : 'left'));
    }
    return alignments;
}

function compose_table_row(ctx, cell_values, cell_tag, alignments) {
    const row = new Control({ context: ctx, tag_name: 'tr' });
    for (let cell_index = 0; cell_index < cell_values.length; cell_index++) {
        const cell = new Control({ context: ctx, tag_name: cell_tag });
        const alignment = alignments[cell_index] || 'left';
        cell.add_class('md-align-' + alignment);
        if (cell_tag === 'th') cell.dom.attributes.scope = 'col';
        add_inline_content(cell, cell_values[cell_index], ctx);
        row.add(cell);
    }
    return row;
}

function compose_table(ctx, header_cells, alignments, body_rows) {
    const scroll = new Control({ context: ctx, tag_name: 'div' });
    scroll.add_class('md-table-scroll');
    const table = new Control({ context: ctx, tag_name: 'table' });
    table.add_class('md-table');

    const thead = new Control({ context: ctx, tag_name: 'thead' });
    thead.add(compose_table_row(ctx, header_cells, 'th', alignments));
    table.add(thead);

    if (body_rows.length > 0) {
        const tbody = new Control({ context: ctx, tag_name: 'tbody' });
        for (const body_row of body_rows) {
            tbody.add(compose_table_row(ctx, body_row, 'td', alignments));
        }
        table.add(tbody);
    }

    scroll.add(table);
    return scroll;
}

/**
 * Parse a markdown string and return an array of jsgui Controls.
 */
function md_to_controls(md, ctx) {
    if (!md) return [];
    const controls = [];
    // Normalise line endings once so block recognisers see the same input for
    // Markdown read from LF and CRLF repositories.
    const lines = md.replace(/\r\n?/g, '\n').split('\n');
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
        // Accept empty blockquote lines as well as lines with content. Empty
        // quote lines are common Markdown paragraph separators ("> "). The
        // paragraph scanner already treats them as special, so failing to
        // consume one here would leave `i` unchanged and lock the parser.
        const bq_match = line.match(/^>\s?(.*)$/);
        if (bq_match) {
            if (bq_match[1].trim() !== '') {
                const bq = new Control({ context: ctx, tag_name: 'blockquote' });
                add_inline_content(bq, bq_match[1], ctx);
                controls.push(bq);
            }
            i++;
            continue;
        }

        // GitHub-style table. A pipe-containing header is only treated as a
        // table when the next line is a valid delimiter row. That strict
        // two-line signature keeps ordinary prose containing `|` intact.
        if (i + 1 < lines.length) {
            const header_cells = split_table_row(line);
            const alignments = header_cells
                ? parse_table_delimiter(lines[i + 1], header_cells.length)
                : null;
            if (header_cells && alignments) {
                const body_rows = [];
                i += 2;
                while (i < lines.length && lines[i].trim() !== '') {
                    const row_cells = split_table_row(lines[i]);
                    if (!row_cells) break;
                    const normalised_cells = header_cells.map((unused, cell_index) => {
                        return row_cells[cell_index] || '';
                    });
                    body_rows.push(normalised_cells);
                    i++;
                }
                controls.push(compose_table(ctx, header_cells, alignments, body_rows));
                continue;
            }
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
        } else {
            // Defensive progress invariant: every loop iteration must consume
            // a line, even if a future special-line recogniser and its parser
            // branch become inconsistent.
            i++;
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
    let html = render_tables_to_html(md);
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
    html = html.replace(/<p>(<div class="md-table-scroll">)/g, '$1');
    html = html.replace(/(<\/div>)<\/p>/g, '$1');
    return html;
}

function render_tables_to_html(md) {
    const lines = String(md || '').replace(/\r\n?/g, '\n').split('\n');
    const rendered = [];
    let line_index = 0;
    let in_fence = false;

    while (line_index < lines.length) {
        const line = lines[line_index];
        if (/^```/.test(line)) {
            in_fence = !in_fence;
            rendered.push(line);
            line_index++;
            continue;
        }
        if (!in_fence && line_index + 1 < lines.length) {
            const header_cells = split_table_row(line);
            const alignments = header_cells
                ? parse_table_delimiter(lines[line_index + 1], header_cells.length)
                : null;
            if (header_cells && alignments) {
                const body_rows = [];
                line_index += 2;
                while (line_index < lines.length && lines[line_index].trim() !== '') {
                    const row_cells = split_table_row(lines[line_index]);
                    if (!row_cells) break;
                    body_rows.push(header_cells.map((unused, cell_index) => row_cells[cell_index] || ''));
                    line_index++;
                }
                const header_html = header_cells.map((cell, cell_index) => {
                    return `<th scope="col" class="md-align-${alignments[cell_index]}">${cell}</th>`;
                }).join('');
                const body_html = body_rows.map((row) => {
                    return '<tr>' + row.map((cell, cell_index) => {
                        return `<td class="md-align-${alignments[cell_index]}">${cell}</td>`;
                    }).join('') + '</tr>';
                }).join('');
                rendered.push('<div class="md-table-scroll"><table class="md-table"><thead><tr>'
                    + header_html + '</tr></thead>'
                    + (body_html ? `<tbody>${body_html}</tbody>` : '')
                    + '</table></div>');
                continue;
            }
        }
        rendered.push(line);
        line_index++;
    }
    return rendered.join('\n');
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
.md-table-scroll {
    max-width: 100%;
    margin: 1.25rem 0;
    overflow-x: auto;
}
.md-table {
    width: 100%;
    min-width: 34rem;
    border-collapse: collapse;
    font-size: 0.92em;
}
.md-table th,
.md-table td {
    padding: 0.7em 0.85em;
    border: 1px solid var(--md-table-border, #d0d7de);
    vertical-align: top;
}
.md-table th {
    background: var(--md-table-header-bg, #f6f8fa);
    font-weight: 650;
}
.md-table tbody tr:nth-child(even) {
    background: var(--md-table-stripe-bg, rgba(208, 215, 222, 0.18));
}
.md-align-left { text-align: left; }
.md-align-center { text-align: center; }
.md-align-right { text-align: right; }
`;

// Export parsers for testing
Markdown_Viewer.md_to_html = md_to_html;
Markdown_Viewer.md_to_controls = md_to_controls;

module.exports = Markdown_Viewer;
