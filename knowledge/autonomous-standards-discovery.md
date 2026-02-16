# Autonomous Standards Discovery

Two-pass workflow for extracting codebase standards without requiring continuous human attention.

## Why This Exists

The interactive `/discover-standards` command requires a human to choose areas, select patterns, answer "why" questions, and confirm drafts. For a large codebase, this is a lengthy synchronous session. The autonomous approach splits this into:

1. **Discovery pass** (unattended) — Agent scans everything, documents patterns, embeds questions
2. **Review pass** (focused) — Human resolves all questions in one short session

## Commands

| Command | Mode | Purpose |
|---------|------|---------|
| `/auto-discover-standards` | Autonomous | Scans all areas, writes standards, embeds questions |
| `/review-standards` | Interactive | Presents open questions, updates standards in place |
| `/discover-standards` | Interactive | Original command — one area at a time with human guidance |

## When to Use Which

**Use `/auto-discover-standards`** when:
- Starting standards from scratch on a codebase with no existing standards
- You want to capture patterns across the entire codebase in one pass
- You're comfortable reviewing and correcting the agent's work after the fact

**Use `/discover-standards`** when:
- You want to focus on a single area in depth
- The "why" behind patterns requires nuanced domain knowledge the agent can't guess
- You prefer to guide the process interactively

**Use `/review-standards`** after `/auto-discover-standards` to resolve open questions.

## The Question Format

When the agent encounters a pattern where the rationale is unclear, it embeds:

```markdown
> **[QUESTION]** Why is this pattern used instead of [alternative]?
> **[BEST GUESS]** [Agent's hypothesis based on code evidence]
```

Design choices:
- **Grep-able** — `[QUESTION]` is easy to find with text search
- **Paired with hypothesis** — Human confirms or corrects rather than answering from scratch
- **Inline placement** — Questions sit next to the rule they relate to, preserving context
- **Standard markdown** — Renders as blockquotes in any markdown viewer

## Index Integration

`/auto-discover-standards` adds a `has_questions` flag to `index.yml` entries:

```yaml
api:
  response-handling:
    description: API response unwrapping and error handling patterns
    has_questions: true
```

This flag is:
- **Additive** — Does not break `/index-standards` or `/inject-standards` (they only read `description`)
- **Consumed by `/review-standards`** — Used to quickly find files needing review
- **Removed when resolved** — `/review-standards` removes the flag after all questions in a file are answered
- **Overwritten by `/index-standards`** — Running `/index-standards` produces a clean index without this flag (acceptable — just re-run `/auto-discover-standards` or manually add the flag if needed)

## Typical Workflow

```
Session 1 (unattended):
  /auto-discover-standards
  → Scans codebase, creates standard files, rebuilds index
  → Output: N standard files with M embedded questions

Session 2 (focused, ~10-15 min):
  /review-standards
  → Presents each question with context and best guess
  → Human confirms, corrects, or removes each question
  → Standards updated in place, index cleaned up
```
