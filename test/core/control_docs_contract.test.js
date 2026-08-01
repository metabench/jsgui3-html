const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..', '..');
const DOCS = path.join(REPO, 'docs', 'controls');

const jsgui = require('../../html-core/html-core');
const controls = require('../../controls/controls');

// Every file in docs/controls/ documents a control by naming its constructor, its spec
// options, its methods and its test file. Prose rots silently; this makes it fail loudly.
// See jsgui3-ecosystem/docs/reviews/README.md for why findings are pinned as tests.

const section = (text, name) => {
    const m = text.match(new RegExp('##\\s+' + name + '\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)', 'i'));
    return m ? m[1] : '';
};

const parse_doc = (text) => {
    const ctor_match = text.match(/new\s+(?:controls\.)?([A-Z][A-Za-z0-9_]*)\s*\(/);
    const methods = [];
    const meth_re = /\b[a-z_][A-Za-z0-9_]*\.([a-z_][A-Za-z0-9_]*)\s*\(/g;
    const meth_section = section(text, 'Methods');
    let m;
    while ((m = meth_re.exec(meth_section)) !== null) {
        if (!methods.includes(m[1])) methods.push(m[1]);
    }
    const tests = [];
    const test_re = /^-\s+`([^`]+\.js)`/gm;
    const test_section = section(text, 'Tests');
    while ((m = test_re.exec(test_section)) !== null) tests.push(m[1]);
    return { ctor: ctor_match ? ctor_match[1] : null, methods, tests };
};

const doc_files = fs.readdirSync(DOCS).filter((f) => f.endsWith('.md') && f !== 'INDEX.md');

describe('docs/controls contract', () => {
    it('finds control documentation to check', () => {
        expect(doc_files.length).to.be.greaterThan(50);
    });

    doc_files.forEach((file) => {
        describe(file, () => {
            const text = fs.readFileSync(path.join(DOCS, file), 'utf8');
            const parsed = parse_doc(text);

            it('names a constructor that jsgui3-html actually exports', () => {
                expect(parsed.ctor, `${file} has no "new X(...)" usage snippet`).to.be.a('string');
                expect(
                    typeof controls[parsed.ctor],
                    `docs name controls.${parsed.ctor}, which is not exported. Check exact casing — ` +
                        `Datetime_Picker vs DateTime_Picker cost a doc once already.`
                ).to.equal('function');
            });

            it('documents a control that constructs and renders', function () {
                if (typeof controls[parsed.ctor] !== 'function') this.skip();
                const inst = new controls[parsed.ctor]({ context: new jsgui.Page_Context() });
                const html = inst.all_html_render();
                expect(html, `${parsed.ctor} rendered nothing`).to.be.a('string').that.is.not.empty;
            });

            it('documents only methods the control has', function () {
                if (typeof controls[parsed.ctor] !== 'function') this.skip();
                if (!parsed.methods.length) this.skip();
                const inst = new controls[parsed.ctor]({ context: new jsgui.Page_Context() });
                const missing = parsed.methods.filter((meth) => typeof inst[meth] !== 'function');
                expect(missing, `${file} documents methods that do not exist`).to.deep.equal([]);
            });

            it('references test files that exist', function () {
                if (!parsed.tests.length) this.skip();
                const missing = parsed.tests.filter((t) => !fs.existsSync(path.join(REPO, t)));
                expect(missing, `${file} references missing test files`).to.deep.equal([]);
            });
        });
    });
});
