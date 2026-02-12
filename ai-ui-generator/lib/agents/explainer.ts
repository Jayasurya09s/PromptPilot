import { openrouter } from "@/lib/openrouter";
import { UINode } from "@/lib/types";

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

  const response = await openrouter.chat.completions.create({
    model: "openrouter/free",
    temperature: 0.2,
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

  return response.choices[0].message.content || "";
}
