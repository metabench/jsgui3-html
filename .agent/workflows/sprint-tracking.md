---
description: How agents should track time when working on sprint tasks
---

# Sprint Tracking Workflow

// turbo-all

The Sprint Tracker at `tools/sprint-tracker/` tracks progress on control suite tasks.

## CLI Commands (preferred — no server needed, safe to auto-run)

All sprint tracking uses the CLI tool which accesses the JSON file directly:

```sh
# Mark task as in_progress
node tools/sprint-tracker/log.js start <task_id>

# Log time on a phase
node tools/sprint-tracker/log.js log <task_id> <phase> <minutes> [notes...]

# Mark task done (optionally log final minutes)
node tools/sprint-tracker/log.js done <task_id> [minutes] [notes...]

# Change status
node tools/sprint-tracker/log.js status <task_id> <status>

# View sprint stats
node tools/sprint-tracker/log.js stats

# List tasks (optionally filter by status)
node tools/sprint-tracker/log.js list [status]
```

Valid phases: `planning`, `implementation`, `testing`, `e2e_testing`, `bug_fixing`
Valid statuses: `not_started`, `planning`, `in_progress`, `testing`, `done`

## Typical Task Flow

1. Start the task:
```sh
node tools/sprint-tracker/log.js start badge-complete
```

2. Do the implementation work (create files, edit code).

3. Write a verification check to `tmp/check.js` and run it (see below).

4. Mark done with time:
```sh
node tools/sprint-tracker/log.js done badge-complete 15 Built badge CSS with variants and pulse
```

## Verification Pattern

Instead of running inline `node -e "..."` checks (which need permission), write a temp check file:

```sh
# Agent writes tmp/check.js with verification logic, then:
node tmp/check.js
```

The check file pattern:
```js
// tmp/check.js — auto-generated verification
const jsgui = require('../html-core/html-core');
const Badge = require('../controls/organised/0-core/0-basic/1-compositional/badge');
const ctx = new jsgui.Page_Context();
const checks = [];
function ok(label, val) { checks.push({label, pass: !!val}); }

const b = new Badge({ context: ctx, variant: 'primary', text: 'New' });
ok('Has jsgui-badge class', b.html.includes('jsgui-badge'));
ok('Has data-variant', b.html.includes('data-variant'));

// Report
checks.forEach(c => console.log((c.pass ? '  ✓' : '  ✗') + ' ' + c.label));
const all = checks.every(c => c.pass);
console.log(all ? '\n=== ALL PASS ✓ ===' : '\n=== SOME FAILED ✗ ===');
process.exit(all ? 0 : 1);
```

## Dashboard (optional)

If the tracker server is running, the dashboard is at http://localhost:3700.
Start it with: `node tools/sprint-tracker/tracker_server.js`
