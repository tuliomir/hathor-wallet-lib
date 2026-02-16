# Buffer Encoding Patterns

## Output value encoding

4-byte or 8-byte decision based on value magnitude:

- Values fitting in signed 32-bit → 4 bytes
- Values requiring 64-bit → 8 bytes (high byte sign bit detection)
- Negative output values: throw `OutputValueError`

Reading: `bytesToOutputValue()` checks high byte sign to determine encoding.

## BigInt operations

- `bigIntToBytes()`: validates 4B or 8B size, uses `DataView.setBigInt64()`
- `unpackToBigInt()`: uses `readBigInt64BE()` / `readBigUInt64BE()`
- `OutputValueType = bigint` everywhere (never `number` at type level)

## LEB128 variable-length encoding

Used throughout nano contracts for counts, lengths, seqnum:

- 7-bit chunks with continuation bit
- Signed variant: checks bit 6 for sign extension
- `maxBytes` parameter enforces encoding limits
- Imported from `src/utils/leb128.ts`

## Buffer immutability convention

All deserialization methods clone input buffer before consuming:

```typescript
let inputBuffer = _.clone(buf);
```

Combined with tuple-return pattern `[value, remainingBuffer]`, ensures callers' buffers are never mutated.

## String encoding

- Token name/symbol: UTF-8 with length prefix
- Hex strings: used for tx hashes, token UIDs
- No consistent scheme — context-dependent
