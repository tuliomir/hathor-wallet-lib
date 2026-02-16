# Partial Transactions

`PartialTx` is NOT a Transaction — it's a wrapper for collecting signatures in atomic swaps.

## Three classes

1. **ProposalInput** extends Input — adds `token`, `authorities`, `value`, `address` metadata
2. **ProposalOutput** extends Output — adds `token`, `isChange`, `authorities`
3. **PartialTx** — state machine wrapping ProposalInput/Output arrays

## Serialization format

```
PartialTx|hexTx|metadata:metadata|changeIndexes
```

Includes address and token for each input despite being inferrable from the transaction — needed for fullnode validation before signing.

## Signature aggregation

`PartialTxInputData` stores signatures by index:

```
PartialTxInputData|hash|0:sig1|1:sig2
```

- Multiple instances can be merged (same hash, index-keyed)
- Designed for QR code passing between participants
- `isComplete()` checks all inputs have data
- Participants with no inputs to sign submit empty arrays
