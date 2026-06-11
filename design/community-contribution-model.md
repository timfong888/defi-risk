# Community Contribution Model — Design & Execution Plan

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
Everything below is structured so the schema enforces this rule, not
maintainer judgment.

## 2. Protocol contribution — three lanes

### Lane 1: Factual corrections (open to anyone)

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

### Lane 2: Right of response (the draw)

A dedicated, labeled **"Protocol response"** slot per feed assessment and per
incident record:

- Verbatim, attributed to the team, length-capped (~500 chars), rendered
  visually distinct from feed content.
- The feed's assessment never moves. The reader sees both.
- Precedent: L2Beat team disputes; credit-rating issuer response statements.

This is the strongest voluntary-participation driver: protocols dislike being
rated with no recourse, and an attributed response slot — without edit power
over the rating — brings them to the table.

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

### Lane 3: Page claiming + freshness attestation

- A team **claims** its page via PR from their official GitHub org — org
  membership is cheap, verifiable identity; no wallet ceremony needed.
- Claimed pages render "reviewed by the [X] team on [date]".
- **Staleness automation works for us**: when a claimed page's data ages past
  90 days, a bot opens an issue pinging the team; a one-click confirm renews
  the freshness badge. The badge decays if ignored — protocols end up
  maintaining their own rows.

### M2 proof strategy

M2 requires "at least one round of external corrections accepted and merged."
Pre-M2, invite all 20 seed protocol teams to review their pages (using EF App
Relations introductions — a stated grant benefit). Some will find errors;
each fix is the workflow demonstrated end-to-end with the EF watching.

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

## 4. Execution plan

| Phase | Work | Tracks to |
|---|---|---|
| M1 wk 1–4 | CONTRIBUTING.md (three workflows: correction / new protocol / new feed provider); issue forms + PR templates; CI schema validation | SAT-301, SAT-292 |
| M1 wk 5–10 | Provenance ladder rendered in UI (already live); `self-reported` tag added to schema; inclusion rule published with threshold | SAT-292 |
| M1 wk 11–12 | M1 gate: correction process documented in README (done) and exercised internally once | SAT-292 |
| M2 wk 13–16 | Response slot (`data/responses.json` + feed-card / incident UI); page-claiming convention; staleness bot (GitHub Action opening issues on claimed pages > 90 days) | new story below |
| M2 wk 17–20 | Seed-protocol review round via EF introductions → ≥1 external correction merged (M2 deliverable); expansion roadmap published citing the mechanical inclusion rule | SAT-292, SAT-304 |

New Linear story to create when M2 work starts: *"Protocol engagement: response
slots, page claiming, staleness attestation"* (extends SAT-292).

## 5. Review: is permissionless addition useful design, given the proposal?

**Verdict: the mechanical inclusion rule is in; the fully-permissionless
community tier is out (deferred). "Permissionless" as a word stays out of the
proposal.**

For:
- The RFP *requires* "an open, community-correctable data layer with
  documented process for corrections, new protocols, and new feed providers"
  — a rules-based listing process is a direct, superior answer to that
  deliverable.
- M2 requires "a short roadmap outlining how protocol coverage expands beyond
  the initial 20." A published mechanical criterion is the cleanest possible
  roadmap: coverage expands exactly when a protocol crosses the threshold —
  no editorial bottleneck, no governance fight.
- It structurally reinforces the neutrality hard requirement: no discretion
  means no favoritism to disclose.

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
gatekeeper and the maintainer is a liveness function** — permissionless in
substance (no discretion, fork-able data layer) without the unbounded
moderation surface or the loaded word. The community tier is revisited
post-M2 if matching funding materializes.
