---
author: Ulises Gómez
publishDate: 2026-01-18T10:00:00Z
title: "Git Reference: Commands, Workflows & Interview Questions"
tags:
    - Git
    - GitHub
    - Version Control
    - Workflow
description: Quick reference for Git. The three areas, branching strategy, essential commands, merge vs rebase, undoing mistakes, and the workflows I use across all projects. Interview Q&A included.
cover:
  src: './images/covers/git-github.webp'
  alt: 'Git workflow and version control'
---

## Quick Reference

- Git has **3 areas**: working directory (unstaged) → index/staging area → repository (commits)
- `HEAD` points to your current commit. Detached HEAD means you're on a commit, not a branch
- `git fetch` downloads remote changes. `git pull` = fetch + merge into current branch
- `git reset` rewrites history, safe for local commits. `git revert` creates a new undo commit, safe for shared branches
- `merge` preserves full history with a merge commit. `rebase` replays commits for a linear history
- **Never rebase commits already pushed to a shared branch**

---

## What are Git's three areas?

```
Working Directory   →   Index (Staging Area)   →   Repository
(untracked/modified)         (git add)             (git commit)

git status   → shows what's in working dir vs staging
git diff     → working dir vs staging
git diff --staged → staging vs last commit
```

Every file in your project is in one of these states:
- **Untracked**, Git has never seen it
- **Modified**, changed since last commit, not staged
- **Staged**, added with `git add`, will be in the next commit
- **Committed**, stored in repository history

---

## What is HEAD and what is a detached HEAD?

`HEAD` is a pointer to the current branch, which in turn points to the latest commit. It moves forward with every new commit.

```bash
git log --oneline
# abc1234 (HEAD -> main) feat: add QR scanner
# def5678 fix: cart total rounding
```

**Detached HEAD** happens when you `checkout` a specific commit hash instead of a branch:

```bash
git checkout abc1234  # now HEAD points to a commit, not a branch
# Any new commits won't belong to any branch and can be garbage-collected
```

Fix: `git checkout -b new-branch-name` to anchor those commits to a branch.

---

## What is the branching strategy for a solo project?

Simplified trunk-based development:

```
main         ← always deployable, connected to Vercel/Cloudflare prod
  └── feat/crm-invoice-lifecycle
  └── fix/dashboard-hydration-error
  └── chore/update-prisma
```

**Rules:**
- `main` is always deployable, no broken code reaches it
- Feature branches are short-lived: opened, merged, deleted within days
- Every push to a branch triggers a Vercel preview deployment

---

## What is Conventional Commits?

A commit message convention that makes `git log` readable and enables automated changelogs:

```
<type>(<scope>): <short description>

feat(auth): add JWT refresh token rotation
fix(dashboard): resolve hydration error on invoice table
chore(deps): update Prisma to 6.2.0
refactor(pos): extract CartItem into its own component
docs(api): document /billing endpoint response shape
```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `perf`, `ci`.

---

## What is the difference between merge and rebase?

Both integrate changes from one branch into another.

```
# Original state
main:   A → B → C
feat:   A → B → D → E

# After merge
main:   A → B → C → M   (M = merge commit)
                ↗
feat:   A → B → D → E

# After rebase (feat rebased onto main)
main:   A → B → C
feat:          C → D' → E'   (D and E replayed on top of C)
```

| | Merge | Rebase |
|---|---|---|
| History | Preserves full divergence | Linear, cleaner |
| Safe for shared branches | Yes | No, rewrites hashes |
| Merge commit | Yes | No |
| Best for | Long-lived branches, PR merges | Feature branches before merging |

**The rule:** rebase your local feature branch onto main before opening a PR. Never rebase a branch others have already pulled.

---

## What is a fast-forward merge?

When the target branch has no new commits since the feature branch diverged, Git just moves the pointer forward without creating a merge commit:

```
Before: main → A → B
                    └── feat → C → D

After fast-forward: main → A → B → C → D
```

This is the default behavior of `git merge` when possible. Use `--no-ff` to always create a merge commit.

---

## Essential commands

```bash
# Start a feature
git checkout -b feat/ticketera-qr-checkin

# Stage specific files (be intentional, not git add .)
git add src/components/QRScanner.tsx src/api/tickets.ts

# Review what's staged before committing
git diff --staged

# Commit
git commit -m "feat(tickets): add QR code check-in scanner"

# Push and track remote
git push -u origin feat/ticketera-qr-checkin
```

