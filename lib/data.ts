import feedsJson from "@/data/feeds.json";
import protocolsJson from "@/data/protocols.json";
import coverageJson from "@/data/coverage.json";
import detailsJson from "@/data/details.json";

export type CoverageStatus = "covered" | "partial" | "not-yet-covered";

export interface Feed {
  id: string;
  name: string;
  focus: string;
  type: "Rating" | "Dashboard" | "Monitoring" | "Research";
  url: string;
  accessibility: {
    class: "public-api" | "published-scrapeable" | "gated-manual";
    verified: boolean;
    note: string;
  };
}

export interface Protocol {
  id: string;
  name: string;
  family: string;
  versions?: string[];
  category: string;
  notes: string;
  metric: { kind: "tvl" | "volume24h"; slug: string | null };
}

export interface CoverageCell {
  status: CoverageStatus;
  provenance: string;
  note?: string;
}

export interface GovernanceFact {
  label: string;
  value: string;
  provenance: string;
  source: string;
}

export interface Audit {
  firm: string;
  scope: string;
  date: string;
  link: string;
}

export interface Incident {
  date: string;
  description: string;
  link: string;
}

export interface ProtocolDetail {
  governance: GovernanceFact[];
  audits: Audit[];
  incidents: Incident[];
}

export const feeds = feedsJson.feeds as Feed[];
export const protocols = protocolsJson.protocols as Protocol[];
export const details = detailsJson.details as unknown as Record<
  string,
  ProtocolDetail
>;

interface CoverageEntry {
  protocol: string;
  feed: string;
  status: string;
  provenance: string;
  note?: string;
}

const cellMap = new Map<string, CoverageCell>();
for (const e of coverageJson.entries as CoverageEntry[]) {
  cellMap.set(`${e.protocol}:${e.feed}`, {
    status: e.status as CoverageStatus,
    provenance: e.provenance,
    note: e.note,
  });
}

// Every protocol×feed pair resolves to a labeled cell — unlisted pairs are
// explicitly "not yet covered / assessment pending", never blank (RFP hard req).
export function getCell(protocolId: string, feedId: string): CoverageCell {
  return (
    cellMap.get(`${protocolId}:${feedId}`) ?? {
      status: "not-yet-covered",
      provenance: "assessment-pending",
    }
  );
}

export function getProtocol(id: string): Protocol | undefined {
  return protocols.find((p) => p.id === id);
}
