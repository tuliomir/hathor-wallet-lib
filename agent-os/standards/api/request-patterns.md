# Request Patterns

Two coexisting paradigms — legacy callback-based and modern async/await.

## Legacy (callback)

```typescript
getTransactionBase(data, resolve, schema?) {
  return createRequestInstance(resolve)
    .get(`transaction`, { params: data })
    .then(res => { resolve(res.data); }, res => Promise.reject(res));
}
```

- `resolve` callback passed to `createRequestInstance` — **intentionally unused** (see `axiosWrapper.ts` XXX comment)
- Was designed for retry support that was never implemented
- Returns `Promise<void>` despite having callback
- Cannot use async/await with this pattern

## Modern (async/await)

```typescript
async getNanoContractState(...): Promise<NanoContractStateAPIResponse> {
  const axiosInstance = await createRequestInstance();
  const response = await axiosInstance.get(...);
  if (response.status === 200 && responseData.success) return responseData;
  throw new NanoRequestError(...);
}
```

- Status checking inside methods, not in interceptors
- Custom error types per domain (NanoRequestError, WalletRequestError)

## Rules

- New code: always use async/await pattern
- Never rely on the `resolve` parameter in `createRequestInstance` — it's dead code
- Some endpoints have both GET and POST variants (e.g., `getAddressHistoryForAwait` vs `getAddressHistoryForAwaitPOST`) — POST exists for large address arrays that exceed URI length limits
