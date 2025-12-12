const { expect } = require('chai');
const { parse_html, Default_Handler, Html_Parser } = require('../../html-core/html_parser');

describe('html_parser parse_html', () => {
    it('parses a simple element with text', () => {
        const dom = parse_html('<div>hello</div>');
        expect(dom).to.have.lengthOf(1);

        const div_node = dom[0];
        expect(div_node.type).to.equal('tag');
        expect(div_node.name).to.equal('div');
        expect(div_node.children).to.have.lengthOf(1);
        expect(div_node.children[0]).to.include({
            type: 'text',
            raw: 'hello',
            data: 'hello'
        });
    });

    it('parses nested elements', () => {
        const dom = parse_html('<div><span>Hi</span><b>There</b></div>');
        const div_node = dom[0];
        expect(div_node.children).to.have.lengthOf(2);
        expect(div_node.children[0].name).to.equal('span');
        expect(div_node.children[0].children[0].raw).to.equal('Hi');
        expect(div_node.children[1].name).to.equal('b');
        expect(div_node.children[1].children[0].raw).to.equal('There');
    });

    it('parses mixed top-level text and tags', () => {
        const dom = parse_html('foo <span>bar</span> baz');
        expect(dom).to.have.lengthOf(3);
        expect(dom[0].type).to.equal('text');
        expect(dom[0].raw).to.equal('foo ');
        expect(dom[1].type).to.equal('tag');
        expect(dom[1].name).to.equal('span');
        expect(dom[1].children[0].raw).to.equal('bar');
        expect(dom[2].type).to.equal('text');
        expect(dom[2].raw).to.equal(' baz');
    });

    it('parses quoted, unquoted, and boolean attributes', () => {
        const dom = parse_html('<input type=\"text\" placeholder=\'Enter\' data-test=abc disabled>');
        const input_node = dom[0];
        expect(input_node.name).to.equal('input');
        expect(input_node.attribs).to.deep.equal({
            type: 'text',
            placeholder: 'Enter',
            'data-test': 'abc',
            disabled: 'disabled'
        });
    });

    it('handles void and self-closing tags', () => {
        const dom = parse_html('<div>one<br>two<img src=\"x\"/></div>');
        const div_node = dom[0];
        expect(div_node.children.map(node => node.name || node.type)).to.deep.equal(['text', 'br', 'text', 'img']);
        expect(div_node.children[1]).to.include({ type: 'tag', name: 'br' });
        expect(div_node.children[1].children).to.have.lengthOf(0);
        expect(div_node.children[3].attribs.src).to.equal('x');
        expect(div_node.children[3].children).to.have.lengthOf(0);
    });

    it('handles self-closing tags with whitespace', () => {
        const dom = parse_html('<div>one<br />two</div>');
        const div_node = dom[0];
        expect(div_node.children.map(node => node.name || node.type)).to.deep.equal(['text', 'br', 'text']);
        expect(div_node.children[1].name).to.equal('br');
    });

    it('parses comments and directives', () => {
        const dom = parse_html('<!DOCTYPE html><div><!-- hi --><span>ok</span></div>');
        expect(dom[0].type).to.equal('directive');
        expect(dom[1].name).to.equal('div');

        const div_children_types = dom[1].children.map(node => node.type);
        expect(div_children_types).to.include('comment');
        expect(div_children_types).to.include('tag');
    });

    it('treats script/style as raw-text elements', () => {
        const dom = parse_html('<script>if (a<b) {}</script><div></div>');
        expect(dom[0].type).to.equal('script');
        expect(dom[0].children).to.have.lengthOf(1);
        expect(dom[0].children[0]).to.include({ type: 'text' });
        expect(dom[0].children[0].raw).to.equal('if (a<b) {}');
        expect(dom[1].name).to.equal('div');
    });

    it('closes raw-text elements with forgiving end tags', () => {
        const dom = parse_html('<script>var x = 1;< /  script><span>ok</span>');
        expect(dom[0].type).to.equal('script');
        expect(dom[0].children[0].raw).to.equal('var x = 1;');
        expect(dom[1].name).to.equal('span');
    });

    it('auto-closes optional-close tags on start', () => {
        const dom = parse_html('<ul><li>one<li>two</ul>');
        const ul_node = dom[0];
        expect(ul_node.name).to.equal('ul');
        expect(ul_node.children.filter(node => node.name === 'li')).to.have.lengthOf(2);
        expect(ul_node.children[0].children[0].raw).to.equal('one');
        expect(ul_node.children[1].children[0].raw).to.equal('two');
    });

    it('auto-closes <p> tags on start', () => {
        const dom = parse_html('<p>one<p>two');
        expect(dom.filter(node => node.name === 'p')).to.have.lengthOf(2);
        expect(dom[0].children[0].raw).to.equal('one');
        expect(dom[1].children[0].raw).to.equal('two');
    });

    it('recovers from missing end tags', () => {
        const dom = parse_html('<div><span>hi</div>');
        const div_node = dom[0];
        expect(div_node.name).to.equal('div');
        expect(div_node.children[0].name).to.equal('span');
        expect(div_node.children[0].children[0].raw).to.equal('hi');
    });

    it('parses custom tags and dashed attribute names', () => {
        const dom = parse_html('<my-control data-x=\"1\"></my-control>');
        expect(dom[0].name).to.equal('my-control');
        expect(dom[0].attribs['data-x']).to.equal('1');
    });

    it('parses tags even with whitespace after < (compat)', () => {
        const dom = parse_html('text < notatag');
        expect(dom).to.have.lengthOf(2);
        expect(dom[0]).to.include({ type: 'text' });
        expect(dom[0].raw).to.equal('text ');
        expect(dom[1]).to.include({ type: 'tag', name: 'notatag' });
    });

    it('supports ignore_whitespace option', () => {
        const dom = parse_html('  <div> hi </div>  ', { ignore_whitespace: true });
        expect(dom).to.have.lengthOf(1);
        expect(dom[0].name).to.equal('div');
        expect(dom[0].children).to.have.lengthOf(1);
        expect(dom[0].children[0].raw).to.equal(' hi ');
    });

    it('preserves tag/attr casing when configured', () => {
        const dom = parse_html('<DIV DATA-TEST=\"X\"></DIV>', {
            lowercase_tags: false,
            lowercase_attrs: false
        });
        expect(dom[0].name).to.equal('DIV');
        expect(dom[0].attribs).to.deep.equal({ 'DATA-TEST': 'X' });
    });
});

describe('html_parser compatibility classes', () => {
    it('Default_Handler stores dom and invokes callback', done => {
        const handler = new Default_Handler((err, dom) => {
            expect(err).to.equal(null);
            expect(dom).to.have.lengthOf(1);
            done();
        });
        const parser = new Html_Parser(handler);
        parser.parse_complete('<span>ok</span>');
        expect(handler.dom).to.have.lengthOf(1);
    });
});
