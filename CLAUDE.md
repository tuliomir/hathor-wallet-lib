# hathor-wallet-lib

## Repository Overview

- **Package**: `@hathor/wallet-lib` (v2.14.0)
- **Purpose**: Core wallet library for the Hathor Network blockchain
- **Runtime**: Node.js >=22.0.0, npm >=10.0.0 (see `.nvmrc` and `engines` in `package.json`)
- **Language**: TypeScript + JavaScript (mixed codebase, migrating to TS)
- **TypeScript**: `strict: true` with `noImplicitAny: false` (legacy accommodation), target `es2020`
- **Build**: Babel transpilation + TypeScript declaration emission
- **Formatting**: Prettier (integrated via eslint-plugin-prettier)
- **Linting**: ESLint with @typescript-eslint/parser, airbnb-base, prettier
- **License**: MIT

## Source Architecture

```
src/
  index.ts              # Main package export
  lib.ts                # Public API surface
  config.ts             # Configuration management
  connection.ts         # Base connection class
  constants.ts          # Application constants
  errorMessages.ts      # Error message definitions
  errors.ts             # Custom error classes
  network.ts            # Network configuration
  opcodes.ts            # Script opcodes
  pushNotification.ts   # Push notification handling
  types.ts              # Core type definitions (central types file)
  api/                  # HTTP API clients (axios-based, 14 files incl. schemas/)
  headers/              # Block headers: base, fee, parser, types
  models/               # Data models: Transaction, Input, Output, P2PKH, P2SH, etc. (incl. enum/)
  nano_contracts/       # Nano contract builder, parser, serializer, deserializer (incl. fields/)
  new/                  # New wallet facade (wallet.js, sendTransaction.ts)
  storage/              # Storage layer: memory_store + leveldb/ subdirectory
  swapService/          # Atomic swap connection
  sync/                 # Synchronization logic
  template/             # Transaction templates
  utils/                # Helpers for address, crypto, buffer, scripts, tokens, tx
  wallet/               # Core wallet class, connection, websocket, mining (incl. api/)
  websocket/            # WebSocket base implementation
```

126 source files total.

## Test Structure

```
__tests__/
  api/                  # Mirrors src/api/
  models/               # Mirrors src/models/
  nano_contracts/       # Mirrors src/nano_contracts/
  new/                  # Mirrors src/new/
  storage/              # Mirrors src/storage/
  utils/                # Mirrors src/utils/
  wallet/               # Mirrors src/wallet/
  websocket/            # Mirrors src/websocket/
  swapService/          # Mirrors src/swapService/
  __fixtures__/         # tx_history.js, sample_txs.js
  __mocks__/            # wallet.mock.ts
  __mock_helpers/       # fake_hathorwallet.ts, wallet-service.fixtures.ts
  integration/          # Docker-based integration tests (separate config)
    configuration/      # docker-compose.yml, privnet.yml, precalculated-wallets.json
    helpers/            # genesis-wallet, wallet, precalculation helpers
    utils/              # logger, core utils
```

- Unit tests: `npm test` (jest 29, ~50% coverage thresholds)
- Integration tests: `npm run test_integration` (requires Docker, 20min timeout)

## Remote Conventions

```
origin    = tuliomir/hathor-wallet-lib     (fork, read/write)
upstream  = HathorNetwork/hathor-wallet-lib (upstream, READ-ONLY)
```

- **upstream pushurl is disabled** via `git config remote.upstream.pushurl "PUSH_DISABLED_use_origin_instead"`
- A pre-push hook also blocks pushes to upstream
- **NEVER push to upstream.** Always push to origin and create PRs.
- **NEVER force push.** Use `--force-with-lease` only on feature branches when needed after rebase.

## Branch Naming

Use prefixed branch names:
- `feat/<description>` - New features
- `fix/<description>` - Bug fixes
- `refactor/<description>` - Refactoring without behavior changes
- `test/<description>` - Test additions/improvements
- `docs/<description>` - Documentation changes
- `chore/<description>` - Tooling, config, maintenance

## Commit Conventions

