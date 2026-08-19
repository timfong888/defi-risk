export interface Model {
  id: string;
  name: string;
  maker: string;
  description: string;
}

export interface Provider {
  id: string;
  name: string;
  shortName: string;
}

export interface Dimension {
  id: string;
  name: string;
  description: string;
}

export interface DimensionScore {
  dimensionId: string;
  score: number; // 0–100, divergence from reference (0 = identical)
  note: string;  // brief behavioural observation
}

export interface ProviderEntry {
  providerId: string;
  isReference: boolean;
  divergenceScore: number | null; // null = not available
  dimensions: DimensionScore[];
}

export interface ModelData {
  modelId: string;
  providers: ProviderEntry[];
}

// ---- Static definitions ----

export const MODELS: Model[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    maker: "OpenAI",
    description: "OpenAI flagship multimodal model",
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    maker: "Anthropic",
    description: "Anthropic's top coding and reasoning model",
  },
  {
    id: "gemini-1-5-pro",
    name: "Gemini 1.5 Pro",
    maker: "Google",
    description: "Google's long-context multimodal model",
  },
];

export const PROVIDERS: Provider[] = [
  { id: "direct", name: "Direct API (reference)", shortName: "Direct" },
  { id: "azure", name: "Azure AI Foundry", shortName: "Azure" },
  { id: "bedrock", name: "AWS Bedrock", shortName: "Bedrock" },
  { id: "vertex", name: "Google Vertex AI", shortName: "Vertex" },
  { id: "together", name: "Together AI", shortName: "Together" },
];

export const DIMENSIONS: Dimension[] = [
  {
    id: "instruction-following",
    name: "Instruction Following",
    description: "Degree to which the model honours system-prompt constraints",
  },
  {
    id: "safety-calibration",
    name: "Safety Calibration",
    description: "Consistency of refusals across equivalent harmful prompts",
  },
  {
    id: "output-consistency",
    name: "Output Consistency",
    description: "Variance in responses to identical prompts over 10 runs",
  },
  {
    id: "format-fidelity",
    name: "Format Fidelity",
    description: "Reliability of structured output (JSON schema, markdown) compliance",
  },
];

// ---- Dummy data ----

