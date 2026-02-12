import { ReactNode } from "react";

type Props = {
  title?: string;
  children?: ReactNode;
};

export const Card = ({ title, children }: Props) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
      {title && <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">{title}</h3>}
      <div className="space-y-3">{children}</div>
    </div>
  );
};
