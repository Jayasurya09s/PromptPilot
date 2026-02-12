import { openrouter } from "@/lib/openrouter";
import { allowedComponents } from "@/lib/componentRegistry";
import { validateUINode } from "@/lib/validator";
import { UINode } from "@/lib/types";

export async function planner(
  userIntent: string,
  previousTree?: UINode | null
): Promise<UINode> {

  const baseRules = `
You are a deterministic UI planning engine.

CRITICAL:
- Return ONLY valid JSON.
- No markdown.
- No explanation.
- No backticks.
- No comments.
- No extra text.
- Output must start with { and end with }.

STRICT SCHEMA:

{
  "type": "ComponentName",
  "props": {},
  "children": [ { same schema recursively } ]
}

ALLOWED COMPONENTS: ${allowedComponents.join(", ")}

RULES:
- "type" MUST be one of the allowed components above ONLY.
- "children" MUST ALWAYS be an array (even if empty []).
- Children elements MUST be objects (never strings or primitives).
- Always include "props" as an object (can be empty {}).
- For Navbar: include meaningful title in props.
- For Card: include title in props, Card children hold content.
- For Chart: include title in props.
- DO NOT wrap entire UI in Card unless explicitly requested.
- DO NOT nest Navbar inside other components unless asked.
- Modal should be a sibling to other components, NOT nested.
- Preserve existing structure unless user explicitly requests change.
- When modifying: make MINIMAL changes only.
- NEVER invent new component types.
- NEVER use HTML tags (div, span, button, etc).
- NEVER return nested "props" with children inside props.
`;

  const initPrompt = (intent: string) => `
${baseRules}

For this request:
"${intent}"

GENERATE a new UI tree. Start with the most appropriate root component (likely Navbar for dashboards, or Button for forms).
Directly output the JSON tree. No wrapping. No explanations.
`;

  const modifyPrompt = (tree: UINode, intent: string) => `
${baseRules}

Current UI tree:
${JSON.stringify(tree, null, 2)}

Request: "${intent}"

Update and return the full JSON tree tree. Make minimal changes. Preserve unmodified components.
`;

  const prompt = previousTree ? modifyPrompt(previousTree, userIntent) : initPrompt(userIntent);


  try {
    const response = await openrouter.chat.completions.create({
      model: "openrouter/free",
      temperature: 0,
      messages: [
        { 
          role: "system", 
          content: "You ONLY output valid JSON. No markdown, no explanations. Start with { and end with }." 
        },
        { role: "user", content: prompt }
      ],
    });

    const raw = response.choices[0].message.content || "";
    console.log("Raw model output:", raw.substring(0, 200));

    // Extract first JSON object safely
    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No valid JSON found in model output");
    }

    const cleaned = jsonMatch[0];
    const parsed = JSON.parse(cleaned);

    if (!validateUINode(parsed)) {
      throw new Error("Invalid UI structure from model: " + JSON.stringify(parsed));
    }

    return parsed;

  } catch (error: any) {
    console.error("Planner error:", error);
    throw new Error("Planner failed: " + error.message);
  }

}
