# MVVM Lab Fixtures

This document describes how the lab uses fixture-driven experiments to validate
controls and MVVM behavior without jsgui3-server.

## Goals

- Test controls and MVVM bindings with repeatable text fixtures.
- Keep experiments fast and isolated at the jsgui3-html level.
- Capture findings that guide control improvements.

## Directory Layout

```
lab/
  experiments/
  fixtures/
  results/
```

## Fixture Format

Use JSON files with a `cases` array for test inputs and expected outputs.

Example: `lab/fixtures/text_mvvm_cases.json`

```json
{
  "cases": [
    {
      "name": "trim_upper_slug",
      "raw_text": "  Hello World  ",
      "expected_trimmed": "Hello World",
      "expected_upper": "HELLO WORLD",
      "expected_slug": "hello-world"
    }
  ]
}
```

## Loading Fixtures

Use `load_fixture` from the lab runner tools. JSON is parsed by default.

```javascript
const fixture_data = load_fixture('text_mvvm_cases.json');
const test_cases = fixture_data.cases || [];
```

For raw text:

```javascript
const sample_text = load_fixture('sample_paragraph.txt', { parse_json: false });
```

## MVVM Experiment Pattern

Controls in jsgui3-html expose MVVM utilities on `jsgui.Control`.

```javascript
class Text_Mvvm_Lab_Control extends jsgui.Control {
    constructor(spec = {}) {
        super(spec);
        const string_transforms = this.transforms.string;
        this.data.model = new Data_Object({ raw_text: '' });
        this.view.data.model = new Data_Object({
            trimmed_text: '',
            upper_text: '',
            slug_text: ''
        });

        this.bind({
            raw_text: {
                to: 'trimmed_text',
                transform: (value) => string_transforms.trim(value)
            }
        });

        this.computed(
            this.data.model,
            ['raw_text'],
            (raw_text) => string_transforms.slugify(raw_text),
            { propertyName: 'slug_text', target: this.view.data.model }
        );

        this.watch(this.data.model, 'raw_text', (new_val, old_val) => {
            this.last_change = { new_val, old_val };
        });
    }
}
```

## Running Experiments

```
node lab/experiment_runner.js list
node lab/experiment_runner.js run text_mvvm_fixtures
node lab/experiment_runner.js run mvvm_computed_watch
node lab/experiment_runner.js run mvvm_two_way_binding
node lab/experiment_runner.js run-all
```

## Available Fixture Sets

- `lab/fixtures/date_i18n_cases.json`
- `lab/fixtures/text_mvvm_cases.json`
- `lab/fixtures/control_text_render_cases.json`

## Additional MVVM Labs

- `mvvm_computed_watch`
- `mvvm_two_way_binding`

## Notes

- Experiments should avoid jsgui3-server; rely on jsdom and MVVM utilities.
- Store experiment results in `lab/results/` using the template.
