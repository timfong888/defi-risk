import { feeds } from "@/lib/data";

export const metadata = { title: "Methodology — DeFi Risk Intelligence Aggregator" };

const PROVENANCE_LEGEND = [
  ["onchain-verifiable", "Directly checkable against Ethereum mainnet state or verified contracts"],
  ["public-docs", "Stated in the protocol's or provider's public documentation; onchain verification pending"],
  ["provider-published", "Published by the risk feed provider in machine-readable or stable public form"],
  ["manual-unverified", "Curated by maintainers from public materials; first-hand verification pending"],
  ["assessment-pending", "Cell not yet assessed — explicitly labeled, never shown as blank"],
] as const;

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Methodology</h1>
        <p className="mt-2 text-sm text-gray-700">
          This site is a neutral aggregation layer: it shows what every major
          risk feed says about a protocol, side by side, verbatim. The right
          mental model is oracle diversity — no single feed is canonical, and
          the aggregation is the value.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">What this project does not do</h2>
        <p className="mt-2 text-sm text-gray-700">
          <strong>No composite scoring.</strong> This project never produces
          its own risk scores, rankings, or composite assessments. Feed
          ratings appear exactly as their providers publish them. This
          constraint is binding: it is documented in the{" "}
          <a
            href="https://github.com/timfong888/defi-risk/blob/main/CHARTER.md"
            className="underline"
          >
            project charter
          </a>
          , and any future change requires written agreement from the Ethereum
          Foundation. We also declare all commercial relationships with listed
          protocols and feed providers; as of this prototype there are none.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Feed registry</h2>
        <p className="mt-2 text-sm text-gray-700">
          Feeds are included to maximize diversity of coverage methodology
          (decentralization frameworks, quantitative dashboards, institutional
          ratings, live monitoring, research desks). Each entry is classified
          by how its data can be ingested; classifications marked unverified
          are pending first-hand confirmation.
        </p>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-1 pr-3 font-medium">Provider</th>
              <th className="py-1 pr-3 font-medium">Type</th>
              <th className="py-1 pr-3 font-medium">Focus</th>
              <th className="py-1 font-medium">Data access</th>
            </tr>
          </thead>
          <tbody>
            {feeds.map((f) => (
              <tr key={f.id} className="border-b border-gray-100 align-top">
                <td className="py-1.5 pr-3 whitespace-nowrap">
                  <a href={f.url} className="font-medium hover:underline">
                    {f.name}
                  </a>
                </td>
                <td className="py-1.5 pr-3 text-gray-600">{f.type}</td>
                <td className="py-1.5 pr-3 text-gray-600">{f.focus}</td>
                <td className="py-1.5 text-gray-600 whitespace-nowrap">
                  API: {f.accessibility.api}
                  {!f.accessibility.verified && (
                    <span className="ml-1 text-xs text-amber-600">
                      (to verify)
                    </span>
                  )}
                  <span className="block text-xs text-gray-400">
                    docs {f.accessibility.apiDocumented} · dashboard{" "}
                    {f.accessibility.publicDashboard} · methodology{" "}
                    {f.accessibility.methodologyOpen}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Data provenance tags</h2>
        <dl className="mt-2 space-y-1.5 text-sm">
          {PROVENANCE_LEGEND.map(([tag, desc]) => (
            <div key={tag} className="flex gap-3">
              <dt className="w-44 shrink-0 rounded bg-gray-50 border border-gray-200 px-1.5 py-0.5 text-xs text-gray-600 h-fit">
                {tag}
              </dt>
              <dd className="text-gray-700">{desc}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Corrections and additions</h2>
        <p className="mt-2 text-sm text-gray-700">
          All coverage, governance, audit, and incident data lives as plain
          JSON in the{" "}
          <a
            href="https://github.com/timfong888/defi-risk/tree/main/data"
            className="underline"
          >
            open data layer
          </a>{" "}
          under AGPL-3.0. Anyone can propose a correction, a new protocol, or
          a new feed provider by opening a pull request; schema validation
          runs on every PR and every datum requires a provenance tag and
          source link. The process is documented in the repository README.
        </p>
      </section>
    </div>
  );
}
