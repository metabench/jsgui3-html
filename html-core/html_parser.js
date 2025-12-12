const void_elements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

const raw_text_elements = new Set(['script', 'style']);

const auto_close_on_start = {
    li: new Set(['li']),
    p: new Set(['p']),
    td: new Set(['td', 'th']),
    th: new Set(['td', 'th']),
    tr: new Set(['tr']),
    option: new Set(['option']),
    optgroup: new Set(['optgroup'])
};

const is_whitespace = ch => ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t' || ch === '\f';
const is_name_char = ch => {
    const code = ch.charCodeAt(0);
    // a-z A-Z 0-9 _ - : .
    return (
        (code >= 48 && code <= 57) ||
        (code >= 65 && code <= 90) ||
        (code >= 97 && code <= 122) ||
        ch === '_' || ch === '-' || ch === ':' || ch === '.'
    );
};

const skip_whitespace = (str, pos) => {
    const len = str.length;
    while (pos < len && is_whitespace(str[pos])) pos++;
    return pos;
};

const find_raw_text_close = (str_html, start_pos, tag_name, lowercase_tags) => {
    const len = str_html.length;
    const expected_name = lowercase_tags ? tag_name.toLowerCase() : tag_name;

    for (let i = start_pos; i < len; i++) {
        if (str_html[i] !== '<') continue;

        let j = i + 1;
        j = skip_whitespace(str_html, j);
        if (str_html[j] !== '/') continue;

        j++;
        j = skip_whitespace(str_html, j);
        const name_start = j;
        while (j < len && is_name_char(str_html[j])) j++;
        let found_name = str_html.slice(name_start, j);
        if (lowercase_tags) found_name = found_name.toLowerCase();

        if (found_name !== expected_name) continue;

        const gt_index = str_html.indexOf('>', j);
        if (gt_index === -1) return null;

        return { start: i, end: gt_index + 1 };
    }

    return null;
};

/**
 * Parse a forgiving HTML string into a DOM-like tree.
 *
 * The returned node objects are compatible with the old `htmlparser` output:
 * - Text nodes: `{ type: 'text', raw, data }`
 * - Tag nodes: `{ type: 'tag' | 'script' | 'style', name, attribs, children, raw, data }`
 * - Comment nodes: `{ type: 'comment', raw, data }`
 * - Directive nodes (doctype, etc): `{ type: 'directive', raw, data }`
 *
 * @param {string} str_html - HTML to parse.
 * @param {object} [options]
 * @param {boolean} [options.ignore_whitespace=false] - Drop whitespace-only text nodes.
 * @param {boolean} [options.lowercase_tags=true] - Lowercase tag names.
 * @param {boolean} [options.lowercase_attrs=true] - Lowercase attribute names.
 * @returns {Array<object>} Parsed DOM nodes.
 */
