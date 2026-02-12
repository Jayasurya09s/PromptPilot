import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const Modal = ({ children }: Props) => {
  return (
    <div className="modal-backdrop">
      <div className="modal">{children}</div>
    </div>
  );
};
