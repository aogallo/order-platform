# Skill Registry — order-platform

Generated: 2026-05-05
Project: order-platform
Source: sdd-init auto-scan

---

## User Skills

| Skill | Trigger Context |
|-------|----------------|
| `branch-pr` | Creating a PR, opening a pull request, preparing changes for review |
| `chained-pr` | Large changes >400 lines, splitting a change into chained/stacked PRs |
| `comment-writer` | Drafting PR feedback, review comments, issue comments, async collaboration |
| `work-unit-commits` | Implementing changes, preparing commits, splitting PRs, SDD apply phase |
| `issue-creation` | Creating a GitHub issue, reporting a bug, requesting a feature |
| `judgment-day` | Independent adversarial review of code, architecture decisions, or PRs |
| `skill-creator` | Creating new skills, documenting AI agent patterns |
| `context7-mcp` | Questions about libraries, frameworks, API references, code examples |
| `cognitive-doc-design` | Writing docs, READMEs, or technical documentation |
| `go-testing` | Go tests, Bubbletea TUI testing |
| `sdd-explore` | Investigating features/ideas before committing to implementation |
| `sdd-propose` | Formalizing an explored idea into a proposal |
| `sdd-spec` | Writing delta specs/requirements for a change |
| `sdd-design` | Technical design document and architecture decisions |
| `sdd-tasks` | Breaking a change into implementation tasks |
| `sdd-apply` | Implementing SDD tasks |
| `sdd-verify` | Validating implementation against specs |
| `sdd-archive` | Closing and archiving a completed change |

---

## Compact Rules

### branch-pr
- Every PR MUST link an approved GitHub issue (no exceptions)
- Every PR MUST have exactly one `type:*` label
- Branch naming: `type/description` (lowercase, no spaces, only `a-z0-9._-`)
- Conventional commit format required
- Automated checks must pass before merge

### work-unit-commits
- Commit by deliverable behavior, not by file type (no `add models` → `add services` → `add tests`)
- Tests belong in the same commit as the behavior they verify
- Each commit must make sense in isolation — reviewable and rollback-safe
- If a change forecasts >400 lines changed, split into chained PR slices before implementation
- Commit message explains the OUTCOME, not the file list

### chained-pr
- 400-line cognitive budget per PR — flag and chain when exceeding
- Each PR in the chain must be independently reviewable and mergeable
- Base each chained PR on the previous one, not on main

### issue-creation
- Issues must be created BEFORE work begins — no orphan PRs
- Issue must receive `status:approved` label before a branch is opened
- Use the project issue template when available

---

## Project Conventions

No project-level CLAUDE.md found.
No agents.md / AGENTS.md found.

---

## Stack Context

- **Primary language**: TypeScript (order-service), Python (reporting-service)
- **Runtime**: Node.js 20 (Lambda), Python (FastAPI)
- **Deploy**: Serverless Framework v4 (AWS Lambda + API Gateway HTTP API)
- **Infra**: Terraform — AWS Cognito, IAM (GitHub Actions OIDC role)
- **Monorepo**: npm workspaces + Turbo
- **Linter**: ESLint + typescript-eslint + prettier (order-service)
- **Formatter**: Prettier
- **Type check**: `tsc --noEmit` (strict mode enabled)
- **Tests**: NOT CONFIGURED (placeholder script only)
