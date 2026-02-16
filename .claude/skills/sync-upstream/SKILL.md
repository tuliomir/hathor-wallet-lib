---
name: sync-upstream
description: Synchronize the current branch with upstream/master. Fetches upstream, then rebases (default) or merges. Handles conflicts and verifies build after sync.
user_invocable: true
arguments:
  - name: options
    description: "Options: --merge (use merge instead of rebase), --status (just show divergence)"
    required: false
---

# sync-upstream

Synchronize your branch with the upstream HathorNetwork/hathor-wallet-lib repository.

## Commands

### `/sync-upstream`

Default: fetch upstream and rebase current branch onto `upstream/master`.

### `/sync-upstream --merge`

Fetch upstream and merge `upstream/master` into current branch instead of rebasing.

### `/sync-upstream --status`

Just show how far ahead/behind the current branch is relative to `upstream/master`. No changes made.

## Workflow

### 1. Fetch upstream

```bash
git fetch upstream
```

### 2. Show status

```bash
# Commits ahead of upstream/master (your work)
git log --oneline upstream/master..HEAD

# Commits behind upstream/master (upstream changes)
git log --oneline HEAD..upstream/master
```

If `--status` was passed, stop here and report.

### 3. Check for clean working tree

```bash
git status --porcelain  # Must be empty
```

If dirty, stop and ask the user to commit or stash changes first.

### 4. Rebase or merge

**Rebase (default):**
```bash
git rebase upstream/master
```

**Merge (`--merge`):**
```bash
git merge upstream/master
```

### 5. Handle conflicts

If conflicts occur:
1. List the conflicting files
2. Show the conflict markers for each file
3. Ask the user how they want to resolve each conflict
4. After resolution: `git rebase --continue` or commit the merge

Do NOT auto-resolve conflicts. Always involve the user.

### 6. Verify build

```bash
npm run build
npm test
```

If either fails after sync, report the issue — upstream may have introduced breaking changes.

### 7. Report

Output:
- Number of new commits incorporated
- Whether build and tests pass
- If on master: suggest pushing to keep fork master in sync
  ```bash
  git push origin master
  ```

## Syncing fork master

To keep the fork's master branch up to date with upstream:

```bash
git checkout master
git fetch upstream
git rebase upstream/master
git push origin master
```

This is safe because we never commit directly to fork master — all work happens on feature branches.

## Notes

- This skill NEVER pushes to upstream
- Rebase is preferred for feature branches to keep history clean
- Merge is available for cases where rebase would be problematic (many commits, shared branch)
- Always verify build after sync — upstream changes can break your branch
