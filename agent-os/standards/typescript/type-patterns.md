# Type Patterns

## Central types file

`src/types.ts` is the central type definitions file. Check here first for core interfaces.

## OutputValueType

`OutputValueType = bigint` — universal for balance, authorities, fees. Never `number`.

## Discriminated unions

`IDataOutput` uses `.type` field as discriminator:

- Variants: `data`, `p2pkh`, `p2sh`, `mint`, `melt`
- Create token outputs lack `.token` field — marked with `AuthorityType` enum

## Authority representation

`IAuthoritiesBalance = { mint: ITokenBalance, melt: ITokenBalance }`

Each authority stored as locked/unlocked count (integer count, not token amount).

## Balance structure

`IBalance` includes both token balance and authorities balance. Transaction deltas include both positive (outputs) and negative (inputs) flows.

## Address format

Fixed 25 bytes: `[1B version][20B hash][4B checksum]`

- Checksum: first 4 bytes of `sha256(sha256(version + hash))`
- Version byte is network-specific (mainnet: p2pkh=0x28, p2sh=0x64; testnet: p2pkh=0x49, p2sh=0x87)

## Derivation paths

| Wallet type | Path |
|-------------|------|
| P2PKH | `m/44'/280'/0'` |
| P2SH MultiSig | `m/45'/280'/0'` |
| Wallet Service Auth | `m/280'/280'` |

Hathor BIP44 coin code: 280.
