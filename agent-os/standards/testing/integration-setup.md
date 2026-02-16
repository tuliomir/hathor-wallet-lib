# Integration Test Setup

## Docker environment

Real fullnode + wallet-service via `docker-compose.yml`. Tests run against actual network.

## One-time setup pattern

`CustomEnvironment.js` provides `global.__SHARED_STATE__` persisting across test files in same worker:

```javascript
if (!sharedState.setupDone) { /* expensive setup runs once */ }
```

Includes: genesis wallet init, blueprint creation, precalculated wallet loading.

## Precalculated wallets

- Pool of pre-generated wallets with 22 addresses each
- Loaded from `./tmp/wallets.json` in `beforeAll`
- State saved back in `afterAll` (tracks which wallets were used)
- Prevents wallet reuse across test runs
- Each test pops an unused wallet via `getPrecalculatedWallet()`

## HTTP keep-alive workaround

Keep-alive DISABLED in integration tests:

```javascript
http.globalAgent = new http.Agent({ keepAlive: false });
```

Jest sequential execution causes 5s idle timeouts on serverless connections. Not needed in production.

## Wait helpers

| Function | Purpose | Timeout |
|----------|---------|---------|
| `waitForWalletReady()` | Polls for READY state | 120s |
| `waitForTxReceived()` | Waits for tx in storage with FINISHED status | - |
| `waitUntilNextTimestamp()` | Handles 1-second timestamp granularity | - |
| `waitNextBlock()` | Polls storage height | 600s |
| `waitTxConfirmed()` | Waits for `first_block` (not mempool) | - |

## Blueprint precalculation

Five on-chain blueprints created before tests (BET, AUTHORITY, FULL, PARENT, CHILDREN). Each tx awaited with `waitTxConfirmed()`.

## Timeouts

- `jest-integration.config.js`: 20-minute global timeout
- `maxConcurrency: 1` (sequential)
- `forceExit: true` (required due to Jest/Jasmine bug)
- HathorWallet class: 92% statements, 85% branches minimum coverage

> **[QUESTION]** Why is `forceExit: true` needed specifically for integration tests?
> **[BEST GUESS]** When `beforeAll` throws in Jest/Jasmine, error handling doesn't properly clean up async resources (open websockets, HTTP connections), causing Jest to hang indefinitely. Force exit is the pragmatic fix.
