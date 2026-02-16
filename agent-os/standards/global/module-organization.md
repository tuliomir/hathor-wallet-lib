# Module Organization

## Two-layer export architecture

- `src/index.ts` — 4 lines, re-exports everything from `lib.ts` as both named and default
- `src/lib.ts` — comprehensive aggregation hub, ~136 lines

This allows both `import hathorLib from '@hathor/wallet-lib'` and `import { X } from '@hathor/wallet-lib'`.

## lib.ts export strategy

- 14 `import * as` namespace imports
- 49 individual imports
- 65 explicit named exports
- 3 wildcard re-exports (nano_contracts/types, models/types, models/enum)

Explicit listing provides API surface documentation and visibility control.

## Internal-only modules (NOT exported)

- `src/opcodes.ts` — script opcode constants
- `src/schemas.ts` — Zod validation schemas
- `src/connection.ts` — abstract base connection
- `src/websocket/base.ts` — abstract WebSocket base

## Module split patterns

- **SwapService**: connection logic (`src/swapService/`) is public; HTTP/encryption logic (`src/wallet/api/swapService.ts`) is internal
- **WebSocket**: only concrete `GenericWebSocket` exported, not abstract `BaseWebSocket`
- **Headers**: barrel with renaming (`base.ts` default → `Header`)

## Import cycle avoidance

- `import/no-cycle` is OFF in ESLint (known issue)
- Consumer classes import specific utils directly, never from `lib.ts`
- `lib.ts` is terminal aggregation — nothing imports from it internally

> **[QUESTION]** Why was `import/no-cycle` turned off rather than fixing the cycles?
> **[BEST GUESS]** The cycles are deeply embedded in the interaction between wallet, storage, and connection modules. Fixing requires significant restructuring of module boundaries that hasn't been prioritized.
