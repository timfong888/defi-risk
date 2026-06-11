"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CoverageCell, Feed, Protocol } from "@/lib/data";

export interface MatrixRow {
  protocol: Protocol;
  metricValue: number | null;
  metricLabel: string;
  cells: Record<string, CoverageCell>; // feedId -> cell
}

const STATUS_STYLE: Record<string, { chip: string; glyph: string; label: string }> = {
  covered: { chip: "bg-emerald-100 text-emerald-800", glyph: "●", label: "Covered" },
  partial: { chip: "bg-amber-100 text-amber-800", glyph: "◐", label: "Partial" },
  "not-yet-covered": { chip: "bg-gray-100 text-gray-400", glyph: "○", label: "Not yet covered" },
};

type SortKey = "metric" | "name" | "category";

export default function MatrixTable({
  rows,
  feeds,
}: {
  rows: MatrixRow[];
  feeds: Feed[];
}) {
  const [category, setCategory] = useState<string>("All");
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

  const visible = useMemo(() => {
    const filtered =
      category === "All"
        ? rows
        : rows.filter((r) => r.protocol.category === category);
    return [...filtered].sort((a, b) => {
      if (sortKey === "name") return a.protocol.name.localeCompare(b.protocol.name);
      if (sortKey === "category")
        return (
          a.protocol.category.localeCompare(b.protocol.category) ||
          (b.metricValue ?? -1) - (a.metricValue ?? -1)
        );
      return (b.metricValue ?? -1) - (a.metricValue ?? -1);
    });
  }, [rows, category, sortKey]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-0.5 ${
              category === c
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 text-gray-600 hover:border-gray-500"
            }`}
          >
            {c}
          </button>
        ))}
        <span className="ml-auto text-gray-500">
          Sort:{" "}
          {(["metric", "name", "category"] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              className={`ml-2 underline-offset-2 ${
                sortKey === k ? "font-semibold text-gray-900" : "underline"
              }`}
            >
              {k === "metric" ? "TVL/volume" : k}
            </button>
          ))}
        </span>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="sticky left-0 bg-gray-50 px-3 py-2 font-medium border-b border-gray-200">
                Protocol
              </th>
              <th className="px-3 py-2 font-medium border-b border-gray-200 whitespace-nowrap">
                TVL / 24h vol
              </th>
              {feeds.map((f) => (
                <th
                  key={f.id}
                  className="px-2 py-2 font-medium border-b border-gray-200 text-center align-bottom"
                  title={`${f.name} — ${f.focus} (${f.type})`}
                >
                  <span className="inline-block max-w-20 truncate align-bottom">
                    {f.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.protocol.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="sticky left-0 bg-white px-3 py-1.5 whitespace-nowrap">
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
                    <span className="ml-1.5 rounded bg-indigo-50 px-1 text-xs text-indigo-600">
                      {row.protocol.family} family
                    </span>
                  )}
                  <div className="text-xs text-gray-400">{row.protocol.category}</div>
                </td>
                <td className="px-3 py-1.5 whitespace-nowrap tabular-nums">
                  {row.metricLabel === "pending" ? (
                    <span
                      className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500"
                      title={row.protocol.notes}
                    >
                      metric pending
                    </span>
                  ) : (
                    <>
                      {row.metricLabel}
                      {row.protocol.metric.kind === "volume24h" && (
                        <span className="ml-1 text-xs text-gray-400">24h vol</span>
                      )}
                    </>
                  )}
                </td>
                {feeds.map((f) => {
                  const cell = row.cells[f.id];
                  const s = STATUS_STYLE[cell.status];
                  return (
                    <td key={f.id} className="px-2 py-1.5 text-center">
                      <Link
                        href={`/protocol/${row.protocol.id}#feed-${f.id}`}
                        className={`inline-block rounded px-1.5 ${s.chip}`}
                        title={`${f.name}: ${s.label}${cell.note ? ` — ${cell.note}` : ""} [provenance: ${cell.provenance}]`}
                      >
                        {s.glyph}
                      </Link>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
        <span>
          <span className="rounded bg-emerald-100 px-1.5 text-emerald-800">●</span>{" "}
          Covered
        </span>
        <span>
          <span className="rounded bg-amber-100 px-1.5 text-amber-800">◐</span>{" "}
          Partial
        </span>
        <span>
          <span className="rounded bg-gray-100 px-1.5 text-gray-400">○</span> Not
          yet covered / assessment pending
        </span>
        <span>
          Hover any cell for the coverage note and provenance tag. Coverage data
          is community-correctable on GitHub.
        </span>
      </div>
    </div>
  );
}
