# Skill: lab-experimentation

## Scope
Use lab experiments to answer "how should we do this?" questions about jsgui3 behavior.

**Does:**
- Run existing lab experiments to confirm behavior.
- Create minimal new experiments when behavior is unknown.
- Promote stable findings into Skills/Patterns.

**Does Not:**
- Replace unit tests (labs are for exploration).
- Cover production deployment scenarios.

## Lab Structure

```
lab/
├── experiments/           # Individual experiments
│   └── 001-topic-name/
│       ├── README.md      # Hypothesis + expected result
│       ├── check.js       # Deterministic assertions
│       └── index.html     # Optional visual demo
├── fixtures/              # Shared test data
├── results/               # Captured outputs
└── README.md              # Lab index
```

## Procedure

### 1. Check Existing Labs
```bash
# List experiments
dir lab\experiments

# Read an experiment's README
type lab\experiments\001-example\README.md
```

### 2. Run an Experiment
```bash
# Run check.js
node lab/experiments/001-example/check.js
```

### 3. Create New Experiment
```bash
# Create folder
mkdir lab\experiments\NNN-short-slug

# Add files:
# - README.md (hypothesis)
# - check.js (assertions)
```

**README.md Template:**
```markdown
# Experiment NNN: <Title>

## Hypothesis
<What you expect to happen>

## Setup
<Steps to run>

## Expected Result
<What success looks like>

## Actual Result
<Filled after running>
```

**check.js Template:**
```javascript
'use strict';
const assert = require('assert');

// Setup
// ...

// Test
// ...

// Assertions
assert.strictEqual(actual, expected, 'Description');

console.log('✅ Experiment passed');
process.exit(0);
```

### 4. Distill Findings
- Update relevant Skill if pattern discovered.
- Add to `docs/agi/PATTERNS.md` if broadly reusable.
- Record in session working notes.

## Validation
- Experiment check.js exits with code 0.
- README.md documents hypothesis and result.

## References
- [Lab Directory](file:///c:/Users/james/Documents/repos/jsgui3-html/lab/)
- [PATTERNS.md](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/agi/PATTERNS.md)
