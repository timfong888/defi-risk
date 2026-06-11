# Design baseline: the EF POC, and where we go beyond it

The EF App Relations team built a proof-of-concept (RFP Appendix) that defines
the baseline information architecture. Per the RFP, it is "a design reference,
not a production target" — applicants "are expected to build something
better." This note records what we adopted from the POC and where this
implementation deliberately goes beyond it.

## Adopted from the POC (baseline IA)

| POC screen | Elements adopted |
|---|---|
| Summary Table | Sortable/filterable table; one column per risk feed; family grouping for versioned protocols; live TVL from DefiLlama |
| Protocol Detail Page | Governance data with provenance tags; feed cards with methodology one-liners and verbatim ratings; audit history; incident history |
| Methodology Page | What the project does and does not do; full feed registry with one-liners; data provenance tags |

## Where this implementation goes beyond the POC

1. **Every cell is a labeled state, never a blank.** Unassessed protocol×feed
   pairs render explicitly as "not yet covered / assessment pending" — the
   absence of coverage is itself information (and an RFP hard requirement).
2. **Provenance is first-class.** Every datum — governance facts, coverage
   cells, audits, incidents — carries a provenance tag and source link,
   surfaced in the UI (hover any matrix cell), not buried in the repo.
3. **Volume fallback handled per RFP.** Swap aggregators (CoW Swap, 1inch,
   0x/Matcha) show live 24h volume from DefiLlama where TVL is not
   applicable, labeled as such.
4. **The data layer is the product.** All data is plain JSON designed for
   community correction by PR, with schema validation planned in CI
   (SAT-301) so a malformed correction fails visibly.
5. **Honest failure modes.** Metric fetch failures render explicit
   pending/stale badges rather than silent staleness or empty cells.

## Open items tracked in Linear

- SAT-302: verify each provider's data accessibility first-hand (current
  classifications in `data/feeds.json` are marked unverified)
- SAT-298: populate all 20 protocol detail pages (prototype fully populates
  Aave, Lido, Uniswap)
- SAT-301: CI schema validation + contribution templates
