"use client";

import { componentRegistry } from "@/lib/componentRegistry";
import { UINode } from "@/lib/types";

type Props = {
  tree: UINode | null;
};

export default function PreviewRenderer({ tree }: Props) {
  if (!tree) return null;

  const renderNode = (node: UINode): any => {
    const Component = (componentRegistry as any)[node.type];

    if (!Component) {
      return <div>Invalid Component: {node.type}</div>;
    }

    return (
      <Component {...node.props}>
        {node.children?.map((child, index) => (
  <div key={index}>
    {renderNode(child)}
  </div>
))}


      </Component>
    );
  };

  return <div>{renderNode(tree)}</div>;
}
