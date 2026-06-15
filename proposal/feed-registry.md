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

## Included (all 14 RFP-listed providers)

| Provider | Type | Accessibility (working) | Inclusion rationale |
|---|---|---|---|
| DeFiScan | Rating | published-scrapeable | The reference decentralization-maturity framework; broad seed-list overlap |
| CuratorWatch | Dashboard | published-scrapeable | Only curator-behavior monitor for Morpho vaults — unique methodology |
| BlockAnalitica | Dashboard | published-scrapeable | Deepest quantitative lending-market dashboards (Sky/Aave/Morpho) |
| DeFiPunk'd | Rating | public-api | Distinct LLM-consensus methodology adds diversity; registry model |
| Pharos | Monitoring | gated-manual | Only real-time risk-event alerting in the registry |
| DeFi Sphere | Rating | gated-manual | Multi-dimensional analysis spanning technical/financial/operational. **Operated by Block Analitica** (a Block Analitica product — counted as the same provider, not independent) |
| DeFi Saver | Dashboard | public-api | Live loan-health and liquidation stats — ground-truth usage data |
| Credora | Rating | gated-manual | Institutional credit-rating lens absent elsewhere |
| RiskLayer | Rating | public-api | Validator-attested onchain ratings — structurally distinct trust model |
| pigi.finance | Dashboard | published-scrapeable | Vault analytics incl. exploit history and holder concentration |
| Xerberus | Rating | public-api | Open-source, 300+ subscores; investor-focused vault coverage |
| Zyfai Risk | Dashboard | published-scrapeable | Pool-level risk for AMMs — covers the DEX rows others miss |
| LlamaRisk | Research | published-scrapeable | Deep research desk; long Curve/CDP track record |
| Philidor Analytics | Rating | public-api | Deterministic, open-methodology vault scoring across 700+ vaults |

**Independence note.** These are 14 RFP-listed *feeds* but **13 independent
providers**: DeFi Sphere is a Block Analitica product, so the two are counted as
one independent methodology, not two. The "≥2 independent providers per class"
criterion above is evaluated on the 13 distinct operators, and still holds for
every class. (Separately, Credora is owned by RedStone, an oracle provider — a
conflict to disclose if RedStone-fed protocols are rated.)

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
