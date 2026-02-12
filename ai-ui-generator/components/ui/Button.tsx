type Props = {
  label: string;
  variant?: "primary" | "secondary";
};

export const Button = ({ label, variant = "primary" }: Props) => {
  return <button className={`btn btn-${variant}`}>{label}</button>;
};
