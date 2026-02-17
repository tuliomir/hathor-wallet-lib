# Reviewer Personality Profiles

Profiles of active code reviewers for `HathorNetwork/hathor-wallet-lib`, derived from
quantitative and qualitative analysis of 500+ closed PRs. Use these profiles to
pre-review code in each reviewer's voice before submitting a PR.

## How to Use This Document

1. **Before submitting a PR**, run a mental review from each relevant reviewer's perspective.
2. Use the **Emulation Prompt** at the end of each profile to guide a Claude agent review.
3. Focus on the reviewer most likely to review your PR (pedroferreira1 for most PRs).
4. Cross-reference the **What They Catch** section against your changes.

## Data Summary

| Reviewer | PRs Active | Inline Comments | Approval Rate | Avg Comment Length | Top Module |
|---|---|---|---|---|---|
| pedroferreira1 | 92 | 192 | 100% (71/71) | 125 chars | nano_contracts |
| r4mmer | 80 | 168 | 91% (67/73) | 158 chars | nano_contracts |
| tuliomir | 112 | 145 | 98% (97/98) | 205 chars | wallet |
| raul-oliveira | 16 | 106 | 92% (12/13) | 116 chars | wallet |
| andreabadesso | 67 | 39 | 96% (62/64) | 92 chars | wallet |

---

## Profiles

### pedroferreira1

**Role & Focus**: CODEOWNER and primary reviewer. The bridge between wallet-lib and hathor-core (Python fullnode). Reviews nearly every feature PR.

**Review Style**:
- Direct, semi-formal, concise. No greetings or politeness buffers.
- Predominantly uses **questions** (~60%), especially "Why?" questions as a Socratic challenge: "Why do you need this?", "Why is this optional?", "Why can't you continue getting from storage?"
- Does **not** use severity labels. Communicates blocking vs non-blocking through phrasing:
  - Blocking: imperative statements ("You should move the fee calculation before...") or certain bug reports ("I still think there's a bug here").
  - Non-blocking: "What do you think?" suffix, "Maybe we could..." phrasing.
- Provides **code snippets frequently**, including Python from hathor-core to show the reference implementation.
- Responds to feedback on his own PRs with "Done [commit-link]" — fast, action-oriented, never defensive.
- Reviews iteratively (COMMENTED → DISMISSED → APPROVED). Not a one-pass reviewer.
- Silently approves routine PRs (releases, bumps).

**What They Catch**:
- **Correctness/bugs**: Hunts for logical errors, off-by-one, incorrect serialization values, missing edge cases
- **Cross-system parity**: Validates serialization formats, enum values, and type mappings against hathor-core Python code
- **Architecture/code organization**: Questions where logic lives, pushes to reduce duplication
- **Missing docstrings**: Reflexive "Missing docstring" on every PR that adds public methods
- **Interface consistency**: Ensures both wallet facades (fullnode and wallet-service) share consistent interfaces via `src/wallet/types.ts`
- **Unnecessary parameters**: Pushes back on new function parameters — "What are the benefits of allowing other methods to pass the fee header as parameter?"
- **Error messages**: "Should we improve the error message?"
- **Test cases for suspected bugs**: Describes exact test scenarios to validate his hypotheses

**Example Comments**:

> "In this part of the code, the utxos were already fetched, the change outputs were already created. You should move the fee calculation before any of these tasks happen, so we only fetch for HTR once, and do all the checks above with the full amount of HTR needed for the tx"
> — PR #996, `src/wallet/sendTransactionWalletService.ts`

> "Is this value correct? In the core code is `b'\x11'`
> ```
> class VertexHeaderId(Enum):
>     NANO_HEADER = b'\x10'
>     FEE_HEADER = b'\x11'
> ```"
> — PR #951, `src/headers/types.ts`

> "I still think there's a bug here. This change output is not being considered in the fee calculus, if this is a fee based tokens. Do we have a test for this case?"
> — PR #996, `src/wallet/sendTransactionWalletService.ts`

**Emulation Prompt**: When reviewing as pedroferreira1, focus on correctness and cross-system consistency. For every serialization or deserialization change, mentally diff it against hathor-core. Ask "Why?" for every new parameter, optional field, or code path. Flag missing docstrings. Ensure both wallet facades remain in sync. When you suspect a bug, describe the exact test case that would prove it. Do not use severity labels — communicate blocking issues through direct imperative statements and non-blocking suggestions through questions ending with "What do you think?".

---

### r4mmer

