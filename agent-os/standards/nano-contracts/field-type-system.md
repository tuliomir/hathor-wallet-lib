# Nano Contract Field Type System

## Field interface

All fields implement `NCFieldBase<U, T>` where U = user type, T = internal type:

- `fromBuffer(buffer): BufferROExtract<T>` — returns `{ value, bytesRead }` (callers track position)
- `toBuffer(): Buffer` — serialize
- `fromUser(data): NCFieldBase` — parse user input, mutate `.value`
- `toUser(): U` — convert to user-readable format

## Encoding table

| Type | Encoding | Size |
|------|----------|------|
| bool | Single byte | 1B fixed |
| int | LEB128 signed | 1-9B |
| Amount | LEB128 unsigned | 1-9B |
| str | `[leb128 len][utf-8 data]` | Variable |
| bytes | `[leb128 len:max 3B][data]` | Variable |
| Address | Fixed 25B (no prefix) | 25B |
| TokenUid | `0x00` (native) or `0x01 + 32B` | 1B or 33B |
| Timestamp | Signed 4B big-endian | 4B |
| bytes32 | Fixed 32B (no prefix) | 32B |

## Composite types

- **Optional**: `[0x00]` = null, `[0x01][inner data]` = present
- **Collection** (list/set/deque): `[leb128 count][elements...]`
- **Dict**: `[leb128 count][(key)(val) pairs...]`
- **Tuple**: `[element1][element2]...` (no count — fixed arity from type)
- **SignedData**: `[inner value bytes][leb128 sig_len][signature]`
- **CallerId**: `[0x00][25B address]` or `[0x01][32B contract ID]`

## Composition rule

Always call `.createNew()` on inner fields when building collections/dicts to avoid sharing state across elements.

## Type aliases

`parser.ts` normalizes: `'union[Address, ContractId]'` → `'CallerId'`. This is the ONLY alias mapping.

## Nested type parsing

Supports arbitrary nesting: `Dict[str, Dict[Address, list[int]]]`. Uses `splitTopLevel()` for bracket-aware splitting.
