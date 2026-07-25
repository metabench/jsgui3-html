'use strict';

const assert = require('node:assert');
const test = require('node:test');

const Markdown_Viewer = require('../../controls/organised/1-standard/0-viewer/Markdown_Viewer');

test('Markdown_Viewer consumes blank blockquote separator lines', () => {
    const controls = Markdown_Viewer.md_to_controls([
        '> First paragraph.',
        '> ',
        '> Second paragraph.'
    ].join('\n'));

    assert.strictEqual(controls.length, 2);
    assert.deepStrictEqual(controls.map((control) => control.dom.tagName), [
        'blockquote',
        'blockquote'
    ]);
});

test('Markdown_Viewer always advances past special-looking empty lines', () => {
    const controls = Markdown_Viewer.md_to_controls('# \nPlain text');

    assert.strictEqual(controls.length, 1);
    assert.strictEqual(controls[0].dom.tagName, 'p');
});

test('Markdown_Viewer recognises headings in CRLF documents', () => {
    const controls = Markdown_Viewer.md_to_controls('# Windows heading\r\n\r\nBody text.\r\n');

    assert.deepStrictEqual(controls.map((control) => control.dom.tagName), [
        'h1',
        'p'
    ]);
});

test('Markdown_Viewer renders GitHub-style tables with semantic alignment', async () => {
    const controls = Markdown_Viewer.md_to_controls([
        '| Package | Purpose | Status |',
        '| :--- | :---: | ---: |',
        '| `jsgui3-html` | Controls | Active |',
        '| `jsgui3-server` | Runtime | Pre-1.0 |'
    ].join('\n'));

    assert.strictEqual(controls.length, 1);
    assert.strictEqual(controls[0].dom.tagName, 'div');
    const html = await controls[0].all_html_render();
    assert.match(html, /<table[^>]*class="md-table"/);
    assert.match(html, /<th[^>]*class="md-align-left"[^>]*scope="col"/);
    assert.match(html, /<th[^>]*class="md-align-center"/);
    assert.match(html, /<th[^>]*class="md-align-right"/);
    assert.strictEqual((html.match(/<tr/g) || []).length, 3);
    assert.match(html, /<code[^>]*>jsgui3-html<\/code>/);
});

test('Markdown_Viewer keeps ordinary pipe-delimited prose as a paragraph', () => {
    const controls = Markdown_Viewer.md_to_controls('Compose | render | activate');

    assert.strictEqual(controls.length, 1);
    assert.strictEqual(controls[0].dom.tagName, 'p');
});

test('Markdown_Viewer client HTML path renders tables and preserves fenced pipes', () => {
    const html = Markdown_Viewer.md_to_html([
        '| Name | Role |',
        '| --- | --- |',
        '| Ada | Engineer |',
        '',
        '```text',
        '| not | a table |',
        '| --- | --- |',
        '```'
    ].join('\n'));

    assert.match(html, /<table class="md-table">/);
    assert.match(html, /<pre class="md-code-block"><code class="lang-text">\| not \| a table \|/);
});
