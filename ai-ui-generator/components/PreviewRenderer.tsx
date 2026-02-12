/**
 * Preview Renderer Component
 * 
 * Dynamically renders UI trees by looking up components from the registry.
 * This is the core rendering engine that converts UINode structures into actual React components.
 * 
 * @module PreviewRenderer
 */

"use client";

import { componentRegistry } from "@/lib/componentRegistry";
import { UINode } from "@/lib/types";

type Props = {
  /** UI tree to render, or null if no UI has been generated */
  tree: UINode | null;
};

/**
 * Recursively renders a UI tree structure.
 * 
 * Maps each UINode to its corresponding React component from the registry.
 * Handles nested children recursively to create the full component hierarchy.
 * 
 * @param tree - Root node of the UI tree to render
 * @returns Rendered React component tree, or null if no tree provided
 * 
 * @example
 * ```tsx
 * const tree = {
 *   type: "Card",
 *   props: { title: "Hello" },
 *   children: [{ type: "Button", props: { label: "Click" }, children: [] }]
 * };
 * <PreviewRenderer tree={tree} />
 * ```
 */
export default function PreviewRenderer({ tree }: Props) {
  // No tree to render
  if (!tree) return null;

  /**
   * Recursively renders a single node and its children.
   * 
   * @param node - Current node to render
   * @returns React element or error message
   */
  const renderNode = (node: UINode): any => {
    // Look up component from registry
    const Component = (componentRegistry as any)[node.type];

    // Handle unknown/invalid component types
    if (!Component) {
      return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          Invalid Component: {node.type}
        </div>
      );
    }

    // Render component with props and recursively render children
    return (
      <Component {...node.props}>
        {node.children && node.children.length > 0 && (
          <div className="space-y-4">
            {node.children.map((child, index) => (
              <div key={index}>{renderNode(child)}</div>
            ))}
          </div>
        )}
      </Component>
    );
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">{renderNode(tree)}</div>
    </div>
  );
}
