import MatrixTable, { type MatrixRow } from "@/components/MatrixTable";
import { feeds, getCell, protocols } from "@/lib/data";
import { fetchMetric, formatUsd } from "@/lib/metrics";

export const revalidate = 3600;

export default async function Home() {
  const metricValues = await Promise.all(
    protocols.map((p) => fetchMetric(p.metric))
  );

  const rows: MatrixRow[] = protocols.map((p, i) => ({
    protocol: p,
    metricValue: metricValues[i],
    metricLabel: formatUsd(metricValues[i]),
    cells: Object.fromEntries(feeds.map((f) => [f.id, getCell(p.id, f.id)])),
  }));

  return (
    <div>
      <div className="mb-5 max-w-3xl">
        <h1 className="text-xl font-semibold tracking-tight">
          What every major risk feed says about the top 20 Ethereum DeFi
          protocols
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          One neutral reference: {protocols.length} protocols × {feeds.length}{" "}
          independent risk feeds, side by side. Every cell is assessed and
          labeled. Assessments are shown verbatim on each protocol page — this
          site never produces its own scores. TVL and volume are live from
          DefiLlama.
        </p>
      </div>
      <MatrixTable rows={rows} feeds={feeds} />
    </div>
  );
}
