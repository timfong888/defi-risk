"use client";

import { useMemo, useState } from "react";

type FeedType = "Rating" | "Dashboard" | "Monitoring" | "Research";
type CoverageStatus = "covered" | "partial";

interface FeedLite {
  id: string;
  name: string;
  type: FeedType;
}
interface ProtocolLite {
  id: string;
  name: string;
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
  const [input, setInput] = useState("");

  const byName = useMemo(
    () => new Map(protocols.map((p) => [p.name.toLowerCase(), p.id])),
    [protocols]
  );
  const nameOf = useMemo(
    () => Object.fromEntries(protocols.map((p) => [p.id, p.name])),
    [protocols]
  );

  const addProtocol = (raw: string) => {
    const id = byName.get(raw.trim().toLowerCase());
    if (id) setSelected((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setInput("");
  };
  const remove = (id: string) =>
    setSelected((prev) => prev.filter((s) => s !== id));

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

  const available = useMemo(
    () => protocols.filter((p) => !selected.includes(p.id)),
    [protocols, selected]
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          list="protocol-options"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addProtocol(input);
            }
          }}
          onInput={(e) => {
            // datalist selection fires input with the chosen value
            const v = (e.target as HTMLInputElement).value;
            if (byName.has(v.trim().toLowerCase())) addProtocol(v);
          }}
          placeholder="Type a protocol (e.g. Aave)…"
          className="w-64 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
          aria-label="Filter feeds by protocol"
        />
        <datalist id="protocol-options">
          {available.map((p) => (
            <option key={p.id} value={p.name} />
          ))}
        </datalist>
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
          ? `Showing all ${feeds.length} feeds. Type one or more protocols to keep only the feeds that cover them.`
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
                {selected.map((id) => (
                  <td key={id} className="px-3 py-1.5 text-center">
                    <StatusCell status={coverage[f.id]?.[id]} />
                  </td>
                ))}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={2 + selected.length} className="px-3 py-3 text-center text-gray-500">
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
