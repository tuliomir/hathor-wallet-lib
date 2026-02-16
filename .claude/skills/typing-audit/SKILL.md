---
name: typing-audit
description: Audit and strengthen TypeScript types in hathor-wallet-lib modules. Scans for `any` usage, missing return types, missing parameter types. Creates refactoring plans ordered by dependency. Applies changes with per-file verification.
user_invocable: true
arguments:
  - name: action
    description: "Action to perform: scan, plan, or apply"
    required: true
  - name: module
    description: "Module to audit (e.g., utils, models, wallet, api, storage, nano_contracts). Omit for full scan."
    required: false
---

# typing-audit

Audit and strengthen TypeScript types across the codebase.

## Commands

### `/typing-audit scan [module]`

Scan for type weakness in one module or the full `src/` tree.

**What to scan for:**
1. Explicit `any` usage (grep for `: any`, `as any`, `<any>`)
2. Functions without return type annotations
3. Parameters without type annotations
4. `@ts-ignore` or `@ts-expect-error` comments
5. Type assertions that could be narrowed (`as SomeType` where `unknown` + type guard would be safer)

**Output format:**
For each file, report:
- File path
- Count of each issue type
- Severity (high = public API without types, medium = internal, low = test helpers)

Sort results by severity, then by dependency order (files depended on by many others first).

### `/typing-audit plan [module]`

Create a refactoring plan for one module. Reads the scan output and:

1. Order files by dependency (leaf files first, then files that import them)
2. For each file, list specific changes needed
3. Estimate risk level (does this file have good test coverage?)
4. Group into commits — one commit per file or small logical group

Save the plan to `knowledge/typing-plan-<module>.md`.

### `/typing-audit apply [module]`

Apply the typing plan for one module:

1. Read the plan from `knowledge/typing-plan-<module>.md`
2. For each file in the plan:
   a. Make the type changes
   b. Run `npm run format` and `npm run lint:fix` to auto-fix style
   c. Run `npm run build` — fix any type errors before proceeding
   d. After each logical group of files, run `npm test`
3. Commit each file or group:
   ```
   refactor(<module>): strengthen types for <file>
   ```
4. If build or tests fail, stop and report the issue — do not skip failures

## Important Notes

- `noImplicitAny: false` means the compiler won't catch implicit `any` — you must find them manually
- The goal is incremental improvement, not a big-bang rewrite
- Prefer `unknown` over `any` in new type annotations
- When replacing `any`, check all callers to ensure the new type is compatible
- Some `any` usage is intentional (e.g., generic storage APIs) — flag but don't blindly replace
- Always check `src/types.ts` first — it's the central type definitions file
