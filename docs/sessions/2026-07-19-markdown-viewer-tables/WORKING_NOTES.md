# Working Notes

Session: Markdown viewer tables

---

## Audit

**Context**: The public jsgui3 docs viewer renders repository Markdown through `Markdown_Viewer`.

**Findings**:
- GFM-style tables in architecture and component documentation currently render as raw pipe-delimited paragraphs.
- The parser already has focused regressions for list termination and end-of-document progress.

**Decisions**:
- Recognise a table only when a pipe-containing header is immediately followed by a valid delimiter row.
- Keep parsing bounded and preserve ordinary paragraph behaviour.

**Next Steps**:
- Implement semantic table composition and focused tests.

## Implementation

- Added bounded GFM-style table detection after a header plus valid delimiter
  row; ordinary pipe prose and fenced code remain unchanged.
- Added escaped-pipe/backtick-aware cell splitting, alignment metadata,
  semantic `table`/`thead`/`tbody` output, scoped column headings, and a
  responsive `.md-table-scroll` wrapper.
- Preserved the earlier CRLF, empty-blockquote, and defensive parser-progress
  fixes.
- Corrected the controls guide examples and maturity wording that the public
  viewer exposes.

## Validation

- `node --test test/controls/markdown_viewer.test.js`: 6/6 passing.
- `jsgui3-own-website` owner suite: 16/16 passing, including six real-browser
  tests that exercise the shared control in the documentation viewer.
- Oracle public `/docs/components`: 13 semantic tables in 13 responsive
  wrappers, no horizontal document overflow at 390×844, and no Chromium
  errors or warnings.

## Outcome

The shared control change is deployed as part of
`jsgui3-docs-viewer-release-20260719-presentation`. The prior
`jsgui3-docs-viewer-release-20260719-markdown-fix` tree remains untouched for
rollback.

---
