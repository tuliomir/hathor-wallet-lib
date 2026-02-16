# Configuration Singleton

## Dual singleton architecture

- `Config` instance: `src/config.ts` (line 298, exports default singleton)
- `ExtendedNetwork`: `src/network.ts` wraps Config for reverse compatibility

## Bidirectional sync (known issue)

- `Config.setNetwork()` calls `networkInstance.setNetwork()`
- `Network.setNetwork()` calls `config.setNetwork()`
- `skipConfig` flag prevents infinite loop
- TODO documented in code: refactor to single source of truth

## Lazy URL resolution

`getTxMiningUrl()` falls back to network-based URL if not explicitly set. Throws if network unknown.

## Network version bytes

```typescript
mainnet:    { p2pkh: 0x28, p2sh: 0x64 }
testnet:    { p2pkh: 0x49, p2sh: 0x87 }
privatenet: { p2pkh: 0x49, p2sh: 0x87 }  // Same as testnet
```

- xpub bytes: same across all networks (0x0488b21e)
- Private key WIF prefix: universal (0x80)
- Networks registered in bitcore-lib with Hathor-specific overrides
