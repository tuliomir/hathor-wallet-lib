# Dual Backend Storage

## IStore interface

`Storage` class wraps an `IStore` interface, enabling pluggable backends.

- `MemoryStore` — in-memory implementation for fullnode direct connections
- LevelDB-based stores — persistent storage (in `storage/leveldb/` subdirectory)
- Default singleton: `new Storage(new MemoryStore())` in `src/storage/index.ts`

## Wallet-Service Proxy

`WalletServiceStorageProxy` intercepts storage method calls and delegates to wallet-service API:

- `getAddressInfo()`, `getTx()`, `getCurrentAddress()` → wallet-service HTTP calls
- Converts `FullNodeTxResponse` format to `IHistoryTx` format
- Allows nano contract signing via wallet-service without fullnode

## Metadata lifecycle

Metadata is **reset before each full history processing** (`cleanMetadata()`):

- Prevents stale data from voided transactions
- `processHistory()` is additive — recalculates everything from scratch
- History ordering uses `<uint32hex_timestamp>:<txId>` string keys for lexicographic sort

## Async generators

All large collection access uses `async *` generators to avoid loading entire collections in memory:

```typescript
async *getAllAddresses(): AsyncGenerator<IAddressInfo & IAddressMetadata>
```
