# Lab

The lab is a lightweight harness for fast control experiments and design validation.
Use it to prototype new control behavior, check rendering/activation, and document
findings before turning them into production controls and tests.

## Goals

- Rapid experiments for control behavior and rendering
- Repeatable runs with minimal setup
- Capture results to inform control improvements

## Quick Start

Install dependencies at repo root if needed:

```bash
npm install
```

List available experiments:

```bash
node lab/experiment_runner.js list
```

Run a single experiment:

```bash
node lab/experiment_runner.js run control_render_smoke
```

Run all experiments:

```bash
node lab/experiment_runner.js run-all
```

## Writing Experiments

Add a file to `lab/experiments/` with a `_lab.js` suffix. Each experiment exports
`name`, `description`, and an async `run` function.

```javascript
module.exports = {
    name: 'my_experiment',
    description: 'Short description',
    /**
     * Run the experiment.
     * @param {Object} tools - Lab utilities.
     */
    run: async (tools) => {
        const { create_lab_context, assert, cleanup } = tools;
        const context = create_lab_context();

        // Experiment logic here

        cleanup();
        return { ok: true };
    }
};
```

## Fixtures

Store text fixtures in `lab/fixtures/` and load them inside experiments via
`load_fixture`. JSON fixtures should include a `cases` array for consistency.

```javascript
const fixture_data = load_fixture('text_mvvm_cases.json');
const test_cases = fixture_data.cases || [];
```

Text files are also supported:

```javascript
const sample_text = load_fixture('sample_paragraph.txt', { parse_json: false });
```

## MVVM Experiments

Controls in jsgui3-html are MVVM-ready. `jsgui.Control` is the MVVM base class and
supports `bind`, `computed`, `watch`, `transforms`, and `validators` methods.
Use `Data_Object` for data and view models to keep experiments aligned with
production patterns.

```javascript
const jsgui = require('../html-core/html-core');
const { Data_Object } = require('lang-tools');

class My_Mvvm_Lab_Control extends jsgui.Control {
    constructor(spec = {}) {
        super(spec);
        this.data.model = new Data_Object({ value: 0 });
        this.view.data.model = new Data_Object({ display: '' });

        this.bind({
            value: {
                to: 'display',
                transform: (val) => String(val)
            }
        });

        this.watch(this.data.model, 'value', (new_val, old_val) => {
            this.last_change = { new_val, old_val };
        });
    }
}
```

## Capturing Results

Record outcomes in `lab/results/` using `lab/results/experiment_template.md`.
Capture observations, risks, and next steps that should become control changes
or formal tests in `test/`.

## Recommended Workflow

1. Prototype control behavior in a lab experiment.
2. Document findings in `lab/results/`.
3. Implement control changes in `controls/`.
4. Add unit/integration tests under `test/`.

For fixture patterns and MVVM examples, see `docs/lab_mvvm_fixtures.md`.
