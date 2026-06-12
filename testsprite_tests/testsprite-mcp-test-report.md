# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** defi-risk
- **Date:** 2026-06-11 (run 1: TC001–TC015) and 2026-06-12 (run 2: TC016–TC025)
- **Prepared by:** TestSprite AI Team (report completed by Claude)
- **Target:** Next.js production build at `http://localhost:3000` (branch `design-review-v1`)
- **Scope:** Frontend, codebase-wide; 25 cases planned, 25 executed across two runs (free-plan per-run cap of 15)

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

### Requirement R5 — External links, methodology, and honest empty/edge states (run 2)
The methodology must state the no-scoring constraint; navigation context must survive round-trips; and every empty/pending state must read as labeled information, never as a broken page.

- **TC016 Open the feeds gaps explanation from a not-yet-covered feed** — ✅ Passed
  *"Why?" link on uncovered cards lands on /feeds#gaps with the blocker table visible.*
- **TC017 Move from a protocol detail page to the next protocol** — ✅ Passed
- **TC018 Understand what blocks broader feed coverage** — ✅ Passed
  *Blocker classifications (provider-scope / access-gated / verification-pending) render with unblock paths.*
- **TC019 Open a provider site from the feeds registry** — ✅ Passed
- **TC020 Confirm the methodology scope and no composite scoring rule** — ✅ Passed
  *The binding no-composite-scoring statement is present and legible.*
- **TC021 Review provenance legend and correction process** — ✅ Passed
- **TC022 Return from methodology to the matrix and keep navigation context** — ✅ Passed
- **TC023 Handle an empty search result in the matrix** — ✅ Passed
  *No-match search renders an empty table without breaking layout.*
- **TC024 See pending metrics for a protocol without TVL data** — ✅ Passed
  *Morpho Vaults shows the explicit "metric pending" badge.*
- **TC025 Recognize curation-pending placeholders on an incomplete protocol page** — ✅ Passed
  *Unpopulated detail sections render labeled dashed placeholders, not blanks.*

---

## 3️⃣ Coverage & Matching Metrics

| Requirement | Total Tests | ✅ Passed | ❌ Failed | Not run |
|---|---|---|---|---|
| R1 Coverage matrix | 5 | 5 | 0 | 0 |
| R2 Navigation & IA | 2 | 2 | 0 | 0 |
| R3 Protocol detail pages | 5 | 5 | 0 | 0 |
| R4 Feeds registry & gaps | 3 | 3 | 0 | 0 |
| R5 Methodology & edge states | 10 | 10 | 0 | 0 |
| **Total** | **25** | **25** | **0** | **0** |

- **Pass rate:** 25/25 = 100%
- **Plan coverage executed:** 25/25 = 100% (two runs)

---

## 4️⃣ Key Gaps / Risks

1. **Full plan executed, zero failures** — including the honest empty-state cases (empty search, metric-pending badge, curation placeholders) that carry the product's labeled-never-blank principle.
2. **Coverage is UI behavior** — no browser tests exercise failure modes (DefiLlama fetch failure → stale badge, sync-script drift guards); those are covered by design-review guards and CI validation, not this suite.
3. **Tests ran against the localhost prod build**, not the deployed Vercel preview — environment parity is high (static output) but deployment-protection and CDN behavior are untested.
4. The generated Playwright test files (`TC0xx_*.py`) are committed in this directory and re-runnable; per-test video traces live on the TestSprite dashboard.
