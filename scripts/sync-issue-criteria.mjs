// Renders the acceptance criteria from acceptance/criteria.mjs into the GitHub issue bodies,
// and (with --subs) maintains one sub-issue per protocol under #5.
// Usage:
//   node scripts/sync-issue-criteria.mjs [--dry-run]            # update the 12 parent issues
//   node scripts/sync-issue-criteria.mjs --subs [--dry-run]     # also create/link/update sub-issues
//   node scripts/sync-issue-criteria.mjs --check [--issue N]    # render boxes from live verification
// Idempotent: the criteria block lives between HTML markers and is replaced in place. With --check,
// each criterion's checkbox reflects the verifier's current PASS state (durable, not reset on resync).

import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { criteria, milestones, subIssueChecks, subStories } from "../acceptance/criteria.mjs";

const REPO = "timfong888/defi-risk";
const SUB_PARENTS = [5, 6, 10]; // issues whose work is broken into native sub-issues
const START = "<!-- acceptance:start -->";
const END = "<!-- acceptance:end -->";
const dry = process.argv.includes("--dry-run");
const doSubs = process.argv.includes("--subs");
const doCheck = process.argv.includes("--check");
const onlyIssue = (() => { const i = process.argv.indexOf("--issue"); return i >= 0 ? process.argv[i + 1] : null; })();

const gh = (args, input) => execFileSync("gh", args, { encoding: "utf8", input });
const ROOT = new URL("../", import.meta.url);

// Run the verifier for one issue and return { checkId: "PASS"|"FAIL"|"BLOCKED" }. The verifier exits
// non-zero when an auto check fails, so read stdout from the thrown error too.
function verifyStatuses(num) {
  let out;
  try {
    out = execFileSync("node", ["scripts/verify-acceptance.mjs", "--issue", String(num), "--json"],
      { cwd: ROOT.pathname, encoding: "utf8" });
  } catch (e) {
    out = e.stdout?.toString() ?? "";
  }
  const map = {};
  try {
    for (const r of JSON.parse(out).results) for (const c of r.checks) map[c.id] = c.status;
  } catch { /* leave empty → boxes render unchecked */ }
  return map;
}

function renderBlock(issueNum, checks, statuses) {
  const lines = checks.map((c) => {
    const passed = statuses?.[c.id] === "PASS";
    const tag = c.tag === "human" ? "`👤 human-gated`" : "`✓ auto`";
    return `- [${passed ? "x" : " "}] **${c.id}** — ${c.desc} ${tag}`;
  });
  return [
    START,
    "## Acceptance Criteria",
    "",
    `_Verified by \`node scripts/verify-acceptance.mjs --issue ${issueNum}\`. ✓ auto = machine-checkable; 👤 = needs a person._`,
    "",
    ...lines,
    END,
  ].join("\n");
}

function spliceBody(body, block) {
  const i = body.indexOf(START), j = body.indexOf(END);
  if (i >= 0 && j > i) return body.slice(0, i) + block + body.slice(j + END.length);
  return `${body.trim()}\n\n${block}\n`;
}

function updateIssue(num, checks) {
  const statuses = doCheck ? verifyStatuses(num) : undefined;
  const body = gh(["issue", "view", String(num), "--repo", REPO, "--json", "body", "-q", ".body"]);
  const next = spliceBody(body, renderBlock(num, checks, statuses));
  if (next === body) return `#${num} unchanged`;
  if (dry) return `#${num} would update (${checks.length} criteria)`;
  gh(["issue", "edit", String(num), "--repo", REPO, "--body-file", "-"], next);
  const done = statuses ? Object.values(statuses).filter((s) => s === "PASS").length : 0;
  return `#${num} updated (${checks.length} criteria${statuses ? `, ${done} checked` : ""})`;
}

// The sub-issues a parent breaks into: {key, issueTitle, body, checks}. Titles are deterministic
// so existing sub-issues are matched by exact title (no duplicate creation on re-run).
async function itemsFor(parent) {
  if (parent === 5) {
    const { protocols } = JSON.parse(await readFile(new URL("data/protocols.json", ROOT), "utf8"));
    return protocols.map((p) => ({
      key: p.id,
      issueTitle: `#5 protocol: ${p.id}`,
      body: `Populate detail data and detail page for **${p.name}** (\`${p.id}\`). Sub-issue of #5.`,
      checks: subIssueChecks(p.id),
    }));
  }
  return (subStories[parent] ?? []).map((s) => ({
    key: s.key,
    issueTitle: `#${parent} ${s.key}: ${s.title}`,
    body: `${s.title}. Sub-issue of #${parent}.`,
    checks: s.checks,
  }));
}

async function syncSubIssues() {
  const all = JSON.parse(gh(["issue", "list", "--repo", REPO, "--state", "all", "--limit", "200", "--json", "number,title"]));
  const byTitle = new Map(all.map((i) => [i.title, i.number]));
  const mapping = {};
  const log = [];

  for (const parent of SUB_PARENTS) {
    const label = milestones[criteria[parent].milestone];
    for (const item of await itemsFor(parent)) {
      let num = byTitle.get(item.issueTitle);
      if (!num) {
        if (dry) { log.push(`would create "${item.issueTitle}" under #${parent}`); continue; }
        num = Number(gh(["issue", "create", "--repo", REPO, "--title", item.issueTitle,
          "--body", item.body, "--milestone", label]).trim().split("/").pop());
        const childId = JSON.parse(gh(["api", `repos/${REPO}/issues/${num}`, "--jq", "{id}"])).id;
        gh(["api", `repos/${REPO}/issues/${parent}/sub_issues`, "-F", `sub_issue_id=${childId}`]); // native link (typed int)
        log.push(`created #${num} "${item.issueTitle}" + linked to #${parent}`);
      }
      mapping[item.key] = { issue: num, parent };
      log.push(updateIssue(num, item.checks));
    }
  }

  if (!dry) await writeFile(new URL("acceptance/sub-issues.json", ROOT), JSON.stringify(mapping, null, 2) + "\n");
  return log;
}

async function main() {
  const log = [];
  for (const [num, c] of Object.entries(criteria)) {
    if (onlyIssue && num !== String(onlyIssue)) continue;
    log.push(updateIssue(num, c.checks));
  }
  if (doSubs) log.push(...(await syncSubIssues()));
  console.log(log.join("\n"));
  console.log(dry ? "\n(dry run — nothing written)" : "\nDone.");
}

main();
