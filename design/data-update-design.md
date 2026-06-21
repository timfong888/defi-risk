# Data-Update Design

How data in the aggregator gets updated — the end-to-end flow from source to live site, the guards
that keep it honest, and how each update is audited. M1 reference for issue #10. Companion:
[data-fetch-failure-modes.md](data-fetch-failure-modes.md) (what happens when a fetch fails),
[engineering-plan.md](engineering-plan.md) §4 (ingestion pipelines).

## Build-time vs runtime, per data type

The single most important design fact: **how a datum is consumed determines how it updates.**

| Data | Consumed via | Update path | Refresh trigger |
|---|---|---|---|
| Live TVL / volume | runtime fetch (`lib/metrics.ts`, ISR `revalidate: 3600`) | no commit — fetched on the fly | hourly ISR |
| Metric snapshot (fallback) | **build-time import** (`metrics-snapshot.json`) | commit → redeploy | nightly cron |
| Feed assessments | **build-time import** (`data/synced/*.json` via `lib/data.ts:5`) | commit → redeploy | nightly cron |
| Manual matrix / details | build-time import | PR (human) → redeploy | on correction |

Because `lib/data.ts` imports the synced JSON statically, refreshing feed data **requires a repo
commit and a redeploy** — there is no runtime data store. This is deliberate: the data layer is a
plain-JSON public good, forkable and diffable, and every change leaves a git-history audit trail.
The cost is that updates flow through commits, which is why a sync pipeline exists.

## The update flow

```
source (DefiLlama API / provider repo)
   │  scripts/sync-<feed>.mjs  +  scripts/snapshot-metrics.mjs   (nightly cron)
   ▼
data/synced/<feed>.json , data/metrics-snapshot.json
   │  GUARDS (must pass or the run fails loudly):
   │   • schema-drift refusal      (F8)
   │   • entry-count regression    (F9)
   │   • snapshot merge-preserve   (F5)  ← story 6b
   │   • snapshot success-rate gate (F6) ← story 6c
   │   • transient-vs-removal      (F7)  ← story 10d
   │   • validate-data.mjs schema check
   ▼
land on a single sync/feed-data branch
   │   • auto-merge when diff is "safe" (only verbatim/updated/generatedAt changed,
   │     schema-valid, counts stable — policy in engineering-plan §5)
   │   • otherwise one PR for human review
   ▼
Vercel redeploy from main  →  new static build serves fresh data
```

## Cadence, idempotency, guards

- **Cadence:** nightly (`sync-feeds.yml` cron). Live metrics additionally refresh hourly via ISR with
  no commit.
- **Idempotent:** re-running a sync with unchanged upstream produces no diff (timestamps aside), so an
  empty run is a no-op — no branch, no PR.
- **Guards are invariants, not best-effort:** a sync **fails loudly** rather than write questionable
  data (drift, regression, mass snapshot loss). Not-transcribing is the honest fallback.

## Landing without branch sprawl (the de-sprawl fix)

The nightly auto-PR previously used `branch-suffix: timestamp`, creating a new branch every night.
The fix: a single fixed `sync/feed-data` branch, `delete-branch: true`, repo
delete-branch-on-merge enabled, and auto-merge for safe diffs — at most one open sync PR at any time.
(Tracked as story 10b; full rationale in the deferred branch-cleanup plan.)

## Audit trail: git now → on-chain attestation (M2)

Today the audit trail is git history: every data change is a reviewable, attributable commit. The M2
upgrade replaces "trust the maintainer's commit" with independent verifiability — see
[sync-attestation.md](sync-attestation.md): hash (or IPFS-CID) each synced file and record an
Ethereum Attestation Service attestation `{ feed, sourceUrl, fileHash, generatedAt }`, so any reader
can confirm a given update came from the stated source unmodified. This is the natural home for the
`onchain-verifiable` provenance tier and a differentiator for the grant; scoped to assessment data
(not routine metric snapshots) to respect the thin-stewardship budget.
