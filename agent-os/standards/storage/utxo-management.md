# UTXO Management

## Selection algorithms

Two strategies in `src/utils/utxo.ts`:

- **Fast**: Greedy, linear scan, stops at target amount
- **Best**: Finds smallest single UTXO > amount, or minimizes UTXO set count (descending order)

Both return `{ utxos, amount, available? }` — `available` only on failure.

## TTL-based locking

UTXOs are marked as "selected as input" during transaction building to prevent double-spending in concurrent transactions:

```typescript
utxoSelectAsInput(utxo, markAs: true, ttl?: number)
```

- `setTimeout` auto-clears if transaction doesn't complete within TTL
- Checked during UTXO selection to skip already-selected UTXOs
- Unmarked on transaction error (atomic cleanup)

## Concurrent unlock prevention

`utxoUnlockWait` uses promise chaining (not mutex) to serialize UTXO unlock operations:

```typescript
this.utxoUnlockWait = this.utxoUnlockWait.then(() => this.processLockedUtxos(height));
```

Prevents race conditions when multiple blocks arrive simultaneously.
