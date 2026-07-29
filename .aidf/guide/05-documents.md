# 05 — Document Lifecycle

Documents are working parts of the system. They are created at different points because they answer different questions. The **Track** column says when a document exists at all — most of this table never applies to a given change.

| Document | Answers | Track | Created | Updated when |
|---|---|---|---|---|
| Feature spec | What problem and outcome? Which track? | B, C | Before approval | Scope, acceptance, or classification changes |
| Issue | What work is tracked, and where is its spec? | B, C | After approval | Status, links, ownership change |
| Implementation plan | How will this repository change? | B, C | Before coding | Files, dependencies, or approach change |
| Pull request | What exact change is proposed? | A, B, C | After implementation begins | Review, checks, and scope change |
| Code review | What defects and risks did AI review find on the PR? | B, C (A: host only) | During `ai_reviewing` | Findings remediated or accepted; ready-for-human posted |
| Release notes | What shipped and why? Which git tag names the cut? | B, C | For a release | Release scope, migration notes, or version tag change |
| Conventions | How does this codebase do things? | Project setup | First unfamiliar area | Patterns change or drift is found |
| Architecture | What stable structure exists? | When a boundary changes | When a system boundary matters | The durable design changes |
| Data model | What does persistent state look like, and what may touch it? | `database` | Before the migration is written | Schema, classification, retention, or access rules change |
| Design | What should users experience? | `ui` | For UX or interaction work | User-facing behavior changes |
| UI foundation | What are the brand, tokens, and component conventions? | `ui` (first one) | With the first `ui` change | Tokens, breakpoints, or component conventions change |
| ADR | Why was a consequential choice made? | When consequential | At the decision point | Decision is superseded |
| Project state | What is true right now? | Project setup | At project setup | Milestones, risks, blockers change |
| Wiki page | What should a future reader know? | When reusable | When knowledge is reusable | Operational knowledge changes |
| Environment matrix | What is isolated and permitted? | Project setup | Project setup | Environment/data policy changes |
| Migration plan | How does persistent state change safely, and with what seed profile? | `database` | Before database work | Migration, seed, or risk approach changes |
| UI QA sign-off | Did the implementation match the approved design? | `ui` | Before UI PR merge | New Preview revision or finding |
| API contract | What behavior and NFRs are promised? | `api` | Before API implementation | API behavior or target changes |
| MCP capability | What can an agent invoke safely? | `mcp-write` | Before MCP exposure | Tool/auth/audit behavior changes |
| Threat model | What abuse cases and controls matter? | `security`, `mcp-write`, `infra` | For high-risk changes | Trust boundary or mitigation changes |
| Deployment record | What went live, under which approval? | `release` | Every production release | Release status or recovery changes |

## What is not a document

**Classification** is front matter on the spec, not a separate artifact. **Seed data planning** is a section of the migration plan. **The implementation record** is the pull request — writing a second narrative of the same change produces two sources of truth and one of them will be wrong.

A Track A change has exactly one document: its pull request.

## Architecture decision rule

After implementation, ask: **did this change alter a stable boundary, data model, integration contract, security posture, deployment topology, or operational assumption?**

- If no, link the PR and move on.
- If yes, update architecture documentation and create an ADR for the decision or trade-off.
- If users or operators need to learn something, update the wiki.
- If behavior shipped, include it in release notes and ensure the annotated git tag on the production tip matches the notes `version`.

## Metadata

Every durable document has `type`, `status`, `owner`, created/updated dates, a `track` marker, and links to related artifacts. Templates provide front matter that can be adapted to the project's tooling.
