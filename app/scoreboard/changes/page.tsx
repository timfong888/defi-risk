import Link from "next/link";
import { CHANGES, directionColor, directionIcon } from "@/lib/scoreboard-changes";

export const metadata = {
  title: "Change Feed — Agentic Risk Scoreboard",
  description:
    "What changed in AI model behaviour across providers since last week — unannounced divergences, newly measured dimensions, and resolved regressions.",
};

export default function ChangesPage() {
  const grouped = CHANGES.reduce<Record<string, typeof CHANGES>>((acc, c) => {
    if (!acc[c.date]) acc[c.date] = [];
    acc[c.date].push(c);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) =>
    b.localeCompare(a)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <nav className="text-xs text-gray-400 mb-2">
          <Link href="/scoreboard" className="hover:text-gray-700">
            Scoreboard
          </Link>
          <span className="mx-1">›</span>
          <span>Change Feed</span>
        </nav>
        <h1 className="text-2xl font-semibold tracking-tight">Change Feed</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          What changed in AI model behaviour across providers since last week —
          unannounced divergences, newly measured dimensions, and resolved regressions.
          This is the inherently newsworthy artifact: behaviour that changed without
          any public announcement.
        </p>
        <p className="mt-2 text-xs text-gray-400">
          {CHANGES.length} changes · placeholder data · auto-updated weekly when
          live pipeline (SAT-913) ships
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1.5 text-rose-600 font-medium">
          <span>↑</span> Divergence increased (regression)
        </span>
        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
          <span>↓</span> Divergence decreased (improvement)
        </span>
        <span className="flex items-center gap-1.5 text-sky-600 font-medium">
          <span>★</span> New dimension measured
        </span>
      </div>

      {/* Change list grouped by date */}
      <div className="space-y-8">
        {sortedDates.map((date) => (
          <div key={date}>
            <h2 className="text-sm font-semibold text-gray-500 mb-3">{date}</h2>
            <ul className="space-y-3">
              {grouped[date].map((c) => (
                <li
                  key={c.id}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1.5">
                    <span
                      className={`text-sm font-bold ${directionColor(c.direction)}`}
                    >
                      {directionIcon(c.direction)}
                    </span>
                    <span className="text-xs font-semibold text-gray-700">
                      {c.modelName}
                    </span>
                    <span className="text-xs text-gray-400">via</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {c.providerName}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {c.dimensionName}
                    </span>
                  </div>
                  <p className="font-medium text-sm text-gray-900">{c.summary}</p>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    {c.detail}
                  </p>
                  <div className="mt-2">
                    <Link
                      href={`/scoreboard/model/${c.modelId}`}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      View {c.modelName} detail →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <Link
          href="/scoreboard"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to divergence matrix
        </Link>
      </div>
    </div>
  );
}
