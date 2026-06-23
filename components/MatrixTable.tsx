"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { iconSlugFor, type CoverageCell, type Feed, type Protocol } from "@/lib/data";

export interface MatrixRow {
  protocol: Protocol;
  metricValue: number | null;
  metricLabel: string;
  metricStale: boolean; // serving last-known snapshot after live fetch failed
  cells: Record<string, CoverageCell>; // feedId -> cell
}

const STATUS = {
  covered: {
    dot: "bg-emerald-500",
    seg: "bg-emerald-400",
    label: "Covered",
  },
  partial: {
    dot: "bg-amber-400",
    seg: "bg-amber-300",
    label: "Partial",
  },
  "not-yet-covered": {
    dot: "bg-gray-200",
    seg: "bg-gray-200",
    label: "Not yet covered",
  },
} as const;

const TYPE_STYLE: Record<string, string> = {
  Rating: "bg-indigo-50 text-indigo-700",
  Dashboard: "bg-sky-50 text-sky-700",
  Monitoring: "bg-rose-50 text-rose-700",
  Research: "bg-violet-50 text-violet-700",
};

type SortKey = "metric" | "name" | "coverage";

function ProtocolMark({ protocol }: { protocol: Protocol }) {
  const iconSlug = iconSlugFor(protocol);
  if (!iconSlug) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
        {protocol.name[0]}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://icons.llamao.fi/icons/protocols/${iconSlug}?w=48&h=48`}
      alt=""
      width={24}
      height={24}
      className="h-6 w-6 shrink-0 rounded-full bg-gray-100 ring-1 ring-gray-200"
    />
  );
}

export function CoverageStrip({
  feeds,
  cells,
  className = "",
}: {
  feeds: Feed[];
  cells: Record<string, CoverageCell>;
  className?: string;
}) {
  return (
    <span className={`flex h-2 w-full gap-px overflow-hidden rounded-sm ${className}`}>
      {feeds.map((f) => (
        <span
          key={f.id}
          className={`flex-1 ${STATUS[cells[f.id].status].seg}`}
          title={`${f.name}: ${STATUS[cells[f.id].status].label}`}
        />
      ))}
    </span>
  );
}

