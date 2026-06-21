# On-Chain Sync Attestation (M2 design)

**Status: DESIGN — M2.** Records the "credible neutrality" upgrade for the data-update pipeline so
it's on the books for M2 (issue #10, story 10e). Not built in M1. Companion:
[data-update-design.md](data-update-design.md).

## Why

Today each data update's integrity rests on git history + maintainer review — "trust that the commit
faithfully reflects the source." For a project whose entire thesis is *neutral, verifiable*
aggregation, the stronger guarantee is to make every update **independently verifiable** without
trusting the maintainer at all. That is the top of the provenance ladder (`onchain-verifiable`).

## Design

After each sync writes `data/synced/<feed>.json`:

1. Compute the file hash (sha256) — optionally pin the file to IPFS and use the CID.
2. Record an **Ethereum Attestation Service (EAS)** attestation with a schema like:
   `{ feed: string, sourceUrl: string, fileHash: bytes32 (or cid: string), generatedAt: uint64 }`.
3. The attestation is produced by an **on-chain cron / keeper** (Chainlink Automation or Gelato Web3
   Functions) rather than a maintainer key, so scheduling itself is decentralized.

A reader (or a fork) can then recompute the hash of any synced file and confirm it matches an
on-chain attestation tied to the stated source and date — no commit, branch, or maintainer trust
required.

## Scope & cost

- Attest **assessment data** (feed verbatim) only — not routine metric snapshots — so gas/keeper cost
  stays within the thin-stewardship budget.
- Off-chain commit flow (data-update-design.md) is unchanged; attestation is an additive audit layer.

## Open questions (M2)
- EAS on mainnet vs an L2 (Base) for cost; keeper funding model.
- IPFS pinning provider vs hash-only (hash-only needs the file to remain retrievable from the repo).
- Whether attestation failure should block the data update (no — data honesty first, attestation is
  additive).
