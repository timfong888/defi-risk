import type { Protocol } from "./data";

// TVL from api.llama.fi/tvl/{slug}; 24h volume from the aggregators summary
// endpoint for protocols where TVL is not applicable (RFP: "equivalent volume
// metric"). null means the metric is pending — rendered as an explicit badge,
// never a blank cell.
export async function fetchMetric(
  metric: Protocol["metric"]
): Promise<number | null> {
  if (!metric.slug) return null;
  try {
    if (metric.kind === "tvl") {
      const res = await fetch(`https://api.llama.fi/tvl/${metric.slug}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) return null;
      const n = await res.json();
      return typeof n === "number" ? n : null;
    }
    const res = await fetch(
      `https://api.llama.fi/summary/aggregators/${metric.slug}?dataType=dailyVolume`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const d = await res.json();
    return typeof d.total24h === "number" ? d.total24h : null;
  } catch {
    return null;
  }
}

export function formatUsd(n: number | null): string {
  if (n === null) return "pending";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}
