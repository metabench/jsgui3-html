# Session Plan: Example Health Fixes

**Date**: 2026-03-07
**Agent**: Codex GPT-5
**Goal**: Restore broken examples, fix the shared bundling failure, and bring example verification back in line with reality.

## Scope

### In Scope
- Fix the shared `jsgui3-server` bundler path-resolution bug breaking client bundles.
- Repair broken `dev-examples/` apps that currently crash during SSR or activation setup.
- Repair or narrow clearly stale `examples/` scripts and example test harness assumptions.
- Re-run focused verification for example startup and key tests.

### Out of Scope
- Broad redesign of example UX beyond what is needed to restore working behavior.
- Unrelated templating / activation work already tracked in earlier sessions.
- General cleanup of all deprecation warnings unless directly required for example startup.

## Risks
- One root cause lives in the sibling `jsgui3-server` repo, so fixes cross repository boundaries.
- Existing tests and docs may assume behavior that no longer matches the current example surface.
- Some examples may depend on controls with deeper bugs, expanding scope beyond the example files themselves.

## Success Criteria
- [x] Dev examples ship a real client bundle instead of the fallback "Bundling failed" stub.
- [x] Broken examples identified in the audit start without SSR crashes.
- [x] Stale example scripts or harness assumptions are corrected to match current behavior.
- [x] Focused verification is rerun and results are captured in session notes.

## Related Sessions
- [2026-03-05-tpl-activation-parity](../2026-03-05-tpl-activation-parity/PLAN.md)
