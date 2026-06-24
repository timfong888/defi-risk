// Validates that the Xerberus Risk Ratings API is reachable and returns
// aggregatable data, using the credentials provisioned in the environment.
// This is the `api`-mechanism counterpart to scripts/sync-defiscan.mjs (`repo`)
// and is the operational proof behind feeds.json `xerberus.aggregatorStatus`.
//
// Run (locally or in the Vercel runtime where XERBERUS_API is injected):
//   XERBERUS_API=<key> XERBERUS_USER_EMAIL=<account-email> node scripts/validate-xerberus.mjs
//
// Exit 0 = API returned a valid rating (data is aggregatable); exit 1 = failure.
// Anyone can re-run this to reproduce the verification — the project's
// operational definition of a verifiable source.

const ENDPOINT = "https://api.xerberus.io/public/v1/risk/rating/index";

// A stable Ethereum probe set (USDC + USDT). We only assert the API returns a
// well-formed rating — not a specific grade — so the check stays deterministic.
const PROBE = {
  ecosystem: "ethereum",
  assets: [
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
  ],
};

const apiKey = process.env.XERBERUS_API;
const userEmail = process.env.XERBERUS_USER_EMAIL;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

if (!apiKey) fail("XERBERUS_API is not set (Vercel sensitive var; inject at runtime).");
if (!userEmail) fail("XERBERUS_USER_EMAIL is not set (the Xerberus account email).");

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "x-user-email": userEmail,
  },
  body: JSON.stringify(PROBE),
}).catch((e) => fail(`request error: ${e.message}`));

if (res.status === 429) fail("rate limited (429) — retry later; endpoint is reachable.");
if (!res.ok) fail(`HTTP ${res.status} — ${await res.text()}`);

const json = await res.json().catch(() => fail("response was not JSON"));
if (json.status !== "success" || json.data?.index_rating == null)
  fail(`unexpected response shape: ${JSON.stringify(json)}`);

console.log(
  `OK: Xerberus API returned index_rating="${json.data.index_rating}" for ` +
    `${json.data.processed_assets ?? PROBE.assets.length} ethereum assets. Data is aggregatable.`
);
process.exit(0);
