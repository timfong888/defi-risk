# Proposed Feed Registry

Per RFP §4, the provider list is illustrative and applicants propose the final
registry with rationale. Our registry maximizes **diversity of coverage
methodology** — the criteria, in product terms, are:

1. **Methodology class** — we want at least two independent providers in each
   class so no single methodology is canonical: decentralization frameworks,
   quantitative onchain dashboards, institutional credit ratings, live
   monitoring/alerting, and research desks.
2. **Data accessibility** — classified per provider as `public-api`,
   `published-scrapeable`, or `gated-manual`. This drives the automation plan
   (M2): automate everything machine-readable, manually curate the rest with
   provenance tags. Classifications below are working assessments pending
   first-hand verification (tracked as SAT-302).
3. **Asset-class fit to the seed list** — the seed list is lending-, vault-,
   and LST-heavy, so vault-focused raters (CuratorWatch, Xerberus, pigi,
   Philidor) earn inclusion despite narrower scope.

## Included (13 of 14 RFP-listed providers)

| Provider | Type | Accessibility (working) | Inclusion rationale |
|---|---|---|---|
| DeFiScan | Rating | published-scrapeable | The reference decentralization-maturity framework; broad seed-list overlap |
| CuratorWatch | Dashboard | published-scrapeable | Only curator-behavior monitor for Morpho vaults — unique methodology |
| BlockAnalitica | Dashboard | gated-manual (non-public) | Deepest quantitative lending-market risk modeling (Sky/Aave/Morpho) — but **no public-facing data** (verified 2026-06-17); included via manual curation pending a data relationship |
| DeFiPunk'd | Rating | public-api | Distinct LLM-consensus methodology adds diversity; registry model |
| Pharos | Monitoring | gated-manual | Only real-time risk-event alerting in the registry |
| DeFi Saver | Dashboard | public-api | Live loan-health and liquidation stats — ground-truth usage data |
| Credora | Rating | gated-manual | Institutional credit-rating lens absent elsewhere |
| RiskLayer | Rating | public-api | Validator-attested onchain ratings — structurally distinct trust model |
| pigi.finance | Dashboard | published-scrapeable | Vault analytics incl. exploit history and holder concentration |
| Xerberus | Rating | public-api | Open-source, 300+ subscores; investor-focused vault coverage |
| Zyfai Risk | Dashboard | published-scrapeable | Pool-level risk for AMMs — covers the DEX rows others miss |
| LlamaRisk | Research | published-scrapeable | Deep research desk; long Curve/CDP track record |
| Philidor Analytics | Rating | public-api | Deterministic, open-methodology vault scoring across 700+ vaults |

**Independence note.** The registry holds **13 independent providers**, one per
listed feed — the "≥2 independent providers per class" criterion is evaluated on
these 13 and holds for every class. (Separately, Credora is owned by RedStone, an
oracle provider — a conflict to disclose if RedStone-fed protocols are rated.)

## Excluded (with reason)

A feed is excluded only on a published, factual basis — never editorially. The
exclusion is itself a labeled datum, reversible the moment the basis changes.

| Provider | Type | Access pattern | Why excluded |
|---|---|---|---|
| DeFi Sphere | Rating | none found | **Unverifiable.** No live product at defisphere.io and no reference to it on Block Analitica's site (verified 2026-06-17). A feed we cannot inspect first-hand fails the integrity bar — listing an unconfirmable source would launder opacity through a neutral interface. Re-included immediately if a live, inspectable product is identified. |

## Candidates for addition (post-M1, registry expansion)

- **Audit/incident aggregators** (e.g., DeFiSafety-style reviews, public
  exploit databases) to strengthen the audit/incident sections with
  third-party sources rather than protocol self-reporting.
- **Onchain governance trackers** to satisfy the governance-data soft
  requirement from verifiable sources (direct contract reads, The Graph
  subgraphs for governor/timelock state).

## Exclusion principle

We exclude providers whose only output is a composite "safety score" with no
published methodology — verbatim display of an unexplained number would
launder opacity through a neutral interface. Providers are re-evaluated on
request via the public correction process.
