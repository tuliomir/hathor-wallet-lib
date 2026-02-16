# Test Mock Patterns

## Global mocks (setupTests.js)

Three global mocks always active in unit tests:

1. **mock-socket WebSocket**: handles `subscribe_address` → `subscribe_success` and `ping` → `pong`
2. **axios-mock-adapter**: `global.mock` adapter. Defaults: `thin_wallet/address_history` → empty, `version` → testnet
3. **GLL background task**: stopped via `stopGLLBackgroundTask()` to prevent interference

## Custom matchers

`toMatchBuffer()` — globally registered for Buffer equality. Uses `Buffer.equals()`. TypeScript doesn't know about it — tests use `// @ts-expect-error: toMatchBuffer is defined in our setupTests.js`.

## FakeHathorWallet

`__mock_helpers__/fake_hathorwallet.ts` — wraps ALL HathorWallet prototype methods as `jest.fn()` via dynamic iteration. No manual mock setup needed per method.

## Wallet-service mock

Separate `axios-adapter.mock.ts` creates isolated adapter with `validateStatus` allowing 4xx/5xx. Used for wallet-service tests only.

## Token mocks

`get-token.mock.ts` — hardcoded token map (NATIVE_TOKEN_UID → HTR, '01', '02', 'dbt', 'fbt'). Avoids token API calls in unit tests.

## Jest custom assert functions

`jest/expect-expect` allowlist includes custom assertion functions:
- `executeTests`, `testUnlockWhenSpent`, `testLockedUtxoMethods`, `testBestUtxoSelection`, etc.
- These wrap `expect()` calls — add new ones to `.eslintrc.js` assertFunctionNames list

## Rules

- Always `jest.clearAllMocks()` in `afterEach` when using spies
- Override `global.mock` per-test via `mock.onGet()` / `mock.onPost()` chains
- Test files mirror src/ structure: `src/api/` → `__tests__/api/`
