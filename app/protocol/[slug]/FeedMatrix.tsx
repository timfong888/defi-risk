"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

// One row per feed for this protocol. The server flattens the data layer into
// these plain props so the client component stays free of @/lib/data types.
export interface FeedMatrixRow {
  id: string;
  name: string;
  type: "Rating" | "Dashboard" | "Monitoring" | "Research";
  focus: string;
  url: string;
  status: "covered" | "partial" | "not-yet-covered";
  verbatim?: string;
  note?: string;
  sourceUrl?: string;
  provenance: string;
  updated?: string | null;
}

type SortKey = "name" | "type" | "coverage";
type SortDir = "asc" | "desc";

const STATUS_LABEL: Record<FeedMatrixRow["status"], string> = {
  covered: "Covered",
  partial: "Partial Coverage",
  "not-yet-covered": "Uncovered",
};

const STATUS_BADGE: Record<FeedMatrixRow["status"], string> = {
  covered: "bg-emerald-100 text-emerald-800",
  partial: "bg-amber-100 text-amber-800",
  "not-yet-covered": "bg-gray-100 text-gray-500",
};

// Sort by clarity of coverage: covered first, then partial, then uncovered.
const COVERAGE_RANK: Record<FeedMatrixRow["status"], number> = {
  covered: 0,
  partial: 1,
  "not-yet-covered": 2,
};

const TYPE_STYLE: Record<FeedMatrixRow["type"], string> = {
  Rating: "bg-indigo-50 text-indigo-700",
  Dashboard: "bg-sky-50 text-sky-700",
  Monitoring: "bg-rose-50 text-rose-700",
  Research: "bg-violet-50 text-violet-700",
};

const PROVENANCE_DESC: Record<string, string> = {
  "onchain-verifiable":
    "Directly checkable against Ethereum mainnet state or verified contracts",
  "public-docs": "Stated in public documentation; onchain verification pending",
  "provider-published":
    "Published by the risk feed provider; synced by a re-runnable script",
  "self-reported":
    "Submitted by the protocol team; independent verification pending",
  "manual-unverified":
    "Curated by maintainers from public materials; first-hand verification pending",
  "assessment-pending": "Not yet assessed — explicitly labeled, never blank",
};

function SortHeader({
  label,
  k,
  sortKey,
  sortDir,
  onSort,
  className = "",
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === k;
  return (
    <th
      className={`border-b border-gray-200 px-3 py-2 font-medium ${className}`}
      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onSort(k)}
        className="inline-flex items-center gap-1 hover:text-gray-900"
      >
        {label}
        <span className="text-gray-400" aria-hidden>
          {active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}

export default function FeedMatrix({ rows }: { rows: FeedMatrixRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("coverage");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const onSort = (k: SortKey) => {
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      if (sortKey === "name") return dir * a.name.localeCompare(b.name);
      if (sortKey === "type") return dir * a.type.localeCompare(b.type);
      return dir * (COVERAGE_RANK[a.status] - COVERAGE_RANK[b.status]);
    });
  }, [rows, sortKey, sortDir]);

  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            <SortHeader label="Feed" k="name" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <SortHeader label="Type" k="type" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <SortHeader label="Coverage" k="coverage" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <th className="border-b border-gray-200 px-3 py-2 font-medium">Assessment</th>
            <th className="border-b border-gray-200 px-3 py-2 font-medium">Report</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((f) => (
            <tr
              key={f.id}
              id={`feed-${f.id}`}
              className="scroll-mt-20 border-b border-gray-100 align-top last:border-0 target:bg-amber-50"
            >
              <td className="px-3 py-2 whitespace-nowrap">
                <a href={f.url} className="font-medium hover:underline">
                  {f.name}
                </a>
                <span className="block max-w-[14rem] text-xs text-gray-500">{f.focus}</span>
              </td>
              <td className="px-3 py-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TYPE_STYLE[f.type]}`}
                >
                  {f.type}
                </span>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span className={`rounded px-1.5 py-0.5 text-xs ${STATUS_BADGE[f.status]}`}>
                  {STATUS_LABEL[f.status]}
                </span>
              </td>
              <td className="px-3 py-2 text-sm">
                {f.verbatim ? (
                  <blockquote className="rounded bg-gray-50 px-2.5 py-2 text-gray-800">
                    {f.verbatim.split(" | ").map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                    <footer className="mt-1 text-xs text-gray-400">
                      — {f.name}
                      {f.updated && ` · updated ${f.updated}`}
                    </footer>
                  </blockquote>
                ) : f.status === "not-yet-covered" ? (
                  <span className="text-gray-400">
                    No assessment from this provider yet.{" "}
                    <Link href="/feeds#gaps" className="text-gray-500 underline">
                      Why?
                    </Link>
                  </span>
                ) : (
                  <>
                    <span className="text-gray-600">{f.note ?? "Coverage noted"}.</span>
                    <span className="block text-xs text-gray-400">
                      Verbatim assessment ingestion pending first-hand verification.
                    </span>
                  </>
                )}
                <span className="mt-1 block">
                  <span
                    className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-[11px] text-gray-500"
                    title={
                      PROVENANCE_DESC[f.provenance] ??
                      "Provenance category (description pending)"
                    }
                  >
                    {f.provenance}
                  </span>
                </span>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                {f.sourceUrl ? (
                  <a
                    href={f.sourceUrl}
                    className="text-xs text-gray-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    report ↗
                  </a>
                ) : (
                  <span className="text-xs text-gray-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
