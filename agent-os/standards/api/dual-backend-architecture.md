# Dual Backend Architecture

Three distinct HTTP backends with incompatible patterns:

## Fullnode (default)

- URL: `config.getServerUrl()`
- Timeout: 10,000ms (`TIMEOUT` constant)
- Factory: `createRequestInstance()` in `src/api/axiosInstance.ts`
- Standard axios error handling (rejects on 4xx/5xx)

## Wallet Service

- URL: `config.getWalletServiceBaseUrl()`
- Factory: `src/wallet/api/walletServiceAxios.ts`
- Custom `validateStatus: status => status >= 200 && status < 500` — treats 4xx as successes
- Bearer token auth via `wallet.validateAndRenewAuthToken()`
- Response semantics: some endpoints return `{ success: false }` inside 200 responses

> **[QUESTION]** Why does wallet-service treat 4xx as successes instead of using axios interceptors?
> **[BEST GUESS]** Some wallet-service 4xx responses (e.g., 400 for wallet-already-loaded) contain actionable data that callers need. Interceptors would lose this data by rejecting.

## Explorer Service

- URL: `config.getExplorerServiceBaseUrl(network)` — network-parameterized routing
- Factory: `src/api/explorerServiceAxios.ts`

## TX Mining

- URL: `config.getTxMiningUrl()`
- Factory: `src/api/txMiningAxios.ts`
- Optional API key via header

## Key rule

Each backend has its own axios instance factory. Never mix factories or assume shared error semantics.
