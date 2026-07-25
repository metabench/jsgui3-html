# Session Plan: Markdown viewer tables

**Date**: 2026-07-19
**Agent**: Codex
**Goal**: Render bounded GitHub-style Markdown tables correctly in `Markdown_Viewer` without regressing its existing block parser.

## Scope

### In Scope
- Add table recognition and semantic table composition.
- Add focused regression tests for tables and existing paragraph/list termination.
- Validate the shared control in Node and through the jsgui3 docs viewer.
- Correct controls-guide examples and maturity wording exposed by that viewer.

### Out of Scope
- Full CommonMark/GFM compatibility.
- Interactive table behaviour.
- Unrelated control or theme redesigns.

## Risks
- Pipe characters inside code or prose could be misclassified as table cells.
- An unterminated block loop could reintroduce the parser hang fixed earlier.
- Table styling must remain theme-compatible and readable on narrow screens.

## Success Criteria
- [x] A header row plus delimiter row renders as a semantic table.
- [x] Alignment markers set appropriate cell alignment.
- [x] Ordinary pipe-delimited prose remains prose.
- [x] Existing Markdown regression tests pass.

## Related Sessions
- None.
