# Cryptographic Patterns

## Bitcore-lib wrapping

Hathor reuses bitcore-lib's Network and crypto primitives but overrides version bytes.

- `bitcore.Message.MAGIC_BYTES` overridden globally with `HATHOR_MAGIC_BYTES`
- xpub bytes reused across networks (same value for mainnet/testnet/privatenet)
- HDPrivateKey/HDPublicKey may lose Hathor network binding on serialize/deserialize — always pass network when converting to addresses

## PBKDF2

- Custom hasher map: explicit registration for SHA1 and SHA256
- Default iterations: 1000 (mobile performance tradeoff, documented in constants.ts)
- Throws `UnsupportedHasherError` for unknown algorithms

## Encryption

`IEncryptedData` stores: hash + salt + iterations + hasher algorithm.

- Password validated before decrypt via `validateHash()`
- CryptoJS returns empty string on failure → explicitly throws `DecryptionError`

## Wallet access data encryption

| Key | Content |
|-----|---------|
| `mainKey` | xpriv encrypted with PIN |
| `acctPathKey` | Account path xpriv (only if root key provided) |
| `authKey` | Auth derivation xpriv |
| `words` | Seed encrypted with password |

## Checksum

`sha256(sha256(data))` (double-hash) used for address checksums and token config integrity.
