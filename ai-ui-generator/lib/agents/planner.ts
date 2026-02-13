import { createOpenRouterClient, openrouter } from "@/lib/openrouter";
import { allowedComponents } from "@/lib/componentRegistry";
import { Plan } from "@/lib/types/plan";
import { getAllowedProps } from "@/lib/propSchemas";

const MODELS = [
  "openrouter/free",
  "meta-llama/llama-3.2-3b-instruct:free",
];

const MAX_DEPTH = 5;

/**
 * Planner with model fallback robustness
 */
export async function planner(
  userIntent: string,
  previousTree?: any,
  onLog?: (message: string) => void,
  apiKeys?: string[]
): Promise<Plan> {
  const mode = previousTree ? "modify" : "create";

  const componentDetails = allowedComponents
    .map((comp) => {
      const props = getAllowedProps(comp as any);
      const propDetails = props.map(prop => {
        // Special handling for enum props
        if (comp === "Button" && prop === "variant") {
          return `${prop} ("primary"|"secondary")`;
        }
        return prop;
      }).join(", ");
      return `  - ${comp}: props = {${propDetails}}`;
    })
    .join("\n");

  const prompt = `
You are a UI planning agent. Return ONLY valid JSON.

ALLOWED COMPONENTS:
${componentDetails}

SCHEMA:
{
  "mode": "${mode}",
  "intent": "${userIntent}",
  "root": {
    "type": "ComponentName",
    "props": {},
    "children": [],
    "reasoning": "why this component"
  },
  "description": "what changed",
  ${
    mode === "modify"
      ? `"changes": { "added": [], "removed": [], "modified": [] },`
      : ""
  }
  "constraints": {
    "allowedComponents": [...],
    "maxDepth": ${MAX_DEPTH}
  }
}

RULES:
- type must match allowed components
- props must match component's allowed props
- children is array of ComponentSpec (recursive)
- reasoning explains why component was chosen
- maxDepth prevents infinite nesting
${mode === "modify" ? `- Preserve existing structure unless explicitly requested\n- Previous tree:\n${JSON.stringify(previousTree, null, 2)}` : ""}

User Intent: ${userIntent}

Return JSON only. No markdown.
`.trim();

  let lastError: Error | null = null;

  const emitLog = onLog ?? ((message: string) => console.log(message));
  const keys = apiKeys && apiKeys.length > 0 ? apiKeys : [""];

  // Try models with fallback
  for (const model of MODELS) {
    emitLog(`Attempting with model: ${model}`);

    for (const apiKey of keys) {
      try {
        const client = apiKey ? createOpenRouterClient(apiKey) : openrouter;

        const response = await client.chat.completions.create({
          model,
          temperature: 0,
          messages: [
            {
              role: "system",
              content: "You ONLY output valid JSON. No markdown. No explanations.",
            },
            { role: "user", content: prompt },
          ],
        });

        const raw = response.choices[0].message.content || "";
        emitLog(`Model ${model} response length: ${raw.length}`);

        if (!raw.trim()) {
          throw new Error("Empty response from model");
        }

        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No valid JSON found in output");
        }

        const plan: Plan = JSON.parse(jsonMatch[0]);

        // Basic validation
        if (!plan.root || !plan.root.type) {
          throw new Error("Plan missing root component");
        }

        emitLog(`✅ Model ${model} succeeded`);
        return plan;
      } catch (error: any) {
        const status = error?.status ?? error?.response?.status;
        const message = error?.message || "Unknown error";
        const isRateLimit = status === 429 || /429|rate limit/i.test(message);

        emitLog(`❌ Model ${model} failed: ${message}`);
        lastError = error;

        if (isRateLimit && keys.length > 1) {
          emitLog("⚠️ Rate limited. Trying fallback key...");
          continue;
        }

        break;
      }
    }
  }

  // All models failed
  throw new Error(
    `All models failed. Last error: ${lastError?.message || "Unknown"}`
  );
}
