# Auto-Discover Standards

Extract tribal knowledge from your codebase into documented standards — fully autonomous, no human interaction required.

## Important Guidelines

- **Never call AskUserQuestion** — this command runs fully unattended
- **Write concise standards** — Use minimal words. Standards must be scannable by AI agents without bloating context windows.
- **Make autonomous decisions** — When uncertain, document the uncertainty as a `[QUESTION]` blockquote rather than blocking
- **Write standards incrementally** — Create each standard file as soon as it's drafted, before moving to the next area (keeps context window manageable)

## Question Format

When you encounter a pattern where the "why" is unclear, embed a question blockquote:

```markdown
> **[QUESTION]** Why is this pattern used instead of [alternative]?
> **[BEST GUESS]** [Your hypothesis based on codebase evidence]
```

Rules:
- Always pair `[QUESTION]` with `[BEST GUESS]` — the human should confirm or correct, not answer from scratch
- Place questions inline, immediately after the rule they relate to
- Keep questions specific — "Why snake_case in API responses?" not "Why this style?"
- Base your best guess on evidence from the code (comments, git history, related patterns)

## Process

### Step 1: Identify All Focus Areas

Analyze the codebase to dynamically identify areas worth documenting:

1. Scan the directory structure — folders, file types, nesting depth, file counts
2. Read key configuration files (package.json, tsconfig, eslint, etc.)
3. Build a list of candidate areas. Typical areas include:
   - **Code organization** — File structure, module boundaries, import patterns
   - **API layer** — HTTP clients, request/response patterns, error handling
   - **Data models** — Type definitions, class hierarchies, serialization
   - **Storage/persistence** — Data access patterns, caching strategies
   - **Testing** — Test structure, mocking patterns, fixtures
   - **Build & tooling** — Build pipeline, linting, formatting conventions
   - **Naming conventions** — Variables, files, classes, constants
   - **Error handling** — Error classes, propagation patterns, error codes
   - Any other area with 3+ files showing consistent non-obvious patterns

4. Order areas from most foundational to most specific (e.g., naming conventions before API patterns)

5. Output the area list before proceeding:
```
Identified areas to scan:
1. Code organization (src/ structure, module boundaries)
2. API layer (src/api/, src/wallet/api/)
3. Data models (src/models/, src/types.ts)
...

Starting autonomous discovery.
```

### Step 2: Analyze Each Area

For each area, in order:

1. Read 5-10 representative files in that area
2. Look for patterns that are:
   - **Unusual or unconventional** — Not standard framework/library patterns
   - **Opinionated** — Specific choices that could have gone differently
   - **Tribal** — Things a new developer wouldn't know without being told
   - **Consistent** — Patterns repeated across multiple files
3. Skip patterns that are:
   - Standard language/framework defaults (e.g., "uses ES modules")
   - Already documented in CLAUDE.md, README, or config files
   - One-off occurrences that aren't actually patterns
4. Collect the non-trivial patterns found in this area

If no non-trivial patterns are found in an area, skip it and move on. Report:
```
Area: [name] — No non-trivial undocumented patterns found. Skipping.
```

### Step 3: Draft and Write Each Standard

For each pattern discovered in the current area:

1. Determine the appropriate folder:
   - `api/`, `database/`, `javascript/`, `typescript/`, `testing/`, `global/`, or create a new folder if none fits
2. Check if a related standard file already exists — append to it if so
3. Draft the standard content following the concise writing rules (see below)
4. For any rule where the "why" is unclear, embed a `[QUESTION]` + `[BEST GUESS]` blockquote
5. **Write the file immediately** — do not batch writes

Example standard with embedded question:

```markdown
# API Response Handling

All API methods return unwrapped response data, not the axios response object.

- Callers receive `response.data` directly
- HTTP status codes are handled internally by the API layer
- Errors throw typed exceptions, never return error objects

> **[QUESTION]** Why unwrap at the API layer rather than letting callers access headers/status?
> **[BEST GUESS]** Simplifies caller code since 95%+ of callers only need the data. The few cases needing headers (pagination?) likely have dedicated helpers.
```

After writing each file, report:
```
Created: agent-os/standards/api/response-handling.md (1 question)
```

### Step 4: Repeat for All Areas

Move to the next area and repeat Steps 2-3. Later areas benefit from patterns discovered in earlier areas — reference them when relevant rather than duplicating.

Continue until all identified areas have been analyzed.

### Step 5: Rebuild the Index

After all areas are processed:

1. Scan `agent-os/standards/` for all `.md` files
2. Read each file to generate a one-sentence description
3. Check each file for `[QUESTION]` markers
4. Write `agent-os/standards/index.yml` with this structure:

```yaml
folder-name:
  file-name:
    description: Brief description here
    has_questions: true  # Only present if file contains [QUESTION] markers
```

Rules:
- Alphabetize folders, then files within each folder
- File names without `.md` extension
- `root` for files directly in `agent-os/standards/` (not in subfolders)
- One-line descriptions only
- `has_questions` field only present (and always `true`) when the file has open questions — omit entirely when no questions exist

### Step 6: Final Summary

End with a complete summary:

```
Autonomous standards discovery complete.

Files created:
- agent-os/standards/api/response-handling.md (1 question)
- agent-os/standards/api/error-codes.md (0 questions)
- agent-os/standards/global/naming.md (2 questions)
- agent-os/standards/testing/mocking.md (1 question)

Areas scanned: 8
Areas with standards: 5
Areas skipped (no patterns): 3
Total standards files: 4
Total open questions: 4

Run /review-standards to resolve all open questions in a focused session.
```

## Output Location

All standards: `agent-os/standards/[folder]/[standard].md`
Index file: `agent-os/standards/index.yml`

## Writing Concise Standards

Standards will be injected into AI context windows. Every word costs tokens. Follow these rules:

- **Lead with the rule** — State what to do first, explain why second (if needed)
- **Use code examples** — Show, don't tell
- **Skip the obvious** — Don't document what the code already makes clear
- **One standard per concept** — Don't combine unrelated patterns
- **Bullet points over paragraphs** — Scannable beats readable

**Good:**
```markdown
# Error Responses

Use error codes: `AUTH_001`, `DB_001`, `VAL_001`

\`\`\`json
{ "success": false, "error": { "code": "AUTH_001", "message": "..." } }
\`\`\`

- Always include both code and message
- Log full error server-side, return safe message to client
```

**Bad:**
```markdown
# Error Handling Guidelines

When an error occurs in our application, we have established a consistent pattern for how errors should be formatted and returned to the client. This helps maintain consistency across our API and makes it easier for frontend developers to handle errors appropriately...
[continues for 3 more paragraphs]
```

## Compatibility

- Standards files are identical in format to those created by `/discover-standards` (with added `[QUESTION]` blockquotes)
- The index uses the same structure as `/index-standards`, with an additive `has_questions` field
- `/inject-standards` works normally — it only reads `description`, ignoring `has_questions`
- `/index-standards` can be run later and will produce a clean index (without `has_questions`) — this is fine
- `/review-standards` consumes the `[QUESTION]` markers and `has_questions` flags
