---
name: coverage-check-llamarisk
description: Check which of the 20 seed protocols LlamaRisk covers, by scraping its public risk-intelligence dashboard. Emits the normalized feed-source-check contract. Use when verifying or refreshing LlamaRisk coverage in data/coverage.json.
---

# Coverage Check — LlamaRisk

Reference implementation of a **`scrape`** coverage check (see
[`docs/feed-source-check.md`](../../feed-source-check.md)).

- **Feed:** `llamarisk`
- **Mechanism:** `scrape` — LlamaRisk exposes no public coverage API; the covered set is
  the protocol list rendered on its risk-intelligence dashboard.
- **Source:** https://dashboard.llamarisk.com/risk-intelligence
- **Per-protocol page:** `https://dashboard.llamarisk.com/protocols/<llamarisk-slug>/overview`

## Steps

1. **Render the index** with a stateless headless browser (e.g. `playwright-cli`) — no
   login, no persisted profile:
   `https://dashboard.llamarisk.com/risk-intelligence`.
   The dashboard is a client-rendered SPA, so a plain `fetch` of the HTML is insufficient;
   wait for the protocol cards/list to hydrate before reading the DOM.
2. **Extract the listed protocols** — each card links to `…/protocols/<slug>/overview`.
   Collect every `<slug>` and its display name.
3. **Map to our seed ids.** LlamaRisk slugs match our ids for the covered seed protocols
   (`curve`, `aave`). For any newly-listed protocol, resolve its slug against
   [`data/protocols.json`](../../../data/protocols.json); if it isn't one of the 20 seed
   protocols, drop it.
4. **Assign status.**
   - `covered` — the protocol has a full, current LlamaRisk report/overview.
   - `partial` — listed but the engagement is scoped/collateral-only (state *why* in a note).
   - Anything not listed ≡ `not-covered` (omit it).
5. **Emit the contract** (stdout), nothing else:

```json
{
  "feed": "llamarisk",
  "mechanism": "scrape",
  "source": "https://dashboard.llamarisk.com/risk-intelligence",
  "checkedAt": "<ISO-8601 UTC>",
  "coverage": [
    { "protocol": "curve", "status": "covered", "sourceUrl": "https://dashboard.llamarisk.com/protocols/curve/overview" },
    { "protocol": "aave",  "status": "partial", "sourceUrl": "https://dashboard.llamarisk.com/protocols/aave/overview" }
  ]
}
```

6. **Reconcile.** Diff the `coverage[]` against the `llamarisk` rows in
   `data/coverage.json` and report protocols to add, remove, or re-status. (As of
   2026-06-23 the source of truth is curve + aave only; liquity/lido/pendle were removed
   as overclaimed.)

## Protocol-id mapping

| LlamaRisk slug | our `id` |
|----------------|----------|
| `curve` | `curve` |
| `aave` | `aave` |

No divergence today. Add a row here if a future LlamaRisk slug differs from our `id`.

## Fragility notes

- The dashboard is an SPA — the check depends on the list selector/markup and on the page
  hydrating. A restyle can break extraction; fail loudly rather than emitting a short list.
- No auth is required; if the page ever gates behind a login, the mechanism must be
  re-evaluated (scrape of a gated page is not a verifiable source).