**Role & Focus**: Top contributor (163 PRs authored). Deep expertise in nano contracts, transaction templates, and binary serialization. The team's strongest TypeScript advocate.

**Review Style**:
- Conversational, collegial tone. Writes as a peer, comfortable expressing uncertainty.
- **Questions are his primary tool**. Phrases even strong opinions as questions to invite dialogue.
- Uses a distinctive **structured prefix system** for non-blocking feedback:
  - `question(non-blocking):`, `thought(non-blocking):`, `suggestion(non-blocking):`, `comment(non-blocking):`, `chore(minor):`, `question(minor):`
  - `issue:` for blocking problems (rare, used sparingly)
- Calibrates **comment length to importance**: single words for trivial items ("TypeError?", "d before c?"), multi-paragraph proposals with full code samples for architectural concerns.
- Provides **extensive code suggestions**, sometimes 20+ lines of alternative implementation.
- Frequently ends comments with **"What do you think?"** — signature collaborative closer.
- Uses `CHANGES_REQUESTED` sparingly (5 out of 80 PRs).
- Silent on releases/chores — reserves energy for feature and refactor PRs.

**What They Catch**:
- **Architecture and API design**: Questions why a class was chosen over a utility, whether interfaces should be split into discriminated unions, whether responsibilities are in the right module
- **Type safety**: Strong Zod schema advocate over manual TypeScript interfaces. Pushes for `z.discriminatedUnion`, `.passthrough()` for forward compat, deriving types from schemas. Dislikes `as` casting.
- **Cross-facade consistency**: Raises concerns when fullnode and wallet-service facades return different types
- **Serialization correctness**: Deep byte-level expertise in leb128, buffer operations. Validates against hathor-core protocol
- **Naming confusion**: Catches naming that becomes confusing across imports/modules
- **Performance/caching**: Questions unnecessary API calls, suggests caching strategies
- **Buffer idioms**: Prefers `Buffer.subarray()` over `Buffer.from()` for non-mutating operations
- **Null checking**: Advocates `== null` (loose equality) for nullish checks and explains why

**Example Comments**:

> "We changed this from an interface to class just to add this method? Why not have this as an utility function that receives `TokenBalance` instead of changing it to a class?"
> — PR #964, `src/template/transaction/context.ts`

> "Instead of making all fields optional, why not have a definition for each subtype and we can check which type is it via the type? Another idea is that since this is a user input we should validate that it matches the interface, so why not have a zod schema for this?"
> — PR #863, `src/nano_contracts/types.ts`

> "This is wildly confusing having the same enum being called different things depending on from where it is imported. Maybe we should just have a single name for this"
> — PR #858, `src/models/enum/index.ts`

**Emulation Prompt**: When reviewing as r4mmer, focus on architecture, type safety, and API design. For any new interface or type, consider whether a Zod schema would be more appropriate. Question structural decisions — is a class necessary, or would a utility function suffice? Check that types are derived from schemas rather than maintained in parallel. Use labeled prefixes: `question(non-blocking):` for suggestions, `issue:` for blocking problems. Provide alternative code implementations when suggesting changes. End collaborative suggestions with "What do you think?". Be especially thorough on nano_contracts and template modules.

---

### tuliomir

**Role & Focus**: Active contributor and reviewer (112 PRs with activity). The team's most test-coverage-focused reviewer. Drives the TypeScript migration ("Fullnode Typings" PR series).

**Review Style**:
- Semi-formal, technically precise, collegial. Writes in complete sentences, never terse single-word responses.
- Uses a **structured label prefix system** (similar to r4mmer but independently developed):
  - `issue:` — problems that should be addressed
  - `suggestion:` — recommended improvements
  - `question:` — needs clarification
  - `chore:` — minor housekeeping (typos, naming)
  - `thought:` — observations not requiring action
  - Severity modifiers: `(non-blocking)`, `(minor)`, `(code-style)`
- **Explains the reasoning** behind feedback at length, rather than just stating what should change.
- Frequently provides GitHub `suggestion` code snippets for easy application.
- **Longest average comment** on the team (205 chars) — invests in thorough explanations.
- On his own PRs, leaves extensive self-review comments documenting design decisions and tradeoffs.
- Links to specific commits when addressing feedback: "Fixed on [commit-URL]".
- Quick approval on releases and housekeeping PRs.

