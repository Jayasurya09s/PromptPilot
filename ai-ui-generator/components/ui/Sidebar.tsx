import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const Sidebar = ({ children }: Props) => {
  return <aside className="w-64 bg-gray-900 text-white h-full shadow-lg p-6 space-y-4">{children}</aside>;
};
