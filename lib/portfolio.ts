import holdingsJson from "@/data/holdings.json";

export type AssetClass = "Equity" | "Fixed Income" | "Cash" | "Real Assets" | "Alternative";
export type Geography = "US" | "International Developed" | "Emerging Markets";
export type MarketCap = "Large Cap" | "Mid Cap" | "Small Cap";
export type Style = "Growth" | "Value" | "Blend";
export type AccountType = "Taxable" | "Tax-Deferred" | "Tax-Exempt";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  custodian: string;
}

export interface Holding {
  ticker: string;
  name: string;
  account: string;
  value: number;
  assetClass: AssetClass;
  geography: Geography | null;
  marketCap: MarketCap | null;
  style: Style | null;
}

export interface AllocationSlice {
  label: string;
  value: number;
  pct: number;
  color: string;
}

export interface ConcentrationRisk {
  dimension: string;
  label: string;
  pct: number;
  severity: "high" | "moderate";
}

const data = holdingsJson as {
  asOf: string;
  note: string;
  accounts: Account[];
  holdings: Holding[];
};

export const accounts = data.accounts;
export const holdings = data.holdings;
export const asOf = data.asOf;
export const sampleNote = data.note;

export const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

// Research-backed categorical color palette (colorblind-safe: distinct across
// protanopia/deuteranopia/tritanopia — blue/teal/amber/violet anchors avoid
// red-green confusion).
export const ASSET_CLASS_COLORS: Record<string, string> = {
  Equity: "#1d4ed8",
  "Fixed Income": "#059669",
  Cash: "#d97706",
  "Real Assets": "#7c3aed",
  Alternative: "#ea580c",
};

export const GEOGRAPHY_COLORS: Record<string, string> = {
  US: "#1d4ed8",
  "International Developed": "#0f766e",
  "Emerging Markets": "#6d28d9",
};

export const MARKET_CAP_COLORS: Record<string, string> = {
  "Large Cap": "#1d4ed8",
  "Mid Cap": "#0891b2",
  "Small Cap": "#0f766e",
};

export const STYLE_COLORS: Record<string, string> = {
  Blend: "#1d4ed8",
  Growth: "#059669",
  Value: "#d97706",
};

export const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  "Tax-Deferred": "#1d4ed8",
  Taxable: "#d97706",
  "Tax-Exempt": "#059669",
};

function slicesFrom(
  entries: [string, number][],
  colors: Record<string, string>,
  subTotal: number
): AllocationSlice[] {
  return entries
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value,
      pct: (value / subTotal) * 100,
      color: colors[label] ?? "#9ca3af",
    }));
}

export function byAssetClass(): AllocationSlice[] {
  const map = new Map<string, number>();
  for (const h of holdings) {
    map.set(h.assetClass, (map.get(h.assetClass) ?? 0) + h.value);
  }
  return slicesFrom([...map], ASSET_CLASS_COLORS, totalValue);
}

// Geography, market cap, and style are equity-only dimensions — percentages
// are within the equity sub-total, not the whole portfolio.
export function equityTotal(): number {
  return holdings
    .filter((h) => h.assetClass === "Equity")
    .reduce((s, h) => s + h.value, 0);
}

export function byGeography(): AllocationSlice[] {
  const eq = equityTotal();
  const map = new Map<string, number>();
  for (const h of holdings.filter((h) => h.assetClass === "Equity")) {
    const k = h.geography ?? "Unknown";
    map.set(k, (map.get(k) ?? 0) + h.value);
  }
  return slicesFrom([...map], GEOGRAPHY_COLORS, eq);
}

export function byMarketCap(): AllocationSlice[] {
  const relevant = holdings.filter(
    (h) => h.assetClass === "Equity" && h.marketCap !== null
  );
  const sub = relevant.reduce((s, h) => s + h.value, 0);
  const map = new Map<string, number>();
  for (const h of relevant) {
    const k = h.marketCap!;
    map.set(k, (map.get(k) ?? 0) + h.value);
  }
  return slicesFrom([...map], MARKET_CAP_COLORS, sub);
}

export function byStyle(): AllocationSlice[] {
  const relevant = holdings.filter(
    (h) => h.assetClass === "Equity" && h.style !== null
  );
  const sub = relevant.reduce((s, h) => s + h.value, 0);
  const map = new Map<string, number>();
  for (const h of relevant) {
    const k = h.style!;
    map.set(k, (map.get(k) ?? 0) + h.value);
  }
  return slicesFrom([...map], STYLE_COLORS, sub);
}

export function byAccountType(): AllocationSlice[] {
  const map = new Map<string, number>();
  for (const h of holdings) {
    const acct = accounts.find((a) => a.id === h.account);
    const type = acct?.type ?? "Unknown";
    map.set(type, (map.get(type) ?? 0) + h.value);
  }
  return slicesFrom([...map], ACCOUNT_TYPE_COLORS, totalValue);
}

// Flag slices that exceed research-recommended concentration thresholds.
export function concentrationRisks(): ConcentrationRisk[] {
  const risks: ConcentrationRisk[] = [];

  for (const s of byAssetClass()) {
    if (s.pct > 75) risks.push({ dimension: "Asset Class", label: s.label, pct: s.pct, severity: "high" });
    else if (s.pct > 60) risks.push({ dimension: "Asset Class", label: s.label, pct: s.pct, severity: "moderate" });
  }
  for (const s of byGeography()) {
    if (s.pct > 75) risks.push({ dimension: "Geography (equity)", label: s.label, pct: s.pct, severity: "high" });
    else if (s.pct > 60) risks.push({ dimension: "Geography (equity)", label: s.label, pct: s.pct, severity: "moderate" });
  }
  for (const s of byMarketCap()) {
    if (s.pct > 85) risks.push({ dimension: "Market Cap (equity)", label: s.label, pct: s.pct, severity: "high" });
    else if (s.pct > 70) risks.push({ dimension: "Market Cap (equity)", label: s.label, pct: s.pct, severity: "moderate" });
  }

  return risks;
}

export function formatPortfolioValue(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}
