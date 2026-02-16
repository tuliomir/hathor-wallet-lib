# TokenData Bitfield Encoding

A single byte stores both authority status and token array index.

## Bit layout

```
Bit 7 (0x80): TOKEN_AUTHORITY_MASK — marks authority outputs
Bits 0-6 (0x7F): TOKEN_INDEX_MASK — token position in tx's token array
```

## Authority value flags (separate from tokenData)

```
Bit 0 (0x01): TOKEN_MINT_MASK — mint authority
Bit 1 (0x02): TOKEN_MELT_MASK — melt authority
```

## Index offset

Token index in tokenData is **+1 offset** from actual array position:

```typescript
getTokenIndex(): number {
  return (this.tokenData & TOKEN_INDEX_MASK) - 1;
}
```

## Reconstruction in PartialTx

`ProposalOutput` reconstructs tokenData from separate flags:

```typescript
(this.authorities > 0 ? TOKEN_AUTHORITY_MASK : 0) | tokenIndex
```

## Rules

- Check `isAuthority()` before reading value — authority outputs store mint/melt flags in the value field, not token amounts
- Token index 0 (stored as 1 in bitfield) = first custom token. HTR is always implicit.
