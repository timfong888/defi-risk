"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Tri = "yes" | "no" | "unknown";
type AggStatus = "live" | "available" | "none" | "unknown";

// One row per feed, with all matrix columns precomputed server-side so this
// client component stays free of @/lib/data types.
export interface MatrixFeed {
  id: string;
  name: string;
  type: string;
  url: string;
  focus: string;
  apiDocumented: Tri;
  apiFreePublic: Tri;
  apiPaidOnly: Tri;
  methodologyOpen: Tri;
  methodologyUrl?: string;
  publicDashboard: Tri;
  protocolCoverage: Tri;
  vaultMonitoring: Tri;
  aggregatorStatus: AggStatus;
  covered: number;
  partial: number;
}
interface ProtocolLite {
  id: string;
  name: string;
  category: string;
}
// coverage[feedId][protocolId] = "covered" | "partial" (not-yet-covered omitted)
type Coverage = Record<string, Record<string, "covered" | "partial">>;

const TYPE_STYLE: Record<string, string> = {
  Rating: "bg-indigo-50 text-indigo-700",
  Dashboard: "bg-sky-50 text-sky-700",
  Monitoring: "bg-rose-50 text-rose-700",
  Research: "bg-violet-50 text-violet-700",
};

function AccessMark({ v }: { v: Tri }) {
  const mark = v === "yes" ? "✓" : v === "no" ? "✗" : "?";
  const cls =
    v === "yes" ? "text-emerald-600" : v === "no" ? "text-gray-300" : "text-amber-500";
  return (
    <span className={`font-semibold ${cls}`} title={v === "unknown" ? "not yet verified" : v}>
      {mark}
    </span>
  );
}

const AGG_STYLE: Record<AggStatus, { label: string; style: string; title: string }> = {
  live: { label: "live", style: "bg-emerald-50 text-emerald-700", title: "actively synced into the aggregator" },
  available: { label: "available", style: "bg-sky-50 text-sky-700", title: "usable API + validated path; auto-sync pending" },
  none: { label: "—", style: "bg-gray-100 text-gray-400", title: "no programmatic access available to us" },
  unknown: { label: "?", style: "bg-amber-50 text-amber-600", title: "not yet assessed" },
};

function AggStatus({ s }: { s: AggStatus }) {
  const a = AGG_STYLE[s];
  return (
    <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${a.style}`} title={a.title}>
      {a.label}
    </span>
  );
}

export default function FeedAccessMatrix({
  feeds,
  protocols,
  coverage,
  seedTotal,
}: {
  feeds: MatrixFeed[];
  protocols: ProtocolLite[];
  coverage: Coverage;
  seedTotal: number;
}) {
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(protocols.map((p) => p.category))).sort((a, b) => a.localeCompare(b))],
    [protocols]
  );
  const nameOf = useMemo(
    () => Object.fromEntries(protocols.map((p) => [p.id, p.name])),
    [protocols]
  );

  // Protocols offered in the dropdown, scoped to the chosen category, grouped + sorted.
  const groups = useMemo(() => {
    const byCategory = new Map<string, ProtocolLite[]>();
    for (const p of protocols) {
      if (category !== "All" && p.category !== category) continue;
      const list = byCategory.get(p.category) ?? [];
      list.push(p);
      byCategory.set(p.category, list);
    }
    return Array.from(byCategory.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([c, list]) => [c, [...list].sort((a, b) => a.name.localeCompare(b.name))] as [string, ProtocolLite[]]);
  }, [protocols, category]);

  const categoryProtocolIds = useMemo(
    () => new Set(protocols.filter((p) => category === "All" || p.category === category).map((p) => p.id)),
    [protocols, category]
  );

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // A feed shows if it covers ≥1 protocol in the chosen category (when set) and
  // ≥1 selected protocol (when any are picked). No filters → all feeds.
  const visible = useMemo(
    () =>
      feeds.filter((f) => {
        const cov = coverage[f.id] ?? {};
        if (category !== "All" && !Object.keys(cov).some((pid) => categoryProtocolIds.has(pid)))
          return false;
        if (selected.length > 0 && !selected.some((pid) => cov[pid])) return false;
        return true;
      }),
    [feeds, coverage, category, categoryProtocolIds, selected]
  );

  return (
    <div className="mt-4">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSelected([]);
          }}
          className="rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-gray-500 focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All categories" : c}
            </option>
          ))}
        </select>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={open}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1 text-sm hover:border-gray-400 focus:border-gray-400 focus:outline-none"
          >
            {selected.length === 0
              ? "Filter by protocol"
              : `${selected.length} protocol${selected.length > 1 ? "s" : ""} selected`}
            <span className="text-gray-400" aria-hidden>
              ▾
            </span>
          </button>
          {open && (
            <div className="absolute left-0 z-10 mt-1 max-h-80 w-72 overflow-y-auto rounded-md border border-gray-200 bg-white p-2 shadow-lg">
              {groups.map(([cat, items]) => (
                <div key={cat} className="mb-2 last:mb-0">
                  <p className="px-1 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {cat}
                  </p>
                  {items.map((p) => (
                    <label
                      key={p.id}
                      className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggle(p.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {(selected.length > 0 || category !== "All") && (
          <button
            onClick={() => {
              setSelected([]);
              setCategory("All");
            }}
            className="text-xs text-gray-500 underline"
          >
            clear
          </button>
        )}
        <span className="ml-auto text-gray-500">
          {visible.length} of {feeds.length} feeds
        </span>
      </div>

      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {selected.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
            >
              {nameOf[id]}
              <button
                onClick={() => toggle(id)}
                className="text-gray-400 hover:text-gray-700"
                aria-label={`Remove ${nameOf[id]}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-3 py-2 font-medium border-b border-gray-200">Feed</th>
              <th className="px-2 py-2 font-medium border-b border-gray-200 text-center whitespace-nowrap">Protocol coverage</th>
              <th className="px-2 py-2 font-medium border-b border-gray-200 text-center whitespace-nowrap">Vault monitoring</th>
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
            {visible.map((f) => (
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
                  <span className="mt-0.5 block max-w-md text-xs text-gray-500">{f.focus}</span>
                </td>
                <td className="px-2 py-2 text-center"><AccessMark v={f.protocolCoverage} /></td>
                <td className="px-2 py-2 text-center"><AccessMark v={f.vaultMonitoring} /></td>
                <td className="px-2 py-2 text-center"><AccessMark v={f.apiDocumented} /></td>
                <td className="px-2 py-2 text-center"><AccessMark v={f.apiFreePublic} /></td>
                <td className="px-2 py-2 text-center"><AccessMark v={f.apiPaidOnly} /></td>
                <td className="px-2 py-2 text-center">
                  {f.methodologyUrl ? (
                    <a href={f.methodologyUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-70">
                      <AccessMark v={f.methodologyOpen} />
                    </a>
                  ) : (
                    <AccessMark v={f.methodologyOpen} />
                  )}
                </td>
                <td className="px-2 py-2 text-center"><AccessMark v={f.publicDashboard} /></td>
                <td className="px-2 py-2 text-center"><AggStatus s={f.aggregatorStatus} /></td>
                <td className="px-2 py-2 text-center tabular-nums whitespace-nowrap">
                  {f.covered + f.partial} / {seedTotal}
                  {f.partial > 0 && (
                    <span className="block text-[11px] text-gray-400">
                      {f.covered} full · {f.partial} partial
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-gray-400">
                  No feeds match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
