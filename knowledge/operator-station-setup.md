# Operator Station Setup

## What

An "operator station" is a fully-configured fork of hathor-wallet-lib designed for autonomous Claude Code agent work. It maximizes agent autonomy while structurally preventing damage to the upstream repository.

## Why

Tulio is the primary active contributor to HathorNetwork/hathor-wallet-lib, focused on TypeScript typing and refactoring work. Running Claude Code with broad permissions and parallel agent teams accelerates this work, but requires safety rails to prevent accidental upstream damage.

## Architecture Decisions

### Two-remote model

```
origin    = tuliomir/hathor-wallet-lib     (fork, full read/write)
upstream  = HathorNetwork/hathor-wallet-lib (upstream, read-only)
```

All work happens on origin. PRs to upstream are cross-fork via `gh pr create --repo`.

### Defense-in-depth against upstream push

Three independent layers prevent pushing to upstream:

1. **Disabled pushurl**: `git config remote.upstream.pushurl "PUSH_DISABLED_use_origin_instead"` — git itself rejects the push at transport level
2. **Pre-push hook**: `.git/hooks/pre-push` checks the remote name and exits with error if it's "upstream"
3. **Deny rules**: `.claude/settings.json` denies `git push upstream:*` and `git config remote.upstream:*` (prevents agents from reconfiguring the pushurl)

Any single layer failing is caught by the other two.

### Permission model

- **Shared settings** (`.claude/settings.json`, committed): Broad allow list for git, npm, gh, node, shell tools. Deny list for destructive operations.
- **Personal settings** (`.claude/settings.local.json`, gitignored): Personal overrides. Can be more or less restrictive.

### Worktrees for parallelism

Convention: `~/code/claude_wallet-lib-worktrees/<branch-name>/`

Each worktree gets its own `node_modules` and build output, so multiple agents can work on different branches simultaneously without interference.

### Tiered verification chain

```
npm run build    → Must pass (catches type errors, syntax errors)
npm test         → Must pass (catches logic errors, regressions)
```

Build runs after every file change. Tests run after each logical group of changes.

### Skills for common workflows

- `/typing-audit` — Scan, plan, apply TypeScript type improvements
- `/pr-upstream` — Create PR to HathorNetwork with all checks
- `/sync-upstream` — Fetch and rebase/merge from upstream

## How to Replicate

For teammates to set up their own operator station:

1. **Fork** HathorNetwork/hathor-wallet-lib to your GitHub account
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-user>/hathor-wallet-lib.git ~/code/<your-dir>
   ```
3. **Add upstream remote** (read-only):
   ```bash
   git remote add upstream https://github.com/HathorNetwork/hathor-wallet-lib.git
   git config remote.upstream.pushurl "PUSH_DISABLED_use_origin_instead"
   git fetch upstream && git fetch upstream --tags
   ```
4. **Copy config files** from this fork:
   - `CLAUDE.md` — repo conventions and agent guidance
   - `.claude/settings.json` — shared permissions
   - `.claude/skills/` — workflow skills
   - `knowledge/` — decision records
5. **Create git hooks** (these are in `.git/hooks/`, not tracked by git):
   - Copy `pre-push` and `pre-commit` hooks from another operator station
   - `chmod +x .git/hooks/pre-push .git/hooks/pre-commit`
6. **Install and verify**:
   ```bash
   npm install
   npm run build
   npm test
   ```
7. **Create worktree directory**:
   ```bash
   mkdir -p ~/code/<your-dir>-worktrees
   ```

## Token/Auth Approach

No separate GitHub token is needed. The existing `gh` CLI authentication has read access to the HathorNetwork org. Safety is enforced entirely through:
- Git config (disabled pushurl)
- Git hooks (pre-push blocks upstream)
- Claude Code deny rules (settings.json)

This avoids token management complexity while maintaining security through structural barriers.
