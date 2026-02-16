# Response Validation

## Zod via transformResponse

Legacy callback-based methods validate responses inside axios `transformResponse`:

```typescript
return createRequestInstance(resolve)
  .get('thin_wallet/address_history', {
    params: data,
    transformResponse: res => transformJsonBigIntResponse(res, addressHistorySchema),
  })
```

- `transformJsonBigIntResponse(data, schema)` handles both string and object inputs
- Parses JSON with BigInt preservation, then validates against Zod schema
- This is the ONLY validation layer for callback-based code

## Async code validation

Modern async methods use `parseSchema(response.data, schema)` after status checks.

## Schema exposure

Some API modules expose Zod schemas as nested objects:

```typescript
// txApi.ts
schemas: {
  transactionApi: transactionApiSchema,
}
```

Only done for `txApi` and `wallet` API modules.

## BigInt preservation

- `JSONBigInt.parse()` uses Node v22's `context` parameter in JSON.parse reviver
- Only coerces to BigInt when value is outside `Number.MIN_SAFE_INTEGER..MAX_SAFE_INTEGER`
- `bigIntCoercibleSchema` accepts number | string | bigint → outputs bigint
- Schemas use `.passthrough()` to allow fullnode API evolution without breaking
