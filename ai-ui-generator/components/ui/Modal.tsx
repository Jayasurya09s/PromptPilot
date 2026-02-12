import { ReactNode } from "react";

type Props = {
  title?: string;
  children?: ReactNode;
};

export const Modal = ({ title, children }: Props) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
        {title && (
          <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
