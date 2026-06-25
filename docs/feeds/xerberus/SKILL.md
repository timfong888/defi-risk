---
name: coverage-check-xerberus
description: Check which seed protocols/vaults Xerberus rates and validate that its data is aggregatable, via the free public Risk Ratings API. Emits the normalized feed-source-check contract. Use when verifying Xerberus coverage or its aggregator availability.
---

# Coverage Check — Xerberus

Reference implementation of an **`api`** coverage check (see
[`docs/feed-source-check.md`](../../feed-source-check.md)). Counterpart to the
`repo` reference (`scripts/sync-defiscan.mjs`).

- **Feed:** `xerberus`
- **Mechanism:** `api` — free public Risk Ratings API (no scrape needed).
- **Base URL:** `https://api.xerberus.io/public/v1`
- **Endpoint:** `POST /risk/rating/index`
- **Docs:** https://xerberus.gitbook.io/documentation
- **Aggregator status:** `available` — endpoint confirmed live (2026-06-24); key
  provisioned in the Vercel environment.

## Credentials (Vercel environment)

| Var | What | Where |
|-----|------|-------|
| `XERBERUS_API` | `x-api-key` header value | Vercel **sensitive** env var (Preview + Production) — injected at runtime only, not readable via `vercel env pull`. |
| `XERBERUS_USER_EMAIL` | `x-user-email` header value (the Xerberus account email) | **Not yet set** — add to Vercel to enable a green validation. |

Because `XERBERUS_API` is sensitive, the validation runs **in the Vercel runtime**
(or locally once both vars are exported), never from a committed secret.

## Validate the endpoint (data is aggregatable)

`scripts/validate-xerberus.mjs` is the operational proof. It POSTs a stable
Ethereum probe set and asserts the API returns a well-formed `index_rating`:

```bash
XERBERUS_API=<key> XERBERUS_USER_EMAIL=<account-email> node scripts/validate-xerberus.mjs
# OK: Xerberus API returned index_rating="…" for 2 ethereum assets. Data is aggregatable.
```

Exit 0 ⇒ the aggregator can pull rated data; exit 1 ⇒ failure (key/email/shape).
`429` means rate-limited but reachable — retry.

## Steps (coverage check)

1. **Resolve seed protocols to token addresses.** Xerberus rates assets/vaults by
   Ethereum address, not protocol name. Map each seed protocol in
   [`data/protocols.json`](../../../data/protocols.json) to its governance/vault
   token address(es). Xerberus is vault-focused, so coverage concentrates on the
   vault-style seeds (`yearn`, `morpho-vaults`, `mellow`).
2. **Query** `POST /risk/rating/index` with `{ ecosystem: "ethereum", assets: [...] }`
   and the two auth headers.
3. **Assign status.** `covered` if the asset returns a rating; `partial` if only
   some of a protocol's assets are rated; otherwise omit (`not-covered`).
4. **Emit the contract** (stdout):

```json
{
  "feed": "xerberus",
  "mechanism": "api",
  "source": "https://api.xerberus.io/public/v1/risk/rating/index",
  "checkedAt": "<ISO-8601 UTC>",
  "coverage": [
    { "protocol": "yearn", "status": "partial", "sourceUrl": "https://app.xerberus.io/risk/rating/<id>" }
  ]
}
```

5. **Reconcile** against the `xerberus` rows in `data/coverage.json`.

## Protocol-id mapping

Resolve each seed `id` → its Ethereum token address(es) before querying. Record
confirmed mappings here as they are verified (none asserted yet — vault address
resolution is the open work).

## Fragility notes

- Auth requires **both** `x-api-key` and `x-user-email`; a missing email is the
  most common failure.
- The API is free but rate-limited (observed `429`); batch assets per request and
  back off.
