# Data-Fetch Failure Modes

Every way fetching data can fail — from DefiLlama (runtime metrics) and from feed providers
(nightly sync) — and exactly how the system must behave. This extends the high-level table in
[engineering-plan.md](engineering-plan.md) §7 down to the fetch layer, and is the M1 reference for
issue #6. The governing principle (CHARTER + RFP): **never show a blank or a silently-stale value —
every failure resolves to an explicit, honest UI state or a loud build failure.**

Fetch happens in three places:
- **Runtime live metrics** — `lib/metrics.ts` `fetchLive`, server-side at ISR revalidation (hourly).
- **Snapshot capture** — `scripts/snapshot-metrics.mjs`, nightly, writes the fallback file.
- **Feed sync** — `scripts/sync-defiscan.mjs` (and future `sync-<feed>.mjs`), nightly.

## Catalog

Each row: trigger → detection → current behavior → required behavior → acceptance check.

### F1 — DefiLlama non-200 / down (runtime)
- **Trigger:** `api.llama.fi` returns 4xx/5xx for a slug.
- **Detection:** `!res.ok` in `fetchLive`.
- **Current:** returns `null` → `fetchMetric` falls back to `metrics-snapshot.json` with a `stale`
  badge; no snapshot → "pending" badge. Never blank. **Handled.**
- **Required:** keep. Stale and pending must be visually distinct and explained on the methodology page.
- **Acceptance:** `metric-live` check (DefiLlama reachable for all slugs) + visual stale/pending states.

### F2 — Network hang / timeout (runtime)
- **Trigger:** connection opens but never resolves (DefiLlama slow, DNS stall).
- **Detection:** none today — `fetch` has no timeout.
- **Current:** the request can hang up to the platform limit, **stalling ISR regeneration** for that
  page. A transient blip also gets no second attempt.
- **Required:** bounded timeout (e.g. 8s via `AbortController`) and ≤1 retry, then fall through to F1.
  ISR regeneration must never block on a single slow upstream call.
- **Acceptance:** `node --test test/fetch-timeout.test.mjs` (story 6d).

### F3 — Malformed / non-numeric response (runtime)
- **Trigger:** DefiLlama returns 200 with unexpected JSON (HTML error page, `null`, object).
- **Detection:** `typeof n === "number"` / `typeof d.total24h === "number"` guards.
- **Current:** non-number → `null` → F1 fallback. **Handled.**
- **Required:** keep.

### F4 — `metric.slug` is null (morpho-vaults)
- **Trigger:** a protocol has no DefiLlama listing (`metric.slug: null`).
- **Detection:** explicit null check in `fetchLive`.
- **Current:** returns `null` → "metric pending". Honest but permanent (engineering-plan open Q#5).
- **Required:** either resolve the metric (MetaMorpho aggregation or onchain vault total) **or**
  formally accept it as a documented allow-null with a visible rationale — not an implicit gap.
- **Acceptance:** `metric-live` passes for all, or a documented allow-null entry (story 6e).

### F5 — Snapshot capture: a single slug fails
- **Trigger:** one slug fails during the nightly snapshot run.
- **Detection:** `fetchLive` returns null inside `snapshot-metrics.mjs`.
- **Current:** the slug is **omitted**, then the whole file is **overwritten** (`:32-38`) — so the
  previously-good fallback value for that slug is **lost**. This is the exact data-loss class D2 was
  created to prevent, reintroduced at the write layer.
- **Required:** **merge-preserving** write — load the existing snapshot, update only slugs that
  fetched successfully, never drop a known-good value on a transient miss.
- **Acceptance:** `node --test test/snapshot-merge.test.mjs` (story 6b).

### F6 — Snapshot capture: many slugs fail
- **Trigger:** DefiLlama broadly down during the snapshot run.
- **Detection:** success count far below protocol count.
- **Current:** writes a near-empty snapshot, wiping *all* fallbacks at once.
- **Required:** **abort the write** when the success rate falls below a threshold (e.g. <80%),
  mirroring `sync-defiscan.mjs`'s entry-count regression guard — keep the last good snapshot instead.
- **Acceptance:** `node --test test/snapshot-threshold.test.mjs` (story 6c).

### F7 — Provider genuine-404 vs transient 429/5xx (sync)
- **Trigger:** `raw.githubusercontent.com` rate-limits or 5xxs a review fetch.
- **Detection:** `!res.ok` in `fetchReview` — **indistinguishable from a real 404 removal today**.
- **Current:** returns `null` → the review is skipped; if enough are skipped, the entry-count
  regression guard throws — a **false alarm** that looks like upstream removed reviews.
- **Required:** distinguish transient (network error, 429, 5xx) from genuine `404`: retry transient
  fetches, and **abort the run on unresolved transient errors** rather than skipping (so a flaky
  network never masquerades as a content change or a regression).
- **Acceptance:** `node --test test/sync-transient.test.mjs` (story 10d).

### F8 — Upstream schema drift / unknown enum (sync)
- **Trigger:** provider changes the risk-array shape or introduces an unknown risk level.
- **Detection:** dimension-count and enum guards in `sync-defiscan.mjs:70-79`.
- **Current:** **throws** — refuses to transcribe rather than misattribute. **Handled (keep).**
- **Required:** keep. Misattributing a provider's assessment is the worst failure this system can have.

### F9 — Entry-count regression (sync)
- **Trigger:** the new sync would write fewer entries than the committed file.
- **Detection:** count comparison in `sync-defiscan.mjs:119-128`.
- **Current:** **throws** — a real removal must be acknowledged by editing `MAPPING`. **Handled (keep).**
- **Required:** keep, but layer F7 underneath so transient failures don't *cause* a false regression.

## Summary

| Mode | Layer | Status |
|---|---|---|
| F1 DefiLlama down | runtime | handled |
| F2 timeout/retry | runtime | **gap → 6d** |
| F3 malformed | runtime | handled |
| F4 null slug | runtime | **decision → 6e** |
| F5 single-slug snapshot loss | snapshot | **gap → 6b** |
| F6 mass snapshot wipe | snapshot | **gap → 6c** |
| F7 transient vs removal | sync | **gap → 10d** |
| F8 schema drift | sync | handled |
| F9 entry regression | sync | handled |
