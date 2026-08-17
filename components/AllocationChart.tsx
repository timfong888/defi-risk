"use client";

import { useState } from "react";
import type { AllocationSlice } from "@/lib/portfolio";

function fmtValue(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

interface Props {
  title: string;
  subtitle?: string;
  note?: string;
  slices: AllocationSlice[];
}

export default function AllocationChart({ title, subtitle, note, slices }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-5 py-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>

      {/* Stacked overview bar */}
      <div className="mb-5 flex h-6 overflow-hidden rounded">
        {slices.map((s) => (
          <div
            key={s.label}
            style={{ width: `${s.pct}%`, backgroundColor: s.color }}
            className={`transition-opacity duration-100 ${
              hovered !== null && hovered !== s.label ? "opacity-30" : "opacity-100"
            }`}
            onMouseEnter={() => setHovered(s.label)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </div>

      {/* Per-category bars */}
      <div className="space-y-3">
        {slices.map((s) => {
          const dim = hovered === null || hovered === s.label;
          return (
            <div
              key={s.label}
              className="flex items-center gap-3"
              onMouseEnter={() => setHovered(s.label)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Color swatch */}
              <div
                className="h-3 w-3 flex-shrink-0 rounded-sm transition-opacity duration-100"
                style={{ backgroundColor: s.color, opacity: dim ? 1 : 0.3 }}
              />

              {/* Label + bar + value */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span
                    className={`text-xs font-medium truncate transition-opacity duration-100 ${
                      dim ? "opacity-100" : "opacity-30"
                    }`}
                  >
                    {s.label}
                  </span>
                  <span
                    className={`ml-3 flex-shrink-0 text-xs tabular-nums text-gray-600 transition-opacity duration-100 ${
                      dim ? "opacity-100" : "opacity-30"
                    }`}
                  >
                    {fmtValue(s.value)}{" "}
                    <span className="text-gray-400">· {s.pct.toFixed(1)}%</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-opacity duration-100"
                    style={{
                      width: `${s.pct}%`,
                      backgroundColor: s.color,
                      opacity: dim ? 1 : 0.3,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {note && <p className="mt-4 text-[11px] text-gray-400">{note}</p>}
    </div>
  );
}
