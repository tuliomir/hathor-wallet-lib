# Swap Service

Uniquely different from all other API modules. Located in two places:

- `src/swapService/swapConnection.ts` — WebSocket connection (public API)
- `src/wallet/api/swapService.ts` — HTTP utilities, encryption (internal)

## Client-side encryption

All payloads encrypted with AES before transmission:

```typescript
const aesEncryptedObject = AES.encrypt(serialized, password);
const baseEncryptedObj = CryptoJS.enc.Base64.parse(aesEncryptedObject.toString());
return CryptoJS.enc.Base64.stringify(baseEncryptedObj);
```

## Custom auth

Uses `X-Auth-Password` header with `sha256(password)` — NOT Bearer token.

## Validation

Decrypted data validated by checking for `PartialTxPrefix`. Crypto error `Malformed UTF-8 data` = wrong password.

## Rules

- Cannot be retried (password validation during decryption is one-shot)
- Only API that encrypts request/response payloads client-side
