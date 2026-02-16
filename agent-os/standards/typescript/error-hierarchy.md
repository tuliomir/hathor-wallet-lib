# Error Hierarchy

## Base classes

- `WalletError` — base, wraps `errorCode` property
- `WalletRequestError` — includes `cause` for error chaining
- `SendTxError` — has inconsistent `errorData` type (string | object), acknowledged as tech debt
- `ParseError` → `ParseScriptError` — inheritance for parsing contexts

## Domain-specific errors

- `NanoRequestError`, `NanoRequest404Error` — nano contract API
- `DecryptionError` — crypto operations
- `GetWalletServiceUrlError` — thrown on first `.get()` call, not constructor (lazy init error)
- `OutputValueError` — buffer encoding for negative values
- `UnsupportedHasherError` — PBKDF2 with unknown algorithm
- `AddressError` — address validation failures

## Error codes

`errorMessages.ts` uses string literal keys as error codes for potential localization.

Magic string: `STRATUM_TIMEOUT_RETURN_CODE = 'stratum_timeout'`

## Propagation patterns

- Script parsing: silent fallback (tries P2PKH → P2SH → data → `null`)
- Crypto: CryptoJS returns empty string on failure → explicitly thrown as `DecryptionError`
- API: varies by backend (see api/error-handling standard)
