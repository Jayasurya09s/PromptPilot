import { allowedComponents } from "./componentRegistry";

export function validateUINode(node: any): boolean {
  if (!node || typeof node !== "object") return false;

  if (!node.type || !allowedComponents.includes(node.type)) {
    return false;
  }

  if (!node.children) return true;

  if (!Array.isArray(node.children)) return false;

  for (const child of node.children) {
    if (!validateUINode(child)) return false;
  }

  return true;
}
