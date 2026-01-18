# Skills Registry

Reusable capability packs for agents working on `jsgui3-html`.

## How to Use

1. **Search** for a skill matching your task.
2. Open `SKILL.md` and follow the procedure.
3. If no skill exists, create a stub in `docs/agi/skills/<skill-name>/SKILL.md`.

## Skills

| Skill | Triggers | Location |
|-------|----------|----------|
| jsgui3-control-creation | new control, create control, control scaffold | `skills/jsgui3-control-creation/SKILL.md` |
| ui-pick-prompting | user decision, prompt user, ui-pick | `skills/ui-pick-prompting/SKILL.md` |
| session-discipline | session start, session end, continuity, notes | `skills/session-discipline/SKILL.md` |
| lab-experimentation | lab, experiment, prove, hypothesis, behavior | `skills/lab-experimentation/SKILL.md` |
| autonomous-ui-inspection | screenshot, inspect UI, visual, layout metrics | `skills/autonomous-ui-inspection/SKILL.md` |
| theme-system-integration | theme, variant, themeable, params | `skills/theme-system-integration/SKILL.md` |
| typescript-types | d.ts, declarations, types | `skills/typescript-types/SKILL.md` |
| inheritance-debugging | super(), NaN, undefined, constructor order | `skills/inheritance-debugging/SKILL.md` |
| browser-verification | demo server, visual verify, screenshot, DOM | `skills/browser-verification/SKILL.md` |

## Adding a Skill

Create: `docs/agi/skills/<skill-name>/SKILL.md`

Template:
- **Scope**: What it does/doesn't cover.
- **Inputs**: What info the agent needs.
- **Procedure**: Step-by-step.
- **Validation**: How to verify success.
- **References**: Related docs/scripts.
