import Link from "next/link";
import { excludedFeeds, getCell, orderedFeeds, protocols, type Feed } from "@/lib/data";
import FeedMatrixFilter from "./FeedMatrixFilter";

export const metadata = {
  title: "Risk Feeds — DeFi Risk Intelligence Aggregator",
};

const TYPE_STYLE: Record<string, string> = {
  Rating: "bg-indigo-50 text-indigo-700",
  Dashboard: "bg-sky-50 text-sky-700",
  Monitoring: "bg-rose-50 text-rose-700",
  Research: "bg-violet-50 text-violet-700",
};

type Tri = "yes" | "no" | "unknown";

// Derive the API-access matrix columns from the orthogonal #66 access flags.
function apiFreePublic(api: Feed["accessibility"]["api"]): Tri {
  return api === "open" ? "yes" : api === "unknown" ? "unknown" : "no";
}
function apiPaidOnly(api: Feed["accessibility"]["api"]): Tri {
  return api === "paid" ? "yes" : api === "unknown" ? "unknown" : "no";
}

// ✓ / ✗ / ? cell for the access matrix.
function AccessMark({ v }: { v: Tri }) {
  const mark = v === "yes" ? "✓" : v === "no" ? "✗" : "?";
  const cls =
    v === "yes" ? "text-emerald-600" : v === "no" ? "text-gray-300" : "text-amber-500";
  return (
    <span
      className={`font-semibold ${cls}`}
      title={v === "unknown" ? "not yet verified" : v}
    >
      {mark}
    </span>
  );
}

// Whether the feed's data is reachable by this aggregator (not what the
// provider offers publicly). Absent ≡ "unknown".
const AGG_STYLE: Record<NonNullable<Feed["aggregatorStatus"]>, { label: string; style: string; title: string }> = {
  live: { label: "live", style: "bg-emerald-50 text-emerald-700", title: "actively synced into the aggregator" },
  available: { label: "available", style: "bg-sky-50 text-sky-700", title: "usable API + validated path; auto-sync pending" },
  none: { label: "—", style: "bg-gray-100 text-gray-400", title: "no programmatic access available to us" },
  unknown: { label: "?", style: "bg-amber-50 text-amber-600", title: "not yet assessed" },
};

