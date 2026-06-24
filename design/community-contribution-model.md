# Community Contribution Model — Design & Execution Plan

How feed providers, protocols, and the public contribute to the aggregator —
and the bright line that keeps rated parties from shaping their own ratings.

## 1. Design principle

Protocol teams are the best source of facts about themselves and the most
motivated party to spin them. The ratings literature is unambiguous about
where that ends: once the rated party pays for or controls its rating,
inflation is the equilibrium (the issuer-pays problem). The earlier draft of
this model tried to let protocols contribute facts *into the aggregator* under
schema guards. That keeps a protocol-authored surface inside the neutral layer
— precisely the surface a rated party will lobby over. So the binding rule is
stronger and simpler:

> **The aggregator's risk content comes from feed providers only. Protocols
> engage the feeds, not the aggregator.**

A protocol that wants a fact corrected, an assessment disputed, or its side
told takes it to the feed that made the claim. The aggregator syncs whatever
the feed publishes, verbatim and attributed (see
[data-update-design.md](data-update-design.md)). Because the aggregator holds
no protocol-authored content, there is nothing for a rated party to lobby the
maintainer over — the neutrality constraint is enforced by the data model, not
by maintainer judgment. This matches the charter: the project shows what every
feed says, side by side, verbatim (see CHARTER.md).

What protocols *can* do with the aggregator is **structural and mechanical**,
never about the substance of a rating (§2). What flows from feeds is governed
by published inclusion criteria and synced verbatim (§3, §3b).

## 2. Protocol contribution — structural only, never data or assessments

A protocol (like anyone) can take exactly two actions on the aggregator. Both
are mechanical, schema- or criteria-checked, and decided by a CI check rather
than by a maintainer's taste or the protocol's narrative. Neither touches how a
protocol is rated.

### 2.1 Request coverage — be listed as a row

- A protocol (or anyone) PRs an entry to `data/protocols.json` using the
  new-protocol template.
- Inclusion is criteria-based (§3): Ethereum mainnet, DefiLlama TVL/volume
  above a published threshold, user capital at risk.
- Merge is mechanical — the maintainer is a liveness function, not a
  gatekeeper. **Being listed says nothing about how a protocol is rated.** The
  feeds decide that; the protocol just appears as a row awaiting their
  assessments.

### 2.2 Propose a feed — add a column

- Anyone, including a protocol, may PR a provider into `data/feeds.json`.
- The provider is subject to the feed-inclusion rule and schema (§3b):
  published methodology, coverage floor, independence + disclosures,
  attributable output, stability.
- A protocol cannot propose **itself** as a feed, and the independence
  criterion (§3b.3) blocks any feed it owns or controls. Proposing a *third
  party's* feed for inclusion is fine — it adds a column whose assessments the
  protocol does not control.

**Not accepted from protocols: factual edits to their own risk data, disputes,
responses, or self-assessment.** None of these are aggregator contributions —
each is a conversation with the feed. Where they go is §2.3.

### 2.3 Where protocol facts and disputes go: the feed

- A protocol that believes a feed's facts or assessment are wrong corrects the
  **feed**. Every included feed has a published methodology (§3b criterion 1)
  and a public contact/repo — that is the address for the dispute.
- When the feed updates, the aggregator's nightly sync reflects it
  automatically: verbatim, attributed, dated. The protocol's recourse is real,
  but it runs **through the rater**, exactly as in credit ratings — an issuer
  engages the agency, not the index that reprints the agency's rating.
- The aggregator's *own* factual data is mechanically sourced, not
  protocol-supplied: live TVL/volume from DefiLlama, governance parameters
  extracted on-chain. A **verifiable mechanical error** in that data — a dead
  source link, a wrong DefiLlama slug, a superseded on-chain address — is
  correctable by anyone (a protocol team included) via PR carrying a
  `provenance` tag and `source` link. CI rejects any datum that does not raise
  its own verifiability. This is ordinary open-source maintenance of a public
  data layer, not a channel for protocol narrative or self-assessment.

This is the entire protocol-facing surface. There is **no** `data/responses.json`,
**no** right-of-response slot, and **no** page-claiming ceremony in the
aggregator. Those were contribution-model enablers the design review already
flagged as *not RFP-required* (see requirements-traceability.md scope-creep
check); they reintroduce the protocol-authored surface this revision removes.
The participation they were meant to drive now lives where it belongs — at the
feed, whose published response or correction the aggregator mirrors like any
other feed update.

### M2 proof strategy

M2 requires "at least one round of external corrections accepted and merged."
Two honest sources satisfy this without a protocol-authored surface:

1. A **feed provider** correcting or extending its own published data, which
   the sync pipeline lands as a tracked commit.
2. A **community or protocol-team** PR fixing a *verifiable mechanical* error
   in the aggregator's sourced data (§2.3) — a provenance-raising correction,
   not a narrative edit.

