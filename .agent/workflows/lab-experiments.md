---
description: How to use the lab experiment system for prototyping and validating control patterns
---

# Lab Experiment Workflow

## When to Use Labs

Use an experiment when:
- Testing a new control pattern (e.g., prop/field integration)
- Validating a rendering hypothesis before production changes
- Comparing two implementation approaches
- Documenting a reusable pattern with evidence

## Quick Experiments (experiment_runner.js)

For single-file, fast experiments:

// turbo
1. Create `lab/experiments/<name>_lab.js`:

```javascript
module.exports = {
    name: '<name>',
    description: 'Short description',
    run: async (tools) => {
        const { create_lab_context, assert, cleanup } = tools;
        const jsgui = require('../../html-core/html-core');
        const context = create_lab_context();

        // Experiment logic here

        cleanup();
        return { ok: true };
    }
};
```

// turbo
2. Run it:
```powershell
node lab/experiment_runner.js run <name>
```

// turbo
3. Run all experiments to check nothing broke:
```powershell
node lab/experiment_runner.js run-all
```

4. Document findings in `lab/results/<name>_results.md`

## Server-Based Demos (larger explorations)

For multi-file experiments needing browser interaction:

1. Create a standalone demo server in `lab/` (e.g., `lab/my_demo_server.js`)
2. Use the standard jsgui3-server pattern with Page_Context
3. Run with `node lab/my_demo_server.js`
4. Inspect in browser

## Deciding Experiment vs Direct Implementation

| Signal | Action |
|--------|--------|
| Uncertain if pattern works | Experiment first |
| Pattern is well-established (e.g., existing controls use it) | Direct implementation |
| Performance implications unclear | Experiment with timing |
| Multiple approaches to compare | Experiment both |
| Simple additive change | Direct implementation |
| Core framework change | Always experiment first |
