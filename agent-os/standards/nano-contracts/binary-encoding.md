# Nano Contract Binary Encoding

## Header format

```
[1B: NANO_HEADER ID]
[32B: NC ID (hex)]
[leb128: seqnum]
[1B: method name length]
[NB: method name (ASCII only)]
[2B: args length (unsigned big-endian, NOT leb128)]
[NB: args buffer]
[1B: actions count]
  Per action:
    [1B: action type (1-4)]
    [1B: token index]
    [variable: amount via outputValueToBytes]
[25B: caller address]
[leb128: script length (max 2 bytes)]
[NB: script (omitted during sighash)]
```

## Key constraints

- Method names: ASCII only, max 255 chars (1-byte length prefix)
- Args buffer: max 65535 bytes (2-byte length prefix)
- During sighash computation, script is always encoded as length-0

## Arguments encoding

```
[leb128: arg count][arg1 bytes][arg2 bytes]...
```

Count always encoded, even for zero args.

## Action type mapping

| String (user-facing) | Numeric (wire) |
|---------------------|----------------|
| `deposit` | 1 |
| `withdrawal` | 2 |
| `grant_authority` | 3 |
| `acquire_authority` | 4 |

Token index = position in tx's token list (not global ID).
