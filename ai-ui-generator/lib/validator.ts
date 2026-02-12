import { allowedComponents } from "./componentRegistry";
import { validateProps } from "./propSchemas";
import { UINode } from "./types";

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

/**
 * Validates a UI node tree with prop-level validation
 */
export function validateUINode(
  node: any,
  path: string = "root"
): ValidationResult {
  const errors: string[] = [];

  // Type check
  if (!node || typeof node !== "object") {
    errors.push(`${path}: Invalid node type`);
    return { valid: false, errors };
  }

  // Component type check
  if (!node.type || !allowedComponents.includes(node.type)) {
    errors.push(`${path}: Invalid component type "${node.type}"`);
    return { valid: false, errors };
  }

  // Props validation
  const propValidation = validateProps(node.type, node.props || {});
  if (!propValidation.valid) {
    errors.push(`${path}: ${propValidation.error}`);
  }

  // Children validation
  if (node.children !== undefined) {
    if (!Array.isArray(node.children)) {
      errors.push(`${path}: children must be an array`);
    } else {
      node.children.forEach((child: any, index: number) => {
        const childResult = validateUINode(child, `${path}.children[${index}]`);
        errors.push(...childResult.errors);
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Legacy compatibility - returns boolean
 */
export function isValidUINode(node: any): boolean {
  return validateUINode(node).valid;
}
