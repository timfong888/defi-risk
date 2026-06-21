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

The registry currently holds 13 providers (`data/feeds.json`). Each carries an
`accessibility.class` that drives the automation plan, and a `coverageBlocker` documenting what
stands between today's state and full coverage:

| class | meaning | automation path |
|---|---|---|
| `public-api` | machine-readable endpoint | scripted nightly sync (see #10) |
| `published-scrapeable` | public dashboard, parseable | scripted parse + reviewable PR |
| `gated-manual` | access requires a relationship | manual curation with provenance until a data relationship exists |

A new feed provider qualifies when it has: a **published methodology**, covers **≥3 seed
protocols**, is **independent** (no pay-for-rating; conflicts disclosed), produces **attributable
output**, and has **≥90 days** of operating stability. Removal follows the same evidenced process.

## Sync automation sequencing (ties to #10)

Order of bringing feeds onto the nightly `sync-feeds.yml` pipeline, easiest first:

1. **DeFiScan** — done (`data/synced/defiscan.json`).
2. Remaining `public-api` feeds — DeFiPunk'd, RiskLayer, Xerberus, Philidor (DeFi Saver pending a
   working key).
3. `published-scrapeable` feeds — CuratorWatch, pigi.finance, Zyfai, LlamaRisk.
4. `gated-manual` feeds — Credora, Pharos, BlockAnalitica — manual curation until access is granted
   (this is where EF App Relations introductions convert directly into coverage).
