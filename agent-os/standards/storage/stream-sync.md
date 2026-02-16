# Stream Synchronization

`StreamManager` extends `AbortController` — it IS the abort mechanism for the sync process.

## Flow control

- Window-based: `MAX_WINDOW_SIZE = 600` addresses
- Batch generation: `ADDRESSES_PER_MESSAGE = 40` per WebSocket message
- Distance-based: sends next batch when `lastLoadedIndex - lastReceivedIndex` drops

## Backpressure (ACK strategy)

```typescript
shouldACK(): boolean {
  return (
    !this.hasReceivedEndStream &&
    !this.signal.aborted &&
    this.lastSeenSeq - this.lastAcked > minSize &&
    this.lastProcSeq - this.lastAcked > minSize &&
    this.itemQueue.size() <= minSize
  );
}
```

Requires BOTH received AND processed sequences ahead by half-window. Prevents fullnode from overwhelming client.

## Cooperative scheduling

Uses `queueMicrotask()` after each item to yield to IO (WebSocket events):

```typescript
await new Promise<void>(resolve => { queueMicrotask(resolve); });
```

## Concurrency limits

Global Load Limiter (`GLL`): singleton `PromiseQueue` limiting concurrent address loading to 3.

## Connection locking

Only ONE stream per connection. `lockStream()` returns boolean — must acquire lock before starting.

## Graceful shutdown

10-second timeout (`QUEUE_GRACEFUL_SHUTDOWN_LIMIT`). Checks every 100ms. Finally block always calls `abort()`.
