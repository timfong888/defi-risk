// Issue #46: a covered/partial cell may carry a per-cell dashboard URL (`sourceUrl`) so the
// protocol detail page can link through to the provider's actual dashboard, not just its home page.
// This pins the data contract; the live render is covered by the #46 `http` acceptance check.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const root = new URL("../", import.meta.url);
const load = async (p) => JSON.parse(await readFile(new URL(p, root), "utf8"));

test("every coverage entry sourceUrl is an https URL", async () => {
  const { entries } = await load("data/coverage.json");
  for (const e of entries) {
    if (e.sourceUrl !== undefined) {
      assert.match(e.sourceUrl, /^https:\/\/\S+$/, `${e.protocol}:${e.feed} sourceUrl must be https`);
    }
  }
});

test("morpho-vaults × blockanalitica links its public dashboard (issue #46 seed)", async () => {
  const { entries } = await load("data/coverage.json");
  const cell = entries.find((e) => e.protocol === "morpho-vaults" && e.feed === "blockanalitica");
  assert.ok(cell, "expected a morpho-vaults×blockanalitica coverage entry");
  assert.notEqual(cell.status, "not-yet-covered");
  assert.equal(cell.sourceUrl, "https://morpho.blockanalitica.com/");
});

test("validate-data accepts coverage sourceUrl", () => {
  // throws (non-zero exit) if the schema validator rejects the new field
  execFileSync("node", ["scripts/validate-data.mjs"], { cwd: root.pathname, stdio: "pipe" });
});
