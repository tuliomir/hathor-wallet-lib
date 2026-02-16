# Nano Contract Builder

## Lifecycle

1. Setter methods initialize nullable attributes, return `this` for chaining
2. `.verify()` validates state lazily (not on setter calls)
3. UTXO selection during deposit phase — UTXOs marked as selected
4. UTXOs unmarked on error (atomic cleanup)
5. Seqnum fetched AFTER building inputs/outputs (allows wallet state to settle)

## Token fee handling

When building `CreateTokenTransaction` where the contract doesn't pay the deposit fee:

- Builder augments deposit amount with HTR fees
- `tokenFeeAddedInDeposit` flag prevents double-charging in `.executeWithdrawal()`

## NC ID resolution

For non-initialize methods, `ncId` is fetched dynamically via `getBlueprintId()` to handle contracts created by other contracts. Two-stage lookup:

1. `getFullTxById(ncId)` — catches recent unconfirmed txs
2. Fallback: `getNanoContractState()` — catches contracts created by other contracts

## On-chain blueprints

Python code compressed with `zlib.deflateSync()` before serialization:

```
[1B: CodeKind.PYTHON_ZLIB = 1]
[NB: zlib-compressed Python code]
```

`OnChainBlueprint` extends Transaction (not NanoContractHeader).
