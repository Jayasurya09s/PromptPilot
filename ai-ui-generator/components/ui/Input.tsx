type Props = {
  placeholder?: string;
};

export const Input = ({ placeholder }: Props) => {
  return <input className="input" placeholder={placeholder} />;
};
