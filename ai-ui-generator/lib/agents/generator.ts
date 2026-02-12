import { UINode } from "@/lib/types";
import { Plan, ComponentSpec } from "@/lib/types/plan";
import { validateUINode } from "@/lib/validator";

/**
 * Converts ComponentSpec to UINode recursively
 */
function specToNode(spec: ComponentSpec): UINode {
  return {
    type: spec.type,
    props: spec.props || {},
    children: spec.children?.map(specToNode) || [],
  };
}

/**
 * Generator - converts Plan to validated UINode tree
 */
export function generator(plan: Plan): UINode {
  console.log("Generating tree from plan:", plan.description);

  // Convert ComponentSpec to UINode
  const tree = specToNode(plan.root);

  // Strict validation with prop checking
  const validation = validateUINode(tree);

  if (!validation.valid) {
    console.error("Validation errors:", validation.errors);
    throw new Error(
      `Generated tree failed validation:\n${validation.errors.join("\n")}`
    );
  }

  console.log("✅ Tree generated and validated successfully");
  return tree;
}