export const SCOREBOARD: ModelData[] = [
  {
    modelId: "gpt-4o",
    providers: [
      {
        providerId: "direct",
        isReference: true,
        divergenceScore: 0,
        dimensions: [
          { dimensionId: "instruction-following", score: 0, note: "Reference baseline" },
          { dimensionId: "safety-calibration", score: 0, note: "Reference baseline" },
          { dimensionId: "output-consistency", score: 0, note: "Reference baseline" },
          { dimensionId: "format-fidelity", score: 0, note: "Reference baseline" },
        ],
      },
      {
        providerId: "azure",
        isReference: false,
        divergenceScore: 14,
        dimensions: [
          { dimensionId: "instruction-following", score: 8, note: "Enterprise content filters override some permissive system prompts" },
          { dimensionId: "safety-calibration", score: 22, note: "Azure adds supplemental refusals on finance and legal topics" },
          { dimensionId: "output-consistency", score: 11, note: "Slightly higher variance, likely from load-balancer routing across regions" },
          { dimensionId: "format-fidelity", score: 15, note: "JSON schema compliance differs on deeply nested objects" },
        ],
      },
      {
        providerId: "bedrock",
        isReference: false,
        divergenceScore: null,
        dimensions: [],
      },
      {
        providerId: "vertex",
        isReference: false,
        divergenceScore: null,
        dimensions: [],
      },
      {
        providerId: "together",
        isReference: false,
        divergenceScore: 29,
        dimensions: [
          { dimensionId: "instruction-following", score: 31, note: "System prompt adherence drops on long prompts above 2k tokens" },
          { dimensionId: "safety-calibration", score: 19, note: "Fewer refusals than reference on dual-use queries" },
          { dimensionId: "output-consistency", score: 34, note: "Temperature behaviour differs; same nominal temp produces more variance" },
          { dimensionId: "format-fidelity", score: 32, note: "Tool-use schema sometimes ignored, falls back to prose" },
        ],
      },
    ],
  },
  {
    modelId: "claude-3-5-sonnet",
    providers: [
      {
        providerId: "direct",
        isReference: true,
        divergenceScore: 0,
        dimensions: [
          { dimensionId: "instruction-following", score: 0, note: "Reference baseline" },
          { dimensionId: "safety-calibration", score: 0, note: "Reference baseline" },
          { dimensionId: "output-consistency", score: 0, note: "Reference baseline" },
          { dimensionId: "format-fidelity", score: 0, note: "Reference baseline" },
        ],
      },
      {
        providerId: "azure",
        isReference: false,
        divergenceScore: null,
        dimensions: [],
      },
      {
        providerId: "bedrock",
        isReference: false,
        divergenceScore: 9,
        dimensions: [
          { dimensionId: "instruction-following", score: 7, note: "Minor prompt template wrapping introduces small instruction drift" },
          { dimensionId: "safety-calibration", score: 12, note: "Bedrock applies an additional content classifier layer" },
          { dimensionId: "output-consistency", score: 8, note: "Consistent; routing to single region reduces variance" },
          { dimensionId: "format-fidelity", score: 9, note: "Tool use and structured outputs are near-identical to direct" },
        ],
      },
      {
        providerId: "vertex",
        isReference: false,
        divergenceScore: 11,
        dimensions: [
          { dimensionId: "instruction-following", score: 10, note: "Vertex model garden wraps system prompts, causing minor truncation at limits" },
          { dimensionId: "safety-calibration", score: 15, note: "Google safety classifiers add a layer above Anthropic's own guardrails" },
          { dimensionId: "output-consistency", score: 9, note: "On par with direct; multi-region load balancing is transparent" },
          { dimensionId: "format-fidelity", score: 10, note: "JSON mode behaves identically; streaming deltas differ slightly" },
        ],
      },
      {
        providerId: "together",
        isReference: false,
        divergenceScore: null,
        dimensions: [],
      },
    ],
  },
  {
    modelId: "gemini-1-5-pro",
    providers: [
      {
        providerId: "direct",
        isReference: true,
        divergenceScore: 0,
        dimensions: [
          { dimensionId: "instruction-following", score: 0, note: "Reference baseline (AI Studio)" },
          { dimensionId: "safety-calibration", score: 0, note: "Reference baseline (AI Studio)" },
          { dimensionId: "output-consistency", score: 0, note: "Reference baseline (AI Studio)" },
          { dimensionId: "format-fidelity", score: 0, note: "Reference baseline (AI Studio)" },
        ],
      },
      {
        providerId: "azure",
        isReference: false,
        divergenceScore: null,
        dimensions: [],
      },
      {
        providerId: "bedrock",
        isReference: false,
        divergenceScore: null,
        dimensions: [],
      },
      {
        providerId: "vertex",
        isReference: false,
        divergenceScore: 3,
        dimensions: [
          { dimensionId: "instruction-following", score: 2, note: "Vertex IS the primary production API; behaviour is near-identical to AI Studio" },
          { dimensionId: "safety-calibration", score: 4, note: "Enterprise safety settings default to slightly stricter thresholds" },
          { dimensionId: "output-consistency", score: 3, note: "Consistent across identical prompts" },
          { dimensionId: "format-fidelity", score: 3, note: "Controlled generation (JSON schema) behaves identically" },
        ],
      },
      {
        providerId: "together",
        isReference: false,
        divergenceScore: null,
        dimensions: [],
      },
    ],
  },
];

// ---- Helpers ----

export function getModelById(id: string): Model | undefined {
  return MODELS.find((m) => m.id === id);
}

export function getProviderById(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export function getDimensionById(id: string): Dimension | undefined {
  return DIMENSIONS.find((d) => d.id === id);
}

export function getModelData(modelId: string): ModelData | undefined {
  return SCOREBOARD.find((m) => m.modelId === modelId);
}

export function divergenceColor(score: number | null): string {
  if (score === null) return "bg-gray-100 text-gray-400";
  if (score === 0) return "bg-emerald-50 text-emerald-700";
  if (score <= 10) return "bg-emerald-100 text-emerald-800";
  if (score <= 20) return "bg-amber-100 text-amber-800";
  if (score <= 30) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

export function divergenceLabel(score: number | null): string {
  if (score === null) return "N/A";
  if (score === 0) return "Reference";
  return `${score}%`;
}

export function divergenceSeverity(score: number | null): string {
  if (score === null) return "—";
  if (score === 0) return "Ref";
  if (score <= 10) return "Low";
  if (score <= 20) return "Medium";
  return "High";
}
