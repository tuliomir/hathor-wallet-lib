# Script Type Identification

Script types are identified by exact byte length and opcode sequence — no type tag.

## P2PKH

- 25 bytes (no timelock) or 31 bytes (with timelock)
- Timelock prefix: `[1B length][4B timestamp][OP_GREATERTHAN_TIMESTAMP]`
- Body: `OP_DUP OP_HASH160 [1B:20] [20B address] OP_EQUALVERIFY OP_CHECKSIG`

## P2SH

- 23 bytes (no timelock) or 29 bytes (with timelock)
- Same timelock prefix as P2PKH
- Body: `OP_HASH160 [1B:20] [20B address] OP_EQUAL`

## Script Data

- Last byte must be `OP_CHECKSIG`
- Fallback when P2PKH and P2SH don't match

## Parsing chain

`parseScript()` tries P2PKH -> P2SH -> ScriptData, returns `null` on unrecognized. Requires Network context for address version byte validation.

## OP_PUSHDATA1 threshold

Data > 75 bytes uses `OP_PUSHDATA1` prefix (next byte = length). At or below 75 bytes, length is direct.
