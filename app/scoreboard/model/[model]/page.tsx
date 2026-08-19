import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MODELS,
  PROVIDERS,
  DIMENSIONS,
  getModelById,
  getModelData,
  getProviderById,
  getDimensionById,
  divergenceColor,
  divergenceSeverity,
} from "@/lib/scoreboard";

export function generateStaticParams() {
  return MODELS.map((m) => ({ model: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  const { model: modelId } = await params;
  const model = getModelById(modelId);
  return {
    title: model
      ? `${model.name} — Fidelity Scoreboard`
      : "Model — Fidelity Scoreboard",
  };
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  const { model: modelId } = await params;
  const model = getModelById(modelId);
  if (!model) notFound();

  const data = getModelData(modelId);
  const availableProviders = (data?.providers ?? []).filter(
    (p) => !p.isReference && p.divergenceScore !== null
  );

  const providerObjects = availableProviders
    .map((e) => getProviderById(e.providerId))
    .filter(Boolean) as (typeof PROVIDERS)[number][];

  return (
    <div className="space-y-8">
      {/* Breadcrumb + header */}
      <div>
        <nav className="text-xs text-gray-400 mb-2">
          <Link href="/scoreboard" className="hover:text-gray-700">
            Scoreboard
          </Link>
          <span className="mx-1">›</span>
          <span>{model.name}</span>
        </nav>
        <h1 className="text-2xl font-semibold tracking-tight">{model.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {model.description} · by {model.maker}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Behavioural divergence vs. the direct {model.maker} API across{" "}
          {availableProviders.length} measured provider
          {availableProviders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Per-provider aggregate badges */}
      <div className="flex flex-wrap gap-3">
        {availableProviders.map((entry) => {
          const provider = getProviderById(entry.providerId);
          if (!provider) return null;
          return (
            <div
              key={entry.providerId}
              className={`rounded-lg border px-4 py-3 ${
                entry.divergenceScore !== null && entry.divergenceScore > 20
                  ? "border-orange-200 bg-orange-50"
                  : entry.divergenceScore !== null && entry.divergenceScore > 10
                  ? "border-amber-200 bg-amber-50"
                  : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <div className="text-xs font-medium text-gray-600">
                {provider.shortName}
              </div>
              <div className="text-2xl font-bold tabular-nums mt-0.5">
                {entry.divergenceScore}%
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {divergenceSeverity(entry.divergenceScore)} divergence
              </div>
            </div>
          );
        })}
      </div>

      {/* Dimension breakdown table */}
      <div>
        <h2 className="text-base font-semibold mb-3">
          Dimension breakdown — {model.name}
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Dimension
                </th>
                {providerObjects.map((p) => (
                  <th
                    key={p.id}
                    className="px-4 py-3 text-center font-medium text-gray-700"
                  >
                    {p.shortName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DIMENSIONS.map((dim) => (
                <tr key={dim.id}>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-800">{dim.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {dim.description}
                    </div>
                  </td>
                  {availableProviders.map((entry) => {
                    const dimScore = entry.dimensions.find(
                      (d) => d.dimensionId === dim.id
                    );
                    return (
                      <td
                        key={entry.providerId}
                        className="px-4 py-4 text-center align-top"
                      >
                        {dimScore ? (
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${divergenceColor(dimScore.score)}`}
                            >
                              {dimScore.score}%
                            </span>
                            <p className="text-[11px] text-gray-500 max-w-[180px] leading-snug">
                              {dimScore.note}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Other models */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-2">
          Other models
        </h2>
        <div className="flex flex-wrap gap-2">
          {MODELS.filter((m) => m.id !== modelId).map((m) => (
            <Link
              key={m.id}
              href={`/scoreboard/model/${m.id}`}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            >
              {m.name}
            </Link>
          ))}
          <Link
            href="/scoreboard"
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:border-indigo-300"
          >
            ← Full matrix
          </Link>
        </div>
      </div>
    </div>
  );
}
