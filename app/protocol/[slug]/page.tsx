import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverageStrip } from "@/components/MatrixTable";
import {
  details,
  getCell,
  getProtocol,
  iconSlugFor,
  orderedFeeds,
  protocols,
} from "@/lib/data";
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

const STATUS_BORDER: Record<string, string> = {
  covered: "border-l-emerald-400",
  partial: "border-l-amber-300",
  "not-yet-covered": "border-l-gray-200",
};

const TYPE_STYLE: Record<string, string> = {
  Rating: "bg-indigo-50 text-indigo-700",
  Dashboard: "bg-sky-50 text-sky-700",
  Monitoring: "bg-rose-50 text-rose-700",
  Research: "bg-violet-50 text-violet-700",
};

function Provenance({ tag }: { tag: string }) {
  return (
    <span className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-[11px] text-gray-500">
      {tag}
    </span>
  );
}

function SectionHeading({
  id,
  title,
  sub,
}: {
  id: string;
  title: string;
  sub?: string;
}) {
  return (
    <h2 id={id} className="scroll-mt-20 text-lg font-semibold">
      {title}
      {sub && <span className="ml-2 text-sm font-normal text-gray-500">{sub}</span>}
    </h2>
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

  const cells = Object.fromEntries(
    orderedFeeds.map((f) => [f.id, getCell(protocol.id, f.id)])
  );
  const counts = { covered: 0, partial: 0, "not-yet-covered": 0 };
  for (const f of orderedFeeds) counts[cells[f.id].status] += 1;

  const idx = protocols.findIndex((p) => p.id === protocol.id);
  const prev = protocols[idx - 1];
  const next = protocols[idx + 1];

  const iconSlug = iconSlugFor(protocol);

  const feedTypes = Array.from(new Set(orderedFeeds.map((f) => f.type)));

  return (
    <div className="max-w-5xl">
      <nav className="text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          Matrix
        </Link>{" "}
        / <span className="text-gray-700">{protocol.name}</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {iconSlug && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://icons.llamao.fi/icons/protocols/${iconSlug}?w=96&h=96`}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full bg-gray-100 ring-1 ring-gray-200"
          />
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{protocol.name}</h1>
        {protocol.versions && (
          <span className="text-sm text-gray-500">
            {protocol.versions.join(" · ")}
          </span>
        )}
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {protocol.category}
        </span>
        <span className="ml-auto text-right">
          <span className="block text-xl font-semibold tabular-nums">
            {formatUsd(metricValue)}
          </span>
          <span className="text-xs text-gray-400">
            {protocol.metric.kind === "volume24h" ? "24h volume" : "TVL"} ·
            DefiLlama · hourly
          </span>
        </span>
      </div>
      <p className="mt-1 max-w-3xl text-sm text-gray-600">{protocol.notes}</p>

      <div className="mt-4 rounded-lg border border-gray-200 p-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-medium">Feed coverage</span>
          <span className="text-emerald-700">{counts.covered} covered</span>
          <span className="text-amber-700">{counts.partial} partial</span>
          <span className="text-gray-500">
            {counts["not-yet-covered"]} not yet covered
          </span>
          <span className="ml-auto flex gap-3 text-xs text-gray-500">
            <a href="#governance" className="hover:underline">
              Governance
            </a>
            <a href="#feeds" className="hover:underline">
              Feed assessments
            </a>
            <a href="#audits" className="hover:underline">
              Audits
            </a>
            <a href="#incidents" className="hover:underline">
              Incidents
            </a>
          </span>
        </div>
        <CoverageStrip feeds={orderedFeeds} cells={cells} className="mt-2" />
      </div>

      <section className="mt-8">
        <SectionHeading id="governance" title="Governance" />
        {detail ? (
          <dl className="mt-2 grid gap-2 sm:grid-cols-1">
            {detail.governance.map((g) => (
              <div key={g.label} className="rounded-lg border border-gray-200 p-3">
                <dt className="text-sm font-medium">{g.label}</dt>
                <dd className="mt-0.5 text-sm text-gray-700">
                  {g.value}{" "}
                  <span className="ml-1 inline-flex items-center gap-1">
                    <Provenance tag={g.provenance} />
                    <a href={g.source} className="text-xs text-gray-400 underline">
                      source
                    </a>
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-2 rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-500">
            Governance data curation pending for this protocol. The page
            structure is final; data lands via the open, community-correctable
            data layer.
          </p>
        )}
      </section>

      <section className="mt-8">
        <SectionHeading
          id="feeds"
          title="What each risk feed says"
          sub="verbatim — no synthesis"
        />
        {feedTypes.map((type) => (
          <div key={type} className="mt-4">
            <h3
              className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TYPE_STYLE[type]}`}
            >
              {type}
            </h3>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {orderedFeeds
                .filter((f) => f.type === type)
                .map((f) => {
                  const cell = cells[f.id];
                  return (
                    <div
                      key={f.id}
                      id={`feed-${f.id}`}
                      className={`scroll-mt-20 rounded-lg border border-gray-200 border-l-4 p-3 ${STATUS_BORDER[cell.status]}`}
                    >
                      <div className="flex items-baseline gap-2">
                        <a href={f.url} className="font-medium hover:underline">
                          {f.name}
                        </a>
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
                          <>
                            <span className="text-gray-600">{cell.note ?? "Coverage noted"}.</span>
                            <span className="block text-xs text-gray-400">
                              Verbatim assessment ingestion pending first-hand
                              verification.
                            </span>
                          </>
                        )}{" "}
                        <Provenance tag={cell.provenance} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <SectionHeading id="audits" title="Audit history" />
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
          <p className="mt-2 rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-500">
            Audit history curation pending (M1 scope).
          </p>
        )}
      </section>

      <section className="mt-8">
        <SectionHeading id="incidents" title="Incident history" />
        {detail && detail.incidents.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {detail.incidents.map((i) => (
              <li
                key={i.date + i.description.slice(0, 20)}
                className="rounded-lg border border-gray-200 p-3 text-sm"
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
          <p className="mt-2 rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-500">
            Incident history curation pending (M1 scope).
          </p>
        )}
      </section>

      <nav className="mt-10 mb-4 flex border-t border-gray-200 pt-4 text-sm">
        {prev && (
          <Link href={`/protocol/${prev.id}`} className="text-gray-600 hover:underline">
            ← {prev.name}
          </Link>
        )}
        {next && (
          <Link
            href={`/protocol/${next.id}`}
            className="ml-auto text-gray-600 hover:underline"
          >
            {next.name} →
          </Link>
        )}
      </nav>
    </div>
  );
}
