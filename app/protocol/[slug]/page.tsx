import Link from "next/link";
import { notFound } from "next/navigation";
import { details, feeds, getCell, getProtocol, protocols } from "@/lib/data";
import { fetchMetric, formatUsd } from "@/lib/metrics";

export const revalidate = 3600;

export function generateStaticParams() {
  return protocols.map((p) => ({ slug: p.id }));
}

const STATUS_BADGE: Record<string, string> = {
  covered: "bg-emerald-100 text-emerald-800",
  partial: "bg-amber-100 text-amber-800",
  "not-yet-covered": "bg-gray-100 text-gray-500",
};

function Provenance({ tag }: { tag: string }) {
  return (
    <span className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-[11px] text-gray-500">
      {tag}
    </span>
  );
}

export default async function ProtocolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const protocol = getProtocol(slug);
  if (!protocol) notFound();

  const metricValue = await fetchMetric(protocol.metric);
  const detail = details[protocol.id];

  return (
    <div className="max-w-5xl">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← Matrix
      </Link>

      <div className="mt-2 flex flex-wrap items-baseline gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {protocol.name}
        </h1>
        {protocol.versions && (
          <span className="text-sm text-gray-500">
            {protocol.versions.join(" · ")}
          </span>
        )}
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {protocol.category}
        </span>
        <span className="ml-auto tabular-nums text-lg">
          {formatUsd(metricValue)}
          <span className="ml-1 text-xs text-gray-400">
            {protocol.metric.kind === "volume24h" ? "24h volume" : "TVL"} ·
            DefiLlama
          </span>
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-600">{protocol.notes}</p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Governance</h2>
        {detail ? (
          <dl className="mt-2 space-y-2">
            {detail.governance.map((g) => (
              <div key={g.label} className="rounded border border-gray-200 p-3">
                <dt className="text-sm font-medium">{g.label}</dt>
                <dd className="mt-0.5 text-sm text-gray-700">
                  {g.value}{" "}
                  <span className="ml-1 inline-flex items-center gap-1">
                    <Provenance tag={g.provenance} />
                    <a
                      href={g.source}
                      className="text-xs text-gray-400 underline"
                    >
                      source
                    </a>
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-2 rounded border border-dashed border-gray-300 p-3 text-sm text-gray-500">
            Governance data curation pending for this protocol (M1 scope —
            tracked as SAT-298). The page structure is final; data lands via
            the open, community-correctable data layer.
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          What each risk feed says{" "}
          <span className="text-sm font-normal text-gray-500">
            (verbatim — no synthesis)
          </span>
        </h2>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {feeds.map((f) => {
            const cell = getCell(protocol.id, f.id);
            return (
              <div
                key={f.id}
                id={`feed-${f.id}`}
                className="rounded border border-gray-200 p-3"
              >
                <div className="flex items-baseline gap-2">
                  <a href={f.url} className="font-medium hover:underline">
                    {f.name}
                  </a>
                  <span className="text-xs text-gray-400">{f.type}</span>
                  <span
                    className={`ml-auto rounded px-1.5 py-0.5 text-xs ${STATUS_BADGE[cell.status]}`}
                  >
                    {cell.status === "not-yet-covered"
                      ? "not yet covered"
                      : cell.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{f.focus}</p>
                <div className="mt-2 text-sm">
                  {cell.status === "not-yet-covered" ? (
                    <span className="text-gray-400">
                      No assessment from this provider yet.
                    </span>
                  ) : (
                    <span className="text-gray-600">
                      {cell.note ?? "Coverage noted."} Verbatim assessment
                      ingestion pending verification (SAT-302).
                    </span>
                  )}{" "}
                  <Provenance tag={cell.provenance} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Audit history</h2>
        {detail && detail.audits.length > 0 ? (
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-1 pr-4 font-medium">Firm</th>
                <th className="py-1 pr-4 font-medium">Scope</th>
                <th className="py-1 pr-4 font-medium">Date</th>
                <th className="py-1 font-medium">Report</th>
              </tr>
            </thead>
            <tbody>
              {detail.audits.map((a) => (
                <tr key={a.firm + a.date} className="border-b border-gray-100">
                  <td className="py-1.5 pr-4">{a.firm}</td>
                  <td className="py-1.5 pr-4 text-gray-600">{a.scope}</td>
                  <td className="py-1.5 pr-4 text-gray-600">{a.date}</td>
                  <td className="py-1.5">
                    <a href={a.link} className="text-xs underline">
                      link
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-2 rounded border border-dashed border-gray-300 p-3 text-sm text-gray-500">
            Audit history curation pending (M1 scope).
          </p>
        )}
      </section>

      <section className="mt-8 mb-4">
        <h2 className="text-lg font-semibold">Incident history</h2>
        {detail && detail.incidents.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {detail.incidents.map((i) => (
              <li
                key={i.date + i.description.slice(0, 20)}
                className="rounded border border-gray-200 p-3 text-sm"
              >
                <span className="font-medium">{i.date}</span>{" "}
                <span className="text-gray-700">{i.description}</span>{" "}
                <a href={i.link} className="text-xs underline">
                  source
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 rounded border border-dashed border-gray-300 p-3 text-sm text-gray-500">
            Incident history curation pending (M1 scope).
          </p>
        )}
      </section>
    </div>
  );
}
