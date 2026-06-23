"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type FeedType = "Rating" | "Dashboard" | "Monitoring" | "Research";
type CoverageStatus = "covered" | "partial";

interface FeedLite {
  id: string;
  name: string;
  type: FeedType;
  focus: string;
}
interface ProtocolLite {
  id: string;
  name: string;
  category: string;
}
// coverage[feedId][protocolId] = "covered" | "partial" (not-yet-covered omitted)
type Coverage = Record<string, Record<string, CoverageStatus>>;

const TYPE_STYLE: Record<string, string> = {
  Rating: "bg-indigo-50 text-indigo-700",
  Dashboard: "bg-sky-50 text-sky-700",
  Monitoring: "bg-rose-50 text-rose-700",
  Research: "bg-violet-50 text-violet-700",
};
const DEFAULT_TYPE_STYLE = "bg-gray-50 text-gray-700";

function StatusCell({ status }: { status?: CoverageStatus }) {
  if (status === "covered")
    return <span className="text-emerald-700" title="covered">●</span>;
  if (status === "partial")
    return <span className="text-amber-700" title="partial">◐</span>;
  return <span className="text-gray-300" title="not yet covered">—</span>;
}

export default function FeedMatrixFilter({
  feeds,
  protocols,
  coverage,
}: {
  feeds: FeedLite[];
  protocols: ProtocolLite[];
  coverage: Coverage;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const nameOf = useMemo(
    () => Object.fromEntries(protocols.map((p) => [p.id, p.name])),
    [protocols]
  );

  // Protocols grouped by category, for a scannable checkbox menu. Categories
  // and the protocols within each are sorted alphabetically so the menu order
  // is deterministic regardless of source-data order.
  const groups = useMemo(() => {
    const byCategory = new Map<string, ProtocolLite[]>();
    for (const p of protocols) {
      const list = byCategory.get(p.category) ?? [];
      list.push(p);
      byCategory.set(p.category, list);
    }
    return Array.from(byCategory.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, list]) => [
        category,
        [...list].sort((a, b) => a.name.localeCompare(b.name)),
      ] as [string, ProtocolLite[]]);
  }, [protocols]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  const remove = (id: string) =>
    setSelected((prev) => prev.filter((s) => s !== id));

  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpen(false);
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

  // A feed is shown if it covers (covered/partial) at least one selected protocol.
  // With nothing selected, every feed is shown.
  const visible = useMemo(
    () =>
      feeds.filter(
        (f) =>
          selected.length === 0 ||
          selected.some((pid) => coverage[f.id]?.[pid])
      ),
    [feeds, coverage, selected]
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={open}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:border-gray-400 focus:border-gray-400 focus:outline-none"
          >
            {selected.length === 0
              ? "Filter by protocol"
              : `${selected.length} protocol${selected.length > 1 ? "s" : ""} selected`}
            <span className="text-gray-400" aria-hidden>▾</span>
          </button>

          {open && (
            <div className="absolute left-0 z-10 mt-1 max-h-80 w-72 overflow-y-auto rounded-md border border-gray-200 bg-white p-2 shadow-lg">
              {groups.map(([category, items]) => (
                <div key={category} className="mb-2 last:mb-0">
                  <p className="px-1 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {category}
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

        {selected.length > 0 && (
          <button
            onClick={() => setSelected([])}
            className="text-xs text-gray-500 underline"
          >
            clear
          </button>
        )}
      </div>

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
            >
              {nameOf[id]}
              <button
                onClick={() => remove(id)}
                className="text-gray-400 hover:text-gray-700"
                aria-label={`Remove ${nameOf[id]}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-500">
        {selected.length === 0
          ? `Showing all ${feeds.length} feeds. Pick one or more protocols to keep only the feeds that cover them.`
          : `${visible.length} of ${feeds.length} feeds cover ${
              selected.length === 1 ? "this protocol" : "at least one of these"
            } (● covered · ◐ partial).`}
      </p>

      <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="border-b border-gray-200 px-3 py-2 font-medium">Feed</th>
              <th className="border-b border-gray-200 px-3 py-2 font-medium">Type</th>
              <th className="border-b border-gray-200 px-3 py-2 font-medium">Data type</th>
              {selected.map((id) => (
                <th
                  key={id}
                  className="border-b border-gray-200 px-3 py-2 text-center font-medium whitespace-nowrap"
                >
                  {nameOf[id]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((f) => (
              <tr key={f.id} className="border-b border-gray-100 last:border-0">
                <td className="px-3 py-1.5 font-medium whitespace-nowrap">{f.name}</td>
                <td className="px-3 py-1.5">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TYPE_STYLE[f.type] ?? DEFAULT_TYPE_STYLE}`}
                  >
                    {f.type}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-gray-600">
                  <span className="block max-w-xs">{f.focus}</span>
                </td>
                {selected.map((id) => (
                  <td key={id} className="px-3 py-1.5 text-center">
                    <StatusCell status={coverage[f.id]?.[id]} />
                  </td>
                ))}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={3 + selected.length} className="px-3 py-3 text-center text-gray-500">
                  No feeds cover the selected protocol{selected.length > 1 ? "s" : ""} yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
