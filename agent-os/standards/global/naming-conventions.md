# Naming Conventions

## Why camelCase is off in ESLint

`camelcase: 'off'` because fullnode API uses snake_case field names. Variables obtained from API responses retain snake_case.

Examples: `token_data`, `spent_by`, `is_voided`, `first_block`, `nc_id`

## Underscore prefix

`no-underscore-dangle: off` — underscore prefixes allowed and used for:

- Protected/private cache: `_dataToSignCache`
- Internal methods: `_txNotFoundGuard()`
- Private class fields also use `#` syntax (e.g., `PriorityQueue.#heap`)

## File naming

- Source files: `camelCase.ts` or `snake_case.ts` (mixed, no strict rule)
- Test files: `{module}.test.ts`
- Fixture files: `snake_case.js` or `snake_case.ts`
- Mock helpers: `snake_case.ts` with descriptive names

> **[QUESTION]** Is there a preferred convention between camelCase and snake_case for new source files?
> **[BEST GUESS]** No strict rule exists. Newer files tend toward camelCase (e.g., `sendTransaction.ts`, `pushNotification.ts`), while files mirroring fullnode concepts use snake_case (e.g., `create_token_transaction.ts`, `partial_tx.ts`).

## Constants

- Screaming snake case: `TOKEN_AUTHORITY_MASK`, `MAX_OUTPUT_VALUE`
- Hathor-specific prefix where needed: `HATHOR_MAGIC_BYTES`
- Native token: `NATIVE_TOKEN_UID = '00'`
