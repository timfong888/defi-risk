---
description: Drive a defi-risk milestone (M1/M2/all) toward 100% of its machine-verifiable acceptance criteria — one issue per git worktree, implement → verify → independent check → open PR for human merge.
argument-hint: "[M1|M2|all]  (default: all)"
---

# /goal — drive a milestone to 100%

Target milestone: **$ARGUMENTS** (default `all`). "100%" means every **auto** acceptance check in the
milestone reaches an open, green PR. The two **human-gated** items (#12 external correction, #14
named steward) can never be auto-completed — surface them as BLOCKED with the one action you need
from Tim. Never fake them.

This command is an orchestrator over existing skills. Do not invent a new engine.

## 1. Baseline (read-only)
```
cd ~/development/defi-risk && node scripts/verify-acceptance.mjs --milestone $ARGUMENTS --json
```
(For `all`, run `--all`.) Print the current %, the list of **FAIL** (auto) issues to work, and the
**BLOCKED** (human) issues to report at the end. If already 100% auto, skip to step 3.

## 2. Per failing issue — sequential, worktree-isolated
For each FAIL issue `N` (work `#5`'s 20 protocol sub-issues individually; they are independent):

1. **Isolate.** Invoke `superpowers:using-git-worktrees` (or the `EnterWorktree` tool) to create a
   worktree on branch `issue-<N>` from a fresh `origin/main`. All work for this issue happens there.
2. **Implement to green.** Use `superpowers:test-driven-development` +
   `superpowers:subagent-driven-development`. The success criterion is objective and already written:
   ```
   node scripts/verify-acceptance.mjs --issue <N>
   ```
   must exit 0. Loop until it does. Most issues are data work (`data/details.json`,
   `data/protocols.json`, sync scripts) — every datum needs a `provenance` tag and `source` (CHARTER
   rule); `node scripts/validate-data.mjs` must also stay green.
3. **Review.** Run `coderabbit review --plain` (per `coderabbit:code-review`); fix Critical/Warning
   findings and re-run until clean.
4. **Independent check.** Dispatch the **acceptance-verifier** agent for issue `N`. It re-runs the
   checks with no code-edit access and posts an evidence-based verdict. It must return **PASS**. If it
   returns FAIL, fix and repeat from step 2 — do not override it.
5. **Open PR (do not merge).** Invoke `superpowers:finishing-a-development-branch` → option *Push &
   create PR*. Title `#<N>: <issue title>`, body links the issue (`Closes #<N>`) and pastes the
   verifier verdict. Then `ExitWorktree` with action `keep` (the branch is needed for PR review).

Stop and ask Tim if: an issue needs data you can't verify first-hand (a `source` you can't confirm),
a check is ambiguous, or the verifier and your run disagree.

## 3. Report
Re-run the baseline command. Print:
- New auto %, and the PRs you opened (one per issue), each marked verifier-PASS.
- The **BLOCKED** human-gated items with the concrete ask:
  - **#12** — needs one real external contributor to open and get a correction PR merged.
  - **#14** — needs Tim to commit `acceptance/attestations/steward.md` naming the steward + commitment.

Remaining gap to literal 100% = Tim merging the PRs + resolving the two human items.
