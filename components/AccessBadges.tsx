import type { Feed } from "@/lib/data";

// #66 access categorization badges, shared by /feeds and /methodology so the
// visual language is identical across views.

// Exhaustive over the api union — a missing/extra key fails at compile time.
const API_STYLE: Record<Feed["accessibility"]["api"], string> = {
  open: "bg-emerald-50 text-emerald-700",
  permissioned: "bg-amber-50 text-amber-700",
  paid: "bg-violet-50 text-violet-700",
  none: "bg-gray-100 text-gray-500",
  unknown: "bg-gray-50 text-gray-400",
};

export function ApiPill({ api }: { api: Feed["accessibility"]["api"] }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${API_STYLE[api]}`}
      title="how the data is accessed programmatically"
    >
      API: {api}
    </span>
  );
}

export function Cap({
  label,
  v,
}: {
  label: string;
  v: "yes" | "no" | "unknown";
}) {
  const mark = v === "yes" ? "✓" : v === "no" ? "✗" : "?";
  const style =
    v === "yes"
      ? "bg-emerald-50 text-emerald-700"
      : v === "no"
        ? "bg-gray-100 text-gray-400"
        : "bg-amber-50 text-amber-600";
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[11px] ${style}`}
      title={v === "unknown" ? "not yet verified" : v}
    >
      {label} {mark}
    </span>
  );
}
