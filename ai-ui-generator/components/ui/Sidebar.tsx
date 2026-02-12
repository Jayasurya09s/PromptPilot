import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const Sidebar = ({ children }: Props) => {
  return <div className="sidebar">{children}</div>;
};
