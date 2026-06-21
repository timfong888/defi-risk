// Syncs DeFiScan stage reviews from their open-source repo
// (github.com/deficollective/defiscan) into data/synced/defiscan.json.
// Ethereum-mainnet reviews only, per RFP scope. Run: node scripts/sync-defiscan.mjs
// Anyone can re-run this script and reproduce the data — that is the
// project's operational definition of a verifiable source.

import { readFile, writeFile, mkdir } from "node:fs/promises";

const REPO = "deficollective/defiscan";
const RAW = `https://raw.githubusercontent.com/${REPO}/main`;
// Canonical DeFiScan protocol-page base. Per-cell sourceUrl is `${PROTOCOL_BASE}/<our-protocol-id>`.
const PROTOCOL_BASE = "https://www.defiscan.info/protocol";

// our protocol id -> DeFiScan review ids (versions within our RFP scope).
// NB: the MAPPING keys (our protocol ids) double as DeFiScan's canonical protocol-page slugs —
// all 9 verified resolving at `${PROTOCOL_BASE}/<key>` on 2026-06-21. If a future protocol's id
// ever diverges from its DeFiScan slug, give that entry an explicit slug and use it below.
const MAPPING = {
  aave: [{ id: "aave", label: "Aave v3" }],
  compound: [
    { id: "compound-v2", label: "Compound v2" },
    { id: "compound-v3", label: "Compound v3" },
  ],
  curve: [{ id: "curve-finance", label: "Curve" }],
  lido: [{ id: "lido-v2", label: "Lido v2" }],
  liquity: [{ id: "liquity", label: "Liquity v1" }],
  morpho: [{ id: "morpho", label: "Morpho" }],
  pendle: [{ id: "pendle", label: "Pendle" }],
  spark: [{ id: "spark", label: "Spark" }],
  uniswap: [{ id: "uniswap-v3", label: "Uniswap v3" }],
};

const RISK_DIMENSIONS = [
  "Chain",
  "Upgradeability",
  "Autonomy",
  "Exit Window",
  "Accessibility",
];

const STAGE_LABEL = {
  O: "Unqualified",
  V: "Variable",
  R: "Under Review",
  I0: "Infrastructure Stage 0",
  I1: "Infrastructure Stage 1",
  I2: "Infrastructure Stage 2",
};

function stageLabel(raw) {
  if (/^\d+$/.test(raw)) return `Stage ${raw}`;
  return STAGE_LABEL[raw] ?? `Stage ${raw}`;
}

async function fetchReview(defiscanId) {
  const res = await fetch(
    `${RAW}/src/content/protocols/${defiscanId}/ethereum.md`
  );
  if (!res.ok) return null;
  const text = await res.text();
  const stage = text.match(/^stage:\s*"?([\w-]+)"?/m)?.[1];
  const risksRaw = text.match(/^risks:\s*\[([^\]]*)\]/m)?.[1];
  const updated =
    text.match(/^update_date:\s*"?(\d{4}-\d{2}-\d{2})"?/m)?.[1] ?? null;
  const published =
    text.match(/^publish_date:\s*"?(\d{4}-\d{2}-\d{2})"?/m)?.[1] ?? null;
  if (stage === undefined || !risksRaw) return null;
  const risks = risksRaw
    .split(",")
    .map((s) => s.replaceAll(/["'\s]/g, ""))
    .filter(Boolean);
  // Transcription guard: our output maps risks to dimensions BY POSITION.
  // If upstream changes the array shape, refusing to transcribe is the only
  // honest behavior — a misattributed risk level misrepresents the provider.
  if (risks.length !== RISK_DIMENSIONS.length) {
    throw new Error(
      `upstream schema drift: ${defiscanId} has ${risks.length} risk dimensions, expected ${RISK_DIMENSIONS.length} — update the transcription spec before syncing`
    );
  }
  if (!risks.every((r) => ["L", "M", "H", "-"].includes(r))) {
    throw new Error(
      `upstream schema drift: ${defiscanId} has unknown risk level in [${risks}]`
    );
  }
  // 1970-01-01 is DeFiScan's "never updated" sentinel
  const date = updated && updated !== "1970-01-01" ? updated : published;
  return { stage, risks, date };
}

const entries = [];
for (const [protocol, reviews] of Object.entries(MAPPING)) {
  const parts = [];
  let latest = null;
  for (const r of reviews) {
    const review = await fetchReview(r.id);
    if (!review) {
      console.warn(`warn: no ethereum.md review for ${r.id}`);
      continue;
    }
    const riskStr = review.risks
      .map((level, i) => `${RISK_DIMENSIONS[i]} ${level}`)
      .join(" · ");
    parts.push(`${r.label} (Ethereum): ${stageLabel(review.stage)} — ${riskStr}`);
    if (review.date && (!latest || review.date > latest)) latest = review.date;
  }
  if (parts.length === 0) continue;
  entries.push({
    protocol,
    feed: "defiscan",
    status: "covered",
    provenance: "provider-published",
    verbatim: parts.join(" | "),
    note: "Decentralization stage review",
    sourceUrl: `${PROTOCOL_BASE}/${protocol}`,
    updated: latest,
  });
}

// Regression guard: a protocol silently vanishing from the synced file would
// downgrade a provider-verified cell back to manual/pending with no signal.
// Refuse to write fewer entries than the committed file — a real upstream
// removal must be acknowledged by deleting it from MAPPING deliberately.
const outPath = new URL("../data/synced/defiscan.json", import.meta.url);
try {
  const prev = JSON.parse(await readFile(outPath, "utf8"));
  if (entries.length < prev.entries.length) {
    throw new Error(
      `entry-count regression: ${entries.length} < ${prev.entries.length} committed — upstream review missing or moved; investigate before syncing`
    );
  }
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}

const out = {
  $comment:
    "Generated by scripts/sync-defiscan.mjs — do not edit by hand. Re-run the script to refresh; corrections belong upstream at github.com/deficollective/defiscan.",
  feed: "defiscan",
  source: `https://github.com/${REPO}`,
  generatedAt: new Date().toISOString(),
  entries,
};

await mkdir(new URL("../data/synced/", import.meta.url), { recursive: true });
await writeFile(outPath, JSON.stringify(out, null, 2) + "\n");
console.log(`synced ${entries.length} protocols from DeFiScan`);
