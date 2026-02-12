import { ReactNode } from "react";

type Props = {
  title?: string;
  children?: ReactNode;
};

export const Card = ({ title, children }: Props) => {
  return (
    <div className="card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
};
