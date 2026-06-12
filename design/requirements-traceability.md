# Requirements Traceability — RFP → Design → Implementation

Output of Design Review 1 (SAT-310). Every RFP hard requirement and M1/M2
deliverable mapped to the design element and implementation that satisfies
it. Status: ✅ live · 🔶 designed, build pending · ⬜ gap (noted).

## Hard requirements (RFP §2)

| Requirement | Design element | Implementation | Status |
|---|---|---|---|
| Open source, AGPL 3.0, public GitHub | engineering-plan §1; LICENSE | repo public since first commit; LICENSE (AGPL-3.0) | ✅ |
| Ethereum-native, mainnet only | §4.2 (ethereum.md reviews only); protocols.json scope | sync script fetches Ethereum reviews only | ✅ |
| No composite scoring | CHARTER.md; §3 schema-enforcement (no field can hold a synthesized value) | no aggregate fields in any schema; UI renders status + verbatim only | ✅ |
| Neutral positioning, conflicts declared | CHARTER.md neutrality section; mechanical listing (community-contribution-model §3) | conflicts register: CHARTER (currently "none") | ✅ |
| Top 20 coverage, all populated at launch | §3 data model; SAT-290/298 | 20 detail pages live; 3 fully populated, 17 with explicit pending states — **full population is the M1 gate, by design not yet met** | 🔶 |
| Live TVL / equivalent volume | §4.1; lib/metrics.ts | TVL (17) + 24h volume (3 aggregators) via DefiLlama, hourly ISR | ✅ |
| Named steward before final payment | proposal §6; M2 plan | placeholder pending Tim's decision | ⬜ gap (human input) |
| Team track record | proposal §4 | placeholder pending Tim's input | ⬜ gap (human input) |

## M1 deliverables

| Deliverable | Design element | Status |
|---|---|---|
| Production app at stable public URL | §2 architecture; §6 deploy | ✅ defi-risk-one.vercel.app |
| Public repo, developed in the open, correction process in README | §5 CI; community-contribution-model §2; README "Corrections" | ✅ process documented; CI validation 🔶 (SAT-301) |
| 20 seed protocols, dedicated detail pages | §3; SAT-290 | ✅ pages; 🔶 full data population (SAT-298) |
| Live TVL all protocols | §4.1 | ✅ (morpho-vaults labeled "metric pending" — see open question) |
| Governance data surfaced for all | §4.3 extraction; details.json | 🔶 3 of 20 populated; extractor designed (SAT-298 + §4.3) |
| Every matrix cell assessed & labeled | §3 default-resolution in lib/data.ts | ✅ 280/280 labeled (56 assessed, rest explicitly pending) |
| Methodology page live | SAT-291 | ✅ |

## M2 deliverables

| Deliverable | Design element | Status |
|---|---|---|
| Feed coverage automated where public | §4.2 sync pattern; SAT-302/303 | 🔶 1 of 14 live (DeFiScan); pattern proven |
| Coverage expansion roadmap | community-contribution-model §3 mechanical criteria | ✅ designed |
| Community contribution proven (≥1 external correction) | community-contribution-model §2 + M2 proof strategy | 🔶 |
| Project charter in repo | CHARTER.md | ✅ |
| Named steward in writing | proposal §6 | ⬜ (human input) |

## Scope-creep check (design elements with no requirement)

- Protocol right-of-response slots (community-contribution-model §2 lane 2):
  not RFP-required — justified as contribution-model enabler for the M2
  external-correction proof. **Keep, M2.**
- Page claiming / staleness bot: same justification. **Keep, M2.**
- Sub-threshold community tier: no requirement — **deferred (already).**
- .eth mirror: no requirement — **deferred (§9 Q4).**

## Gaps found by this review

1. **Mechanical listing threshold is named but not specified as code** —
   the inclusion rule ($50M TVL / $25M volume) exists in prose only; CI
   threshold check (community-contribution-model §3) has no ticket. → folded
   into SAT-301 scope.
2. **morpho-vaults metric** — "metric pending" is labeled honestly but M1
   requires TVL or equivalent for *all* protocols; needs a decision
   (DefiLlama MetaMorpho aggregation vs. onchain vault totals). → added to
   engineering-plan §9 open questions.
3. **Steward + team sections** block submission, not build — tracked in the
   proposal, restated here because two hard requirements terminate in them.
