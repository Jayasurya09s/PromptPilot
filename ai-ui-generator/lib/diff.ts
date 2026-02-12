/**
 * Tree Diff Module
 * 
 * Compares UI trees to identify changes (additions/removals).
 * Helps users understand what changed when they modify their UI.
 * 
 * @module diff
 */

import { UINode } from "@/lib/types";

/**
 * Flattens a UI tree into an array of component type names.
 * 
 * Performs depth-first traversal to extract all component types.
 * Used internally for comparing two trees.
 * 
 * @param node - Root node of the tree to flatten
 * @param arr - Accumulator array (used for recursion)
 * @returns Array of component type names in depth-first order
 * 
 * @internal
 */
function flattenTree(node: UINode, arr: string[] = []): string[] {
  arr.push(node.type);

  if (node.children) {
    node.children.forEach(child => flattenTree(child, arr));
  }

  return arr;
}

/**
 * Compares two UI trees and identifies differences.
 * 
 * Calculates which component types were added or removed between versions.
 * Useful for showing users what changed after an AI modification.
 * 
 * @param oldTree - Previous UI tree (null if first generation)
 * @param newTree - New UI tree to compare against
 * @returns Object with arrays of added and removed component types
 * 
 * @example
 * ```typescript
 * const diff = diffTrees(previousTree, newTree);
 * console.log(`Added: ${diff.added.join(', ')}`);
 * console.log(`Removed: ${diff.removed.join(', ')}`);
 * ```
 */
export function diffTrees(
  oldTree: UINode | null,
  newTree: UINode
) {
  // If no previous tree, everything is new
  if (!oldTree) {
    return {
      added: flattenTree(newTree),
      removed: [],
    };
  }

  // Flatten both trees to arrays of component types
  const oldFlat = flattenTree(oldTree);
  const newFlat = flattenTree(newTree);

  // Find components that appear in new tree but not old
  const added = newFlat.filter(x => !oldFlat.includes(x));
  
  // Find components that appear in old tree but not new
  const removed = oldFlat.filter(x => !newFlat.includes(x));

  return { added, removed };
}
