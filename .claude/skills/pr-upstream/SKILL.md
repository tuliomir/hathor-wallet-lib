---
name: pr-upstream
description: Create a pull request from the current branch to the upstream HathorNetwork/hathor-wallet-lib repository. Checks prerequisites, pushes to origin, creates PR with template.
user_invocable: true
arguments:
  - name: options
    description: "Options: --title \"PR title\", --draft, --reviewer <handle>"
    required: false
---

# pr-upstream

Create a pull request to the upstream HathorNetwork/hathor-wallet-lib repository.

## Command

### `/pr-upstream [--title "PR title"] [--draft] [--reviewer <handle>]`

## Workflow

### 1. Pre-flight checks

Verify all prerequisites before creating the PR:

```bash
# Must not be on master
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" = "master" ]; then
  echo "ERROR: Cannot create PR from master. Create a feature branch first."
  exit 1
fi

# Working tree must be clean
git status --porcelain  # Must be empty

# Must be rebased on upstream/master
git fetch upstream
git merge-base --is-ancestor upstream/master HEAD  # Must succeed
```

### 2. Run verification chain

```bash
npm run format        # Auto-fix formatting
npm run lint:fix      # Auto-fix lint issues
npm run build         # Must pass clean
npm test              # Must pass
```

If either fails, stop and report the issue. Do not create a PR with failing checks.

### 3. Push to origin

```bash
git push -u origin $(git rev-parse --abbrev-ref HEAD)
```

### 4. Create PR

```bash
gh pr create --repo HathorNetwork/hathor-wallet-lib \
  --title "<title>" \
  --reviewer pedroferreira1 \
  --body "$(cat <<'EOF'
### Acceptance Criteria
- <summarize changes from commit messages>

### Security Checklist
- [ ] No unnecessary new dependencies
- [ ] No dev-dependencies as production ones
EOF
)"
```

Add `--draft` flag if the `--draft` option was passed.

### 5. Report

Output the PR URL and a summary of what was included.

## Notes

- The title defaults to the branch name converted to conventional commit format if not provided
- Reviewer defaults to @pedroferreira1 (CODEOWNER) but can be overridden
- This skill NEVER pushes to upstream — only to origin, then creates a cross-fork PR
- If the branch has multiple commits, summarize all of them in the acceptance criteria
