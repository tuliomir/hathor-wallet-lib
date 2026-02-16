# Serialization Patterns

## Tuple-Destructuring Deserialization

All binary deserialization returns `[parsedObject, remainingBuffer]` tuples:

```typescript
static createFromBytes(buf: Buffer): [Input, Buffer]
static createFromBytes(buf: Buffer, network: Network): [Output, Buffer]
```

- Each method clones input buffer (via `_.clone()`) before consuming
- Allows chaining: `txBuffer = tx.getFundsFieldsFromBytes(txBuffer, network)`
- State machine consuming pattern — tracks position via returned buffer, not internal state

## Wire Format Fidelity

Serialization order directly mirrors fullnode wire format:

```
[signal bits: 1B][version: 1B][len tokens: 1B]
[len inputs + len outputs][tokens array][inputs][outputs]
```

Any change to serialization order breaks wire format compatibility.

## CreateTokenTransaction Variant

Extends Transaction but has DIFFERENT serialization order:
- Overrides `serializeFundsFields()` (no tokens array)
- Adds `serializeTokenInfo()` (name + symbol as UTF-8 with length prefix)

Works because `createFromBytes()` parses in exact same order as serialization.

## Signing Data Cache

`Transaction._dataToSignCache` is lazy-loaded, never invalidated. Assumes transaction objects are immutable after first `getDataToSign()` call. Critical for multi-input transactions where all inputs sign identical data.
