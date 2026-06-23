import Link from "next/link";
import { excludedFeeds, getCell, orderedFeeds, protocols } from "@/lib/data";
import { ApiPill, Cap } from "@/components/AccessBadges";
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
          Each feed is tagged by <strong>API access</strong> (open · permissioned
          · paid · none) and whether it offers <strong>API docs</strong>, a{" "}
          <strong>public dashboard</strong>, and an{" "}
          <strong>open methodology</strong> (✓ yes · ✗ no · ? not yet verified).
        </p>
        <div className="mt-4 space-y-3">
          {orderedFeeds.map((f) => (
            <div
              key={f.id}
              id={`feed-${f.id}`}
              className="scroll-mt-20 rounded-lg border border-gray-200 p-3"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <a href={f.url} className="font-medium hover:underline">
                  {f.name}
                </a>
                <span
                  className={`rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TYPE_STYLE[f.type]}`}
                >
                  {f.type}
                </span>
                <ApiPill api={f.accessibility.api} />
                <Cap label="API docs" v={f.accessibility.apiDocumented} />
                <Cap label="Dashboard" v={f.accessibility.publicDashboard} />
                <Cap label="Methodology" v={f.accessibility.methodologyOpen} />
                {f.accessibility.verified && (
                  <span className="text-[11px] text-emerald-600">verified</span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-700">{f.focus}</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {f.accessibility.note}
              </p>
            </div>
          ))}
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
          agreements (our outreach work), or we haven&apos;t yet verified the
          provider&apos;s data access first-hand (our verification work).
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
