# Review Standards

Resolve open questions left by `/auto-discover-standards` in a focused interactive session.

## Important Guidelines

- **Always use AskUserQuestion tool** when presenting questions to the user
- **Show context** — Present the surrounding standard content so the user can answer quickly
- **Group by file** — Process all questions in one file before moving to the next
- **Update in place** — Replace the blockquote with confirmed text, don't create new files

## Process

### Step 1: Find Open Questions

1. Search all `.md` files in `agent-os/standards/` for `[QUESTION]` markers
2. If no questions found:
   ```
   No open questions found in agent-os/standards/.
   All standards are fully confirmed.
   ```
   Stop here.

3. Build a list grouped by file:
   ```
   Found 4 open questions across 3 files:
   - agent-os/standards/api/response-handling.md (1 question)
   - agent-os/standards/global/naming.md (2 questions)
   - agent-os/standards/testing/mocking.md (1 question)

   Let's resolve them one at a time.
   ```

### Step 2: Present Questions One at a Time

For each file with questions:

1. Read the file
2. For each `[QUESTION]` + `[BEST GUESS]` blockquote pair in the file:

   a. Show the surrounding context (the rule the question relates to) and the question itself:
   ```
   File: api/response-handling.md

   Context:
   > All API methods return unwrapped response data, not the axios response object.
   > - Callers receive `response.data` directly

   Question: Why unwrap at the API layer rather than letting callers access headers/status?
   Best guess: Simplifies caller code since 95%+ of callers only need the data. The few cases needing headers (pagination?) likely have dedicated helpers.
   ```

   b. Use AskUserQuestion with options:
   ```
   How should we resolve this?

   Options:
   - "Best guess is correct" — Confirm the hypothesis and fold it into the standard
   - "Correct with edits" — The guess is close but needs adjustment (provide your version)
   - "Replace with" — The guess is wrong, here's the real reason
   - "Remove question" — This doesn't need a "why", just remove the blockquote
   ```

   c. Wait for user response before proceeding

### Step 3: Update the Standard File

Based on the user's response:

**If "Best guess is correct":**
- Remove the blockquote entirely
- Optionally add a concise "why" line derived from the best guess, if it adds value:
  ```markdown
  - Callers receive `response.data` directly
  - Why: simplifies callers — 95%+ only need the data payload
  ```

**If "Correct with edits" or "Replace with":**
- Remove the blockquote
- Incorporate the user's answer as a concise "why" line or note

**If "Remove question":**
- Remove the blockquote entirely, add nothing

Write the updated file immediately after each question is resolved.

### Step 4: Repeat for All Files

Continue through all files and all questions within each file.

### Step 5: Update the Index

After all questions are resolved:

1. Re-scan all standard files for any remaining `[QUESTION]` markers
2. Read `agent-os/standards/index.yml`
3. Update `has_questions` flags:
   - Remove `has_questions: true` from entries with no remaining questions
   - Keep `has_questions: true` for any file that still has unresolved questions
4. Write the updated index

### Step 6: Summary

```
Review complete.

Resolved: 4 questions across 3 files
Remaining: 0 open questions

Updated files:
- agent-os/standards/api/response-handling.md
- agent-os/standards/global/naming.md
- agent-os/standards/testing/mocking.md

All standards are now fully confirmed.
```

If any questions remain (user chose to skip some):
```
Review complete.

Resolved: 3 of 4 questions
Remaining: 1 open question in:
- agent-os/standards/testing/mocking.md

Run /review-standards again to resolve remaining questions.
```

## Output

Updates existing files in `agent-os/standards/` in place.
Updates `agent-os/standards/index.yml` (removes `has_questions` flags as questions are resolved).