function AggStatus({ s }: { s: Feed["aggregatorStatus"] }) {
  const a = AGG_STYLE[s ?? "unknown"];
  return (
    <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${a.style}`} title={a.title}>
      {a.label}
    </span>
  );
}

const BLOCKER_LABEL: Record<string, { label: string; style: string }> = {
  "provider-scope": {
    label: "provider scope",
    style: "bg-gray-100 text-gray-600",
  },
  "access-gated": {
    label: "access gated",
    style: "bg-amber-50 text-amber-700",
  },
  "verification-pending": {
    label: "verification pending",
    style: "bg-sky-50 text-sky-700",
  },
};


export default function FeedsPage() {
  const categories = Array.from(new Set(protocols.map((p) => p.category)));

  // covered/partial coverage per feed per protocol, for the interactive filter
  const coverage: Record<string, Record<string, "covered" | "partial">> = {};
  for (const f of orderedFeeds) {
    coverage[f.id] = {};
    for (const p of protocols) {
      const status = getCell(p.id, f.id).status;
      if (status === "covered" || status === "partial")
        coverage[f.id][p.id] = status;
    }
  }

  // covered/partial counts per feed per protocol category
  const counts = (feedId: string, category: string) => {
    let covered = 0;
    let partial = 0;
    for (const p of protocols.filter((p) => p.category === category)) {
      const status = getCell(p.id, feedId).status;
      if (status === "covered") covered++;
      else if (status === "partial") partial++;
    }
    return { covered, partial };
  };

  // Seed-protocol coverage per feed, across all categories — recomputes from
  // protocols + coverage data, so the X / N count is never hardcoded.
  const feedCoverage = (feedId: string) => {
    let covered = 0;
    let partial = 0;
    for (const p of protocols) {
      const status = getCell(p.id, feedId).status;
      if (status === "covered") covered++;
      else if (status === "partial") partial++;
    }
    return { covered, partial };
  };

  return (
    <div className="max-w-6xl space-y-10">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">
          Risk feed registry
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm text-gray-600">
          The {orderedFeeds.length} independent feeds aggregated by this site —
          what each one does, how its data is accessed, and where its coverage
          of the seed protocols stands. Inclusion follows the{" "}
          <a
            href="https://github.com/timfong888/defi-risk/blob/main/design/community-contribution-model.md"
            className="underline"
          >
            mechanical feed-inclusion rule
          </a>
          ; no single feed is canonical.
        </p>
        <p className="mt-1.5 text-xs text-gray-500">
          Each feed is shown as an access matrix — <strong>API documented</strong>,{" "}
          <strong>API free &amp; public</strong>, <strong>API paid only</strong>,{" "}
          <strong>open methodology</strong>, and <strong>public dashboard</strong>{" "}
          (✓ yes · ✗ no · ? not yet verified) — plus whether its data is{" "}
          <strong>available to this aggregator</strong> (live · available · —)
          and how many of the {protocols.length} seed protocols it covers.
        </p>
        <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-3 py-2 font-medium border-b border-gray-200">Feed</th>
                <th className="px-2 py-2 font-medium border-b border-gray-200 text-center">API documented</th>
                <th className="px-2 py-2 font-medium border-b border-gray-200 text-center">API free &amp; public</th>
                <th className="px-2 py-2 font-medium border-b border-gray-200 text-center">API paid only</th>
                <th className="px-2 py-2 font-medium border-b border-gray-200 text-center">Open methodology</th>
                <th className="px-2 py-2 font-medium border-b border-gray-200 text-center">Public dashboard</th>
                <th className="px-2 py-2 font-medium border-b border-gray-200 text-center whitespace-nowrap">Available to aggregator</th>
                <th className="px-2 py-2 font-medium border-b border-gray-200 text-center whitespace-nowrap">Seed coverage</th>
              </tr>
            </thead>
            <tbody>
              {orderedFeeds.map((f) => {
                const a = f.accessibility;
                const cov = feedCoverage(f.id);
                return (
                  <tr
                    key={f.id}
                    id={`feed-${f.id}`}
                    className="scroll-mt-20 border-b border-gray-100 align-top last:border-0"
                  >
                    <td className="px-3 py-2">
                      <a href={f.url} className="font-medium hover:underline">
                        {f.name}
                      </a>
                      <span
                        className={`ml-2 rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TYPE_STYLE[f.type]}`}
                      >
                        {f.type}
                      </span>
                      <span className="mt-0.5 block max-w-md text-xs text-gray-500">
                        {f.focus}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center"><AccessMark v={a.apiDocumented} /></td>
                    <td className="px-2 py-2 text-center"><AccessMark v={apiFreePublic(a.api)} /></td>
                    <td className="px-2 py-2 text-center"><AccessMark v={apiPaidOnly(a.api)} /></td>
                    <td className="px-2 py-2 text-center"><AccessMark v={a.methodologyOpen} /></td>
                    <td className="px-2 py-2 text-center"><AccessMark v={a.publicDashboard} /></td>
                    <td className="px-2 py-2 text-center"><AggStatus s={f.aggregatorStatus} /></td>
                    <td className="px-2 py-2 text-center tabular-nums whitespace-nowrap">
                      {cov.covered + cov.partial} / {protocols.length}
                      {cov.partial > 0 && (
                        <span className="block text-[11px] text-gray-400">
                          {cov.covered} full · {cov.partial} partial
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section id="find" className="scroll-mt-20">
        <h2 className="text-lg font-semibold">Find feeds by protocol</h2>
        <p className="mt-1 max-w-3xl text-sm text-gray-600">
          Type the protocol(s) you care about — the list narrows to the feeds
          that actually cover them, so you can see at a glance who assesses what.
        </p>
        <div className="mt-3">
          <FeedMatrixFilter
            feeds={orderedFeeds.map((f) => ({
              id: f.id,
              name: f.name,
              type: f.type,
              focus: f.focus,
            }))}
            protocols={protocols.map((p) => ({
              id: p.id,
              name: p.name,
              category: p.category,
            }))}
            coverage={coverage}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">
          Coverage by protocol category
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          How many of the seed protocols in each category every feed covers
          (● covered · ◐ partial). Empty cells mean no coverage in that
          category yet — see the blockers below for why.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-3 py-2 font-medium border-b border-gray-200">
                  Feed
                </th>
                {categories.map((c) => (
                  <th
                    key={c}
                    className="px-3 py-2 font-medium border-b border-gray-200 text-center whitespace-nowrap"
                  >
                    {c}
                    <span className="block text-[11px] font-normal text-gray-400">
                      {protocols.filter((p) => p.category === c).length}{" "}
                      protocols
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orderedFeeds.map((f) => (
                <tr key={f.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-1.5 whitespace-nowrap font-medium">
                    {f.name}
                  </td>
                  {categories.map((c) => {
                    const { covered, partial } = counts(f.id, c);
                    return (
                      <td key={c} className="px-3 py-1.5 text-center tabular-nums">
                        {covered + partial === 0 ? (
                          <span className="text-gray-300">—</span>
                        ) : (
                          <>
                            {covered > 0 && (
                              <span className="text-emerald-700">
                                {covered}●
                              </span>
                            )}
                            {partial > 0 && (
                              <span className="ml-1 text-amber-700">
                                {partial}◐
                              </span>
                            )}
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="gaps" className="scroll-mt-20">
        <h2 className="text-lg font-semibold">What blocks coverage</h2>
        <p className="mt-1 max-w-3xl text-sm text-gray-600">
          For every cell that is not yet covered, the blocker is one of three
          things: the provider doesn&apos;t cover that protocol class
          (their scope, not a defect), the data is gated behind keys or
          agreements and may be paid and require fees, or we haven&apos;t yet
          verified the provider&apos;s data access first-hand (our verification
          work).
        </p>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-1 pr-3 font-medium">Feed</th>
              <th className="py-1 pr-3 font-medium">Blocker</th>
              <th className="py-1 font-medium">Detail &amp; what unblocks it</th>
            </tr>
          </thead>
          <tbody>
            {orderedFeeds.map((f) => {
              const b = BLOCKER_LABEL[f.coverageBlocker.kind];
              return (
                <tr key={f.id} className="border-b border-gray-100 align-top">
                  <td className="py-1.5 pr-3 whitespace-nowrap font-medium">
                    {f.name}
                  </td>
                  <td className="py-1.5 pr-3 whitespace-nowrap">
                    <span className={`rounded px-1.5 py-0.5 text-xs ${b.style}`}>
                      {b.label}
                    </span>
                  </td>
                  <td className="py-1.5 text-gray-600">
                    {f.coverageBlocker.note}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-gray-500">
          Back to the{" "}
          <Link href="/" className="underline">
            coverage matrix
          </Link>
          .
        </p>
      </section>

      {excludedFeeds.length > 0 && (
        <section id="excluded" className="scroll-mt-20">
          <h2 className="text-lg font-semibold">Considered but excluded</h2>
          <p className="mt-1 max-w-3xl text-sm text-gray-600">
            A feed must be inspectable first-hand. A source we cannot verify is
            excluded and labeled here — never silently displayed — and would be
            re-included if a live, inspectable product appears.
          </p>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-1 pr-3 font-medium">Feed</th>
                <th className="py-1 pr-3 font-medium">Why excluded</th>
                <th className="py-1 font-medium">Checked</th>
              </tr>
            </thead>
            <tbody>
              {excludedFeeds.map((f) => (
                <tr key={f.id} className="border-b border-gray-100 align-top">
                  <td className="py-1.5 pr-3 whitespace-nowrap font-medium">
                    {f.name}
                  </td>
                  <td className="py-1.5 pr-3 text-gray-600">{f.reason}</td>
                  <td className="py-1.5 whitespace-nowrap text-gray-500">
                    {f.checked}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
