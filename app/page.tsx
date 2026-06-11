import Link from "next/link";
import MatrixTable, { type MatrixRow } from "@/components/MatrixTable";
import {
  claimedCellCount,
  feeds,
  getCell,
  orderedFeeds,
  protocols,
  providerVerifiedCellCount,
} from "@/lib/data";
import { fetchMetric, formatUsd } from "@/lib/metrics";

export const revalidate = 3600;

export default async function Home() {
  const metrics = await Promise.all(
    protocols.map((p) => fetchMetric(p.metric))
  );

  const rows: MatrixRow[] = protocols.map((p, i) => ({
    protocol: p,
    metricValue: metrics[i].value,
    metricLabel: formatUsd(metrics[i].value),
    metricStale: metrics[i].stale,
    cells: Object.fromEntries(
      orderedFeeds.map((f) => [f.id, getCell(p.id, f.id)])
    ),
  }));

  const totalTvl = protocols.reduce(
    (sum, p, i) =>
      p.metric.kind === "tvl" ? sum + (metrics[i].value ?? 0) : sum,
    0
  );
  const totalCells = protocols.length * feeds.length;

  const stats: { label: string; value: string; hint: string; href?: string }[] = [
    { label: "Protocols", value: String(protocols.length), hint: "top 20 by funds at risk" },
    {
      label: "Independent risk feeds",
      value: String(feeds.length),
      hint: "see the full registry →",
      href: "/feeds",
    },
    {
      label: "Provider-verified cells",
      value: `${providerVerifiedCellCount} / ${totalCells}`,
      hint: `${claimedCellCount} more claimed, pending verification`,
    },
    { label: "TVL tracked", value: formatUsd(totalTvl), hint: "live from DefiLlama, hourly" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="max-w-3xl text-2xl font-semibold tracking-tight">
          What every major risk feed says about the top 20 Ethereum DeFi
          protocols
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm text-gray-600">
          One neutral reference, side by side and verbatim. Every
          protocol-by-feed cell is assessed and labeled — and this site never
          produces a score of its own.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => {
            const tile = (
              <div
                className={`rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2 ${
                  s.href ? "hover:border-gray-400 hover:bg-gray-50" : ""
                }`}
              >
                <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  {s.label}
                </dt>
                <dd className="text-lg font-semibold tabular-nums">{s.value}</dd>
                <dd className="text-[11px] text-gray-400">{s.hint}</dd>
              </div>
            );
            return s.href ? (
              <Link key={s.label} href={s.href}>
                {tile}
              </Link>
            ) : (
              <div key={s.label}>{tile}</div>
            );
          })}
        </dl>
      </div>
      <MatrixTable rows={rows} feeds={orderedFeeds} />
    </div>
  );
}
