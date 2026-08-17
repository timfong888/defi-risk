import type { Metadata } from "next";
import AllocationChart from "@/components/AllocationChart";
import {
  accounts,
  asOf,
  byAccountType,
  byAssetClass,
  byGeography,
  byMarketCap,
  byStyle,
  concentrationRisks,
  equityTotal,
  holdings,
  sampleNote,
  totalValue,
  formatPortfolioValue,
} from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Asset View – Portfolio Allocation",
};

export default function AssetsPage() {
  const assetClass = byAssetClass();
  const geography = byGeography();
  const marketCap = byMarketCap();
  const style = byStyle();
  const accountType = byAccountType();
  const risks = concentrationRisks();
  const eqTotal = equityTotal();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Asset View</h1>
        <p className="mt-1 text-sm text-gray-500">
          Holdings aggregated by research-backed diversification dimensions — asset class,
          geography, market cap, and style.
        </p>
      </div>

      {/* Stats row */}
      <dl className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Total Portfolio"
          value={formatPortfolioValue(totalValue)}
          hint={`as of ${asOf}`}
        />
        <StatTile
          label="Holdings"
          value={String(holdings.length)}
          hint="across all accounts"
        />
        <StatTile
          label="Accounts"
          value={String(accounts.length)}
          hint="custodians tracked"
        />
        <StatTile
          label="Risks Flagged"
          value={String(risks.length)}
          hint="concentration alerts"
          alert={risks.length > 0}
        />
      </dl>

      {/* Sample data notice */}
      <div className="mb-6 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <span className="font-medium">Sample data.</span>
        <span>{sampleNote}</span>
      </div>

      {/* Concentration risks */}
      {risks.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Concentration risks</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {risks.map((r, i) => (
              <div
                key={i}
                className={`rounded-lg border px-4 py-3 ${
                  r.severity === "high"
                    ? "border-red-200 bg-red-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <div
                  className={`text-[11px] font-medium uppercase tracking-wide ${
                    r.severity === "high" ? "text-red-600" : "text-amber-600"
                  }`}
                >
                  {r.severity === "high" ? "High" : "Moderate"} · {r.dimension}
                </div>
                <div className="mt-0.5 text-sm font-semibold">
                  {r.label} — {r.pct.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AllocationChart
          title="Asset Class"
          subtitle={`Total portfolio · ${formatPortfolioValue(totalValue)}`}
          slices={assetClass}
        />

        <AllocationChart
          title="Tax Efficiency"
          subtitle="By account type"
          slices={accountType}
        />

        <AllocationChart
          title="Geography"
          subtitle={`Equity only · ${formatPortfolioValue(eqTotal)}`}
          slices={geography}
          note="Percentages are within the equity sub-total. Research target: 30–40% non-US."
        />

        <AllocationChart
          title="Market Capitalization"
          subtitle={`Equity only · ${formatPortfolioValue(eqTotal)}`}
          slices={marketCap}
          note="Fama-French: small-cap value historically earns a return premium. Target: some small/mid tilt."
        />

        <AllocationChart
          title="Investment Style"
          subtitle={`Equity only · ${formatPortfolioValue(eqTotal)}`}
          slices={style}
          note="Value stocks have historically outperformed over long horizons (Fama-French value premium)."
        />
      </div>

      {/* Research methodology */}
      <section className="mt-10 rounded-lg border border-gray-200 bg-gray-50 px-5 py-5">
        <h2 className="mb-3 text-sm font-semibold">Research-backed diversification targets</h2>
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <ResearchItem
            label="Bonds vs. Equities"
            target="Rule of 110: 110 minus your age = % in equities (e.g. 70% equities at 40)"
            source="Vanguard Life Strategy, Fama-French"
          />
          <ResearchItem
            label="International Exposure"
            target="30–40% of equity in non-US markets to reduce home-country bias"
            source="Vanguard, MSCI World weighting"
          />
          <ResearchItem
            label="Small vs. Large Cap"
            target="Tilt toward small-cap value for the size + value return premium"
            source="Fama-French 3-factor model (1992)"
          />
          <ResearchItem
            label="Growth vs. Value"
            target="Value stocks outperform growth over long horizons; tilt toward value"
            source="Fama-French value premium research"
          />
        </div>
      </section>

      {/* Multi-custodian tools */}
      <section className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-5 py-5">
        <h2 className="mb-1 text-sm font-semibold">
          Multi-custodian portfolio analysis tools
        </h2>
        <p className="mb-3 text-xs text-gray-500">
          These connect to Fidelity, Morgan Stanley, Schwab, and most 401k providers to
          aggregate holdings automatically.
        </p>
        <div className="space-y-2 text-sm text-gray-700">
          <ToolItem
            name="Empower (Personal Capital)"
            badge="Free"
            description="Connects to most custodians. Investment Checkup shows allocation, fee drag, and target vs. actual."
          />
          <ToolItem
            name="Morningstar Portfolio Manager"
            badge="$35/mo"
            description="Institutional-grade X-Ray: style box, factor exposure, sector concentration. Best for deep analysis."
          />
          <ToolItem
            name="Kubera"
            badge="$150/yr"
            description="Clean UX, net worth tracking, connects to 401k providers including Slavic. Good for holistic view."
          />
          <ToolItem
            name="Sharesight"
            badge="Paid"
            description="Strong tax reporting, multi-custodian, international. Best if you need performance benchmarking."
          />
        </div>
      </section>
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
  alert = false,
}: {
  label: string;
  value: string;
  hint: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        alert
          ? "border-amber-300 bg-amber-50"
          : "border-gray-200 bg-gray-50/60"
      }`}
    >
      <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
        {label}
      </dt>
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
      <dd className="text-[11px] text-gray-400">{hint}</dd>
    </div>
  );
}

function ResearchItem({
  label,
  target,
  source,
}: {
  label: string;
  target: string;
  source: string;
}) {
  return (
    <div>
      <div className="font-medium text-gray-900">{label}</div>
      <div className="mt-0.5 text-gray-600">{target}</div>
      <div className="mt-0.5 text-[11px] text-gray-400">Source: {source}</div>
    </div>
  );
}

function ToolItem({
  name,
  badge,
  description,
}: {
  name: string;
  badge: string;
  description: string;
}) {
  return (
    <div className="flex gap-2">
      <span className="flex-shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-[11px] font-medium text-gray-600">
        {badge}
      </span>
      <div>
        <span className="font-medium">{name}</span>
        {" — "}
        <span className="text-gray-500">{description}</span>
      </div>
    </div>
  );
}
