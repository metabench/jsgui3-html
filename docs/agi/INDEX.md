# 🧠 AGI Knowledge Singularity Index

This directory contains the central intelligence layer for AI agents working on `jsgui3-html`.

## Knowledge & Memory Architecture

This project uses a **dual-memory model**. Both layers work together:

| Layer | Location | Scope | Who reads it |
|-------|----------|-------|-------------|
| **Project Memory** | `docs/agi/`, `docs/sessions/`, `AGENTS.md` | jsgui3-html-specific knowledge | **All agents** (Copilot, Codex, Claude, Antigravity, Cline, Kilo) |
| **Cross-Repo Memory** | `C:\Users\james\.gemini\antigravity\knowledge\` | Universal programming knowledge across all repos | Antigravity natively; VS Code agents via file access |

### What goes where?

| Knowledge Type | Location | Example |
|---------------|----------|---------|
| Project conventions | `AGENTS.md`, path-local `AGENT.md` | "Use snake_case for variables" |
| Project lessons | `docs/agi/LESSONS.md` | "CSS radio selector chain needs exact sibling order" |
| Session progress | `docs/sessions/<date>-<topic>/` | "2026-02-12: Built Alert_Banner, tested all variants" |
| Cross-repo patterns | Antigravity KIs + `docs/agi/LESSONS.md` (dual-write) | "Puppeteer 24 removed waitForTimeout" |
| Subsystem context | Path-local `AGENT.md` (e.g., `controls/organised/AGENT.md`) | "New controls need E2E test + compose pattern" |

### For VS Code agents reading Antigravity memory

Cross-project knowledge items are stored at:
```
C:\Users\james\.gemini\antigravity\knowledge\
├── <topic-slug>/
│   ├── metadata.json     # Summary, timestamps, references
│   └── artifacts/        # Detailed docs, code snippets
```

## Structure

| Document | Purpose |
|----------|---------|
| `INDEX.md` | This file — the map |
| `SELF_MODEL.md` | Agent capabilities, constraints, and directives |
| `SKILLS.md` | Skills registry — reusable capability packs |
| `LESSONS.md` | Accumulated project learnings — **read before starting work** |
| `skills/` | Individual skill definitions |
| `workflows/` | Operational procedures and best practices |

## Entry Point

Start with `SELF_MODEL.md` to understand agent constraints, then consult `SKILLS.md` for task-specific procedures.
- [**TOOLS.md**](./TOOLS.md) — Manual for our tools (including `ui-pick`).

## Memory Banks
- [**LESSONS.md**](./LESSONS.md) — Project-specific lessons and gotchas.
- [**PATTERNS.md**](./PATTERNS.md) — Reusable solutions and best practices.
- [**RESEARCH_BACKLOG.md**](./RESEARCH_BACKLOG.md) — Open questions and investigations.
- [**journal/**](./journal/) — Chronological log of major system decisions.

## Path-Local Agent Guides

| Path | Scope |
|------|-------|
| [controls/organised/AGENT.md](../../controls/organised/AGENT.md) | Control creation, naming, testing, theming |

## Interaction
- **[SESSIONS_HUB](../sessions/SESSIONS_HUB.md)** — The active working memory (Task folders).
