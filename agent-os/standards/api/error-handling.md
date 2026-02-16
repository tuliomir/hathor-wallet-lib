# API Error Handling

Error semantics differ by backend. No centralized error classification.

## Nano API

Two custom error types in `src/api/nano.ts`:

- `NanoRequestError` — generic request failures
- `NanoRequest404Error` — contract not found (404 status)

Both take `(message, originalError, axiosResponse)`.

## Wallet Service API

- Checks `response.data.success` inside 200 responses — some endpoints return error info in 200s
- Guard function `_txNotFoundGuard()` checks error message strings
- Throws `WalletRequestError` for failures

## Fullnode API (legacy)

- Callback pattern: `.then(resolve, reject)` — errors propagated via `Promise.reject(res)`
- No custom error types — raw axios errors

## Timeout stratification

| Endpoint type | Timeout | Constant |
|---------------|---------|----------|
| Default | 10,000ms | `TIMEOUT` |
| Send tokens | 300,000ms | `SEND_TOKENS_TIMEOUT` |
| Select outputs | 60,000ms | `SELECT_OUTPUTS_TIMEOUT` |
| Async methods | No explicit timeout | Axios default |

> **[QUESTION]** Why don't async methods set explicit timeouts like callback methods do?
> **[BEST GUESS]** The async pattern was introduced later and the timeout propagation from callback factories wasn't replicated. Likely oversight during migration.