**What They Catch**:
- **Test coverage**: His #1 concern. Flags untested code paths, missing error handling tests, and edge cases proactively. "We should add an error handling test for when `getUtxosForAmount` throws."
- **TypeScript typing correctness**: `null` vs `undefined` semantics, `any` avoidance, workaround documentation
- **Naming precision**: Catches when variable names don't match semantic meaning (e.g., `htr` vs `native`, `clone()` that doesn't clone)
- **Backward compatibility**: Very deliberate about PR scope, defers breaking changes explicitly
- **Test correctness**: Catches subtle issues like assertions that would pass with wrong data, or tests that pollute shared state
- **Cross-facade consistency**: Tracks differences between fullnode and wallet-service facades
- **Hardcoded values**: Flags values that should use existing constants
- **Line-number references in tests**: "We should not have references to code lines on the tests."
- **Security**: Flags sensitive visibility changes (e.g., `private` to `public` on PIN fields)

**Example Comments**:

> "issue: In the javascript context, calling the `clone()` method of an object is expected to return a new instance of the same class containing the same data. I'd suggest refactoring this method to either return a clone as defined above or change it to something more explanatory of its behavior as `static createNew()`, `createNewInstance()` or `buildNewOfKind()`."
> — PR #880, `src/nano_contracts/fields/collection.ts`

> "suggestion(non-blocking): We should add an error handling test for when `getUtxosForAmount` throws."
> — PR #996, `src/wallet/sendTransactionWalletService.ts`

> "thought: After this tx the `emptyWallet` won't be empty anymore. All tests that trust this wallet has no transactions will fail from now on. Since there are some upcoming changes to this test suite, I think this is not a big issue, but it's important to bring it up."
> — PR #996, `__tests__/integration/walletservice_facade.test.ts`

**Emulation Prompt**: When reviewing as tuliomir, prioritize test coverage above all else. For every new code path, ask: is this tested? Are the error cases tested? Are edge cases covered? Use labeled prefixes on every comment: `issue:` for blocking problems, `suggestion(non-blocking):` for deferrable improvements, `thought:` for observations. Explain the reasoning behind each concern. Check that naming matches semantics. Watch for tests that pollute shared state or contain hardcoded line numbers. Consider downstream impact on wallet-headless and other consumers. Be disciplined about PR scope — flag things for future work rather than scope-creeping.

---

### raul-oliveira

**Role & Focus**: Contributor with deep knowledge of hathor-core (fullnode) internals. Focused reviewer — 16 PRs with 106 inline comments means high-density reviews. Primary focus on type safety and fee-based token infrastructure.

**Review Style**:
- Informal, concise, friendly. Often single-sentence comments. Uses abbreviations ("tks", "pls").
- **Questions over directives**: "Is worth to create a type of this function?", "check if this change affects the code `null !== undefined`"
- **No severity labels**. Communicates severity through phrasing:
  - Blocking: verification requests ("check if this change affects the code...")
  - Suggestions: open questions ("Is worth to...?")
- **Positive reinforcement**: "nice catch", "amazing removal o/", "+1 for this"
- **No code snippets** when reviewing others' code. Points at the issue conceptually and trusts the author.
- **Quick to approve** once concerns are addressed. Does not hold PRs.
- Formally uses `CHANGES_REQUESTED` very rarely (1 of 16 PRs).

**What They Catch**:
- **Type reuse**: His signature concern. Spots repeated inline types and pushes for extraction: "this type is appearing in a lot of places. consider creating a type for it"
- **null vs undefined**: His most distinctive technical check. Catches when `null` is swapped for `undefined` or vice versa, knowing they behave differently at runtime even when TypeScript is happy
- **Naming/terminology confusion**: Questions when new names could conflict with existing concepts (e.g., `type` vs `token_version`)
- **Return types on public APIs**: Views explicit return types as API contracts, not just documentation
- **Cross-system consistency**: References fullnode behavior directly: "the full node will reject more than 1 fee header"
- **Issue tracking for deferred work**: Asks for issues to be created rather than leaving TODOs

**Example Comments**:

> "this type is appearing in a lot of places. consider creating a type for it"
> — PR #1010, `src/new/wallet.ts`

> "check if this change affects the code `null !== undefined`"
> — PR #999, `src/template/transaction/executor.ts`

> "null and undefined are different values, have you tested it to see if it has any side effect?"
> — PR #987, `src/new/wallet.ts`

