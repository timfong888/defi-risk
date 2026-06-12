# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** defi-risk
- **Date:** 2026-06-11
- **Prepared by:** TestSprite AI Team (report completed by Claude)
- **Target:** Next.js production build at `http://localhost:3000` (branch `design-review-v1`)
- **Scope:** Frontend, codebase-wide; 25 cases planned, 15 executed (free-plan per-run cap)

---

## 2️⃣ Requirement Validation Summary

### Requirement R1 — Coverage matrix: search, filter, sort, cell inspection
The home matrix must let a user find protocols by search/category, sort by TVL/coverage/name, and inspect any protocol×feed cell with status + provenance.

- **TC001 Search and open a protocol from the coverage matrix** — ✅ Passed — [code](./TC001_Search_and_open_a_protocol_from_the_coverage_matrix.py) · [result](https://www.testsprite.com/dashboard/mcp/tests/cded2c56-a68e-4e90-a0b2-3a4ba44e11d5/dbe4ba1e-bb78-4894-97e4-400e7faa18cd)
  *Search → row filtering → protocol link navigation works end to end.*
- **TC002 Search and filter the coverage matrix to find a protocol** — ✅ Passed
  *Category chips combine correctly with text search.*
- **TC003 Inspect a coverage cell before drilling into protocol details** — ✅ Passed
  *Cell carries status chip; click-through lands on the protocol's feed anchor.*
- **TC004 Sort the matrix by protocol size and coverage** — ✅ Passed
  *TVL/volume and coverage sort orders apply and re-render correctly.*
- **TC005 Inspect a coverage cell tooltip** — ✅ Passed
  *Hover tooltip exposes status, note, and provenance tag.*

### Requirement R2 — Navigation and information architecture
Header navigation must indicate the active view; the stats header must route to the feeds registry.

- **TC006 Navigate through the top tabs and keep the active state clear** — ✅ Passed
  *Coverage Matrix / Feeds / Methodology active-state styling tracks the current route (the SAT-316 nav fix verified).*
- **TC010 Use the stats header to open the feeds registry** — ✅ Passed
  *"Independent risk feeds" tile links to /feeds (SAT-316 fix verified).*

### Requirement R3 — Protocol detail pages
Each protocol page must show governance with provenance, verbatim feed assessments, audit and incident history, and prev/next navigation.

- **TC007 Open a protocol detail page from the matrix** — ✅ Passed
- **TC008 Review governance and provenance on a protocol detail page** — ✅ Passed
  *Governance facts render with provenance tags and source links.*
- **TC009 Compare protocol details and move to the next protocol** — ✅ Passed
  *Prev/next footer navigation traverses the seed list.*
- **TC011 Read feed assessment quotes on a protocol detail page** — ✅ Passed
  *Synced DeFiScan verbatim blocks render with attribution, date, and source.*
- **TC014 Review audits and incidents on a protocol detail page** — ✅ Passed

### Requirement R4 — Feeds registry and coverage gaps
The /feeds page must list the registry, categorize coverage by protocol category, and explain blockers; uncovered cards must link to the explanation.

- **TC012 Review feed coverage by category in the registry** — ✅ Passed
- **TC013 Compare feed coverage across protocol categories in the registry** — ✅ Passed
- **TC015 Jump from protocol gaps to the feeds registry** — ✅ Passed
  *"Why?" link on not-yet-covered cards lands on /feeds#gaps (SAT-316 fix verified).*

### Requirement R5 — External links, methodology, and honest empty/edge states (NOT EXECUTED)
- TC016–TC025 were planned but not executed this run (per-run execution cap on the Free plan). These include the edge-state cases: empty search results (TC023), "metric pending" for Morpho Vaults (TC024), and curation-pending placeholders (TC025).

---

## 3️⃣ Coverage & Matching Metrics

| Requirement | Total Tests | ✅ Passed | ❌ Failed | Not run |
|---|---|---|---|---|
| R1 Coverage matrix | 5 | 5 | 0 | 0 |
| R2 Navigation & IA | 2 | 2 | 0 | 0 |
| R3 Protocol detail pages | 5 | 5 | 0 | 0 |
| R4 Feeds registry & gaps | 3 | 3 | 0 | 0 |
| R5 Methodology & edge states | 10 | — | — | 10 |
| **Total** | **25** | **15** | **0** | **10** |

- **Pass rate (executed):** 15/15 = 100%
- **Plan coverage executed:** 15/25 = 60%

---

## 4️⃣ Key Gaps / Risks

1. **10 planned cases unexecuted** (TC016–TC025) due to the Free-plan per-run cap — notably the *honest empty-state* cases (empty search, metric-pending badge, curation placeholders), which are central to this product's labeled-never-blank design principle. Recommend a follow-up run scoped to `testIds: ["TC016"…"TC025"]`.
2. **All executed coverage is happy-path UI behavior** — no tests yet exercise failure modes (DefiLlama fetch failure → stale badge, sync-script drift guards); those are covered by design-review guards and CI, not browser tests.
3. **Tests ran against localhost prod build**, not the deployed Vercel preview — environment parity is high (static output) but deployment-protection and CDN behavior are untested by this run.
4. Test code artifacts (`TC0xx_*.py`) live on the TestSprite dashboard; only plan, PRD, and this report are in the repo.