Pre-M2, invite the 20 seed protocol teams (using EF App Relations
introductions — a stated grant benefit) to (a) flag mechanical/source errors on
their pages for verified correction, and (b) take any disagreement with a
feed's assessment to that feed. Each verified fix, and each feed update that
follows protocol engagement, is the workflow demonstrated end-to-end with the
EF watching.

## 3. New-protocol listing — mechanical, not editorial

The neutrality risk in listing is not spam; it is **discretion**. The moment a
maintainer judges who is worthy, the project has opinions — and invites the
pay-to-list dynamic that corrupts raters. Inclusion is therefore
criteria-based and machine-checkable:

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

**Explicitly rejected: stake-to-list / pay-to-list onchain registries.**
Crypto-native-sounding, but it recreates issuer-pays economics and conflicts
with the RFP's neutral-positioning hard requirement. Listing stays free and
criteria-based; this commitment belongs in the charter.

**Deferred: the sub-threshold "community tier."** A separated, labeled
section for schema-valid protocols below threshold (whose all-gray rows
honestly signal "no independent feed has assessed this") is sound design but
is deferred post-M2 — see §5.

The deeper permissionless surface is the **data layer itself**: AGPL JSON in
a public repo. Anyone can fork it, build a competing UI, or extend it. The
canonical site is just the reference renderer with mechanical listing rules.

## 3b. Feed-provider inclusion — same rigor as protocols

Design review found an asymmetry: rows (protocols) had mechanical criteria
while columns (feeds) were pure editorial discretion — and the columns are
where neutrality will actually be attacked. A bad-faith "risk feed" admitted
to the registry gets its assessments displayed verbatim with the site's
implicit endorsement; a rejected provider gets a legitimate bias complaint.

**Feed inclusion rule (machine- or checklist-checkable):**
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

This is also the channel §2.2 routes a protocol's feed proposal through: the
same evidence bar applies whoever opens the PR.

## 4. Execution plan

| Phase | Work | Tracks to |
|---|---|---|
| M1 wk 1–4 | CONTRIBUTING.md (three workflows: mechanical correction / new protocol / new feed provider — no protocol data-submission lane); issue forms + PR templates; CI schema validation | SAT-301, SAT-292 |
| M1 wk 5–10 | Provenance ladder rendered in UI (already live); inclusion rule published with threshold; verifiable-only correction guard in CI | SAT-292 |
| M1 wk 11–12 | M1 gate: correction process documented in README (done) and exercised internally once | SAT-292 |
| M2 wk 13–16 | Feed-coverage automation expanded (sync more of the 14 providers); document the protocol→feed engagement path on the methodology page | SAT-302, SAT-303 |
| M2 wk 17–20 | Seed-protocol round via EF introductions → ≥1 external correction merged from a feed update or a verifiable mechanical fix (M2 deliverable); expansion roadmap published citing the mechanical inclusion rule | SAT-292, SAT-304 |

The right-of-response slot, page-claiming convention, and staleness bot from
the earlier plan are **dropped**, not deferred: they were the protocol-authored
surface this revision removes. No new "protocol engagement" Linear story is
needed; protocol engagement is feed engagement, and the feed sync pipeline
already exists.

## 5. Review: is permissionless addition useful design, given the proposal?

**Verdict: the mechanical inclusion rule is in; the fully-permissionless
community tier is out (deferred); the protocol-authored contribution surface is
removed in favor of feed-routed engagement. "Permissionless" as a word stays
out of the proposal.**

For:
- The RFP *requires* "an open, community-correctable data layer with
  documented process for corrections, new protocols, and new feed providers"
  — a rules-based listing process plus verifiable mechanical corrections is a
  direct, superior answer to that deliverable, and routing substantive
  protocol input to the feeds keeps the aggregator neutral while still giving
  protocols real recourse.
- M2 requires "a short roadmap outlining how protocol coverage expands beyond
  the initial 20." A published mechanical criterion is the cleanest possible
  roadmap: coverage expands exactly when a protocol crosses the threshold —
  no editorial bottleneck, no governance fight.
- It structurally reinforces the neutrality hard requirement: no discretion
  and no protocol-authored content means no favoritism to disclose and no
  surface to lobby.

Against:
- A $15k grant funds a thin maintenance budget. Fully-permissionless
  (merge-free) listing invents moderation work — spam rows, abandoned-fork
  protocols, squatting — that the steward must absorb. The EF is explicitly
  screening for sustainable stewardship; volunteering for unbounded
  moderation undercuts that story.
- All-gray sub-threshold rows dilute the data density that the design-quality
  soft requirement rewards.
- The word "permissionless" over-promises to this audience: EF reviewers will
  read it as "unmoderated," which collides with their named-steward and
  quality concerns.

Resolution as encoded above: **criteria-based listing where CI is the
gatekeeper and the maintainer is a liveness function**, with all substantive
protocol input routed to the feeds — permissionless in substance (no
discretion, fork-able data layer) without the unbounded moderation surface, the
loaded word, or a protocol-authored channel inside the neutral layer. The
community tier is revisited post-M2 if matching funding materializes.