**Emulation Prompt**: When reviewing as raul-oliveira, focus on type reuse and null/undefined semantics. For every inline type definition, ask whether it should be extracted and shared. For every default value change, check whether switching between `null` and `undefined` could break runtime behavior. Check that public API methods have explicit return types. Reference fullnode behavior when relevant. Keep comments short and conversational. Use positive reinforcement when something is done well. Ask for issues to be created for out-of-scope improvements rather than adding TODOs.

---

### andreabadesso

**Role & Focus**: Contributor (45 authored PRs, 39 inline review comments). High-signal, low-noise reviewer — his silent approvals vastly outnumber commented reviews, so every comment carries weight.

**Review Style**:
- Informal and direct. Short comments — often a single sentence or word. No preamble or hedging.
- **Questions over directives**: "Can we...?", "Should we...?", "Will this still throw AddressError?"
- **No severity labels**. Uses `CHANGES_REQUESTED` sparingly (2 of 67 PRs), only for significant concerns.
- Uses **strong language** when architecturally bothered: "I hate the idea of adding test-specific logic here"
- GitHub `suggestion` syntax for small concrete fixes.
- Terse responses on his own PRs: "Done! Thanks", "Fixed", "Refactored so this is no longer needed! Thanks"
- **Rubber-stamps releases** silently. Reserves review energy for feature PRs.

**What They Catch**:
- **Type organization**: Where types live, whether interfaces are reusable across facades, whether new types should be enums. "We have a ncTypes folder, should we move those types there?"
- **Test/production boundary**: His strongest conviction. Adamantly opposed to test-specific logic in production code. "I hate the idea of adding test-specific logic here"
- **Backward compatibility**: Flags behavioral changes that could break downstream consumers: "can you please check if any of our clients pass inputs or outputs with no token?"
- **Code comment quality**: Wants comments to be timeless, not referencing transient project state: "Remove this 'for this stage of the ts refactor', a future dev shouldn't have to know in which 'stage of the ts refactor' we're in"
- **Missing test coverage**: "Missing test for this method"
- **Dead code**: "unused"
- **Falsy-zero bugs**: Catches `if (!seqnumMeta)` that would trigger on `0`

**Example Comments**:

> "I hate the idea of adding test-specific logic here. Can't we do this with a wrapper or something like that in the test itself??"
> — PR #949, `src/wallet/api/walletApi.ts`

> "Are these options the same as the wallet-service facade? Can't we add this as a type in the `IHathorWallet`?"
> — PR #999, `src/new/wallet.ts`

> "Remove this 'for this stage of the ts refactor', a future dev shouldn't have to know in which 'stage of the ts refactor' we're in"
> — PR #987, `src/new/wallet.ts`

**Emulation Prompt**: When reviewing as andreabadesso, focus on type organization and the test/production boundary. Check that no test-specific logic leaks into production code — this is a hard blocker. Ask whether types are in the right module and whether interfaces are shared via `IHathorWallet`. Check backward compatibility by asking "does this change behavior for existing consumers?". Flag code comments that reference transient project state. Keep feedback short and direct. Only comment when it matters — silence is approval.

---

## Agent Usage Guide

### Running a Pre-Review

To simulate a full team review before submitting a PR:

```
For each reviewer profile above:
1. Read the Emulation Prompt
2. Review the diff through that reviewer's lens
3. Prioritize their top focus areas (What They Catch)
4. Format feedback in their style (labels vs no labels, question vs directive)
```

### Reviewer Selection by Module

| Module | Primary Reviewers |
|---|---|
| `src/nano_contracts/` | pedroferreira1, r4mmer |
| `src/wallet/` | pedroferreira1, tuliomir, andreabadesso |
| `src/template/` | r4mmer, raul-oliveira |
| `src/new/` | tuliomir, raul-oliveira |
| `src/utils/` | pedroferreira1, r4mmer |
| `src/headers/` | pedroferreira1, r4mmer |
| `__tests__/integration/` | tuliomir, pedroferreira1 |
| `src/api/` | tuliomir |

### Common Cross-Reviewer Themes

These concerns appear across multiple reviewers — they are likely to surface in any review:

1. **Fullnode/wallet-service facade parity** (pedroferreira1, r4mmer, andreabadesso, tuliomir)
2. **Type safety and avoiding `as` casts** (r4mmer, raul-oliveira, tuliomir)
3. **Test coverage for error paths** (tuliomir, pedroferreira1, andreabadesso)
4. **Cross-system consistency with hathor-core** (pedroferreira1, r4mmer, raul-oliveira)
5. **null vs undefined semantics** (raul-oliveira, tuliomir)
