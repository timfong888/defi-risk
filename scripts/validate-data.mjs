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
const ACCESS_CLASSES = ["public-api", "published-scrapeable", "gated-manual"];
const BLOCKER_KINDS = ["provider-scope", "access-gated", "verification-pending"];
const METRIC_KINDS = ["tvl", "volume24h"];

const feeds = await loadJson("data/feeds.json");
const protocols = await loadJson("data/protocols.json");
const coverage = await loadJson("data/coverage.json");
const details = await loadJson("data/details.json");

const feedIds = new Set();
for (const f of feeds.feeds ?? []) {
  const where = `feeds.json[${f.id ?? "?"}]`;
  if (!f.id || feedIds.has(f.id)) err(where, "missing or duplicate id");
  feedIds.add(f.id);
  if (!f.name || !f.focus || !f.url) err(where, "missing name/focus/url");
  if (!FEED_TYPES.includes(f.type)) err(where, `bad type "${f.type}"`);
  if (!ACCESS_CLASSES.includes(f.accessibility?.class))
    err(where, `bad accessibility.class "${f.accessibility?.class}"`);
  if (typeof f.accessibility?.verified !== "boolean")
    err(where, "accessibility.verified must be boolean");
  if (!BLOCKER_KINDS.includes(f.coverageBlocker?.kind) || !f.coverageBlocker?.note)
    err(where, "coverageBlocker must have a valid kind and a note");
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
