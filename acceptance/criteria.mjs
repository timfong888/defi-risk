// Acceptance-criteria registry — the single source of truth for "done".
// Keyed by GitHub issue number (timfong888/defi-risk #3–#14). scripts/verify-acceptance.mjs
// runs these checks; scripts/sync-issue-criteria.mjs renders them into the issue bodies.
//
// Each check: { id, desc, type, tag, ...params }.
//   tag "auto"  — machine-verifiable; a failure fails the milestone.
//   tag "human" — needs a person/external party; reported BLOCKED, never counts as failure.
// Check types are implemented in scripts/verify-acceptance.mjs.

const PROD = "https://defi-risk-one.vercel.app";

export const milestones = {
  M1: "M1 — Week 12 (33%)",
  M2: "M2 — Week 20 (34%)",
};

export const criteria = {
  3: {
    milestone: "M1",
    title: "Production app deployed at a stable public URL",
    checks: [
      { id: "prod-up", desc: "Production URL returns 200 and renders the matrix", type: "http", tag: "auto",
        url: PROD, expectStatus: 200, bodyContains: ["Aave"] },
    ],
  },
  4: {
    milestone: "M1",
    title: "Public repo under AGPL-3.0 with documented contribution/correction process",
    checks: [
      { id: "repo-public", desc: "GitHub repo visibility is PUBLIC", type: "gh-repo-flag", tag: "auto", field: "visibility", equals: "PUBLIC" },
      { id: "license-agpl", desc: "LICENSE is AGPL-3.0", type: "file-contains", tag: "auto",
        file: "LICENSE", patterns: ["GNU AFFERO GENERAL PUBLIC LICENSE", "Version 3"] },
      { id: "license-url", desc: "README links the full AGPL-3.0 license URL", type: "file-contains", tag: "auto",
        file: "README.md", patterns: ["gnu.org/licenses/agpl-3.0"] },
      { id: "readme-corrections", desc: "README documents the contribution/correction process", type: "file-contains", tag: "auto",
        file: "README.md", patterns: ["Corrections", "provenance"] },
    ],
  },
  5: {
    milestone: "M1",
    title: "All 20 seed protocols populated, each with a dedicated detail page",
    checks: [
      { id: "protocols-20", desc: "data/protocols.json lists exactly 20 protocols", type: "data-count", tag: "auto",
        file: "data/protocols.json", path: "protocols", equals: 20 },
      { id: "details-all", desc: "Every protocol has governance, audits, and incidents populated", type: "details-populated", tag: "auto",
        fields: ["governance", "audits", "incidents"] },
    ],
  },
  6: {
    milestone: "M1",
    title: "Live TVL (or volume where TVL N/A) across all seed protocols from DefiLlama",
    checks: [
      { id: "metrics-live", desc: "DefiLlama returns a numeric metric for every protocol with a slug", type: "metric-live", tag: "auto" },
    ],
  },
  7: {
    milestone: "M1",
    title: "Governance data surfaced for all seed protocols",
    checks: [
      { id: "governance-all", desc: "Every protocol has at least one governance fact", type: "details-populated", tag: "auto",
        fields: ["governance"] },
    ],
  },
  8: {
    milestone: "M1",
    title: "Every protocol-by-feed matrix cell assessed and labeled",
    checks: [
      { id: "matrix-complete", desc: "All protocols×feeds cells resolve to a valid labeled status (no blanks)", type: "matrix-complete", tag: "auto" },
    ],
  },
  9: {
    milestone: "M1",
    title: "Methodology page live (feed registry + data provenance tags)",
    checks: [
      { id: "methodology-up", desc: "/methodology returns 200 and shows the provenance legend", type: "http", tag: "auto",
        url: `${PROD}/methodology`, expectStatus: 200, bodyContains: ["provenance"] },
    ],
  },
  10: {
    milestone: "M2",
    title: "Automate feed coverage where public; manual curation otherwise",
    checks: [
      { id: "sync-automation", desc: "≥2 feed sync scripts wired into the nightly workflow and ≥2 synced data files", type: "sync-automation", tag: "auto",
        minScripts: 2, minSyncedFiles: 2 },
    ],
  },
  11: {
    milestone: "M2",
    title: "Roadmap for expanding protocol coverage beyond the initial 20",
    checks: [
      { id: "roadmap", desc: "Coverage-expansion roadmap exists and every feed has a documented coverage blocker", type: "roadmap-present", tag: "auto",
        file: "design/coverage-roadmap.md" },
    ],
  },
  12: {
    milestone: "M2",
    title: "Community contribution model operational — ≥1 external correction merged",
    checks: [
      { id: "external-pr", desc: "At least one merged PR authored by an external contributor", type: "external-pr", tag: "human",
        allow: ["timfong888", "github-actions[bot]"] },
    ],
  },
  13: {
    milestone: "M2",
    title: "Project charter in repo (no-composite-scoring constraint + change process)",
    checks: [
      { id: "charter", desc: "CHARTER.md states the no-composite-scoring constraint and the EF-agreement change process", type: "file-contains", tag: "auto",
        file: "CHARTER.md", patterns: ["no composite scoring", "prior written agreement"] },
    ],
  },
  14: {
    milestone: "M2",
    title: "Named steward confirmed in writing",
    checks: [
      { id: "steward", desc: "A committed steward attestation names the steward and their commitment", type: "attestation", tag: "human",
        file: "acceptance/attestations/steward.md", patterns: ["Steward:", "Commitment:"] },
    ],
  },
  46: {
    milestone: "M1",
    title: "Detail page links covered cells to their dashboard",
    checks: [
      { id: "dashboard-data", desc: "Coverage sourceUrls are valid https and the morpho-vaults×blockanalitica seed is present", type: "command", tag: "auto",
        cmd: "node --test test/dashboard-link.test.mjs" },
      { id: "dashboard-live", desc: "morpho-vaults detail page links the BlockAnalitica dashboard", type: "http", tag: "auto",
        url: `${PROD}/protocol/morpho-vaults`, expectStatus: 200, bodyContains: ["morpho.blockanalitica.com"] },
    ],
  },
};