---

## How do you undo mistakes?

```bash
# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Undo last commit, keep changes unstaged
git reset --mixed HEAD~1   # (default)

# Undo last commit, discard changes entirely, destructive
git reset --hard HEAD~1

# Undo a specific committed file, keep it unstaged
git restore src/components/Sidebar.tsx

# Undo a commit that was already pushed (safe: creates new commit)
git revert <commit-hash>

# Find lost commits after a bad reset
git reflog
git checkout <hash>
```

---

## What is git stash?

Temporarily shelves uncommitted changes so you can switch branches without committing half-finished work:

```bash
git stash              # save current state
git stash pop          # restore saved state (removes from stash)
git stash list         # see all stashes
git stash drop         # delete without restoring
```

---

## Common Interview Questions

**Q: What is the difference between `merge` and `rebase`?**
**A:** Both integrate changes from one branch into another. `merge` creates a merge commit and preserves full history, good for long-lived branches and PRs. `rebase` replays commits on top of the target for a linear history, good for feature branches before merging. Never rebase commits already pushed to a shared branch.

**Q: `git reset` vs `git revert`: when to use each?**
**A:** `reset` moves HEAD backward, rewriting history. It's safe for local commits not yet pushed. `revert` creates a new commit that undoes a previous one without rewriting history, safe for shared branches because it doesn't affect commits others may have pulled.

**Q: What is a detached HEAD?**
**A:** When you checkout a specific commit hash instead of a branch name, HEAD points to a commit with no branch attached. New commits made in this state can be garbage-collected. Fix with `git checkout -b new-branch-name`.

**Q: How do you resolve a merge conflict?**
**A:** Open the conflicting file, choose which changes to keep (or combine both), remove the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`), stage the resolved file, then complete with `git merge --continue` or `git rebase --continue`.

**Q: What does `git reflog` do?**
**A:** Records every time HEAD changes, even resets and rebases. It's the safety net, if you `reset --hard` and lose commits, `git reflog` shows the hash of where you were before and lets you recover it.

---

## Common Mistakes

**1. Force pushing to a shared branch**: overwrites other people's commits. Always use `git revert` on shared branches instead of `reset`.

**2. Committing secrets**: `.env` files, API keys, credentials. Fix: add `.env` to `.gitignore` before writing the first line of code. If already committed, rotate the exposed credentials immediately and scrub history with `git filter-repo` (history rewriting is manageable on a solo repo, dangerous on a shared one).

**3. Rebasing a public branch**: rewrites commit hashes. Anyone who pulled the branch now has conflicts. Only rebase local branches.

**4. `git add .` without reviewing**: stages everything including files you didn't intend to commit. Use `git add <specific-file>` and review with `git diff --staged`.

---

## Cheat Sheet

```bash
# ── Setup ──────────────────────────────────────────────
git init
git clone <url>
git remote add origin <url>

# ── Status & diff ──────────────────────────────────────
git status
git diff                  # working dir vs staging
git diff --staged         # staging vs last commit
git log --oneline --graph

# ── Branching ──────────────────────────────────────────
git checkout -b <branch>
git branch -d <branch>    # delete local (after merge)
git branch -a             # list all branches

# ── Staging & committing ───────────────────────────────
git add <file>
git commit -m "type(scope): description"
git commit --amend        # amend last local commit

# ── Syncing ────────────────────────────────────────────
git fetch origin
git pull origin main
git push -u origin <branch>
git push --force-with-lease  # safer than --force

# ── Undoing ────────────────────────────────────────────
git reset --soft HEAD~1   # undo commit, keep staged
git reset --mixed HEAD~1  # undo commit, keep unstaged
git reset --hard HEAD~1   # undo commit, discard changes
git revert <hash>         # safe undo (creates new commit)
git restore <file>        # discard working dir changes
git reflog                # find lost commits

# ── Stash ──────────────────────────────────────────────
git stash
git stash pop
git stash list

# ── Tags ───────────────────────────────────────────────
git tag -a v1.0.0 -m "Release"
git push origin v1.0.0

# ── Rebase ────────────────────────────────────────────
git rebase origin/main    # replay current branch on main
git rebase --continue     # after resolving conflicts
git rebase --abort        # cancel rebase
```
