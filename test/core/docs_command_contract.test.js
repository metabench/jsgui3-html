const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..', '..');
const SKILLS = path.join(REPO, 'docs', 'agi', 'skills');

// Docs that tell an agent to run a command are only useful if the command exists.
// This caught two real defects on 2026-08-01: autonomous-ui-inspection prescribed
// `npm run dev`, which is not a script in this package, and lab-experimentation
// pointed at lab/experiments/001-example/, which does not exist.
//
// Placeholders (<component>, <control>) are skipped deliberately — they are meant
// to be substituted, not run verbatim.

const pkg = JSON.parse(fs.readFileSync(path.join(REPO, 'package.json'), 'utf8'));
const scripts = Object.keys(pkg.scripts || {});

const has_placeholder = (s) => /<[^>]+>|\$\{|\bYOUR_|\.\.\./.test(s);

const collect_docs = () => {
    const docs = [];
    const agents = path.join(REPO, 'AGENTS.md');
    if (fs.existsSync(agents)) docs.push({ label: 'AGENTS.md', file: agents });
    if (fs.existsSync(SKILLS)) {
        for (const dir of fs.readdirSync(SKILLS)) {
            const f = path.join(SKILLS, dir, 'SKILL.md');
            if (fs.existsSync(f)) docs.push({ label: `docs/agi/skills/${dir}/SKILL.md`, file: f });
        }
    }
    return docs;
};

const npm_run_re = /\bnpm run ([a-z0-9:_-]+)/g;
const node_path_re = /\bnode\s+((?:lab|tools|test|examples|dev-examples)\/[^\s`'")]+\.js)/g;

describe('docs command contract', () => {
    const docs = collect_docs();

    it('finds documentation to check', () => {
        expect(docs.length).to.be.greaterThan(5);
    });

    docs.forEach(({ label, file }) => {
        describe(label, () => {
            const text = fs.readFileSync(file, 'utf8');

            it('references only npm scripts that exist', () => {
                const referenced = [];
                let m;
                npm_run_re.lastIndex = 0;
                while ((m = npm_run_re.exec(text)) !== null) {
                    if (!has_placeholder(m[1])) referenced.push(m[1]);
                }
                const missing = [...new Set(referenced)].filter((s) => !scripts.includes(s));
                expect(
                    missing,
                    `${label} tells the reader to run scripts that package.json does not define`
                ).to.deep.equal([]);
            });

            it('references only node entry points that exist', () => {
                const referenced = [];
                let m;
                node_path_re.lastIndex = 0;
                while ((m = node_path_re.exec(text)) !== null) {
                    if (!has_placeholder(m[1])) referenced.push(m[1]);
                }
                const missing = [...new Set(referenced)].filter(
                    (p) => !fs.existsSync(path.join(REPO, p))
                );
                expect(missing, `${label} points at files that do not exist`).to.deep.equal([]);
            });
        });
    });
});
