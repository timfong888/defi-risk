# Project Charter

## Purpose

This project is a neutral, open-source aggregation layer for DeFi risk
intelligence: it shows what every major risk feed says about a protocol, side
by side, verbatim. The aggregation is the value; no single feed is canonical.

## Binding constraint: no composite scoring

This project **must not** produce its own risk scores, rankings, or composite
assessments. Feed ratings are shown verbatim only, attributed to their
providers, with provenance tags.

Any future addition of composite scoring — including weighted summaries,
star ratings, traffic-light roll-ups, or any synthesis across feeds —
**requires prior written agreement from the Ethereum Foundation**. Absent
that agreement, pull requests introducing synthesis of feed data must be
rejected, regardless of author.

## Neutrality

- No undisclosed commercial relationships with listed protocols or feed
  providers. All conflicts are declared in this repository.
- Current declared conflicts: **none**.

## Changing this charter

Changes to this charter require (1) a public pull request, (2) written
agreement from the Ethereum Foundation for any change touching the scoring
constraint, and (3) sign-off from the project steward.