export default function MatrixTable({
  rows,
  feeds,
}: {
  rows: MatrixRow[];
  feeds: Feed[]; // expected pre-ordered by methodology type
}) {
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("metric");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => r.protocol.category)))],
    [rows]
  );

  const familyCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) {
      counts.set(r.protocol.family, (counts.get(r.protocol.family) ?? 0) + 1);
    }
    return counts;
  }, [rows]);

  // Column groups: contiguous runs of the same feed type (feeds arrive sorted).
  const typeGroups = useMemo(() => {
    const groups: { type: string; span: number }[] = [];
    for (const f of feeds) {
      const last = groups[groups.length - 1];
      if (last && last.type === f.type) last.span += 1;
      else groups.push({ type: f.type, span: 1 });
    }
    return groups;
  }, [feeds]);

  const maxTvl = useMemo(
    () =>
      Math.max(
        1,
        ...rows
          .filter((r) => r.protocol.metric.kind === "tvl")
          .map((r) => r.metricValue ?? 0)
      ),
    [rows]
  );

  const coverageCount = (row: MatrixRow) =>
    feeds.reduce(
      (n, f) =>
        n +
        (row.cells[f.id].status === "covered"
          ? 1
          : row.cells[f.id].status === "partial"
            ? 0.5
            : 0),
      0
    );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows.filter(
      (r) =>
        (category === "All" || r.protocol.category === category) &&
        (q === "" ||
          r.protocol.name.toLowerCase().includes(q) ||
          r.protocol.category.toLowerCase().includes(q))
    );
    return [...filtered].sort((a, b) => {
      if (sortKey === "name") return a.protocol.name.localeCompare(b.protocol.name);
      if (sortKey === "coverage") return coverageCount(b) - coverageCount(a);
      return (b.metricValue ?? -1) - (a.metricValue ?? -1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, category, query, sortKey, feeds]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search protocols…"
          className="w-44 rounded-md border border-gray-300 px-2.5 py-1 text-sm placeholder:text-gray-400 focus:border-gray-500 focus:outline-none"
        />
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-0.5 transition-colors ${
              category === c
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 text-gray-600 hover:border-gray-500"
            }`}
          >
            {c}
          </button>
        ))}
        <span className="ml-auto text-gray-500">
          Sort:
          {(
            [
              ["metric", "TVL / volume"],
              ["coverage", "coverage"],
              ["name", "name"],
            ] as [SortKey, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              className={`ml-2 underline-offset-2 ${
                sortKey === k ? "font-semibold text-gray-900" : "underline"
              }`}
            >
              {label}
            </button>
          ))}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 border-b border-gray-200 bg-white" colSpan={3} />
              {typeGroups.map((g) => (
                <th
                  key={g.type}
                  colSpan={g.span}
                  className={`border-b border-l border-gray-200 px-1 py-1 text-center text-[11px] font-semibold uppercase tracking-wide ${TYPE_STYLE[g.type]}`}
                >
                  {g.type}
                </th>
              ))}
            </tr>
            <tr className="text-left">
              <th className="sticky left-0 z-10 border-b border-gray-200 bg-white px-3 py-2 align-bottom font-medium">
                Protocol
              </th>
              <th className="border-b border-gray-200 px-3 py-2 align-bottom font-medium whitespace-nowrap">
                TVL / 24h vol
              </th>
              <th className="border-b border-gray-200 px-3 py-2 align-bottom font-medium">
                Coverage
              </th>
              {feeds.map((f, i) => (
                <th
                  key={f.id}
                  className={`h-28 border-b border-gray-200 px-1.5 pb-2 text-xs font-medium text-gray-600 align-bottom ${
                    i > 0 && feeds[i - 1].type !== f.type ? "border-l" : ""
                  }`}
                  title={`${f.name} — ${f.focus}`}
                >
                  <span className="inline-block rotate-180 whitespace-nowrap [writing-mode:vertical-rl]">
                    <Link href={`/feeds#feed-${f.id}`} className="hover:underline">
                      {f.name}
                    </Link>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={row.protocol.id}
                className="group border-b border-gray-100 last:border-0 hover:bg-blue-50/40"
              >
                <td className="sticky left-0 z-10 bg-white px-3 py-2 whitespace-nowrap group-hover:bg-blue-50">
                  <span className="flex items-center gap-2">
                    <ProtocolMark protocol={row.protocol} />
                    <span>
                      <Link
                        href={`/protocol/${row.protocol.id}`}
                        className="font-medium hover:underline"
                      >
                        {row.protocol.name}
                      </Link>
                      {row.protocol.versions && (
                        <span className="ml-1.5 text-xs text-gray-400">
                          {row.protocol.versions.join(" · ")}
                        </span>
                      )}
                      {(familyCounts.get(row.protocol.family) ?? 0) > 1 && (
                        <span className="ml-1.5 rounded bg-indigo-50 px-1 text-[11px] text-indigo-600">
                          {row.protocol.family}
                        </span>
                      )}
                      <span className="block text-xs text-gray-400">
                        {row.protocol.category}
                      </span>
                    </span>
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                  {row.metricLabel === "pending" ? (
                    <span
                      className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500"
                      title={row.protocol.notes}
                    >
                      metric pending
                    </span>
                  ) : (
                    <>
                      <span className="font-medium">{row.metricLabel}</span>
                      {row.metricStale && (
                        <span
                          className="ml-1 rounded bg-orange-50 px-1 text-[11px] text-orange-600"
                          title="Live fetch failed — showing last-known value"
                        >
                          stale
                        </span>
                      )}
                      {row.protocol.metric.kind === "volume24h" ? (
                        <span className="ml-1 text-[11px] text-gray-400">24h vol</span>
                      ) : (
                        <span className="mt-1 block h-1 w-24 rounded-full bg-gray-100">
                          <span
                            className="block h-1 rounded-full bg-gray-400"
                            style={{
                              width: `${Math.max(2, (100 * (row.metricValue ?? 0)) / maxTvl)}%`,
                            }}
                          />
                        </span>
                      )}
                    </>
                  )}
                </td>
                <td className="min-w-28 px-3 py-2 align-middle">
                  <CoverageStrip feeds={feeds} cells={row.cells} />
                </td>
                {feeds.map((f, i) => {
                  const cell = row.cells[f.id];
                  const s = STATUS[cell.status];
                  return (
                    <td
                      key={f.id}
                      className={`px-1.5 py-2 text-center ${
                        i > 0 && feeds[i - 1].type !== f.type
                          ? "border-l border-gray-100"
                          : ""
                      }`}
                    >
                      <Link
                        href={`/protocol/${row.protocol.id}#feed-${f.id}`}
                        title={`${f.name}: ${s.label}${cell.verbatim ? ` — ${cell.verbatim}` : cell.note ? ` — ${cell.note}` : ""} [provenance: ${cell.provenance}]`}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:ring-2 hover:ring-gray-300"
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                      </Link>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Covered
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Partial
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-200" /> Not yet
          covered / assessment pending
        </span>
        <span>
          Hover a cell for the coverage note and provenance · click through for
          the verbatim assessment
        </span>
      </div>
    </div>
  );
}
