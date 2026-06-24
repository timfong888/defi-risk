# Feed Source Check

How to determine, for any feed in the registry, **which of the 20 seed protocols it
covers** and **the source link for each** — reproducibly, by an agent, with a single
normalized output regardless of how the data is acquired.

This is the operational counterpart to the inclusion rule: a feed earns its place by
being *inspectable first-hand*. This doc specifies the inspection.

- **Seed protocols** (the 20 we track): see [`data/protocols.json`](../data/protocols.json).
- **Active feeds** (10): see [`data/feeds.json`](../data/feeds.json).
- **Current coverage** the checks reconcile against: [`data/coverage.json`](../data/coverage.json).

---

## Normalized output contract

Every per-feed coverage check — `api`, `repo`, or `scrape` — emits the **same** JSON.
That is the whole point: the consumer (an agent diffing against `data/coverage.json`)
never has to know how the data was obtained.

```json
{
  "feed": "llamarisk",
  "mechanism": "scrape",
  "source": "https://dashboard.llamarisk.com/risk-intelligence",
  "checkedAt": "2026-06-23T20:00:00Z",
  "coverage": [
    { "protocol": "curve", "status": "covered", "sourceUrl": "https://dashboard.llamarisk.com/protocols/curve/overview" },
    { "protocol": "aave",  "status": "partial", "sourceUrl": "https://dashboard.llamarisk.com/protocols/aave/overview" }
  ]
}
```

Field rules:

| Field | Rule |
|-------|------|
| `feed` | The feed `id` from `data/feeds.json`. |
| `mechanism` | One of the taxonomy values below. |
| `source` | The single canonical URL (or repo) the check reads. |
| `checkedAt` | ISO-8601 UTC timestamp of the run. |
| `coverage[].protocol` | A seed-protocol `id` from `data/protocols.json`. **Only** the protocols the feed actually covers are listed; absence ≡ `not-covered`. |
| `coverage[].status` | `covered` \| `partial` \| `not-covered`. Use `partial` only when the provider's coverage is scoped/indirect and you can say why. |
| `coverage[].sourceUrl` | The deep link to *that protocol's* page/report on the provider, when one exists. Must be `https`. Omit if the provider has no per-protocol URL. |

A check **never guesses**. If the mechanism can't resolve a protocol, it is simply not
in `coverage[]` (i.e. `not-covered`), and the gap is honest.

---

## Mechanism taxonomy

The mechanism describes **how the coverage list is acquired**, not what the feed measures.

| Mechanism | Definition | Tooling | Reference feed |
|-----------|------------|---------|----------------|
| **`api`** | A structured endpoint (REST/GraphQL/JSON) returns the covered set. | `fetch` in a Node script. | Credora (to verify) |
| **`repo`** | Coverage is enumerable from files in a public Git repository. | `git`/raw GitHub fetch in a Node script. | **DeFiScan** — implemented today in [`scripts/sync-defiscan.mjs`](../scripts/sync-defiscan.mjs) |
| **`scrape`** | No API; render a public page and parse the protocol list. | A **stateless** headless browser (e.g. `playwright-cli`). No login, no persisted session. | **LlamaRisk** — [`docs/feeds/llamarisk/SKILL.md`](feeds/llamarisk/SKILL.md) |
| `rss` | A published syndication feed (RSS/Atom) of reports. | `fetch` + XML parse. | *(reserved — none today)* |
| `onchain` | A registry contract or subgraph holds the covered set. | RPC / subgraph query. | *(reserved)* |
| `manual` | A human checks a list; no automation possible. | Maintainer note. | *(fallback for unverifiable feeds)* |

Picking a mechanism, in priority order: **`api` > `repo` > `scrape` > `manual`**. Prefer
the most structured, most reproducible source the provider actually exposes. A `scrape`
that breaks when the page restyles is weaker than an `api`; document fragility in the SKILL.

---

## Per-feed plan

Each feed gets a `docs/feeds/<feed>/SKILL.md` (tracked by a sub-issue of #80). Mechanisms
marked *(verify)* are best-guesses from the registry's access flags and are confirmed when
the SKILL.md is written.

| Feed | Mechanism | Coverage source | Notes |
|------|-----------|-----------------|-------|
| `defiscan` | `repo` | `github.com/deficollective/defiscan` | **Done** — reference `repo` impl; per-protocol pages at `defiscan.info/protocol/<id>`. |
| `llamarisk` | `scrape` | `dashboard.llamarisk.com/risk-intelligence` | **Reference `scrape` impl.** Per-protocol `…/protocols/<id>/overview`. Covers curve, aave of the seed. |
| `defipunkd` | `scrape` *(verify)* | `defipunkd.com` registry | Per-protocol `defipunkd.com/protocol/<id>`. |
| `blockanalitica` | `scrape` *(verify api)* | `blockanalitica.com` | Public per-protocol dashboards, e.g. `morpho.blockanalitica.com`. May expose an API. |
| `curatorwatch` | `scrape` *(verify)* | `curatorwatch.xyz` | Morpho curator/vault focus. |
| `credora` | `api` *(verify; key-gated)* | `credora.io` | Institutional; API may be permissioned. Fall back to `scrape` if no open endpoint. |
| `xerberus` | `scrape` *(verify)* | `xerberus.io` | Methodology open; coverage index URL to confirm. |
| `philidor` | `scrape` *(verify)* | `philidor.xyz` | Vault scoring. |
| `pigi` | `scrape` *(verify)* | `pigi.finance` | Vault analytics. |
| `zyfai` | `scrape` *(verify)* | `zyf.ai` | Pool-level risk. |

---

## SKILL.md shape

Every `docs/feeds/<feed>/SKILL.md` follows the same skeleton so an agent can run any of
them identically:

1. **Frontmatter** — `name`, `description` (so the skill is discoverable).
2. **Mechanism + source** — which taxonomy value, and the canonical URL/repo.
3. **Steps** — exact, reproducible: fetch/render → locate the covered-protocol list →
   map the provider's protocol identifiers to our seed `id`s → assign `status` →
   emit the [output contract](#normalized-output-contract).
4. **Protocol-id mapping** — provider slug ⇄ our `id` (only where they differ).
5. **Reconcile** — diff the output against `data/coverage.json` and report adds/removes.
6. **Fragility notes** — what would break the check (selector changes, auth walls).

[`docs/feeds/llamarisk/SKILL.md`](feeds/llamarisk/SKILL.md) is the worked `scrape`
reference; `scripts/sync-defiscan.mjs` is the worked `repo` reference.
