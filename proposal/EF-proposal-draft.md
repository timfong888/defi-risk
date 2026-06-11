# Proposal: Neutral DeFi Risk Intelligence Aggregator

**Submitted to:** Ethereum Foundation, App Relations
**RFP:** Neutral DeFi Risk Intelligence Aggregator (deadline June 15 AoE, 2026)
**Applicant:** Tim Fong ({{ team-legal-or-org-name }}) — GitHub: timfong888
**Working prototype:** {{ deployed-url }} · Code: https://github.com/timfong888/defi-risk

---

## 1. Approach

### The prototype is the proposal

We built a working prototype before submitting. It is live at
{{ deployed-url }}, AGPL-3.0 from the first commit, and already implements
the core of M1:

- **Summary matrix** — all 20 seed protocols × 14 risk feeds. Every one of
  the 280 cells is assessed and labeled (covered / partial / not yet
  covered); unassessed pairs are explicitly labeled "assessment pending,"
  never blank. Sortable, filterable, with family grouping for versioned
  protocols (Aave v3/v4, Compound v2/v3, Liquity v1/v2, Uniswap v3/v4/X,
  Morpho core/Vaults).
- **Live metrics from DefiLlama** — TVL for 17 protocols; 24h volume for the
  three swap aggregators where TVL is not applicable, exactly per RFP §2.
- **Protocol detail pages** for all 20 protocols — governance with
  provenance tags, verbatim feed cards with methodology one-liners, audit
  history, incident history. Three (Aave, Lido, Uniswap) are fully
  populated; the rest show the final structure with explicit
  curation-pending states.
- **Methodology page** — scope, the full registry with rationale, and the
  provenance tag legend.
- **Project charter committed to the repo** documenting the
  no-composite-scoring constraint and the EF-written-agreement requirement
  to ever change it.

We studied the EF POC closely and documented, in
[`design/poc-baseline.md`](../design/poc-baseline.md), exactly what we
adopted from it and where we deliberately go beyond it: labeled cell states
instead of blanks, provenance as a first-class UI element, honest
failure/staleness badges, and a data layer designed for community
correction rather than maintainer-only edits.

### Neutrality as architecture, not policy

The no-scoring rule is enforced structurally. The data schema has no field
where a composite could live: a coverage cell is a status + a verbatim
string + a provenance tag + a source link. The charter binds PR review to
reject synthesis regardless of author. Neutrality survives maintainer
turnover because it is encoded in the schema and the charter, not in
goodwill.

### The data layer is the product

All data is plain JSON in the public repo. Every datum carries a provenance
tag (`onchain-verifiable` / `public-docs` / `provider-published` /
`manual-unverified` / `assessment-pending`) and a source link. Corrections,
new protocols, and new feed providers arrive as PRs validated by schema
checks in CI — a malformed correction fails visibly. This is what makes the
project a *public good* rather than a website: any other team can fork the
data layer and build a different interface on it.

### Feed registry and automation strategy

Our proposed registry (full rationale:
[`proposal/feed-registry.md`](feed-registry.md)) includes all 14 RFP-listed
providers, selected and retained on a diversity-of-methodology criterion:
at least two independent providers per methodology class (decentralization
frameworks, quantitative dashboards, institutional ratings, monitoring,
research). Each provider is classified by data accessibility —
`public-api` / `published-scrapeable` / `gated-manual` — and that
classification drives the M2 automation plan: automate everything
machine-readable; reserve manual curation (with reviewer sign-off and
provenance tags) for gated feeds. First-hand verification of each
provider's access class is our first M1 work item.

Governance data will move from documentation-sourced to onchain-verified
where possible (direct contract reads of governor/timelock/multisig state,
The Graph subgraphs), addressing the RFP's soft requirement that governance
data not be solely self-reported.

## 2. Milestone Timeline

| Week | Milestone | Deliverables (mapped to RFP M1/M2) |
|---|---|---|
| 0 | Grant activation | Countersigned agreement. Repo already public, AGPL-3.0, developed in the open since project start. |
| 1–4 | Data foundations | Feed accessibility verified first-hand for all 14 providers; CI schema validation live; correction process documented in README (already drafted) and exercised internally. |
| 5–10 | M1 build-out | All 20 protocol detail pages fully populated (governance, audits, incidents, verbatim feed assessments with provenance); first automated feed syncs for public-API providers; design polish to L2Beat-class density. |
| 11–12 | **M1 delivery** | Production app at stable public URL; 20/20 protocols populated with dedicated detail pages; live TVL/volume across all; governance data surfaced for all; every matrix cell assessed and labeled; methodology page live. |
| 13–16 | Automation | Nightly sync for all machine-readable feeds; stale-data badging; manual-curation pipeline with reviewer sign-off for gated feeds. |
| 17–20 | **M2 delivery** | Community contribution model proven end-to-end (≥1 external correction merged); coverage-expansion roadmap published; project charter in repo (already committed); named steward confirmed in writing. |

## 3. Budget — $15,000

| Line | Amount | Notes |
|---|---|---|
| Engineering | $7,000 | Matrix/detail/methodology build-out, feed sync automation, CI validation |
| Data curation | $3,500 | First-hand verification of 14 providers; population of 20 protocols' governance/audit/incident data with sources |
| Design | $2,000 | Data-density and legibility pass against L2Beat/Walletbeat/DeFiScan reference bar |
| Infrastructure | $500 | Hosting (static + ISR), domain ({{ domain-decision }}), CI |
| Maintenance & community ops (through M2) | $2,000 | PR review for corrections, provider onboarding, correction-workflow operations |
| **Total** | **$15,000** | |

If matching contributions materialize (per RFP §5), the first scope
additions are: deeper onchain governance verification, and L2 coverage as a
follow-on milestone.

## 4. Team

| Name | GitHub | Role | Relevant experience |
|---|---|---|---|
| Tim Fong | timfong888 | Lead | {{ tim-relevant-experience — production DeFi tooling/data infra track record, e.g., Filecoin Pay metrics & subgraph work }} |
| {{ additional-team-member }} | {{ gh-handle }} | {{ role }} | {{ experience }} |

**Prior shipped work (1–3 links):**
1. {{ prior-work-link-1 }}
2. {{ prior-work-link-2 }}
3. {{ prior-work-link-3 }}

## 5. Conflict Disclosures

{{ confirm: }} No commercial relationships with any protocol listed in RFP
§3 or any feed provider listed in RFP §4. Declared conflicts: none. Any
future relationship will be disclosed in the repository's conflicts
register before it takes effect.

## 6. Stewardship Plan

**Named steward:** {{ steward-name-or-org }} — {{ public-presence-link }}

**Why incentivized to maintain:** {{ steward-incentive — e.g., the steward
operates in the Ethereum data/risk ecosystem and the aggregator is
infrastructure they and their users depend on; maintenance cost is low by
design (static site + JSON data + automated syncs), and the correction
model distributes curation to the community }}

The architecture minimizes stewardship burden deliberately: a static site
over a JSON data layer with automated syncs and PR-based corrections can be
maintained in single-digit hours per month.

---

*Prototype is offered under the RFP's "optional but weighted positively"
submission artifact. GitHub repo, charter, methodology, and this proposal
are all public and developed in the open.*
