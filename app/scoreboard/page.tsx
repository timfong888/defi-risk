import Link from "next/link";
import {
  MODELS,
  PROVIDERS,
  SCOREBOARD,
  divergenceColor,
  divergenceLabel,
  divergenceSeverity,
  getModelData,
} from "@/lib/scoreboard";
import { CHANGES } from "@/lib/scoreboard-changes";

export const metadata = {
  title: "Agentic Risk Scoreboard — Fidelity Divergence Matrix",
  description:
    "How much does each AI model's behaviour change depending on which provider you use? A neutral, evidence-based divergence matrix across models, providers, and behavioural dimensions.",
};

export default function ScoreboardPage() {
  const availableProviders = PROVIDERS.filter((p) => p.id !== "direct");
  const recentChanges = CHANGES.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Agentic Risk — Fidelity Scoreboard
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          How much does each AI model diverge from its reference implementation
          depending on which provider serves it? Zero = identical to the model
          maker's direct API. Higher = more divergence.
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
          <span>
            <strong className="text-gray-700">{MODELS.length} models</strong>{" "}
            ×{" "}
            <strong className="text-gray-700">
              {availableProviders.length} providers
            </strong>{" "}
            × <strong className="text-gray-700">4 dimensions</strong>
          </span>
          <span>Placeholder data — live pipeline in SAT-913</span>
          <Link
            href="/scoreboard/changes"
            className="text-indigo-600 hover:underline"
          >
            {CHANGES.length} changes since last week →
          </Link>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { label: "Reference (0%)", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
          { label: "Low (1–10%)", cls: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
          { label: "Medium (11–20%)", cls: "bg-amber-100 text-amber-800 border border-amber-200" },
          { label: "High (21–30%)", cls: "bg-orange-100 text-orange-800 border border-orange-200" },
          { label: "Very High (>30%)", cls: "bg-red-100 text-red-800 border border-red-200" },
          { label: "N/A", cls: "bg-gray-100 text-gray-400 border border-gray-200" },
        ].map(({ label, cls }) => (
          <span key={label} className={`rounded px-2 py-0.5 font-medium ${cls}`}>
            {label}
          </span>
        ))}
      </div>

      {/* Divergence Matrix */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Model
              </th>
              <th className="px-4 py-3 text-center font-medium text-gray-500 text-xs">
                Direct API
                <div className="font-normal text-gray-400">(reference)</div>
              </th>
              {availableProviders.map((p) => (
                <th
                  key={p.id}
                  className="px-4 py-3 text-center font-medium text-gray-700"
                >
                  {p.shortName}
                </th>
              ))}
              <th className="px-4 py-3 text-center font-medium text-gray-700">
                Detail
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MODELS.map((model) => {
              const data = getModelData(model.id);
              return (
                <tr key={model.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-4">
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-gray-400">{model.maker}</div>
                  </td>
                  {/* Reference cell */}
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">
                      Ref
                    </span>
                  </td>
                  {/* Provider cells */}
                  {availableProviders.map((p) => {
                    const entry = data?.providers.find(
                      (e) => e.providerId === p.id
                    );
                    const score = entry?.divergenceScore ?? null;
                    return (
                      <td key={p.id} className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${divergenceColor(score)}`}
                          >
                            {divergenceLabel(score)}
                          </span>
                          {score !== null && score > 0 && (
                            <span className="text-[10px] text-gray-400">
                              {divergenceSeverity(score)}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-4 py-4 text-center">
                    <Link
                      href={`/scoreboard/model/${model.id}`}
                      className="rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recent changes teaser */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-semibold">Recent changes</h2>
          <Link
            href="/scoreboard/changes"
            className="text-xs text-indigo-600 hover:underline"
          >
            View all →
          </Link>
        </div>
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {recentChanges.map((c) => (
            <li key={c.id} className="px-4 py-3">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-xs text-gray-400">{c.date}</span>
                <span className="text-xs font-medium text-gray-600">
                  {c.modelName}
                </span>
                <span className="text-xs text-gray-400">via</span>
                <span className="text-xs font-medium text-gray-600">
                  {c.providerName}
                </span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">{c.dimensionName}</span>
              </div>
              <p className="mt-0.5 text-sm">{c.summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
