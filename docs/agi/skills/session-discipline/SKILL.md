# Skill: session-discipline

## Scope
Maintain structured notes across agent sessions to ensure continuity and knowledge transfer.

**Does:**
- Initialize session folders with standard structure.
- Track active work, findings, and follow-ups.
- Enable future agents to resume work seamlessly.

**Does Not:**
- Persist state between AI context windows (that's the purpose of the docs).
- Replace version control (still commit changes).

## Session Structure

Each session lives in `docs/sessions/<date>-<topic>/`:

```
docs/sessions/2026-01-09-matrix-control/
├── PLAN.md          # Goals, scope, risks
├── WORKING_NOTES.md # In-progress findings
└── SESSION_SUMMARY.md  # Final outcomes
```

## Procedure

### 1. Session Start
```markdown
# Check for active sessions
Look in: docs/sessions/

# If resuming, read:
- PLAN.md (understand goals)
- WORKING_NOTES.md (catch up on progress)

# If new, create folder:
docs/sessions/<YYYY-MM-DD>-<topic>/
```

### 2. Create PLAN.md
```markdown
# Session Plan: <Topic>

**Date**: <YYYY-MM-DD>
**Goal**: <One-line objective>

## Scope
- In scope: ...
- Out of scope: ...

## Risks
- ...

## Success Criteria
- [ ] ...
```

### 3. Maintain WORKING_NOTES.md
```markdown
# Working Notes

## <Timestamp>
- Finding: ...
- Decision: ...
- Next: ...
```

### 4. Session End
Create SESSION_SUMMARY.md:
```markdown
# Session Summary

**Completed:**
- ...

**Follow-ups:**
- [ ] ...

**Lessons:**
- ...
```

## Validation
- Session folder exists with required files.
- PLAN.md has clear goals and success criteria.
- WORKING_NOTES.md captures key decisions.
- SESSION_SUMMARY.md written before ending.

## References
- [SESSIONS_HUB.md](file:///c:/Users/james/Documents/repos/jsgui3-html/docs/sessions/SESSIONS_HUB.md) - Session index.
- [AGENTS.md](file:///c:/Users/james/Documents/repos/jsgui3-html/AGENTS.md) - Session protocol directive.
