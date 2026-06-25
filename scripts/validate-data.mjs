// Validates every data file against the schemas the app depends on.
// Runs in CI on every PR — this is the gate that makes the PR-correctable
// data layer safe. Run: node scripts/validate-data.mjs
// Exit code 1 with a full error list on any violation.

import { readFile } from "node:fs/promises";

const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);

async function loadJson(rel) {
  return JSON.parse(await readFile(new URL(`../${rel}`, import.meta.url), "utf8"));
}

const STATUSES = ["covered", "partial", "not-yet-covered"];
const FEED_TYPES = ["Rating", "Dashboard", "Monitoring", "Research"];
const API_ACCESS = ["open", "permissioned", "paid", "none", "unknown"];
const TRISTATE = ["yes", "no", "unknown"];
const BLOCKER_KINDS = ["provider-scope", "access-gated", "verification-pending"];
const METRIC_KINDS = ["tvl", "volume24h"];

const feeds = await loadJson("data/feeds.json");
const protocols = await loadJson("data/protocols.json");
const coverage = await loadJson("data/coverage.json");
const details = await loadJson("data/details.json");
const excluded = await loadJson("data/excluded-feeds.json");

const feedIds = new Set();
for (const f of feeds.feeds ?? []) {
  const where = `feeds.json[${f.id ?? "?"}]`;
  if (!f.id || feedIds.has(f.id)) err(where, "missing or duplicate id");
  feedIds.add(f.id);
  if (!f.name || !f.focus || !f.url) err(where, "missing name/focus/url");
  if (!FEED_TYPES.includes(f.type)) err(where, `bad type "${f.type}"`);
  const a = f.accessibility ?? {};
  if (!API_ACCESS.includes(a.api)) err(where, `bad accessibility.api "${a.api}"`);
  for (const k of ["apiDocumented", "publicDashboard", "methodologyOpen"])
    if (!TRISTATE.includes(a[k])) err(where, `accessibility.${k} must be yes/no/unknown`);
  if (typeof a.verified !== "boolean")
    err(where, "accessibility.verified must be boolean");
  if (!BLOCKER_KINDS.includes(f.coverageBlocker?.kind) || !f.coverageBlocker?.note)
    err(where, "coverageBlocker must have a valid kind and a note");
  if (
    f.aggregatorStatus !== undefined &&
    !["live", "available", "none", "unknown"].includes(f.aggregatorStatus)
  )
    err(where, `bad aggregatorStatus "${f.aggregatorStatus}"`);
  if (a.methodologyUrl !== undefined && !/^https:\/\//.test(a.methodologyUrl))
    err(where, "accessibility.methodologyUrl must be an https URL");
  if (a.apiDocsUrl !== undefined && !/^https:\/\//.test(a.apiDocsUrl))
    err(where, "accessibility.apiDocsUrl must be an https URL");
  if (a.dashboardUrl !== undefined && !/^https:\/\//.test(a.dashboardUrl))
    err(where, "accessibility.dashboardUrl must be an https URL");
  for (const k of ["apiFreePublic", "apiPaidTier"])
    if (a[k] !== undefined && !TRISTATE.includes(a[k]))
      err(where, `accessibility.${k} must be yes/no/unknown`);
  if (f.scope !== undefined)
    for (const k of ["protocolCoverage", "vaultMonitoring"])
      if (!TRISTATE.includes(f.scope[k]))
        err(where, `scope.${k} must be yes/no/unknown`);
}

for (const e of excluded.excluded ?? []) {
  const where = `excluded-feeds.json[${e.id ?? "?"}]`;
  if (!e.id || !e.name || !e.reason || !e.checked)
    err(where, "excluded feed needs id/name/reason/checked");
  if (feedIds.has(e.id)) err(where, `excluded id "${e.id}" is also in the active registry`);
}

const protocolIds = new Set();
for (const p of protocols.protocols ?? []) {
  const where = `protocols.json[${p.id ?? "?"}]`;
  if (!p.id || protocolIds.has(p.id)) err(where, "missing or duplicate id");
  protocolIds.add(p.id);
  if (!p.name || !p.family || !p.category || !p.notes)
    err(where, "missing name/family/category/notes");
  if (!p.metric) err(where, "missing metric");
  else {
    if (!METRIC_KINDS.includes(p.metric.kind))
      err(where, `bad metric.kind "${p.metric.kind}"`);
    if (p.metric.slug !== null && typeof p.metric.slug !== "string")
      err(where, "metric.slug must be string or null");
  }
}

function checkCoverageEntry(e, where) {
  if (!protocolIds.has(e.protocol)) err(where, `unknown protocol "${e.protocol}"`);
  if (!feedIds.has(e.feed)) err(where, `unknown feed "${e.feed}"`);
  if (!STATUSES.includes(e.status)) err(where, `bad status "${e.status}"`);
  if (!e.provenance) err(where, "missing provenance");
  if (e.sourceUrl !== undefined && !/^https:\/\/\S+$/.test(e.sourceUrl))
    err(where, `sourceUrl must be an https URL, got "${e.sourceUrl}"`);
}

(coverage.entries ?? []).forEach((e, i) =>
  checkCoverageEntry(e, `coverage.json#${i} (${e.protocol}:${e.feed})`)
);

// synced files: same shape plus verbatim/sourceUrl
const syncedFiles = ["data/synced/defiscan.json"];
for (const rel of syncedFiles) {
  const synced = await loadJson(rel);
  (synced.entries ?? []).forEach((e, i) => {
    const where = `${rel}#${i} (${e.protocol}:${e.feed})`;
    checkCoverageEntry(e, where);
    if (!e.verbatim) err(where, "synced entry missing verbatim");
    if (!e.sourceUrl) err(where, "synced entry missing sourceUrl");
  });
}

for (const [pid, d] of Object.entries(details.details ?? {})) {
  const where = `details.json[${pid}]`;
  if (!protocolIds.has(pid)) err(where, "unknown protocol id");
  for (const g of d.governance ?? []) {
    if (!g.label || !g.value) err(where, "governance fact missing label/value");
    if (!g.provenance || !g.source)
      err(where, `governance "${g.label}" missing provenance/source`);
  }
  for (const a of d.audits ?? [])
    if (!a.firm || !a.link) err(where, "audit missing firm/link");
  for (const i of d.incidents ?? [])
    if (!i.date || !i.description || !i.link)
      err(where, "incident missing date/description/link");
}

if (errors.length) {
  console.error(`✗ ${errors.length} validation error(s):`);
  for (const e of errors) console.error("  -", e);
  process.exit(1);
}
console.log(
  `✓ data valid: ${protocolIds.size} protocols, ${feedIds.size} feeds, ${(coverage.entries ?? []).length} coverage entries`
);
