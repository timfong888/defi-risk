export const metadata = { title: "Methodology — DeFi Risk Intelligence Aggregator" };

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
    </div>
  );
}
