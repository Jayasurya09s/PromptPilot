/**
 * Explainer Agent
 * 
 * Generates human-readable explanations of AI-generated UI structures.
 * Helps users understand why certain design decisions were made.
 * 
 * @module agents/explainer
 */

import { createOpenRouterClient, openrouter } from "@/lib/openrouter";
import { UINode } from "@/lib/types";

const MODELS = [
  "openrouter/free",
  "meta-llama/llama-3.2-3b-instruct:free",
];

/**
 * Generates a natural language explanation of a UI structure.
 * 
 * Uses an LLM to analyze the UI tree and explain the design decisions
 * in plain English. This helps users understand the AI's reasoning.
 * Includes fallback mechanism for reliability.
 * 
 * @param plan - The UI tree to explain
 * @returns Promise resolving to explanation text
 * 
 * @example
 * ```typescript
 * const uiTree = { type: "Navbar", props: {}, children: [...] };
 * const explanation = await explainer(uiTree);
 * console.log(explanation);
 * // Output: "The Navbar provides top-level navigation..."
 * ```
 */
export async function explainer(
  plan: UINode,
  onLog?: (message: string) => void,
  apiKeys?: string[]
): Promise<string> {
  const prompt = `
You are an AI UI explainer.

Your job:
Explain in plain English why this UI structure was chosen.

Be concise.
Reference the components and layout logic.
Do not include markdown.
Do not repeat the JSON.

UI Structure:
${JSON.stringify(plan, null, 2)}
`;

  let lastError: Error | null = null;

  const emitLog = onLog ?? ((message: string) => console.log(message));
  const keys = apiKeys && apiKeys.length > 0 ? apiKeys : [""];

  // Try models with fallback
  for (const model of MODELS) {
    emitLog(`[Explainer] Attempting with model: ${model}`);

    for (const apiKey of keys) {
      try {
        const client = apiKey ? createOpenRouterClient(apiKey) : openrouter;

        const response = await client.chat.completions.create({
          model,
          temperature: 0.2, // Low temperature for consistent explanations
          messages: [
            {
              role: "system",
              content: "You explain UI decisions clearly."
            },
            {
              role: "user",
              content: prompt
            }
          ],
        });

        const explanation = response.choices[0].message.content || "";
        
        if (!explanation.trim()) {
          throw new Error("Empty explanation from model");
        }

        emitLog(`[Explainer] ✅ Model ${model} succeeded`);
        return explanation;

      } catch (error: any) {
        const status = error?.status ?? error?.response?.status;
        const message = error?.message || "Unknown error";
        const isRateLimit = status === 429 || /429|rate limit/i.test(message);

        emitLog(`[Explainer] ❌ Model ${model} failed: ${message}`);
        lastError = error;

        if (isRateLimit && keys.length > 1) {
          emitLog("[Explainer] ⚠️ Rate limited. Trying fallback key...");
          continue;
        }

        break;
      }
    }
  }

  // All models failed - return fallback explanation
  emitLog("[Explainer] All models failed, using fallback");
  return `This UI structure was generated based on your request. It includes ${plan.type} as the root component${plan.children && plan.children.length > 0 ? ` with ${plan.children.length} child component(s)` : ""}.`;
}
