# Community Contribution Model — Design & Execution Plan

STATUS: DRAFT
LAST UPDATE: June 24, 2026

How protocols, feed providers, and the public contribute to the aggregator —
and how the design harvests protocol-team knowledge without letting rated
parties influence their ratings.

## 1. Design principle

Protocol teams are the best source of facts about themselves and the most
motivated party to spin them. The ratings literature is unambiguous about
where that ends: once the rated party pays for or controls its rating,
inflation is the equilibrium (the issuer-pays problem). So the binding rule:

> **Protocols contribute facts and responses — never assessments.**

Assessments belong to feed providers, shown verbatim (see CHARTER.md).


## 2. Protocol contribution — three lanes

### Lane 1: Factual corrections (open to anyone) - drafting and in review

Governance parameters, audit entries, incident records, version metadata —
all PR-able, including by protocol teams. The constraint is what the schema
accepts, not who can edit:

- Every datum requires a `provenance` tag and `source` link; CI rejects PRs
  without them.
- Protocol-submitted facts are tagged `self-reported` — rendered visibly
  weaker than `onchain-verified` in the UI.
- **The provenance ladder is the incentive**: the way for a protocol to look
  good is not to argue in a PR thread, it is to make facts independently
  verifiable (publish the timelock address, point to the Safe) so the tag
  upgrades. The ladder does the moderating.

### Lane 2: Protocol submitting missing feeds

The aggregator does not process change requests directly to the ratings sourced from feeds.

Protocol work directly with feeds.  Those changes from feeds should be reflected in the Aggregator.

However, in the case where the updated feed coverage has **not** been automatically reflected, we are proposing a design for protocols to submit (still TBD).

Schema sketch (`data/responses.json`):

```json
{
  "protocol": "aave",
  "target": { "kind": "feed", "id": "defiscan" },
  "response": "…verbatim team statement…",
  "author": "aave-dao (github org)",
  "date": "2026-07-01",
  "sourcePr": 42
}
```

### Lane 3: New protocol additions

Define the process for new protocols to be added.  This *should* automatically be updated when a feed updates their coverage.

Below is draft to work through, but it seems like having protocols listed in an Aggregator is not quite right, but still need to explore this.

**Inclusion rule (published, versioned in this file):**
1. Ethereum mainnet deployment (RFP hard scope)
2. Listed on DefiLlama with TVL — or volume where TVL is not applicable —
   above a published threshold (initial: $50M TVL / $25M daily volume)
3. User capital directly at risk

**Listing flow:**
- Anyone PRs an entry to `data/protocols.json` using the new-protocol
  template.
- CI validates the schema, resolves the DefiLlama slug, checks the threshold.
- If green, merge is mechanical — the maintainer is a liveness function, not
  a gatekeeper. A rejected PR can only cite a failed criterion, never taste.


## 3. Feed-provider inclusion 

1. **Published methodology** — a public document describing what is assessed
   and how; "trust us" scores with no methodology are ineligible.
2. **Coverage floor** — assesses ≥3 protocols on the current seed list (the
   feed must be useful to this matrix, not aspirational).
3. **Independence** — not owned or controlled by a protocol it rates;
   no pay-for-rating from rated parties. Commercial relationships with
   rated protocols must be disclosed in a `disclosures` array on the
   provider's `feeds.json` entry (`{ party, relationship, since }`), so
   the disclosure is schema-enforceable and rendered on the methodology
   page — an empty array is an explicit "none declared," validated by CI.
4. **Attributable output** — assessments are published under the provider's
   name with dates (anonymous or undated feeds cannot be quoted verbatim).
5. **Stability** — output available for ≥90 days (prevents pop-up feeds).

Inclusion PRs add the provider to `feeds.json` with evidence links for each
criterion; removal follows the same evidenced process (e.g., independence
violation discovered). The current 14 RFP-listed providers are re-evaluated
against this rule as part of SAT-302 verification — any that fail criterion
1 or 3 are flagged to the EF rather than silently retained.

