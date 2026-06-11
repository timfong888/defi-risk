# DeFi Risk Intelligence Aggregator

A neutral, open-source web application that shows what every major DeFi risk
feed says about a protocol — side by side, verbatim, with **no composite
scoring**. Built as a public good in response to the Ethereum Foundation App
Relations [RFP: Neutral DeFi Risk Intelligence Aggregator](https://docs.google.com/document/d/1eCtLN7oRiFdiS-Z6x35EtkOv8LZUsLzkE8iCCgi4P08).

The right mental model is oracle diversity: no single feed should be canonical
for something this important. The aggregation is the value.

## What it shows

- **Summary matrix** — the top 20 Ethereum DeFi protocols × every feed in the
  registry. Every cell is assessed and labeled: covered, partial, or not yet
  covered. Live TVL (or 24h volume where TVL is not applicable) from
  DefiLlama.
- **Protocol detail pages** — governance data with provenance tags, verbatim
  feed assessments with each provider's methodology one-liner, audit history,
  incident history.
- **Methodology page** — what the project does and does not do, the full feed
  registry with inclusion rationale, and the data provenance tag legend.

## What it will never do

Produce its own risk scores. Feed ratings are shown verbatim only. This
constraint is binding — see [CHARTER.md](CHARTER.md). Any change requires
written agreement from the Ethereum Foundation.

## Architecture

- Next.js (App Router) + Tailwind, statically generated, hourly revalidation
- Open data layer in [`data/`](data/): plain JSON for feeds, protocols, the
  coverage matrix, and per-protocol details — every datum carries a
  provenance tag and source link
- Live metrics server-fetched from DefiLlama (`api.llama.fi`); fetch failures
  render explicit pending badges, never blanks
- Design baseline and deliberate improvements over the EF POC:
  [`design/poc-baseline.md`](design/poc-baseline.md)

## Corrections, new protocols, new feed providers

The data layer is community-correctable. To propose a change:

1. **Correction** — open a PR editing the relevant file in `data/`. Every
   changed datum must include a `provenance` tag and a `source` link.
2. **New protocol** — open a PR adding an entry to `data/protocols.json`
   (with DefiLlama slug) and coverage entries in `data/coverage.json`;
   include the TVL/volume rationale in the PR description.
3. **New feed provider** — open a PR adding the provider to
   `data/feeds.json` with its focus, type, data-accessibility class, and a
   brief inclusion rationale referencing methodology diversity.

Maintainers review for source quality, not for editorial agreement — if a
provider said it, it belongs here verbatim. Schema validation on PRs is
tracked in [SAT-301]; until it lands, `npm run build` validates types.

## Development

```bash
npm install
npm run dev
```

## License

[AGPL-3.0](LICENSE). The data layer is part of the licensed work.
