// Runs the acceptance checks from acceptance/criteria.mjs and reports PASS/FAIL/BLOCKED.
// Usage: node scripts/verify-acceptance.mjs [--issue N | --milestone M1|M2 | --all] [--json] [--offline]
// Exit 0 only if every "auto" check in scope passes. "human" checks never flip the exit code.
//
// Reuses the data-loading and DefiLlama-endpoint conventions from scripts/validate-data.mjs
// and lib/metrics.ts so "done" is checked the same way the app reads its data.

import { readFile, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { criteria, resolveSubChecks } from "../acceptance/criteria.mjs";

const ROOT = new URL("../", import.meta.url);
const STATUSES = ["covered", "partial", "not-yet-covered"];
const NETWORK_TYPES = new Set(["http", "metric-live", "gh-repo-flag", "external-pr"]);

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const asJson = flag("--json");
const offline = flag("--offline");

const loadJson = async (rel) => JSON.parse(await readFile(new URL(rel, ROOT), "utf8"));
const fileExists = async (rel) => stat(new URL(rel, ROOT)).then(() => true).catch(() => false);

// --- check runners: each returns { ok, evidence } or { skipped, evidence } ---
const runners = {
  async http({ url, expectStatus = 200, bodyContains = [] }) {
    const res = await fetch(url, { redirect: "follow" });
    const body = bodyContains.length ? await res.text() : "";
    const missing = bodyContains.filter((s) => !body.includes(s));
    const ok = res.status === expectStatus && missing.length === 0;
    return { ok, evidence: `${url} → ${res.status}${missing.length ? `, missing: ${missing.join(", ")}` : ""}` };
  },

  async "data-count"({ file, path, equals }) {
    const data = await loadJson(file);
    const n = (data[path] ?? []).length;
    return { ok: n === equals, evidence: `${file}.${path}.length = ${n} (expected ${equals})` };
  },

  async "details-populated"({ protocol, fields }) {
    const [{ protocols }, { details }] = [await loadJson("data/protocols.json"), await loadJson("data/details.json")];
    const ids = protocol ? [protocol] : protocols.map((p) => p.id);
    const missing = [];
    for (const id of ids) {
      const d = details[id] ?? {};
      for (const f of fields) if (!(d[f]?.length > 0)) missing.push(`${id}.${f}`);
    }
    return { ok: missing.length === 0, evidence: missing.length ? `${missing.length} missing: ${missing.slice(0, 6).join(", ")}${missing.length > 6 ? "…" : ""}` : `all ${ids.length} populated for ${fields.join("/")}` };
  },

  async "metric-live"() {
    const { protocols } = await loadJson("data/protocols.json");
    const withSlug = protocols.filter((p) => p.metric.slug);
    const failed = [];
    for (const p of withSlug) {
      const v = await fetchMetric(p.metric);
      if (typeof v !== "number") failed.push(p.metric.slug);
    }
    const skipped = protocols.length - withSlug.length;
    return { ok: failed.length === 0, evidence: failed.length ? `no numeric metric for: ${failed.join(", ")}` : `${withSlug.length} live, ${skipped} slug-less skipped (expected: morpho-vaults)` };
  },

  async "matrix-complete"() {
    const [{ protocols }, { feeds }, coverage, synced] = [
      await loadJson("data/protocols.json"), await loadJson("data/feeds.json"),
      await loadJson("data/coverage.json"), await loadJson("data/synced/defiscan.json"),
    ];
    const byPair = new Map();
    for (const e of coverage.entries ?? []) byPair.set(`${e.protocol}:${e.feed}`, e.status);
    for (const e of synced.entries ?? []) byPair.set(`${e.protocol}:${e.feed}`, e.status); // synced overrides
    let total = 0, bad = 0;
    for (const p of protocols) for (const f of feeds) {
      total++;
      const status = byPair.get(`${p.id}:${f.id}`) ?? "not-yet-covered";
      if (!STATUSES.includes(status)) bad++;
    }
    return { ok: bad === 0, evidence: `${total} cells (${protocols.length}×${feeds.length}), ${bad} unlabeled` };
  },

  async "file-contains"({ file, patterns }) {
    if (!(await fileExists(file))) return { ok: false, evidence: `${file} missing` };
    const text = await readFile(new URL(file, ROOT), "utf8");
    const missing = patterns.filter((p) => !text.toLowerCase().includes(p.toLowerCase()));
    return { ok: missing.length === 0, evidence: missing.length ? `${file} missing: ${missing.join(", ")}` : `${file} contains all ${patterns.length} patterns` };
  },

  async "gh-repo-flag"({ field, equals }) {
    const val = JSON.parse(gh(["repo", "view", "timfong888/defi-risk", "--json", field]))[field];
    return { ok: val === equals, evidence: `${field} = ${val} (expected ${equals})` };
  },

  async "file-not-contains"({ file, patterns }) {
    if (!(await fileExists(file))) return { ok: false, evidence: `${file} missing` };
    const text = await readFile(new URL(file, ROOT), "utf8");
    const present = patterns.filter((p) => text.includes(p));
    return { ok: present.length === 0, evidence: present.length ? `${file} still contains: ${present.join(", ")}` : `${file} clean of ${patterns.length} pattern(s)` };
  },

  async command({ cmd }) {
    try {
      execFileSync(cmd.split(" ")[0], cmd.split(" ").slice(1), { cwd: new URL(".", ROOT).pathname, stdio: "pipe" });
      return { ok: true, evidence: `\`${cmd}\` exited 0` };
    } catch (e) {
      const tail = (e.stdout?.toString() || e.stderr?.toString() || e.message).trim().split("\n").slice(-2).join(" ");
      return { ok: false, evidence: `\`${cmd}\` failed: ${tail}` };
    }
  },

  async "sync-automation"({ minScripts, minSyncedFiles }) {
    const wf = await readFile(new URL(".github/workflows/sync-feeds.yml", ROOT), "utf8").catch(() => "");
    const scripts = (wf.match(/node\s+scripts\/sync-[\w-]+\.mjs/g) ?? []).length;
    const { readdir } = await import("node:fs/promises");
    const syncedFiles = (await readdir(new URL("data/synced/", ROOT)).catch(() => [])).filter((f) => f.endsWith(".json")).length;
    const ok = scripts >= minScripts && syncedFiles >= minSyncedFiles;
    return { ok, evidence: `${scripts} sync scripts (need ${minScripts}), ${syncedFiles} synced files (need ${minSyncedFiles})` };
  },

  async "roadmap-present"({ file }) {
    const hasFile = await fileExists(file);
    const { feeds } = await loadJson("data/feeds.json");
    const noBlocker = feeds.filter((f) => !(f.coverageBlocker?.kind && f.coverageBlocker?.note)).map((f) => f.id);
    const ok = hasFile && noBlocker.length === 0;
    return { ok, evidence: `${file} ${hasFile ? "exists" : "MISSING"}; ${noBlocker.length} feeds missing coverageBlocker${noBlocker.length ? `: ${noBlocker.join(", ")}` : ""}` };
  },

  async "external-pr"({ allow }) {
    const out = gh(["pr", "list", "--repo", "timfong888/defi-risk", "--state", "merged", "--json", "number,author", "--limit", "100"]);
    const prs = JSON.parse(out || "[]");
    const external = prs.filter((pr) => !allow.includes(pr.author?.login));
    return { ok: external.length > 0, evidence: external.length ? `external PRs: ${external.map((p) => `#${p.number}`).join(", ")}` : `${prs.length} merged PRs, none external (allow: ${allow.join(", ")})` };
  },

  async attestation({ file, patterns }) {
    if (!(await fileExists(file))) return { ok: false, evidence: `${file} missing` };
    const text = await readFile(new URL(file, ROOT), "utf8");
    const missing = patterns.filter((p) => !text.includes(p));
    return { ok: missing.length === 0, evidence: missing.length ? `${file} missing fields: ${missing.join(", ")}` : `${file} complete` };
  },
};

// DefiLlama fetch, ported from lib/metrics.ts (same endpoints).
async function fetchMetric(metric) {
  try {
    if (metric.kind === "tvl") {
      const res = await fetch(`https://api.llama.fi/tvl/${metric.slug}`);
      if (!res.ok) return null;
      const n = await res.json();
      return typeof n === "number" ? n : null;
    }
    const res = await fetch(`https://api.llama.fi/summary/aggregators/${metric.slug}?dataType=dailyVolume`);
    if (!res.ok) return null;
    const d = await res.json();
    return typeof d.total24h === "number" ? d.total24h : null;
  } catch {
    return null;
  }
}

function gh(args) {
  return execFileSync("gh", args, { encoding: "utf8" });
}

async function selectIssues() {
  const issue = opt("--issue");
  const milestone = opt("--milestone");
  const entries = Object.entries(criteria);
  if (issue) {
    const hit = entries.filter(([n]) => n === String(issue));
    if (hit.length) return hit;
    // fall back to a sub-issue number via the generated mapping { key: {issue, parent} }
    const subs = await loadJson("acceptance/sub-issues.json").catch(() => ({}));
    const key = Object.keys(subs).find((k) => String(subs[k].issue) === String(issue));
    if (key) {
      const { parent } = subs[key];
      const checks = resolveSubChecks(parent, key);
      if (checks) return [[issue, { milestone: criteria[parent]?.milestone ?? "M1", title: `#${parent} ${key}`, checks }]];
    }
    return [];
  }
  if (milestone) return entries.filter(([, c]) => c.milestone === milestone);
  return entries; // --all / default
}

async function main() {
  const selected = await selectIssues();
  if (!selected.length) {
    console.error("No matching issues. Use --issue N, --milestone M1|M2, or --all.");
    process.exit(2);
  }

  const results = [];
  let autoTotal = 0, autoPass = 0, hardFail = false;

  for (const [num, c] of selected) {
    const checks = [];
    for (const chk of c.checks) {
      let r;
      if (offline && NETWORK_TYPES.has(chk.type)) {
        r = { status: "SKIP", evidence: "offline" };
      } else {
        const out = await runners[chk.type](chk).catch((e) => ({ ok: false, evidence: `error: ${e.message}` }));
        if (chk.tag === "human") {
          r = { status: out.ok ? "PASS" : "BLOCKED", evidence: out.evidence };
        } else {
          r = { status: out.ok ? "PASS" : "FAIL", evidence: out.evidence };
          autoTotal++;
          if (out.ok) autoPass++;
          else hardFail = true;
        }
      }
      checks.push({ id: chk.id, desc: chk.desc, tag: chk.tag, ...r });
    }
    results.push({ issue: Number(num), milestone: c.milestone, title: c.title, checks });
  }

  const pct = autoTotal ? Math.round((autoPass / autoTotal) * 100) : 100;

  if (asJson) {
    console.log(JSON.stringify({ pct, autoPass, autoTotal, results }, null, 2));
  } else {
    const icon = { PASS: "✓", FAIL: "✗", BLOCKED: "⊘", SKIP: "·" };
    for (const r of results) {
      console.log(`\n#${r.issue} [${r.milestone}] ${r.title}`);
      for (const c of r.checks) console.log(`  ${icon[c.status]} ${c.status.padEnd(7)} ${c.desc}\n        ${c.evidence}`);
    }
    console.log(`\nAuto-verifiable: ${autoPass}/${autoTotal} (${pct}%)  •  human-gated checks reported as ⊘ BLOCKED`);
  }

  process.exit(hardFail ? 1 : 0);
}

main();