// Sub-issues for #5: one per protocol id (filled by sync-issue-criteria.mjs after creation).
// Each sub-issue's acceptance = details-populated for that protocol + its /protocol/{id} page renders.
export function subIssueChecks(protocolId) {
  return [
    { id: `details-${protocolId}`, desc: `Protocol "${protocolId}" has governance, audits, and incidents`, type: "details-populated", tag: "auto",
      protocol: protocolId, fields: ["governance", "audits", "incidents"] },
    { id: `page-${protocolId}`, desc: `/protocol/${protocolId} renders`, type: "http", tag: "auto",
      url: `${PROD}/protocol/${protocolId}`, expectStatus: 200 },
  ];
}

// Explicit sub-stories that break #6 (data fetch / failure modes) and #10 (update design /
// automation) into trackable units. Created as native sub-issues by sync-issue-criteria.mjs.
// Behaviour gaps are gated by tests (the `command` check) which read FAIL until implemented.
export const subStories = {
  6: [
    { key: "6a", title: "Document data-fetch failure modes",
      checks: [{ id: "failure-doc", desc: "Failure-mode catalog F1–F9 documented", type: "file-contains", tag: "auto",
        file: "design/data-fetch-failure-modes.md", patterns: ["F1", "F5", "F6", "F7", "F9"] }] },
    { key: "6b", title: "Snapshot capture is merge-preserving (F5)",
      checks: [{ id: "snapshot-merge", desc: "snapshot-metrics preserves last-known-good on a single-slug failure", type: "command", tag: "auto",
        cmd: "node --test test/snapshot-merge.test.mjs" }] },
    { key: "6c", title: "Snapshot write aborts on low success-rate (F6)",
      checks: [{ id: "snapshot-threshold", desc: "snapshot-metrics refuses to write below the success-rate threshold", type: "command", tag: "auto",
        cmd: "node --test test/snapshot-threshold.test.mjs" }] },
    { key: "6d", title: "Runtime + snapshot fetch have timeout + retry (F2)",
      checks: [{ id: "fetch-timeout", desc: "fetches use a bounded timeout and one retry", type: "command", tag: "auto",
        cmd: "node --test test/fetch-timeout.test.mjs" }] },
    { key: "6e", title: "morpho-vaults metric resolved or formally accepted (F4)",
      checks: [{ id: "morpho-vaults-decision", desc: "A recorded decision resolves or accepts the morpho-vaults metric gap", type: "attestation", tag: "human",
        file: "acceptance/attestations/morpho-vaults-metric.md", patterns: ["Decision:"] }] },
  ],
  10: [
    { key: "10a", title: "Document the data-update design",
      checks: [{ id: "update-doc", desc: "Update design documents sources, cadence, landing, and audit trail", type: "file-contains", tag: "auto",
        file: "design/data-update-design.md", patterns: ["Build-time vs runtime", "Cadence", "Audit trail"] }] },
    { key: "10b", title: "Sync no longer sprawls branches",
      checks: [
        { id: "no-timestamp-suffix", desc: "sync-feeds.yml does not use a timestamp branch suffix", type: "file-not-contains", tag: "auto",
          file: ".github/workflows/sync-feeds.yml", patterns: ["branch-suffix: timestamp"] },
        { id: "delete-on-merge", desc: "Repo auto-deletes head branches on merge", type: "gh-repo-flag", tag: "auto",
          field: "deleteBranchOnMerge", equals: true },
      ] },
    { key: "10c", title: "≥2 feeds syncing on the nightly pipeline",
      checks: [{ id: "sync-automation", desc: "≥2 sync scripts wired in and ≥2 synced files", type: "sync-automation", tag: "auto",
        minScripts: 2, minSyncedFiles: 2 }] },
    { key: "10d", title: "Sync distinguishes transient failure from genuine removal (F7)",
      checks: [{ id: "sync-transient", desc: "transient fetch failures retry/abort rather than skip or false-regress", type: "command", tag: "auto",
        cmd: "node --test test/sync-transient.test.mjs" }] },
    { key: "10e", title: "On-chain attestation design recorded (M2)",
      checks: [{ id: "attestation-doc", desc: "sync-attestation.md records the EAS-based design", type: "file-contains", tag: "auto",
        file: "design/sync-attestation.md", patterns: ["Ethereum Attestation Service"] }] },
  ],
};

// Resolve a sub-issue's checks from its parent + key (protocol id for #5, story key for #6/#10).
export function resolveSubChecks(parent, key) {
  if (Number(parent) === 5) return subIssueChecks(key);
  const s = (subStories[parent] ?? []).find((x) => x.key === key);
  return s ? s.checks : null;
}
