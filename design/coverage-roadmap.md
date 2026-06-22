# Coverage Expansion Roadmap

How protocol and feed coverage grows beyond the initial 20 seed protocols. Expansion is
**mechanical, not editorial** — inclusion follows published rules checked in CI, never a
maintainer's discretion. This document is the M2 deliverable for issue #11.

## Protocol expansion

The seed set is the RFP §3 top-20 Ethereum protocols. Beyond it, a protocol is **listed when it
mechanically qualifies** — no application, no pay-to-list:

1. Deployed on **Ethereum mainnet**.
2. **Listed on DefiLlama** (resolvable `metric.slug`).
3. **TVL > $50M**, or **24h volume > $25M** where TVL is not the right metric (swap aggregators).
4. **User capital at risk** (lending, AMM, vault, staking, derivatives — not pure governance/airdrop).

A new protocol arrives as a PR adding a `data/protocols.json` entry. CI validates the slug resolves
on DefiLlama and the threshold is met; merge is liveness, not gatekeeping. Sub-$50M protocols are
deferred to a post-M2 "community tier" with a clearly weaker badge.

**Near-term candidates** (re-checked each quarter against the rule): Sky/Maker core, Ethena,
Frax, Convex, Aerodrome-on-Base (when L2 scope opens), Symbiotic, EigenLayer.

## Feed expansion

The registry currently holds 12 providers (`data/feeds.json`). Each carries the #66 access
attributes — `api` (open / permissioned / paid / none / unknown) plus `apiDocumented`,
`publicDashboard`, `methodologyOpen` — that drive the automation plan, and a `coverageBlocker`
documenting what stands between today's state and full coverage:

| access shape | automation path |
|---|---|
| `api: open` (machine-readable, free) | scripted nightly sync (see #10) → `provider-published` |
| `api: permissioned/paid` (key or agreement) | scripted sync once access is granted; keys in Actions secrets |
| `api: none` + `publicDashboard: yes` | scripted parse over the public dashboard + reviewable PR |
| `api: none` + no public surface | manual curation with provenance until a data relationship exists |

Attributes are `unknown` until verified first-hand (SAT-302); the sequencing below resolves them.

A new feed provider qualifies when it has: a **published methodology** (`methodologyOpen`), covers
**≥3 seed protocols**, is **independent** (no pay-for-rating; conflicts disclosed), produces
**attributable output**, and has **≥90 days** of operating stability. Removal follows the same
evidenced process (and an excluded feed is recorded in `data/excluded-feeds.json` with the reason).

## Sync automation sequencing (ties to #10)

Order of bringing feeds onto the nightly `sync-feeds.yml` pipeline, easiest first. Exact ordering
firms up as each feed's `api`/capability attributes are verified (SAT-302):

1. **DeFiScan** — done (`api: open`, `data/synced/defiscan.json`).
2. **Open-API candidates** — DeFiPunk'd, Xerberus, Philidor (DeFi Saver pending a working key →
   `permissioned`). Confirm each provider's `api`/`apiDocumented` first.
3. **Dashboard-only feeds** (`publicDashboard: yes`, `api: none`) — CuratorWatch, pigi.finance,
   Zyfai, LlamaRisk, and BlockAnalitica's public Morpho dashboard — parse + reviewable PR.
4. **Gated feeds** — Credora, Pharos, and BlockAnalitica's non-Morpho modeling — manual curation
   until access is granted (where EF App Relations introductions convert directly into coverage).
