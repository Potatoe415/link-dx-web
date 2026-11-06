# 0001 — Context architecture bootstrap v10.1

Date: 2026-11-06
Status: Accepted
Decision: Use one canonical `AGENTS.md`, need-to-know docs under `docs/`, and task levels L0–L2.
Context: Agent sessions must stay cheap in tokens, resume without re-explaining, and change one room or gameplay system without scanning the entire repository or `_ref_repo/`.
Rationale: `AGENTS.md` is read natively by current coding agents; atomic decisions, lazy docs, and task levels keep loaded context small.
Consequences: No tool-specific router files. Product, architecture, and security docs change only with user confirmation.
Alternatives_Rejected: Per-tool rule files (drift, lock-in). One long instruction file (token cost, diluted attention).
