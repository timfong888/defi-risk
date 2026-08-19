export interface ChangeEntry {
  id: string;
  date: string; // ISO date
  modelId: string;
  modelName: string;
  providerId: string;
  providerName: string;
  dimensionName: string;
  direction: "increase" | "decrease" | "new";
  summary: string;
  detail: string;
}

export const CHANGES: ChangeEntry[] = [
  {
    id: "c1",
    date: "2026-08-18",
    modelId: "gpt-4o",
    modelName: "GPT-4o",
    providerId: "azure",
    providerName: "Azure AI Foundry",
    dimensionName: "Safety Calibration",
    direction: "increase",
    summary: "Azure GPT-4o refusal rate on finance queries rose +6 pp",
    detail:
      "Following Azure's July enterprise policy update, the model now refuses roughly 1-in-8 financial-planning prompts that the direct OpenAI API still answers. Divergence on this dimension moved from 16% → 22%.",
  },
  {
    id: "c2",
    date: "2026-08-15",
    modelId: "gpt-4o",
    modelName: "GPT-4o",
    providerId: "together",
    providerName: "Together AI",
    dimensionName: "Format Fidelity",
    direction: "increase",
    summary: "Together GPT-4o tool-use reliability degraded after infra update",
    detail:
      "A Together infra update on 2026-08-14 introduced a bug where tool_choice: 'required' is silently ignored on ~30% of requests. Fixed in their next release but data was collected mid-incident. Divergence: 18% → 32%.",
  },
  {
    id: "c3",
    date: "2026-08-12",
    modelId: "claude-3-5-sonnet",
    modelName: "Claude 3.5 Sonnet",
    providerId: "bedrock",
    providerName: "AWS Bedrock",
    dimensionName: "Safety Calibration",
    direction: "decrease",
    summary: "Bedrock Claude safety divergence narrowed after Anthropic model refresh",
    detail:
      "Anthropic pushed a minor safety recalibration to both the direct API and Bedrock simultaneously. The Bedrock-specific classifier layer that previously added extra refusals was updated to match the new baseline. Divergence: 18% → 12%.",
  },
  {
    id: "c4",
    date: "2026-08-10",
    modelId: "gemini-1-5-pro",
    modelName: "Gemini 1.5 Pro",
    providerId: "vertex",
    providerName: "Google Vertex AI",
    dimensionName: "Instruction Following",
    direction: "decrease",
    summary: "Vertex Gemini instruction-following gap closed after prompt-template fix",
    detail:
      "Google fixed a Vertex prompt-template serialisation bug that was truncating system prompts above 4k tokens. Post-fix, instruction-following divergence dropped from 9% → 2%.",
  },
  {
    id: "c5",
    date: "2026-08-08",
    modelId: "claude-3-5-sonnet",
    modelName: "Claude 3.5 Sonnet",
    providerId: "vertex",
    providerName: "Google Vertex AI",
    dimensionName: "Format Fidelity",
    direction: "new",
    summary: "Streaming delta format now measured on Vertex Claude",
    detail:
      "Added streaming-delta format consistency to the Vertex Claude test suite. First measurement shows a 10% divergence from direct Anthropic API — streaming chunk boundaries differ slightly but content is identical.",
  },
  {
    id: "c6",
    date: "2026-08-05",
    modelId: "gpt-4o",
    modelName: "GPT-4o",
    providerId: "azure",
    providerName: "Azure AI Foundry",
    dimensionName: "Output Consistency",
    direction: "increase",
    summary: "Azure GPT-4o consistency variance increased — multi-region routing suspected",
    detail:
      "Consistency variance rose from 8% → 11%. Azure's multi-region load balancer appears to route requests to different model replicas with slightly different sampling seeds. Raised with Azure support.",
  },
];

export function directionColor(direction: ChangeEntry["direction"]): string {
  if (direction === "increase") return "text-rose-600";
  if (direction === "decrease") return "text-emerald-600";
  return "text-sky-600";
}

export function directionIcon(direction: ChangeEntry["direction"]): string {
  if (direction === "increase") return "↑";
  if (direction === "decrease") return "↓";
  return "★";
}
