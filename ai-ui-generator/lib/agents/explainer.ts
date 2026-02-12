/**
 * Explainer Agent
 * 
 * Generates human-readable explanations of AI-generated UI structures.
 * Helps users understand why certain design decisions were made.
 * 
 * @module agents/explainer
 */

import { openrouter } from "@/lib/openrouter";
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
export async function explainer(plan: UINode): Promise<string> {
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

  // Try models with fallback
  for (const model of MODELS) {
    try {
      console.log(`[Explainer] Attempting with model: ${model}`);

      const response = await openrouter.chat.completions.create({
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

      console.log(`[Explainer] ✅ Model ${model} succeeded`);
      return explanation;

    } catch (error: any) {
      console.warn(`[Explainer] ❌ Model ${model} failed:`, error.message);
      lastError = error;
      // Continue to next model
    }
  }

  // All models failed - return fallback explanation
  console.warn("[Explainer] All models failed, using fallback");
  return `This UI structure was generated based on your request. It includes ${plan.type} as the root component${plan.children && plan.children.length > 0 ? ` with ${plan.children.length} child component(s)` : ""}.`;
}