const parse_html = (str_html, options = {}) => {
    if (typeof str_html !== 'string') str_html = String(str_html || '');
    const ignore_whitespace = !!options.ignore_whitespace;
    const lowercase_tags = options.lowercase_tags !== false;
    const lowercase_attrs = options.lowercase_attrs !== false;

    const len = str_html.length;

    const root = [];
    const stack = [{ name: null, children: root }];

    let pos = 0;

    const push_text_node = raw_text => {
        if (raw_text.length === 0) return;
        if (ignore_whitespace && raw_text.trim().length === 0) return;
        stack[stack.length - 1].children.push({
            raw: raw_text,
            data: raw_text,
            type: 'text'
        });
    };

    const push_node = node => {
        stack[stack.length - 1].children.push(node);
    };

    while (pos < len) {
        const ch = str_html[pos];
        if (ch !== '<') {
            const next_lt = str_html.indexOf('<', pos);
            const text_end = next_lt === -1 ? len : next_lt;
            push_text_node(str_html.slice(pos, text_end));
            pos = text_end;
            continue;
        }

        // Comment
        if (str_html.startsWith('<!--', pos)) {
            const end_index = str_html.indexOf('-->', pos + 4);
            const comment_end = end_index === -1 ? len : end_index + 3;
            const raw_comment = str_html.slice(pos, comment_end);
            push_node({
                raw: raw_comment,
                data: raw_comment,
                type: 'comment'
            });
            pos = comment_end;
            continue;
        }

        // Closing tag
        if (str_html.startsWith('</', pos)) {
            let close_pos = pos + 2;
            close_pos = skip_whitespace(str_html, close_pos);
            const name_start = close_pos;
            while (close_pos < len && is_name_char(str_html[close_pos])) close_pos++;
            let close_name = str_html.slice(name_start, close_pos);
            if (lowercase_tags) close_name = close_name.toLowerCase();

            const gt_index = str_html.indexOf('>', close_pos);
            pos = gt_index === -1 ? len : gt_index + 1;

            if (close_name) {
                for (let i = stack.length - 1; i > 0; i--) {
                    if (stack[i].name === close_name) {
                        stack.length = i;
                        break;
                    }
                }
            }
            continue;
        }

        // Directive / doctype / processing instruction
        if (str_html.startsWith('<!', pos) && !str_html.startsWith('<!--', pos)) {
            const gt_index = str_html.indexOf('>', pos + 2);
            const dir_end = gt_index === -1 ? len : gt_index + 1;
            const raw_dir = str_html.slice(pos, dir_end);
            push_node({
                raw: raw_dir,
                data: raw_dir,
                type: 'directive'
            });
            pos = dir_end;
            continue;
        }

        if (str_html.startsWith('<?', pos)) {
            const end_index = str_html.indexOf('?>', pos + 2);
            const pi_end = end_index === -1 ? len : end_index + 2;
            const raw_pi = str_html.slice(pos, pi_end);
            push_node({
                raw: raw_pi,
                data: raw_pi,
                type: 'directive'
            });
            pos = pi_end;
            continue;
        }

        // Start tag
        const tag_start = pos;
        pos++;
        pos = skip_whitespace(str_html, pos);

        const name_start = pos;
        while (pos < len && is_name_char(str_html[pos])) pos++;
        let tag_name = str_html.slice(name_start, pos);

        if (!tag_name) {
            push_text_node('<');
            continue;
        }

        if (lowercase_tags) tag_name = tag_name.toLowerCase();

        const auto_close_set = auto_close_on_start[tag_name];
        if (auto_close_set) {
            const top = stack[stack.length - 1];
            if (top.name && auto_close_set.has(top.name)) stack.pop();
        }

        const attribs = {};
        let is_self_closing = false;
        let tag_end_index = null;

        while (pos < len) {
            pos = skip_whitespace(str_html, pos);
            if (pos >= len) break;

            const c = str_html[pos];
            if (c === '>') {
                tag_end_index = pos;
                pos++;
                break;
            }

            if (c === '/') {
                pos++;
                pos = skip_whitespace(str_html, pos);
                if (str_html[pos] === '>') {
                    is_self_closing = true;
                    tag_end_index = pos;
                    pos++;
                    break;
                }
                continue;
            }

            const attr_name_start = pos;
            while (
                pos < len &&
                !is_whitespace(str_html[pos]) &&
                str_html[pos] !== '=' &&
                str_html[pos] !== '>' &&
                str_html[pos] !== '/'
            ) {
                pos++;
            }

            let attr_name = str_html.slice(attr_name_start, pos);
            if (!attr_name) continue;
            if (lowercase_attrs) attr_name = attr_name.toLowerCase();

            pos = skip_whitespace(str_html, pos);
            let attr_value = attr_name;

            if (str_html[pos] === '=') {
                pos++;
                pos = skip_whitespace(str_html, pos);

                if (pos < len) {
                    const quote = str_html[pos];
                    if (quote === '"' || quote === "'") {
                        pos++;
                        const value_start = pos;
                        while (pos < len && str_html[pos] !== quote) pos++;
                        attr_value = str_html.slice(value_start, pos);
                        if (str_html[pos] === quote) pos++;
                    } else {
                        const value_start = pos;
                        while (
                            pos < len &&
                            !is_whitespace(str_html[pos]) &&
                            str_html[pos] !== '>' &&
                            str_html[pos] !== '/'
                        ) {
                            pos++;
                        }
                        attr_value = str_html.slice(value_start, pos);
                    }
                } else {
                    attr_value = '';
                }
            }

            attribs[attr_name] = attr_value;
        }

        if (tag_end_index === null) tag_end_index = len;

        let raw_inner = str_html.slice(tag_start + 1, tag_end_index);
        raw_inner = raw_inner.trim();
        if (raw_inner.endsWith('/')) raw_inner = raw_inner.slice(0, -1).trim();

        const node_type = raw_text_elements.has(tag_name) ? tag_name : 'tag';

        const node = {
            raw: raw_inner,
            data: raw_inner,
            type: node_type,
            name: tag_name,
            attribs: attribs,
            children: []
        };

        push_node(node);

        if (raw_text_elements.has(tag_name)) {
            const close_match = find_raw_text_close(str_html, pos, tag_name, lowercase_tags);
            const text_end = close_match ? close_match.start : len;
            const raw_text = str_html.slice(pos, text_end);
            if (!(ignore_whitespace && raw_text.trim().length === 0) && raw_text.length > 0) {
                node.children.push({
                    raw: raw_text,
                    data: raw_text,
                    type: 'text'
                });
            }
            pos = close_match ? close_match.end : len;
            continue;
        }

        if (!is_self_closing && !void_elements.has(tag_name)) {
            stack.push(node);
        }
    }

    return root;
};

class Default_Handler {
    constructor(callback, options = {}) {
        this.callback = callback;
        this.options = options;
        this.dom = null;
    }
    on_complete(dom) {
        this.dom = dom;
        if (this.callback) this.callback(null, dom);
    }
    on_error(err) {
        if (this.callback) this.callback(err);
    }
}

class Html_Parser {
    constructor(handler, options = {}) {
        this.handler = handler;
        this.options = options;
    }
    parse_complete(str_html) {
        try {
            const dom = parse_html(str_html, this.options);
            if (this.handler && this.handler.on_complete) this.handler.on_complete(dom);
            return dom;
        } catch (err) {
            if (this.handler && this.handler.on_error) this.handler.on_error(err);
            else throw err;
        }
    }
}

module.exports = {
    parse_html,
    Default_Handler,
    Html_Parser
};
