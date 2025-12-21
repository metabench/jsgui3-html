const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { JSDOM } = require('jsdom');

const lab_root = __dirname;
const experiments_dir = path.join(lab_root, 'experiments');
const fixtures_dir = path.join(lab_root, 'fixtures');

const setup_dom = () => {
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
        url: 'http://localhost',
        pretendToBeVisual: true,
        resources: 'usable'
    });

    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
    global.HTMLElement = dom.window.HTMLElement;
    global.Event = dom.window.Event;
    global.CustomEvent = dom.window.CustomEvent;
};

const cleanup_dom = () => {
    if (!global.document || !document.body) {
        return;
    }
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
};

const create_lab_context = () => {
    const jsgui = require('../html-core/html-core');
    return new jsgui.Page_Context();
};

const wait_for = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const load_fixture = (fixture_name, options = {}) => {
    const fixture_path = path.join(fixtures_dir, fixture_name);
    if (!fs.existsSync(fixture_path)) {
        throw new Error(`Missing fixture: ${fixture_name}`);
    }
    const raw_text = fs.readFileSync(fixture_path, 'utf8');
    const parse_json = options.parse_json !== false && fixture_name.endsWith('.json');
    return parse_json ? JSON.parse(raw_text) : raw_text;
};

const get_experiment_files = () => {
    if (!fs.existsSync(experiments_dir)) {
        return [];
    }
    return fs.readdirSync(experiments_dir)
        .filter(file_name => file_name.endsWith('_lab.js'))
        .map(file_name => path.join(experiments_dir, file_name));
};

const load_experiments = () => {
    const files = get_experiment_files();
    return files.map(file_path => {
        const experiment = require(file_path);
        const base_name = path.basename(file_path, '.js');
        const default_name = base_name.replace(/_lab$/, '');
        return {
            name: experiment.name || default_name,
            description: experiment.description || '',
            run: experiment.run,
            file_path
        };
    });
};

const list_experiments = () => {
    const experiments = load_experiments();
    if (experiments.length === 0) {
        process.stdout.write('No experiments found.\n');
        return;
    }
    experiments.forEach(exp => {
        const description = exp.description ? ` - ${exp.description}` : '';
        process.stdout.write(`${exp.name}${description}\n`);
    });
};

const run_experiment = async (experiment) => {
    if (typeof experiment.run !== 'function') {
        throw new Error(`Experiment ${experiment.name} does not export run()`);
    }
    const tools = {
        assert,
        create_lab_context,
        cleanup: cleanup_dom,
        wait_for,
        load_fixture
    };
    const result = await experiment.run(tools);
    cleanup_dom();
    return result;
};

const find_experiment = (name) => {
    const experiments = load_experiments();
    return experiments.find(exp => exp.name === name);
};

const run_all_experiments = async () => {
    const experiments = load_experiments();
    if (experiments.length === 0) {
        process.stdout.write('No experiments found.\n');
        return 0;
    }
    let failed = 0;
    for (const experiment of experiments) {
        try {
            await run_experiment(experiment);
            process.stdout.write(`ok - ${experiment.name}\n`);
        } catch (err) {
            failed += 1;
            process.stderr.write(`fail - ${experiment.name}: ${err.message}\n`);
        }
    }
    return failed;
};

const print_help = () => {
    process.stdout.write([
        'Usage:',
        '  node lab/experiment_runner.js list',
        '  node lab/experiment_runner.js run <name>',
        '  node lab/experiment_runner.js run-all'
    ].join('\n') + '\n');
};

const main = async () => {
    const command = process.argv[2];
    setup_dom();

    if (!command || command === 'help') {
        print_help();
        return;
    }

    if (command === 'list') {
        list_experiments();
        return;
    }

    if (command === 'run') {
        const name = process.argv[3];
        if (!name) {
            process.stderr.write('Missing experiment name.\n');
            print_help();
            process.exitCode = 1;
            return;
        }
        const experiment = find_experiment(name);
        if (!experiment) {
            process.stderr.write(`Unknown experiment: ${name}\n`);
            process.exitCode = 1;
            return;
        }
        try {
            await run_experiment(experiment);
            process.stdout.write(`ok - ${experiment.name}\n`);
        } catch (err) {
            process.stderr.write(`fail - ${experiment.name}: ${err.message}\n`);
            process.exitCode = 1;
        }
        return;
    }

    if (command === 'run-all') {
        const failed = await run_all_experiments();
        if (failed > 0) {
            process.exitCode = 1;
        }
        return;
    }

    print_help();
    process.exitCode = 1;
};

main().catch(err => {
    process.stderr.write(`Lab runner error: ${err.message}\n`);
    process.exitCode = 1;
});