- **Conventional commits**: `type(scope): description`
  - Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`
  - Scope: module name (e.g., `wallet`, `nano_contracts`, `storage`)
- **50/72 rule**: Subject line max 50 chars, body wrapped at 72
- **Atomic commits**: One logical change per commit
- GPG signing is enabled on this machine

## Verification Chain

Run these in order before considering work complete:

```bash
npm run format         # Auto-fix formatting (prettier)
npm run lint:fix       # Auto-fix lint issues (eslint + prettier)
npm run build          # Babel transpile + tsc declarations (iterate until clean)
npm test               # Unit tests (run after each logical group of changes)
```

For CI-style checks (no auto-fix):
```bash
npm run format:check   # Check formatting without modifying files
npm run lint           # Check lint without fixing
```

## PR Workflow

1. Ensure your branch is rebased on `upstream/master`:
   ```bash
   git fetch upstream
   git rebase upstream/master
   ```
2. Run the full verification chain
3. Push to origin: `git push -u origin <branch-name>`
4. Create PR against upstream using the feature template:
   ```bash
   gh pr create --repo HathorNetwork/hathor-wallet-lib \
     --title "type(scope): description" \
     --body "$(cat <<'EOF'
   ### Acceptance Criteria
   - <what this PR solves>

   ### Security Checklist
   - [ ] No unnecessary new dependencies
   - [ ] No dev-dependencies as production ones
   EOF
   )"
   ```
5. Reviewer: @pedroferreira1 (CODEOWNER)

## TypeScript Conventions

- Prefer `unknown` over `any` in new code
- Add explicit return types and parameter types to new/modified functions
- `noImplicitAny: false` is a legacy setting — do not rely on it for new code
- `strict: true` is enabled — follow strict mode conventions
- TypeScript 5.4, target `es2020`, `moduleResolution: "node"`
- TypeScript declarations are emitted to `lib/` (gitignored)
- Babel handles transpilation; tsc only emits declarations (`emitDeclarationOnly: true`)

## ESLint Rules

Config: `.eslintrc.js` (extends `airbnb-base`, `@typescript-eslint/recommended`, `prettier`)

Key rules:
- `no-console: 'error'` **in `src/` files** (override) — use proper error handling, not console
- `no-console: 'off'` in tests — console is fine in test files
- `@typescript-eslint/no-unused-vars: warn` — warns on unused vars, ignores unused args, prefix with `_` to suppress
- `camelcase: 'off'` — disabled because fullnode API uses snake_case field names
- `import/no-cycle: 'off'` — known issue, needs investigation to restructure
- `prettier/prettier: 'error'` — formatting violations are lint errors
- `no-underscore-dangle: off` — underscore prefixes are allowed
- `quotes: single` — single quotes required (with escape and template literal exceptions)
- `no-await-in-loop: off` — await in loops is allowed
- `no-bitwise: off` — bitwise ops allowed (crypto operations)

The `lint` script covers both src/ and __tests/: `eslint 'src/**/*.{js,ts}' '__tests__/**/*.{js,ts}'`

## Worktree Usage

Convention for parallel work:
```bash
git worktree add ~/code/claude_wallet-lib-worktrees/<branch-name> -b <branch-name>
cd ~/code/claude_wallet-lib-worktrees/<branch-name>
npm install    # Each worktree needs its own node_modules
npm run build  # Verify build in the worktree
```

Clean up when done:
```bash
git worktree remove ~/code/claude_wallet-lib-worktrees/<branch-name>
```

## Knowledge Base

The `knowledge/` folder contains decision records, patterns, and research. Consult it before starting new work — it may have context on past decisions that affect your approach.

## For Claude Code Sessions

### Build pipeline
1. `npm run build` = Babel compiles `.ts`/`.js` from `src/` to `lib/` + tsc emits `.d.ts` declarations
2. `lib/` is gitignored — never commit build output
3. If build fails on types, check `src/types.ts` first — it's the central type definitions file
4. `pretest` runs `patch-package` automatically before tests

### Reading upstream PRs and issues
```bash
gh pr list --repo HathorNetwork/hathor-wallet-lib
gh pr view <number> --repo HathorNetwork/hathor-wallet-lib
gh issue list --repo HathorNetwork/hathor-wallet-lib
gh issue view <number> --repo HathorNetwork/hathor-wallet-lib
```

### Upstream remote protection
- pushurl is set to `PUSH_DISABLED_use_origin_instead`
- pre-push hook blocks pushes to `upstream`
- settings.json deny rules block `git push upstream` and `git config remote.upstream`
- These three layers are intentional defense-in-depth. Do NOT try to work around them.

### Permission model
- Shared permissions in `.claude/settings.json` (committed to fork)
- Personal overrides in `.claude/settings.local.json` (gitignored)
- Key denials: force push, upstream push, `rm -rf`, hard reset, upstream remote reconfig
