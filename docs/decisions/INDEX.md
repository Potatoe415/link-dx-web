# DECISIONS INDEX

One line per decision. Read this file, then open only the relevant decision.
Decision files are append-only. To change a decision, add a new one that supersedes it.
Template: `docs/_templates/DECISION.md`.

| # | Date | Title | Status |
|---|---|---|---|
| 0001 | 2026-11-06 | Context architecture bootstrap v10.1 | Accepted |
| 0002 | 2026-11-06 | Pre-rendered Studio Ghibli background + 160x128 collision grid | Accepted |
| 0003 | 2026-11-06 | Single GameState with validated localStorage autosave | Accepted |
| 0004 | 2026-11-06 | Generated region modules + neighbor-based screen scrolling | Accepted |
| 0005 | 2026-11-06 | Data-driven enemies + ported damage model | Accepted |
| 0006 | 2026-11-09 | Scope lock on Act 1 Outdoor Sandbox (Village, Plage, Forêt ext.) | Accepted |

## When to log a decision
Any of:
- Locks in a technology, library, or vendor.
- Changes the data model, data ownership, or access model.
- Changes module boundaries or dependency directions.
- Cannot be reversed in under 30 minutes.
- Contradicts or supersedes an earlier decision.

If unsure, add an Open_Question to `STATE.md` instead.
