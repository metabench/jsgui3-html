# Development Cycle Workflow

The standard operating procedure for reliable software development by agents.

## 1. Audit & Diagnose
**Goal**: Establish ground truth before making changes.

*   **List Files**: Understand the directory structure.
*   **Read Code**: Read relevant files (`view_file`).
*   **Run Diagnostics**: Execute commands to check the current state (e.g., `node server.js`, `npm test`).
    *   **Tip**: Prefer running existing scripts (`node test/audit/my_script.js`) over ad-hoc complex commands.
    *   **Tip**: Set `SafeToAutoRun: true` whenever possible for read-only checks.
*   **Check Environment**: Verify environment variables if tools fail.

## 2. Plan
**Goal**: Design the change and get consensus (even if just internal consistency).

*   **Create/Update Plan**: `implementation_plan.md` in the artifacts directory.
*   **Break Down Tasks**: Update `task.md` with granular steps.

## 3. Execute
**Goal**: Implement the changes.

*   **Write Code**: Use `write_to_file` or `replace_file_content`.
*   **Incremental Steps**: Change one component at a time.
*   **Activation Awareness**: If working on SSR/Web, ensure client-side code is bundled and served.

## 4. Verify
**Goal**: Prove the change works. **Do not skip.**

*   **Create Verification Script**: Write a specific script (e.g., `test/audit/verify_fix.js`) to test the exact scenario.
*   **Use Puppeteer/Playwright**: For UI interactions, programmatic browser testing is more reliable than manual checks.
*   **Capture Evidence**: Take screenshots (`page.screenshot`) or capture console logs.
*   **Run Existing Tests**: Ensure no regressions (`npm test`).

## 5. Document
**Goal**: Record the history and clean up.

*   **Update Artifacts**: Checked off items in `task.md`.
*   **Write Walkthrough**: Create/Update `walkthrough.md` with "Before/After" and evidence (screenshots).
*   **Update Knowledge**: if a new pattern was discovered, update `docs/agi/`.
