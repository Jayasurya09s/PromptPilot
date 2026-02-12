/**
 * Core Type Definitions
 * 
 * Defines the structure of UI nodes that represent the generated interface.
 * UINode is the fundamental building block of all generated UIs.
 * 
 * @module types
 */

/**
 * Represents a single node in the UI tree.
 * 
 * This is the core data structure used throughout the application.
 * Each node can have children, forming a tree structure that represents
 * the entire UI hierarchy.
 * 
 * @property type - Component type name (must be in componentRegistry)
 * @property props - Component properties (validated against propSchemas)
 * @property children - Nested child nodes (optional, defaults to [])
 * 
 * @example
 * ```typescript
 * const node: UINode = {
 *   type: "Card",
 *   props: { title: "Dashboard" },
 *   children: [
 *     { type: "Button", props: { label: "Click me" }, children: [] }
 *   ]
 * };
 * ```
 */
export type UINode = {
  type: string;
  props?: Record<string, any>;
  children?: UINode[];
};
