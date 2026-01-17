# Session: Bootstrapping ui-pick improvements

**Goal**: Make `ui-pick` robust enough to use as a primary interaction tool.
**Driver**: Antigravity

## Plan
1. [ ] Fix CLI argument fragility by implementing `--options-file`.
2. [ ] Verify with a complex JSON selection.
3. [ ] Use the tool to ask the user for the next priority.

## Working Notes
- Previous attempts to pass JSON via CLI failed due to shell escaping.
- Adding `--options-file` allows us to write a temp JSON file and pass that path, bypassing the shell.
